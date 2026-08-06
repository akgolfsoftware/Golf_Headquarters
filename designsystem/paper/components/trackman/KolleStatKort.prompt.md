# KolleStatKort

Én kølle i dybden. Snitt uten spredning lyver.

```jsx
<KolleStatKort club="Jern 7" count={22} carry="168 m" carrySpread="±4,2 m"
  dataOdId="j7-stat" rows={[
    { label: "Ballhastighet", value: "53,1 m/s" },
    { label: "Spinn", value: "6 400 rpm" },
    { label: "Apex", value: "31 m" },
    { label: "Landingsvinkel", value: "48°" },
  ]} />
```

- `carrySpread` skal ALLTID følge `carry` — dispersion med enhet er
  golfdataregelen, og et snitt uten spredning er ubrukelig for gapping.
- Grensen mot `GappingChart` (golfviz): alle køllene mot hverandre bor der;
  dette kortet er én kølles fulle bilde. Grensen mot `KeyValueGrid`:
  generiske par uten hero — køllekortet eier carry-heroen.
- Radene har hårlinjer, siste rad ALDRI strek (sett lukkes ikke).
- Chromeless: flaten eies av `Panel` (K2 avventer Anders).
