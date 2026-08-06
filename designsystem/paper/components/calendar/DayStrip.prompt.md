# DayStrip

Ukas sju dager som stripe. Valgt = blekkfylt. I dag = prikk.

```jsx
<DayStrip value="2026-08-03" onChange={settDag} dataOdId="idag-dager"
  days={[{ key: "2026-08-03", weekday: "man", date: 3, today: true, full: "mandag 3. august" },
         { key: "2026-08-04", weekday: "tir", date: 4, full: "tirsdag 4. august" }]} />
```

- Grensen mot `SegmentControl`: samme interaksjon, men DayStrip er
  DATOFORANKRET — ukedag + dagtall + i dag-markør er anatomien, og den skal se
  lik ut i I dag, Plan og FangstSheet. Grensen mot `DatePicker`: DayStrip
  velger blant dagene som alt vises; å hoppe til en annen uke er rammens jobb.
- Valgt dag fylles med `--cta` (blekk) — aldri oransje; å stå på en dag er en
  tilstand, ikke skjermens ene handling.
- I dag-prikken er `currentColor` og arver derfor riktig kontrast også når
  i dag OG valgt er samme dag (papirprikk på blekk).
- Radiogroup med roving tabindex; ukedag/dagtall er `aria-hidden` og hele
  datoen leses fra `full` — «man 3» leses ikke meningsfullt.
- Container-terskel 340 px: høyden går 52→48 px; under det bærer
  overflow-x-scroll resten. Minimumsbredden per dag er alltid minst 44 px.
