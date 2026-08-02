ListGroup er `<ul>`-beholderen rundt ListRow, og den eier skillelinjene. En rad tegner aldri sin egen linje — det var nettopp den gjelden StatusCircleRow bar (`border-top` på raden + `:first-child{border-top:0}`).

```jsx
<ListGroup label="Kilder" dataOdId="list-kilder">
  <ListRow title="Google Calendar" meta="Sist synkronisert 07:40" trailing="toggle" toggleChecked onToggle={setGcal} />
  <ListRow title="TrackMan" meta="Ikke koblet" trailing="toggle" toggleChecked={false} onToggle={setTm} />
</ListGroup>
```

- `label` er mono-versaletiketten over gruppen og kobles med `aria-labelledby` — bruk den i stedet for en løs `<span>` over listen.
- `dividers={false}` i korte lister der luften er nok, eller når gruppen ligger i et `Panel` som allerede rammer inn.
- **ListGroup er containeren radene queryer.** `.akhq-lgroup` har `container-type: inline-size`, så ListRow strammer polstring og mellomrom under 380px tilgjengelig bredde uten å vite noe om vinduet. Ligger en rad utenfor en ListGroup, mister den den tilpasningen — i tillegg til å være ugyldig HTML.
- Ligger listen i et `Panel` og radene skal gå til panelkanten, bruk `<Panel flush>`.
- Bare ListRow som barn. Blandet innhold (en fotnote, en knapp) hører utenfor `<ul>` — i `Panel`s `footnote` eller `action`.

## `as="div"` — når en runtime legger en wrapper mellom gruppen og radene

`<ul>` tar kun `<li>` som barn. Legger runtimen en mount-wrapper inn i mellom — som DC-runtimen gjør for hver `<x-import>` som ligger inne i en annen `<x-import>` — blir et `<div>` barn av `<ul>`, og markupen er ugyldig. Da settes `as="div"` på **både** gruppen og radene:

```html
<x-import component-from-global-scope="NS.ListGroup" as="div">
  <sc-for list="{{ rader }}" as="r">
    <x-import component-from-global-scope="NS.ListRow" as="div" title="{{ r.navn }}"></x-import>
  </sc-for>
</x-import>
```

Gruppen blir `<div role="list">`, raden `<div role="listitem">` — samme semantikk for skjermleser, samme container, samme skillelinjer. **Valgt fremfor alternativet** (å rendre radene uten `sc-for`-wrapperen), fordi lister i templates nærmest alltid kommer fra data, og en template som ikke kan bruke `sc-for` på en liste er en template som må skrive radene sine én for én [besluttet 31.07].

Glemmer du `as` på den ene av de to, sier vakten det — begge retninger er dekket.

## Vakten i ListRow

`ListRow` slår opp gruppen med `closest("[data-akhq-lgroup]")`, ikke `parentElement`, nettopp fordi wrapperen over kan ligge i mellom. Den måler også `containerType` på gruppen i stedet for å påstå at containeren mangler — den forrige teksten hevdet at container-spørringene ikke traff, og det var målbart feil i hver DC-template [funn 31.07].

## Skillelinjer og wrappere

Gruppen tegner strekene med tre selektorer: direkte barn, én wrapper, to wrappere. Med bare `>`-varianten forsvant **alle** skillelinjene så snart en `sc-for`-wrapper kom i mellom. Wrapper-varianten teller `:not(:last-child)` på wrapperen, så siste rad forblir uten strek også når hver rad har sin egen.
