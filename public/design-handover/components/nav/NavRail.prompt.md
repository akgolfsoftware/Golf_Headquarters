# NavRail

AgencyOS-ikonskinnen — 54px kollapsert, utvides til 244px på hover.

## Bruk
```jsx
<NavRail
  logo={<img src="ak-logo.svg" width={26} />}
  wordmark="AgencyOS"
  items={[
    { icon: "layout-dashboard", label: "Cockpit", active: true },
    { icon: "users", label: "Spillere", badge: 2 },
    { icon: "calendar", label: "Plan" },
    { icon: "brain", label: "AI-Caddie" },
  ]}
  bottomItems={[
    { icon: "settings", label: "Innstillinger" },
    { icon: "user-circle", label: "Anders K." },
  ]}
  onSelect={(item) => navigate(item.label)}
/>
```

## Props
- `items` — primære navigasjonspunkter (ikon + label + active + badge-tall + href)
- `bottomItems` — bunnen av skinneen (innstillinger, profil)
- `logo` — ReactNode for logoen øverst
- `wordmark` — tekst vist ved siden av logo når utvidet (standard "AgencyOS")
- `expanded` — tving utvidet tilstand (uten hover)
- `onSelect` — callback med valgt item

## Regler
- Aktiv element: lime venstrekant + `surface-2` bakgrunn
- Badge: lime pille; bare synlig i utvidet tilstand
- Hover-expand: transition 320ms, ingenting hopper
