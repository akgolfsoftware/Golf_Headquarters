# Meg-assistenten — Plan 1: Fundament Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Anders sender en melding til en Telegram-bot, Claude forstår og klassifiserer den, den lagres i en egen Supabase-database kun han eier, og boten svarer kort tilbake.

**Architecture:** En webhook-route i eksisterende Next.js 16-app (`/api/meg/telegram`) tar imot Telegram-oppdateringer, verifiserer avsender (hemmelig token + chat-id-allowlist), bruker Anthropic SDK til å klassifisere meldingen til strukturert data (zod-validert tool-output), og lagrer i en **separat** Supabase via service-role-klient. Svar sendes tilbake via Telegram Bot API.

**Tech Stack:** Next.js 16 route handler (nodejs runtime), `@supabase/supabase-js` service-role-klient mot ny Supabase, `@anthropic-ai/sdk` (`claude-sonnet-4-6`), zod, `node:test` + tsx.

**Referanse-spec:** `docs/superpowers/specs/2026-06-03-meg-assistent-design.md`

---

## Task 0: Oppsett Anders/eksterne avhengigheter (manuelt — ikke kode)

Disse må være på plass før kode-tasks kjøres. Gjøres med Anders.

- [ ] **Opprett Telegram-bot:** I Telegram, snakk med `@BotFather` → `/newbot` → få **bot-token** (`123456:ABC...`).
- [ ] **Finn Anders' chat-id:** Send en melding til boten, hent `chat.id` (f.eks. via `https://api.telegram.org/bot<TOKEN>/getUpdates`). Dette er **allowlist**-verdien.
- [ ] **Opprett ny Supabase-prosjekt** for Meg-databasen (separat fra golf-DB). Bruk gratis-tier. Noter `Project URL` og `service_role`-nøkkel (Settings → API).
- [ ] **Generer webhook-secret:** lag en tilfeldig streng (f.eks. `openssl rand -hex 32`) — brukes som `MEG_TELEGRAM_WEBHOOK_SECRET`.
- [ ] **Legg env-vars i `.env.local`** (lokalt) og Vercel (Production):
  ```
  MEG_SUPABASE_URL=https://<ref>.supabase.co
  MEG_SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
  MEG_TELEGRAM_BOT_TOKEN=<bot-token>
  MEG_TELEGRAM_WEBHOOK_SECRET=<random-hex>
  MEG_TELEGRAM_ALLOWED_CHAT_ID=<anders-chat-id>
  ```
  `ANTHROPIC_API_KEY` finnes allerede i prosjektet — gjenbrukes.
- [ ] **Legg samme nøkler i `.env.example`** (uten verdier) så de er dokumentert.

---

## Task 1: Database-skjema i Meg-Supabase (me_log + me_conversation)

**Files:**
- Create: `supabase-meg/migrations/0001_init.sql` (kjøres i Meg-Supabase SQL editor — IKKE mot golf-DB, IKKE via Prisma)

Dette er en **separat** database. Vi bruker rå SQL (ikke Prisma, som er bundet til golf-DB). RLS settes deny-all; kun service-role (server-side) når dataene.

- [ ] **Step 1: Skriv migrasjonen**

```sql
-- supabase-meg/migrations/0001_init.sql
-- Meg-assistenten — fundament. Kjøres i Meg-Supabase (separat fra golf-DB).

create extension if not exists "pgcrypto";

-- All logget innhold: én rad per ting Anders logger
create table public.me_log (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  kind        text not null check (kind in
              ('sleep','training','mood','nutrition','finance','goal','task','note','person')),
  text        text not null,
  value_num   double precision,
  value_unit  text,
  tags        text[] not null default '{}',
  source      text not null default 'telegram_text' check (source in
              ('telegram_text','telegram_voice','telegram_photo','web','system')),
  raw_ref     text,
  meta_json   jsonb
);
create index me_log_created_at_idx on public.me_log (created_at desc);
create index me_log_kind_idx on public.me_log (kind);

-- Full chat-historikk (komplett minne)
create table public.me_conversation (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  role            text not null check (role in ('user','assistant')),
  content         text not null,
  tokens          integer,
  related_log_id  uuid references public.me_log(id) on delete set null
);
create index me_conversation_created_at_idx on public.me_conversation (created_at desc);

-- RLS: deny-all. Kun service-role (server-side) når dataene.
alter table public.me_log enable row level security;
alter table public.me_conversation enable row level security;
-- Ingen policies = ingen tilgang for anon/authenticated. Service-role bypasser RLS.
```

