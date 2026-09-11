// MCP-metode-dispatcher: oversetter JSON-RPC-metoder til tool-kall.
// Spec: https://spec.modelcontextprotocol.io/specification/

import type { ZodType } from "zod";
import { CADDIE_TOOL_SHAPE } from "@/lib/caddie/tools";
import { buildPrivateMcpCaddieTools } from "@/lib/caddie/mcp-privacy";
import {
  rpcError,
  rpcSuccess,
  RPC_INVALID_PARAMS,
  RPC_METHOD_NOT_FOUND,
  type JsonRpcId,
  type JsonRpcResponse,
} from "./jsonrpc";
import { toMcpJsonSchema } from "./zod-to-json-schema";

const PROTOCOL_VERSION = "2024-11-05";
const SERVER_NAME = "ak-golf-hq";
const SERVER_VERSION = "1.0.0";

type ToolDescriptor = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
};

// Bygg `tools/list`-respons fra CADDIE_TOOL_SHAPE (viewer-uavhengig metadata).
// Cache så vi slipper å konvertere JSON Schema på hver request.
let cachedToolList: ToolDescriptor[] | null = null;

function getToolList(): ToolDescriptor[] {
  if (cachedToolList) return cachedToolList;

  const list: ToolDescriptor[] = [];
  for (const [name, def] of Object.entries(CADDIE_TOOL_SHAPE)) {
    const description =
      (def as { description?: string }).description ?? `MCP-tool ${name}`;
    const zodSchema = (def as { inputSchema?: unknown }).inputSchema as
      | ZodType
      | undefined;
    if (!zodSchema) continue;
    list.push({
      name,
      description,
      inputSchema: toMcpJsonSchema(zodSchema),
    });
  }
  cachedToolList = list;
  return list;
}

type CallToolParams = {
  name?: unknown;
  arguments?: unknown;
};

async function handleToolsCall(
  id: JsonRpcId,
  params: CallToolParams,
  viewer: { id: string; role: string },
): Promise<JsonRpcResponse> {
  const toolName = typeof params?.name === "string" ? params.name : null;
  if (!toolName) {
    return rpcError(id, RPC_INVALID_PARAMS, "`params.name` mangler eller er ikke en string.");
  }
  if (!Object.hasOwn(CADDIE_TOOL_SHAPE, toolName)) {
    return rpcError(id, RPC_METHOD_NOT_FOUND, "Ukjent verktøy. Bruk tools/list for å se tilgjengelige verktøy.");
  }

  let tool: unknown;
  try {
    tool = (await buildPrivateMcpCaddieTools(viewer))[toolName];
  } catch {
    return rpcError(id, RPC_INVALID_PARAMS, "Caddie er midlertidig utilgjengelig.");
  }
  if (!tool) {
    return rpcError(
      id,
      RPC_METHOD_NOT_FOUND,
      "Verktøyet er ikke tilgjengelig.",
    );
  }

  const zodSchema = (tool as { inputSchema?: ZodType }).inputSchema;
  const execute = (tool as { execute?: (args: unknown, ctx: unknown) => Promise<unknown> })
    .execute;

  if (!zodSchema || typeof execute !== "function") {
    return rpcError(id, RPC_INVALID_PARAMS, `Tool ${toolName} mangler schema eller execute.`);
  }

  const rawArgs = params?.arguments ?? {};
  const parsed = zodSchema.safeParse(rawArgs);
  if (!parsed.success) {
    return rpcError(
      id,
      RPC_INVALID_PARAMS,
      `Ugyldige argumenter for ${toolName}.`,
      parsed.error.issues,
    );
  }

  try {
    // AI SDK execute har signaturen (input, ToolCallOptions). Vi gir minimal kontekst.
    const result = await execute(parsed.data, {
      toolCallId: `mcp-${toolName}-${Date.now()}`,
      messages: [],
    });

    // MCP `tools/call`-respons: { content: [{ type: "text", text: "..." }] }
    // Vi serialiserer resultatet som JSON-tekst slik at klienter får hele payload.
    const text = JSON.stringify(result, null, 2);
    const isError =
      result &&
      typeof result === "object" &&
      "ok" in result &&
      (result as { ok: unknown }).ok === false;

    return rpcSuccess(id, {
      content: [{ type: "text", text }],
      isError: isError === true,
    });
  } catch {
    return rpcSuccess(id, {
      content: [{ type: "text", text: "Verktøyet kunne ikke fullføres. Prøv igjen senere." }],
      isError: true,
    });
  }
}

export type DispatchResult =
  | { kind: "response"; response: JsonRpcResponse }
  | { kind: "notification" }; // ingen body skal sendes tilbake

export async function dispatchMcpMethod(
  id: JsonRpcId,
  method: string,
  params: unknown,
  isNotification: boolean,
  viewer: { id: string; role: string },
): Promise<DispatchResult> {
  // Notifications fra klienten — bare ack, returner ingen body.
  if (isNotification) {
    // Eksempler: notifications/initialized, notifications/cancelled
    return { kind: "notification" };
  }

  switch (method) {
    case "initialize": {
      return {
        kind: "response",
        response: rpcSuccess(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            tools: { listChanged: false },
          },
          serverInfo: {
            name: SERVER_NAME,
            version: SERVER_VERSION,
          },
        }),
      };
    }

    case "ping": {
      return { kind: "response", response: rpcSuccess(id, {}) };
    }

    case "tools/list": {
      return {
        kind: "response",
        response: rpcSuccess(id, { tools: getToolList() }),
      };
    }

    case "tools/call": {
      const response = await handleToolsCall(id, (params ?? {}) as CallToolParams, viewer);
      return { kind: "response", response };
    }

    // Vi annonserer ikke prompts/resources, men returner tomme lister hvis spurt.
    case "prompts/list":
      return { kind: "response", response: rpcSuccess(id, { prompts: [] }) };
    case "resources/list":
      return { kind: "response", response: rpcSuccess(id, { resources: [] }) };
    case "resources/templates/list":
      return {
        kind: "response",
        response: rpcSuccess(id, { resourceTemplates: [] }),
      };

    default:
      return {
        kind: "response",
        response: rpcError(id, RPC_METHOD_NOT_FOUND, `Ukjent metode: ${method}`),
      };
  }
}
