"use client";

/**
 * Live SG-panel: klient-ESTIMAT beregnet KUN på fullførte hull, alltid
 * merket med dekning («X av Y hull»). Serveren er fasit ved lagring —
 * klienten bruker de samme motorfunksjonene, så tallene skal være like,
 * men lagringen regner alltid på nytt server-side.
 * Ærlig tomtilstand: ingen tall diktes før første hull er fullført.
 */

import type { LoggetHull } from "@/lib/runde-logg/types";
import { beregnSg } from "@/lib/domain/sg";
import { rundeTilSgShots } from "@/lib/runde-logg/til-sg-shots";
import { T, fmtSg, Kort, TomTilstand, Icon } from "@/components/v2";

function SgLinje({ l, v }: { l: string; v: number }) {
  const w = Math.min(100, Math.abs(v) * 46);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 52px", gap: 10, alignItems: "center" }}>
      <span style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, color: T.fg2 }}>{l}</span>
      <div style={{ position: "relative", height: 14 }}>
        <span style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: T.borderS }} />
        <span
          style={{
            position: "absolute",
            top: 2,
            bottom: 2,
            borderRadius: 4,
            background: v >= 0 ? T.up : T.down,
            left: v >= 0 ? "50%" : `calc(50% - ${w}px)`,
            width: w,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 12,
          fontWeight: 700,
          color: v >= 0 ? T.up : T.down,
          textAlign: "right",
        }}
      >
        {fmtSg(v)}
      </span>
    </div>
  );
}

export function SgPanel({ hullData, onLukk }: { hullData: LoggetHull[]; onLukk: () => void }) {
  const ferdige = hullData.filter((h) => h.slag.at(-1)?.resultat.iHull === true);

  let sg: { total: number; ott: number; app: number; arg: number; putt: number } | null = null;
  if (ferdige.length > 0) {
    try {
      sg = beregnSg(rundeTilSgShots(ferdige));
    } catch {
      sg = null;
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 22, color: T.fg, lineHeight: 1.1 }}>
          SG hittil
        </div>
        <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 3 }}>
          {ferdige.length} av {hullData.length} hull fullført
        </div>
      </div>

      {sg == null ? (
        <Kort>
          <TomTilstand
            icon="trending-up"
            title="SG kommer etter første fullførte hull"
            sub="Strokes Gained regnes kun på komplette hull — fullfør hullet du er på, så ser du tallene her."
          />
        </Kort>
      ) : (
        <Kort>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 26,
                  fontWeight: 700,
                  color: sg.total >= 0 ? T.up : T.down,
                }}
              >
                {fmtSg(sg.total)}
              </span>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>
                SG totalt · {ferdige.length} av {hullData.length} hull
              </span>
            </div>
            <SgLinje l="OTT" v={sg.ott} />
            <SgLinje l="APP" v={sg.app} />
            <SgLinje l="ARG" v={sg.arg} />
            <SgLinje l="PUTT" v={sg.putt} />
            <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, lineHeight: 1.5 }}>
              Estimat på fullførte hull — serveren er fasit ved lagring.
            </div>
          </div>
        </Kort>
      )}

      <button
        type="button"
        onClick={onLukk}
        className="v2-press v2-focus"
        style={{
          appearance: "none",
          cursor: "pointer",
          width: "100%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "12px 0",
          borderRadius: 12,
          background: "transparent",
          border: `1px solid ${T.border}`,
          fontFamily: T.ui,
          fontSize: 13,
          fontWeight: 600,
          color: T.fg2,
        }}
      >
        <Icon name="arrow-left" size={14} />
        Tilbake til føringen
      </button>
    </div>
  );
}
