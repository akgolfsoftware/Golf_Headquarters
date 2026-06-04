# Ultra-review — AK Golf HQ (Boris Cherny-stil) — 2026-05-14

## Sammendrag

| Kategori | Funn |
|---|---|
| P0 (kritisk) | 4 |
| P1 (viktig) | 6 |
| P2 (rydding) | 4 |
| Røde flagg (krever beslutning) | 5 |

---

## 1. Arkitektur

### App Router — Server vs. Client Components

108 `.tsx`-filer har `"use client"`. Ingen `page.tsx` er Client Components — korrekt.

**Mønster å rette:** `src/app/admin/approvals/approval-actions.tsx` bruker `router.refresh()` etter server action. Bør bruke `revalidatePath` i selve server-actionen og slippe `router.refresh()` på klientsiden. Samme mønster i `plan-actions.tsx`, `feedback-modal.tsx`, `player-plan-actions.tsx`.

`PortalShell` og `AdminShell` er async Server Components som gjør 2-3 DB-kall per request. `AdminShell` kaller ikke `prisma.notification.count` — mangler `varslerUlest`-prop til `NotificationBell`. Bell-indikatoren i admin er alltid tom.

### Data-flyt

`getDashboardData` (`src/lib/dashboard-data.ts:61`) gjør separat kall for `aktivePlanIds` før `Promise.all`. To roundtrips der det første kunne vært sub-query.

**BUG:** `getAdminHubData` (`src/lib/admin-hub-data.ts:128-135`) teller `ubesvarteMeldinger` fra `coachingSession` med `kind: "DIRECT"` uten `where`-klausul for uleste. Teller alle direkte sesjoner — ikke uleste meldinger. KPI-panelet viser feil tall.

### Prisma

`src/lib/booking/credit-booking.ts` bruker `$transaction` korrekt med optimistisk locking. Godt mønster.

**Race condition:** `src/app/admin/messages/actions.ts:69-73` oppdaterer `CoachingSession.messages` som JSON-blob med `as unknown as object`. Ingen transaksjon — ved to samtidige coach-svar kan den ene overskrive den andre.

### Auth

`requirePortalUser` brukes konsistent i shells og de fleste actions.

**Inkonsistent:** `src/app/admin/agents/actions.ts` og `src/lib/agents/actions.ts` bruker `getCurrentUser()` + manuell rolle-sjekk. Standardiser til `requirePortalUser`.

---

## 2. Kode-kvalitet

### `any`-bruk

Kun én ren `: any`: `src/app/sw.ts:20` i service worker. Akseptabelt (web-push API-typer dårlig dekket).

### `as unknown as`-casts (9 forekomster)

- `src/lib/prisma.ts:10` — globalThis-trick, OK
- `src/lib/payments/record.ts:220` — Stripe Invoice-type ikke fullt eksponert
- `src/app/admin/plans/[planId]/actions.ts:673` — JSON blob, mangler type
- `src/app/admin/messages/actions.ts:60,72` — JSON-array, se race condition
- `src/app/admin/plans/new/actions.ts:244` — PlanTemplate.payload, mangler zod
- `src/app/admin/team/page.tsx:37` — **unødvendig cast** (Prisma infererer allerede)
- `src/app/portal/coach/plans/[planId]/page.tsx:142` — samme JSON-array
- `src/app/portal/meg/helse/page.tsx:13` — preferences uten helse-felt (design-brist)

### console.log i prod

**Sikkerhetsbrudd:** `src/app/(marketing)/kontakt/actions.ts:20` logger brukernavn, e-post, melding i klartekst til serverlogs. Bør erstattes med Resend.

### TODO-kategorisering

**Kritisk:**
- `/portal/meg/sikkerhet` — sikkerhetsscore er hardkodet, aktive sesjoner mangler
- `/portal/meg/helse` — skader lagres ad-hoc i preferences-JSON
- `(marketing)/kontakt` — meldinger sendes ikke, kun console.log

**Aspirational:** leaderboard, kalender-streak, pyramide, TrackMan per-slag, badges, tema-switcher

### Duplisering

