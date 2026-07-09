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
import type { MinGolfData } from "@/lib/min-golf/load-min-golf";
import type { AnalyticsWorkbenchData } from "@/app/portal/analysere/actions";
import type { AkseKey } from "@/lib/v2/tokens";
import type { PyramidArea } from "@/generated/prisma/client";
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
  type StatusTone,
} from "@/components/v2";

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
/** Tall → norsk komma-desimal. */
function komma(n: number, desimaler = 1): string {
  return n.toFixed(desimaler).replace(".", ",");
}
/** Score relativt par: 71 mot 72 → «(−1)», 72 → «(0)». */
function tilPar(score: number, par: number): string {
  const d = score - par;
  return `(${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d)})`;
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
              sub={`snitt per runde · ${sgStatus.runder} runder · ${sgStatus.baseline}`}
              size={mobile ? 48 : 56}
              action={form ? <StatusPill tone={form.tone}>{form.l}</StatusPill> : undefined}
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

      <Kort eyebrow="Hvor du vinner slag">
        {sgStatus.kategorier.length > 0 ? (
          <>
            {sgStatus.kategorier.map((k, i) => (
              <FordelingRad
                key={k.akse}
                code={k.akse}
                label={SG_NAVN[k.akse]}
                signal
                pct={(Math.abs(k.sg) / maxAbs) * 100}
                value={fmtSg(k.sg)}
                neg={k.sg < 0}
                last={i === sgStatus.kategorier.length - 1}
              />
            ))}
            {nesteFokus && (
              <div style={{ marginTop: 12 }}>
                <InnsiktChip>
                  {nesteFokus.omrade} ({nesteFokus.sgTap} per runde). Baseline: {nesteFokus.baseline}.
                </InnsiktChip>
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
              <Icon name={c.ic} size={17} style={{ color: T.lime }} />
            </div>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, marginTop: 14 }}>{c.l}</div>
            <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 4 }}>{c.s}</div>
          </Kort>
        ))}
      </div>
    </div>
  );
}

/* ── Fane: Statistikk ──────────────────────────────────────────────── */

function TabStatistikk({ data }: { data: AnalysereData }) {
  const { rounds } = data.workbench;
  const { tigerFive } = data.minGolf.runder;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: T.gap }}>
        <KpiFlis label="Snittscore · brutto" value={rounds.avgScore != null ? komma(rounds.avgScore) : "–"} />
        <KpiFlis label="Beste runde" value={rounds.bestScore != null ? String(rounds.bestScore) : "–"} />
        <KpiFlis label="Runder i sesong" value={String(rounds.totalRounds)} tint />
      </div>

      <Kort eyebrow="Tiger Five · bortkastede slag" action={<Caps size={9}>Per runde · sesong</Caps>}>
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
  const [aktive, setAktive] = useState<string[]>(training.byAxis.map((b) => b.axis));

  const toggle = (x: string) => setAktive((p) => (p.indexOf(x) !== -1 ? p.filter((y) => y !== x) : [...p, x]));
  const synlig = training.byAxis.filter((b) => aktive.indexOf(b.axis) !== -1);
  const maxMin = Math.max(1, ...synlig.map((b) => b.minutes));

  const filtre = (
    <Kort
      eyebrow="Filtre · akser i fordelingen"
      action={
        <button
          className="v2-press v2-focus"
          onClick={() => setAktive(training.byAxis.map((b) => b.axis))}
          style={{ appearance: "none", cursor: "pointer", background: "none", border: "none", padding: 0, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.lime }}
        >
          NULLSTILL
        </button>
      }
    >
      <Caps size={9} style={{ marginBottom: 7 }}>Akse</Caps>
      <FilterChips items={ALLE_AKSER} active={aktive} axis onToggle={toggle} />
    </Kort>
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
                  pct={(b.minutes / maxMin) * 100}
                  value={`${b.minutes} min · ${b.sessions}`}
                  kol2
                  last={i === arr.length - 1}
                />
              ))}
          </>
        ) : (
          <TomTilstand icon="activity" title="Ingen akser valgt" sub="Slå på minst én akse i filteret." />
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
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {resultat}
      {filtre}
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
};
const TM_PARAMS: TmParam[] = [
  { id: "smash", l: "Smash", unit: "", get: (c) => c.avgSmash, fmt: (v) => komma(v, 2) },
  { id: "ball", l: "Ballhastighet", unit: "mph", get: (c) => c.avgBallSpeed, fmt: (v) => komma(v, 0) },
  { id: "total", l: "Bære", unit: "m", get: (c) => c.avgTotal, fmt: (v) => komma(v, 0) },
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
                  <Caps size={9} style={{ whiteSpace: "nowrap" }}>{p.l}</Caps>
                  <span style={{ fontFamily: T.mono, fontSize: i === 0 ? 30 : 20, fontWeight: 700, color: i === 0 ? T.lime : T.fg, lineHeight: 1, display: "block", marginTop: 7, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                    {raw == null ? "–" : p.fmt(raw)}
                    {raw != null && p.unit && <span style={{ fontSize: 11, color: T.mut, fontWeight: 600 }}> {p.unit}</span>}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ marginTop: 12, fontFamily: T.ui, fontSize: 12, color: T.mut }}>Ingen parametere valgt — slå på i filteret over.</div>
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
              title={s.source}
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
            value={komma(nyeste!.score, nyeste!.score % 1 === 0 ? 0 : 1)}
            size={mobile ? 44 : 48}
            accent
            sub={`Tatt ${kortDato(nyeste!.takenAt)}`}
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
  { id: "sg", l: "SG" },
  { id: "statistikk", l: "Statistikk" },
  { id: "trening", l: "Trening" },
  { id: "trackman", l: "TrackMan" },
  { id: "tester", l: "Tester" },
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
  const [tab, setTab] = useState<TabId>("sg");

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
            <Caps>{eyebrow}</Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel mobile={mobile} em="analyse">Din</Tittel>
            </div>
          </div>
        </div>
      )}

      <PillTabs tabs={TABS.map((t) => ({ id: t.id, l: t.l }))} value={tab} onChange={velgTab} />

      {tab === "sg" && <TabSG data={data} mobile={mobile} />}
      {tab === "statistikk" && <TabStatistikk data={data} />}
      {tab === "trening" && <TabTrening data={data} mobile={mobile} />}
      {tab === "trackman" && <TabTrackman data={data} mobile={mobile} />}
      {tab === "tester" && <TabTester data={data} mobile={mobile} />}
    </div>
  );
}
