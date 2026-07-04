One agenda line for day views; stack several under a DayStrip.

```jsx
<AgendaRow time="09:00" icon="dumbbell" title="Styrke & mobilitet" subtitle="Mulligan Studio 2" duration="45 min" state="done" />
<AgendaRow time="16:00" icon="target" title="Putting-blokk" subtitle="Med Anders" duration="60 min" state="live" />
<AgendaRow time="18:30" icon="flag" title="Banespill 9 hull" subtitle="GFGK" duration="2t" />
```

- **state**: `upcoming` (default) · `live` (lime accent + pulsing dot) · `done` (dimmed + check).
- Blocks are neutral by design — only the live session goes lime. Don't color-code by category.
