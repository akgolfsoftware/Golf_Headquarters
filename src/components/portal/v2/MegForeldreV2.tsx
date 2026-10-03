"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { StatusPille, TomTilstand } from "@/components/precision/pa";

export type ForesattRad = {
  id: string;
  navn: string;
  relasjon: string;
  kontekst: string;
  href: string;
};

export type MegForeldreData = { foresatte: ForesattRad[] };

function antallTekst(n: number): string {
  if (n === 0) return "Ingen foresatte er koblet til kontoen din ennå.";
  return `${n} ${n === 1 ? "foresatt er" : "foresatte er"} koblet til kontoen din.`;
}

export function MegForeldreV2({ data }: { data: MegForeldreData }) {
  const { foresatte } = data;
  const erTom = foresatte.length === 0;

  return (
    <div className="ph24f">
      <header>
        <h1>Foreldre</h1>
        <p>Meg</p>
      </header>
      <section className="pa-card ph24f-kort">
        <p className="ph24f-kicker">Koblede</p>
        <strong>{foresatte.length}</strong>
        <p>{antallTekst(foresatte.length)}</p>
      </section>
      <section className="pa-card ph24f-kort">
        <p className="ph24f-kicker">Koblede foresatte</p>
        {erTom ? (
          <TomTilstand icon={Users} title="Ingen foresatte koblet" text="Kontakt coachen din for å koble en foresatt til kontoen." />
        ) : (
          <ul>
            {foresatte.map((f) => (
              <li key={f.id}>
                <Link href={f.href}>
                  <strong>{f.navn}</strong>
                  <small>{f.kontekst}</small>
                </Link>
                <StatusPille>{f.relasjon}</StatusPille>
              </li>
            ))}
          </ul>
        )}
      </section>
      {erTom && <Link href="/portal/meg/help/kontakt" className="pa-btn pa-btn--primary pa-btn--full">Kontakt support</Link>}
    </div>
  );
}
