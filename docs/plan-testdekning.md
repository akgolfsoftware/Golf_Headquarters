# Plan — tett hullene i testdekningen

Skrevet 2026-08-15 etter en måling av testdekningen (se §Grunnlag). Åtte steg, én PR per steg,
sortert etter verdi delt på kostnad. Ingen steg krever DB-migrasjon eller nye avhengigheter.

> **Formålet er ikke et dekningstall.** Det er å (a) gjøre testene vi allerede har ekte, og
> (b) dekke de modulene der en feil er usynlig for `tsc`, eslint og skjermbilde-gaten.

---

## Grunnlag (målt 2026-08-15, ikke antatt)

`npm test` kjørt lokalt: **1055 tester, 147 suiter, 0 feil, 46 s.** 171 enhetstestfiler +
34 Playwright-specer. Suiten er rask og grønn der den finnes — problemet er fordelingen.

Ingen dekningsverktøy i repoet (verken c8, nyc eller istanbul). Dekningen er derfor målt
modul-for-modul: kildefil ↔ testfil, normalisert for begge konvensjonene i bruk
(kolokalisert `x.test.ts` og speilet `src/lib/__tests__/`).

**Forbehold:** kartleggingen er navnebasert og overrapporterer hull med anslagsvis 10 %.
Eksempel: `session-move-math.ts` framstår som udekket, men dekkes av
`__tests__/workbench/session-move.test.ts`. Verifiser per fil før du skriver en ny test.

| Område | Målt |
|---|---|
| `src/lib/sg-hub/` | 16 av 17 moduler uten test |
| Server actions | 166 filer, 0 direkte tester |
| `src/lib/workbench/` | ~18 ikke-action-moduler uten test |
| API-ruter | 62 handlere, 0 enhetstester, 14 av 62 bruker zod |
| `src/lib/auth/` | 10 av 16 moduler uten test |
| Rå datomatte uten test | 143 filer (20 rene, 123 server-/DB-koblede) |
| Komponent-/React-tester | 0 (bevisst — se steg 8) |

---

## Prinsipper for arbeidet

1. **En test som ikke kan feile er verre enn ingen test.** Den koster vedlikehold og gir falsk
   trygghet. Steg 1 handler kun om dette.
2. **Ren logikk først.** Moduler uten Prisma-/`next/headers`-import koster minutter å teste og
   fanger ekte regnefeil. DB-koblet kode utsettes til steg 4.
3. **Dekk feilene vi faktisk har hatt.** `gotchas.md` er fasit for hvilke feilklasser som
   rammer dette repoet — datomatte, Prisma-upsert, tema-kollisjon, tidssone.
4. **Ingen ny testramme.** `node:test` via `tsx` + Playwright. vitest installeres ikke.
5. **Hvert steg lukkes med en gate** der det er mulig, ellers gror hullet igjen.

---

## Stegene

### Steg 1 — Gjør de autentiserte e2e-testene ekte

**Problemet.** `playwright.yml` kjører kun på push til `main` og `workflow_dispatch`, mot prod.
`env:`-blokken setter bare dummy `DATABASE_URL`/`DIRECT_URL`; de eneste secrets i filen er de to
Telegram-verdiene. Ingen `E2E_TEST_USER_*`, ingen `E2E_COACH_*`, ingen `SCREENTEST_PASSWORD`.

Alle autentiserte specer bruker `test.skip(!creds, …)` med vilje («Uten credentials skal tester
bruke test.skip — ikke feile suiten», `_auth-helpers.ts`). I CI kjører de derfor null assertions
og rapporterer grønt:

- `auth-guard.spec.ts` — PLAYER blokkeres fra `/admin`
- `coach-scope-idor.spec.ts` — IDOR-vern
- `kjerne-klikk.spec.ts` — 4 skips, kjerne-klikkstiene
- `credit-booking.spec.ts`, `workbench-suggest.spec.ts`, `i0-selvbetjent-gate.spec.ts`

Dette er samme feilmodus som allerede er beskrevet øverst i `playwright.yml`: PR-triggeren ble
fjernet fordi den ga «en grønn «e2e»-hake på PR-er som i virkeligheten bare sa at prod var frisk».
Credential-halvdelen av den feilen står fortsatt. IDOR- og auth-guard-specene er de beste
sikkerhetstestene vi har, og de har aldri kjørt i automatikk.

**Endringen.**
1. Legg `E2E_TEST_USER_EMAIL`, `E2E_TEST_USER_PASSWORD`, `E2E_COACH_EMAIL`, `E2E_COACH_PASSWORD`
   og `SCREENTEST_PASSWORD` inn i `playwright.yml`s test-steg fra GitHub-secrets.
