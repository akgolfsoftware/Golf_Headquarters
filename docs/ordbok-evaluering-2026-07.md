# Ordbok-evaluering — FØR-rapport (renskriving 2026-07)

> Grunnlag for renskrivingen av `docs/ordbok-ak-golf-konsept.md` (1629 linjer → mål < 900).
> Metode: alle 350 kode-termer i ordboken er ekstrahert og kryssjekket mot fasit-kildene
> (prisma/schema.prisma, src/lib/taxonomy.ts, ak-taxonomy.ts, src/lib/domain/*, src/lib/sg-hub/*,
> src/lib/canon/*) og deretter liveness-sjekket mot HELE src/ + prisma/ + scripts/.
> **Ingen term slettes uten å stå i denne rapporten.** Sjekkpunkt: Anders godkjenner SLETT-listen.

## Tallene

| Kategori | Antall |
|---|---|
| Kode-termer i ordboken | 350 |
| Bekreftet levende i kode | 336 |
| SLETT-kandidater (døde i kode OG canon) | 6 |
| VENTENDE (canon v3.5, ikke i kode ennå — beholdes) | 3 |
| Fil-/kildereferanser (ikke termer — beholdes som kilder) | 5 |
| TILLEGG: helt udokumenterte Prisma-enums | 32 |
| TILLEGG: dokumenterte enums med manglende verdier | ~20 enums (~100 verdier) |

## SLETT-kandidater (krever Anders' godkjenning)

| Term | Begrunnelse |
|---|---|
| `P4.5`, `P5.5`, `P6.5`, `P7.5` | Halvtrinn-posisjonene finnes IKKE lenger: [taxonomy.ts:130](src/lib/taxonomy.ts:130) har 10 posisjoner (P1.0–P10.0), og Masterbrain `positions.json` (canon) har heller ingen halvtrinn. Ordbokens §6-påstand «taxonomy.ts har 14 posisjoner med halvtrinn» er faktafeil og rettes samtidig. |
| `NorwegianSkillBenchmark` | 0 treff i schema.prisma og hele src/ — modellen finnes ikke. |
| Alfabetisk indeks (§17, 54 linjer) | Strukturelt kutt (ikke term-tap): manuelt vedlikeholdt, drifter, Cmd+F/agent-søk trenger den ikke. |

## VENTENDE (beholdes, flagget — IKKE døde)

- `CS20`, `CS30`, `CS40` — canon v3.5-verdier; Prisma-enum har fortsatt bare CS50–CS100.
  Beholdes i ordboken med «Kode-status: mangler i enum»-flagg.

## Fil-referanser (beholdes som kilder, telles ikke som termer)

`Masterbrain`, `canon-methodology.json`, `l-faser.json`, `ak-taxonomy.ts` — kildehenvisninger
i header. `ordliste-ak-golf.md` — historisk filnavn i fotnoten; beholdes kun som én
historikk-setning.

## TILLEGG (Anders' beslutning: «koden må ha tilgang til ordboken» → legges inn)

**Policy: én rad per ENUM med verdilisten komprimert inline** — ikke én rad per verdi.
Estimert kost: ~35–40 linjer i en utvidet §15 (Datamodell & status-enums).

32 udokumenterte enums som får hver sin rad:
`ApprovalStatus`, `BookingStatus`, `ClubTargetStatus`, `CoachDirektivType`,
`DesignKoblingStatus`, `FacilityType`, `InsightCategory`, `LeaveReason`, `NotionLinkType`,
`NotionSyncMode`, `ParentLinkRelation`, `ParticipationStatus`, `PaymentStatus`,
`PaymentType`, `PlanAdjustmentStatus`, `PositionTaskStatus`, `SessionNoteType`,
`SessionRequestStatus`, `ShotLie`, `ShotType`, `TechPlanStatus`, `TestAssignmentStatus`,
`TestVisibility`, `TmGoalComparison`, `TmGoalProtocol`, `TmGoalType`,
`TournamentEntryStatus`, `TrackStatus`, `Ukedag`, `UserRole`, `UserStatus`, `WindDir`

I tillegg oppdateres verdilistene i allerede dokumenterte enums (størst gap:
`DrillFasilitet` 9 verdier, `FacilityType` 7, `WindDir`/`TrackStatus`/`ShotLie`/
`PlayerProgram`/`ParticipationStatus`/`DesignKoblingStatus` 5 hver).

## Faktafeil som rettes i renskrivingen (utover SLETT)

- §6 NB-note om «14 posisjoner med halvtrinn» — koden har 10 posisjoner uten halvtrinn.
- Rader i §6 som beskriver navne-avvik per halvtrinn — utgår sammen med halvtrinnene.

## Neste steg (etter godkjenning av SLETT-listen)

1. Renskriving per godkjent plan: preamble 10 linjer, «Relaterte termer»-kolonnen kuttes,
   Definisjon+Bruk slås sammen, §17 slettes, Del B → ren rettskrivingsliste (DEDUPE-liste
   dokumenteres), TILLEGG-enums inn i §15. Estimat: ~830 linjer.
2. Peker-filer på de to gamle kopi-stedene.
3. ETTER-verifikasjon: term-diff-script (original vs ny — hvert avvik MÅ stå på
   SLETT-/DEDUPE-listen), fredet-diff på B24 + forvekslings-advarslene, linjetall < 900.
