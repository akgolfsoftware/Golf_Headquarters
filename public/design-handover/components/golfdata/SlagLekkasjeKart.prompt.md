# SlagLekkasjeKart

Heatmap over avstandsbånd — hvor slagene forsvinner. Hvert bånd er en trykkbar rad (hele raden = heat-flate) som åpner analytikerkjeden. Kartet er «hvor», DiagnoseKort er «hvorfor + hva».

## Bruk
```jsx
<SlagLekkasjeKart
  baand={[
    { id: "tee",    label: "Tee-slag",            sg: 0.3,  slag: 42 },
    { id: "app150", label: "Innspill 150–100 m",  sg: -0.8, slag: 34 },
    { id: "putt6",  label: "Putting 0–6 ft",      sg: -0.6, slag: 88 },
  ]}
  baseline="Kat. A-snitt"
  grunnlag="14 runder"
  valgtId={valgt}
  onVelgBaand={(b) => aapneDiagnose(b.id)}
/>
```

## Domenefasit
- Bånd-akser: tee-slag → innspill i **meter** (200–150 / 150–100 / 100–50) → nærspill < 50 m → putting ALLTID i **fot**.
- SG per runde m/ fortegn og én desimal, ALLTID mot navngitt `baseline`; datagrunnlag (`grunnlag`) i samme linje.
- Heat: tap = `--down`-tint (intensitet ∝ |SG| mot største lekkasje), gevinst = `--up`-tint, nøytral (< 0,05) = `--surface-2`. Aldri lime. Tall-farge speiler retning → legend «tap/gevinst» nederst.

## Progressiv dybde (én kodevei)
`nivaa` gater lag via `NIVA[nivaa]` (NesteFokusKort-mønsteret): **nybegynner** = kun kartet + dommen · **ovet** = + slag-antall per bånd + trykk-hint · **elite** = + sum-linje («Sum −1,9 slag/runde»).

## Interaksjon
Rad = `<button>` min 44px, én kolonne — lesbar og trykkbar på 390px. `aria-pressed` på valgt bånd, focus-visible-ring, uten `onVelgBaand` er radene disabled (ren visning).

## Tilstander
`loading` (skeleton-rader) · `tomt`/tom liste (onboarding: «Ingen slagdata ennå») · normal.

## Komponerer
`onVelgBaand` → `DiagnoseKort` (symptom→bevis→resept for båndet). Dupliserer ikke SgKategoriBar — den er 4 SG-kategorier, dette er avstandsbånd.
