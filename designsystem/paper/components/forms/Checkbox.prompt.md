Avkrysningsboks med etiketten ved siden av. Hele raden er klikkbar.

```jsx
<FormField label="Varsler" hint="Gjelder kun denne spilleren." dataOdId="felt-varsler">
  <div style={{ display: "grid", gap: 6 }}>
    <Checkbox label="Varsle ved nytt testresultat" defaultChecked dataOdId="felt-test" />
    <Checkbox label="Varsle ved avvik fra ukeplan" dataOdId="felt-avvik" />
  </div>
</FormField>
```

- Etiketten står **ved siden av** boksen, ikke over. Derfor arver den ikke FormFields kolonne —
  den er en kontroll som inkluderer sin egen etikettplassering.
- Flere valg under én overskrift: legg dem inne i **én** `FormField` som gir gruppen navn. Ikke gi
  hver avkrysningsboks sin egen `FormField` — da får du fire overskrifter og ingen gruppe.
- Grensen mot `Toggle`: `Toggle` slår noe på eller av med umiddelbar virkning. `Checkbox` velger noe
  som lagres når skjemaet sendes. Er det ingen «lagre»-knapp, er det sannsynligvis `Toggle`.
- Grensen mot `SelectableRow`: den velger en rad i en liste. Denne velger et alternativ i et skjema.

## Bindende beslutninger

**Avkrysset boks bruker `--fg`, ikke `--accent`.** Oransje har monopol på «Én ting nå» og fokus.
En avkrysset boks er en tilstand, ikke en handling — den skal ikke konkurrere om oppmerksomheten.
