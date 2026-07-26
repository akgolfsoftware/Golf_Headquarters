# Plan · Ferdigstill design

**Dato:** 2026-07-26
**Fasit:** Open Design «Designsystem-plan komplett»
**Bygger på:** `docs/design-system/plan-resterende-port.md` (PR #149) — denne planen viderefører
den med et verifisert nullpunkt og korrigerte bølger 11–17.
**Tidsramme:** frem til **1. september 2026** (betalingsstart flyttet fra 1. august).

---

## 1. Definisjon av ferdig

Design er ferdigstilt når alle seks er sanne — hver av dem er målbar, ikke en skjønnsvurdering:

| # | Kriterium | Måles med |
|---|---|---|
| 1 | Ingen produksjonskode importerer det gamle biblioteket | `grep -rlE "^\s*import .*\"@/components/athletic" src` = **0** |
| 2 | Det gamle biblioteket er slettet | `src/components/athletic/` finnes ikke |
| 3 | `/design-system` viser alle showroom-familier i lys **og** mørk | Manuell lab-gjennomgang + reg-test |
| 4 | Rå hex i produksjonskode er kun bevisst dataviz-palett | `scripts/check-no-hex.mjs` grønn mot ny baseline |
| 5 | «CoachHQ» finnes ikke i UI-tekst | `grep -rn "CoachHQ" src` = kun kommentarer/mappenavn |
| 6 | Regresjon fanges automatisk | Visuell reg-test + a11y-smoke grønn i CI |

---

## 2. Verifisert nullpunkt (26. juli, målt mot koden)

| Måling | Verdi |
|---|---|
| Filer som bruker `@/components/v2` | **691** |
| Filer som **importerer** `athletic/golfdata` | **32** |
| Gammelt bibliotek | 53 filer / **6 264 linjer** |
| v2-komponenter tilgjengelig | **200+** (`src/components/v2/`, 27 filer) |
| Filer med rå hex | **53** (363 forekomster i `.tsx`) |
| «CoachHQ» i `src` | 10 treff — **0 i synlig UI** (kommentarer + `admin/(legacy)/`-mappenavn) |
| a11y-smoke | 12 ruter — **kun offentlige**, null innloggede flater |
| Visuell regresjonstest | **finnes ikke** |

### Korreksjoner til `plan-resterende-port.md`

Tre påstander i den planen holder ikke mot koden — bølge 12 må reskopes:

1. **«PlayerHQ SG-hub full v2-port (bytter athletic → v2)»** — `src/components/sg-hub/` (13 filer) har
   allerede **null** athletic-importer. Det er `src/components/portal/sg-hub/sg-hub.tsx` som er legacy.
2. **«Admin kalender uke → Notion-grid chrome + v2 tokens»** — `src/app/admin/kalender/` bruker
   allerede v2 i 9 av 9 importer. Ingen port gjenstår.
3. **«TrackMan detalj»** — `src/app/portal/mal/trackman/` bruker allerede v2 (4 av 5 importer).

Konklusjon: bølge 12 er **ikke** «dype produktflater» — det er en **avgrenset legacy-avvikling av 32
navngitte filer**. Det er billigere og mer konkret enn planen antar.

### Kartlegging: legacy → v2 finnes allerede

De fleste legacy-komponentene har v2-ekvivalent under norsk navn. Avviklingen er derfor i hovedsak
mekanisk omskriving, ikke nybygg:

| Legacy | v2-ekvivalent | Legacy | v2-ekvivalent |
|---|---|---|---|
| `Eyebrow` | `Caps` | `KpiTile` | `KpiFlis` |
| `Sparkline` | `MiniSpark` | `Heatmap` | `VarmeKart` |
| `Avatar` | `AvatarInit` / `AvatarFoto` | `RingGauge` | `RingMaaler` / `Ring` |
| `Card` / `Button` / `Tag` | `Kort` / `Knapp`+`CTAPill` / `Tag` | `Pyramid` | `Pyramide` |
| `PageHeader` | `Tittel` / `Skjerm` | `SetRow` | `SettRepsLogger` |

**To ekte gap** — må bygges i v2 før avviklingen kan fullføres:

- **`StatusDot`** (3 bruk: `team-kit`, `player-detail-panel`, `statistikk`). v2 `Prikker` er et
  prikk-rutenett, ikke en statusprikk. `AgStatusDot` finnes lokalt i `admin/agencyos/ui.tsx` og kan
  løftes til v2. *Dette er det gamle gap #1 fra opprydding-registeret, aldri fylt.*
- **`YearPlanGantt`** (`athletic/calendars/`, brukt av `gruppe-kalender-wrapper`). v2 `Periodeplan`
  er L-fase-låst og dekker ikke AK-periode-årsgantt.

---

## 3. Bølgene

### B11 · Gap-komponenter inn i v2 — *forutsetning for alt annet*
Bygg `StatusDot` og `AarsGantt` i v2 (fra `AgStatusDot` og `athletic/calendars/year-plan-gantt.tsx`).
Legg begge i lab. Eksporter i `src/components/v2/index.ts`.
**DoD:** begge synlig i `/design-system` lys+mørk · barrel oppdatert · `npm run verify` grønn.

### B12 · Feedback + structure parity i lab
Showroom-familiene `familie-feedback.html` + `familie-structure.html`: AiTipCard, hjelp-boble,
stepper, filter-pills, skeleton. Komponentene finnes (`hjelp.tsx`, `core.tsx`) — mangler lab-dekning
og barrel-eksport.
**DoD:** lab-seksjon «Feedback · struktur» · alle eksportert fra barrel.

### B13 · Legacy-avvikling — 32 filer, tre puljer
Én PR per pulje. Layout/chrome-bytte, **ingen forretningslogikk endres**.

**B13a · AgencyOS (10 filer)**
`admin/team/team-kit` · `admin/admin-hero` · `admin/compliance/compliance` ·
`admin/cockpit/agency-cockpit` · `admin/spiller-detalj/spiller-detalj-oversikt` ·
`admin/innboks/inbox-thread-list` · `admin/innboks/inbox-context` ·
`admin/coach-workbench/coach-workbench` · `admin/player/player-detail-panel` ·
`admin/agencyos/daily-brief`

**B13b · PlayerHQ (10 filer)**
`portal/meg/meg-sub` · `portal/profile/ProfileForm` · `portal/profile/ProfileHeader` ·
`portal/player-hero` · `portal/statistikk/statistikk-hybrid` · `portal/statistikk/statistikk` ·
`portal/sg-hub/sg-hub` · `portal/aarsplan/aarsplan` · `portal/tester/tester-list` ·
`portal/dashboard/WeekProgress`

**B13c · Delte + resten (12 filer)**
`shared/overview-shell` · `shared/overview-card` · `ui/kpi-card` · `auth/reauth-modal` ·
`hole-analysis/hole-analysis` · `gruppe-kalender/gruppe-kalender-wrapper` · `kommando/task-list` ·
`(marketing)/(mlegacy)/error` · `(marketing)/(mlegacy)/not-found` · `forelder/not-found` ·
`meg/page` · `lib/gruppe-kalender/bygg-visninger`

**DoD per pulje:** 0 athletic-importer igjen i pulja · skjermen visuelt verifisert i lys+mørk på
375px og desktop · `npm run verify` grønn · MASTER-SKJERMPLAN-rader oppdatert i samme commit.

### B14 · Slett det gamle biblioteket
Når B13 gir 0 importører: slett `src/components/athletic/` (53 filer / 6 264 linjer) og rydd
tilhørende regler i `globals.css`. Dette er «Fase 5» fra oppryddingsplanen som aldri ble kjørt.
**DoD:** mappen borte · build grønn · ingen død CSS igjen.

### B15 · Farge- og token-disiplin
53 filer har rå hex etter at hex-gaten ble fjernet 25. juli. Del i tre:
- **Interne demoer** (`app/(internal)/demos/*` — 146 forekomster): utenfor produksjon. Vurder sletting.
- **Produksjonsflater** (`onboard/coach-wizard` 28, `onboard/klubb-wizard` 26): tokeniseres.
- **Dataviz** (`stats/*`, `lib/gameplan/map-colors`): legitim palett — dokumenteres som bevisst unntak.

**Beslutning som trengs fra Anders:** skal hex-gaten gjeninnføres som *advarsel* (ikke CI-blokk) når
Open Design har landet? Planen antar ja.
**DoD:** `check-no-hex.mjs` kjører mot ny baseline med dokumenterte unntak.

### B16 · Marketing-rest
`familie-marketing.html`: priser, kontakt, blogg-chrome. Forside + coaching er levert (#139).
**Lav prioritet** — kjøres kun hvis B11–B15 er ferdig før 1. september.

### B17 · Hardening + regresjonsvern
- Visuell reg-test på `/design-system`, lys **og** mørk (Playwright `toHaveScreenshot`) — finnes ikke i dag.
- a11y-smoke utvidet fra 12 offentlige ruter til også å dekke **innloggede** ★-flater
  (cockpit, PlayerHQ hjem, workbench, analysere).
- 44px-gjennomgang · mørk/lys-audit på alle porterte flater · CoachHQ-grep = 0.
- Oppdater `REACT-PORT.md` + denne planen med endelig status.

---

## 4. Rekkefølge og avhengigheter

```
B11 gap-komponenter  ─┐
B12 feedback/struktur ─┴─→ B13a AgencyOS → B13b PlayerHQ → B13c delte → B14 slett bibliotek
                                                                            │
                                                    B15 hex-disiplin ───────┤
                                                    B16 marketing (valgfri) ┤
                                                                            └→ B17 hardening
```

**B11 er hard forutsetning** — uten `StatusDot` og `AarsGantt` i v2 stopper B13a og B13c på tre filer.
**B14 kan ikke starte før B13 er komplett** (kriterium 1 må være 0).
B15 kan kjøres parallelt med B13.

### Forslag til uker mot 1. september

| Uke | Innhold |
|---|---|
| 27. juli – 2. aug | Merge #149 · B11 gap-komponenter · B12 lab-parity |
| 3. – 9. aug | B13a AgencyOS (10 filer) |
| 10. – 16. aug | B13b PlayerHQ (10 filer) · B15 hex-disiplin parallelt |
| 17. – 23. aug | B13c delte (12 filer) · **B14 slett biblioteket** |
| 24. – 31. aug | B17 hardening + reg-test · B16 marketing hvis tid |

---

## 5. Risiko

| Risiko | Håndtering |
|---|---|
| B13 rører cockpit, SG-hub, statistikk og coach-workbench — ekte regresjonsfare | Én PR per pulje, visuell verifisering før merge, reg-testen fra B17 bør framskyndes hvis en pulje føles utrygg |
| Ingen visuell reg-test finnes i dag → drift oppdages av mennesker | B17 er egentlig et *vern*, ikke et sluttpunkt — vurder å kjøre reg-test-biten før B13b |
| Open Design kan endre fasit midt i porten | Showroom er fasit; ikke «forbedre» design underveis (gullregel 5) |
| Hex-drift fortsetter uten gate | B15 beslutning tidlig, ikke til slutt |

---

## 6. Utenfor denne planen

- Dommerskjermer (eget Open Design-prosjekt)
- Alle 361 ruter pixel-perfect
- Ny merkevare / palett
- Live data i Open Design-showroom

---

## 7. Statuslogg

| Dato | Hva |
|---|---|
| 2026-07-26 | Plan skrevet mot verifisert nullpunkt. Bølge 12 i `plan-resterende-port.md` reskopet til legacy-avvikling av 32 navngitte filer. To ekte komponent-gap identifisert (`StatusDot`, `YearPlanGantt`). Tidsramme flyttet til 1. september. |
