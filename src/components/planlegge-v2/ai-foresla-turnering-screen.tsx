/**
 * /portal/ai/foresla-turnering — pixel-perfekt port av
 * docs/design-handoff/planlegge/ai-foresla-turnering.html
 */

import "./styles.css";
import Link from "next/link";
import { PlanleggeSprite } from "./icons";

type Result = {
  d: string;
  m: string;
  badge: "olyo" | "srixon" | "garmin" | "klubb";
  badgeLabel: string;
  status: string;
  statusColor: string;
  name: string;
  venue: string;
  km: string;
  holes: string;
  hcp: string;
  stats?: { label: string; value: string; kind?: "ok" | "warn" }[];
  why: React.ReactNode;
  ring: { color: string; offset: number; pct: number; rankLabel: string };
  cta: { variant: "primary" | "lime" | "outline"; label: string };
  showDetails?: boolean;
  top?: boolean;
};

const RESULTS: Result[] = [
  {
    d: "22",
    m: "jun · ma",
    badge: "srixon",
    badgeLabel: "Srixon Tour",
    status: "PASSER OPTIMALT",
    statusColor: "var(--success)",
    name: "Srixon · Oslo Open",
    venue: "Oslo GK · Bogstad",
    km: "12 km",
    holes: "36 hull",
    hcp: "≤ 8,0",
    stats: [
      { label: "HCP-krav", value: "≤ 8,0", kind: "ok" },
      { label: "Banelengde", value: "6,420 m" },
      { label: "Ranking-poeng", value: "42 p" },
    ],
    why: (
      <>
        <strong>Allerede påmeldt.</strong> AI bekrefter: kort reisetid, Markus sin Driver Basic-PR matcher banens
        smale fairways perfekt.{" "}
        <em>Spillet på Bogstad ligner Sørlandsåpent — bygger momentum to uker etterpå.</em>
      </>
    ),
    ring: { color: "hsl(var(--primary))", offset: 35, pct: 62, rankLabel: "topp-10" },
    cta: { variant: "primary", label: "Se forberedelse →" },
    showDetails: true,
    top: true,
  },
  {
    d: "06",
    m: "sep · sø",
    badge: "srixon",
    badgeLabel: "Srixon Tour",
    status: "ANBEFALT",
    statusColor: "var(--forest)",
    name: "Srixon · Høstcup",
    venue: "Drøbak GK",
    km: "45 km",
    holes: "36 hull",
    hcp: "≤ 10,0",
    stats: [
      { label: "HCP-krav", value: "≤ 10,0", kind: "ok" },
      { label: "Banelengde", value: "6,180 m" },
      { label: "Ranking-poeng", value: "38 p" },
    ],
    why: (
      <>
        Faller i <strong>Overgang-perioden</strong> — lav-stress sammenheng.{" "}
        <em>God lavterskel ranking-poeng-mulighet (38 p kunne sikre Olyo Tour Finalen).</em>
      </>
    ),
    ring: { color: "hsl(var(--success))", offset: 20, pct: 78, rankLabel: "topp-10" },
    cta: { variant: "lime", label: "Meld på" },
    showDetails: true,
  },
  {
    d: "28",
    m: "jun · sø",
    badge: "olyo",
    badgeLabel: "Olyo Tour",
    status: "STREKK",
    statusColor: "var(--warn)",
    name: "Olyo · Trondheim Open",
    venue: "Stiklestad GK",
    km: "480 km",
    holes: "54 hull",
    hcp: "≤ 6,0",
    stats: [
      { label: "HCP-krav", value: "≤ 6,0", kind: "ok" },
      { label: "Banelengde", value: "6,580 m" },
      { label: "Ranking-poeng", value: "52 p", kind: "warn" },
    ],
    why: (
      <>
        Høyere ranking-poeng (52 p) men <strong>krasjer med kort restitusjon</strong> etter Oslo Open (6 dager).{" "}
        <em>Vurder bare hvis Sørlandsåpent gir solide poeng først.</em>
      </>
    ),
    ring: { color: "hsl(var(--warning))", offset: 60, pct: 34, rankLabel: "topp-10" },
    cta: { variant: "outline", label: "Meld på" },
    showDetails: true,
  },
  {
    d: "28",
    m: "jul · ti",
    badge: "klubb",
    badgeLabel: "Klubb",
    status: "ALLEREDE PÅMELDT",
    statusColor: "var(--forest)",
    name: "Klubbmesterskap GFGK",
    venue: "GFGK",
    km: "4 km · hjemmebane",
    holes: "36 hull",
    hcp: "medlemmer",
    why: (
      <>
        <strong>Hjemmebane-fordel</strong> · 12 av siste 18 runder spilt her.{" "}
        <em>Lav stress, høy seier-sannsynlighet. God recovery-turnering etter NM jr.</em>
      </>
    ),
    ring: { color: "hsl(var(--primary))", offset: 5, pct: 95, rankLabel: "topp-3" },
    cta: { variant: "primary", label: "Se detaljer →" },
  },
];

