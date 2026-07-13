// MCP-server-endpoint for AK Golf HQ.
// GET  → manifest (diskoverbarhet, ingen auth)
// POST → JSON-RPC 2.0 over HTTP (krever Bearer-token mot ApiKey-tabellen)
//
// Spec: https://spec.modelcontextprotocol.io/specification/
// Setup: docs/mcp-server-setup.md

import {
  ALL_TOOL_NAMES,
  READ_TOOL_NAMES,
  WRITE_TOOL_NAMES,
} from "@/lib/caddie/tools";
import { authenticateMcpRequest } from "@/lib/mcp/auth";
import { dispatchMcpMethod } from "@/lib/mcp/dispatcher";
import { rateLimit } from "@/lib/rate-limit";
import {
  isJsonRpcRequest,
  isNotification,
  rpcError,
  RPC_INVALID_REQUEST,
  RPC_PARSE_ERROR,
  type JsonRpcResponse,
} from "@/lib/mcp/jsonrpc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    name: "ak-golf-hq",
    version: "1.0.0",
    description:
      "MCP-server for AK Golf HQ — coaching, spillere, økter, økonomi.",
    protocol: "mcp/2024-11-05",
    transport: "http+json-rpc",
    auth: "Bearer token (se /admin/settings/api for å generere)",
    toolCount: ALL_TOOL_NAMES.length,
    readTools: READ_TOOL_NAMES,
    writeTools: WRITE_TOOL_NAMES,
    docs: "/docs/mcp-server-setup.md",
  });
}

export async function POST(req: Request) {
  // 1) Parse body
  let body: unknown;
  try {
    const text = await req.text();
    body = text ? JSON.parse(text) : null;
  } catch {
    return Response.json(
      rpcError(null, RPC_PARSE_ERROR, "Kunne ikke parse JSON-body."),
      { status: 400 },
    );
  }

  // 2) Auth — kreves for ALLE requests (også initialize, jf. MCP-spec for HTTP).
  const auth = await authenticateMcpRequest(req);
  if (!auth.ok) {
    // Hent id fra body hvis mulig så klienten kan korrelere.
    const id =
      body && typeof body === "object" && "id" in body
        ? ((body as { id: unknown }).id as null | string | number)
        : null;
    return Response.json(rpcError(id, auth.code, auth.message), {
      status: 401,
      headers: { "WWW-Authenticate": "Bearer" },
    });
  }

  // Rate-limit: 60 MCP-kall per minutt per API-nøkkel.
  const rl = await rateLimit({ key: `mcp:${auth.apiKeyId}`, max: 60, windowMs: 60_000 });
  if (!rl.ok) {
    return Response.json(
      rpcError(null, -32000, "Rate limit overskredet — prøv igjen om litt."),
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }

  // 3) Batch eller single?
  if (Array.isArray(body)) {
    if (body.length === 0) {
      return Response.json(
        rpcError(null, RPC_INVALID_REQUEST, "Tom batch er ikke tillatt."),
        { status: 400 },
      );
    }
    const responses: JsonRpcResponse[] = [];
    for (const item of body) {
      const res = await handleSingle(item, auth.user);
      if (res) responses.push(res);
    }
    if (responses.length === 0) return new Response(null, { status: 204 });
    return Response.json(responses);
  }

  const res = await handleSingle(body, auth.user);
  if (!res) return new Response(null, { status: 204 });
  return Response.json(res);
}

async function handleSingle(
  raw: unknown,
  viewer: { id: string; role: string },
): Promise<JsonRpcResponse | null> {
  if (!isJsonRpcRequest(raw)) {
    return rpcError(
      null,
      RPC_INVALID_REQUEST,
      "Forventet JSON-RPC 2.0-melding med `jsonrpc: \"2.0\"` og `method`.",
    );
  }

  const id = raw.id ?? null;
  const notification = isNotification(raw);

  const result = await dispatchMcpMethod(id, raw.method, raw.params, notification, viewer);
  if (result.kind === "notification") return null;
  return result.response;
}
