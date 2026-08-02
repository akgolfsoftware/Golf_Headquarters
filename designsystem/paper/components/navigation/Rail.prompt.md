AgencyOS-navigasjonsskinne: 64px (56px ≤640px), alltid mørk uansett tema, tokenized-logo øverst, avatar nederst. Ikoner er Lucide 18px / 1,5px.

```jsx
<Rail current="hjem" onNavigate={setPage} items={[
  { id: "hjem", label: "Hjem", icon: <HomeIcon /> },
  { id: "stall", label: "Stall", icon: <UsersIcon /> },
]} />
```

Aktiv rad = papir 9 % fyll + --rail-on tekst. Skinnen setter selv `--logo-mark`/`--logo-dot` (papir/oransje).
