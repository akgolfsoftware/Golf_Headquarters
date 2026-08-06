# VelvaereKort

Spillerens stemme. Blekk-prikker — aldri farget skala.

```jsx
<VelvaereKort basis="i dag 07:05" dataOdId="oyvind-velvaere"
  fields={[
    { label: "Søvn", value: 4 }, { label: "Energi", value: 3 },
    { label: "Motivasjon", value: 5 }, { label: "Kropp", value: 2 },
  ]}
  note="Litt støl i korsryggen etter gårsdagens FYS-økt — sier ifra hvis det henger i under oppvarming." />
```

- ALDRI farget skala: en 2-er på kropp er informasjon til dagens økt, ikke
  et avvik — rød/grønn ville gjort registreringen til en prøve og ødelagt
  ærligheten i rapporteringen. Prikkene er blekk på soft.
- PERSONVERN (bindende): egenrapporten ses av spiller + coach. For
  mindreårige (WANG/GFGK): aldri i sky-prompts uten anonymisering, aldri i
  foreldreportalen uten EGET samtykke. Personvernlinjen «Kun du og coach
  ser dette» er del av komponenten — fjern den aldri.
- Grensen mot `SpillerTilstandKort` (golfdata): coachens aggregat fra data
  bor der; dette er det spilleren SIER. Bland dem aldri.
- LIFE-kodene (LIFE-SELV osv.) hører i notatet — aldri som egne felter.
