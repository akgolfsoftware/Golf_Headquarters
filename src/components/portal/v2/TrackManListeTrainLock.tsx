"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TrackmanImportModal } from "@/components/shared/trackman-import-modal";
import type { TrackManListeData } from "@/lib/trackman/liste-data";

export function TrackManListeTrainLock({ data }: { data: TrackManListeData }) {
  const n = data.rader.length;

  return (
    <div className="ph17t">
      <header>
        <p>Analyse</p>
        <h1>TrackMan</h1>
        <p>{n === 0 ? "Ingen økter ennå" : `${n} ${n === 1 ? "økt" : "økter"}`}</p>
      </header>
      {n > 0 && (
        <ul className="pa-card ph17t-liste">
          {data.rader.map((r) => (
            <li key={r.id}>
              <Link href={`/portal/analysere/trackman/${r.id}`}>
                <span>
                  <strong>{r.klubb} · {r.slag} slag</strong>
                  <small>{r.undertekst}</small>
                </span>
                <span>
                  <strong>{r.carryTekst}</strong>
                  <small>{r.smashTekst}</small>
                </span>
                <ChevronRight size={16} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <section className="ph17t-last">
        <p>CSV eller HTML-rapport. Analyseres med en gang.</p>
        <TrackmanImportModal
          label="Last opp CSV / HTML"
          className="pa-btn pa-btn--primary pa-btn--full"
          triggerStyle={{ minHeight: 48 }}
        />
        {n === 0 && <p>Ingen TrackMan-økt ennå. Last opp en eksport — vi lager spredning og caddie-setning automatisk.</p>}
      </section>
    </div>
  );
}
