/* estimation.jsx — shared atoms + AHSP / RAB / Schedule / S-Curve (per standard) */
const { useState: useState2 } = React;
const tt = (lang) => (k) => window.I18N.t(k, lang);
const PRED = { A: "—", B: "A", C: "B", D: "C", E: "D", F: "D", G: "E, F", H: "E, G" };
const GROUP_PALETTE = [
  "oklch(0.55 0.13 248)", "oklch(0.58 0.11 215)", "oklch(0.58 0.10 195)",
  "oklch(0.60 0.10 168)", "oklch(0.64 0.11 140)", "oklch(0.70 0.12 95)",
  "oklch(0.72 0.12 70)", "oklch(0.64 0.13 40)",
];
const dec = (cur, n) => (cur === "twd" && Math.abs(n) > 0 && Math.abs(n) < 100 ? 2 : 0);

/* ---- atoms ---- */
function Card({ title, eyebrow, right, children, style }) {
  return (
    <div className="card" style={style}>
      {(title || eyebrow || right) && (
        <div className="card-head">
          <div>{eyebrow && <div className="card-eyebrow">{eyebrow}</div>}{title && <div className="card-title">{title}</div>}</div>
          {right}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}
function Kpi({ label, dot, value, cur, unit, sub }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{dot && <span className="kpi-dot" style={{ background: dot }} />}{label}</div>
      <div className="kpi-value">{cur && <span className="cur">{cur}</span>}{value}</div>
      {unit && <div className="kpi-unit">{unit}</div>}
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}
function ExampleNote({ lang }) {
  const t = tt(lang);
  return (
    <div className="note-box" style={{ marginBottom: 20 }}>
      <span style={{ fontWeight: 700 }}>★</span>
      <span><b>{t("note")}.</b> {t("exampleNote")}</span>
    </div>
  );
}

// Shown when no Revit/CSV data has been imported yet — all volumes are zero.
function EmptyDataState({ lang }) {
  const t = tt(lang);
  return (
    <div className="empty-data">
      <div className="empty-data-icon" aria-hidden>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M7 14l4-4 4 3 6-6" opacity="0.45" strokeDasharray="2 3" />
        </svg>
      </div>
      <div className="empty-data-title">{t("empty_title")}</div>
      <div className="empty-data-desc">{t("empty_desc")}</div>
    </div>
  );
}
function hasProjectData() {
  return (window.BIM_CALC.totalVolume && window.BIM_CALC.totalVolume() > 0);
}

/* ======================================================= AHSP */
function AhspView({ lang, stdKey }) {
  const t = tt(lang);
  const std = window.BIM.STANDARDS[stdKey];
  const keys = Object.keys(stdKey === "tw" ? window.BIM.AHSP_TW : window.BIM.AHSP_ID);
  return (
    <div className="fade-in">
      <h2 className="section-title">{t("ahsp_title")}</h2>
      <p className="section-desc">{stdKey === "tw" ? t("ahsp_descTw") : t("ahsp_descId")}</p>
      <div className="ahsp-grid">
        {keys.map((k) => <AhspCard key={k} stdKey={stdKey} ahspKey={k} lang={lang} std={std} />)}
      </div>
    </div>
  );
}

function AhspCard({ stdKey, ahspKey, lang, std }) {
  const t = tt(lang);
  const a = window.BIM_CALC.ahspCalc(stdKey, ahspKey);
  const cur = std.cur;
  return (
    <div className="card">
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
        <div className="card-eyebrow" style={{ color: std.accentInk }}>{stdKey === "tw" ? "單價分析 · " + a.meta.wbs : "AHSP · " + a.meta.wbs}</div>
        <div style={{ fontWeight: 600, fontSize: 13, marginTop: 3 }}>{window.I18N.pick(a.meta, lang)}</div>
      </div>
      <div className="scroll-x">
        <table className="tbl" style={{ fontSize: 11.5 }}>
          <thead><tr>
            <th style={{ position: "static" }}>{t("ahsp_component")}</th>
            <th className="r" style={{ position: "static" }}>{t("ahsp_coef")}</th>
            <th className="c" style={{ position: "static" }}>{t("ahsp_unit")}</th>
            <th className="r" style={{ position: "static" }}>{t("ahsp_price")}</th>
            <th className="r" style={{ position: "static" }}>{t("ahsp_amount")}</th>
          </tr></thead>
          <tbody>
            {a.groups.map((g) => (
              <React.Fragment key={g.id}>
                <tr><td colSpan={5} style={{ padding: "8px 12px 4px", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", color: g.color }}>{window.I18N.pick(g, lang)}</td></tr>
                {g.rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: "var(--ink-2)" }}>{window.I18N.pick(r, lang)}</td>
                    <td className="r num" style={{ color: "var(--muted)" }}>{fmtNum(r.coef, r.coef < 1 ? 4 : 3)}</td>
                    <td className="c" style={{ color: "var(--muted)", fontSize: 11 }}>{r.unit}</td>
                    <td className="r num">{fmtNum(r.price, dec(cur, r.price))}</td>
                    <td className="r num" style={{ fontWeight: 500 }}>{fmtNum(r.amount, dec(cur, r.amount))}</td>
                  </tr>
                ))}
                <tr className="sub-row"><td colSpan={4} className="r" style={{ fontSize: 11 }}>{t("ahsp_subtotal")} {window.I18N.pick(g, lang)}</td><td className="r num">{fmtNum(g.sub, dec(cur, g.sub))}</td></tr>
              </React.Fragment>
            ))}
            {a.ohp > 0 && <tr><td colSpan={4} className="r" style={{ fontSize: 11, color: "var(--muted)" }}>{t("ahsp_ohp")} (10%)</td><td className="r num" style={{ color: "var(--muted)" }}>{fmtNum(a.ohp)}</td></tr>}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: std.accentSoft, borderTop: "1px solid var(--line)" }}>
        <span style={{ fontWeight: 600, fontSize: 12, color: std.accentInk }}>{a.ohp > 0 ? t("ahsp_unitPrice") : t("ahsp_direct")} <span style={{ fontWeight: 400 }}>/ {a.meta.unit}</span></span>
        <span className="num" style={{ fontWeight: 600, fontSize: 15, color: std.accentInk }}>{fmtMoney(a.total, cur)}</span>
      </div>
    </div>
  );
}

