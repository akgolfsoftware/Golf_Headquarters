DataTable er radsett med flere sammenlignbare kolonner, der lesningen går nedover i en kolonne.

```jsx
const [sort, setSort] = React.useState({ key: "sg", dir: "desc" });
<DataTable
  caption="Stall · SG totalt siste 5 runder"
  sort={sort} onSort={setSort} dataOdId="panel-stall"
  footNote="Kilde: TrackMan + registrerte runder · oppdatert 31.07.2026 kl. 09:15"
  columns={[
    { key: "navn", label: "Spiller", sortable: true, strong: true },
    { key: "kat", label: "AK-kategori" },
    { key: "runder", label: "Runder", align: "end" },
    { key: "snitt", label: "Snittscore", align: "end", sortable: true },
    { key: "sg", label: "SG totalt", align: "end", sortable: true, tone: (r) => (r.sgTall >= 0 ? "up" : "dn") }
  ]}
  rows={[
    { id: 1, navn: "Øyvind Rohjan", kat: "D", runder: 5, snitt: "74,2", sg: "+2,92", sgTall: 2.92 },
    { id: 2, navn: "Jonas Hveem", kat: "C", runder: 4, snitt: "71,8", sg: "−0,41", sgTall: -0.41 }
  ]} />
```

- **Grensen mot `ListRow`/`ListGroup`:** en liste har én sak per rad — leading, tittel, hale. En tabell har flere kolonner du sammenligner nedover. Har raden bare én verdi, er den en liste, ikke en tabell med én kolonne. Motsatt: presses tre tall inn i en `ListRow`-hale for å ligne kolonner, var det en tabell hele tiden.
- **Grensen mot `KeyValueGrid`:** den viser ETT objekts spesifikasjoner som par. DataTable viser mange objekter som rader.
- **Tall får alltid `align: "end"`.** Den ene verdien setter både høyrestilling og mono med tabulære sifre, slik at sifrene står i lodd nedover kolonnen. Skriv aldri mono på en tallkolonne uten å høyrestille den — da er loddrettheten borte og mono bare et fontvalg.
- **Lukket:** `tone` er `up`/`dn`, ikke fri farge. `dn` er leire, aldri rød — det finnes ingen rød i paletten. Trengs en tredje tone, utvides den i denne filen, ikke på skjermen.
- **Komponenten sorterer ikke.** `sort` + `onSort` er kontrollerte fordi et sett som er større enn siden må sorteres der dataene er. En intern sortering ville vært riktig for de små settene og stille feil for de store.

## Bindende: rullingen bor i komponenten, aldri på siden

`.akhq-dt-scroll` har egen `overflow-x`, og tabellen har `min-width: max-content`. En bred tabell skal aldri kunne skyve sidebredden ut — horisontal rulling på `<body>` ødelegger hele skjermen, ikke bare tabellen. Fjern derfor aldri `min-width: 0` fra wrapperen: uten den nekter grid- og flex-forfedre å la containeren krympe, og overflowen lekker til siden i stedet.

**Målenote (31.07.2026):** `document.documentElement.scrollWidth <= window.innerWidth` ser ut som riktig assertion for dette og er grønn — men den kan ikke bli rød, verdien er klemt til viewporten selv med overflow slått av og tabellen tvunget til 2400 px. Kortet asserterer derfor paret «tabellen er bredere enn containeren» + «computed `overflow-x` på `.akhq-dt-scroll` er `auto`», som begge kan forfalskes. Forfalskningen må sette **begge** akser: er én akse `visible` og den andre ikke, regner CSS `visible` om til `auto`, og en ettakset forfalskning blir en no-op.

## Container-terskel

`@container (max-width: 560px)` strammer celleluften fra 12/10 px til 10/8 px og senker brødteksten til 12,5 px. Tallet er regnet mot **containeren**, ikke vinduet: ligger tabellen i et `Panel`, spiser panelpolstringen 34–38 px, så 560 i containeren svarer til ~600 i spalten. I PlayerHQs 430 px-kolonne er terskelen alltid fyrt.

## Grunnlagslinjen ruller ikke

`footNote` ligger utenfor rullecontaineren med hensikt. Kilde og tidsvindu er en påstand om hele tabellen; ruller den ut av syne sammen med kolonnene, er tallene uten grunnlag akkurat når noen leser dem. Samme resonnement som at deltaer alltid oppgir grunnlaget sitt.

## Tilstander

`loading` gir skjelettrader med kjent geometri — ikke en spinner, og ikke tom tabell. Antall styres av `loadingRows` og skal være det antallet raden vanligvis har, så høyden ikke hopper når dataene kommer. `empty` og `error` fyller én rad over alle kolonner med ekte norsk tekst; «Ingen data» er aldri en tomtekst.
