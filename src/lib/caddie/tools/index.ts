// Samlet eksport av alle Caddie MCP-tools.
// Read-tools er auto-approved og bygges per innlogget viewer (coach-scoping).
// WRITE_TOOLS returnerer forslag som krever Anders' godkjenning før de faktisk
// utføres.

import { KNOWLEDGE_TOOLS } from "./knowledge";
import { buildReadTools } from "./read";
import { WRITE_TOOLS } from "./write";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import type { ToolSet } from "ai";

export { buildReadTools, KNOWLEDGE_TOOLS, WRITE_TOOLS };

/** Bygg hele tool-settet for en konkret innlogget ADMIN/COACH-viewer. */
export function buildCaddieTools(viewer: { id: string; role: string }) {
  const writes: ToolSet = Object.fromEntries(Object.entries(WRITE_TOOLS).map(([name, definition]) => [name, {
    ...definition,
    execute: async (input: Record<string, unknown>, options: Parameters<NonNullable<typeof definition.execute>>[1]) => {
      const denied = { ok: false, error: "Ressursen er ikke tilgjengelig", userMessage: "Fant ingen tilgjengelig ressurs." };
      if (!viewer.id || (viewer.role !== "ADMIN" && viewer.role !== "COACH")) return denied;
      try {
        if (typeof input.playerId === "string" && !(await harCoachTilgangTilSpiller(viewer, input.playerId))) return denied;
        if (name === "draftInvoiceReminder" && viewer.role !== "ADMIN") return denied;
        const execute = definition.execute as (args: Record<string, unknown>, opts: typeof options) => Promise<unknown>;
        return await execute(input, options);
      } catch {
        return denied;
      }
    },
  }]));
  return {
    ...buildReadTools(viewer),
    ...KNOWLEDGE_TOOLS,
    ...writes,
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
