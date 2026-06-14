/**
 * /portal/planlegge?tab=turneringer — pixel-perfekt port av
 * docs/design-handoff/planlegge/planlegge-turneringer.html
 */

import "./styles.css";
import { PlanleggeSprite } from "./icons";
import { PlanleggeHeroTabs } from "./hero-tabs";

type DotKind = "olyo" | "srixon" | "garmin" | "klubb";

type SeasonDot = {
  kind: DotKind | "big";
  left: string;
  top: string;
  label: string;
};

const SEASON_DOTS: SeasonDot[] = [
  { kind: "klubb", left: "28.5%", top: "24px", label: "Klubb · Påskeåpningen · 12. apr · T-12 · fullført" },
  { kind: "olyo", left: "34.5%", top: "24px", label: "Olyo · Vårcup · 4. mai · T-4 · fullført" },
  { kind: "big", left: "43.8%", top: "18px", label: "Sørlandsåpent · 8. jun · 16 d" },
  { kind: "srixon", left: "48.5%", top: "24px", label: "Srixon · Oslo Open · 22. jun · påmeldt" },
  { kind: "garmin", left: "53%", top: "24px", label: "Garmin · NM jr · 14. jul · kvalifisert" },
  { kind: "klubb", left: "57%", top: "46px", label: "Klubb · Sommerfest · 28. jul · påmeldt" },
  { kind: "olyo", left: "62%", top: "24px", label: "Olyo Tour Finalen · 18. aug · trenger ranking" },
  { kind: "srixon", left: "68.5%", top: "46px", label: "Srixon · Høstcup · 6. sep · ikke påmeldt" },
  { kind: "garmin", left: "73%", top: "24px", label: "Garmin · NM jr finale · 24. sep · kvalifisert" },
];

type StatusKind = "forb" | "paam" | "ikke" | "full";

type Row = {
  date: { d: string; m: string; days: string; daysMuted?: boolean };
  name: string;
  badge: DotKind;
  badgeLabel: string;
  metaExtra: string[];
  venue: string;
  venueSub: string;
  status: { kind: StatusKind; label: string };
  prep: number;
  prepDash?: boolean;
  prepBarColor?: string;
  next?: boolean;
  dimmed?: boolean;
};

const ROWS: Row[] = [
  {
    date: { d: "08", m: "jun · ma", days: "om 16 d" },
    name: "Olyo · Sørlandsåpent",
    badge: "olyo",
    badgeLabel: "Olyo Tour",
    metaExtra: ["54 hull · HCP-krav ≤ 6,0", "· felt 84"],
    venue: "Kristiansand GK",
    venueSub: "320 km",
    status: { kind: "forb", label: "Forbereder" },
    prep: 62,
    prepBarColor: "var(--lime)",
    next: true,
  },
  {
    date: { d: "22", m: "jun · ma", days: "om 30 d", daysMuted: true },
    name: "Srixon · Oslo Open",
    badge: "srixon",
    badgeLabel: "Srixon",
    metaExtra: ["36 hull · HCP-krav ≤ 8,0"],
    venue: "Oslo GK · Bogstad",
    venueSub: "12 km",
    status: { kind: "paam", label: "Påmeldt" },
    prep: 24,
  },
  {
    date: { d: "14", m: "jul · ti", days: "om 52 d", daysMuted: true },
    name: "Garmin · NM Junior 18 år",
    badge: "garmin",
    badgeLabel: "Garmin NC",
    metaExtra: ["72 hull · HCP-krav ≤ 5,0", "· kvalifiseringsturnering"],
    venue: "Miklagard GK",
    venueSub: "38 km",
    status: { kind: "paam", label: "Påmeldt" },
    prep: 8,
  },
  {
    date: { d: "28", m: "jul · ti", days: "om 66 d", daysMuted: true },
    name: "Klubbmesterskap GFGK",
    badge: "klubb",
    badgeLabel: "Klubb",
    metaExtra: ["36 hull · åpen for medlemmer"],
    venue: "GFGK",
    venueSub: "4 km · hjemmebane",
    status: { kind: "paam", label: "Påmeldt" },
    prep: 0,
    prepDash: true,
  },
  {
    date: { d: "18", m: "aug · ti", days: "om 87 d", daysMuted: true },
    name: "Olyo Tour · Finalen",
    badge: "olyo",
    badgeLabel: "Olyo Tour",
    metaExtra: ["54 hull · invitasjon", "· trenger 280 ranking-poeng (har 128)"],
    venue: "Larvik GK",
    venueSub: "105 km",
    status: { kind: "ikke", label: "Ikke kval." },
    prep: 0,
    prepDash: true,
  },
  {
    date: { d: "04", m: "mai · ma", days: "19 d siden", daysMuted: true },
    name: "Olyo · Vårcup",
    badge: "olyo",
    badgeLabel: "Olyo Tour",
    metaExtra: ["36 hull · fullført", "· resultat T-4 (+3)"],
    venue: "Drammen GK",
    venueSub: "28 ranking-poeng",
    status: { kind: "full", label: "Fullført" },
    prep: 100,
    prepBarColor: "var(--success)",
    dimmed: true,
  },
  {
    date: { d: "12", m: "apr · sø", days: "41 d siden", daysMuted: true },
    name: "Klubb · Påskeåpningen",
    badge: "klubb",
    badgeLabel: "Klubb",
    metaExtra: ["18 hull · fullført", "· resultat T-12 (+7)"],
    venue: "GFGK",
    venueSub: "hjemmebane",
    status: { kind: "full", label: "Fullført" },
    prep: 100,
    prepBarColor: "var(--success)",
    dimmed: true,
  },
];

