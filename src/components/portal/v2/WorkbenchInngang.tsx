"use client";

/**
 * WORKBENCH-INNGANG — det ENE trykkpunktet til Workbench (låst IA-beslutning:
 * «Planlegge er ett trykkpunkt, ikke en meny av kort»). Delt mellom PlanV2 og
 * HjemV2 så inngangen er identisk overalt.
 */

import Link from "next/link";
import { Kort, Icon } from "@/components/v2";
import { TL } from "@/lib/v2/train-lock";


export const WORKBENCH_HREF = "/portal/planlegge/workbench";

export function WorkbenchInngang() {
  return (
    <Link href={WORKBENCH_HREF} style={{ textDecoration: "none" }}>
      <Kort eyebrow="Planlegging" hover>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "2px 0" }}>
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              flex: "none",
              background: `color-mix(in srgb, ${TL.fill} 12%, transparent)`,
              border: `1px solid ${TL.hair}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="calendar" size={17} style={{ color: TL.fill }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>Åpne Workbench</div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, marginTop: 2 }}>
              All planlegging skjer der — dra, slipp, be om endring
            </div>
          </div>
          <Icon name="arrow-right" size={16} style={{ color: TL.mute, flex: "none" }} />
        </div>
      </Kort>
    </Link>
  );
}
