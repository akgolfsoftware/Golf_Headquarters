EmptyState er tomtilstanden på panel- og sidenivå: tittel, forklaring, og en handling hvis brukeren kan gjøre noe med det.

```jsx
<EmptyState title="Ingen runder logget ennå"
  action={<Button dataOdId="cta-logg-runde">Logg første runde</Button>}>
  Når du legger inn en runde, ser du snittscore og SG-utvikling her.
</EmptyState>
```

## Bindende: «ingen data ennå» og «ikke bygget ennå» er ikke samme tilstand

**EmptyState dekker kun den første.**

**«Ingen data ennå» — legitim, permanent, brukervendt.** Skjermen er ferdig; det finnes bare ingenting å vise akkurat nå, og det kan endres av brukeren eller av tiden. Eksempler:

- Godkjenningskøen er tom — alt er behandlet.
- Ingen runder logget ennå på en ny spiller.
- Periode uten planlagte økter.
- Søk uten treff i stall.
- Uke uten registrerte tall fra TrackMan.

Disse skal ha ekte norsk tekst som peker mot neste handling, aldri «Ingen data». En tom kø er dessuten ofte en *god* nyhet — skriv den slik: «Ingenting venter på deg. Køen er tom.»

**«Ikke bygget ennå» — byggestatus, ikke datatilstand.** Minst ni skjermer i fasiten har faner eller seksjoner som sier at funksjonen er utsatt til implementasjon: agenticos, booking, drift, kalender, ko, okonomi, plan, stall-plus. Det er informasjon om *prosjektet*, ikke om brukerens data.

**Den tilstanden skal ikke ha en komponent i biblioteket.** Ingen `<EmptyState variant="kommer">`, ingen `ComingSoon`, ingen «under arbeid»-plassholder. Grunnene:

1. Skjermene får faktisk innhold i Fase C. En komponent for mellomtilstanden ville bli bygget for å dø, og i praksis overleve.
2. En plassholder som finnes, blir brukt. Første skjerm som mangler innhold, strekker seg etter den, og da er grensen borte.
3. Byggestatus hører i `kart/`, som et åpent punkt eier kan prioritere — ikke som et designet element som ser ferdig ut.

Fram til Fase C er «ikke bygget» derfor et punkt i `kart/`, ikke et element på skjermen. Trenger en skjerm å si det til en ekte bruker i mellomtiden, er det en `Banner` med `tone="info"` skrevet som driftsmelding — en midlertidig beskjed, ikke en tomtilstand.

## Grensen mot Region og Callout

- **Region** (i `components/data/viz.jsx`) eier tomhet på komponentnivå: inne i en graf, en KPI, en rad. Én tekstlinje, ingen tittel, ingen handling.
- **EmptyState** eier panel- og sidenivå: tittel + forklaring + valgfri CTA.
- **Callout** har ingen «tom»-tone og skal ikke få en. Var den oppført tidligere, er det rettet.

## Øvrig

- Forklaringen er i praksis påkrevd — komponenten advarer i konsollen hvis den mangler. En tittel alene sier hva som ikke finnes, ikke hva brukeren kan gjøre.
- `action` bare når brukeren faktisk kan gjøre noe. En tom kø trenger ingen knapp; en tom rundeliste gjør det.
- `align="start"` i sidespalte, inspektørpanel og lister der sentrert tekst bryter venstrekanten. `center` i panel og på side.
- Ikonet er dempet i en `--soft` sirkel og aldri i tonefarge. Tomhet er ikke en advarsel.
- **Container-terskel 420px** på `.akhq-estate-wrap`: under den strammes polstringen fra 34/24 til 26/16. Regnet mot wrapperen, ikke spalten — et panel i en 430px kolonne gir ~397px wrapper (fyrer), en 500px kolonne gir ~462 (fyrer ikke), og to paneler side om side i 860px gir ~389 hver (fyrer). Terskelen ligger altså mellom 430- og 500-kolonnen.
- **Klasseprefikset er `akhq-estate`, ikke `akhq-empty`** — `.akhq-empty` er okkupert av `Region` i `components/data/viz.jsx`, og den regelen er ulagret. Ulagrede regler slår lagrede uansett spesifisitet, så `@layer akhq-base` ville tapt stille. Ikke døp om.
