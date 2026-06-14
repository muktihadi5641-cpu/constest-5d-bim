/* guide.jsx — step-by-step learning guide (Panduan), bilingual
   v5: deep-dive section now has a Standard switcher.
       Indonesia and Taiwan are each explained on their own terms
       (SNI/AHSP/OH/HSPK vs PCC/單價分析/工/物價指數) — not as
       diffs from each other. Both reference the SAME Revit BIM
       volumes, but their pricing/markup/schedule processes are
       genuinely different and shown as such. */

const GUIDE_STEPS = [
  {
    dim: "3D", color: "var(--blue)", target: { menu: "overview" },
    titleId: "Pemodelan 3D di Revit", titleEn: "3D Modelling in Revit", titleZh: "Revit 3D 建模",
    whatId: "Bangunan digambar sebagai objek 3D yang “pintar” — setiap dinding, kolom, balok, dan lantai tahu ukuran serta materialnya.",
    whatEn: "The building is drawn as “smart” 3D objects — every wall, column, beam and floor knows its size and material.",
    whatZh: "建物以「智慧」3D 物件繪製 — 每道牆、柱、樑、樓板皆知曉自身的尺寸與材料。",
    whyId: "Model ini menjadi sumber tunggal kebenaran. Kalau model berubah, semua perhitungan di bawahnya ikut berubah otomatis.",
    whyEn: "The model is the single source of truth. Change the model and every calculation below updates automatically.",
    whyZh: "模型即為唯一真實來源。模型一變,下游所有計算自動同步更新。",
    formulaId: "Geometri + Material + Parameter  →  Objek BIM",
    formulaEn: "Geometry + Material + Parameter  →  BIM Object",
    formulaZh: "幾何 + 材料 + 參數  →  BIM 物件",
    exId: "Sebuah kolom 30×30 cm setinggi 3,4 m otomatis menyimpan volume betonnya.",
    exEn: "A 30×30 cm column 3.4 m tall automatically stores its concrete volume.",
    exZh: "一根 30×30 cm、高 3.4 m 的柱會自動儲存其混凝土體積。",
    seeId: "Tab Overview — model 3D", seeEn: "Overview tab — 3D model", seeZh: "概覽分頁 — 3D 模型",
  },
  {
    dim: "QTO", color: "var(--teal)", target: { menu: "overview" },
    titleId: "Quantity Take-Off (Hitung Volume)", titleEn: "Quantity Take-Off", titleZh: "工程量計算 (Quantity Take-Off)",
    whatId: "Revit menjumlahkan sendiri seluruh volume dari model: berapa m³ beton, kg besi, m² dinding, dan seterusnya.",
    whatEn: "Revit sums up all quantities from the model itself: how many m³ of concrete, kg of steel, m² of wall, and so on.",
    whatZh: "Revit 直接從模型加總所有工程量:混凝土 m³、鋼筋 kg、牆面 m² 等等。",
    whyId: "Volume adalah “berapa banyak” pekerjaan. Tanpa volume yang benar, biaya dan waktu pasti meleset.",
    whyEn: "Quantity is the “how much” of the work. Without correct quantities, cost and time will be wrong.",
    whyZh: "工程量是工程的「多少」。沒有正確的工程量,成本與工期必然失準。",
    formulaId: "Σ (volume tiap objek di model)  →  Volume Pekerjaan",
    formulaEn: "Σ (volume of every object in the model)  →  Work Quantity",
    formulaZh: "Σ (模型中每個物件的體積)  →  工程量",
    exId: "Semua kolom + balok + plat + sloof = 32,4 m³ beton struktur (item D.1).",
    exEn: "All columns + beams + slabs + tie-beams = 32.4 m³ of structural concrete (item D.1).",
    exZh: "所有柱 + 樑 + 樓板 + 繫樑 = 32.4 m³ 結構混凝土 (項目 D.1)。",
    seeId: "Kolom “Volume” pada tabel RAB", seeEn: "The “Volume” column in the BoQ table", seeZh: "預算書中的「工程量」欄位",
  },
  {
    dim: "5D", color: "var(--blue)", target: { menu: "id", sub: "ahsp" },
    titleId: "Analisa Harga Satuan (AHSP / 單價分析)", titleEn: "Unit-Price Analysis (AHSP)", titleZh: "單價分析",
    whatId: "Menghitung harga 1 satuan pekerjaan (mis. 1 m³ beton) dari rincian: bahan + upah + alat, dikali koefisien kebutuhannya.",
    whatEn: "Work out the price of one unit of work (e.g. 1 m³ of concrete) from its make-up: material + labour + equipment, times the required coefficients.",
    whatZh: "計算 1 個工程單位 (例如 1 m³ 混凝土) 的價格:材料 + 人工 + 機具,各乘所需係數。",
    whyId: "Inilah “harga per satuan” yang nanti dikalikan volume. Standar Indonesia menambah Overhead+Untung 10%; Taiwan memisahkannya di tingkat proyek.",
    whyEn: "This is the “price per unit” later multiplied by volume. Indonesia adds 10% Overhead+Profit here; Taiwan separates it at project level.",
    whyZh: "這就是「每單位價格」,後續乘以工程量。印尼直接加 10% 管理費+利潤;臺灣則於專案層級分離計算。",
    formulaId: "Σ (koefisien × harga dasar) × (1 + OHP)  =  Harga Satuan",
    formulaEn: "Σ (coefficient × base price) × (1 + OHP)  =  Unit Price",
    formulaZh: "Σ (係數 × 基本單價) × (1 + 管理利潤)  =  單價",
    exId: "Beton K-225: bahan + upah ≈ Rp 1.200.235, + OHP 10% = Rp 1.320.259 per m³.",
    exEn: "Concrete K-225: material + labour ≈ Rp 1,200,235, + 10% OHP = Rp 1,320,259 per m³.",
    exZh: "K-225 混凝土:材料 + 人工 ≈ Rp 1,200,235,加 10% 管理利潤 = Rp 1,320,259 / m³。",
    seeId: "Tab Standar → Harga Satuan", seeEn: "Standard tab → Unit Price", seeZh: "標準分頁 → 單價分析",
  },
  {
    dim: "5D", color: "var(--blue)", target: { menu: "id", sub: "rab" },
    titleId: "RAB / Bill of Quantities (Biaya)", titleEn: "Bill of Quantities (Cost)", titleZh: "預算書 (成本)",
    whatId: "Mengalikan Volume × Harga Satuan untuk tiap item, lalu menjumlahkan semuanya menjadi total anggaran proyek.",
    whatEn: "Multiply Volume × Unit Price for each item, then add them all up into the total project budget.",
    whatZh: "各項目以 工程量 × 單價 計算,再加總為專案預算總額。",
    whyId: "Ini jawaban “berapa biayanya?”. Bobot (%) tiap item juga lahir di sini — dipakai untuk Kurva S.",
    whyEn: "This answers “how much does it cost?”. Each item's Weight (%) is also born here — used for the S-curve.",
    whyZh: "回答「需要多少錢?」。各項目的權重 (%) 也在此產生 — 進度曲線的基礎。",
    formulaId: "Total item = Volume × Harga Satuan   •   Bobot% = Total item ÷ Total proyek",
    formulaEn: "Item total = Volume × Unit Price   •   Weight% = Item total ÷ Project total",
    formulaZh: "項目總價 = 工程量 × 單價   •   權重% = 項目總價 ÷ 專案總額",
    exId: "32,4 m³ × Rp 1.320.000 = Rp 42.768.000 untuk beton struktur.",
    exEn: "32.4 m³ × Rp 1,320,000 = Rp 42,768,000 for structural concrete.",
    exZh: "32.4 m³ × Rp 1,320,000 = Rp 42,768,000,結構混凝土。",
    seeId: "Tab Standar → RAB / BoQ", seeEn: "Standard tab → Budget (BoQ)", seeZh: "標準分頁 → 預算書",
  },
  {
    dim: "4D", color: "var(--teal)", target: { menu: "id", sub: "schedule" },
    titleId: "Penjadwalan & Durasi (Waktu)", titleEn: "Scheduling & Duration (Time)", titleZh: "進度安排與工期 (時間)",
    whatId: "Menentukan berapa lama tiap pekerjaan (durasi) dan urutannya (pekerjaan mana harus selesai dulu / predecessor).",
    whatEn: "Decide how long each task takes (duration) and its order (which task must finish first / predecessor).",
    whatZh: "決定每項工作所需時間 (工期) 與順序 (哪項先完成 / 前置作業)。",
    whyId: "Ini jawaban “berapa lama?”. Durasi dihitung dari Volume ÷ produktivitas regu kerja per hari.",
    whyEn: "This answers “how long?”. Duration comes from Volume ÷ crew productivity per day.",
    whyZh: "回答「要多久?」。工期由 工程量 ÷ 班組日生產率 計算。",
    formulaId: "Durasi = Volume ÷ (produktivitas × jumlah regu)",
    formulaEn: "Duration = Volume ÷ (productivity × number of crews)",
    formulaZh: "工期 = 工程量 ÷ (生產率 × 班組數)",
    exId: "Struktur 2 lantai jadi lintasan kritis; total Indonesia 18 minggu, Taiwan 16 minggu (lebih mekanis).",
    exEn: "The two-storey structure is the critical path; total 18 weeks (Indonesia) vs 16 weeks (Taiwan, more mechanised).",
    exZh: "2 層樓結構為關鍵路徑;印尼共 18 週,臺灣共 16 週 (機械化更多)。",
    seeId: "Tab Standar → Jadwal", seeEn: "Standard tab → Schedule", seeZh: "標準分頁 → 進度表",
  },
  {
    dim: "4D×5D", color: "var(--amber)", target: { menu: "id", sub: "scurve" },
    titleId: "Kurva S (Rencana Progres)", titleEn: "S-Curve (Progress Plan)", titleZh: "進度曲線 (進度計畫)",
    whatId: "Menyebar bobot biaya tiap pekerjaan di sepanjang durasinya, lalu menjumlahkannya per minggu secara kumulatif.",
    whatEn: "Spread each task's cost weight across its duration, then accumulate it week by week.",
    whatZh: "將各工項的成本權重均勻分布於其工期,再逐週累積。",
    whyId: "Grafiknya membentuk huruf “S”: lambat di awal, cepat di tengah (struktur), melambat di akhir (finishing). Dipakai memantau progres.",
    whyEn: "The graph forms an “S”: slow start, fast middle (structure), tapering end (finishing). Used to track progress.",
    whyZh: "圖形呈「S」形:早期慢、中期 (結構) 快、後期 (裝修) 趨緩。用於監控進度。",
    formulaId: "Bobot/minggu = Bobot item ÷ durasi   •   Kumulatif = Σ bobot sampai minggu-n",
    formulaEn: "Weight/week = Item weight ÷ duration   •   Cumulative = Σ weight up to week n",
    formulaZh: "週權重 = 項目權重 ÷ 工期   •   累積 = Σ 權重至第 n 週",
    exId: "Minggu terakhir harus mencapai 100% — tanda seluruh rencana biaya terdistribusi.",
    exEn: "The final week must reach 100% — meaning the whole cost plan is distributed.",
    exZh: "最後一週必須達到 100% — 表示整個成本計畫已完整分布。",
    seeId: "Tab Standar → Kurva S", seeEn: "Standard tab → S-Curve", seeZh: "標準分頁 → 進度曲線",
  },
  {
    dim: "⚖", color: "oklch(0.6 0.1 168)", target: { menu: "tw", sub: "rab" },
    titleId: "Membandingkan 2 Standar", titleEn: "Comparing the Two Standards", titleZh: "比較兩套標準",
    whatId: "Volume sama (satu model Revit), tapi harga satuan, struktur markup, dan asumsi produktivitas berbeda antara Indonesia dan Taiwan.",
    whatEn: "Same quantities (one Revit model), but unit prices, mark-up structure, and productivity assumptions differ between Indonesia and Taiwan.",
    whatZh: "工程量相同 (同一個 Revit 模型),但單價、加價結構、生產率假設在印尼與臺灣大不相同。",
    whyId: "Indonesia: OHP menyatu di harga satuan + PPN 11%. Taiwan: harga langsung, lalu + manajemen, untung, mutu, K3, dan pajak usaha 5%.",
    whyEn: "Indonesia: OHP embedded in unit prices + 11% VAT. Taiwan: direct prices, then + management, profit, QC, EHS, and 5% business tax.",
    whyZh: "印尼:管理利潤已嵌入單價 + 11% PPN。臺灣:直接單價,再加 管理費、利潤、品管、環安衛、5% 營業稅。",
    formulaId: "Model sama  →  Volume sama  →  Harga & markup berbeda  →  Total berbeda",
    formulaEn: "Same model  →  Same quantities  →  Different prices & markup  →  Different totals",
    formulaZh: "模型相同  →  工程量相同  →  單價與加價不同  →  總額不同",
    exId: "Bandingkan total & durasi kedua standar di kartu Overview.",
    exEn: "Compare totals & durations of both standards in the Overview cards.",
    exZh: "於概覽卡片中比較兩套標準的總額與工期。",
    seeId: "Tab Standar Taiwan", seeEn: "Taiwan Standard tab", seeZh: "臺灣標準分頁",
  },
];

