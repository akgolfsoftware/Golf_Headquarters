# Skjermplan — resterende skjermer

Status-sporing for gjenstående skjermer i AK Golf HQ. Basert på skjerm-audit (2026-05-30).
Innsats: S/M/L. Merk hvert steg som `[x]` når deployet.

## Fase 1 — Fullføre påbegynt
- [x] **1. CoachHQ Dashboard steg 2** — `/admin/agencyos` — 3-kolonne (Fokus-spiller · Timeline · Innboks) + Fokus-spiller-panel m/ pyramide. Ekte data: SG-områder (BrukerSgInput), pyramide (TrainingPlanSession via aggregateByArea). — 2026-05-30
- [x] **2. Hull-analyse → ekte PlayerHQ-rute** — `/portal/analysere/hull` — illustrativt kart + ekte tall. Sonene (Tee/Innspill/Nærspill/Putt) mates med spillerens SG (BrukerSgInput) + trening per skillArea (TrainingPlanSession). Komponent parametrisert; demoer uendret. — 2026-05-30

## Fase 2 — Turneringsresultater
- [ ] **3. Turnerings-resultatliste / leaderboard** — `/stats/turneringer/[slug]/resultater` — full ranking + score. Gjenbruk: `data-table`, `status-pill`, `sparkline`. (M)
- [ ] **4. Turnerings-scorecard per runde** — `/portal/tren/turneringer/[id]/runde/[nr]` (+ admin) — hull-for-hull. Gjenbruk: `round-scorecard.tsx`. (M)
- [ ] **5. Live turnerings-tracking** — `/portal/tren/turneringer/[id]/live` (+ coach-view). Gjenbruk: `pulse-dot`, `kpi`, leaderboard fra #3. (L)
- [ ] **6. Turnerings-statistikk** — `/stats/turneringer/[slug]/statistikk` — score vs historisk/median. Gjenbruk: `stats-trend-graf`, `stats-histogram`. (S)

## Fase 3 — Data golf-finpuss
- [ ] **7. Shot-map / dispersion-side** — `/portal/statistikk/shot-map` — top-down, ekte data. Gjenbruk: `shot-map.tsx`. (M) — lav prioritet
- [ ] **8. Benchmark-skjerm** — `/portal/mal/sg-hub/benchmark` — vs coach / region / Tour. Gjenbruk: `stats-big-radar`, `sg-bar`. (M)

## Allerede ferdig (referanse)
- [x] Spillerliste: SG total + 6-mnd trend-sparkline (`/admin/agencyos/spillere`) — 2026-05-30
- [x] Hull-analyse top-down + green-zoom (demo: `/hull-demo`, `/intern/komponenter/hull-analyse`) — 2026-05-30
