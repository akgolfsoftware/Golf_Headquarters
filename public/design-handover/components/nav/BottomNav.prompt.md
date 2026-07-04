# BottomNav

PlayerHQ 5-tab bunn-navigasjon. Fast til bunnen av viewport.

## Bruk
```jsx
<BottomNav
  items={[
    { icon: "home",       label: "Hjem",    active: true },
    { icon: "bar-chart",  label: "Analyse"  },
    { icon: "activity",   label: "Live",    badge: true  },
    { icon: "calendar",   label: "Plan"     },
    { icon: "user",       label: "Meg"      },
  ]}
  onSelect={(item) => setView(item.label)}
/>
```

## Props
- `items` — tab-elementer (icon Lucide-navn, label, active, badge=lime-prikk)
- `onSelect` — callback med valgt item

## Regler
- Aktiv: bakgrunnspille på ikonet (surface-hover)
- Badge: lime prikk øverst til høyre på ikonet
- safe-area-inset-bottom brukes automatisk