/* =====================================================================
   DEEP-DIVE FAQ — bilingual everything: question, body, formula,
   table, note. The lang prop picks the *Id / *En branch consistently.
   Numbers below mirror data.js so a curious student can verify them
   against the live AHSP / RAB / Jadwal / Kurva-S tabs.
   ===================================================================== */

const DEEP_AHSP_ID = [
  {
    qId: "Apa sebenarnya “koefisien” pada AHSP itu?",
    qEn: "What is a “coefficient” in AHSP, really?",
    aId: [
      "Koefisien adalah <strong>jumlah bahan/upah yang dibutuhkan untuk menghasilkan 1 satuan pekerjaan</strong>. Bukan harga, bukan persentase — hanya jumlah fisik per 1 unit produk.",
      "Untuk 1 m³ beton K-225 misalnya: koefisien semen 371 berarti butuh <strong>371 kg semen per 1 m³ beton</strong>. Angka ini sudah termasuk faktor susut/loss ~5%, jadi bukan teori murni tetapi praktik lapangan.",
      "Sumber resmi: SNI 7394:2008 (beton), SNI 6897:2008 (dinding), SNI 2837:2008 (plesteran), dan Permen PUPR No. 1/2022 untuk koefisien terbaru.",
    ],
    aEn: [
      "A coefficient is <strong>the quantity of material/labour needed to produce 1 unit of work</strong>. It is not a price, not a percentage — just a physical quantity per unit of product.",
      "For 1 m³ of K-225 concrete, a cement coefficient of 371 means <strong>371 kg of cement per 1 m³ of concrete</strong>. The number already includes a ~5% waste/loss factor, so it is field-tested rather than purely theoretical.",
      "Official sources: SNI 7394:2008 (concrete), SNI 6897:2008 (masonry), SNI 2837:2008 (plastering), and Indonesian PUPR Regulation No. 1/2022 for the latest coefficients.",
    ],
    formulaId: "Jumlah Bahan = Koefisien × Volume Pekerjaan",
    formulaEn: "Material Quantity = Coefficient × Work Volume",
    noteId: "Kalau Anda melihat koefisien 0,499 m³ pasir, jangan kira itu “50% pasir”. Artinya: butuh 0,499 m³ pasir untuk membuat tepat 1 m³ beton.",
    noteEn: "If you see a coefficient of 0.499 m³ of sand, do not read it as “50% sand”. It means: 0.499 m³ of sand is needed to make exactly 1 m³ of concrete.",
  },
  {
    qId: "Dari mana asal harga bahan (semen Rp 1.500/kg, pasir Rp 285.000/m³)?",
    qEn: "Where do the material prices come from (cement Rp 1,500/kg, sand Rp 285,000/m³)?",
    aId: [
      "Setiap kabupaten/kota menerbitkan <strong>HSPK (Harga Satuan Pokok Kegiatan)</strong> tiap awal tahun anggaran. Daftar ini hasil <strong>survei pasar</strong> ke minimal 3 toko bahan bangunan di wilayah tersebut, lalu dirata-rata.",
      "Contoh nyata semen Portland 50 kg dijual ~Rp 75.000 di toko material → dibagi 50 kg = <strong>Rp 1.500/kg</strong>. Pasir beton dump-truck 5 m³ Rp 1.425.000 → Rp 285.000/m³. Harga sudah franco di lokasi proyek (termasuk ongkos angkut).",
      "Untuk proyek pemerintah, harga acuan adalah HSPK Pemda. Untuk swasta, kontraktor sering pakai harga distributor + margin sendiri. Itu sebabnya harga bisa berbeda antar dokumen RAB.",
    ],
    aEn: [
      "Each Indonesian regency/city publishes an <strong>HSPK (Standard Unit Price List)</strong> at the start of each budget year. The list comes from a <strong>market survey</strong> of at least 3 building-material shops in the area, then averaged.",
      "Worked example: a 50 kg bag of Portland cement sells for ~Rp 75,000 at the store → divided by 50 kg = <strong>Rp 1,500/kg</strong>. A 5 m³ dump-truck of concrete sand at Rp 1,425,000 → Rp 285,000/m³. Prices are already delivered-to-site (transport included).",
      "Public projects use the local HSPK as reference. Private projects often use distributor prices plus the contractor's own margin — which is why one BoQ can show different numbers from another.",
    ],
    tableId: {
      head: ["Bahan", "Harga di dashboard", "Sumber asumsi"],
      rows: [
        ["Semen Portland (50 kg) ÷ 50", "Rp 1.500 / kg",   "HSPK 2024 rata-rata Jawa"],
        ["Pasir beton (dump-truck)",    "Rp 285.000 / m³", "Survei toko + ongkos angkut"],
        ["Kerikil / split",             "Rp 320.000 / m³", "Survei toko + ongkos angkut"],
        ["Besi beton (ulir / polos)",   "Rp 14.000 / kg",  "Distributor pabrik 2024"],
        ["Bata merah",                  "Rp 950 / buah",   "Survei pabrik bata lokal"],
      ],
    },
    tableEn: {
      head: ["Material", "Price in dashboard", "Source assumption"],
      rows: [
        ["Portland cement (50 kg bag) ÷ 50", "Rp 1,500 / kg",   "HSPK 2024, Java average"],
        ["Concrete sand (dump-truck)",       "Rp 285,000 / m³", "Shop survey + transport"],
        ["Coarse aggregate (gravel)",        "Rp 320,000 / m³", "Shop survey + transport"],
        ["Rebar (deformed / plain)",         "Rp 14,000 / kg",  "Mill distributor 2024"],
        ["Red brick",                        "Rp 950 / piece",  "Local brick-kiln survey"],
      ],
    },
    noteId: "Itulah kenapa AHSP 2 proyek berbeda bisa beda total walau spesifikasinya sama: harga bahan ikut harga pasar daerah.",
    noteEn: "That is why two AHSPs with the same specification can total differently: material prices follow the local market.",
  },
  {
    qId: "Kenapa satuan upah berbeda dengan satuan bahan — ada “OH”?",
    qEn: "Why is the labour unit different from the material unit — what is “OH”?",
    aId: [
      "<strong>OH = Orang-Hari</strong> (Taiwan: 工 / kong). Artinya: 1 orang bekerja 1 hari kerja standar (<strong>8 jam</strong>). Jadi 0,300 OH adalah <em>30%</em> dari 1 hari kerja seorang pekerja, atau setara 2,4 jam-orang.",
      "Koefisien upah “0,300 OH pekerja per m² dinding” berarti: <strong>untuk 1 m² dinding bata butuh 2,4 jam-orang dari pekerja kasar</strong>. Kalau 1 pekerja bekerja penuh 8 jam, sehari ia bisa menyelesaikan 1 ÷ 0,300 ≈ 3,33 m² dinding.",
      "Satuan ini memudahkan menghitung kebutuhan tenaga: untuk volume 50 m² dinding, total = 50 × 0,300 = 15 OH pekerja. Kalau ingin selesai 5 hari, butuh 15 ÷ 5 = 3 pekerja simultan.",
    ],
    aEn: [
      "<strong>OH = Orang-Hari</strong>, an Indonesian unit literally meaning “person-day” (Taiwan equivalent: 工 / gong). It means: 1 worker for 1 standard working day (<strong>8 hours</strong>). So 0.300 OH is <em>30%</em> of one worker-day, i.e. 2.4 man-hours.",
      "A labour coefficient of “0.300 OH of labourer per m² of brick wall” means: <strong>1 m² of brick wall needs 2.4 man-hours of unskilled labour</strong>. A full-day worker can finish 1 ÷ 0.300 ≈ 3.33 m² of wall per day.",
      "The unit also makes crewing easy: for 50 m² of wall, total = 50 × 0.300 = 15 person-days of labourers. To finish in 5 days, you need 15 ÷ 5 = 3 labourers working in parallel.",
    ],
    formulaId: "1 OH = 1 orang × 8 jam       Produktivitas/hari = 1 ÷ koefisien OH",
    formulaEn: "1 OH (person-day) = 1 person × 8 hours       Output/day = 1 ÷ OH coefficient",
    noteId: "OH adalah satuan “waktu kerja”, bukan “jumlah orang”. 0,015 OH mandor artinya mandor hanya hadir 1,2% hari (~7 menit) per m³ — wajar karena tugasnya mengawasi, bukan mengaduk.",
    noteEn: "OH measures “work time”, not “head-count”. A foreman coefficient of 0.015 means he is only present 1.2% of a day (~7 min) per m³ — reasonable, since he supervises rather than mixes.",
  },
  {
    qId: "Kenapa upah setiap item pekerjaan berbeda padahal upah/hari tukangnya sama?",
    qEn: "Why does labour cost differ per item, even though daily wages are the same?",
    aId: [
      "Karena yang berbeda bukan <em>harga upah</em> melainkan <strong>koefisien OH-nya</strong>. Tarif harian sama: pekerja Rp 110.000, tukang Rp 150.000, mandor Rp 180.000. Tetapi setiap jenis pekerjaan butuh “jumlah jam” yang berbeda.",
      "Bandingkan dengan data di proyek ini:",
      "Pasang dinding bata (1 m²): pekerja 0,300 + tukang 0,100 + mandor 0,015 = total upah ~Rp 51.700.",
      "Cor beton (1 m³): pekerja 1,650 + tukang 0,275 + kepala 0,028 + mandor 0,083 = total upah ~Rp 252.715. Lima kali lebih mahal karena <strong>volume tenaga angkut & cor jauh lebih besar</strong>.",
      "Pembesian (1 kg): pekerja 0,0070 + tukang 0,0070 + dll. = total upah ~Rp 1.900. Kecil sekali karena 1 kg besi cepat dipasang.",
    ],
    aEn: [
      "What differs is not the <em>wage rate</em> but the <strong>OH coefficient</strong>. Daily wages are the same across items: labourer Rp 110,000, mason Rp 150,000, foreman Rp 180,000. But each task needs a different amount of “hours”.",
      "Compare items in this project:",
      "Brick wall (1 m²): labourer 0.300 + mason 0.100 + foreman 0.015 → ~Rp 51,700 labour.",
      "Concrete pour (1 m³): labourer 1.650 + mason 0.275 + head mason 0.028 + foreman 0.083 → ~Rp 252,715. Five times more, because <strong>hauling & casting effort is much larger</strong>.",
      "Rebar fixing (1 kg): labourer 0.0070 + fixer 0.0070 + … → ~Rp 1,900. Tiny, because 1 kg of steel is quickly placed.",
    ],
    tableId: {
      head: ["Pekerjaan", "OH pekerja", "OH tukang", "Total upah / unit"],
      rows: [
        ["Bata 1 m²",    "0,300",  "0,100",  "≈ Rp 51.700"],
        ["Plester 1 m²", "0,300",  "0,150",  "≈ Rp 60.000"],
        ["Beton 1 m³",   "1,650",  "0,275",  "≈ Rp 252.700"],
        ["Besi 1 kg",    "0,0070", "0,0070", "≈ Rp 1.900"],
      ],
    },
    tableEn: {
      head: ["Work item", "Labourer OH", "Skilled OH", "Labour cost / unit"],
      rows: [
        ["Brick wall, 1 m²",    "0.300",  "0.100",  "≈ Rp 51,700"],
        ["Plaster, 1 m²",       "0.300",  "0.150",  "≈ Rp 60,000"],
        ["Concrete pour, 1 m³", "1.650",  "0.275",  "≈ Rp 252,700"],
        ["Rebar, 1 kg",         "0.0070", "0.0070", "≈ Rp 1,900"],
      ],
    },
    noteId: "Pesan moral: kalau Anda lihat upah cor lebih mahal dari upah bata, itu bukan karena “tukangnya lebih mahal” — tetapi karena 1 m³ beton menyita waktu kerja jauh lebih banyak daripada 1 m² bata.",
    noteEn: "Moral: a more expensive concrete-pour labour line vs brick wall is not because “the worker is more expensive” — it is because 1 m³ of concrete consumes far more work-time than 1 m² of brick.",
  },
  {
    qId: "Apa itu “Overhead & Profit 10%” di akhir AHSP?",
    qEn: "What is the “Overhead & Profit 10%” added at the end of an AHSP?",
    aId: [
      "<strong>Overhead</strong> = biaya tak langsung kontraktor: sewa kantor, gaji staf teknik, telepon, listrik kantor, transport, asuransi proyek, P3K. <strong>Profit</strong> = laba kontraktor.",
      "SNI / Permen PUPR membatasi <strong>maksimum 10% dari (Bahan + Upah + Alat)</strong>. Karena sudah disisipkan ke <em>setiap</em> mata pembayaran, ia muncul otomatis di setiap m³ beton, m² dinding, dll.",
      "Taiwan memilih pendekatan berbeda: harga satuan adalah harga langsung tanpa OHP, lalu di tingkat proyek ditambah <strong>5 lapis markup</strong>: 工程管理費 7%, 利潤 5%, 品管費 1%, 環安衛 1,5%, dan 營業稅 5%. Total efektifnya lebih besar dari 10% tapi lebih transparan.",
    ],
    aEn: [
      "<strong>Overhead</strong> = the contractor's indirect costs: office rent, engineering salaries, phone, office electricity, transport, project insurance, first aid. <strong>Profit</strong> is the contractor's margin.",
      "SNI / PUPR Regulation caps it at <strong>10% of (Material + Labour + Equipment)</strong>. Because it is embedded into <em>every</em> pay-item, it shows up automatically on every m³ of concrete, m² of wall, etc.",
      "Taiwan takes a different approach: unit prices are direct, without OHP, and at the project level <strong>5 markup layers</strong> are added: 工程管理費 7%, 利潤 5%, 品管費 1%, 環安衛 1.5%, and 營業稅 5%. The effective total is higher than 10% but more transparent.",
    ],
    formulaId: "Harga Satuan ID = (Bahan + Upah + Alat) × 1,10       (10% OHP)",
    formulaEn: "Indonesia Unit Price = (Material + Labour + Equipment) × 1.10       (10% OHP)",
    noteId: "Itu sebabnya saat Anda bandingkan harga satuan dengan harga dasar bahan + upah, totalnya tepat 10% lebih tinggi.",
    noteEn: "That is why, when you compare the unit price against the raw material + labour subtotal, the unit price is exactly 10% higher.",
  },
];

