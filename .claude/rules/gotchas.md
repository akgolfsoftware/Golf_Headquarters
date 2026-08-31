# Kjente gotchas — AK Golf HQ

Flyttet fra CLAUDE.md 2026-06-14. Les denne FØR du skriver kode. Når noe brekker, legg gotcha-en til her.
(Eldre PRISMA-7- og Supabase-detaljer finnes også i git-historikken.)
Ingen låst designkanon per 2026-07-25 — nytt system utvikles i Open Design (CLAUDE.md invariant 2).

### Prismas `_count` på en relasjon skanner HELE relasjonstabellen — hver gang (oppdaget 2026-08-30)
- **Symptom:** Supabase varslet «Your project is depleting its Disk IO Budget».
- **Rotårsak (målt i `pg_stat_statements` 30.08.2026):** `_count: { select: { entries: true } }`
  på `publicPlayer` oversettes av Prisma til en UFILTRERT
  `SELECT "playerId", COUNT(*) FROM public_player_entries GROUP BY "playerId"` som LEFT JOIN-es
  mot resultatet — uansett om spørringen din har `take: 50` eller returnerer én rad.
  `public_player_entries` er 398k rader / 150 MB, så hvert eneste kall dro ~14 700 blokker.
  Verste enkeltspørring: 251 656 kall × 190 ms = **13,3 timer eksekvering og 3,7 MILLIARDER
  bufferlesninger** — alene nok til å tømme IO-budsjettet på en instans med 224 MB shared_buffers.
- **Regel:** bruk ALDRI `_count` på en stor relasjon i en liste-/oppslagsspørring. Hent tellingen
  for idene du faktisk viser: `hentEntryAntall()` i `src/lib/stats/entry-antall.ts`
  (`groupBy` med `playerId: { in: ider }`, treffer unik-indeksen). Målt: 14 743 → 826 blokker.
- **Rammet:** `src/lib/scrapers/player-resolve.ts` (scraper-matching, kalt per resultatrad) og
  `src/app/(marketing)/stats/spillere/page.tsx` (to lister per sidevisning). Begge rettet.
  `src/lib/turneringer/dedupe-player-names.ts` beholder `_count` med vilje — den er et
  engangsskript som trenger tellingen for alle spillere uansett.
- **Samme økt:** `name ILIKE '%…%'` og `location ILIKE '%…%'` hadde ingen indeks (seq scan på
  hvert kall). Fikset med GIN/pg_trgm — se `scripts/disk-io-trgm-indekser-2026-08-30.ts`.
  Legger du et nytt `contains`-søk på en tabell, sjekk at det finnes en trigram-indeks først.
- **Sjekk selv når noe føles tregt:**
  `select left(query,120), calls, shared_blks_hit from pg_stat_statements order by shared_blks_hit desc limit 10`.

### Chat-autoscroll dro HELE dokumentet til bunn og gjemte innhold bak sticky toppbar (oppdaget 2026-08-14)
- **Symptom:** `/admin/agencyos` på 390px — «Åpne AgenticOS» ble klippet på midten rett under
  toppbaren, i både lys og mørk, i både prod og PR-preview.
- **Rotårsak (målt i prod):** `KonsollChat` kjørte `bunnRef.scrollIntoView({block:"end"})` ubetinget
  på `messages.length`. Lagrede meldinger kommer inn asynkront rett etter mount, så effekten fyrte
  ved sidelasting og smooth-scrollet dokumentet til `scrollY 2076 = maxScroll`. Toppbaren er
  `position: sticky; top: 0` og 112px høy på 390px (den wrapper til tre rader), så de øverste 112px
  av det siste skjermbildet lå bak den — lenka målt på `top 93`, altså 19 av 40px skjult.
- **Fiks:** autoscroll krever nå at brukeren faktisk har sendt noe (`harSendt`-ref settes i `send()`).
  Ved sidelasting møter du toppen av konsollen. I tillegg publiserer toppbaren sin målte høyde som
  `--ak-topbar-h` (ResizeObserver), og `html` har `scroll-padding-top: var(--ak-topbar-h, 0px)`.
