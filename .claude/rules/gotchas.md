# Kjente gotchas — AK Golf HQ

Flyttet fra CLAUDE.md 2026-06-14. Les denne FØR du skriver kode. Når noe brekker, legg gotcha-en til her.
(Eldre PRISMA-7- og Supabase-detaljer finnes også i git-historikken.)
Designkanon: `.claude/rules/design-system-regel.md` (v13/golfdata).

### Workbench-datomatte (session-move-math.ts) bruker rå getDay()/setHours() — ikke Oslo-korrekt (oppdaget 2026-07-19, IKKE fikset)
- **Symptom (potensielt):** `mondayOf`/`dateForDayIndex`/`weekRefDate` i `src/lib/workbench/session-move-math.ts`
  regner uke/dag fra `new Date()` med rå `.getDay()`/`.setHours(0,0,0,0)`/`.setDate()` — akkurat
  mønsteret `uke-helpers.ts`-gotchaen forbyr. Filen er bevisst «pure date math, no server imports»
  (delt klient+server for drag-drop), så den går IKKE via `uke-helpers.ts`.
- **Årsak:** Vercel kjører UTC. Nær midnatt i Oslo (23:00–01:00 ca., avhengig av sommer/vintertid)
  kan server (UTC) og klient (Oslo) uenes om hvilken dag/uke «nå» er → en økt lagt til eller flyttet
  i det vinduet kan havne på feil dag/uke.
- **Ikke fikset 2026-07-19** (kvelden før lansering — for risikabelt å endre kjernematte i
  `moveWorkbenchSession`/`addWorkbenchSession`/coach-Workbench uten regresjonstid). Testet
  ende-til-ende via direkte DB-skrivning/lesning (samme kontrakt som koden) — funker for
  dagtid-bruk, som er alt 30-spiller-testen i morgen trenger.
- **Fiks (gjør etter lansering):** flytt logikken til å bruke `Intl.DateTimeFormat` med
  `timeZone: "Europe/Oslo"` (samme mønster som `uke-helpers.ts`), eller re-eksporter derfra hvis
  «no server imports»-kravet kan lempes. Test grundig rundt midnatt.

### dedupe-tournament-data foretrekker NGF som merge-target — feil for ferske scraper-kilder (oppdaget 2026-07-18)
- `dedupeTournaments()` velger target med regelen «behold NGF-raden» (den historiske
  import-kilden hadde mest data). Da Olyo/Østlandstour ble koblet på GolfBox-roboten,
  fantes det gamle NGF-stubs (fra `import-norske-turneringer.ts`) med SAMME navn+år som
  de nye robot-radene. Dedupe skjulte de ferske robot-radene (OLYO/OSTLANDS, riktig
  status + region i notes) bak de tomme NGF-stubbene → serie-/regionfiltrering brøt og
  Østlandstour beholdt feil COMPLETED-status.
- Regel: når en fersk scraper-origin kolliderer med en gammel NGF-stub, skal den FERSKE
  raden være target. Sjekk retningen etter dedupe (`sourceOrigin in (OLYO,OSTLANDS)` +
  `mergedIntoId != null` skal være ~0). NGF-stubbene hadde 0 entries, så korreksjonen var
  å snu `mergedIntoId` (robot-rad aktiv, stub merget inn) — reversibel soft-merge.

### Stripe-abonnement — knapper i appen MÅ kalle Stripe, aldri bare egen DB (oppdaget 2026-07-13)
- «Avbestill»-knappen satte kun `Subscription.status = CANCELLED` lokalt — Stripe fortsatte å
  belaste kortet. Regel: enhver avbestill/endre-knapp kaller Stripe (`subscriptions.update` med
  `cancel_at_period_end: true`) FØR DB-oppdatering, eller sender brukeren til Billing Portal.
- Webhooken må mappe Stripe-status `active` + `cancel_at_period_end` → `CANCELLED`, ellers
  overskriver neste `customer.subscription.updated` den lokale statusen tilbake til ACTIVE.

### Prisma — `?? undefined` kan ALDRI nullstille et felt (oppdaget 2026-07-13)
- `undefined` i `update()`-data betyr «ikke rør feltet»; `null` nullstiller. Felt som kan tømmes
  fra UI (budsjett, notater) skal sendes eksplisitt som null — og for `Json?`-felt må det være
  `Prisma.DbNull` (leses tilbake som JS `null`). Symptomet var «fjern ukebudsjett» som aldri lagret.