const DEEP_RAB_ID = [
  {
    qId: "Bagaimana Total Harga di RAB didapat?",
    qEn: "How is the Total in the BoQ computed?",
    aId: [
      "Rumusnya sederhana: <strong>Total item = Volume × Harga Satuan</strong>. Volume datang dari Revit (BIM), Harga Satuan datang dari AHSP. Kalikan, lalu jumlahkan seluruh baris → Jumlah Biaya Langsung.",
      "Setelah itu ditambah <strong>Markup tingkat proyek</strong>. Untuk Indonesia hanya PPN 11%. Untuk Taiwan: manajemen, keuntungan, mutu, K3, dan pajak usaha (lihat tab Standar Taiwan → RAB).",
      "Contoh konkret beton struktur: volume 32,4 m³ × Rp 1.320.000 = <strong>Rp 42.768.000</strong>. Ini lalu menyumbang ~8–9% terhadap total proyek.",
    ],
    aEn: [
      "The formula is simple: <strong>Item total = Volume × Unit Price</strong>. Volume comes from Revit (BIM), unit price comes from the AHSP. Multiply, sum every row → Total Direct Cost.",
      "Then add <strong>project-level markup</strong>. Indonesia: just 11% VAT. Taiwan: management, profit, QC, EHS, and business tax (see the Taiwan Standard → BoQ tab).",
      "Concrete example: 32.4 m³ × Rp 1,320,000 = <strong>Rp 42,768,000</strong>. That row contributes ~8–9% of the project total.",
    ],
    formulaId: "Total Proyek = Σ (Vol × HS) + Markup tingkat proyek",
    formulaEn: "Project Total = Σ (Vol × UP) + Project-level markup",
  },
  {
    qId: "Apa arti kolom “Bobot %” di RAB?",
    qEn: "What does the “Weight %” column mean in the BoQ?",
    aId: [
      "<strong>Bobot</strong> adalah porsi biaya satu item terhadap total seluruh proyek. Rumusnya:",
      "Bobot itu adalah <em>jantung</em> dari Kurva S. Tanpa bobot, kita tidak bisa menggambar progres rencana: minggu mana proyek bertambah berapa persen, semua bergantung pada bobot item yang aktif di minggu itu.",
      "Total seluruh bobot harus = 100,00%. Kalau jumlahnya 99,8% atau 100,3%, biasanya ada pembulatan; di dashboard ini selalu dinormalisasi ke 100%.",
    ],
    aEn: [
      "<strong>Weight</strong> is one item's share of the total project cost. The formula:",
      "Weight is the <em>heart</em> of the S-curve. Without it you cannot draw a planned progress curve — every week's percentage gain depends on the weights of items active that week.",
      "All weights must sum to 100.00%. If you get 99.8% or 100.3%, that is rounding; the dashboard normalises to 100%.",
    ],
    formulaId: "Bobot% = (Total item ÷ Total proyek) × 100",
    formulaEn: "Weight% = (Item total ÷ Project total) × 100",
    noteId: "Karena bobot mengikuti BIAYA, bukan VOLUME, satu pekerjaan kecil tapi mahal (mis. sanitair) bisa punya bobot lebih besar dari pekerjaan besar tapi murah (mis. urugan tanah).",
    noteEn: "Because weight follows COST and not VOLUME, a small but expensive item (e.g. sanitary fixtures) can outweigh a large but cheap one (e.g. backfill).",
  },
  {
    qId: "Kenapa markup Indonesia hanya 1 baris (PPN), tapi Taiwan 5 baris?",
    qEn: "Why does Indonesia have only 1 markup line (VAT) while Taiwan has 5?",
    aId: [
      "Indonesia <strong>menanam OHP 10% di tiap harga satuan</strong> lewat AHSP. Jadi saat tiba di akhir RAB, yang tersisa hanya kewajiban pajak negara: <strong>PPN 11%</strong> atas Jumlah Biaya Langsung.",
      "Taiwan <strong>memisahkan</strong> semua biaya tak langsung supaya pemilik proyek bisa menilainya per kategori. Itulah kenapa muncul 工程管理費 (manajemen), 利潤 (untung), 品管費 (mutu), 環安衛費 (K3), lalu terakhir 營業稅 (pajak usaha 5%).",
      "Hasilnya 2 standar bisa berbeda total walau volume dan kualitas pekerjaan sama persis — yang berbeda adalah <strong>cara menampilkannya</strong>, bukan kualitas pekerjaannya.",
    ],
    aEn: [
      "Indonesia <strong>embeds 10% OHP into every unit price</strong> via AHSP. So at the bottom of the BoQ, only the state tax obligation remains: <strong>11% VAT</strong> on the Total Direct Cost.",
      "Taiwan <strong>splits out</strong> every indirect cost so the owner can review them by category. That is why you see 工程管理費 (management), 利潤 (profit), 品管費 (QC), 環安衛費 (EHS) and finally 營業稅 (5% business tax).",
      "Two standards can total differently even with identical volumes and quality — what differs is <strong>how it is presented</strong>, not the work itself.",
    ],
  },
];

const DEEP_SCHED_ID = [
  {
    qId: "Atas dasar apa pekerjaan A diberi durasi 1 minggu, sementara D diberi 6 minggu?",
    qEn: "On what basis is task A given 1 week while D gets 6 weeks?",
    aId: [
      "Durasi BUKAN tebakan. Rumus baku:",
      "Pekerjaan persiapan (A.1 pembersihan lahan) volume kecil + produktivitas tinggi → <strong>1 minggu</strong>. Pekerjaan struktur beton (D.1) volume besar + butuh masa curing 7–14 hari per lantai → <strong>6 minggu</strong>.",
      "Contoh hitungan D.1: volume 32 m³, produktivitas regu cor 1,2 m³/hari (1 regu = 1 mandor + 1 tukang + 6 pekerja). 32 ÷ 1,2 ≈ 27 hari kerja ≈ 5,4 minggu, dibulatkan 6 minggu (cadangan curing & cuaca).",
      "Taiwan total 16 minggu vs Indonesia 18 minggu karena <strong>mekanisasi</strong> (ready-mix concrete, mixer truck, alat angkat) menaikkan produktivitas regu ~15%.",
    ],
    aEn: [
      "Duration is NOT a guess. The standard formula:",
      "Site clearing (A.1) is low volume + high productivity → <strong>1 week</strong>. Structural concrete (D.1) is high volume + needs 7–14 days curing per storey → <strong>6 weeks</strong>.",
      "Worked example for D.1: volume 32 m³, crew productivity 1.2 m³/day (1 crew = 1 foreman + 1 mason + 6 labourers). 32 ÷ 1.2 ≈ 27 working days ≈ 5.4 weeks, rounded up to 6 weeks for curing & weather buffer.",
      "Taiwan 16 weeks vs Indonesia 18 weeks: <strong>mechanisation</strong> (ready-mix, mixer trucks, lifting equipment) raises crew productivity ~15%.",
    ],
    formulaId: "Durasi (hari) = Volume ÷ (Produktivitas regu × Jumlah regu)",
    formulaEn: "Duration (days) = Volume ÷ (Crew productivity × Number of crews)",
    noteId: "Curing beton tidak dihitung sebagai “kerja” tetapi tetap memakai waktu kalender. Itulah kenapa durasi cor selalu lebih panjang dari yang naluri pikirkan.",
    noteEn: "Concrete curing is not “work” but it still consumes calendar time. That is why a casting task always lasts longer than intuition suggests.",
  },
  {
    qId: "Apa itu Predecessor? Kenapa selalu muncul “FS”?",
    qEn: "What is a Predecessor? And why does “FS” keep showing up?",
    aId: [
      "<strong>Predecessor</strong> = pekerjaan yang HARUS dilakukan lebih dulu sebelum pekerjaan lain bisa dimulai. Bukan urutan opsional — ini ketergantungan logis-fisik.",
      "Kolom dicor di atas pondasi → maka <em>C.2 (footplat) adalah predecessor D.1 (kolom beton)</em>. Tanpa relasi ini, jadwal akan kacau karena bisa saja kolom dimulai sebelum pondasinya ada.",
      "Tipe hubungan ada 4: <strong>FS</strong> (Finish-to-Start: A selesai, B mulai — paling umum), <strong>SS</strong> (Start-Start: B mulai bersamaan dengan A), <strong>FF</strong> (Finish-Finish: B selesai bersamaan dengan A), <strong>SF</strong> (jarang dipakai). Dashboard ini semua FS.",
    ],
    aEn: [
      "<strong>Predecessor</strong> = the task that MUST be done before another task can start. Not an option — a logical / physical dependency.",
      "Columns are cast on top of footings → <em>C.2 (footing) is the predecessor of D.1 (concrete columns)</em>. Without this link, the schedule allows columns to begin before footings exist — nonsense.",
      "There are 4 link types: <strong>FS</strong> (Finish-to-Start: A finishes, B starts — most common), <strong>SS</strong> (Start-Start: B starts together with A), <strong>FF</strong> (Finish-Finish: B ends together with A), <strong>SF</strong> (rarely used). This dashboard uses FS throughout.",
    ],
    noteId: "Predecessor adalah alasan kenapa kolom “Mulai” pada baris berikutnya tidak selalu di minggu 1. Dia bergeser otomatis ke minggu setelah pendahulunya selesai.",
    noteEn: "Predecessors are why the “Start” column on a later row is not always week 1 — it auto-shifts to the week after its predecessor finishes.",
  },
  {
    qId: "Atas dasar apa pekerjaan dipaketkan ke grup A, B, C, … (WBS)?",
    qEn: "On what basis are tasks grouped into A, B, C, … (WBS)?",
    aId: [
      "<strong>WBS = Work Breakdown Structure</strong> — cara membagi total pekerjaan ke kelompok yang setara <em>tujuan teknis</em>nya, bukan setara biaya.",
      "Dashboard ini pakai pengelompokan klasik proyek bangunan: <strong>A</strong> Persiapan, <strong>B</strong> Tanah & Galian, <strong>C</strong> Pondasi, <strong>D</strong> Struktur Beton, <strong>E</strong> Arsitektur, <strong>F</strong> Atap, <strong>G</strong> MEP, <strong>H</strong> Finishing. Urutannya kira-kira mengikuti urutan pelaksanaan di lapangan dari bawah ke atas.",
      "Di dalam grup, item lebih detail: C.1 pondasi batu kali, C.2 footplat beton, C.3 lantai kerja. Pemilihan tergantung jenis pondasi yang dipakai — kalau pondasi footplat dipakai, C.1 tidak relevan (di dashboard ini ditandai “Tidak berlaku”).",
    ],
    aEn: [
      "<strong>WBS = Work Breakdown Structure</strong> — a way to slice the whole job into groups with comparable <em>technical purpose</em>, not comparable cost.",
      "This dashboard uses the classic building grouping: <strong>A</strong> Site Prep, <strong>B</strong> Earthworks, <strong>C</strong> Foundation, <strong>D</strong> Concrete Structure, <strong>E</strong> Architecture, <strong>F</strong> Roofing, <strong>G</strong> MEP, <strong>H</strong> Finishing. The order roughly follows on-site execution, bottom-up.",
      "Inside a group, items get more specific: C.1 stone foundation, C.2 concrete footing, C.3 lean concrete. Which apply depends on the chosen foundation type — if you use footing, C.1 is irrelevant (the dashboard marks it “Not applicable”).",
    ],
  },
  {
    qId: "Saya pertama kali melihat bagan Gantt dan terasa aneh. Cara membacanya bagaimana?",
    qEn: "I'm seeing a Gantt chart for the first time and it feels alien. How do I read it?",
    aId: [
      "Bayangkan kalender raksasa yang diputar 90° ke kanan. <strong>Sumbu horizontal = waktu</strong> (minggu 1 di kiri, minggu terakhir di kanan). <strong>Sumbu vertikal = daftar pekerjaan</strong> (WBS dari atas ke bawah).",
      "Setiap baris berisi <strong>satu bar berwarna</strong>. <em>Posisi kiri bar</em> = minggu mulai. <em>Posisi kanan bar</em> = minggu selesai. <em>Panjang bar</em> = durasi. <em>Warna bar</em> = grup WBS (semua A berwarna sama, semua D berwarna sama, dst).",
      "Bila dua bar pada baris berbeda <strong>tumpang tindih secara vertikal</strong>, artinya kedua pekerjaan dikerjakan <em>paralel</em> oleh regu berbeda. Bila ada celah, regu yang sama bisa beristirahat / pindah ke pekerjaan lain.",
      "Mata pemula sering tertipu oleh: (a) lebar tiap kolom minggu tidak konstan kalau ada lebih dari 12 minggu — perhatikan label angka di atas; (b) bar yang sangat pendek tetap menempati 1 minggu penuh karena minimum durasi 1 minggu.",
    ],
    aEn: [
      "Imagine a giant calendar rotated 90°. <strong>Horizontal axis = time</strong> (week 1 on the left, last week on the right). <strong>Vertical axis = task list</strong> (WBS top-to-bottom).",
      "Each row carries <strong>one coloured bar</strong>. <em>Left edge</em> = start week. <em>Right edge</em> = finish week. <em>Length</em> = duration. <em>Colour</em> = WBS group (all A's share a colour, all D's share a colour, etc.).",
      "If two bars on different rows <strong>vertically overlap</strong>, the two tasks run in <em>parallel</em> using separate crews. If there is a gap, the same crew can rest or move to another task.",
      "Beginner traps: (a) the per-week column width is not constant past 12 weeks — read the numeric labels at the top; (b) a very short bar still occupies a full week because minimum duration is 1 week.",
    ],
    noteId: "Lintasan kritis (critical path) adalah deretan pekerjaan yang menentukan durasi total. Bila satu di antaranya mundur 1 minggu, proyek juga mundur 1 minggu. Di sini biasanya: A → B → C → D → E → H.",
    noteEn: "The critical path is the chain of tasks that fixes total duration. Slip any of them by a week and the whole project slips a week. Here it is usually A → B → C → D → E → H.",
  },
];

