# Skjermplan — resterende skjermer

Status-sporing for gjenstående skjermer i AK Golf HQ. Basert på skjerm-audit (2026-05-30).
Innsats: S/M/L. Merk hvert steg som `[x]` når deployet.

## Fase 1 — Fullføre påbegynt
- [x] **1. CoachHQ Dashboard steg 2** — `/admin/agencyos` — 3-kolonne (Fokus-spiller · Timeline · Innboks) + Fokus-spiller-panel m/ pyramide. Ekte data: SG-områder (BrukerSgInput), pyramide (TrainingPlanSession via aggregateByArea). — 2026-05-30
- [x] **2. Hull-analyse → ekte PlayerHQ-rute** — `/portal/analysere/hull` — illustrativt kart + ekte tall. Sonene (Tee/Innspill/Nærspill/Putt) mates med spillerens SG (BrukerSgInput) + trening per skillArea (TrainingPlanSession). Komponent parametrisert; demoer uendret. — 2026-05-30

## Fase 2 — Turneringsresultater
- [~] **3. Turnerings-resultatliste / leaderboard** — FINNES ALLEREDE for offentlige turneringer i `/stats/turneringer/[slug]` (full leaderboard, posisjon, score-to-par, norske, maks 50). Gjenstår ev.: intern-spiller-leaderboard for `/portal/tren/turneringer/[id]`. Re-scopes.
- [ ] **4. Turnerings-scorecard per runde** — `/portal/tren/turneringer/[id]/runde/[nr]` (+ admin) — hull-for-hull. Gjenbruk: `round-scorecard.tsx`. (M)
- [ ] **5. Live turnerings-tracking** — `/portal/tren/turneringer/[id]/live` (+ coach-view). Gjenbruk: `pulse-dot`, `kpi`, leaderboard fra #3. (L)
- [x] **6. Turnerings-statistikk** — `/stats/turneringer/[slug]/statistikk` — scorefordeling, median, beste, kutt, score-til-par-histogram, norske vs feltet. Ekte data fra PublicPlayerEntry. Lenket fra slug-siden. — 2026-05-30

## Fase 3 — Data golf-finpuss
- [ ] **7. Shot-map / dispersion-side** — `/portal/statistikk/shot-map` — top-down, ekte data. Gjenbruk: `shot-map.tsx`. (M) — lav prioritet
- [x] **8. Benchmark-skjerm** — `/portal/mal/sg-hub/benchmark` — vs PGA Tour, ekte data (aggregateSg + SgBar). Tour-benchmark live. (coach/region-sammenligning = post-launch) — 2026-06-03

## DATA-BLOKKERT — UI-klar, men datamodell mangler (avdekket 2026-06-03)
Disse kan ikke bygges med ekte data uten datafundament først. «Ærlig data»-prinsippet
forbyr falske tall. Krever migrasjon + innsamlingsflyt, ikke bare skjerm-bygging.
- [ ] **4. Scorecard per runde (hull-for-hull)** — mangler `HoleScore`-modell. `Round` har kun totalscore.
- [ ] **5. Live turnerings-tracking** — mangler hele live-scoring-dataflyten.
- [ ] **7. Shot-map / dispersion** — `Shot` mangler x/y-koordinater for spredningsplott.

## Allerede ferdig (referanse)
- [x] Spillerliste: SG total + 6-mnd trend-sparkline (`/admin/agencyos/spillere`) — 2026-05-30
- [x] Hull-analyse top-down + green-zoom (demo: `/hull-demo`, `/intern/komponenter/hull-analyse`) — 2026-05-30
