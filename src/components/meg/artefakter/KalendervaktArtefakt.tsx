"use client";

/**
 * Kalendervakten-artefaktet — avvik i kalenderen (konflikt/reisetid/varsel).
 * Fasit: jarvis/meg-kalendervakt.html (avvikskort med diff-blokk «for → etter»,
 * --info som identitetsfarge, Godkjenn fiks/Avvis, «Godkjenn alle»-footer).
 *
 * Detektoren er ekte: src/lib/jarvis/kalendervakt.ts finner KONFLIKT
 * (dobbeltbooking) og REISETID (rygg-mot-rygg på to ulike steder) i neste
 * 7 dagers kalenderhendelser hver gang /meg lastes — se repository.ts sin
 * hentAvvik(). Bevisste avvik fra fasiten (ærlig-tomme-tilstander-prinsippet,
 * samme som Maskinrommet i PR #547): VARSEL-typen detekteres ikke
 * (KalenderHendelse bærer ikke reminder-data), REISETID oppgir aldri et
 * minuttall for reisen (ingen rutetjeneste finnes), og Godkjenn-fiks/Avvis-
 * handlingene fra fasiten er ikke bygget — det finnes ingen persistens for
 * Avvik å skrive et vedtak til, så knappene ville vært uten virkning.
 * Avvik uten ærlig forslag har etter === "" og viser da ingen diff-blokk.
 */
import { TL } from "@/lib/v2/train-lock";

import { Icon } from "@/components/v2/icon";
import type { Avvik } from "@/lib/jarvis/types";

const TYPE_LABEL: Record<Avvik["type"], string> = {
  KONFLIKT: "Konflikt",
  REISETID: "Manglende reisetid",
  VARSEL: "Uten varsel",
};

const TYPE_IKON: Record<Avvik["type"], string> = {
  KONFLIKT: "triangle-alert",
  REISETID: "clock",
  VARSEL: "bell",
};

function AvvikKort({ avvik }: { avvik: Avvik }) {
  return (
    <div
      data-od-id={`panel-avvik-${avvik.id}`}
      style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, padding: 14 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: TL.font.mono,
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: TL.viz.target,
          marginBottom: 8,
        }}
      >
        <Icon name={TYPE_IKON[avvik.type]} size={13} strokeWidth={1.8} />
        {TYPE_LABEL[avvik.type]}
      </div>
      <h3 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, color: TL.text }}>
        {avvik.tittel}
      </h3>
      <p style={{ margin: "0 0 10px", fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, maxWidth: "52ch" }}>
        {avvik.forklaring}
      </p>
      {avvik.etter !== "" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 6,
            alignItems: "center",
            background: TL.dock,
            border: `1px solid ${TL.hair}`,
            borderRadius: TL.radius.field,
            padding: 10,
            fontFamily: TL.font.mono,
            fontSize: 11.5,
          }}
        >
          <span
            style={{
              gridColumn: "1 / -1",
              fontSize: 9,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            Foreslått fiks
          </span>
          <span style={{ color: TL.mute, textDecoration: "line-through" }}>{avvik.for}</span>
          <span style={{ color: TL.mute }}>→</span>
          <span style={{ color: TL.text, fontWeight: 600 }}>{avvik.etter}</span>
        </div>
      )}
    </div>
  );
}

export function KalendervaktArtefakt({ avvik }: { avvik: Avvik[] }) {
  return (
    <div data-od-id="panel-kalendervakt" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.ok, fontWeight: 600 }}>
        {avvik.length} avvik · neste 7 dager
      </div>

      {avvik.length === 0 ? (
        <div
          data-od-id="state-vakt-ren"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            textAlign: "center",
            padding: "40px 24px",
            background: TL.dock,
            border: `1px dashed ${TL.hair}`,
            borderRadius: TL.radius.card,
          }}
        >
          <Icon name="shield-check" size={22} strokeWidth={1.6} style={{ color: TL.ok }} />
          <h3 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, color: TL.text }}>
            Ren de neste 7 dagene
          </h3>
          <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, maxWidth: "38ch" }}>
            Ingen konflikter og ingen rygg-mot-rygg-avtaler uten reisetid. Vakten sjekker de neste 7 dagene
            hver gang du åpner /meg.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {avvik.map((a) => (
            <AvvikKort key={a.id} avvik={a} />
          ))}
        </div>
      )}
    </div>
  );
}
