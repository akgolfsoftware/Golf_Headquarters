// src/lib/meg/store.ts
// Lagrer klassifiserte logg-oppføringer og samtale-historikk i Meg-DB.
import "server-only";
import { z } from "zod";
import { megSupabase } from "@/lib/meg/supabase";
import type { Classification } from "@/lib/meg/classify-schema";

export type StoredLog = { id: string };

const idSchema = z.object({ id: z.string().uuid() });

/** Lagrer en klassifisert logg i me_log. Returnerer null hvis Meg ikke er konfigurert. */
export async function storeLog(
  text: string,
  c: Classification,
  source: "telegram_text" | "telegram_voice" | "telegram_photo" | "web" | "system" = "telegram_text",
): Promise<StoredLog | null> {
  const db = megSupabase();
  if (!db) return null;
  const { data, error } = await db
    .from("me_log")
    .insert({
      kind: c.kind,
      text: c.summary || text,
      value_num: c.value_num ?? null,
      value_unit: c.value_unit ?? null,
      tags: c.tags,
      source,
    })
    .select("id")
    .single();
  if (error || !data) return null;
  const v = idSchema.safeParse(data);
  if (!v.success) return null;
  return { id: v.data.id };
}

/** Lagrer én melding i chat-historikken (me_conversation). */
export async function storeConversation(
  role: "user" | "assistant",
  content: string,
  relatedLogId: string | null = null,
): Promise<void> {
  const db = megSupabase();
  if (!db) return;
  const { error } = await db.from("me_conversation").insert({
    role,
    content,
    related_log_id: relatedLogId,
  });
  if (error) console.error("[meg/store] storeConversation feilet", error.message);
}