export function TurneringerScreen({
  playerName,
  playerInitials,
  hcp,
  seasonYear,
}: {
  playerName: string;
  playerInitials: string;
  hcp: number | null;
  seasonYear: number;
}) {
  const todayDay = new Date().getDate();

  return (
    <div className="planlegge-scope">
      <PlanleggeSprite />

      <main className="main">
        <header className="topbar">
          <a className="back" href="/portal">
            <svg fill="none" stroke="currentColor"><use href="#i-arrow-left" /></svg>
            PlayerHQ
          </a>
          <div className="player">
            <div className="avatar">{playerInitials}</div>
            <div>
              <div className="nm">{playerName}</div>
              <div className="sub">
                A1 · HCP {hcp != null ? hcp.toFixed(1).replace(".", ",") : "—"} · Sesong {seasonYear}
              </div>
            </div>
          </div>
        </header>

        <div className="page" style={{ maxWidth: "1380px" }}>
          <section className="hero">
            <div>
              <div className="eyebrow">PlayerHQ · Planlegge · Turneringer</div>
              <h1>
                Turneringer <em>i sesong</em> {seasonYear}
              </h1>
              <div className="sub">
                <strong style={{ color: "var(--ink)", fontWeight: 700 }}>7</strong> påmeldt
                <span className="dot" />
                <strong style={{ color: "var(--ink)", fontWeight: 700 }}>12</strong> kvalifisert for
                <span className="dot" />
                Neste: <strong style={{ color: "var(--forest)", fontWeight: 700 }}>Sørlandsåpent</strong> om 16 dager
              </div>
            </div>
            <div className="actions">
              <button className="btn btn-outline btn-sm">Eksporter kalender (.ics)</button>
              <button className="btn btn-primary">
                <svg fill="none" stroke="currentColor"><use href="#i-plus" /></svg>
                Meld på manuelt
              </button>
            </div>
          </section>

          <PlanleggeHeroTabs activeTab="turneringer" counts={{ treningsplan: 12, mal: 3, turneringer: 7, drills: 48 }} />

          {/* SUMMARY ROW */}
          <section className="summary-row">
            <div className="summary-tile">
              <div className="l">Påmeldt</div>
              <div className="v">7</div>
              <div className="s">3 i fullført sesong</div>
            </div>
            <div className="summary-tile">
              <div className="l">Forberedelse-snitt</div>
              <div className="v" style={{ color: "var(--warn)" }}>
                42<span className="u" style={{ fontSize: "14px", color: "var(--muted)", fontWeight: 500 }}>%</span>
              </div>
              <div className="s">2 turneringer trenger fokus</div>
            </div>
            <div className="summary-tile">
              <div className="l">Beste resultat {seasonYear}</div>
              <div className="v" style={{ fontSize: "20px", color: "var(--success)" }}>T-4</div>
              <div className="s">Olyo Vårcup · 04. mai</div>
            </div>
            <div className="summary-tile">
              <div className="l">WAGR-poeng {seasonYear}</div>
              <div className="v">
                128<span className="u" style={{ fontSize: "13px", color: "var(--muted)", fontWeight: 500 }}> p</span>
              </div>
              <div className="s">Trenger 280 for finalen</div>
            </div>
          </section>

          {/* SEASON OVERVIEW */}
          <section className="card season-card">
            <div className="card-h">
              <div>
                <div className="eyebrow">SESONG-OVERSIKT · {seasonYear}</div>
                <h2 style={{ marginTop: "4px" }}>Hele sesongen</h2>
              </div>
              <div className="right" style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--muted)", letterSpacing: "0.04em" }}>
                  Hover en prikk for detaljer
                </span>
              </div>
            </div>

            <div className="gantt">
              {["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"].map((m, i) => (
                <div key={m} className={`g-month${i === 4 ? " now" : ""}`}>
                  {m}
                  {i === 4 && <span className="day-tick">{todayDay}</span>}
                </div>
              ))}
            </div>

            <div className="season-track">
              {(["grunn", "opp", "spes", "konk", "over", "hvile"] as const).map((p, i) => (
                <div key={p} className={`period-bg ${p}`} style={{ left: `${i * 16.67}%`, width: "16.67%" }} />
              ))}
              <div className="today-line" style={{ left: "39.4%" }} />

              {SEASON_DOTS.map((d, i) => (
                <div
                  key={i}
                  className={`s-dot ${d.kind}`}
                  style={{ left: d.left, top: d.top }}
                >
                  <span className="lbl">{d.label}</span>
                </div>
              ))}
            </div>

            <div className="filter-row">
              <span className="lbl">Tour</span>
              <button className="fpill active">Alle <span className="ct">12</span></button>
              <button className="fpill olyo"><span className="dt" />Olyo <span className="ct">3</span></button>
              <button className="fpill srixon"><span className="dt" />Srixon <span className="ct">2</span></button>
              <button className="fpill garmin"><span className="dt" />Garmin NC <span className="ct">2</span></button>
              <button className="fpill klubb"><span className="dt" />Klubb <span className="ct">3</span></button>

              <span className="lbl" style={{ marginLeft: "14px" }}>HCP-krav max</span>
              <div className="hcp-slider">
                <span className="l">Krav</span>
                <div className="hcp-track">
                  <div className="fill" />
                  <div className="thumb" />
                </div>
                <span className="v">≤ 7,0</span>
              </div>

              <button className="btn btn-ghost btn-xs" style={{ marginLeft: "auto" }}>Nullstill filtre</button>
            </div>
          </section>

          {/* TOURNAMENT TABLE */}
          <section className="t-table">
            <div className="thead">
              <span>Dato</span>
              <span>Turnering</span>
              <span>Sted</span>
              <span>Status</span>
              <span>Forberedelse</span>
              <span />
            </div>

            {ROWS.map((r, i) => (
              <div key={i} className={`trow${r.next ? " next" : ""}`} style={r.dimmed ? { opacity: 0.74 } : undefined}>
                <div className="date-cell">
                  <span className="d">{r.date.d}</span>
                  <span className="m">{r.date.m}</span>
                  <span className="days" style={r.date.daysMuted ? { color: "var(--muted)" } : undefined}>
                    {r.date.days}
                  </span>
                </div>
                <div className="name-cell">
                  <div className="nm">{r.name}</div>
                  <div className="meta">
                    <span className={`tour-badge ${r.badge}`}>{r.badgeLabel}</span>
                    {r.metaExtra.map((m, j) => (
                      <span key={j} style={m.includes("trenger") ? { color: "var(--warn)" } : m.includes("resultat T-4") ? { color: "var(--success)" } : m.includes("resultat T-12") ? { color: "var(--muted)" } : undefined}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="venue-cell">
                  {r.venue}
                  <span className="sub">
                    {!r.dimmed && (
                      <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ verticalAlign: "-1px" }}>
                        <use href="#i-map" />
                      </svg>
                    )}{" "}
                    {r.venueSub}
                  </span>
                </div>
                <div className="status-cell">
                  <span className={`pill pill-${r.status.kind}`}>{r.status.label}</span>
                </div>
                <div className="prep-cell">
                  <div className="bar">
                    <div style={{ width: `${r.prep}%`, ...(r.prepBarColor ? { background: r.prepBarColor } : {}) }} />
                  </div>
                  <span className="pct">{r.prepDash ? "—" : `${r.prep}%`}</span>
                </div>
                <div className="arrow">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-arrow-right" /></svg>
                </div>
              </div>
            ))}
          </section>

          {/* AI STICKY CTA */}
          <section className="ai-sticky">
            <div className="ic">
              <svg fill="currentColor"><use href="#i-sparkles" /></svg>
            </div>
            <div>
              <div className="ttl">AI-foreslå turnering</div>
              <div className="sub">
                Sjekker Olyo · Srixon · Garmin NC · klubb-touren basert på HCP, geografi og sesong-plan
              </div>
            </div>
            <a href="/portal/ai/foresla-turnering" className="btn btn-lime">
              Foreslå nå
              <svg fill="none" stroke="currentColor" strokeWidth="2"><use href="#i-arrow-right" /></svg>
            </a>
          </section>
        </div>
      </main>
    </div>
  );
}
