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
import { Kort, T, StatusPill } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { mergeTurneringer } from "../actions";

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

/** Ett felt i side-om-side-diffen. `ulik` fremhever verdien når sidene avviker. */
function Diffrad({ label, verdi, ulik }: { label: string; verdi: string; ulik?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 8, fontFamily: T.mono, fontSize: 11, padding: "5px 0", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ color: T.mut, minWidth: 74, flex: "none" }}>{label}</span>
      <span style={{ color: ulik ? T.down : T.fg, minWidth: 0 }}>{verdi}</span>
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
    <Kort pad="0">
      <div style={{ borderBottom: `1px solid ${T.border}`, background: T.panel2, padding: "14px 20px", borderRadius: "20px 20px 0 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <StatusPill tone="info">Manuell</StatusPill>
            <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14.5, color: T.fg }}>{kandidat.manual.name}</span>
          </div>
          {topp && <StatusPill tone={sannsynlig ? "lime" : "info"}>{sannsynlig ? "Sannsynlig dublett" : "Usikker"}</StatusPill>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginTop: 6 }}>
          <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>{formaterDato(kandidat.manual.startDate)}</span>
          {kandidat.manual.location && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
              <Icon name="map-pin" size={11} /> {kandidat.manual.location}
            </span>
          )}
          {kandidat.manual.createdByName && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
              <Icon name="user" size={11} /> {kandidat.manual.createdByName}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {topp === null ? (
          <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
            Ingen automatiske match-forslag. Du kan velge fra full liste i AgencyOS.
          </p>
        ) : sannsynlig ? (
          <>
            <p style={{ margin: "0 0 12px", fontFamily: T.ui, fontSize: 12, color: T.mut }}>
              Sammenslåing kan ikke angres. Velg hvilken oppføring som beholdes — resultater og påmeldinger flyttes over til den, den andre slettes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12 }}>
              <div style={{ padding: "12px 14px", borderRadius: 10, background: T.panel, border: `1px solid ${T.fg}` }}>
                <div style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, marginBottom: 8 }}>
                  Beholdes · {SOURCE_LABEL[topp.sourceOrigin ?? ""] ?? topp.sourceOrigin ?? "?"}
                </div>
                <Diffrad label="Navn" verdi={topp.name} ulik={topp.name !== kandidat.manual.name} />
                <Diffrad label="Dato" verdi={formaterDato(topp.startDate)} ulik={formaterDato(topp.startDate) !== formaterDato(kandidat.manual.startDate)} />
                <Diffrad label="Bane" verdi={topp.location ?? "—"} ulik={(topp.location ?? "") !== (kandidat.manual.location ?? "")} />
                <Diffrad label="Påmeldte" verdi={String(topp.antallEntries)} />
                <Diffrad label="Resultater" verdi={String(topp.antallResults)} />
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 10, background: T.panel3, border: `1px solid ${T.border}` }}>
                <div style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, marginBottom: 8 }}>Slettes · Manuell</div>
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
                style={{ display: "inline-flex", alignItems: "center", gap: 6, appearance: "none", cursor: isPending ? "default" : "pointer", borderRadius: 9999, padding: "8px 15px", fontFamily: T.ui, fontSize: 12, fontWeight: 700, color: T.onLime, background: T.lime, border: "none", opacity: isPending ? 0.6 : 1 }}
              >
                <Icon name={isPending ? "loader" : "git-compare"} size={13} style={{ color: T.onLime }} />
                Slå sammen
              </button>
              <button
                type="button"
                onClick={() => handleMerge(topp.id, kandidat.manual.id, kandidat.manual.name)}
                disabled={isPending}
                className="v2-press v2-focus"
                style={{ appearance: "none", cursor: isPending ? "default" : "pointer", borderRadius: 9999, padding: "8px 15px", fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg, background: "transparent", border: `1px solid ${T.border}`, opacity: isPending ? 0.6 : 1 }}
              >
                Bytt hvilken som beholdes
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ margin: "0 0 12px", fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>
              Samme dato, men svakt navnetreff — kan være ulike turneringer. Sjekk før du slår sammen.
            </p>
            <button
              type="button"
              onClick={() => handleMerge(kandidat.manual.id, topp.id, topp.name)}
              disabled={isPending}
              className="v2-press v2-focus"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, appearance: "none", cursor: isPending ? "default" : "pointer", borderRadius: 9999, padding: "8px 15px", fontFamily: T.ui, fontSize: 12, fontWeight: 700, color: T.onLime, background: T.lime, border: "none", opacity: isPending ? 0.6 : 1 }}
            >
              <Icon name={isPending ? "loader" : "git-compare"} size={13} style={{ color: T.onLime }} />
              Slå sammen med «{topp.name}»
            </button>
          </>
        )}

        {restForslag.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: T.mut }}>
              {restForslag.length === 1 ? "Ett annet forslag" : `${restForslag.length} andre forslag`}
            </span>
            {restForslag.map((f) => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
                <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, minWidth: 0 }}>
                  {f.name} · {formaterDato(f.startDate)}
                </span>
                <button
                  type="button"
                  onClick={() => handleMerge(kandidat.manual.id, f.id, f.name)}
                  disabled={isPending}
                  className="v2-press v2-focus"
                  style={{ flex: "none", appearance: "none", cursor: isPending ? "default" : "pointer", borderRadius: 9999, padding: "5px 12px", fontFamily: T.ui, fontSize: 11, fontWeight: 600, color: T.fg, background: "transparent", border: `1px solid ${T.border}` }}
                >
                  Slå sammen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {feedback && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, borderTop: `1px solid color-mix(in srgb, ${T.lime} 25%, transparent)`, background: `color-mix(in srgb, ${T.lime} 8%, transparent)`, padding: "10px 20px", fontFamily: T.ui, fontSize: 12.5, color: T.fg, borderRadius: "0 0 20px 20px" }}>
          <Icon name="check-circle" size={14} style={{ color: T.lime, marginTop: 1, flex: "none" }} />
          {feedback}
        </div>
      )}
      {feil && (
        <div style={{ borderTop: `1px solid color-mix(in srgb, ${T.down} 25%, transparent)`, background: `color-mix(in srgb, ${T.down} 8%, transparent)`, padding: "10px 20px", fontFamily: T.ui, fontSize: 12.5, color: T.down, borderRadius: "0 0 20px 20px" }}>
          {feil}
        </div>
      )}
    </Kort>
  );
}
