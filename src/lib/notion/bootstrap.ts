// Auto-bootstrap NotionConnection fra NOTION_INTERNAL_TOKEN env-var.
//
// Internal Integration-token-flyt: i stedet for OAuth, henter vi tokenet fra
// NOTION_INTERNAL_TOKEN og oppretter NotionConnection automatisk for ADMIN.
//
// Idempotent — trygt å kalle på hver request. Logger aldri tokenet.

import { Client } from "@notionhq/client";

import { prisma } from "@/lib/prisma";

import { encrypt } from "./crypto";
import { syncNotionDatabase } from "./sync";

// Anders' Tasks-DB i Notion (samme verdier som tidligere session).
const TASKS_DATABASE_ID = "1781b48bdc1a4f8fbd2c38cb10af6220";
const TASKS_DATA_SOURCE_ID = "b0f3f0f6-98b3-45f5-a6b9-c0969f8fde69";

/**
 * Hvis NOTION_INTERNAL_TOKEN er satt og det ikke finnes en NotionConnection
 * for ADMIN-brukeren, auto-opprett en + en database-link til Tasks-DB.
 * Idempotent — trygt å kalle på hver request.
 *
 * Returnerer:
 *   "created"  — opprettet ny connection (og fyrte av initial sync)
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

  const conn = await prisma.notionConnection.create({
    data: {
      userId,
      accessTokenEnc: encrypt(token),
      botId: me.id,
      workspaceId,
      workspaceName,
      workspaceIcon,
    },
  });

  // Opprett database-link til Tasks-DB.
  const link = await prisma.notionDatabaseLink.create({
    data: {
      connectionId: conn.id,
      notionDatabaseId: TASKS_DATABASE_ID,
      notionDataSourceId: TASKS_DATA_SOURCE_ID,
      navn: "Tasks",
      type: "OPPGAVER",
      propTittel: "Tittel",
      propStatus: "Status",
      propPrioritet: "Prioritet",
      propSelskap: "Selskap",
      propForfaller: "Forfaller",
      propTildelt: "Eier",
      propNotater: "Notater",
      propLenke: "Lenke",
      propProsjekt: "Prosjekt",
      syncMode: "AUTO",
    },
  });

  // Fire-and-forget initial sync — feiler ikke bootstrap hvis sync feiler.
  syncNotionDatabase(link.id).catch((err) => {
    // Ikke logg tokenet eller hele error-payload — kun melding.
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[notion-bootstrap] Initial sync failed:", msg);
  });

  return "created";
}
