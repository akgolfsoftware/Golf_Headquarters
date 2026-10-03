"use client";

/**
 * Drill-detalj. Trinn kan krysses av her og lagres ikke.
 * Slots, trinn og parametere vises bare når feltet finnes.
 * Media uten filer gir «Media kommer».
 */

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Image as ImageIcon, Pencil, Video } from "lucide-react";
import { TomTilstand } from "@/components/precision/pa";

export type DrillDetaljV2Data = {
  akse: string;
  /** Sublinje under navnet, f.eks. "Innspill · 35 min · 30 reps". */
  sub: string;
  navn: string;
  beskrivelse: string | null;
  /** AK-formelen slot for slot — kun slots med faktisk verdi. */
  slots: { k: string; v: string }[];
  /** Utledede trinn — tom liste skjuler seksjonen. */
  trinn: { n: number; text: string }[];
  coachNotat: string | null;
  coachNavn: string;
  /** Tilgjengelige media — tom liste gir «Media kommer». */
  media: { kind: "video" | "foto"; label: string; url: string }[];
  /** Parameter-tabell — kun rader med faktisk verdi. */
  params: { key: string; value: string }[];
  /** «din bruk» — Sist brukt / Siste 30 dager.
      «Beste resultat» finnes ikke i datamodellen og utelates. */
  bruk: { k: string; v: string }[];
  hrefLeggTilIPlan: string;
};

export function DrillDetaljV2({ data }: { data: DrillDetaljV2Data }) {
  const [gjort, setGjort] = useState<Set<number>>(new Set());

  function toggleTrinn(n: number) {
    setGjort((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  return (
    <div className="ph-flate">
      <header>
        <p>{data.akse}</p>
        <h1>{data.navn}</h1>
        <p>{data.sub}</p>
      </header>

      {data.beskrivelse && (
        <section className="pa-card ph-kort">
          <p>hva den trener</p>
          <div>{data.beskrivelse}</div>
        </section>
      )}

      {data.slots.length > 0 && (
        <section className="pa-card ph-kort">
          <p>AK-formelen · slot for slot</p>
          <dl>
            {data.slots.map((s) => (
              <div key={s.k}>
                <dt>{s.k}</dt>
                <dd>{s.v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {data.bruk.length > 0 && (
        <section className="pa-card ph-kort">
          <p>din bruk</p>
          <dl>
            {data.bruk.map((b) => (
              <div key={b.k}>
                <dt>{b.k}</dt>
                <dd>{b.v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {data.trinn.length > 0 && (
        <section className="pa-card ph-kort">
          <p>
            Slik gjør du det · {gjort.size}/{data.trinn.length}
          </p>
          {data.trinn.map((t) => (
            <label key={t.n} className="ph-sjekk">
              <input
                type="checkbox"
                checked={gjort.has(t.n)}
                onChange={() => toggleTrinn(t.n)}
              />
              <span>
                <strong>
                  {t.n}. {t.text}
                </strong>
              </span>
            </label>
          ))}
        </section>
      )}

      <section className="pa-card ph-kort">
        <p>Media</p>
        {data.media.length === 0 ? (
          <TomTilstand
            icon={Video}
            title="Media kommer"
            text="Video eller bilder for drillen er ikke lastet opp ennå."
          />
        ) : (
          <ul className="ph-rader">
            {data.media.map((m, i) => (
              <li key={`${m.kind}-${i}`}>
                <a href={m.url} target="_blank" rel="noopener noreferrer">
                  {m.kind === "video" ? (
                    <Video size={16} aria-hidden />
                  ) : (
                    <ImageIcon size={16} aria-hidden />
                  )}
                  <span>
                    <strong>{m.label}</strong>
                    <small>{m.kind === "video" ? "Video" : "Foto"}</small>
                  </span>
                  <ExternalLink size={14} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {data.coachNotat && (
        <section className="pa-card ph-kort">
          <p>Coach-notat</p>
          <strong>{data.coachNavn}</strong>
          <div>{data.coachNotat}</div>
        </section>
      )}

      {data.params.length > 0 && (
        <section className="pa-card ph-kort">
          <p>Parametere</p>
          <dl>
            {data.params.map((p) => (
              <div key={p.key}>
                <dt>{p.key}</dt>
                <dd>{p.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <Link href={data.hrefLeggTilIPlan} className="pa-btn pa-btn--primary pa-btn--full">
        Legg i neste økt
      </Link>

      <p>
        <Pencil size={14} aria-hidden /> Å legge en drill i egen økt endrer ikke ukeplanen —
        derfor ingen godkjenning. Anders får beskjed og kan justere om det kolliderer med tema.
      </p>
    </div>
  );
}
