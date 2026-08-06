# HjelpPopover

«?»-forklaringen. Klikkbar — virker også på touch, i motsetning til Tooltip.

```jsx
<HjelpPopover title="Hva er SG?" dataOdId="sg-hjelp">
  Strokes Gained måler hvert slag mot forventet resultat fra samme posisjon.
  Positivt tall betyr at du vant slag mot referansen.
</HjelpPopover>
```

- Grensen mot `Tooltip`: Tooltip er ren tekst ved hover/fokus og er SKJULT
  ved grov peker — ingen informasjon får finnes kun der. HjelpPopover er
  klikkbar og bærer forklaringer som SKAL nå alle.
- Konsumerer `useOverlayLayer` — Escape lukker, klikk utenfor lukker,
  fokus returnerer til «?». Aldri egen fokushåndtering.
- Kort tekst (én–tre setninger). Lengre forklaringer hører i et artefakt —
  panelet har ingen scroll med hensikt.
- Treffsonen er 44 px via ::after (gulvregel §2); knappen forblir 18 px
  fordi den står i tette panelhoder.
- `align="hoyre"` når knappen står ved høyre kant — panelet skal aldri
  klippes av containeren.
