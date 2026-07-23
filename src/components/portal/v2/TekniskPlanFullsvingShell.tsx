"use client";

/**
 * Wrapper: Full sving-flate + filter som skjuler ikke-fullsving P-seksjoner.
 */

import { useState, type ReactNode } from "react";
import {
  FullSvingFlate,
  type FullSvingTaskRad,
} from "@/components/portal/v2/FullSvingFlate";

type Props = {
  fullsvingTasks: FullSvingTaskRad[];
  /** Render prop: children mottar onlyFullsving-filter. */
  children: (ctx: { onlyFullsving: boolean }) => ReactNode;
};

export function TekniskPlanFullsvingShell({ fullsvingTasks, children }: Props) {
  const [onlyFullsving, setOnlyFullsving] = useState(false);

  return (
    <>
      <FullSvingFlate
        tasks={fullsvingTasks}
        onFilterChange={setOnlyFullsving}
      />
      {children({ onlyFullsving })}
    </>
  );
}