- [ ] **Step 2: Kjør migrasjonen**

Lim `0001_init.sql` inn i Meg-Supabase → SQL Editor → Run. Bekreft at begge tabellene finnes under Table Editor.

- [ ] **Step 3: Verifiser RLS er på**

Run i SQL Editor:
```sql
select tablename, rowsecurity from pg_tables
where schemaname='public' and tablename in ('me_log','me_conversation');
```
Expected: begge rader har `rowsecurity = true`.

- [ ] **Step 4: Commit**

```bash
git add supabase-meg/migrations/0001_init.sql
git commit -m "feat(meg): db-skjema for me_log og me_conversation (egen Supabase)"
```

---

## Task 2: Meg-env-validering (anbefalt, ikke-blokkerende)

Meg-vars skal IKKE krasje hele golf-appen om de mangler (de er valgfrie for resten av plattformen). Vi lager en egen, defensiv lese-helper.

**Files:**
- Create: `src/lib/meg/env.ts`
- Test: `src/lib/__tests__/meg-env.test.ts`

- [ ] **Step 1: Skriv den feilende testen**

```typescript
// src/lib/__tests__/meg-env.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { readMegEnv } from "@/lib/meg/env";

test("readMegEnv returnerer null når vars mangler", () => {
  const env = readMegEnv({});
  assert.equal(env, null);
});

test("readMegEnv returnerer config når alle vars finnes", () => {
  const env = readMegEnv({
    MEG_SUPABASE_URL: "https://x.supabase.co",
    MEG_SUPABASE_SERVICE_ROLE_KEY: "key",
    MEG_TELEGRAM_BOT_TOKEN: "tok",
    MEG_TELEGRAM_WEBHOOK_SECRET: "sec",
    MEG_TELEGRAM_ALLOWED_CHAT_ID: "12345",
  });
  assert.ok(env);
  assert.equal(env.allowedChatId, "12345");
  assert.equal(env.supabaseUrl, "https://x.supabase.co");
});
```

- [ ] **Step 2: Kjør testen og se den feile**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/lib/meg/env'`.

- [ ] **Step 3: Skriv minimal implementasjon**

```typescript
// src/lib/meg/env.ts
import { z } from "zod";

const megEnvSchema = z.object({
  MEG_SUPABASE_URL: z.string().url(),
  MEG_SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  MEG_TELEGRAM_BOT_TOKEN: z.string().min(1),
  MEG_TELEGRAM_WEBHOOK_SECRET: z.string().min(1),
  MEG_TELEGRAM_ALLOWED_CHAT_ID: z.string().min(1),
});

export type MegEnv = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  telegramBotToken: string;
  telegramWebhookSecret: string;
  allowedChatId: string;
};

/** Leser Meg-env defensivt. Returnerer null hvis ufullstendig — krasjer aldri resten av appen. */
export function readMegEnv(source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env): MegEnv | null {
  const parsed = megEnvSchema.safeParse(source);
  if (!parsed.success) return null;
  return {
    supabaseUrl: parsed.data.MEG_SUPABASE_URL,
    supabaseServiceRoleKey: parsed.data.MEG_SUPABASE_SERVICE_ROLE_KEY,
    telegramBotToken: parsed.data.MEG_TELEGRAM_BOT_TOKEN,
    telegramWebhookSecret: parsed.data.MEG_TELEGRAM_WEBHOOK_SECRET,
    allowedChatId: parsed.data.MEG_TELEGRAM_ALLOWED_CHAT_ID,
  };
}
```

