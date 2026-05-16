// MCP-server-endpoint for AK Golf HQ.
// Fase 1: Returnerer manifest med tool-oversikt for diskoverbarhet.
// Fase 2 (TODO): Implementer full MCP protocol handshake (JSON-RPC 2.0 over HTTP/SSE)
// slik at Claude Desktop og andre MCP-klienter kan koble seg på direkte.

import {
  CADDIE_TOOLS,
  READ_TOOL_NAMES,
  WRITE_TOOL_NAMES,
} from "@/lib/caddie/tools";

export async function GET() {
  return Response.json({
    name: "ak-golf-hq",
    version: "1.0.0",
    description:
      "MCP-server for AK Golf HQ — coaching, spillere, økter, økonomi.",
    toolCount: Object.keys(CADDIE_TOOLS).length,
    readTools: READ_TOOL_NAMES,
    writeTools: WRITE_TOOL_NAMES,
    todo: "Implement MCP protocol handshake — Phase 2",
  });
}
