# Plan — Baneguide med spiller-dispersion og banekart

**Opprettet:** 2026-06-28 · **Status:** Forslag, venter på godkjenning · **Eier:** Anders Kristiansen

Mål: en baneguide à la UpGame/Arccos der spilleren ser sin egen slag-spredning (dispersion)
tegnet oppå ekte satellitt-banekart, og coachen ser det samme per spiller som analyseverktøy.

> **Locked beslutninger (Anders 2026-06-28):**
> - **Ekte hull-geometri** (satellitt/GPS), ikke skjematisk.
> - **Kartmotor: Mapbox.** **Geometri-kilde: OpenStreetMap** (Overpass), med egen rette-editor som fallback.
> - **Datakilder for spredning:** slag-registrering på bane + TrackMan (range) + manuell inntasting.
> - **Målgruppe:** både spiller (PlayerHQ) og coach (AgencyOS).

---

## 1. Nåtilstand (hva vi bygger på)

**Finnes og gjenbrukes:**
- Komponenter: `src/components/athletic/data/shot-map.tsx` (σ-spredningsplott), `src/app/portal/mal/trackman/[id]/dispersion-plot.tsx`, `src/components/sg-hub/SgTrainingScatter.tsx`.
- Designet `DispersionTool` ligger i arkiv: `public/design-handover/_arkiv-handover-2026-06-20/dispersion-*.jsx` (porteres til skjerm 5).
- SG-motor ferdig kalibrert (168/168 tester grønne).
- Datamodell: `Shot` har allerede `startX/startY/endX/endY` (Float?) — men fylles aldri i dag. `TrackManShot.side` = meter offline. `Round`, `HoleScore`, `TrackManSession` finnes.

**Mangler (det denne planen løser):**
- Ingen hull-geometri (green/fairway/bunker-polygoner, GPS) på noen bane-modell.
- Ingen kart-UI for å plotte hvor et slag landet → `Shot`-koordinatene er tomme.
- TrackMan-import skriver ofte ikke `TrackManShot`-rader (kun `rawJson`) → range-spredning når ikke UI.
- Ingen dispersion-motor som regner ellipse/bias fra slag-data.

**Ryddes vekk:** den gamle hardkodede UpGame-demo-baneguiden (`/portal/mal/baner`, K-16) erstattes av den ekte baneguiden under `/portal/baneguide`.

---

## 2. Banegeometri: Mapbox + OSM

- **Mapbox GL JS** = kartmotor + satellitt-tiles. Tegner hull, baller og dispersion-ellipser oppå.
- **OpenStreetMap (Overpass API)** = geometri-kilde. Henter `golf=fairway|green|tee|bunker|water_hazard|rough`-polygoner per bane.
- **Rette-editor (fase 7)** = der OSM mangler/er feil, tegner/justerer vi hull selv og lagrer i vår DB.
- AK-spillerne spiller få baner → vi importerer ~10 baner (Østfold/Fredrikstad-området først), ikke en global database.
- Mapbox gratis-tier antas å holde i starten; eksakt grense + API-nøkkel-oppsett verifiseres i fase 1 (ikke gjettet her). Mapbox-token i `.env` (aldri i kode).

---

## 3. Datamodell-utvidelser (Prisma)

Nye/endrede modeller (additive — følg gotcha: `CREATE TABLE IF NOT EXISTS` via `db execute`, ikke `migrate dev`/`db push`):

- **`CourseHole`** (ny) — én rad per hull per bane: `baneId`, `holeNumber`, `par`, `lengthMeter`, tee/green/pin-GPS (lat/long), `geojson` (Json — fairway/green/bunker/vann-polygoner fra OSM/editor), `handicapIndex?`.
- **`CourseGeometrySource`** (ny, enkel) — sporing av hvor geometrien kom fra: `baneId`, `source` ("osm" | "manual" | "api"), `importedAt`, `osmRelationId?`.
- **Knytning bane↔runde:** avklar `CourseDefinition` (brukes av `Round`) vs `Bane` (markedsside m/ lat/long). Plan: legg `CourseHole` på **`Bane`** (har allerede lat/long + klubb), og broa `Round.courseId` → `Bane` via en kobling eller felt. **Åpent punkt — se §8.**
- **`Shot`:** ingen nye felt nødvendig for posisjon (`startX/Y/endX/Y` finnes). Vurder å tolke dem som **GPS lat/long** i stedet for 0-100% — avgjøres i fase 2. Legg evt. `endLie`/`result` hvis dispersion-fargelegging trenger det.
- **`TrackManShot`:** ingen endring — `side` + `carryDistance` gir range-dispersion. Fiks ligger i *import* (skrive radene), ikke i schema.

---

## 4. Skjermer (kode + design)

