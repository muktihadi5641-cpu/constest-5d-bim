/* estimation_sched.jsx — Schedule (table + Gantt) & S-Curve (chart + matrix), per standard */

function ScheduleView({ lang, stdKey }) {
  const t = window.estTt(lang);
  const Card = window.Card;
  const std = window.BIM.STANDARDS[stdKey];

  if (window.hasProjectData && !window.hasProjectData()) {
    return (
      <div className="fade-in">
        <h2 className="section-title">{t("sch_title")}</h2>
        <window.EmptyDataState lang={lang} />
      </div>
    );
  }

  const m = window.BIM_CALC.MODELS[stdKey];
  const n = m.totalWeeks;

  const gMeta = m.groups.map((g) => {
    const start = Math.min(...g.items.map((i) => i.startW));
    const finish = Math.max(...g.items.map((i) => i.endW));
    return { ...g, start, finish, dur: finish - start + 1 };
  });

  return (
    <div className="fade-in">
      <h2 className="section-title">{t("sch_title")}</h2>
      <p className="section-desc">{t("sch_desc")}</p>

      <div className="grid-2b" style={{ alignItems: "start", marginBottom: 16 }}>
        <Card eyebrow="A" title={t("sch_pkg")} style={{ overflow: "hidden" }}>
          <div className="scroll-x" style={{ margin: "-16px -18px" }}>
            <table className="tbl">
              <thead><tr>
                <th style={{ position: "static", width: 34 }}></th>
                <th style={{ position: "static" }}>{t("sch_item")}</th>
                <th className="c" style={{ position: "static" }}>{t("sch_durW")}</th>
                <th className="c" style={{ position: "static" }}>{t("sch_start")}</th>
                <th className="c" style={{ position: "static" }}>{t("sch_finish")}</th>
                <th className="c" style={{ position: "static" }}>{t("sch_pred")}</th>
              </tr></thead>
              <tbody>
                {gMeta.map((g, i) => (
                  <tr key={g.code}>
                    <td><span style={{ width: 10, height: 10, borderRadius: 3, background: window.GROUP_PALETTE[i], display: "inline-block" }} /></td>
                    <td><span className="grp-code">{g.code}</span>{window.I18N.pick(g, lang)}</td>
                    <td className="c num">{g.dur} {t("sch_wk")}</td>
                    <td className="c num" style={{ color: "var(--muted)" }}>{t("sch_week")}{g.start}</td>
                    <td className="c num" style={{ color: "var(--muted)" }}>{t("sch_week")}{g.finish}</td>
                    <td className="c num" style={{ color: "var(--ink-2)" }}>{window.PRED[g.code]}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr style={{ background: "var(--surface-2)" }}>
                <td></td><td style={{ fontWeight: 600 }}>{t("sch_total")}</td>
                <td className="c num" style={{ fontWeight: 700, color: std.accentInk }}>{n} {t("sch_wk")}</td>
                <td className="c num" style={{ color: "var(--muted)" }}>{t("sch_week")}1</td>
                <td className="c num" style={{ color: "var(--muted)" }}>{t("sch_week")}{n}</td>
                <td className="c" style={{ fontSize: 11, color: "var(--muted)" }}>{n * 7} {t("ov_days")}</td>
              </tr></tfoot>
            </table>
          </div>
        </Card>

        <Card eyebrow="B" title={t("sch_assume")}>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.7 }}>
            <li>{lang === "zh" ? "各項目工期 = 工程量 ÷ 班組日生產率。" : lang === "id" ? "Durasi tiap item = Volume ÷ produktivitas regu kerja per hari." : "Each item's duration = Volume ÷ crew daily productivity."}</li>
            <li>{lang === "zh" ? "包之間採完成-開始 (FS) 關係,合理重疊。" : lang === "id" ? "Hubungan Finish-to-Start (FS) antar paket, dengan overlap yang wajar." : "Finish-to-Start (FS) links between packages, with sensible overlaps."}</li>
            <li>{lang === "zh" ? "結構 (D) 為關鍵路徑,因建物為 2 層。" : lang === "id" ? "Struktur (D) adalah lintasan kritis karena bangunan 2 lantai." : "Structure (D) is the critical path due to the two storeys."}</li>
            <li>{stdKey === "tw"
              ? (lang === "zh" ? "臺灣標準:機械化提高生產率 → 共 16 週。" : lang === "id" ? "Standar Taiwan: produktivitas lebih tinggi (mekanisasi) → total 16 minggu." : "Taiwan standard: higher (mechanised) productivity → 16 weeks total.")
              : (lang === "zh" ? "印尼標準:勞力密集 → 共 18 週。"             : lang === "id" ? "Standar Indonesia: padat karya → total 18 minggu."                       : "Indonesian standard: labour-intensive → 18 weeks total.")}</li>
          </ul>
        </Card>
      </div>

      <Card eyebrow="C" title={t("sch_gantt")} right={<span className="card-eyebrow">{n} {t("sch_weekFull")}</span>}>
        <Gantt lang={lang} n={n} model={m} />
      </Card>
    </div>
  );
}

function Gantt({ lang, n, model }) {
  const LABEL_W = 210;
  const weeks = Array.from({ length: n }, (_, i) => i + 1);
  const Track = ({ start, end, color, group }) => {
    const left = ((start - 1) / n) * 100, width = ((end - start + 1) / n) * 100;
    return (
      <div style={{ position: "relative", height: group ? 22 : 18, background: "var(--surface-2)", borderRadius: 5 }}>
        {weeks.slice(0, -1).map((w) => (<div key={w} style={{ position: "absolute", left: (w / n) * 100 + "%", top: 0, bottom: 0, width: 1, background: "var(--line-2)" }} />))}
        <div style={{ position: "absolute", left: left + "%", width: width + "%", top: group ? 4 : 3, bottom: group ? 4 : 3, background: color, borderRadius: 4, boxShadow: group ? "none" : "inset 0 0 0 1px oklch(1 0 0 / 0.25)", opacity: group ? 0.32 : 1 }} />
      </div>
    );
  };
  return (
    <div className="scroll-x">
      <div style={{ minWidth: 640 }}>
        <div style={{ display: "grid", gridTemplateColumns: `${LABEL_W}px 1fr`, gap: 12, marginBottom: 8 }}>
          <div className="card-eyebrow" style={{ alignSelf: "center" }}>{lang === "zh" ? "工程項目" : lang === "id" ? "Uraian Pekerjaan" : "Work Item"}</div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${n}, 1fr)` }}>
            {weeks.map((w) => (<div key={w} className="num" style={{ textAlign: "center", fontSize: 9.5, color: "var(--faint)" }}>{w}</div>))}
          </div>
        </div>
        {model.groups.map((g, gi) => (
          <div key={g.code} style={{ marginBottom: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: `${LABEL_W}px 1fr`, gap: 12, alignItems: "center", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span className="grp-code" style={{ margin: 0 }}>{g.code}</span>
                <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{window.I18N.pick(g, lang)}</span>
              </div>
              <Track start={Math.min(...g.items.map((i) => i.startW))} end={Math.max(...g.items.map((i) => i.endW))} color={window.GROUP_PALETTE[gi]} group />
            </div>
            {g.items.map((it) => (
              <div key={it.wbs} style={{ display: "grid", gridTemplateColumns: `${LABEL_W}px 1fr`, gap: 12, alignItems: "center", marginBottom: 3 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, paddingLeft: 14, minWidth: 0 }}>
                  <span className="wbs-code" style={{ fontSize: 10, color: "var(--faint)" }}>{it.wbs}</span>
                  <span style={{ fontSize: 11.5, color: "var(--ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{window.I18N.pick(it, lang)}</span>
                </div>
                <Track start={it.startW} end={it.endW} color={window.GROUP_PALETTE[gi]} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- S-Curve ---- */
function ScurveView({ lang, stdKey }) {
  const t = window.estTt(lang);
  const Card = window.Card;
  const std = window.BIM.STANDARDS[stdKey];

  if (window.hasProjectData && !window.hasProjectData()) {
    return (
      <div className="fade-in">
        <h2 className="section-title">{t("sc_title")}</h2>
        <window.EmptyDataState lang={lang} />
      </div>
    );
  }

  const m = window.BIM_CALC.MODELS[stdKey];
  const n = m.totalWeeks;
  const weeks = Array.from({ length: n }, (_, i) => i + 1);

  const matrix = m.groups.map((g) => {
    const row = new Array(n + 1).fill(0);
    g.items.forEach((it) => { const span = it.endW - it.startW + 1; for (let w = it.startW; w <= it.endW; w++) row[w] += it.weight / span; });
    return row;
  });
  const maxCell = Math.max(...matrix.flat());

  return (
    <div className="fade-in">
      <h2 className="section-title">{t("sc_title")}</h2>
      <p className="section-desc">{t("sc_desc")}</p>

      <Card eyebrow="01" title={t("sc_chart")}
            right={<div className="legend" style={{ marginTop: 0 }}>
              <span className="legend-item"><span className="legend-sw" style={{ background: "var(--blue)" }} />{t("sc_planCum")}</span>
              <span className="legend-item"><span className="legend-sw" style={{ background: "var(--blue-soft)" }} />{t("sc_weekly")}</span>
            </div>} style={{ marginBottom: 16 }}>
        <SCurve model={m} totalWeeks={n} lang={lang} />
      </Card>

      <Card eyebrow="02" title={t("sc_table")} right={<span className="card-eyebrow">{lang === "zh" ? "WBS × 週 權重" : lang === "id" ? "bobot per WBS × minggu" : "weight per WBS × week"}</span>} style={{ overflow: "hidden" }}>
        <div className="scroll-x" style={{ margin: "-16px -18px" }}>
          <table className="tbl" style={{ fontSize: 11 }}>
            <thead><tr>
              <th style={{ position: "sticky", left: 0, zIndex: 3, minWidth: 150, background: "var(--surface)" }}>WBS</th>
              {weeks.map((w) => <th key={w} className="c" style={{ position: "static", minWidth: 36 }}>{t("sch_week")}{w}</th>)}
            </tr></thead>
            <tbody>
              {m.groups.map((g, gi) => (
                <tr key={g.code}>
                  <td style={{ position: "sticky", left: 0, background: "var(--surface)", zIndex: 1 }}><span className="grp-code">{g.code}</span><span style={{ fontSize: 11 }}>{window.I18N.pick(g, lang)}</span></td>
                  {weeks.map((w) => { const v = matrix[gi][w]; return (
                    <td key={w} className="c num" style={{ background: v > 0 ? `oklch(0.55 0.13 248 / ${Math.min(0.5, v / maxCell * 0.5).toFixed(3)})` : "transparent", color: v > 0 ? "var(--ink)" : "var(--faint)", fontSize: 10.5 }}>{v > 0 ? fmtNum(v, 1) : "·"}</td>
                  ); })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid var(--line)" }}>
                <td style={{ position: "sticky", left: 0, background: "var(--surface-2)", fontWeight: 600, fontSize: 11 }}>{t("sc_weekly")} (%)</td>
                {weeks.map((w) => <td key={w} className="c num" style={{ background: "var(--surface-2)", fontWeight: 600, fontSize: 10.5 }}>{fmtNum(m.weekly[w], 1)}</td>)}
              </tr>
              <tr>
                <td style={{ position: "sticky", left: 0, background: "var(--blue-soft)", fontWeight: 600, fontSize: 11, color: "var(--blue-ink)" }}>{t("sc_cumulative")} (%)</td>
                {weeks.map((w) => <td key={w} className="c num" style={{ background: "var(--blue-soft)", fontWeight: 600, fontSize: 10.5, color: "var(--blue-ink)" }}>{fmtNum(m.cumulative[w], 1)}</td>)}
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { ScheduleView, ScurveView, Gantt });
