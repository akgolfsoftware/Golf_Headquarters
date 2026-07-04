# SgKategoriBar

OTT/APP/ARG/PUTT-dekomponering som divergerende SG-stolper om en nullbaseline. Tap går venstre (--down), gevinst høyre (--up) — aldri lime. Største tap fremheves med «størst tap»-merke, så øyet lander på lekkasjen først.

## Bruk
```jsx
<SgKategoriBar
  baseline="Broadie scratch"
  nivaa="elite"
  kategorier={[
    { akse: "OTT",  sg: +0.9 },
    { akse: "APP",  sg: -0.3 },
    { akse: "ARG",  sg: +0.4 },
    { akse: "PUTT", sg: -1.2 },
  ]}
/>
```

## Overlapp (meldt)
`BarChart` er magnitude-stolper fra 0. SG krever **divergerende** stolper om en nullbaseline med fortegnsfarge — egen viz, ikke BarChart-duplikat. Deler token- og fortegnsspråk med resten av golfdata-familien.

## Progressiv dybde
`nivaa`: nybegynner/øvet skjuler fagkoder (klarspråk «Tee-slag/Innspill/Nærspill/Putting»); elite viser OTT/APP/ARG/PUTT-koder + baseline-linje.

## Domenefasit
SG i slag m/ fortegn og én desimal, mot navngitt `baseline`. Farge er aldri eneste bærer — fortegn + posisjon (venstre/høyre) gir samme info. Tomt = onboarding.