`bygSystemPrompt` implementert 2 steder:
- `src/lib/anthropic.ts:29` — PlayerHQ AI-chat
- `src/app/api/admin/coach-ai/route.ts:28` — CoachHQ per-spiller-chat

Identisk struktur. Bør trekkes til felles util.

---

## 3. Type-safety

`tsconfig.json` har `"strict": true`. Alle 5 strict-flagg aktive.

**Strukturelt problem:** `as unknown as`-casts på JSON-blobs (CoachingSession.messages, PlanTemplate.payload) gjør at ødelagte DB-rader krasjer stille. Bør valideres med zod ved read.

`src/app/admin/team/page.tsx:37` — `teamRaw as unknown as TeamMember[]` kaster bort type-sikkerheten uten grunn.

---

## 4. Sikkerhet

**Stripe webhook:** `constructEvent(body, sig, secret)` — korrekt signaturverifisering. ✓

**SQL-injection:** Ingen `$queryRaw`. Rent. ✓

**Secrets:** Ingen hardkodede. `.env.example` komplett. `.gitignore` korrekt. ✓

**GOOGLE_TOKEN_ENCRYPTION_KEY:** valideres med lengdesjekk. ✓

**CSRF:** Next.js 15+ Server Actions har innebygd origin-sjekk. ✓

**Auth-bypass:** Alle layouts kaller `requirePortalUser`. Cron-endepunkter bruker `CRON_SECRET`. ✓

**Svakhet — rate-limit:** `src/lib/rate-limit.ts` er in-memory med `setInterval`-cleanup. Fungerer kun på én instans. Cold start nullstiller. Kommentert som midlertidig.

**Input-validering:**
- `src/app/api/lead/route.ts:35` — svak e-post-validering (`includes("@")`), men ikke farlig (uautentisert)
- `src/app/api/coach/ai-chat/route.ts` — `body.messages` valideres kun for `Array.isArray`. **Ingen lengde-validering** — ondsinnet klient kan øke Anthropic-kostnader.

---

## 5. Performance

### Manglende `loading.tsx`

12 finnes. Mangler for:
- `/admin/bookings`, `/admin/reports`, `/admin/finance`, `/admin/analytics`, `/admin/talent`
- `/portal/coach/plans/[planId]`, `/portal/meg/bookinger`

### Bundle

`@react-pdf/renderer` er tung — verifiser at den importeres lazy i PDF-routes.
`googleapis` er stor, men kun i server-only fil — OK.

### Manglende revalidate

`src/app/api/coach/ai-chat/route.ts` oppdaterer `CoachingSession` uten `revalidatePath`. Chat-historikken refreshes ikke i server-views.

---

## 6. DX / prosess

**Mangler pre-commit hooks.** Ingen `.husky/`, ingen `lint-staged`. Typo og lint-feil kan commites.

**CI/CD:** `.github/workflows/ci.yml` solid (type-check + lint + build). Ingen Playwright-steg i CI.

**Test-dekning:** Null `.test.ts`/`.test.tsx`. Playwright installert, ingen tester skrevet. Credit-booking-logikken (atomisk transaksjon, race-håndtering) er helt utestet.

**Migrasjoner:** 32 versjonert. Inkonsistent navnekonvensjon (noen `YYYYMMDD_beskrivelse`, noen bare `YYYYMMDD`).

**.env.example:** Matcher CI. ✓

---

## 7. Konkrete commit-anbefalinger

### P0 — Kritisk, fikses nå

1. **`fix: replace in-memory rate-limit with Upstash Redis`**
   - In-memory buckets nullstilles ved cold start — gir ingen reell beskyttelse
   - Filer: `src/lib/rate-limit.ts`, `package.json`
   - Verifikasjon: `npx tsc --noEmit && npm run build`

2. **`fix: add missing loading.tsx for admin/bookings, finance, analytics, talent, reports`**
   - Blank skjerm under load
   - Filer: 5 nye `loading.tsx`
   - Verifikasjon: `npm run build`

3. **`fix: correct ubesvarteMeldinger count in getAdminHubData`**
   - KPI viser feil tall — teller alle direkte sesjoner, ikke uleste
   - Filer: `src/lib/admin-hub-data.ts:128-135`
   - Verifikasjon: manuell coach-login + sjekk innboks

