# Feillogg

Format: `<dato> | <hva gikk galt/kostet tid> | <rotårsak> | <regel som hindrer gjentakelse>`
Ingen feil i økten: `<dato> | ren økt`

Én linje per økt der noe kostet ekstra tid. Lagt til av `/pr` ved behov — se `.claude/commands/pr.md`.

2026-08-06 | Pollet `mcp__github__actions_list` gjentatte ganger under PR-overvåking (PR #302); hvert kall returnerte full repo-metadata uansett `minimal_output: true` | Antok webhook-abonnement + egen statussjekk var billig, uten å vite at `actions_list` ikke trimmer responsen | Gotcha lagt i `.claude/rules/gotchas.md`: stol på `<github-webhook-activity>`-hendelser fremfor å polle; bruk `pull_request_read(get_status)` (lett) hvis manuell sjekk trengs

2026-08-07 | `mcp__github__actions_list` (`list_workflow_runs`) sprengte kontekstgrensen (415k tegn) selv med `per_page: 5` — parameteren ble ignorert, 30 kjøringer returnert | Kjørte kallet selv om gotcha-en fra 06.08 allerede advarte mot det; det finnes ingen lett variant for «siste workflow-kjøring» | Trenger du kjøringsoversikt: la kallet feile til fil og parse den med `python3 -c "json.loads(...)"`, eller bruk `pull_request_read(get_check_runs)` per PR — aldri les `actions_list`-responsen rått
