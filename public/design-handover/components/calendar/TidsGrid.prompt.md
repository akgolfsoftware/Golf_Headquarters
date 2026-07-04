Tidsgrid; bruk for coach-dag/uke med klokkeslett og availability-redigering (booking-vinduer).

```jsx
<TidsGrid fraTime={7} tilTime={20} naa={14.4}
  onFlytt={({ id, kolonneId, fra, til, retning }) => flyttOkt(id, kolonneId, fra, til, retning)}>
  <TidsGrid.Kolonne id="man" header="Man 19" onNyOkt={(t) => nyOkt("man", t)}>
    <TidsGrid.Blokk id="okt1" fra={9} til={10.5} akse="TEK" onClick={() => åpnePeek(okt1)}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>09:00</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Teknikk — Øyvind</span>
    </TidsGrid.Blokk>
  </TidsGrid.Kolonne>
  <TidsGrid.Kolonne id="tir" header="Tir 20" idag>
    <TidsGrid.Blokk fra={12} til={13} tilstand="apen" onClick={rediger}>…</TidsGrid.Blokk>
  </TidsGrid.Kolonne>
</TidsGrid>
```

- Compound: grid-et eier tidsaksen + nå-linjen; **innholdet i blokkene er children** (kortdesignet eies av kalleren — legg AKFormelChips der ved plass).
- **akse** gir semantisk venstrekant + soft bakgrunn; **tilstand** (`apen` stiplet / `holdt` amber / `booket` dempet) er for availability — bruk én av dem, ikke begge.
- **onNyOkt** aktiverer hover/fokus-«+ Ny» i tomme slots (Notion-mønsteret; tastatur når frem via Tab).
- Overlappende blokker: sett `spor`/`antallSpor` fra kalleren (grid-et beregner ikke overlapp).
- **Drag & drop:** sett `onFlytt` på grid-et + `id` på kolonner og blokker. Peker-drag snapper til :30 og
  følger på tvers av kolonner (tid-tooltip under drag); klikk uten bevegelse er fortsatt onClick.
  Tastatur: Alt+↑↓ ±30 min, Alt+←→ → `retning` (kalleren bytter dag); Escape avbryter.
  Kalleren eier all validering — kjør re-validering (plan-kvalitet) og evt. grunnkode-flyt i `onFlytt`.
- Nå-linjen (lime) tegnes i alle kolonner via `naa` (desimaltime); vis den kun i dags-/inneværende-uke-visning.
- Klikk-mål: blokker ≥20px høye; peek åpnes med klikk/Enter (Drawer/Sheet — aldri Modal).