### Upsert-speil — status skal KUN settes ved create, aldri ved update (oppdaget 2026-07-13)
- `upsertV2ForPlanSession` satte `status: "PLANNED"` ubetinget → hver redigering/flytting av en
  økt nullstilte COMPLETED/CANCELLED tilbake til PLANNED. Regel: i upsert-mønstre der andre
  kodestier eier status-feltet, hold status utenfor update-grenen.

### Tidssone — Vercel kjører UTC, appen tenker Oslo (oppdaget 2026-07-13)
- All dato/uke-logikk skal gå via `src/lib/uke-helpers.ts` (Oslo-korrekt siden 2026-07-13) — aldri
  rå `getDay()`/`setHours(0,0,0,0)` på `new Date()` i sider/komponenter.
- All `Intl.DateTimeFormat`-formatering MÅ sette `timeZone: "Europe/Oslo"` (mønster:
  `OSLO_DAG_FMT` i `BookingV2.tsx`) — server (UTC) og klient (Oslo) avviker ellers.
- IKKE sett `TZ=Europe/Oslo` i Vercel uten datamigrering: databasen lagrer naiv veggklokke i
  serverens lokale tid, så en TZ-endring forskyver tolkningen av alle eksisterende tidsstempler.

### Serwist/PWA — webpack-pluginen kjører ALDRI under Turbopack (oppdaget 2026-07-10)
- `withSerwistInit` fra `@serwist/next` genererer sw.js kun via en webpack-hook. Next 16 bygger
  med Turbopack → hooken kjører aldri → `/sw.js` fantes aldri i prod (404 på hver sidelasting,
  push-varsler døde). `SERWIST_SUPPRESS_TURBOPACK_WARNING=1` i build-scriptet skjulte advarselen.
- **Løsning (i bruk):** configurator-modus — `serwist build serwist.config.mjs` kjøres ETTER
  `next build` (se `package.json` build-script). Configen bruker `serwist()` fra
  `@serwist/next/config` og MÅ være `.mjs` (CLI-en laster den med ren `import()`, og repoet er CJS).
- Rekkefølgen er kritisk: precache-manifestet globber `.next/`-output, så serwist-steget må stå sist.
- Ikke precache hele `public/` (19 MB bilder) — tunge mapper står i `globIgnores` i configen.

### AI Caddie — modell-tilgang + AI SDK-feller (oppdaget 2026-06-23)
- **Vercel AI Gateway free-tier gir IKKE modell-tilgang** («Free tier users do not have access to this model»). Caddie-chat bruker derfor `@ai-sdk/anthropic` direkte (`ANTHROPIC_API_KEY`), ikke `@ai-sdk/gateway`.
- **`ANTHROPIC_BASE_URL` i miljøet mangler `/v1`** (`https://api.anthropic.com`). Raw `@anthropic-ai/sdk` legger til `/v1/` selv, men `@ai-sdk/anthropic` bruker verdien som-den-er → `/messages` → 404 «Not Found». Løsning: normaliser baseURL i ruten (`createAnthropic({ baseURL: …endsWith("/v1") ? … : …+"/v1" })`). Ikke endre env-verdien — andre agenter bruker den.
- **`useChat`/`DefaultChatTransport` krever `toUIMessageStreamResponse()`**, ikke `toTextStreamResponse()` (sistnevnte gir tom UI selv om svaret kommer).
- **Tools trenger `stopWhen: stepCountIs(n)`** i `streamText`, ellers stopper modellen etter første tool-call uten å svare.
- **AI SDK v6 tool-parts:** navnet ligger i `part.type` (`"tool-<navn>"`), ikke `part.toolName`; state er `output-available`/`output-error`/`input-*`, ikke «result».
- **Gyldig Sonnet-id mot api.anthropic.com:** `claude-sonnet-4-6` (bekreftet via `anthropic.models.list()`).

### JSON-blobs MÅ valideres med zod
Alle `as unknown as <Type>` på JSON-felter fra Prisma er forbudt for forretningskritiske data. Bruk zod `safeParse` ved read.

