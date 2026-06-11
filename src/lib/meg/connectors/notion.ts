// src/lib/meg/connectors/notion.ts
// Notion-connector for Meg. Kobler mot Anders' Second Brain i Notion:
// - Tasks-database  (NOTION_SB_TASKS_DB_ID)
// - Projects-database (NOTION_SB_PROJECTS_DB_ID)
// Les-funksjoner kjøres direkte; skrive kalles KUN via bekreftelsesflyt (confirm.ts).
import "server-only";
import { prisma } from "@/lib/prisma";
import { getNotionClient } from "@/lib/notion/client";
import type { Client } from "@notionhq/client";

// Env: plain UUID — prepend "collection://" for dataSources.query
const TASKS_UUID = process.env.NOTION_SB_TASKS_DB_ID ?? "";
const PROJECTS_UUID = process.env.NOTION_SB_PROJECTS_DB_ID ?? "";

async function getOwnerNotionClient(): Promise<Client | null> {
  const conn = await prisma.notionConnection.findFirst({
    where: { user: { role: "ADMIN" } },
    select: { userId: true },
  });
  if (!conn) return null;
  return getNotionClient(conn.userId);
}

type RawProp = Record<string, unknown>;

function titleOf(properties: RawProp): string {
  for (const prop of Object.values(properties)) {
    const p = prop as RawProp;
    if (p?.type === "title" && Array.isArray(p.title)) {
      const txt = (p.title as { plain_text?: string }[])
        .map((t) => t.plain_text ?? "")
        .join("")
        .trim();
      if (txt) return txt;
    }
  }
  return "(uten tittel)";
}

function statusNameOf(properties: RawProp, name: string): string {
  const prop = (properties[name] ?? {}) as RawProp;
  if (prop.type === "status") return ((prop.status as { name?: string } | null)?.name ?? "");
  if (prop.type === "select") return ((prop.select as { name?: string } | null)?.name ?? "");
  return "";
}

function dateOf(properties: RawProp, name: string): string {
  const prop = (properties[name] ?? {}) as RawProp;
  if (prop.type === "date") return ((prop.date as { start?: string } | null)?.start ?? "");
  return "";
}

// ── Generelt søk (direkte) ───────────────────────────────────────────────────

