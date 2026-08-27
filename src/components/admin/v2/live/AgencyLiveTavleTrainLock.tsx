"use client";

/**
 * AG-09 / AG-09b Live-tavle — Train-lock (T9, 27.08.2026).
 *
 * Fasit: `designsystem/train-lock/AG-09 Live-tavle.dc.html` (kort-grid) +
 * `AG-09b Live-tavle full.dc.html` (samme innhold, «Neste økt»-panel på
 * Mac). Artefakt, ALDRI fane — åpnes fra Cockpit/Kalender, «Lukk» går
 * tilbake dit. 3 kort side om side på Mac/iPad, stack på telefon.
 *
 * Fasitens «Rundt tavla» (Stille/I kø/Ledige plasser) er IKKE bygget her —
 * ingen av de tre tallene finnes som ekte data i dag (ingen kapasitets-
 * modell for simulator-/range-plasser, ingen godkjenningskø koblet til
 * live-økter). Kun ekte felt vises: økter i gang + neste planlagte økt.
 * Se docs/natt/T9-DONE.md.
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { MasterDetalj, TlCaps, TlInspektorBlokk, TlInspektorLinje, TlInspektorpanel, TlTomTilstand } from "../oppsett/tl-kit";
import type { LiveTavleData } from "@/lib/agencyos/live-tavle-data";

function tidLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

function LiveKort({ kort }: { kort: LiveTavleData["iOkt"][number] }) {
  const pct = Math.round(kort.fremdrift * 100);
  return (
    <Link
      href={`/admin/agencyos/live/${kort.id}`}
      style={{
        display: "block",
        background: TL.elev,
        borderRadius: TL.radius.card,
        padding: 20,
        textDecoration: "none",
        color: "inherit",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <TlCaps>{kort.tag}</TlCaps>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: TL.track.capsSm,
            textTransform: "uppercase",
            color: TL.mute,
            whiteSpace: "nowrap",
          }}
        >
          I økt
        </span>
      </div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: TL.avatar,
            color: TL.onAvatar,
            fontSize: 12,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {kort.spillerInitialer}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: TL.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {kort.spillerNavn}
          </div>
          <div style={{ marginTop: 2, fontSize: 13, color: TL.mute, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {kort.tittel}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: TL.text, fontVariantNumeric: "tabular-nums" }}>
        {kort.minutterIgjen}{" "}
        <span style={{ fontSize: 13, fontWeight: 400, color: TL.mute, letterSpacing: 0 }}>min igjen</span>
      </div>
      <div style={{ marginTop: 12, height: 3, borderRadius: 2, background: TL.dim, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: TL.text }} />
      </div>
    </Link>
  );
}

function RundtTavlaPanel({ data }: { data: LiveTavleData }) {
  return (
    <TlInspektorpanel tittel="Rundt tavla" ariaLabel="Rundt tavla">
      <TlInspektorBlokk label="Neste økt">
        {data.nesteOkt ? (
          <TlInspektorLinje label={`${data.nesteOkt.spillerNavn} · ${data.nesteOkt.tittel}`} verdi={tidLabel(data.nesteOkt.startTime)} />
        ) : (
          <TlInspektorLinje label="Ingen flere planlagte økter i dag" verdi="—" />
        )}
      </TlInspektorBlokk>
      <p style={{ margin: 0, fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>
        Tavla er artefakt, aldri fane. Ingen kart, ingen fake video, ingen sim-booking.
      </p>
    </TlInspektorpanel>
  );
}

export function AgencyLiveTavleTrainLock({ data }: { data: LiveTavleData }) {
  const antall = data.iOkt.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
        <div>
          <TlCaps>Live · {antall === 0 ? "ingen i økt" : antall === 1 ? "1 i økt" : `${antall} i økt`}</TlCaps>
          <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>Tavle</h1>
        </div>
        <Link
          href="/admin/agencyos"
          style={{ height: 44, display: "flex", alignItems: "center", fontSize: 15, fontWeight: 600, color: TL.mute, textDecoration: "none" }}
        >
          Lukk
        </Link>
      </div>

      {antall === 0 ? (
        <div style={{ background: TL.elev, borderRadius: TL.radius.card }}>
          <TlTomTilstand icon="activity" title="Ingen økter i gang nå" sub="Spillere som trykker Start på en publisert økt dukker opp her mens de trener." />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {data.iOkt.map((k) => (
            <LiveKort key={k.id} kort={k} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AgencyLiveTavleFull({ data }: { data: LiveTavleData }) {
  return (
    <MasterDetalj panel={<RundtTavlaPanel data={data} />}>
      <AgencyLiveTavleTrainLock data={data} />
    </MasterDetalj>
  );
}
