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

/** Henter de siste N logg-oppføringer fra me_log for én person (subject). */
export async function hentNylige(subject: string, limit = 10, kind?: string): Promise<LogRow[]> {
  const db = megSupabase();
  if (!db) return [];
  let q = db
    .from("me_log")
    .select("id, kind, text, value_num, value_unit, tags, source, created_at")
    .eq("subject", subject)
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

const briefRowSchema = z.object({
  id: z.string().uuid(),
  kind: z.string(),
  content: z.string(),
  sent: z.boolean(),
  created_at: z.string(),
});

export type BriefRow = z.infer<typeof briefRowSchema>;

const pendingRowSchema = z.object({
  id: z.string().uuid(),
  tool_name: z.string(),
  summary: z.string(),
  status: z.string(),
  created_at: z.string(),
});

export type PendingRow = z.infer<typeof pendingRowSchema>;

/** Henter de siste N briefene (me_brief) for én person, nyeste først. */
export async function hentBriefer(subject: string, limit = 10, kind?: string): Promise<BriefRow[]> {
  const db = megSupabase();
  if (!db) return [];
  let q = db
    .from("me_brief")
    .select("id, kind, content, sent, created_at")
    .eq("subject", subject)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (kind) q = q.eq("kind", kind);
  const { data, error } = await q;
  if (error || !data) return [];
  return data.flatMap((r) => {
    const v = briefRowSchema.safeParse(r);
    return v.success ? [v.data] : [];
  });
}

/** Henter ventende skrive-handlinger (me_pending_action) for én person, ikke utløpt. */
export async function hentVentende(subject: string, limit = 10): Promise<PendingRow[]> {
  const db = megSupabase();
  if (!db) return [];
  const { data, error } = await db
    .from("me_pending_action")
    .select("id, tool_name, summary, status, created_at")
    .eq("subject", subject)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.flatMap((r) => {
    const v = pendingRowSchema.safeParse(r);
    return v.success ? [v.data] : [];
  });
}

/** Henter de siste N meldinger i samtale-historikken (me_conversation) for én person. */
export async function hentSamtaleHistorikk(subject: string, limit = 20): Promise<ConvRow[]> {
  const db = megSupabase();
  if (!db) return [];
  const { data, error } = await db
    .from("me_conversation")
    .select("id, role, content, created_at")
    .eq("subject", subject)
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