export function AiForeslaTurneringScreen() {
  return (
    <div className="planlegge-scope">
      <PlanleggeSprite />

      <div className="behind" aria-hidden="true">
        <div className="b-side" />
        <div className="b-top" />
        <div className="b-card" style={{ top: "84px", left: "280px", right: "40px", height: "60px" }} />
        <div className="b-card" style={{ top: "160px", left: "280px", right: "40px", height: "120px" }} />
        <div className="b-card" style={{ top: "296px", left: "280px", right: "40px", height: "200px" }} />
      </div>

      <div className="modal-backdrop">
        <div className="modal" role="dialog" aria-label="AI foreslå turnering">
          <div className="ai-head">
            <Link href="/portal/planlegge?tab=turneringer" className="close" aria-label="Lukk">
              <svg fill="none" stroke="currentColor"><use href="#i-x" /></svg>
            </Link>

            <div className="eye">
              <svg width="11" height="11" fill="currentColor"><use href="#i-sparkles" /></svg>
              AI · TURNERINGS-ANBEFALING
            </div>
            <h2>
              4 turneringer <em>matcher</em> Markus
            </h2>
            <div className="meta">Vurdert mot HCP 4.8 · geografi · sesong-plan · ranking-mål</div>

            <div className="src-list">
              {[
                { nm: "Olyo Tour", ct: "12 hendelser" },
                { nm: "Srixon Tour", ct: "8 hendelser" },
                { nm: "Garmin NC", ct: "6 hendelser" },
                { nm: "Klubb-tour", ct: "18 hendelser" },
              ].map((s) => (
                <div key={s.nm} className="src">
                  <span className="chk">
                    <svg fill="none" stroke="currentColor" strokeWidth="3"><use href="#i-check" /></svg>
                  </span>
                  <div className="nm">
                    {s.nm} <span className="ct">{s.ct}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ai-body">
            {RESULTS.map((r, i) => (
              <div key={i} className={`t-result${r.top ? " top" : ""}`}>
                <div className="date">
                  <span className="d">{r.d}</span>
                  <span className="m">{r.m}</span>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span className={`tour-badge ${r.badge}`}>{r.badgeLabel}</span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: r.statusColor,
                        letterSpacing: "0.10em",
                        textTransform: "uppercase",
                      }}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="nm" style={{ marginTop: "6px" }}>{r.name}</div>
                  <div className="meta-line">
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <use href="#i-map" />
                    </svg>{" "}
                    {r.venue} · {r.km}
                    <span className="sep">·</span> {r.holes}
                    <span className="sep">·</span> HCP {r.hcp}
                  </div>
                  {r.stats && (
                    <div className="stats">
                      {r.stats.map((s) => (
                        <div key={s.label} className="t-stat">
                          <div className="l">{s.label}</div>
                          <div className={`v${s.kind === "ok" ? " ok" : s.kind === "warn" ? " warn" : ""}`}>
                            {s.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="why">
                    <span className="lbl">Hvorfor denne?</span>
                    {r.why}
                  </div>
                </div>

                <div className="actions">
                  <div className="prob-ring">
                    <svg viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#EFEDE6" strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke={r.ring.color}
                        strokeWidth="3"
                        strokeDasharray="94.2"
                        strokeDashoffset={r.ring.offset}
                        strokeLinecap="round"
                        transform="rotate(-90 18 18)"
                      />
                    </svg>
                    <div className="pr-v">
                      <span className="num">
                        {r.ring.pct}
                        <span className="u">%</span>
                      </span>
                      <span className="lbl">{r.ring.rankLabel}</span>
                    </div>
                  </div>
                  <button className={`btn btn-${r.cta.variant} btn-sm`}>{r.cta.label}</button>
                  {r.showDetails && <button className="btn btn-ghost btn-xs">Detaljer</button>}
                </div>
              </div>
            ))}
          </div>

          <div className="ai-foot">
            <span className="ghost">
              <strong>4</strong> turneringer · sortert på <strong>matchscore</strong> · oppdatert 2,8 s siden
            </span>
            <button className="btn btn-outline btn-sm">
              <svg fill="none" stroke="currentColor"><use href="#i-refresh" /></svg>
              Endre kriterier
            </button>
            <Link href="/portal/planlegge?tab=turneringer" className="btn btn-primary btn-sm">Lukk</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
