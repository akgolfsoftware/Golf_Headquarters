# LiveBar

Øktas tilstand som invertert linje. Finnes bare mens økta pågår.

```jsx
<LiveBar timeLabel="12:41" currentLabel="Blokk 2 av 4 · Wedge 40–90 m"
  nextLabel="Putting under press · 13:00" dataOdId="okt-live"
  actions={<Button size="sm" variant="ghost" dataOdId="live-pause">Pause</Button>} />
```

- Blekkfylt med hensikt: live-økta er det ENESTE stedet en hel linje
  inverteres — den skal aldri kunne forveksles med innhold. Flat-varianten
  (uten radius) fester linjen mot skjermkanten i fullskjerm-modus.
- Grensen mot `StatusBar` (shell): systemstatus (versjon, MRR, agentfeil)
  bor der, permanent. LiveBar er øktas puls og forsvinner med økta.
- LiveStatus komponeres med `inverse`-prop — aldri restylet herfra
  (eierskapsregelen).
- `actions` tar bibliotekets knapper; ghost-varianten leser riktig på blekk.
- Terskel 420 px: neste-linjen ryker — klokka og gjeldende blokk står.
