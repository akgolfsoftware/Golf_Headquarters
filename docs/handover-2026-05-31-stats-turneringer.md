# Handover — Stats-rydding + Turnerings-pipeline (2026-05-31)

> **✅ KONSOLIDERT TIL ÉN SESSION (2026-05-31).** Anders har bestemt: turnerings-pipelinen +
> stats-seksjonen eies nå av ÉN session (denne). HEAD `960d680d` inneholder begge sessioners
> arbeid (stats-rydding + delsystem C live-leaderboard).
>
> **DEN ANDRE SESSIONEN SKAL STOPPE** å redigere: `src/proxy.ts`, `src/app/(marketing)/stats/*`,
> `src/app/(marketing)/turneringer/*`, `src/lib/turneringer/*`, `vercel.json`, og denne handoveren
> + `docs/fase-d-datafundament.md`. (Den kan fortsette på PlayerHQ-testing, som er uavhengig.)
>
> **NB for fremtidig meg:** ALDRI blind `git stash pop` — det poppet en gammel lint-staged-backup
> og lagde konflikt i 8 filer (gjenopprettet via `git checkout HEAD -- <fil>`).
>
> ## Konsolidert tilstand på turnerings-pipeline
> - **C (proff, LIVE):** ✅ GJORT av andre session — DataGolf `pga`+`opp` live-leaderboard,
>   `/turneringer/[slug]`, cron hver 10. min. (DataGolf live KUN pga/opp.)
> - **C (proff, HISTORISK):** ⬜ DataGolf Raw Data Archive dekker ~22 herre-tourer (event-list +
>   round-scoring/SG-endpoint) — IKKE bygget ennå. Utvider dekning fra live-3 til arkiv-22.
> - **Dame-tourer (LPGA/LET/LET Access):** ⬜ Anders vil ha alle. DataGolf dekker IKKE dame.
>   LPGA = betalt API (Sportradar/Data Sports Group). LET/LET Access = OCS-plattform
>   (`live-letas.ocs-software.com`, `ocs-let.com`), ingen offentlig API → scraping.
> - **A (norsk amatør):** ⬜ Olyo/Srixon/Garmin NC/Østlands/Global Junior — GolfBox/NGF-scraper
>   er STUB. Største byggejobb.
> - **B (WAGR):** ⬜ manuell import i dag (`admin/talent/wagr-import`).

---

## 1. Hva denne sessionen har gjort (alt deployet til akgolf.no)

### Nye skjermer bygget
- CoachHQ dashboard 3-kolonne + fokus-spiller-panel (`/admin/agencyos`, `coach-home.tsx`)
- Spillerliste: SG total + 6-mnd trend (`/admin/agencyos/spillere`)
- Hull-analyse PlayerHQ-rute (`/portal/analysere/hull`) + komponent `hole-analysis.tsx` (top-down, green-zoom)
- Hull-for-hull scorecard (`/portal/mal/runder/[id]`)
- SG benchmark vs Tour (`/portal/mal/sg-hub/benchmark`)
- Turnerings-statistikk (`/stats/turneringer/[slug]/statistikk`)

### Launch-prep
- **Fase A:** demo-ruter gated bak auth (`proxy.ts` DEMO_PREFIXES) + sentral env-validering (`src/lib/env.ts` + `src/instrumentation.ts`)
- **Fase C:** mock fjernet fra `shot-by-shot`, workspace-fallback, blob-stub, workbench-seed
- Migrasjons-historikk reconciled (`migrate resolve`), robots.ts utvidet

### Stats-datakvalitet (STOR jobb)
- Fjernet ALLE fabrikkerte spillere fra offentlige sider
- **`proxy.ts` redirecter prototype-stats-sider → /stats i prod** (se STATS_PROTOTYPE_PREFIXES)
- Re-aktivert alt med ekte data: `/stats/pga` (sg-total, spillere), `/stats/verktoy`, `/stats/sok`, `/stats/spillere`, `/stats/aargang` (hub)
- Fikset `/stats/aargang` 500 (JS event-handler i server-komponent → CSS hover)
- Fikset PGA sg-total tom (rounds-filter bug i `getPgaTopN` — minRounds:0)
- **QW2: scoreToPar backfilled i DB** (SQL) → turnerings-leaderboards viser nå ekte score

