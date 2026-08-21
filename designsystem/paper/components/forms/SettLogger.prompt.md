# SettLogger

FYS-serielogging i live-økta: reps + vekt → «Logg sett» → settliste.

## Når den ikke skal brukes
Golf-drills (slag-reps) bruker `TallStepper`/`HurtigTapper` direkte — vekt-
dimensjonen finnes bare i FYS-øvelser.

## Kontrakt
- Reps/vekt vises som lest verdi; selve justeringen skjer i to `TallStepper`
  rundt denne komponenten (unngår dobbel eierskap av tallet).
- «Logg sett» er en solid blekk-knapp (`--fg`/`--surface`, ikke `--accent`)
  — det er en gjentagbar handling per sett, ikke «Én ting nå».
- Hvert loggede sett kan fjernes; ingen bekreftelsesdialog — feillogging i
  en treningsøkt skal være billig å rette.
- Vekt formateres alltid med komma-desimal og hardt mellomrom foran «kg».

## Målt
«Logg sett» og fjern-knapp 36 px / 24 px synlig, 44 px ved grov peker.