4. **`fix: add message length validation in ai-chat route`**
   - Ondsinnet klient kan øke Anthropic-kostnader
   - Filer: `src/app/api/coach/ai-chat/route.ts`
   - Verifikasjon: `npx tsc --noEmit`

### P1 — Viktig, neste sprint

5. **`fix: add Husky pre-commit hooks with lint-staged`**
   - Filer: `.husky/pre-commit`, `package.json`

6. **`fix: add atomic guard for CoachingSession.messages append`**
   - Race condition ved concurrent coach-svar
   - Filer: `src/app/admin/messages/actions.ts`

7. **`refactor: remove unnecessary cast in admin/team/page.tsx`**
   - `teamRaw as unknown as TeamMember[]` — Prisma infererer allerede
   - Filer: `src/app/admin/team/page.tsx:37`

8. **`refactor: standardize auth guard to requirePortalUser`**
   - Filer: `src/lib/agents/actions.ts`, `src/app/admin/agents/actions.ts`

9. **`refactor: deduplicate bygSystemPrompt into shared util`**
   - To identiske implementasjoner
   - Filer: `src/lib/anthropic.ts`, `src/app/api/admin/coach-ai/route.ts`, ny `src/lib/ai-plan/system-prompt.ts`

10. **`fix: add zod validation for PlanTemplate.payload`**
    - JSON-blob castes uten runtime-validering
    - Filer: `src/app/admin/plans/new/actions.ts:244`

### P2 — Rydding

11. **`feat: add Resend integration to kontakt server action`**
    - Filer: `src/app/(marketing)/kontakt/actions.ts`

12. **`chore: normalize migration naming convention`**
    - Filer: 6-7 migrasjoner i `prisma/migrations/`

13. **`chore: add E2E smoke tests for credit-booking flow`**
    - Filer: `playwright/credit-booking.spec.ts`

14. **`fix: eliminate two-step DB roundtrip in getDashboardData`**
    - Filer: `src/lib/dashboard-data.ts:61-66`

---

## 8. Røde flagg som krever beslutning

### A. Helse-data lagres i `preferences`-JSON

`User.preferences` brukes til helse-data (`restingHr`, `sleep`) via `@ts-expect-error`. Mangler dedikert `HealthEntry`-modell. Ikke søkbart, ikke historiserbart. **Beslutning:** ny migrasjon med `HealthEntry`-tabell, eller godkjenning av permanent ad-hoc-løsning.

### B. CoachingSession.messages som JSON-blob

AI-chat og coach-direktemelding lagres i JSON-kolonne. Ingen indeks, ingen atomic append, ingen paginering. For høy trafikk vil raden vokse ubegrenset. **Beslutning:** fortsett (akseptabelt for lav volum) eller migrer til dedikert `Message`-tabell.

### C. Rate-limit er in-memory

Krever aktivt valg: Upstash Redis (kostnad + kompleksitet) eller aksept av at rate-limit ikke fungerer ved multi-instance. Fluid Compute løser delvis men ikke garantert.

### D. Ingen tester

Null testdekning på pengeflyt (credit-booking, Stripe webhook). Boris-metoden krever verifikasjonskommandoer før implementering. **Beslutning:** minstekrav til testdekning — forslag: kritiske pengepaths + auth-guards.

### E. Plassholder-sider i navigasjon

Leaderboard, trackman per-slag, talent-side har TODO-data synlig for brukere. **Beslutning:** skjul bak feature-flag eller fjern fra nav inntil data finnes.

---

## Foreslått ny CLAUDE.md-regel

Alle JSON-blobs som leses fra Prisma og castes med `as unknown as <Type>` SKAL valideres med zod ved read-tidspunkt. Caster uten runtime-validering er forbudt for data som påvirker forretningslogikk (betalinger, tilganger, agent-payload). Bruk `z.safeParse()` og kast tydelig feil ved invalid shape.

---

*Generert 2026-05-14 av Boris-style ultra-review-agent. Ingen kodefiler endret.*