### Docs opprettet (les disse!)
- `docs/skjermplan.md` — gjenstående skjermer
- `docs/launch-plan.md` — komplett launch-plan (Fase A–E)
- `docs/go-live-sjekkliste.md` + `scripts/smoke-test.sh` — go-live + smoke-test
- `docs/datakvalitet-funn.md` — full stats-datakvalitet-audit
- `docs/fase-d-datafundament.md` — datafundament-skisse

---

## 2. AKTIV / PÅGÅENDE jobb (PAUSET — venter på Anders)

**Brainstorm: fullautomatisk turnerings-fetch-pipeline.** Anders vil ha automatisk henting
av: Olyo Tour, Srixon Tour, Garmin Norges Cup, Regions/Østlands Tour, Global Junior Golf,
alle WAGR-turneringer, alle proff-tourer i verden. Ingen manuelt arbeid fra ham.

**Status:** I brainstorming-skill. Foreslått dekomponering i 3 delsystemer:
- **A. Norsk amatør-scraper** (Olyo/Srixon/Garmin NC/Østlands/Global Junior) — GolfBox/NGF-scraping
- **B. WAGR-automatikk** — manuell i dag (`admin/talent/wagr-import`)
- **C. Verdens proff-tourer** — DataGolf (delvis: pga/euro/kft), trenger research på hull

**Venter på:** Anders' svar på om vi dekomponerer + starter med A.

### Tekniske funn for den som fortsetter
- `src/lib/scrapers/ngf.ts` = **STUB** (35 linjer, ikke implementert). `syncNgfSchedule` i
  `src/lib/turneringer/sync.ts` = også STUB.
- DataGolf-sync VIRKER: `syncDataGolfSchedules/syncNorwegianPlayers/syncLiveLeaderboards`
- Cron-dispatcher: `src/app/api/cron/[agent]/route.ts` (CRON_SECRET-beskyttet, Vercel Cron)
- De 1167 NGF-turneringene ble importert engangs/manuelt (ikke via automatikk)
- `publicPlayer` mangler klubb/region-felt → blokkerer `/stats/regions` + `/stats/klubber`
- `klubb-til-region.ts` mapping finnes
- Kilde-fordeling: NGF 1167, NCAA 439, DataGolf 119 turneringer
- GolfBox/NGF offentlige sider = gratis HTTP-scraping (ingen betalt API)

---

## 3. Gjenstående i /stats (fra `docs/datakvalitet-funn.md`)
**Kan bygges nå (data finnes, kode-rebuild):** `/stats/leaderboards` (SG-only), `/stats/aargang/[aar]`, `/stats/tour/[slug]` (PGA/EURO/KFT).
**Trenger datakilde:** `/stats/regions`, `/stats/klubber` (klubb-data → delsystem A), 6 PGA rå-stats-sider (DataGolf raw).

---

## 4. Åpne beslutninger for Anders
1. Dekomponere turnerings-pipeline i A/B/C og starte med A? (brainstorm pauset her)
2. Har DataGolf-abonnementet raw-stats (yds/%/score)? → avgjør PGA rå-stats-sidene
3. WAGR/NGF-datatilgang for norsk ranking?

---

## 5. Koordinering med den andre sessionen
- Den andre jobber med **PlayerHQ testplan** (commit `5d6eca18`).
- **Unngå samtidige endringer i:** `src/proxy.ts` (jeg har aktive redirects der), `docs/`-filer.
- Trygt: jeg eier stats-seksjonen + turnerings-pipeline. Den andre eier PlayerHQ-testing.
- Alltid `git pull --rebase` før push hvis begge er aktive.

**Git:** branch `main`, working tree clean, HEAD `5d6eca18`.
