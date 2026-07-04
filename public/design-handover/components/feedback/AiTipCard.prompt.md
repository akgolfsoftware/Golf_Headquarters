The card the AI-Caddie speaks through; use for proactive coaching insights and AI suggestions, sparingly.

```jsx
<AiTipCard updated="3 min" title="Putting trekker ned scoren">
  Øyvind har tapt <TipMetric>−1,2 SG</TipMetric> på putt innenfor 6 ft de siste 4 rundene.
  Foreslå en 20-min gate-drill før neste økt.
</AiTipCard>
```

- Sparkle mark + mono "OPPDATERT FOR {updated}" eyebrow, subtle lime border accent.
- Wrap the one key number in **`<TipMetric>`** so it reads lime + mono.
- One per view; this is the AI voice, not a generic callout.
