/* pages.jsx — Overview, StandardPage (sub-tabs), Guide */
const { useState: useStateP } = React;

/* ===================================================== OVERVIEW */
function OverviewPage({ lang, onOpen }) {
  const t = window.estTt(lang);
  const { PROJECT } = window.BIM;
  const { MODELS } = window.BIM_CALC;
  const Card = window.Card, Kpi = window.Kpi;
  const mi = MODELS.id, mt = MODELS.tw;
  const ready = window.hasProjectData && window.hasProjectData();
  // re-render when Revit data changes
  window.useBimDataVersion && window.useBimDataVersion();

  return (
    <div className="fade-in">
      {window.RevitImport && <window.RevitImport lang={lang} />}

      <Card eyebrow="3D · BIM" title={t("ov_model")}
            right={<span className="card-eyebrow">orbit · zoom · pan</span>} style={{ marginBottom: 16 }}>
        <window.Model3D lang={lang} />
        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 12, lineHeight: 1.6 }}>{t("ov_modelNote")}</div>
      </Card>

      <h2 className="section-title">{t("ov_compare")}</h2>
      <p className="section-desc">{lang === "zh"
        ? "同一個 Revit 模型,以兩套不同標準計算。點擊卡片查看完整估算。"
        : lang === "id"
          ? "Satu model Revit, dihitung dengan dua standar berbeda. Klik kartu untuk membuka rincian estimasinya."
          : "One Revit model, estimated under two different standards. Click a card to open its full estimation."}</p>

      {!ready && <window.EmptyDataState lang={lang} />}

      {ready && (
      <div className="cmp-2" style={{ marginBottom: 16 }}>
        {[["id", mi], ["tw", mt]].map(([k, m]) => {
          const std = window.BIM.STANDARDS[k];
          return (
            <button key={k} className="std-card" style={{ borderColor: "var(--line)" }} onClick={() => onOpen(k, "rab")}>
              <div className="std-card-head">
                <span className="std-flag" style={{ background: std.accentSoft, color: std.accentInk }}>{std.flag}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{window.I18N.pick(std, lang, "nameId", "nameEn", "nameZh")}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{window.I18N.pick(std, lang, "basisId", "basisEn", "basisZh")}</div>
                </div>
                <span className="std-open">{t("ov_openStd")} →</span>
              </div>
              <div className="std-card-body">
                <div className="std-metric">
                  <div className="std-metric-label">{t("ov_totalCost")}</div>
                  <div className="std-metric-val num" style={{ color: std.accentInk }}>{fmtCompact(m.grand, std.cur)}</div>
                </div>
                <div className="std-metric">
                  <div className="std-metric-label">{t("ov_duration")}</div>
                  <div className="std-metric-val num">{m.totalWeeks} <span style={{ fontSize: 12, fontWeight: 400, color: "var(--muted)" }}>{t("ov_weeks")}</span></div>
                </div>
                <div className="std-metric">
                  <div className="std-metric-label">{t("ov_costM2")}</div>
                  <div className="std-metric-val num">{PROJECT.buildingArea > 0 ? fmtCompact(m.grand / PROJECT.buildingArea, std.cur) : "—"}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      )}

      {ready && (
      <div className="grid-2b" style={{ alignItems: "start" }}>
        <Card eyebrow="i" title={t("ov_projectInfo")}>
          <InfoTable lang={lang} />
        </Card>
        <Card eyebrow="ⓘ" title={lang === "zh" ? "快速比較" : lang === "id" ? "Perbandingan Singkat" : "Quick Comparison"}>
          <CompareBars lang={lang} mi={mi} mt={mt} />
        </Card>
      </div>
      )}
    </div>
  );
}

function InfoTable({ lang }) {
  const t = window.estTt(lang);
  const { PROJECT } = window.BIM;
  const dash = "—";
  const floorWord = lang === "zh" ? " 樓" : lang === "id" ? " lantai" : " floors";
  const projectName = window.I18N.pick(PROJECT, lang, "nameId", "nameEn", "nameZh");
  const projectLabel = lang === "zh" ? "專案名稱" : lang === "id" ? "Nama Proyek" : "Project";
  const fileLabel    = lang === "zh" ? "檔案 / 代碼" : lang === "id" ? "File / Kode" : "File / Code";

  // Each row: [label, value, isEmpty]. Rows whose value is empty are hidden
  // so the table only shows fields actually derived from uploaded data.
  const rawRows = [
    [projectLabel, projectName || dash, !projectName],
    [fileLabel,    PROJECT.code || dash, !PROJECT.code],
    [t("ov_floors"),
      PROJECT.floors ? PROJECT.floors + floorWord : dash,
      !PROJECT.floors],
    [t("ov_area"),
      PROJECT.buildingArea ? PROJECT.buildingArea + " m²" : dash,
      !PROJECT.buildingArea],
    [t("ov_source"),
      PROJECT.code || projectName ? "Autodesk Revit (QTO)" : dash,
      !(PROJECT.code || projectName)],
  ];
  const rows = rawRows.filter((r) => !r[2]);
  if (rows.length === 0) {
    return (
      <div style={{ fontSize: 12.5, color: "var(--muted)", padding: "10px 2px" }}>
        {lang === "zh"
          ? "上傳 IFC 與/或 Revit 明細表以填入專案資訊。"
          : lang === "id"
            ? "Unggah IFC dan/atau file Schedule Revit untuk mengisi informasi proyek."
            : "Upload an IFC and/or Revit Schedule file to populate project info."}
      </div>
    );
  }
  return (
    <div>{rows.map(([k, v], i) => (
      <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "9px 0", borderBottom: i < rows.length - 1 ? "1px solid var(--line-2)" : "none" }}>
        <span style={{ color: "var(--muted)", fontSize: 12.5 }}>{k}</span>
        <span style={{ fontWeight: 500, fontSize: 12.5, textAlign: "right" }}>{v}</span>
      </div>
    ))}</div>
  );
}

