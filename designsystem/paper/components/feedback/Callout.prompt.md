Callout er en inline notis inne i et panel, under et felt eller i en flyt. Fire toner, ingen flere.

```jsx
<Callout tone="warn" label="Validering">Volum må være mellom 1 og 40 økter før planen kan publiseres.</Callout>
<Callout tone="privacy" label="Personvern">Foreldre ser sammendrag og betaling, aldri fritekstnotater fra økten.</Callout>
<Callout>Caddie foreslår, du godkjenner. Ingenting publiseres til spilleren uten at du sier ja.</Callout>
```

## Toner: fire, låst

| tone | ikon | etikett/ikonfarge | brukes til |
|---|---|---|---|
| `neutral` | notis | `--muted` | forklaring, presisering |
| `warn` | varsel | `--dn` | avvik, blokkerende validering, noe som må rettes |
| `info` | info | `--info` | opplysning, kilde, systemets oppførsel |
| `privacy` | laas | `--info` | hva andre ser — foreldreportal, deling |

- **Ingen «tom»-tone.** Tomhet eies av EmptyState (panel-/sidenivå) og Region (komponentnivå). Var «tom» oppført som Callout-tone tidligere, er det rettet.
- **Ingen venstrekant.** 3px venstrekant er OneThingNows signatur og skal aldri dukke opp her.
- **Brødteksten er alltid `--fg`.** Bare ikon og etikett tar tonefarge. Tonefarget brødtekst er både dårligere kontrast og feil signal — teksten er innhold, ikke status.
- Ikonet er **låst per tone**, ikke valgt per skjerm. Trengs en tone som ikke finnes, utvides tabellen her i biblioteket — ikke med et annet ikon i én skjerm.
- Etiketten er ikke `SectionLabel`: samme typografi, men fargen følger tonen. Derfor egen klasse.

## Ingen ARIA-rolle

Callout er statisk innhold. Den får **aldri** `role="alert"` eller `role="status"` — den finnes allerede når siden lastes, og en rolle ville fått skjermleseren til å annonsere den ut av kontekst. Skal noe *annonseres* fordi det oppsto av en handling, er det Banner med `announce="alert"`, ikke en Callout.

## Grensen mot Banner og Toast

- **Toast** — forsvinner av seg selv. Bekreftelse på noe som gikk bra.
- **Banner** — står til noe er løst eller lukket. Sidetilstand, bærer handling, full bredde.
- **Callout** — forklarer noe som alltid er sant på dette stedet. Går ikke bort, har ingen handling.
