"use client";

/**
 * Dublett-kandidat-liste — v2. Logikk bevart 1:1 fra legacy merge-liste.tsx —
 * kun visuelt portert til Kort/StatusPill/v2-tokens.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Kort, T, StatusPill } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { mergeTurneringer } from "../actions";

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
    location: string | null;
    sourceOrigin: string | null;
    tour: string | null;
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

function DublettKort({ kandidat }: { kandidat: MergeKandidat }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  function handleMerge(targetId: string, targetName: string) {
    setFeil(null);
    setFeedback(null);
    startTransition(async () => {
      const result = await mergeTurneringer({ sourceId: kandidat.manual.id, targetId });
      if (!result.ok) {
        setFeil(result.feil);
        return;
      }
      const { entries, results, participants } = result.flyttet;
      setFeedback(`Slått sammen med «${targetName}» — flyttet ${entries} påmeldinger, ${results} resultater, ${participants} deltakere.`);
      router.refresh();
    });
  }

  return (
    <Kort pad="0">
      <div style={{ borderBottom: `1px solid ${T.border}`, background: T.panel2, padding: "14px 20px", borderRadius: "20px 20px 0 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <StatusPill tone="info">Manuell</StatusPill>
          <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14.5, color: T.fg }}>{kandidat.manual.name}</span>
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
          <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
            {kandidat.manual.antallEntries + kandidat.manual.antallResults + kandidat.manual.antallPublicEntries} koblinger
          </span>
        </div>
      </div>

      <div>
        {kandidat.forslag.length === 0 ? (
          <div style={{ padding: "18px 20px", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
            Ingen automatiske match-forslag. Du kan velge fra full liste i AgencyOS.
          </div>
        ) : (
          kandidat.forslag.map((f, i) => (
            <div
              key={f.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "12px 20px",
                borderTop: i === 0 ? "none" : `1px solid ${T.border}`,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <StatusPill tone="lime">{f.sourceOrigin ? SOURCE_LABEL[f.sourceOrigin] ?? f.sourceOrigin : "?"}</StatusPill>
                  <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{f.name}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 4 }}>
                  <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>{formaterDato(f.startDate)}</span>
                  {f.location && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
                      <Icon name="map-pin" size={11} /> {f.location}
                    </span>
                  )}
                  {f.tour && <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>{f.tour}</span>}
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>score {f.score}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleMerge(f.id, f.name)}
                disabled={isPending}
                className="v2-press v2-focus"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, flex: "none", appearance: "none", cursor: isPending ? "default" : "pointer", borderRadius: 9999, padding: "8px 15px", fontFamily: T.ui, fontSize: 12, fontWeight: 700, color: T.onLime, background: T.lime, border: "none", opacity: isPending ? 0.6 : 1 }}
              >
                <Icon name={isPending ? "loader" : "git-compare"} size={13} style={{ color: T.onLime }} />
                Slå sammen
              </button>
            </div>
          ))
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
