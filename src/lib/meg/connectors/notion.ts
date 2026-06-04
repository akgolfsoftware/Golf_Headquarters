// src/lib/meg/connectors/notion.ts
// Notion-kobling for Meg. Gjenbruker golf-appens OAuth: ADMIN-brukerens
// NotionConnection gir dekryptert klient. Les-funksjoner kjøres direkte;
// skrive-funksjoner kalles KUN via bekreftelsesflyt (se confirm.ts).
import "server-only";
import type { Client } from "@notionhq/client";
import { prisma } from "@/lib/prisma";
import { getNotionClient } from "@/lib/notion/client";

type OppgaveLink = {
  notionDatabaseId: string;
  notionDataSourceId: string | null;
  propTittel: string;
  propStatus: string | null;
  propForfaller: string | null;
};

async function getOwnerNotionClient(): Promise<Client | null> {
  const conn = await prisma.notionConnection.findFirst({
    where: { user: { role: "ADMIN" } },
    select: { userId: true },
  });
  if (!conn) return null;
  return getNotionClient(conn.userId);
}

async function getOwnerOppgaveLink(): Promise<OppgaveLink | null> {
  const link = await prisma.notionDatabaseLink.findFirst({
    where: { type: "OPPGAVER", connection: { user: { role: "ADMIN" } } },
    select: {
      notionDatabaseId: true,
      notionDataSourceId: true,
      propTittel: true,
      propStatus: true,
      propForfaller: true,
    },
  });
  return link;
}

async function dataSourceId(klient: Client, databaseId: string): Promise<string | null> {
  try {
    const db = await klient.databases.retrieve({ database_id: databaseId });
    if (!("data_sources" in db) || !Array.isArray(db.data_sources)) return null;
    const first = db.data_sources[0];
    if (!first || typeof first !== "object" || !("id" in first)) return null;
    return String((first as { id: string }).id);
  } catch {
    return null;
  }
}

function titleOf(page: unknown): string {
  if (!page || typeof page !== "object" || !("properties" in page)) return "(uten tittel)";
  const props = (page as { properties: Record<string, unknown> }).properties;
  for (const v of Object.values(props)) {
    if (v && typeof v === "object" && "type" in v && (v as { type: string }).type === "title" && "title" in v) {
      const arr = (v as { title: { plain_text?: string }[] }).title;
      const txt = arr.map((t) => t.plain_text ?? "").join("").trim();
      if (txt) return txt;
    }
  }
  return "(uten tittel)";
}

// ── Les-verktøy (kjøres direkte) ─────────────────────────────────────────────

export async function notionSok(query: string, limit = 5): Promise<string> {
  const klient = await getOwnerNotionClient();
  if (!klient) return "Notion er ikke koblet (ingen ADMIN-tilkobling).";
  try {
    const res = await klient.search({ query, page_size: Math.min(Math.max(limit, 1), 10) });
    if (res.results.length === 0) return `Ingen Notion-treff for "${query}".`;
    return res.results
      .map((r) => {
        const id = "id" in r ? r.id : "";
        const url = "url" in r && typeof r.url === "string" ? r.url : "";
        return `- ${titleOf(r)}${url ? ` (${url})` : ` [${id}]`}`;
      })
      .join("\n");
  } catch (err) {
    return `Notion-søk feilet: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export async function notionLesSide(pageId: string): Promise<string> {
  const klient = await getOwnerNotionClient();
  if (!klient) return "Notion er ikke koblet (ingen ADMIN-tilkobling).";
  try {
    const blocks = await klient.blocks.children.list({ block_id: pageId, page_size: 100 });
    const linjer: string[] = [];
    for (const b of blocks.results) {
      if (!b || typeof b !== "object" || !("type" in b)) continue;
      const typed = b as { type: string } & Record<string, { rich_text?: { plain_text?: string }[] }>;
      const content = typed[typed.type];
      const rt = content?.rich_text;
      if (Array.isArray(rt)) {
        const tekst = rt.map((t) => t.plain_text ?? "").join("").trim();
        if (tekst) linjer.push(tekst);
      }
    }
    if (linjer.length === 0) return "Siden har ingen lesbar tekst.";
    return linjer.join("\n");
  } catch (err) {
    return `Kunne ikke lese siden: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export async function notionOppgaver(limit = 10): Promise<string> {
  const klient = await getOwnerNotionClient();
  const link = await getOwnerOppgaveLink();
  if (!klient) return "Notion er ikke koblet (ingen ADMIN-tilkobling).";
  if (!link) return "Ingen oppgave-database er koblet i Notion-oppsettet.";
  const dsId = link.notionDataSourceId ?? (await dataSourceId(klient, link.notionDatabaseId));
  if (!dsId) return "Fant ikke data source for oppgave-databasen.";
  try {
    const res = await klient.dataSources.query({
      data_source_id: dsId,
      page_size: Math.min(Math.max(limit, 1), 30),
    });
    if (res.results.length === 0) return "Ingen oppgaver funnet.";
    return res.results.map((p) => `- ${titleOf(p)}${"id" in p ? ` [${p.id}]` : ""}`).join("\n");
  } catch (err) {
    return `Kunne ikke hente oppgaver: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// ── Skrive-verktøy (KUN via bekreftelsesflyt) ────────────────────────────────

export async function notionOpprettOppgave(args: {
  tittel: string;
  forfaller?: string;
}): Promise<string> {
  const klient = await getOwnerNotionClient();
  const link = await getOwnerOppgaveLink();
  if (!klient) return "Notion er ikke koblet (ingen ADMIN-tilkobling).";
  if (!link) return "Ingen oppgave-database er koblet i Notion-oppsettet.";

  const properties: Record<string, unknown> = {
    [link.propTittel]: { title: [{ type: "text", text: { content: args.tittel } }] },
  };
  if (args.forfaller && link.propForfaller) {
    properties[link.propForfaller] = { date: { start: args.forfaller } };
  }
  try {
    const created = await klient.pages.create({
      parent: { database_id: link.notionDatabaseId },
      properties: properties as Parameters<Client["pages"]["create"]>[0]["properties"],
    });
    const url = "url" in created && typeof created.url === "string" ? created.url : "";
    return `Opprettet oppgave "${args.tittel}"${url ? ` (${url})` : ""}.`;
  } catch (err) {
    return `Kunne ikke opprette oppgave: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export async function notionFullforOppgave(args: {
  pageId: string;
  status: string;
}): Promise<string> {
  const klient = await getOwnerNotionClient();
  const link = await getOwnerOppgaveLink();
  if (!klient) return "Notion er ikke koblet (ingen ADMIN-tilkobling).";
  if (!link?.propStatus) return "Oppgave-databasen har ingen status-property satt opp.";
  try {
    const page = await klient.pages.retrieve({ page_id: args.pageId });
    const props = "properties" in page ? (page.properties as Record<string, { type?: string }>) : {};
    const propType = props[link.propStatus]?.type;
    const value =
      propType === "select"
        ? { select: { name: args.status } }
        : propType === "checkbox"
          ? { checkbox: true }
          : { status: { name: args.status } };
    await klient.pages.update({
      page_id: args.pageId,
      properties: { [link.propStatus]: value } as Parameters<Client["pages"]["update"]>[0]["properties"],
    });
    return `Markerte oppgaven som "${args.status}".`;
  } catch (err) {
    return `Kunne ikke oppdatere oppgaven: ${err instanceof Error ? err.message : String(err)}`;
  }
}
