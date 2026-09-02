Melding er kvitteringen: «Lagret», «Sendt til forelder», «Kunne ikke lagre — prøv igjen». Kort, i fortid, uten utropstegn.

```jsx
<Meldingsstakk meldinger={[{ id: 'a', tekst: 'Rapporten er sendt.', tilstand: 'ok' }]} onLukk={fjern} />
```

- Teksten sier hva som skjedde, ikke at noe skjedde: «Rapporten er sendt», ikke «Suksess».
- ok/info fjernes av den som viste dem, etter 4–6 sekunder. Feil står til brukeren lukker.
- Maks én handling, som tekstknapp: «Angre».
