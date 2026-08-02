// Mapping restraint-metrikk → felt på prisma TrackManShot-raden.
// Egen fil (uten prisma-import) så både server-kontekst og tester kan bruke den.

import type { RestraintMetric } from "./shot-events";

export const RESTRAINT_FIELDS: ReadonlyArray<
  [RestraintMetric, "carryDistance" | "side" | "ballSpeed" | "launchAngle" | "spinRate" | "smashFactor"]
> = [
  ["carry", "carryDistance"],
  ["side", "side"],
  ["ballSpeed", "ballSpeed"],
  ["launchAngle", "launchAngle"],
  ["spinRate", "spinRate"],
  ["smash", "smashFactor"],
];

export type { RestraintMetric };
