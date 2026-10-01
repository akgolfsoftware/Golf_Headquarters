The one overlay for details and quick edits: **bottom sheet on phone/tablet, Inspector (340 px) on desktop**. Use it as the Drawer too — there is no separate component. NavDrawer is only for navigation.

```jsx
<Sheet open={!!sel} onClose={() => setSel(null)} kicker="Privattime · Tir 29.09" title="Ida Berg · 16:30"
  footer={<><Button fullWidth icon="check">Bekreft flytting</Button><Button variant="ghost" fullWidth>Avbryt</Button></>}>
  <KeyValue items={[["Klippekort", "3 av 10"], ["Gyldig til", "31.12.2026"]]} />
</Sheet>

// Desktop split view: always-visible inspector column
<div style={{ display: "flex" }}><main style={{ flex: 1, minWidth: 0 }}>…</main><Sheet open mode="docked" title="Ida Berg">…</Sheet></div>
```

- Motion: 250 ms `--ease-drawer`, no bounce. Esc and scrim click close.
- Footer holds at most one primary (graphite). Rust only for Slett / Trekk tilbake.
- Works in `data-theme="night"`.
