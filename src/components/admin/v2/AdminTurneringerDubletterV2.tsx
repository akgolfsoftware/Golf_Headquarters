"use client";

/**
 * AgencyOS v2 — Turneringer · Dubletter (`/admin/tournaments/dubletter`,
 * AgencyOS Bølge 3.29, 2026-07-14). Port fra `(legacy)/tournaments/dubletter/
 * page.tsx` + `merge-liste.tsx` — samme match-algoritme (token-overlap +
 * ±3 dager) og `mergeTurneringer`-server-action, uendret (bor i
 * `(legacy)/tournaments/actions.ts`, delt med turnering-detaljsiden).
 *
 * NB: ruten er ikke lenket fra noe v2-skjerm (var heller ikke lenket fra
 * hub-en i legacy) — direkte-URL-only vedlikeholdsverktøy for coach/admin,
 * bevart uendret.
 */

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, T } from "@/components/v2";
import { mergeTurneringer } from "@/app/admin/(legacy)/tournaments/actions";

export interface DubletterForslagV2 {
  id: string;
  name: string;
  startDateTekst: string;
  location: string | null;
  sourceLabel: string;
  tour: string | null;
  score: number;
}

export interface DubletterKandidatV2 {
  manualId: string;
  manualName: string;
  startDateTekst: string;
  location: string | null;
  createdByName: string | null;
  antallKoblinger: number;
  forslag: DubletterForslagV2[];
}

function DublettKortV2({ kandidat }: { kandidat: DubletterKandidatV2 }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  function handleMerge(targetId: string, targetName: string) {
    setFeil(null);
    setFeedback(null);
    startTransition(async () => {
      const res = await mergeTurneringer({ sourceId: kandidat.manualId, targetId });
      if (!res.ok) {
        setFeil(res.feil);
        return;
      }
      const { entries, results, participants } = res.flyttet;
      setFeedback(`Slått sammen med «${targetName}» — flyttet ${entries} påmeldinger, ${results} resultater, ${participants} deltakere.`);
      router.refresh();
    });
  }

  return (
    <Kort pad="0">
      <div style={{ borderBottom: `1px solid ${T.border}`, background: T.panel2, padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusPill tone="info">Manuell</StatusPill>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>{kandidat.manualName}</span>
        </div>
        <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, fontFamily: T.ui, fontSize: 12, color: T.mut }}>
          <span>{kandidat.startDateTekst}</span>
          {kandidat.location && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="map-pin" size={12} />{kandidat.location}</span>}
          {kandidat.createdByName && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="user" size={12} />{kandidat.createdByName}</span>}
          <span style={{ opacity: 0.7 }}>{kandidat.antallKoblinger} koblinger</span>
        </div>
      </div>

      <div>
        {kandidat.forslag.length === 0 ? (
          <div style={{ padding: "20px", fontFamily: T.ui, fontSize: 13, color: T.mut }}>Ingen automatiske match-forslag. Velg fra full liste i AgencyOS.</div>
        ) : (
          kandidat.forslag.map((f, i) => (
            <div key={f.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 10, padding: "10px 20px", borderTop: i === 0 ? "none" : `1px solid ${T.border}` }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StatusPill tone="lime">{f.sourceLabel}</StatusPill>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{f.name}</span>
                </div>
                <div style={{ marginTop: 3, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>
                  <span>{f.startDateTekst}</span>
                  {f.location && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="map-pin" size={11} />{f.location}</span>}
                  {f.tour && <span>{f.tour}</span>}
                  <span style={{ fontFamily: T.mono, fontSize: 10, opacity: 0.6 }}>score {f.score}</span>
                </div>
              </div>
              <Knapp icon={pending ? "loader" : "link-2"} onClick={() => handleMerge(f.id, f.name)} disabled={pending}>Slå sammen</Knapp>
            </div>
          ))
        )}
      </div>

      {feedback && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, borderTop: `1px solid ${T.border}`, background: `color-mix(in srgb, ${T.up} 8%, transparent)`, padding: "10px 20px", fontFamily: T.ui, fontSize: 13, color: T.fg }}>
          <Icon name="check-circle" size={16} style={{ color: T.up, flex: "none", marginTop: 1 }} />
          <span>{feedback}</span>
        </div>
      )}
      {feil && (
        <div role="alert" style={{ borderTop: `1px solid ${T.border}`, background: `color-mix(in srgb, ${T.down} 8%, transparent)`, padding: "10px 20px", fontFamily: T.ui, fontSize: 13, color: T.down }}>
          {feil}
        </div>
      )}
    </Kort>
  );
}

export function AdminTurneringerDubletterV2({ liste }: { liste: DubletterKandidatV2[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Link href="/admin/tournaments" style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, border: `1px solid ${T.border}`, background: T.panel2, padding: "6px 14px", textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <Icon name="arrow-left" size={12} />Tilbake til turneringer
        </Link>
        <div style={{ marginTop: 14 }}>
          <Caps size={9}>Turneringer</Caps>
          <Tittel em="dubletter">Vurder</Tittel>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
            {liste.length} {liste.length === 1 ? "manuell turnering" : "manuelle turneringer"} venter på vurdering. Merge når kilden matcher.
          </p>
        </div>
      </div>

      {liste.length === 0 ? (
        <Kort>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "24px 0", textAlign: "center" }}>
            <Icon name="check-circle" size={28} style={{ color: T.up }} />
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Ingen ventende <em style={{ fontStyle: "italic", color: T.lime }}>dubletter</em></div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, maxWidth: 380 }}>Når spillere legger til manuelle turneringer som matcher en kjent kilde, vises de her for vurdering.</p>
          </div>
        </Kort>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 10, border: `1px solid ${T.border}`, background: T.panel2, padding: 14 }}>
            <Icon name="info" size={16} style={{ color: T.lime, flex: "none", marginTop: 1 }} />
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
              <strong style={{ color: T.fg }}>Slik fungerer merge:</strong> Når du merger en manuell turnering inn i en kanonisk turnering, flyttes alle påmeldinger, resultater og deltakerlister automatisk. Manuell-raden blir markert som dublett og forsvinner fra hovedlista.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {liste.map((k) => <DublettKortV2 key={k.manualId} kandidat={k} />)}
          </div>
        </>
      )}
    </div>
  );
}
