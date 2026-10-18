"use client";

/**
 * PlayerHQ Én turnering (/portal/tren/turneringer/[id]) — nytt design, pakke 17 (utkast 1, 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/plan-hjelpere.html, skjermen «Én turnering».
 * Handlingene er uendret: leggTilTurnering, settPlanTier, claimPaamelding + confirmPaamelding (to trykk,
 * spilleransvar), meldDegAv (bak rust dialog) og startTurneringsrunde. Appen melder aldri på; spilleren
 * melder seg på hos arrangøren og bekrefter her.
 *
 * Avvik:
 *   - «Jeg er påmeldt» er to trykk som før: først «Jeg har meldt meg på», så «Bekreft». Én avkrysning
 *     ville gjort påmeldingen til ett trykk.
 *   - «Lag gameplan for banen» vises ikke: turneringen er ikke koblet til en gameplan-bane.
 *   - «Arrangør» og «Klasse» står bare når GolfBox har feltet; ellers utelates raden.
 *   - Tidligere år vises som en enkel liste fra resultatene dine, ikke som kurve.
 */
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { claimPaamelding, confirmPaamelding, leggTilTurnering, settPlanTier } from "@/app/portal/(legacy)/tren/turneringer/actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";
import "@/styles/playerhq-ny-plan-hjelpere.css";

type Tier = "A" | "B" | "C";
export type PHTurneringData = {
  id: string; navn: string; undertittel: string; fakta: { k: string; v: string }[];
  arrangorUrl: string | null;
  entry: { id: string | null; status: "PLANNED" | "CLAIMED" | "CONFIRMED" | "ANNEN"; tier: Tier } | null;
  kanStarteRunde: boolean;
  startHjelp: string | null;
  runde: { id: string; fort: boolean; score: number; hull: number } | null;
  historikk: { id: string; ar: number; plass: number | null; score: number | null }[];
};
export type PHTurneringHandlinger = { taUt: () => Promise<void>; startRunde: () => Promise<void> };

const PRIO: { t: Tier; navn: string }[] = [{ t: "A", navn: "Viktigst" }, { t: "B", navn: "Viktig" }, { t: "C", navn: "Trening" }];