### PlayerHQ (spiller)
| # | Skjerm | Rute | Design |
|---|---|---|---|
| 1 | Baneguide-bibliotek | `/portal/baneguide` | Ny — Claude Design |
| 2 | Banekart-oversikt (18 hull + samlet spredning) | `/portal/baneguide/[baneId]` | Ny — Claude Design |
| 3 | Hull-detalj (satellitt + dispersion-ellipse + strategi) | `/portal/baneguide/[baneId]/hull/[nr]` | Ny — Claude Design |
| 4 | Slag-plotting på kart (under/etter runde) | utvider `/portal/mal/runder/[id]/slag` | Ny kart-modus |
| 5 | Spredningsplott per kølle (TrackMan + bane) | `/portal/mal/sg-hub/dispersion` | Port fra arkiv `DispersionTool` |
| 6 | Manuell inntasting av slag/spredning | skjema (modal/side i runde-flyt) | Ny — enkel |

### AgencyOS (coach)
| # | Skjerm | Rute | Design |
|---|---|---|---|
| 7 | Coach baneguide per spiller | `/admin/spillere/[id]/baneguide` | Ny — Claude Design |
| 8 | Coach dispersion-verktøy (analyse + benchmark) | `/admin/spillere/[id]/dispersion` | Ny — Claude Design |
| 9 | Banedata-admin + rette-editor | `/admin/baner` (+ `/[id]`) | Ny — verktøy-UI |

Alle skjermer føres inn i `docs/MASTER-SKJERMPLAN.md` med de 6 hakene og portes via design-porting-gate (adversarial diff til 0 avvik).

---

## 5. Fase-plan

1. **Banedata-fundament** → `CourseHole`-modell, OSM/Overpass-import-script, Mapbox-oppsett (token, satellitt-tiles, basis-kartkomponent). *Verifiser:* 2-3 ekte baner lastet, hull tegnes riktig på satellitt.
2. **Slag-posisjon-innsamling** → fyll `Shot.startX/Y` fra kart-trykk (skjerm 4) + manuell (skjerm 6); fiks TrackMan-import så `TrackManShot`-rader faktisk skrives. *Verifiser:* ett ekte slag plottet, lagret og hentet tilbake.
3. **Dispersion-motor** → lib-funksjon: σ-ellipse, snitt, bias, venstre/høyre-tendens fra slag-data; gjenbruk `shot-map.tsx`. *Verifiser:* ellipse matcher kjent testdatasett.
4. **Design (Claude Design)** → tegn skjerm 1-3, 7-9 mot designsystemet; lås IA til koden først. Skjerm 5 har ferdig design i arkiv.
5. **Spiller-skjermer** → bygg 1-6, port via gate. *Verifiser:* diff 0 avvik, bygg/tsc/lint grønt.
6. **Coach-skjermer** → bygg 7-8.
7. **Banedata-admin + rette-editor** → skjerm 9; rett hull OSM bommer på.
8. **Avslutning** → MASTER-SKJERMPLAN oppdatert, full `prisma validate && generate && tsc && build`, alle design-differ 0 avvik, fjern gammel `/portal/mal/baner`-demo.

Stor feature — gjøres fase for fase over flere økter, ikke på én.

---

## 6. Gjenbruk (bygg ikke på nytt)
- Spredningsvisning: `shot-map.tsx`, `dispersion-plot.tsx`.
- Designtokens: `globals.css` + `design-tokens.ts` (ingen hardkodet hex på kartet — kartlag-farger blir nye tokens, godkjennes av Anders).
- DispersionTool-logikk: `_arkiv-handover-2026-06-20/dispersion-math.jsx` som referanse.
- Lucide-ikoner, athletic-komponenter, eksisterende runde-/TrackMan-flyt.

## 7. Risiko
- **OSM-dekning** på små norske baner kan være tynn → rette-editor (fase 7) er sikkerhetsnett, ikke valgfri.
- **GPS-presisjon ved slag-plotting** på telefon under runde → tillat etter-runde-plotting på satellittbilde som primær flyt, live-GPS som bonus.
- **Mapbox-kostnad** ved skalering → start gratis-tier, mål kart-loads, vurder kommersielt golf-API kun hvis OSM svikter.

## 8. Åpne spørsmål (avklares før/under fase 1)
1. **Bane-modell-konsolidering:** Skal `CourseHole` henge på `Bane`, og hvordan kobles `Round` (bruker `CourseDefinition`) til geometrien? Anbefaling: standardiser på `Bane`, broa `Round`.
2. **Mapbox-konto:** bruker vi eksisterende Mapbox-konto eller oppretter ny? Token i `.env`.
3. **Hvilke ~10 baner** skal importeres først? (Anders gir liste — start med banene AK-spillerne spiller mest.)
4. **Shot-koordinater:** tolke `startX/Y` som GPS lat/long (anbefalt for ekte kart) eller beholde 0-100% relativt? Avgjør i fase 2.
