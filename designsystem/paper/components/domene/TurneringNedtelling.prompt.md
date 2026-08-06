# TurneringNedtelling

Dager igjen. Konsumenten regner — komponenten teller aldri selv.

```jsx
<TurneringNedtelling daysLeft={12} name="Srixon Tour #4"
  meta="Miklagard · 15.–16. august" deadlineLabel="8. august"
  dataOdId="neste-turnering" />
```

- `daysLeft` regnes av KONSUMENTEN med appens Oslo-korrekte datologikk —
  komponenten kaller aldri `new Date()` (tidssonefellene i gotchas).
- Ved 0 dager: «I dag» i `--up` — turnering er sesongens toppunkt, samme
  tone som TURN i SessionCard/Periodeplan. Ellers blekk.
- Entall/flertall håndteres («1 dag igjen» / «12 dager igjen»).
- Påmeldingsfristen er informasjon — aldri en nedtelling til panikk, og
  aldri en sperre.
- Ren visning: påmelding og reiseplan bor i turneringsplanleggeren.
- Chromeless: flaten eies av `Panel` (K2 avventer Anders).
