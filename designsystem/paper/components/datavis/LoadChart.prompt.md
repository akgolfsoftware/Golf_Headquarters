# LoadChart

Belastning mot et anbefalt vindu. Flagger, sperrer aldri.

```jsx
<LoadChart min={5} max={8} note="vindu 5–8 t · GRUNN-perioden" dataOdId="belastning-host"
  items={[
    { label: "u29", value: 6, display: "6,0 t" },
    { label: "u30", value: 9.5, display: "9,5 t" },
    { label: "u31", value: 4, display: "4,0 t" },
    { label: "u32", value: 7, display: "7,0 t" },
  ]} />
```

- Grensen mot `BudgetBar` (calendar): BudgetBar eier DENNE ukens budsjett i
  Workbench, med invariantbrudd og «overstyr med begrunnelse». LoadChart er
  HISTORIKKEN — mange perioder, ingen handlinger.
- Grensen mot `BarChart`: har verdiene et anbefalt vindu, er det LoadChart;
  en enkel benchmark-linje er BarChart.
- Toner: innenfor = `--up-raw`, over taket = `--dn` (leire, aldri rød),
  under minimum = `--mid`. Å ligge under er ikke farlig — det er utenfor
  anbefalingen, og grå sier akkurat det.
- Vinduet er `--soft` med stiplede kanter BAK søylene — rammen er kontekst,
  ikke innhold.
- Invariant 1 gjelder: komponenten viser aldri sperretekst. Aldersregelen og
  TEK-andelen håndheves som ANBEFALING i konsumenten (CANON eier reglene).
