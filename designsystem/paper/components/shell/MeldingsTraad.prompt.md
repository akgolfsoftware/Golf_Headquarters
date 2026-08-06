# MeldingsTraad

Samtalen. Motpart venstre, du høyre. Composer eier skrivingen.

```jsx
<MeldingsTraad dataOdId="coach-chat" messages={[
  { divider: "i dag" },
  { author: "Anders Kristiansen", time: "08:12", text: "Så på TrackMan-tallene fra i går — wedge-serien din er den beste i år." },
  { self: true, time: "08:31", text: "Kjente det også! Skal jeg holde samme opplegg på torsdag?" },
]} />
```

- Rolige flater, aldri farge: en samtale er ikke datasemantikk. Egne
  meldinger er soft uten border; motpartens surface med border.
- Avsender + tid står OVER boblen i mono — aldri inni, så tekst kan
  markeres og siteres rent.
- Grensen mot `Composer` (shell): tråden viser, composeren skriver — de
  komponeres alltid sammen i chat-flatene. Grensen mot `Tidslinje`:
  hendelser bor der; dette er dialog.
- Dagskiller sendes som rader (`{ divider: "i dag" }`) — konsumenten eier
  grupperingen (Oslo-datologikk i appen).
- Terskel 420 px: boblene slipper 52ch-taket og bruker full bredde.
