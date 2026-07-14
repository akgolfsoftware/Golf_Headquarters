"use client";

/**
 * AgencyOS v2 — Live-økt brief, coach (`/admin/live/[sessionId]/brief`,
 * AgencyOS Bølge 1.3, 2026-07-14). Port fra `(legacy)/live/[sessionId]/brief/
 * page.tsx` + `_brief-send.tsx` — samme `sendBriefTilSpiller`-kontrakt.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { Caps, Tittel, Kort, Knapp, Icon, T } from "@/components/v2";
import { TekstOmraade } from "@/components/v2/skjema";
import { sendBriefTilSpiller } from "@/app/admin/(legacy)/live/[sessionId]/brief/actions";

export interface CoachLiveBriefV2Data {
  sessionId: string;
  spiller: { id: string; name: string } | null;
  title: string;
  miljoLabel: string;
  practiceLabel: string;
  startTid: string;
  sluttTid: string;
  notes: string | null;
  initialBrief: string;
}

export function CoachLiveBriefV2({ sessionId, spiller, title, miljoLabel, practiceLabel, startTid, sluttTid, notes, initialBrief }: CoachLiveBriefV2Data) {
  const [melding, setMelding] = useState(initialBrief);
  const [feil, setFeil] = useState<string | null>(null);
  const [sendt, setSendt] = useState(false);
  const [pending, startTransition] = useTransition();

  const send = () => {
    const trimmet = melding.trim();
    if (!trimmet) { setFeil("Skriv en kommentar først"); return; }
    setFeil(null);
    setSendt(false);
    startTransition(async () => {
      const res = await sendBriefTilSpiller(sessionId, trimmet);
      if (!res.ok) setFeil(res.error); else setSendt(true);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 640 }}>
      <Link href={spiller ? `/admin/spillere/${spiller.id}` : "/admin/agencyos"} style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <Icon name="arrow-left" size={12} /> {spiller?.name ?? "Spiller"}
      </Link>

      <div>
        <Caps size={9}>Coach · Live-brief</Caps>
        <Tittel>{title}</Tittel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 8, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="target" size={13} /> {miljoLabel} · {practiceLabel}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="clock" size={13} /> {startTid} – {sluttTid}</span>
        </div>
      </div>

      {notes && (
        <Kort eyebrow="Notater">
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg, margin: 0 }}>{notes}</p>
        </Kort>
      )}

      <Kort eyebrow="Coach-kommentar til spilleren">
        <TekstOmraade label={null} value={melding} onChange={(v) => { setMelding(v); setSendt(false); }} rows={4} placeholder="Skriv en kommentar eller fokuspunkt til spilleren før økten starter …" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12 }}>
          <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>Vises til spiller i brief-skjermen</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {feil && <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.down }}>{feil}</span>}
            {sendt && !pending && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.ui, fontSize: 11.5, color: T.up }}><Icon name="check" size={13} /> Sendt</span>}
            <Knapp icon="send" onClick={send} disabled={pending}>{pending ? "Sender…" : "Send til spiller"}</Knapp>
          </div>
        </div>
      </Kort>

      <Link href={`/admin/live/${sessionId}/active`} style={{ textDecoration: "none" }}>
        <Knapp icon="arrow-right" full>Start live-monitoring</Knapp>
      </Link>
    </div>
  );
}
