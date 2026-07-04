# BarnProgresjonKort

Foreldreportalens progresjonskort: barnets utvikling i **klarspråk**, lesevisning. Ingen fagkoder, ID-er eller overstyr (foreldreflate-regel). Ett budskap + noen få områder med trend.

## Bruk
```jsx
<BarnProgresjonKort navn="Øyvind Rohjan"
  oppsummering="Øyvind har hatt en god måned — nærspillet løfter seg jevnt, og han er stabil på trening."
  omrader={[
    { omrade: "Nærspill", verdi: "God", trend: "+0,4" },
    { omrade: "Putting",  verdi: "74 %", trend: "+3" },
    { omrade: "Oppmøte",  verdi: "9 av 10 økter" },
  ]} />
```

## Domenefasit
Kun klarspråk — aldri SG-koder/CS/M/PR i foreldreflaten. Trend via `DeltaIndikator`. `loading` = Skeleton.
