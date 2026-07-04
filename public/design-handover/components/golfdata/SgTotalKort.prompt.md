# SgTotalKort

SG total siste N runder mot navngitt baseline. Fortellermønster: score (stort tall) → trend (delta) → forklaring (klarspråk, dybde-styrt).

## Bruk
```jsx
<SgTotalKort
  verdi="+1,2" enhet="slag" baseline="Broadie scratch" runder={10}
  trend="+0,4" begrunnelse="Formen stiger — du henter mest på tee og nærspill."
  benchmark="Tour-snitt: +2,4 slag" nivaa="elite"
/>
```

## Progressiv dybde
`nivaa`: nybegynner = tall + trend + baseline; øvet = + klarspråk-forklaring; elite = + tour-benchmark.

## Domenefasit
SG m/ fortegn, én desimal, enheten «slag», ALLTID mot navngitt `baseline`. Trend via `DeltaIndikator` (--up/--down). Komponerer `HeroTall` + `DeltaIndikator` — dupliserer ikke tall-lockupen. Tomt = onboarding.
