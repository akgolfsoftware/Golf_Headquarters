"use client";

/* FYS-plan-kort — v2 klientkomponent (ProgresjonsBar er klient-side).
   Fremdrift = uke vi er i / totale uker, beregnet på serveren. */

import Link from "next/link";
import {
  T,
  Kort,
  StatusPill,
  ProgresjonsBar,
} from "@/components/v2";

export type FysPlanKortData = {
  id: string;
  navn: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  ukerCount: number;
  okterCount: number;
  pct: number;
  currentWeek: number;
};

const STATUS_CFG: Record<FysPlanKortData["status"], { label: string; tone: "lime" | "info" | "up" }> = {
  ACTIVE: { label: "Aktiv", tone: "lime" },
  DRAFT: { label: "Utkast", tone: "info" },
  ARCHIVED: { label: "Arkivert", tone: "up" },
};

export function FysPlanKort({ plan }: { plan: FysPlanKortData }) {
  const s = STATUS_CFG[plan.status];
  return (
    <Link href={`/portal/tren/fys-plan/${plan.id}`} style={{ textDecoration: "none", display: "block" }}>
      <Kort hover pad="16px 18px">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, color: T.fg }}>
            {plan.navn}
          </span>
          <StatusPill tone={s.tone}>{s.label}</StatusPill>
        </div>
        <p style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, margin: "6px 0 12px" }}>
          {plan.ukerCount} uker · {plan.okterCount} økter
        </p>
        <ProgresjonsBar
          variant="bar"
          value={plan.pct}
          max={100}
          label={
            plan.ukerCount > 0
              ? `Uke ${plan.currentWeek} av ${plan.ukerCount}`
              : "Ingen uker planlagt"
          }
        />
      </Kort>
    </Link>
  );
}
