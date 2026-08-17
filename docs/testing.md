# Testing — AK Golf HQ

Kort guide for hvordan kjøre tester lokalt og hva som dekkes.

## Test-typer

| Type | Verktøy | Hvor | Antall |
|---|---|---|---|
| Unit | `node:test` + `tsx` | `src/**/*.test.ts` | 203 filer / 1379 tester |
| E2E | Playwright (chromium + webkit) | `tests/e2e/*.spec.ts` (én mappe siden 2026-08-03) | 36 specs |

> Tallene er MÅLT på `integrasjon/alt-16-08` 2026-08-16, ikke anslått. De sto
> på 183/34 tidligere samme dag — målt før integrasjonsgrenen samlet
> grupper, abonnement v2, tilgangsnivåer, varsling, capabilities og /innsyn.
> Stemmer ikke tallene når du leser dette, mål dem på nytt framfor å stole på
> tabellen:
> `find src -name "*.test.ts" | wc -l` og `ls tests/e2e/*.spec.ts | wc -l`.
>
> **I en worktree må du kjøre `prisma generate` først** (med dummy
> `DIRECT_URL`/`DATABASE_URL` i skallet, aldri i en fil — se
> `.claude/rules/gotchas.md`). Uten `src/generated/prisma` feiler ~63 tester
> på `Cannot find module`, og det ser ut som ekte regresjoner.

### To konvensjoner for hvor tester skal ligge

1. **Ved siden av koden** — `src/lib/auth/coached.ts` → `src/lib/auth/coached.test.ts`.
   Foretrukket for ny kode: testen er synlig når du redigerer modulen.
2. **I `__tests__/`** — `src/lib/__tests__/workbench/session-move.test.ts`.
   Brukes der flere moduler testes sammen, eller der testen trenger delte
   hjelpere fra `src/lib/__tests__/_hjelpere/`.

Begge plukkes opp av `npm test`. **Globben er `src/**/*.test.ts` siden
2026-08-15** — den var `src/lib/**` fram til da, så tester utenfor `src/lib/`
ble aldri kjørt (og en test som aldri kjører er verre enn ingen test: den ser
ut som dekning).

## Kommandoer

```bash
npm test               # Kjør alle unit-tester (node:test)
npm run test:e2e       # Kjør Playwright E2E (auto-starter dev-server lokalt)
npm run test:e2e:pilot # Pilot-smoke: opptak + Før/Etter (chromium)
npm run test:all       # Kjør begge sett etter hverandre
```

Playwright-aliaser som finnes fra før:
```bash
npm run e2e          # samme som test:e2e
npm run e2e:headed   # med synlig browser
```

## Unit-tester

Kjører in-memory uten DB eller nettverk. Brukes for ren logikk og biblioteks-integrasjon.

Tyngdepunktet ligger i `src/lib/domain/` (SG, hcp, ak-kategori, fys-score),
`src/lib/sg-hub/` (yardage, smash, same-distance) og `src/lib/auth/`
(guard-avvisning). Noen som er verdt å kjenne til:

- `src/lib/auth/guards-avvis.test.ts` — beviser at guardene AVVISER, ikke bare at
  de importeres. `scripts/check-action-auth.mjs` dekker importen; den sier
  ingenting om oppførsel.
- `src/lib/auth/coach-scope-idor.test.ts` — IDOR-regresjoner. Importerer ekte
  produksjonskode fra `booking-scope.ts`. **Legg aldri en lokal kopi av
  produksjonslogikk her** — det var nettopp et slikt speil som drev fra
  originalen og testet et felt (`serviceCoachId`) som ikke finnes i skjemaet.
- `src/lib/uke-helpers.test.ts` — kjører hver påstand i fire tidsvinduer via
  `src/lib/__tests__/_hjelpere/tid.ts`. Tidssonefeil er usynlige lokalt (Oslo) og
  dukker først opp på Vercel (UTC).
- `src/lib/stripe/abonnement-status.test.ts` — regresjon for `active` +
  `cancel_at_period_end` → `CANCELLED`. Feilen har skjedd før og er stille.
- `src/lib/gdpr/anonymiser-felter.test.ts` — kontrakt-test mot `schema.prisma`:
  fanger et nytt PII-felt på `User` som ikke er lagt inn i anonymiseringen.
- `src/lib/cron/auth.test.ts` — fail-closed når `CRON_SECRET` mangler. Den
  motsatte bugen (fail-open) har vært i koden før.

