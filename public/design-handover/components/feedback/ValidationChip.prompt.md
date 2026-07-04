# ValidationChip / ValidationGroup

The canonical Inspector chip: a row of value-pills wrapped in a group carrying
one of the three CANON anbefalingstilstander — **ren** «Innenfor anbefaling» (stille,
no edge) · **myk** «Avviker fra anbefaling» (synlig chip, warning-amber, klarspråk-
forklaring) · **hard** «Sterkt avvik» (tydeligere chip, error-red + coach-varsel-event).
ID-ene `ren`/`myk`/`hard` er fagkoder og endres aldri; UI-språket er klarspråket over.
**Ingenting blokkeres, ingenting krever begrunnelse** (kanon: anbefalinger, aldri sperrer).

## Bruk
```jsx
<ValidationGroup
  label="CS-nivå"
  state="hard"
  message="CS20 < CS50 påkrevd for ballkontakt-drill."
  readerMessage="Denne økta er satt for enkel for slag-trening."
  canOverride
  rolle={role}   {/* "coach" (default) · "spiller" */}
  onOverride={(reason) => save(reason)}
>
  {["CS50","CS60","CS70","CS80"].map(v => (
    <ValidationChip key={v} label={v} active={v === current} onClick={() => setCurrent(v)} />
  ))}
</ValidationGroup>
```

- Never invent a 4th state or use `MEN`/`MENTAL`/`TAK` — not in the AK-formel axis set.
- The edge color animates in/out (`--dur-slow`), never cuts hard between states.
- `overridden` (LEGACY-prop, utfaset i UI) renders «Bevisst avvik · «notat»» — ingen
  begrunnelse kreves lenger; `canOverride`-flyten skal ikke brukes i nye flater.
- Read-only viewers (forelder) see `readerMessage` and a "lese" mark.
- **rolle** styrer klarspråket: `coach` (default) ser teknisk melding; `spiller` ser
  `readerMessage`. Ved sterkt avvik varsles coach automatisk — det er informasjon,
  aldri sperre.
