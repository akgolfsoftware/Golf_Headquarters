Dispersion: scatter + standardavviks-ellipse i --info-raw, kryssede hjelpelinjer, alltid enhet og retning (m H/V).

```jsx
<DispersionMap club="Jern 7 · TrackMan" ellipse={{ rx: 42, ry: 60 }} stats={{ side: 6.4, depth: 9.2, count: 20 }}
  points={[{ x: 10, y: -22 }, { x: -18, y: 8 }, { x: 4, y: 30 }]} />
```

## K10-utvidelse (03.08.2026): baseline og hit-rate

```jsx
<DispersionMap club="Wedge 60 m" ellipse={{ rx: 34, ry: 44 }}
  baseline={{ rx: 48, ry: 62, label: "mai–juni" }}
  target={{ r: 28 }} hitRate={{ display: "62 %", zone: "5 m" }}
  stats={{ side: 4.1, depth: 6.0, count: 24 }}
  points={[/* … */]} />
```

- `baseline` er FORRIGE periode/referanse: stiplet --mid-ellipse tegnet BAK
  dagens — fremgang synes som at blå ellipse ligger inni grå. Alltid med
  `label` («mai–juni») så leseren vet hva stiplet betyr; etiketten skrives
  under kartet, aldri bare i en tooltip.
- `target` + `hitRate` er Presisjonsstrategiens målsone (buffer-tenkingen):
  sirkel i --up-raw + «hit-rate 62 % innenfor 5 m». Hit-rate regnes av
  konsumenten — kartet teller aldri selv.
- Bakoverkompatibel: uten nye props rendrer kortet nøyaktig som før.
