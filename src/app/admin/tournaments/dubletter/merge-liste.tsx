"use client";

/**
 * Dublett-kandidat-liste — Paper 1:1 (fase2/W4, `agencyos-turneringer`,
 * data-vis="dubletter"). Match-algoritme og mergeTurneringer-kallet er
 * uendret; presentasjonen er ombygd til fasitens side-om-side diff
 * (.dub/.side/.diffrad) med Sannsynlig/Usikker-klassifisering.
 *
 * Terskel for "Sannsynlig dublett": score >= 250 (overlap på minst 3 ord i
 * navnet OG dato innenfor samme dag, jf. tokenOverlap*100 - dagerDiff i
 * page.tsx). Under det vises kun den enkle usikker-varianten uten diff —
 * for lite grunnlag til å påstå hvilke felt som faktisk avviker.
 *
 * "Ikke dublett" (fasitens tredje knapp) er bevisst utelatt: den krever en
 * varig "avvist par"-markering (nytt felt/tabell) som ikke finnes i dag —
 * uten den ville knappen enten gjøre ingenting varig eller kreve en
 * skjemaendring. Se PR-beskrivelsen.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TL } from "@/lib/v2/train-lock";
import { TlKort } from "@/components/admin/v2/oppsett/tl-kit";
import { Icon } from "@/components/v2/icon";
import { mergeTurneringer } from "../actions";

/** Nøytralt merke — ingen fargekoding (train-lock.ts §Signal). */
function TlMerke({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: TL.mute,
        boxShadow: `inset 0 0 0 1px ${TL.hair}`,
        borderRadius: 999,
        padding: "3px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

const SANNSYNLIG_TERSKEL = 250;

export type MergeKandidat = {
  manual: {
    id: string;
    name: string;
    startDate: string;
    endDate: string | null;
    location: string | null;
    tour: string | null;
    createdByName: string | null;
    createdByEmail: string | null;
    antallEntries: number;
    antallResults: number;
    antallPublicEntries: number;
  };
  forslag: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string | null;
    location: string | null;
    sourceOrigin: string | null;
    tour: string | null;
    antallEntries: number;
    antallResults: number;
    antallPublicEntries: number;
    score: number;
  }>;
};

const SOURCE_LABEL: Record<string, string> = {
  DATAGOLF: "DataGolf",
  NGF: "NGF",
  GJGT: "GJGT",
  VAGR: "VAGR",
  NCAA: "NCAA",
  MANUAL: "Manuell",
};

function formaterDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

export function MergeDubletterListe({ liste }: { liste: MergeKandidat[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {liste.map((k) => (
        <DublettKort key={k.manual.id} kandidat={k} />
      ))}
    </div>
  );
}

/**
 * Ett felt i side-om-side-diffen. `ulik` fremhever verdien når sidene
 * avviker — kun opasitet/vekt, aldri farge (train-lock.ts §Signal: negativ
 * verdi = samme tekstfarge med opasitet + fortegn, ikke rødt).
 */
function Diffrad({ label, verdi, ulik }: { label: string; verdi: string; ulik?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 8, fontFamily: TL.font.mono, fontSize: 11, padding: "5px 0", borderBottom: `1px solid ${TL.hair}` }}>
      <span style={{ color: TL.mute, minWidth: 74, flex: "none" }}>{label}</span>
      <span style={{ color: TL.text, fontWeight: ulik ? 700 : 400, minWidth: 0 }}>{verdi}</span>
    </div>
  );
}

