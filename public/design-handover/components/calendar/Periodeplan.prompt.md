# Periodeplan

Horisontal sesongtidslinje med makro-faser (periodisering) og turnerings-markører.

## Bruk
```jsx
<Periodeplan
  totalWeeks={52}
  phases={[
    { label: "Base",           startWeek: 1,  durationWeeks: 8  },
    { label: "Forberedelse",   startWeek: 9,  durationWeeks: 10 },
    { label: "Spesialisering", startWeek: 19, durationWeeks: 12 },
    { label: "Taper",          startWeek: 31, durationWeeks: 4  },
    { label: "Peak",           startWeek: 35, durationWeeks: 8  },
  ]}
  tournaments={[
    { name: "NM", week: 38, prio: "A" },
    { name: "Krets", week: 28, prio: "B" },
  ]}
/>
```
