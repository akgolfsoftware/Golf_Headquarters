import "server-only";
import { z } from "zod";
import { megSupabase } from "@/lib/meg/supabase";

const logRowSchema = z.object({
  id: z.string().uuid(),
  kind: z.string(),
  text: z.string(),
  value_num: z.number().nullable(),
  value_unit: z.string().nullable(),
  tags: z.array(z.string()),
  source: z.string(),
  created_at: z.string(),
});

export type LogRow = z.infer<typeof logRowSchema>;

const convRowSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  created_at: z.string(),
});

export type ConvRow = z.infer<typeof convRowSchema>;

/** Henter de siste N logg-oppføringer fra me_log. */
export async function hentNylige(limit = 10, kind?: string): Promise<LogRow[]> {
  const db = megSupabase();
  if (!db) return [];
  let q = db
    .from("me_log")
    .select("id, kind, text, value_num, value_unit, tags, source, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (kind) q = q.eq("kind", kind);
  const { data, error } = await q;
  if (error || !data) return [];
  return data.flatMap((r) => {
    const v = logRowSchema.safeParse(r);
    return v.success ? [v.data] : [];
  });
}

/** Henter de siste N meldinger i samtale-historikken (me_conversation). */
export async function hentSamtaleHistorikk(limit = 20): Promise<ConvRow[]> {
  const db = megSupabase();
  if (!db) return [];
  const { data, error } = await db
    .from("me_conversation")
    .select("id, role, content, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data
    .flatMap((r) => {
      const v = convRowSchema.safeParse(r);
      return v.success ? [v.data] : [];
    })
    .reverse();
}
