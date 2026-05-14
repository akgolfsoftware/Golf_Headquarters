# Testing — AK Golf HQ

Kort guide for hvordan kjøre tester lokalt og hva som dekkes.

## Test-typer

| Type | Verktøy | Hvor | Antall |
|---|---|---|---|
| Unit | `node:test` + `tsx` | `src/lib/__tests__/*.test.ts` | 12 |
| E2E | Playwright (Chromium) | `e2e/*.spec.ts` | 18 (12 grønne, 6 skip-betingede) |

## Kommandoer

```bash
npm test          # Kjør alle unit-tester (node:test)
npm run test:e2e  # Kjør Playwright E2E (auto-starter dev-server lokalt)
npm run test:all  # Kjør begge sett etter hverandre
```

Playwright-aliaser som finnes fra før:
```bash
npm run e2e          # samme som test:e2e
npm run e2e:headed   # med synlig browser
```

## Unit-tester

Kjører in-memory uten DB eller nettverk. Brukes for ren logikk og biblioteks-integrasjon.

Dekker:
- `rate-limit.ts` — no-op fallback uten Upstash-config (2 tester).
- `plan-template-schema.ts` — Zod-validering av plan-forslag (6 tester).
- `stripe-webhook` — `stripe.webhooks.constructEvent` med gyldig/ugyldig signatur (4 tester).

For nye unit-tester: legg dem i `src/lib/__tests__/*.test.ts`. `npm test` plukker dem opp automatisk.

## E2E-tester

Playwright starter `npm run dev` automatisk lokalt (se `playwright.config.ts`).
I CI antas appen å allerede kjøre på `PLAYWRIGHT_BASE_URL`.

Dekker:
- `auth-redirect.spec.ts` — `/portal` + `/admin` redirect uten login (4 tester, grønne).
- `auth-guard.spec.ts` — PLAYER-rolle blokkeres fra `/admin` (1 grønn + 1 betinget skip).
- `marketing.spec.ts` — forside, vilkår, personvern, sitemap, robots (6 grønne; `/priser` skip ved 404).
- `booking-drop-in.spec.ts` — gjeste-booking-flyt (3 grønne, full Stripe-checkout `test.skip`).
- `credit-booking.spec.ts` — Pro-credit-flyt (2 betinget skip).

### Env-vars som påvirker E2E

| Var | Default | Bruk |
|---|---|---|
| `PLAYWRIGHT_BASE_URL` | `http://localhost:3000` | URL Playwright kjører mot. Bytt til `:3002` hvis port 3000 er opptatt. |
| `E2E_TEST_USER_EMAIL` | — | Email til seedet test-PLAYER. Settes for å slå på credit-booking og PLAYER-redirect-tester. |
| `E2E_TEST_USER_PASSWORD` | — | Passord til samme bruker. |
| `CI` | — | I CI-modus auto-starter ikke dev-server. |

Hvis `E2E_TEST_USER_*` ikke er satt: testene som krever innlogget spiller skip-er seg selv automatisk. Vil ikke gjøre suiten rød.

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

## Det som per nå krever manuell oppfølging

- **Stripe full checkout-test** (`booking-drop-in.spec.ts:48`) er `test.skip` — krever test-DB med seedet ServiceType + Stripe test-nøkler i CI.
- **Credit booking full flow** (`credit-booking.spec.ts:46`) er `test.skip` — krever koordinert test-DB-state.
- **E2E i CI** kjører med `continue-on-error: true` til CI-secrets (Supabase test-prosjekt, Stripe test-mode webhook) er konfigurert.
