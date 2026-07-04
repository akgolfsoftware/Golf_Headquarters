# GappingChart

Hele baggen: carry per kølle med ±spredning (whisker), og gap-varsler når avstandshullet mellom to nabo-køller er for stort eller lite. Avstander i **meter**.

## Bruk
```jsx
<GappingChart
  koller={[
    { navn: "Driver", carry: 248, spredning: 12 },
    { navn: "3-wood", carry: 228, spredning: 10 },
    { navn: "5-jern", carry: 175, spredning: 8 },
    { navn: "7-jern", carry: 152, spredning: 6 },
  ]}
  varsler={["Stort gap 3-wood → 5-jern (53 m) — vurder hybrid."]} />
```

## Domenefasit
Carry i meter; spredning som ± whisker om carry (bias + spredning adskilt — dispersion-fasit). Gap-varsler i klarspråk. Tomt = onboarding.
