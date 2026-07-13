// Samlet eksport av alle Caddie MCP-tools.
// Read-tools er auto-approved og bygges per innlogget viewer (coach-scoping).
// WRITE_TOOLS returnerer forslag som krever Anders' godkjenning før de faktisk
// utføres.

import { buildReadTools } from "./read";
import { WRITE_TOOLS } from "./write";

export { buildReadTools, WRITE_TOOLS };

/** Bygg hele tool-settet for en konkret innlogget ADMIN/COACH-viewer. */
export function buildCaddieTools(viewer: { id: string; role: string }) {
  return {
    ...buildReadTools(viewer),
    ...WRITE_TOOLS,
  } as const;
}

// Viewer-uavhengig shape — tool-navn og zod-schemaer er like for alle viewere.
// Brukes KUN til navnelister/typer og tools/list-metadata, aldri til execute.
const READ_TOOL_SHAPE = buildReadTools({ id: "", role: "ADMIN" });
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
