ThemeToggle er en pille i mono som viser gjeldende modus og bytter den.

```jsx
<ThemeToggle storageKey="akhq-theme-playerhq" />
```

- **Nøkkelen er per flate:** `akhq-theme-agencyos` og `akhq-theme-playerhq`. En trener som jobber mørkt i AgencyOS skal ikke tvinge spillerens PlayerHQ mørkt.
- `aria-pressed` bærer tilstanden. Teksten sier hvilken modus som er **aktiv nå** («Mørk» når mørk er på) — ikke hva knappen vil bytte til. Det er den lesningen som stemmer med `aria-pressed`.
- Moduser er likeverdige. Ingen sol/måne-ikon, ingen animert overgang mellom dem — prikken er blekk i begge.
- Har skjermen en Topbar, bruk dens innebygde bytter. To byttere på samme side som skriver til samme nøkkel kommer ut av synk.
- Skriver til localStorage, som er tillatt her fordi det er brukerens uttrykte modusvalg — i motsetning til Banner, som ikke finner opp nøkler.
