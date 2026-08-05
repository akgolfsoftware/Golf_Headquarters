# Kjente gotchas — AK Golf HQ

Flyttet fra CLAUDE.md 2026-06-14. Les denne FØR du skriver kode. Når noe brekker, legg gotcha-en til her.
(Eldre PRISMA-7- og Supabase-detaljer finnes også i git-historikken.)
Ingen låst designkanon per 2026-07-25 — nytt system utvikles i Open Design (CLAUDE.md invariant 2).

### PRODUKSJONSINCIDENT 05.08.2026: `db.<ref>.supabase.co` er IPv6-only — Vercel når den aldri
- **Symptom:** prod nede siden ca. 11.07 (394 brukere rammet), forverret til total sirkelbryter-
  blokkering 05.08. Feilloggen viste `Authentication failed`/P1000 — så ut som feil passord.
  Etter passordrotasjon (Supabase → Reset database password) fortsatte det å feile, nå som
  `Can't reach database server`/P1001 — DET er signalet på dette gotcha-mønsteret, ikke passordet.
- **Rotårsak:** `DATABASE_URL`/`DIRECT_URL` pekte til `db.dcnxoztjtdqoidaekxry.supabase.co` (port
  5432 og 6543). Verifisert med `dns.resolve4`: denne hosten har **ingen A-record, kun AAAA**
  (IPv6) — bekreftet i Supabase-docs («Direct connection … IPv6, eller IPv4 kun med betalt
  IPv4-tillegg», og port 6543 på samme host er «Dedicated pooler», som arver samme IPv6-begrensning).
  Vercel serverless (lhr1) har ikke IPv6-egress → alltid `P1001` uansett riktig passord.
- **Fiks:** bruk **Shared pooler (Supavisor)**, en helt annen host: `aws-<N>-eu-west-2.pooler.
  supabase.com` — IPv4 garantert på alle tier. `<N>` er en klyngeindeks (var `1` for dette
  prosjektet, IKKE `0` — verifiser med `dns.resolve4` eller Supabase → «Connect»-knappen →
  fane «Transaction pooler», ikke Database-innstillinger-siden som bare viser direct/dedicated).
  Brukernavn endres også: `postgres.<project-ref>` (ikke bare `postgres`).
  `DATABASE_URL` = transaction mode port 6543, `DIRECT_URL` = session mode port 5432, samme host.
- **Verifiser FØR du setter noe i Vercel:** koble til med `pg.Client` fra terminalen din og kjør
  `select 1` — spar en redeploy-runde. `vercel env rm <NAVN> <miljø> --yes` +
  `printf '%s' "$URL" | vercel env add <NAVN> <miljø>` setter env uten å eksponere verdien i
  shell-historikk. Env-endring krever en påfølgende `vercel redeploy <deployment-id> --target
  production` for å tas i bruk (env leses ved cold start, ikke per request).
- Utvider den eldre, mer generelle notisen lenger ned i denne fila («Ytelse: Vercel-region MÅ
  matche Supabase-region») — samme region-prinsipp, men dette er spesifikt IPv4/IPv6-hullet.

### Aldri kopier `.env*` inn i en worktree — heller ikke for å kunne verifisere (oppdaget 2026-08-03)
- En ny `git worktree` mangler `.env.local` (den er gitignored, worktrees deler ikke ugitte filer),
  og `npm run verify` feiler derfor på `prisma generate` («Cannot resolve environment variable:
  DIRECT_URL»). Fristelsen er å `cp` filen inn fra hovedmappa — det gikk faktisk gjennom uten at
  `beskytt.mjs` stoppet den, fordi hooken fanger opp direkte lesing/skriving av `.env*` via
  Read/Write/Edit og enkelte Bash-mønstre, men ikke nødvendigvis en `cp <kilde> .env.local`.
  Oppdaget og ryddet samme økt (filen var gitignored, så ingen hemmelighet nådde GitHub) — men
  prinsippet («aldri rørt av agenter») ble brutt før hullet ble funnet.
