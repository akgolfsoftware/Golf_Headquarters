Panel er standardflaten for alt innhold i AgencyOS, PlayerHQ og Workbench. Skriv aldri panel-literalen (`background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow)`) på nytt — bruk Panel.

```jsx
<Panel title="Godkjenninger" action={<a href="#">Se hele køen →</a>}
  footnote="Fire av tolv spillere har avvik verdt en samtale denne uken."
  dataOdId="panel-godkjenninger">
  <StatusCircleRow items={queue} />
</Panel>
```

- `titleLevel` følger skjermens disposisjon, ikke flaten. Default 2. Ligger panelet under en seksjonstittel som selv er h2, sett 3 — men det avgjøres av dokumentets overskriftstre, ikke av om skjermen er AgencyOS eller PlayerHQ.
- Uten `title` rendres Panel som `<div>`. Sett aldri `aria-label` for å «redde» et titteløst panel til `<section>` — har innholdet et navn, skal navnet være synlig.
- `flush` når innholdet er rader som skal ha skillelinjer helt til panelkanten; `bleed` i tillegg når body-innholdet er en fullbredde-graf eller tabell.
- `action` tar **én** ting: én «… →»-lenke (12,5px, `--muted`, ingen understrek), ÉN ghost-knapp, eller én liten kontroll (SegmentControl, PeriodNavigator). Aldri to knapper, aldri primærknapp, aldri knapp + lenke — over 60 skjermer drifter panelhodene ellers til hver sin form. Trenger panelet flere handlinger, hører de i en DropdownMenu bak én ghost-knapp, eller i PageHeader.
- Panel har ingen `state`-prop. Tomtilstand eies av innholdet: datakomponentene tar `state`/`emptyText`, og for panelnivå brukes EmptyState inne i body.
- Ingen venstrekant, ingen fylt aksentflate, ingen farget topplinje. Oransje er reservert OneThingNow.
- Skygge forsvinner av seg selv i mørk modus (`--shadow: none`) — border bærer avgrensningen der.
- **Container-basert, ikke viewport-basert.** Panel ligger i en `container-type: inline-size`-wrapper (`.akhq-panel-wrap`, `display:grid; width:100%`) og strammer polstringen via `@container (max-width:480px)`. Wrapperen må ikke fjernes: uten den kan panelet ikke query sin egen bredde, og et Panel i PlayerHQs 430px-kolonne på en 1440px skjerm ville rendret i bred form. Fordi Panel er avhengigheten under nesten alt annet, ville den feilen blitt arvet av hver komponent som bruker den.
- Terskelen er 480px container, ikke 640px viewport. Omregnet, ikke oversatt: containeren er alltid smalere enn vinduet, og AgencyOS' to-kolonnepaneler (~500–600px) skal *ikke* legge om — bare virkelig smale spalter skal. Under terskelen stables også panelhodet (`--head-dir: column`): tittelen får hele bredden og handlingen legger seg under. Uten det spiser en knapp i hodet bredden fra tittelen, som da brytes midt i en kort tittel («Uke 31» → «Uke» / «31»).
- **Polstring settes som custom property i lag, ikke som konkurrerende regler.** `.akhq-panel` deklarerer `--pad-t/--pad-x/--pad-b` og bruker dem én gang i `padding`. Container-laget endrer bare variablene; `--sm` og `--flush` ligger i modifikatorlaget og vinner uansett kilderekkefølge. Det erstatter `:not(.akhq-panel--flush)`, som løste instansen men ikke klassen: første versjon lot container-regelen slå av `flush` under 480px og ga hodet 32px dobbelt innrykk i PlayerHQ-kolonnen. Legg aldri til en konkurrerende `padding`-deklarasjon her — endre variabelen i riktig lag.
- `--sm` og `--flush` beholder sin polstring i alle bredder. Tetthet er et bevisst valg, ikke noe containeren skal overstyre.
- Ligger Panel i et grid eller flex-oppsett, er det wrapperen som blir barnet. Den strekker seg og panelet fyller den, så `align-items: stretch`-oppførsel er uendret.