export function PHTurnering({ data, handlinger }: { data: PHTurneringData; handlinger: PHTurneringHandlinger }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [bekreftApen, setBekreftApen] = useState(data.entry?.status === "CLAIMED");
  const [jobber, start] = useTransition();
  const kjor = (fn: () => Promise<{ ok: boolean; feil?: string } | void>, etter?: () => void) => start(async () => {
    setFeil(null);
    try {
      const r = await fn();
      if (r && !r.ok) { setFeil(r.feil ?? "Det gikk ikke. Prøv igjen."); return; }
      etter?.();
      router.refresh();
    } catch { setFeil("Det gikk ikke. Prøv igjen."); }
  });

  const iPlanen = data.entry != null && data.entry.status !== "ANNEN";

  return <div className="phn phn-meg phn-ph"><div className="side">
    <div className="topp">
      <Link className="tilbake" href="/portal/tren/turneringer"><ChevronLeft size={18} aria-hidden />Turneringer</Link>
      <div><div className="phn-dato">{data.undertittel}</div><h1 className="phn-tittel">{data.navn}</h1></div>
    </div>
    <div className="to-del">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="ph-helt" src="/images/playerhq/turn-tee.jpg" alt="" />
        <ul className="ph-fakta">{data.fakta.map((f) => <li key={f.k}><span>{f.k}</span><b>{f.v}</b></li>)}</ul>
        <p className="phn-kilde">Fra GolfBox</p>
        {data.historikk.length > 0 && <section className="phn-seksjon" aria-labelledby="ph-tidligere">
          <div className="phn-sek-topp"><h2 id="ph-tidligere">Tidligere år</h2><span className="phn-kilde">Dine resultater</span></div>
          <ul className="ph-historikk">{data.historikk.map((h) => <li key={h.id}><b>{h.ar}</b><span>{h.plass != null ? `${h.plass}. plass` : "Plass: —"}</span><span>{h.score != null ? `${h.score} slag` : "—"}</span></li>)}</ul>
        </section>}
      </div>
      <div>
        {!iPlanen
          ? <section className="phn-seksjon" aria-labelledby="ph-plan">
            <div className="phn-sek-topp"><h2 id="ph-plan">Planen din</h2></div>
            <p className="phn-forklar">Legg turneringen i planen, så teller den i året og du kan melde deg på.</p>
            <div className="phn-knapper"><button type="button" className="phn-knapp pri" disabled={jobber} onClick={() => kjor(() => leggTilTurnering({ tournamentId: data.id, priority: "NORMAL", planTier: "B" }))}>Legg i planen</button></div>
          </section>
          : <>
            <section className="phn-seksjon" aria-labelledby="ph-paa">
              <div className="phn-sek-topp"><h2 id="ph-paa">Påmelding</h2></div>
              <div className="ph-vilkaar"><b>Du melder deg på hos arrangøren</b><span>Appen melder deg ikke på. Når du har meldt deg på i GolfBox, bekrefter du det her.</span></div>
              {data.arrangorUrl && <a className="phn-knapp sek" href={data.arrangorUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} aria-hidden />Åpne påmeldingen i GolfBox</a>}
              {data.entry?.status === "CONFIRMED"
                ? <span className="phn-pille ok" style={{ justifySelf: "start" }}><i />Du er påmeldt. Coachen ser det i planen din.</span>
                : bekreftApen
                  ? <div className="ph-status"><p className="phn-forklar">Bekreft at du er påmeldt i GolfBox.</p><div className="phn-knapper"><button type="button" className="phn-knapp pri" disabled={jobber} onClick={() => kjor(() => confirmPaamelding(data.id), () => setBekreftApen(false))}>Bekreft påmeldingen</button><button type="button" className="phn-knapp sek" onClick={() => setBekreftApen(false)}>Ikke ennå</button></div></div>
                  : <div className="phn-knapper"><button type="button" className="phn-knapp sek" disabled={jobber} onClick={() => kjor(() => claimPaamelding(data.id), () => setBekreftApen(true))}>Jeg har meldt meg på</button></div>}
            </section>
            <section className="phn-seksjon" aria-labelledby="ph-prio">
              <div className="phn-sek-topp"><h2 id="ph-prio">Prioritet</h2><span className="phn-kilde">Styrer nedtrappingen før</span></div>
              <div className="ph-prio" role="group" aria-label="Prioritet">
                {PRIO.map((p) => <button key={p.t} type="button" aria-pressed={data.entry?.tier === p.t} disabled={jobber || !data.entry?.id}
                  onClick={() => data.entry?.id && kjor(() => settPlanTier(data.entry!.id!, p.t))}><b>{p.t}</b><span>{p.navn}</span></button>)}
              </div>
              <p className="phn-kilde">Du foreslår prioriteten. Coachen kan endre den.</p>
            </section>
          </>}
        {feil && <div className="ph-melding" role="alert">{feil}</div>}
        {data.runde
          ? <div className="phn-knapper"><Link className="phn-knapp pri" href={`/portal/mal/runder/${data.runde.id}`}>{data.runde.fort ? `Turneringsrunden · ${data.runde.score} slag på ${data.runde.hull} hull` : "Fortsett turneringsrunden"}</Link></div>
          : iPlanen && <div className="ph-status">
            <button type="button" className="phn-knapp pri stor" disabled={!data.kanStarteRunde || jobber} onClick={() => kjor(() => handlinger.startRunde())}>Start turneringsrunde</button>
            {data.startHjelp && <p className="phn-kilde">{data.startHjelp}</p>}
          </div>}
        {iPlanen && <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={() => dialog.current?.showModal()}>Ta ut av planen</button></div>}
      </div>
    </div>
    <dialog ref={dialog} className="phn-ark" role="alertdialog" aria-labelledby="ph-tu-t">
      <div className="phn-ark-kropp">
        <h2 id="ph-tu-t" style={{ margin: 0, font: "600 20px/1.25 var(--phn-sans)" }}>Ta {data.navn} ut av planen?</h2>
        <p className="phn-forklar">Turneringen tas ut av året ditt. Er du påmeldt i GolfBox, må du melde deg av der.</p>
        <div className="phn-ark-fot"><button type="button" className="phn-knapp rust stor" disabled={jobber} onClick={() => kjor(() => handlinger.taUt(), () => dialog.current?.close())}>Ta ut av planen</button><button type="button" className="phn-knapp sek stor" onClick={() => dialog.current?.close()}>Behold</button></div>
      </div>
    </dialog>
  </div></div>;
}
