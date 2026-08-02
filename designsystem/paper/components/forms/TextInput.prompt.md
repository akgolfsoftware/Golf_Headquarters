Naken tekstkontroll. Etikett og meldinger kommer fra `FormField`.

```jsx
<FormField label="Spillernavn" hint="Fullt navn som i turneringspåmeldingen." dataOdId="felt-navn">
  <TextInput defaultValue="Øyvind Rohjan" />
</FormField>
```

- Bruk **aldri** uten `FormField`, med ett unntak: der etiketten allerede er gitt av en nabo-overskrift
  som er koblet med `aria-labelledby`. Et felt uten navn er usynlig for skjermleser.
- Grensen mot `Textarea`: én linje mot flere. Skal brukeren skrive en setning, er det `Textarea` —
  et ettlinjefelt som fylles med to setninger er en designfeil, ikke en brukerfeil.
- Sett aldri `aria-invalid` selv. `FormField` setter den fra `error`, og det er koblingen som gjør at
  «ser feil ut» og «annonseres som feil» ikke kan gå fra hverandre.
- `density="sm"` gir 30px. Gulvet på 44px ved berøring gjelder likevel — `sm` er for musflater.

## Bindende beslutninger

**Erstatter `Input`, som er pensjonert.** Bygg nye skjermer mot `FormField` + `TextInput`.
`Input` bar sin egen anatomi og kunne derfor ikke kobles til en ekstern feiloppsummering.
