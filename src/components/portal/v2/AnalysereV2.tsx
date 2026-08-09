"use client";

/**
 * PlayerHQ Analysere — v2 Presis + opplevelse B-pakke (form + nedbrytning).
 * Komponert fra ui_kits/v2/phq-analysere.jsx, EKTE data fra loadMinGolf +
 * loadAnalyticsWorkbenchData. Kun v2-komponenter; ingen rå hex (kun T.*).
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
import { hentTreningsHistorikkFiltrert } from "@/app/portal/analysere/actions";
import {
  AnalyseFilterBar,
  TOMME_FILTRE,
  type AnalyseFiltre,
} from "./AnalyseFilterBar";
import { MILJO_GRUPPE_LABEL } from "@/lib/taxonomy";
import type { AkseKey } from "@/lib/v2/tokens";
import type { PyramidArea } from "@/generated/prisma/client";
import { useMount, EASE } from "@/lib/v2/hooks";
import {
  T,
  fmtSg,
  Caps,
  Kort,
  TallHero,
  StatusPill,
  Trend,
  FordelingRad,
  FordelingHode,
  KpiFlis,
  Rad,
  PillTabs,
  FilterChips,
  TomTilstand,
  AkseChip,
  Icon,
  HjelpTips,
  HvorforDette,
  Skjelett,
  CTAPill,
  SgKategorier,
  Diagnose,
  NesteFokus,
  SlagLekkasje,
  type StatusTone,
} from "@/components/v2";
import type { HjelpNokkel } from "@/lib/v2/hjelpetekster";
import { PuttingFocusBanner } from "@/components/portal/v2/PuttingFocusBanner";
import type { PuttingSignals } from "@/lib/masterbrain/putting-signals";

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

  // Uthevingen av svakeste område ligger nå i SgKategorier («størst tap»-markør),
  // som også regner ut sin egen skala — derfor ingen maxAbs/svakestAkse her.

  // Score-trend (Paper-fasit playerhq-analyse.html): brutto score over de
  // siste registrerte rundene, eldste til venstre. rounds.rounds kommer desc
  // (nyeste først) — snus for lesbar kronologi i grafen.
  const scoreSerie = rounds.rounds.slice(0, 10).reverse().map((r) => r.score);
  const harScoreSerie = scoreSerie.length >= 2;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr]" style={{ gap: T.gap }}>
      <Kort tint>
        {sgStatus.verdi ? (
          <>
            <TallHero
              label="Strokes Gained · form"
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
            <HvorforDette
              kilde={`Dine ${sgStatus.runder} siste registrerte runder, brutto score.`}
              beregning={`SG måler slag spart mot ${sgStatus.baseline}, ikke mot par. Delene summerer til totalen.`}
              forbehold={`Baseline er ${sgStatus.baseline} — et annet nivå ville gitt et annet tall for akkurat disse rundene.`}
            />
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TomTilstand icon="target" title="Ingen SG-data ennå" sub="Spill en registrert runde for å se Strokes Gained." />
            <Link href="/portal/runde/live" style={{ textDecoration: "none", display: "block" }}>
              <CTAPill icon="flag" full>
                Logg runde
              </CTAPill>
            </Link>
            <Link
              href="/portal/mal/runder/ny"
              style={{
                textDecoration: "none",
                fontFamily: T.ui,
                fontSize: 12,
                fontWeight: 600,
                color: T.fg2,
                textAlign: "center",
              }}
            >
              Hurtig score / importer
            </Link>
          </div>
        )}
      </Kort>

      {/* Bølge 12b: fasit-komponentene fra familie-golfdata erstatter den
          hjemmesnekrede nedbrytningen. SgKategorier har nullinje i midten
          (gevinst høyre / tap venstre) + «størst tap»-markør, som showroomet. */}
      {sgStatus.kategorier.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
          <SgKategorier
            kategorier={sgStatus.kategorier}
            baseline={sgStatus.baseline}
            hjelp="sgOmrade"
            /* 2 desimaler: ekte per-område-SG ligger så tett at 1 desimal gir
               «−0,0» på alle fire og skjuler rangeringen. */
            desimaler={2}
          />
          {nesteFokus?.diagnose && (
            <Diagnose
              symptom={nesteFokus.diagnose.symptom}
              /* bevis = null: datakontrakten bærer ingen spiller-vs-baseline-verdi
                 for symptomet, og fabrikkerte bevis-søyler er verre enn ingen. */
              bevis={null}
              grunnlag={nesteFokus.diagnose.grunnlag}
              resept={{ akse: nesteFokus.diagnose.resept.akse as AkseKey, tekst: nesteFokus.diagnose.resept.tekst }}
              ctaTekst={undefined}
              ctaHref={undefined}
            />
          )}
        </div>
      ) : (
        <Kort eyebrow="Per område" action={<HjelpTips k="sgBaseline" size={12} />}>
          <TomTilstand icon="target" title="Mangler nedbrytning" sub="SG per område fyller seg når runder er registrert." />
        </Kort>
      )}

      {nesteFokus && (
        <div style={{ gridColumn: "1 / -1", display: "grid", gap: T.gap }} className="md:grid-cols-[3fr_2fr]">
          <NesteFokus
            omrade={nesteFokus.omrade}
            akse={nesteFokus.akse}
            sgTap={nesteFokus.sgTap}
            baseline={nesteFokus.baseline}
            begrunnelse={nesteFokus.begrunnelse}
            formelAkse={nesteFokus.formelAkse}
            enTingNa
            handlingTekst={(() => {
              const labels: Record<string, string> = {
                OTT: "tee",
                APP: "innspill",
                ARG: "nærspill",
                PUTT: "putting",
              };
              const n = labels[nesteFokus.akse] ?? "trenings";
              return `Legg inn ${n}-økt denne uka`;
            })()}
            handlingHref={nesteFokus.handlingHref}
          />
          {/* lekkasjeBaand ble beregnet i loaderen men aldri vist — SlagLekkasje
              er fasit-kortet for nettopp den kontrakten ({id,label,sg,slag}). */}
          {nesteFokus.lekkasjeBaand.length > 0 && (
            <SlagLekkasje
              baand={nesteFokus.lekkasjeBaand}
              baseline={nesteFokus.baseline}
              grunnlag={nesteFokus.grunnlag}
              desimaler={2}
            />
          )}
        </div>
      )}

      {harScoreSerie && (
        <Kort eyebrow={`Score · siste ${scoreSerie.length} runder`} style={{ gridColumn: "1 / -1" }}>
          <Trend series={scoreSerie} baseline={null} fmt={(v) => String(v)} />
          <div style={{ display: "flex", gap: 12, marginTop: 8, fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
            <span>beste {Math.min(...scoreSerie)}</span>
            <span>snitt {komma(scoreSerie.reduce((a, b) => a + b, 0) / scoreSerie.length)}</span>
            <span style={{ marginLeft: "auto" }}>siste {scoreSerie[scoreSerie.length - 1]}</span>
          </div>
          <HvorforDette
            kilde={`Brutto score fra de ${scoreSerie.length} siste registrerte rundene. Eldste til venstre.`}
            beregning="Ingen justering for banevanskelighet — tallene vises slik de ble spilt."
            forbehold="Uten course rating er en score på en lett bane og samme score på en vanskelig bane samme punkt i grafen."
          />
        </Kort>
      )}

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

/** Svaret fra hentTreningsHistorikkFiltrert, slik klienten mottar det. */
type HistorikkSvar = Awaited<ReturnType<typeof hentTreningsHistorikkFiltrert>>;

function TabTrening({ data, mobile, userId }: { data: AnalysereData; mobile: boolean; userId: string }) {
  const { training } = data.workbench;

  // Filtrert historikk (2026-07-27). Erstatter den gamle 30-dagers-låsen og
  // akse-filteret som bare skjulte rader i ett kort — nå styrer filteret hele
  // fanen, og tallene kommer fra faktisk gjennomførte driller.
  const [filtre, setFiltre] = useState<AnalyseFiltre>(TOMME_FILTRE);
  const [hist, setHist] = useState<HistorikkSvar | null>(null);
  const [laster, setLaster] = useState(true);

  // Ved filterbytte beholdes forrige resultat til det nye kommer, i stedet for
  // å blanke ut flaten — mindre blafring, og tallene byttes i ett hopp.
  useEffect(() => {
    let aktiv = true;
    hentTreningsHistorikkFiltrert({
      userId,
      periode: filtre.periode,
      filtre: {
        kilde: filtre.kilde,
        pyramide: filtre.akser.length ? filtre.akser : undefined,
        csNivaa: filtre.csNivaaer.length ? filtre.csNivaaer : undefined,
        miljoGrupper: filtre.miljoGrupper.length ? filtre.miljoGrupper : undefined,
      },
    })
      .then((res) => {
        if (aktiv) {
          setHist(res);
          setLaster(false);
        }
      })
      .catch(() => {
        if (aktiv) setLaster(false);
      });
    return () => {
      aktiv = false;
    };
  }, [userId, filtre]);

  const o = hist?.oppsummering;
  const mestTrent = o?.perPyramide[0] ?? null;

  const filtrePanel = (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Kort eyebrow="Vis trening">
        <AnalyseFilterBar
          filtre={filtre}
          onEndre={setFiltre}
          vinduLabel={hist?.vinduLabel ?? "…"}
          fallbackVarsel={hist?.ingenAktivPeriode}
          csNivaaer={hist?.tilgjengeligeCsNivaaer ?? []}
        />
      </Kort>
      {mestTrent && (
        <Kort eyebrow={`Mest trent · ${hist?.vinduLabel ?? ""}`}>
          <AkseChip a={mestTrent.akse as AkseKey} />
          <div style={{ marginTop: 12 }}>
            <TallHero
              value={Math.round(mestTrent.andel * 100)}
              unit="% av tiden"
              sub={`${mestTrent.minutter} min`}
              size={38}
            />
          </div>
        </Kort>
      )}
      {/* Hvor treningen skjedde — «teknikk på range vs på bane» i tall. */}
      {o && o.perMiljoGruppe.length > 0 && (
        <Kort eyebrow="Hvor treningen skjedde">
          <FordelingHode kol2="Min" />
          {o.perMiljoGruppe.map((m, i, arr) => (
            <FordelingRad
              key={m.gruppe}
              code={m.gruppe}
              label={MILJO_GRUPPE_LABEL[m.gruppe]}
              pct={m.andel * 100}
              value={`${m.minutter} min`}
              kol2
              last={i === arr.length - 1}
            />
          ))}
        </Kort>
      )}
    </div>
  );

  const resultat = (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Kort tint>
        <TallHero
          label={`Treningsvolum · ${hist?.vinduLabel ?? ""}`}
          value={laster ? "…" : komma((o?.totaltMinutter ?? 0) / 60)}
          unit="timer"
          sub={
            o
              ? `${o.antallOkter} økter · ${o.antallRader} øvelser${
                  o.andelMaalt > 0 ? ` · ${Math.round(o.andelMaalt * 100)} % målt tid` : ""
                }`
              : "Henter …"
          }
          size={mobile ? 44 : 48}
          action={o ? <StatusPill tone="up">{o.antallOkter} økter</StatusPill> : undefined}
          hjelp="treningsVolum"
        />
      </Kort>

      {/* Fordeling per akse — nå fra faktisk gjennomførte driller. */}
      <Kort eyebrow="Fordeling per område · andel av tiden">
        {o && o.perPyramide.length > 0 ? (
          <>
            <FordelingHode kol2="Min" />
            {o.perPyramide.map((p, i, arr) => (
              <FordelingRad
                key={p.akse}
                code={p.akse}
                label={SG_ETIKETT(p.akse as PyramidArea)}
                pct={p.andel * 100}
                value={`${p.minutter} min`}
                kol2
                last={i === arr.length - 1}
              />
            ))}
            <HvorforDette
              kilde={`${o.antallOkter} loggede ${o.antallOkter === 1 ? "økt" : "økter"} ${hist?.vinduLabel ?? ""}. Bare økter markert som ferdige teller.`}
              beregning="Andel av samlet treningstid per pyramideakse, regnet på hver enkelt øvelse i vinduet."
              forbehold="En økt med øvelser fra flere akser fordeles på øvelsens egen tid, ikke på øktas hovedakse."
            />
          </>
        ) : laster ? (
          <TomTilstand icon="activity" title="Henter trening …" sub="Et øyeblikk." />
        ) : (
          <TomTilstand
            icon="activity"
            title="Ingen trening i dette vinduet"
            sub="Prøv et lengre tidsrom, eller nullstill filtrene."
          />
        )}
      </Kort>

      {/* Selve historikken — én rad per gjennomført øvelse. */}
      <Kort eyebrow="Gjennomført trening">
        {hist && hist.rader.length > 0 ? (
          hist.rader.slice(0, 40).map((r, i, arr) => (
            <Rad
              key={r.id}
              leading={
                <span style={{ width: 46, flex: "none", fontFamily: T.mono, fontSize: 10, color: T.mut }}>
                  {kortDato(new Date(r.dato))}
                </span>
              }
              title={r.navn}
              sub={[
                SG_ETIKETT(r.pyramide as PyramidArea),
                r.omraade,
                r.miljoGruppe ? MILJO_GRUPPE_LABEL[r.miljoGruppe] : null,
                `${r.minutter} min${r.maalt ? "" : " (planlagt)"}`,
              ]
                .filter(Boolean)
                .join(" · ")}
              trailing={r.kilde === "FYS" ? <StatusPill tone="info">Fysisk</StatusPill> : null}
              last={i === arr.length - 1}
            />
          ))
        ) : laster ? (
          <TomTilstand icon="activity" title="Henter trening …" sub="Et øyeblikk." />
        ) : (
          <TomTilstand
            icon="activity"
            title="Ingen økter her"
            sub="Gjennomførte økter dukker opp så snart de er logget."
          />
        )}
      </Kort>

      {training.analyse && (
        <Kort eyebrow="Planlagt vs gjennomført · Bølge 5">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Caps size={9}>Etterlevelse</Caps>
                <HjelpTips k="planEtterlevelse" size={11} />
              </span>
              <div style={{ marginTop: 6, fontFamily: T.disp, fontSize: mobile ? 28 : 32, fontWeight: 700, color: T.fg }}>
                {training.analyse.etterlevelsePct != null ? `${training.analyse.etterlevelsePct} %` : "–"}
              </div>
              <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, marginTop: 4 }}>
                {training.analyse.gjennomforteOkter} av {training.analyse.planlagteOkter} økter
              </div>
            </div>
            <div>
              <Caps size={9}>Reps</Caps>
              <div style={{ marginTop: 6, fontFamily: T.disp, fontSize: mobile ? 28 : 32, fontWeight: 700, color: T.fg }}>
                {training.analyse.faktiskeReps}
              </div>
              <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, marginTop: 4 }}>
                av {training.analyse.planlagteReps} planlagt · {training.analyse.ballerSlatt} baller · {training.analyse.svingerUtenBall} uten ball
              </div>
            </div>
          </div>
        </Kort>
      )}

    </div>
  );

  return mobile ? (
    /* Mobil: filterpanelet ØVERST (før innholdet) — samme rekkefølge som
       desktop (venstre/topp), aldri filtre gjemt under lange lister. */
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {filtrePanel}
      {resultat}
    </div>
  ) : (
    <div className="grid" style={{ gridTemplateColumns: "2fr 3fr", gap: T.gap, alignItems: "start" }}>
      {filtrePanel}
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
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TomTilstand icon="crosshair" title="Ingen TrackMan-data siste 30 dager" sub="Importer eller registrer en TrackMan-økt for å se snitt per kølle." />
          <Link href="/portal/mal/trackman" style={{ textDecoration: "none", display: "block" }}>
            <CTAPill icon="crosshair" full>
              Åpne TrackMan
            </CTAPill>
          </Link>
        </div>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TomTilstand icon="badge-check" title="Ingen testresultater" sub="FYS- og ferdighetstester dukker opp her når de er registrert." />
          <Link href="/portal/tren/tester/ny" style={{ textDecoration: "none", display: "block" }}>
            <CTAPill icon="badge-check" full>
              Registrer test
            </CTAPill>
          </Link>
        </div>
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
        <HvorforDette
          kilde={`TestResult — dine ${tests.length} siste registrerte ${tests.length === 1 ? "test" : "tester"}.`}
          beregning="Ingen omregning. Resultatene vises slik de ble målt."
          forbehold="Referanseverdier per kategori og nivå er ikke låst ennå — resultatet står, vurderingen mangler."
        />
      </Kort>
    </div>
  );
}

