# Shared UI Kit components

Cross-surface components used by both **PlayerHQ** and **CoachHQ**.

## `PyramideRinger.jsx`

The signature progress visualization for AK Golf — five nested half-arcs, one per training layer (FYS · TEK · SLAG · SPILL · TURN). Used on at least 6 screens including PlayerHQ Hjem, training-plan detail, CoachHQ player profile, and program editor.

**Exports** (assigned to `window` for cross-Babel-script use):
- `PyramideRinger({ size, progress, showLabels, strokeWidth })` — the SVG rings.
- `PyramideLegend({ progress, dense })` — compact list view of the same data.
- `PYR_LAYERS` — array of layer specs (key, color, label, name).

**Visual rules**
- FYS is the outermost (widest) arc — the foundation.
- TURN is the innermost (smallest) arc — the peak.
- Stroke 7px, round caps. Track at 16% opacity, fill at 100%.
- Animates via `stroke-dashoffset` with the global `--ease-out` and 320ms duration.
- Lime SLAG ring is the only place lime appears in this component — leave it alone.

**Usage**
```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
<script type="text/babel" src="../_shared/PyramideRinger.jsx"></script>
<script type="text/babel">
  ReactDOM.createRoot(document.getElementById('root')).render(
    <PyramideRinger size={240} progress={{fys:.82, tek:.65, slag:.48, spill:.34, turn:.18}} showLabels />
  );
</script>
```
