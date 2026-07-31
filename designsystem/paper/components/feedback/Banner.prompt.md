Banner er båndet over sideinnholdet: samme fire toner og samme ikonsett som Callout, men den annonserer en *sidetilstand* og bærer én handling.

```jsx
<Banner tone="warn" announce="alert" label="Validering" title="Planen kan ikke publiseres"
  actionLabel="Gå til uke 34">Uke 34 har 6 økter mot maks 5. Rett volumet før du publiserer.</Banner>

<Banner tone="info" announce="status" label="Drift" closable>
  TrackMan-synk er forsinket. Tall fra i dag kan mangle til 14:00.</Banner>
```

## Grensen mot Toast og Callout — skriv den ikke om per skjerm

- **Forsvinner av seg selv** → Toast. Flyktig bekreftelse, ingen handling, ingen lukkeknapp.
- **Står til noe er løst eller lukket** → Banner.
- **Forklarer noe som alltid er sant her** → Callout. Ingen handling, ingen lukking.

Er du i tvil, spør: kan brukeren gjøre noe med den? Ja og den blir stående → Banner. Nei og den forsvinner → Toast.

## ARIA-roller: `announce`

- `announce="none"` (standard) — båndet finnes ved sidelasting. **Ingen rolle.** Et bånd som allerede er der når siden åpnes, skal ikke avbryte skjermleseren.
- `announce="status"` — tilstanden oppsto uten brukerhandling (driftsmelding, forsinket synk). Høflig annonsering.
- `announce="alert"` — **KUN blokkerende validering utløst av en brukerhandling.** Brukeren trykket «Publiser», og båndet forklarer hvorfor det ikke gikk. Ikke til advarsler som bare er der, ikke til noe brukeren kan ignorere.

Feil rolle er verre enn ingen rolle: `role="alert"` på et bånd som alltid finnes, gjør at hver sidelasting starter med et avbrudd.

## Lukking er sesjonsbasert

`closable` gir et lukkekryss, og komponenten glemmer valget når siden lastes på nytt. **Banner skriver aldri til localStorage** og finner aldri opp en nøkkel. Skal et bånd huskes på tvers av besøk, håndterer skjermen det via `onClose` og sin egen nøkkel — skjermen eier nøkkelnavnet, ikke biblioteket.

## Øvrig

- Én handling, én ghost-knapp. To handlinger i et bånd finnes ikke; da hører valget i en modal eller på en side.
- `title` når teksten er mer enn én setning; ellers bare brødtekst.
- Brødteksten er alltid `--fg` — bare ikon og etikett tar tonefarge, som i Callout.
- Båndet ligger over sideinnholdet, under PageHeader. Det er ikke sticky og ikke fixed.
- **Container-terskel 460px** på `.akhq-banner-wrap`: under den flytter handlingsklyngen ned under teksten (fra tre grid-spor til to) i stedet for å klemme brødteksten til en smal søyle. Assertert i `guidelines/terskelrigg.html`, inkludert tilfellet «i Panel md 500» der containeren blir 462 og terskelen bevisst *ikke* fyrer.
- **Lukkekrysset har uunngåelig touch-gulv:** `width/height: max(var(--x), var(--x-floor))` med `--x-floor: 44px` under `pointer: coarse`. En modifikator kan gjøre krysset større, aldri mindre enn 44px.
