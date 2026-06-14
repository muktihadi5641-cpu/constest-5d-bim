/* i18n dictionary — Indonesian (id) · English (en) · 繁體中文 (zh) */
(function () {
  "use strict";
  const T = {
    appTitle:   { id: "Estimasi Konstruksi 5D BIM", en: "5D BIM Construction Estimation", zh: "5D BIM 建築估算" },
    appSub:     { id: "Integrasi Volume · Biaya · Jadwal — Revit", en: "Integrated Quantity · Cost · Schedule — Revit", zh: "工程量 · 成本 · 進度 一體化 — Revit" },

    // main menus
    menu_overview: { id: "Overview",          en: "Overview",            zh: "概覽" },
    menu_id:       { id: "Standar Indonesia", en: "Indonesian Standard", zh: "印尼標準" },
    menu_tw:       { id: "Standar Taiwan",    en: "Taiwan Standard",     zh: "臺灣標準" },
    menu_guide:    { id: "Panduan",           en: "Guide",               zh: "指南" },

    // sub-tabs within a standard
    sub_ahsp:     { id: "Harga Satuan",  en: "Unit Price",   zh: "單價分析" },
    sub_rab:      { id: "RAB / BoQ",     en: "Budget (BoQ)", zh: "預算書" },
    sub_schedule: { id: "Jadwal",        en: "Schedule",     zh: "進度表" },
    sub_scurve:   { id: "Kurva S",       en: "S-Curve",      zh: "進度曲線" },

    settings:   { id: "Pengaturan", en: "Settings", zh: "設定" },
    language:   { id: "Bahasa",     en: "Language", zh: "語言" },

    // 3D / overview
    ov_model:       { id: "Model 3D BIM (Revit)",   en: "3D BIM Model (Revit)",  zh: "3D BIM 模型 (Revit)" },
    ov_modelHint:   { id: "Tarik untuk memutar · scroll untuk zoom · klik kanan untuk geser",
                      en: "Drag to rotate · scroll to zoom · right-drag to pan",
                      zh: "拖曳旋轉 · 滾輪縮放 · 右鍵平移" },
    ov_layers:      { id: "Layer",          en: "Layers",       zh: "圖層" },
    ov_structure:   { id: "Struktur",       en: "Structure",    zh: "結構" },
    ov_architecture:{ id: "Arsitektur",     en: "Architecture", zh: "建築裝修" },
    ov_walls:       { id: "Dinding",        en: "Walls",        zh: "牆體" },
    ov_stair:       { id: "Tangga",         en: "Stairs",       zh: "樓梯" },
    ov_roof:        { id: "Atap",           en: "Roof",         zh: "屋頂" },
    ov_wireframe:   { id: "Wireframe",      en: "Wireframe",    zh: "線框模式" },
    ov_axes:        { id: "Sumbu X Y Z",    en: "Axes",         zh: "座標軸" },
    ov_grid:        { id: "Grid",           en: "Grid",         zh: "格線" },
    ov_resetView:   { id: "Reset Tampilan", en: "Reset View",   zh: "重設視角" },
    ov_autoRotate:  { id: "Putar Otomatis", en: "Auto-rotate",  zh: "自動旋轉" },
    ov_loading:     { id: "Memuat model IFC…", en: "Loading IFC model…", zh: "載入 IFC 模型中…" },
    ov_loadFail:    { id: "Gagal memuat IFC",  en: "Failed to load IFC", zh: "IFC 載入失敗" },
    ov_ifcLoaded:   { id: "Model IFC asli (Revit)", en: "Real IFC model (Revit)", zh: "真實 IFC 模型 (Revit)" },
    ov_dropTitle:   { id: "Pilih file IFC dari Revit", en: "Choose an IFC file from Revit", zh: "選擇 Revit 匯出的 IFC 檔" },
    ov_dropHint:    { id: "Drag & drop file .ifc ke sini, atau klik tombol di bawah",
                      en: "Drag & drop a .ifc file here, or click the button below",
                      zh: "將 .ifc 檔案拖放至此,或點擊下方按鈕" },
    ov_chooseFile:  { id: "Pilih File IFC",  en: "Choose IFC File", zh: "選擇 IFC 檔" },
    ov_changeFile:  { id: "Ganti File",      en: "Change File",     zh: "更換檔案" },
    ov_clearFile:   { id: "Hapus File",      en: "Remove File",     zh: "移除檔案" },
    ov_elements:    { id: "elemen",          en: "elements",        zh: "個元件" },
    ov_compare:     { id: "Perbandingan 2 Standar", en: "Two-Standard Comparison", zh: "兩標準比較" },
    ov_projectInfo: { id: "Informasi Proyek", en: "Project Information", zh: "專案資訊" },
    ov_totalCost:   { id: "Total Anggaran",  en: "Total Budget",  zh: "預算總額" },
    ov_duration:    { id: "Durasi",          en: "Duration",      zh: "工期" },
    ov_costM2:      { id: "Biaya per m²",    en: "Cost per m²",   zh: "每平方公尺成本" },
    ov_items:       { id: "Item Pekerjaan",  en: "Work Items",    zh: "工程項目" },
    ov_weeks:       { id: "minggu",          en: "weeks",         zh: "週" },
    ov_days:        { id: "hari",            en: "days",          zh: "天" },
    ov_floors:      { id: "Jumlah Lantai",   en: "Floors",        zh: "樓層數" },
    ov_area:        { id: "Luas Bangunan",   en: "Building Area", zh: "建築面積" },
    ov_landArea:    { id: "Luas Tanah",      en: "Land Area",     zh: "土地面積" },
    ov_source:      { id: "Sumber Volume",   en: "Quantity Source", zh: "工程量來源" },
    ov_basis:       { id: "Dasar Harga",     en: "Price Basis",     zh: "單價依據" },
    ov_openStd:     { id: "Buka detail",     en: "Open details",    zh: "查看明細" },
    ov_revitItems:  { id: "Volume dari Revit", en: "Quantities from Revit", zh: "Revit 工程量" },
    ov_modelNote:   { id: "Geometri dimuat langsung dari file IFC (ekspor Revit Anda) memakai mesin web-ifc. Putar, zoom, dan geser untuk memeriksa rangka struktur, dinding, dan tangga.",
                      en: "Geometry is loaded directly from your IFC file (Revit export) via the web-ifc engine. Rotate, zoom and pan to inspect the structural frame, walls and stair.",
                      zh: "幾何模型透過 web-ifc 引擎直接從您的 IFC 檔 (Revit 匯出) 載入。旋轉、縮放、平移以檢視結構框架、牆體與樓梯。" },

    // ahsp
    ahsp_title:   { id: "Analisa Harga Satuan", en: "Unit-Price Analysis", zh: "單價分析" },
    ahsp_descId:  { id: "Harga Satuan disusun dari koefisien Bahan, Upah (dan Alat) × harga dasar, lalu ditambah Overhead & Keuntungan 10%.",
                    en: "Each unit price is built from Material, Labour (and Equipment) coefficients × base prices, plus 10% Overhead & Profit.",
                    zh: "單價由材料、人工 (及機具) 係數 × 基本單價組成,再加 10% 管理費與利潤。" },
    ahsp_descTw:  { id: "單價分析: Harga Satuan langsung dari 材料 (bahan), 人工 (upah), 機具 (alat). Biaya tak langsung dihitung di tingkat proyek.",
                    en: "單價分析: a direct unit price from 材料 (material), 人工 (labour), 機具 (equipment). Indirect costs are added at project level.",
                    zh: "單價分析:直接單價由材料、人工、機具構成。間接費用於專案層級另計。" },
    ahsp_component:{ id: "Komponen",  en: "Component",   zh: "項目" },
    ahsp_coef:    { id: "Koefisien",  en: "Coefficient", zh: "係數" },
    ahsp_unit:    { id: "Satuan",     en: "Unit",        zh: "單位" },
    ahsp_price:   { id: "Harga",      en: "Price",       zh: "單價" },
    ahsp_amount:  { id: "Jumlah",     en: "Amount",      zh: "金額" },
    ahsp_subtotal:{ id: "Subtotal",   en: "Subtotal",    zh: "小計" },
    ahsp_ohp:     { id: "Overhead & Keuntungan", en: "Overhead & Profit", zh: "管理費與利潤" },
    ahsp_unitPrice:{ id: "Harga Satuan",          en: "Unit Price",        zh: "單價" },
    ahsp_direct:  { id: "Harga Satuan Langsung", en: "Direct Unit Price", zh: "直接單價" },

    // rab
    rab_title:    { id: "Rencana Anggaran Biaya (BoQ)", en: "Bill of Quantities (RAB)", zh: "預算書 (BoQ)" },
    rab_descId:   { id: "Volume × Harga Satuan = Total. Bobot (%) tiap item menjadi dasar Kurva S.",
                    en: "Volume × Unit Price = Total. Each item's Weight (%) drives the S-curve.",
                    zh: "工程量 × 單價 = 總價。各項目權重 (%) 為進度曲線之基礎。" },
    rab_wbs:      { id: "WBS",            en: "WBS",          zh: "WBS" },
    rab_desc:     { id: "Uraian Pekerjaan", en: "Work Description", zh: "工程項目" },
    rab_unit:     { id: "Satuan",        en: "Unit",          zh: "單位" },
    rab_vol:      { id: "Volume",        en: "Volume",        zh: "工程量" },
    rab_unitPrice:{ id: "Harga Satuan",  en: "Unit Price",    zh: "單價" },
    rab_total:    { id: "Total Harga",   en: "Total",         zh: "總價" },
    rab_weight:   { id: "Bobot",         en: "Weight",        zh: "權重" },
    rab_subtotal: { id: "Subtotal",      en: "Subtotal",      zh: "小計" },
    rab_directTotal:{ id: "Jumlah Biaya Langsung", en: "Total Direct Cost", zh: "工程直接費小計" },
    rab_grandtotal:{ id: "TOTAL PROYEK", en: "PROJECT TOTAL", zh: "預算總額" },
    rab_revit:    { id: "Revit",         en: "Revit",         zh: "Revit" },
    rab_recap:    { id: "Rekapitulasi & Markup", en: "Recap & Markup", zh: "總計與加價" },

    // schedule
    sch_title:    { id: "Jadwal Pelaksanaan & Durasi", en: "Work Schedule & Duration", zh: "施工進度表與工期" },
    sch_desc:     { id: "Durasi dihitung dari produktivitas regu kerja; urutan mengikuti hubungan predecessor (FS).",
                    en: "Durations derive from crew productivity; sequence follows predecessor (FS) links.",
                    zh: "工期依班組生產率計算;順序依前置作業 (完成-開始 FS) 關係。" },
    sch_item:     { id: "Uraian",       en: "Description", zh: "工項" },
    sch_durW:     { id: "Durasi",       en: "Duration",    zh: "工期" },
    sch_start:    { id: "Mulai",        en: "Start",       zh: "開始" },
    sch_finish:   { id: "Selesai",      en: "Finish",      zh: "完成" },
    sch_pred:     { id: "Predecessor",  en: "Predecessor", zh: "前置作業" },
    sch_week:     { id: "M",            en: "W",           zh: "週" },
    sch_weekFull: { id: "Minggu",       en: "Week",        zh: "週" },
    sch_gantt:    { id: "Bagan Gantt",  en: "Gantt Chart", zh: "甘特圖" },
    sch_wk:       { id: "mg",           en: "wk",          zh: "週" },
    sch_pkg:      { id: "Paket Pekerjaan (WBS)", en: "Work Packages (WBS)", zh: "工程項目 (WBS)" },
    sch_assume:   { id: "Asumsi & Logika", en: "Assumptions & Logic", zh: "假設與邏輯" },
    sch_total:    { id: "Total Durasi Proyek", en: "Total Project Duration", zh: "專案總工期" },

    // s-curve
    sc_title:     { id: "Kurva S — Rencana Progres Kumulatif", en: "S-Curve — Planned Cumulative Progress", zh: "進度曲線 — 累積進度計畫" },
    sc_desc:      { id: "Bobot biaya tiap pekerjaan disebar merata sepanjang durasinya, lalu diakumulasi per minggu.",
                    en: "Each item's cost weight is spread over its duration, then accumulated per week.",
                    zh: "各工項之成本權重均勻分布於工期,再逐週累積。" },
    sc_chart:     { id: "Grafik Kurva S (Rencana)", en: "S-Curve Chart (Plan)", zh: "進度曲線圖 (計畫)" },
    sc_weekly:    { id: "Rencana / Minggu",  en: "Plan / Week",  zh: "週進度" },
    sc_cumulative:{ id: "Kumulatif",         en: "Cumulative",   zh: "累積進度" },
    sc_table:     { id: "Tabel Distribusi Bobot", en: "Weight Distribution Table", zh: "權重分配表" },
    sc_planCum:   { id: "Rencana Kumulatif", en: "Cumulative Plan", zh: "累積計畫" },

    // overview cost-by-wbs
    ov_costByWbs: { id: "Distribusi Biaya per WBS", en: "Cost Distribution by WBS", zh: "WBS 成本分布" },

    // guide
    g_title:      { id: "Panduan: Memahami Estimasi Konstruksi 5D", en: "Guide: Understanding 5D Construction Estimation", zh: "指南:理解 5D 建築估算" },
    g_intro:      { id: "Bingung dengan angka di tab lain? Ikuti 7 langkah ini dari nol — bahasa sederhana, lengkap dengan rumus dan contoh.",
                    en: "Confused by the numbers in other tabs? Follow these 7 steps from zero — plain language, with formulas and examples.",
                    zh: "對其他頁面的數字感到困惑?從零開始跟著這 7 個步驟 — 淺顯易懂,附公式與範例。" },
    g_what:       { id: "Apa ini?",       en: "What is it?",       zh: "這是什麼?" },
    g_why:        { id: "Kenapa penting?", en: "Why it matters",   zh: "為何重要?" },
    g_formula:    { id: "Rumus",          en: "Formula",           zh: "公式" },
    g_example:    { id: "Contoh",         en: "Example",           zh: "範例" },
    g_seeTab:     { id: "Lihat di",       en: "See it in",         zh: "查看於" },
    g_step:       { id: "Langkah",        en: "Step",              zh: "步驟" },
    g_dim:        { id: "Dimensi",        en: "Dimension",         zh: "維度" },
    g_deepKicker: { id: "Mendalam",       en: "Deep Dive",         zh: "深入解析" },
    g_deepTitle:  { id: "Anatomi Angka — Dari Mana Datangnya?",
                    en: "Anatomy of the Numbers — Where Do They Come From?",
                    zh: "數字解析 — 它們從哪裡來?" },
    g_deepDesc:   { id: "Buka satu per satu. Tiap kartu menjawab satu pertanyaan yang sering ditanyakan orang yang baru pertama kali membaca AHSP, RAB, jadwal Gantt, dan Kurva S — dengan rumus, contoh nyata dari proyek ini, dan catatan ringan supaya tidak bingung.",
                    en: "Open them one by one. Each card answers a question newcomers ask the first time they read an AHSP, a BoQ, a Gantt chart, or an S-curve — with the formula, a real example from this project, and a friendly note so it actually makes sense.",
                    zh: "逐一展開。每張卡片回答初次閱讀單價分析、預算書、甘特圖、進度曲線時最常見的問題 — 附公式、本專案實例與輕鬆的補充說明。" },

    // Revit data import
    imp_title:    { id: "Data dari Revit", en: "Data from Revit", zh: "Revit 資料" },
    imp_desc_multi: { id: "Drop satu atau beberapa file Schedule mentah dari Revit (.csv atau .xlsx) sekaligus — Foundation, Column, Framing, Floor, Wall. Volume otomatis dipetakan ke WBS dan dihitung di RAB, Jadwal & Kurva-S.",
                    en: "Drop one or more raw Revit Schedule files (.csv or .xlsx) at once — Foundation, Column, Framing, Floor, Wall. Volumes are auto-mapped to WBS and reflected in BoQ, Schedule & S-Curve.",
                    zh: "可一次拖放多個 Revit 明細表原始檔 (.csv 或 .xlsx) — 基礎、柱、樑、樓板、牆。工程量自動對應 WBS 並反映於預算書、進度表與進度曲線。" },
    imp_drop_title: { id: "Drop file Revit di sini, atau klik untuk pilih", en: "Drop Revit files here, or click to pick", zh: "將 Revit 檔拖放於此,或點擊選擇" },
    imp_drop_sub:   { id: ".csv / .xlsx · banyak file sekaligus", en: ".csv / .xlsx · multiple files at once", zh: ".csv / .xlsx · 可同時多檔" },
    imp_multi_hint: { id: "Hapus file dari daftar untuk mencabut kontribusinya secara otomatis.",
                      en: "Remove a file from the list to automatically subtract its contribution.",
                      zh: "從清單移除檔案會自動扣除其貢獻量。" },
    imp_applied_totals: { id: "Total per WBS (gabungan dari semua file):", en: "Total per WBS (across all files):", zh: "各 WBS 合計 (所有檔案合併):" },
    imp_unknown_type:   { id: "Tipe schedule tidak dikenali — file dilewati.", en: "Unknown schedule type — file skipped.", zh: "明細表類型無法辨識 — 已略過該檔案。" },
    imp_download: { id: "Unduh Template CSV", en: "Download CSV Template", zh: "下載 CSV 範本" },
    imp_clear:    { id: "Hapus Semua",        en: "Clear All",             zh: "全部清除" },

    // Empty state (no data uploaded yet)
    empty_title:  { id: "Belum ada data proyek", en: "No project data yet", zh: "尚無專案資料" },
    empty_desc:   { id: "Unggah file Revit (.xlsx atau .csv) di atas untuk mulai. RAB, Jadwal, dan Kurva-S akan terisi otomatis.",
                    en: "Upload a Revit file (.xlsx or .csv) above to begin. BoQ, Schedule, and S-Curve will populate automatically.",
                    zh: "於上方上傳 Revit 檔 (.xlsx 或 .csv) 即可開始。預算書、進度表、進度曲線將自動填入。" },

    // misc
    note:         { id: "Catatan", en: "Note", zh: "備註" },
    exampleNote:  { id: "Volume & harga adalah contoh untuk latihan (PBL). Ganti dengan data proyek Anda di data.js.",
                    en: "Volumes & prices are example PBL figures. Replace with your project data in data.js.",
                    zh: "工程量與單價為教學範例 (PBL)。請於 data.js 替換為您的專案資料。" },
    vs:           { id: "vs", en: "vs", zh: "對比" },
  };

  function t(key, lang) {
    const e = T[key]; if (!e) return key;
    if (lang === "zh") return e.zh || e.en || e.id;
    if (lang === "en") return e.en || e.id;
    return e.id;
  }
  // Pick a localized field from an object that may have id/en/zh
  // variants (or *Id/*En/*Zh — used for inline data in JSX).
  function pick(obj, lang, baseId, baseEn, baseZh) {
    if (!obj) return "";
    if (baseId !== undefined) {
      if (lang === "zh") return obj[baseZh] || obj[baseEn] || obj[baseId];
      if (lang === "en") return obj[baseEn] || obj[baseId];
      return obj[baseId];
    }
    if (lang === "zh") return obj.zh || obj.en || obj.id;
    if (lang === "en") return obj.en || obj.id;
    return obj.id;
  }
  window.I18N = { T, t, pick };
})();
