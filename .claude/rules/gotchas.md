# Fallgruver — AK Golf HQ

Kun regelen. Bakgrunn, målinger og feilsøking per punkt ligger i Git-historikken (`docs/arkiv/instruks-2026-09-21/gotchas-full.md`, fjernet fra repoet; søk på overskriften). Legger du til en ny, skriv regelen her i 1–3 linjer.

## Database
### Schema-endringer: `migrate dev`, `db push` OG `migrate deploy` er ALLE blokkert — bruk kirurgisk `db execute`
Prod-historikken er baselinet. `migrate dev` feiler (shadow-DB), `db push` vil droppe `datagolf_sync_state`, `migrate deploy` feiler med P3018. Additive endringer: legg modellen i `schema.prisma`, kjør `CREATE TABLE IF NOT EXISTS` via tsx + `PrismaPg` mot `DIRECT_URL` (mønster: `scripts/add-player-busy-blocks-2026-08-02.ts`), deretter `npx prisma generate`. Migrasjonsfila er bare en record. Feilet rad i `_prisma_migrations`: `npx prisma migrate resolve --rolled-back <navn>`.
### Prisma 7 og tilkobling
Connection-strings i `prisma.config.ts` (last `.env.local` eksplisitt), runtime via `@prisma/adapter-pg` med `DATABASE_URL`. `middleware.ts` heter `proxy.ts` (Node-runtime).
### `db.<ref>.supabase.co` er IPv6-only — Vercel når den aldri
Bruk Shared Pooler (`aws-<N>-eu-west-2.pooler.supabase.com`, bruker `postgres.<ref>`): transaksjon 6543 for `DATABASE_URL`, session 5432 for `DIRECT_URL`. Test med `select 1` før du setter Vercel-env; env krever redeploy. Verifiser prosjekt mot `list_projects` (kanonisk: `dcnxoztjtdqoidaekxry`, eu-west-2, `lhr1`).
### Prisma `_count` på stor relasjon skanner hele tabellen
Aldri `_count` på `public_player_entries` e.l. i liste-/oppslagsspørringer; bruk `hentEntryAntall()` i `src/lib/stats/entry-antall.ts`. Nytt `contains`-søk krever trigram-indeks.
### `?? undefined` nullstiller aldri et felt
`undefined` = ikke rør; `null` nullstiller (`Prisma.DbNull` for `Json?`). I upsert: sett `status` bare ved create.
### Prisma-klient foreldet etter `prisma generate`
Restart `next dev` etter hver generate før verifisering.
### JSON-blobs valideres med zod
Aldri `as unknown as <Type>` på forretningskritiske JSON-felter; bruk `safeParse`.

## Tid og datoer
Vercel kjører UTC, appen tenker Oslo. All uke-/dagslogikk via `src/lib/uke-helpers.ts`; `Intl.DateTimeFormat` alltid med `timeZone: "Europe/Oslo"`. Ikke sett `TZ` i Vercel. Dags-strenger («YYYY-MM-DD») parses med `Date.UTC(y, m-1, d)`, aldri `new Date(y, m-1, d)`.

## Betaling
Avbestill/endre-knapper kaller Stripe (`cancel_at_period_end`) FØR egen DB, eller sender til Billing Portal. Webhooken mapper `active` + `cancel_at_period_end` til `CANCELLED`.

## Bygg og drift
- `loading.tsx`/`template.tsx` importerer aldri fra en `"use client"`-modul (CSP-nonce). Vakt: `tests/e2e/csp-konsoll.spec.ts`.
- PWA: `serwist build serwist.config.mjs` kjører ETTER `next build` (webpack-pluginen kjører aldri under Turbopack). Ikke precache hele `public/`.
- Vercel-region skal matche Supabase (`lhr1`); ikke fjern `regions` i `vercel.json`.
- AI Caddie: bruk `@ai-sdk/anthropic` direkte (Gateway free-tier gir ikke modelltilgang), normaliser `ANTHROPIC_BASE_URL` med `/v1`, `toUIMessageStreamResponse()`, `stopWhen: stepCountIs(n)`, modell `claude-sonnet-4-6`.
- Scraper-dedupe: ferske robotkilder (Olyo/Østlandstour) skal være merge-target, ikke gamle NGF-stubber.

## UI
- Toppbar med `position: sticky; top: 0` over dokument-rullen publiserer høyden som `--ak-topbar-h` (`useToppbarHoyde()`). Autoscroll-til-bunn hører hjemme i egen scroll-container, ikke på dokumentet.
- Fast/sticky bunn-chrome legger `var(--ak-cookie-h, 0px)` til bunn-paddingen sammen med `env(safe-area-inset-bottom)`.
- Flex/grid-beholder med `Rad`/`nowrap`-tekst MÅ ha `minWidth: 0`, ellers sprenger den skjermen.
- Signalfargene `danger`/`ok`/`warn` er aldri tekstfarge på nøytral bunn; `dim` bærer aldri lesbar tekst (gjelder eksisterende Train-lock-kode).

## Arbeidsmåte
- Aldri kopier `.env*` mellom worktrees. `prisma generate` klarer seg med dummy `DIRECT_URL`/`DATABASE_URL` i skallet.
- Shell-cwd setter seg fast: bruk absolutte stier og `pwd` før filoperasjoner.
- Redirect lange kommandoer (`npm run build`) til fil og les halen; ikke les store dokumenter hele; ikke les en fil rett etter egen Edit.
- GitHub MCP: ikke poll `actions_list`/`actions_get` (enorme svar); stol på webhook-hendelser, eller bruk `pull_request_read` `get_status`. Batch pushene.
