"use client";

/**
 * Tournament-detalj — klientkomponent som matcher
 * public/design/tournament.html ett-til-ett. Stilen ligger i en lokal
 * <style>-blokk med tdc- prefiks for å unngå kollisjoner med PortalShell.
 */

import { useState } from "react";
import {
  ChevronDown,
  Clock,
  Flag,
  MapPin,
  MessageSquare,
  Sparkles,
  Star,
  Target,
  Trophy,
  TrendingUp,
} from "lucide-react";

type PrepStatus = "FULLFORT" | "PLANLAGT" | "TURNERING" | "SCOUT";
type PrepPill = "TEK" | "SLAG" | "SPILL" | "TURN";

type PrepRow = {
  dato: string;
  tittel: string;
  meta: string;
  pill: PrepPill;
  status: PrepStatus;
  done: boolean;
};

const PREP_ROWS: PrepRow[] = [
  {
    dato: "12. MAI",
    tittel: "Pitch 50—100m, lav trajectory",
    meta: "SLAG · 60 min · 184 reps · ±3,2m landing",
    pill: "SLAG",
    status: "FULLFORT",
    done: true,
  },
  {
    dato: "15. MAI",
    tittel: "Iron 7 dispersjons-test",
    meta: "TEK · 90 min · 96 reps · ±5,2m",
    pill: "TEK",
    status: "FULLFORT",
    done: true,
  },
  {
    dato: "17. MAI",
    tittel: "Driver-økt med vind-simulering",
    meta: "TEK · 60 min · CS 112 mph",
    pill: "TEK",
    status: "FULLFORT",
    done: true,
  },
  {
    dato: "19. MAI",
    tittel: "Mental visualisering · Sørlands",
    meta: "TURN · 15 min",
    pill: "TURN",
    status: "FULLFORT",
    done: true,
  },
  {
    dato: "21. MAI",
    tittel: "Iron-progresjon CS70 → CS80",
    meta: "TEK · 90 min · 240 reps · av Anders",
    pill: "TEK",
    status: "PLANLAGT",
    done: false,
  },
  {
    dato: "24. MAI",
    tittel: "Bossum Open · runde 1 (form-test)",
    meta: "SPILL · 4 t · 18 hull · ekte runde",
    pill: "SPILL",
    status: "TURNERING",
    done: false,
  },
  {
    dato: "28. MAI",
    tittel: "Approach 100—150m blokk",
    meta: "SLAG · 90 min · 144 reps · prio-1-fokus",
    pill: "SLAG",
    status: "PLANLAGT",
    done: false,
  },
  {
    dato: "2. JUN",
    tittel: "9-hulls spillsim · Mandal-stil",
    meta: "SPILL · 90 min · smale fairways",
    pill: "SPILL",
    status: "PLANLAGT",
    done: false,
  },
  {
    dato: "5. JUN",
    tittel: "Bunker-eskalering + sand-save",
    meta: "SLAG · 45 min · 80 reps",
    pill: "SLAG",
    status: "PLANLAGT",
    done: false,
  },
  {
    dato: "8. JUN",
    tittel: "Mental forberedelse + visualisering",
    meta: "TURN · 30 min · pre-tournament",
    pill: "TURN",
    status: "PLANLAGT",
    done: false,
  },
  {
    dato: "9. JUN",
    tittel: "Treningsrunde · Mandal Golfklubb",
    meta: "SPILL · 4 t · 18 hull · scout",
    pill: "SPILL",
    status: "SCOUT",
    done: false,
  },
  {
    dato: "10. JUN",
    tittel: "Sørlandsåpent · Runde 1",
    meta: "SPILL · 5 t · 18 hull · tee 08:30",
    pill: "SPILL",
    status: "TURNERING",
    done: false,
  },
];

type Hole = {
  hull: number;
  par: number;
  lengde: string;
  hcp: number;
  signature: string;
};

const HOLES: Hole[] = [
  { hull: 1, par: 4, lengde: "372 m", hcp: 11, signature: "Åpen fairway · slag-inn" },
  { hull: 2, par: 3, lengde: "168 m", hcp: 15, signature: "Iron 7 over vann" },
  { hull: 3, par: 5, lengde: "484 m", hcp: 3, signature: "Dogleg venstre · risk/reward" },
  { hull: 4, par: 4, lengde: "356 m", hcp: 9, signature: "Smal fairway · pres på driver" },
  { hull: 5, par: 4, lengde: "390 m", hcp: 5, signature: "Forhøyet green · approach 130m" },
  { hull: 6, par: 3, lengde: "184 m", hcp: 13, signature: "Iron 6 · skrå green" },
  { hull: 7, par: 4, lengde: "340 m", hcp: 17, signature: "Kort par 4 · driver-mulighet" },
  { hull: 8, par: 5, lengde: "520 m", hcp: 1, signature: "Lang par 5 · 3 skudd" },
  { hull: 9, par: 4, lengde: "382 m", hcp: 7, signature: "Bunker-omkranset green" },
  { hull: 10, par: 4, lengde: "368 m", hcp: 10, signature: "Klubb-favoritt · åpen" },
  { hull: 11, par: 3, lengde: "196 m", hcp: 14, signature: "Iron 5 over rough" },
  { hull: 12, par: 5, lengde: "498 m", hcp: 2, signature: "Approach 140m · prio-1-soken" },
  { hull: 13, par: 4, lengde: "372 m", hcp: 6, signature: "Smal · driver eller iron" },
  { hull: 14, par: 4, lengde: "410 m", hcp: 4, signature: "Lang par 4 · approach 150m" },
  { hull: 15, par: 3, lengde: "172 m", hcp: 16, signature: "Iron 7 · vind-utsatt" },
  { hull: 16, par: 4, lengde: "388 m", hcp: 8, signature: "Forhøyet · approach 130m" },
  { hull: 17, par: 5, lengde: "508 m", hcp: 12, signature: "Risk/reward · vann venstre" },
  { hull: 18, par: 4, lengde: "432 m", hcp: 18, signature: "Avslutning · klubbhus-publikum" },
];

