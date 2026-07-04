The hairline base card — the container for almost everything; reach for it before inventing a panel.

```jsx
<Card eyebrow="I dag" title="Treningsplan" action={<Button variant="ghost" size="sm" iconRight="chevron-right">Alle</Button>}>
  …body…
</Card>

<Card compact>…dense data…</Card>
<Card interactive onClick={open}>…clickable…</Card>
```

- Surface just lighter than the canvas + 1px hairline border, radius 16, **no shadow**.
- **eyebrow / title / action** render the header; **footer** is divided by a hairline.
- **compact** tightens padding for tables/dense data; **interactive** adds a hover lift for clickable cards.
- Don't add drop-shadows — separation is lightness + border. Shadows are reserved for popovers/modals/sheets.
