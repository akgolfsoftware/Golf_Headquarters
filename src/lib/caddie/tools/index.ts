// Samlet eksport av alle Caddie MCP-tools.
// READ_TOOLS er auto-approved. WRITE_TOOLS returnerer forslag som krever
// Anders' godkjenning før de faktisk utføres.

import { READ_TOOLS } from "./read";
import { WRITE_TOOLS } from "./write";

export { READ_TOOLS, WRITE_TOOLS };

export const CADDIE_TOOLS = {
  ...READ_TOOLS,
  ...WRITE_TOOLS,
} as const;

export const READ_TOOL_NAMES = Object.keys(READ_TOOLS) as Array<keyof typeof READ_TOOLS>;
export const WRITE_TOOL_NAMES = Object.keys(WRITE_TOOLS) as Array<keyof typeof WRITE_TOOLS>;
export const ALL_TOOL_NAMES = Object.keys(CADDIE_TOOLS) as Array<keyof typeof CADDIE_TOOLS>;

export type CaddieToolName = keyof typeof CADDIE_TOOLS;