For nye unit-tester: se de to konvensjonene over. `npm test` plukker opp begge.

**Mutasjonssjekk nye sikkerhetstester.** Ødelegg produksjonskoden med vilje og
se testen bli rød før du stoler på den. En grønn test som ikke kan bli rød er
verre enn ingen — den ser ut som dekning. Dette er ikke automatisert; det er en
vane, og den har allerede avslørt tre falskt grønne tester i denne suiten.

## E2E-tester

Playwright starter `npm run dev` automatisk lokalt (se `playwright.config.ts`).
I CI antas appen å allerede kjøre på `PLAYWRIGHT_BASE_URL`.

De 36 specene (målt 2026-08-16). `auth-redirect.spec.ts` og `marketing.spec.ts`
sto listet her fram til da, men finnes ikke lenger — dekningen deres ligger i
`auth.spec.ts`, `routes-redirect.spec.ts` og `landing-page.spec.ts`.

**Auth og tilgang:** `auth.spec.ts` · `auth-guard.spec.ts` ·
`coach-scope-idor.spec.ts` · `i0-selvbetjent-gate.spec.ts` ·
`tilgang-uinnlogget.spec.ts` (nye 16.08-flater, bl.a. `/innsyn` — krever
verken innlogging eller DB-state, så den skipper ikke i CI)
**Booking:** `booking-drop-in.spec.ts` · `credit-booking.spec.ts`
**Ruter og respons:** `routes-public.spec.ts` · `routes-redirect.spec.ts` ·
`pages-render.spec.ts` · `404-handling.spec.ts` · `https-redirect.spec.ts` ·
`api-health.spec.ts` · `kjerne-klikk.spec.ts`
**PWA og offline:** `pwa-manifest.spec.ts` · `service-worker.spec.ts` ·
`offline-page.spec.ts` · `icons-pwa.spec.ts` · `splash-screens.spec.ts` ·
`static-assets.spec.ts`
**Meta og marketing:** `meta-tags.spec.ts` · `og-tags.spec.ts` ·
`robots-sitemap.spec.ts` · `landing-page.spec.ts` · `marketing-cta.spec.ts` ·
`marketing-turneringer.spec.ts`
**A11y:** `accessibility-landing.spec.ts` · `accessibility-portal.spec.ts` ·
`accessibility-v2-smoke.spec.ts`
**Layout-regresjoner:** `agencyos-toppbar-overlapp.spec.ts` (`--ak-topbar-h`) ·
`cookie-banner-dokk.spec.ts` (`--ak-cookie-h`) · `viewport-mobile.spec.ts`
**Flate-spesifikt:** `portal-hubs.spec.ts` · `workbench-suggest.spec.ts` ·
`pilot-recording-smoke.spec.ts`

> **De to layout-specene er verdt å merke seg:** begge de siste layoutfeilene
> (`--ak-topbar-h`-overlappen og `min-width: 0`-utblåsningen) ble fanget av
> **e2e**, ikke av skjermbilde-gaten. Skriv slike regresjonsspecer framfor å
> innføre en komponent-testramme.

⚠️ **`auth-guard.spec.ts`, `coach-scope-idor.spec.ts` og `kjerne-klikk.spec.ts`
skipper stille i CI** fordi `E2E_TEST_USER_*` / `E2E_COACH_*` /
`SCREENTEST_PASSWORD` ikke er lagt inn som Actions-secrets. De rapporterer grønt
uten å kjøre en eneste assertion. Se steg 1 i `docs/plan-testdekning.md` — det er
den eneste gjenstående oppgaven som krever et menneske.

### Env-vars som påvirker E2E

| Var | Default | Bruk |
|---|---|---|
| `PLAYWRIGHT_BASE_URL` | `http://localhost:3000` | URL Playwright kjører mot. Bytt til `:3002` hvis port 3000 er opptatt. |
| `E2E_TEST_USER_EMAIL` | — | Email til seedet test-PLAYER. Settes for å slå på credit-booking og PLAYER-redirect-tester. |
| `E2E_TEST_USER_PASSWORD` | — | Passord til samme bruker. |
| `E2E_COACH_EMAIL` | — | Valgfri coach for pilot-smoke. Ellers brukes `coachtest@akgolf.test`. |
| `E2E_COACH_PASSWORD` | — | Passord hvis du setter `E2E_COACH_EMAIL`. |
| `SCREENTEST_PASSWORD` | — | Passord for `coachtest@akgolf.test` (seed-screentest-coach). Nok alene for pilot-smoke. |
| `CI` | — | I CI-modus auto-starter ikke dev-server. |

