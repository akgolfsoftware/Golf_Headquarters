# Launch-plan — AK Golf HQ

Komplett vei til produksjonslansering. Basert på launch-audit + Supabase-advisors (2026-05-30).
Marker `[x]` per steg når deployet/verifisert.

## Allerede KLART (verifisert i audit)
- Feilsider: `not-found.tsx` + `error.tsx` + `global-error.tsx` (rot + /portal + /admin)
- SEO: `sitemap.ts`, `robots.ts`, `manifest.ts`, full rot-metadata (OG/Twitter)
- Legal: `/personvern`, `/vilkar`, `/cookies` + cookie-banner + guardian-consent
- Betaling: Stripe-kode komplett (checkout, portal, webhook, retry, logging)
- Tester/CI: 15 unit + 5 Playwright-e2e + `.github/workflows/ci.yml`
- PWA: service worker, offline-side, manifest, ikoner
- **RLS: deny-all aktivt** — advisor «RLS enabled no policy» = sikker tilstand, ikke lekkasje

---

## Fase A — P0 launch-blokkere

- [ ] **A1. Fjern/gate demo-ruter** — 9 offentlige demo/preview-ruter (`/demo`, `/hull-demo`, `/kalender-demo`, `/kalender-maaned-demo`, `/lokasjoner-demo`, `/sesjon-opptak-demo`, `/talent-*-demo`, `/coach-preview`, `/portal-preview`, `/v2-preview`). Slett eller flytt bak `/intern`-gate. (30 min)
- [ ] **A2. Sentral env-validering** — `src/lib/env.ts` med zod-schema som fail-faster på manglende kritiske nøkler ved oppstart (Supabase, DATABASE_URL, Stripe). (1–2 t)
- [ ] **A3. Sikkerhets-quickwins** — skru på leaked-password-protection (Supabase Auth), flytt `pg_trgm` ut av public-schema. (15 min)
- [ ] **A4. (MANUELT — Anders)** DNS `akgolf.no` → Vercel · Stripe webhook → `https://akgolf.no/api/stripe/webhook` · verifiser prod env-vars i Vercel (Stripe-nøkler, Sentry DSN, Plausible-domene). (15 min)

## Fase B — Resterende skjermer
- [ ] **B5. #4 Scorecard per runde** — hull-for-hull (score · SG · skudd) fra `Round`/`Shot`. `/portal/tren/turneringer/[id]/runde/[nr]`. (M)
- [ ] **B6. #3-rest Intern leaderboard** — AK-spillere i en intern turnering (`TournamentResult`). `/portal/tren/turneringer/[id]`. (S)
- [ ] **B7. #8 Benchmark** — vs coach / region / Tour. `/portal/mal/sg-hub/benchmark`. (M)
- [ ] **B8. #5 Live turnerings-tracking** — under spill, portal + coach. (L)
- [ ] **B9. #7 Shot-map / dispersion** — top-down, ekte data. `/portal/statistikk/shot-map`. (M, lav prio)

## Fase C — Kode-gjeld / datakvalitet (P1)
- [ ] **C10. Stub-shield + sample-data** — skjul 5 kritiske ufullførte features i UI til de er ekte (MFA/`meg/sikkerhet`, `mal/leaderboard` placeholder-tall, blob-opplasting meldinger, AI-fallback workbench); fjern/feature-flag `workspace/sample-data.ts` fra admin; skjul BankID-knapp. (3–4 t)

---

## Anbefalt rekkefølge
1. **Fase A** (blokkere) — A1+A2+A3 er kode (jeg), A4 er manuelt (du).
2. **Fase B** (skjermer) — hovedarbeidet; B5→B6→B7→B8→B9.
3. **Fase C** (polish) — rett før go-live.

Estimat kode-arbeid: ~10–14 t. Manuelt (DNS/Stripe/toggles): ~30 min.
