Avatar er initialer i sirkel — mono, `--soft`-fyll, `--muted`-tekst. Ingen farger per person, ingen genererte bakgrunnsfarger: papir og blekk holder også her.

```jsx
<Avatar name="Emma Berg" decorative />          // i en ListRow der navnet står ved siden av
<Avatar name="Anders Kristiansen" size="sm" tone="ink" />   // innlogget bruker i Topbar
<Avatar initials="G16" size="lg" tone="outline" />          // lag, ikke person
```

- `decorative` i lister og rader (navnet står som tekst rett ved) — ellers leser skjermleseren navnet to ganger. Står avataren alene, dropp den og få `role="img"` + `aria-label`.
- `Avatar.initials(name)` er tilgjengelig som statisk hjelper når initialene trengs uten sirkelen (`Avatar.initials("Emma Berg") // "EB"`). Verifisert på norske navn: tre ledd tar første + siste («Markus Roinas Pedersen» → MP), mellomnavn ignoreres, æøå bevares i versal («Øystein Ødegård» → ØØ), bindestrek behandles som ett ledd («Anne-Lise Berg» → AB), ettordsnavn tar to første tegn («roinas» → RO), én bokstav gir én bokstav, tomt navn gir tom sirkel.
- Bilde (`src`) rendres med `alt=""` fordi navnet allerede er tilgjengelig via label eller nabotekst.
- 36px er radstandarden — samme mål som statussirkelen i StatusCircleRow, så rader med og uten avatar får identisk høyde og `36px minmax(0,1fr) auto`-rutenett.
- Bruk aldri Avatar til status. Statussirkel = StatusCircleRow, statusmerke = StatusBadge.
