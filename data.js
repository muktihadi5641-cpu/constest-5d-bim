/* =====================================================================
   5D BIM — Construction Estimation Data  (2 standards: Indonesia & Taiwan)
   Rumah Tinggal 2 Lantai — Volume QTO: Autodesk Revit
   Example/reference figures for a Project-Based-Learning exercise.
   ===================================================================== */
(function () {
  "use strict";

  // PROJECT starts empty — populated automatically from uploaded IFC
  // (storey count + building name) and Floor Schedule CSV (gross floor area).
  // See calc.js → updateProject + revit_import.jsx / model3d.jsx callers.
  const PROJECT = {
    code: "",
    nameId: "", nameEn: "", nameZh: "",
    buildingArea: 0, landArea: 0, floors: 0,
  };

  const FX = { idrPerTwd: 500 }; // indicative, for the comparison note only

  const GROUPS = [
    { code: "A", id: "Pekerjaan Persiapan",       en: "Site Preparation",         zh: "整地工程",       fromRevit: false },
    { code: "B", id: "Pekerjaan Tanah & Galian",  en: "Earthworks",               zh: "土方與開挖",     fromRevit: false },
    { code: "C", id: "Pekerjaan Pondasi",         en: "Foundation",               zh: "基礎工程",       fromRevit: true  },
    { code: "D", id: "Struktur Beton & Tulangan", en: "Concrete & Reinforcement", zh: "混凝土結構與鋼筋", fromRevit: true  },
    { code: "E", id: "Pekerjaan Arsitektur",      en: "Architecture",             zh: "裝修工程",       fromRevit: true  },
    { code: "F", id: "Pekerjaan Atap",            en: "Roofing",                  zh: "屋頂工程",       fromRevit: false },
    { code: "G", id: "Pekerjaan MEP",             en: "MEP (Mech/Elec/Plumb)",    zh: "機電水電",       fromRevit: false },
    { code: "H", id: "Finishing & Pengecatan",    en: "Finishing & Painting",     zh: "粉飾與油漆",     fromRevit: false },
  ];

  // Shared volumes (one Revit model). idr = unit price incl. OHP (AHSP basis);
  // twd = DIRECT unit price (Taiwan markup applied at project level).
  // startW/endW = Indonesia plan weeks (Taiwan schedule is scaled in calc.js).
  const ITEMS = [
    { wbs: "A.1", id: "Pembersihan & perataan lahan", en: "Site clearing & levelling",  zh: "整地與清理",       unit: "m²", uEn: "m²", vol: 0,  idr: 25000,   twd: 110,   startW: 1,  endW: 1 },
    { wbs: "A.2", id: "Pemasangan bouwplank",         en: "Setting-out / batter board", zh: "放樣與基準樁",     unit: "m'", uEn: "m",  vol: 0,   idr: 95000,   twd: 300,   startW: 1,  endW: 1 },
    { wbs: "A.3", id: "Direksi keet & gudang",        en: "Site office & store",        zh: "工務所與倉庫",     unit: "m²", uEn: "m²", vol: 0,   idr: 850000,  twd: 2650,  startW: 1,  endW: 2 },
    { wbs: "A.4", id: "Air & listrik kerja",          en: "Site water & power",         zh: "施工用水電",       unit: "ls", uEn: "ls", vol: 0,    idr: 4500000, twd: 16500, startW: 1,  endW: 2 },

    { wbs: "B.1", id: "Galian tanah pondasi",         en: "Foundation excavation",      zh: "基礎開挖",         unit: "m³", uEn: "m³", vol: 0,   idr: 95000,   twd: 800,   startW: 2,  endW: 3 },
    { wbs: "B.2", id: "Urugan tanah kembali",         en: "Backfilling",                zh: "回填土",           unit: "m³", uEn: "m³", vol: 0,   idr: 65000,   twd: 450,   startW: 4,  endW: 4 },
    { wbs: "B.3", id: "Urugan pasir bawah pondasi",   en: "Sand bedding",               zh: "基礎底砂層",       unit: "m³", uEn: "m³", vol: 0,    idr: 285000,  twd: 1150,  startW: 3,  endW: 3 },
    { wbs: "B.4", id: "Pemadatan tanah",              en: "Soil compaction",            zh: "土壤壓實",         unit: "m²", uEn: "m²", vol: 0,   idr: 45000,   twd: 260,   startW: 2,  endW: 2 },

    { wbs: "C.1", id: "Pondasi batu kali",            en: "Stone masonry foundation",   zh: "卵石基礎",         unit: "m³", uEn: "m³", vol: 0,   idr: 985000,  twd: 3900,  startW: 3,  endW: 4 },
    { wbs: "C.2", id: "Pondasi footplat beton",       en: "Concrete footing",           zh: "混凝土獨立基腳",   unit: "m³", uEn: "m³", vol: 0,  idr: 1320000, twd: 5300,  startW: 3,  endW: 4 },
    { wbs: "C.3", id: "Lantai kerja (lean concrete)", en: "Lean concrete blinding",     zh: "墊層混凝土",       unit: "m³", uEn: "m³", vol: 0,  idr: 1050000, twd: 4500,  startW: 3,  endW: 3 },

    { wbs: "D.1", id: "Beton struktur K-225",         en: "Structural concrete K-225",  zh: "結構混凝土 fc'210", unit: "m³", uEn: "m³", vol: 0, idr: 1320000, twd: 5609,  startW: 4,  endW: 9, ahsp: true },
    { wbs: "D.2", id: "Pembesian besi ulir & polos",  en: "Reinforcement steel bars",   zh: "鋼筋 (竹節與光圓)", unit: "kg", uEn: "kg", vol: 0, idr: 18800,   twd: 42,    startW: 4,  endW: 9, ahsp: true },
    { wbs: "D.3", id: "Bekisting multipleks",         en: "Plywood formwork",           zh: "夾板模板",         unit: "m²", uEn: "m²", vol: 0,  idr: 192000,  twd: 920,   startW: 4,  endW: 9 },

    { wbs: "E.1", id: "Dinding bata merah ½ bata",    en: "Half-brick masonry wall",    zh: "½B 紅磚牆",        unit: "m²", uEn: "m²", vol: 0,  idr: 160000,  twd: 1469,  startW: 8,  endW: 11, ahsp: true },
    { wbs: "E.2", id: "Plesteran dinding 1:4",        en: "Wall plastering 1:4",        zh: "牆面粉刷 1:4",     unit: "m²", uEn: "m²", vol: 0,  idr: 85000,   twd: 660,   startW: 9,  endW: 13, ahsp: true },
    { wbs: "E.3", id: "Keramik lantai 60×60",         en: "Floor tiling 60×60",         zh: "地磚 60×60",       unit: "m²", uEn: "m²", vol: 0,  idr: 245000,  twd: 1750,  startW: 11, endW: 14 },
    { wbs: "E.4", id: "Keramik dinding KM/WC",        en: "Wall tiling (wet areas)",    zh: "衛浴壁磚",         unit: "m²", uEn: "m²", vol: 0,   idr: 215000,  twd: 1550,  startW: 12, endW: 14 },
    { wbs: "E.5", id: "Plafon gypsum + rangka hollow",en: "Gypsum ceiling w/ frame",    zh: "矽酸鈣天花 + 輕鋼架", unit: "m²", uEn: "m²", vol: 0,  idr: 175000,  twd: 1200,  startW: 11, endW: 13 },
    { wbs: "E.6", id: "Kusen, pintu & jendela alum.", en: "Aluminium doors & windows",  zh: "鋁門窗",           unit: "unit",uEn: "unit",vol: 0,  idr: 2450000, twd: 11500, startW: 12, endW: 15 },

    { wbs: "F.1", id: "Rangka atap baja ringan",      en: "Light-steel roof truss",     zh: "輕鋼屋架",         unit: "m²", uEn: "m²", vol: 0,   idr: 185000,  twd: 1300,  startW: 9,  endW: 10 },
    { wbs: "F.2", id: "Penutup atap genteng metal",   en: "Metal roof covering",        zh: "金屬屋面瓦",       unit: "m²", uEn: "m²", vol: 0,   idr: 145000,  twd: 1050,  startW: 10, endW: 12 },
    { wbs: "F.3", id: "Lisplang & talang",            en: "Fascia & gutter",            zh: "屋簷板與雨水槽",   unit: "m'", uEn: "m",  vol: 0,   idr: 125000,  twd: 820,   startW: 11, endW: 12 },

    { wbs: "G.1", id: "Titik lampu & stop kontak",    en: "Electrical points",          zh: "燈具與插座出線",   unit: "titik",uEn:"point",vol: 0, idr: 285000,  twd: 1550,  startW: 10, endW: 15 },
    { wbs: "G.2", id: "Instalasi air bersih",         en: "Clean-water plumbing",       zh: "給水管路",         unit: "titik",uEn:"point",vol: 0, idr: 425000,  twd: 2250,  startW: 10, endW: 13 },
    { wbs: "G.3", id: "Instalasi air kotor",          en: "Sewage plumbing",            zh: "排水管路",         unit: "titik",uEn:"point",vol: 0, idr: 485000,  twd: 2500,  startW: 10, endW: 13 },
    { wbs: "G.4", id: "Sanitair (closet, wastafel)",  en: "Sanitary fixtures",          zh: "衛浴設備 (馬桶 / 面盆)", unit: "unit",uEn: "unit", vol: 0,  idr: 1850000, twd: 8900,  startW: 14, endW: 16 },

    { wbs: "H.1", id: "Pengecatan dinding interior",  en: "Interior wall painting",     zh: "室內牆面油漆",     unit: "m²", uEn: "m²", vol: 0,  idr: 45000,   twd: 350,   startW: 14, endW: 17 },
    { wbs: "H.2", id: "Pengecatan dinding eksterior", en: "Exterior wall painting",     zh: "外牆油漆",         unit: "m²", uEn: "m²", vol: 0,  idr: 55000,   twd: 420,   startW: 15, endW: 17 },
    { wbs: "H.3", id: "Pengecatan plafon",            en: "Ceiling painting",           zh: "天花油漆",         unit: "m²", uEn: "m²", vol: 0,  idr: 42000,   twd: 330,   startW: 14, endW: 16 },
    { wbs: "H.4", id: "Pembersihan akhir",            en: "Final cleaning",             zh: "完工清潔",         unit: "m²", uEn: "m²", vol: 0,  idr: 18000,   twd: 130,   startW: 17, endW: 18 },
  ];

  // ---- Standard configurations -----------------------------------------
  const STANDARDS = {
    id: {
      key: "id", cur: "idr", curSym: "Rp", flag: "ID",
      nameId: "Standar Indonesia", nameEn: "Indonesian Standard", nameZh: "印尼標準",
      basisId: "AHSP / SNI — Permen PUPR", basisEn: "AHSP / SNI — PUPR Regulation", basisZh: "AHSP / SNI — PUPR 部規",
      accent: "var(--blue)", accentSoft: "var(--blue-soft)", accentInk: "var(--blue-ink)",
      totalWeeks: 18,
      // Unit price already includes OHP; project adds VAT only.
      markup: [
        { id: "Jumlah Biaya Langsung", en: "Total Direct Cost", zh: "工程直接費小計", type: "base" },
        { id: "PPN (Pajak Pertambahan Nilai)", en: "VAT (Value-Added Tax)", zh: "PPN (加值型營業稅)", pct: 0.11 },
      ],
      markupNoteId: "Overhead & Keuntungan (10%) sudah termasuk di tiap Harga Satuan via AHSP. Di tingkat proyek hanya ditambah PPN 11%.",
      markupNoteEn: "Overhead & Profit (10%) is already embedded in each unit price via AHSP. Only 11% VAT is added at project level.",
      markupNoteZh: "管理費與利潤 (10%) 已透過 AHSP 嵌入各單價。專案層級僅再加 11% PPN。",
    },
    tw: {
      key: "tw", cur: "twd", curSym: "NT$", flag: "TW",
      nameId: "Standar Taiwan", nameEn: "Taiwan Standard", nameZh: "臺灣標準",
      basisId: "單價分析 — 公共工程委員會 (PCC)", basisEn: "Unit-Price Analysis — Public Construction Commission", basisZh: "單價分析 — 行政院公共工程委員會 (PCC)",
      accent: "var(--teal)", accentSoft: "var(--teal-soft)", accentInk: "var(--teal-ink)",
      totalWeeks: 16, // higher mechanisation → shorter
      // Unit price is DIRECT; indirect costs + business tax added at project level.
      markup: [
        { id: "工程直接費 — Biaya Langsung",  en: "工程直接費 — Direct Cost",       zh: "工程直接費", type: "base" },
        { id: "工程管理費 — Biaya Manajemen", en: "Mgmt Overhead (工程管理費)",      zh: "工程管理費", pct: 0.07 },
        { id: "利潤 — Keuntungan",            en: "Profit (利潤)",                   zh: "利潤",       pct: 0.05 },
        { id: "品管費 — Kendali Mutu",        en: "Quality Control (品管費)",        zh: "品管費",     pct: 0.01 },
        { id: "環安衛費 — Lingkungan & K3",   en: "Environment & Safety (環安衛)",   zh: "環安衛費",   pct: 0.015 },
        { id: "營業稅 — Pajak Usaha",         en: "Business Tax (營業稅)",           zh: "營業稅",     pct: 0.05, onSubtotal: true },
      ],
      markupNoteId: "單價分析 menghasilkan harga satuan langsung. Biaya tak langsung & pajak usaha 5% ditambah di tingkat proyek (praktik 公共工程).",
      markupNoteEn: "Unit-price analysis gives a direct unit cost. Indirect costs and 5% business tax are added at project level (public-works practice).",
      markupNoteZh: "單價分析產生直接單價。間接費用及 5% 營業稅於專案層級另計 (公共工程慣例)。",
    },
  };

  // ---- AHSP / 單價分析 worked examples ----------------------------------
  // groups: [{ id,en,color, rows:[{id,en,coef,unit,price}] }]
  const AHSP_ID = {
    beton: { wbs: "D.1", id: "Beton Struktur K-225 (1 m³)", en: "Structural Concrete K-225 (1 m³)", zh: "結構混凝土 K-225 (1 m³)", unit: "m³", ohp: 0.10,
      groups: [
        { id: "Bahan", en: "Material", zh: "材料", color: "var(--blue-ink)", rows: [
          { id: "Semen Portland",   en: "Portland cement",   zh: "波特蘭水泥", coef: 371,   unit: "kg", price: 1500 },
          { id: "Pasir beton",      en: "Concrete sand",     zh: "混凝土砂",   coef: 0.499, unit: "m³", price: 285000 },
          { id: "Kerikil / split",  en: "Coarse aggregate",  zh: "粗骨材 / 碎石", coef: 0.776, unit: "m³", price: 320000 },
          { id: "Air",              en: "Water",             zh: "水",         coef: 215,   unit: "ltr", price: 50 },
        ]},
        { id: "Upah", en: "Labour", zh: "人工", color: "var(--teal-ink)", rows: [
          { id: "Pekerja",       en: "Labourer",   zh: "普通工",   coef: 1.650, unit: "OH", price: 110000 },
          { id: "Tukang batu",   en: "Mason",      zh: "技術工 (泥水)", coef: 0.275, unit: "OH", price: 150000 },
          { id: "Kepala tukang", en: "Head mason", zh: "工長",     coef: 0.028, unit: "OH", price: 170000 },
          { id: "Mandor",        en: "Foreman",    zh: "監工",     coef: 0.083, unit: "OH", price: 180000 },
        ]},
      ]},
    besi: { wbs: "D.2", id: "Pembesian Beton (1 kg)", en: "Reinforcement Steel (1 kg)", zh: "鋼筋施作 (1 kg)", unit: "kg", ohp: 0.10,
      groups: [
        { id: "Bahan", en: "Material", zh: "材料", color: "var(--blue-ink)", rows: [
          { id: "Besi beton",    en: "Reinforcing bar", zh: "鋼筋",   coef: 1.050, unit: "kg", price: 14000 },
          { id: "Kawat bendrat", en: "Tie wire",        zh: "綁紮鐵絲", coef: 0.015, unit: "kg", price: 25000 },
        ]},
        { id: "Upah", en: "Labour", zh: "人工", color: "var(--teal-ink)", rows: [
          { id: "Pekerja",       en: "Labourer",   zh: "普通工",   coef: 0.0070, unit: "OH", price: 110000 },
          { id: "Tukang besi",   en: "Steel fixer", zh: "鋼筋工",  coef: 0.0070, unit: "OH", price: 150000 },
          { id: "Kepala tukang", en: "Head fixer",  zh: "工長",    coef: 0.0007, unit: "OH", price: 170000 },
          { id: "Mandor",        en: "Foreman",    zh: "監工",    coef: 0.0004, unit: "OH", price: 180000 },
        ]},
      ]},
    bata: { wbs: "E.1", id: "Dinding Bata Merah ½ Bata 1:4 (1 m²)", en: "Half-brick Wall 1:4 (1 m²)", zh: "½B 紅磚牆 1:4 (1 m²)", unit: "m²", ohp: 0.10,
      groups: [
        { id: "Bahan", en: "Material", zh: "材料", color: "var(--blue-ink)", rows: [
          { id: "Bata merah",   en: "Red brick",      zh: "紅磚",     coef: 70,    unit: "bh", price: 950 },
          { id: "Semen PC",     en: "Cement",         zh: "水泥",     coef: 9.680, unit: "kg", price: 1500 },
          { id: "Pasir pasang", en: "Masonry sand",   zh: "砌築砂",   coef: 0.043, unit: "m³", price: 285000 },
        ]},
        { id: "Upah", en: "Labour", zh: "人工", color: "var(--teal-ink)", rows: [
          { id: "Pekerja",       en: "Labourer",   zh: "普通工",   coef: 0.300, unit: "OH", price: 110000 },
          { id: "Tukang batu",   en: "Mason",      zh: "砌磚工",   coef: 0.100, unit: "OH", price: 150000 },
          { id: "Kepala tukang", en: "Head mason", zh: "工長",     coef: 0.010, unit: "OH", price: 170000 },
          { id: "Mandor",        en: "Foreman",    zh: "監工",     coef: 0.015, unit: "OH", price: 180000 },
        ]},
      ]},
    plester: { wbs: "E.2", id: "Plesteran 1:4 tebal 15 mm (1 m²)", en: "Plastering 1:4, 15 mm (1 m²)", zh: "粉刷 1:4 厚 15 mm (1 m²)", unit: "m²", ohp: 0.10,
      groups: [
        { id: "Bahan", en: "Material", zh: "材料", color: "var(--blue-ink)", rows: [
          { id: "Semen PC", en: "Cement",       zh: "水泥",     coef: 6.240, unit: "kg", price: 1500 },
          { id: "Pasir",    en: "Plaster sand", zh: "粉刷砂",   coef: 0.024, unit: "m³", price: 285000 },
        ]},
        { id: "Upah", en: "Labour", zh: "人工", color: "var(--teal-ink)", rows: [
          { id: "Pekerja",       en: "Labourer",   zh: "普通工",   coef: 0.300, unit: "OH", price: 110000 },
          { id: "Tukang batu",   en: "Plasterer",  zh: "粉刷工",   coef: 0.150, unit: "OH", price: 150000 },
          { id: "Kepala tukang", en: "Head mason", zh: "工長",     coef: 0.015, unit: "OH", price: 170000 },
          { id: "Mandor",        en: "Foreman",    zh: "監工",     coef: 0.015, unit: "OH", price: 180000 },
        ]},
      ]},
  };

  const AHSP_TW = {
    beton: { wbs: "D.1", id: "結構混凝土 — Beton Struktur (1 m³)", en: "Structural Concrete 結構混凝土 (1 m³)", zh: "結構混凝土 (1 m³)", unit: "m³", ohp: 0,
      groups: [
        { id: "材料 Material",  en: "材料 Material",  zh: "材料", color: "var(--blue-ink)", rows: [
          { id: "預拌混凝土 fc'210", en: "Ready-mix concrete fc'210", zh: "預拌混凝土 fc'210", coef: 1.020, unit: "m³", price: 3200 },
          { id: "泵送 Pumping",      en: "Concrete pumping",          zh: "泵送",            coef: 1.000, unit: "m³", price: 380 },
        ]},
        { id: "人工 Labour",   en: "人工 Labour",   zh: "人工", color: "var(--teal-ink)", rows: [
          { id: "技術工 Skilled",   en: "Skilled worker",    zh: "技術工", coef: 0.250, unit: "工", price: 3000 },
          { id: "普通工 Labourer",  en: "General labourer",  zh: "普通工", coef: 0.450, unit: "工", price: 2500 },
        ]},
        { id: "機具 Equipment", en: "機具 Equipment", zh: "機具", color: "var(--amber)", rows: [
          { id: "震動機 Vibrator",   en: "Vibrator",          zh: "震動機", coef: 0.100, unit: "台日", price: 900 },
        ]},
      ]},
    besi: { wbs: "D.2", id: "鋼筋 — Pembesian (1 kg)", en: "Reinforcement Steel 鋼筋 (1 kg)", zh: "鋼筋施作 (1 kg)", unit: "kg", ohp: 0,
      groups: [
        { id: "材料 Material",  en: "材料 Material",  zh: "材料", color: "var(--blue-ink)", rows: [
          { id: "鋼筋 SD420",   en: "Rebar SD420",   zh: "鋼筋 SD420", coef: 1.030, unit: "kg", price: 30 },
          { id: "鐵絲 Tie wire", en: "Tie wire",     zh: "綁紮鐵絲",   coef: 0.012, unit: "kg", price: 35 },
        ]},
        { id: "人工 Labour",   en: "人工 Labour",   zh: "人工", color: "var(--teal-ink)", rows: [
          { id: "鋼筋工 Steel fixer", en: "Steel fixer",      zh: "鋼筋工", coef: 0.0025, unit: "工", price: 3200 },
          { id: "普通工 Labourer",    en: "General labourer", zh: "普通工", coef: 0.0012, unit: "工", price: 2500 },
        ]},
      ]},
    bata: { wbs: "E.1", id: "紅磚牆 — Dinding Bata (1 m²)", en: "Brick Wall 紅磚牆 (1 m²)", zh: "紅磚牆 (1 m²)", unit: "m²", ohp: 0,
      groups: [
        { id: "材料 Material",  en: "材料 Material",  zh: "材料", color: "var(--blue-ink)", rows: [
          { id: "紅磚 Red brick", en: "Red brick", zh: "紅磚", coef: 72,    unit: "塊", price: 6.0 },
          { id: "水泥 Cement",   en: "Cement",   zh: "水泥", coef: 12,    unit: "kg", price: 4.2 },
          { id: "砂 Sand",       en: "Sand",     zh: "砂",   coef: 0.040, unit: "m³", price: 700 },
        ]},
        { id: "人工 Labour",   en: "人工 Labour",   zh: "人工", color: "var(--teal-ink)", rows: [
          { id: "技術工 Mason",       en: "Mason",            zh: "砌磚工", coef: 0.240, unit: "工", price: 3000 },
          { id: "普通工 Labourer",    en: "General labourer", zh: "普通工", coef: 0.110, unit: "工", price: 2500 },
        ]},
      ]},
    plester: { wbs: "E.2", id: "粉刷 — Plesteran (1 m²)", en: "Plastering 粉刷 (1 m²)", zh: "粉刷 (1 m²)", unit: "m²", ohp: 0,
      groups: [
        { id: "材料 Material",  en: "材料 Material",  zh: "材料", color: "var(--blue-ink)", rows: [
          { id: "水泥 Cement", en: "Cement", zh: "水泥",   coef: 7.0,   unit: "kg", price: 4.2 },
          { id: "砂 Sand",     en: "Sand",   zh: "粉刷砂", coef: 0.022, unit: "m³", price: 700 },
        ]},
        { id: "人工 Labour",   en: "人工 Labour",   zh: "人工", color: "var(--teal-ink)", rows: [
          { id: "技術工 Plasterer",   en: "Plasterer",        zh: "粉刷工", coef: 0.150, unit: "工", price: 3000 },
          { id: "普通工 Labourer",    en: "General labourer", zh: "普通工", coef: 0.080, unit: "工", price: 2500 },
        ]},
      ]},
  };

  window.BIM = { PROJECT, FX, GROUPS, ITEMS, STANDARDS, AHSP_ID, AHSP_TW };
})();
