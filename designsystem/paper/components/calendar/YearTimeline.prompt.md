# YearTimeline

Sesongens hendelser i én figur. Periodeplan er båndet; dette er punktene.

```jsx
<YearTimeline nowIndex={0} dataOdId="wang-aarshjul" months={[
  { label: "aug", events: [{ type: "test", label: "NGF-test" }] },
  { label: "sep", events: [{ type: "samling", label: "Samling GFGK" }] },
  /* …til jul */
]} />
```

- Grensen mot `Periodeplan`: båndet viser PERIODENE med varighet;
  årshjulet viser HENDELSENE. Sammen er de årsplanen — bånd øverst.
- Tre lukkede hendelsestyper: turnering (--up — toppunktet), samling
  (--info), test (blekk). En fjerde type legges inn her, aldri per skjerm.
- Maks tre hendelser vises per måned — årshjulet er oversikt; månedens
  detaljer bor i MaanedKalender.
- Kolonnene bryter 12 → 6 → 4 på container (640/360) — årshjulet leses
  også i PlayerHQ-kolonnen, da som tre rader à fire måneder.
- Månedsrekkefølgen kommer fra konsumenten (skoleår aug–jul for WANG,
  kalenderår ellers).