function DublettKort({ kandidat }: { kandidat: MergeKandidat }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  function handleMerge(sourceId: string, targetId: string, targetName: string) {
    setFeil(null);
    setFeedback(null);
    startTransition(async () => {
      const result = await mergeTurneringer({ sourceId, targetId });
      if (!result.ok) {
        setFeil(result.feil);
        return;
      }
      const { entries, results, participants } = result.flyttet;
      setFeedback(`Slått sammen med «${targetName}» — flyttet ${entries} påmeldinger, ${results} resultater, ${participants} deltakere.`);
      router.refresh();
    });
  }

  const topp = kandidat.forslag[0] ?? null;
  const restForslag = kandidat.forslag.slice(1);
  const sannsynlig = topp !== null && topp.score >= SANNSYNLIG_TERSKEL;

  return (
    <TlKort pad="0" style={{ borderRadius: TL.radius.card }}>
      <div style={{ borderBottom: `1px solid ${TL.hair}`, background: TL.dock, padding: "14px 20px", borderRadius: `${TL.radius.card} ${TL.radius.card} 0 0` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <TlMerke>Manuell</TlMerke>
            <span style={{ fontWeight: 700, fontSize: 14.5, color: TL.text }}>{kandidat.manual.name}</span>
          </div>
          {topp && <TlMerke>{sannsynlig ? "Sannsynlig dublett" : "Usikker"}</TlMerke>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginTop: 6 }}>
          <span style={{ fontSize: 11.5, color: TL.mute }}>{formaterDato(kandidat.manual.startDate)}</span>
          {kandidat.manual.location && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, color: TL.mute }}>
              <Icon name="map-pin" size={11} /> {kandidat.manual.location}
            </span>
          )}
          {kandidat.manual.createdByName && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, color: TL.mute }}>
              <Icon name="user" size={11} /> {kandidat.manual.createdByName}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {topp === null ? (
          <p style={{ margin: 0, fontSize: 12.5, color: TL.mute }}>
            Ingen automatiske match-forslag. Du kan velge fra full liste i AgencyOS.
          </p>
        ) : sannsynlig ? (
          <>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: TL.mute }}>
              Sammenslåing kan ikke angres. Velg hvilken oppføring som beholdes — resultater og påmeldinger flyttes over til den, den andre slettes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
              <div style={{ padding: "12px 14px", borderRadius: 10, background: TL.dock, boxShadow: `inset 0 0 0 1px ${TL.text}` }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: TL.text, marginBottom: 8 }}>
                  Beholdes · {SOURCE_LABEL[topp.sourceOrigin ?? ""] ?? topp.sourceOrigin ?? "?"}
                </div>
                <Diffrad label="Navn" verdi={topp.name} ulik={topp.name !== kandidat.manual.name} />
                <Diffrad label="Dato" verdi={formaterDato(topp.startDate)} ulik={formaterDato(topp.startDate) !== formaterDato(kandidat.manual.startDate)} />
                <Diffrad label="Bane" verdi={topp.location ?? "—"} ulik={(topp.location ?? "") !== (kandidat.manual.location ?? "")} />
                <Diffrad label="Påmeldte" verdi={String(topp.antallEntries)} />
                <Diffrad label="Resultater" verdi={String(topp.antallResults)} />
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 10, background: TL.dock, opacity: 0.7 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: TL.text, marginBottom: 8 }}>Slettes · Manuell</div>
                <Diffrad label="Navn" verdi={kandidat.manual.name} ulik={topp.name !== kandidat.manual.name} />
                <Diffrad label="Dato" verdi={formaterDato(kandidat.manual.startDate)} ulik={formaterDato(topp.startDate) !== formaterDato(kandidat.manual.startDate)} />
                <Diffrad label="Bane" verdi={kandidat.manual.location ?? "—"} ulik={(topp.location ?? "") !== (kandidat.manual.location ?? "")} />
                <Diffrad label="Påmeldte" verdi={`${kandidat.manual.antallEntries} — flyttes over`} />
                <Diffrad label="Resultater" verdi={`${kandidat.manual.antallResults} — flyttes over`} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => handleMerge(kandidat.manual.id, topp.id, topp.name)}
                disabled={isPending}
                className="v2-press v2-focus"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, appearance: "none", cursor: isPending ? "default" : "pointer", borderRadius: TL.radius.pill, padding: "8px 15px", fontSize: 12, fontWeight: 700, color: TL.onFill, background: TL.fill, border: "none", opacity: isPending ? 0.6 : 1 }}
              >
                <Icon name={isPending ? "loader" : "git-compare"} size={13} style={{ color: TL.onFill }} />
                Slå sammen
              </button>
              <button
                type="button"
                onClick={() => handleMerge(topp.id, kandidat.manual.id, kandidat.manual.name)}
                disabled={isPending}
                className="v2-press v2-focus"
                style={{ appearance: "none", cursor: isPending ? "default" : "pointer", borderRadius: TL.radius.pill, padding: "8px 15px", fontSize: 12, fontWeight: 600, color: TL.text, background: TL.dim, border: "none", opacity: isPending ? 0.6 : 1 }}
              >
                Bytt hvilken som beholdes
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ margin: "0 0 12px", fontSize: 12.5, color: TL.text }}>
              Samme dato, men svakt navnetreff — kan være ulike turneringer. Sjekk før du slår sammen.
            </p>
            <button
              type="button"
              onClick={() => handleMerge(kandidat.manual.id, topp.id, topp.name)}
              disabled={isPending}
              className="v2-press v2-focus"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, appearance: "none", cursor: isPending ? "default" : "pointer", borderRadius: TL.radius.pill, padding: "8px 15px", fontSize: 12, fontWeight: 700, color: TL.onFill, background: TL.fill, border: "none", opacity: isPending ? 0.6 : 1 }}
            >
              <Icon name={isPending ? "loader" : "git-compare"} size={13} style={{ color: TL.onFill }} />
              Slå sammen med «{topp.name}»
            </button>
          </>
        )}

        {restForslag.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${TL.hair}` }}>
            <span style={{ fontFamily: TL.font.mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: TL.mute }}>
              {restForslag.length === 1 ? "Ett annet forslag" : `${restForslag.length} andre forslag`}
            </span>
            {restForslag.map((f) => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
                <span style={{ fontSize: 12, color: TL.text, minWidth: 0 }}>
                  {f.name} · {formaterDato(f.startDate)}
                </span>
                <button
                  type="button"
                  onClick={() => handleMerge(kandidat.manual.id, f.id, f.name)}
                  disabled={isPending}
                  className="v2-press v2-focus"
                  style={{ flex: "none", appearance: "none", cursor: isPending ? "default" : "pointer", borderRadius: TL.radius.pill, padding: "5px 12px", fontSize: 11, fontWeight: 600, color: TL.text, background: TL.dim, border: "none" }}
                >
                  Slå sammen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {feedback && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, borderTop: `1px solid ${TL.hair}`, padding: "10px 20px", fontSize: 12.5, color: TL.text, borderRadius: `0 0 ${TL.radius.card} ${TL.radius.card}` }}>
          <Icon name="check-circle" size={14} style={{ color: TL.mute, marginTop: 1, flex: "none" }} />
          {feedback}
        </div>
      )}
      {feil && (
        <div role="alert" style={{ borderTop: `1px solid ${TL.hair}`, padding: "10px 20px", fontSize: 12.5, color: TL.danger, borderRadius: `0 0 ${TL.radius.card} ${TL.radius.card}` }}>
          {feil}
        </div>
      )}
    </TlKort>
  );
}
