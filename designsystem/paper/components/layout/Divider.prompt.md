# Divider

Skillelinje, med eller uten mono-etikett.

## Når du skal bruke den

En skillelinje er en **påstand om at to ting hører til ulike grupper**. Har du ikke den påstanden, bruk avstand — `gap` er billigere for øyet enn en strek.

Legitime bruk: seksjonsskift i en lang liste («utsatte saker» under «aktive»), skille mellom artefaktets innhold og handlingen til slutt, loddrett skille i en statuslinje.

```jsx
<Divider label="utsatt" align="start" />
<Divider spacing="tight" />
<Divider vertical />
```

## Regler

- **`ListGroup` har egne skiller mellom rader.** Ikke legg `Divider` mellom `ListRow`-er — du får doble streker.
- Etiketten er `--mono` 9,5/600 versal, samme som `SectionLabel`. Den er en overskrift for det som kommer under, ikke en tittel på selve streken.
- Fargen er alltid `--border`. En skillelinje har ingen semantikk og skal aldri ha tone.
- `spacing="flush"` er for streker som skal sitte tett mot en kortkant; `tight` for tette lister.

## Tilstander

Ingen interaktive tilstander — komponenten er ikke et treffmål og har derfor ikke `--floor` (gulvregel.md avsnitt 3: `--floor: 0` er lovlig når elementet ikke mottar klikk; her finnes variabelen ikke i det hele tatt).
