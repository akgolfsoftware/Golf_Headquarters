Large tactile 999px choice pill — the one-tap alternative to dropdowns and form fields. Use rows of them for every short enumerated choice.

```jsx
<ChoicePill axis="tek" selected size="lg" kbd="2">TEK</ChoicePill>
<ChoicePill mono selected>P6</ChoicePill>
<ChoicePill selected={motorikk === "Lav hastighet"} onClick={() => setMotorikk("Lav hastighet")}>Lav hastighet</ChoicePill>
```

- Neutral selected = graphite fill. `axis` selected = soft axis background with axis edge (classification, not action).
- Use `mono` for codes and numbers.
