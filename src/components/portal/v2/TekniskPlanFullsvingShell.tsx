"use client";

/**
 * Wrapper: Full sving-flate + filter som skjuler ikke-fullsving P-seksjoner.
 */

import { useState, type ReactNode } from "react";
import {
  FullSvingFlate,
  type FullSvingTaskRad,
} from "@/components/portal/v2/FullSvingFlate";

import type { DispersionMapResult } from "@/lib/trackman/dispersion-map";

type Props = {
  fullsvingTasks: FullSvingTaskRad[];
  dispersion?: DispersionMapResult | null;
  latestSessionDate?: string | null;
  /** Render prop: children mottar onlyFullsving-filter. */
  children: (ctx: { onlyFullsving: boolean }) => ReactNode;
};

export function TekniskPlanFullsvingShell({
  fullsvingTasks,
  dispersion,
  latestSessionDate,
  children,
}: Props) {
  const [onlyFullsving, setOnlyFullsving] = useState(false);

  return (
    <>
      <FullSvingFlate
        tasks={fullsvingTasks}
        dispersion={dispersion}
        latestSessionDate={latestSessionDate}
        onFilterChange={setOnlyFullsving}
      />
      {children({ onlyFullsving })}
    </>
  );
}
