Varsel er meldinga som gjelder hele flaten — bekreftelse, mangel, feil i skjema.

```jsx
<Varsel tilstand="ok" tittel="Vi har fått meldinga di."
        handling={<Knapp variant="tekst">Se juniorgruppene</Knapp>}>
  Du får svar innen én virkedag.
</Varsel>
```

Teksten sier hva som skjer nå, ikke at systemet er glad. Én handling per varsel.