2. Endre `_auth-helpers.ts`: mangler credentials **og** `process.env.CI === "true"` → kast, ikke
   skip. Lokalt uten credentials beholdes skip-oppførselen uendret.
3. Skriv én linje i spec-README om at et skip i CI nå er en feil, ikke en tilstand.

**Avhengighet — Anders må gjøre dette.** Secretene må legges inn i repoets Actions-secrets av en
med admin-tilgang. Jeg kan ikke sette dem. Kontoene finnes allerede via
`scripts/seed-screentest-coach.ts` og `scripts/seed-screentest.ts`; passordet roteres med
`scripts/roter-screentest-passord.ts`.

**Ferdig når:** en kjøring av `playwright.yml` viser 0 skips i de seks specene over, og en
bevisst fjernet secret gjør jobben rød.

---

### Steg 2 — Utvid `npm test`-globben

**Problemet.** Globben er `src/lib/**/*.test.ts`. En test lagt ved en komponent, en API-rute eller
i `src/app/` blir stille ignorert — ingen feilmelding, ingen hake. I dag ligger ingen tester
utenfor `src/lib`, så ingenting går tapt ennå. Det er nettopp derfor det er billig å fikse nå.

**Endringen.** `src/lib/**/*.test.ts` → `src/**/*.test.ts` i `package.json`.

**Ferdig når:** `npm test` gir samme antall tester som før (1055), og en midlertidig
`src/components/røyk.test.ts` plukkes opp.

---

### Steg 3 — `src/lib/sg-hub/` — ren matte, 16 av 17 moduler uten test

**Problemet.** Modulene er ren matte uten Prisma-import, og de produserer tall spilleren ser:
`d-plane.ts` (kølleflate/bane-klassifisering), `conditions-adjust.ts` (temperatur-, vind- og
høydejustert distanse), `yardage-calc.ts`, `smash-curve.ts`, `tempo.ts`, `equipment-fit.ts`
(280 linjer), `strike-pattern.ts`, `drift-detection.ts`, `fatigue.ts`.

En feil vindkoeffisient gir et helt plausibelt tall. Verken `tsc`, eslint eller skjermbilde-gaten
kan se det. Dette er den eneste feilklassen i repoet der en enhetstest er *eneste* mulige forsvar.

**Endringen.** Tabelldrevne tester i samme stil som `src/lib/domain/` (som står på 19/19).
Prioritert rekkefølge — de fire første er nok til å lukke det meste av risikoen:

1. `conditions-adjust.ts` — baseline (15 °C, 0 m/s, 0 moh.) skal gi uendret distanse; kjente
   verdier for med-/motvind; `windDirectionDeg` 0 vs. 180; negativ høyde.
2. `d-plane.ts` — alle fem klassifiseringene, pluss begge sider av `TOLERANCE = 0.5`.
3. `yardage-calc.ts` — tom skuddliste, ett skudd, uteliggere.
4. `smash-curve.ts` + `tempo.ts` — kjente inn/ut-par.
5. Resten etter hvert som de røres.

**Ferdig når:** de fem første modulene har tester, og hver test har minst ett grensetilfelle
(tom input, null, negativ verdi) i tillegg til normaltilfellet.

---

### Steg 4 — Auth-guardene: bevis at de avviser

**Problemet.** `check-action-auth.mjs` er en god gate, men den beviser kun at en action
*importerer* en auth-helper. Ingenting tester at guarden faktisk **avviser**. Skriptets egen
kommentar sier hvorfor det betyr noe: server actions kan POST-es direkte forbi layout-guards.

`action-guards.ts`, `cbac.ts`, `minor.ts` og `coach-scope-idor.ts` har enhetstester. Ti moduler
har ikke: `assert-own-or-coached.ts`, `requireCapability.ts`, `requirePortalUser.ts`,
`canAccessMissionControl.ts`, `getCurrentUser.ts`, `ensureUser.ts`, `claim-pending-account.ts`,
`onboarding-state.ts`, `action-guards-assert.ts`, `logout.ts`.

«Importen finnes» og «sjekken avviser en fremmed `userId`» er to helt forskjellige påstander.

