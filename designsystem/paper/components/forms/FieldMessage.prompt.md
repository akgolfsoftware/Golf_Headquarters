Meldingen under et felt — hjelpetekst eller feil. Én eier, så feilen ser lik ut uansett hvor den står.

```jsx
<FieldMessage tone="feil" id="skjema-oppsummering">Skjemaet har én feil som må rettes.</FieldMessage>
```

- `FormField` rendrer den selv fra `hint`/`error`. Opprett den direkte **kun** når meldingen skal stå
  utenfor et felt — typisk en samlet feiloppsummering øverst som fokus flyttes til ved innsending.
- Grensen mot `Callout` og `Banner`: de bærer en hendelse med egen flate og tone. FieldMessage er ren
  tekst som hører til en kontroll. Trenger meldingen bakgrunn, er det ikke denne.
- `tone="feil"` gir `role="alert"`. Bruk den ikke til noe som ikke er en feil — da leses den opp
  uoppfordret, og varselet mister verdi.

## Bindende beslutninger

**Fargen er `--dn`, aldri rød.** Målt: `rgb(168, 85, 54)`. Det er hele bibliotekets negative tone.
