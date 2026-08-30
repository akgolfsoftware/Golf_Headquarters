/**
 * Rutiner — gjentakende arbeid, gruppert på frekvens (MASTERPLAN 15.2,
 * beslutning 6.6, Anders 30.08.2026).
 *
 * Merkelappen «Kan automatiseres» / «Må gjøres fysisk» er hele poenget med
 * flaten: Anders skal se hva en agent kan overta og hva som krever et
 * menneske på stedet. Uten den er dette bare enda en oppgaveliste.
 *
 * «Kan automatiseres» bruker TL.warn — den er et varsel om ubrukt potensial,
 * ikke en fullført-tilstand. TL.ok er reservert godkjent-av-coach, og
 * TL.warm er fullført (CLAUDE.md invariant 2).
 *
 * Server-komponent: ren presentasjon, ingen interaktivitet ennå.
 */

import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { TlCaps } from "@/components/admin/v2/godkjenninger/tl-inspektor";
import { TlRadGruppe, TlTomTilstand } from "@/components/admin/v2/oppsett/tl-kit";
import {
  RUTINE_FREKVENSER,
  automatiseringLabel,
  frekvensLabel,
} from "@/lib/admin/oppgaver/faner";
import type { RutineRad } from "@/lib/admin/oppgaver/lastere";

function sistUtfortTekst(d: Date | null): string {
  if (!d) return "aldri utført";
  const dager = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (dager <= 0) return "i dag";
  if (dager === 1) return "i går";
  return `${dager} dg siden`;
}

function Merke({ automatiserbar }: { automatiserbar: boolean }) {
  return (
    <span
      style={{
        flex: "none",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: automatiserbar ? TL.warn : TL.mute,
        boxShadow: `inset 0 0 0 1px ${automatiserbar ? TL.warnHair : TL.hair}`,
        borderRadius: 999,
        padding: "3px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {automatiseringLabel(automatiserbar)}
    </span>
  );
}

export function RutinerListe({ rutiner }: { rutiner: RutineRad[] }) {
  if (rutiner.length === 0) {
    return (
      <TlRadGruppe>
        <TlTomTilstand
          icon="repeat"
          title="Ingen rutiner ennå"
          sub="Rutiner er arbeidet som kommer tilbake — «rydd driving range», «ballplukking torsdag», «lønnssjekkliste den 3.». Hver rutine merkes med om en agent kan overta den, eller om den krever noen fysisk til stede."
        />
      </TlRadGruppe>
    );
  }

  const kanAutomatiseres = rutiner.filter((r) => r.automatiserbar).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: TL.font.mono,
            fontSize: 22,
            fontWeight: 600,
            color: TL.text,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {rutiner.length}
        </span>
        <TlCaps size={10}>
          {rutiner.length === 1 ? "fast rutine" : "faste rutiner"}
        </TlCaps>
        {kanAutomatiseres > 0 && (
          <span style={{ marginLeft: "auto", fontSize: 12.5, color: TL.mute }}>
            {kanAutomatiseres} kan en agent overta
          </span>
        )}
      </div>

      {RUTINE_FREKVENSER.map((f) => {
        const gruppe = rutiner.filter((r) => r.frekvens === f);
        if (gruppe.length === 0) return null;
        return (
          <div key={f}>
            <TlCaps size={10}>{frekvensLabel(f)}</TlCaps>
            <div
              style={{
                marginTop: 8,
                background: TL.elev,
                borderRadius: TL.radius.card,
                padding: "4px 20px",
              }}
            >
              {gruppe.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "14px 0",
                    borderTop: i === 0 ? undefined : `1px solid ${TL.hair}`,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>{r.tittel}</div>
                    <div style={{ marginTop: 3, fontSize: 12.5, color: TL.mute, lineHeight: 1.45 }}>
                      {[r.naar, r.detalj].filter(Boolean).join(" · ") || frekvensLabel(r.frekvens)}
                    </div>
                  </div>
                  <Merke automatiserbar={r.automatiserbar} />
                  <span
                    style={{
                      flex: "none",
                      width: 92,
                      textAlign: "right",
                      fontSize: 12.5,
                      color: TL.mute,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {sistUtfortTekst(r.sistUtfort)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Rutiner som ikke har en av de tre kjente frekvensene skal aldri
          forsvinne stille — de vises som de er. */}
      {(() => {
        const ukjent = rutiner.filter(
          (r) => !(RUTINE_FREKVENSER as readonly string[]).includes(r.frekvens),
        );
        if (ukjent.length === 0) return null;
        return (
          <div>
            <TlCaps size={10}>Annen frekvens</TlCaps>
            <div
              style={{
                marginTop: 8,
                background: TL.elev,
                borderRadius: TL.radius.card,
                padding: "4px 20px",
              }}
            >
              {ukjent.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 0",
                    borderTop: i === 0 ? undefined : `1px solid ${TL.hair}`,
                  }}
                >
                  <Icon name="alert-triangle" size={14} style={{ color: TL.mute, flex: "none" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>{r.tittel}</div>
                    <div style={{ marginTop: 3, fontSize: 12.5, color: TL.mute }}>
                      Frekvens «{r.frekvens}» er ikke en av daglig/ukentlig/månedlig
                    </div>
                  </div>
                  <Merke automatiserbar={r.automatiserbar} />
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