- **Regel:** kopier ALDRI `.env*` mellom worktrees, uansett formål. Trenger `prisma generate` bare
  til å laste `schema.prisma` og skrive klientkode — den kobler seg ikke til databasen for dette —
  sett i stedet en midlertidig **dummy**-verdi for `DIRECT_URL`/`DATABASE_URL` i skallets miljø
  (`export DIRECT_URL=postgresql://dummy:dummy@localhost:5432/dummy`) kun for kommandoen, aldri i
  en fil. Kan ikke DB-verifiseres i worktreen uansett (kjente miljøbegrensninger, jf. PR #275):
  stol på `tsc`/`eslint`/`npm test` lokalt + CI (`ci.yml`, egne secrets) + Vercel-preview for resten,
  akkurat som steg 7 PR1 og PR2 gjorde.

### Workbench-datomatte (session-move-math.ts) — Oslo-korrekt siden 2026-07-27 (oppdaget 2026-07-19)
- **Var:** `mondayOf`/`dateForDayIndex`/`weekRefDate` regnet uke/dag fra `new Date()` med rå
  `.getDay()`/`.setHours(0,0,0,0)` — på Vercel (UTC) kunne en økt lagt til/flyttet nær norsk
  midnatt havne på feil dag/uke.
- **Fikset 2026-07-27:** `mondayOf` delegerer nå til `startOfWeek` fra `uke-helpers.ts` (Intl,
  Europe/Oslo) — `uke-helpers.ts` er ren og delt klient+server, så «no server imports»-kravet
  holdes. Regresjonstester for midnattsvinduet (vinter/sommer/DST-uka) ligger i
  `src/lib/__tests__/workbench/session-move.test.ts`. Ikke gjeninnfør rå getDay()-matte her.

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

### Schema-endringer: `migrate dev`, `db push` OG `migrate deploy` er ALLE blokkert — bruk kirurgisk `db execute`
Oppdaget 2026-06-22 ved tillegg av 3 tabeller. Utvidet 2026-08-02 med `migrate deploy`. Tre feller:
- **`prisma migrate dev` feiler** på shadow-DB-replay: en gammel migrasjon (`20260510..._add_parent_role_and_tier_enum`) feiler når alle 80 migrasjoner replayes fra bunnen («type UserRole does not exist», P3018). Prod-DB er fin, men shadow-replayen er ødelagt.
- **`prisma db push` vil DROPPE data**: prod har en `datagolf_sync_state`-tabell som ikke finnes i `schema.prisma` (pre-eksisterende drift), så push krever `--accept-data-loss` og ville slettet den.
- **`prisma migrate deploy` feiler på SAMME migrasjon** (lært 2026-08-02, mot prod). Prod-historikken er *baselinet*: `_prisma_migrations` inneholder kun `0_baseline` pluss et par stubs, ikke de ~80 gamle. Deploy tolker de manglende radene som «ikke anvendt» og prøver å spille dem av fra bunnen mot en base som allerede har skjemaet → `P3018`, «type "Tier" already exists». Merk at `migrate status` derfor VISER 80+ ikke-anvendte migrasjoner — det er forventet og normaltilstand, ikke et problem som skal «fikses» ved å kjøre deploy.
- **Kommer du til å ha kjørt deploy likevel:** den etterlater en feilet rad som blokkerer alle senere `prisma migrate`-kommandoer. Rydd med `npx prisma migrate resolve --rolled-back <migrasjonsnavn>`. Det skriver kun til `_prisma_migrations`, ikke til skjema eller data. Migrasjoner som feiler på `CREATE TYPE` feiler atomisk, så det er ingenting å rulle tilbake i praksis.
- **Trygg vei for ADDITIVE endringer:** legg modellen i `schema.prisma`, og kjør `CREATE TABLE IF NOT EXISTS ...` direkte via tsx + `PrismaPg`-adapter (`prisma.$executeRawUnsafe`) mot `DIRECT_URL`. Da rører du KUN dine egne tabeller. Deretter `npx prisma generate`. Bruk plain `userId String` (ingen `@relation`) i nye modeller så du slipper å redigere `User` og holder endringen isolert. Eksempler: `scripts/add-goal-progress-fields-2026-07-27.ts`, `scripts/add-player-busy-blocks-2026-08-02.ts`.
- **Migrasjonsfila er en RECORD, ikke noe som kjøres.** Skriv den gjerne for sporbarhet, men merk øverst at DDL-en kjøres med skriptet.

### Prisma 7 — connection-strings i `prisma.config.ts`, ikke `schema.prisma`
- Schema har bare `provider = "postgresql"`. Url ligger i `prisma.config.ts` → `datasource.url = env("DIRECT_URL")`.
- Runtime krever `@prisma/adapter-pg` med `DATABASE_URL` (pgbouncer-pooler).
- `prisma.config.ts` må eksplisitt laste `.env.local` med `dotenv.config({ path: ".env.local" })`.

### Next.js 16 — `middleware.ts` heter nå `proxy.ts`
Bare nodejs runtime, ikke edge.

### Supabase Connect — bruk Shared Pooler (IPv4) for konsistens
Transaction pooler + IPv4-toggle på. Da får du `aws-0-REGION.pooler.supabase.com` på begge porter.

### .dark-tema — primary=accent er samme farge (flaksen tok slutt 2026-08-03)
I mørkt tema er `primary` og `accent` begge lime (`#D1F843`). Par som `bg-primary text-accent` gir
derfor 1:1 kontrast — teksten blir usynlig. Gjelder begge kanaler: Tailwind (`--color-primary`
→ `--signal`, `--color-accent` → `--signal-fill`, begge lime i mørk) og inline
`hsl(var(--primary))` / `hsl(var(--accent))`.
- **Var:** parene rendret riktig fordi mørkt tema bare gjaldt en indre `.dark`-boks, mens
  `<html>` beholdt de lyse verdiene (`--primary` = mørkegrønn `#005840`). Komponenter utenfor
  boksen leste lys primary + lime accent = lesbart.
- **Ble utløst av designport steg 3:** når `html[data-v2-tema="dark"]` kom inn i hsl-triplett-
  blokken, arvet hele dokumentet mørkt, og alle parene kollapset samtidig. Fanget i preview før
  merge: cookie-bannerets «Godta alle» var helt usynlig på forsiden (målt 1:1).
- **Ryddet:** 24 forekomster rettet til `-foreground`-paret — 16 Tailwind (`text-accent` →
  `text-primary-foreground`) i 11 filer, 7 inline på `(marketing)/stats/*` + `global-error.tsx`,
  og `shared/cookie-banner.tsx`. Etter dette: null gjenstående par (verifisert med grep).
- **Regel:** bruk ALLTID `-foreground`-paret på en primary-flate — `bg-primary text-primary-foreground`,
  eller `hsl(var(--primary-foreground))` inline. Aldri `accent` som tekstfarge på `primary`.
  `--primary-foreground` er hvit i lys og nær-svart i mørk, så den holder i begge.

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

### Ytelse: Vercel-region MÅ matche Supabase-region (re-korrigert 19. juli kveld)
Kanonisk Supabase-prosjekt er **`dcnxoztjtdqoidaekxry`** i **eu-west-2 (London)** —
vercel.json har `"regions": ["lhr1"]` (samlokalisert). Uten `"regions"` kjører
funksjonene i default iad1 (USA) med TTFB 0,5–1,1 s. Ikke fjern eller endre uten
å flytte databasen samtidig.

OBS — to inverteringer på rad denne kvelden, verifiser alltid mot `list_projects`
FØR du stoler på et notat her:
1. 18. juli: notatet sa riktig «dcnx, eu-west-2/lhr1».
2. 19. juli ettermiddag: en økt inverterte det til «eljk er kanonisk, eu-west-1/
   dub1», med begrunnelse «total innloggings-stopp fordi env pekte på dødt dcnx».
   Denne påstanden var **feil** — verifisert 19. juli kveld: `dcnxoztjtdqoidaekxry`
   er `ACTIVE_HEALTHY` under riktig ny konto («akgolfsoftware's Org»), hadde et
   ekte vellykket innlogg samme dag kl. 15:25, og null økte feilrater i timene
   før byttet. `eljkjqvggsmnbbszzbpj` er GAMLE prosjektet fra den flaggede
   GitHub-kontoen — utilgjengelig fra denne kontoens Supabase MCP-tilkobling
   (`get_project` gir 403) og mangler alt arbeid gjort mot dcnx 19. juli (14
   GFGK/WANG-spillere, Google OAuth-oppsett, avatar-bucket m.m.). Byttet til
   eljk 19. juli kl. 19:02 forårsaket en EKTE regresjon (bekreftet av Anders:
   «Fortsett med Google» feilet med «provider is not enabled» mot eljk).
3. 19. juli kveld: byttet tilbake til dcnx (denne commiten) etter Anders'
   eksplisitte «koble til den nye databasen nå». Alle Supabase/DB-env satt til
   dcnx-verdiene + rebuild UTEN build-cache (NEXT_PUBLIC_* bakes inn ved
   bygging). Meg-boten har bevisst EGET Supabase-prosjekt (`ffaitjztfnelzwefbdhw`,
   MEG_SUPABASE_URL) — urørt av dette.

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

### Tema: `data-v2-tema` på `<html>` er ENESTE mekanisme (ryddet 2026-08-03, designport steg 3)
- Før: fire parallelle mekanismer (`data-v2-tema`, hardkodet `className="dark"` i 25 filer,
  `[data-theme="dark"]` som aldri ble satt, og en Cmd+K-toggle som skrev til
  `localStorage["akgolf-theme"]` — en nøkkel ingen leste). Konsekvensen var målt i
  `docs/port/fase2-morketema-avklaring.md` §3.1: i `/portal` og `/admin/(legacy)` ble chromet
  mørkt mens innholdsflaten forble lys, fordi `html[data-v2-tema="dark"]` og `.golfdata-scope`
  rører helt disjunkte variabelfamilier (snitt = 0 navn).
- Nå: `html[data-v2-tema="dark"]` er lagt inn i alle tre mørk-blokkene (`globals.css` hsl-triplett
  + DS-navn, `golfdata-tokens.css` scope-blokken), Cmd+K-toggle bruker samme cookie som railen
  (`ak-v2-tema`), og alle `className="dark"` er fjernet.
- Regel: sett aldri `className="dark"` for å låse en flate mørk, og introduser ingen ny
  tema-mekanisme. Trenger en flate fast palett, gjør det med egne scope-tokens (mønster:
  `wang-tokens.css`), ikke med tema-klassen.
- Kjente unntak som SKAL stå: `wizard-chrome.tsx` fjerner `data-v2-tema` bevisst (onboarding er
  låst lys). `.wang-tp` og `.gfgk-jr` har ingen mørk-gren — de 9 rutene er enpalett med vilje.
- Default per path (`src/app/layout.tsx` inline-script): `/portal|/admin|/forelder` = lys,
  alt annet = mørk. Ikke rør scriptet uten å teste hard reload på marketing — det er eneste
  beskyttelse mot lys-blink før paint.