const DEEP_SCURVE_ID = [
  {
    qId: "Bagaimana sebenarnya Kurva S terbentuk?",
    qEn: "How is the S-curve actually built?",
    aId: [
      "Tiga langkah saja:",
      "<strong>Langkah 1</strong> — hitung Bobot tiap item dari RAB (lihat kartu “Bobot %” di atas). Beton struktur misalnya 8,80%.",
      "<strong>Langkah 2</strong> — bagi bobot itu rata sepanjang durasinya. Beton 8,80% dengan durasi 6 minggu → 1,47% per minggu di minggu 4–9.",
      "<strong>Langkah 3</strong> — di setiap minggu, jumlahkan bobot semua item yang aktif minggu itu → angka “Rencana/Minggu”. Kemudian jumlahkan kumulatif dari minggu 1 sampai minggu n → angka “Kumulatif”. Garis kumulatif inilah Kurva S.",
    ],
    aEn: [
      "Just three steps:",
      "<strong>Step 1</strong> — compute each item's Weight from the BoQ (see the “Weight %” card above). Concrete structure, for example, 8.80%.",
      "<strong>Step 2</strong> — split that weight evenly across its duration. 8.80% over 6 weeks → 1.47% per week, in weeks 4–9.",
      "<strong>Step 3</strong> — each week, sum the weights of all items active that week → the “Plan / Week” figure. Then cumulate from week 1 to week n → the “Cumulative”. That cumulative line is the S-curve.",
    ],
    formulaId: "Bobot/minggu = Bobot item ÷ durasi      Kumulatifₙ = Σ (Rencana/minggu, 1..n)",
    formulaEn: "Weight/week = Item weight ÷ duration      Cumulativeₙ = Σ (Plan/week, 1..n)",
  },
  {
    qId: "Kenapa kurva ini berbentuk huruf S?",
    qEn: "Why does this curve look like the letter S?",
    aId: [
      "Karena <strong>tidak semua minggu bobotnya sama</strong>. Pola khas konstruksi:",
      "<strong>Awal proyek</strong> (persiapan + galian): bobot kecil karena harga satuannya rendah. Garis kumulatif <em>landai</em>.",
      "<strong>Tengah proyek</strong> (pondasi + struktur beton + dinding): bobot terbesar karena item-item ini menyita 60–70% biaya. Garis kumulatif <em>naik tajam</em>.",
      "<strong>Akhir proyek</strong> (finishing + pengecatan + pembersihan): item banyak tetapi masing-masing kecil. Garis kumulatif kembali <em>landai</em> menuju 100%.",
      "Tiga fase ini (landai → curam → landai) membuat siluetnya seperti huruf S. Kalau bentuknya bukan S — misalnya naik lurus terus — itu tanda jadwal Anda belum realistis.",
    ],
    aEn: [
      "Because <strong>not every week carries the same weight</strong>. The typical construction pattern:",
      "<strong>Early</strong> (site prep + earthworks): small weights because unit prices are low. The cumulative line is <em>flat</em>.",
      "<strong>Middle</strong> (foundation + concrete structure + walls): the heaviest weights because these items eat 60–70% of the cost. The cumulative line <em>climbs steeply</em>.",
      "<strong>Late</strong> (finishes + painting + cleaning): many items but each is small. The cumulative line goes <em>flat again</em> toward 100%.",
      "These three phases (flat → steep → flat) give it the S silhouette. If your curve is not S-shaped — say it rises linearly — it is a sign the schedule is not realistic yet.",
    ],
  },
  {
    qId: "Bagaimana memakai Kurva S di lapangan?",
    qEn: "How is the S-curve used on site?",
    aId: [
      "Kurva S adalah <strong>baseline</strong> — rencana. Setiap minggu, supervisor mencatat <strong>progres aktual</strong> (% pekerjaan terlaksana) dan menggambarnya di kertas yang sama.",
      "<strong>Aktual di bawah Rencana</strong> → proyek terlambat (negative Schedule Variance). Bisa perlu lembur, tambah regu, atau revisi target.",
      "<strong>Aktual di atas Rencana</strong> → proyek lebih cepat. Hati-hati: kadang ini karena pekerjaan mudah didahulukan, pekerjaan sulit ditunda — kurva bisa kembali “menukik” nanti.",
      "Selisih vertikal antara kedua kurva pada minggu ke-n disebut <strong>SPI (Schedule Performance Index)</strong> bila dinyatakan sebagai rasio aktual÷rencana. SPI 1,0 = tepat. >1,0 = lebih cepat. <1,0 = terlambat.",
    ],
    aEn: [
      "The S-curve is a <strong>baseline</strong> — the plan. Each week the supervisor records <strong>actual progress</strong> (% of work completed) and plots it on the same chart.",
      "<strong>Actual below Plan</strong> → the project is late (negative Schedule Variance). May need overtime, extra crews, or a revised target.",
      "<strong>Actual above Plan</strong> → the project is ahead. Be careful: sometimes that is because easy tasks were done first while hard ones are deferred — the curve can dip again later.",
      "The vertical gap at week n, expressed as a ratio actual÷plan, is the <strong>SPI (Schedule Performance Index)</strong>. SPI 1.0 = on schedule. >1.0 = ahead. <1.0 = behind.",
    ],
    noteId: "Banyak orang mengira Kurva S adalah “grafik biaya”. Sebetulnya itu grafik PROGRES yang menggunakan bobot biaya sebagai skala. Sumbu Y bersatuan persen, bukan rupiah.",
    noteEn: "Many people think the S-curve is a “cost chart”. It is actually a PROGRESS chart that uses cost weights as the yard-stick. The Y-axis is in percent, not rupiah.",
  },
  {
    qId: "Apa hubungan “Tabel Distribusi Bobot” dengan Kurva S?",
    qEn: "How is the “Weight Distribution Table” related to the S-curve?",
    aId: [
      "Tabel itu adalah <strong>data mentah</strong> dari mana kurva digambar. Tiap baris = satu item WBS. Tiap kolom = satu minggu.",
      "Sel berisi <strong>persen bobot item itu yang dialokasikan minggu itu</strong>. Sel kosong = item tidak aktif minggu itu.",
      "Jumlah satu BARIS = bobot total item itu di RAB. Jumlah satu KOLOM = nilai “Rencana/Minggu” pada Kurva S. Jumlah kumulatif kolom (dari kiri) = nilai “Kumulatif” pada Kurva S.",
      "Jadi tabel dan grafik adalah <em>pasangan</em>: tabel untuk membaca angka tepat, grafik untuk membaca trend secara visual. Auditor cenderung memeriksa tabel; lapangan cenderung melihat grafik.",
    ],
    aEn: [
      "The table is the <strong>raw data</strong> behind the curve. Each row = one WBS item. Each column = one week.",
      "A cell shows <strong>the percentage of that item's weight allocated to that week</strong>. Empty cells = item not active that week.",
      "Row sum = the item's total Weight in the BoQ. Column sum = the “Plan / Week” point on the S-curve. Running column sum (left-to-right) = the “Cumulative” point on the S-curve.",
      "So the table and the chart are a <em>pair</em>: read precise numbers from the table, read trends visually from the chart. Auditors prefer the table; site teams prefer the chart.",
    ],
  },
];

const DEEP_CATEGORIES_ID = [
  { key: "ahsp",  num: "01", items: DEEP_AHSP_ID,   labelId: "Anatomi Harga Satuan (AHSP)",        labelEn: "Anatomy of Unit-Price Analysis (AHSP)",       labelZh: "單價分析 (AHSP) 解析" },
  { key: "rab",   num: "02", items: DEEP_RAB_ID,    labelId: "Anatomi RAB / Bill of Quantities",   labelEn: "Anatomy of the Bill of Quantities",          labelZh: "預算書 (RAB / BoQ) 解析" },
  { key: "sched", num: "03", items: DEEP_SCHED_ID,  labelId: "Anatomi Jadwal & Paket Pekerjaan",   labelEn: "Anatomy of the Schedule & Work Packages",    labelZh: "進度表與工項分包解析" },
  { key: "sc",    num: "04", items: DEEP_SCURVE_ID, labelId: "Anatomi Kurva S & Distribusi Bobot", labelEn: "Anatomy of the S-Curve & Weight Distribution", labelZh: "進度曲線與權重分配解析" },
];

/* =====================================================================
   TAIWAN STANDARD — explained from scratch using PCC terminology.
   References: 行政院公共工程委員會 (PCC) 預算編列參考手冊;
   主計總處 物價指數 (CPI/PPI); 加值型營業稅法.
   Volumes still come from the SAME Revit BIM model; only the pricing,
   markup, and productivity assumptions are Taiwanese.
   ===================================================================== */

