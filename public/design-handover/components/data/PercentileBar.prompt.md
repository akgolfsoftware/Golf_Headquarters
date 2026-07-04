# PercentileBar

Where a player sits in a peer distribution — quartile-tinted track, a lime
marker at their percentile, an optional benchmark tick (e.g. squad average).

## Bruk
```jsx
<PercentileBar percentile={82} benchmark={50} label="HCP · U16-stall" valueLabel="Topp 18 %" />
```
- The marker glides in on mount; keep `valueLabel` short — it's the headline.
- Quartile tint is decorative context only, not a legend — don't add axis labels.
