/* app.jsx — shell, 4-menu nav, settings drawer, mount */
const { useState: useS, useEffect: useE } = React;

const MENUS = [
  { key: "overview", icon: "▦" },
  { key: "id",       icon: "🇮🇩" },
  { key: "tw",       icon: "🇹🇼" },
  { key: "guide",    icon: "✦" },
];

function Icon({ name }) {
  const p = {
    gear: "M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM19.4 13a7.6 7.6 0 000-2l2-1.5-2-3.4-2.3 1a7.6 7.6 0 00-1.7-1l-.3-2.5H10.9l-.3 2.5a7.6 7.6 0 00-1.7 1l-2.3-1-2 3.4 2 1.5a7.6 7.6 0 000 2l-2 1.5 2 3.4 2.3-1a7.6 7.6 0 001.7 1l.3 2.5h4.2l.3-2.5a7.6 7.6 0 001.7-1l2.3 1 2-3.4-2-1.5z",
    close: "M6 6l12 12M18 6L6 18",
    globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.4 2.5 2.4 15.5 0 18M12 3c-2.4 2.5-2.4 15.5 0 18",
    fsEnter: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
    fsExit:  "M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5",
  }[name];
  return (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={p} /></svg>);
}

function FullscreenButton({ lang }) {
  const [isFs, setIsFs] = useS(false);
  useE(() => {
    const sync = () => setIsFs(!!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement));
    ['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach((ev) => document.addEventListener(ev, sync));
    sync();
    return () => ['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach((ev) => document.removeEventListener(ev, sync));
  }, []);
  useE(() => {
    const onKey = (e) => {
      if (e.key !== 'f' && e.key !== 'F') return;
      if (e.target && /^(input|textarea|select)$/i.test(e.target.tagName)) return;
      if (e.target && e.target.isContentEditable) return;
      e.preventDefault(); toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  async function toggle() {
    try {
      if (!isFs) {
        const req = document.documentElement.requestFullscreen
                 || document.documentElement.webkitRequestFullscreen
                 || document.documentElement.msRequestFullscreen;
        if (req) await req.call(document.documentElement);
      } else {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
        if (exit) await exit.call(document);
      }
    } catch (e) { console.warn('FS toggle failed:', e); }
  }
  const title = lang === "zh" ? "全螢幕 (F)" : lang === "id" ? "Layar Penuh (F)" : "Fullscreen (F)";
  return (
    <button className={"fs-btn" + (isFs ? " is-active" : "")} onClick={toggle} title={title} aria-label={title}>
      <Icon name={isFs ? "fsExit" : "fsEnter"} />
    </button>
  );
}

function SettingsDrawer({ open, onClose, lang, setLang }) {
  const t = window.estTt(lang);
  return (
    <>
      <div className={"drawer-scrim" + (open ? " open" : "")} onClick={onClose} />
      <aside className={"drawer" + (open ? " open" : "")} role="dialog" aria-label={t("settings")}>
        <div className="drawer-head">
          <div>
            <div className="card-eyebrow">{t("settings")}</div>
            <div style={{ fontWeight: 600, fontSize: 15, marginTop: 2 }}>{lang === "zh" ? "偏好設定" : lang === "id" ? "Preferensi" : "Preferences"}</div>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        <div className="drawer-body">
          <div className="set-group">
            <div className="set-label" style={{ display: "flex", alignItems: "center", gap: 7 }}><Icon name="globe" />{t("language")}</div>
            <div className="seg col">
              {[["id", "Bahasa Indonesia", "ID"], ["en", "English", "EN"], ["zh", "繁體中文", "ZH"]].map(([v, label, flag]) => (
                <button key={v} className={"seg-btn" + (lang === v ? " active" : "")} onClick={() => setLang(v)}>
                  <span className="seg-flag">{flag}</span><span style={{ flex: 1, textAlign: "left" }}>{label}</span>
                  {lang === v && <span style={{ color: "var(--blue)", fontFamily: "var(--mono)" }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", lineHeight: 1.6, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            {lang === "zh"
              ? "切換語言會改變整個介面與指南。印尼標準 (IDR) 與臺灣標準 (TWD) 為上方兩個獨立分頁。"
              : lang === "id"
                ? "Bahasa mengubah seluruh antarmuka & panduan. Standar Indonesia (IDR) dan Taiwan (TWD) adalah dua menu terpisah di atas."
                : "Language switches the whole interface & guide. The Indonesian (IDR) and Taiwan (TWD) standards are two separate menus above."}
          </div>
        </div>
      </aside>
    </>
  );
}

function App() {
  const [menu, setMenu] = useS(() => localStorage.getItem("bim_menu") || "overview");
  const [subId, setSubId] = useS(() => localStorage.getItem("bim_subId") || "rab");
  const [subTw, setSubTw] = useS(() => localStorage.getItem("bim_subTw") || "rab");
  const [lang, setLang] = useS(() => localStorage.getItem("bim_lang") || "id");
  // Expose synchronously so formatters in charts.jsx pick up the new
  // currency suffix (jt/M vs M/B) on the SAME render as the toggle.
  window.BIM_LANG = lang;
  const [settingsOpen, setSettingsOpen] = useS(false);

  useE(() => { localStorage.setItem("bim_menu", menu); }, [menu]);
  useE(() => { localStorage.setItem("bim_subId", subId); }, [subId]);
  useE(() => { localStorage.setItem("bim_subTw", subTw); }, [subTw]);
  useE(() => { localStorage.setItem("bim_lang", lang); document.documentElement.lang = lang; }, [lang]);
  useE(() => {
    const onKey = (e) => { if (e.key === "Escape") setSettingsOpen(false); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);

  const t = window.estTt(lang);
  const go = (m, sub) => {
    setMenu(m);
    if (sub) { if (m === "id") setSubId(sub); else if (m === "tw") setSubTw(sub); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark">5D</div>
            <div className="brand-text">
              <div className="brand-title">{t("appTitle")}</div>
              <div className="brand-sub">{t("appSub")}</div>
            </div>
          </div>
          <div className="topbar-spacer" />
          <nav className="menu-nav">
            {MENUS.map((m) => (
              <button key={m.key} className={"menu-btn" + (menu === m.key ? " active" : "")} onClick={() => go(m.key)}>
                <span className="menu-ic">{m.icon}</span>{t("menu_" + m.key)}
              </button>
            ))}
          </nav>
          <a className="ext-link" href="cons-mgmt-process.html"
             onClick={(e) => {
               // Hand off fullscreen intent — destination page will request FS on first interaction
               try { sessionStorage.setItem('bim_auto_fs', '1'); } catch (_) {}
             }}
             title={lang === "zh" ? "流程指南 (新分頁)" : lang === "id" ? "Panduan Proses (slide deck)" : "Process Guide (slide deck)"}>
            <span className="ext-link-mark">◈</span>
            <span className="ext-link-text">{lang === "zh" ? "流程指南" : lang === "id" ? "Panduan Proses" : "Process Guide"}</span>
            <span className="ext-link-arr">↗</span>
          </a>
          <FullscreenButton lang={lang} />
          <button className="gear" onClick={() => setSettingsOpen(true)} aria-label={t("settings")}><Icon name="gear" /></button>
        </div>
        <nav className="menu-nav-mobile">
          {MENUS.map((m) => (
            <button key={m.key} className={"menu-btn" + (menu === m.key ? " active" : "")} onClick={() => go(m.key)}>
              <span className="menu-ic">{m.icon}</span>{t("menu_" + m.key)}
            </button>
          ))}
        </nav>
      </header>

      <div className="app">
        {menu === "overview" && <window.OverviewPage lang={lang} onOpen={go} />}
        {menu === "id" && <window.StandardPage lang={lang} stdKey="id" sub={subId} setSub={setSubId} />}
        {menu === "tw" && <window.StandardPage lang={lang} stdKey="tw" sub={subTw} setSub={setSubTw} />}
        {menu === "guide" && <window.GuidePage lang={lang} onOpen={go} />}
      </div>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} lang={lang} setLang={setLang} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
