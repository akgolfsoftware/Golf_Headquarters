import "server-only";
import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import { storeLog } from "@/lib/meg/store";
import { hentNylige } from "@/lib/meg/read";
import { sokMinne } from "@/lib/meg/search";
import type { Classification } from "@/lib/meg/classify-schema";
import { notionSok, notionLesSide, notionOppgaver } from "@/lib/meg/connectors/notion";
import { helseHent } from "@/lib/meg/connectors/health";
import { gmailSok, gmailLesTraad, diskSok, diskLesFil, kalenderAgenda } from "@/lib/meg/connectors/google";
import { createPending } from "@/lib/meg/pending";

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

// ── Notion (Fase 3) ──────────────────────────────────────────────────────────

export const notionSokTool: Tool = {
  name: "notion_sok",
  description:
    "Søker i Anders' Notion-arbeidsområde (sider, databaser). Bruk for å finne " +
    "notater, prosjekter eller dokumenter. Returnerer titler + side-id/url.",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Det du leter etter (fritekst)" },
      limit: { type: "number", description: "Antall treff (default 5, maks 10)" },
    },
    required: ["query"],
  },
};

export const notionLesSideTool: Tool = {
  name: "notion_les_side",
  description: "Leser tekstinnholdet på en Notion-side. Bruk page-id fra notion_sok.",
  input_schema: {
    type: "object",
    properties: { pageId: { type: "string", description: "Notion side-id" } },
    required: ["pageId"],
  },
};

export const notionOppgaverTool: Tool = {
  name: "notion_oppgaver",
  description:
    "Henter oppgaver fra Anders' oppgave-database i Notion. Bruk når han spør om " +
    "oppgavelista. Returnerer oppgave-titler + side-id (brukes til å fullføre dem).",
  input_schema: {
    type: "object",
    properties: { limit: { type: "number", description: "Antall (default 10, maks 30)" } },
    required: [],
  },
};

export const notionOpprettOppgaveTool: Tool = {
  name: "notion_opprett_oppgave",
  description:
    "Foreslår å opprette en oppgave i Notion. Utfører IKKE direkte — lager et " +
    "forslag som Anders må bekrefte med BEKREFT. Bruk ved 'lag oppgave: ...'.",
  input_schema: {
    type: "object",
    properties: {
      tittel: { type: "string", description: "Oppgavens tittel" },
      forfaller: { type: "string", description: "Forfallsdato ISO (YYYY-MM-DD), valgfritt" },
    },
    required: ["tittel"],
  },
};

export const notionFullforOppgaveTool: Tool = {
  name: "notion_fullfor_oppgave",
  description:
    "Foreslår å markere en Notion-oppgave med en status. Utfører IKKE direkte — " +
    "lager et forslag Anders må bekrefte med BEKREFT. Bruk page-id fra notion_oppgaver.",
  input_schema: {
    type: "object",
    properties: {
      pageId: { type: "string", description: "Notion side-id for oppgaven" },
      status: { type: "string", description: "Statusverdi, f.eks. 'Ferdig'" },
    },
    required: ["pageId", "status"],
  },
};

// ── Helse (Fase 3b) ──────────────────────────────────────────────────────────

export const helseHentTool: Tool = {
  name: "helse_hent",
  description:
    "Henter Anders' helsedata (søvn, puls, HRV, skritt m.m.) fra samlet kilde " +
    "(Apple Watch + Garmin). Bruk ved spørsmål om søvn/recovery/trender.",
  input_schema: {
    type: "object",
    properties: {
      metric: {
        type: "string",
        description: "Metrikk å filtrere på, f.eks. sleep_hours, resting_hr, hrv, steps, vo2max (valgfritt)",
      },
      dager: { type: "number", description: "Antall dager bakover (default 14)" },
    },
    required: [],
  },
};

// ── Gmail (Fase 4) ───────────────────────────────────────────────────────────

