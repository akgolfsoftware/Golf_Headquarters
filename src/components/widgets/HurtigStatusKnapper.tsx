"use client";

/**
 * Widget-pakke — delt hurtigstatus («Gjort» / «Hopp over») for dagens økter.
 * Flyttet ut av GjorV2 2026-07-27 så Hjem-widgeten og Gjør bruker samme
 * kontroll. Presentasjonell: kalleren eier markerOktStatus-kallet.
 */

import { TL } from "@/lib/v2/train-lock";

import { Icon } from "@/components/v2/icon";

export type HurtigStatusOkt = { id: string; kilde: "v2" | "plan" };

export function HurtigStatusKnapper({
  o,
  oppdaterer,
  onMarker,
}: {
  o: HurtigStatusOkt;
  oppdaterer: boolean;
  onMarker: (o: HurtigStatusOkt, status: "COMPLETED" | "SKIPPED") => void;
}) {
  return (
    <span style={{ display: "inline-flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="v2-press v2-focus"
        disabled={oppdaterer}
        onClick={() => onMarker(o, "COMPLETED")}
        title="Marker som gjennomført"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontFamily: TL.font.sans,
          fontSize: 11.5,
          fontWeight: 600,
          color: TL.text,
          background: TL.dim,
          border: `1px solid ${TL.hair}`,
          borderRadius: 9999,
          padding: "7px 12px",
          cursor: "pointer",
          minHeight: 32,
        }}
      >
        <Icon name="check" size={12} />
        Gjort
      </button>
      <button
        type="button"
        className="v2-press v2-focus"
        disabled={oppdaterer}
        onClick={() => onMarker(o, "SKIPPED")}
        title="Hopp over økten — coachen ser det i klarspråk"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontFamily: TL.font.sans,
          fontSize: 11.5,
          fontWeight: 600,
          color: TL.mute,
          background: "transparent",
          border: `1px solid ${TL.hair}`,
          borderRadius: 9999,
          padding: "7px 12px",
          cursor: "pointer",
          minHeight: 32,
        }}
      >
        Hopp over
      </button>
    </span>
  );
}