Hvis coach-/spiller-credentials ikke er satt: testene som krever innlogging skip-er seg selv. Vil ikke gjøre suiten rød.

### Pilot-smoke (opptak + Før/Etter)

**Enkleste oppsett** (samme som resten av AgencyOS e2e):

```bash
# I .env.local — bare denne hvis coachtest allerede er seedet:
SCREENTEST_PASSWORD=ditt-testpassord

# Første gang (oppretter coachtest@akgolf.test + demo-stall):
npx tsx scripts/seed-screentest-coach.ts

npm run test:e2e:pilot
```

Alternativ: sett `E2E_COACH_EMAIL` + `E2E_COACH_PASSWORD` til en annen coach-konto.

Dekker: uinnlogget redirect på `/admin/recording`, `/admin/godkjenninger`, `/admin/spillere`; med coach — at opptak-UI, godkjenninger og Før-kort laster uten krasj.

**Merk:** Playwright leser ikke `.env.local` selv — `tests/e2e/_auth-helpers.ts` laster den.

### Full pilot-flyt (prod, uten mikrofon)

```bash
# E2E_COACH_EMAIL + E2E_COACH_PASSWORD i .env.local
npm run pilot:flyt-smoke
```

Script: `scripts/pilot-flyt-smoke.mjs` — login → manuell lydsamtykke → start/complete/dummy/analyze → godkjenn → Før-kort. Demo-sjekkliste: `docs/pilot-demo-sjekkliste.md`.

### Seed test-bruker

Når du vil kjøre credit-booking-testen lokalt:
1. Opprett en bruker i Supabase Auth (e.g. `e2e-test@akgolf.no` / random passord).
2. Sørg for at User-recorden i Prisma har `role = PLAYER` og en aktiv `Subscription` med `tier = PRO` + `monthlyCredits >= 1`.
3. Legg credentials i `.env.local`:
   ```
   E2E_TEST_USER_EMAIL=e2e-test@akgolf.no
   E2E_TEST_USER_PASSWORD=...
   ```

Det finnes p.t. ikke en dedikert seed-fil for E2E-bruker. `prisma/seed.ts` brukes for ordinær dev-data; E2E-bruker opprettes manuelt eller via Supabase-dashboard inntil egen seed-rutine er på plass.

## CI

`.github/workflows/ci.yml` kjører:
1. `npm test` — fail-hard på unit-tester.
2. Playwright mot dummy-built `npm start` med `continue-on-error: true` (krever live Supabase + Stripe-test-nøkler for full grønn — derfor non-blocking til CI-secrets er på plass).

E2E-rapporten lastes opp som artifact (`playwright-report/`).

## Kontrakttester mot kildekoden (16.08.2026)

Tre av flatene fra 16.08-integrasjonen er **rutekontrakter**, ikke skjermer.
De brytes ikke av noe man ser i en nettleser, men av at neste side som legges
til glemmer en gate. Slikt fanges av å lese koden, ikke av å klikke i den:

| Test | Fanger |
|---|---|
| `src/lib/__tests__/tilgang/portal-tilgang-kontrakt.test.ts` | Ny `/portal`-side uten `kreverTilgang`, eller en side åpnet for TALENT uten å stå i `talent-allowlist.ts` |
| `src/lib/__tests__/tilgang/admin-capability-kontrakt.test.ts` | Ny side/server action under `/admin/grupper|tester|agents|agenticos` uten `requireCapability`/`assertCapability`, og nye capabilities uten kallsted |
| `src/lib/notifications/triggers.test.ts` | Duplikat `key` eller `emailSlug`, email-kanal uten mal |

**Hvorfor ikke e2e:** talent-gaten er sovende til 1. september 2026
(`gratisForAlle()` i `src/lib/feature-flags.ts` gir alle FULL frem til da).
En e2e-test av gaten ville vært grønn uansett hvor ødelagt kontrakten var.

De to første fila har **fryste unntakslister** (`KJENTE_AVVIK`, `UGUARDEDE`,
`IKKE_HANDHEVET`). De skal krympe. Både et nytt avvik og et rettet avvik gjør
testen rød — det siste med beskjed om å fjerne linja.

