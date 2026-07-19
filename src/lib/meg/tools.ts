import "server-only";
import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import { storeLog } from "@/lib/meg/store";
import { hentNylige } from "@/lib/meg/read";
import { sokMinne } from "@/lib/meg/search";
import type { Classification } from "@/lib/meg/classify-schema";
import { notionSok, notionLesSide, notionOppgaver, notionProsjekter } from "@/lib/meg/connectors/notion";
import { helseHent } from "@/lib/meg/connectors/health";
import { gmailSok, gmailLesTraad, diskSok, diskLesFil, kalenderAgenda } from "@/lib/meg/connectors/google";
import { stripeSaldo, stripeBetalinger, stripeAbonnementer, stripeFakturaer, stripeKundeSok } from "@/lib/meg/connectors/stripe";
import { createPending } from "@/lib/meg/pending";
import { bekreftLonn } from "@/lib/agents/tripletex-lonn-agent";
import { bekreftBallplukking } from "@/lib/agents/gfgk-ballplukking-agent";

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
      status: { type: "string", description: "Statusverdi: Completed, Next Action, Waiting On, Someday/Maybe, Inbox" },
    },
    required: ["pageId", "status"],
  },
};

export const notionProsjekterTool: Tool = {
  name: "notion_prosjekter",
  description:
    "Henter aktive prosjekter fra Anders' Second Brain i Notion. Bruk når han spør om " +
    "prosjektlista eller vil se hva som er i gang. Returnerer prosjektnavn, status, prioritet + id.",
  input_schema: {
    type: "object",
    properties: { limit: { type: "number", description: "Antall (default 10, maks 20)" } },
    required: [],
  },
};

