Dialog for AgencyOS (desktop). Scrim er blekk 40 % (dokumentert konstant). Sentrert, maks 420px.

```jsx
<Modal title="Avslutt økten?" onClose={close} actions={<><Button variant="ghost" onClick={close}>Avbryt</Button><Button dataOdId="cta-confirm">Avslutt</Button></>}>
  Loggen lagres og deles med treneren din.
</Modal>
```

Fixed-posisjonert; i spesimenkort: gi forelderen `transform:translateZ(0)` så scrimen holder seg i kortet.
