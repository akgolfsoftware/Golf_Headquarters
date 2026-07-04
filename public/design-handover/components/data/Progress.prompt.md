Progress in four forms; pick the variant that fits the data.

```jsx
<Progress variant="ring" value={86} label="Kapasitet" />
<Progress variant="bar" value={64} label="Off the tee" />
<Progress variant="streak" total={7} active={5} label="5 dager" />
<Progress variant="segment" total={12} filled={4} label="økter" />
```

- **ring** — gauge with the number centered (set `size`, `thickness`).
- **bar** — linear; shows label + % unless `showValue={false}`.
- **streak** — dots with a flame at the live endpoint (training streaks).
- **segment** — n-of-total bar (e.g. 4/12 sessions done).
- Lime by default; pass `color` (e.g. `var(--down)`) to recolor.