- [ ] **Step 4: Kjør testen og se den passere**

Run: `npm test`
Expected: PASS (begge meg-env-tester).

- [ ] **Step 5: Commit**

```bash
git add src/lib/meg/env.ts src/lib/__tests__/meg-env.test.ts
git commit -m "feat(meg): defensiv env-lesing for Meg-config"
```

---

## Task 3: Meg-Supabase service-role-klient

**Files:**
- Create: `src/lib/meg/supabase.ts`

Egen klient mot Meg-DB (ikke golf-DB-klienten i `src/lib/supabase/`). Service-role, kun server-side.

- [ ] **Step 1: Skriv implementasjonen** (ingen test — ren factory som krever live-nøkler; dekkes av Task 5/8-integrasjon)

```typescript
// src/lib/meg/supabase.ts
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readMegEnv } from "@/lib/meg/env";

let _client: SupabaseClient | null = null;

/** Service-role-klient mot Meg-databasen. Returnerer null hvis Meg ikke er konfigurert. */
export function megSupabase(): SupabaseClient | null {
  if (_client) return _client;
  const env = readMegEnv();
  if (!env) return null;
  _client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}
```

- [ ] **Step 2: Verifiser at `@supabase/supabase-js` finnes**

Run: `grep '"@supabase/supabase-js"' package.json`
Expected: en versjon vises. Hvis IKKE: `npm install @supabase/supabase-js` og commit `package.json` + lockfile separat.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: ingen feil i `src/lib/meg/supabase.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/meg/supabase.ts
git commit -m "feat(meg): service-role Supabase-klient for Meg-DB"
```

---

## Task 4: Klassifiserings-skjema (zod) for Claude-output

**Files:**
- Create: `src/lib/meg/classify-schema.ts`
- Test: `src/lib/__tests__/meg-classify-schema.test.ts`

Definerer den strukturerte formen Claude tvinges til å returnere. Skjemaet brukes som tool-input-schema OG zod-validering (samme mønster som `coaching-analysis.ts`).

- [ ] **Step 1: Skriv den feilende testen**

```typescript
// src/lib/__tests__/meg-classify-schema.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { ClassificationSchema } from "@/lib/meg/classify-schema";

test("godtar gyldig klassifisering", () => {
  const r = ClassificationSchema.safeParse({
    kind: "sleep",
    summary: "Sov dårlig, våknet 03",
    tags: ["søvn"],
    value_num: 5,
    value_unit: "timer",
  });
  assert.ok(r.success);
});

test("avviser ukjent kind", () => {
  const r = ClassificationSchema.safeParse({ kind: "alien", summary: "x", tags: [] });
  assert.equal(r.success, false);
});

test("tillater utelatt value_num/value_unit", () => {
  const r = ClassificationSchema.safeParse({ kind: "note", summary: "tanke", tags: [] });
  assert.ok(r.success);
});
```

- [ ] **Step 2: Kjør testen og se den feile**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/lib/meg/classify-schema'`.

- [ ] **Step 3: Skriv implementasjonen**

```typescript
// src/lib/meg/classify-schema.ts
import { z } from "zod";

export const ME_KINDS = [
  "sleep", "training", "mood", "nutrition",
  "finance", "goal", "task", "note", "person",
] as const;

export const ClassificationSchema = z.object({
  kind: z.enum(ME_KINDS),
  summary: z.string().min(1),
  tags: z.array(z.string()),
  value_num: z.number().optional(),
  value_unit: z.string().optional(),
});

export type Classification = z.infer<typeof ClassificationSchema>;

/** JSON-schema for Anthropic tool-input (speiler ClassificationSchema). */
export const classificationToolSchema = {
  type: "object" as const,
  properties: {
    kind: { type: "string", enum: [...ME_KINDS] },
    summary: { type: "string", description: "Kort, tydelig sammendrag av loggen på norsk" },
    tags: { type: "array", items: { type: "string" } },
    value_num: { type: "number", description: "Tall hvis relevant, f.eks. antall timer søvn" },
    value_unit: { type: "string", description: "Enhet for value_num, f.eks. 'timer', 'min', 'kr'" },
  },
  required: ["kind", "summary", "tags"],
};
```

