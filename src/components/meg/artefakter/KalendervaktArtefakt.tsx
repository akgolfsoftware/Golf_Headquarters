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
import { T } from "@/lib/v2/tokens";
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
      style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rTag, padding: 14 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: T.info,
          marginBottom: 8,
        }}
      >
        <Icon name={TYPE_IKON[avvik.type]} size={13} strokeWidth={1.8} />
        {TYPE_LABEL[avvik.type]}
      </div>
      <h3 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 14, fontWeight: 600, color: T.fg }}>
        {avvik.tittel}
      </h3>
      <p style={{ margin: "0 0 10px", fontFamily: T.ui, fontSize: 13, color: T.mut, maxWidth: "52ch" }}>
        {avvik.forklaring}
      </p>
      {avvik.etter !== "" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 6,
            alignItems: "center",
            background: T.panel2,
            border: `1px solid ${T.border}`,
            borderRadius: T.rInput,
            padding: 10,
            fontFamily: T.mono,
            fontSize: 11.5,
          }}
        >
          <span
            style={{
              gridColumn: "1 / -1",
              fontSize: 9,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: T.mut,
            }}
          >
            Foreslått fiks
          </span>
          <span style={{ color: T.mut, textDecoration: "line-through" }}>{avvik.for}</span>
          <span style={{ color: T.mut }}>→</span>
          <span style={{ color: T.fg, fontWeight: 600 }}>{avvik.etter}</span>
        </div>
      )}
    </div>
  );
}

export function KalendervaktArtefakt({ avvik }: { avvik: Avvik[] }) {
  return (
    <div data-od-id="panel-kalendervakt" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.up, fontWeight: 600 }}>
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
            background: T.panel2,
            border: `1px dashed ${T.border}`,
            borderRadius: T.rCard,
          }}
        >
          <Icon name="shield-check" size={22} strokeWidth={1.6} style={{ color: T.up }} />
          <h3 style={{ margin: 0, fontFamily: T.disp, fontSize: 14, fontWeight: 600, color: T.fg }}>
            Ren de neste 7 dagene
          </h3>
          <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut, maxWidth: "38ch" }}>
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
