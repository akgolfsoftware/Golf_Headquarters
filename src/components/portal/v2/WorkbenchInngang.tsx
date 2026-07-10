"use client";

/**
 * WORKBENCH-INNGANG — det ENE trykkpunktet til Workbench (låst IA-beslutning:
 * «Planlegge er ett trykkpunkt, ikke en meny av kort»). Delt mellom PlanV2 og
 * HjemV2 så inngangen er identisk overalt.
 */

import Link from "next/link";
import { Kort, Icon } from "@/components/v2";
import { T } from "@/lib/v2/tokens";

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
              background: `color-mix(in srgb, ${T.lime} 10%, transparent)`,
              border: `1px solid ${T.border}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="calendar" size={17} style={{ color: T.lime }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>Åpne Workbench</div>
            <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2 }}>
              All planlegging skjer der — dra, slipp, be om endring
            </div>
          </div>
          <Icon name="arrow-right" size={16} style={{ color: T.mut, flex: "none" }} />
        </div>
      </Kort>
    </Link>
  );
}