const DEEP_AHSP_TW = [
  {
    qId: "Apa itu 單價分析 (Unit-Price Analysis ala Taiwan)?",
    qEn: "What is 單價分析 (Taiwan-style unit-price analysis)?",
    aId: [
      "<strong>單價分析</strong> (dānjià fēnxī) adalah cara menghitung harga 1 satuan pekerjaan di Taiwan, sesuai pedoman <strong>行政院公共工程委員會 (PCC — Public Construction Commission)</strong>. Setiap mata pembayaran dipecah menjadi tiga komponen yang berdiri sendiri:",
      "① <strong>材料 (Material / cáiliào)</strong> — bahan fisik (mis. 預拌混凝土 ready-mix, 鋼筋 rebar, 紅磚 bata).",
      "② <strong>人工 (Labour / réngōng)</strong> — tenaga manusia (技術工 skilled, 普通工 general labourer).",
      "③ <strong>機具 (Equipment / jījù)</strong> — alat berat & mekanik (震動機 vibrator, 抽水機 pump).",
      "Hasil akhir adalah <strong>直接單價 (Direct Unit Price)</strong> — TIDAK termasuk overhead, profit, atau pajak. Semua biaya tak langsung ditambahkan terpisah di tingkat proyek (lihat kartu Markup).",
    ],
    aEn: [
      "<strong>單價分析</strong> (dānjià fēnxī) is Taiwan's way of pricing 1 unit of work, following the <strong>行政院公共工程委員會 (PCC — Public Construction Commission)</strong> guideline. Every pay-item is decomposed into three standalone components:",
      "① <strong>材料 (Material / cáiliào)</strong> — physical inputs (e.g. 預拌混凝土 ready-mix, 鋼筋 rebar, 紅磚 bricks).",
      "② <strong>人工 (Labour / réngōng)</strong> — human effort (技術工 skilled, 普通工 general labourer).",
      "③ <strong>機具 (Equipment / jījù)</strong> — heavy & mechanical equipment (震動機 vibrator, 抽水機 pump).",
      "The output is the <strong>直接單價 (Direct Unit Price)</strong> — it does NOT include overhead, profit, or tax. Every indirect cost is added separately at project level (see the Markup card).",
    ],
    formulaId: "直接單價 = Σ (係數 × 單價)  ←  3 komponen: 材料 + 人工 + 機具",
    formulaEn: "Direct Unit Price = Σ (Coefficient × Base Price)  ←  3 buckets: 材料 + 人工 + 機具",
    noteId: "Filosofi PCC: transparansi. Pemilik proyek harus bisa melihat berapa biaya bahan murni, berapa upah murni, dan berapa keuntungan kontraktor — sehingga tiap kategori bisa diaudit dan dinegosiasikan terpisah.",
    noteEn: "PCC philosophy: transparency. The owner must be able to see the pure material cost, pure labour cost, and contractor's profit — so each bucket can be audited and negotiated separately.",
  },
  {
    qId: "Dari mana asal harga material di Taiwan (NT$ 3.200/m³ ready-mix)?",
    qEn: "Where do Taiwan material prices come from (NT$ 3,200/m³ ready-mix)?",
    aId: [
      "Untuk <strong>proyek publik</strong>, harga acuan diambil dari dua sumber resmi: ① <strong>預算編列參考手冊</strong> (Budget Compilation Reference Manual) yang dirilis PCC tiap tahun, dan ② <strong>物價指數 (wùjià zhǐshù)</strong> — indeks harga yang dipublikasikan 行政院主計總處 (Directorate-General of Budget, Accounting and Statistics).",
      "Untuk <strong>proyek swasta</strong>, kontraktor mengumpulkan <strong>廠商報價 (chǎngshāng bàojià)</strong> — penawaran resmi dari minimal 3 pemasok, dirata-rata, lalu disesuaikan dengan lokasi dan volume order.",
      "Contoh nyata di dashboard ini: <strong>預拌混凝土 fc'210</strong> (ready-mix concrete dengan kekuatan tekan 210 kg/cm²) = NT$ 3.200/m³, sudah delivered-to-site dengan mixer truck. Harga ini adalah rata-rata 廠商報價 di Taipei-Taoyuan 2024.",
    ],
    aEn: [
      "For <strong>public projects</strong>, the reference price comes from two official sources: ① the <strong>預算編列參考手冊</strong> (Budget Compilation Reference Manual) issued yearly by PCC, and ② the <strong>物價指數 (wùjià zhǐshù)</strong> — the price index published by 行政院主計總處 (Directorate-General of Budget, Accounting and Statistics).",
      "For <strong>private projects</strong>, the contractor collects <strong>廠商報價 (chǎngshāng bàojià)</strong> — formal quotes from at least 3 suppliers, averaged, then adjusted for site location and order size.",
      "Worked example from this dashboard: <strong>預拌混凝土 fc'210</strong> (ready-mix concrete, 210 kg/cm² compressive strength) = NT$ 3,200/m³, already delivered to site by mixer truck. This price is the 2024 Taipei–Taoyuan average of 廠商報價.",
    ],
    tableId: {
      head: ["材料 / Material", "Harga dasar", "Sumber asumsi"],
      rows: [
        ["預拌混凝土 fc'210 (ready-mix)", "NT$ 3.200 / m³", "廠商報價 rata-rata Taipei 2024"],
        ["泵送 (pumping ke lokasi cor)",  "NT$ 380 / m³",   "廠商報價 jasa pump"],
        ["鋼筋 SD420 (deformed rebar)",   "NT$ 30 / kg",    "中鋼 mill price + transport"],
        ["紅磚 (red brick)",              "NT$ 6 / 塊",     "Survei 廠商 lokal"],
        ["水泥 (cement)",                 "NT$ 4,20 / kg",  "PCC 預算編列手冊 2024"],
      ],
    },
    tableEn: {
      head: ["材料 / Material", "Base price", "Source assumption"],
      rows: [
        ["預拌混凝土 fc'210 (ready-mix)",   "NT$ 3,200 / m³", "Taipei 2024 vendor-quote average"],
        ["泵送 (pumping to pour site)",     "NT$ 380 / m³",   "Pump-service vendor quote"],
        ["鋼筋 SD420 (deformed rebar)",     "NT$ 30 / kg",    "中鋼 mill price + transport"],
        ["紅磚 (red brick)",                "NT$ 6 / piece",  "Local 廠商 survey"],
        ["水泥 (cement)",                   "NT$ 4.20 / kg",  "PCC 預算編列手冊 2024"],
      ],
    },
    noteId: "Di Taiwan, beton hampir selalu dibeli sebagai 預拌混凝土 (ready-mix) — tidak ada lagi acian-aduk di lokasi kecuali pekerjaan kecil. Itulah kenapa AHSP TW tidak punya baris “pasir + semen + kerikil” terpisah seperti Indonesia.",
    noteEn: "In Taiwan, concrete is almost always purchased as 預拌混凝土 (ready-mix) — no more on-site batching except for small jobs. That is why the Taiwan AHSP has no separate sand + cement + gravel rows like Indonesia does.",
  },
  {
    qId: "Apa itu satuan 工 / 工日 (gōng / gōngrì)?",
    qEn: "What is the labour unit 工 / 工日 (gōng / gōngrì)?",
    aId: [
      "<strong>工 (gōng)</strong> adalah satuan <em>orang-hari</em> ala Taiwan. Definisinya identik dengan OH Indonesia: 1 工 = 1 orang bekerja 1 hari kerja standar (<strong>8 jam</strong>). Beberapa dokumen formal memakai <strong>工日 (gōngrì)</strong> sebagai panjang — artinya sama.",
      "Koefisien 0,250 工 untuk 1 m³ beton berarti: <strong>1 m³ beton memakan 25% hari kerja seorang 技術工 (skilled worker)</strong>, atau ekuivalen 2 jam-orang. Kalau skilled worker bekerja penuh, sehari ia menangani 1 ÷ 0,250 = 4 m³ beton.",
      "Untuk volume 32 m³ beton: total = 32 × 0,250 = 8 工 skilled + 32 × 0,450 = 14,4 工 普通工. Bisa diselesaikan ~5 hari oleh 1 regu (2 skilled + 3 普通工).",
    ],
    aEn: [
      "<strong>工 (gōng)</strong> is Taiwan's <em>person-day</em> unit. Identical in definition to Indonesia's OH: 1 工 = 1 person × 1 standard working day (<strong>8 hours</strong>). Some formal documents use <strong>工日 (gōngrì)</strong> instead — same meaning.",
      "A coefficient of 0.250 工 for 1 m³ of concrete means: <strong>1 m³ of concrete consumes 25% of a 技術工 (skilled worker)'s day</strong>, i.e. 2 man-hours. A full-day skilled worker handles 1 ÷ 0.250 = 4 m³ of concrete.",
      "For 32 m³ of concrete: total = 32 × 0.250 = 8 工 skilled + 32 × 0.450 = 14.4 工 普通工. About 5 days with 1 crew (2 skilled + 3 普通工).",
    ],
    formulaId: "1 工 = 1 人 × 8 小時      生產率/日 = 1 ÷ 係數",
    formulaEn: "1 工 = 1 person × 8 hours      Output / day = 1 ÷ coefficient",
  },
  {
    qId: "Kenapa upah Taiwan jauh lebih tinggi (NT$ 2.500–3.200/工)?",
    qEn: "Why are Taiwan wages much higher (NT$ 2,500–3,200/工)?",
    aId: [
      "Upah minimum nasional Taiwan 2024 = <strong>NT$ 27.470/bulan</strong> ≈ NT$ 1.030/hari. Tetapi upah <em>konstruksi</em> jauh lebih tinggi karena tiga alasan:",
      "① <strong>Risk premium</strong> — pekerjaan konstruksi dianggap berbahaya (祕勞 high-risk labour), sehingga upahnya di atas industri rata-rata.",
      "② <strong>Tunjangan & asuransi</strong> termasuk 勞健保 (labour & health insurance) wajib + 退休金 6% (retirement fund). Semua sudah disisipkan ke tarif harian.",
      "③ <strong>Keterampilan langka</strong> — 技術工 (skilled, NT$ 3.000/工), 鋼筋工 (steel fixer, NT$ 3.200/工), dan 模板工 (formworker) sulit dicari karena pemuda Taiwan tidak banyak masuk ke industri ini.",
      "Bandingkan dengan 普通工 (general labour, NT$ 2.500/工) yang dipegang banyak tenaga migran dari Vietnam, Filipina, dan Indonesia.",
    ],
    aEn: [
      "Taiwan's 2024 national minimum wage = <strong>NT$ 27,470/month</strong> ≈ NT$ 1,030/day. But <em>construction</em> wages are much higher for three reasons:",
      "① <strong>Risk premium</strong> — construction is classified as high-risk labour (祕勞), so wages exceed the industry average.",
      "② <strong>Allowances & insurance</strong>, including mandatory 勞健保 (labour & health insurance) + 6% 退休金 (retirement fund). Already embedded in the daily rate.",
      "③ <strong>Scarce skills</strong> — 技術工 (skilled, NT$ 3,000/工), 鋼筋工 (steel fixer, NT$ 3,200/工), and 模板工 (formworker) are hard to find because few young Taiwanese enter the trade.",
      "Compare with 普通工 (general labour, NT$ 2,500/工), where many positions are filled by migrant workers from Vietnam, the Philippines, and Indonesia.",
    ],
    tableId: {
      head: ["工種 / Trade", "Tarif harian", "Catatan"],
      rows: [
        ["普通工 (general labour)",       "NT$ 2.500 / 工", "Banyak diisi tenaga migran"],
        ["技術工 (skilled)",              "NT$ 3.000 / 工", "Cor, plester, finishing"],
        ["鋼筋工 (steel fixer)",          "NT$ 3.200 / 工", "Premium karena keterampilan"],
        ["模板工 (formworker)",           "NT$ 3.200 / 工", "Bekisting, sulit dicari"],
      ],
    },
    tableEn: {
      head: ["工種 / Trade", "Daily rate", "Note"],
      rows: [
        ["普通工 (general labour)",       "NT$ 2,500 / 工", "Mostly filled by migrant workers"],
        ["技術工 (skilled)",              "NT$ 3,000 / 工", "Pouring, plastering, finishing"],
        ["鋼筋工 (steel fixer)",          "NT$ 3,200 / 工", "Premium for the skill"],
        ["模板工 (formworker)",           "NT$ 3,200 / 工", "Formwork, hard to recruit"],
      ],
    },
  },
  {
    qId: "Bagaimana 1 m³ beton dipecah menjadi 材料 / 人工 / 機具 (NT$ 5.609 total)?",
    qEn: "How is 1 m³ of concrete broken into 材料 / 人工 / 機具 (NT$ 5,609 total)?",
    aId: [
      "Berbeda dengan Indonesia yang memecah ke Bahan + Upah saja, Taiwan menambahkan baris <strong>機具 (Equipment)</strong> tersendiri. Berikut rincian persis 1 m³ beton struktur di dashboard ini (lihat tab Standar Taiwan → Harga Satuan):",
      "Total NT$ 5.609 per m³ adalah <strong>直接單價</strong> — masih harus ditambah 5 markup di tingkat proyek (lihat kategori 預算書).",
    ],
    aEn: [
      "Unlike Indonesia which splits into Material + Labour only, Taiwan adds a dedicated <strong>機具 (Equipment)</strong> row. Here is the exact breakdown of 1 m³ of structural concrete on this dashboard (see the Taiwan Standard → Unit Price tab):",
      "The NT$ 5,609 per m³ total is the <strong>直接單價</strong> (direct unit price) — still has to receive 5 layers of markup at project level (see the 預算書 category).",
    ],
    tableId: {
      head: ["Komponen", "Item", "Koefisien × Harga", "Subtotal"],
      rows: [
        ["材料", "預拌混凝土 fc'210",   "1,020 × NT$ 3.200", "NT$ 3.264"],
        ["材料", "泵送 (pumping)",       "1,000 × NT$ 380",   "NT$ 380"],
        ["人工", "技術工 (skilled)",     "0,250 × NT$ 3.000", "NT$ 750"],
        ["人工", "普通工 (labour)",      "0,450 × NT$ 2.500", "NT$ 1.125"],
        ["機具", "震動機 (vibrator)",    "0,100 × NT$ 900",   "NT$ 90"],
        ["",     "直接單價 (Direct UP)", "",                  "NT$ 5.609"],
      ],
    },
    tableEn: {
      head: ["Bucket", "Item", "Coefficient × Price", "Subtotal"],
      rows: [
        ["材料", "預拌混凝土 fc'210 ready-mix",  "1.020 × NT$ 3,200", "NT$ 3,264"],
        ["材料", "泵送 (concrete pumping)",      "1.000 × NT$ 380",   "NT$ 380"],
        ["人工", "技術工 (skilled worker)",      "0.250 × NT$ 3,000", "NT$ 750"],
        ["人工", "普通工 (general labourer)",    "0.450 × NT$ 2,500", "NT$ 1,125"],
        ["機具", "震動機 (vibrator)",            "0.100 × NT$ 900",   "NT$ 90"],
        ["",     "Direct Unit Price",            "",                  "NT$ 5,609"],
      ],
    },
    noteId: "Perhatikan tidak ada baris semen / pasir / kerikil. Itu sudah include di harga 預拌混凝土 dari pabrik. Itulah keuntungan ready-mix — administrasi AHSP jadi lebih ringkas, dan QC kuat di pabrik.",
    noteEn: "Notice there is no separate cement / sand / gravel line. Those are already inside the 預拌混凝土 plant price. That is the win of ready-mix — leaner AHSP paperwork and tighter QC at the plant.",
  },
  {
    qId: "Kenapa Taiwan tidak menyisipkan OHP 10% di harga satuan?",
    qEn: "Why doesn't Taiwan embed a 10% OHP into the unit price?",
    aId: [
      "Filosofi <strong>PCC 公共工程委員會</strong> adalah <em>transparansi penuh</em> untuk proyek publik. Jika overhead & profit diselipkan ke harga satuan, sulit memeriksa apakah kontraktor mengambil margin wajar.",
      "Solusi PCC: 直接單價 adalah harga langsung murni. Semua biaya tak langsung dipisahkan menjadi <strong>5 lapis markup</strong> di akhir 預算書 — supaya tiap kategori (manajemen, profit, QC, K3, pajak) bisa dilihat, diaudit, dan dinegosiasikan terpisah.",
      "Konsekuensi: harga satuan Taiwan tampak <em>lebih murah</em> dibanding rekan Indonesia kalau dilihat sebaris saja. Tetapi setelah 5 markup ditambahkan, total proyek bisa lebih besar.",
    ],
    aEn: [
      "The <strong>PCC 公共工程委員會</strong> philosophy is <em>full transparency</em> for public works. If overhead & profit are slipped into the unit price, it is hard to check whether the contractor is taking a fair margin.",
      "PCC's solution: 直接單價 stays as pure direct cost. All indirect costs are split into <strong>5 markup layers</strong> at the end of the 預算書 — so each bucket (management, profit, QC, EHS, tax) can be seen, audited, and negotiated separately.",
      "Consequence: a Taiwan unit price <em>looks cheaper</em> than its Indonesian counterpart line-for-line. But once the 5 markups apply, the project total can be higher.",
    ],
  },
];

