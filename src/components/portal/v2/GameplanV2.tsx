"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { StatusPille, TomTilstand } from "@/components/precision/pa";
import type { BaneLibraryItem } from "@/lib/gameplan/queries";

export function GameplanV2({ data }: { data: BaneLibraryItem[] }) {
  const kartlagte = data.filter((b) => b.hasGeometry).length;
  const sumRunder = data.reduce((s, b) => s + b.playerRounds, 0);
  const tom = data.length === 0;

  return (
    <div className="ph20g">
      <header>
        <h1>Gameplan</h1>
        <p>Dine baner</p>
        <p>Spredningen din på hver bane du spiller.</p>
      </header>
      <div className="ph20g-kpi">
        <p className="pa-card"><span>Baner</span><strong>{tom ? "—" : data.length}</strong></p>
        <p className="pa-card"><span>Kartlagt</span><strong>{tom ? "—" : kartlagte}</strong></p>
        <p className="pa-card"><span>Spilte runder</span><strong>{tom ? "—" : sumRunder}</strong></p>
      </div>
      {tom ? (
        <>
          <TomTilstand icon={MapPin} title="Ingen baner ennå" text="Logg en runde — banene dine dukker opp her." />
          <Link href="/portal/runde/live" className="pa-btn pa-btn--primary pa-btn--full">Start live-føring</Link>
        </>
      ) : (
        <section className="pa-card ph20g-liste">
          <p>Banebibliotek · {data.length} baner</p>
          <ul>
            {data.map((b) => (
              <li key={b.id}>
                <Link href={`/portal/gameplan/${b.id}`}>
                  <MapPin size={16} aria-hidden />
                  <span>
                    <strong>{b.navn}</strong>
                    <small>{b.klubb}</small>
                  </span>
                  {b.hasGeometry ? <StatusPille tone="ok">{b.holesMapped} hull</StatusPille> : <StatusPille>Kommer</StatusPille>}
                  <b>{b.playerRounds} runder</b>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
