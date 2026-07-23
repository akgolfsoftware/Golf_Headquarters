"use client";

/**
 * PlayerHQ Meg · Dokumenter — v2 Presis + B-pakke (status, tom = én grønn vei).
 */

import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  TomTilstand,
  Icon,
  CTAPill,
  type StatusTone,
} from "@/components/v2";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type DokumentRad = {
  id: string;
  title: string;
  /** Ekstern url til dokumentet — åpnes i ny fane. */
  url: string;
  /** Document.kind (CONTRACT | CONSENT | PRIVACY | GDPR | RECEIPT | LICENSE | GUIDE | OTHER …). */
  kind: string;
  /** Ferdig nb-NO-formatert opprettelsesdato (server-side). */
  dato: string;
};

export type MegDokumenterData = {
  dokumenter: DokumentRad[];
};

/* ── Kind → ikon / etikett / status (speilet fra den ekte siden) ────── */

// Kun v2-ikonnavn (icon.tsx). Fri kind-streng får trygg fallback.
const KIND_IKON: Record<string, string> = {
  CONTRACT: "file-text",
  CONSENT: "shield",
  PRIVACY: "lock",
  GDPR: "lock",
  RECEIPT: "credit-card",
  LICENSE: "badge-check",
  GUIDE: "file-text",
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

// Status-pill kun der dokumenttypen impliserer status (ingen status-felt i modellen).
const KIND_PILL: Record<string, { tekst: string; tone: StatusTone }> = {
  CONTRACT: { tekst: "Signert", tone: "up" },
  CONSENT: { tekst: "Godkjent", tone: "up" },
  RECEIPT: { tekst: "Betalt", tone: "up" },
  LICENSE: { tekst: "Gyldig", tone: "up" },
  PRIVACY: { tekst: "Aktiv", tone: "up" },
  GDPR: { tekst: "Aktiv", tone: "up" },
};

/* ── Ikon-emblem foran raden (samme mønster som Innstillinger · SeksjonIkon) ─ */

function DokIkon({ kind }: { kind: string }) {
  return (
    <span
      style={{
        width: 40,
        height: 40,
        borderRadius: 11,
        background: T.panel3,
        border: `1px solid ${T.border}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <Icon name={KIND_IKON[kind] ?? "file-text"} size={18} style={{ color: T.fg2 }} />
    </span>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MegDokumenterV2({ data }: { data: MegDokumenterData }) {
  const { dokumenter } = data;
  const n = dokumenter.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>Meg · Dokumenter</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel>Dokumenter</Tittel>
        </div>
      </div>

      {/* B: status først */}
      <div className="grid grid-cols-2" style={{ gap: 8 }}>
        <Kort pad="12px">
          <Caps size={9}>Antall</Caps>
          <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 18, marginTop: 8, color: T.fg }}>{n}</div>
        </Kort>
        <Kort pad="12px">
          <Caps size={9}>Status</Caps>
          <div style={{ fontFamily: T.ui, fontWeight: 600, fontSize: 14, marginTop: 8, color: T.fg }}>
            {n === 0 ? "Ingen ennå" : "Klar"}
          </div>
        </Kort>
      </div>

      {n === 0 ? (
        <>
          <Kort>
            <TomTilstand
              icon="file-text"
              title="Ingen dokumenter ennå"
              sub="Avtaler, samtykker og kvitteringer dukker opp her når de er klare."
            />
          </Kort>
          <Link href="/portal/meg" style={{ textDecoration: "none", display: "block" }}>
            <CTAPill icon="arrow-left" full>
              Tilbake til Meg
            </CTAPill>
          </Link>
        </>
      ) : (
        <Kort pad="4px 20px 6px">
          {dokumenter.map((d, i) => {
            const pill = KIND_PILL[d.kind];
            const etikett = KIND_ETIKETT[d.kind] ?? "Dokument";
            return (
              <a
                key={d.id}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <Rad
                  last={i === dokumenter.length - 1}
                  leading={<DokIkon kind={d.kind} />}
                  title={d.title}
                  sub={
                    <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>
                      {d.dato} · {etikett}
                    </span>
                  }
                  meta={pill ? <StatusPill tone={pill.tone}>{pill.tekst}</StatusPill> : undefined}
                />
              </a>
            );
          })}
        </Kort>
      )}
    </div>
  );
}
