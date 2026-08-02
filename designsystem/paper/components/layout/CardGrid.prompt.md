CardGrid legger paneler i et rutenett som fyller seg selv. Ingen bredder i skjermen, ingen media queries per side.

```jsx
<CardGrid dataOdId="grid-kpi"><Panel …/><Panel …/><Panel …/></CardGrid>
<CardGrid columns={2} dataOdId="grid-okonomi">…</CardGrid>
```

- Standard er `auto-fill` fra 280px, som gir 1 kolonne i PlayerHQs 430px-spalte og 3 i AgencyOS' hovedspalte uten at siden bestemmer noe.
- `min="wide"` (360px) for kort med graf eller tabell, som blir uleselige under det.
- `columns` bare når antallet er en **beslutning** — to kolonner som skal stå side om side uansett. Da er det forfatterens valg, og det slår tilpasningen.
- Rutenettet setter aldri høyde. Skal kort være like høye, er det `align-items: stretch` (standard) pluss at kortene selv strekker innholdet.
- Ikke bruk CardGrid til rader. En liste av rader er ListGroup.
