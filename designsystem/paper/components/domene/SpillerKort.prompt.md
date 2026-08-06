# SpillerKort

Spilleren i stallen. Ett treffmål. Kategori er fargeløs tag.

```jsx
<SpillerKort name="Øyvind Rohjan" category="Kategori C"
  meta="AK Golf Academy · sist aktiv i går" kpiValue="72,4" kpiLabel="snitt"
  onClick={aapneProfil} dataOdId="stall-oyvind" />
<SpillerKort name="Emma Berg" category="Junior Utvikling" badge="Venter samtykke" badgeTone="warn" onClick={aapneProfil} />
```

- Ett treffmål: hele kortet åpner profil-artefaktet. Aldri små ikonknapper
  inni — handlinger bor i profilen.
- Kategorien går ALLTID som `StatusBadge kind="tag"` (fargeløs) —
  StatusBadge-regelen om AK-vokabular er bindende. Status (venter, ny)
  bruker kind=status-tonene.
- Grensen mot `ListRow`: generiske rader bor der; spillerkortet eier
  stall-anatomien (avatar + kategori + én KPI) så stallen leser likt overalt.
- Terskel 340 px: KPI-kolonnen ryker — navn og status står.
- Gulv: 64 px ved grov peker — raden er primærnavigasjon i stallen.
