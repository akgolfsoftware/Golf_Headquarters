# Steg 5 — kontroll før porting av byggeklossene

**Skrevet:** 03.08.2026 · **Endrer ingen kode.** Dette er en opptelling og en korreksjon.

Alle tall under er målt i repoet på `feature/paper-port-steg4`. Ingen anslag.

---

## Kortversjonen

**Planens steg 5 peker på feil mappe.** `docs/port/plan-designport-alle-skjermer.md` steg 5 sier
«knapper, kort, felt, tabeller, overskrifter, lister» — underforstått `src/components/ui/`, de 21
primitivene CLAUDE.md kaller komponentbiblioteket. Målt:

| Hva | Filer som importerer det |
|---|---:|
| `src/components/v2/` | **708** |
| `src/lib/v2/tokens` (`T`-objektet) | 202 |
| `src/components/ui/` | **15** |

`src/components/ui/` er i praksis ute av bruk. Porter man den, endrer 15 filer utseende. Porter man
`v2/`, endrer 708 filer utseende. **Hevstangen ligger i `v2/`, ikke i `ui/`.**

---

## Den gode nyheten: hevstangen er mye kortere enn ventet

`v2`-komponentene har **null hardkodede farger**. De styles med inline `style={{}}`, men verdiene
kommer fra `T`-objektet i `src/lib/v2/tokens.ts` — og hver `T`-nøkkel er en `var(--v2-*)`-peker.
`--v2-*` er 71 navn deklarert i `src/app/globals.css` (lys på `:root`, mørk på
`html[data-v2-tema="dark"]`).

Målt per familiefil (antall linjer med hex-literal):

| Fil | Komponenter | Hardkodede farger |
|---|---:|---:|
| `core.tsx` | 37 | 0 |
| `skjema.tsx` | 17 | 0 |
| `struktur.tsx` | 12 | 0 |
| `overlays.tsx` | 8 | 0 |
| `datavis.tsx` | 21 | 0 |
| `kalender.tsx` | 8 | 0 |
| `shell.tsx` | 5 | 0 |
| `domene.tsx` | 16 | 6 |

**Kjeden er:** 708 skjermfiler → `v2`-komponenter → `T` → 71 `--v2-*`-navn → globals.css.

Det betyr at fargeporten i steg 5 er **én fil med 71 verdier**, ikke 74 komponentfiler. Peker man
`--v2-*` på Paper-verdiene (som allerede ligger i `--p-*` fra steg 4), skifter hele appen palett i
én operasjon. Form, avstand, radius og typografi må fortsatt gjøres per komponent — men fargen,
som er det man ser først, er én endring.

**Advarsel som følger med:** nettopp fordi det er én endring, treffer den alt samtidig. Den må
gjøres som egen commit, atskilt fra formendringene, så den kan rulles tilbake alene.

### Fem `T`-nøkler er ikke tema-styrt

`onForest` (`#FFFFFF`), `tee`, `milepael`, `chartFaint`, `tierCollegeBg` og `wrapped` er bevisst
hardkodede — fysiske teefarger, delekort-grafikk og badge-farger som ikke skal følge tema. De er
innkapslet i `tokens.ts` nettopp for å holde komponentfilene hex-frie. **Ikke port dem til Paper
uten å spørre** — de er ikke merkevare-tokens.

---

## Fasit-dekning: byggeklossene er langt bedre stilt enn skjermene

Skjermene har 5,5 % fasitdekning (19 av 343, `fasit-liste-paper.md`). Byggeklossene er en helt
annen historie:

| Familie | Komponenter | Har tegnet Paper-fasit | Må utledes fra retningslinjer |
|---|---:|---:|---:|
| `core.tsx` | 37 | 22 | 15 |
| `skjema.tsx` | 17 | 11 | 6 |
| `struktur.tsx` | 12 | 9 | 3 |
| `overlays.tsx` | 8 | **8** | 0 |
| **Sum, de fire kjernefamiliene** | **74** | **50** | **24** |

**68 % dekning.** Paper har tegnet 78 komponenter fordelt på 13 familier, og familiestrukturen
speiler `v2` nesten 1:1: `skjema` ↔ `forms`, `overlays` ↔ `overlays`, `struktur` ↔ `layout`,
`core` ↔ `actions` + `primitives` + `data`.

