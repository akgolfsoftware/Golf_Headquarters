# Workbench — hva som finnes vs veien videre

## HQ-kode (Golf_Headquarters) — domenet er foran UI

`src/lib/domain/workbench/` er rent (ingen Prisma). Allerede der:

| Funksjon | Status i kode |
|---|---|
| Opprett økt (30-min grid, 15 min min) | `createSession` |
| **Gjenta** N uker, `seriesId` | `createSessionSeries` |
| Endre/slett: DENNE / DENNE_OG_FREMOVER / HELE_SERIEN (dato flyttes aldri med) | `RecurrencePolicy` |
| Flytt / resize | `moveSession` |
| Publiser / avpubliser / batch | `publishSession`, `publishMany` |
| Øvelser i økt: add / reorder / remove | ja |
| Uke / måned / år view-modeller + pyramide-budsjett | `buildWeek/Month/YearViewModel` |
| 8 periodetyper på år | `YearPeriodBand` |
| Overlapp = advarsel, ikke sperre | `validateWeek` |
| Gruppeøkt → kopier til medlemmer, lokal override, ikke delta | types + commands |
| Skole/booking/turnering som låste dimmede blokker | `LockedBlock` |
| Kilder: drill, mal, program, forrige uke | `SourceItem` |
| Modus PLAYER / GROUP / AGENCY | `WorkbenchMode` |

`src/lib/workbench/wb-actions.ts` + `WorkbenchV2` (dnd-kit) er UI mot dette. Ikke ferdig produkt-look.

**Ikke i HQ-domenet ennå:** FYS-program som treningsapp (økt 1..n, RIR, plan vs faktisk), lenke serie → program-ID, A–K → vinter/TURN-anbefaling, amatør/proff-tetthet, mål-binding på blokk.

## Grok-flaten nå — tynne skjermer

År: 3 dummy-rader. Periode: månedsliste. Måned: ukeliste. Uke: timegrid. Øktbygger: feil akser. Publiser: tre statuser. Gruppe: lokal merknad. Ingen serie-dialog, ingen programbygger.

## Veien videre (rekkefølge, tidskostnad)

Målet: planlegge år→økt uten å tegne hver mandag på nytt.

1. **Programbygger i bank** (B3) — FYS og golf-program, økt 1..n.  
2. **Serie i ukegrid** — bruk HQ `createSessionSeries` + velg program. Man/ons/fre × 8 uker.  
3. **Live FYS** — plan vs faktisk, +/− serie, RIR, etter økt → kø (B4/B9).  
4. **År-skjerm** — 8 perioder fra `YearViewModel`, ikke dummy. A–K anbefaler vinter-TEK (kø), GolfBox-snitt merket.  
5. **Mål på blokk** (A7).  
6. **Amatør/proff** — samme Workbench, proff ser A–K/perioder/RIR default.

Ikke bygg ny kalender. HQ-operasjonene er motoren. Grok-UI og Agency-look er skallet.
