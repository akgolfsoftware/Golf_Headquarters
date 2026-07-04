# KategoriFjell

«Reisen opp fjellet» — foto-hero der de 11 kategoriene A–K står som markører fra foten til toppen. Klikk en markør → forhåndsvisningskort (score/hcp/volum/CR–Slope) med «Se full profil»-CTA som åpner kategorien i `KategoriStige`.

## Bruk
```jsx
<KategoriFjell
  kategorier={KATEGORIER}            /* samme array som KategoriStige — bruker mx/my */
  bilde="../../assets/imagery/fjell.jpeg"
  onAapneProfil={(id) => setAapen(id)}
/>
```

## Domenefasit
- **A = beste** (toppen); K = foten. Første element i lista er apex — større markør i `--signal`/`--on-signal`.
- Panelet er en **mørk innfelling** (`class="dark"`): mørke tokens re-asserteres, lime-signal er lovlig her uansett sidetema — og fotoet ligger bak mørk gradient-scrim (bildekart-kontrakten: foto aldri i konkurranse med data).
- Alt er token-bygd (`--signal`, `--forest-700`-mixer, `--shadow-popover/-raised`) — null rå hex.
- **Ingen dekorative loops** (kanon): prototypens puls på A er bevisst fjernet; apex bærer størrelse + farge i stedet.
- Uten `bilde` faller panelet til forest-gradient — komponenten er ikke bundet til asseten.

## Interaksjon
Markør = `<button>` (title = nivånavn, focus-ring). Klikk toggler forhåndsvisning; X lukker; CTA kaller `onAapneProfil(id)` — hosten åpner/scroller stigen. Reveal ≤ `--dur-base`, respekterer `prefers-reduced-motion`.

## Tilstander
Tom liste → ærlig «Ingen kategorier å vise ennå.» i panelet · normal (med/uten foto) · forhåndsvisning åpen/lukket.

## Komponerer
Sammen med `KategoriStige` (delt datasett; `onAapneProfil` → `aapen`). Foto: `assets/imagery/fjell.jpeg`.
