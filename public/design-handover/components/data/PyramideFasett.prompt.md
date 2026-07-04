# PyramideFasett

Signaturmotiv nr. 2 (metodikk-geometrien): den 5-lags treningspyramiden som
**fasettert form**. Apex→base = TURN→FYS, hvert lags høyde ∝ fordelings-%.
Farge = akse (LAG 4-kanon). Fasett-kanter i base-fargen → formen leser som en
slepen edelsten. Themer automatisk (lyse/mørke akse-markører per tema).

**Bruk:** fordelings-visualisering, tomtilstander i plan-kontekst, seksjons-
markør, brand-mark-slektskap. **Regel:** alltid data-bundet eller didaktisk —
aldri som dekorativt bakgrunnsmønster; alltid nøyaktig 5 lag.

```jsx
<PyramideFasett fordeling={{ FYS:30, TEK:25, SLAG:20, SPILL:15, TURN:10 }} />
<PyramideFasett fordeling={plan.fordeling} visTerskler />   {/* 15/40-hakk */}
<PyramideFasett kompakt bredde={64} />                      {/* kun form — seksjonsmarkør */}
```
