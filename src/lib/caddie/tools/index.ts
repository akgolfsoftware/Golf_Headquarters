// Samlet eksport av alle Caddie MCP-tools.
// Read-tools er auto-approved og bygges per innlogget viewer (coach-scoping).
// WRITE_TOOLS returnerer forslag som krever Anders' godkjenning før de faktisk
// utføres.

import { KNOWLEDGE_TOOLS } from "./knowledge";
import { buildReadTools } from "./read";
import { buildWriteTools, WRITE_TOOLS } from "./write";
import { nyttSpillerRegister, type SpillerRegister } from "./minimering";

export { buildReadTools, buildWriteTools, KNOWLEDGE_TOOLS, WRITE_TOOLS };

/**
 * Bygg hele tool-settet for en konkret innlogget ADMIN/COACH-viewer.
 * `register` (R-B) deles mellom read- og write-tools for ÉN chat-request —
 * pass inn ditt eget register (og bruk det til å skrive ekte navn tilbake i
 * modellens svar før persistering) i stedet for å la denne opprette et som
 * kastes bort umiddelbart etter kallet.
 */
export function buildCaddieTools(
  viewer: { id: string; role: string },
  register: SpillerRegister = nyttSpillerRegister(),
) {
  return {
    ...buildReadTools(viewer, register),
    ...KNOWLEDGE_TOOLS,
    ...buildWriteTools(viewer, register),
  } as const;
}

// Viewer-uavhengig shape — tool-navn og zod-schemaer er like for alle viewere.
// Brukes KUN til navnelister/typer og tools/list-metadata, aldri til execute.
// Kunnskap-toolet er viewer-uavhengig (rent oppslag i fasiten, ingen spillerdata)
// og regnes som read: auto-approved, krever ingen godkjenning.
const READ_TOOL_SHAPE = { ...buildReadTools({ id: "", role: "ADMIN" }), ...KNOWLEDGE_TOOLS };
export const CADDIE_TOOL_SHAPE = {
  ...READ_TOOL_SHAPE,
  ...WRITE_TOOLS,
} as const;

export const READ_TOOL_NAMES = Object.keys(READ_TOOL_SHAPE) as Array<
  keyof typeof READ_TOOL_SHAPE
>;
export const WRITE_TOOL_NAMES = Object.keys(WRITE_TOOLS) as Array<keyof typeof WRITE_TOOLS>;
export const ALL_TOOL_NAMES = Object.keys(CADDIE_TOOL_SHAPE) as Array<
  keyof typeof CADDIE_TOOL_SHAPE
>;

export type CaddieToolName = keyof typeof CADDIE_TOOL_SHAPE;
