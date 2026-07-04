Dispersion-plot; bruk for TrackMan-økter — spredning carry × side per kølle.

**Kryssreferanse:** Spredning side = `DispersionPlot` (denne, kanonisk). Lengdeavvik fra mål = `data/LengdeAvvik`.

```jsx
<DispersionPlot
  slag={[
    { kolle: "6i",  carry: 163.2, side: 11.9 },
    { kolle: "6i",  carry: 167.5, side: 3.1 },
    { kolle: "52w", carry: 98.4,  side: -2.6 },
    // …ett objekt per slag; side: negativ = venstre
  ]}
  koller={[
    { id: "6i",  navn: "6-jern" },
    { id: "52w", navn: "52° wedge" },
  ]}
/>
```

- Skyteskive-look: graphite avstandsbuer fra origo + mållinje; ingen annen dekor.
- Serier (maks 5) er farge- OG form-kodet (`TM_SERIER`: akse-farger + sirkel/firkant/trekant/diamant/kryss).
- Legend er filter (klikk for å skjule/isolere); teller per kølle.
- **Konsistens-ellipsen (1,5σ) er innsikten** — stiplet i køllefargen, lime når én kølle er isolert. `ellipse={false}` slår av.
- Hvert punkt er fokuserbart m/ tooltip (kølle · carry · side V/H); SVG-en har skjermleser-sammendrag per kølle.
- Tall i mono/tabular med norsk komma. `hoyde` (px, default 280) for kompakte flater.
