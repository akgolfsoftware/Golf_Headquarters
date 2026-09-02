Tabell for målinger og resultater. `maalt: true` på en kolonne gir mono, tabellsiffer og høyrestilling.

```jsx
<Tabell tekst="Trackman · 18.08.2026 · 38 målinger"
  kolonner={[{noekkel:'kolle',tittel:'Kølle'},{noekkel:'carry',tittel:'Carry (m)',maalt:true}]}
  rader={[{kolle:'Driver',carry:'241,8'}]} />
```

Tabellteksten er der kilde og dato hører hjemme. Tom tabell viser `tom`-teksten — aldri en blank flate.