type WeatherRow = {
  yr: string;
  desc: string;
  meta: string;
  placement: string;
  win?: boolean;
  cut?: boolean;
};

const WEATHER: WeatherRow[] = [
  { yr: "2025", desc: "Sol, vind 6 m/s SV", meta: "RUNDER 71 · 74 · 72 = 217", placement: "14." },
  { yr: "2024", desc: "Skyet, regn dag 2", meta: "RUNDER 73 · 78 · 74 = 225", placement: "28." },
  { yr: "2023", desc: "Sol, lite vind", meta: "RUNDER 70 · 72 · 71 = 213", placement: "8.", win: true },
  { yr: "2022", desc: "Vind 10 m/s, kjølig", meta: "CUT (74 · 79 = 153)", placement: "CUT", cut: true },
  { yr: "2021", desc: "Sol, varm", meta: "DEBUT · RUNDER 75 · 77 · 76 = 228", placement: "34." },
];

type Participant = {
  initialer: string;
  navn: string;
  meta: string;
  sg: string;
  sgPositiv: boolean;
  rank: string;
  me?: boolean;
};

const PARTICIPANTS: Participant[] = [
  { initialer: "HV", navn: "Henrik Vatne", meta: "HCP +0,4 · OSLO GK · A1", sg: "+0,84", sgPositiv: true, rank: "#1" },
  { initialer: "JT", navn: "Joachim Thorsen", meta: "HCP +1,2 · BÆRUM · A1", sg: "+0,62", sgPositiv: true, rank: "#3" },
  { initialer: "ØR", navn: "Øyvind Rud", meta: "HCP +3,5 · STAVANGER · A1", sg: "+0,38", sgPositiv: true, rank: "#8" },
  { initialer: "MR", navn: "Markus Røinås Pedersen", meta: "HCP +3,5 · GFGK · A1", sg: "+0,21", sgPositiv: true, rank: "#14", me: true },
  { initialer: "HM", navn: "Hampus Mörner", meta: "HCP 0,8 · STOCKHOLM · A1 (gjest)", sg: "+0,18", sgPositiv: true, rank: "#15" },
  { initialer: "SH", navn: "Sigrid Hansen", meta: "HCP 1,4 · MANDAL · A1 (vert)", sg: "+0,12", sgPositiv: true, rank: "#18" },
  { initialer: "ES", navn: "Emma Skogli", meta: "HCP 4,8 · TRONDHEIM · A1", sg: "−0,08", sgPositiv: false, rank: "#22" },
];

function pillClass(pill: PrepPill): string {
  switch (pill) {
    case "TEK":
      return "tdc-pill-tek";
    case "SLAG":
      return "tdc-pill-slag";
    case "SPILL":
      return "tdc-pill-spill";
    case "TURN":
      return "tdc-pill-turn";
  }
}

function badgeForStatus(status: PrepStatus): { cls: string; text: string } {
  switch (status) {
    case "FULLFORT":
      return { cls: "tdc-badge tdc-badge-success", text: "FULLFØRT" };
    case "PLANLAGT":
      return { cls: "tdc-badge tdc-badge-forest", text: "PLANLAGT" };
    case "TURNERING":
      return { cls: "tdc-badge tdc-badge-danger", text: "★ TURNERING" };
    case "SCOUT":
      return { cls: "tdc-badge tdc-badge-lime", text: "SCOUT" };
  }
}