export async function notionSok(query: string, limit = 5): Promise<string> {
  const klient = await getOwnerNotionClient();
  if (!klient) return "Notion er ikke koblet (ingen ADMIN-tilkobling).";
  try {
    const res = await klient.search({ query, page_size: Math.min(Math.max(limit, 1), 10) });
    if (res.results.length === 0) return `Ingen Notion-treff for "${query}".`;
    return res.results
      .map((r) => {
        const url = "url" in r && typeof r.url === "string" ? r.url : "";
        const props = "properties" in r ? (r.properties as RawProp) : {};
        return `- ${titleOf(props)}${url ? ` (${url})` : ` [${r.id}]`}`;
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
    return linjer.length ? linjer.join("\n") : "Siden har ingen lesbar tekst.";
  } catch (err) {
    return `Kunne ikke lese siden: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// ── Oppgaver: les (direkte) ──────────────────────────────────────────────────

export async function notionOppgaver(limit = 15): Promise<string> {
  const klient = await getOwnerNotionClient();
  if (!klient) return "Notion er ikke koblet (ingen ADMIN-tilkobling).";
  if (!TASKS_UUID) return "NOTION_SB_TASKS_DB_ID mangler i miljøvariabler.";
  try {
    const res = await klient.dataSources.query({
      data_source_id: `collection://${TASKS_UUID}`,
      filter: { property: "Status", status: { does_not_equal: "Completed" } },
      sorts: [{ property: "Date", direction: "ascending" }],
      page_size: Math.min(Math.max(limit, 1), 30),
    });
    if (res.results.length === 0) return "Ingen aktive oppgaver i Second Brain.";
    return res.results
      .map((p) => {
        if (!("properties" in p)) return null;
        const props = p.properties as RawProp;
        const tittel = titleOf(props);
        const status = statusNameOf(props, "Status");
        const prioritet = statusNameOf(props, "Priority");
        const dato = dateOf(props, "Date");
        const deler = [tittel];
        if (status) deler.push(status);
        if (prioritet) deler.push(prioritet);
        if (dato) deler.push(dato);
        return `- ${deler.join(" · ")} [${p.id}]`;
      })
      .filter(Boolean)
      .join("\n");
  } catch (err) {
    return `Kunne ikke hente oppgaver: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// ── Prosjekter: les (direkte) ────────────────────────────────────────────────

export async function notionProsjekter(limit = 10): Promise<string> {
  const klient = await getOwnerNotionClient();
  if (!klient) return "Notion er ikke koblet (ingen ADMIN-tilkobling).";
  if (!PROJECTS_UUID) return "NOTION_SB_PROJECTS_DB_ID mangler i miljøvariabler.";
  try {
    const res = await klient.dataSources.query({
      data_source_id: `collection://${PROJECTS_UUID}`,
      filter: { property: "Status", status: { does_not_equal: "Completed" } },
      sorts: [{ property: "Priority", direction: "descending" }],
      page_size: Math.min(Math.max(limit, 1), 20),
    });
    if (res.results.length === 0) return "Ingen aktive prosjekter i Second Brain.";
    return res.results
      .map((p) => {
        if (!("properties" in p)) return null;
        const props = p.properties as RawProp;
        const tittel = titleOf(props);
        const status = statusNameOf(props, "Status");
        const prioritet = statusNameOf(props, "Priority");
        const dato = dateOf(props, "Timeline");
        const deler = [tittel];
        if (status) deler.push(status);
        if (prioritet) deler.push(prioritet);
        if (dato) deler.push(dato);
        return `- ${deler.join(" · ")} [${p.id}]`;
      })
      .filter(Boolean)
      .join("\n");
  } catch (err) {
    return `Kunne ikke hente prosjekter: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// ── Oppgaver: opprett (KUN via bekreftelse) ───────────────────────────────────

export async function notionOpprettOppgave(args: {
  tittel: string;
  prioritet?: string;
  forfaller?: string;
}): Promise<string> {
  const klient = await getOwnerNotionClient();
  if (!klient) return "Notion er ikke koblet (ingen ADMIN-tilkobling).";
  if (!TASKS_UUID) return "NOTION_SB_TASKS_DB_ID mangler i miljøvariabler.";
  try {
    const properties: Record<string, unknown> = {
      Name: { title: [{ type: "text", text: { content: args.tittel } }] },
      Status: { status: { name: "Next Action" } },
    };
    if (args.prioritet) properties["Priority"] = { select: { name: args.prioritet } };
    if (args.forfaller) properties["Date"] = { date: { start: args.forfaller } };
    const created = await klient.pages.create({
      parent: { database_id: TASKS_UUID },
      properties: properties as Parameters<Client["pages"]["create"]>[0]["properties"],
    });
    const url = "url" in created && typeof created.url === "string" ? created.url : "";
    return `Opprettet oppgave "${args.tittel}"${url ? ` (${url})` : ""}.`;
  } catch (err) {
    return `Kunne ikke opprette oppgave: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// ── Prosjekter: opprett (KUN via bekreftelse) ────────────────────────────────

export async function notionOpprettProsjekt(args: {
  navn: string;
  prioritet?: string;
}): Promise<string> {
  const klient = await getOwnerNotionClient();
  if (!klient) return "Notion er ikke koblet (ingen ADMIN-tilkobling).";
  if (!PROJECTS_UUID) return "NOTION_SB_PROJECTS_DB_ID mangler i miljøvariabler.";
  try {
    const properties: Record<string, unknown> = {
      Name: { title: [{ type: "text", text: { content: args.navn } }] },
      Status: { status: { name: "Not Started" } },
    };
    if (args.prioritet) properties["Priority"] = { select: { name: args.prioritet } };
    const created = await klient.pages.create({
      parent: { database_id: PROJECTS_UUID },
      properties: properties as Parameters<Client["pages"]["create"]>[0]["properties"],
    });
    const url = "url" in created && typeof created.url === "string" ? created.url : "";
    return `Opprettet prosjekt "${args.navn}"${url ? ` (${url})` : ""}.`;
  } catch (err) {
    return `Kunne ikke opprette prosjekt: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// ── Oppgaver: endre status (KUN via bekreftelse) ─────────────────────────────

export async function notionFullforOppgave(args: {
  pageId: string;
  status: string;
}): Promise<string> {
  const klient = await getOwnerNotionClient();
  if (!klient) return "Notion er ikke koblet (ingen ADMIN-tilkobling).";
  try {
    await klient.pages.update({
      page_id: args.pageId,
      properties: {
        Status: { status: { name: args.status } },
      } as Parameters<Client["pages"]["update"]>[0]["properties"],
    });
    return `Markerte oppgaven som "${args.status}".`;
  } catch (err) {
    return `Kunne ikke oppdatere oppgaven: ${err instanceof Error ? err.message : String(err)}`;
  }
}
