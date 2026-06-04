// src/lib/meg/connectors/health.ts
// Leser samlet helse fra me_health (Apple Watch + Garmin, source-tagget).
import "server-only";
import { z } from "zod";
import { megSupabase } from "@/lib/meg/supabase";

const healthRowSchema = z.object({
  metric_date: z.string(),
  metric: z.string(),
  value_num: z.number(),
  unit: z.string().nullable(),
  source: z.string(),
});

/** Henter siste helse-målinger, valgfritt filtrert på metrikk (f.eks. "sleep_hours"). */
export async function helseHent(metric?: string, dager = 14): Promise<string> {
  const db = megSupabase();
  if (!db) return "Helse-databasen er ikke konfigurert.";
  const since = new Date(Date.now() - dager * 86400_000).toISOString().slice(0, 10);
  let q = db
    .from("me_health")
    .select("metric_date, metric, value_num, unit, source")
    .gte("metric_date", since)
    .order("metric_date", { ascending: false })
    .limit(60);
  if (metric) q = q.eq("metric", metric);
  const { data, error } = await q;
  if (error || !data) return "Kunne ikke hente helsedata.";
  const rader = z.array(healthRowSchema).safeParse(data);
  if (!rader.success || rader.data.length === 0) return "Ingen helsedata funnet.";
  return rader.data
    .map((r) => `[${r.metric_date}] ${r.metric}: ${r.value_num}${r.unit ? ` ${r.unit}` : ""} (${r.source})`)
    .join("\n");
}