const DEEP_RAB_TW = [
  {
    qId: "Bagaimana 預算總額 (Total Anggaran) Taiwan dihitung?",
    qEn: "How is the Taiwan 預算總額 (project total) computed?",
    aId: [
      "Rumus utama tetap: <strong>項目總價 = 工程量 × 直接單價</strong>. Volume 工程量 berasal dari model BIM Revit yang sama dipakai Indonesia — yang berbeda hanya harganya.",
      "Setelah seluruh baris dijumlahkan → <strong>工程直接費 (Total Direct Cost)</strong>. Kemudian 5 lapis markup ditambahkan berurutan menghasilkan <strong>預算總額 (Project Total)</strong>.",
      "Contoh: beton 32,4 m³ × NT$ 5.609 = NT$ 181.732. Setelah seluruh item lain dijumlah, jumlah direct cost menjadi basis perhitungan markup berlapis.",
    ],
    aEn: [
      "The core formula stays: <strong>Item Total = 工程量 × 直接單價</strong>. Quantities come from the same Revit BIM model used for Indonesia — only the prices differ.",
      "Sum every row → <strong>工程直接費 (Total Direct Cost)</strong>. Then 5 markup layers stack on top to give the <strong>預算總額 (Project Total)</strong>.",
      "Example: concrete 32.4 m³ × NT$ 5,609 = NT$ 181,732. After every other item is summed, the direct-cost subtotal becomes the base for the layered markups.",
    ],
    formulaId: "預算總額 = 工程直接費 + 工程管理費 + 利潤 + 品管費 + 環安衛費 + 營業稅",
    formulaEn: "Project Total = Direct Cost + Mgmt Fee + Profit + QC Fee + EHS Fee + Business Tax",
  },
  {
    qId: "Apa fungsi 5 lapis markup PCC, dan kenapa harus dipisah?",
    qEn: "What does each of the 5 PCC markup layers do, and why split them?",
    aId: [
      "Setiap lapis berdiri sendiri sehingga pemilik proyek bisa <em>menyetujui atau menego per kategori</em>:",
      "① <strong>工程管理費 7%</strong> — biaya site office, project manager, engineers, drafter, supplies kantor, ATK, sewa kantor lapangan.",
      "② <strong>利潤 5%</strong> — laba bersih kontraktor. Angka standar PCC; bisa direvisi bila kompleksitas tinggi.",
      "③ <strong>品管費 1%</strong> — quality control: material testing (slump test, compression test), third-party inspection, dokumentasi QA.",
      "④ <strong>環安衛費 1,5%</strong> — Environment + Safety + Health: PPE (helmet, harness), safety officer di lapangan, dust control, 災害保險, training K3.",
      "⑤ <strong>營業稅 5%</strong> — pajak konsumsi (Business Tax / VAT-equivalent) atas SUBTOTAL akumulasi keempat di atas. Bukan atas direct cost saja.",
    ],
    aEn: [
      "Each layer stands alone, so the owner can <em>approve or negotiate per category</em>:",
      "① <strong>工程管理費 7%</strong> — site office, project manager, engineers, drafters, office supplies, field-office rent.",
      "② <strong>利潤 5%</strong> — contractor's net profit. PCC's standard figure; can be revised for high-complexity work.",
      "③ <strong>品管費 1%</strong> — quality control: material testing (slump, compression), third-party inspection, QA documentation.",
      "④ <strong>環安衛費 1.5%</strong> — Environment + Safety + Health: PPE (helmet, harness), site safety officer, dust control, 災害保險, EHS training.",
      "⑤ <strong>營業稅 5%</strong> — consumption tax (Business Tax / VAT-equivalent), applied to the running SUBTOTAL of the first four — not to the direct cost alone.",
    ],
    tableId: {
      head: ["Layer", "Persentase", "Basis perhitungan"],
      rows: [
        ["工程管理費",  "7,0%",  "工程直接費"],
        ["利潤",        "5,0%",  "工程直接費"],
        ["品管費",      "1,0%",  "工程直接費"],
        ["環安衛費",    "1,5%",  "工程直接費"],
        ["營業稅",      "5,0%",  "Σ subtotal di atas"],
      ],
    },
    tableEn: {
      head: ["Layer", "Percentage", "Applied to"],
      rows: [
        ["工程管理費 Mgmt Fee", "7.0%", "工程直接費"],
        ["利潤 Profit",         "5.0%", "工程直接費"],
        ["品管費 QC Fee",       "1.0%", "工程直接費"],
        ["環安衛費 EHS Fee",    "1.5%", "工程直接費"],
        ["營業稅 Bus. Tax",     "5.0%", "Σ subtotal above"],
      ],
    },
    noteId: "Efek riil: total markup ≈ 21,1% terhadap 工程直接費 — jauh lebih besar dari 10% OHP + 11% PPN Indonesia (≈ 22,1% gabungan). Walau angka mirip, struktur transparansinya berbeda.",
    noteEn: "Real effect: total markup ≈ 21.1% on top of 工程直接費 — quite close to Indonesia's combined 10% OHP + 11% VAT (≈ 22.1%). The numbers land near each other, but the transparency structure is different.",
  },
  {
    qId: "Kenapa 營業稅 5% dihitung di subtotal, bukan langsung di direct cost?",
    qEn: "Why is 營業稅 5% taken on the subtotal, not directly on the direct cost?",
    aId: [
      "<strong>營業稅 (yíngyè shuì)</strong> — Business Tax / 加值型營業稅 — mengikuti UU <em>加值型及非加值型營業稅法</em>. Pajak ini dikenakan pada <strong>nilai tambah total transaksi</strong>, bukan hanya biaya langsung.",
      "Karena 工程管理費 + 利潤 + 品管費 + 環安衛費 adalah bagian dari nilai jual akhir kontraktor ke pemilik proyek, mereka juga merupakan <em>nilai kena pajak</em>. Maka 5% dihitung di subtotal kumulatif.",
      "Logikanya sama seperti PPN Indonesia 11% — dihitung di harga jual akhir, bukan harga modal. Hanya saja tarifnya lebih rendah (5%).",
    ],
    aEn: [
      "<strong>營業稅 (yíngyè shuì)</strong> — Business Tax / 加值型營業稅 — follows the Taiwan <em>Value-Added and Non-Value-Added Business Tax Act</em>. The tax is on the <strong>total added value of the transaction</strong>, not just the direct cost.",
      "Because 工程管理費 + 利潤 + 品管費 + 環安衛費 are all parts of the contractor's final sales value to the owner, they are also <em>taxable</em>. Hence the 5% applies to the running subtotal.",
      "Mechanically identical to Indonesia's 11% VAT — computed on the final selling price, not the cost price. Just at a lower rate (5%).",
    ],
    formulaId: "營業稅 = (工程直接費 + 管理 + 利潤 + 品管 + 環安衛) × 0,05",
    formulaEn: "營業稅 = (Direct Cost + Mgmt + Profit + QC + EHS) × 0.05",
  },
  {
    qId: "Apa arti 權重% (Bobot) di 預算書?",
    qEn: "What does 權重% (Weight) mean in the 預算書?",
    aId: [
      "<strong>權重 (quánzhòng)</strong> = porsi biaya satu item terhadap 預算總額. Rumusnya identik secara matematis dengan Bobot Indonesia, hanya satuannya NT$.",
      "權重 inilah <em>jantung</em> dari 進度曲線 (S-curve) Taiwan: tanpa 權重, mustahil menggambar progres rencana per minggu.",
      "Jumlah seluruh 權重 = 100,00%. Hasil 99,8% atau 100,3% biasanya pembulatan — di dashboard ini selalu dinormalisasi.",
    ],
    aEn: [
      "<strong>權重 (quánzhòng)</strong> = an item's share of the 預算總額. Mathematically identical to Indonesia's Bobot, only the currency is NT$.",
      "權重 is the <em>heart</em> of Taiwan's 進度曲線 (S-curve): without it, you cannot draw a weekly progress baseline.",
      "All 權重 must sum to 100.00%. Getting 99.8% or 100.3% is rounding — the dashboard normalises automatically.",
    ],
    formulaId: "權重% = (項目總價 ÷ 預算總額) × 100",
    formulaEn: "Weight% = (Item total ÷ Project total) × 100",
  },
];

