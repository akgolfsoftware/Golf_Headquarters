Kaskadevelger for AK-formel v3. Pyramiden er en gaffel, ikke en etikett: valget i steg 1
bytter ut hele områdelista, og området bestemmer delferdighetene. Bytter du et steg,
nullstilles alt under — feltene skjules ikke, de finnes ikke.

Antall slots varierer: FYS har fire (ingen motorikk, ingen press), TEK på tee/innspill har
sju (P-posisjon kommer inn rett etter område), resten har seks. Rendringen er datadrevet.

```jsx
const [f, setF] = React.useState({});
<AkFormelVelger verdi={f} onChange={setF} />
```

Formellinja kan stå alene, f.eks. som oppsummering på et drill-kort:

```jsx
<AkFormelLinje verdi={{ pyr: "TEK", omr: "TEE_TOTAL", pValg: ["P5.0","P6.0","P7.0"],
  pModus: "INTERVALL", del: "SKRU", mot: "LAV_HASTIGHET", bel: "TRENINGSOMRADE", press: "ALENE" }} />
```

Tre ting som ikke er valgfrie:

- **Formelstrengen er visning og søk, aldri en nøkkel.** Både områdekoder (`PUTT_5_10`) og
  delferdigheter (`STRATEGI_TAKTIKK`) inneholder understrek, og P-feltet har egne
  separatorer (`+`, `-`). `split("_")` gir feil svar. Lagre de seks feltene hver for seg.
- **P-posisjon lagres ekspandert.** `pEkspandert()` gjør `P5.0-P8.0` til alle fire punktene,
  så «hvilke driller trener P6.0» virker uten spesialbehandling. `pModus` beholdes for visning.
- **«Bane» finnes to steder** — som område under SPILL (hva du trener) og som belastning
  (hvor økten er). Etiketter alltid; aldri «Bane · Bane» uetikettert.

Putt-områdene er i **fot** (Anders 03.08). Koden lagrer meter i dag, så vis alltid enhet
til migreringen er kjørt. Delferdighet for FYS er kun definert for Styrke — de tre andre
områdene viser en åpen-note i stedet for oppdiktede verdier.
