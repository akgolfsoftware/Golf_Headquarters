// src/lib/meg/briefs.ts
// Fase 6: proaktive briefer. Hver funksjon samler kontekst fra Meg-DB +
// Notion + en lett AgencyOS-snapshot, lar Sonnet komponere en kort tekst,
// sender den via Telegram og lagrer i me_brief (vises i /meg-dashboard).
import "server-only";
import { anthropic, MEG_MODEL_SMART, AI_MAX_TOKENS, isAiEnabled } from "@/lib/ai/client";
import { readMegEnv } from "@/lib/meg/env";
import { megSupabase } from "@/lib/meg/supabase";
import { sendTelegramMessage } from "@/lib/meg/telegram";
import { adminSubject } from "@/lib/meg/access";
import { hentNylige } from "@/lib/meg/read";
import { helseHent } from "@/lib/meg/connectors/health";
import { notionOppgaver } from "@/lib/meg/connectors/notion";
import { kalenderAgenda } from "@/lib/meg/connectors/google";
import { prisma } from "@/lib/prisma";

type BriefKind = "morgenbrief" | "kveldsjournal" | "loftesjekk" | "crm_nudge" | "wang_agenda";

export type BriefResult = { kind: BriefKind; sent: boolean; stored: boolean; skipped?: string };

const BRIEF_SYSTEM = `
Du er Meg — Anders Kristiansen sin personlige assistent. Norsk bokmål.
Kort og konkret. Ingen emoji. Ingen utropstegn. Aktiv stemme. Maks 6-8 linjer.
Anders er CEO i AK Golf Group og har ADHD — én ting om gangen, tydelige punkter.
Datoformat DD.MM.YYYY. Tall med norsk desimalkomma.
`.trim();

async function komponer(instruks: string, kontekst: string): Promise<string | null> {
  if (!isAiEnabled() || !anthropic) return null;
  const res = await anthropic.messages.create({
    model: MEG_MODEL_SMART,
    max_tokens: AI_MAX_TOKENS,
    system: BRIEF_SYSTEM,
    messages: [{ role: "user", content: `${instruks}\n\nKontekst:\n${kontekst}` }],
  });
  const text = res.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n")
    .trim();
  return text || null;
}

async function lagreOgSend(kind: BriefKind, content: string): Promise<BriefResult> {
  const env = readMegEnv();
  let sent = false;
  if (env) {
    await sendTelegramMessage(env.telegramBotToken, env.allowedChatId, content);
    sent = true;
  }
  let stored = false;
  const db = megSupabase();
  const subject = adminSubject();
  if (db && subject) {
    const { error } = await db.from("me_brief").insert({ kind, content, sent, subject });
    stored = !error;
  }
  return { kind, sent, stored };
}

/** Lett AgencyOS-snapshot: antall bekreftede bookinger i dag. Best-effort. */
async function agencyOsSnapshot(): Promise<string> {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const count = await prisma.booking.count({
      where: { startAt: { gte: start, lte: end }, status: "CONFIRMED" },
    });
    return `Bekreftede bookinger i dag: ${count}`;
  } catch {
    return "Bookinger i dag: ukjent";
  }
}

// ── Morgenbrief ──────────────────────────────────────────────────────────────
export async function runMorgenbrief(): Promise<BriefResult> {
  const [helse, oppgaver, agencyOs, kalender] = await Promise.all([
    helseHent(undefined, 3),
    notionOppgaver(8),
    agencyOsSnapshot(),
    kalenderAgenda(1),
  ]);
  const kontekst = [
    `Helse siste dager:\n${helse}`,
    `Notion-oppgaver:\n${oppgaver}`,
    `Dagens kalender:\n${kalender}`,
    agencyOs,
  ].join("\n\n");
  const content = await komponer(
    "Lag en kort morgenbrief: dagens viktigste fokus ut fra oppgaver og kalender, " +
      "pluss en linje om søvn/recovery hvis helsedata finnes. Avslutt med ÉN konkret første handling.",
    kontekst,
  );
  if (!content) return { kind: "morgenbrief", sent: false, stored: false, skipped: "AI ikke aktivert" };
  return lagreOgSend("morgenbrief", content);
}

// ── Kveldsjournal ────────────────────────────────────────────────────────────
export async function runKveldsjournal(): Promise<BriefResult> {
  const nylige = await hentNylige(adminSubject() ?? "", 15);
  const logg = nylige.length
    ? nylige.map((r) => `- [${r.kind}] ${r.text}`).join("\n")
    : "Ingen logg i dag.";
  const content = await komponer(
    "Lag en kort kveldsjournal-melding: oppsummer dagen ut fra loggen i 2-3 punkter, " +
      "og still ÉN reflekterende spørsmål Anders kan svare på i kveld.",
    `Dagens logg:\n${logg}`,
  );
  if (!content) return { kind: "kveldsjournal", sent: false, stored: false, skipped: "AI ikke aktivert" };
  return lagreOgSend("kveldsjournal", content);
}

