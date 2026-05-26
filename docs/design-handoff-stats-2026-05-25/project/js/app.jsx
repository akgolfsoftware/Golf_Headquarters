// App shell — root, top toolbar, viewport toggle, page picker, tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "page": "hub",
  "viewport": "desktop",
  "heroVariant": "A",
  "italicAccent": true,
  "density": "regular",
  "accentSwatch": "lime"
}/*EDITMODE-END*/;

// Page registry — id, label, group, component name on window
const PAGES = [
  // Hovedsider
  { id: "hub",         num: "01", lbl: "Hub landing",        group: "Hovedsider", comp: "HubLanding",         path: "/stats" },
  { id: "pga",         num: "02", lbl: "PGA Tour hub",        group: "Hovedsider", comp: "PGAHub",             path: "/stats/pga" },
  { id: "kategori",    num: "03", lbl: "PGA kategori-detalj", group: "Hovedsider", comp: "PGAKategoriDetalj",  path: "/stats/pga/[kategori]" },
  { id: "putt",        num: "04", lbl: "Putt Explorer",       group: "Hovedsider", comp: "PuttExplorer",       path: "/stats/pga/putt-explorer" },

  // Spillere
  { id: "spillerbase", num: "05", lbl: "Norsk spillerbase",   group: "Spillere",   comp: "Spillerbase",        path: "/stats/spillere" },
  { id: "spiller",     num: "06", lbl: "Spillerprofil",       group: "Spillere",   comp: "Spillerprofil",      path: "/stats/spillere/[slug]" },
  { id: "pgaspillere", num: "21", lbl: "PGA spillerdatabase", group: "Spillere",   comp: "PGASpillerbase",     path: "/stats/pga/spillere" },
  { id: "sammenlign",  num: "10", lbl: "Sammenlign spillere", group: "Spillere",   comp: "SammenlignSpillere", path: "/stats/sammenlign-spillere" },

  // SG-sammenlign
  { id: "sg",          num: "07", lbl: "SG landing",          group: "SG-sammenlign", comp: "SGLanding",       path: "/stats/sg-sammenlign" },
  { id: "sgonb",       num: "08", lbl: "SG onboarding",       group: "SG-sammenlign", comp: "SGOnboarding",    path: "/stats/sg-sammenlign/start" },
  { id: "sgres",       num: "09", lbl: "SG resultat (wow)",   group: "SG-sammenlign", comp: "SGResultat",      path: "/stats/sg-sammenlign/resultat" },

  // Engasjement
  { id: "wrapped",     num: "11", lbl: "Wrapped (slides)",    group: "Engasjement", comp: "Wrapped",          path: "/stats/wrapped" },
  { id: "uka",         num: "12", lbl: "Ukentlig roundup",    group: "Engasjement", comp: "Roundup",          path: "/stats/uka" },
  { id: "quiz",        num: "17", lbl: "Quiz",                group: "Engasjement", comp: "Quiz",             path: "/stats/quiz" },
  { id: "blogg",       num: "18", lbl: "Blogg",               group: "Engasjement", comp: "Blog",             path: "/stats/blogg" },

  // Databaser
  { id: "leaderboards", num: "14", lbl: "Leaderboards",       group: "Databaser",  comp: "Leaderboards",       path: "/stats/leaderboards" },
  { id: "argang",      num: "15", lbl: "Årgang / kohort",     group: "Databaser",  comp: "ArgangKohort",       path: "/stats/aargang/[aar]" },
  { id: "baner",       num: "13", lbl: "Banedatabase",        group: "Databaser",  comp: "Banedatabase",       path: "/stats/baner" },
  { id: "klubber",     num: "22", lbl: "Klubbdatabase",       group: "Databaser",  comp: "Klubbdatabase",      path: "/stats/klubber" },
  { id: "tour",        num: "23", lbl: "Tour deep-dive",      group: "Databaser",  comp: "TourDeepDive",       path: "/stats/tour/[slug]" },
  { id: "sesong",      num: "24", lbl: "Sesong",              group: "Databaser",  comp: "Sesong",             path: "/stats/[aar]" },
  { id: "regions",     num: "25", lbl: "Regions",             group: "Databaser",  comp: "Regions",            path: "/stats/regions" },
  { id: "turnering",   num: "28", lbl: "Turneringsdetalj",    group: "Databaser",  comp: "Turneringsdetalj",   path: "/stats/turneringer/[slug]" },

  // Verktøy
  { id: "verktoy",     num: "26", lbl: "Verktøy (HCP, SG…)",  group: "Verktøy",   comp: "Verktoy",            path: "/stats/verktoy" },
  { id: "sok",         num: "27", lbl: "Global søk",          group: "Verktøy",   comp: "GlobalSok",          path: "/stats/sok" },

  // Innlogget
  { id: "minprog",     num: "16", lbl: "Min progresjon",      group: "Innlogget", comp: "MinProgresjon",      path: "/stats/min-progresjon" },
  { id: "portal",      num: "19", lbl: "Portal-dashboard",    group: "Innlogget", comp: "PortalStats",        path: "/portal/stats" },

  // Admin
  { id: "moderering",  num: "20", lbl: "CoachHQ moderering",  group: "Admin",     comp: "Moderering",         path: "/admin/stats/moderering" },
  { id: "admin",       num: "29", lbl: "Admin overview",      group: "Admin",     comp: "AdminOverview",      path: "/admin/stats/overview" },
];

