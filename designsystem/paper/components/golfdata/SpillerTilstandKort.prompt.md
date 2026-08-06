# SpillerTilstandKort

Coachens blikk på spilleren nå. Fire felter + flagg.

```jsx
<SpillerTilstandKort basis="oppdatert i dag 07:12" dataOdId="oyvind-tilstand"
  fields={[
    { label: "Form", value: "72,4 snitt", tone: "up" },
    { label: "Etterlevelse", value: "86 %" },
    { label: "Sist aktiv", value: "i går" },
    { label: "Neste", value: "tir 09:00" },
  ]}
  flags={["Ingen FYS-økt logget på 8 dager — planen sier 2/uke."]} />
```

- Grensen mot `VelvaereKort` (domene): velvære er spillerens EGENRAPPORT;
  tilstandskortet er coachens AGGREGAT fra data. Bland dem aldri — de har
  ulikt personvern (egenrapport kan være sensitiv).
- Flagg går til COACH: avvik fra treningsrytme flagges hit, aldri direkte
  til spiller/foreldre (GFGK/WANG-reglene). Og aldri som sperre.
- Maks fire felter — kortet er et øyekast i stallen, ikke en rapport.
- Terskel 380 px: 4 kolonner → 2 × 2.
- Chromeless: flaten eies av `Panel` (K2 avventer Anders).
