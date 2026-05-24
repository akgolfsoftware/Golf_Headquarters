// Notion → OppgaveCache sync.
// Incremental: bruker `last_edited_time` filter for å bare hente endringer
// siden forrige sync. Upsert per page.

import type { Client } from "@notionhq/client";
import { prisma } from "@/lib/prisma";
import { decrypt } from "./crypto";
import { Client as NotionClient } from "@notionhq/client";
import { logError } from "@/lib/error-tracking";

// Notion API-svar er typed `unknown` av SDK-en for properties (avhenger av kolonne-type).
// Vi parser defensivt og dropper feltet hvis det ikke er forventet shape.

type SyncResult = {
  pagesUpserted: number;
  errors: number;
  durationMs: number;
};

export async function syncNotionDatabase(linkId: string): Promise<SyncResult> {
  const start = Date.now();
  let pagesUpserted = 0;
  let errors = 0;

  const link = await prisma.notionDatabaseLink.findUnique({
    where: { id: linkId },
    include: { connection: true },
  });
  if (!link) {
    throw new Error(`NotionDatabaseLink ${linkId} ikke funnet`);
  }

  const token = decrypt(link.connection.accessTokenEnc);
  const notion = new NotionClient({ auth: token });

  // Bygg filter for incremental sync. Hvis lastSyncAt finnes,
  // hent kun pages som er endret etter det.
  const sinceIso = link.lastSyncAt
    ? new Date(link.lastSyncAt.getTime() - 5 * 60 * 1000).toISOString() // 5 min overlap
    : undefined;

  try {
    let cursor: string | undefined = undefined;
    do {
      const queryArgs: Parameters<typeof notion.dataSources.query>[0] = {
        data_source_id: link.notionDataSourceId ?? link.notionDatabaseId,
        start_cursor: cursor,
        page_size: 100,
      };
      if (sinceIso) {
        queryArgs.filter = {
          timestamp: "last_edited_time",
          last_edited_time: { on_or_after: sinceIso },
        };
      }

      const res = await notion.dataSources.query(queryArgs);

      for (const item of res.results) {
        if (item.object !== "page") continue;
        try {
          await upsertOppgaveFromPage(notion, link, item as unknown as NotionPage);
          pagesUpserted++;
        } catch (err) {
          errors++;
          await logError({
            context: "notion.sync.upsert-page",
            error: err,
            meta: { linkId: link.id, pageId: (item as { id?: string }).id },
            severity: "warn",
          });
        }
      }

      cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
    } while (cursor);

    const total = await prisma.oppgaveCache.count({
      where: { databaseLinkId: link.id },
    });

    await prisma.notionDatabaseLink.update({
      where: { id: link.id },
      data: { lastSyncAt: new Date(), pagesCount: total },
    });

    await prisma.notionConnection.update({
      where: { id: link.connection.id },
      data: { lastSyncAt: new Date(), lastSyncError: null },
    });
  } catch (err) {
    await logError({
      context: "notion.sync.database",
      error: err,
      meta: { linkId: link.id },
    });
    await prisma.notionConnection.update({
      where: { id: link.connection.id },
      data: { lastSyncError: err instanceof Error ? err.message : String(err) },
    });
    throw err;
  }

  return {
    pagesUpserted,
    errors,
    durationMs: Date.now() - start,
  };
}

// ---------- Page-parsing ----------

type NotionPage = {
  id: string;
  url: string;
  last_edited_time: string;
  properties: Record<string, NotionProperty>;
};

// Notion property-shapes er typed `unknown` av SDK pga deres dynamiske natur.
// Vi bruker en intern tagged shape og parser defensivt.
type NotionProperty = { type: string; [key: string]: unknown };

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function readString(prop: NotionProperty | undefined): string | null {
  if (!prop) return null;
  if (prop.type === "title" && Array.isArray(prop.title)) {
    const parts = (prop.title as unknown[])
      .filter(isObject)
      .map((t) => (typeof t.plain_text === "string" ? t.plain_text : ""));
    return parts.join("") || null;
  }
  if (prop.type === "rich_text" && Array.isArray(prop.rich_text)) {
    const parts = (prop.rich_text as unknown[])
      .filter(isObject)
      .map((t) => (typeof t.plain_text === "string" ? t.plain_text : ""));
    return parts.join("") || null;
  }
  if (prop.type === "select" && isObject(prop.select)) {
    return typeof prop.select.name === "string" ? prop.select.name : null;
  }
  if (prop.type === "status" && isObject(prop.status)) {
    return typeof prop.status.name === "string" ? prop.status.name : null;
  }
  if (prop.type === "url") {
    return typeof prop.url === "string" ? prop.url : null;
  }
  return null;
}

