# TallStepper

Numerisk stepper (− / verdi / +) for telling: reps, sett, treningstimer.

## Når den ikke skal brukes
Når verdien er fri tekst eller et stort tallrom uten naturlig steg (f.eks.
et årstall) — da er kontrollen et tallfelt (`MaaleFelt`), ikke en stepper.

## Kontrakt
- Knappene er 36 px synlig, 44 px ved grov peker (`max()`-gulvet, samme
  mekanikk som `Chip`/`Checkbox`).
- Verdien er alltid `--mono` med tabulære sifre og komma-desimal.
- `−`-knappen deaktiveres ved `min`, `+`-knappen ved `max` — aldri ved en
  treningsregel (invariantene er slettet, 18.08.2026).
- `aria-live="polite"` på tallet så skjermleser fanger endringen uten at
  hele gruppen leses på nytt.

## Målt
Knapp 36,0 px synlig / 44,0 px ved grov peker.
