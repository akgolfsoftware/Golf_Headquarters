# KategoriKravKort

Veien til neste kategori. Krav er anbefalinger — aldri låser.

```jsx
<KategoriKravKort fromCategory="C" toCategory="B" dataOdId="oyvind-krav"
  requirements={[
    { label: "Snittscore", current: "74,1", required: "≤ 73,0" },
    { label: "Driver carry", current: "231 m", required: "≥ 235 m" },
    { label: "Putt 6 ft make-%", current: "68 %", required: "≥ 65 %", met: true },
  ]} />
```

- Invariant 1 er absolutt: et umøtt krav viser AVSTAND, aldri en lås, aldri
  «kan ikke rykke opp»-tekst. Opprykk er coachens beslutning.
- Kravverdiene sendes ferdig formatert fra konsumenten (CANON eier dem).
  Særlig FYS: referanseverdiene er IKKE låst — plassholder-tall til Anders
  gir grønt lys (beslutningslista).
- ✓ er oliven; umøtt er en nøytral prikk — ikke leire: å ikke være fremme
  ennå er normaltilstanden på en stige, ikke et avvik.
- Grensen mot `KategoriFjell` (datavis): fjellet viser HELE profilen som
  figur; kravkortet viser ÉN overgang som liste.
- Chromeless: flaten eies av `Panel` (K2 avventer Anders).