### Schema-endringer: `migrate dev` og `db push` er BEGGE blokkert — bruk kirurgisk `db execute`
Oppdaget 2026-06-22 ved tillegg av 3 tabeller. To feller:
- **`prisma migrate dev` feiler** på shadow-DB-replay: en gammel migrasjon (`20260510..._add_parent_role_and_tier_enum`) feiler når alle 80 migrasjoner replayes fra bunnen («type UserRole does not exist», P3018). Prod-DB er fin (`migrate status` = up to date), men shadow-replayen er ødelagt.
- **`prisma db push` vil DROPPE data**: prod har en `datagolf_sync_state`-tabell som ikke finnes i `schema.prisma` (pre-eksisterende drift), så push krever `--accept-data-loss` og ville slettet den.
- **Trygg vei for ADDITIVE endringer:** legg modellen i `schema.prisma`, og kjør `CREATE TABLE IF NOT EXISTS ...` direkte via tsx + `PrismaPg`-adapter (`prisma.$executeRawUnsafe`) mot `DIRECT_URL`. Da rører du KUN dine egne tabeller. Deretter `npx prisma generate`. Bruk plain `userId String` (ingen `@relation`) i nye modeller så du slipper å redigere `User` og holder endringen isolert.

### Prisma 7 — connection-strings i `prisma.config.ts`, ikke `schema.prisma`
- Schema har bare `provider = "postgresql"`. Url ligger i `prisma.config.ts` → `datasource.url = env("DIRECT_URL")`.
- Runtime krever `@prisma/adapter-pg` med `DATABASE_URL` (pgbouncer-pooler).
- `prisma.config.ts` må eksplisitt laste `.env.local` med `dotenv.config({ path: ".env.local" })`.

### Next.js 16 — `middleware.ts` heter nå `proxy.ts`
Bare nodejs runtime, ikke edge.

### Supabase Connect — bruk Shared Pooler (IPv4) for konsistens
Transaction pooler + IPv4-toggle på. Da får du `aws-0-REGION.pooler.supabase.com` på begge porter.

### .dark-tema — primary=accent er samme farge (skjørt)
I `.dark`-klassen er `primary` og `accent` begge lime. Par som `bg-primary text-accent` rendres
riktig i dag, men er flaks — ny kode skal bruke `-foreground`-parene (`bg-primary text-primary-foreground`).

<!-- Mal for nye gotchas:
### <Kort tittel>
- **Symptom:**
- **Årsak:**
- **Løsning:**
- **Lært:** <dato>
-->

### Shell-cwd i verktøyøkter setter seg fast (oppdaget 2026-07-12)
En `cd` i en sammensatt kommando kan bli hengende som arbeidskatalog for SENERE
kommandoer i økta. Konsekvens sett i praksis: `.env.local` ble «kopiert til
rot» men havnet i `src/app/admin/`, og en `launch.json` ble skrevet til
`src/app/admin/.claude/`. Regel: bruk absolutte stier, og verifiser med `pwd`
før filoperasjoner mot rot.

### Ytelse: Vercel-region MÅ matche Supabase-region (oppdatert 2026-07-18)
Supabase ligger nå i **eu-west-2 (London)** etter kontobyttet (nytt prosjekt
`dcnxoztjtdqoidaekxry`). Uten `"regions"` i vercel.json kjørte funksjonene i
default iad1 (USA) — hver Prisma-spørring krysset Atlanteren og sider med mange
spørringer fikk TTFB på 0,5–1,1 s. Fix: `"regions": ["lhr1"]` i vercel.json
(London, samlokalisert med DB). Ikke fjern eller endre denne uten å flytte
databasen samtidig. (Historikk: var eu-west-1/dub1 før 18. juli-byttet.)

### Dev-server med foreldet Prisma-klient etter `prisma generate` (truffet 2×, 2026-07-13)
Kjører `npx prisma generate` (nytt felt/enum) mens `next dev` står oppe →
server-actions feiler stille med PrismaClientValidationError («Unknown
argument»)/gamle typer, selv om tsx-scripts mot samme kode virker. Turbopack
plukker ikke opp ny generert klient. Regel: RESTART dev-serveren etter hver
`prisma generate` før Playwright-verifisering.

### Dato-strenger («YYYY-MM-DD») → Date MÅ bruke UTC-midnatt, ikke serverens lokale (truffet 2026-07-19)
- `new Date(y, m-1, d)` i en server action gir SERVERENS lokale midnatt. Vercel (UTC) = riktig,
  men lokal dev (Oslo) skriver 22:00Z dagen FØR til samme prod-DB → datoer sklir én dag bakover
  per lagring fra lokal maskin. Truffet i gruppe-workbench periode-lagring (17.8 ble 16.8).
- Regel: dags-strenger parses med `new Date(Date.UTC(y, m-1, d))`. Lesing tilbake med lokale
  getters er trygt i Oslo (øst for UTC). Fikset i `gruppe-periode-actions.ts` + `periode-core.ts`.
