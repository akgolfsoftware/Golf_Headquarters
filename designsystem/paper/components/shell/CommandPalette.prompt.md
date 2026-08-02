# CommandPalette

S6 «Alt». ⌘K på desktop, egen bunnfane på mobil. Indeks over ~100 funksjoner.

## Hvorfor

Uten den er hundre funksjoner en meny ingen leser. Paletten erstatter global-search og er den eneste flaten som kan liste alt uten å bygge et navigasjonstre nummer to.

## Nivåmerket er poenget

Hver rad bærer `level`: **1 samtale · 2 artefakt i panel · 3 full flate**. Merket sier hva som kommer til å skje når du trykker — om du havner i en samtale, får et dokument i panelet, eller mister flaten du står på. Uten det er paletten en gamble.

Merket er `StatusBadge kind="tag"`, altså permanent fargeløst. Nivå er ikke status.

## Bruk

```jsx
<CommandPalette open={åpen} onClose={() => setÅpen(false)} triggerRef={knapp}
  items={[
    { id: "emma-plan", label: "Emma Sæther · ukeplan", group: "artefakter", level: 2 },
    { id: "wb", label: "Planlegg uke i Workbench", group: "flater", level: 3, keywords: "workbench ukeplan dra" },
    { id: "publiser", label: "Publiser ukeplan …", group: "handlinger", level: 1 }
  ]}
  onPick={(it) => gåTil(it)} />
```

## Regler

- **Rekkefølgen i `items` er relevans, ikke alfabet.** Grupperingen bevarer kildens rekkefølge; komponenten sorterer aldri om.
- **Fokuskontrakten er delt kode.** Paletten konsumerer `useOverlayLayer` med `modal: true` — den skriver ingen egen fokusfelle. Escape lukker øverste lag, fokus går tilbake til utløseren.
- **Piltaster + ⏎ er primærinteraksjonen** på desktop; `aria-selected` følger både tastatur og mus, og musen overtar utvalget ved hover slik at de to aldri peker på ulike rader.
- **Tom tilstand foreslår neste trekk** («prøv et spillernavn, et ukenummer eller et selskap»), den konstaterer ikke bare fravær.
- **`keywords`** er der for gamle navn: søker du «TidsGrid» skal du finne Kalender.

## Tilstander

default · hover · active · focus-visible (innoverskutt outline, så den ikke klippes av `overflow`) · valgt rad (`aria-selected`) · tom · lukket. Gulv 44 px på radene ved grov peker; inputfeltet er 52 px allerede.
