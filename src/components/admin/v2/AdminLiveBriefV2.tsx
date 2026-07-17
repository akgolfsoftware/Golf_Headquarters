"use client";

/**
 * AgencyOS · Live-brief — v2 (retning C «Presis»). Coachens før-økt-visning
 * for en TrainingSessionV2: gjennomgang av sted/fokus + kommentar til
 * spilleren, deretter Start-CTA. Rekomponert fra Claude Design
 * ui_kits/v2/agencyos-drift.jsx sin LiveBrief (16. juli 2026-port).
 *
 * Ærlighet: viser kun ekte data (økt-felt + tidligere sendt coach-kommentar).
 * Mockupens «forrige økt»/SG-trend/ACWR-kort er IKKE tatt med her — de har
 * ingen reell datakilde koblet til denne siden ennå.
 */

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { T, type AkseKey } from "@/lib/v2/tokens";
import { Caps, Tittel, AkseChip, Kort, CTAPill, Knapp, TekstOmraade } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { sendBriefTilSpiller } from "@/app/admin/(legacy)/live/[sessionId]/brief/actions";

function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

export type AdminLiveBriefV2Data = {
  sessionId: string;
  tittel: string;
  spillerNavn: string | null;
  spillerHref: string;
  akse: AkseKey;
  stedLabel: string;
  praksisLabel: string;
  tidLabel: string;
  notater: string | null;
  initialMelding: string;
  aktivHref: string;
};

export function AdminLiveBriefV2({ data }: { data: AdminLiveBriefV2Data }) {
  const mobile = useMobile();
  const [melding, setMelding] = useState(data.initialMelding);
  const [sendt, setSendt] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function håndterSend() {
    const trimmet = melding.trim();
    if (!trimmet) {
      setFeil("Skriv en kommentar først");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      const res = await sendBriefTilSpiller(data.sessionId, trimmet);
      if (!res.ok) setFeil(res.error);
      else setSendt(true);
    });
  }

  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>Før økt · {data.spillerNavn ? <Link href={data.spillerHref} style={{ color: "inherit" }}>{data.spillerNavn}</Link> : "Spiller"}</Caps>
        <div style={{ marginTop: 10 }}><Tittel mobile={mobile}>{data.tittel}</Tittel></div>
        <div style={{ marginTop: 8, fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>
          {data.stedLabel} · {data.praksisLabel} · {data.tidLabel}
        </div>
      </div>
      <AkseChip a={data.akse} />
    </div>
  );

  const notaterKort = data.notater ? (
    <Kort eyebrow="Notater">
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: 0 }}>{data.notater}</p>
    </Kort>
  ) : null;

  const kommentarKort = (
    <Kort eyebrow="Kommentar til spilleren">
      <TekstOmraade
        label={null}
        value={melding}
        rows={4}
        placeholder="Skriv en kommentar eller fokuspunkt før økten starter…"
        onChange={(v) => { setMelding(v); setSendt(false); }}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, gap: 10 }}>
        <span style={{ fontFamily: T.ui, fontSize: 11, color: T.mut }}>Vises til spiller i brief-skjermen</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {feil && <span style={{ fontFamily: T.ui, fontSize: 11, color: T.down }}>{feil}</span>}
          {sendt && !isPending && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.ui, fontSize: 11, color: T.up }}>
              <Icon name="check" size={12} />Sendt
            </span>
          )}
          <Knapp icon="send" disabled={isPending} onClick={håndterSend}>Send til spiller</Knapp>
        </div>
      </div>
    </Kort>
  );

  const start = (
    <Link href={data.aktivHref} style={{ display: "contents" }}>
      <CTAPill icon="play" full={mobile}>Start live-monitoring</CTAPill>
    </Link>
  );

  if (mobile) {
    return <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>{hode}{kommentarKort}{notaterKort}{start}</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: T.gap, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>{kommentarKort}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>{notaterKort}{start}</div>
      </div>
    </div>
  );
}
