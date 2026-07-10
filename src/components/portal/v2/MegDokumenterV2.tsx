"use client";

/**
 * PlayerHQ Meg · Dokumenter — v2 (retning C «Presis», mørk først). Rekomponert
 * fra den ekte /portal/meg/dokumenter-siden, men bygget kun av v2-komponenter
 * fra "@/components/v2" (Kort/Rad/StatusPill/TomTilstand/Icon/Caps/Tittel) +
 * T.*-tokens. Ingen ad-hoc UI, ingen rå hex.
 *
 * Funksjon bevart 1:1: ÉN liste med dokument-rader (ikon-emblem per kind +
 * tittel + mono-meta «dato · type» + status-pill der kind impliserer status +
 * chevron). Rad åpner dokumentets url i ny fane. Ærlig tom-tilstand når lista
 * er tom — ingenting fabrikkeres.
 *
 * Datakontrakt: EKTE Prisma-Document (globale + egne). Modellen har ikke
 * status-felt — status-pill vises kun der `kind` impliserer status (kontrakt =
 * signert, kvittering = betalt osv.), speilet fra den opprinnelige siden.
 * `dato` formateres server-side (nb-NO) for konsistent tidssone.
 *
 * V2Shell eier chrome-en; denne komponenten rendrer bare den indre stacken.
 */

import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  StatusPill,
  TomTilstand,
  Icon,
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Caps>Meg · Dokumenter</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel>Dokumenter</Tittel>
        </div>
        <div style={{ fontFamily: T.ui, fontSize: T.bodySm, color: T.mut, marginTop: 10 }}>
          Signerte avtaler, samtykker og kvitteringer samlet på ett sted.
        </div>
      </div>

      {/* Liste eller ærlig tom-tilstand */}
      {dokumenter.length === 0 ? (
        <Kort>
          <TomTilstand
            icon="file-text"
            title="Ingen dokumenter ennå"
            sub="Signerte avtaler, samtykker og kvitteringer dukker opp her når de er klare."
          />
        </Kort>
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
