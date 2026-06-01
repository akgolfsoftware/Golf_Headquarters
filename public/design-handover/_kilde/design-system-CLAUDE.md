# AK Golf HQ — pågående refinement-arbeid

**Lese-rekkefølge for ny chat:** denne fila → `README.md` (designsystem-spec) → `SKILL.md` (tone/persona) → siste `Refinement-runde-N-leveranse.html` for å se hva som er gjort sist.

---

## Hva er dette prosjektet

AK Golf HQ — golfcoaching-plattform i fire moduler (Trackman / Agency / Pyramide / Editorial). Designsystem ferdig; ~75 preview-kort i `preview/` rendrer hver komponent som en frittstående HTML-fil. Hovedfiler i prosjektrot: `Workbench.html`, `DispersionTool.html`, og en serie `Refinement-runde-N-leveranse.html` som er audit-/leveranse-dokumenter for refinement-prosessen.

---

## Refinement-prosessen (KRITISK å følge presist)

Brukeren kjører prosjektet i runder. Hver runde:

1. **3 og 3 skjermer** (ikke mer — kvaliteten faller over det).
2. **Diagnose først, polish etter.** Pek ut den ene strukturelle feilen før noen pixel-fix. Hvis grunnformen er feil, si det rett ut.
3. **Bruksspråk fra brukeren:** *"Koder formen faktisk dataen, eller er den blitt dekorativ? Henger relaterte elementer sammen som ett objekt, eller er de frakoblede lister? Matcher det specen, eller er det 'nesten'?"*
4. **Lever oppdatert design, ikke forslag.** Ikke ros det som funker — anta at det meste fungerer og finn det som holder det tilbake fra produksjon.
5. **Hvis noe allerede er produksjonsklart, si det rett ut** framfor å endre for endringens skyld.

### Format per runde

- Skriv 3 fix direkte til `preview/components-*.html`.
- Skriv `Refinement-runde-N-leveranse.html` med:
  - Eyebrow + h1 (kort, kraftig påstand om strukturen)
  - 1 · DIAGNOSE — den strukturelle feilen, gjerne med tabell
  - 2 · LEVERT — komponent-kort per fil med ✓-changes
  - 3 · IKKE GJORT — med vilje utenfor scope
  - 4 · FILER — lenker til preview-kortene
  - Neste runde forhåndsannonsert i en `.next`-box
- Match visuelt språk fra eksisterende leveranse-dokumenter (les `Refinement-runde-13-leveranse.html` som mal).
- `asset:` på write_file = `"Refinement runde N — leveranse"`.

### Etter levering
- Snip mid-runde-edits via `snip` for å holde kontekst slank.
- `done` med leveranse-filen, deretter `fork_verifier_agent`.
- Brevt svar i chat: strukturell feil + nøkkelfix + neste runde.

---

## Designsystem-regler (gjentas her fordi de brytes ofte)

- **Inter / Inter Tight / JetBrains Mono.** 8 pt-grid. Lucide-ikoner.
- **#005840 primary, sparsomt.** Aldri som stor bakgrunnsflate.
- **#D1F843 accent KUN på aktive/valgte states og NÅ-markører.** Ikke dekor.
- **Datafarger dempet og semantiske.** Aldri regnbue.
  - **Unntak:** `--pyr-fys / --pyr-tek / --pyr-slag / --pyr-spill / --pyr-turn` er den ene tillatte regnbuen, kun for pyramide-akser. Bruk rå hex (mode-invariant), ikke semantiske aliaser.
- **Aksent/venstrebar bærer hue, fyllet er nær-nøytralt.** Editorial-kort-mønster: `--card`-bakgrunn + 3 px lime venstrekant. Brukes hver gang du erstatter en flat-grønn flate.
- **Notion-ro.** Hårfine skiller, lav-kontrast fyll, rolig whitespace.
- **prefers-reduced-motion respekteres alltid.** Alle infinite-loop animasjoner må gates av `@media (prefers-reduced-motion: reduce)`.
- **44 px touch-target på mobile flater** (ikke alltid håndhevet ennå).
- **Test alltid på minste reelle størrelse**, ikke den største.

---

## Plan — 19 runder totalt

