"use client";

/**
 * PH-25 Meg › Innstillinger › Varsler i nytt design: push på denne enheten øverst, så hva du varsles
 * om og hvordan du får dem, som brytere som lagrer med en gang.
 * Fasit: docs/design-system/utkast-playerhq/meg.html (utkast 1, «Innstillinger»; meg-resten.html sender
 * innstillinger/varsler hit). Stil: src/styles/playerhq-ny-meg.css.
 *
 * Samme lagring som før (InnstillingerVarslerV2): oppdaterPreferences per bryter, og push-logikken
 * fra push-toggle.tsx (detectPushStatus, aktiverPush, deaktiverPush) uendret.
 *
 * Avvik:
 *   - Språkvalget er ikke her lenger: det har sin egen side (Språk og enheter) i Innstillinger.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-25-VARSLER.
 */
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { UserPreferences } from "@/lib/preferences";
import { oppdaterPreferences } from "@/app/portal/meg/actions";
import { VAPID_PUBLIC_KEY } from "@/lib/push/vapid";
import { detectPushStatus, aktiverPush, deaktiverPush, type PushStatus } from "@/components/portal/push-toggle";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-meg.css";

type Notif = UserPreferences["notif"];
export type PH25VarslerData = { notif: Notif };

const HENDELSER: { felt: keyof Notif; tittel: string; kilde: string }[] = [
  { felt: "nyMeldingFraCoach", tittel: "Nye meldinger fra coach", kilde: "Når coachen din sender deg en melding" },
  { felt: "treningsplanOppdatert", tittel: "Treningsplan oppdatert", kilde: "Når coachen endrer treningsplanen din" },
  { felt: "bookingbekreftelse", tittel: "Bookingbekreftelse", kilde: "Bekreftelse og påminnelse for bookede tider" },
  { felt: "ukentligRapport", tittel: "Ukentlig fremdriftsrapport", kilde: "Oppsummering av uka: trening, målsetninger og fremgang" },
  { felt: "turneringsresultater", tittel: "Turneringsresultater", kilde: "Når turneringsresultater er registrert" },
];
const KANALER: { felt: keyof Notif; tittel: string; kilde: string }[] = [
  { felt: "epost", tittel: "E-post", kilde: "Sammendrag av planen og påminnelser på e-post" },
  { felt: "push", tittel: "Push-varsler", kilde: "Varsler i nettleser og mobil med en gang" },
  { felt: "paaminnelse", tittel: "Påminnelse 1 time før økt", kilde: "Rett før en planlagt økt starter" },
];

function Bryter({ paa, tittel, kilde, onChange, laast }: { paa: boolean; tittel: string; kilde: string; onChange: (v: boolean) => void; laast?: boolean }) {
  return <div className="bryter-rad">
    <span><b>{tittel}</b><span className="phn-kilde">{kilde}</span></span>
    <button type="button" className="bryter" role="switch" aria-checked={paa} aria-label={tittel} disabled={laast} onClick={() => onChange(!paa)} />
  </div>;
}

export function PH25Varsler({ data, startPush }: { data: PH25VarslerData; /** Bare for prøven: push-status uten nettleser-API. */ startPush?: PushStatus }) {
  const router = useRouter();
  const [notif, setNotif] = useState<Notif>(data.notif);
  const [pending, start] = useTransition();
  const [lagret, setLagret] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  function sett(felt: keyof Notif, verdi: boolean) {
    if (pending) return;
    const forrige = notif;
    const ny = { ...notif, [felt]: verdi };
    setNotif(ny); setFeil(null);
    start(async () => {
      try {
        await oppdaterPreferences({ notif: ny });
        setLagret(true);
        router.refresh();
        setTimeout(() => setLagret(false), 1500);
      } catch { setNotif(forrige); setFeil("Kunne ikke lagre. Prøv igjen."); }
    });
  }

  const [push, setPush] = useState<PushStatus>(startPush ?? "loading");
  const [pushFeil, setPushFeil] = useState<string | null>(null);
  const [pushPending, startPushT] = useTransition();
  useEffect(() => { if (!startPush) void detectPushStatus().then(setPush); }, [startPush]);

  function vekslePush() {
    if (pushPending) return;
    setPushFeil(null);
    const skruPaa = push !== "on";
    startPushT(async () => {
      try {
        setPush(skruPaa ? await aktiverPush() : await deaktiverPush());
      } catch (err) {
        setPushFeil(err instanceof Error ? err.message : skruPaa ? "Kunne ikke slå på" : "Kunne ikke slå av");
        if (skruPaa) setPush(await detectPushStatus());
      }
    });
  }

  const pushKropp = push === "loading"
    ? <p className="phn-kilde">Sjekker push-status …</p>
    : push === "unsupported"
      ? <p className="phn-forklar">Push-varsler støttes ikke i denne nettleseren. Prøv en ny versjon av Safari, Chrome eller Firefox.</p>
      : !VAPID_PUBLIC_KEY
        ? <p className="phn-forklar">Push-varsler er slått av for appen akkurat nå.</p>
        : push === "blocked"
          ? <p className="phn-forklar">Du har blokkert varsler for denne siden. Tillat varsler i innstillingene i nettleseren for å slå på push.</p>
          : <div className="boks"><Bryter paa={push === "on"} tittel="Push-varsler på denne enheten" kilde="Varsler i nettleseren eller på telefonen, også når appen er lukket" laast={pushPending} onChange={vekslePush} /></div>;

  const antallPaa = Object.values(notif).filter(Boolean).length;
  const antall = Object.values(notif).length;

  return <div className="phn phn-meg"><div className="side smal">
    <div className="topp">
      <Link className="tilbake" href="/portal/meg/innstillinger"><ChevronLeft size={18} aria-hidden />Innstillinger</Link>
      <div className="topp-rad">
        <div><div className="phn-dato">Meg · innstillinger</div><h1 className="phn-tittel">Varsler</h1></div>
        <span aria-live="polite">{lagret && <span className="phn-pille ok"><i />Lagret</span>}</span>
      </div>
    </div>

    <div className="ruter">
      <div className="rute"><span className="e">Slått på</span><b className="t">{antallPaa}<small>av {antall}</small></b></div>
      <div className="rute"><span className="e">Push her</span><b className="t">{push === "on" ? "På" : push === "loading" ? "—" : "Av"}</b></div>
    </div>

    <section className="phn-seksjon" aria-labelledby="va-enhet">
      <div className="phn-sek-topp"><h2 id="va-enhet">Denne enheten</h2></div>
      {pushKropp}
      {pushFeil && <p className="phn-melding" role="alert">{pushFeil}</p>}
    </section>

    <div className="to-del">
      <section className="phn-seksjon" aria-labelledby="va-hva">
        <div className="phn-sek-topp"><h2 id="va-hva">Hva du varsles om</h2></div>
        <div className="boks">{HENDELSER.map((h) => <Bryter key={h.felt} paa={notif[h.felt]} tittel={h.tittel} kilde={h.kilde} onChange={(v) => sett(h.felt, v)} />)}</div>
      </section>
      <section className="phn-seksjon" aria-labelledby="va-kanal">
        <div className="phn-sek-topp"><h2 id="va-kanal">Hvordan du får dem</h2></div>
        <div className="boks">{KANALER.map((k) => <Bryter key={k.felt} paa={notif[k.felt]} tittel={k.tittel} kilde={k.kilde} onChange={(v) => sett(k.felt, v)} />)}</div>
      </section>
    </div>
    <div aria-live="polite">{feil && <p className="phn-melding" role="alert">{feil}</p>}</div>
  </div></div>;
}
