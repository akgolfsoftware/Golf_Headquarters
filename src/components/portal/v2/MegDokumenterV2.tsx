"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { StatusPille, TomTilstand } from "@/components/precision/pa";

export type DokumentRad = {
  id: string;
  title: string;
  url: string;
  kind: string;
  dato: string;
};

export type MegDokumenterData = { dokumenter: DokumentRad[] };

const KIND_ETIKETT: Record<string, string> = {
  CONTRACT: "Kontrakt",
  CONSENT: "Samtykke",
  PRIVACY: "Personvern",
  GDPR: "Personvern",
  RECEIPT: "Kvittering",
  LICENSE: "Lisens",
  GUIDE: "Veiledning",
  OTHER: "Annet",
};

const KIND_PILL: Record<string, { tekst: string; tone: "ok" | "neutral" }> = {
  CONTRACT: { tekst: "Signert", tone: "ok" },
  CONSENT: { tekst: "Godkjent", tone: "ok" },
  RECEIPT: { tekst: "Betalt", tone: "ok" },
  LICENSE: { tekst: "Gyldig", tone: "ok" },
  PRIVACY: { tekst: "Aktiv", tone: "ok" },
  GDPR: { tekst: "Aktiv", tone: "ok" },
};

export function MegDokumenterV2({ data }: { data: MegDokumenterData }) {
  const { dokumenter } = data;
  const n = dokumenter.length;

  return (
    <div className="ph24d">
      <header>
        <h1>Dokumenter</h1>
        <p>Meg</p>
      </header>
      <div className="ph24d-kpi">
        <p className="pa-card"><span>Antall</span><strong>{n}</strong></p>
        <p className="pa-card"><span>Status</span><strong>{n === 0 ? "Ingen ennå" : "Klar"}</strong></p>
      </div>
      {n === 0 ? (
        <>
          <TomTilstand icon={FileText} title="Ingen dokumenter ennå" text="Avtaler, samtykker og kvitteringer dukker opp her når de er klare." />
          <Link href="/portal/meg" className="pa-btn pa-btn--secondary pa-btn--full">Tilbake til Meg</Link>
        </>
      ) : (
        <ul className="pa-card ph24d-liste">
          {dokumenter.map((d) => {
            const pill = KIND_PILL[d.kind];
            return (
              <li key={d.id}>
                <a href={d.url} target="_blank" rel="noopener noreferrer">
                  <strong>{d.title}</strong>
                  <small>{d.dato} · {KIND_ETIKETT[d.kind] ?? "Dokument"}</small>
                </a>
                {pill && <StatusPille tone={pill.tone}>{pill.tekst}</StatusPille>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