- **Regel:** en `position: sticky; top: 0`-toppbar over DOKUMENT-rullen SKAL publisere høyden sin
  som `--ak-topbar-h`, ellers lander alle anker-hopp (scrollIntoView, `#fragment`, tastaturfokus)
  bak den. Bruk `useToppbarHoyde()` fra `src/components/v2/toppbar-hoyde.tsx` — eller
  `<ToppbarHoyde />` som første barn når toppbaren står i en server-komponent. Speilvendt
  `--ak-cookie-h` i bunnen: forskyv rullen, aldri legg noe oppå.
  Autoscroll-til-bunn hører hjemme i en EGEN scroll-container (mønsteret i
  `portal/v2/chat/PortalChatHjem.tsx`, som scroller `trådRef`), ikke på dokumentet.
- **Alle 12 dokument-sticky toppbarene bruker mekanismen** (14.08): PaperTopp (delt av alle
  PlayerHQ-skjermer med `PaperPage`), PlanV2, AnalysereV2, PortalChatHjem, KonsollChat,
  InnboksSaker, AdminSpillerRedigerV2, sesong-sticky-nav, leaderboards-client,
  sammenlign-spillere/resultat, wang-fellesside, coach-arsplan.
- **De øvrige `position: sticky`-forekomstene er noe annet og skal IKKE ha den:** sidepaneler
  (`top: 16`), tabellhoder og lister inne i en egen scroll-container, dialoghoder, og alle
  bunn-dokker (de bruker `--ak-cookie-h`). Måler du dem, blir `--ak-topbar-h` for stor og
  anker-hopp får unødig luft.
- Regresjonstest: `tests/e2e/agencyos-toppbar-overlapp.spec.ts`.
- **Felle ved testing:** `/stats/leaderboards`, `/stats/klubber`, `/stats/tour` m.fl. redirecter
  til `/stats` i prod (`STATS_PROTOTYPE_PREFIXES` i `proxy.ts`) — de er ubrukelige som testruter.

### Cookie-banneret lå oppå sticky bunn-chrome på mobil (oppdaget 2026-08-10)
- **Symptom:** på 390px med tomt samtykke kunne skjermens primære handling ikke trykkes —
  Playwright fikk «element intercepts pointer events» fra
  `<div role="dialog" aria-label="Cookie-samtykke">`. Målt på `/portal`: bunn-nav-en lå
  komplett skjult bak banner-kortet, men så klikkbar ut i skjermbildet.
- **Årsak:** banneret er `position: fixed; bottom: 0` og ~284px høyt på 390px. Ytre wrapper
  har riktignok `pointerEvents: none`, men selve kortet (`pointerEvents: auto`) er nesten
  full bredde og dekker hele bunnsonen. Gjaldt alle skjermer med bunn-nav eller sticky
  handlingsdokk, ikke bare den som avdekket det.
- **Fikset ved å forskyve dokken opp, ikke ved å legge banneret oppå:** banneret måler seg
  selv (ResizeObserver) og publiserer høyden som `--ak-cookie-h` på `<html>`; den nullstilles
  til `0px` når samtykke er gitt. Bunn-forankret chrome legger variabelen til sin egen
  bunn-padding — bakgrunnen strekker seg da bak banneret, så det blir ingen glippe.
- **Regel:** enhver ny `position: fixed`/`sticky`-flate forankret i bunnen SKAL ha
  `+ var(--ak-cookie-h, 0px)` i bunn-paddingen, ved siden av `env(safe-area-inset-bottom)`.
  Mønster: `padding: 12px 16px calc(12px + env(safe-area-inset-bottom) + var(--ak-cookie-h, 0px))`.
  Regresjonstest: `tests/e2e/cookie-banner-dokk.spec.ts`.
