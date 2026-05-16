// Notion-klient for coaching-okt-sync.
// Singleton, lazy-init. Eksporterer helpers for a finne spillerprofil-side
// og opprette Coaching Session-side med strukturert analyse.

import { Client } from "@notionhq/client";

let _notion: Client | null = null;

export function notionKlient(): Client {
  if (_notion) return _notion;
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    throw new Error("NOTION_API_KEY mangler i environment");
  }
  _notion = new Client({ auth: apiKey });
  return _notion;
}

export const NOTION_PLAYER_DB_ID = process.env.NOTION_PLAYER_DB_ID;
export const NOTION_COACHING_DB_ID = process.env.NOTION_COACHING_DB_ID;

// ----------------------------------------------------------------------------
// Block-builders (rich_text-splitting + heading/paragraph/callout/toggle)
// ----------------------------------------------------------------------------

type BlockChild = Parameters<Client["blocks"]["children"]["append"]>[0]["children"][number];

function richText(text: string): { type: "text"; text: { content: string } }[] {
  const MAX = 1900;
  if (text.length <= MAX) return [{ type: "text", text: { content: text } }];
  const chunks: { type: "text"; text: { content: string } }[] = [];
  for (let i = 0; i < text.length; i += MAX) {
    chunks.push({ type: "text", text: { content: text.slice(i, i + MAX) } });
  }
  return chunks;
}

function heading2(content: string): BlockChild {
  return {
    object: "block",
    type: "heading_2",
    heading_2: { rich_text: [{ type: "text", text: { content } }] },
  } as BlockChild;
}

function heading3(content: string): BlockChild {
  return {
    object: "block",
    type: "heading_3",
    heading_3: { rich_text: [{ type: "text", text: { content } }] },
  } as BlockChild;
}

function paragraph(content: string): BlockChild {
  return {
    object: "block",
    type: "paragraph",
    paragraph: { rich_text: richText(content) },
  } as BlockChild;
}

function callout(content: string): BlockChild {
  return {
    object: "block",
    type: "callout",
    callout: {
      rich_text: richText(content),
      icon: { type: "emoji", emoji: "\u{1F3AF}" },
      color: "green_background",
    },
  } as BlockChild;
}

function toggleBlock(content: string, summary: string): BlockChild {
  const MAX = 1900;
  const paragraphs: BlockChild[] = [];
  if (content.length <= MAX) {
    paragraphs.push(paragraph(content));
  } else {
    for (let i = 0; i < content.length; i += MAX) {
      paragraphs.push(paragraph(content.slice(i, i + MAX)));
    }
  }
  return {
    object: "block",
    type: "toggle",
    toggle: {
      rich_text: [{ type: "text", text: { content: summary } }],
      children: paragraphs,
    },
  } as BlockChild;
}

// ----------------------------------------------------------------------------
// Notion v5+ krever data_source_id for query (ikke database_id)
// ----------------------------------------------------------------------------

async function hentDataSourceId(databaseId: string): Promise<string | null> {
  const klient = notionKlient();
  try {
    const db = await klient.databases.retrieve({ database_id: databaseId });
    if (!("data_sources" in db) || !Array.isArray(db.data_sources)) return null;
    const forste = db.data_sources[0];
    if (!forste || typeof forste !== "object" || !("id" in forste)) return null;
    return String((forste as { id: string }).id);
  } catch (err) {
    console.error("[notion] kunne ikke hente data source for db", databaseId, err);
    return null;
  }
}

// ----------------------------------------------------------------------------
// finnSpillerSideId
// ----------------------------------------------------------------------------

/**
 * Soker i Spillerprofiler-databasen etter en side med tittel som matcher navn.
 * Case-insensitive substring-match - forste treff returneres.
 * Returnerer null hvis ingen treff eller hvis NOTION_PLAYER_DB_ID mangler.
 */
export async function finnSpillerSideId(navn: string): Promise<string | null> {
  if (!NOTION_PLAYER_DB_ID) return null;
  const klient = notionKlient();
  const navnLower = navn.trim().toLowerCase();
  if (!navnLower) return null;

  const dataSourceId = await hentDataSourceId(NOTION_PLAYER_DB_ID);
  if (!dataSourceId) return null;

  try {
    type QueryResult = Awaited<ReturnType<Client["dataSources"]["query"]>>;
    let res: QueryResult | null = null;
    for (const propName of ["Name", "Navn", "Title", "Tittel"]) {
      try {
        res = await klient.dataSources.query({
          data_source_id: dataSourceId,
          filter: {
            property: propName,
            title: { contains: navn.trim() },
          },
          page_size: 5,
        });
        if (res.results.length > 0) break;
      } catch {
        continue;
      }
    }

    if (!res || res.results.length === 0) return null;

    for (const page of res.results) {
      if (!("properties" in page)) continue;
      const props = page.properties as Record<string, unknown>;
      for (const v of Object.values(props)) {
        if (
          v &&
          typeof v === "object" &&
          "type" in v &&
          (v as { type: string }).type === "title" &&
          "title" in v
        ) {
          const titleArr = (v as { title: { plain_text?: string }[] }).title;
          const tekst = titleArr.map((t) => t.plain_text ?? "").join("");
          if (tekst.toLowerCase().includes(navnLower)) {
            return page.id;
          }
        }
      }
    }
    return null;
  } catch (err) {
    console.error("[notion] finnSpillerSideId feilet", err);
    return null;
  }
}