export const notionOpprettProsjektTool: Tool = {
  name: "notion_opprett_prosjekt",
  description:
    "Foreslår å opprette et prosjekt i Notion Second Brain. Utfører IKKE direkte — " +
    "lager et forslag som Anders må bekrefte med BEKREFT.",
  input_schema: {
    type: "object",
    properties: {
      navn: { type: "string", description: "Prosjektets navn" },
      prioritet: { type: "string", description: "Prioritet: Urgent, High, Medium, Low (valgfritt)" },
    },
    required: ["navn"],
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

// ── Stripe ───────────────────────────────────────────────────────────────────

export const stripeSaldoTool: Tool = {
  name: "stripe_saldo",
  description: "Viser nåværende Stripe-saldo (tilgjengelig + ventende). Bruk ved 'hva er saldo' / 'penger i Stripe'.",
  input_schema: { type: "object", properties: {}, required: [] },
};

export const stripeBetalingerTool: Tool = {
  name: "stripe_betalinger",
  description: "Viser nylige Stripe-betalinger. Bruk ved 'hva har kommet inn', 'betalinger i dag/uka'.",
  input_schema: {
    type: "object",
    properties: {
      dager: { type: "number", description: "Antall dager bakover (default 7)" },
      limit: { type: "number", description: "Maks antall (default 10)" },
    },
    required: [],
  },
};

export const stripeAbonnementerTool: Tool = {
  name: "stripe_abonnementer",
  description: "Viser alle aktive Stripe-abonnementer med kunde og pris. Bruk ved 'hvem abonnerer', 'aktive kunder'.",
  input_schema: {
    type: "object",
    properties: { limit: { type: "number", description: "Maks antall (default 20)" } },
    required: [],
  },
};

export const stripeFakturaerTool: Tool = {
  name: "stripe_fakturaer",
  description: "Viser nylige Stripe-fakturaer med status (betalt/åpen). Bruk ved 'fakturaer', 'ubetalte'.",
  input_schema: {
    type: "object",
    properties: { limit: { type: "number", description: "Antall (default 10)" } },
    required: [],
  },
};

export const stripeKundeSokTool: Tool = {
  name: "stripe_kunde_sok",
  description: "Søker opp en kunde i Stripe på e-post eller navn. Returnerer kunde-id, e-post, opprettelsesdato.",
  input_schema: {
    type: "object",
    properties: { query: { type: "string", description: "E-post eller navn" } },
    required: ["query"],
  },
};

// ── Tripletex lønn (Agentic OS Steg 2) ───────────────────────────────────────
// Se .claude/rules/admin-tripletex.md: agenten UTFØRER aldri lønnskjøringer —
// dette tool-et lar Anders BEKREFTE at han selv har kjørt lønnen, som stopper
// purringen den 6. Kjøres direkte (som `logg`) — ikke via BEKREFT-flyten,
// siden det bare registrerer en bekreftelse Anders allerede har gjort, ikke
// en ny skrive-handling agenten selv foreslår.

export const lonnBekreftTool: Tool = {
  name: "lonn_bekreft",
  description:
    "Bekrefter at månedens lønnskjøring i Tripletex er utført. Bruk KUN når " +
    "Anders selv sier noe som «lønn ok», «bekreft lønn», «lønn er kjørt» " +
    "e.l. Kjøres direkte — stopper den automatiske purringen den 6.",
  input_schema: { type: "object", properties: {}, required: [] },
};

// ── GFGK ballplukking (Agentic OS Steg 2) ────────────────────────────────────
// Se .claude/rules/gfgk-junior.md: agenten regner ALDRI ut hvem sin tur det
// er i rotasjonen — dette tool-et lar Anders BEKREFTE at ansvarlig for
// torsdagens ballplukking er avklart for uka, som stopper onsdagsvarselet.
// Kjøres direkte (som `lonn_bekreft`) — registrerer kun en bekreftelse Anders
// allerede har gjort, ikke en ny skrive-handling agenten selv foreslår.

export const ballplukkingBekreftTool: Tool = {
  name: "ballplukking_bekreft",
  description:
    "Bekrefter at ansvarlig for torsdagens ballplukking (GFGK) er avklart for " +
    "denne uka. Bruk KUN når Anders selv sier noe som «ballplukking bekreftet», " +
    "«jeg tar ballplukking», «Christoffer tar ballplukking» e.l. Kjøres direkte " +
    "— stopper den automatiske varslingen onsdag.",
  input_schema: {
    type: "object",
    properties: {
      ansvarlig: {
        type: "string",
        description:
          "Hvem som har ansvaret (valgfritt, f.eks. «Anders» eller «Christoffer») — " +
          "utelates hvis Anders bare bekrefter uten å oppgi navn.",
      },
    },
    required: [],
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
  notionProsjekterTool,
  notionOpprettProsjektTool,
  helseHentTool,
  gmailSokTool,
  gmailLesTraadTool,
  gmailLagUtkastTool,
  kalenderAgendaTool,
  diskSokTool,
  diskLesFilTool,
  diskOpprettTool,
  stripeSaldoTool,
  stripeBetalingerTool,
  stripeAbonnementerTool,
  stripeFakturaerTool,
  stripeKundeSokTool,
  lonnBekreftTool,
  ballplukkingBekreftTool,
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
type NotionOpprettOppgaveInput = { tittel: string; prioritet?: string; forfaller?: string };
type NotionFullforOppgaveInput = { pageId: string; status: string };
type NotionProsjekterInput = { limit?: number };
type NotionOpprettProsjektInput = { navn: string; prioritet?: string };
type HelseHentInput = { metric?: string; dager?: number };
type GmailSokInput = { query: string; limit?: number };
type GmailLesTraadInput = { threadId: string };
type GmailLagUtkastInput = { til: string; emne: string; tekst: string };
type KalenderAgendaInput = { dager?: number };
type DiskSokInput = { query: string; limit?: number };
type DiskLesFilInput = { fileId: string };
type DiskOpprettInput = { navn: string; innhold: string };
type BallplukkingBekreftInput = { ansvarlig?: string };

// ────────────────────────────────────────────────────────────────────────────
// Executor-tabell
// ────────────────────────────────────────────────────────────────────────────

/**
 * Bygger executor-tabellen bundet til én person (subject). All lagring og
 * henting skjer mot denne personens data — boten kan aldri lese eller skrive
 * på tvers av personer.
 */
export function megExecutorsFor(
  subject: string,
): Record<string, (args: unknown) => Promise<string>> {
  return {
  logg: async (raw) => {
    const args = raw as LoggInput;
    const classification: Classification = {
      kind: args.kind as Classification["kind"],
      summary: args.summary,
      value_num: args.value_num,
      value_unit: args.value_unit,
      tags: args.tags ?? [],
    };
    await storeLog(args.summary, classification, "telegram_text", subject);
    return `Logget (${args.kind}): ${args.summary}`;
  },

  hent_nylige: async (raw) => {
    const args = raw as HentNyligeInput;
    const limit = Math.min(Math.max(args.limit ?? 10, 1), 30);
    const rader = await hentNylige(subject, limit, args.kind);
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
    const deler = [`"${args.tittel}"`];
    if (args.prioritet) deler.push(args.prioritet);
    if (args.forfaller) deler.push(`forfaller ${args.forfaller}`);
    const summary = `Opprette oppgave i Notion: ${deler.join(", ")}`;
    await createPending("notion_opprett_oppgave", args, summary, subject);
    return `Forslag klart: ${summary}. Be Anders svare BEKREFT for å utføre.`;
  },

  notion_fullfor_oppgave: async (raw) => {
    const args = raw as NotionFullforOppgaveInput;
    const summary = `Sette Notion-oppgave til status "${args.status}"`;
    await createPending("notion_fullfor_oppgave", args, summary, subject);
    return `Forslag klart: ${summary}. Be Anders svare BEKREFT for å utføre.`;
  },

  notion_prosjekter: async (raw) => {
    const args = raw as NotionProsjekterInput;
    return notionProsjekter(args.limit ?? 10);
  },

  notion_opprett_prosjekt: async (raw) => {
    const args = raw as NotionOpprettProsjektInput;
    const deler = [`"${args.navn}"`];
    if (args.prioritet) deler.push(args.prioritet);
    const summary = `Opprette prosjekt i Notion: ${deler.join(", ")}`;
    await createPending("notion_opprett_prosjekt", args, summary, subject);
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
    await createPending("gmail_send", args, summary, subject);
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
    await createPending("disk_opprett", args, summary, subject);
    return `Forslag klart: ${summary}. Be Anders svare BEKREFT for å utføre.`;
  },

  // ── Stripe (alle direkte — kun les) ──
  stripe_saldo: async () => stripeSaldo(),
  stripe_betalinger: async (raw) => {
    const args = raw as { dager?: number; limit?: number };
    return stripeBetalinger(args.dager ?? 7, args.limit ?? 10);
  },
  stripe_abonnementer: async (raw) => {
    const args = raw as { limit?: number };
    return stripeAbonnementer(args.limit ?? 20);
  },
  stripe_fakturaer: async (raw) => {
    const args = raw as { limit?: number };
    return stripeFakturaer(args.limit ?? 10);
  },
  stripe_kunde_sok: async (raw) => {
    const args = raw as { query: string };
    return stripeKundeSok(args.query);
  },

  // ── Tripletex lønn (kjøres direkte — se lonnBekreftTool over) ──
  lonn_bekreft: async () => bekreftLonn(),

  // ── GFGK ballplukking (kjøres direkte — se ballplukkingBekreftTool over) ──
  ballplukking_bekreft: async (raw) => {
    const args = raw as BallplukkingBekreftInput;
    return bekreftBallplukking(args?.ansvarlig);
  },
  };
}

// Bakoverkompatibel referanse for tester. Runtime bruker megExecutorsFor(subject)
// med faktisk avsender — denne bindingen kalles aldri i produksjon.
export const MEG_EXEC_BY_NAME = megExecutorsFor("");
