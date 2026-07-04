Datovelger; bruk for bookinger, økt-planlegging, turneringsdatoer og wizarder.

```jsx
<DatePicker value={dato} onChange={setDato} />
<DatePicker defaultValue="2026-07-14" min="2026-07-01" max="2026-12-31" />
<FormField label="Turneringsstart"><DatePicker value={dato} onChange={setDato} /></FormField>
```

- **value/onChange** (kontrollert) eller **defaultValue** (ukontrollert) — alltid ISO `"YYYY-MM-DD"`.
- **min/max**: valgbart datointervall; dager utenfor er deaktivert.
- Norsk locale: mandagsstart, «ma ti on to fr lø sø», visning `14. jul 2026`.
- Tastatur: piltaster flytter dag, PgUp/PgDn måned, Enter velger, Escape lukker.
- I dag markeres med lime-prikk; valgt dag får primary-fill. Mono/tabular på tall.
- Størrelser: `md` (40px, default) · `sm` (32px). `error` for ugyldig-ramme (melding via FormField).
