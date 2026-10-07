// Auto-bootstrap NotionConnection fra NOTION_INTERNAL_TOKEN env-var.
//
// Internal Integration-token-flyt: i stedet for OAuth, henter vi tokenet fra
// NOTION_INTERNAL_TOKEN og oppretter NotionConnection automatisk for ADMIN.
//
// Idempotent — trygt å kalle på hver request. Logger aldri tokenet.

import { Client } from "@notionhq/client";

import { prisma } from "@/lib/prisma";

import { encrypt } from "./crypto";

/**
 * Hvis NOTION_INTERNAL_TOKEN er satt og det ikke finnes en NotionConnection
 * for ADMIN-brukeren, auto-opprett en. Ingen database-link opprettes: den gamle
 * Tasks-DB-en (data source b0f3f0f6-…) var ikke delt med integrasjonen, og
 * synken feilet hvert femte minutt. Fjernet etter Anders' beslutning 07.10.2026.
 * Idempotent — trygt å kalle på hver request.
 *
 * Returnerer:
 *   "created"  — opprettet ny connection
 *   "exists"   — connection finnes allerede
 *   "skipped"  — ikke ADMIN, eller env-var mangler
 */
export async function ensureNotionConnection(
  userId: string,
  userRole: string,
): Promise<"created" | "exists" | "skipped"> {
  if (userRole !== "ADMIN") return "skipped";

  const token = process.env.NOTION_INTERNAL_TOKEN;
  if (!token) return "skipped";

  const existing = await prisma.notionConnection.findUnique({
    where: { userId },
  });
  if (existing) return "exists";

  // Hent bot-info fra Notion for å sette workspace-navn.
  const notion = new Client({ auth: token });
  const me = await notion.users.me({});

  let workspaceName = "Notion Workspace";
  const workspaceId = `internal-${userId.slice(0, 8)}`;
  const workspaceIcon: string | null = null;

  if (me.type === "bot") {
    const bot = me as unknown as {
      bot?: { workspace_name?: string };
    };
    if (bot.bot?.workspace_name) {
      workspaceName = bot.bot.workspace_name;
    }
  }

  await prisma.notionConnection.create({
    data: {
      userId,
      accessTokenEnc: encrypt(token),
      botId: me.id,
      workspaceId,
      workspaceName,
      workspaceIcon,
    },
  });

  return "created";
}
