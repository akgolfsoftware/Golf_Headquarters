# KategoriKravKort

Spillerens A–K-nivå (**A = beste**, jf. kanon-beslutning): bestått/gjenstår per testprotokoll-krav, og hva som må til for neste nivå. Sjekkliste, ikke graf.

## Bruk
```jsx
<KategoriKravKort nivaa="B" nesteNivaa="A"
  krav={[
    { navn: "SG Total ≥ +1,0", bestatt: true,  verdi: "+1,2", mal: "+1,0" },
    { navn: "Køllehastighet ≥ 110 mph", bestatt: true, verdi: "112", mal: "110" },
    { navn: "Putting 3–6 ft ≥ 80 %", bestatt: false, verdi: "74 %", mal: "80 %" },
  ]}
  nesteKrav="Løft putting 3–6 ft fra 74 % til 80 % for Kategori A." />
```

## Domenefasit
A = beste kategori → K. Bestått vises med ikon + tekst (farge aldri eneste bærer). Verdi / mål i mono. Neste krav i klarspråk.
