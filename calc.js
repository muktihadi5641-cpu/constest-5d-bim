/* Derived calculations per standard: RAB, weights, schedule, markup, S-curve, AHSP */
(function () {
  "use strict";
  const { PROJECT, GROUPS, ITEMS, STANDARDS, AHSP_ID, AHSP_TW } = window.BIM;
  // Snapshot defaults so resetProject() can put things back when the user
  // clears all uploaded sources.
  const ORIG_PROJECT = Object.assign({}, PROJECT);

  function priceOf(it, cur) { return cur === "twd" ? it.twd : it.idr; }

  // Indonesia plan uses startW/endW (18 wk). Taiwan compresses to its totalWeeks.
  function weeksFor(it, std) {
    if (std.key === "id") return { s: it.startW, e: it.endW };
    const base = 18, n = std.totalWeeks;
    let s = Math.round((it.startW - 1) * n / base) + 1;
    let e = Math.round(it.endW * n / base);
    s = Math.max(1, Math.min(n, s));
    e = Math.max(s, Math.min(n, e));
    return { s, e };
  }

  function buildModel(stdKey) {
    const std = STANDARDS[stdKey];
    const cur = std.cur, n = std.totalWeeks;

    const items = ITEMS.map((it) => {
      const w = weeksFor(it, std);
      return { ...it, unitPrice: priceOf(it, cur), total: it.vol * priceOf(it, cur), startW: w.s, endW: w.e };
    });
    const direct = items.reduce((s, it) => s + it.total, 0);
    items.forEach((it) => { it.weight = (it.total / direct) * 100; });

    const groups = GROUPS.map((g) => {
      const gi = items.filter((it) => it.wbs[0] === g.code);
      const subtotal = gi.reduce((s, it) => s + it.total, 0);
      return { ...g, items: gi, subtotal, weight: (subtotal / direct) * 100 };
    });

    // markup ladder
    let running = direct;
    const markup = std.markup.map((m) => {
      if (m.type === "base") return { ...m, amount: direct, running: direct };
      const base = m.onSubtotal ? running : direct;
      const amount = base * m.pct;
      running += amount;
      return { ...m, amount, running };
    });
    const grand = running;

    // weekly S-curve (based on direct-cost weight)
    const weekly = new Array(n + 1).fill(0);
    items.forEach((it) => {
      const span = it.endW - it.startW + 1;
      for (let w = it.startW; w <= it.endW; w++) weekly[w] += it.weight / span;
    });
    const cumulative = new Array(n + 1).fill(0);
    let run = 0;
    for (let w = 1; w <= n; w++) { run += weekly[w]; cumulative[w] = run; }

    return { std, cur, items, groups, direct, markup, grand, weekly, cumulative, totalWeeks: n };
  }

  // generalised AHSP for grouped structure
  function ahspCalc(stdKey, key) {
    const a = (stdKey === "tw" ? AHSP_TW : AHSP_ID)[key];
    const groups = a.groups.map((g) => {
      const rows = g.rows.map((r) => ({ ...r, amount: r.coef * r.price }));
      const sub = rows.reduce((s, r) => s + r.amount, 0);
      return { ...g, rows, sub };
    });
    const base = groups.reduce((s, g) => s + g.sub, 0);
    const ohp = base * (a.ohp || 0);
    const total = base + ohp;
    return { meta: a, groups, base, ohp, total, stdKey };
  }

  const MODELS = { id: buildModel("id"), tw: buildModel("tw") };

  // ---- Volume mutation API (for Revit data import) ---------------------

  function refresh() {
    MODELS.id = buildModel("id");
    MODELS.tw = buildModel("tw");
    window.dispatchEvent(new CustomEvent("bim:datachange"));
  }

  // rows: Array<{ wbs: string, vol: number }>
  // Returns { applied, skipped } so callers can show feedback. Accepts any
  // WBS that exists in ITEMS — not restricted to Revit-flagged groups, since
  // a single upload typically carries volumes for the whole project.
  function updateVolumes(rows) {
    const byWbs = ITEMS.reduce((m, it) => { m[it.wbs] = it; return m; }, {});
    const applied = [], skipped = [];
    rows.forEach((r) => {
      const wbs = String(r.wbs || "").trim().toUpperCase();
      const vol = Number(r.vol);
      if (!wbs || !Number.isFinite(vol) || vol < 0) { skipped.push(r.wbs || "?"); return; }
      const it = byWbs[wbs];
      if (!it) { skipped.push(wbs); return; }
      it.vol = vol;
      applied.push(wbs);
    });
    if (applied.length) refresh();
    return { applied, skipped };
  }

  function clearAll() {
    ITEMS.forEach((it) => { it.vol = 0; });
    Object.assign(PROJECT, ORIG_PROJECT, { buildingArea: 0, landArea: 0, floors: 0, nameId: "", nameEn: "" });
    if (window.BIM_STORE) window.BIM_STORE.aiEstimated = {};
    refresh();
  }

  // Merge keys into the shared PROJECT object. Only the keys passed are
  // touched — pass undefined to leave a value alone. After mutation we fire
  // the same refresh path used for volume changes so the Overview re-renders.
  function updateProject(updates) {
    if (!updates) return;
    Object.keys(updates).forEach((k) => {
      if (updates[k] === undefined) return;
      PROJECT[k] = updates[k];
    });
    refresh();
  }

  function resetProject() {
    Object.assign(PROJECT, ORIG_PROJECT);
    refresh();
  }

  // Atomically REPLACE every volume — keys in volMap are SET, all others go
  // to zero. Use this when re-aggregating from a fresh list of uploaded files
  // so that removing a file properly subtracts its contribution.
  function setVolumes(volMap) {
    const upper = {};
    Object.keys(volMap || {}).forEach((k) => { upper[String(k).trim().toUpperCase()] = Number(volMap[k]) || 0; });
    ITEMS.forEach((it) => { it.vol = upper[it.wbs] || 0; });
    refresh();
  }

  // Total volume across the project — used by views to detect empty state.
  function totalVolume() {
    return ITEMS.reduce((s, it) => s + (Number(it.vol) || 0), 0);
  }

  // All items (used by the template generator).
  function templateRows() { return ITEMS.slice(); }

  /* ---- Heuristic "AI analyse" ----------------------------------------
     Cascade reasoning: each rule first looks for the most accurate input
     (direct CSV upload), then falls back to IFC bbox geometry, and finally
     to derived/synthetic values. This way:
       • More uploads → more direct values, fewer cascades, more accurate.
       • Fewer uploads → more cascades fire, but more items still analysable.
       • Zero uploads → no inputs at all → all rules return null.
     A deterministic rule engine running client-side; for an actual LLM
     call you'd add a backend proxy and replace getInputs/rules with API
     calls. Each rule returns { vol, basis } so the UI tooltip explains
     where the number came from. */

  // Sentinel for "this input was synthesised from another estimate" — we
  // append "(turunan)" to the basis so the user sees when a value cascades.
  function _hasIfc() { return !!(window.BIM_STORE && window.BIM_STORE.ifcBuffer); }
  function _ifc()    { return (window.BIM_STORE && window.BIM_STORE.ifcMeta) || {}; }

  // Collect every usable input — direct or derived. The `src` field tags
  // each value so the rules can describe how confident they are. Cascade
  // order: raw CSV upload → IFC bbox → typical ratios off whatever IS
  // present, so rules still fire when only one or two files are loaded.
  function getInputs() {
    const getVol = (w) => (ITEMS.find((it) => it.wbs === w) || { vol: 0 }).vol;
    const ifc = _ifc();
    // Snapshot raw uploaded values so cascade rules don't read derived
    // values back into themselves (avoids circular dependencies).
    const rawC2 = getVol("C.2");   // Foundation Schedule
    const rawD1 = getVol("D.1");   // Column + Framing + Floor (concrete)
    const rawE1 = getVol("E.1");   // Wall Schedule (brick area)
    const rawE3 = getVol("E.3");   // Floor Schedule (area mapped to keramik lantai)

    // 1. Storey count
    let floors = Math.max(1, Number(PROJECT.floors) || Number(ifc.habitableCount) || 0) || 1;

    // 2. Gross building area (m²) — cascade through every available source
    let buildingArea = 0, baSrc = null;
    if (Number(PROJECT.buildingArea) > 0) {
      buildingArea = Number(PROJECT.buildingArea);
      baSrc = "Floor Schedule CSV";
    } else if (Number(ifc.footprint) > 0) {
      buildingArea = ifc.footprint * floors;
      baSrc = "IFC footprint × " + floors + " lantai";
    } else if (rawE3 > 0) {
      buildingArea = rawE3;
      baSrc = "E.3 area (Floor Schedule, turunan)";
    } else if (rawC2 > 0) {
      // Residential rule of thumb: footing volume ≈ 5% of gross floor area.
      buildingArea = rawC2 * 20;
      baSrc = "C.2 × 20 (rasio footing 5% × footprint, turunan)";
    } else if (rawD1 > 0) {
      // Concrete consumption ≈ 0.27 m³ per m² gross floor area.
      buildingArea = rawD1 / 0.27;
      baSrc = "D.1 ÷ 0.27 m³/m² (konsumsi beton residential, turunan)";
    } else if (rawE1 > 0) {
      // Wall area : floor area ≈ 1.7 in residential, so floor ≈ wall × 0.6.
      buildingArea = rawE1 * 0.6;
      baSrc = "E.1 × 0.6 (rasio dinding : footprint, turunan)";
    }

    // 3. Footprint area (single storey, m²)
    let floorArea = 0, floorAreaSrc = null;
    if (Number(ifc.footprint) > 0) {
      floorArea = Number(ifc.footprint);
      floorAreaSrc = "IFC bbox";
    } else if (buildingArea > 0) {
      floorArea = buildingArea / floors;
      floorAreaSrc = baSrc + " ÷ " + floors;
    }

    // 4. Perimeter (m)
    let perimeter = 0, periSrc = null;
    if (Number(ifc.perimeter) > 0) {
      perimeter = Number(ifc.perimeter);
      periSrc = "IFC bbox";
    } else if (floorArea > 0) {
      perimeter = Math.sqrt(floorArea) * 4;
      periSrc = "√(footprint) × 4 (asumsi persegi, turunan)";
    }

    // 5. Storey height (m)
    let storeyHeight = 0, sthSrc = null;
    if (Number(ifc.totalHeight) > 0) {
      storeyHeight = ifc.totalHeight / floors;
      sthSrc = "tinggi IFC ÷ " + floors;
    } else {
      storeyHeight = 3.2;
      sthSrc = "asumsi 3.2 m per lantai";
    }

    // 6. Foundation (footplat) volume (m³) — direct or back-derived
    let foundationVol = 0, fvSrc = null;
    if (rawC2 > 0) {
      foundationVol = rawC2;
      fvSrc = "Foundation Schedule";
    } else if (buildingArea > 0) {
      foundationVol = (buildingArea / floors) * 0.05;
      fvSrc = "≈ 5% × footprint (turunan)";
    }

    // 7. Structural concrete volume (m³) — kolom + balok + slab
    let concreteVol = 0, cvSrc = null;
    if (rawD1 > 0) {
      concreteVol = rawD1;
      cvSrc = "Column + Framing + Floor Schedule";
    } else if (rawC2 > 0) {
      concreteVol = rawC2 * 5;
      cvSrc = "C.2 × 5 (rasio kolom+balok+slab : footing, turunan)";
    } else if (buildingArea > 0) {
      concreteVol = buildingArea * 0.27;
      cvSrc = "buildingArea × 0.27 m³/m² (rule of thumb, turunan)";
    }

    // 8. Wall area (m²) — E.1
    let wallArea = 0, waSrc = null;
    if (rawE1 > 0) {
      wallArea = rawE1;
      waSrc = "Wall Schedule";
    } else if (perimeter > 0 && storeyHeight > 0 && floors > 0) {
      wallArea = perimeter * storeyHeight * floors * 0.8;
      waSrc = "perimeter × tinggi × lantai × 0.8 (turunan)";
    }

    return {
      floorArea, floorAreaSrc, buildingArea, baSrc, floors,
      perimeter, periSrc, storeyHeight, sthSrc,
      foundationVol, fvSrc, concreteVol, cvSrc, wallArea, waSrc,
    };
  }

  function analyzeWbs(wbs) {
    // Hard gate: nothing uploaded → nothing to analyse.
    const hasIfc = _hasIfc();
    const hasAnyCsv = !!(window.BIM_STORE && (window.BIM_STORE.csvFiles || []).some((f) => f.status === "ok"));
    if (!hasIfc && !hasAnyCsv) return null;

    const inp = getInputs();
    const { floorArea, buildingArea, floors, perimeter, storeyHeight, foundationVol, concreteVol, wallArea } = inp;
    // Helper: tag the basis string with which input was used.
    const tag = (src) => src ? " · sumber: " + src : "";

    const round1 = (v) => Math.round(v * 10) / 10;
    const roundInt = (v) => Math.max(0, Math.round(v));
    const R = (vol, basis) => ({ vol, basis });

    const rules = {
      // A — Site Preparation
      "A.1": floorArea > 0 ? R(round1(floorArea * 1.4),     "Land area ≈ footprint × 1.4" + tag(inp.floorAreaSrc)) : null,
      "A.2": perimeter > 0 ? R(round1(perimeter),           "Bouwplank = perimeter" + tag(inp.periSrc)) : null,
      "A.3":                  R(12,                          "Site office allotment (standard residential)"),
      "A.4":                  R(1,                           "1 lump sum"),
      // B — Earthworks (always anchored to foundationVol — cascaded or direct)
      "B.1": foundationVol > 0 ? R(round1(foundationVol * 2.5), "Galian ≈ footing × 2.5" + tag(inp.fvSrc)) : null,
      "B.2": foundationVol > 0 ? R(round1(foundationVol * 1.0), "Urugan kembali ≈ footing × 1.0" + tag(inp.fvSrc)) : null,
      "B.3": floorArea > 0 ? R(round1(floorArea * 0.05),    "Urugan pasir = 5 cm × footprint" + tag(inp.floorAreaSrc)) : null,
      "B.4": floorArea > 0 ? R(round1(floorArea),           "Pemadatan tanah = footprint" + tag(inp.floorAreaSrc)) : null,
      // C — Foundation extras
      // Pondasi batu kali (stone) and footplat (concrete) are mutually
      // exclusive. We only suggest stone foundation when no footplat was
      // detected directly from the Foundation Schedule.
      "C.1": (ITEMS.find((x) => x.wbs === "C.2") || {}).vol > 0 ? null
        : (perimeter > 0 ? R(round1(perimeter * 0.3),
            "Pondasi batu kali ≈ perimeter × 0.3 m² (trapesium bawah 60/atas 30/tinggi 60–70 cm)" + tag(inp.periSrc)) : null),
      "C.3": foundationVol > 0 ? R(round1(foundationVol * 0.15), "Lantai kerja = 15% volume footing" + tag(inp.fvSrc)) : null,
      // D — Steel & formwork (cascade through concreteVol)
      "D.2": concreteVol > 0 ? R(roundInt(concreteVol * 120),"Pembesian ≈ 120 kg/m³ beton" + tag(inp.cvSrc)) : null,
      "D.3": concreteVol > 0 ? R(round1(concreteVol * 8),    "Bekisting ≈ 8 m²/m³ beton" + tag(inp.cvSrc)) : null,
      // E — Architecture
      "E.2": wallArea > 0 ? R(round1(wallArea * 2),          "Plesteran = 2 sisi × area dinding" + tag(inp.waSrc)) : null,
      "E.4": wallArea > 0 ? R(round1(wallArea * 0.15),       "Keramik KM/WC ≈ 15% area dinding" + tag(inp.waSrc)) : null,
      "E.5": buildingArea > 0 ? R(round1(buildingArea),      "Plafon = luas bangunan" + tag(inp.baSrc)) : null,
      "E.6": buildingArea > 0 ? R(roundInt(buildingArea / 25), "Pintu+jendela ≈ 1 per 25 m²" + tag(inp.baSrc)) : null,
      // F — Roof
      "F.1": floorArea > 0 ? R(round1(floorArea * 1.15),     "Rangka atap = footprint × 1.15 (overhang)" + tag(inp.floorAreaSrc)) : null,
      "F.2": floorArea > 0 ? R(round1(floorArea * 1.15),     "Penutup atap = footprint × 1.15" + tag(inp.floorAreaSrc)) : null,
      "F.3": perimeter > 0 ? R(round1(perimeter),            "Lisplang & talang = perimeter" + tag(inp.periSrc)) : null,
      // G — MEP
      "G.1": buildingArea > 0 ? R(roundInt(buildingArea / 7),  "Titik listrik ≈ 1 per 7 m²" + tag(inp.baSrc)) : null,
      "G.2": buildingArea > 0 ? R(roundInt(buildingArea / 25), "Air bersih ≈ 1 titik per 25 m²" + tag(inp.baSrc)) : null,
      "G.3": buildingArea > 0 ? R(roundInt(buildingArea / 30), "Air kotor ≈ 1 titik per 30 m²" + tag(inp.baSrc)) : null,
      "G.4": buildingArea > 0 ? R(Math.max(2, roundInt(buildingArea / 40)), "Sanitair ≈ 1 per 40 m² (min 2)" + tag(inp.baSrc)) : null,
      // H — Finishing
      "H.1": wallArea > 0 ? R(round1(wallArea * 1.6),         "Cat interior ≈ area dinding × 1.6" + tag(inp.waSrc)) : null,
      "H.2": wallArea > 0 ? R(round1(wallArea * 0.5),         "Cat eksterior ≈ area dinding × 0.5 (luar)" + tag(inp.waSrc)) : null,
      "H.3": buildingArea > 0 ? R(round1(buildingArea),       "Cat plafon = luas bangunan" + tag(inp.baSrc)) : null,
      "H.4": buildingArea > 0 ? R(round1(buildingArea),       "Pembersihan akhir = luas bangunan" + tag(inp.baSrc)) : null,
    };
    return rules[wbs] || null;
  }

  /* Apply a single analyzed value (or a batch) and record in BIM_STORE so the
     UI can mark which WBS came from the analyser instead of an uploaded file. */
  function applyAnalysis(map) {
    const updates = {};
    Object.entries(map).forEach(([wbs, payload]) => {
      if (!payload) return;
      const it = ITEMS.find((x) => x.wbs === wbs);
      if (!it) return;
      it.vol = Number(payload.vol) || 0;
      updates[wbs] = payload.basis;
    });
    window.BIM_STORE = window.BIM_STORE || {};
    window.BIM_STORE.aiEstimated = window.BIM_STORE.aiEstimated || {};
    Object.assign(window.BIM_STORE.aiEstimated, updates);
    refresh();
    if (window.emitBimStoreChange) window.emitBimStoreChange();
  }

  function analyzeAllMissing() {
    const out = {};
    ITEMS.forEach((it) => {
      if (it.vol > 0) return;                                   // already filled
      if (getApplicabilityNote(it.wbs)) return;                 // not applicable
      const r = analyzeWbs(it.wbs);
      if (r) out[it.wbs] = r;
    });
    applyAnalysis(out);
    return Object.keys(out).length;
  }

  /* When a WBS is genuinely not applicable to the detected structural system
     (e.g. C.1 stone foundation when the Foundation Schedule shows footplat
     beton instead), return a short human-readable explanation. The UI uses
     this to render an "N/A" pill instead of "Data tidak ada", so users
     don't keep wondering why the Analyse button is missing. */
  function getApplicabilityNote(wbs) {
    const getVol = (w) => (ITEMS.find((it) => it.wbs === w) || { vol: 0 }).vol;
    if (wbs === "C.1" && getVol("C.2") > 0) {
      return "Footplat beton terdeteksi dari Foundation Schedule — sistem pondasi batu kali tidak digunakan.";
    }
    return null;
  }

  window.BIM_CALC = {
    buildModel, ahspCalc, MODELS,
    refresh, updateVolumes, setVolumes, clearAll, totalVolume, templateRows,
    updateProject, resetProject,
    analyzeWbs, applyAnalysis, analyzeAllMissing, getApplicabilityNote,
    // legacy alias kept for any older caller
    revitRows: templateRows,
    restoreDefaults: clearAll,
  };
})();
