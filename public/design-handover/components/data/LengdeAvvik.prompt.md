# LengdeAvvik

Lengdeavvik-scatter — side (x) × lengdeavvik fra mål (y, +langt/-kort), med
tilpasset 1σ-ellipse som viser mønsterets form. Mål alltid i sentrum.

**Kryssreferanse:** Spredning side (carry × side, TrackMan) = `trackman/DispersionPlot`.
Lengdeavvik fra mål = `LengdeAvvik` (denne).

## Bruk
```jsx
<LengdeAvvik
  shots={[{x:1.2,y:-3},{x:-0.5,y:2.1},{x:2.8,y:-1.4}, /* … */]}
  range={20}
/>
```
- Points fade+scale in with a light stagger on mount; hover glows the point and
  shows exact offline/distance in a tooltip.
- The dashed grey ellipse is the pattern shape, not a target zone — don't recolor
  it to a semantic color.
- Keep `range` generous enough that most shots land inside the plotted rings.
