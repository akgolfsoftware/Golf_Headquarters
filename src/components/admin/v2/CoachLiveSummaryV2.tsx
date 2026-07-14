"use client";

/**
 * AgencyOS v2 — Live-økt sammendrag, coach (`/admin/live/[sessionId]/summary`,
 * AgencyOS Bølge 1.3, 2026-07-14). Port fra `(legacy)/live/[sessionId]/summary/
 * page.tsx` + `_coach-summary-form.tsx` — samme `lagreCoachVurdering`-kontrakt.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, T } from "@/components/v2";
import { TekstOmraade } from "@/components/v2/skjema";
import { lagreCoachVurdering } from "@/app/admin/(legacy)/live/[sessionId]/summary/actions";

export interface CoachLiveSummaryV2Data {
  sessionId: string;
  spiller: { id: string; name: string } | null;
  title: string;
  startTid: string;
  miljoLabel: string;
  practiceLabel: string;
  initialRating: number | null;
  initialNotat: string;
}

export function CoachLiveSummaryV2({ sessionId, spiller, title, startTid, miljoLabel, practiceLabel, initialRating, initialNotat }: CoachLiveSummaryV2Data) {
  const [rating, setRating] = useState(initialRating ?? 0);
  const [notat, setNotat] = useState(initialNotat);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);
  const [pending, startTransition] = useTransition();
  const spillerHref = spiller ? `/admin/spillere/${spiller.id}` : "/admin/agencyos";

  const lagre = () => {
    if (rating < 1) { setFeil("Velg en vurdering (1–5)"); return; }
    setFeil(null);
    setLagret(false);
    startTransition(async () => {
      const res = await lagreCoachVurdering(sessionId, rating, notat);
      if (!res.ok) setFeil(res.error); else setLagret(true);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 640 }}>
      <Link href={spillerHref} style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <Icon name="arrow-left" size={12} /> Tilbake til {spiller?.name ?? "spiller"}
      </Link>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="check-circle" size={16} style={{ color: T.up }} />
          <Caps size={9}>Coach · Økt fullført</Caps>
        </div>
        <Tittel>{title} — sammendrag</Tittel>
        <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4 }}>{startTid}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        <Kort style={{ textAlign: "center" }}>
          <Caps size={9}>Miljø</Caps>
          <div style={{ marginTop: 8, fontFamily: T.ui, fontWeight: 600, fontSize: 13.5, color: T.fg }}>{miljoLabel}</div>
        </Kort>
        <Kort style={{ textAlign: "center" }}>
          <Caps size={9}>Økttype</Caps>
          <div style={{ marginTop: 8, fontFamily: T.ui, fontWeight: 600, fontSize: 13.5, color: T.fg }}>{practiceLabel}</div>
        </Kort>
        <Kort style={{ textAlign: "center" }}>
          <Caps size={9}>Status</Caps>
          <div style={{ marginTop: 8 }}><StatusPill tone="up">Fullført</StatusPill></div>
        </Kort>
      </div>

      <Kort eyebrow="Coach-vurdering">
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5].map((n) => {
            const valgt = rating >= n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => { setRating(n); setLagret(false); }}
                disabled={pending}
                aria-pressed={valgt}
                aria-label={`${n} av 5`}
                style={{
                  appearance: "none", cursor: "pointer", width: 34, height: 34, borderRadius: 9,
                  border: `1px solid ${valgt ? "transparent" : T.borderS}`,
                  background: valgt ? T.lime : T.panel2, color: valgt ? T.onLime : T.fg2,
                  fontFamily: T.mono, fontSize: 13, fontWeight: 700,
                }}
              >
                {n}
              </button>
            );
          })}
          <span style={{ marginLeft: 6, fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>Økt-kvalitet (1–5)</span>
        </div>

        <div style={{ marginTop: 16 }}>
          <TekstOmraade label="Coach-notat" value={notat} onChange={(v) => { setNotat(v); setLagret(false); }} rows={4} placeholder="Observasjoner, fremgang, fokus til neste økt …" />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
          {feil && <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.down }}>{feil}</span>}
          {lagret && !pending && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.ui, fontSize: 11.5, color: T.up }}><Icon name="check" size={13} /> Lagret</span>}
          <Knapp icon="check" onClick={lagre} disabled={pending}>{pending ? "Lagrer…" : "Lagre vurdering"}</Knapp>
        </div>
      </Kort>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href={spillerHref} style={{ flex: 1, textDecoration: "none", minWidth: 160 }}>
          <Knapp ghost full>Til spillerprofil</Knapp>
        </Link>
        <Link href="/admin/agencyos" style={{ flex: 1, textDecoration: "none", minWidth: 160 }}>
          <Knapp full>Tilbake til AgencyOS</Knapp>
        </Link>
      </div>
    </div>
  );
}