- **Ikke løst (samme klasse):** modale bunn-ark (`src/components/v2/bunn-ark.tsx`, z-index 91)
  ligger under banneret (z-index 9999). Åpnes et ark mens banneret vises, dekkes arkets
  bunn. Sjeldent i praksis (banneret forsvinner ved første valg), men er samme feil.

### Rutenett-kolonne uten `min-width: 0` sprenger skjermen (oppdaget 2026-08-10)
- **Symptom:** `/admin/innboks` på 1280 px viste avkuttet tekst, ingen «Se»-knapper og ingen
  høyrekolonne. Målt i nettleseren: listekolonnen var **1681 px** bred i et 1280 px vindu, og
  `document.scrollWidth` var klemt til 1280 — innholdet var altså klippet bort, ikke scrollbart.
- **Årsak:** `grid-cols-[3fr_2fr]` gir kolonnene `min-width: auto` som default. `Rad`
  (`src/components/v2/core.tsx`) setter `whiteSpace: nowrap` + `textOverflow: ellipsis` på tittel
  og undertekst — men `nowrap` gjør at *innholdets* minstebredde blir hele setningen, og `auto`
  lar kolonnen vokse til den. Ellipsen slår aldri inn, for kolonnen krymper aldri.
- **Regel:** enhver flex/grid-beholder som inneholder `Rad`, `nowrap`-tekst eller lange strenger
  MÅ ha `minWidth: 0` (eller `min-w-0`). `Rad`s indre `<div>` har det allerede — feilen ligger
  alltid i beholderen rundt.
- Samme `grid-cols-[3fr_2fr]`-mønster brukes i minst sju andre admin-komponenter (StallV2,
  AdminComplianceV2, AdminEmailV2, AdminAgenterV2, AdminSpillerTesterV2, AdminSpillerRedigerV2,
  feil-laste). De ble ikke rørt 10.08 fordi innholdet deres er kort nok til å ikke utløse feilen —
  men de er samme latente bombe. Sjekk med `document.documentElement.scrollWidth` mot
  `window.innerWidth` når du porterer en av dem.

### GitHub PR-overvåking: `actions_list`/`actions_get` er dyre uansett `minimal_output` (oppdaget 2026-08-06)
- **Symptom:** en økt som abonnerer på PR-aktivitet (`subscribe_pr_activity`) og deretter poller
  `mcp__github__actions_list` (`list_workflow_runs`) for å sjekke CI-status brenner tusenvis av tokens
  per kall — hvert `workflow_run`-objekt inneholder full repo-metadata (alle URL-felter, eier, lisens
  m.m.), gjentatt for hver kjøring i lista. `minimal_output: true` ble testet og **gjorde ingen
  forskjell** på denne responsen i denne økten — stol ikke på at parameteren trimmer alt.
- **Regel:** etter `subscribe_pr_activity` — **stol på de innkommende `<github-webhook-activity>`-
  hendelsene** for CI-status/kommentarer i stedet for å polle proaktivt. Webhooken varsler om CI-feil
  og nye kommentarer; unødvendig å spørre selv i mellomtiden.
- **Må du sjekke status manuelt likevel:** bruk `mcp__github__pull_request_read` med
  `method: "get_status"` — den returnerer kun commit-statusobjektet (liten payload), ikke
  `actions_list`/`actions_get` som drar med seg hele repo-objektet per kjøring.
- Gjelder alle økter i dette repoet, ikke bare PR-babysitting: foretrekk alltid det GitHub MCP-kallet
  med minst payload som faktisk svarer på spørsmålet, fremfor det som «har mest info».

