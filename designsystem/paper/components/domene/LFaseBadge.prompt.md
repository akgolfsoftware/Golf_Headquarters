# LFaseBadge

L-fasen (v1), fargeløs, med steg-prikker. **Tas ikke i bruk — se under.**

```jsx
<LFaseBadge value="L-BALL" dataOdId="okt-lfase" />
<LFaseBadge value="L-ARM" showSteps={false} />
```

- AVGJORT 05.08.2026 (Anders): badgen tas IKKE i bruk på noen flate.
  AK-formel v2 har ikke L-faser; appens Vei B-visning bruker motorikk-
  stegene (UTEN_BALL / LAV_HAST / AUTO) i stedet. Komponenten blir liggende
  ubrukt i biblioteket — ikke plasser den på nye skjermer.
- FARGELØS er bindende (StatusBadge-regelen): AK-vokabular fargekodes aldri.
  Prikkene bruker kun blekk/mid/border — posisjon, ikke verdi.
- Rekkefølgen er lukket i `LFASER` (CANON v1). En ukjent verdi rendres som
  ren tekst uten prikker — badgen dikter aldri en plassering.
- `title` bærer «Fase 4 av 5» for skjermleser og hover.
