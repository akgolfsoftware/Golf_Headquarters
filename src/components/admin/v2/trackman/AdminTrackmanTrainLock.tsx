"use client";

/**
 * TM-06 Agency TrackMan (+ TM-10 tom/agency-preview-mønster) — Train-lock,
 * T9 27.08.2026.
 *
 * Fasit: `designsystem/train-lock/TM-06 Agency TrackMan.dc.html` (featured
 * plot-kort + stall-liste med kilde-tag) og `TM-10 Tom og agency-preview.dc.html`
 * (tom tilstand, og kart-forhåndsvisning 72 px i rad — se `DispersionThumb`).
 * «Simulator som bookbar ressurs: nei» — ingen booking-kobling her, kun
 * lesning av allerede-registrerte TrackMan-økter.
 *
 * TM-06c sin fulle Mac-tabell (ni kolonner) er IKKE gjenskapt kolonne for
 * kolonne — stall-listen bruker ett radformat på alle bredder (kart +
 * spiller/kølle + median/smash/side + kilde), som dekker samme informasjon
 * uten en egen desktop-only tabell-layout. Se docs/natt/T9-DONE.md.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { DispersionThumb } from "@/components/trackman/DispersionThumb";
import { TlCaps, TlInspektorKpi, TlTomTilstand } from "../oppsett/tl-kit";
import type { AgencyTrackmanData, FeaturedKort, StallRad } from "@/lib/trackman/agency-stall-data";

function komma(v: number | null, d: number): string {
  if (v == null) return "—";
  return v.toFixed(d).replace(".", ",");
}

function sideTekst(v: number | null): string {
  if (v == null) return "—";
  return `${v > 0 ? "+" : ""}${komma(v, 1)} m`;
}

function FeaturedCard({ kort }: { kort: FeaturedKort }) {
  return (
    <Link
      href={`/admin/trackman/${kort.sessionId}`}
      style={{
        display: "block",
        background: TL.elev,
        borderRadius: TL.radius.card,
        padding: "16px 18px",
        textDecoration: "none",
        color: "inherit",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <TlCaps>
          {kort.spillerNavn} · {kort.kolle}
        </TlCaps>
        <span style={{ fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
          {kort.datoLabel} · {kort.kildeLabel}
        </span>
      </div>
      <div style={{ marginTop: 10 }}>
        <DispersionThumb points={kort.result.shots.map((s) => s.point)} width={230} height={150} />
      </div>
      <div style={{ marginTop: 10, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
        {komma(kort.result.medianCarry, 0)} m · {komma(kort.result.meanSmash, 2)} · {sideTekst(kort.result.offlineBias)}
        {kort.result.hasEllipse ? ` · ${komma(kort.result.oneSigmaRadius, 1)} m` : ""}
      </div>
      <div style={{ marginTop: 6, fontSize: 15, fontWeight: 600, color: TL.text, lineHeight: 1.4 }}>{kort.caddieSentence}</div>
    </Link>
  );
}

function StallListeRad({ rad, last }: { rad: StallRad; last: boolean }) {
  const { result } = rad;
  return (
    <Link
      href={`/admin/trackman/${rad.sessionId}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 0",
        borderBottom: last ? "none" : `1px solid ${TL.hair}`,
        textDecoration: "none",
        color: "inherit",
        minWidth: 0,
      }}
    >
      <DispersionThumb points={result.shots.map((s) => s.point)} width={72} height={46} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: TL.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {rad.spillerNavn}
        </div>
        <div style={{ marginTop: 2, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
          {rad.kolle} · {result.n} slag · {rad.datoLabel}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
        <div style={{ color: TL.text, fontWeight: 600 }}>{komma(result.medianCarry, 0)} m</div>
        <div style={{ marginTop: 2 }}>
          {komma(result.meanSmash, 2)} · {sideTekst(result.offlineBias)}
        </div>
      </div>
      <span
        style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: TL.track.capsSm,
          textTransform: "uppercase",
          color: TL.mute,
          flexShrink: 0,
        }}
      >
        {rad.kildeLabel}
      </span>
    </Link>
  );
}

export function AdminTrackmanTrainLock({ data }: { data: AgencyTrackmanData }) {
  const harData = data.rader.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
      <div>
        <TlCaps>Academy · stallen</TlCaps>
        <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>TrackMan</h1>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: TL.mute }}>
          {data.rader.length} {data.rader.length === 1 ? "økt" : "økter"} · {data.antallSpillere}{" "}
          {data.antallSpillere === 1 ? "spiller" : "spillere"} · simulator som bookbar ressurs: nei
        </p>
      </div>

      {!harData ? (
        <div style={{ background: TL.elev, borderRadius: TL.radius.card }}>
          <TlTomTilstand
            icon="crosshair"
            title="Ingen TrackMan-økter registrert ennå"
            sub="Økter dukker opp her når spillere importerer TrackMan-data, eller når coach registrerer en økt."
          />
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
            {data.kpis.map((k) => (
              <TlInspektorKpi key={k.label} label={k.label} verdi={k.value} sub="" />
            ))}
          </div>

          {data.featured.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              {data.featured.map((k) => (
                <FeaturedCard key={k.sessionId} kort={k} />
              ))}
            </div>
          )}

          <div>
            <TlCaps>Stallen · siste økter</TlCaps>
            <div style={{ marginTop: 10, background: TL.elev, borderRadius: TL.radius.card, padding: "4px 20px" }}>
              {data.rader.map((r, i) => (
                <StallListeRad key={r.sessionId} rad={r} last={i === data.rader.length - 1} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