| # | Skjermer | Status |
|---|---|---|
| 7 | trackman + trackman-dispersion + trackman-stability | ✓ |
| 8 | stats-sg + sg-waterfall + sg-training-scatter | ✓ |
| 9 | season-timeline + monthcal + daycal | ✓ |
| 10 | coach-mobile + player-mobile + voice-input | ✓ |
| 11 | pyramid + pyramid-levels + gap-to-drill | ✓ |
| 12 | agency-dashboard + agency-player-table + agency-player-panel | ✓ |
| 13 | agency-bookings + agency-tests + agency-drift | ✓ |
| **14** | agency-sidebar + agency-inbox + cmdk | **neste** |
| 15 | workbench-day + workbench-week + workbench-sidebar | |
| 16 | kpi + featured + insight-narrative | |
| 17 | timeline + queue + okt-detail | |
| 18 | live-session + co-agent + hover-preview | |
| 19 | subscription + credit-indicator + compliance | |
| 20 | onboarding + foreldre + test-week | |
| 21 | multi-compare + course-heatmap + training-analysis | |
| 22 | notifications + tabbar + drag-slider | |
| 23 | buttons + badges + inputs + eyebrow | |
| 24 | DispersionTool.html (standalone, dypere pass) | |
| 25 | Workbench.html (full integrasjon, avhenger av Anders-valg fra Refinement-gjenstaaende.html) | |

Rekkefølgen er ikke hellig — hvis brukeren ber om annen klynging, gjør det.

---

## Strukturelle mønstre fra tidligere runder (bruk som sjekkliste)

Disse er funnet og fikset så ofte at det er verdt å lete etter dem **først** i nye skjermer:

1. **Falske kontroller.** Pills og tabs med `.is-active` eller "on"-state men ingen logikk. Fjern eller gjør ekte.
2. **Flat-grønne bakgrunner.** Erstatt med editorial-kort + lime venstrekant.
3. **Manglende `prefers-reduced-motion`.** Alle infinite-loop animasjoner trenger gate.
4. **Hardkodede tall der UI lover beregning.** Klassifiser/regn ut fra faktisk state i stedet.
5. **Spec som motsier seg selv** (lede sier én ting, eksempler viser noe annet).
6. **Drill-down-lag som ikke deler datakilde.** Samme spiller/datapunkt skal fortelle samme historie på dashboard, tabell, panel.
7. **Falsk fil-uavhengighet.** Tre filer som later som de er separate komponenter når de egentlig er fane-views av samme verktøy (Trackman runde 7).
8. **Lying summary-tall.** Header/footer-aggregater som ikke matcher matrisen brukeren kan telle selv (agency-tests runde 13).
9. **Strukturelt umulige states.** To radio-tabs aktive samtidig (agency-drift runde 13).
10. **Semantiske farge-aliaser der mode-invariant kreves.** `--primary`/`--warning`/etc. flipper i dark mode; bruk rå hex eller spec'ede skin-tokens (pyramid-levels runde 11).

---

## Hva som er bevisst utenfor scope

- Wire opp ekte filtering/sortering på tabeller — preview-fase, ikke funksjonelt produkt.
- Ekte calendar-/dato-service på tvers av filer.
- 44 px touch-target audit på tvers av mobile flater (vurderes som egen runde senere).
- Full dark-mode-audit (egen runde senere).
- Refaktor av mic-pattern til shared primitiv på tvers av filer.

---

## Filer å kjenne

- `colors_and_type.css` — alle CSS variables + typografi. Sjekk her hvis du er usikker på en farge.
- `preview/_shared.css` — boilerplate for alle preview-kort.
- `preview/components-*.html` — selve komponentene.
- `Refinement-runde-34-leveranse.html` — nyeste leveranse (les denne for å se hva som er gjort sist). `Refinement-runde-13-leveranse.html` — beholdt som visuell mal for nye leveranse-dokumenter. Eldre runder er slettet for å holde prosjektet ryddig.
- `Refinement-gjenstaaende.html` — Anders-valg om Workbench-integrasjon (relevant for runde 25).
- `Workbench.html`, `DispersionTool.html` — hovedverktøy, refines i runde 24–25.
