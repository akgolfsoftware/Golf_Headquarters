"use client";

import type { ReactElement } from "react";
import { FONT, WB } from "./theme";

type Props = {
  line: string | null;
};

export function InsightsStripe({ line }: Props): ReactElement | null {
  if (!line) return null;
  return (
    <div
      style={{
        flexShrink: 0,
        padding: "8px 14px",
        borderBottom: `1px solid ${WB.panelBorder}`,
        background: WB.railBg,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: FONT.mono,
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "0.03em",
          color: WB.muted,
          lineHeight: 1.45,
        }}
      >
        {line}
      </p>
    </div>
  );
}