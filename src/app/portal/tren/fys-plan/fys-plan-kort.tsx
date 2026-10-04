"use client";

import Link from "next/link";

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
    <Link href={`/portal/tren/fys-plan/${plan.id}`} className="ph26-kort-lenke">
      <strong>
        {plan.navn}
        {plan.status === "DRAFT" ? " · utkast" : ""}
      </strong>
      <small>
        {plan.ukerCount} uker · {plan.okterCount} økter
        {plan.ukerCount > 0 ? ` · uke ${plan.currentWeek} av ${plan.ukerCount}` : ""}
      </small>
      <span className="ph26-spor" aria-hidden>
        <i style={{ width: `${plan.pct}%` }} />
      </span>
    </Link>
  );
}