// ----------------------------------------------------------------------------
// opprettCoachingSesjon
// ----------------------------------------------------------------------------

export type OpprettCoachingSesjonInput = {
  spillerNavn: string;
  spillerSideId?: string | null;
  dato: Date;
  varighetMin: number;
  analyse: {
    teknisk: string;
    taktisk: string;
    mental: string;
    fysisk: string;
    hjemmelekse: string;
    coachAnalyse: string;
    nesteOktAnbefaling: string;
  };
  raaTranskripsjon?: string;
};

export type OpprettCoachingSesjonResultat = {
  pageId: string;
  url: string;
};

function formatDatoNorsk(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Oppretter en ny "Coaching Session"-side i Notion-databasen og fyller den
 * med strukturert analyse. Returnerer page-ID og URL.
 *
 * Bruker Notion v5+ data_source-API: parent kan vaere database_id (Notion
 * legger automatisk i default data source).
 */
export async function opprettCoachingSesjon(
  input: OpprettCoachingSesjonInput,
): Promise<OpprettCoachingSesjonResultat> {
  if (!NOTION_COACHING_DB_ID) {
    throw new Error("NOTION_COACHING_DB_ID mangler i environment");
  }
  const klient = notionKlient();
  const datoNorsk = formatDatoNorsk(input.dato);
  const tittel = `${input.spillerNavn} - ${datoNorsk}`;

  const properties: Record<string, unknown> = {
    Name: {
      title: [{ type: "text", text: { content: tittel } }],
    },
    Dato: {
      date: { start: input.dato.toISOString().split("T")[0] },
    },
    Varighet: {
      number: input.varighetMin,
    },
  };
  if (input.spillerSideId) {
    properties.Spiller = {
      relation: [{ id: input.spillerSideId }],
    };
  }

  const children: BlockChild[] = [
    heading2("Teknisk"),
    paragraph(input.analyse.teknisk),
    heading2("Taktisk"),
    paragraph(input.analyse.taktisk),
    heading2("Mental"),
    paragraph(input.analyse.mental),
    heading2("Fysisk"),
    paragraph(input.analyse.fysisk),
    heading2("Hjemmelekse"),
    callout(input.analyse.hjemmelekse),
    heading2("Coach-analyse"),
    paragraph(input.analyse.coachAnalyse),
    heading2("Neste okt - anbefaling"),
    paragraph(input.analyse.nesteOktAnbefaling),
  ];
  if (input.raaTranskripsjon && input.raaTranskripsjon.trim()) {
    children.push(heading3("Ratranskripsjon"));
    children.push(toggleBlock(input.raaTranskripsjon, "Klikk for a vise full transkripsjon"));
  }

  let pageId: string;
  let url: string;
  try {
    const created = await klient.pages.create({
      parent: { database_id: NOTION_COACHING_DB_ID },
      properties: properties as Parameters<Client["pages"]["create"]>[0]["properties"],
      children,
    });
    pageId = created.id;
    url = "url" in created && typeof created.url === "string" ? created.url : "";
  } catch (err) {
    console.warn(
      "[notion] full properties-create feilet, prover minimal",
      err,
    );
    const minimal = await klient.pages.create({
      parent: { database_id: NOTION_COACHING_DB_ID },
      properties: {
        Name: {
          title: [{ type: "text", text: { content: tittel } }],
        },
      } as Parameters<Client["pages"]["create"]>[0]["properties"],
      children,
    });
    pageId = minimal.id;
    url = "url" in minimal && typeof minimal.url === "string" ? minimal.url : "";
  }

  return { pageId, url };
}

// ----------------------------------------------------------------------------
// appendTilSpillerprofil
// ----------------------------------------------------------------------------

/**
 * Appender en linje "[YYYY-MM-DD] {sammendrag}" til Spillerprofil-siden.
 * Hvis siden har en "Coaching-logg"-heading, appender vi som child der.
 * Ellers appender vi som siste child pa siden.
 */
export async function appendTilSpillerprofil(
  spillerSideId: string,
  datoStr: string,
  sammendrag: string,
): Promise<void> {
  const klient = notionKlient();
  const linje = `[${datoStr}] ${sammendrag}`;

  try {
    const blocks = await klient.blocks.children.list({
      block_id: spillerSideId,
      page_size: 100,
    });
    let parentId: string = spillerSideId;
    for (const b of blocks.results) {
      if (!("type" in b)) continue;
      const typed = b as {
        id: string;
        type: string;
        heading_1?: { rich_text: { plain_text?: string }[] };
        heading_2?: { rich_text: { plain_text?: string }[] };
        heading_3?: { rich_text: { plain_text?: string }[] };
      };
      const richTextArr =
        typed.type === "heading_1"
          ? typed.heading_1?.rich_text
          : typed.type === "heading_2"
            ? typed.heading_2?.rich_text
            : typed.type === "heading_3"
              ? typed.heading_3?.rich_text
              : undefined;
      if (!richTextArr) continue;
      const tekst = richTextArr.map((t) => t.plain_text ?? "").join("");
      if (tekst.toLowerCase().includes("coaching-logg")) {
        parentId = typed.id;
        break;
      }
    }

    await klient.blocks.children.append({
      block_id: parentId,
      children: [paragraph(linje)],
    });
  } catch (err) {
    console.error("[notion] appendTilSpillerprofil feilet", err);
    throw err;
  }
}
