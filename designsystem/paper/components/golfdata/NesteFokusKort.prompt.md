# NesteFokusKort

Analysens anbefaling for de neste ukene. Blekk — aldri oransje.

```jsx
<NesteFokusKort dataOdId="oyvind-fokus"
  title="Nærspillet er største gevinst"
  why="Du taper 1,2 slag per runde rundt greenen mot kategori B. Utslag og putting holder nivået — flytter vi treningstid hit, flytter scoren seg mest."
  evidence="SG nærspill −1,2 · siste 5 runder · størst gap mot kategori B"
  planNote="Lagt inn som 2 økter/uke i SPES-perioden"
  actions={<Button size="sm" dataOdId="fokus-plan">Åpne i Workbench</Button>} />
```

- Grensen mot `OneThingNow` (actions): OneThingNow er ÉN ting NÅ — oransje,
  pulserende, maks én per skjerm. NesteFokusKort er ANALYSE — ukene
  fremover, blekk på papir, kan stå flere steder. Bland dem aldri.
- Grensen mot `DiagnoseKort`: diagnosen forklarer, fokus-kortet anbefaler.
  Rekkefølge når begge vises: diagnose → fokus.
- `actions` tar bibliotekets `Button`-noder — komponenten tegner aldri egne
  knapper (eierskapsregelen).
- Bruk ordboka: «nærspill», aldri «kort spill».
- Chromeless: flaten eies av `Panel` (K2 avventer Anders).