- [ ] **Step 4: Kjør testen og se den passere**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/meg/classify-schema.ts src/lib/__tests__/meg-classify-schema.test.ts
git commit -m "feat(meg): zod-skjema for meldingsklassifisering"
```

---

## Task 5: Claude-klassifisering av melding

**Files:**
- Create: `src/lib/meg/classify.ts`

Bruker eksisterende `anthropic`-klient (`src/lib/ai/client.ts`) med tvunget tool-use, validerer output med zod. AI-kallet enhetstestes ikke (krever live API) — verifiseres manuelt i Task 8.

- [ ] **Step 1: Skriv implementasjonen**

```typescript
// src/lib/meg/classify.ts
import "server-only";
import { anthropic, AI_MODEL } from "@/lib/ai/client";
import {
  ClassificationSchema,
  classificationToolSchema,
  type Classification,
} from "@/lib/meg/classify-schema";

const SYSTEM = `Du klassifiserer korte personlige logg-meldinger fra Anders.
Velg riktig 'kind', skriv et kort og tydelig 'summary' på norsk, og legg på relevante 'tags'.
Trekk ut tall (value_num + value_unit) når det finnes, f.eks. "sov 5 timer" -> 5 / "timer".
Ingen pjatt. Bruk alltid verktøyet 'lagre_klassifisering'.`;