export const gmailSokTool: Tool = {
  name: "gmail_sok",
  description:
    "Søker i Anders' Gmail. Bruk Gmail-søkesyntaks (f.eks. 'from:markus is:unread', " +
    "'newer_than:2d'). Returnerer emne, avsender, utdrag + tråd-id.",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Gmail-søkestreng" },
      limit: { type: "number", description: "Antall treff (default 5, maks 10)" },
    },
    required: ["query"],
  },
};

export const gmailLesTraadTool: Tool = {
  name: "gmail_les_traad",
  description: "Leser en hel e-posttråd. Bruk tråd-id fra gmail_sok.",
  input_schema: {
    type: "object",
    properties: { threadId: { type: "string", description: "Gmail tråd-id" } },
    required: ["threadId"],
  },
};

export const gmailLagUtkastTool: Tool = {
  name: "gmail_lag_utkast",
  description:
    "Foreslår å sende en e-post. Sender IKKE direkte — lager et forslag med " +
    "preview som Anders må bekrefte med BEKREFT. Bruk ved 'svar på ...' / 'send mail til ...'.",
  input_schema: {
    type: "object",
    properties: {
      til: { type: "string", description: "Mottakers e-postadresse" },
      emne: { type: "string", description: "Emnefelt" },
      tekst: { type: "string", description: "E-postens brødtekst" },
    },
    required: ["til", "emne", "tekst"],
  },
};

// ── Google Kalender ──────────────────────────────────────────────────────────

export const kalenderAgendaTool: Tool = {
  name: "kalender_agenda",
  description:
    "Henter Anders' kommende kalender-hendelser fra Google Kalender. Bruk ved " +
    "'hva skjer i dag/denne uka', 'når har jeg ...', eller for dagens agenda.",
  input_schema: {
    type: "object",
    properties: {
      dager: { type: "number", description: "Antall dager fremover (default 1 = i dag, maks 30)" },
    },
    required: [],
  },
};

// ── Google Disk (Fase 5) ─────────────────────────────────────────────────────

export const diskSokTool: Tool = {
  name: "disk_sok",
  description: "Søker etter filer i Anders' Google Disk (på filnavn). Returnerer navn + fil-id.",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Del av filnavnet" },
      limit: { type: "number", description: "Antall treff (default 5, maks 10)" },
    },
    required: ["query"],
  },
};

export const diskLesFilTool: Tool = {
  name: "disk_les_fil",
  description: "Leser tekstinnholdet i en Disk-fil (også Google Docs). Bruk fil-id fra disk_sok.",
  input_schema: {
    type: "object",
    properties: { fileId: { type: "string", description: "Google Disk fil-id" } },
    required: ["fileId"],
  },
};

export const diskOpprettTool: Tool = {
  name: "disk_opprett",
  description:
    "Foreslår å lagre et notat som fil i Disk. Oppretter IKKE direkte — lager et " +
    "forslag Anders må bekrefte med BEKREFT.",
  input_schema: {
    type: "object",
    properties: {
      navn: { type: "string", description: "Filnavn" },
      innhold: { type: "string", description: "Tekstinnhold" },
    },
    required: ["navn", "innhold"],
  },
};

export const MEG_ALL_TOOLS: Tool[] = [
  loggTool,
  hentNyligeTool,
  sokMinneTool,
  notionSokTool,
  notionLesSideTool,
  notionOppgaverTool,
  notionOpprettOppgaveTool,
  notionFullforOppgaveTool,
  helseHentTool,
  gmailSokTool,
  gmailLesTraadTool,
  gmailLagUtkastTool,
  kalenderAgendaTool,
  diskSokTool,
  diskLesFilTool,
  diskOpprettTool,
];

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

