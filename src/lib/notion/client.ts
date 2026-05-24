// Per-user Notion-klient via OAuth-token lagret i NotionConnection.
// Bruk dette for sync-jobber og workspace-features. For den eldre
// internal-API-bruken (coaching session sync) — se src/lib/notion.ts.

import { Client } from "@notionhq/client";
import { prisma } from "@/lib/prisma";
import { decrypt } from "./crypto";

export async function getNotionClient(userId: string): Promise<Client | null> {
  const conn = await prisma.notionConnection.findUnique({ where: { userId } });
  if (!conn) return null;
  const token = decrypt(conn.accessTokenEnc);
  return new Client({ auth: token });
}

export async function getNotionConnectionForUser(userId: string) {
  return prisma.notionConnection.findUnique({
    where: { userId },
    include: {
      databases: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