/** Klassifiserer en fritekst-melding. Returnerer null hvis AI ikke er konfigurert eller svaret er ugyldig. */
export async function classifyMessage(text: string): Promise<Classification | null> {
  if (!anthropic) return null;

  const res = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 512,
    system: SYSTEM,
    tools: [{
      name: "lagre_klassifisering",
      description: "Lagre den strukturerte klassifiseringen av meldingen.",
      input_schema: classificationToolSchema,
    }],
    tool_choice: { type: "tool", name: "lagre_klassifisering" },
    messages: [{ role: "user", content: text }],
  });

  const toolBlock = res.content.find((b) => b.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") return null;

  const parsed = ClassificationSchema.safeParse(toolBlock.input);
  return parsed.success ? parsed.data : null;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: ingen feil. (Hvis `tool_use`-typen klager, bekreft import-formen mot `src/lib/ai/agents/caddie.ts` som allerede gjør tool-use.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/meg/classify.ts
git commit -m "feat(meg): Claude-klassifisering av logg-meldinger"
```

---

## Task 6: Lagre logg + samtale i Meg-DB

**Files:**
- Create: `src/lib/meg/store.ts`

- [ ] **Step 1: Skriv implementasjonen** (database-skriving; verifiseres i integrasjon Task 8)

```typescript
// src/lib/meg/store.ts
import "server-only";
import { megSupabase } from "@/lib/meg/supabase";
import type { Classification } from "@/lib/meg/classify-schema";

export type StoredLog = { id: string };

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
  return { id: data.id as string };
}

/** Lagrer én melding i chat-historikken (me_conversation). */
export async function storeConversation(
  role: "user" | "assistant",
  content: string,
  relatedLogId: string | null = null,
): Promise<void> {
  const db = megSupabase();
  if (!db) return;
  await db.from("me_conversation").insert({
    role,
    content,
    related_log_id: relatedLogId,
  });
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: ingen feil.

- [ ] **Step 3: Commit**

```bash
git add src/lib/meg/store.ts
git commit -m "feat(meg): lagring av logg og samtale i Meg-DB"
```

---

## Task 7: Telegram-helpers (verifisering + send)

**Files:**
- Create: `src/lib/meg/telegram.ts`
- Test: `src/lib/__tests__/meg-telegram.test.ts`

- [ ] **Step 1: Skriv den feilende testen** (verifiserings-logikken er ren og testbar)

```typescript
// src/lib/__tests__/meg-telegram.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { isAuthorizedUpdate } from "@/lib/meg/telegram";

const cfg = { webhookSecret: "s3cret", allowedChatId: "999" };

test("godtar riktig secret + riktig chat-id", () => {
  const ok = isAuthorizedUpdate(
    { headerSecret: "s3cret", chatId: 999 },
    cfg,
  );
  assert.equal(ok, true);
});

test("avviser feil secret", () => {
  const ok = isAuthorizedUpdate({ headerSecret: "feil", chatId: 999 }, cfg);
  assert.equal(ok, false);
});

test("avviser feil chat-id", () => {
  const ok = isAuthorizedUpdate({ headerSecret: "s3cret", chatId: 111 }, cfg);
  assert.equal(ok, false);
});

test("avviser manglende secret", () => {
  const ok = isAuthorizedUpdate({ headerSecret: null, chatId: 999 }, cfg);
  assert.equal(ok, false);
});
```

- [ ] **Step 2: Kjør testen og se den feile**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/lib/meg/telegram'`.

- [ ] **Step 3: Skriv implementasjonen**

```typescript
// src/lib/meg/telegram.ts
import "server-only";

export type AuthInput = { headerSecret: string | null; chatId: number | null };
export type AuthConfig = { webhookSecret: string; allowedChatId: string };

/** Sant kun hvis webhook-secret matcher OG chat-id er Anders' allowlistede id. */
export function isAuthorizedUpdate(input: AuthInput, cfg: AuthConfig): boolean {
  if (!input.headerSecret || input.headerSecret !== cfg.webhookSecret) return false;
  if (input.chatId == null) return false;
  return String(input.chatId) === cfg.allowedChatId;
}

/** Sender en tekstmelding til en Telegram-chat via Bot API. */
export async function sendTelegramMessage(
  botToken: string,
  chatId: number | string,
  text: string,
): Promise<void> {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}
```

- [ ] **Step 4: Kjør testen og se den passere**

Run: `npm test`
Expected: PASS (alle fire telegram-tester).

- [ ] **Step 5: Commit**

```bash
git add src/lib/meg/telegram.ts src/lib/__tests__/meg-telegram.test.ts
git commit -m "feat(meg): Telegram-verifisering og sendMessage"
```

---

## Task 8: Webhook-route (binder alt sammen)

**Files:**
- Create: `src/app/api/meg/telegram/route.ts`

- [ ] **Step 1: Skriv route-handleren**

```typescript
// src/app/api/meg/telegram/route.ts
import { NextResponse } from "next/server";
import { readMegEnv } from "@/lib/meg/env";
import { isAuthorizedUpdate, sendTelegramMessage } from "@/lib/meg/telegram";
import { classifyMessage } from "@/lib/meg/classify";
import { storeLog, storeConversation } from "@/lib/meg/store";

export const runtime = "nodejs";
export const maxDuration = 30;

type TgUpdate = {
  message?: { chat?: { id?: number }; text?: string };
};

export async function POST(req: Request) {
  const env = readMegEnv();
  if (!env) return NextResponse.json({ ok: false }, { status: 503 });

  const headerSecret = req.headers.get("x-telegram-bot-api-secret-token");

  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const chatId = update.message?.chat?.id ?? null;
  const text = update.message?.text?.trim() ?? "";

  // Verifiser avsender — svar 200 uansett så Telegram ikke re-sender, men gjør ingenting.
  if (!isAuthorizedUpdate({ headerSecret, chatId }, {
    webhookSecret: env.telegramWebhookSecret,
    allowedChatId: env.allowedChatId,
  })) {
    return NextResponse.json({ ok: true });
  }

  if (!text) {
    await sendTelegramMessage(env.telegramBotToken, chatId!, "Tom melding — send tekst.");
    return NextResponse.json({ ok: true });
  }

  await storeConversation("user", text);

  const classification = await classifyMessage(text);
  let reply: string;
  if (classification) {
    const stored = await storeLog(text, classification, "telegram_text");
    reply = `Lagret (${classification.kind}): ${classification.summary}`;
    await storeConversation("assistant", reply, stored?.id ?? null);
  } else {
    reply = "Klarte ikke tolke meldingen akkurat nå.";
    await storeConversation("assistant", reply);
  }

  await sendTelegramMessage(env.telegramBotToken, chatId!, reply);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: ingen feil; ruten `/api/meg/telegram` bygges.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/meg/telegram/route.ts
git commit -m "feat(meg): Telegram webhook-route som forstår, lagrer og svarer"
```

---

## Task 9: Koble webhook til Telegram + manuell ende-til-ende-verifisering

**Files:** ingen (oppsett + manuell test). Krever deployet URL (Vercel preview/prod) eller tunnel.

- [ ] **Step 1: Registrer webhook hos Telegram**

Når ruten er deployet (f.eks. `https://akgolf-hq.vercel.app/api/meg/telegram`), kjør:
```bash
curl -X POST "https://api.telegram.org/bot<MEG_TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "content-type: application/json" \
  -d '{"url":"https://<din-deploy>/api/meg/telegram","secret_token":"<MEG_TELEGRAM_WEBHOOK_SECRET>"}'
```
Expected: `{"ok":true,"result":true,...}`.

- [ ] **Step 2: Send testmelding fra Anders' Telegram**

Send: `sov dårlig, våknet 03`
Expected svar i Telegram: `Lagret (sleep): ...`

- [ ] **Step 3: Bekreft i databasen**

I Meg-Supabase SQL Editor:
```sql
select kind, text, value_num, value_unit, tags, source from me_log order by created_at desc limit 5;
select role, content from me_conversation order by created_at desc limit 5;
```
Expected: søvn-loggen + både user- og assistant-rad i conversation.

- [ ] **Step 4: Bekreft avvisning av fremmed avsender**

Send en melding fra en annen Telegram-konto til boten (eller simuler med feil chat-id).
Expected: ingen logg lagres, intet svar sendes.

- [ ] **Step 5: Commit (dokumentér oppsettet)**

```bash
git commit --allow-empty -m "chore(meg): webhook koblet og verifisert ende-til-ende"
```

---

## Self-Review-notater (utført ved planskriving)

- **Spec-dekning Plan 1:** Telegram-kanal (§4, Task 7-9) ✓ · egen Supabase + me_log/me_conversation (§5, Task 1) ✓ · forstå/lagre/svar (§6 ryggrad pkt 1-3, Task 4-8) ✓ · sikkerhet: chat-id-allowlist + hemmelig token + service-role server-side (§3, Task 7-8) ✓ · tone kort/tydelig (§13, system-prompt Task 5 + svar Task 8) ✓.
- **Utenfor Plan 1 (senere planer):** `/meg`-skjerm, hybrid søk, brief-jobber, de fire ferdighetene, minne-komprimering, onboarding/NotebookLM. Bevisst utelatt her.
- **Type-konsistens:** `Classification` brukes likt i Task 4/5/6. `readMegEnv()`-felter (`telegramBotToken`, `allowedChatId`, `telegramWebhookSecret`) brukt konsistent i Task 7/8. `isAuthorizedUpdate(input, cfg)`-signatur lik i Task 7-test og Task 8-bruk.
- **Avhengighet å bekrefte:** `@supabase/supabase-js` (Task 3 Step 2). Anthropic-klient + `AI_MODEL` finnes alt i `src/lib/ai/client.ts`.
