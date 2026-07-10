"use client";

/**
 * PlayerHQ Utfordringer — v2 (retning C «Presis»). Rekomponert fra den ekte
 * skjermen (src/app/portal/utfordringer/page.tsx): gamification-oversikt over
 * drill-utfordringer (DrillChallenge) — aktive + fullførte, med deltakerantall,
 * spillerens plassering/score og sluttdato.
 *
 * INGEN mockup finnes for denne skjermen → komponert fra v2-biblioteket
 * (@/components/v2) i retning C. Kun v2-komponenter + T.*-tokens; ingen rå hex,
 * ingen ad-hoc UI-primitiver. Ærlig tom-tilstand når det ikke finnes utfordringer.
 *
 * V2Shell (montert i (v2preview)/v2-utfordringer/page.tsx) eier chrome-en — denne
 * komponenten rendrer bare den indre innholds-stacken. All funksjon + datakontrakt
 * er bevart; erEier/min plassering/deltakerantall er ferdigberegnet på serveren.
 */

import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  CTAPill,
  StatusPill,
  MikroMeta,
  TomTilstand,
  Bit,
} from "@/components/v2";

/* ── Data-kontrakt ─────────────────────────────────────────────────── */

/** Ett utfordrings-kort, ferdigberegnet på serveren (brukerens perspektiv). */
export type UtfordringKortData = {
  id: string;
  name: string;
  description: string | null;
  endAt: Date | null;
  /** "ACTIVE" | "ENDED" (rå status fra DrillChallenge). */
  status: string;
  erEier: boolean;
  deltakere: number;
  minRank: number | null;
  minScore: number | null;
};

export type UtfordringerData = {
  aktive: UtfordringKortData[];
  tidligere: UtfordringKortData[];
};

/* ── Rene hjelpere (norsk bokmål) ──────────────────────────────────── */

const MND = ["jan.", "feb.", "mar.", "apr.", "mai", "jun.", "jul.", "aug.", "sep.", "okt.", "nov.", "des."];

function kortDato(d: Date): string {
  return `${d.getDate()}. ${MND[d.getMonth()]}`;
}

/** Score → norsk komma-desimal, uten desimal for heltall. */
function scoreTekst(v: number): string {
  return (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)).replace(".", ",");
}

/* ── Kort ──────────────────────────────────────────────────────────── */

function UtfordringKort({ u }: { u: UtfordringKortData }) {
  const avsluttet = u.status === "ENDED";
  const deadlineTekst = avsluttet
    ? "Avsluttet"
    : u.endAt
      ? `Slutter ${kortDato(u.endAt)}`
      : "Ingen sluttdato";

  return (
    <Link href={`/portal/utfordringer/${u.id}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <Kort hover pad="16px 18px" style={{ height: "100%" }}>
        {/* Status + eierskap */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <StatusPill tone={avsluttet ? "up" : "lime"}>{avsluttet ? "Fullført" : "Aktiv"}</StatusPill>
          {u.erEier && <Bit icon="star">Eier</Bit>}
        </div>

        {/* Tittel */}
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, color: T.fg, lineHeight: 1.3, marginTop: 12 }}>
          {u.name}
        </div>

        {u.description && (
          <p
            style={{
              fontFamily: T.ui,
              fontSize: 12.5,
              color: T.fg2,
              lineHeight: 1.55,
              margin: "8px 0 0",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {u.description}
          </p>
        )}

        {/* Nøkkeltall: deltakere + min plassering */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 14,
            paddingTop: 14,
            borderTop: `1px solid ${T.border}`,
          }}
        >
          <div>
            <Caps size={9}>Deltakere</Caps>
            <div style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.fg, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
              {u.deltakere}
            </div>
          </div>
          <div>
            <Caps size={9}>Min plassering</Caps>
            <div style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
              {u.minRank != null ? (
                <span style={{ color: T.lime }}>
                  #{u.minRank}
                  {u.minScore != null && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.mut }}> ({scoreTekst(u.minScore)})</span>
                  )}
                </span>
              ) : (
                <span style={{ color: T.mut }}>–</span>
              )}
            </div>
          </div>
        </div>

        {/* Sluttdato */}
        <div style={{ marginTop: 14 }}>
          <MikroMeta icon="clock">{deadlineTekst}</MikroMeta>
        </div>
      </Kort>
    </Link>
  );
}

/* ── Skjermen ──────────────────────────────────────────────────────── */

export function UtfordringerV2({ data }: { data: UtfordringerData }) {
  const { aktive, tidligere } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps>PlayerHQ · Utfordringer</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="utfordringer">Mine</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
            {aktive.length} aktive · utfordringer du har laget eller deltar i.
          </p>
        </div>
        <Link href="/portal/utfordringer/ny" style={{ textDecoration: "none" }}>
          <CTAPill icon="plus">Ny utfordring</CTAPill>
        </Link>
      </div>

      {/* Aktive */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Caps>Aktive ({aktive.length})</Caps>
        {aktive.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: T.gap }}>
            {aktive.map((u) => (
              <UtfordringKort key={u.id} u={u} />
            ))}
          </div>
        ) : (
          <Kort>
            <TomTilstand
              icon="trophy"
              title="Ingen aktive utfordringer"
              sub="Lag en ny utfordring eller bli med i en eksisterende."
            />
            <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
              <Link href="/portal/utfordringer/ny" style={{ textDecoration: "none" }}>
                <CTAPill icon="plus">Ny utfordring</CTAPill>
              </Link>
            </div>
          </Kort>
        )}
      </div>

      {/* Tidligere */}
      {tidligere.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Caps>Tidligere ({tidligere.length})</Caps>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: T.gap }}>
            {tidligere.map((u) => (
              <UtfordringKort key={u.id} u={u} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
