# AK Golf Design System — speil

Speil av Claude Design-prosjektet **AK Golf Design System**
`87aa23fb-8eac-4ca4-aaa0-7a636f4318ff` (i «App design»). Dette er dagens
designautoritet, jf. [design-autoritet.md](../../docs/design-system/design-autoritet.md).

**Masteren er fasit. Rediger aldri noe her.** Endre i Claude Design, speil ned:

```
node scripts/speil-ak-golf-ds.mjs
```

Speilingen trenger en kortlevd serve-URL i `AKHQ_SERVE_BASE` (hentes med
`render_preview`). Den er prosjekt-scopet og skal aldri committes eller havne i
en logg.

## Ikke forveksle med `designsystem/ak-golf/`

Den mappa er et **eldre** merkesystem (`3e5c851c`), merket historisk 21.09.2026.
De to har ulike verdier og ulike tokennavn:

| | ak-golf (gammelt) | ak-golf-ds (dette) |
|---|---|---|
| Grunnflate | `--ak-grunn` `#E8E4DC` | `--surface-page` → `--sand-200` `#e6e3dd` |
| Handling | `--ak-signal` `#B83217` | `--action` → `--rust-600` `#9b2415` |
| Display | IBM Plex Sans Condensed | Oswald 600 |

Det gamle speilet lever til alle markedssidene er portert. Slett det ikke før da.

## Hva som er speilet

Kjeden ds-web faktisk trenger: `web.css` → `styles.css` + `tokens/marketing.css`
+ `components/marketing/marketing.css`. App-komponentene følger med fordi
`components/components.css` importerer dem.

**Ikke speilet:** komponentenes JSX, `.d.ts` og prompt-filer, lovsidene,
`ui_kits/`, `social/` og `assets/`. De leses i Claude Design. Trengs en av dem i
koden, legg stien til i `FILER` i speil-skriptet.

## Hvordan koden bruker det

`src/styles/ak-golf-ds.css` er eneste inngang. Tokenene er scopet til `.ak-ds`
av `scripts/ak-golf-ds-tokens.mjs`, fordi 36 av masterens variabelnavn kolliderer
med produktets egne. `npm run verify` feiler hvis den genererte filen har sklidd
fra speilet.