const DEEP_SCHED_TW = [
  {
    qId: "Bagaimana 工期 (Durasi Proyek) Taiwan ditentukan — kenapa 16 minggu?",
    qEn: "How is Taiwan 工期 (project duration) set — why 16 weeks?",
    aId: [
      "Rumus dasar sama dengan Indonesia: <strong>工期 = 工程量 ÷ (生產率 × 班組數)</strong>. Tetapi <em>生產率 (productivity)</em> Taiwan lebih tinggi karena <strong>mekanisasi</strong>.",
      "Contoh konkret D.1 beton struktur (volume 32 m³):",
      "Indonesia: produktivitas 1,2 m³/hari/regu → 32 ÷ 1,2 ≈ 27 hari ≈ 5,4 minggu → 6 minggu (dibulatkan + curing buffer).",
      "Taiwan: produktivitas 1,5 m³/hari/regu (predmix + pump + mixer truck) → 32 ÷ 1,5 ≈ 21 hari ≈ 4,3 minggu → 5 minggu.",
      "Selisih per item bertumpuk → total proyek <strong>16 minggu</strong> di Taiwan vs 18 minggu di Indonesia.",
    ],
    aEn: [
      "Same core formula: <strong>Duration = 工程量 ÷ (Productivity × Number of crews)</strong>. But Taiwan's <em>productivity</em> is higher thanks to <strong>mechanisation</strong>.",
      "Concrete D.1 example (32 m³ volume):",
      "Indonesia: 1.2 m³/day/crew → 32 ÷ 1.2 ≈ 27 days ≈ 5.4 weeks → 6 weeks (rounded + curing buffer).",
      "Taiwan: 1.5 m³/day/crew (ready-mix + pump + mixer truck) → 32 ÷ 1.5 ≈ 21 days ≈ 4.3 weeks → 5 weeks.",
      "Per-item gains compound → <strong>16 weeks</strong> total in Taiwan vs 18 weeks in Indonesia.",
    ],
    formulaId: "工期 (天) = 工程量 ÷ (生產率 × 班組數)",
    formulaEn: "Duration (days) = Quantity ÷ (Productivity × Crew count)",
    tableId: {
      head: ["Faktor mekanisasi TW", "Dampak ke 生產率"],
      rows: [
        ["預拌混凝土 (ready-mix)",        "Hilangkan waktu aduk di lokasi"],
        ["Mixer truck + pump truck",      "Naikkan cor 25–30% per hari"],
        ["鋼筋預製 (prefab rebar cages)",  "Pasang rebar lebih cepat"],
        ["塔式起重機 (tower crane)",       "Angkut material vertikal cepat"],
      ],
    },
    tableEn: {
      head: ["TW mechanisation factor", "Productivity gain"],
      rows: [
        ["預拌混凝土 (ready-mix concrete)",  "Removes on-site batching time"],
        ["Mixer truck + pump truck",         "+25–30% pour rate per day"],
        ["鋼筋預製 (prefab rebar cages)",     "Faster rebar placement"],
        ["塔式起重機 (tower crane)",          "Fast vertical material lift"],
      ],
    },
  },
  {
    qId: "Apa itu 前置作業 (predecessor) dan tipe-tipenya?",
    qEn: "What is 前置作業 (predecessor) and what types exist?",
    aId: [
      "<strong>前置作業 (qiánzhì zuòyè)</strong> = aktivitas yang harus selesai/dimulai sebelum aktivitas lain bisa berjalan. Konsep diadopsi dari PMBoK (Project Management Body of Knowledge) yang dipakai luas di Taiwan via 中華專案管理學會 (Taiwan PMI chapter).",
      "Logikanya identik dengan Indonesia: kolom (D.1) butuh pondasi (C.2) selesai dulu → C.2 adalah 前置作業 dari D.1.",
      "Empat tipe relasi (sama dengan PMBoK internasional):",
      "<strong>完成-開始 (Finish-to-Start, FS)</strong> — A selesai, B mulai. Paling umum.",
      "<strong>開始-開始 (Start-to-Start, SS)</strong> — B mulai bersamaan A.",
      "<strong>完成-完成 (Finish-to-Finish, FF)</strong> — B selesai bersamaan A.",
      "<strong>開始-完成 (Start-to-Finish, SF)</strong> — jarang dipakai.",
      "Dashboard ini pakai FS untuk semua link.",
    ],
    aEn: [
      "<strong>前置作業 (qiánzhì zuòyè)</strong> = an activity that must finish/start before another can proceed. The concept is adopted from PMBoK (Project Management Body of Knowledge), used widely in Taiwan via 中華專案管理學會 (Taiwan PMI chapter).",
      "Logic is identical to Indonesia: columns (D.1) need footings (C.2) first → C.2 is the 前置作業 of D.1.",
      "Four link types (same as international PMBoK):",
      "<strong>完成-開始 (Finish-to-Start, FS)</strong> — A finishes, B starts. Most common.",
      "<strong>開始-開始 (Start-to-Start, SS)</strong> — B starts together with A.",
      "<strong>完成-完成 (Finish-to-Finish, FF)</strong> — B finishes together with A.",
      "<strong>開始-完成 (Start-to-Finish, SF)</strong> — rarely used.",
      "This dashboard uses FS for every link.",
    ],
  },
  {
    qId: "Atas dasar apa pekerjaan dipaketkan menjadi WBS / 工種?",
    qEn: "On what basis are tasks packaged into WBS / 工種?",
    aId: [
      "<strong>工作分解結構 (gōngzuò fēnjiě jiégòu, WBS)</strong> — atau 工種 (gōngzhǒng, work-trade) — adalah pembagian total proyek menjadi grup berdasarkan <em>jenis teknis pekerjaan</em>, bukan biaya.",
      "Standar PCC mengikuti urutan klasik konstruksi gedung dari bawah ke atas:",
      "Di dalam grup, item lebih detail (mis. C.2 footplat beton, C.3 lean concrete) — dipilih sesuai jenis pondasi proyek.",
    ],
    aEn: [
      "<strong>工作分解結構 (gōngzuò fēnjiě jiégòu, WBS)</strong> — also called 工種 (gōngzhǒng, work-trade) — slices the whole project into groups by <em>technical purpose</em>, not by cost.",
      "PCC follows the classic building order, bottom-up:",
      "Inside a group, items get more specific (e.g. C.2 footing, C.3 lean concrete) — chosen to match the project's actual foundation type.",
    ],
    tableId: {
      head: ["Kode", "中文 / Group", "Indonesia equiv."],
      rows: [
        ["A", "整地 zhěngdì",   "Persiapan / site prep"],
        ["B", "土方 tǔfāng",    "Pekerjaan tanah & galian"],
        ["C", "基礎 jīchǔ",     "Pondasi"],
        ["D", "結構 jiégòu",    "Struktur beton & tulangan"],
        ["E", "裝修 zhuāngxiū", "Arsitektur / finishing"],
        ["F", "屋頂 wūdǐng",    "Atap"],
        ["G", "機電 jīdiàn",    "Mechanical / Electrical / Plumbing"],
        ["H", "收尾 shōuwěi",   "Finishing akhir & pembersihan"],
      ],
    },
    tableEn: {
      head: ["Code", "中文 / Group", "English equivalent"],
      rows: [
        ["A", "整地 zhěngdì",   "Site preparation"],
        ["B", "土方 tǔfāng",    "Earthworks"],
        ["C", "基礎 jīchǔ",     "Foundation"],
        ["D", "結構 jiégòu",    "Concrete structure & reinforcement"],
        ["E", "裝修 zhuāngxiū", "Architecture / interior finishing"],
        ["F", "屋頂 wūdǐng",    "Roofing"],
        ["G", "機電 jīdiàn",    "MEP (mechanical / electrical / plumbing)"],
        ["H", "收尾 shōuwěi",   "Final finishing & cleanup"],
      ],
    },
  },
  {
    qId: "Cara membaca 甘特圖 (Gantt chart) PCC?",
    qEn: "How do I read the PCC 甘特圖 (Gantt chart)?",
    aId: [
      "<strong>甘特圖 (gāntè tú)</strong> — Gantt chart — adalah representasi <em>kalender raksasa</em> yang diputar 90°. Konvensi pembacaan internasional, dipakai sama di Taiwan.",
      "<strong>Sumbu horizontal (橫軸)</strong> = waktu, satuannya 週 (week). Minggu 1 di kiri, minggu 16 di kanan.",
      "<strong>Sumbu vertikal (縱軸)</strong> = daftar pekerjaan (WBS A → H, dari atas ke bawah).",
      "Setiap baris berisi <strong>satu bar berwarna</strong>: posisi kiri = minggu mulai, posisi kanan = minggu selesai, panjang = 工期 (durasi). Warna mengikuti grup WBS.",
      "Bila dua bar pada baris berbeda tumpang tindih → pekerjaan <strong>paralel</strong> (dilakukan regu berbeda).",
      "<strong>關鍵路徑 (guānjiàn lùjìng, critical path)</strong> adalah rangkaian pekerjaan yang menentukan total 工期. Mundur 1 minggu di salah satunya = proyek mundur 1 minggu. Biasanya: A → B → C → D → E → H.",
    ],
    aEn: [
      "<strong>甘特圖 (gāntè tú)</strong> — Gantt chart — is a <em>giant calendar</em> rotated 90°. Reading convention is the international standard, used the same way in Taiwan.",
      "<strong>Horizontal axis (橫軸)</strong> = time, unit 週 (week). Week 1 on the left, week 16 on the right.",
      "<strong>Vertical axis (縱軸)</strong> = task list (WBS A → H, top-to-bottom).",
      "Each row has <strong>one coloured bar</strong>: left edge = start week, right edge = finish week, length = 工期 (duration). Colour follows WBS group.",
      "If two bars on different rows overlap vertically → the tasks run in <strong>parallel</strong> (different crews).",
      "<strong>關鍵路徑 (guānjiàn lùjìng, critical path)</strong> is the chain of tasks that fixes the total 工期. Slip any of them by a week and the whole project slips a week. Usually: A → B → C → D → E → H.",
    ],
    noteId: "Tip lapangan: kalau Anda lihat bar yang sangat pendek tetap menempati 1 minggu penuh, itu karena minimum durasi di sistem PCC adalah 1 週 (week) — pekerjaan harian biasanya digabungkan ke paket mingguan.",
    noteEn: "Field tip: a very short bar still occupies one whole week because the minimum duration in the PCC system is 1 週 — daily tasks are usually rolled up into a weekly package.",
  },
];

const DEEP_SCURVE_TW = [
  {
    qId: "Bagaimana 進度曲線 (S-Curve Taiwan) terbentuk?",
    qEn: "How is Taiwan's 進度曲線 (S-curve) built?",
    aId: [
      "<strong>進度曲線 (jìndù qūxiàn)</strong> — kadang ditulis <em>S曲線</em> — adalah kurva kumulatif progres rencana. Pembentukannya tiga langkah, identik secara matematis dengan Indonesia, hanya berbasis NT$.",
      "<strong>Langkah 1</strong> — hitung 權重% tiap item dari 預算書. Mis. beton struktur ≈ 9,1% dari 預算總額.",
      "<strong>Langkah 2</strong> — bagi 權重 rata sepanjang 工期. 9,1% ÷ 5 minggu = 1,82%/minggu di minggu 4–8.",
      "<strong>Langkah 3</strong> — tiap minggu, jumlahkan 權重 semua item aktif → <strong>週進度 (Weekly Plan)</strong>. Akumulasi dari minggu 1 → <strong>累積進度 (Cumulative)</strong>. Garis kumulatif inilah 進度曲線.",
    ],
    aEn: [
      "<strong>進度曲線 (jìndù qūxiàn)</strong> — sometimes written <em>S曲線</em> — is the cumulative planned progress curve. The build is three steps, mathematically identical to Indonesia, just in NT$.",
      "<strong>Step 1</strong> — compute 權重% per item from the 預算書. E.g. structural concrete ≈ 9.1% of the 預算總額.",
      "<strong>Step 2</strong> — spread the 權重 evenly across the 工期. 9.1% ÷ 5 weeks = 1.82%/week in weeks 4–8.",
      "<strong>Step 3</strong> — each week, sum the 權重 of every active item → <strong>週進度 (Weekly Plan)</strong>. Cumulate from week 1 → <strong>累積進度 (Cumulative)</strong>. That cumulative line is the 進度曲線.",
    ],
    formulaId: "週進度ₙ = Σ (權重 / 工期) 所有 active 項目, in week n      累積進度ₙ = Σ 週進度, 1..n",
    formulaEn: "Weekly Planₙ = Σ (Weight ÷ Duration) for all items active in week n      Cumulativeₙ = Σ Weekly Plan, 1..n",
  },
  {
    qId: "Kenapa bentuknya menyerupai huruf S?",
    qEn: "Why does it look like the letter S?",
    aId: [
      "Karena bobot per minggu <strong>tidak rata sepanjang proyek</strong>. Pola khas konstruksi Taiwan (sama secara prinsip dengan Indonesia, hanya total proyek lebih pendek):",
      "<strong>早期 (zǎoqī, awal):</strong> 整地 + 土方 — 權重 kecil, kurva landai.",
      "<strong>中期 (zhōngqī, tengah):</strong> 基礎 + 結構 + 裝修 — 權重 terbesar (60–70% biaya total), kurva curam.",
      "<strong>後期 (hòuqī, akhir):</strong> 收尾 + 油漆 — banyak item kecil, kurva landai lagi.",
      "Tiga fase ini (landai → curam → landai) menghasilkan siluet huruf S. Bila kurva Anda naik linier saja, jadwal mungkin belum realistis (kemungkinan semua bobot disebar terlalu rata).",
    ],
    aEn: [
      "Because per-week weights are <strong>not uniform across the project</strong>. The typical Taiwan construction pattern (same principle as Indonesia, just shorter total):",
      "<strong>早期 (zǎoqī, early):</strong> 整地 + 土方 — small weights, flat curve.",
      "<strong>中期 (zhōngqī, middle):</strong> 基礎 + 結構 + 裝修 — heaviest weights (60–70% of total cost), steep curve.",
      "<strong>後期 (hòuqī, late):</strong> 收尾 + 油漆 — many small items, flat again.",
      "These three phases (flat → steep → flat) give the S silhouette. If your curve rises linearly, the schedule may not be realistic (likely all weights are spread too evenly).",
    ],
  },
  {
    qId: "Cara memakai 進度曲線 di lapangan — 進度落後 / 進度超前?",
    qEn: "How is the 進度曲線 used on site — 進度落後 / 進度超前?",
    aId: [
      "Kurva rencana adalah <strong>baseline (基準線)</strong>. Setiap minggu, 工地監造 (site supervisor) mencatat <strong>實際進度 (actual progress)</strong> berdasarkan pekerjaan terlaksana, lalu plot di kurva yang sama.",
      "<strong>實際 < 計畫</strong> → <strong>進度落後 (jìndù luòhòu)</strong> — proyek terlambat. Tindakan: lembur (加班), tambah regu, atau revisi target dengan owner.",
      "<strong>實際 > 計畫</strong> → <strong>進度超前 (jìndù chāoqián)</strong> — proyek lebih cepat. Hati-hati: kadang karena pekerjaan mudah didahulukan; kurva bisa “menukik” saat pekerjaan sulit tiba.",
      "Rasio kuantitatifnya: <strong>進度績效指標 (jìndù jīxiào zhǐbiāo, SPI)</strong> = 實際 ÷ 計畫. SPI 1,0 = tepat. >1,0 = lebih cepat. <1,0 = terlambat.",
    ],
    aEn: [
      "The planned curve is the <strong>baseline (基準線)</strong>. Each week the 工地監造 (site supervisor) records <strong>實際進度 (actual progress)</strong> from completed work and plots it on the same chart.",
      "<strong>Actual < Plan</strong> → <strong>進度落後 (jìndù luòhòu)</strong> — behind schedule. Remedies: overtime (加班), extra crews, or renegotiate targets with the owner.",
      "<strong>Actual > Plan</strong> → <strong>進度超前 (jìndù chāoqián)</strong> — ahead. Be careful: sometimes easy tasks are done first; the curve can dip later when the hard tasks arrive.",
      "Quantitative ratio: <strong>進度績效指標 (jìndù jīxiào zhǐbiāo, SPI)</strong> = Actual ÷ Plan. SPI 1.0 = on schedule. >1.0 = ahead. <1.0 = behind.",
    ],
    noteId: "Sumbu Y dalam % (bukan NT$). 進度曲線 mengukur PROGRES, bukan pengeluaran kas. Untuk cash-flow Taiwan pakai 資金流量曲線 yang berbeda.",
    noteEn: "Y-axis is in % (not NT$). The 進度曲線 measures PROGRESS, not cash spent. Taiwan uses a different 資金流量曲線 (cash-flow curve) for spending.",
  },
  {
    qId: "Apa hubungan 進度表 (tabel) dan 進度曲線 (kurva)?",
    qEn: "How is the 進度表 (table) related to the 進度曲線 (curve)?",
    aId: [
      "<strong>進度表 (jìndù biǎo)</strong> adalah <strong>data mentah</strong> di balik kurva. Tiap baris = satu item WBS, tiap kolom = satu 週 (minggu).",
      "Sel berisi <strong>persen 權重 item itu yang dialokasikan minggu tersebut</strong>. Sel kosong = item tidak aktif minggu itu.",
      "Jumlah satu BARIS = 權重 total item di 預算書. Jumlah satu KOLOM = 週進度 (Weekly Plan) pada 進度曲線. Akumulasi kolom (dari kiri) = 累積進度 (Cumulative) pada kurva.",
      "Jadi tabel dan kurva adalah pasangan: <strong>tabel untuk membaca angka tepat, kurva untuk membaca trend secara visual</strong>. Auditor PCC fokus ke tabel; site team fokus ke kurva.",
    ],
    aEn: [
      "The <strong>進度表 (jìndù biǎo)</strong> is the <strong>raw data</strong> behind the curve. Each row = one WBS item, each column = one 週 (week).",
      "A cell shows <strong>the % of that item's 權重 allocated to that week</strong>. Empty cells = item inactive that week.",
      "Row sum = item's total 權重 in the 預算書. Column sum = the 週進度 (Weekly Plan) point on the 進度曲線. Running column sum = 累積進度 (Cumulative) on the curve.",
      "So the table and the curve are a pair: <strong>read precise numbers from the table; read trends visually from the curve</strong>. PCC auditors focus on the table; site teams focus on the curve.",
    ],
  },
];

