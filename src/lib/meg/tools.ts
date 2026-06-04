import "server-only";
import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import { storeLog } from "@/lib/meg/store";
import { hentNylige } from "@/lib/meg/read";
import { sokMinne } from "@/lib/meg/search";
import type { Classification } from "@/lib/meg/classify-schema";

// ────────────────────────────────────────────────────────────────────────────
// Tool-definisjoner (Anthropic SDK-format)
// ────────────────────────────────────────────────────────────────────────────

export const loggTool: Tool = {
  name: "logg",
  description:
    "Lagrer en oppføring i Anders' logg (me_log). Bruk når brukeren rapporterer " +
    "noe (søvn, trening, humør, mat, notater, o.l.). Returner en kort bekreftelse.",
  input_schema: {
    type: "object",
    properties: {
      kind: {
        type: "string",
        description:
          "Kategori: sleep | training | mood | food | note | crm | finance | goal | task",
      },
      summary: { type: "string", description: "Kort oppsummering av hva som logges" },
      value_num: { type: "number", description: "Numerisk verdi hvis relevant (f.eks. 7 for 7 timer søvn)" },
      value_unit: { type: "string", description: "Enhet (f.eks. timer, kg, km, kcal)" },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "Tagger for filtrering (f.eks. ['golf', 'løping'])",
      },
    },
    required: ["kind", "summary"],
  },
};

export const hentNyligeTool: Tool = {
  name: "hent_nylige",
  description:
    "Henter de siste logg-oppføringene fra Anders' logg. Bruk for å gi kontekst " +
    "til svar, eller når brukeren spør om hva han har logget.",
  input_schema: {
    type: "object",
    properties: {
      limit: { type: "number", description: "Antall oppføringer (default 10, maks 30)" },
      kind: {
        type: "string",
        description: "Filtrer på kategori (valgfritt): sleep | training | mood | food | note | crm | finance | goal | task",
      },
    },
    required: [],
  },
};

export const sokMinneTool: Tool = {
  name: "sok_minne",
  description:
    "Søker i Anders' minne og kunnskap: tidligere logger, destillerte minner " +
    "og indeksert kunnskap fra ak-brain + second-brain. Bruk når brukeren spør " +
    "om noe han har sagt/tenkt før, eller når svar trenger personlig kontekst.",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Det du vil finne (fritekst)" },
      limit: { type: "number", description: "Antall treff (default 5)" },
    },
    required: ["query"],
  },
};

export const MEG_ALL_TOOLS: Tool[] = [loggTool, hentNyligeTool, sokMinneTool];

// ────────────────────────────────────────────────────────────────────────────
// Input-typer
// ────────────────────────────────────────────────────────────────────────────

type LoggInput = {
  kind: string;
  summary: string;
  value_num?: number;
  value_unit?: string;
  tags?: string[];
};

type HentNyligeInput = {
  limit?: number;
  kind?: string;
};

type SokMinneInput = {
  query: string;
  limit?: number;
};

// ────────────────────────────────────────────────────────────────────────────
// Executor-tabell
// ────────────────────────────────────────────────────────────────────────────

export const MEG_EXEC_BY_NAME: Record<string, (args: unknown) => Promise<string>> = {
  logg: async (raw) => {
    const args = raw as LoggInput;
    const classification: Classification = {
      kind: args.kind as Classification["kind"],
      summary: args.summary,
      value_num: args.value_num,
      value_unit: args.value_unit,
      tags: args.tags ?? [],
    };
    await storeLog(args.summary, classification, "telegram_text");
    return `Logget (${args.kind}): ${args.summary}`;
  },

  hent_nylige: async (raw) => {
    const args = raw as HentNyligeInput;
    const limit = Math.min(Math.max(args.limit ?? 10, 1), 30);
    const rader = await hentNylige(limit, args.kind);
    if (rader.length === 0) return "Ingen oppføringer funnet.";
    return rader
      .map((r) => `[${r.created_at.slice(0, 10)} ${r.kind}] ${r.text}`)
      .join("\n");
  },

  sok_minne: async (raw) => {
    const args = raw as SokMinneInput;
    const limit = Math.min(Math.max(args.limit ?? 5, 1), 10);
    const treff = await sokMinne(args.query, limit);
    if (treff.length === 0) return "Ingen treff i minne eller kunnskap.";
    return treff
      .map((t) => {
        const sim = t.similarity !== null ? ` (${(t.similarity * 100).toFixed(0)}%)` : "";
        const ref = t.ref ? ` [${t.ref}]` : "";
        return `- ${t.source}${ref}${sim}: ${t.content}`;
      })
      .join("\n");
  },
};