// ── Løftesjekk ───────────────────────────────────────────────────────────────
export async function runLoftesjekk(): Promise<BriefResult> {
  const [oppgaver, nylige] = await Promise.all([notionOppgaver(15), hentNylige(adminSubject() ?? "", 30)]);
  const lovet = nylige
    .filter((r) => r.kind === "task" || r.tags.includes("lovet") || r.tags.includes("promise"))
    .map((r) => `- ${r.text}`)
    .join("\n");
  const kontekst = [
    `Notion-oppgaver:\n${oppgaver}`,
    `Ting Anders har sagt han skal gjøre:\n${lovet || "(ingen logget)"}`,
  ].join("\n\n");
  const content = await komponer(
    "Sjekk om noe Anders har lovet eller en oppgave forfaller snart. " +
      "Hvis ja: minn ham kort om det. Hvis ingenting haster: si det i én linje.",
    kontekst,
  );
  if (!content) return { kind: "loftesjekk", sent: false, stored: false, skipped: "AI ikke aktivert" };
  return lagreOgSend("loftesjekk", content);
}

// ── CRM-nudge ────────────────────────────────────────────────────────────────
export async function runCrmNudge(): Promise<BriefResult> {
  const personer = await hentNylige(adminSubject() ?? "", 40, "person");
  const logg = personer.length
    ? personer.map((r) => `- ${r.text} (${r.created_at.slice(0, 10)})`).join("\n")
    : "Ingen person-logg.";
  const content = await komponer(
    "Ut fra person-loggen: foreslå ÉN person Anders bør ta kontakt med denne uka " +
      "(noen han ikke har nevnt på en stund, eller en åpen tråd). Kort begrunnelse.",
    `Personer nevnt:\n${logg}`,
  );
  if (!content) return { kind: "crm_nudge", sent: false, stored: false, skipped: "AI ikke aktivert" };
  return lagreOgSend("crm_nudge", content);
}

// ── WANG sportssjefsmøte-agenda ──────────────────────────────────────────────
// Se .claude/rules/wang-toppidrett.md: onsdag 11-13 er sportssjefsmøtet, og
// tirsdag kveld genereres et agenda-utkast fra (a) forrige møtes aksjonspunkter
// (Notion), (b) ukas kalenderhendelser i "Work - WANG Toppidrett Fredrikstad".
//
// PII-AVVIK FRA MØNSTERET OVER (bevisst): denne brief-funksjonen kaller ALDRI
// komponer()/Anthropic. Notion-oppgavetekst kan inneholde elevnavn (mindreårige
// — se PII-begrensningen i wang-toppidrett.md: "aldri elevnavn i sky-prompts
// uten anonymisering"). En Claude-komposisjon ville sendt rå oppgavetekst til
// Anthropic sitt API, som telles som en sky-prompt. Derfor bygges agendaen som
// en ren, deterministisk markdown-mal i kode — kildene settes sammen rått
// under egne overskrifter, ingen AI-omskriving. Dette passer også bedre med at
// utkastet skal være "et UTGANGSPUNKT" Anders fyller faglig inn i, ikke et
// AI-generert narrativ som kunne introdusere feil i elevinfo.

/**
 * Ren malbygger — ingen nettverk/AI. Eksportert separat slik at malen kan
 * testes uavhengig av connectorene.
 */
export function byggWangAgendaMarkdown(oppgaver: string, kalender: string): string {
  return [
    "# Sportssjefsmøte WANG Toppidrett Fredrikstad — agenda-utkast",
    "",
    "## Aksjonspunkter fra forrige møte",
    oppgaver,
    "",
    "## Ukas hendelser",
    kalender,
    "",
    "## Uavklarte saker",
    "Det finnes ikke noe eget datafelt for «uavklart elevsak» i systemet ennå — " +
      "Anders markerer selv uavklarte elevsaker i møtet. Sjekk aksjonspunktene over " +
      "for saker som fortsatt står åpne.",
  ].join("\n");
}

export async function runWangAgenda(): Promise<BriefResult> {
  const [oppgaver, kalender] = await Promise.all([
    notionOppgaver(15, "WANG Toppidrett Fredrikstad"),
    kalenderAgenda(7, "Work - WANG Toppidrett Fredrikstad"),
  ]);
  const content = byggWangAgendaMarkdown(oppgaver, kalender);
  return lagreOgSend("wang_agenda", content);
}
