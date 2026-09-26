# Øvelsesbank

Kanonisk hjem for alle drills i AK Golf-systemet. AK Golf HQ (appen) henter drills
**herfra** — aldri omvendt. Seed-filene i `akgolf-hq/prisma/seed-data/` er historisk
opphav og skal fases ut som kilde.

## Regler (bindende, satt av Anders 2026-08-03)

1. **Ingen drill, øvelse eller test er gyldig uten AK-formel v2** fra appens system:
   19 områdekoder, putting i fot, golfslag i meter, FYS/BANE uten avstandsenhet.
2. **Kun Anders godkjenner.** Ingen drill flyttes fra `kandidater/` til `godkjent/`
   uten hans eksplisitte godkjenning. AI fabrikkerer aldri drills.
3. **All endring her synces til akgolf-hq** som del av samme oppgave.

## Struktur

| Mappe/fil | Rolle |
|---|---|
| `kandidater/` | 895 drills importert fra akgolf-hq seed-data 2026-08-03. IKKE fasit. Mangler godkjent AK-formel v2 og kan inneholde gamle kategorier. |
| `til-godkjenning/` | Arbeidsbatcher med foreslått AK-formel v2. Ikke fasit. |
| `godkjent/` | Driller, øvelser og tester Anders har godkjent, med gyldig AK-formel v2. Dette er fasiten agentene bruker. Første to puttingbatcher har 16 godkjente elementer. |
| `plan-inntak-og-godkjenning.md` | Hele flyten: inntak, formel-påføring, godkjenning, sync, og hvordan agenter finner nye øvelser. |
| `kandidater/drill-qa-rapport.md` | QA-status ved import: 0 feil, 16 advarsler (13 mangler skillArea; FYS 4,9 % og TURN 3,7 % tynt dekket; 77,9 % BLOKK-skjevhet). |

## Forhold til `knowledge/entities/drills.json`

`drills.json` forblir historisk/tom. `godkjent/` er nå kilden for Anders-godkjente
driller, øvelser og tester. Appens Masterbrain-bro leser `godkjent/`, ikke gamle
seed-filer eller kandidatfiler. Eval-dimensjonen `drill_exists` kan kobles mot
`godkjent/` når holdout-casene oppdateres til konkrete godkjente id-er.

## Validering

```bash
python3 scripts/validate-ovelsesbank.py
```

Validatoren stopper godkjente elementer som mangler appens AK-formel v2-akser,
bruker gamle kategoriverdier som `L`, peker på ugyldige områdekoder, eller mangler
fasilitetsprofilen som hindrer at appen anbefaler øvelser spilleren ikke kan gjøre
der han faktisk trener. Den viktigste fasilitetsverdien er `longestShotM`: lengste
slag/rull/kast øvelsen krever.
