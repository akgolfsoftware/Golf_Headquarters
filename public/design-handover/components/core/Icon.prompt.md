Lucide-geometry icon at 1.5px stroke — the brand's only icon system; use it instead of emoji or hand-rolled SVG.

```jsx
<Icon name="trending-up" size={18} />
<Icon name="flag" size={24} stroke={1.5} style={{ color: "var(--signal)" }} />
```

The inlined set covers the components' needs (arrows, chevrons, check, x, search, sparkles, flame, target, calendar, clock, user, bell, lock, map-pin, trending-up/down, dumbbell, activity, trophy, flag, play, mail, menu, sliders, more-horizontal, alert-triangle, home, bar-chart, log-in, send). For glyphs outside this list, load the Lucide CDN in product code and keep the 1.5px stroke. `ICON_NAMES` lists what's bundled.
