# Skeleton

Laster-figur med kjent form. Fire varianter: `block`, `text`, `circle`, `number`.

## Forholdet til `Region`

**Bruker du en dataregion, bruk `Region`** — den eier alle fire datatilstandene (fylt, tom, laster, feil) og 21 komponenter arver dem derfra. `Skeleton` er for det `Region` ikke dekker: en enkelt figur inne i en komposisjon, en avatar i en rad som lastes, et mono-tall i en KPI-celle.

```jsx
<Skeleton variant="text" lines={3} />
<Skeleton variant="circle" height={28} />
<Skeleton variant="number" />
```

## Regler

- **Samme geometri som innholdet den erstatter.** Er avataren 28 px, er skjelettet 28 px. Ellers hopper flaten når data kommer, og hoppet er verre enn ventingen.
- **Aldri som tom tilstand.** «Ingen data ennå» er en legitim tilstand med egen tekst (`EmptyState`, `Region`) — et skjelett som aldri fylles er en løgn om at noe er på vei.
- Pulsen er `akhq-skel` fra `data/viz.jsx`. Ingen ny animasjon innføres; `prefers-reduced-motion` slår den av.
- `role="status"` + `aria-label="Laster"` — skjermleseren skal si at det lastes, ikke lese tre tomme bokser.

## Tilstander

Én tilstand (laster), pluss redusert bevegelse. Ikke et treffmål — ingen `--floor`.
