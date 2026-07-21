"use client";

/**
 * PlayerHQ Analysere — v2 (retning C «Presis»). Komponert 1:1 fra
 * ui_kits/v2/phq-analysere.jsx → funksjonen Analysere (fem faner), men med
 * EKTE data fra loadMinGolf + loadAnalyticsWorkbenchData. Kun v2-komponenter
 * fra "@/components/v2"; ingen ad-hoc UI-primitiver, ingen rå hex (kun T.*).
 *
 * Ærlighet foran pixel-1:1: der datakontrakten ikke bærer et felt (per-slag
 * TrackMan, klubbfart/spinn/høyde/landing/side, scoring per hulltype, test-
 * benchmark/percentil, kommende tester, periodevelger), bygges ærlig tom-
 * tilstand — aldri fabrikkerte tall. Se `gaps` i retur-kontrakten.
 *
 * V2Shell (montert i (v2preview)/v2-analysere/page.tsx) eier chrome-en — denne
 * komponenten rendrer bare den indre innholds-stacken.
 */

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import type { MinGolfData } from "@/lib/min-golf/load-min-golf";
import type { AnalyticsWorkbenchData } from "@/app/portal/analysere/actions";
import type { AkseKey } from "@/lib/v2/tokens";
import type { PyramidArea } from "@/generated/prisma/client";
import { useMount, EASE } from "@/lib/v2/hooks";
import {
  T,
  fmtSg,
  Caps,
  Tittel,
  Kort,
  TallHero,
  StatusPill,
  Trend,
  FordelingRad,
  FordelingHode,
  InnsiktChip,
  KpiFlis,
  Rad,
  PillTabs,
  FilterChips,
  TomTilstand,
  AkseChip,
  Icon,
  HjelpTips,
  Skjelett,
  type StatusTone,
} from "@/components/v2";
import type { HjelpNokkel } from "@/lib/v2/hjelpetekster";

/** Laveste tenkelige brutto 18-hulls golfscore — under dette er tallet en datafeil,
 *  ikke en ekte runde. Brukt til å vise lasteskjelett i stedet for umulige score-tall. */
const MIN_MULIG_BRUTTOSCORE = 55;

/* ── Data-kontrakt ─────────────────────────────────────────────────── */

export type AnalysereData = {
  minGolf: MinGolfData;
  workbench: AnalyticsWorkbenchData;
};

/* ── Rene hjelpere (norsk bokmål, brutto tall) ─────────────────────── */

const MND = ["jan.", "feb.", "mar.", "apr.", "mai", "jun.", "jul.", "aug.", "sep.", "okt.", "nov.", "des."];
const SG_NAVN: Record<"OTT" | "APP" | "ARG" | "PUTT", string> = {
  OTT: "Tee-slag",
  APP: "Innspill",
  ARG: "Nærspill",
  PUTT: "Putting",
};

function kortDato(d: Date): string {
  return `${d.getDate()}. ${MND[d.getMonth()]}`;
}
/** Beskrivende øktnavn for TrackMan-listen — «source» er en maskinelt satt
 *  opprinnelses-tag («csv-import»/«html-import»/«api»), aldri et øktnavn, så
 *  bruk aldri den rått. Faller tilbake til dato, kølle kun hvis ekte (alle
 *  slag i økten delte samme kølle) — ingen gjettet kølle/sted. */
function trackManOktNavn(s: { recordedAt: Date; primaryClub: string | null }): string {
  return s.primaryClub
    ? `TrackMan-økt · ${kortDato(s.recordedAt)} · ${s.primaryClub}`
    : `TrackMan-økt · ${kortDato(s.recordedAt)}`;
}
/** Tall → norsk komma-desimal. */
function komma(n: number, desimaler = 1): string {
  return n.toFixed(desimaler).replace(".", ",");
}
/** SG-verdi med to desimaler («−0,03» / «+0,12») — fmtSg sin 1-desimal avrunder
 *  små forskjeller mellom SG-områdene til «−0,0» på alle fire, som skjuler rangeringen. */
