> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

> ⚠️ UTGÅTT (12.08.2026) — styrer ikke skjermbygging. Se docs/port/GYLDIGHET.md.

# Paper zip (2) ↔ kodebase — sync & gap 2026-08-09

**Kilde:** `AK Golf HQ — Claude Paper (2).zip` (Claude Design, sync `github.md` 2026-08-09T10:48Z)  
**Repo-speil:** `designsystem/paper/` (752 filer, erstattet 1:1)  
**Tokens:** `src/styles/paper-tokens.css` allerede speilet mot Paper **v3.1** (alle nøkkelverdier OK)  
**Logo:** `public/logos/paper/*` + `AkGolfLogo` peker på Paper-assets

---

## 1. Hva zip (2) la til vs forrige speil

| Område | Før (repo) | Etter zip (2) |
|---|---:|---:|
| Totalt filer | ~702 | **752** |
| Fase 1 fasit HTML | 33 | **33** (uendret sett) |
| Fase 2 fasit HTML | 11 (kun W1 playerhq) | **46** |
| W2–W6 wireframes | manglet | **inn** |
| `github.md` screen map | manglet | **inn** |
| `kart/w3…w6-*.md` | manglet | **inn** |

### Nye fase2-klynger
- **PlayerHQ W2/W3:** analyse-hull, runder, gameplan, datagolf, trackman, putte-lab, innstillinger, abonnement, helse, booking-ny/mine, coach-hub, talent, hjem-varsler/rest, historikk-filter, …
- **AgencyOS W4:** godkjenninger, gruppe-detalj, bookinger, planbibliotek, turneringer, oppsett
- **W5:** marketing-side/katalog, auth-flyt/samtykke, forelder-barn, system-tilstander
- **W6:** wang-coach-arsplan, wang-logg-inn, gfgk-kalender, gfgk-veileder-artikkel

---

## 2. Token-status

| Token | Paper v3.1 | App `--p-*` | Status |
|---|---|---|---|
| bg / surface / soft | #faf9f5 / #fff / #f0eee6 | samme | OK |
| fg / muted / cta | #141413 / #5e5d59 / #141413 | samme | OK |
| accent (clay) | #d97757 | `--p-accent` → `T.handling` | OK |
| rail | #141413 | `--p-rail` | OK |
| radius app | 12px | `--p-r` | OK |

**Ingen token-rebridge nødvendig** etter denne zippen.  
Regel uendret: **clay = «Én ting nå» monopol**, **ink CTA** for primærknapp, **neon lime aldri** som primær CTA.

---

## 3. Fasit-dekning vs app

| Måltall | Verdi |
|---|---:|
| App `page.tsx` | ~457 |
| Paper fasit HTML (fase1+fase2) | **79** |
| Designet med rute-mapping (github.md + fasit-liste) | ~64+ eksplisitt mappet |
| Gjenstår uten dedikert fasit (stats-spor, drift/AgenticOS, long-tail) | ~45 stats + ~14 drift + long-tail |

### Fidelity-status (ærlige nivåer)

| Nivå | Betydning | Eksempler |
|---|---|---|
| **A — struktur + PaperChrome** | Rute + V2-skall, tokens, clay/ink CTA | Meg, Booking hub, Cockpit, mange admin V2 |
| **B — delvis fasit** | Portet mot fase1 men ikke pixel-sign-off | Plan, Analyse, Kalender, Stall, Live, Workbench |
| **C — wireframe only** | Fase2 HTML finnes; kode har funksjon men ikke pixel-match | W2–W6 undersider (trackman, putte-lab, W4 maler, W5 marketing) |
| **D — mønster uten fasit** | Pattern-port (wave H/I) | ~55 admin rest, stats-marketing |

**Pixel-perfekt over hele appen: nei.**  
**Tokens + chrome + CTA-regler: ja (broen er på plass).**  
**Nye wireframes fra zip (2): i repo, men flertallet er C (må porteres skjerm-for-skjerm).**

---

## 4. Prioritert port-kø etter denne syncen

### P0 — høy brukertrafikk + ny fasit
1. `fase2/playerhq/playerhq-putte-lab.html` → `PutteLabV2`  
2. `fase2/playerhq/playerhq-trackman-liste.html` + `-detalj` → portal TrackMan  
3. `fase2/playerhq/playerhq-booking-ny.html` + `-mine` → BookingNy / mine bookinger  
4. `fase2/playerhq/playerhq-analyse-hull.html` → `AnalysereHullV2`  
5. `fase2/agencyos/agencyos-bookinger.html` + `agencyos-godkjenninger.html`  

### P1 — shell consistency
6. Workbench desktop/mobil/turnering (fase1) — route/path avklar  
7. W4 oppsett + planbibliotek + turneringer  
8. W3 innstillinger / abonnement / helse / talent / coach-hub  

### P2 — marketing/auth/forelder
9. W5 marketing-side (clay CTA, logo surface) — wave I startet  
10. Auth-flyt + samtykke pixel  
11. Forelder-barn mal  

### P3 — microsites (eget chrome)
12. WANG + GFGK (beholder egne tokens — ikke Paper-shell)

### Utenfor Paper-bølger
- Stats-spor (~45) — blokkert av egen produktbeslutning  
- AgenticOS/drift (~14)

---

## 5. Komponentdekning (utvalg)

| Design | Rute | Kode | Fidelity |
|---|---|---|---|
| playerhq-chat | `/portal` | chat/hjem V2 | B |
| playerhq-plan | `/portal/planlegge` | Plan V2 | B |
| playerhq-analyse | `/portal/analysere` | AnalysereV2 | B |
| playerhq-meg | `/portal/meg` | MegV2 + PaperChrome | B |
| playerhq-booking | `/portal/booking` | BookingHubV2 | B |
| agencyos-konsoll | `/admin/agencyos` | CockpitV2 | B |
| agencyos-kalender | `/admin/kalender` | AgencyKalenderV2 (+ coach colors) | B |
| agencyos-spillere | `/admin/spillere` | StallV2 | B |
| workbench-* | workbench-ruter | WorkbenchV2* | B/C |
| putte-lab | putte-lab rute | PutteLabV2 | C |
| trackman-* | `/portal/mal/trackman` | delvis | C |
| W4–W6 maler | se `github.md` | ruter finnes | C |

---

## 6. Hva som ble gjort i denne syncen (kode)

1. `designsystem/paper/` erstattet 1:1 med zip (2)  
2. Paper logo-SVG → `public/logos/paper/`  
3. `AkGolfLogo` peker på Paper-canonical assets  
4. Denne gap-rapporten + oppdatert checklist  

**Ikke gjort her:** full pixel-port av alle 79 fasiter (multi-dags arbeid).  
Tokens trengte ikke endring.

---

## 7. Neste konkrete steg

```
1. Commit + push denne syncen til main
2. Port P0 (putte-lab, trackman, booking-ny/mine, analyse-hull, W4 bookinger/kø)
3. Screenshot m390 + d1280 per skjerm → kryss i PAPER-ZIP-CHECKLIST.md
4. Stats-spor: egen beslutning før design
```

**Kilder i designsystem:**  
`designsystem/paper/github.md` · `kart/w3-…w6-*.md` · `tokens/akhq-tokens.css` · `fase1/` · `fase2/`
