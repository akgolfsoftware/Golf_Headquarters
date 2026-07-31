Halvsirkel-gauge i `--fg` på `--soft`-spor med hero-tall og tre undertall (enhet + vindu synlig).

```jsx
<ScoreGauge label="Treningskvalitet" value={82} unit="av 100" subs={[
  { label: "Fokus", value: "8,1", window: "siste økt" },
  { label: "Volum", value: "420", unit: "baller", window: "denne uka" },
  { label: "Treff", value: "68", unit: "%", window: "siste økt" },
]} />
```

## Symmetri: enheten står under tallet, ikke etter det

Buen er symmetrisk om sin egen midtakse, så **hero-tallet må stå på den aksen** — det er figurens eneste optiske ankerpunkt.

Med enheten inline etter tallet sentreres «82» og «av 100» som *én* blokk, og tallet skyves til venstre med halve enhetsbredden. Målt på «82 av 100»: **27,3 px, 13,6 % av buebredden** [31.07]. Det leses som en skjev figur, ikke som et sentrert tall — og feilen vokser med enhetens lengde, så «av 100» er verre enn «%».

`unitPlacement="below"` (standard) stabler enheten under tallet. Da er tallets senter buens senter, og enheten leser som det den er: en opplysning om skalaen, ikke en del av verdien. `unitPlacement="inline"` beholder gammel oppførsel — forsvarlig bare når enheten er ett tegn (`%`, `°`) og avviket er umerkelig.

`letter-spacing: -.03em` på hero-tallet henger igjen som luft til høyre for siste siffer. Halvparten kompenseres tilbake med `padding-left`, ellers står tallet ~0,7 px for langt til venstre selv når blokken er sentrert.

Kortet `progress.card.html` har tweaks for verdi, enhet og plassering, med en senterlinje du kan slå på for å måle avviket selv.

## Regler

- **Nøyaktig tre undertall**, eller ingen. To ser ut som et manglende tredje; fire brekker 3-kolonnersgriden.
- Tallet er nøytralt — buen bærer ingen tone. Retning hører i `delta`-komponentene, ikke her.
