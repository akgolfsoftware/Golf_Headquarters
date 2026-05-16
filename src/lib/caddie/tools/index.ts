// Plassholder — agent 1 erstatter med ekte tools.
// CADDIE_TOOLS skal være en ToolSet (Record<string, Tool>) fra AI SDK v6.
// READ_TOOL_NAMES / WRITE_TOOL_NAMES brukes til UI-merking (lese vs forslag).

import type { ToolSet } from "ai";

export const CADDIE_TOOLS: ToolSet = {};
export const READ_TOOL_NAMES: string[] = [];
export const WRITE_TOOL_NAMES: string[] = [];