export function TurneringDetaljClient({
  tournamentName,
}: {
  tournamentName: string | null;
}) {
  const [participantsOpen, setParticipantsOpen] = useState(true);
  const visningsnavn = tournamentName ?? "Sørlandsåpent";

  return (
    <div className="tdc-root">
      <style>{TDC_CSS}</style>

      <div className="tdc-breadcrumb">
        Workbench / Årsplan / <span className="tdc-current">{visningsnavn}</span>
      </div>

      <div className="tdc-page">
        {/* ============ HERO ============ */}
        <section className="tdc-tour-hero">
          <div className="tdc-tour-hero-main">
            <span className="tdc-label-mono tdc-hero-label">
              Turnering · A1-nivå · 10—12 juni 2026
            </span>
            <h1 className="tdc-hero-title">
              {visningsnavn} <em>2026</em>
            </h1>
            <div className="tdc-hero-sub">
              Mandal Golfklubb · 54 hull stroke play · 3 dager
            </div>
            <div className="tdc-hero-actions">
              <button className="tdc-btn tdc-btn-primary" type="button">
                <Sparkles size={14} strokeWidth={1.75} aria-hidden />
                Forbered meg
              </button>
              <button className="tdc-btn tdc-btn-forest-on-dark" type="button">
                <Trophy size={14} strokeWidth={1.75} aria-hidden />
                Logg resultat
              </button>
              <button className="tdc-btn tdc-btn-ghost-on-dark" type="button">
                Avregistrer
              </button>
            </div>
          </div>

          <div className="tdc-countdown-card">
            <div>
              <div className="tdc-label-mono">Starter om</div>
              <div className="tdc-countdown-big">
                21
                <small>dager</small>
              </div>
              <div className="tdc-mono tdc-tee-meta">
                <Clock size={11} strokeWidth={1.75} aria-hidden />
                START ONS 10. JUNI · 08:30 · TEE 1
              </div>
            </div>

            <div>
              <div className="tdc-label-mono tdc-prep-label">
                Forberedelses-status
              </div>
              <div className="tdc-prep-bars">
                <PrepBar label="Approach-fokus" pct={65} color="var(--tdc-slag)" valColor="var(--tdc-success)" />
                <PrepBar label="Bane-kjennskap" pct={80} color="var(--tdc-tek)" valColor="var(--tdc-success)" />
                <PrepBar label="Mental prep" pct={30} color="#C8B72A" valColor="var(--tdc-warning)" />
              </div>
            </div>

            <a href="#" className="tdc-goal-link">
              <Target size={20} strokeWidth={1.75} className="tdc-goal-icon" aria-hidden />
              <div className="tdc-goal-body">
                <div className="tdc-goal-ttl">Hovedmål: Top 10</div>
                <div className="tdc-goal-meta">PRIO 1 · RESULTATMÅL · 38% sannsynlig</div>
              </div>
              <span className="tdc-pill tdc-pill-turn">PRIO 1</span>
            </a>
          </div>
        </section>

        {/* ============ BANE-INFO ============ */}
        <section>
          <div className="tdc-section-h">
            <div>
              <h2 className="tdc-h2">Mandal Golfklubb</h2>
              <div className="tdc-section-sub">
                PARK-LINKS · ETABLERT 1976 · GFGK-RIVAL
              </div>
            </div>
            <button className="tdc-btn tdc-btn-outline tdc-btn-sm" type="button">
              <MapPin size={14} strokeWidth={1.75} aria-hidden />
              Vis bane-kart →
            </button>
          </div>

          <div className="tdc-course-grid">
            {/* Pane A: Bane-bilde + stats */}
            <div className="tdc-card">
              <div className="tdc-course-image">
                <span className="tdc-pin" />
                <span className="tdc-map-label">Mandal GK · 18 hull</span>
              </div>
              <div className="tdc-course-stats">
                <div className="tdc-cstat">
                  <div className="tdc-cstat-lbl">Lengde</div>
                  <div className="tdc-cstat-val">6 240 m</div>
                </div>
                <div className="tdc-cstat">
                  <div className="tdc-cstat-lbl">Par</div>
                  <div className="tdc-cstat-val">72</div>
                </div>
                <div className="tdc-cstat">
                  <div className="tdc-cstat-lbl">CR</div>
                  <div className="tdc-cstat-val">73,5</div>
                </div>
                <div className="tdc-cstat">
                  <div className="tdc-cstat-lbl">Slope</div>
                  <div className="tdc-cstat-val">132</div>
                </div>
              </div>
              <div className="tdc-italic-block">
                <em className="tdc-italic-accent">Smale fairways</em>, forhøyede greener — straffer dårlige approach-skudd.
              </div>
            </div>

            {/* Pane B: Hole-table */}
            <div className="tdc-card">
              <div className="tdc-card-head">
                <div>
                  <div className="tdc-card-title">Hull-for-hull</div>
                  <div className="tdc-mono tdc-card-sub">
                    RUNDE 1 · BACKTEE
                  </div>
                </div>
              </div>
              <div className="tdc-hole-table-wrap">
                <table className="tdc-hole-table">
                  <thead>
                    <tr>
                      <th>Hull</th>
                      <th>Par</th>
                      <th>Lengde</th>
                      <th>HCP</th>
                      <th>Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HOLES.map((h) => (
                      <tr key={h.hull}>
                        <td className="tdc-hnum">{h.hull}</td>
                        <td className="tdc-par">{h.par}</td>
                        <td>{h.lengde}</td>
                        <td>{h.hcp}</td>
                        <td className="tdc-sig">{h.signature}</td>
                      </tr>
                    ))}
                    <tr className="tdc-total-row">
                      <td colSpan={2}>TOTALT</td>
                      <td>6 240 m</td>
                      <td colSpan={2} style={{ textAlign: "right" }}>
                        PAR 72 · 6 PAR-3 · 8 PAR-4 · 4 PAR-5
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pane C: Vær + tidligere resultater */}
            <div className="tdc-card tdc-weather-card">
              <div className="tdc-card-head">
                <div>
                  <div className="tdc-card-title">Historisk vær + mine resultater</div>
                  <div className="tdc-mono tdc-card-sub">SISTE 5 ÅR</div>
                </div>
              </div>
              {WEATHER.map((w) => (
                <div key={w.yr} className="tdc-weather-row">
                  <span className="tdc-yr">{w.yr}</span>
                  <div className="tdc-desc">
                    {w.desc}
                    <small>{w.meta}</small>
                  </div>
                  <span
                    className={`tdc-placement${w.win ? " tdc-placement-win" : ""}${w.cut ? " tdc-placement-cut" : ""}`}
                  >
                    {w.placement}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ RESULTAT-TREND ============ */}
        <section>
          <div className="tdc-section-h">
            <div>
              <h2 className="tdc-h2">Mine resultater her</h2>
              <div className="tdc-section-sub">
                5 DELTAKELSER · SNITT 73,2 · BESTE 8. PLASS (2023)
              </div>
            </div>
            <span className="tdc-pill tdc-pill-slag">
              <TrendingUp size={11} strokeWidth={1.75} aria-hidden />
              SNITT-TREND ↓
            </span>
          </div>

          <div className="tdc-card">
            <svg
              viewBox="0 0 880 200"
              preserveAspectRatio="none"
              style={{ width: "100%", height: "180px" }}
              aria-hidden
            >
              <line x1="40" y1="20" x2="880" y2="20" stroke="var(--tdc-border)" strokeWidth="0.5" strokeDasharray="2 4" />
              <line x1="40" y1="80" x2="880" y2="80" stroke="var(--tdc-border-soft)" strokeWidth="1" />
              <line x1="40" y1="140" x2="880" y2="140" stroke="var(--tdc-border)" strokeWidth="0.5" strokeDasharray="2 4" />
              <text x="36" y="24" textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="var(--tdc-muted)">68</text>
              <text x="36" y="84" textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="var(--tdc-muted)">73</text>
              <text x="36" y="144" textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="var(--tdc-muted)">78</text>
              <line x1="40" y1="68" x2="880" y2="68" stroke="var(--tdc-success)" strokeWidth="1" strokeDasharray="3 3" />
              <text x="876" y="64" textAnchor="end" fontFamily="JetBrains Mono" fontSize="9" fill="var(--tdc-success)">PAR 72</text>
              <polyline
                fill="none"
                stroke="var(--tdc-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="80,140 280,128 480,72 680,116 880,92"
              />
              <polyline
                fill="rgba(0,88,64,0.10)"
                stroke="none"
                points="80,140 280,128 480,72 680,116 880,92 880,180 80,180"
              />
              <g>
                <circle cx="80" cy="140" r="5" fill="var(--tdc-primary)" />
                <circle cx="280" cy="128" r="5" fill="var(--tdc-primary)" />
                <circle cx="480" cy="72" r="6" fill="var(--tdc-accent)" stroke="var(--tdc-primary)" strokeWidth="2" />
                <circle cx="680" cy="116" r="5" fill="var(--tdc-primary)" />
                <circle cx="880" cy="92" r="5" fill="var(--tdc-primary)" />
              </g>
              <text x="80" y="195" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--tdc-muted)">2021</text>
              <text x="280" y="195" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--tdc-muted)">2022</text>
              <text x="480" y="195" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--tdc-success)" fontWeight="600">2023</text>
              <text x="680" y="195" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--tdc-muted)">2024</text>
              <text x="880" y="195" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--tdc-muted)">2025</text>
              <g>
                <rect x="445" y="42" width="68" height="22" rx="4" fill="var(--tdc-accent)" />
                <text x="479" y="57" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--tdc-fg)" fontWeight="700">8. PLASS</text>
              </g>
            </svg>

            <div className="tdc-italic-block">
              Beste år (2023, 8. plass) hadde du <em className="tdc-italic-accent">+0,3 SG approach</em> og null cut-trussel. Reproduserbart med dagens form hvis approach-gapet tettes.
            </div>
          </div>
        </section>

        {/* ============ FORBEREDELSES-PLAN ============ */}
        <section>
          <div className="tdc-section-h">
            <div>
              <h2 className="tdc-h2">Forberedelses-plan</h2>
              <div className="tdc-section-sub">
                12 ØKTER KNYTTET · 4 FULLFØRT · 8 PLANLAGT · 21 DAGER IGJEN
              </div>
            </div>
            <button className="tdc-btn tdc-btn-primary tdc-btn-sm" type="button">
              <MessageSquare size={14} strokeWidth={1.75} aria-hidden />
              Be om turnerings-plan
            </button>
          </div>

          <div className="tdc-prep-list">
            {PREP_ROWS.map((row, i) => {
              const badge = badgeForStatus(row.status);
              return (
                <div
                  key={`${row.dato}-${i}`}
                  className={`tdc-prep-row${row.done ? " tdc-prep-done" : ""}`}
                >
                  <span className="tdc-prep-dt">{row.dato}</span>
                  <span className="tdc-status-dot" />
                  <div>
                    <div className="tdc-prep-ttl">{row.tittel}</div>
                    <div className="tdc-prep-meta">{row.meta}</div>
                  </div>
                  <span className={`tdc-pill ${pillClass(row.pill)}`}>{row.pill}</span>
                  <span className={badge.cls}>{badge.text}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============ DELTAKERLISTE ============ */}
        <section>
          <div className={`tdc-collapsible${participantsOpen ? " tdc-open" : ""}`}>
            <div
              className="tdc-collapsible-head"
              role="button"
              tabIndex={0}
              onClick={() => setParticipantsOpen((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setParticipantsOpen((v) => !v);
                }
              }}
            >
              <div>
                <h2 className="tdc-h2">Deltakerliste</h2>
                <div className="tdc-section-sub">
                  38 A1-SPILLERE PÅMELDT · DU LIGGER PÅ #14 I FORM-RANKING
                </div>
              </div>
              <div className="tdc-row-flex">
                <button
                  className="tdc-btn tdc-btn-outline tdc-btn-sm"
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                >
                  Filter A1
                </button>
                <ChevronDown
                  size={16}
                  strokeWidth={1.75}
                  className="tdc-chev"
                  aria-hidden
                />
              </div>
            </div>

            {participantsOpen && (
              <div className="tdc-collapsible-body">
                <div className="tdc-participants">
                  {PARTICIPANTS.map((p) => (
                    <div
                      key={p.initialer + p.navn}
                      className={`tdc-participant-row${p.me ? " tdc-participant-me" : ""}`}
                    >
                      <div className={`tdc-avatar${p.me ? " tdc-avatar-me" : ""}`}>
                        {p.initialer}
                      </div>
                      <div>
                        <div className="tdc-participant-nm">
                          {p.navn}
                          {p.me && <span className="tdc-me-tag">DU</span>}
                        </div>
                        <div className="tdc-participant-meta">{p.meta}</div>
                      </div>
                      <div>
                        <div className={`tdc-sg-val ${p.sgPositiv ? "tdc-sg-pos" : "tdc-sg-neg"}`}>
                          {p.sg}
                        </div>
                        <div className="tdc-sg-lbl">SG-TOT 90D</div>
                      </div>
                      <div>
                        <div className="tdc-rank">{p.rank}</div>
                        <div className="tdc-sg-lbl">FORM</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="tdc-participants-footer">
                  <button className="tdc-btn tdc-btn-outline tdc-btn-sm" type="button">
                    Vis alle 38 deltakere
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ============ FOOTER-STRIPE ============ */}
        <div className="tdc-footer-strip">
          <div className="tdc-ft-summary">
            <strong>21 DAGER IGJEN</strong>
            <Flag size={11} strokeWidth={1.75} aria-hidden />
            12 ØKTER KNYTTET · 4 FULLFØRT · 8 PLANLAGT
          </div>
          <div className="tdc-ft-actions">
            <button className="tdc-btn tdc-btn-outline tdc-btn-sm" type="button">
              <Star size={14} strokeWidth={1.75} aria-hidden />
              Tilbake til workbench
            </button>
            <button className="tdc-btn tdc-btn-primary tdc-btn-sm" type="button">
              <Sparkles size={14} strokeWidth={1.75} aria-hidden />
              Forbered meg
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrepBar({
  label,
  pct,
  color,
  valColor,
}: {
  label: string;
  pct: number;
  color: string;
  valColor: string;
}) {
  return (
    <div className="tdc-prep-bar-row">
      <span className="tdc-prep-bar-label">{label}</span>
      <div className="tdc-prep-bar">
        <div className="tdc-prep-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="tdc-prep-bar-val" style={{ color: valColor }}>
        {pct}%
      </span>
    </div>
  );
}

/* =============================================================
   Lokal CSS — speiler tournament.css + workbench-v2.css med tdc-
   prefiks. Inline for å unngå kollisjon med PortalShell.
   ============================================================= */

const TDC_CSS = `
.tdc-root {
  --tdc-bg: #FAFAF7;
  --tdc-fg: #0A1F17;
  --tdc-primary: #005840;
  --tdc-primary-dark: #003A2A;
  --tdc-accent: #D1F843;
  --tdc-card: #FFFFFF;
  --tdc-border: #E5E3DD;
  --tdc-border-soft: #EFEDE6;
  --tdc-muted: #5E5C57;
  --tdc-muted-soft: #908D86;
  --tdc-danger: #A32D2D;
  --tdc-success: #2C7D52;
  --tdc-warning: #B8852A;
  --tdc-fys: #1A4D2E;
  --tdc-tek: #005840;
  --tdc-slag: #2C7D52;
  --tdc-spill: #88B45A;
  --tdc-turn: #D1F843;
  --tdc-r-card: 16px;
  --tdc-r-pill: 999px;
  --tdc-font-display: 'Inter Tight', sans-serif;
  --tdc-font-body: 'Inter', sans-serif;
  --tdc-font-mono: 'JetBrains Mono', monospace;
  --tdc-font-serif: 'Instrument Serif', serif;
  background: var(--tdc-bg);
  color: var(--tdc-fg);
  font-family: var(--tdc-font-body);
  font-size: 14px;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}
.tdc-root * { box-sizing: border-box; }

.tdc-breadcrumb {
  font-family: var(--tdc-font-mono);
  font-size: 11px; color: var(--tdc-muted); letter-spacing: 0.04em;
  padding: 16px 32px 0;
}
.tdc-breadcrumb .tdc-current { color: var(--tdc-fg); font-weight: 600; }

.tdc-page {
  padding: 24px 32px 48px;
  display: flex; flex-direction: column; gap: 32px;
  max-width: 1280px; margin: 0 auto;
}

/* ---- typography ---- */
.tdc-mono { font-family: var(--tdc-font-mono); }
.tdc-label-mono {
  font-family: var(--tdc-font-mono);
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--tdc-muted);
}
.tdc-italic-accent {
  font-family: var(--tdc-font-serif);
  font-style: italic; font-weight: 400;
  color: var(--tdc-primary);
}
.tdc-italic-block {
  font-family: var(--tdc-font-serif);
  font-style: italic; font-size: 13.5px;
  color: var(--tdc-fg); margin-top: 14px;
  line-height: 1.5; padding-top: 14px;
  border-top: 1px solid var(--tdc-border-soft);
}

/* ---- buttons ---- */
.tdc-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 16px; border-radius: var(--tdc-r-pill);
  font-size: 13px; font-weight: 600;
  border: 0; line-height: 1; white-space: nowrap;
  cursor: pointer; font-family: var(--tdc-font-body);
}
.tdc-btn-primary { background: var(--tdc-accent); color: var(--tdc-fg); }
.tdc-btn-outline { background: #fff; color: var(--tdc-fg); border: 1px solid var(--tdc-border); }
.tdc-btn-sm { padding: 7px 12px; font-size: 12px; }

/* ---- pills ---- */
.tdc-pill {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 9px; border-radius: var(--tdc-r-pill);
  font-family: var(--tdc-font-mono);
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
}
.tdc-pill-tek   { background: rgba(0,88,64,0.13);     color: var(--tdc-tek); }
.tdc-pill-slag  { background: rgba(44,125,82,0.16);   color: var(--tdc-slag); }
.tdc-pill-spill { background: rgba(136,180,90,0.20);  color: #4D7A2E; }
.tdc-pill-turn  { background: rgba(209,248,67,0.32);  color: #4A5418; }

/* ---- badges ---- */
.tdc-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: var(--tdc-r-pill);
  font-family: var(--tdc-font-mono);
  font-size: 9.5px; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  line-height: 1.4;
}
.tdc-badge-success { background: rgba(44,125,82,0.14); color: var(--tdc-success); }
.tdc-badge-forest  { background: rgba(0,88,64,0.10);   color: var(--tdc-primary); }
.tdc-badge-lime    { background: var(--tdc-accent);    color: var(--tdc-fg); }
.tdc-badge-danger  { background: rgba(163,45,45,0.12); color: var(--tdc-danger); }

/* ---- section h / cards ---- */
.tdc-section-h {
  display: flex; justify-content: space-between; align-items: flex-end; gap: 16px;
  margin-bottom: 16px;
}
.tdc-h2 {
  font-family: var(--tdc-font-display);
  font-size: 22px; font-weight: 600;
  letter-spacing: -0.015em; margin: 0;
}
.tdc-section-sub {
  font-family: var(--tdc-font-mono);
  font-size: 11px; color: var(--tdc-muted);
  letter-spacing: 0.06em; margin-top: 4px;
}
.tdc-card {
  background: var(--tdc-card);
  border: 1px solid var(--tdc-border);
  border-radius: var(--tdc-r-card);
  padding: 20px;
}
.tdc-card-head {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 10px; gap: 12px;
}
.tdc-card-title {
  font-family: var(--tdc-font-display);
  font-size: 16px; font-weight: 600;
  letter-spacing: -0.01em;
}
.tdc-card-sub {
  font-size: 10px; color: var(--tdc-muted);
  margin-top: 3px; letter-spacing: 0.06em;
}
.tdc-row-flex { display: flex; align-items: center; gap: 8px; }

/* ---- hero ---- */
.tdc-tour-hero {
  display: grid; grid-template-columns: 1.4fr 1fr;
  gap: 24px; align-items: stretch;
}
@media (max-width: 1024px) {
  .tdc-tour-hero { grid-template-columns: 1fr; }
}
.tdc-tour-hero-main {
  background: linear-gradient(160deg, #006C50 0%, #003A2A 100%);
  color: #fff; border-radius: var(--tdc-r-card);
  padding: 32px; position: relative; overflow: hidden;
}
.tdc-tour-hero-main::before {
  content: ''; position: absolute; top: -40%; right: -10%;
  width: 360px; height: 360px; border-radius: 50%;
  background: radial-gradient(circle, rgba(209,248,67,0.10), transparent 70%);
  pointer-events: none;
}
.tdc-hero-label { color: rgba(209,248,67,0.7); }
.tdc-hero-title {
  font-family: var(--tdc-font-display);
  font-size: 36px; font-weight: 700;
  letter-spacing: -0.02em; margin-top: 6px;
}
.tdc-hero-title em {
  font-family: var(--tdc-font-serif);
  font-style: italic; font-weight: 400;
  color: var(--tdc-accent);
}
.tdc-hero-sub {
  font-family: var(--tdc-font-display);
  font-size: 15px; color: rgba(255,255,255,0.78);
  margin-top: 8px; font-weight: 400;
}
.tdc-hero-actions {
  display: flex; gap: 8px; margin-top: 24px; flex-wrap: wrap;
  position: relative; z-index: 1;
}
.tdc-btn-forest-on-dark {
  background: rgba(209,248,67,0.12); color: var(--tdc-accent);
  border: 1px solid rgba(209,248,67,0.25);
}
.tdc-btn-ghost-on-dark {
  background: transparent; color: rgba(255,255,255,0.85);
  border: 1px solid rgba(255,255,255,0.18);
}

/* ---- countdown card ---- */
.tdc-countdown-card {
  background: var(--tdc-card); border: 1px solid var(--tdc-border);
  border-radius: var(--tdc-r-card); padding: 28px;
  display: flex; flex-direction: column; gap: 18px;
}
.tdc-countdown-big {
  font-family: var(--tdc-font-mono);
  font-size: 56px; font-weight: 700;
  color: var(--tdc-fg); line-height: 1;
  letter-spacing: -0.03em;
}
.tdc-countdown-big small {
  font-size: 16px; font-weight: 500; color: var(--tdc-muted);
  letter-spacing: 0.06em; text-transform: uppercase;
  margin-left: 10px;
}
.tdc-tee-meta {
  color: var(--tdc-muted); font-size: 11px;
  margin-top: 6px; letter-spacing: 0.06em;
  display: inline-flex; align-items: center; gap: 6px;
}
.tdc-prep-label { margin-bottom: 10px; display: block; }
.tdc-prep-bars { display: flex; flex-direction: column; gap: 10px; }
.tdc-prep-bar-row {
  display: grid; grid-template-columns: 110px 1fr 50px;
  align-items: center; gap: 10px;
}
.tdc-prep-bar-label {
  font-family: var(--tdc-font-mono); font-size: 10.5px;
  letter-spacing: 0.06em; color: var(--tdc-muted); text-transform: uppercase;
}
.tdc-prep-bar {
  height: 8px; background: var(--tdc-bg);
  border-radius: 999px; overflow: hidden;
}
.tdc-prep-bar-fill { height: 100%; border-radius: 999px; }
.tdc-prep-bar-val {
  font-family: var(--tdc-font-mono); font-size: 11px;
  font-weight: 600; text-align: right;
}

.tdc-goal-link {
  background: rgba(209,248,67,0.10);
  border: 1px solid rgba(209,248,67,0.45);
  border-left: 3px solid var(--tdc-accent);
  border-radius: 10px; padding: 12px 14px;
  display: flex; align-items: center; gap: 12px;
  text-decoration: none; color: inherit;
}
.tdc-goal-icon { color: var(--tdc-primary); flex-shrink: 0; }
.tdc-goal-body { flex: 1; }
.tdc-goal-ttl {
  font-family: var(--tdc-font-display);
  font-size: 13.5px; font-weight: 600;
}
.tdc-goal-meta {
  font-family: var(--tdc-font-mono);
  font-size: 10.5px; color: var(--tdc-muted);
  letter-spacing: 0.06em; margin-top: 2px;
}

/* ---- course grid ---- */
.tdc-course-grid {
  display: grid; grid-template-columns: 1fr 1.4fr 1fr; gap: 20px;
}
@media (max-width: 1100px) {
  .tdc-course-grid { grid-template-columns: 1fr; }
}
.tdc-course-image {
  background: linear-gradient(140deg, #88B45A 0%, #3A8B6C 70%);
  border-radius: var(--tdc-r-card); height: 180px;
  position: relative; overflow: hidden;
  display: flex; align-items: flex-end; padding: 16px;
}
.tdc-course-image::before {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(circle at 30% 80%, rgba(255,255,255,0.20), transparent 40%),
    radial-gradient(circle at 70% 30%, rgba(255,255,255,0.10), transparent 50%);
}
.tdc-course-image::after {
  content: ''; position: absolute;
  top: 30%; left: 20%; width: 60%; height: 4px;
  background: rgba(255,255,255,0.30); border-radius: 999px;
  transform: rotate(-12deg);
}
.tdc-pin {
  position: absolute; top: 28%; left: 78%;
  width: 14px; height: 14px;
  background: var(--tdc-danger); border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(163,45,45,0.20);
  z-index: 1;
}
.tdc-pin::after {
  content: ''; position: absolute;
  bottom: 14px; left: 50%; width: 1px; height: 12px;
  background: var(--tdc-danger);
}
.tdc-map-label {
  position: relative; z-index: 1;
  font-family: var(--tdc-font-mono);
  font-size: 10px; color: rgba(255,255,255,0.85);
  letter-spacing: 0.10em; text-transform: uppercase;
}
.tdc-course-stats {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  margin-top: 14px;
}
.tdc-cstat {
  background: var(--tdc-bg); border-radius: 10px;
  padding: 10px 12px;
}
.tdc-cstat-lbl {
  font-family: var(--tdc-font-mono);
  font-size: 9.5px; letter-spacing: 0.10em;
  color: var(--tdc-muted); text-transform: uppercase;
}
.tdc-cstat-val {
  font-family: var(--tdc-font-mono);
  font-size: 18px; font-weight: 700;
  margin-top: 4px; letter-spacing: -0.01em;
}

/* ---- hole table ---- */
.tdc-hole-table-wrap {
  border: 1px solid var(--tdc-border);
  border-radius: 12px;
  overflow: auto; max-height: 360px;
}
.tdc-hole-table {
  width: 100%; border-collapse: collapse;
  font-family: var(--tdc-font-mono); font-size: 11.5px;
}
.tdc-hole-table thead {
  position: sticky; top: 0; background: var(--tdc-bg); z-index: 1;
}
.tdc-hole-table th {
  font-size: 9.5px; letter-spacing: 0.10em; text-transform: uppercase;
  color: var(--tdc-muted); font-weight: 600;
  border-bottom: 1px solid var(--tdc-border);
  padding: 10px 8px; text-align: right;
}
.tdc-hole-table th:first-child,
.tdc-hole-table td:first-child { text-align: left; padding-left: 14px; }
.tdc-hole-table th:last-child,
.tdc-hole-table td:last-child { padding-right: 14px; }
.tdc-hole-table td {
  padding: 8px; border-bottom: 1px solid var(--tdc-border-soft);
  text-align: right;
}
.tdc-hole-table tr:last-child td { border-bottom: 0; }
.tdc-hnum { font-weight: 700; color: var(--tdc-fg); }
.tdc-par { color: var(--tdc-success); font-weight: 600; }
.tdc-sig {
  font-family: var(--tdc-font-body); text-align: left !important;
  font-size: 11px; color: var(--tdc-muted); font-style: italic;
}
.tdc-total-row td {
  background: var(--tdc-bg); font-weight: 700;
  border-top: 1px solid var(--tdc-border);
  border-bottom: 0;
}

/* ---- weather / previous results ---- */
.tdc-weather-card { display: flex; flex-direction: column; gap: 12px; }
.tdc-weather-row {
  display: grid; grid-template-columns: 50px 1fr auto;
  align-items: center; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid var(--tdc-border-soft);
}
.tdc-weather-row:last-child { border-bottom: 0; }
.tdc-yr {
  font-family: var(--tdc-font-mono); font-size: 11px;
  letter-spacing: 0.06em; color: var(--tdc-muted);
}
.tdc-desc {
  font-family: var(--tdc-font-body); font-size: 12.5px;
  color: var(--tdc-fg);
}
.tdc-desc small {
  font-family: var(--tdc-font-mono); display: block;
  color: var(--tdc-muted); font-size: 10px;
  margin-top: 2px; letter-spacing: 0.04em;
}
.tdc-placement {
  font-family: var(--tdc-font-mono); font-size: 14px;
  font-weight: 700; color: var(--tdc-fg);
}
.tdc-placement-win { color: var(--tdc-success); }
.tdc-placement-cut { color: var(--tdc-muted); }

/* ---- prep plan ---- */
.tdc-prep-list { display: flex; flex-direction: column; gap: 6px; }
.tdc-prep-row {
  display: grid; grid-template-columns: 64px 22px 1fr auto auto;
  align-items: center; gap: 12px;
  padding: 10px 14px; background: #fff;
  border: 1px solid var(--tdc-border-soft); border-radius: 10px;
}
.tdc-prep-done { background: rgba(44,125,82,0.04); }
.tdc-prep-dt {
  font-family: var(--tdc-font-mono); font-size: 10.5px;
  letter-spacing: 0.08em; color: var(--tdc-muted); text-transform: uppercase;
}
.tdc-status-dot {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid var(--tdc-border);
  position: relative;
}
.tdc-prep-done .tdc-status-dot {
  background: var(--tdc-success); border-color: var(--tdc-success);
}
.tdc-prep-done .tdc-status-dot::after {
  content: ''; position: absolute;
  left: 3px; top: 1px; width: 4px; height: 7px;
  border: 1.5px solid #fff; border-top: 0; border-left: 0;
  transform: rotate(45deg);
}
.tdc-prep-ttl {
  font-family: var(--tdc-font-display);
  font-size: 13px; font-weight: 600;
}
.tdc-prep-meta {
  font-family: var(--tdc-font-mono); font-size: 10px;
  color: var(--tdc-muted); letter-spacing: 0.04em;
}

/* ---- participants ---- */
.tdc-collapsible-head {
  display: flex; align-items: center; justify-content: space-between;
  cursor: pointer; padding: 6px 0;
}
.tdc-collapsible-head:hover .tdc-h2 { color: var(--tdc-primary); }
.tdc-chev { color: var(--tdc-muted); transition: transform 120ms; }
.tdc-open .tdc-chev { transform: rotate(180deg); }
.tdc-collapsible-body { margin-top: 14px; }

.tdc-participants { display: flex; flex-direction: column; gap: 8px; }
.tdc-participant-row {
  display: grid; grid-template-columns: 36px 1fr 110px 100px;
  align-items: center; gap: 14px;
  padding: 12px 14px;
  border: 1px solid var(--tdc-border-soft); border-radius: 10px;
  background: #fff;
}
.tdc-participant-me {
  border-color: var(--tdc-primary); background: rgba(0,88,64,0.04);
}
.tdc-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--tdc-primary); color: var(--tdc-accent);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--tdc-font-display);
  font-size: 11px; font-weight: 700;
  flex-shrink: 0;
}
.tdc-avatar-me { background: var(--tdc-accent); color: var(--tdc-primary); }
.tdc-participant-nm {
  font-family: var(--tdc-font-display);
  font-size: 13.5px; font-weight: 600;
}
.tdc-me-tag {
  font-family: var(--tdc-font-mono);
  font-size: 10px; background: var(--tdc-accent);
  color: var(--tdc-fg); padding: 1px 6px;
  border-radius: 4px; letter-spacing: 0.04em; margin-left: 6px;
}
.tdc-participant-meta {
  font-family: var(--tdc-font-mono); font-size: 10px;
  color: var(--tdc-muted); letter-spacing: 0.04em; margin-top: 2px;
}
.tdc-sg-val {
  font-family: var(--tdc-font-mono); font-size: 13px;
  font-weight: 600; text-align: right;
}
.tdc-sg-pos { color: var(--tdc-success); }
.tdc-sg-neg { color: var(--tdc-danger); }
.tdc-sg-lbl {
  font-family: var(--tdc-font-mono); font-size: 9px;
  color: var(--tdc-muted); letter-spacing: 0.08em;
  text-transform: uppercase; text-align: right; margin-top: 2px;
}
.tdc-rank {
  font-family: var(--tdc-font-mono); font-size: 18px;
  font-weight: 700; color: var(--tdc-muted-soft); text-align: right;
}
.tdc-participants-footer {
  display: flex; justify-content: center; margin-top: 16px;
}

/* ---- footer strip ---- */
.tdc-footer-strip {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--tdc-card);
  border: 1px solid var(--tdc-border);
  border-radius: var(--tdc-r-card);
  padding: 14px 20px; gap: 16px; flex-wrap: wrap;
}
.tdc-ft-summary {
  font-family: var(--tdc-font-mono);
  font-size: 11px; color: var(--tdc-muted);
  letter-spacing: 0.06em; display: flex;
  align-items: center; gap: 8px;
}
.tdc-ft-summary strong { color: var(--tdc-fg); letter-spacing: 0.10em; }
.tdc-ft-actions { display: flex; gap: 8px; }
`;
