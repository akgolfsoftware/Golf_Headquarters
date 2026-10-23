"use client";

/**
 * SG-hub for coach i PlayerHQ (/portal/mal/sg-hub/coach/[spillerId], /[club] og /equipment) i Precision Athletics.
 * Fasit: PlayerHQ-flatene i docs/design-system/utkast-playerhq/ (stats-dybde.html og meg.html: topp med tilbake,
 * kort, tall i mono, piller for status). Stil: playerhq-ny.css og playerhq-ny-sghub.css.
 *
 * Erstatter CoachSgHubSpillerV2, CoachSgHubKolleV2 og UtstyrHelseV2. Data og beregninger er uendret
 * (sidene regner D-Plane, treffpunkt, smash-kurve og equipment fit som før); Enkel/Avansert er samme
 * preferanse (setSgHubMode).
 *
 * Avvik:
 *   - Ingen egen tegning finnes for coachens SG-hub; skjermene følger PlayerHQ-mønsteret.
 *   - Slagtabellen er kortrader som brytes, ikke en tabell som ruller sidelengs (beslutninger.md §Aldri sidelengs rulling).
 *   - Grafene (D-Plane, treffpunkt, smash-kurve) er de samme komponentene som før.
 */
import { useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Wrench } from "lucide-react";
import { DPlanePlot } from "@/components/sg-hub/DPlanePlot";
import { StrikeHeatmap } from "@/components/sg-hub/StrikeHeatmap";
import { SmashCurvePlot } from "@/components/sg-hub/SmashCurvePlot";
import type { DPlaneResult } from "@/lib/sg-hub/d-plane";
import type { StrikeResult } from "@/lib/sg-hub/strike-pattern";
import type { SmashCurveResult } from "@/lib/sg-hub/smash-curve";
import type { ClubFitReport, FitMetric, FitStatus } from "@/lib/sg-hub/equipment-fit";
import { formaterTall } from "@/lib/format-tall";
import { setSgHubMode } from "@/app/portal/(legacy)/mal/sg-hub/mode-action";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-sghub.css";

function Topp({ tilbake, tilbakeTekst, dato, tittel, kilde, hoyre }: { tilbake: string; tilbakeTekst: string; dato: string; tittel: string; kilde?: string; hoyre?: ReactNode }) {
  return <SkraTopp
    lav
    etikett={tittel}
    bilde="/images/playerhq/stats-topp.jpg" bildePosisjon="50% 50%"
    overlinje={dato}
    tittel={tittel}
    ingress={kilde}
    handling={<span className="skra-topp-rad">
      <span className="skra-tilbake"><Link className="phn-sg-tilbake" href={tilbake}><ChevronLeft size={18} aria-hidden />{tilbakeTekst}</Link></span>
      {hoyre}
    </span>}
  />;
}

/* ---------- Spilleroversikt ---------- */

export type PHSgHubCoachSpillerData = { spillerNavn: string; antallOkter: number; tierLabel: string; klubber: string[]; baseHref: string };

export function PHSgHubCoachSpiller({ data }: { data: PHSgHubCoachSpillerData }) {
  return <div className="phn phn-sg phn-skra"><Topp tilbake="/portal/mal/sg-hub" tilbakeTekst="SG-hub" dato="SG-hub · coach" tittel={data.spillerNavn}
      kilde="Alle innsikter og data tilhører spilleren." /><SkraFlyt lav>
    <div className="phn-sg-tall">
      <div className="phn-kort"><span className="phn-dato">TrackMan-økter</span><strong className="phn-sg-verdi">{data.antallOkter}</strong></div>
      <div className="phn-kort"><span className="phn-dato">Køller registrert</span><strong className="phn-sg-verdi">{data.klubber.length}</strong></div>
      <div className="phn-kort"><span className="phn-dato">Nivå</span><strong className="phn-sg-verdi">{data.tierLabel}</strong></div>
    </div>
    <section className="phn-seksjon" aria-labelledby="sg-koller">
      <div className="phn-sek-topp"><h2 id="sg-koller">Per kølle</h2></div>
      {data.klubber.length === 0
        ? <div className="phn-kort" style={{ background: "var(--phn-sand-100)" }}><b>Ingen TrackMan-data ennå</b><p className="phn-forklar">{data.spillerNavn} har ingen TrackMan-slag registrert.</p></div>
        : <div className="phn-sg-koller">{data.klubber.map((k) => <Link key={k} href={`${data.baseHref}/${encodeURIComponent(k)}`}><span>{k}</span><ChevronRight size={16} aria-hidden /></Link>)}</div>}
    </section>
    <Link className="phn-rad-lenke" href={`${data.baseHref}/equipment`}>
      <span className="phn-sg-rad"><Wrench size={18} aria-hidden /><span><b>Equipment Fit</b><span className="phn-kilde">Helsesjekk per kølle på launch, spin og smash.</span></span></span>
      <ChevronRight className="phn-ikon" size={18} aria-hidden />
    </Link>
  </SkraFlyt></div>;
}

