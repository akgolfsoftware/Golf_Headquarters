# TestResultatKort

Generisk resultatkort for alle 20 testprotokoller: verdi vs krav (bestått/ikke), pyramideområde-farge på venstrekant, trend, valgfri M/PR-badge.

## Bruk
```jsx
<TestResultatKort navn="PEI-batteri" protokoll="PEI" omrade="TEK"
  verdi="78" enhet="/100" krav="≥ 75" bestatt trend="+6"
  arena="M2 · Kravtrening" press="PR2" dato="16. jun" />
```

## Domenefasit
Pyramideområde via `--axis-*`-token (FYS/TEK/SLAG/SPILL/TURN). Bestått vises med ikon + ord (farge ikke eneste bærer). Trend via `DeltaIndikator` (`invertert` der lavere er bedre). M/PR-badge på testserier. Dispersion (side/carry) håndteres av `trackman/DispersionPlot` ved siden av der testen produserer slagserier.
