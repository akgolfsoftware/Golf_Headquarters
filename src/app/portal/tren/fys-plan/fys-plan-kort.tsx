"use client";

/* FYS-plan-kort — Paper-port W1 (fase2). Fasit .plan-kortet:
   navn, mono-meta («uker · økter · uke X av Y»), tynn fremdriftsstolpe.
   Fremdrift = uke vi er i / totale uker, beregnet på serveren. */

import Link from "next/link";
import { T } from "@/lib/v2/tokens";

export type FysPlanKortData = {
  id: string;
  navn: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  ukerCount: number;
  okterCount: number;
  pct: number;
  currentWeek: number;
};

export function FysPlanKort({ plan }: { plan: FysPlanKortData }) {
  return (
    <Link
      href={`/portal/tren/fys-plan/${plan.id}`}
      className="v2-focus"
      style={{
        display: "block",
        background: T.panel,
        border: `1px solid ${T.border}`,
        borderRadius: T.rCard,
        padding: 16,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <span style={{ display: "block", fontFamily: T.disp, fontSize: 14.5, fontWeight: 600, color: T.fg }}>
        {plan.navn}
        {plan.status === "DRAFT" ? " · utkast" : ""}
      </span>
      <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
        {plan.ukerCount} uker · {plan.okterCount} økter
        {plan.ukerCount > 0 ? ` · uke ${plan.currentWeek} av ${plan.ukerCount}` : ""}
      </span>
      <span
        style={{
          display: "block",
          height: 6,
          background: T.track,
          borderRadius: 9999,
          overflow: "hidden",
          marginTop: 12,
        }}
      >
        <i
          style={{
            display: "block",
            height: "100%",
            width: `${plan.pct}%`,
            background: T.mut,
            borderRadius: 9999,
          }}
        />
      </span>
    </Link>
  );
}
