"use client";

import Link from "next/link";
import {
  FileText,
  Shield,
  Lock,
  CreditCard,
  BadgeCheck,
  ExternalLink,
} from "lucide-react";

export type DokumentRad = {
  id: string;
  title: string;
  url: string;
  kind: string;
  dato: string;
};

export type MegDokumenterData = {
  dokumenter: DokumentRad[];
};

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

const KIND_STATUS: Record<string, string> = {
  CONTRACT: "Signert",
  CONSENT: "Godkjent",
  RECEIPT: "Betalt",
  LICENSE: "Gyldig",
  PRIVACY: "Aktiv",
  GDPR: "Aktiv",
};

function DokIkon({ kind }: { kind: string }) {
  const iconProps = { size: 18, style: { color: "var(--text-secondary)" } };
  switch (kind) {
    case "CONSENT":
      return <Shield {...iconProps} />;
    case "PRIVACY":
    case "GDPR":
      return <Lock {...iconProps} />;
    case "RECEIPT":
      return <CreditCard {...iconProps} />;
    case "LICENSE":
      return <BadgeCheck {...iconProps} />;
    case "CONTRACT":
    case "GUIDE":
    default:
      return <FileText {...iconProps} />;
  }
}

export function MegDokumenterV2({ data }: { data: MegDokumenterData }) {
  const { dokumenter } = data;
  const n = dokumenter.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
      <div className="ph24d-kpi">
        <p>
          <span>Antall</span>
          <strong>{n}</strong>
        </p>
        <p>
          <span>Status</span>
          <strong>{n === 0 ? "Ingen ennå" : "Klar"}</strong>
        </p>
      </div>

      {n === 0 ? (
        <div className="pa-state pa-state--empty">
          <div className="pa-state__icon">
            <FileText size={22} />
          </div>
          <div className="pa-state__text">
            <div className="pa-state__title">Ingen dokumenter ennå</div>
            <div className="pa-state__body">
              Avtaler, samtykker og kvitteringer dukker opp her når de er klare.
            </div>
          </div>
        </div>
      ) : (
        <ul className="ph24d-liste">
          {dokumenter.map((d) => {
            const status = KIND_STATUS[d.kind];
            const etikett = KIND_ETIKETT[d.kind] ?? "Dokument";
            return (
              <li key={d.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius)",
                      background: "var(--surface-sunken)",
                      border: "1px solid var(--border-hairline)",
                      display: "grid",
                      placeItems: "center",
                      flex: "none",
                    }}
                  >
                    <DokIkon kind={d.kind} />
                  </div>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}
                  >
                    <span style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>
                      {d.title}
                    </span>
                    <small>
                      {d.dato} · {etikett}
                    </small>
                  </a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
                  {status && (
                    <span className="pa-status pa-status--ok">
                      {status}
                    </span>
                  )}
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pa-btn pa-btn--ghost pa-btn--sm"
                    aria-label={`Åpne ${d.title}`}
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4 }}>
        <Link href="/portal/meg" className="pa-btn pa-btn--secondary pa-btn--sm">
          Tilbake til Meg
        </Link>
      </div>
    </div>
  );
}
