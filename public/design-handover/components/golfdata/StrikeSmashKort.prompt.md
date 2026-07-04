# StrikeSmashKort

Treffpunkt-heatmap på køllebladet side ved side med smash factor per sone. Venstre panel svarer «hvor treffer du», høyre «hva koster det» — samme 3×3-geometri i begge.

## Bruk
```jsx
<StrikeSmashKort
  kolle="Driver"
  soner={[
    { andel: 0.04, smash: 1.42 }, { andel: 0.09, smash: 1.46 }, { andel: 0.05, smash: 1.44 },
    { andel: 0.12, smash: 1.45 }, { andel: 0.28, smash: 1.50 }, { andel: 0.14, smash: 1.48 },
    { andel: 0.10, smash: 1.41 }, { andel: 0.13, smash: 1.44 }, { andel: 0.00, smash: null },
  ]}
  idealSmash={1.5}
  grunnlag="86 slag · TrackMan"
  dom="Lav hæl-treff koster 0,06 smash — tee ballen høyere og flytt treffet mot senter."
/>
```

## Domenefasit
- `soner` = NØYAKTIG 9, radvis topp→bunn, hæl→tå (caption «Hæl ← → Tå» under begge paneler).
- Treff-tetthet = **nøytral blekk-skala** (`--text`-tint ∝ andel) — theme-trygg i begge moduser og fargeblind-sikker; tettest sone får ring.
- Smash dømmes mot `idealSmash`: ≤ 0,015 under = `--up` · ≤ 0,045 = `--warning` · mer = `--down`. Aldri lime.
- Tomme soner (andel < 0,005 eller smash null) = ærlig «—» + stiplet celle — aldri oppdiktet tall.
- Mono, tabulære tall m/ komma («1,48»). Datagrunnlag alltid synlig under tittelen.
- To paneler à ~50 % — fungerer side ved side ned til 390px.

## Progressiv dybde (én kodevei)
`nivaa` gater lag via `NIVA[nivaa]` (NesteFokusKort-mønsteret): **nybegynner** = panelene + grunnlag · **ovet** = + dom + ideal-referanse · **elite** = + andel-% per sone.

## Tilstander
`loading` (to skeleton-flater) · `tomt`/feil sonetall (onboarding: «Ingen treffdata ennå») · normal.

## Komponerer
TrackMan-fortellingen: `LaunchWindowKort` (utbytte i meter) + dette kortet (årsaken i treffet). `dom`-linjen peker mot drill/økt via DiagnoseKort-mønsteret.