type NotionSokInput = { query: string; limit?: number };
type NotionLesSideInput = { pageId: string };
type NotionOppgaverInput = { limit?: number };
type NotionOpprettOppgaveInput = { tittel: string; forfaller?: string };
type NotionFullforOppgaveInput = { pageId: string; status: string };
type HelseHentInput = { metric?: string; dager?: number };
type GmailSokInput = { query: string; limit?: number };
type GmailLesTraadInput = { threadId: string };
type GmailLagUtkastInput = { til: string; emne: string; tekst: string };
type KalenderAgendaInput = { dager?: number };
type DiskSokInput = { query: string; limit?: number };
type DiskLesFilInput = { fileId: string };
type DiskOpprettInput = { navn: string; innhold: string };

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

  // ── Notion: les-verktøy (kjøres direkte) ──
  notion_sok: async (raw) => {
    const args = raw as NotionSokInput;
    return notionSok(args.query, args.limit ?? 5);
  },

  notion_les_side: async (raw) => {
    const args = raw as NotionLesSideInput;
    return notionLesSide(args.pageId);
  },

  notion_oppgaver: async (raw) => {
    const args = raw as NotionOppgaverInput;
    return notionOppgaver(args.limit ?? 10);
  },

  // ── Notion: skrive-verktøy (lager KUN ventende handling) ──
  notion_opprett_oppgave: async (raw) => {
    const args = raw as NotionOpprettOppgaveInput;
    const summary = `Opprette oppgave i Notion: "${args.tittel}"${args.forfaller ? ` (forfaller ${args.forfaller})` : ""}`;
    await createPending("notion_opprett_oppgave", args, summary);
    return `Forslag klart: ${summary}. Be Anders svare BEKREFT for å utføre.`;
  },

  notion_fullfor_oppgave: async (raw) => {
    const args = raw as NotionFullforOppgaveInput;
    const summary = `Sette Notion-oppgave til status "${args.status}"`;
    await createPending("notion_fullfor_oppgave", args, summary);
    return `Forslag klart: ${summary}. Be Anders svare BEKREFT for å utføre.`;
  },

  // ── Helse (kjøres direkte) ──
  helse_hent: async (raw) => {
    const args = raw as HelseHentInput;
    return helseHent(args.metric, args.dager ?? 14);
  },

  // ── Gmail: les (kjøres direkte) ──
  gmail_sok: async (raw) => {
    const args = raw as GmailSokInput;
    return gmailSok(args.query, args.limit ?? 5);
  },

  gmail_les_traad: async (raw) => {
    const args = raw as GmailLesTraadInput;
    return gmailLesTraad(args.threadId);
  },

  // ── Gmail: send (lager KUN ventende handling med tool_name=gmail_send) ──
  gmail_lag_utkast: async (raw) => {
    const args = raw as GmailLagUtkastInput;
    const preview = args.tekst.length > 200 ? `${args.tekst.slice(0, 200)}…` : args.tekst;
    const summary = `Sende e-post til ${args.til} — "${args.emne}":\n${preview}`;
    await createPending("gmail_send", args, summary);
    return `Forslag klart:\n${summary}\n\nBe Anders svare BEKREFT for å sende.`;
  },

  // ── Kalender: les (kjøres direkte) ──
  kalender_agenda: async (raw) => {
    const args = raw as KalenderAgendaInput;
    return kalenderAgenda(args.dager ?? 1);
  },

  // ── Disk: les (kjøres direkte) ──
  disk_sok: async (raw) => {
    const args = raw as DiskSokInput;
    return diskSok(args.query, args.limit ?? 5);
  },

  disk_les_fil: async (raw) => {
    const args = raw as DiskLesFilInput;
    return diskLesFil(args.fileId);
  },

  // ── Disk: opprett (lager KUN ventende handling) ──
  disk_opprett: async (raw) => {
    const args = raw as DiskOpprettInput;
    const summary = `Opprette fil "${args.navn}" i Disk`;
    await createPending("disk_opprett", args, summary);
    return `Forslag klart: ${summary}. Be Anders svare BEKREFT for å utføre.`;
  },
};
