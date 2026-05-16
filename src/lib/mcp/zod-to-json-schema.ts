// Konverter Zod-skjema (v4) til JSON Schema for MCP `tools/list`-respons.
// Bruker innebygget `z.toJSONSchema` i Zod v4 — ingen ekstern avhengighet.

import { z, type ZodType } from "zod";

type JsonSchemaObject = Record<string, unknown>;

/**
 * Konverter et Zod-skjema til JSON Schema (draft-2020-12 by default).
 * MCP-klienter forventer typisk `inputSchema: { type: "object", properties: {...}, required: [...] }`.
 * Hvis skjemaet ikke produserer et JSON-objekt på toppnivå, pakker vi det inn.
 */
export function toMcpJsonSchema(schema: ZodType): JsonSchemaObject {
  const raw = z.toJSONSchema(schema, {
    target: "draft-2020-12",
    unrepresentable: "any",
    io: "input",
  }) as JsonSchemaObject;

  // MCP-spec krever objekt-skjema for tool-inputs. Pakk inn primitive skjemaer.
  if (raw.type !== "object") {
    return {
      type: "object",
      properties: {
        value: raw,
      },
      required: ["value"],
    };
  }

  // Fjern $schema-feltet — Claude Desktop og andre klienter trenger det ikke.
  if ("$schema" in raw) {
    const { $schema: _drop, ...rest } = raw;
    void _drop;
    return rest;
  }

  return raw;
}
