/* revit_import.jsx — multi-file upload of raw Revit Schedule CSV/XLSX.
   Each file is auto-classified by its title (or filename) and its m²/m³
   totals are mapped to the corresponding WBS volume. The list of currently
   loaded files is the source of truth — adding or removing files re-applies
   the aggregate, so the dashboard stays in sync with whatever the user has. */
const { useRef: useRefI, useState: useStateI, useEffect: useEffectI } = React;

/* ---- Module-level store. Survives React mount/unmount so that uploaded
   files (and the loaded IFC buffer) stay alive while the user switches
   between Overview / Standar ID / Standar TW / Guide menus. */
window.BIM_STORE = window.BIM_STORE || {
  csvFiles: [],      // array of file entries (see RevitImport state shape)
  ifcBuffer: null,   // { buffer: ArrayBuffer, fileName: string }
};
function emitStoreChange() { window.dispatchEvent(new CustomEvent("bim:storechange")); }

function useBimDataVersion() {
  const [v, setV] = useStateI(0);
  useEffectI(() => {
    const on = () => setV((x) => x + 1);
    window.addEventListener("bim:datachange", on);
    return () => window.removeEventListener("bim:datachange", on);
  }, []);
  return v;
}

function useBimStoreVersion() {
  const [v, setV] = useStateI(0);
  useEffectI(() => {
    const on = () => setV((x) => x + 1);
    window.addEventListener("bim:storechange", on);
    return () => window.removeEventListener("bim:storechange", on);
  }, []);
  return v;
}

/* ---- schedule recognition + WBS mapping ----------------------------------
   Each Revit schedule's totals (sum of m² and m³ values found in data rows)
   flow to one or more WBS items in data.js. Multiple files can target the
   same WBS — they accumulate. */
const SCHEDULE_TYPES = [
  { key: "foundation", label: "Pondasi (Foundation)",   match: /(structural\s*)?foundation|footing/i,
    contributions: [{ wbs: "C.2", source: "m3", label: "Pondasi footplat" }] },
  { key: "column",     label: "Kolom (Column)",          match: /(structural\s*)?column/i,
    contributions: [{ wbs: "D.1", source: "m3", label: "Beton kolom" }] },
  { key: "framing",    label: "Balok (Framing)",         match: /(structural\s*)?framing|beam/i,
    contributions: [{ wbs: "D.1", source: "m3", label: "Beton balok" }] },
  { key: "floor",      label: "Slab/Lantai (Floor)",     match: /^floor|^slab/i,
    contributions: [
      { wbs: "D.1", source: "m3", label: "Beton slab" },
      { wbs: "E.3", source: "m2", label: "Keramik lantai (area slab)" },
    ] },
  { key: "wall",       label: "Dinding (Wall)",          match: /^wall|brick|masonry/i,
    contributions: [{ wbs: "E.1", source: "m2", label: "Dinding bata" }] },
];

function detectScheduleType(s) {
  if (!s) return null;
  for (const t of SCHEDULE_TYPES) if (t.match.test(s)) return t;
  return null;
}

/* ---- file → rows of cells (CSV or XLSX) ---------------------------------- */
async function readFileToRows(file) {
  if (!window.XLSX) throw new Error("SheetJS not loaded");
  const buf = await file.arrayBuffer();
  const wb = window.XLSX.read(buf, { type: "array", cellDates: false, raw: false });
  const firstSheet = wb.Sheets[wb.SheetNames[0]];
  // header:1 → array of arrays. defval keeps empty cells as "".
  return window.XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "", raw: false });
}

/* ---- parse a single file ------------------------------------------------- */
// Period-only decimal: CSV uses comma as field separator, so allowing comma
// as decimal would greedily merge across cells ("135,2 m²" → 135.2 instead
// of cell "135" then cell "2 m²"). Revit exports use period for decimals.
const UNIT_RE = /(-?\d+(?:\.\d+)?)\s*(m²|m³|m2|m3)(?!\w)/gi;