function fmtSg2(v: number): string {
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${Math.abs(v).toFixed(2).replace(".", ",")}`;
}
/** Score relativt par: 71 mot 72 → «(−1)», 72 → «(0)». */
function tilPar(score: number, par: number): string {
  const d = score - par;
  return `(${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d)})`;
}

/** Lett oppgang/crossfade på fane-innhold ved fane-bytte — `key={tab}` i
 *  kallstedet tvinger remount så useMount() (reduced-motion-trygg) starter på
 *  nytt hver gang. Ingen animasjonsbibliotek, bare CSS-transition. */
function FaneInnhold({ children }: { children: ReactNode }) {
  const grown = useMount();
  return (
    <div
      style={{
        opacity: grown ? 1 : 0,
        transform: grown ? "translateY(0)" : "translateY(6px)",
        transition: `opacity 220ms ${EASE}, transform 220ms ${EASE}`,
      }}
    >
      {children}
    </div>
  );
}

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser/kolonner). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Fane: SG ──────────────────────────────────────────────────────── */

function TabSG({ data, mobile }: { data: AnalysereData; mobile: boolean }) {
  const { sgStatus, nesteFokus } = data.minGolf;
  const { rounds, training } = data.workbench;

  const tp = sgStatus.trendPunkter;
  const harTrend = tp.length >= 2;
  let form: { l: string; tone: StatusTone } | null = null;
  if (harTrend) {
    const d = tp[tp.length - 1].sg - tp[0].sg;
    form = d > 0.05 ? { l: "Stigende", tone: "lime" } : d < -0.05 ? { l: "Synkende", tone: "down" } : { l: "Stabil", tone: "info" };
  }
  let sgDelta: string | undefined;
  let sgDir: "up" | "down" | undefined;
  if (sgStatus.trend && sgStatus.trend !== "0,0") {
    sgDelta = sgStatus.trend;
    sgDir = sgStatus.trend.startsWith("−") ? "down" : "up";
  }

  const maxAbs = Math.max(0.1, ...sgStatus.kategorier.map((k) => Math.abs(k.sg)));

  return (
    <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr]" style={{ gap: T.gap }}>
      <Kort tint>
        {sgStatus.verdi ? (
          <>
            <TallHero
              label="Total Strokes Gained"
              value={sgStatus.verdi}
              delta={sgDelta}
              dir={sgDir}
              sub={`snitt per runde · siste 10 runder · ${sgStatus.baseline}`}
              size={mobile ? 48 : 56}
              action={form ? <StatusPill tone={form.tone}>{form.l}</StatusPill> : undefined}
              hjelp="sgTotal"
            />
            {harTrend && (
              <div style={{ marginTop: 10 }}>
                <Trend series={tp.map((p) => p.sg)} yMin={Math.min(-1, ...tp.map((p) => p.sg))} />
              </div>
            )}
          </>
        ) : (
          <TomTilstand icon="target" title="Ingen SG-data ennå" sub="Spill en registrert runde for å se Strokes Gained." />
        )}
      </Kort>

      <Kort eyebrow="Hvor du vinner slag" action={<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><HjelpTips k="sgBaseline" size={12} /><HjelpTips k="sgOmrade" /></span>}>
        {sgStatus.kategorier.length > 0 ? (
          <>
            {sgStatus.kategorier.map((k, i) => (
              <FordelingRad
                key={k.akse}
                code={k.akse}
                label={SG_NAVN[k.akse]}
                signal
                pct={(Math.abs(k.sg) / maxAbs) * 100}
                value={fmtSg2(k.sg)}
                neg={k.sg < 0}
                last={i === sgStatus.kategorier.length - 1}
              />
            ))}
            {nesteFokus && (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <InnsiktChip>
                  {nesteFokus.omrade} ({nesteFokus.sgTap} per runde). Baseline: {nesteFokus.baseline}.
                </InnsiktChip>
                {/* Bro: SG-gap → AK-resept → Workbench (plan natt/Cherny-standard) */}
                {nesteFokus.diagnose && (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: T.panel2,
                      border: `1px solid ${T.border}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <Caps size={9} style={{ color: T.mut }}>
                      Neste fokus
                    </Caps>
                    <div style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, lineHeight: 1.35 }}>
                      {nesteFokus.diagnose.symptom}
                    </div>
                    <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, lineHeight: 1.4 }}>
                      {nesteFokus.diagnose.grunnlag}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
                      <AkseChip a={nesteFokus.diagnose.resept.akse as AkseKey} />
                      <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.fg2 }}>
                        {nesteFokus.diagnose.resept.tekst}
                      </span>
                    </div>
                  </div>
                )}
                <Link
                  href={nesteFokus.handlingHref}
                  className="v2-press v2-focus"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    height: 40,
                    padding: "0 16px",
                    borderRadius: 9999,
                    background: T.lime,
                    color: T.onLime,
                    fontFamily: T.ui,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  <Icon name="calendar" size={15} style={{ color: T.onLime }} />
                  Planlegg dette i Workbench
                </Link>
              </div>
            )}
          </>
        ) : (
          <TomTilstand icon="target" title="Mangler nedbrytning" sub="SG per område fyller seg når runder er registrert." />
        )}
      </Kort>

      <div className="grid grid-cols-2 md:grid-cols-3" style={{ gridColumn: "1 / -1", gap: T.gap, alignItems: "start" }}>
        {[
          { ic: "target", l: "SG-nedbrytning", s: `${sgStatus.kategorier.length} områder · ${sgStatus.baseline}` },
          { ic: "flag", l: "Runder", s: `${rounds.totalRounds} i sesong${rounds.bestScore != null ? ` · beste ${rounds.bestScore}` : ""}` },
          { ic: "activity", l: "Treningsøkter", s: `${training.sessions} økter · ${training.minutes} min` },
        ].map((c, i) => (
          <Kort key={c.l} tint={i === 2} style={mobile && i === 2 ? { gridColumn: "1 / -1" } : undefined}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Icon name={c.ic} size={17} style={{ color: i === 2 ? T.lime : T.fg2 }} />
            </div>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, marginTop: 14 }}>{c.l}</div>
            <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 4 }}>{c.s}</div>
          </Kort>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gridColumn: "1 / -1", gap: T.gap }}>
        {[
          { href: "/portal/analysere/hull", ic: "map", l: "Hull-analyse", s: "Hvor taper du slag — hull for hull" },
          { href: "/portal/gameplan", ic: "crosshair", l: "Gameplan", s: "Banekart, spredning og hull-for-hull sikte" },
          { href: "/portal/datagolf", ic: "trophy", l: "Sammenlign med proffer", s: "Din SG mot DataGolf-baseline" },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="v2-press v2-focus" style={{ textDecoration: "none" }}>
            <Kort>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: T.panel3, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <Icon name={c.ic} size={16} style={{ color: T.lime }} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14, color: T.fg }}>{c.l}</div>
                  <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2 }}>{c.s}</div>
                </div>
                <Icon name="chevron-right" size={15} style={{ color: T.mut, flex: "none" }} />
              </div>
            </Kort>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Fane: Statistikk ──────────────────────────────────────────────── */