**Ekstra funn — speil-driften i `coach-scope-idor.test.ts`.** Den testen importerer riktignok
`coachScopedPlayerWhere` fra `./coached`, men resten av den tester *lokale kopier* av
produksjonslogikken (`kanBekrefteUtenStripeLeak` og `coachKanRoreBooking` er skrevet på nytt i
testfilen, merket «Speil av …»). Endres originalen i `bookinger/actions` uten at speilet endres,
fortsetter testen å være grønn mens den beviser noe om kode som ikke kjører. Dette er samme
klasse feil som steg 1: en test som ikke kan feile på det den later som den dekker.

**Endringen.**
1. Bytt de to speilene til å importere den ekte funksjonen. Er de ikke eksporterbare i dag,
   trekk dem ut i en ren modul først — det er en liten refaktorering, ikke en omskriving.
2. Tester for guardene med `t.mock.module()` mot Prisma. Mønsteret finnes i
   `src/lib/__tests__/agents/*.test.ts` og `src/lib/intelligence/benchmark-provider.test.ts` —
   ikke i `coach-scope-idor.test.ts`, som er rene predikat-tester uten DB.
   Per guard, tre tilfeller: egen bruker → slipper gjennom; coachet spiller → slipper gjennom der
   det er meningen; fremmed `userId` → kaster.

Prioritet: speil-driften først (den er aktivt villedende), deretter `assert-own-or-coached.ts` og
`requireCapability.ts` — de mest brukte guardene.

**Ferdig når:** de to speilene importerer ekte kode, og de fem mest brukte guardene har en
avvis-test hver.

---

### Steg 5 — API-grensene: zod + cron-secret

**Problemet.** 48 av 62 rutehandlere har ingen zod-referanse, stikk i strid med regelen «zod ved
API-grenser» i `gotchas.md`. Udekket og uvalidert: `/api/cron/[agent]`, `/api/health/ingest`,
`/api/inbox/inbound`, `/api/caddie/chat`, `/api/kommando/chat` og OAuth-callbackene.

Cron-mønsteret (`Bearer ${CRON_SECRET}`, fail-closed når env-variabelen er tom) er håndkopiert
på tvers av rutefiler og testet ingen steder. Det er den eneste sperren mellom åpent internett og
agent-kjøring.

**Endringen.**
1. Trekk cron-autentiseringen ut i én delt `src/lib/cron/auth.ts` og test den: manglende header,
   feil secret, **og** uset `CRON_SECRET` skal alle avvises. Bytt de håndkopierte sjekkene til
   den delte.
2. Legg zod-parsing på request-body i de fem rutene over. Én test per rute: gyldig body passerer,
   ugyldig gir 400 (ikke 500).

**Ferdig når:** cron-auth har egen test med de tre avvis-tilfellene, og de fem rutene validerer.

---

### Steg 6 — Datomatte: delt testhjelper + sveip

**Problemet.** `gotchas.md` dokumenterer *tre separate* dato-/tidsfeil, to av dem i
`src/lib/workbench/` (`session-move-math` Oslo-drift, `periode-core` UTC-midnatt 17.8→16.8).
Svaret hver gang var en regresjonstest for akkurat den filen som brakk.

Naboene gjør samme slags aritmetikk uten test: `duplicate-week.ts`, `session-update.ts`,
`insights.ts`, `load-workbench.ts`, `periode-core.ts`, `compliance.ts`.

Totalt fant målingen **143 udekkede `src/lib`-moduler** med rå `new Date(` / `getDay()` /
`setHours(` / `Date.UTC(`. Av disse er **20 rene** (ingen `use server`, ingen Prisma- eller
`next/headers`-import) og kan enhetstestes med én gang; de resterende **123 er server-/DB-koblede**
og hører hjemme i en senere runde — de skal *ikke* forsøkes dekket i dette steget.

Feilklassen er usynlig lokalt (Oslo) og dukker bare opp på Vercel (UTC). `tsc` ser den aldri.

**Endringen.**
1. `src/lib/__tests__/_hjelpere/tid.ts` — en hjelper som kjører en funksjon i fire vinduer:
   23:30 Oslo vinter, 23:30 Oslo sommer, DST-overgangsuka vår og høst.
2. Bruk den på de seks workbench-modulene over først.
3. Deretter resten av de 20 rene modulene, etter hvert som de røres.

**Omfangsgrense:** de 123 server-/DB-koblede filene er *ikke* med i dette steget. Å dekke dem
krever Prisma-mock per fil og ville alene være større enn resten av planen til sammen. Riktig
tiltak for dem er at ny kode går via `uke-helpers.ts` (allerede regelen i `gotchas.md`), ikke en
retroaktiv testrunde.

**Ferdig når:** hjelperen finnes og de seks workbench-modulene bruker den.

---

### Steg 7 — Irreversible og pengeførende stier

