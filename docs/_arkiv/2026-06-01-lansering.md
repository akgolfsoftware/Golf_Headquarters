# Lanseringsplan — AK Golf HQ

**Situasjon:** 2 måneder bak. Fanget i design→bygg→«ikke helt»-loop. Har komplett design (v10, 47 skjermer) + fungerende kodebase (~150 skjermer, ekte data, live på akgolf.no).

**Diagnose:** Problemet er ikke mangel på design eller kode. Det er at vi har spredt innsatsen tynt over 150 skjermer i stedet for å gjøre de **viktigste** perfekte. Og det gamle forstyrrer det nye.

**Prinsipp (bryter loopen):**
1. **Slutt å designe.** v10 er fasit. Ikke én skjerm til i Claude Design før lansering.
2. **Bygg KUN launch-kjernen** (15 skjermer) pixel-tro mot v10.
3. **Skjul alt annet** så plattformen føles ferdig, ikke halv.
4. **Lanser.** Forbedre de resterende ~32 skjermene i ro ETTER lansering.

---

## Launch-scope — 15 kjerne-skjermer

Disse MÅ være pixel-perfekte. Alt annet skjules til etter lansering.

### PlayerHQ (9) — det spilleren betaler for
| # | Skjerm | v10-kilde | Hvorfor |
|---|---|---|---|
| 1 | Hjem / Oversikt | `HomeScreen` | Første inntrykk, daglig |
| 2 | I dag (gjennomføre) | `TodayScreen` | Dagens økt |
| 3 | Kalender | `CalendarScreen` | Se planlagte økter |
| 4 | Treningsplan | `TrainingPlanScreen` | Planen sin |
| 5 | Mål | `GoalsScreen` | Motivasjon |
| 6 | Strokes gained / Stats | `SGScreen` / `StatsScreen` | Fremgang |
| 7 | Runder | `RoundsScreen` + `RoundDetailScreen` | Resultater |
| 8 | Meldinger | `MessagesScreen` | Coach-kontakt |
| 9 | Profil + abonnement | `ProfileScreen` | De betaler her |

### AgencyOS (6) — coachen (deg + ansatte)
| # | Skjerm | v10-kilde | Hvorfor |
|---|---|---|---|
| 10 | Dashboard (cockpit) | `DashboardScreen` | Daglig styring |
| 11 | Spillere (stall) | `PlayersScreen` | Hvem trenger meg |
| 12 | Spillerprofil 360 | `PlayerProfileScreen` | Jobbe med én spiller |
| 13 | Kalender | `CalendarScreen` | Coachens uke |
| 14 | Treningsplaner | `TrainingPlansScreen` | Lage/følge planer |
| 15 | Bookinger + forespørsler | `BookingsScreen` / `RequestsScreen` | Drift |

*(Booking-flyt for spillere kommer som del av #9/#15.)*

---

## Faser

### Fase A — Rydd & fokuser (jeg, ~½ dag)
- **Skjul alt utenfor launch-scope** fra sidemenyene (kommenter ut, ikke slett — de finnes fortsatt på ruter). Plattformen føles da ferdig, ikke halvbygd.
- **Sorter v10-designet inn** i `public/design-handover/v10/` som fasit + arkiver v9.
- **Mapping:** hver av de 15 launch-skjermene → eksisterende rute → design-skjerm.
- Verifiser: meny viser kun launch-scope, ingen døde lenker.

### Fase B — Bygg launch-kjernen pixel-tro (jeg, modul for modul)
- **3 skjermer om gangen** (din egen refinement-rytme). Per skjerm:
  - Port fra v10 design-skjerm (eksakt layout, ikke tolkning)
  - Ekte Prisma-data + ærlig tomstate
  - Din kvalitetsbar: «koder formen dataen? henger ting sammen som ett objekt? matcher specen — eller er det nesten?»
  - DONE-gate: tsc + eslint + screenshot mot design-skjerm
- **Du godkjenner hver batch på 3** før neste. Du ser fremgang, ikke en svart boks.

### Fase C — Lanser → forbedre i ro
- Når alle 15 er pixel-perfekte + verifisert: **deploy til akgolf.no, lanser.**
- De ~32 resterende skjermene: forbedres post-launch, uten tidspress, modul for modul mot v10.

---

## Hva jeg trenger fra deg
1. **Grønt lys på launch-scope** (de 15) — eller juster: hva mangler / hva er for mye?
2. Ikke noe mer design før vi har lansert.

## Hva du IKKE trenger å gjøre
- Designe flere skjermer (v10 er nok)
- Vente på meg mellom batcher (du godkjenner 3 av gangen, raskt)

**Realistisk:** stramt scope = **uker til lansering, ikke måneder** — så lenge vi ikke utvider scope underveis.
