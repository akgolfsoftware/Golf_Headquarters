"use client";

/**
 * Spillerens egen turneringshistorikk.
 *
 * Anders 2026-08-30: spillerens «hvor står jeg» = egen utvikling + egne
 * turneringsresultater. Dette er den andre halvdelen, og den er delt mellom
 * spillerflaten (/portal/analysere/turneringer) og coach-speilet, så tallene
 * aldri kan begynne å sprike mellom dem.
 *
 * TruthLayer: plassering som ikke er registrert vises som «—». En turnering
 * spilleren trakk seg fra eller ble cuttet i får statusen sin i stedet for et
 * tall — den har ikke en plassering, og skal ikke se ut som den har det.
 * Sammendraget oppgir hvor mange turneringer beste plassering bygger på.
 */

import { Caps, Kort, TomTilstand } from "@/components/v2";
import { TL } from "@/lib/v2/train-lock";
import type { Turneringshistorikk } from "@/lib/domain/turneringshistorikk";

const MND = ["jan.", "feb.", "mar.", "apr.", "mai", "jun.", "jul.", "aug.", "sep.", "okt.", "nov.", "des."];

function kortDato(d: Date): string {
  return `${d.getDate()}. ${MND[d.getMonth()]}`;
}

const UTEN_RESULTAT: Record<string, string> = {
  WITHDREW: "trakk seg",
  CUT: "cut",
  REGISTERED: "påmeldt",
};

const tallStil = {
  fontFamily: TL.font.mono,
  fontSize: 26,
  fontWeight: 600,
  color: TL.text,
  fontVariantNumeric: "tabular-nums" as const,
};

export function TurneringshistorikkTrainLock({
  h,
  mobile = false,
}: {
  h: Turneringshistorikk;
  mobile?: boolean;
}) {
  if (!h.harHistorikk) {
    return (
      <Kort>
        <TomTilstand icon="trophy" title="Ingen turneringer å vise" sub={h.tomGrunn} />
      </Kort>
    );
  }

  const spenn = h.spennFra === h.spennTil ? `${h.spennTil}` : `${h.spennFra}–${h.spennTil}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Kort eyebrow="Din turneringshistorikk">
        <div style={{ display: "flex", gap: mobile ? 20 : 34, flexWrap: "wrap" }}>
          <div>
            <div style={tallStil}>{h.antall}</div>
            <Caps>{h.antall === 1 ? "turnering" : "turneringer"}</Caps>
          </div>
          <div>
            <div style={tallStil}>{spenn}</div>
            <Caps>sesonger</Caps>
          </div>
          <div>
            <div style={tallStil}>{h.bestePlassering != null ? `${h.bestePlassering}.` : "—"}</div>
            <Caps>beste plassering</Caps>
          </div>
        </div>
        <p style={{ margin: "14px 0 0", fontSize: 12, color: TL.mute, fontFamily: TL.font.mono }}>
          {h.bestePlassering != null
            ? `Fra ${h.medPlassering} av ${h.antall} turneringer med registrert plassering.`
            : "Ingen av turneringene har registrert plassering."}
          {h.kilder.length > 0 && ` Kilder: ${h.kilder.join(", ")}.`}
        </p>
      </Kort>

      {h.aar.map((a) => (
        <Kort
          key={a.aar}
          eyebrow={`${a.aar} · ${a.turneringer.length} ${a.turneringer.length === 1 ? "turnering" : "turneringer"}`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: TL.hair }}>
            {a.turneringer.map((t) => {
              const statusTekst = UTEN_RESULTAT[t.status ?? ""] ?? null;
              return (
                <div
                  key={t.turneringId}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    gap: 12,
                    alignItems: "baseline",
                    background: TL.elev,
                    padding: "10px 0",
                    minWidth: 0,
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: 14,
                        color: TL.text,
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.navn}
                    </span>
                    <span style={{ fontSize: 11, color: TL.mute, fontFamily: TL.font.mono }}>
                      {kortDato(t.startDato)}
                    </span>
                  </span>
                  <span
                    style={{
                      fontFamily: TL.font.mono,
                      fontSize: 13,
                      color: TL.mute,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {t.motPar == null ? "" : t.motPar > 0 ? `+${t.motPar}` : `${t.motPar}`}
                  </span>
                  <span
                    style={{
                      fontFamily: TL.font.mono,
                      fontSize: 13,
                      fontWeight: 600,
                      color: statusTekst ? TL.mute : TL.text,
                      fontVariantNumeric: "tabular-nums",
                      minWidth: 62,
                      textAlign: "right",
                    }}
                  >
                    {statusTekst ?? (t.plassering != null && t.plassering > 0 ? `${t.plassering}.` : "—")}
                  </span>
                </div>
              );
            })}
          </div>
        </Kort>
      ))}
    </div>
  );
}
