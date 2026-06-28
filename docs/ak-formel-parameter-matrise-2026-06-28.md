# AK-formel — parameter-matrise + teknisk plan (2026-06-28)

> «Hvilke deler har hva.» Kode-forankret (taxonomy.ts, teknisk-plan/oppgave-modal.tsx,
> drill-create-form.tsx, schema.prisma). Svarer Anders: FYS → styrke/kondisjon/bevegelighet
> (ingen posisjoner/fart), TEK → P-posisjoner + fart, putting → hverken posisjoner eller club speed.

## 1. Teknisk plan / utviklingsplan for tekniske endringer — hva finnes
**Struktur (EXISTS):** `TechnicalPlan` (per spiller, knyttet til en `PeriodBlock`, status DRAFT/ACTIVE/ARCHIVED,
plan-varianter A/B via `planVariant`/`parentPlanId`) → `TechnicalPlanPosition` (P1.0–P10.0, `hovedfokus`-flagg)
→ `PositionTask` (selve den tekniske endringen: tittel/beskrivelse + AK-formel-koding `lFase`/`cs`/`miljo`/`prPress`
+ `koller`/`slagType` + rep-mål i 3 farter DRY/LAV/FULL + `trackStatus` PÅ_VEI/STAGNERER/FERDIG/INAKTIV/AVSLAATT).
Måling: `PositionTaskTmGoal` (TrackMan-mål med protokoll ROLLING_WINDOW/STREAK/SESSION_GATE) + `PositionTaskLog`
(logget rep, manuell eller fra TrackMan). Overordnet: `TechnicalPlanClubTarget` (mål per kølle) + `TechnicalPlanAudit`.
Filer: `src/app/admin/teknisk-plan/**`, `src/components/teknisk-plan/oppgave-modal.tsx`, `src/app/portal/tren/teknisk-plan/actions.ts`.

**Svakhet (PARTIAL):** En teknisk endring lagres som en `PositionTask` med fritekst-beskrivelse. Det finnes IKKE et
eksplisitt **«feil → ønsket endring → cue/følelse → bevis (TM)»**-felt-sett — «feilen» og «følelsen/cue-en» bor i
beskrivelsen, ikke som strukturerte felt. Anbefaling: gjør feil/ønsket-endring/cue til egne felt, så utviklingsplanen
blir søkbar, gjenbrukbar og målbar (før/etter).

## 2. PARAMETER-MATRISE — hvilke deler har hva

| Pyramide / type | Modus | P-posisjoner | L-fase | Fart (CS) | Treningsområde | Køller | Slagtype | Miljø (M) | Press (PR) | FYS-felt |
|---|---|---|---|---|---|---|---|---|---|---|
| **FYS · Styrke** | FYS | – | – | – | – | – | – | – | – | reps, sett, **kg**, muskelgrupper |
| **FYS · Bevegelighet** | FYS | – | – | – | – | – | – | – | – | sett, **tid**, type, muskelgrupper |
| **FYS · Kondisjon** | FYS | – | – | – | – | – | – | – | – | **tid, sone**, aktivitet |
| **FYS · Mobilitet** | FYS | – | – | – | – | – | – | – | – | reps, sett, tid, muskelgrupper |
| **FYS · Aktivering** | FYS | – | – | – | – | – | – | – | – | reps, sett, muskelgrupper |
| **TEK (teknikk)** | GOLF | **JA** | **JA** | **JA** | JA | JA | JA | JA | JA | – |
| **SLAG · full sving** (driver/jern) | GOLF | **JA** | JA | **JA** | JA (TEE/INN*) | JA | JA | JA | JA | – |
| **SLAG · kort spill** (chip/pitch/lob/bunker) | GOLF | JA (færre) | JA | JA | JA (KORT_SPILL) | JA | JA | JA | JA | – |
| **SLAG · putting** | GOLF | **NEI** | **NEI** | **NEI** | JA (PUTT*) | JA (kun putter) | JA (putt) | JA | JA | avstands-/hit-rate-mål |
| **SPILL** | GOLF | noen ganger | noen ganger | NEI | JA (SPILL) | JA (alle) | – | JA | JA | – |
| **TURN** | GOLF | noen ganger | noen ganger | NEI | – | JA (alle) | – | (arena) | **JA (høyt)** | turnerings-modus |

(«–» = gjelder ikke. Putting-raden er Anders' eksempel, bekreftet i kode.)

**FYS-undertyper — hvilke felt (fra `FYS_TRENINGSTYPER`):**
- Styrke: reps · sett · kg · muskelgrupper
- Bevegelighet: sett · tid · bevegelighetstype · muskelgrupper
- Kondisjon: tid · HR-sone (SONE_1–5) · aktivitet
- Mobilitet: reps · sett · tid · muskelgrupper
- Aktivering: reps · sett · muskelgrupper

## 3. Viktig funn: i dag er skillet bare DELVIS håndhevet
- **Håndhevet:** FYS vs GOLF (via `getDrillModus()` — FYS-pyramide gir FYS-felt, resten gir golf-felt). ✅
- **KUN konvensjon (ikke håndhevet):** innenfor GOLF vises L-fase + CS + P-posisjoner for ALLE golf-driller —
  også putting. Feltene er `nullable`, så coachen *kan* sette club speed på en putt. Det er semantisk feil,
  men ingenting stopper det i dag. (Bekreftet: `PositionTask.lFase/cs` er nullable; oppgave-modal viser selektorene uansett.)

## 4. Anbefaling — håndhev matrisen (så det blir «umulig å kode feil»)
I AK-formel-koderen skal felt vises/skjules dynamisk basert på **pyramide-del + treningsområde/slagtype**:
- FYS → kun fys-felt for valgt type (allerede slik).
- Putting → skjul P-posisjoner, L-fase og club speed; vis i stedet avstands-/hit-rate-mål.
- Kort spill → P-posisjoner valgfritt, fart som tempo-soner.
- Full sving/TEK → P-posisjoner + L-fase + fart-sone (med kalibrert mph).
- SPILL/TURN → ingen fart; press + arena i fokus.
Dette gjøres som UI-gating (oppgave-modal/koder) + ev. zod-validering per område, slik FYS-modus alt fungerer.