/* ── Skjermen ──────────────────────────────────────────────────────── */

const TABS = [
  { id: "sg", l: "SG" },
  { id: "trening", l: "Trening" },
  { id: "tester", l: "Tester" },
  { id: "trackman", l: "TrackMan" },
  { id: "statistikk", l: "Statistikk" },
] as const;
type TabId = (typeof TABS)[number]["id"];
const ER_TAB = (v: string | null): v is TabId => !!v && TABS.some((t) => t.id === v);

export function AnalysereV2({
  data,
  header,
  userId,
  puttingSignals,
  depthMode = "simple",
}: {
  data: AnalysereData;
  /** Overstyr default «Din analyse»-hodet (brukes av AgencyOS coach-speilet).
   *  Render-prop får `mobile` så tittelen forblir responsiv. */
  header?: (mobile: boolean) => ReactNode;
  /** Spilleren analysen gjelder — Trening-fanen henter historikk for denne.
   *  Coach-speilet sender spillerens id, ikke coachens. */
  userId: string;
  /** Putting brain signals — optional, honest nulls ok. */
  puttingSignals?: PuttingSignals | null;
  /** Simple/Deep progressive disclosure — TrackMan-fane kun i deep. */
  depthMode?: "simple" | "deep";
}) {
  const mobile = useMobile();
  const deep = depthMode === "deep";
  const visibleTabs = TABS.filter((t) => deep || t.id !== "trackman");
  const [tab, setTab] = useState<TabId>("sg");

  // URL-tab-state (?tab=) — leses ved mount, oppdateres uten full navigasjon.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("tab");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synk fra URL (?tab=) etter mount er hydrerings-trygt
    if (ER_TAB(q) && (deep || q !== "trackman")) setTab(q);
  }, [deep]);
  // Simple-mode: fall tilbake fra trackman hvis depth byttes
  useEffect(() => {
    if (!deep && tab === "trackman") setTab("sg");
  }, [deep, tab]);
  const velgTab = (id: string) => {
    if (!ER_TAB(id)) return;
    if (!deep && id === "trackman") return;
    setTab(id);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    window.history.replaceState(null, "", url);
  };

  const kat = data.minGolf.kategori;
  const aar = new Date().getFullYear();
  const eyebrow = kat ? `Kategori ${kat.kategori} · ${kat.niva} · Sesong ${aar}` : `Sesong ${aar}`;

  return (
    <div
      data-paper-portal-analysere data-paper-wave-a="analyse"
      style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: T.bg }}
    >
      {/* Paper .topp */}
      {header ? (
        header(mobile)
      ) : (
        <header
          style={{
            flex: "none",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 20px",
            borderBottom: `1px solid ${T.border}`,
            background: T.bg,
            position: "sticky",
            top: 0,
            zIndex: 5,
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: T.fg }}>
              Analyse
            </h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontFamily: T.mono,
                fontSize: 10.5,
                color: T.mut,
                marginTop: 2,
              }}
            >
              {eyebrow}
              {kat && <HjelpTips k="spillerKategori" size={11} />}
            </span>
          </div>
        </header>
      )}

      <div style={{ padding: "12px 16px 0", maxWidth: 720, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <PuttingFocusBanner signals={puttingSignals} />
      </div>

      <div
        style={{
          flex: "none",
          borderBottom: `1px solid ${T.border}`,
          background: T.bg,
          padding: "10px 16px 0",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <PillTabs tabs={visibleTabs.map((t) => ({ id: t.id, l: t.l }))} value={tab} onChange={velgTab} />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "16px 16px 32px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>

      <FaneInnhold key={tab}>
        {tab === "sg" && <TabSG data={data} mobile={mobile} />}
        {tab === "statistikk" && <TabStatistikk data={data} />}
        {tab === "trening" && <TabTrening data={data} mobile={mobile} userId={userId} />}
        {tab === "trackman" && deep && <TabTrackman data={data} mobile={mobile} />}
        {tab === "tester" && <TabTester data={data} mobile={mobile} />}
      </FaneInnhold>
        </div>
      </div>
    </div>
  );
}
