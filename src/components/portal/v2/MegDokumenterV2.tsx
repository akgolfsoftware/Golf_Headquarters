"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ Meg · Dokumenter — v2 Presis + B-pakke (status, tom = én grønn vei).
 */

import Link from "next/link";
import { Caps, Kort, Rad, StatusPill, TomTilstand, Icon, type StatusTone } from "@/components/v2";
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
        background: TL.dim,
        border: `1px solid ${TL.hair}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <Icon name={KIND_IKON[kind] ?? "file-text"} size={18} style={{ color: TL.mute }} />
    </span>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MegDokumenterV2({ data }: { data: MegDokumenterData }) {
  const { dokumenter } = data;
  const n = dokumenter.length;

  return (
    <div data-paper-wave-g="megdokumenter" data-paper-portal-meg-dokumenter style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      <div>
        <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Dokumenter</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>Meg</span>
        </div>
      </div>

      {/* B: status først */}
      <div className="grid grid-cols-2" style={{ gap: 8 }}>
        <Kort pad="12px">
          <Caps size={9}>Antall</Caps>
          <div style={{ fontFamily: TL.font.mono, fontWeight: 700, fontSize: 18, marginTop: 8, color: TL.text }}>{n}</div>
        </Kort>
        <Kort pad="12px">
          <Caps size={9}>Status</Caps>
          <div style={{ fontFamily: TL.font.sans, fontWeight: 600, fontSize: 14, marginTop: 8, color: TL.text }}>
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
            <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 56, width: "100%", padding: "10px 16px",
            borderRadius: 12, background: TL.dim, color: TL.text, border: `1px solid ${TL.hair}`, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Tilbake til Meg</span>
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
                    <span style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute }}>
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
