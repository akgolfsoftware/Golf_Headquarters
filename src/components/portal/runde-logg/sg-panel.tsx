"use client";

import { TL } from "@/lib/v2/train-lock";
import type { LoggetHull } from "@/lib/runde-logg/types";
import { Kort, TomTilstand, Icon } from "@/components/v2";

export function SgPanel({ hullData, onLukk }: { hullData: LoggetHull[]; onLukk: () => void }) {
  const ferdige = hullData.filter((h) => h.slag.at(-1)?.resultat.iHull === true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontFamily: TL.font.sans, fontWeight: 700, fontSize: 22, color: TL.text, lineHeight: 1.1 }}>
          Strokes Gained
        </div>
        <div style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, marginTop: 3 }}>
          {ferdige.length} av {hullData.length} hull fullført
        </div>
      </div>

      <Kort>
        <TomTilstand
          icon="trending-up"
          title="SG beregnes etter lagring"
          sub="SG vises når slagene er komplette og AK Golf Baseline er klar."
        />
      </Kort>

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
          border: `1px solid ${TL.hair}`,
          fontFamily: TL.font.sans,
          fontSize: 13,
          fontWeight: 600,
          color: TL.mute,
        }}
      >
        <Icon name="arrow-left" size={14} />
        Tilbake til føringen
      </button>
    </div>
  );
}
