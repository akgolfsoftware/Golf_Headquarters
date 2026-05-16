// Auth-helper for MCP-server.
// MCP-klienter (Claude Desktop, Cline, etc.) sender `Authorization: Bearer <key>`.
// Vi SHA-256-hasher token og slår opp i ApiKey-tabellen (samme skjema som UI-en
// i /admin/settings/api bruker). Kun ADMIN-brukere kan kjøre tools.

import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

export type McpAuthResult =
  | { ok: true; user: User; apiKeyId: string }
  | { ok: false; code: number; message: string };

function hashKey(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Validerer Bearer-token mot ApiKey-tabellen.
 * Returnerer JSON-RPC-feilkoder ved feil:
 *   -32001: mangler/ugyldig auth-header
 *   -32002: ukjent eller revokert nøkkel
 *   -32003: nøkkelen tilhører ikke en ADMIN-bruker
 *   -32004: nøkkelen er utløpt
 */
export async function authenticateMcpRequest(req: Request): Promise<McpAuthResult> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return {
      ok: false,
      code: -32001,
      message: "Mangler Authorization: Bearer <api-key> i header.",
    };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return {
      ok: false,
      code: -32001,
      message: "Tom Bearer-token.",
    };
  }

  const hashed = hashKey(token);

  const apiKey = await prisma.apiKey.findUnique({
    where: { hashedKey: hashed },
    include: { user: true },
  });

  if (!apiKey || apiKey.revokedAt !== null) {
    return {
      ok: false,
      code: -32002,
      message: "Ukjent eller tilbakekalt API-nøkkel.",
    };
  }

  if (apiKey.expiresAt && apiKey.expiresAt.getTime() < Date.now()) {
    return {
      ok: false,
      code: -32004,
      message: "API-nøkkelen er utløpt.",
    };
  }

  if (apiKey.user.role !== "ADMIN") {
    return {
      ok: false,
      code: -32003,
      message: "API-nøkkelen tilhører ikke en ADMIN-bruker.",
    };
  }

  // Oppdater siste bruk uten å blokkere request hvis det feiler.
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {
      // ignorer — auth lyktes uansett
    });

  return { ok: true, user: apiKey.user, apiKeyId: apiKey.id };
}