function CompareBars({ lang, mi, mt }) {
  const fx = window.BIM.FX.idrPerTwd;
  const rows = [
    { label: lang === "zh" ? "總成本 (≈ IDR)" : lang === "id" ? "Total biaya (≈ IDR)" : "Total cost (≈ IDR)", id: mi.grand, tw: mt.grand * fx, fmt: (v) => fmtCompact(v, "idr") },
    { label: lang === "zh" ? "工期 (週)"     : lang === "id" ? "Durasi (minggu)"     : "Duration (weeks)",  id: mi.totalWeeks, tw: mt.totalWeeks, fmt: (v) => v },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {rows.map((r, i) => {
        const max = Math.max(r.id, r.tw);
        return (
          <div key={i}>
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 8, fontWeight: 500 }}>{r.label}</div>
            {[["ID", r.id, "var(--blue)"], ["TW", r.tw, "var(--teal)"]].map(([lab, v, c]) => (
              <div key={lab} style={{ display: "grid", gridTemplateColumns: "28px 1fr 86px", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span className="num" style={{ fontSize: 10.5, color: "var(--muted)" }}>{lab}</span>
                <span style={{ height: 9, background: "var(--line)", borderRadius: 5, overflow: "hidden" }}><span style={{ display: "block", width: (v / max * 100) + "%", height: "100%", background: c, borderRadius: 5 }} /></span>
                <span className="num" style={{ fontSize: 11.5, textAlign: "right" }}>{r.fmt(v)}</span>
              </div>
            ))}
          </div>
        );
      })}
      <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>{lang === "zh" ? `比較匯率 1 NT$ ≈ Rp ${fx}。成本數字僅供參考。` : lang === "id" ? `Kurs perbandingan 1 NT$ ≈ Rp ${fx}. Angka biaya bersifat ilustratif.` : `Comparison rate 1 NT$ ≈ Rp ${fx}. Cost figures are illustrative.`}</div>
    </div>
  );
}

/* ===================================================== STANDARD PAGE */
const SUBS = [
  { key: "ahsp", view: "AhspView" },
  { key: "rab", view: "RabView" },
  { key: "schedule", view: "ScheduleView" },
  { key: "scurve", view: "ScurveView" },
];

function StandardPage({ lang, stdKey, sub, setSub }) {
  const t = window.estTt(lang);
  const std = window.BIM.STANDARDS[stdKey];
  const View = window[SUBS.find((s) => s.key === sub).view];
  // re-render when Revit data changes so volumes, totals, schedule all update
  window.useBimDataVersion && window.useBimDataVersion();
  return (
    <div>
      <div className="std-banner" style={{ background: std.accentSoft }}>
        <span className="std-flag" style={{ background: "var(--surface)", color: std.accentInk }}>{std.flag}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: std.accentInk }}>{window.I18N.pick(std, lang, "nameId", "nameEn", "nameZh")}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{window.I18N.pick(std, lang, "basisId", "basisEn", "basisZh")}</div>
        </div>
        <div className="std-banner-cur num">{std.curSym}</div>
      </div>
      {window.RevitImport && <window.RevitImport lang={lang} />}
      <nav className="subtabs">
        {SUBS.map((s) => (
          <button key={s.key} className={"subtab" + (sub === s.key ? " active" : "")}
                  style={sub === s.key ? { "--sub-accent": std.accent } : null}
                  onClick={() => setSub(s.key)}>{t("sub_" + s.key)}</button>
        ))}
      </nav>
      <View lang={lang} stdKey={stdKey} />
    </div>
  );
}

window.OverviewPage = OverviewPage;
window.StandardPage = StandardPage;
