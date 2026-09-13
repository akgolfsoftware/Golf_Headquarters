# P03 — Plan ny/rediger/flytt, teknisk kontroll 13.09.2026

Gren: `grok/p03-plan-ny-rediger-flytt-2026-09-13`. Ingen visuell portering. Ingen migrasjon, betaling eller utrulling.

## Hva som er prøvd

Testene kaller eksporterte handlinger for de tre øktmodellene. Uvedkommende avvises uten skriving. Flytt bruker den viste uka (`weekOffset` → `weekRefDate` / Oslo-mandag). Ugyldig tittel skriver ikke. Feilet drill-skriving ruller tilbake tittelendringen.

- TrainingPlanSession, spiller: `addWorkbenchSession`, `moveWorkbenchSession`, `updateWorkbenchSession`.
- TrainingPlanSession, coach: `coachAddWorkbenchSession`, `coachMoveWorkbenchSession`, `coachUpdateWorkbenchSession`. Stalltilgang kreves. Økt på annen spiller avvises.
- WorkbenchSession: `createSession` og `moveSession`. Spiller uten eierskap og coach uten stall avvises.

## Tekniske rettinger

`executeSessionUpdate` og `executeSessionMove` lagrer økt og V2-speil i samme transaksjon. Feil etter første skriving lar ikke halvferdig innhold bli stående.

## Isolert testdatabase

Samme begrensning som [P02–P05](plan-live-p02-p05-2026-09-12.md). Innlogget Next-reise er ikke bevis her.

## Ikke påstått

- Innlogget reise, visuell godkjenning, D0 eller lanseringsklar app.
- Caddie i live.
- At alle tre modeller har identisk redigerings-UI.
