Akse plasserer ett målt tall på en skala, med målet ved siden av. Bruk den i «Neste steg» i foreldrerapporten og i presentasjoner der ett tall skal flyttes.

```jsx
<Akse etikett="Attack Angle, driver" enhet="°" min={-6} max={2} steg={1}
  verdi={-3.2} maal={-1} kilde="Trackman" dato="18.08.2026"
  forklaring="Køllehodet går nedover i treffet. Målet er −1,0° eller høyere." />
```

- Målingen er det ene signalrøde elementet. Målet står i fagfargen. Avstanden mellom dem er det svake båndet.
- TrackMan-parametere skrives på engelsk med stor forbokstav i etiketten.
- Uten `kilde` og `dato` rendres ikke aksen.
