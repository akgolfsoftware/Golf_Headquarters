Læringstrapp; signaturmotivet — bruk for drill-progresjon, spillerkort, CS-kobling og (sparsomt) som didaktisk element i empty-states.

```jsx
<Laeringstrapp aktivtTrinn={3} visStatus />          {/* «Trinn 3 av 5 · Kølle — Svingtrening …» */}
<Laeringstrapp aktivtTrinn={4} kompakt />            {/* tett, kun tall-etiketter */}
<Laeringstrapp aktivtTrinn={2} visEtiketter={false} />
```

- **Alltid nøyaktig 5 steg med 1:1-stigning** — aldri færre/flere, aldri prosent-utjevning (kanon).
- Aktivt trinn = signal-fylt · passerte = dempet fylt · kommende = stiplet kontur.
- **visStatus** gir spillerspråket: «Trinn X av 5 · Navn — beskrivelse».
- Aldri som støy bak data — motivet er data-bundet eller eksplisitt didaktisk (designsystem.md §6).
- Eksporterer også `TRINN` (kode-uavhengig trinn-liste med klarspråk).
