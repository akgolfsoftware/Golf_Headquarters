# Fase D — Datafundament (skisse)

Hva som konkret trengs for å wire de siste skjulte stats-sidene. Basert på faktisk
schema + eksisterende integrasjoner (2026-05-31).

## Utgangspunkt (verifiserte fakta)
- `publicPlayer` (2637 norske): name, country, birthYear, tier, isActive. **Ingen
  klubb/region/WAGR/score-felt.**
- `pgaPlayerSeason` (1299 Tour): ekte SG + DataGolf skill-ratings (relative), men
  `driveDist/fairwayPct` = relative, `avgScore/girPct/puttsPerRound` = null, `rounds` = null.
- `publicPlayerEntry`: finnes, men `scoreToPar` = null. `rounds`-JSON har per-runde par.
- Finnes alt: `pga-sync.ts` (DataGolf skill-ratings), `klubb-til-region.ts` (mapping),
  cron-infra (`/api/cron/[agent]`).

---

## ⚡ Quick wins
- [x] **QW2 — scoreToPar-backfill (GJORT 2026-05-31):** fylte `publicPlayerEntry.scoreToPar`
  fra `rounds`-JSON via SQL (regex-guard, kun entries der alle runder har gyldig par).
  Resultat: turneringer har nå ekte score-to-par (f.eks. 148/137 per turnering) → de
  eksisterende `/stats/turneringer/[slug]`-leaderboardene viser ekte score etter ISR-revalidering.

### Reassessert — IKKE quick wins (dype prototyper, krever full side-rebuild)
- [ ] **QW1 — leaderboards:** 799-linjers prototype med ~12 hardkodede fake-boards (norske
  snitt/forbedring/WAGR/klubber + PGA-fallbacks à la «R. McIlroy 327.4 yds»). Re-bygg til
  SG-only + ekte norske aggregeringer (nå mulig via QW2-backfill). (M, ikke quick)
- [ ] **QW3 — aargang/[aar]:** hardkodet roster (16 navn). Re-bygg: ekte spillere per
  `publicPlayer.birthYear` + score fra QW2-backfill. (M)
- [ ] **QW4 — tour/[slug]:** hardkodet roster (11 navn). PGA/EURO/KFT wirebar fra
  `pgaPlayerSeason.tour`, norske tourer venter på D2/D3. (M)

---

## C — Verdens proff-tourer: LIVE leaderboard (GJORT 2026-05-31)
**Status: deployet.** Delsystem C (live-resultater for proff-tourer) er bygget for det
DataGolf faktisk tilbyr. Inngår i turnerings-pipeline-brainstormen (A norsk amatør / B WAGR /
C proff).

**Hardt funn (research på hull ferdig):** DataGolf `/preds/live-tournament-stats` svarer
`400: "live stats only available for pga and opp tours"`. Live leaderboard er altså KUN
mulig for **PGA Tour + opposite-field ("opp")**. DP World (euro), Korn Ferry (kft), Challenge
og øvrige har vi **schedule (kalender + offisiell link)**, men IKKE live scoring via DataGolf.
Vil vi ha live på disse → ny datakilde (SportRadar / RapidAPI golf), egen kostnad + integrasjon.

**Hva som ble bygget (commit etter 5d6eca18):**
- `syncLiveLeaderboards` (`src/lib/turneringer/sync.ts`): lagrer nå HELE feltet (alle spillere),
  ikke kun nordmenn. Auto-oppretter ukjente `PublicPlayer` fra live-feeden med land
  (`iso3to2` i `src/lib/datagolf/country.ts`) + tier. `LIVE_TOURS = ["pga","opp"]`.
  Feiltolerant per tour (400 → hopp videre). Rundenummer fra topp-nivå `stat_round`
  (per-spiller `round`-felt er IKKE rundenummer — inneholder stat-verdier).
