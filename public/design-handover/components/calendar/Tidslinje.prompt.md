Tidslinje; bruk for stall-oversikt (bane per spiller), turneringsspor og anleggs-belegg — Notion-Timeline-mønsteret.

```jsx
<Tidslinje total={52} naa={25.4}
  ticks={[{ ved: 0, tekst: "Jan" }, { ved: 13, tekst: "Apr" }, { ved: 26, tekst: "Jul" }, { ved: 39, tekst: "Okt" }]}
  onFlytt={({ id, baneId, fra, til }) => flyttPeriode(id, baneId, fra, til)}>
  <Tidslinje.Bane id="oyvind" etikett="Øyvind Rohjan">
    <Tidslinje.Bar id="p1" fra={0} til={9} akse="FYS" onClick={åpnePeek}>Base</Tidslinje.Bar>
    <Tidslinje.Bar id="p2" fra={9} til={22} akse="TEK">Forberedelse</Tidslinje.Bar>
    <Tidslinje.Punkt ved={27} etikett="NM junior" />
    <Tidslinje.Punkt ved={30} variant="peak" etikett="Peak" />
  </Tidslinje.Bane>
  <Tidslinje.Bane id="mia" etikett="Mia S.">
    <Tidslinje.Bar id="p9" fra={4} til={14} akse="FYS" utkast>Base (forslag)</Tidslinje.Bar>
  </Tidslinje.Bane>
</Tidslinje>
```

- Enheter er abstrakte (uker her): `total`, `fra`/`til` (til eksklusiv), `ticks` — kalleren eier kalenderen.
- **DnD:** flytt-drag (snap til enhet, på tvers av baner), **kant-drag** i begge ender for varighet, tid-tooltip under drag, Escape avbryter; klikk uten bevegelse = onClick. Tastatur: Alt+←→ flytter, Alt+Shift+←→ endrer varighet.
- `utkast` = stiplet (AI-forslag/utkast); punkter: `turnering` (TURN-diamant) og `peak` (lime — maks ÉN per visning, kanon).
- Nå-markøren (`naa`) er lime hårlinje. Periodeplan består som ferdig-komponert spesialtilfelle for én spiller.
