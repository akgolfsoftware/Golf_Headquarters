# VideoScrubber

Tidsnavigasjon i video. Native range — tastatur og skjermleser gratis.

```jsx
<VideoScrubber value={bilde} max={480} onChange={settBilde}
  currentLabel="bilde 214" endLabel="bilde 480" dataOdId="sving-scrubber"
  markers={<>
    <PositionMarker label="P1" pct={4} onSelect={() => hopp(0.04)} />
    <PositionMarker label="P6" pct={52} active onSelect={() => hopp(0.52)} />
  </>} />
```

- Native `input[type=range]` med hensikt: piltaster, Home/End og
  skjermleser følger med gratis — en tegnet scrubber måtte gjenoppfinne
  alt. `aria-valuetext` bærer den lesbare posisjonen («bilde 214»).
- Markørfeltet over sporet tar `PositionMarker`-noder — scrubberen
  plasserer dem ikke selv; konsumenten sender pct per posisjon.
- Grensen mot `Slider` (forms): skjemaverdier bor der. Scrubberen er
  video-tid, med markørspor og bildenummer.
- Gulvet ligger på selve input-elementet (24→44 px høyde ved grov peker) —
  sporet forblir 4 px visuelt.
- Kontrollert alltid; uten onChange rendres den readOnly (lesevisning).
