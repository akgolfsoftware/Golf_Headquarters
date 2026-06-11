/**
 * Rask sjekk av alle Meg-tilkoblinger.
 * Kjør: npx tsx scripts/meg-sjekk.ts
 *
 * Tester: Stripe · Meg-Supabase · Anthropic API
 * Google / Notion testes via Telegram-boten (se instruksjoner under).
 */

import "./_env";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

type Status = "✅" | "❌";
const rader: { tjeneste: string; status: Status; detalj: string }[] = [];

function logg(tjeneste: string, status: Status, detalj: string) {
  rader.push({ tjeneste, status, detalj });
  console.log(`${status}  ${tjeneste.padEnd(20)} ${detalj}`);
}

// ── Stripe ────────────────────────────────────────────────────────────────────

async function sjekkStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) { logg("Stripe", "❌", "STRIPE_SECRET_KEY mangler"); return; }
  try {
    const s = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
    const bal = await s.balance.retrieve();
    const nok = bal.available.find((b) => b.currency === "nok");
    const belop = nok ? `${(nok.amount / 100).toFixed(0)} NOK tilgjengelig` : "tilkoblet";
    logg("Stripe", "✅", belop);
  } catch (e) {
    logg("Stripe", "❌", e instanceof Error ? e.message : String(e));
  }
}

// ── Meg Supabase ──────────────────────────────────────────────────────────────

async function sjekkMegSupabase() {
  const url = process.env.MEG_SUPABASE_URL;
  const key = process.env.MEG_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { logg("Meg Supabase", "❌", "MEG_SUPABASE_URL eller MEG_SUPABASE_SERVICE_ROLE_KEY mangler"); return; }
  try {
    const db = createClient(url, key, { auth: { persistSession: false } });
    const { count, error } = await db.from("me_log").select("*", { count: "exact", head: true });
    if (error) throw new Error(error.message);
    const uprosessert = await db
      .from("me_log")
      .select("*", { count: "exact", head: true })
      .is("destilled_at", null);
    logg("Meg Supabase", "✅", `${count ?? 0} rader totalt · ${uprosessert.count ?? 0} uprosessert`);
  } catch (e) {
    logg("Meg Supabase", "❌", e instanceof Error ? e.message : String(e));
  }
}

// ── Anthropic API ─────────────────────────────────────────────────────────────

async function sjekkAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { logg("Anthropic API", "❌", "ANTHROPIC_API_KEY mangler"); return; }
  try {
    const client = new Anthropic({ apiKey: key });
    const res = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 16,
      messages: [{ role: "user", content: "Si bare: OK" }],
    });
    const svar = res.content[0]?.type === "text" ? res.content[0].text.trim() : "?";
    logg("Anthropic API", "✅", `Svar: "${svar}"`);
  } catch (e) {
    logg("Anthropic API", "❌", e instanceof Error ? e.message : String(e));
  }
}

// ── Hoved ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Meg tilkoblingssjekk ===\n");
  await sjekkStripe();
  await sjekkMegSupabase();
  await sjekkAnthropic();

  const feil = rader.filter((r) => r.status === "❌").length;
  console.log(`\n${feil === 0 ? "✅ Alle tilkoblinger OK" : `❌ ${feil} feil — sjekk .env.local`}`);

  console.log(`
=== Test Google / Notion via Telegram ===

Send disse meldingene til Meg-boten:

  «hva skjer i dag»         → Kalender
  «søk gmail unread»        → Gmail
  «søk notion»              → Notion
  «hva er stripe-saldo»     → Stripe
  «logg: testet Meg»        → Logger en rad i me_log
`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