### Token-økonomi generelt (2026-08-06): unngå å strømme store output/dokumenter rått inn i kontekst
Fire tiltak utover GitHub-punktet over — **ingen av dem skal senke kvalitetsgaten**
(`npm run verify`/`npm run build` er fortsatt OBLIGATORISK før commit, se `verify-og-commit`-skillen —
dette handler kun om HVORDAN output håndteres, ikke om å hoppe over steg):
1. **Redirect langkjørende kommandoer til fil, les kun halen/grep.** `npm run build` lister alle ~449
   ruter og `npm ci` logger hver pakke — la det gå til en loggfil
   (`npm run build > /tmp/.../build.log 2>&1; tail -60 build.log`) i stedet for å la det strømme rått
   inn i samtalen. Feilsøk med `grep -n "error\|Error" build.log` fremfor å lese hele loggen.
2. **Store dokumenter (`docs/ak-master.md`, `CLAUDE.md`, denne fila) leses med Grep eller
   Read+offset/limit** når du bare trenger én seksjon — ikke hele filen på nytt for hvert oppslag.
3. **Ikke les en fil rett etter egen Edit/Write «for å verifisere»** med mindre korrekthet faktisk
   avhenger av eksakt formatering (YAML-frontmatter i skills, JSON). Edit/Write-verktøyet bekrefter
   allerede at endringen gikk gjennom — stol på det for vanlig prosa.
4. **Lang, tema-hoppende økt:** foreslå ny økt/`/clear` fremfor å fortsette — hele historikken betales
   på nytt for hver melding i en lang økt. Modell-/effort-valg for selve arbeidet: se
   `prompt-engineer`-skillen §Claude-flåten i detalj og `agenticos`-skillen §Claude Code —
   arbeidsdisiplin (ikke duplisert her).
5. **PR-babysitting med `subscribe_pr_activity`: batch pushene selv når du aktivt retter feil.**
   Observert 06.08.2026 (samme økt som satte opp denne fila): fem uavhengige, ikke-relaterte
   endringer ble pushet hver for seg i stedet for samlet — CLAUDE.md §Arbeidsregler sier allerede
   «committ ofte, push samlet», men regelen brytes lettere i babysitting-modus fordi hver push gir
   en umiddelbar CI-bekreftelse. Push individuelt KUN når du faktisk trenger å isolere om nettopp
   DEN endringen fikser en rød CI-sjekk — batch alt annet (dokumentasjon, oppfølgingsspørsmål,
   ikke-relaterte tillegg) til én push. Hver push utløser to Vercel-webhook-leveranser
   (Building→Ignored/Ready) i tillegg til selve CI-kjøringen, uansett om builden faktisk kjører.

**Mistenkt, IKKE verifisert (06.08.2026):** samme bloat-mønster som `actions_list`/`actions_get`
(full repo-metadata per rad, `minimal_output` uten målbar effekt) kan gjelde flere GitHub MCP-lister
— `list_pull_requests`, `list_commits`, `search_code`, `list_issues` er ikke testet i denne økten.
Ikke skriv dette om til fasit før noen faktisk har sammenlignet payload-størrelsen med/uten
`minimal_output` på en av dem — første økt som bruker et av disse kallene bør verifisere og oppdatere
denne linjen til en bekreftet regel (eller fjerne mistanken hvis den ikke stemmer).

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
  «fase2-morketema-avklaring.md» (slettet i opprydding 27.08.2026 — git-historikk)
  §3.1: i `/portal` og `/admin/(legacy)` ble chromet
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
- Default per path bor i **`src/lib/v2/tema-default.ts`** (`onsketTema`) — ÉN kilde, kalt
  av både rot-layout (SSR) og `V2Shell` (rute-veksling). Duplikatet mellom de to var en
  driftsfelle. **Snudd 25.08.2026 (Anders):** `/portal|/admin` = **mørk**,
  `/auth|/forelder` = lys, landingssidene alltid lyse, alt annet mørk. Cookien
  `ak-v2-tema` vinner over defaulten begge veier. Låst av
  `src/lib/__tests__/tema-default.test.ts`. Ikke rør scriptet uten å teste hard reload på marketing — det er eneste
  beskyttelse mot lys-blink før paint.
