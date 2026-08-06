# PuttModellKort

Make-% per distanse i fot, mot kategorireferansen.

```jsx
<PuttModellKort basis="siste 90 dager · referanse kategori B" dataOdId="oyvind-putt"
  rows={[
    { ft: 3, pct: 96, display: "96 %", ref: 95, refDisplay: "95 %" },
    { ft: 6, pct: 68, display: "68 %", ref: 65, refDisplay: "65 %" },
    { ft: 9, pct: 41, display: "41 %", ref: 45, refDisplay: "45 %" },
  ]} />
```

- CANON-regel: putting måles i FOT. Komponenten skriver «ft» selv — send
  aldri meterverdier hit; konverteringsspørsmålet (putt-rader uten
  distanceToPin) er et åpent migreringsspørsmål og løses i data, ikke i UI.
- Fyllet er analyse-blå; når spilleren ligger PÅ eller OVER referansen
  tones fyllet oliven. Referansemarkøren er alltid blekk.
- Grensen mot `PuttLab` (golfviz): én økts treningsserie bor der; modellen
  er kurven over tid.
- Terskel 380 px: referanseverdien ryker fra tallkolonnen (ligger i aria);
  markøren i sporet viser den fortsatt.
- Chromeless: flaten eies av `Panel` (K2 avventer Anders).
