The AK training pyramid as a readable bar graph; use on player profiles, plan-builder and the coach's player panel.

```jsx
<Pyramid
  activeAxis="SLAG"
  data={[
    { axis: "TURN", value: 40, plan: 50 },
    { axis: "SPILL", value: 62, plan: 60 },
    { axis: "SLAG", value: 71, plan: 75 },
    { axis: "TEK", value: 84, plan: 80 },
    { axis: "FYS", value: 90, plan: 85 },
  ]}
/>
```

- One labelled bar per axis (FYS / TEK / SLAG / SPILL / TURN), rendered apex→base.
- **activeAxis** highlights one axis in lime; the rest stay neutral (lime is a signal, not five colors).
- **plan** on a row draws a target marker — reads faktisk-vs-plan at a glance.
- Keep it a graph, not decoration. Don't recolor each axis differently.
