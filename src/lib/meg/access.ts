// src/lib/meg/access.ts
// Fler-person-tilgang for AK Golf Academy-boten. Boten kjenner igjen avsender
// på Telegram chat-id og gir riktig rolle. Anders (admin) får jobb + privat;
// Markus o.l. (coach) får KUN trygge arbeidsverktøy — aldri Anders' private data.
import "server-only";
import { z } from "zod";
import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import { MEG_ALL_TOOLS } from "@/lib/meg/tools";

export type Rolle = "admin" | "coach";
export type Person = { chatId: string; navn: string; rolle: Rolle };

const personSchema = z.object({
  chatId: z.union([z.string(), z.number()]).transform(String),
  navn: z.string().min(1),
  rolle: z.enum(["admin", "coach"]),
});

// Coach får KUN trygge arbeidsverktøy: legge til notater/oppgaver og hente egne
// notater. Aldri Anders' private kilder (Gmail, Disk, kalender, helse, minne, Notion).
const COACH_TOOL_NAMES = new Set<string>(["logg", "hent_nylige"]);

/**
 * Leser allowlisten over personer. Primær kilde er MEG_ALLOWED_PEOPLE (JSON-array).
 * Faller tilbake til legacy MEG_TELEGRAM_ALLOWED_CHAT_ID = én admin (Anders).
 */
export function parsePersoner(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): Person[] {
  const raw = source.MEG_ALLOWED_PEOPLE;
  if (raw) {
    try {
      const parsed = z.array(personSchema).safeParse(JSON.parse(raw));
      if (parsed.success && parsed.data.length > 0) return parsed.data;
    } catch {
      // ugyldig JSON — faller tilbake til legacy under
    }
  }
  const legacy = source.MEG_TELEGRAM_ALLOWED_CHAT_ID;
  if (legacy && legacy.length > 0) {
    return [{ chatId: legacy, navn: "Anders", rolle: "admin" }];
  }
  return [];
}

/** Slår opp en person på chat-id. Null hvis avsender ikke er i allowlisten. */
export function finnPerson(
  chatId: number | string | null,
  personer: Person[],
): Person | null {
  if (chatId == null) return null;
  const id = String(chatId);
  return personer.find((p) => p.chatId === id) ?? null;
}

/** chat-id-en (subject) for admin (Anders). Brukes av briefer + /meg-dashboard. */
export function adminSubject(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): string | null {
  const admin = parsePersoner(source).find((p) => p.rolle === "admin");
  return admin?.chatId ?? null;
}

/** Hvilke verktøy en rolle får. Admin = alt. Coach = trygg arbeids-delmengde. */
export function toolsForRolle(rolle: Rolle): Tool[] {
  if (rolle === "admin") return MEG_ALL_TOOLS;
  return MEG_ALL_TOOLS.filter((t) => COACH_TOOL_NAMES.has(t.name));
}
