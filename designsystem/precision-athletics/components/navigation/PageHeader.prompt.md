Top of every page. Title left, actions right; actions wrap under the title on narrow widths.

```jsx
<PageHeader kicker="Uke 40 · 28.09–04.10" title="Timeplan og booking"
  actions={<><Segmented … /><Button variant="secondary" icon="lock">Legg inn opptatt-tid</Button><Button icon="plus">Ny time</Button></>} />
```

- Max one primary (graphite) in actions. Rust only if the action is destructive.
- Title in sentence case. Kicker in caps with middle dots.