function TabStatistikk({ data }: { data: AnalysereData }) {
  const { rounds } = data.workbench;
  const { tigerFive } = data.minGolf.runder;

  // Umulig brutto-score (< 55) er en datafeil, ikke en ekte runde — vis
  // lasteskjelett fremfor å rendre tallet. Ellers: ingen tell-opp-fra-0-animasjon
  // (instant), siden en golfscore aldri reelt passerer gjennom 0 → mål.
  const avgUmulig = rounds.avgScore != null && rounds.avgScore < MIN_MULIG_BRUTTOSCORE;
  const besteUmulig = rounds.bestScore != null && rounds.bestScore < MIN_MULIG_BRUTTOSCORE;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: T.gap }}>
        {avgUmulig ? (
          <Skjelett linjer={0} />
        ) : (
          <KpiFlis label="Snittscore · brutto" value={rounds.avgScore != null ? komma(rounds.avgScore) : "–"} instant />
        )}
        {besteUmulig ? (
          <Skjelett linjer={0} />
        ) : (
          <KpiFlis label="Beste runde" value={rounds.bestScore != null ? String(rounds.bestScore) : "–"} instant />
        )}
        <KpiFlis label="Runder i sesong" value={String(rounds.totalRounds)} tint />
      </div>

      <Kort eyebrow="Tiger Five · bortkastede slag" action={<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Caps size={9}>Per runde · sesong</Caps><HjelpTips k="tigerFive" size={11} /></span>}>
        {tigerFive.length > 0 ? (
          tigerFive.map((t, i) => {
            const v = typeof t.verdi === "number" ? t.verdi : Number(t.verdi);
            return (
              <FordelingRad
                key={t.navn}
                label={t.navn}
                pct={Math.min(100, (v / 2) * 100)}
                value={komma(v)}
                neg={t.status === "risiko" || t.status === "varsel"}
                last={i === tigerFive.length - 1}
              />
            );
          })
        ) : (
          <TomTilstand icon="flag" title="Ingen hull-data" sub="Registrer runder med hull-for-hull for Tiger Five." />
        )}
      </Kort>

      <Kort
        eyebrow="Runde-historikk"
        action={<Caps size={9}>{rounds.rounds.length} runder</Caps>}
      >
        {rounds.rounds.length > 0 ? (
          rounds.rounds.slice(0, 10).map((r, i, arr) => (
            <Rad
              key={r.id}
              leading={<span style={{ width: 46, flex: "none", fontFamily: T.mono, fontSize: 10, color: T.mut }}>{kortDato(r.playedAt)}</span>}
              title={r.courseName}
              meta={
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.fg }}>
                    {r.score} <span style={{ color: T.mut, fontWeight: 600, fontSize: 10 }}>{tilPar(r.score, r.par)}</span>
                  </span>
                  <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: r.sgTotal == null ? T.mut : r.sgTotal < 0 ? T.down : T.up, width: 44, textAlign: "right" }}>
                    {r.sgTotal == null ? "–" : fmtSg(r.sgTotal)}
                  </span>
                </span>
              }
              trailing={null}
              last={i === Math.min(10, arr.length) - 1}
            />
          ))
        ) : (
          <TomTilstand icon="flag" title="Ingen runder" sub="Runder du registrerer dukker opp her." />
        )}
      </Kort>
    </div>
  );
}

