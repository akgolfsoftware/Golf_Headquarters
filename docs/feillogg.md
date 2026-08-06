# Feillogg

Format: `<dato> | <hva gikk galt/kostet tid> | <rotårsak> | <regel som hindrer gjentakelse>`
Ingen feil i økten: `<dato> | ren økt`

Én linje per økt der noe kostet ekstra tid. Lagt til av `/pr` ved behov — se `.claude/commands/pr.md`.

2026-08-06 | Pollet `mcp__github__actions_list` gjentatte ganger under PR-overvåking (PR #302); hvert kall returnerte full repo-metadata uansett `minimal_output: true` | Antok webhook-abonnement + egen statussjekk var billig, uten å vite at `actions_list` ikke trimmer responsen | Gotcha lagt i `.claude/rules/gotchas.md`: stol på `<github-webhook-activity>`-hendelser fremfor å polle; bruk `pull_request_read(get_status)` (lett) hvis manuell sjekk trengs