**Problemet.**
- **GDPR:** `anonymiser-bruker.ts` og `slett-eksterne-data.ts` (utover dry-run-testen) er udekket.
  Sletting kan ikke kjøres om igjen.
- **Booking:** `kollisjonsvern`, `policy`, `slot-hold` og `credits-tilgang` er dekket — bra. Men
  `availability.ts`, `credit-booking.ts` og `offentlig-booking.ts` er ikke, og dobbeltbooking er
  en kundesynlig feil.
- **Stripe:** `handle-event.ts` er dekket. Mangler den spesifikke regresjonen fra `gotchas.md`:
  `active` + `cancel_at_period_end` skal mappe til `CANCELLED`, ellers reverterer neste
  `subscription.updated` statusen stille tilbake til ACTIVE.

**Endringen.** Én test per punkt, i den rekkefølgen. Stripe-regresjonen er en fire-linjers test
og bør tas først — feilen har skjedd før.

**Ferdig når:** de tre områdene har hver sin test, og GDPR-testene kjører mot mock, aldri mot
ekte DB.

---

### Steg 8 — Rydd dokumentasjonen og steng døra

**Problemet.** `docs/testing.md` påstår 110 enhetstestfiler / 32 specer (faktisk: 171 / 34) og
dokumenterer to specer som ikke finnes lenger: `auth-redirect.spec.ts` og `marketing.spec.ts`.

**Endringen.**
1. Oppdater `docs/testing.md` med målte tall, dagens spec-liste og de to konvensjonene for hvor
   tester skal ligge.
2. Vurder en `scripts/check-test-skip.mjs`-gate: feiler hvis en Playwright-spec i CI rapporterer
   skip på en spec i en «må-kjøre»-liste. Holder steg 1 fra å gro igjen.

**Om komponent-/React-tester (bevisst valgt bort).** Null i dag, og det er trolig riktig gitt at
Paper-skjermbilde-gaten dekker visuell korrekthet. Men merk at de to siste layoutfeilene
(`--ak-topbar-h`-overlapp og `min-width: 0`-utblåsningen) begge ble fanget av **e2e**-specer,
ikke av skjermbilder. Fortsett å skrive slike regresjonsspecer framfor å innføre en
komponent-testramme.

---

## Rekkefølge og arbeidsmåte

| Steg | Innhold | Blokkert av |
|---|---|---|
| 1 | E2E-credentials i CI + fail-i-stedet-for-skip | **Anders legger inn secrets** |
| 2 | Utvid test-globben | — |
| 3 | `sg-hub`-mattetester | — |
| 4 | Auth-guard avvis-tester | — |
| 5 | Cron-secret + zod på API-grenser | — |
| 6 | Dato-hjelper + workbench-sveip | — |
| 7 | GDPR / booking / Stripe-regresjon | — |
| 8 | Dokumentasjon + skip-gate | steg 1 |

Steg 2 + 3 kan slås sammen til én PR (begge er rene tillegg, ingen risiko). Steg 1 er den eneste
med menneskelig avhengighet — den kan startes parallelt siden kodebiten i `_auth-helpers.ts` ikke
venter på secretene.

**Per PR:** branch → `npm run verify && npm test` → commit → push → draft-PR → Anders sier ja til
main. Ingen av stegene rører `prisma/schema.prisma`, `.env*` eller deploy-oppsettet.

---

## Det jeg vil fraråde

**Ikke innfør et dekningsverktøy og jag en prosent.** Med 166 server actions og 62 rutehandlere
som er tungvinte å enhetsteste vil et globalt tall se lavt ut, og det vil dytte innsatsen mot det
som er lettest å dekke framfor mot `sg-hub` og auth-guardene. Et gulv per katalog for
`src/lib/domain/`, `src/lib/sg-hub/` og `src/lib/auth/` styrer bedre.

---

## Spørsmål til Anders

1. **Secretene i steg 1** — legger du dem inn, eller vil du heller at e2e-credentials hentes fra
   et annet oppsett? Uten dem står steg 1 og 8 stille.
2. **Skal e2e bli en PR-gate igjen?** Planen over lar `playwright.yml` bli værende på `main` og
   gjør bare de eksisterende testene ekte. Å gate PR-er krever i tillegg at testene kjøres mot
   Vercel-previewen (URL må plukkes opp fra deployment-hendelsen) og legger 5–10 min på hver PR.
   Egen vurdering, ikke med i denne planen.
3. **Rekkefølgen** — eller vil du ha steg 7 (penger/GDPR) før steg 3?