function readMultiSelect(prop: NotionProperty | undefined): string[] {
  if (!prop || prop.type !== "multi_select" || !Array.isArray(prop.multi_select)) return [];
  return (prop.multi_select as unknown[])
    .filter(isObject)
    .map((m) => (typeof m.name === "string" ? m.name : ""))
    .filter((n) => n.length > 0);
}

function readDate(prop: NotionProperty | undefined): Date | null {
  if (!prop || prop.type !== "date" || !isObject(prop.date)) return null;
  const start = prop.date.start;
  if (typeof start !== "string") return null;
  const d = new Date(start);
  return isNaN(d.getTime()) ? null : d;
}

function readPeopleNames(prop: NotionProperty | undefined): string[] {
  if (!prop || prop.type !== "people" || !Array.isArray(prop.people)) return [];
  return (prop.people as unknown[])
    .filter(isObject)
    .map((p) => p.name)
    .filter((n): n is string => typeof n === "string" && n.length > 0);
}

function readRelationIds(prop: NotionProperty | undefined): string[] {
  if (!prop || prop.type !== "relation" || !Array.isArray(prop.relation)) return [];
  return (prop.relation as unknown[])
    .filter(isObject)
    .map((r) => (typeof r.id === "string" ? r.id : ""))
    .filter((id) => id.length > 0);
}

async function upsertOppgaveFromPage(
  _notion: Client,
  link: {
    id: string;
    propTittel: string;
    propStatus: string | null;
    propPrioritet: string | null;
    propTildelt: string | null;
    propForfaller: string | null;
    propLenke: string | null;
    propNotater: string | null;
    propProsjekt: string | null;
    propSelskap: string | null;
  },
  page: NotionPage,
): Promise<void> {
  const props = page.properties;

  const tittel = readString(props[link.propTittel]) ?? "(uten tittel)";
  const status = link.propStatus ? readString(props[link.propStatus]) : null;
  const prioritet = link.propPrioritet ? readString(props[link.propPrioritet]) : null;
  const selskap = link.propSelskap ? readMultiSelect(props[link.propSelskap]) : [];
  const forfaller = link.propForfaller ? readDate(props[link.propForfaller]) : null;
  const lenke = link.propLenke ? readString(props[link.propLenke]) : null;
  const notater = link.propNotater ? readString(props[link.propNotater]) : null;

  // Tildelt — kan være "person"-felt (default) eller "rich_text"/multi_select
  // hvis Anders bruker tekst-felt for å nevne navn.
  let tildeltNavn: string[] = [];
  if (link.propTildelt) {
    const prop = props[link.propTildelt];
    if (prop?.type === "people") {
      tildeltNavn = readPeopleNames(prop);
    } else if (prop?.type === "multi_select") {
      tildeltNavn = readMultiSelect(prop);
    } else {
      const txt = readString(prop);
      if (txt) tildeltNavn = [txt];
    }
  }

  const prosjektIds = link.propProsjekt ? readRelationIds(props[link.propProsjekt]) : [];

  await prisma.oppgaveCache.upsert({
    where: { notionPageId: page.id },
    create: {
      databaseLinkId: link.id,
      notionPageId: page.id,
      notionUrl: page.url,
      tittel,
      status,
      prioritet,
      selskap,
      forfaller,
      notater,
      lenke,
      tildeltNavn,
      prosjektIds,
      notionLastEdited: new Date(page.last_edited_time),
    },
    update: {
      tittel,
      status,
      prioritet,
      selskap,
      forfaller,
      notater,
      lenke,
      tildeltNavn,
      prosjektIds,
      notionLastEdited: new Date(page.last_edited_time),
      syncedAt: new Date(),
    },
  });
}
