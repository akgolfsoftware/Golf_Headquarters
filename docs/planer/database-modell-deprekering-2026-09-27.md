# Database-modeller uten direkte appbruk — 27.09.2026

Dette er en kontrollert deprekeringsliste, ikke en slettemigrasjon.
AK Golf HQ har historiske spillerdata og baselinet Prisma-historikk; modeller fjernes ikke fra
`schema.prisma` bare fordi dagens `src/` ikke spør dem direkte.

Maskinell sjekk:

```sh
node -e 'const fs=require("fs"); const s=fs.readFileSync("prisma/schema.prisma","utf8"); const ms=[...s.matchAll(/^model\s+(\w+)\s+\{/gm)].map((m)=>m[1]); console.log(ms.length);'
```

Resultat: 199 Prisma-modeller totalt. 25 modeller har ingen direkte
`prisma.<modell>`-spørring i `src/`, `scripts/` eller `tests/` per denne sjekken:

| Modell | Status |
|---|---|
| `TnPostAttachment` | Deprekeringskandidat — beholdes til historisk innhold/vedlegg er avklart. |
| `PuttDetail` | Deprekeringskandidat — beholdes til gamle putt-/testdata er avklart. |
| `TradApning` | Deprekeringskandidat. |
| `SwingAnalysis` | Deprekeringskandidat — mulig historisk analyse-/videoinnhold. |
| `PeriodRecipeOkt` | Deprekeringskandidat. |
| `OktMalDrill` | Deprekeringskandidat. |
| `KnowledgeChunk` | Deprekeringskandidat — sjekk RAG/import før fjerning. |
| `AiSpillerminne` | Deprekeringskandidat — persondata må vurderes før endring. |
| `PgaApproachDistance` | Deprekeringskandidat — kan være datalager for stats. |
| `DatagolfTakBand` | Deprekeringskandidat — kan være datalager for DataGolf. |
| `SessionSet` | Deprekeringskandidat. |
| `PlanAdjustment` | Deprekeringskandidat — eldre planendringshistorikk må bevares. |
| `TournamentPreparation` | Deprekeringskandidat. |
| `PositionTaskMaal` | Deprekeringskandidat. |
| `KondisjonSegment` | Deprekeringskandidat. |
| `TechnicalPlanClubTarget` | Deprekeringskandidat. |
| `PageApproval` | Deprekeringskandidat. |
| `DesignKobling` | Deprekeringskandidat. |
| `CoachDrillDirectiv` | Deprekeringskandidat. |
| `MessageAttachment` | Deprekeringskandidat — vedlegg/persondata må avklares. |
| `KommandoChat` | Deprekeringskandidat — intern chat-historikk må avklares. |
| `InvariantOverride` | Deprekeringskandidat. |
| `PeriodeFordeling` | Deprekeringskandidat. |
| `DatagolfSyncState` | Skal ikke fjernes uten konkret DB-autorisasjon; gotchas sier `db push` ville droppet den. |
| `AiPrompt` | Deprekeringskandidat — sjekk prompt-/audit-historikk før fjerning. |

Neste trygge steg før faktisk fjerning:

1. Mål radantall per tabell i separat lokal testbase og eventuelt read-only produksjonssjekk.
2. Merk tabellene med eier og datakategori i GDPR-datakartet der de inneholder persondata.
3. Flytt gamle historiske data til eksplisitt arkivtabell eller behold modellen med kommentar.
4. Fjern kun modeller som har 0 rader, ingen relasjoner som brukes av aktive modeller, og egen additiv migrasjonsplan.
