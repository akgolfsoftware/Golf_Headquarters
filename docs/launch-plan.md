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

- [x] **A1. Gate demo-ruter** — 13 demo/preview-ruter gated bak auth i `proxy.ts` (`DEMO_PREFIXES`). Ingen produksjonskode lenker til dem. — 2026-05-30
- [x] **A2. Sentral env-validering** — `src/lib/env.ts` (zod, kritisk = throw, anbefalt = warn) kjørt via `src/instrumentation.ts` ved server-start. — 2026-05-30
- [ ] **A3. (MANUELT — Anders)** Supabase Dashboard → Auth → skru på "Leaked password protection" (HaveIBeenPwned). `pg_trgm`-flytting er valgfri (ingen indekser bruker den — trygt, men kun WARN).
- [ ] **A4. (MANUELT — Anders)** DNS `akgolf.no` → Vercel · Stripe webhook → `https://akgolf.no/api/stripe/webhook` · verifiser prod env-vars i Vercel (Stripe-nøkler, Sentry DSN, Plausible-domene).

## Fase B — Resterende skjermer
- [x] **B5. #4 Scorecard per runde** — re-scopet: `Round` har ingen `tournamentId`, og `/portal/mal/runder/[id]` viste alt ekte per-hull-data (KPI + wizard) men manglet scorecard-grid. La til `RoundScorecard` (hull-for-hull, UT/INN, score-til-par) på ekte data. — 2026-05-30
  - NB (Fase C): `/portal/mal/runder/[id]/shot-by-shot` bruker hardkodet mock (`FRONT_SCORES`) — må kobles til ekte data eller skjules.
- [⊘] **B6. #3-rest Intern leaderboard** — UTSATT: `tournament_results` har 0 rader. Empty-state finnes alt i `/portal/tren/turneringer/[id]`. Bygges når data finnes.
- [ ] **B7. #8 Benchmark** — vs Tour (PGA-data + BrukerSgInput finnes). vs coach/region = senere. `/portal/mal/sg-hub/benchmark`. (M) — delvis mulig
- [⊘] **B8. #5 Live turnerings-tracking** — UTSATT: ingen live score-feed i datamodellen. Krever ekstern integrasjon først.
- [⊘] **B9. #7 Shot-map / dispersion** — UTSATT: `Shot` mangler x/y-koordinater (kun lie + avstander). Ekte dispersion-kart krever koordinat-data først.

## Fase C — Kode-gjeld / datakvalitet (P1)
- [ ] **C10. Stub-shield + sample-data** — skjul 5 kritiske ufullførte features i UI til de er ekte (MFA/`meg/sikkerhet`, `mal/leaderboard` placeholder-tall, blob-opplasting meldinger, AI-fallback workbench); fjern/feature-flag `workspace/sample-data.ts` fra admin; skjul BankID-knapp. (3–4 t)

---

## Anbefalt rekkefølge
1. **Fase A** (blokkere) — A1+A2+A3 er kode (jeg), A4 er manuelt (du).
2. **Fase B** (skjermer) — hovedarbeidet; B5→B6→B7→B8→B9.
3. **Fase C** (polish) — rett før go-live.

Estimat kode-arbeid: ~10–14 t. Manuelt (DNS/Stripe/toggles): ~30 min.