/* ---------- Per kølle ---------- */

export type PHSgHubSlag = { nr: number; face: string; path: string; smash: string; clubSpeed: string; ballSpeed: string; lengde: string };
export type PHSgHubCoachKolleData = {
  spillerNavn: string; kolle: string; antallSlag: number; antallOkter: number; advanced: boolean;
  dplaneLabel: string; dplaneKonsistensPct: number; sweetPct: number; avgSmash: number; optimumSpeed: number; aboveOptimumPct: number;
  dplane: DPlaneResult; strike: StrikeResult; smash: SmashCurveResult; skudd: PHSgHubSlag[];
};

const komma = (v: number | string) => String(v).replace(".", ",");

function ModusVelger({ advanced }: { advanced: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const velg = (mode: "simple" | "advanced") => {
    if ((mode === "advanced") === advanced) return;
    start(async () => { await setSgHubMode(mode); router.refresh(); });
  };
  return <div className="phn-valg" role="group" aria-label="Visning" style={{ opacity: pending ? 0.6 : 1 }}>
    <button type="button" aria-pressed={!advanced} onClick={() => velg("simple")}>Enkel</button>
    <button type="button" aria-pressed={advanced} onClick={() => velg("advanced")}>Avansert</button>
  </div>;
}

export function PHSgHubCoachKolle({ data, backHref }: { data: PHSgHubCoachKolleData | { tom: true; spillerNavn: string; kolle: string }; backHref: string }) {
  if ("tom" in data) {
    return <div className="phn phn-sg phn-skra"><Topp tilbake={backHref} tilbakeTekst={data.spillerNavn} dato={`SG-hub · ${data.spillerNavn}`} tittel={data.kolle} /><SkraFlyt lav>
      <div className="phn-kort" style={{ background: "var(--phn-sand-100)" }}><b>Ingen data for {data.kolle}</b><p className="phn-forklar">Ingen TrackMan-slag registrert for {data.kolle} hos {data.spillerNavn}.</p></div>
    </SkraFlyt></div>;
  }
  return <div className="phn phn-sg phn-skra"><Topp tilbake={backHref} tilbakeTekst={data.spillerNavn} dato={`SG-hub · ${data.spillerNavn} · per kølle`} tittel={data.kolle}
      kilde={`${data.antallSlag} slag · ${data.antallOkter} ${data.antallOkter === 1 ? "økt" : "økter"} · TrackMan`} hoyre={<ModusVelger advanced={data.advanced} />} /><SkraFlyt lav>

    <div className="phn-sg-tall">
      <div className="phn-kort"><span className="phn-dato">D-Plane</span><strong className="phn-sg-ord">{data.dplaneLabel}</strong><span className="phn-kilde">{data.dplaneKonsistensPct} % konsistens</span></div>
      <div className="phn-kort"><span className="phn-dato">Sweet spot</span><strong className="phn-sg-verdi">{data.sweetPct}<small> %</small></strong><span className="phn-kilde">Smash factor {komma(data.avgSmash)}</span></div>
      <div className="phn-kort"><span className="phn-dato">Optimum Club Speed</span><strong className="phn-sg-verdi">{data.optimumSpeed > 0 ? komma(data.optimumSpeed) : "—"}{data.optimumSpeed > 0 && <small> mph</small>}</strong><span className="phn-kilde">{data.aboveOptimumPct > 0 ? `${data.aboveOptimumPct} % over optimum` : "For lite data"}</span></div>
    </div>

    <section className="phn-kort" aria-labelledby="sg-dplane">
      <h2 id="sg-dplane" className="phn-sg-h">D-Plane · kurvemønster</h2>
      {!data.advanced && <p className="phn-forklar">Dominerende mønster: <b>{data.dplaneLabel}</b> ({data.dplaneKonsistensPct} % av slagene).</p>}
      <div className="phn-sg-graf"><DPlanePlot result={data.dplane} advanced={data.advanced} /></div>
    </section>
    <section className="phn-kort" aria-labelledby="sg-treff">
      <h2 id="sg-treff" className="phn-sg-h">Treffpunkt · beregnet</h2>
      {!data.advanced && <p className="phn-forklar">{data.sweetPct} % sweet spot · snitt Smash Factor {komma(data.avgSmash)}.</p>}
      <div className="phn-sg-graf midt"><StrikeHeatmap result={data.strike} advanced={data.advanced} /></div>
    </section>
    <section className="phn-kort" aria-labelledby="sg-smash">
      <h2 id="sg-smash" className="phn-sg-h">Smash-kurve · effektivitet</h2>
      {!data.advanced && data.optimumSpeed > 0 && <p className="phn-forklar">Optimal Club Speed: <b>{komma(data.optimumSpeed)} mph</b>{data.aboveOptimumPct > 0 ? ` · ${data.aboveOptimumPct} % over optimum` : ""}.</p>}
      <div className="phn-sg-graf"><SmashCurvePlot result={data.smash} advanced={data.advanced} /></div>
    </section>

    {data.advanced && <section className="phn-seksjon" aria-labelledby="sg-slag">
      <div className="phn-sek-topp"><h2 id="sg-slag">Alle slag</h2><span className="phn-kilde">Total er TrackMan-total lengde</span></div>
      <ol className="phn-sg-slag">
        {data.skudd.map((s) => <li key={s.nr}>
          <span className="nr">#{s.nr}</span>
          <span><i>Face</i>{s.face}</span><span><i>Path</i>{s.path}</span><span><i>Smash</i>{s.smash}</span>
          <span><i>Club Speed</i>{s.clubSpeed}</span><span><i>Ball Speed</i>{s.ballSpeed}</span><span><i>Total</i>{s.lengde}</span>
        </li>)}
      </ol>
    </section>}
  </SkraFlyt></div>;
}

/* ---------- Equipment Fit ---------- */

const STATUS: Record<FitStatus, { tekst: string; pille: string }> = {
  ok: { tekst: "I target", pille: "ok" },
  warn: { tekst: "Utenfor target", pille: "vent" },
  critical: { tekst: "Kritisk avvik", pille: "vent" },
  missing: { tekst: "Data mangler", pille: "noy" },
};
const KATEGORI: Record<string, string> = { driver: "Driver", iron: "Jern", wedge: "Wedge", wood: "Trefelg", putter: "Putter" };
const verdi = (v: number, unit: string) => (unit === "rpm" ? String(Math.round(v)) : formaterTall(v, unit === "°" ? 1 : 2, true));

function Metrikk({ m }: { m: FitMetric }) {
  return <li>
    <span><b>{m.label}</b>{m.target && <span className="phn-kilde">Target {komma(m.target.min)}–{komma(m.target.max)}{m.unit}</span>}</span>
    <span className="v">{m.value === null ? "—" : `${verdi(m.value, m.unit)}${m.unit}`}</span>
    <span className={`phn-pille ${STATUS[m.status].pille}`}><i />{STATUS[m.status].tekst}</span>
  </li>;
}

export function PHSgHubCoachUtstyr({ backHref, spillerNavn, reports }: { backHref: string; spillerNavn: string; reports: ClubFitReport[] }) {
  return <div className="phn phn-sg phn-skra"><Topp tilbake={backHref} tilbakeTekst={spillerNavn} dato={`SG-hub · ${spillerNavn}`} tittel="Equipment Fit"
      kilde="Launch, spin og smash sjekkes mot target-vinduer per kølletype. Avvik kan tyde på feil køllevalg, oppsett eller ball, og er ofte raskere å rette enn teknikk." /><SkraFlyt lav>
    {reports.length === 0
      ? <div className="phn-kort" style={{ background: "var(--phn-sand-100)" }}><b>Ingen TrackMan-data ennå</b><p className="phn-forklar">Helsesjekken kommer når {spillerNavn} har importert en TrackMan-økt.</p></div>
      : <div className="phn-sg-fit">{reports.map((r) => <section key={r.clubId} className="phn-kort" aria-label={r.clubId}>
          <div className="phn-sg-fit-topp">
            <span><span className="phn-dato">{KATEGORI[r.category] ?? "Annet"}</span><b className="phn-sg-ord">{r.clubId}</b></span>
            <span className={`phn-pille ${STATUS[r.overall].pille}`}><i />{STATUS[r.overall].tekst}</span>
          </div>
          {r.metrics.length === 0 ? <p className="phn-kilde">Ingen target-vinduer for denne køllen.</p> : <ul className="phn-sg-metrikk">{r.metrics.map((m, i) => <Metrikk key={i} m={m} />)}</ul>}
          <p className="phn-kilde">Basert på {r.shotCount} slag</p>
        </section>)}</div>}
  </SkraFlyt></div>;
}
