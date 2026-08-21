# MaaleFelt

Tallfelt med enhetsetikett og forklaringslinje: rangelengde i meter, maks
puttelengde i fot.

## Når den ikke skal brukes
Telling (reps, sett, treningstimer i faste steg) — bruk `TallStepper`. Denne
er for et fritt, presist mål spilleren selv leser av og taster inn.

## Kontrakt
- Fri numerisk inntasting (`type="number"`, `inputMode="decimal"`) — ingen
  stepper-knapper. Anleggsmål er ikke noe man teller seg fram til.
- Enheten står inni feltet til høyre, `aria-hidden` — den leses av
  `aria-describedby`-hjelpeteksten i stedet, ikke dobbelt opp for
  skjermleser.
- Feilmelding erstatter hjelpeteksten og setter `aria-invalid`; de vises
  aldri samtidig.
- Radhøyden er 44 px gulv uansett peker (samme begrunnelse som `DagVelger`
  — dette er en engangs-inntasting i onboarding, ikke et hyppig grep-felt).

## Målt
Feltrad 44,0 px min-høyde.
