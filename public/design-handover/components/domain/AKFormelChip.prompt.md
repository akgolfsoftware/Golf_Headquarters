AK-formel-chip; bruk på økt-kort og drill-rader for formelverdiene (arena, CS, læringstrinn).

```jsx
{/* Coach-flate: kode + navn */}
<AKFormelChip kode="M2" navn="Kravtrening" />                        {/* arvet = dempet */}
<AKFormelChip kode="CS60" navn="60 % av maksfart" tilstand="overstyrt" onClick={rediger} />
<AKFormelChip kode="L3" navn="Trinn 3 · Kølle" />

{/* Spillerflate: kun klarspråk */}
<AKFormelChip kode="M2" navn="Kravtrening" visKode={false} />
```

- **Tolags-språk (kanon):** `visKode={false}` i spillerflaten — koden finnes aldri der.
- **tilstand**: `arvet` (dempet — verdien kommer fra plan/mal) · `overstyrt` (solid kant — satt manuelt). Tooltip forklarer.
- Med `onClick` blir chippen knapp (hover + fokusring) → redigering i Inspektør.
- CS i spillerflaten omtales alltid som «% av din maksfart», aldri CS-koden.
