Pagination er sidevis navigasjon i et sett som er for stort for én side.

```jsx
const [side, setSide] = React.useState(1);
<Pagination page={side} pageCount={12} onChange={setSide}
  totalLabel="248 økter · side 4 av 12" dataOdId="nav-okter" />
```

- Vinduet er fast: første, siste, gjeldende og én nabo på hver side. Utelatelser markeres med … og er `aria-hidden` — de er en opplysning om at det finnes mer, ikke et treffmål.
- Retningsknappene har tekstlig navn («Forrige side» / «Neste side»), ikke bare chevron. Et ikon alene er ikke et navn.
- `totalLabel` bærer posisjonen i klartekst og står først i rekken. Uten den må brukeren utlede hvor i settet han er fra hvilket tall som er fylt.
- **Grensen mot `Stepper`:** Stepper viser hvor i en *flyt* du er, Pagination hvor i et *datasett*. Stepper har rekkefølge med mening; sider har bare rekkefølge.

## Bindende: når paginering IKKE skal brukes

**Uendelig liste slår paginering på en stall, en øktliste og en kø.** Alle tre leses som «hva finnes», ikke som «hva står på side 4». Et sidetall er bare nyttig når brukeren kan huske og gjenfinne det — det gjelder rapporter, kontobevegelser, arkiv og søkeresultater, altså sett der en rad har en stabil plass over tid.

Testen: kan raden bytte side i morgen uten at noe endret seg for brukeren? Da er sidetallet en tilfeldighet, og lista skal hente flere i stedet. Konsekvensen av å velge feil er stille: pagineringen fungerer, men brukeren blar gjennom åtte sider for å finne en spiller han vet finnes, i stedet for å rulle eller søke.

Spesielt: **paginering hopper aldri over et filter.** Er lista filtrert, skal `page` tilbake til 1 når filteret endres — ellers står brukeren på side 7 i et sett med tre sider og ser en tom liste som ser ut som en feil.

## Container-terskel

`@container (max-width: 380px)` skjuler sidetallene og lar forrige/neste + `totalLabel` stå igjen. Tallet er regnet mot containeren: i PlayerHQs 430 px-kolonne minus panelpolstring er terskelen fyrt, og en sifferrekke som brytes over to linjer leses uansett ikke som paginering. `simple` gjør det samme permanent, uavhengig av bredde.
