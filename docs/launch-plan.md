# Launch-plan — AK Golf HQ (komplett, alle faser)

Single source for veien til full produksjonslansering. Basert på skjerm-audit +
launch-audit + Supabase-advisors + datasjekk (2026-05-30).

**Statuslegende:** `[x]` ferdig · `[ ]` gjenstår · `[⊘]` utsatt (mangler data) · `[~]` delvis · `(M)` meg/kode · `(A)` Anders/manuelt

---

## Fase 0 — Fullført denne økten (referanse)
- [x] CoachHQ dashboard 3-kolonne + fokus-spiller-panel (ekte SG + pyramide) — `/admin/agencyos`
- [x] Hull-analyse ekte PlayerHQ-rute (ekte SG + trening per sone) — `/portal/analysere/hull`
- [x] Turnerings-statistikk (median, histogram, norske vs felt) — `/stats/turneringer/[slug]/statistikk`
- [x] Spillerliste: SG total + 6-mnd trend-sparkline — `/admin/agencyos/spillere`
- [x] Hull-for-hull scorecard på runde-detalj (ekte Round/Shot) — `/portal/mal/runder/[id]`

## Allerede klart (verifisert i audit — ingen jobb)
Feilsider (404/500) · SEO (sitemap/robots/manifest/OG) · personvern/vilkår/cookies + banner + samtykke ·
Stripe-kode komplett · 15 unit + 5 e2e + CI · PWA/offline · **RLS deny-all aktivt** (advisor-INFO = sikker).

---

## Fase A — P0 launch-blokkere
- [x] **A1** Gate 13 demo/preview-ruter bak auth (`proxy.ts` DEMO_PREFIXES) (M)
- [x] **A2** Sentral env-validering (`src/lib/env.ts` + `instrumentation.ts`, fail-fast) (M)
- [ ] **A3** (A) Supabase → Auth → skru på "Leaked password protection". `pg_trgm`-flytting valgfri (ingen indekser bruker den).
- [ ] **A4** (A) DNS `akgolf.no` → Vercel · Stripe webhook → `https://akgolf.no/api/stripe/webhook` · verifiser prod env-vars (Stripe, Sentry DSN, Plausible-domene).

## Fase B — Resterende skjermer
- [x] **B5** Hull-for-hull scorecard (ekte data) — `/portal/mal/runder/[id]` (M)
- [ ] **B7** Benchmark vs Tour — PGA-data + BrukerSgInput finnes. vs coach/region senere. `/portal/mal/sg-hub/benchmark` (M, ~M)
- [⊘] **B6** Intern turnerings-leaderboard — `tournament_results` = 0 rader → krever data (se D1)
- [⊘] **B8** Live turnerings-tracking — ingen live score-feed → krever integrasjon (se D2)
- [⊘] **B9** Shot-map / dispersion — `Shot` mangler x/y-koordinater → krever koordinatdata (se D3)

## Fase C — Kode-gjeld / datakvalitet (P1)
- [x] **C1** `/portal/mal/runder/[id]/shot-by-shot` koblet til ekte Round/Shot (per-hull par/score/FIR/GIR/putter, KPI, trend-charts, notat). Mock fjernet (−126 linjer). — 2026-05-30
- [x] **C2** Workspace-task-fallback returnerer `[]` i prod (ingen falske oppgaver uten Notion-kobling); sample beholdt for dev. NB: `workspace/prosjekter` + task-`[id]` er fortsatt mock (internt verktøy, ingen datamodell — trenger flag/modell senere). — 2026-05-30
- [x] **C3** N/A — ingen BankID-knapp i UI lenker til stubben (intet å skjule). — 2026-05-30
- [x] **C4** Workbench seedet mock-økter inn i ekte plan → fjernet (tom = empty-state). Blob-opplasting returnerte falskt vedlegg → kaster nå tydelig feil. `meg/sikkerhet` (kommer-snart), `mal/leaderboard` (feature-flag av), AI Caddie (ærlig toast) var alt ærlige. — 2026-05-30
- [~] **C5** Kritiske mock/fake-data TODO-er lukket (C1-C4). Resterende ~85 TODO er ikke-blokkerende (interne notater, future-features) — dokumentert, ryddes løpende.

## Fase D — Datafundament (låser opp B6/B8/B9 — krever beslutning)
- [ ] **D1** Turnerings-resultater for AK-spillere: kilde? (manuell innlegging i `/admin/tournaments`, NGF/GolfBox-import, eller score fra `Round`). Låser opp **B6**. (A+M)
- [ ] **D2** Live score-feed: kilde + polling/webhook (NGF live, eller manuell coach-innlegging under spill). Låser opp **B8**. (A+M)
- [ ] **D3** Skudd-koordinater: utvid `Shot` med x/y (eller lat/lng) + fangst i slag-wizard/UpGame-import. Låser opp **B9** (ekte dispersion). (M)

## Fase E — Go-live (rekkefølge, mest manuelt)
- [ ] **E1** (A) Verifiser alle prod env-vars satt i Vercel (kjør deploy → env-validering feiler hvis noe mangler)
- [ ] **E2** (A) DNS-cutover akgolf.no → Vercel + verifiser SSL
- [ ] **E3** (A) Stripe: webhook-endpoint + live-nøkler + test ett ekte kjøp
- [ ] **E4** (M) Smoke-test: signup → onboarding → booking → betaling → portal → admin
- [ ] **E5** (A) Skru på git auto-deploy til production (nå av — vi bruker `vercel --prod`)
- [ ] **E6** (M) Verifiser Sentry fanger feil + Plausible logger besøk
- [ ] **E7** Go-live + overvåk første 24t

---

## Anbefalt rekkefølge
1. **Fase C** (kode-gjeld) — størst reell launch-verdi nå, alt data-backed. C1 først (fjerner mock fra produksjon).
2. **B7** Benchmark vs Tour — siste data-backed skjerm.
3. **Fase A3/A4 + Fase E** (manuelt, Anders) — DNS/Stripe/env/toggles + smoke-test.
4. **Fase D** (datafundament) — når du bestemmer kilder; låser opp B6/B8/B9 post-launch.

## Eierskap
- **Meg (kode):** Fase C, B7, D3, smoke-test-script.
- **Anders (manuelt):** A3, A4, hele Fase E (DNS, Stripe, env, dashboard-toggles), D1/D2-kildevalg.

**Estimat kode igjen:** ~6–9 t (Fase C + B7). **Manuelt:** ~1–2 t (Fase E). **Datafundament (D):** avhenger av kildevalg.
