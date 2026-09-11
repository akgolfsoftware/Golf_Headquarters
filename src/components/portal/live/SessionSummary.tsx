"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import "./session-summary.css";
import type { LiveV2Summary } from "./types";
import { SpillerVurderingForm } from "./SpillerVurderingForm";
import { LiveLoopNav } from "./LiveLoopNav";
import { WhyDetails } from "./WhyDetails";
import { lagreDineOrd } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";

export type SessionSummaryProps = {
  data: LiveV2Summary;
  nesteOkt?: { tekst: string; href: string };
  spillerVurdering?: {
    kvalitet: number;
    nesteFokus: string;
    folelse?: string | null;
    rpe?: number | null;
  } | null;
  /** Allerede lagrede «dine ord» (completedSummary.dineOrd). */
  lagredeOrd?: string | null;
};

type LiveNotat = { t: string; tekst: string };

function notatKey(sessionId: string): string {
  return `akhq-live-notater-${sessionId}`;
}

function lesNotater(sessionId: string): LiveNotat[] {
  try {
    const raw = sessionStorage.getItem(notatKey(sessionId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n): n is LiveNotat =>
        !!n && typeof n === "object" &&
        typeof (n as LiveNotat).t === "string" &&
        typeof (n as LiveNotat).tekst === "string",
    );
  } catch {
    return [];
  }
}

/** «84» → «1 t 24 min». */
function tidTekst(min: number): string {
  const t = Math.floor(min / 60);
  const r = min % 60;
  if (t === 0) return `${r} min`;
  return r === 0 ? `${t} t` : `${t} t ${r} min`;
}

/** Deterministisk utkast av øktas faktiske tall + drillnavn — ingen AI-kall. */
function byggUtkast(data: LiveV2Summary, notater: LiveNotat[]): string {
  const deler: string[] = [];
  const min = Math.round(data.durationSec / 60);
  if (data.drills.length > 0) {
    deler.push(
      `${data.title}: ${data.drillsCompleted} av ${data.drills.length} øvelser` +
        `${data.totalReps > 0 ? ` og ${data.totalReps} repetisjoner` : ""}` +
        `${min > 0 ? ` på ${tidTekst(min)}` : ""}.`,
    );
  } else if (min > 0) {
    deler.push(`${data.title}: fri økt på ${tidTekst(min)}.`);
  } else {
    deler.push(`${data.title}: økt gjennomført.`);
  }
  const treff = data.existingLogs.reduce((s, l) => s + l.repsHit, 0);
  if (treff > 0 && data.totalReps > 0) {
    deler.push(`${treff} av ${data.totalReps} reps markert som treff.`);
  }
  const mestVolum = data.drills
    .map((d) => ({ d, log: data.existingLogs.find((l) => l.drillId === d.id) }))
    .filter((x) => (x.log?.repsTotal ?? 0) > 0)
    .sort((a, b) => (b.log?.repsTotal ?? 0) - (a.log?.repsTotal ?? 0))[0];
  if (mestVolum) {
    deler.push(`Mest volum på ${mestVolum.d.name.toLowerCase()}.`);
  }
  for (const notat of notater) deler.push(notat.tekst);
  return deler.join(" ");
}

/**
 * Valgt PH-06 / B3 lys: tittel → hovedresultat → tillegg → oppsummering → Lukk.
 * Kilde: designsystem/train-lock/PH-06 Live ferdig.dc.html
 * Lys: designsystem/train-lock/B3 Lys resterende skjermer.dc.html
 * Felles Geist/v3-verdier videreføres. Tegningens SG og måloppnåelse erstattes
 * med lagrede øvelsesmarkeringer/tellinger; Workbench/eldre plan har lesemodus.
 * Planavvik, notater og spillerens vurdering er bevart som utfoldbare detaljer.
 */