function parseRevitSchedule(rows, fileName) {
  if (!rows || rows.length < 2) return { kind: "empty", fileName };

  // Title detection: first non-empty cell of first row, fallback to filename.
  const firstRowText = (rows[0] || []).map((c) => String(c || "").trim()).filter(Boolean).join(" ");
  let type = detectScheduleType(firstRowText) || detectScheduleType(fileName);

  // Sum every m² and m³ value found in any cell beyond the first 2 rows
  // (rows 0 = title, 1 = header, 2 = blank separator, 3+ = data).
  let m2 = 0, m3 = 0, dataRows = 0;
  const startAt = Math.min(2, rows.length - 1);
  for (let i = startAt; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === "" || c == null)) continue;
    let hit = false;
    row.forEach((cell) => {
      const s = String(cell || "");
      let m;
      UNIT_RE.lastIndex = 0;
      while ((m = UNIT_RE.exec(s)) !== null) {
        const v = parseFloat(m[1]);
        if (!Number.isFinite(v)) continue;
        // m[2] is one of: "m²", "m³", "m2", "m3". Check both ASCII "3" and
        // superscript "³" (U+00B3). Same for ² (U+00B2).
        const u = m[2].toLowerCase();
        if (u === "m³" || u === "m3") m3 += v;
        else m2 += v;
        hit = true;
      }
    });
    if (hit) dataRows++;
  }

  if (!type) return { kind: "unknown", fileName, title: firstRowText, m2, m3, dataRows };

  const contributions = {};
  const breakdown = [];
  type.contributions.forEach((c) => {
    const val = c.source === "m3" ? m3 : m2;
    if (val > 0) {
      contributions[c.wbs] = (contributions[c.wbs] || 0) + val;
      breakdown.push({ wbs: c.wbs, label: c.label, unit: c.source === "m3" ? "m³" : "m²", value: val });
    }
  });

  return {
    kind: "revit",
    fileName,
    title: firstRowText || fileName,
    typeKey: type.key,
    typeLabel: type.label,
    m2, m3, dataRows,
    contributions, breakdown,
  };
}

/* ---- also still accept a generic WBS+Volume template -------------------- */
const TPL_WBS_KEYS = ["wbs", "kode", "code"];
const TPL_VOL_KEYS = ["volume", "vol", "quantity", "qty", "jumlah"];
function parseTemplate(rows, fileName) {
  // Find the row that looks like a header (contains "WBS" word in any cell).
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const cells = (rows[i] || []).map((c) => String(c || "").toLowerCase());
    if (cells.some((c) => /\bwbs\b/.test(c))) { headerIdx = i; break; }
  }
  if (headerIdx < 0) return null;
  const header = (rows[headerIdx] || []).map((c) => String(c || "").trim().toLowerCase());
  const wbsCol = header.findIndex((h) => TPL_WBS_KEYS.includes(h));
  const volCol = header.findIndex((h) => TPL_VOL_KEYS.includes(h));
  if (wbsCol < 0 || volCol < 0) return null;
  const contributions = {};
  let rowsApplied = 0;
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const wbs = String(r[wbsCol] || "").trim().toUpperCase();
    const vol = Number(String(r[volCol] || "").replace(",", "."));
    if (!wbs || !Number.isFinite(vol) || vol <= 0) continue;
    contributions[wbs] = (contributions[wbs] || 0) + vol;
    rowsApplied++;
  }
  return {
    kind: "template",
    fileName,
    title: "Template WBS",
    typeKey: "template",
    typeLabel: "Template (WBS + Volume)",
    dataRows: rowsApplied,
    contributions,
    breakdown: Object.entries(contributions).map(([wbs, value]) => ({
      wbs, value, label: wbs, unit: "",
    })),
  };
}

/* ---- template CSV download ---------------------------------------------- */
function csvEscape(s) {
  const str = String(s == null ? "" : s);
  return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
}
function buildTemplateCsv(lang) {
  const rows = window.BIM_CALC.templateRows();
  const groupsByCode = window.BIM.GROUPS.reduce((m, g) => { m[g.code] = g; return m; }, {});
  const L3 = (id, en, zh) => lang === "zh" ? zh : lang === "id" ? id : en;
  const header = ["WBS", L3("Deskripsi", "Description", "工項描述"), "Volume", L3("Satuan", "Unit", "單位"), L3("Sumber", "Source", "來源")];
  const body = rows.map((it) => {
    const g = groupsByCode[it.wbs[0]];
    const src = g && g.fromRevit ? "Revit" : L3("Estimasi", "Estimate", "估算");
    return [it.wbs, window.I18N.pick(it, lang), "", lang === "id" ? it.unit : it.uEn, src];
  });
  return "﻿" + [header, ...body].map((r) => r.map(csvEscape).join(",")).join("\n");
}
function downloadBlob(filename, mime, data) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