function PagePicker({ current, onPick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const currentPage = PAGES.find(p => p.id === current);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Group pages
  const groups = {};
  PAGES.forEach(p => { (groups[p.group] = groups[p.group] || []).push(p); });

  return (
    <div className="page-picker" ref={ref}>
      <button className="page-picker-button" onClick={() => setOpen(!open)}>
        <span className="row" style={{ gap: 10 }}>
          <span className="page-picker-current-num">{currentPage.num}</span>
          <span>{currentPage.lbl}</span>
        </span>
        <Icon name={open ? "ChevronLeft" : "ChevronRight"} size={14} style={{ transform: open ? "rotate(90deg)" : "rotate(90deg)" }}/>
      </button>
      {open && (
        <div className="page-picker-menu">
          {Object.entries(groups).map(([group, pages]) => (
            <div key={group}>
              <div className="page-picker-group">{group}</div>
              {pages.map(p => (
                <button
                  key={p.id}
                  className={`page-picker-item ${p.id === current ? "current" : ""}`}
                  onClick={() => { onPick(p.id); setOpen(false); }}>
                  <span className="page-picker-item-num">{p.num}</span>
                  <span>{p.lbl}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SiteNav({ currentPage, onNav }) {
  const links = [
    { id: "stats", label: "PGA Stats", page: "pga" },
    { id: "spillere", label: "Spillere", page: "spillerbase" },
    { id: "sg", label: "SG-sammenlign", page: "sg" },
    { id: "blogg", label: "Analyser", page: "blogg" },
  ];
  return (
    <nav className="site-nav">
      <a className="site-nav-brand" href="#" onClick={(e) => { e.preventDefault(); onNav("hub"); }}>
        <span className="brand-mark">AK</span>
        Golf Stats
      </a>
      <div className="site-nav-links">
        {links.map(l => (
          <a key={l.id}
             href="#"
             onClick={(e) => { e.preventDefault(); onNav(l.page); }}
             className={l.page === currentPage ? "current" : ""}>
            {l.label}
          </a>
        ))}
      </div>
      <button className="site-nav-cta">
        <Icon name="Sparkles" size={14}/>
        PlayerHQ
      </button>
      <button className="mobile-menu-btn" aria-label="Meny">
        <Icon name="Menu" size={22}/>
      </button>
    </nav>
  );
}

function SiteFooter() {
  const D = window.AKG_DATA;
  return (
    <footer className="site-footer">
      <div className="footer-meta">
        AK GOLF STATS · {D.meta.sesong} · BYGGET I OSLO
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        <a className="site-footer-link" href="#">Om dataene</a>
        <a className="site-footer-link" href="#">DataGolf</a>
        <a className="site-footer-link" href="#">API</a>
        <a className="site-footer-link" href="#">Personvern</a>
      </div>
    </footer>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    const stage = document.querySelector(".artboard");
    if (stage) stage.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [t.page]);

  useEffect(() => {
    document.querySelectorAll(".italic-accent").forEach(el => {
      el.style.fontStyle = t.italicAccent ? "italic" : "normal";
    });
  }, [t.italicAccent, t.page]);

  useEffect(() => {
    const scales = { compact: 0.78, regular: 1, comfy: 1.18 };
    document.documentElement.style.setProperty("--density", scales[t.density] || 1);
  }, [t.density]);

  useEffect(() => {
    const swatches = { lime: "#D1F843", mint: "#A6F0B7", amber: "#F3CC4A", coral: "#F7A883" };
    document.documentElement.style.setProperty("--accent", swatches[t.accentSwatch] || swatches.lime);
  }, [t.accentSwatch]);

  const currentPage = PAGES.find(p => p.id === t.page) || PAGES[0];
  const PageComp = window[currentPage.comp];

  // Some pages need callbacks
  const pageProps = {};
  if (currentPage.comp === "HubLanding") pageProps.heroVariant = t.heroVariant;
  if (currentPage.comp === "Spillerbase") pageProps.onOpenSpiller = () => setTweak("page", "spiller");
  if (currentPage.comp === "SGLanding")   pageProps.onStart       = () => setTweak("page", "sgonb");
  if (currentPage.comp === "SGOnboarding") pageProps.onComplete   = () => setTweak("page", "sgres");

  // Pages that should not show the standard site nav (full-bleed)
  const isFullBleed = ["wrapped", "sgonb", "moderering", "admin"].includes(t.page);

  return (
    <div className="app-shell">
      <div className="toolbar">
        <div className="toolbar-brand">
          <span className="logo-dot"/>
          AK Golf Stats <span style={{ color: "var(--muted-fg)", fontWeight: 400, marginLeft: 8 }}>· Redesign · 29 sider</span>
        </div>

        <PagePicker current={t.page} onPick={(p) => setTweak("page", p)}/>

        <div className="toolbar-right">
          <div className="meta-strip">
            <span className="meta-live"><span className="meta-dot"/>LIVE · DataGolf sync</span>
          </div>
          <div className="viewport-toggle">
            <button className={`viewport-btn ${t.viewport === "desktop" ? "active" : ""}`}
                    onClick={() => setTweak("viewport", "desktop")}>
              Desktop
            </button>
            <button className={`viewport-btn ${t.viewport === "mobile" ? "active" : ""}`}
                    onClick={() => setTweak("viewport", "mobile")}>
              Mobil
            </button>
          </div>
        </div>
      </div>

      <div className="stage">
        <div className={`artboard ${t.viewport === "mobile" ? "mobile" : ""}`}
             data-screen-label={`${currentPage.num} ${currentPage.lbl}`}>
          {!isFullBleed && <SiteNav currentPage={t.page} onNav={(p) => setTweak("page", p)}/>}
          <PageComp {...pageProps}/>
          {!isFullBleed && <SiteFooter/>}
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Side"/>
        <TweakSelect label="Side"
          value={t.page}
          options={PAGES.map(p => ({ value: p.id, label: `${p.num} · ${p.lbl}` }))}
          onChange={(v) => setTweak("page", v)}/>

        <TweakSection label="Viewport"/>
        <TweakRadio label="Visning"
          value={t.viewport}
          options={[{ value: "desktop", label: "Desktop" }, { value: "mobile", label: "Mobil" }]}
          onChange={(v) => setTweak("viewport", v)}/>

        <TweakSection label="Hero (kun side 01)"/>
        <TweakSelect label="Variant"
          value={t.heroVariant}
          options={[
            { value: "A", label: "A · «Gratis. Alltid.»" },
            { value: "B", label: "B · «Hvor langt slår de egentlig?»" },
            { value: "C", label: "C · «Tall som forteller hele historien»" },
          ]}
          onChange={(v) => setTweak("heroVariant", v)}/>

        <TweakSection label="Stil"/>
        <TweakToggle label="Editorial italic"
          value={t.italicAccent}
          onChange={(v) => setTweak("italicAccent", v)}/>
        <TweakRadio label="Tetthet"
          value={t.density}
          options={["compact", "regular", "comfy"]}
          onChange={(v) => setTweak("density", v)}/>
        <TweakColor label="Accent"
          value={t.accentSwatch}
          options={["#D1F843", "#A6F0B7", "#F3CC4A", "#F7A883"]}
          onChange={(v) => {
            const map = { "#D1F843": "lime", "#A6F0B7": "mint", "#F3CC4A": "amber", "#F7A883": "coral" };
            setTweak("accentSwatch", map[v] || "lime");
          }}/>
      </TweaksPanel>
    </div>
  );
}

// Density CSS
const densityStyle = document.createElement("style");
densityStyle.textContent = `
  :root { --density: 1; }
  .section { padding: calc(96px * var(--density)) 64px; }
  .section-tight { padding: calc(64px * var(--density)) 64px; }
`;
document.head.appendChild(densityStyle);

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
