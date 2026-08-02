KeyValueGrid er label/verdi-par for spesifikasjoner og metadata — `<dl>` med `<dt>`/`<dd>`, nøkkel i `--muted`, verdi i mono med `tabular-nums`.

```jsx
<KeyValueGrid items={[
  { key: "Periodetype", value: "Spesialisering", mono: false },
  { key: "Varighet", value: "6 uker" },
  { key: "Økter per uke", value: "4" },
  { key: "Sist endret", value: "27.07.2026" }
]} />
```

## Bindende: KeyValueGrid er ikke for tabulære finansdata

I fasiten er `.stat-line` brukt **126 ganger i `okonomi.html` alene**, til fire forskjellige jobber. **Bare den første er KeyValueGrid:**

1. **Enkel nøkkel/verdi** — «Organisasjonsnummer», «Varighet: 6 uker», «Sist synkronisert 07:40». → **KeyValueGrid.**
2. **Resultatregnskap med hierarki** — `is-head` / `is-section` / `is-total`, der rader har nivå, grupperer under hverandre og summerer. → **LedgerTable** (Familie 4).
3. **Budsjettavvik med fargekodet prosent** — faktisk mot budsjett, avvik i `--up`/`--dn` etter terskel. → **BudgetVarianceRow** (Familie 4).
4. **Kontobevegelser** — dato, tekst, beløp, saldo i kolonner med sortering. → **DataTable** eller **LedgerTable** (Familie 4).

**Ikke utvid KeyValueGrid til å dekke 2–4.** Ingen `variant="total"`, ingen `level`-prop, ingen fargekodet verdi, ingen sorterbare kolonner. Grunnen er konkret, ikke prinsipiell: gjør vi det, bygges `okonomi` på feil primitiv — hierarkilogikk og fargekoding presset inn i en komponent som ikke er laget for det — og LedgerTable blir aldri bygget fordi «vi har allerede noe som funker».

Det er samme feilklasse som `StatusCircleRow`, som løste ListRow-jobben godt nok til at ListRow ikke ble bygget før nå. En komponent som dekker nabojobben halvveis, er dyrere enn ingen komponent.

**Testen:** har radene innbyrdes struktur (nivå, sum, gruppe) eller semantisk farge på verdien, er det ikke KeyValueGrid. Er hver rad uavhengig av de andre og verdien bare en verdi, er det KeyValueGrid.

## Øvrig

- `columns={2}` i bredt panel, `1` i sidespalte. Containeren legger selv om til én kolonne under 420px tilgjengelig bredde — ikke sett `columns={1}` for å «hjelpe» den på mobil.
- `layout="stack"` når verdiene er lange (adresser, fritekst, lister). Inline med lang verdi presser nøkkelen i knas.
- `mono: false` per par når verdien er tekst og ikke et tall. Standard er mono, fordi de fleste verdiene her er tall, datoer eller koder.
- **Verdien kan krympe og brytes** (`flex: 0 1 auto`, `min-width: 0`, `overflow-wrap: anywhere`). Med `flex: none` kunne en lang tekstverdi — en kommaliste med komponentnavn, en adresse — stikke ut av sin egen kolonne og gi hele dokumentet horisontal scroll. Er verdien konsekvent lang, bruk `layout="stack"` for lesbarhet; men komponenten skal ikke kunne overflyte containeren i `inline` heller.
- `dividers={false}` i korte sett på tre par eller mindre, der linjene blir støy.
- **Samme skillelinjekonvensjon som ListGroup: siste rad har ingen strek.** Settet lukkes ikke. Asymmetrien to kolonner gir med naiv `:not(:last-child)` — der bare den ene kolonnens siste rad mister streken — er løst strukturelt, ikke ved å innføre en motsatt konvensjon: `:last-child` pluss `:nth-last-child(2):nth-child(odd)` treffer hele siste rad, og `--pen` slår det andre leddet av når gridet står i én kolonne. Én konvensjon å huske for alle listelignende komponenter. Gjelder også StatLine, ActivityLog og resten av spec-familien når de kommer.
- Nøkkelen er ikke en overskrift. Trenger settet en tittel, står den i `Panel title` eller `SectionHeader`.
