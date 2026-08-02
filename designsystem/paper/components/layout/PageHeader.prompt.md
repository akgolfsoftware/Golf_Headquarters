PageHeader eier sidens h1 og er samme mønster på alle tre flatene: kicker → h1 → ingress til venstre, metadatalinje → handlinger bunnjustert til høyre. Topbar og Breadcrumbs i AgencyOS *supplerer* dette hodet, de erstatter det ikke — alle 66 skjermene har h1 her.

```jsx
<PageHeader
  kicker="Mandag 27. juli · uke 31"
  title="God morgen, Anders"
  lead="Tre ting trenger deg før lunsj. Resten kan vente — Caddie har allerede foreslått, du godkjenner."
  meta="Sist oppdatert 08:42"
  actions={<>
    <Button variant="ghost" dataOdId="cta-ny-okt">Ny økt</Button>
    <Button dataOdId="cta-ukesrapport">Ukesrapport</Button>
  </>} />
```

## Bindende: flere PageHeader per dokument er lovlig — skjulte visninger må ut av tilgjengelighetstreet

Tilstandsmaskinene (playerhq-live, playerhq-diagnose) har én PageHeader med h1 per visning, og bare én visning er aktiv om gangen. Det er gyldig **kun** når de inaktive visningene er fjernet fra tilgjengelighetstreet:

- Bruk `display: none` eller `hidden` på den inaktive visningen.
- Aldri `opacity: 0`, `visibility: hidden`, `height: 0` med overflow, `transform: translateX(-100%)` eller off-screen-posisjonering. Alle fire lar overskriften bli lest opp, og dokumentet får da 4 h1-er for skjermleseren mens det ser ut å ha én.
- `aria-hidden="true"` alene er ikke nok: elementet er fortsatt i tab-rekkefølgen.

Skal visningsbyttet animeres, animer en beholder som ikke inneholder overskriftene, eller sett `display:none` når animasjonen er ferdig.

Sett `level={2}` kun for et hode i en visning som bevisst ikke eier dokumentets h1 (inspektørpanel, master-detalj-detaljside). Aldri to synlige h1 samtidig.

## Verdier og handlinger

- `align-items: flex-end` er bevisst: handlingsklyngen bunnjusteres mot tekstblokken, ikke mot toppen. Ingressen bestemmer dermed hodets høyde.
- Ingressen er 14.5px Lora mot body 13.5px, med `max-width: 52ch`. Begge er tilsiktet — ingressen er prosa til leseren, ikke UI-tekst, og 52ch er lesbarhetsmålet. Ikke «rett opp» til 13.5 eller full bredde.
- **Avvik fra referanseverdien, bevisst:** referansen har `clamp(26px, 3vw, 32px)` på h1. Her er den `clamp(26px, 4cqi, 32px)` — samme trinn og samme ytterpunkter, men målt mot containeren i stedet for vinduet. `3vw` ville gitt hybriden beslutning 36 forbyr: i PlayerHQs 430px-spalte på en bred skjerm la resten av hodet om, mens tittelen holdt desktop-størrelse.

  Faktoren er 4, ikke 3, fordi containeren alltid er smalere enn vinduet — rail og sidepolstring spiser 250–300px i AgencyOS. Med `3cqi` falt midtbåndet ut: iPad i landskap (container ≈740px) ga 26px mot referansens ~31px. Målt mot referansen over hele båndet:

  | Kontekst | Container | Referanse (3vw) | Her (4cqi) |
  |---|---|---|---|
  | Desktop 1440 | ~1176 | 32 | 32 |
  | iPad landskap 1024 | ~740 | 30,7 | 29,6 |
  | iPad portrett 834 | ~550 | 26 (gulv) | 26 (gulv) |
  | PlayerHQ-kolonne | 430 | 26 (gulv) | 26 (gulv) |

  Avviket er dermed ~1px i landskapsbåndet og null i ytterpunktene. Port A-krav 2 måler iPad-båndet — se på det bevisst der, ikke bare på desktop og mobil.
- Kickeren er `SectionLabel`, ikke en kopi av den. Endres etiketten, endres den ett sted.
- Handlinger: maks 3, maks 1 primær — komponenten advarer i konsollen ved brudd. Panels én-kontroll-regel gjelder *ikke* her; sidenivået er stedet handlingsklyngen hører. Trengs en fjerde, hører den i en DropdownMenu.
- `meta` er mono 11/500 og står over knappene, ikke i tekstblokken: «Sist oppdatert 08:42», «12 spillere · 4 avvik».
- Under 640px **tilgjengelig bredde** (container query på hodets wrapper, ikke viewport) går metadata og handlinger i full bredde og venstrejusteres under tekstblokken, og gap/margin strammes inn. Hele omleggingen styres fra `@container`, ingen viewport-regler. Hodet oppfører seg dermed riktig også når det ligger i et inspektørpanel eller en 430px-spalte på en bred skjerm.
- Wrapperen `.akhq-phead-wrap` finnes bare for å være container — den er `display:block; width:100%` og legger ingen boks rundt hodet. Ikke fjern den; uten den kan hodet ikke query sin egen bredde.
