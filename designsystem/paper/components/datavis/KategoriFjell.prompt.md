# KategoriFjell

A–K-profilen som silhuett. Kravlinjen stiplet over. Dokumenterer, dømmer ikke.

```jsx
<KategoriFjell focus="C" maxValue={100} dataOdId="oyvind-profil"
  categories={[
    { label: "A", value: 82, krav: 90 }, { label: "B", value: 74, krav: 80 },
    { label: "C", value: 68, krav: 70 }, { label: "D", value: 71, krav: 60 },
    /* …til K */
  ]} />
```

- Grensen mot `SkillRadarLive` (golfviz): radaren viser én økts ferdigheter
  rundt et senter; fjellet viser HELE kategoriprofilen A–K mot krav, lineert.
- Der silhuetten ligger under kravlinjen er gapet synlig som AVSTAND — aldri
  rød flate, aldri leire. Fjellet dokumenterer tilstanden; hva som skal
  trenes bor i NesteFokusKort/diagnosen.
- Rekkefølgen på kategoriene kommer ferdig fra konsumenten — CANON v3.5 eier
  retningen (A–K er snudd i CANON; komponenten skal ikke mene noe om det).
- SVG-en bruker `preserveAspectRatio="none"` + `vector-effect:
  non-scaling-stroke` — fjellet strekker seg med containeren uten at
  strekene fetes. Terskel 380 px: høyden 120→88, etikettene 9,5→8,5 px.