/* ======================================================= RAB */
function RabView({ lang, stdKey }) {
  const t = tt(lang);
  const std = window.BIM.STANDARDS[stdKey];
  const m = window.BIM_CALC.MODELS[stdKey];
  const cur = std.cur;
  // Per-row analysis loading state (Set of WBS currently being analysed).
  // Bulk analysis progress is a separate object so the overlay can render
  // a smooth progress bar without coupling to the per-row state.
  const [analyzing, setAnalyzing] = useState2(new Set());
  const [bulkProgress, setBulkProgress] = useState2(null);

  if (!hasProjectData()) {
    return (
      <div className="fade-in">
        <h2 className="section-title">{t("rab_title")}</h2>
        <EmptyDataState lang={lang} />
      </div>
    );
  }

  // Coverage stats: which groups have any item with vol > 0 vs none.
  const groupCov = m.groups.map((g) => {
    const filled = g.items.filter((it) => it.vol > 0).length;
    return { code: g.code, name: window.I18N.pick(g, lang), filled, total: g.items.length };
  });
  const emptyGroups = groupCov.filter((g) => g.filled === 0);
  const partialGroups = groupCov.filter((g) => g.filled > 0 && g.filled < g.total);
  const totalItems = m.items.length;
  const filledItems = m.items.filter((it) => it.vol > 0).length;

  return (
    <div className="fade-in">
      <h2 className="section-title">{t("rab_title")}</h2>
      <p className="section-desc">{t("rab_descId")}</p>

      {(emptyGroups.length > 0 || partialGroups.length > 0) && (
        <div className="coverage-banner">
          <div className="coverage-bar-wrap">
            <div className="coverage-bar" style={{ width: Math.round((filledItems / totalItems) * 100) + "%" }} />
          </div>
          <div className="coverage-text">
            <div className="coverage-title-row">
              <div className="coverage-title">
                {lang === "zh"
                  ? `已填入 ${filledItems} / ${totalItems} 項 (${Math.round((filledItems / totalItems) * 100)}%)`
                  : lang === "id"
                    ? `Data terisi ${filledItems} dari ${totalItems} item (${Math.round((filledItems / totalItems) * 100)}%)`
                    : `${filledItems} of ${totalItems} items filled (${Math.round((filledItems / totalItems) * 100)}%)`}
              </div>
              <button
                type="button"
                className="btn-analyze-all"
                disabled={!!bulkProgress}
                onClick={async () => {
                  // Collect the list of WBS we'll process so the overlay can
                  // show a smooth progress bar (and the user can see each
                  // step). We skip already-filled and N/A items here too —
                  // mirrors the safeguards in analyzeAllMissing().
                  const queue = m.items
                    .filter((it) => !(it.vol > 0))
                    .filter((it) => !window.BIM_CALC.getApplicabilityNote(it.wbs))
                    .map((it) => it.wbs)
                    .filter((wbs) => !!window.BIM_CALC.analyzeWbs(wbs));
                  if (queue.length === 0) {
                    alert(lang === "zh" ? "沒有可分析的項目。" : lang === "id" ? "Tidak ada item yang bisa dianalisis." : "No items left to analyse.");
                    return;
                  }
                  setBulkProgress({ current: 0, total: queue.length, wbs: queue[0] });
                  for (let i = 0; i < queue.length; i++) {
                    const wbs = queue[i];
                    setBulkProgress({ current: i, total: queue.length, wbs });
                    await new Promise((r) => setTimeout(r, 180 + Math.random() * 120));
                    const r = window.BIM_CALC.analyzeWbs(wbs);
                    if (r) window.BIM_CALC.applyAnalysis({ [wbs]: r });
                  }
                  setBulkProgress({ current: queue.length, total: queue.length, wbs: null });
                  await new Promise((r) => setTimeout(r, 450));
                  setBulkProgress(null);
                }}
                title={lang === "zh" ? "一次分析所有空白項目" : lang === "id" ? "Analisis semua item yang kosong sekaligus" : "Analyse every empty item at once"}
              >
                {bulkProgress ? (
                  <><span className="ri-spin" style={{ marginRight: 8 }} />{lang === "zh" ? "分析中…" : lang === "id" ? "Menganalisis…" : "Analysing…"}</>
                ) : (
                  <>✨ {lang === "zh" ? "全部分析" : lang === "id" ? "Analisis Semua" : "Analyse All"}</>
                )}
              </button>
            </div>
            {emptyGroups.length > 0 && (
              <div className="coverage-detail">
                <span className="coverage-label coverage-label-empty">{lang === "zh" ? "完全缺漏:" : lang === "id" ? "Belum ada data:" : "Missing entirely:"}</span>
                {emptyGroups.map((g) => (
                  <span key={g.code} className="coverage-chip coverage-chip-empty">
                    <b>{g.code}</b> {g.name}
                  </span>
                ))}
              </div>
            )}
            {partialGroups.length > 0 && (
              <div className="coverage-detail">
                <span className="coverage-label coverage-label-partial">{lang === "zh" ? "部分填入:" : lang === "id" ? "Sebagian:" : "Partial:"}</span>
                {partialGroups.map((g) => (
                  <span key={g.code} className="coverage-chip coverage-chip-partial">
                    <b>{g.code}</b> {g.filled}/{g.total}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Card style={{ overflow: "hidden" }}>
        <div className="scroll-x">
          <table className="tbl">
            <thead><tr>
              <th style={{ width: 44 }}>{t("rab_wbs")}</th>
              <th>{t("rab_desc")}</th>
              <th className="c" style={{ width: 50 }}>{t("rab_unit")}</th>
              <th className="r" style={{ width: 78 }}>{t("rab_vol")}</th>
              <th className="r" style={{ width: 130 }}>{t("rab_unitPrice")}</th>
              <th className="r" style={{ width: 150 }}>{t("rab_total")}</th>
              <th className="r" style={{ width: 116 }}>{t("rab_weight")}</th>
            </tr></thead>
            <tbody>
              {m.groups.map((g, gi) => (
                <React.Fragment key={g.code}>
                  <tr className="grp-row">
                    <td colSpan={6}><span className="grp-code">{g.code}</span>{window.I18N.pick(g, lang)}
                      {g.fromRevit && <span className="pill pill-revit" style={{ marginLeft: 10 }}>{t("rab_revit")}</span>}</td>
                    <td className="r"><span className="pill pill-calc">{fmtPct(g.weight)}</span></td>
                  </tr>
                  {g.items.map((it) => {
                    const missing = !(it.vol > 0);
                    const aiBasis = window.BIM_STORE && window.BIM_STORE.aiEstimated && window.BIM_STORE.aiEstimated[it.wbs];
                    const isAi = !!aiBasis && it.vol > 0;
                    const naNote = window.BIM_CALC.getApplicabilityNote(it.wbs);
                    const isNa = missing && !!naNote;
                    const isThisAnalyzing = analyzing.has(it.wbs);
                    const onAnalyze = async () => {
                      // Mark this WBS as analysing → button switches to spinner
                      setAnalyzing((prev) => { const next = new Set(prev); next.add(it.wbs); return next; });
                      // Brief delay so the user actually sees the spinner — feels
                      // like real reasoning instead of an instant value swap.
                      await new Promise((r) => setTimeout(r, 500 + Math.random() * 300));
                      const r = window.BIM_CALC.analyzeWbs(it.wbs);
                      if (r) window.BIM_CALC.applyAnalysis({ [it.wbs]: r });
                      setAnalyzing((prev) => { const next = new Set(prev); next.delete(it.wbs); return next; });
                    };
                    const canAnalyze = !isNa && !!window.BIM_CALC.analyzeWbs(it.wbs);
                    return (
                    <tr key={it.wbs} className={isNa ? "row-na" : (missing ? "row-missing" : (isAi ? "row-ai" : ""))}>
                      <td className="wbs-code">{it.wbs}</td>
                      <td className="cell-desc">
                        <span className="cell-desc-text">{window.I18N.pick(it, lang)}</span>
                        {isNa && (
                          <span className="pill-na" title={naNote}>
                            {lang === "zh" ? "不適用" : lang === "id" ? "Tidak berlaku" : "N/A"}
                          </span>
                        )}
                        {missing && !isNa && (
                          <span className="pill-missing" title={lang === "zh" ? "已上傳之 Revit/CSV 檔中無此項" : lang === "id" ? "Tidak ada di file Revit/CSV yang diunggah" : "Not present in uploaded Revit/CSV file"}>
                            {lang === "zh" ? "資料缺漏" : lang === "id" ? "Data tidak ada" : "Data missing"}
                          </span>
                        )}
                        {missing && canAnalyze && (
                          <button
                            type="button"
                            className={"pill-analyze" + (isThisAnalyzing ? " is-loading" : "")}
                            disabled={isThisAnalyzing || !!bulkProgress}
                            onClick={onAnalyze}
                            title={lang === "zh" ? "點擊以根據 IFC + Revit 明細表估算工程量" : lang === "id" ? "Klik untuk menganalisis volume dari data IFC + Revit Schedule" : "Click to analyse volume from IFC + Revit Schedule data"}
                          >
                            {isThisAnalyzing ? (
                              <><span className="ri-spin ri-spin-sm" /> {lang === "zh" ? "分析中…" : lang === "id" ? "Menganalisis…" : "Analysing…"}</>
                            ) : (
                              <>✨ {lang === "zh" ? "分析" : lang === "id" ? "Analisis" : "Analyse"}</>
                            )}
                          </button>
                        )}
                        {isAi && (
                          <span className="pill-ai" title={aiBasis}>
                            AI · {lang === "zh" ? "估算" : lang === "id" ? "estimasi" : "estimate"}
                          </span>
                        )}
                      </td>
                      <td className="c" style={{ color: "var(--muted)", fontSize: 11 }}>{lang === "id" ? it.unit : it.uEn}</td>{/* unit kept original — m²/m³/kg are universal */}
                      <td className="r num">{fmtNum(it.vol, it.vol % 1 ? 1 : 0)}</td>
                      <td className="r num" style={{ color: "var(--ink-2)" }}>{fmtNum(it.unitPrice, dec(cur, it.unitPrice))}</td>
                      <td className="r num">{fmtNum(it.total)}</td>
                      <td><div className="wbar">
                        <span className="wbar-track"><span className="wbar-fill" style={{ width: Math.min(100, it.weight / 12 * 100) + "%", background: GROUP_PALETTE[gi] }} /></span>
                        <span className="wbar-val">{fmtPct(it.weight)}</span>
                      </div></td>
                    </tr>
                    );
                  })}
                  <tr className="sub-row">
                    <td></td><td style={{ fontSize: 11.5, color: "var(--muted)" }}>{t("rab_subtotal")} {g.code}</td>
                    <td colSpan={3}></td><td className="r num">{fmtNum(g.subtotal)}</td><td className="r num">{fmtPct(g.weight)}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "var(--surface-2)" }}>
                <td colSpan={5} style={{ fontWeight: 600, fontSize: 12.5, padding: "11px 12px" }}>{t("rab_directTotal")}</td>
                <td className="r num" style={{ fontWeight: 600, fontSize: 12.5 }}>{fmtMoney(m.direct, cur)}</td>
                <td className="r num" style={{ fontWeight: 600 }}>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* markup recap */}
      <div className="grid-2b" style={{ marginTop: 16, alignItems: "start" }}>
        <Card eyebrow={std.flag} title={t("rab_recap")}>
          <table className="tbl" style={{ fontSize: 12.5 }}>
            <tbody>
              {m.markup.map((mk, i) => (
                <tr key={i} style={mk.type === "base" ? { fontWeight: 600 } : null}>
                  <td style={{ borderBottom: "1px solid var(--line-2)" }}>
                    {window.I18N.pick(mk, lang)}{mk.pct ? <span className="num" style={{ color: "var(--muted)", marginLeft: 6 }}>{fmtPct(mk.pct * 100, 1).replace(",00", "")}</span> : null}
                  </td>
                  <td className="r num" style={{ borderBottom: "1px solid var(--line-2)" }}>{mk.type === "base" ? fmtMoney(mk.amount, cur) : "+ " + fmtNum(mk.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr style={{ background: "var(--ink)" }}>
              <td style={{ fontWeight: 700, color: "#fff", padding: "12px" }}>{t("rab_grandtotal")}</td>
              <td className="r num" style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{fmtMoney(m.grand, cur)}</td>
            </tr></tfoot>
          </table>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 12, lineHeight: 1.6 }}>{window.I18N.pick(std, lang, "markupNoteId", "markupNoteEn", "markupNoteZh")}</div>
        </Card>
        <Card eyebrow="WBS" title={t("ov_costByWbs")} right={<span className="card-eyebrow">{std.curSym}</span>}>
          <WbsBars groups={m.groups} lang={lang} cur={cur} />
        </Card>
      </div>

      {/* Bulk analysis progress overlay */}
      {bulkProgress && (
        <div className="analyze-overlay">
          <div className="analyze-modal">
            <div className="analyze-icon">
              <span className="ri-spin ri-spin-lg" />
            </div>
            <div className="analyze-modal-title">
              {lang === "zh" ? "分析空白項目中" : lang === "id" ? "Menganalisis item kosong" : "Analysing empty items"}
            </div>
            <div className="analyze-modal-sub">
              {bulkProgress.wbs ? (
                <>
                  <span className="wbs-code num">{bulkProgress.wbs}</span>
                  {" — "}
                  {(() => {
                    const found = window.BIM.ITEMS.find((x) => x.wbs === bulkProgress.wbs);
                    return found ? window.I18N.pick(found, lang) : "";
                  })()}
                </>
              ) : (
                <>{lang === "zh" ? "完成中…" : lang === "id" ? "Menyelesaikan…" : "Finalising…"}</>
              )}
            </div>
            <div className="analyze-progress-track">
              <div
                className="analyze-progress-fill"
                style={{ width: Math.round((bulkProgress.current / bulkProgress.total) * 100) + "%" }}
              />
            </div>
            <div className="analyze-progress-count num">
              {bulkProgress.current} / {bulkProgress.total}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.estTt = tt;
Object.assign(window, { Card, Kpi, ExampleNote, EmptyDataState, hasProjectData, AhspView, RabView, PRED, GROUP_PALETTE, estTt: tt });
