// src/lib/meg/pending.ts
// Bekreftelsesflyt: skrive-handlinger utføres ALDRI direkte. De lagres som
// ventende handling i me_pending_action og venter på Telegram-"BEKREFT".
import "server-only";
import { z } from "zod";
import { megSupabase } from "@/lib/meg/supabase";

export type PendingAction = {
  id: string;
  tool_name: string;
  args: unknown;
  summary: string;
};

const pendingRowSchema = z.object({
  id: z.string().uuid(),
  tool_name: z.string(),
  args: z.unknown(),
  summary: z.string(),
});

/** Lagrer en ventende skrive-handling. Returnerer id, eller null hvis Meg ikke er konfigurert. */
export async function createPending(
  toolName: string,
  args: unknown,
  summary: string,
): Promise<string | null> {
  const db = megSupabase();
  if (!db) return null;
  const { data, error } = await db
    .from("me_pending_action")
    .insert({ tool_name: toolName, args: args ?? {}, summary })
    .select("id")
    .single();
  if (error || !data) return null;
  const v = z.object({ id: z.string().uuid() }).safeParse(data);
  return v.success ? v.data.id : null;
}

/** Henter siste åpne (pending, ikke utløpte) handling. Null hvis ingen finnes. */
export async function getLatestPending(): Promise<PendingAction | null> {
  const db = megSupabase();
  if (!db) return null;
  const { data, error } = await db
    .from("me_pending_action")
    .select("id, tool_name, args, summary")
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  const v = pendingRowSchema.safeParse(data);
  return v.success ? v.data : null;
}

async function setStatus(id: string, status: "done" | "cancelled"): Promise<void> {
  const db = megSupabase();
  if (!db) return;
  const { error } = await db.from("me_pending_action").update({ status }).eq("id", id);
  if (error) console.error("[meg/pending] setStatus feilet", error.message);
}

export const markDone = (id: string) => setStatus(id, "done");
export const markCancelled = (id: string) => setStatus(id, "cancelled");

const CONFIRM_WORDS = new Set([
  "bekreft", "ja", "ok", "okei", "utfør", "utfor", "kjør", "kjor", "send", "gjør det", "gjor det",
]);
const CANCEL_WORDS = new Set([
  "nei", "avbryt", "kanseller", "kansellér", "drop", "glem det", "stopp",
]);

const norm = (text: string) => text.trim().toLowerCase().replace(/[.!?]+$/, "");

export const isConfirmation = (text: string) => CONFIRM_WORDS.has(norm(text));
export const isCancellation = (text: string) => CANCEL_WORDS.has(norm(text));