/* ── Fane: Trening ─────────────────────────────────────────────────── */

const ALLE_AKSER: AkseKey[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

function TabTrening({ data, mobile }: { data: AnalysereData; mobile: boolean }) {
  const { training } = data.workbench;
  // Alle akser forhåndsvalgt (ikke bare aksene med registrerte minutter) — så
  // fordelingskortet viser en fylt graf ved første besøk i stedet for
  // tom-tilstand, selv når enkelte akser ennå ikke har treningsdata.
  const [aktive, setAktive] = useState<string[]>(ALLE_AKSER);

  const toggle = (x: string) => setAktive((p) => (p.indexOf(x) !== -1 ? p.filter((y) => y !== x) : [...p, x]));
  const synlig = training.byAxis.filter((b) => aktive.indexOf(b.axis) !== -1);
  // Ekte andel av total tid (summerer til 100 %) — kortet heter «andel av
  // tiden», så prosenten må aldri normaliseres mot største akse.
  const synligTotalMin = Math.max(1, synlig.reduce((sum, b) => sum + b.minutes, 0));

  // Sekundært innsiktskort under filteret (desktop) — mest trente akse totalt
  // siste 30 dager. Rene tall som allerede ligger i training.byAxis, ingen ny
  // datakilde; unngår tom flate uten å duplisere fordelings-listen til høyre.
  const totalMin = training.byAxis.reduce((s, b) => s + b.minutes, 0);
  const mestTrent = totalMin > 0 ? training.byAxis.slice().sort((a, b) => b.minutes - a.minutes)[0] : null;

  const filtre = (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Kort
        eyebrow="Filtre · akser i fordelingen"
        action={
          <button
            className="v2-press v2-focus"
            onClick={() => setAktive(ALLE_AKSER)}
            style={{ appearance: "none", cursor: "pointer", background: "none", border: "none", padding: 0, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.lime }}
          >
            NULLSTILL
          </button>
        }
      >
        <Caps size={9} style={{ marginBottom: 7 }}>Akse</Caps>
        <FilterChips items={ALLE_AKSER} active={aktive} axis onToggle={toggle} />
      </Kort>
      {/* Vises på ALLE flater — mobil skal ha samme data som desktop
          (Anders 2026-07-13: all data/historikk/filtre på begge). */}
      {mestTrent && (
        <Kort eyebrow="Mest trent · siste 30 dager">
          <AkseChip a={mestTrent.axis as AkseKey} />
          <div style={{ marginTop: 12 }}>
            <TallHero
              value={Math.round((mestTrent.minutes / totalMin) * 100)}
              unit="% av volumet"
              sub={`${mestTrent.minutes} min · ${mestTrent.sessions} økter`}
              size={38}
            />
          </div>
        </Kort>
      )}
    </div>
  );

  const resultat = (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Kort tint>
        <TallHero
          label="Treningsvolum · siste 30 dager"
          value={komma(training.minutes / 60)}
          unit="timer"
          sub={`${training.sessions} økter · ${training.reps} reps`}
          size={mobile ? 44 : 48}
          action={<StatusPill tone="up">{training.sessions} økter</StatusPill>}
        />
      </Kort>

      <Kort eyebrow="Fordeling per akse · andel av tiden">
        {synlig.length > 0 ? (
          <>
            <FordelingHode kol2="Min · Økter" />
            {synlig
              .slice()
              .sort((a, b) => b.minutes - a.minutes)
              .map((b, i, arr) => (
                <FordelingRad
                  key={b.axis}
                  code={b.axis}
                  label={SG_ETIKETT(b.axis)}
                  pct={(b.minutes / synligTotalMin) * 100}
                  value={`${b.minutes} min · ${b.sessions}`}
                  kol2
                  last={i === arr.length - 1}
                />
              ))}
          </>
        ) : aktive.length === 0 ? (
          <TomTilstand icon="activity" title="Ingen akser valgt" sub="Slå på minst én akse i filteret." />
        ) : training.sessions > 0 ? (
          /* Ærlig tomtilstand: KPI-en over teller økter/timer fra en annen kilde
             enn per-akse-fordelingen — si det som det er, ikke «ingen data». */
          <TomTilstand icon="activity" title="Øktene mangler områdefordeling ennå" sub="Øktene dine er logget, men uten fordeling per akse. Fordelingen fylles når økter logges med øvelser per område." />
        ) : (
          <TomTilstand icon="activity" title="Ingen treningsdata ennå" sub="Fordelingen fylles når treningsøkter er logget med øvelser." />
        )}
      </Kort>

      <Kort eyebrow="Siste økter">
        {training.recentSessions.length > 0 ? (
          training.recentSessions.map((s, i, arr) => (
            <Rad
              key={s.id}
              leading={<span style={{ width: 46, flex: "none", fontFamily: T.mono, fontSize: 10, color: T.mut }}>{kortDato(s.date)}</span>}
              title={s.title}
              sub={`${s.durationMin} min${s.reps > 0 ? ` · ${s.reps} reps` : ""}`}
              trailing={null}
              last={i === arr.length - 1}
            />
          ))
        ) : (
          <TomTilstand icon="activity" title="Ingen økter" sub="Registrerte treningsøkter vises her." />
        )}
      </Kort>
    </div>
  );

  return mobile ? (
    /* Mobil: filterpanelet ØVERST (før innholdet) — samme rekkefølge som
       desktop (venstre/topp), aldri filtre gjemt under lange lister. */
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {filtre}
      {resultat}
    </div>
  ) : (
    <div className="grid" style={{ gridTemplateColumns: "2fr 3fr", gap: T.gap, alignItems: "start" }}>
      {filtre}
      {resultat}
    </div>
  );
}

/** Akse-etikett i klarspråk (pyramiden). */
function SG_ETIKETT(a: PyramidArea): string {
  const map: Record<string, string> = { FYS: "Fysisk", TEK: "Teknikk", SLAG: "Slag", SPILL: "Spill", TURN: "Turnering" };
  return map[a] ?? a;
}

/* ── Fane: TrackMan (per kølle · spillervalgte parametere) ─────────── */

type TmParam = {
  id: string;
  l: string;
  unit: string;
  get: (c: AnalyticsWorkbenchData["trackman"]["clubs"][number]) => number | null;
  fmt: (v: number) => string;
  /** «?»-nøkkel i tekstbanken — TrackMan-tallene er faguttrykk (låst regel). */
  hjelp?: HjelpNokkel;
};
const TM_PARAMS: TmParam[] = [
  { id: "smash", l: "Smash", unit: "", get: (c) => c.avgSmash, fmt: (v) => komma(v, 2), hjelp: "smashFactor" },
  { id: "ball", l: "Ballhastighet", unit: "mph", get: (c) => c.avgBallSpeed, fmt: (v) => komma(v, 0), hjelp: "ballhastighet" },
  { id: "total", l: "Bære", unit: "m", get: (c) => c.avgTotal, fmt: (v) => komma(v, 0), hjelp: "baereLengde" },
];

function TabTrackman({ data, mobile }: { data: AnalysereData; mobile: boolean }) {
  const { trackman } = data.workbench;
  const clubs = trackman.clubs;
  const [kolle, setKolle] = useState<string>(clubs[0]?.club ?? "");
  const [params, setParams] = useState<string[]>(TM_PARAMS.map((p) => p.id));

  const toggleParam = (id: string) => setParams((p) => (p.indexOf(id) !== -1 ? p.filter((x) => x !== id) : [...p, id]));
  const valgt = clubs.find((c) => c.club === kolle) ?? clubs[0];
  const vis = TM_PARAMS.filter((p) => params.indexOf(p.id) !== -1);

  if (clubs.length === 0) {
    return (
      <Kort>
        <TomTilstand icon="crosshair" title="Ingen TrackMan-data siste 30 dager" sub="Importer eller registrer en TrackMan-økt for å se snitt per kølle." />
      </Kort>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Filter: kølle → parametere (Anders-krav: spilleren velger kolonnene, bredden følger valget) */}
      <Kort eyebrow="Filter · kølle → parametere">
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <div>
            <Caps size={9} style={{ marginBottom: 7 }}>Kølle</Caps>
            <PillTabs tabs={clubs.map((c) => ({ id: c.club, l: c.club }))} value={valgt?.club ?? ""} onChange={setKolle} />
          </div>
          <div>
            <Caps size={9} style={{ marginBottom: 7 }}>TrackMan-parametere (kolonnene dine)</Caps>
            <FilterChips items={TM_PARAMS.map((p) => p.l)} active={vis.map((p) => p.l)} onToggle={(l) => {
              const p = TM_PARAMS.find((x) => x.l === l);
              if (p) toggleParam(p.id);
            }} />
          </div>
        </div>
      </Kort>

      {/* Snitt-hero — bredden følger parameter-valget (auto-fit-grid) */}
      <Kort tint>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Caps>{valgt?.club} · snitt</Caps>
          <StatusPill tone="lime">{valgt?.shots} slag</StatusPill>
        </div>
        {vis.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${mobile ? 100 : 122}px, 1fr))`, gap: "16px 20px", marginTop: 14 }}>
            {vis.map((p, i) => {
              const raw = valgt ? p.get(valgt) : null;
              return (
                <div key={p.id}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Caps size={9} style={{ whiteSpace: "nowrap" }}>{p.l}</Caps>{p.hjelp && <HjelpTips k={p.hjelp} size={10} />}</span>
                  <span style={{ fontFamily: T.mono, fontSize: i === 0 ? 30 : 20, fontWeight: 700, color: i === 0 ? T.lime : T.fg, lineHeight: 1, display: "block", marginTop: 7, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                    {raw == null ? "–" : p.fmt(raw)}
                    {raw != null && p.unit && <span style={{ fontSize: 11, color: T.mut, fontWeight: 600 }}> {p.unit}</span>}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ marginTop: 12, fontFamily: T.ui, fontSize: 12, color: T.fg2 }}>Ingen parametere valgt — slå på i filteret over.</div>
        )}
      </Kort>

      {/* Slag-for-slag er ikke i datakontrakten (importen lagrer kun snitt per kølle) */}
      <Kort eyebrow="Alle slag · slag-for-slag">
        <TomTilstand icon="list" title="Slag-for-slag ikke tilgjengelig ennå" sub="TrackMan-importen lagrer i dag kun snitt per kølle — ikke hvert enkelt slag." />
      </Kort>

      {/* TrackMan-økter (ekte) */}
      {trackman.sessions.length > 0 && (
        <Kort eyebrow="TrackMan-økter" action={<Caps size={9}>{trackman.sessions.length} økter</Caps>}>
          {trackman.sessions.map((s, i, arr) => (
            <Rad
              key={s.id}
              leading={<span style={{ width: 46, flex: "none", fontFamily: T.mono, fontSize: 10, color: T.mut }}>{kortDato(s.recordedAt)}</span>}
              title={trackManOktNavn(s)}
              meta={<span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg }}>{s.shotCount} slag</span>}
              trailing={null}
              last={i === arr.length - 1}
            />
          ))}
        </Kort>
      )}
    </div>
  );
}

/* ── Fane: Tester ──────────────────────────────────────────────────── */

function TabTester({ data, mobile }: { data: AnalysereData; mobile: boolean }) {
  const { tests } = data.workbench;
  const nyeste = tests[0] ?? null;

  if (tests.length === 0) {
    return (
      <Kort>
        <TomTilstand icon="badge-check" title="Ingen testresultater" sub="FYS- og ferdighetstester dukker opp her når de er registrert." />
      </Kort>
    );
  }

  // Delta mot forrige registrering av SAMME test (ulike testtyper har ulik
  // skala — sammenligning på tvers ville villede). Ingen tidligere treff →
  // «Første måling», aldri fabrikkert delta.
  const desimaler = nyeste!.score % 1 === 0 ? 0 : 1;
  const forrige = tests.slice(1).find((t) => t.name === nyeste!.name) ?? null;
  let heroDelta: string | undefined;
  let heroDir: "up" | "down" | undefined;
  let heroSub: string;
  if (forrige) {
    const diff = nyeste!.score - forrige.score;
    heroDelta = `${diff > 0 ? "+" : diff < 0 ? "−" : ""}${komma(Math.abs(diff), desimaler)}`;
    heroDir = diff < 0 ? "down" : "up";
    heroSub = `vs. forrige · Tatt ${kortDato(nyeste!.takenAt)}`;
  } else {
    heroSub = `Første måling · Tatt ${kortDato(nyeste!.takenAt)}`;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr]" style={{ gap: T.gap, alignItems: "start" }}>
      <Kort tint>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Caps>Siste test</Caps>
          <AkseChip a={nyeste!.pyramidArea as AkseKey} />
        </div>
        <div style={{ marginTop: 12 }}>
          <TallHero
            label={nyeste!.name}
            value={komma(nyeste!.score, desimaler)}
            delta={heroDelta}
            dir={heroDir}
            size={mobile ? 44 : 48}
            accent
            sub={heroSub}
          />
        </div>
      </Kort>

      <Kort eyebrow="Testresultater · der du står nå">
        {tests.map((t, i) => (
          <Rad
            key={t.id}
            title={t.name}
            sub={kortDato(t.takenAt)}
            meta={
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <AkseChip a={t.pyramidArea as AkseKey} />
                <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 700, color: T.fg, width: 56, textAlign: "right" }}>
                  {komma(t.score, t.score % 1 === 0 ? 0 : 1)}
                </span>
              </span>
            }
            trailing={null}
            last={i === tests.length - 1}
          />
        ))}
      </Kort>
    </div>
  );
}

/* ── Skjermen ──────────────────────────────────────────────────────── */

const TABS = [
  { id: "trening", l: "Trening" },
  { id: "tester", l: "Tester" },
  { id: "trackman", l: "TrackMan" },
  { id: "sg", l: "SG" },
  { id: "statistikk", l: "Statistikk" },
] as const;
type TabId = (typeof TABS)[number]["id"];
const ER_TAB = (v: string | null): v is TabId => !!v && TABS.some((t) => t.id === v);

export function AnalysereV2({
  data,
  header,
}: {
  data: AnalysereData;
  /** Overstyr default «Din analyse»-hodet (brukes av AgencyOS coach-speilet).
   *  Render-prop får `mobile` så tittelen forblir responsiv. */
  header?: (mobile: boolean) => ReactNode;
}) {
  const mobile = useMobile();
  const [tab, setTab] = useState<TabId>("trening");

  // URL-tab-state (?tab=) — leses ved mount, oppdateres uten full navigasjon.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("tab");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synk fra URL (?tab=) etter mount er hydrerings-trygt
    if (ER_TAB(q)) setTab(q);
  }, []);
  const velgTab = (id: string) => {
    if (!ER_TAB(id)) return;
    setTab(id);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    window.history.replaceState(null, "", url);
  };

  const kat = data.minGolf.kategori;
  const aar = new Date().getFullYear();
  const eyebrow = kat ? `Kategori ${kat.kategori} · ${kat.niva} · Sesong ${aar}` : `Sesong ${aar}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {header ? (
        header(mobile)
      ) : (
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Caps>{eyebrow}</Caps>{kat && <HjelpTips k="spillerKategori" size={11} />}</span>
            <div style={{ marginTop: 10 }}>
              <Tittel mobile={mobile} em="analyse">Din</Tittel>
            </div>
          </div>
        </div>
      )}

      <PillTabs tabs={TABS.map((t) => ({ id: t.id, l: t.l }))} value={tab} onChange={velgTab} />

      <FaneInnhold key={tab}>
        {tab === "sg" && <TabSG data={data} mobile={mobile} />}
        {tab === "statistikk" && <TabStatistikk data={data} />}
        {tab === "trening" && <TabTrening data={data} mobile={mobile} />}
        {tab === "trackman" && <TabTrackman data={data} mobile={mobile} />}
        {tab === "tester" && <TabTester data={data} mobile={mobile} />}
      </FaneInnhold>
    </div>
  );
}
