# SpillerGruppeVeksler

Hvem flaten handler om. Alle · grupper · enkeltspillere.

```jsx
<SpillerGruppeVeksler value={valgt} onChange={settValgt} allCount={15}
  dataOdId="kalender-kontekst" items={[
    { key: "wang", label: "WANG VG2", group: true, count: 6 },
    { key: "oyvind", label: "Øyvind Rohjan" },
    { key: "emma", label: "Emma Berg" },
  ]} />
```

- Grensen mot `FilterPills`: pills SNEVRER INN et sett som vises (og viser
  antall per valg); veksleren BYTTER KONTEKST — hele flaten handler om noen
  andre etterpå. Kalenderen bruker begge: veksler øverst, filtre under.
- «Alle» er først og er standardvalget (value=null) — coachen skal alltid
  kunne komme tilbake til oversikten med ett trykk.
- Valgt er blekkfylt (samme som DayStrip) — aldri oransje.
- Under 420 px container kollapser NAVNENE, aldri VALGENE — avatarene står,
  og navnet ligger i Avatars aria (decorative + knappens tekst).
- Radiogroup med roving tabindex; komponerer Avatar fra biblioteket.
