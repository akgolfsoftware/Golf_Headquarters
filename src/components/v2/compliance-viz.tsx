"use client";

/* AK Golf HQ v2 — ETTERLEVELSE-VIZ (retning C «Presis»).
   Gap-fyll for AgencyOS Compliance: uke-for-uke fullføringsgrad finnes ikke som
   primitiv i kjernen (VarmeKart er intensitet uten bånd-signal, Trend er en tung
   akse-graf). UkeStripe tegner en kompakt søyle-strip med bånd-farger (bak plan =
   rød, i rute = grønn, over plan = lime-aksent) — full variant til spillerpanelet,
   kompakt variant til stall-radenes sparkline. Kun T.*-tokens, ingen rå hex. */

import { T } from "@/lib/v2/tokens";

/** Status-bånd for fullføring mot mål (100 %). Speil av loaderens ComplianceBand. */
export type EtterlevBand = "bad" | "warn" | "ok" | "over";

/** Bånd → signalfarge. Lime kun som «over plan»-aksent (aldri som nøytralt datasignal). */
export function etterlevFarge(band: EtterlevBand): string {
  return band === "bad" ? T.down : band === "warn" ? T.warn : band === "over" ? T.lime : T.up;
}

export interface UkeStripeUke {
  /** Kort ukelabel, f.eks. «U27». */
  label: string;
  done: number;
  planned: number;
  /** Fyllingshøyde 0–1 (done/planned, kappet på 1). */
  fill: number;
  band: EtterlevBand;
  isNow: boolean;
}

export interface UkeStripeProps {
  uker: UkeStripeUke[];
  /** Kompakt = tynne søyler uten labels (til tabellrader). */
  kompakt?: boolean;
  height?: number;
}

/** Uke-for-uke fullføring som søyle-strip. Tom uke (ingen plan) = grå track. */
export function UkeStripe({ uker, kompakt = false, height }: UkeStripeProps) {
  const h = height ?? (kompakt ? 20 : 46);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: kompakt ? 3 : 6 }}>
      {uker.map((u, i) => {
        const tom = u.planned === 0;
        const farge = etterlevFarge(u.band);
        return (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: kompakt ? 0 : 5,
              flex: kompakt ? "none" : 1,
              minWidth: 0,
            }}
          >
            <div
              title={tom ? `${u.label}: ingen plan` : `${u.label}: ${u.done}/${u.planned} økter`}
              style={{
                position: "relative",
                width: kompakt ? 6 : "100%",
                height: h,
                borderRadius: kompakt ? 2 : 5,
                background: T.track,
                overflow: "hidden",
                border: u.isNow ? `1px solid ${T.borderS}` : "1px solid transparent",
              }}
            >
              {!tom && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: `${Math.round(Math.max(0, Math.min(1, u.fill)) * 100)}%`,
                    background: farge,
                    opacity: 0.9,
                    borderRadius: kompakt ? 2 : 5,
                  }}
                />
              )}
            </div>
            {!kompakt && (
              <span style={{ fontFamily: T.mono, fontSize: 8, color: u.isNow ? T.fg2 : T.mut }}>
                {u.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