/* ========================================================================= */
function RevitImport({ lang }) {
  const t = window.estTt(lang);
  const inputRef = useRefI(null);
  const [isDrag, setIsDrag] = useStateI(false);
  useBimDataVersion();
  useBimStoreVersion(); // re-render when BIM_STORE.csvFiles changes
  const files = window.BIM_STORE.csvFiles;

  // Section collapse — default expanded only when there are no files yet.
  // (So a clean dashboard with files loaded keeps the page tidy on remount,
  // but a fresh / empty page shows the dropzone prominently.)
  const [expanded, setExpanded] = useStateI(() => files.length === 0);

  /* --- aggregate all parsed files → atomic apply ----------------------- */
  function applyFromFiles(list) {
    const totals = {};
    let floorAreaSum = 0;     // gross floor area, from any Floor schedules
    list.forEach((f) => {
      if (f.status !== "ok") return;
      Object.entries(f.parsed.contributions || {}).forEach(([wbs, val]) => {
        totals[wbs] = (totals[wbs] || 0) + val;
      });
      if (f.parsed.typeKey === "floor") floorAreaSum += f.parsed.m2 || 0;
    });
    window.BIM_CALC.setVolumes(totals);
    // Floor schedule's total m² ≈ gross building floor area (luas bangunan).
    // Pass it through every time so removing the Floor file properly clears
    // the value — Project Information always reflects the current upload set.
    if (window.BIM_CALC.updateProject) {
      window.BIM_CALC.updateProject({ buildingArea: Math.round(floorAreaSum) });
    }
  }

  function setFiles(updater) {
    const next = typeof updater === "function" ? updater(window.BIM_STORE.csvFiles) : updater;
    window.BIM_STORE.csvFiles = next;
    applyFromFiles(next);
    emitStoreChange();
  }

  /* --- handle new files (single or batch) ------------------------------ */
  async function processFiles(fileList) {
    const items = Array.from(fileList);
    // 1. Add all files as "processing" first so the user sees them appear
    //    immediately with a spinner — feels like real work is happening.
    const stagedEntries = items.map((file) => ({
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      name: file.name,
      status: "processing",
    }));
    setFiles((prev) => [...prev, ...stagedEntries]);

    // 2. Process each file sequentially with a small artificial delay so
    //    the spinner actually has time to render even for tiny CSVs.
    for (let i = 0; i < items.length; i++) {
      const file = items[i];
      const staged = stagedEntries[i];
      // ~350-650ms per file feels like genuine parsing, not flicker.
      await new Promise((r) => setTimeout(r, 350 + Math.random() * 300));

      let updated;
      try {
        const rows = await readFileToRows(file);
        let parsed = parseRevitSchedule(rows, file.name);
        if (parsed.kind === "unknown") {
          const tpl = parseTemplate(rows, file.name);
          if (tpl) parsed = tpl;
        }
        if (parsed.kind === "empty") {
          updated = { ...staged, status: "error", error: "Empty file" };
        } else if (parsed.kind === "unknown") {
          updated = { ...staged, status: "unknown", parsed };
        } else {
          updated = { ...staged, status: "ok", parsed };
        }
      } catch (e) {
        console.warn("parse failed", e);
        updated = { ...staged, status: "error", error: String(e.message || e) };
      }
      // Update the specific entry — totals re-apply as each file completes
      // so the dashboard fills in progressively.
      setFiles((prev) => prev.map((f) => (f.id === staged.id ? updated : f)));
    }
  }

  function removeFile(id) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }
  function clearAll() {
    setFiles([]);
    window.BIM_CALC.clearAll();
  }

  /* --- input handlers --------------------------------------------------- */
  const onUpload = (fileList) => {
    if (!fileList || !fileList.length) return;
    processFiles(Array.from(fileList));
    if (inputRef.current) inputRef.current.value = "";
  };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDrag(false);
    onUpload(e.dataTransfer.files);
  };

  /* --- aggregate snapshot for the header ------------------------------- */
  const totals = {};
  const fileCountByWbs = {}; // how many files contribute to each WBS
  files.forEach((f) => {
    if (f.status !== "ok") return;
    Object.entries(f.parsed.contributions || {}).forEach(([w, v]) => {
      totals[w] = (totals[w] || 0) + v;
      fileCountByWbs[w] = (fileCountByWbs[w] || 0) + 1;
    });
  });
  const okCount = files.filter((f) => f.status === "ok").length;
  const totalRows = files.reduce((s, f) => s + ((f.parsed && f.parsed.dataRows) || 0), 0);
  const wbsCount = Object.keys(totals).length;
  const hasMerge = Object.values(fileCountByWbs).some((c) => c > 1);

  return (
    <div className={"revit-import" + (expanded ? " is-expanded" : " is-collapsed")}>
      {/* clickable header — toggles collapse */}
      <button
        type="button"
        className="revit-import-head ri-head-btn"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="ri-head-text">
          <div className="card-eyebrow" style={{ color: "var(--blue-ink)" }}>REVIT · IFC/QTO</div>
          <div className="revit-import-title">{t("imp_title")}</div>
        </div>
        <div className="ri-head-right">
          {okCount > 0 ? (
            <div className="revit-import-count num">
              {okCount} {lang === "zh" ? "個檔案 · " : lang === "id" ? "file · " : "files · "}{totalRows} {lang === "zh" ? "列" : lang === "id" ? "baris" : "rows"}
            </div>
          ) : (
            <div className="revit-import-count revit-import-count-empty">
              {lang === "zh" ? "尚無檔案" : lang === "id" ? "Belum ada file" : "No files yet"}
            </div>
          )}
          <span className="ri-chevron" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </button>

      {/* always-visible totals when collapsed — gives a glance summary without opening */}
      {!expanded && Object.keys(totals).length > 0 && (
        <div className="ri-totals ri-totals-compact">
          {hasMerge && (
            <div className="ri-merge-note">
              {lang === "zh"
                ? `${okCount} 個 Revit 檔 → ${wbsCount} 個 WBS 已更新 (部份檔案合併至同一 WBS,例如 柱 + 樑 + 樓板 → D.1 結構混凝土)。`
                : lang === "id"
                  ? `${okCount} file Revit → ${wbsCount} WBS terupdate (beberapa file digabung ke WBS yang sama, misal Column + Framing + Floor → D.1 Beton K-225).`
                  : `${okCount} Revit files → ${wbsCount} WBS updated (some files merge into the same WBS, e.g. Column + Framing + Floor → D.1 Concrete K-225).`}
            </div>
          )}
          <div className="ri-totals-pills">
            {Object.entries(totals).sort().map(([wbs, val]) => {
              const it = window.BIM.ITEMS.find((x) => x.wbs === wbs);
              const fc = fileCountByWbs[wbs] || 0;
              return (
                <span key={wbs} className="ri-pill" title={fc > 1 ? (lang === "zh" ? `合併自 ${fc} 個檔案` : lang === "id" ? `Gabungan dari ${fc} file` : `Merged from ${fc} files`) : undefined}>
                  <b>{wbs}</b>
                  <span className="num"> · {val.toFixed(2).replace(/\.00$/, "")} {it ? (lang === "id" ? it.unit : it.uEn) : ""}</span>
                  {fc > 1 && <span className="ri-pill-meta"> · {fc} {lang === "zh" ? "個檔案" : lang === "id" ? "file" : "files"}</span>}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* collapsible body */}
      <div className="ri-body" hidden={!expanded}>
        <div className="revit-import-desc">{t("imp_desc_multi")}</div>

        <div
          className={"ri-drop" + (isDrag ? " ri-drop-active" : "") + (files.length ? " ri-drop-compact" : "")}
          onDragEnter={(e) => { e.preventDefault(); setIsDrag(true); }}
          onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current && inputRef.current.click()}
          role="button"
          tabIndex={0}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div className="ri-drop-text">
            <b>{t("imp_drop_title")}</b>
            <span className="ri-drop-sub">{t("imp_drop_sub")}</span>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          multiple
          style={{ display: "none" }}
          onChange={(e) => onUpload(e.target.files)}
        />

        {files.length > 0 && (
          <div className="ri-files">
            {files.map((f) => (
              <FileRow key={f.id} f={f} lang={lang} onRemove={() => removeFile(f.id)} t={t} />
            ))}
          </div>
        )}

        {Object.keys(totals).length > 0 && (
          <div className="ri-totals">
            <div className="ri-totals-label">{t("imp_applied_totals")}</div>
            <div className="ri-totals-pills">
              {Object.entries(totals).sort().map(([wbs, val]) => {
                const it = window.BIM.ITEMS.find((x) => x.wbs === wbs);
                return (
                  <span key={wbs} className="ri-pill">
                    <b>{wbs}</b>
                    <span className="num"> · {val.toFixed(2).replace(/\.00$/, "")} {it ? (lang === "id" ? it.unit : it.uEn) : ""}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="revit-import-row">
          <button className="ri-btn ri-btn-ghost" onClick={(e) => { e.stopPropagation(); downloadBlob("revit-volumes-template.csv", "text/csv;charset=utf-8", buildTemplateCsv(lang)); }}>
            ⤓ {t("imp_download")}
          </button>
          {files.length > 0 && (
            <button className="ri-btn ri-btn-ghost" onClick={(e) => { e.stopPropagation(); clearAll(); }}>{t("imp_clear")}</button>
          )}
          <span style={{ flex: 1 }} />
          <span className="ri-note">{t("imp_multi_hint")}</span>
        </div>
      </div>
    </div>
  );
}

function FileRow({ f, lang, onRemove, t }) {
  const ok = f.status === "ok";
  const isUnknown = f.status === "unknown";
  const isProcessing = f.status === "processing";
  return (
    <div className={"ri-file ri-file-" + f.status}>
      <div className="ri-file-icon">
        {isProcessing ? <span className="ri-spin" /> : (ok ? "✓" : isUnknown ? "?" : "!")}
      </div>
      <div className="ri-file-main">
        <div className="ri-file-name" title={f.name}>{f.name}</div>
        <div className="ri-file-meta">
          {isProcessing && (
            <span style={{ color: "var(--blue-ink)" }}>
              {lang === "zh" ? "處理中…" : lang === "id" ? "Memproses…" : "Processing…"}
            </span>
          )}
          {ok && f.parsed && (
            <>
              <span className="ri-tag">{f.parsed.typeLabel}</span>
              <span className="ri-meta-sep">·</span>
              <span className="num">{f.parsed.dataRows} {lang === "zh" ? "資料列" : lang === "id" ? "baris data" : "data rows"}</span>
            </>
          )}
          {isUnknown && (
            <span style={{ color: "oklch(0.58 0.12 70)" }}>{t("imp_unknown_type")}</span>
          )}
          {f.status === "error" && (
            <span style={{ color: "oklch(0.58 0.18 25)" }}>{f.error}</span>
          )}
        </div>
        {ok && f.parsed.breakdown && f.parsed.breakdown.length > 0 && (
          <div className="ri-file-contrib">
            {f.parsed.breakdown.map((b, i) => (
              <span key={i} className="ri-contrib">
                <b>{b.wbs}</b>
                <span className="num"> · {b.value.toFixed(2).replace(/\.00$/, "")} {b.unit}</span>
                {b.label && <span className="ri-contrib-label"> — {b.label}</span>}
              </span>
            ))}
          </div>
        )}
      </div>
      <button className="ri-file-x" onClick={onRemove} aria-label="remove">×</button>
    </div>
  );
}

window.RevitImport = RevitImport;
window.useBimDataVersion = useBimDataVersion;
window.useBimStoreVersion = useBimStoreVersion;
window.emitBimStoreChange = emitStoreChange;