- Detaljside `/turneringer/[slug]`: viser hele feltet (var topp 20), Thru-kolonne, ekte
  KPI-er (Leder/Runde) i stedet for placeholder. Auto-refresh 120s når live. Rounds-JSON
  zod-validert ved read.
- Cron `turneringer-live`: hver 10. min (var hver 2. time tors–søn) i `vercel.json`.
- Verifisert mot live Charles Schwab Challenge: 132 spillere lagret + rendret.

**Gjenstår på C (hvis ønsket):** rå-stats per hull/skudd (shot tracking) = krever lisensiert
kilde (ShotLink/SportRadar), dyrt — ikke anbefalt. Live for euro/kft/challenge = ny kilde.

## D1 — DataGolf rå-stats i ekte enheter
**Mål:** drive (yds), fairway %, GIR %, putts/runde, scoring avg.
**Kilde:** DataGolf "raw stats"-endpoint (skill-ratings gir kun relative). Sjekk om abonnementet
har raw-stats; ev. PGA Tour offisielle stats.
**Modell:** kolonnene finnes alt i `pgaPlayerSeason` — fyll med ekte verdier + backfill `rounds`.
**Sync:** utvid `pga-sync.ts` + cron.
**Låser opp:** 6 PGA rå-stats-sider + leaderboards (5 boards).
**Innsats:** M. **Beslutning:** har DataGolf-abonnementet raw-stats? Hvis nei → behold SG-only permanent.

## D2 — Klubb/region-tilhørighet for norske spillere
**Mål:** koble norske spillere → klubb → region.
**Funn:** `publicPlayer` har INGEN klubb/region. `klubb-til-region.ts` finnes (klubb→region).
**Kilde:** NGF / GolfBox medlemskap (`ak-golfbox`-skill finnes, men ingen kode-integrasjon ennå).
**Modell:** ny `Club`-modell + `PublicPlayer.clubId` (+ region via mapping). Aggreger spiller-counts.
**Sync:** GolfBox-import-jobb (cron).
**Låser opp:** `regions` (+[slug]), `klubber` (+[slug]).
**Innsats:** L. **Beslutning:** prioritere GolfBox-integrasjon? Datavask kreves.

## D3 — Norske resultater / scoring / ranking
**Mål:** ekte score + ranking for norske spillere og turneringer.
**Funn:** `publicPlayerEntry` finnes (scoreToPar=null, rounds-JSON har par); WagrSnapshot finnes.
**Kilde:** QW2-backfill (raskt) + WAGR-import for ranking + ev. NGF/GolfBox-scoring.
**Modell:** backfill scoreToPar; koble WagrSnapshot → spiller-ranking.
**Låser opp:** aargang/[aar]-ranking, NO-leaderboards, tour-standings, dypere turnerings-statistikk.
**Innsats:** S (backfill) + M (WAGR/NGF-ranking).

---

## Anbefalt rekkefølge
1. **Quick wins (QW1–QW4)** — re-aktiverer leaderboards (SG), aargang/[aar], tour (internasjonal). Dager, ingen ny datakilde.
2. **QW2 + D3-backfill** — scoreToPar fra rounds-JSON → låser opp turnerings-dybde.
3. **D1** — kun hvis DataGolf-abonnementet har raw-stats; ellers behold SG-only.
4. **D2 (GolfBox)** — størst jobb, men eneste vei til ekte regions/klubber.

## Beslutninger Anders må ta
- Har DataGolf-abonnementet **raw-stats** (yds/%/score)? (avgjør D1)
- Skal vi bygge **GolfBox-integrasjon** for klubb/medlemsdata? (avgjør D2)
- Har vi **WAGR/NGF-data** for norsk ranking? (avgjør D3-dybde)

**Estimat:** Quick wins ~2–4 dager kode. D1 ~M (datatilgang-avhengig). D2 ~L (integrasjon).
D3 ~S+M. Ingen av disse blokkerer launch — de utvider stats-seksjonen post-launch.