Hver Paper-komponent har tre filer: `.jsx` (implementasjon), `.d.ts` (API) og `.prompt.md`
(designintensjon). `.prompt.md`-filene er detaljerte — `ScoreGauge` bruker for eksempel to avsnitt
på å begrunne hvorfor enheten står under tallet og ikke etter det, med målt pikselavvik. Det er
ekte fasit, ikke en skisse.

### Overlays er 8 av 8 — start der

Modal, Ark, Skuff, Popover, Verktøytips, Toast, Banner og KommandoPalett har alle en tegnet
motsvarighet. Ingen gjetting. Det er det naturlige første steget.

### De 24 uten fasit

Blant dem: `LogoAK` (men `guidelines/ak-golf-logo-bruk.md` + `brand-logo.html` dekker den),
`AKSE`/`AkseChip`, `AmbientBakgrunn`, `FordelingHode`/`FordelingRad`, `SevChip`, `MikroMeta`,
`ProfilFelt`, `ValgKort`, `NpsSkala`, `Veiviser`, `SpillerGruppeVeksler`,
`DataForhaandsvisning`, `ValideringsChip`. Disse er AK-spesifikke — Paper har ikke tegnet dem
fordi de ikke finnes i noe generelt designsystem. De må utledes fra
`guidelines/gruppe0/1/2-tilstander.card.html`, `rom-radius-skygge.html`, `rom-spacing.html` og
`komponentskjelett.md`.

---

## `src/components/ui/` — 19 av 21 har fasit, men lav verdi

| ui-primitiv | Paper-fasit |
|---|---|
| button | `actions/Button` |
| input | `forms/TextInput` |
| textarea | `forms/Textarea` |
| select | `forms/Select` |
| checkbox | `forms/Checkbox` |
| radio | `forms/Radio` |
| switch | `forms/Toggle` |
| tabs | `navigation/Tabs` |
| dialog | `overlays/Modal` + `ConfirmDialog` |
| sheet | `overlays/Drawer` + `BottomSheet` |
| popover | `overlays/Popover` |
| dropdown-menu | `overlays/DropdownMenu` |
| tooltip | `overlays/Tooltip` |
| toast | `overlays/Toast` |
| breadcrumb | `navigation/Breadcrumbs` |
| skeleton | `feedback/Skeleton` |
| kpi-card | `data/KpiCard` |
| progress-bar | `progress/ProgressBar` |
| icon | `navigation/Icon` |
| **progress-ring** | **ingen** — Paper har `ScoreGauge` (halvsirkel) og `PercentileGauge` (bånd), ikke hel ring |
| index | ikke en komponent (barrel) |

Kun 9 filer importerer `button`, 5 importerer `dialog`, 3 `input`. Resten har null importører.
**Anbefaling:** port dem sist, eller vurder i steg 10 om de skal slettes i stedet for portes.
Det er en egen beslutning som ikke bør tas som en bivirkning av designporten.

---

## Hva som IKKE er kontrollert

- **Ingen visuell sammenligning er gjort.** Dette er en opptelling av hva som finnes, ikke en
  vurdering av hvor langt dagens komponenter står fra Paper visuelt. Den vurderingen krever at
  komponentene rendres side om side med fasitskjermene — det hører til selve porteringen.
- **De 419 inline-fargene fra fase 4 er ikke rørt.** De sitter i skjermfiler, ikke i
  komponentene, og vil overstyre Paper der de finnes uansett hvor riktig byggeklossen er.
  Det er steg 6 og må skje før noen skjerm kan sies å være ferdig portet.
- **`athletic/golfdata/`** er ikke talt her. Null filer importerer det direkte fra `src/`, men
  `golfdata-tokens.css` styrer fortsatt 209 ruter via `.golfdata-scope`.
- **`domene.tsx` sine 6 hardkodede farger** er ikke undersøkt enkeltvis.

---

## Konsekvens for planen

Steg 5 bør deles i to, i denne rekkefølgen:

**5a — fargen (én commit, reverserbar alene).** Pek `--v2-*` på Paper-verdiene. 708 filer skifter
palett samtidig. Dette er også den ærligste testen på om Paper faktisk kler appen — den ses med
øynene på en forhåndsvisning før noe annet gjøres.

**5b — formen (én commit per komponentfamilie).** Radius, avstand, typografi og tilstander mot
`.prompt.md` og tilstands-kortene. Rekkefølge etter fasitdekning: `overlays` (8/8), `struktur`
(9/12), `skjema` (11/17), `core` (22/37).

`src/components/ui/` flyttes ut av steg 5 og inn i steg 10 som en ryddebeslutning.
