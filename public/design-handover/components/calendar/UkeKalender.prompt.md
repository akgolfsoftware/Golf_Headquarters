# UkeKalender

7-kolonners ukegrid. Sesjonskort farget etter akse + compliance-prikk.

## Bruk
```jsx
<UkeKalender
  week={[
    { date: 23, today: true, sessions: [
      { time: "09:00", title: "Styrke", axis: "FYS", compliance: "on" },
      { time: "16:00", title: "Putting", axis: "SLAG", compliance: "planned" },
    ]},
    { date: 24, sessions: [{ title: "Banespill 9 hull", axis: "SPILL" }] },
    // ...6 dager totalt
  ]}
  onSessionClick={(s) => openSheet(s)}
/>
```

## Compliance-farger
- on → lime (på plan)
- off → coral (avvik)
- none → grå (ikke fullført)
- planned → faint (fremtidig)
