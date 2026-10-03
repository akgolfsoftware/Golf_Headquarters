"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { oppdaterPreferences } from "@/app/portal/meg/actions";
import { StatusPille } from "@/components/precision/pa";

export type InnstillingerSprakData = { spraak: "nb" | "en" };

export function InnstillingerSprakV2({ data }: { data: InnstillingerSprakData }) {
  const router = useRouter();
  const [valgt, setValgt] = useState<"nb" | "en">(data.spraak);
  const [pending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);

  function bytt(nytt: "nb" | "en") {
    if (nytt === "en" || pending) return;
    setValgt(nytt);
    startTransition(async () => {
      await oppdaterPreferences({ spraak: nytt });
      setLagret(true);
      router.refresh();
      setTimeout(() => setLagret(false), 1500);
    });
  }

  return (
    <div className="ph25s">
      <header>
        <Link href="/portal/meg/innstillinger" className="ph-tilbake">Innstillinger</Link>
        <div>
          <h1>Språk</h1>
          <p>Innstillinger</p>
        </div>
        {lagret && <StatusPille tone="ok">Lagret</StatusPille>}
      </header>
      <section className="pa-card ph25s-kort">
        <p>Nå</p>
        <strong>{valgt === "nb" ? "Norsk bokmål" : "English"}</strong>
      </section>
      <section className="pa-card ph25s-kort">
        <p>App-språk</p>
        <div>
          <button type="button" aria-pressed={valgt === "nb"} disabled={pending} onClick={() => bytt("nb")}>
            <strong>Norsk bokmål</strong>
            <small>Standard for AK Golf</small>
          </button>
          <button type="button" disabled aria-disabled title="Engelsk-støtte kommer senere">
            <strong>English</strong>
            <small>Kommer senere. Ikke tilgjengelig ennå.</small>
          </button>
        </div>
      </section>
      <section className="pa-card ph25s-kort">
        <p>Region og format</p>
        <span>Datoer, tidssone og tallformat følger valgt språk. Mer finmasket kontroll er ikke klar ennå.</span>
      </section>
    </div>
  );
}
