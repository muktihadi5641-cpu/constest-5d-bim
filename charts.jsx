/* charts.jsx — formatters + SVG charts (S-curve, WBS distribution) */

/* ---------- formatters (shared via window) ----------
   All formatters read the UI language from <html lang> (set in app.jsx),
   so the user's language switch automatically updates decimal/thousand
   separators and currency-scale suffixes (jt/M vs M/B). */
const CUR = { idr: { sym: "Rp", locale: "id-ID" }, twd: { sym: "NT$", locale: "zh-TW" } };
function _lang() {
  // window.BIM_LANG is set synchronously by app.jsx render — fresher than
  // <html lang> which only updates inside useEffect (one frame later).
  const v = (typeof window !== "undefined" && window.BIM_LANG) ||
            (typeof document !== "undefined" ? document.documentElement.lang : "id");
  return v === "en" || v === "zh" ? v : "id";
}
function _locale() {
  const l = _lang();
  return l === "en" ? "en-US" : l === "zh" ? "zh-TW" : "id-ID";
}

function fmtMoney(n, cur) {
  const c = CUR[cur] || CUR.idr;
  return c.sym + "\u00A0" + Math.round(n).toLocaleString(_locale());
}
function fmtNum(n, dec = 0) {
  return Number(n).toLocaleString(_locale(), { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtPct(n, dec = 2) { return fmtNum(n, dec) + "%"; }

function fmtCompact(n, cur) {
  const sym = (CUR[cur] || CUR.idr).sym;
  const abs = Math.abs(n);
  const lang = _lang();
  // Chinese uses \u842C (10^4) and \u5104 (10^8) \u2014 native scale.
  // Indonesian: rb (ribu 10^3), jt (juta 10^6), M (miliar 10^9).
  // English:    K (10^3), M (10^6), B (10^9).
  if (lang === "zh") {
    if (abs >= 1e8) return sym + "\u00A0" + fmtNum(n / 1e8, 2) + "\u00A0\u5104";
    if (abs >= 1e4) return sym + "\u00A0" + fmtNum(n / 1e4, 1) + "\u00A0\u842C";
    return sym + "\u00A0" + fmtNum(n, 0);
  }
  const SUF = lang === "en"
    ? { K: "K", M: "M", B: "B" }
    : { K: "rb", M: "jt", B: "M" };
  if (cur === "idr") {
    if (abs >= 1e9) return sym + "\u00A0" + fmtNum(n / 1e9, 2) + "\u00A0" + SUF.B;
    if (abs >= 1e6) return sym + "\u00A0" + fmtNum(n / 1e6, 1) + "\u00A0" + SUF.M;
    return sym + "\u00A0" + fmtNum(n, 0);
  }
  if (abs >= 1e6) return sym + "\u00A0" + fmtNum(n / 1e6, 2) + "\u00A0" + SUF.M;
  if (abs >= 1e3) return sym + "\u00A0" + fmtNum(n / 1e3, 1) + "\u00A0" + SUF.K;
  return sym + "\u00A0" + fmtNum(n, 0);
}

/* ---------- S-Curve ---------- */
function SCurve({ model, totalWeeks, lang, mini = false }) {
  const W = 780, H = mini ? 220 : 340;
  const m = mini ? { t: 16, r: 16, b: 28, l: 38 } : { t: 22, r: 24, b: 40, l: 46 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const n = totalWeeks;
  const xOf = (w) => m.l + (iw * (w - 0)) / n;          // week 0..n
  const yOf = (p) => m.t + ih - (ih * p) / 100;

  const cum = model.cumulative, wk = model.weekly;
  // line points start at (week0, 0)
  const pts = [[xOf(0), yOf(0)]];
  for (let w = 1; w <= n; w++) pts.push([xOf(w), yOf(cum[w])]);
  const linePath = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const areaPath = linePath + ` L ${xOf(n).toFixed(1)} ${yOf(0).toFixed(1)} L ${xOf(0).toFixed(1)} ${yOf(0).toFixed(1)} Z`;
  const barW = Math.max(4, (iw / n) * 0.5);

  const yTicks = [0, 25, 50, 75, 100];
  const xStep = mini ? 3 : (n > 14 ? 2 : 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} role="img">
      <defs>
        <linearGradient id="scFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--blue)" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* y grid + labels */}
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={m.l} y1={yOf(t)} x2={W - m.r} y2={yOf(t)}
                stroke="var(--line)" strokeWidth="1" strokeDasharray={t === 0 ? "0" : "3 4"} />
          <text x={m.l - 8} y={yOf(t) + 3.5} textAnchor="end"
                fontFamily="var(--mono)" fontSize="10" fill="var(--faint)">{t}</text>
        </g>
      ))}

      {/* weekly bars */}
      {!mini && Array.from({ length: n }, (_, i) => i + 1).map((w) => {
        const h = (ih * wk[w]) / 100;
        return <rect key={w} x={xOf(w) - barW / 2} y={yOf(0) - h} width={barW} height={Math.max(0, h)}
                     rx="2" fill="var(--blue-soft)" />;
      })}

      {/* area + line */}
      <path d={areaPath} fill="url(#scFill)" />
      <path d={linePath} fill="none" stroke="var(--blue)" strokeWidth={mini ? 2 : 2.4}
            strokeLinejoin="round" strokeLinecap="round" />

      {/* dots */}
      {!mini && pts.slice(1).map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="2.6" fill="var(--surface)" stroke="var(--blue)" strokeWidth="1.6" />
      ))}

      {/* x labels */}
      {Array.from({ length: n }, (_, i) => i + 1).filter((w) => w % xStep === 0 || w === 1).map((w) => (
        <text key={w} x={xOf(w)} y={H - (mini ? 10 : 22)} textAnchor="middle"
              fontFamily="var(--mono)" fontSize="10" fill="var(--faint)">{w}</text>
      ))}
      {!mini && (
        <text x={m.l + iw / 2} y={H - 6} textAnchor="middle" fontSize="10.5" fill="var(--muted)">
          {lang === "zh" ? "週次" : lang === "id" ? "Minggu ke-" : "Week"}
        </text>
      )}
    </svg>
  );
}

/* ---------- WBS distribution (horizontal bars) ---------- */
function WbsBars({ groups, lang, cur }) {
  const max = Math.max(...groups.map((g) => g.weight));
  const palette = [
    "oklch(0.55 0.13 248)", "oklch(0.58 0.11 215)", "oklch(0.58 0.10 195)",
    "oklch(0.60 0.10 168)", "oklch(0.64 0.11 140)", "oklch(0.70 0.12 95)",
    "oklch(0.72 0.12 70)", "oklch(0.64 0.13 40)",
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {groups.map((g, i) => (
        <div key={g.code} style={{ display: "grid", gridTemplateColumns: "150px 1fr 86px", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: palette[i], flex: "none" }} />
            <span style={{ fontSize: 12, color: "var(--ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {window.I18N.pick(g, lang)}
            </span>
          </div>
          <div style={{ height: 8, background: "var(--line)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: (g.weight / max * 100) + "%", height: "100%", background: palette[i], borderRadius: 4, transition: "width .4s" }} />
          </div>
          <span className="num" style={{ fontSize: 11.5, textAlign: "right", color: "var(--ink-2)" }}>{fmtPct(g.weight)}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { fmtMoney, fmtNum, fmtPct, fmtCompact, SCurve, WbsBars, CUR });