> ⚠️ **Funnet av disse testene (16.08, IKKE rettet):** `src/app/portal/layout.tsx`
> kaller `requirePortalUser()` uten `kreverTilgang` og låser dermed HELE
> `/portal` til FULL. En TALENT-bruker sendes til `/portal/oppgrader`, som selv
> ligger under samme layout — altså en redirect-løkke, og alle 60
> `kreverTilgang: "TALENT"`-merkingene er unåelige. Sovende til 01.09.
> **Fiksen er ikke ett linjeskift:** 11 ruter utenfor allowlisten har ingen
> egen guard og lever kun på rot-layouten (se `UGUARDEDE`-lista). De må få
> `kreverTilgang: "FULL"` FØR rot-layouten løsnes, ellers blir en fail-closed
> feil til en ekte lekkasje.

## Manuell verifisering av tilgangsflytene 16.08

Disse krever innlogget bruker + DB-rader og er bevisst IKKE automatisert — en
spec som skipper stille når credentials mangler rapporterer grønt uten å kjøre
en eneste assertion, og ser dermed ut som dekning den ikke er.

**Forutsetning for 1–3:** sett systemklokken forbi 01.09.2026, eller flytt
`BETALING_STARTER` i `src/lib/feature-flags.ts` midlertidig. Ellers gir
`gratisForAlle()` alle FULL og ingenting av dette er observerbart.

1. **Talent-gaten (T2).** Spiller med `profilType = "TALENT"`:
   `/portal/tren/tester` og `/portal/analysere` skal ÅPNE ·
   `/portal/planlegge` og `/portal/gjennomfore` skal sende til
   `/portal/oppgrader?fra=laast` · oppgraderingssiden skal LASTE, ikke løkke.
2. **Tilgangsnivå-kilder (A3).** Sjekk at `resolveTilgang` gir FULL for hver
   kilde hver for seg: aktivt abonnement · coaching-pakke · gruppemedlemskap ·
   prøveperiode. En TALENT-profil som meldes inn i en gruppe skal bli FULL.
3. **Oppgraderingsveien (A2/A4).** `/portal/meg/abonnement` skal alltid være
   nåbar uansett nivå — det er veien ut av en låst konto.
4. **Ekstern lesetilgang (T8).** Innlogget GUEST med `VIEW_SHARED_STATS`:
   `/innsyn` viser kun spillere med gyldig samtykke MOT DEN GRUPPEN ·
   `/innsyn/<annen-spiller-id>` gir `notFound()`, ikke 403 (skal ikke røpe
   hvem som finnes) · trekk samtykket → spilleren forsvinner · revoker
   `EksternLeserGruppe` (`revokedAt`) → hele gruppen forsvinner.
5. **Planendrings-varsling (G4).** Flytt en økt i spillerens workbench → coach
   får ÉTT varsel per spiller per dag (`groupKey`-batching, ikke ett per økt) ·
   coach åpner spillerens workbench → varselet kvitteres.
6. **Gruppe-dedup (G3).** Rull ut samme gruppeplan to ganger → ingen duplikater
   (`IDEMPOTENT`) · to grupper med overlappende periode på samme spiller →
   `KRYSSKILDE` hopper over den andre. Regelen selv er dekket av
   `src/lib/domain/gruppeplan-dedup.test.ts`; det manuelle er utrullingen.
7. **Per-trener-capabilities (G6).** ADMIN fjerner `MANAGE_GROUPS` fra en
   coach i `/admin/settings/tilgang` → `/admin/grupper` redirecter for den
   coachen, OG server-actionen avvises (test begge — layout-guarden kjører
   ikke for server actions).
8. **E-postmaler.** Hver `emailSlug` i `src/lib/notifications/triggers.ts` må
   ha en matchende `EmailTemplate.slug`-rad. Registeret er formsjekket i
   `triggers.test.ts`, men koblingen til DB kan bare verifiseres mot databasen.

## Det som per nå krever manuell oppfølging

- **Stripe full checkout-test** (`booking-drop-in.spec.ts:48`) er `test.skip` — krever test-DB med seedet ServiceType + Stripe test-nøkler i CI.
- **Credit booking full flow** (`credit-booking.spec.ts:46`) er `test.skip` — krever koordinert test-DB-state.
- **E2E i CI** kjører med `continue-on-error: true` til CI-secrets (Supabase test-prosjekt, Stripe test-mode webhook) er konfigurert.
