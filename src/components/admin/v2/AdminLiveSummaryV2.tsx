"use client";

/**
 * AgencyOS · Live-summary — v2 (retning C «Presis»). Coachens post-økt-
 * sammendrag for en fullført TrainingSessionV2: recap-KPI-er, drill-liste,
 * og skjema for kvalitetsvurdering + notat. Rekomponert fra Claude Design
 * ui_kits/v2/agencyos-drift.jsx sin LiveSummary (16. juli 2026-port).
 *
 * Ærlighet: «RPE» i mockupen er ikke en reell målt verdi i denne appen —
 * erstattet med Varighet (fra completedSummary.liveSummary, samme kilde
 * spillerens egen Summary-skjerm bruker).
 */

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { T, type AkseKey } from "@/lib/v2/tokens";
import { Caps, Tittel, StatusPill, KpiFlis, Kort, CTAPill, Knapp, TekstOmraade, AkseChip } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import { lagreCoachVurdering } from "@/app/admin/(legacy)/live/[sessionId]/summary/actions";

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

export type AdminLiveSummaryDrill = { id: string; navn: string; logget: boolean };

export type AdminLiveSummaryV2Data = {
  sessionId: string;
  tittel: string;
  spillerNavn: string | null;
  spillerHref: string;
  akse: AkseKey;
  varighetLabel: string;
  drills: AdminLiveSummaryDrill[];
  initialRating: number | null;
  initialNotat: string;
};

export function AdminLiveSummaryV2({ data }: { data: AdminLiveSummaryV2Data }) {
  const mobile = useMobile();
  const [rating, setRating] = useState(data.initialRating ?? 0);
  const [notat, setNotat] = useState(data.initialNotat);
  const [lagret, setLagret] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function håndterLagre() {
    if (rating < 1) {
      setFeil("Velg en vurdering (1–5)");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      const res = await lagreCoachVurdering(data.sessionId, rating, notat);
      if (!res.ok) setFeil(res.error);
      else setLagret(true);
    });
  }

  const loggetCount = data.drills.filter((d) => d.logget).length;

  const hode = (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
      <div>
        <Caps>Fullført · {data.spillerNavn ? <Link href={data.spillerHref} style={{ color: "inherit" }}>{data.spillerNavn}</Link> : "Spiller"}</Caps>
        <div style={{ marginTop: 10 }}><Tittel mobile={mobile}>{data.tittel} — sammendrag</Tittel></div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <AkseChip a={data.akse} />
        <StatusPill tone="lime">Ferdig</StatusPill>
      </div>
    </div>
  );

  const kpi = (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: T.gap }}>
      <KpiFlis label="Drills fullført" value={`${loggetCount}/${data.drills.length}`} />
      <KpiFlis label="Varighet" value={data.varighetLabel} />
      <KpiFlis label="Kvalitet (1–5)" value={data.initialRating != null ? String(data.initialRating) : "–"} />
    </div>
  );

  const drillliste = (
    <Kort eyebrow="Drills">
      {data.drills.length === 0 && (
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0 }}>Ingen drills registrert på økta.</p>
      )}
      {data.drills.map((d, i) => (
        <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i === data.drills.length - 1 ? "none" : `1px solid ${T.border}` }}>
          <Icon name={d.logget ? "check-circle" : "circle"} size={14} style={{ color: d.logget ? T.up : T.warn, flex: "none" }} />
          <span style={{ flex: 1, fontFamily: T.ui, fontSize: 12.5, color: T.fg }}>{d.navn}</span>
          <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: d.logget ? T.up : T.warn, textTransform: "uppercase" }}>
            {d.logget ? "logget" : "ikke logget"}
          </span>
        </div>
      ))}
    </Kort>
  );

  const vurderingKort = (
    <Kort eyebrow="Coach-vurdering">
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const valgt = rating >= n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => { setRating(n); setLagret(false); }}
              disabled={isPending}
              aria-pressed={valgt}
              aria-label={`${n} av 5`}
              style={{
                width: 34, height: 34, borderRadius: 9999, cursor: "pointer",
                fontFamily: T.mono, fontWeight: 700, fontSize: 13,
                background: valgt ? T.lime : T.panel2,
                border: `1px solid ${valgt ? T.lime : T.border}`,
                color: valgt ? T.onLime : T.fg2,
                opacity: isPending ? 0.6 : 1,
              }}
            >
              {n}
            </button>
          );
        })}
        <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginLeft: 4 }}>Økt-kvalitet</span>
      </div>
      <div style={{ marginTop: 14 }}>
        <TekstOmraade
          label="Coach-notat"
          value={notat}
          rows={4}
          placeholder="Observasjoner, fremgang, fokus til neste økt…"
          onChange={(v) => { setNotat(v); setLagret(false); }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
        {feil && <span style={{ fontFamily: T.ui, fontSize: 11, color: T.down }}>{feil}</span>}
        {lagret && !isPending && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.ui, fontSize: 11, color: T.up }}>
            <Icon name="check" size={12} />Lagret
          </span>
        )}
        <Knapp icon="check" disabled={isPending} onClick={håndterLagre}>Lagre vurdering</Knapp>
      </div>
    </Kort>
  );

  const navigasjon = (
    <div style={{ display: "flex", gap: 10 }}>
      <Link href={data.spillerHref} style={{ flex: 1 }}>
        <CTAPill ghost full icon="user">Til spillerprofil</CTAPill>
      </Link>
      <Link href="/admin/agencyos" style={{ flex: 1 }}>
        <CTAPill full icon="arrow-right">Tilbake til AgencyOS</CTAPill>
      </Link>
    </div>
  );

  if (mobile) {
    return <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>{hode}{kpi}{drillliste}{vurderingKort}{navigasjon}</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {hode}{kpi}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: T.gap, alignItems: "start" }}>
        {drillliste}
        <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>{vurderingKort}</div>
      </div>
      {navigasjon}
    </div>
  );
}
