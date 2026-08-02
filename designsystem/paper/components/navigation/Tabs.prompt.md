Tabs er navigasjon mellom paneler på samme side: 2px blekk-understrek på aktiv fane, ingen spor.

```jsx
const [fane, setFane] = React.useState("resultat");
<Tabs label="Økonomi" value={fane} onChange={setFane} dataOdId="nav-okonomi" tabs={[
  { id: "resultat", label: "Resultat" },
  { id: "budsjett", label: "Budsjett", count: 3 },
  { id: "konto", label: "Kontobevegelser" }
]} />
<TabPanel tabsId="akhq-tabs1" id="resultat" active={fane === "resultat"}>…</TabPanel>
```

## Tabs vs SegmentControl — to komponenter, også visuelt

- **Tabs** = navigasjon. `role="tablist"`/`role="tab"`, `aria-selected`, kobling til `role="tabpanel"`, piltaster mellom fanene og bare aktiv fane i tab-rekkefølgen (roving tabindex). Visuelt: **2px understrek, ingen spor.**
- **SegmentControl** = eksklusivt valg av en verdi (filter, modus, formål). `aria-pressed`. Visuelt: **`--soft`-spor med aktivt segment i `--surface`.** API: `options={["Uke","Måned","År"]}` — en array av **strenger**, der verdi og etikett er samme tekst. Ikke objekter med `{value,label}`.

Bytt dem aldri om, og gi dem aldri hverandres utseende. Sagt annerledes: endrer klikket *hva du ser*, er det Tabs; endrer det *hva du har valgt*, er det SegmentControl.

## Regler

- Faneraden ruller horisontalt uten synlig rullefelt når den ikke får plass — fanene krymper ikke og teksten brytes ikke.
- `count` er mono og gjelder antall i fanen, ikke en verdi.
- Bare aktiv fane har `tabIndex=0`; piltaster + Home/End flytter mellom dem. Tab hopper ut av faneraden til panelet — det er tastaturmønsteret for faner, i motsetning til dialoger.
- `TabPanel` rendrer ingenting når `active` er false. Skjulte faner skal ut av tilgjengelighetstreet, ikke bare være visuelt borte — samme krav som for PageHeader i tilstandsmaskiner.
- Elleve faner (okonomi) er for mange for én rad på mobil. Der hører de i en DropdownMenu eller en gruppert liste, ikke i en rullende faneremse.
- **Klassene heter `.akhq-itab` / `.akhq-itab-n`** (in-page tab), ikke `.akhq-tab` — det navnet er okkupert av `TabBar`, PlayerHQs bunnavigasjon, og den filen er ulagret. Med `.akhq-tab` arvet fanene bunnavigasjonens kolonnegeometri og mistet understreken. Ikke døp om tilbake.
