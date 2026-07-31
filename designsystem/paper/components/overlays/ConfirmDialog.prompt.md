ConfirmDialog er dialogen som stopper et destruktivt valg. Den erstatter `window.confirm()`, som fortsatt står i `playerhq-live`.

```jsx
const slettRef = React.useRef(null);
const [åpen, setÅpen] = React.useState(false);

<Button ref={slettRef} variant="ghost" onClick={() => setÅpen(true)} dataOdId="cta-slett">Slett økt</Button>

<ConfirmDialog open={åpen} triggerRef={slettRef}
  kicker="Slett økt"
  title="Slette torsdagens økt?"
  body="Økten fjernes fra kalenderen og fra Emmas ukeplan."
  consequence="3 loggede serier og 2 videoklipp slettes permanent"
  confirmLabel="Slett økten"
  onConfirm={slett} onCancel={() => setÅpen(false)} />
```

## Fokusoppførselen ligger ikke her

Alt kommer fra `useOverlayLayer` i `components/overlays/overlay-focus.jsx`, kalt med **`modal: true`** — som i tillegg til fokusfelle, Escape på øverste lag, retur til utløseren og fallback gir:

- `inert` + `aria-hidden` på alle søsken opp til `<body>`, så skjermleserens virtuelle markør ikke kan bla i siden bak. En fokusfelle stopper bare Tab; dette er det som gjør dialogen faktisk modal, og det er et WCAG-krav.
- Scroll-lås på `<body>` (følger `modal` som standard).

**Skriv aldri en egen fokusfelle.** Mangler hooken noe, utvides hooken.

## Regler

- **`initialFocus: "layer"`, ikke første knapp.** Fokus lander på dialogen selv, så skjermleseren leser tittel og konsekvens før brukeren har en destruktiv knapp under fingeren. Tab velger deretter.
- **`title` er påkrevd** og er dialogens tilgjengelige navn (`aria-labelledby`). Komponenten varsler i konsollen hvis den mangler — en dialog uten navn skal ikke forekomme.
- **`confirmLabel` er et verb med objekt:** «Slett økten», «Fjern Emma», «Avpubliser planen». Aldri «OK», «Ja» eller «Bekreft» — brukeren skal kunne lese knappen alene og vite hva som skjer. `cancelLabel` er «Avbryt».
- **`consequence` er det uopprettelige, i mono på `--soft`:** hva som forsvinner, hvor mange. Er det ingenting uopprettelig, trenger handlingen sannsynligvis ikke en dialog i det hele tatt — da holder en `Toast` med angremulighet.
- **Ingen fylt rød flate.** Destruktiv bekreftelse er `Button variant="danger"` — `--dn` som tekst og ramme på papir. Fyll er reservert primærhandling (blekk) og OneThingNow (oransje); en rød flate ville brutt paletten. Vekten kommer fra ordlyden, men fargen må være der: uten den er bekreft-knappen bit-identisk med «Avbryt», i en dialog hvis hele jobb er å stoppe et uopprettelig valg.
- **`danger`-varianten hører i `Button.jsx`, ikke her.** Første forsøk la `.akhq-cdlg-danger>.akhq-btn` i ConfirmDialogs `@layer akhq-base`. Selektoren matchet seks elementer og anvendte ingenting: `Button.jsx` er ulagret inntil lagmigreringen, og **ulagret CSS vinner over lagret uansett spesifisitet**. Tredje forekomst av samme feilklasse. Skal du style en annen komponents element, gjør det i den komponentens egen fil.
- **`busy` under utføring:** begge knappene disables, Escape og klikk utenfor sperres, bekreft-knappen viser «Jobber …». En dialog som lukkes midt i en sletting etterlater brukeren i uvisshet.
- **Bruk den bare når handlingen ikke kan angres.** Kan den angres, er `Toast` med «Angre» bedre — den koster ingen avbrytelse. Tre skjermer trenger dialog; ikke gjør det til standardmønsteret for hver sletting.
- Handlingene stables i omvendt rekkefølge under 340px container (bekreft nederst, nærmest tommelen).
- **`preview` er kun for spesimenkort** og slår av all laglogikk — inert, scroll-lås, fokusfelle, stack — i tillegg til å rendre dialogen i flyten. Grunnen er hardere enn for `DropdownMenu.defaultOpen`: åtte samtidig åpne modale lag i ett kort låste `body.overflow` permanent, så kortet ikke kunne rulles i det hele tatt. En modal komponent kan ikke rendres «alltid åpen» uten en eksplisitt kortmodus. Bruk den aldri i produkt — en dialog uten modalitet er en dialog uten tilgjengelighet.
