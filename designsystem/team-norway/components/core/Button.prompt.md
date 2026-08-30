Handlingsknapp. `primary` (navy) er hovedhandlingen — én per skjerm. `accent` (merkevarerød) er for det sjeldne, tunge valget. `secondary` for alternativer, `ghost` for lav vekt, `onDark` inne i hero.

Alltid pilleform. Ikke bruk `accent` som «slett» — systemet har ingen destruktiv variant; bekreft heller i dialog.

```jsx
<Button variant="primary">Lagre evaluering</Button>
<Button variant="accent" size="lg">Ta ut utøver</Button>
<Button variant="secondary" size="sm">Avbryt</Button>
```