/**
 * /portal/planlegge?tab=arsplan — pixel-perfekt port av
 * docs/design-handoff/planlegge/planlegge-arsplan.html
 *
 * Server-component. Henter SeasonPlan + TournamentEntry hvis tilgjengelig,
 * faller tilbake til demo-data fra mockupen.
 */

import "./styles.css";
import { PlanleggeSprite } from "./icons";
import { PlanleggeHeroTabs } from "./hero-tabs";

export function ArsplanScreen({
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
  const todayLabel = new Date().toLocaleDateString("nb-NO", { day: "numeric", month: "short" });

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
          <PlanleggeHeroTabs activeTab="arsplan" counts={{ treningsplan: 12, mal: 3, turneringer: 7, drills: 48 }} />

          {/* GANTT */}
          <section className="gantt-card">
            <div className="gantt-h">
              <h2>Sesong-periodisering</h2>
              <span className="yr">{seasonYear} · Bompa-modellen</span>
              <div className="right">
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", color: "var(--muted)", letterSpacing: "0.04em" }}>
                  Dra periodekanter for å justere
                </span>
                <button className="btn btn-outline btn-xs">Tilbakestill</button>
              </div>
            </div>

            <div className="gantt">
              {["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"].map((m, i) => (
                <div key={m} className={`g-month${i === 4 ? " now" : ""}`}>
                  {m}
                  {i === 4 && <span className="day-tick">{todayLabel.split(".")[0]}</span>}
                </div>
              ))}
            </div>

            <div className="gantt-track" style={{ marginTop: "14px" }}>
              <div className="today-line" style={{ left: "39.4%" }} />

              <div className="period grunn" style={{ left: "0%", width: "16.67%" }}>
                <span className="grip-l" />
                <span>Grunntrening</span>
                <span className="wks">8 uker</span>
                <span className="grip-r" />
              </div>
              <div className="period opp" style={{ left: "16.67%", width: "16.67%" }}>
                <span className="grip-l" />
                <span>Oppbygging</span>
                <span className="wks">8 uker</span>
                <span className="grip-r" />
              </div>
              <div className="period spes active" style={{ left: "33.33%", width: "16.67%" }}>
                <span className="grip-l" />
                <span>Spesialisering</span>
                <span className="wks">6 uker</span>
                <span className="grip-r" />
              </div>
              <div className="period konk" style={{ left: "50%", width: "16.67%" }}>
                <span className="grip-l" />
                <span>Konkurranse</span>
                <span className="wks">9 uker</span>
                <span className="grip-r" />
              </div>
              <div className="period over" style={{ left: "66.67%", width: "16.67%" }}>
                <span className="grip-l" />
                <span>Overgang</span>
                <span className="wks">8 uker</span>
                <span className="grip-r" />
              </div>
              <div className="period hvile" style={{ left: "83.33%", width: "16.67%" }}>
                <span className="grip-l" />
                <span>Hvile</span>
                <span className="wks">8 uker</span>
                <span className="grip-r" />
              </div>
            </div>

            <div style={{ position: "relative", height: "32px", marginTop: "14px" }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "8px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "9.5px",
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                }}
              >
                Turneringer
              </div>
              {[
                { l: "28.5%", title: "Klubb · Påskeåpningen · 12. apr" },
                { l: "34.5%", title: "Olyo · Vårcup · 4. mai" },
                { l: "43.8%", title: "Olyo · Sørlandsåpent · 8. jun · NESTE", big: true },
                { l: "48.5%", title: "Srixon Tour · Oslo Open · 22. jun" },
                { l: "53%", title: "Garmin · NM jr · 14. jul" },
                { l: "62%", title: "Olyo Tour Final · 18. aug" },
                { l: "68.5%", title: "Srixon · Høstcup · 6. sep" },
              ].map((p, i) => (
                <div
                  key={i}
                  className={`t-pin${p.big ? " big" : ""}`}
                  title={p.title}
                  style={{ left: p.l, top: p.big ? "4px" : "8px" }}
                >
                  <svg fill="currentColor"><use href="#i-tournament-pin" /></svg>
                </div>
              ))}
            </div>

            <div className="gantt-legend">
              <span className="sw"><span className="box" style={{ background: "var(--pyr-turn)" }} />Grunntrening</span>
              <span className="sw"><span className="box" style={{ background: "var(--pyr-tek)" }} />Oppbygging</span>
              <span className="sw"><span className="box" style={{ background: "var(--forest)" }} />Spesialisering</span>
              <span className="sw"><span className="box" style={{ background: "var(--lime)" }} />Konkurranse</span>
              <span className="sw"><span className="box" style={{ background: "var(--pyr-spill)" }} />Overgang</span>
              <span className="sw"><span className="box" style={{ background: "#C9C5BA" }} />Hvile</span>
              <span className="sw" style={{ marginLeft: "auto" }}>
                <span
                  className="box"
                  style={{ background: "transparent", borderLeft: "2px dashed var(--ink)", height: "14px", width: 0, marginRight: "4px" }}
                />
                I dag · {todayLabel}
              </span>
            </div>
          </section>

          {/* ACTIVE PERIOD */}
          <section className="active-period">
            <div className="ap-h">
              <span className="ap-tag">
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><use href="#i-target" /></svg>
                Aktiv periode
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10.5px",
                  color: "rgba(209,248,67,0.65)",
                  letterSpacing: "0.10em",
                  marginLeft: "auto",
                  textTransform: "uppercase",
                }}
              >
                Uke 3 av 6 · 50% gjennomført
              </span>
            </div>
            <h2>
              Spesialisering <em>1. mai → 14. juni</em>
            </h2>
            <div className="ap-sub">Høy intensitet · race-pace · turnering-spesifikk forberedelse</div>

            <div className="ap-kpi">
              <div className="ak">
                <div className="l">Volum</div>
                <div className="v">82<span className="u">%</span></div>
                <div className="s">av 16 t/uke · på plan</div>
              </div>
              <div className="ak">
                <div className="l">Intensitet</div>
                <div className="v">91<span className="u">%</span></div>
                <div className="s">RPE 7,3 snitt · høyt</div>
              </div>
              <div className="ak">
                <div className="l">Økter denne uka</div>
                <div className="v">4<span className="u">/6</span></div>
                <div className="s">2 igjen · tors + lør</div>
              </div>
              <div className="ak">
                <div className="l">Neste turnering</div>
                <div className="v" style={{ fontSize: "18px" }}>Sørlandsåpent</div>
                <div className="s">8. juni · om 16 dager</div>
              </div>
            </div>

            <div className="ap-actions">
              <button className="btn btn-lime">
                <svg fill="none" stroke="currentColor" strokeWidth="2"><use href="#i-settings" /></svg>
                Endre periode
              </button>
              <button className="btn btn-ghost-lime">
                <svg fill="none" stroke="currentColor"><use href="#i-dumbbell" /></svg>
                Hopp til Treningsplan
                <svg fill="none" stroke="currentColor"><use href="#i-arrow-right" /></svg>
              </button>
            </div>
          </section>

          {/* TOURNAMENT STRIP */}
          <section className="card t-strip-card">
            <div className="card-h">
              <div>
                <div className="eyebrow">KOMMENDE TURNERINGER · 5 NESTE</div>
                <h2 style={{ marginTop: "4px" }}>På horisonten</h2>
              </div>
              <div className="right">
                <a
                  href="/portal/planlegge?tab=turneringer"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--forest)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Alle turneringer
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-arrow-right" /></svg>
                </a>
              </div>
            </div>

            <div className="t-strip h-scroll">
              {[
                {
                  date: "8. JUN 2026",
                  days: "16 dager",
                  name: "Olyo · Sørlandsåpent",
                  badge: "olyo",
                  badgeLabel: "Olyo Tour",
                  venue: "Kristiansand GK",
                  meta: "≤ 6,0",
                  holes: "54 hull",
                  prep: 62,
                  cta: "Se forberedelse →",
                  ctaClass: "btn-primary",
                  next: true,
                },
                {
                  date: "22. JUN 2026",
                  days: "30 dager",
                  name: "Srixon · Oslo Open",
                  badge: "srixon",
                  badgeLabel: "Srixon",
                  venue: "Oslo GK · Bogstad",
                  meta: "≤ 8,0",
                  holes: "36 hull",
                  prep: 24,
                  cta: "Se forberedelse →",
                  ctaClass: "btn-outline",
                },
                {
                  date: "14. JUL 2026",
                  days: "52 dager",
                  name: "Garmin · NM Junior 18 år",
                  badge: "garmin",
                  badgeLabel: "Garmin NC",
                  venue: "Miklagard GK",
                  meta: "≤ 5,0",
                  holes: "72 hull",
                  prep: 8,
                  cta: "Meld på",
                  ctaClass: "btn-lime",
                },
                {
                  date: "18. AUG 2026",
                  days: "87 dager",
                  name: "Olyo Tour · Finalen",
                  badge: "olyo",
                  badgeLabel: "Olyo Tour",
                  venue: "Larvik GK",
                  meta: "≤ 6,0",
                  holes: "54 hull · invitasjon",
                  prep: 0,
                  cta: "Trenger ranking-poeng",
                  ctaClass: "btn-outline",
                  prepDash: true,
                },
                {
                  date: "6. SEP 2026",
                  days: "106 dager",
                  name: "Srixon · Høstcup",
                  badge: "srixon",
                  badgeLabel: "Srixon",
                  venue: "Drøbak GK",
                  meta: "≤ 10,0",
                  holes: "36 hull",
                  prep: 0,
                  cta: "Meld på",
                  ctaClass: "btn-lime",
                  prepDash: true,
                },
              ].map((t, i) => (
                <div key={i} className={`t-card${t.next ? " next" : ""}`}>
                  <div className="t-date">
                    {t.date}
                    <span className="days">{t.days}</span>
                  </div>
                  <div className="t-name">{t.name}</div>
                  <div className="t-meta">
                    <span className={`tour-badge ${t.badge}`}>{t.badgeLabel}</span>
                    <span className="sep">·</span>
                    <span>{t.venue}</span>
                  </div>
                  <div className="t-meta">
                    HCP-krav <strong style={{ color: "var(--ink)", fontWeight: 700 }}>{t.meta}</strong> · {t.holes}
                  </div>
                  <div className="prep">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.10em", color: "var(--muted)" }}>
                      FORB.
                    </span>
                    <div className="prep-bar">
                      <div style={{ width: `${t.prep}%` }} />
                    </div>
                    <span className="pct">{t.prepDash ? "—" : `${t.prep}%`}</span>
                  </div>
                  <div className="cta-row">
                    <button className={`btn ${t.ctaClass}`} style={t.ctaClass !== "btn-primary" ? { flex: 1 } : undefined}>
                      {t.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TIP BENCH */}
          <section className="bench">
            <svg fill="none" stroke="currentColor" strokeWidth="1.75"><use href="#i-info" /></svg>
            <div className="txt">
              <strong>Tips:</strong> Dra periodekantene i Gantt-en for å endre lengde. Når du justerer en periode trigges en{" "}
              <em>periodiserings-popup</em> som setter <strong>FYS / TEK / SLAG-volum</strong> per uke for den nye perioden.
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