const DEEP_CATEGORIES_TW = [
  { key: "ahsp",  num: "01", items: DEEP_AHSP_TW,   labelId: "Anatomi 單價分析 (Unit-Price Analysis)", labelEn: "Anatomy of 單價分析 (Unit-Price Analysis)", labelZh: "單價分析解析" },
  { key: "rab",   num: "02", items: DEEP_RAB_TW,    labelId: "Anatomi 預算書 (Project Budget)",        labelEn: "Anatomy of the 預算書 (Project Budget)",    labelZh: "預算書解析" },
  { key: "sched", num: "03", items: DEEP_SCHED_TW,  labelId: "Anatomi 工期 & 工種 (Schedule & WBS)",   labelEn: "Anatomy of the 工期 & 工種 (Schedule & WBS)", labelZh: "工期與工種 (WBS) 解析" },
  { key: "sc",    num: "04", items: DEEP_SCURVE_TW, labelId: "Anatomi 進度曲線 & 進度表 (S-Curve)",    labelEn: "Anatomy of the 進度曲線 & 進度表 (S-Curve)", labelZh: "進度曲線與進度表解析" },
];

function GuidePage({ lang, onOpen }) {
  const t = window.estTt(lang);
  const L = (id, en, zh) => (lang === "zh" ? (zh || en || id) : lang === "en" ? (en || id) : id);

  // Active standard inside the deep-dive (separate from app-level menu).
  // Persisted so the reader stays where they left off.
  const [std, setStd] = React.useState(() => localStorage.getItem("bim_guideStd") || "id");
  React.useEffect(() => { localStorage.setItem("bim_guideStd", std); }, [std]);

  const cats = std === "tw" ? DEEP_CATEGORIES_TW : DEEP_CATEGORIES_ID;
  const stdC = std === "tw" ? "var(--teal)" : "var(--blue)";

  return (
    <div className="fade-in">
      <h2 className="section-title">{t("g_title")}</h2>
      <p className="section-desc">{t("g_intro")}</p>

      {/* ----- Section 1: 7-step high-level flow ----- */}
      <div className="guide-flow">
        {GUIDE_STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <GuideCard step={s} idx={i} lang={lang} onOpen={onOpen} t={t} />
            {i < GUIDE_STEPS.length - 1 && <div className="guide-arrow">↓</div>}
          </React.Fragment>
        ))}
      </div>

      {/* ----- Section 2: Anatomy of the numbers (deep-dive) ----- */}
      <div className="deep-section">
        <div className="deep-section-head">
          <span className="deep-section-kicker">{L("Mendalam", "Deep Dive", "深入解析")}</span>
          <h3 className="deep-section-title">
            {L("Anatomi Angka — Dari Mana Datangnya?",
               "Anatomy of the Numbers — Where Do They Come From?",
               "數字解析 — 它們從哪裡來?")}
          </h3>
        </div>
        <p className="deep-section-desc">
          {L("Pilih standar yang ingin dipelajari. Tiap standar dijelaskan dari nol pakai istilahnya sendiri — bukan sebagai perbedaan dari yang lain. Volume tetap datang dari model BIM Revit yang sama; yang berbeda adalah proses penetapan harga, markup, produktivitas, dan terminologinya.",
             "Pick which standard you want to learn. Each standard is explained from scratch on its own terms — not as a diff from the other. Volumes still come from the same Revit BIM model; what differs is the pricing process, the markup structure, the productivity assumptions, and the terminology.",
             "選擇您想學習的標準。每套標準均以其自身術語從零講起 — 不是當作另一者的差異。工程量仍來自同一個 Revit BIM 模型;不同之處在於定價流程、加價結構、生產率假設與術語。")}
        </p>

        <StdSwitch std={std} setStd={setStd} L={L} />

        <StdBanner std={std} L={L} />

        {cats.map((cat) => (
          <DeepCategory key={std + "-" + cat.key} cat={cat} lang={lang} L={L} />
        ))}
      </div>
    </div>
  );
}

function StdSwitch({ std, setStd, L }) {
  const opts = [
    { id: "id", chip: "SNI", labelId: "Standar Indonesia", labelEn: "Indonesian Standard", labelZh: "印尼標準",
      subId: "AHSP · PUPR",         subEn: "AHSP · PUPR",          subZh: "AHSP · PUPR" },
    { id: "tw", chip: "PCC", labelId: "Standar Taiwan",    labelEn: "Taiwan Standard",     labelZh: "臺灣標準",
      subId: "單價分析 · 公共工程",  subEn: "單價分析 · PCC",       subZh: "單價分析 · 公共工程" },
  ];
  return (
    <div className="deep-std-switch" role="tablist" aria-label="Standard">
      {opts.map((o) => (
        <button
          key={o.id}
          data-std={o.id}
          className={"deep-std-btn" + (std === o.id ? " active" : "")}
          onClick={() => setStd(o.id)}
          role="tab"
          aria-selected={std === o.id}
        >
          <span className="deep-std-chip">{o.chip}</span>
          <span>{L(o.labelId, o.labelEn, o.labelZh)}</span>
          <span className="deep-std-sub">{L(o.subId, o.subEn, o.subZh)}</span>
        </button>
      ))}
    </div>
  );
}

function StdBanner({ std, L }) {
  const isTw = std === "tw";
  const txt = isTw
    ? L(
        "Pricing pakai 單價分析 (3 komponen 材料/人工/機具, tanpa OHP di harga satuan). Markup 5 lapis di tingkat proyek (管理 7% · 利潤 5% · 品管 1% · 環安衛 1,5% · 營業稅 5%). Total durasi tipikal 16 minggu karena 預拌混凝土 + 機具 menaikkan 生產率 ~15%.",
        "Pricing uses 單價分析 (3 buckets 材料/人工/機具, with no OHP inside the unit price). 5-layer project markup (Mgmt 7% · Profit 5% · QC 1% · EHS 1.5% · Business Tax 5%). Typical total duration 16 weeks because ready-mix concrete + mechanisation lift productivity ~15%.",
        "採用 單價分析 (3 大類 材料/人工/機具,單價內不含管理利潤)。專案層級 5 層加價 (管理 7% · 利潤 5% · 品管 1% · 環安衛 1.5% · 營業稅 5%)。典型總工期 16 週,因預拌混凝土 + 機具讓生產率提升約 15%。"
      )
    : L(
        "Pricing pakai AHSP (Bahan + Upah, plus OHP 10% di tiap harga satuan). Markup tingkat proyek hanya PPN 11%. Total durasi tipikal 18 minggu dengan asumsi produktivitas regu standar SNI.",
        "Pricing uses AHSP (Material + Labour, plus 10% OHP embedded into every unit price). Project-level markup is just 11% VAT. Typical total duration 18 weeks at SNI's standard crew productivity.",
        "採用 AHSP (材料 + 人工,各單價內含 10% 管理利潤)。專案層級加價僅 11% PPN。典型總工期 18 週,假設 SNI 標準班組生產率。"
      );
  return (
    <div className="deep-std-banner" style={{ "--std-c": isTw ? "var(--teal)" : "var(--blue)" }}>
      <div className="deep-std-banner-flag">{isTw ? "TW" : "ID"}</div>
      <div>{txt}</div>
    </div>
  );
}

function GuideCard({ step, idx, lang, onOpen, t }) {
  const L = (id, en, zh) => (lang === "zh" ? (zh || en || id) : lang === "en" ? (en || id) : id);
  const block = (label, text) => (
    <div className="g-block">
      <div className="g-block-label">{label}</div>
      <div className="g-block-text">{text}</div>
    </div>
  );
  return (
    <div className="guide-card">
      <div className="guide-card-side" style={{ background: step.color }}>
        <div className="guide-num num">{String(idx + 1).padStart(2, "0")}</div>
        <div className="guide-dim num">{step.dim}</div>
      </div>
      <div className="guide-card-main">
        <div className="guide-card-title">{L(step.titleId, step.titleEn, step.titleZh)}</div>
        <div className="g-blocks">
          {block(t("g_what"), L(step.whatId, step.whatEn, step.whatZh))}
          {block(t("g_why"),  L(step.whyId,  step.whyEn,  step.whyZh))}
        </div>
        <div className="g-formula num">{L(step.formulaId, step.formulaEn, step.formulaZh)}</div>
        <div className="g-example">
          <span className="g-example-tag">{t("g_example")}</span>
          {L(step.exId, step.exEn, step.exZh)}
        </div>
        <button className="g-see" onClick={() => onOpen(step.target.menu, step.target.sub)}>
          {t("g_seeTab")}: <b style={{ marginLeft: 4 }}>{L(step.seeId, step.seeEn, step.seeZh)}</b> →
        </button>
      </div>
    </div>
  );
}

function DeepCategory({ cat, lang, L }) {
  const countWord = L("kartu", "cards", "張");
  return (
    <div className="deep-cat" data-cat={cat.key}>
      <div className="deep-cat-head">
        <div className="deep-cat-num">{cat.num}</div>
        <div className="deep-cat-name">{L(cat.labelId, cat.labelEn, cat.labelZh)}</div>
        <div className="deep-cat-count">{cat.items.length} {countWord}</div>
      </div>
      <div className="deep-list">
        {cat.items.map((it, i) => (
          <DeepCard key={cat.key + "-" + i} item={it} num={i + 1} lang={lang} L={L} />
        ))}
      </div>
    </div>
  );
}

function DeepCard({ item, num, lang, L }) {
  const [open, setOpen] = React.useState(false);
  const q     = L(item.qId, item.qEn, item.qZh);
  const aPars = L(item.aId, item.aEn, item.aZh);
  const note  = L(item.noteId, item.noteEn, item.noteZh);
  const form  = L(item.formulaId, item.formulaEn, item.formulaZh);
  const table = lang === "zh" ? (item.tableZh || item.tableEn || item.tableId)
              : lang === "en" ? (item.tableEn || item.tableId)
              : item.tableId;

  const noteLabel    = L("Catatan", "Note",    "備註");
  const formulaLabel = L("Rumus",   "Formula", "公式");
  const padded       = String(num).padStart(2, "0");

  return (
    <div className={"deep-card" + (open ? " open" : "")}>
      <button className="deep-q" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="deep-q-badge">{padded}</span>
        <span className="deep-q-text">{q}</span>
        <svg className="deep-q-caret" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="5 8 10 13 15 8" />
        </svg>
      </button>
      {open && (
        <div className="deep-a">
          <div className="deep-a-body">
            {aPars && aPars.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
            {form && (
              <div className="deep-formula">
                <div className="deep-formula-tag">{formulaLabel}</div>
                <div className="deep-formula-body">{form}</div>
              </div>
            )}
            {table && (
              <div className="deep-table-wrap">
                <table className="deep-table">
                  <thead>
                    <tr>{table.head.map((h, i) => <th key={i}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {table.rows.map((r, i) => (
                      <tr key={i}>{r.map((c, j) => (
                        <td key={j} className={j > 0 ? "num" : ""}>{c}</td>
                      ))}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {note && (
              <div className="deep-note">
                <span className="deep-note-tag">{noteLabel}</span>
                {note}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

window.GuidePage = GuidePage;
