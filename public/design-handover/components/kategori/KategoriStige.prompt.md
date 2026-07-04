# KategoriStige

A–K-stigen som interaktiv tabell — kategorisystemets kjerne. Klikk en kategori → full profil i fire bånd: **Nivå & bane** → **Anbefalt tidsfordeling** (klikkbar `TidsPyramide`) → **Forventet SG-profil** (`SgKategoriBar`) → **Forventet testnivå**.

## Bruk
```jsx
<KategoriStige
  kategorier={KATEGORIER}   /* A først — se datasettet i kategori.card.html */
  aapen={aapen}
  onAapne={setAapen}
/>
```

## Domenefasit
- **A = beste kategori** (kanon-beslutning) — første element er apex og får `--signal`/`--on-signal`-badge (lys → forest automatisk); øvrige badges er nøytrale (lime-som-ett-anker).
- Seksjoner: «A–D · Topp & elite» / «E–K · Klubb & utvikling» (konfigurerbart via `seksjoner`).
- **«ALLE TALL ER ESTIMAT»** vises som eget merke (`estimat`, default på) — tallene er modellverdier, ikke målinger.
- Terminologi: kolonnen heter **Hcp**; testnivå bruker **Køllehastighet/Ballhastighet**; pyramide-navnene er Fysisk · Teknikk · Slag · Spill · Turnering.
- Mono tabulære tall; tomme baneverdier = ærlig «—».

## Interaksjon
Rad = `<button aria-expanded>`; én åpen kategori om gangen (kontrollert via `aapen`/`onAapne` eller intern, default `A`). Valgt pyramide-nivå deles på tvers av kategorier (som i kildedesignet). Reveal ≤ `--dur-base`, respekterer `prefers-reduced-motion`.

## Tilstander
`loading` (skeleton-rader) · `tomt`/tom liste (onboarding) · normal (lukket/åpen).

## Komponerer
`TidsPyramide` (bånd 2) + `SgKategoriBar` (bånd 3). Deler datasett med `KategoriFjell` — koble `KategoriFjell.onAapneProfil` → `aapen` for «Se full profil»-flyten.