export function SessionSummary({ data, nesteOkt, spillerVurdering, lagredeOrd }: SessionSummaryProps) {
  const [notater, setNotater] = useState<LiveNotat[]>([]);
  const [ord, setOrd] = useState<string | null>(lagredeOrd ?? null);
  const [lagret, setLagret] = useState(Boolean(lagredeOrd));
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const saving = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const savedRef = useRef<HTMLParagraphElement>(null);
  const submitted = useRef(false);
  const erTapper = data.logSource === "tapper";

  useEffect(() => {
    const timer = setTimeout(() => {
      const n = lesNotater(data.sessionId);
      setNotater(n);
      setOrd((prev) => prev ?? lagredeOrd ?? byggUtkast(data, n));
    }, 0);
    return () => clearTimeout(timer);
  }, [data, lagredeOrd]);
  useEffect(() => { if (feil) errorRef.current?.focus(); }, [feil]);
  useEffect(() => { if (lagret && submitted.current) savedRef.current?.focus(); }, [lagret]);

  const minutter = Math.round(data.durationSec / 60);
  const planVindu = Math.round((Date.parse(data.endTimeISO) - Date.parse(data.scheduledAtISO)) / 60_000);
  const planMinutter = planVindu > 0 ? planVindu : data.drills.reduce((sum, d) => sum + d.durationMinutes, 0);
  const planReps = data.drills.reduce((sum, d) => sum + d.plannedReps, 0);
  const treff = data.existingLogs.reduce((sum, log) => sum + log.repsHit, 0);
  const harOvelser = !erTapper && data.drills.length > 0;
  const harTall = erTapper || harOvelser || data.totalReps > 0 || data.durationSec > 0;
  const hoved = harOvelser
    ? { tittel: "Øvelser ferdig", verdi: data.drillsCompleted, av: data.drills.length }
    : erTapper || data.totalReps > 0
      ? { tittel: erTapper ? "Slag registrert" : "Repetisjoner registrert", verdi: data.totalReps, av: null }
      : { tittel: "Varighet", verdi: tidTekst(minutter), av: null };

  function lagre() {
    if (saving.current || erTapper) return;
    const tekst = (ord ?? "").trim();
    if (!tekst || tekst.length > 2000) {
      setFeil(!tekst ? "Skriv noe først — ett ord er nok." : "Oppsummeringen kan ha inntil 2 000 tegn. Kort ned teksten og prøv igjen.");
      return;
    }
    saving.current = true;
    setFeil(null);
    startTransition(async () => {
      try {
        const res = await lagreDineOrd(data.sessionId, tekst);
        if (!res.ok) {
          setFeil(res.error ?? "Kunne ikke lagre. Teksten din er bevart — prøv igjen.");
          return;
        }
        try { sessionStorage.removeItem(notatKey(data.sessionId)); } catch { /* Teksten er lagret på serveren. */ }
        setOrd(tekst);
        submitted.current = true;
        setLagret(true);
      } catch {
        setFeil("Kunne ikke bekrefte lagringen. Teksten din er bevart — prøv igjen.");
      } finally {
        saving.current = false;
      }
    });
  }

  return (
    <div className="ph06" data-paper-portal-live-summary data-paper-slug="playerhq-live-summary">
      <LiveLoopNav aktiv="etter" sessionId={data.sessionId} />
      <header className="ph06-heading">
        <p className="ph06-eyebrow">Økt ferdig{data.durationSec > 0 ? ` · ${tidTekst(minutter)}` : ""}</p>
        <h1>{data.title}</h1>
      </header>
      <div className="ph06-columns">
        <div className="ph06-results">
          <section className="ph06-card ph06-hero" aria-label="Øktens hovedresultat">
            {harTall ? <>
              <h2 className="ph06-eyebrow">{hoved.tittel}</h2>
              <p className="ph06-number"><span>{hoved.verdi}</span>{hoved.av !== null && <span className="ph06-denominator">/ {hoved.av}</span>}</p>
              <p className="ph06-muted">{harOvelser
                ? `${data.drillsCompleted} av ${data.drills.length} øvelser markert ferdig.`
                : erTapper ? "Kilde: lagrede tellinger per kølle." : "Fra registreringene i denne økta."}</p>
            </> : <>
              <h2 className="ph06-empty-title">Økta er avsluttet</h2>
              <p className="ph06-muted">Ingen tall ble logget i denne økta. Du kan fortsatt skrive en oppsummering.</p>
            </>}
          </section>
          {!erTapper && (data.totalReps > 0 || data.durationSec > 0 || planReps > 0) && <dl className="ph06-metrics ph06-card">
            {data.durationSec > 0 && <div><dt>Varighet</dt><dd>{tidTekst(minutter)}</dd>{planMinutter > 0 && <small>Planlagt {tidTekst(planMinutter)}</small>}</div>}
            {(data.totalReps > 0 || planReps > 0) && <div><dt>Repetisjoner</dt><dd>{data.totalReps}</dd>{planReps > 0 && <small>Planlagt {planReps}</small>}</div>}
            {data.existingLogs.length > 0 && data.totalReps > 0 && <div><dt>Markert som treff</dt><dd>{treff} <span>av {data.totalReps}</span></dd></div>}
          </dl>}
          {erTapper && <p className="ph06-muted">Tid, treffkvalitet og fullføring per øvelse er ikke registrert i denne økta.</p>}
          {harTall && <WhyDetails odId="etter-why-tall" punkter={erTapper ? [
            "Kilde: lagrede tellinger per kølle. Summen er antall registrerte slag.",
            "Planlagt tid er ikke målt treningstid. Ingen treffkvalitet er beregnet.",
          ] : [
            "Ferdige øvelser følger dine ferdigmarkeringer. På eldre økter brukes den dokumenterte tellingen fra loggene.",
            "Repetisjoner og treff summeres fra øvelsesloggene. Varighet kommer fra øktklokka, eller første og siste logg på eldre økter.",
            "Én økt er ett datapunkt. Ingen måloppnåelse eller Strokes Gained er beregnet her.",
          ]} />}
          {harOvelser && <details className="ph06-card ph06-details">
            <summary>Plan mot gjennomført</summary>
            {data.drills.map((drill) => {
              const log = data.existingLogs.find((l) => l.drillId === drill.id);
              return <div key={drill.id} className="ph06-drill">
                <h3>{drill.name}</h3>
                <p>{log ? `${log.repsTotal}${drill.plannedReps > 0 ? ` av ${drill.plannedReps}` : ""} repetisjoner · ${log.repsHit} treff` : "Ingen registrering"}</p>
                {data.completedDrillIds && <small>{data.completedDrillIds.includes(drill.id) ? "Markert ferdig" : "Ikke markert ferdig"}</small>}
              </div>;
            })}
            {planMinutter > 0 && data.durationSec > 0 && planMinutter !== minutter && <p className="ph06-muted">Avsluttet {tidTekst(Math.abs(planMinutter - minutter))} {planMinutter > minutter ? "før" : "etter"} planlagt. Avvik gir informasjon til neste plan.</p>}
          </details>}
        </div>
        <div className="ph06-reflection">
          <section className="ph06-card" aria-label="Oppsummering">
            <h2 className="ph06-eyebrow">Dine ord</h2>
            {lagret || erTapper ? <>
              <p className="ph06-recap" data-od-id="etter-lagrede-ord">{ord ?? lagredeOrd ?? "Økt gjennomført."}</p>
              {!erTapper && <>
                <p className="ph06-saved" role="status" tabIndex={-1} ref={savedRef}><Check size={16} aria-hidden /> Lagret i loggen</p>
                <button type="button" className="ph06-text-button" data-od-id="etter-kvitt-angre" onClick={() => setLagret(false)}>Rediger oppsummering</button>
              </>}
            </> : <>
              <label className="ph06-muted" htmlFor="ph06-ord">Utkast fra tallene og notatene dine. Endre fritt.</label>
              <textarea id="ph06-ord" aria-label="Oppsummering med dine ord" data-od-id="etter-oppsum-tekst" value={ord ?? ""} onChange={(event) => setOrd(event.target.value)} disabled={pending} rows={4} aria-describedby={feil ? "ph06-ord-feil" : undefined} />
              {feil && <p id="ph06-ord-feil" className="ph06-error" role="alert" tabIndex={-1} ref={errorRef}>{feil}</p>}
              <button type="button" className="ph06-secondary" data-od-id="etter-lagre-logg" onClick={lagre} disabled={pending || ord === null}>{pending ? "Lagrer…" : feil ? "Prøv igjen" : "Lagre i loggen"}</button>
            </>}
            {data.coachName && <p className="ph06-muted ph06-coach">{data.coachName} kan se den lagrede oppsummeringen.</p>}
          </section>
          {notater.length > 0 && <details className="ph06-card ph06-details">
            <summary>Notater fra økta · {notater.length}</summary>
            {notater.map((notat, i) => <p key={`${notat.t}-${i}`} className="ph06-recap"><small>{notat.t} inn i økta</small><br />{notat.tekst}</p>)}
          </details>}
          {!erTapper && <SpillerVurderingForm sessionId={data.sessionId} eksisterende={spillerVurdering} />}
          {nesteOkt && <section className="ph06-card">
            <h2 className="ph06-eyebrow">Neste økt</h2>
            <Link className="ph06-next" href={nesteOkt.href} data-od-id="etter-kvitt-neste">{nesteOkt.tekst}</Link>
          </section>}
        </div>
      </div>
      <footer className="ph06-footer">
        <Link href="/portal" className="ph06-close" data-od-id="etter-kvitt-idag">Lukk</Link>
        <nav aria-label="Etter økta" className="ph06-links">
          <Link href="/portal/planlegge" data-od-id="etter-kvitt-plan">Til planen</Link>
          <Link href="/portal/analysere" data-od-id="etter-kvitt-analyse">Se utviklingen i Analyse</Link>
        </nav>
      </footer>
    </div>
  );
}
