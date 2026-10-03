"use client";

/**
 * Avbestill Pro. Avbestill-logikk i actions.ts (cancelPro) — urørt.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { Knapp } from "@/components/precision/pa";
import { cancelPro } from "@/app/portal/meg/abonnement/avbestill/actions";

export type MegAvbestillKonsekvens = {
  tittel: string;
  detalj: string;
  etterpaa: string;
};

export type MegAvbestillData = {
  /** Ukedag for siste Pro-dag, f.eks. «onsdag». */
  ukedag: string;
  /** Dato for siste Pro-dag, f.eks. «12. august 2026». */
  dato: string;
  dagerIgjen: number;
  /** Konsekvensene bygges SERVER-SIDE fra faktisk abonnement (A4) —
   *  aldri hardkodet («fra 4 credits til 0» var feil for 299-kunder). */
  konsekvenser: MegAvbestillKonsekvens[];
};

function medStorForbokstav(verdi: string): string {
  if (!verdi) return verdi;
  return verdi.charAt(0).toLocaleUpperCase("nb-NO") + verdi.slice(1);
}

export function MegAvbestillV2({ data }: { data: MegAvbestillData }) {
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function avbestill() {
    if (!confirm("Er du helt sikker på at du vil avbestille Pro?")) return;
    setFeil(null);
    startTransition(async () => {
      // Ved suksess redirecter actionen (resultatet blir da undefined);
      // ved feil kommer { ok: false, error } tilbake og vises under knappene.
      const resultat = await cancelPro();
      if (resultat && !resultat.ok) {
        setFeil(resultat.error ?? "Noe gikk galt. Prøv igjen om litt.");
      }
    });
  }

  return (
    <div className="ph-flate">
      <Link href="/portal/meg/abonnement" className="ph-tilbake">Abonnement</Link>
      <header>
        <p>Siste bekreftelse · Steg 2 av 2</p>
        <h1>Avbestille Pro?</h1>
        <p>
          Du mister disse fordelene når perioden løper ut.{" "}
          <strong>Du betales ikke noe mer</strong> — men tilgangen forsvinner gradvis.
        </p>
      </header>

      <div className="ph-kpi">
        <p className="pa-card">
          <span>Pro aktiv til</span>
          <strong>{medStorForbokstav(data.ukedag)} {data.dato}</strong>
        </p>
        <p className="pa-card">
          <span>Klokkeslett</span>
          <strong>kl 23:59</strong>
        </p>
        <p className="pa-card">
          <span>Dager igjen</span>
          <strong>{data.dagerIgjen}</strong>
        </p>
      </div>

      <section className="pa-card ph-kort">
        <p>Dette mister du</p>
        <ul className="ph-rader">
          {data.konsekvenser.map((k) => (
            <li key={k.tittel}>
              <span>
                <strong>{k.tittel}</strong>
                <small>{k.detalj}</small>
              </span>
              <b>{k.etterpaa}</b>
            </li>
          ))}
        </ul>
      </section>

      <Link href="/portal/meg/abonnement" className="pa-btn pa-btn--primary pa-btn--full">
        Behold Pro
      </Link>
      <Knapp
        type="button"
        variant="ghost"
        fullWidth
        disabled={pending}
        loading={pending}
        loadingText="Avbestiller …"
        onClick={avbestill}
      >
        Ja, avbestill
      </Knapp>
      {feil && (
        <p role="alert">{feil}</p>
      )}

      <p>
        Ingenting endres før du bekrefter —{" "}
        <Link href="/portal/meg/abonnement">tilbake til abonnement</Link>
      </p>
    </div>
  );
}
