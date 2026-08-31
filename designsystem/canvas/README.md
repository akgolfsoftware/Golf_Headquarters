# designsystem/canvas — skjermer tegnet før de bygges

Arbeidsfilene bak canvasene som tegnes i Claude Design før en skjerm kodes
(Anders 30.08.2026, se `.claude/rules/beslutninger.md` §TEGN SKJERMEN FØR DU BYGGER DEN).

**Én mappe per skjerm/funksjon.** Hver mappe inneholder `.dc.html`-artboards og en
`canvas.json`. Filene er kilden — canvasen på claude.ai er utgaven. Endres tegningen,
endres filene her og canvasen seedes på nytt til samme URL.

## Forholdet til `designsystem/train-lock/`

| Mappe | Hva det er |
|---|---|
| `train-lock/` | **Fasiten.** 429 rammer levert fra Claude Design. Leses, endres aldri. |
| `canvas/` | **Utkastene.** Skjermer vi tegner selv før bygging, i Train-locks språk. |

Finnes det en tegnet Train-lock-fasit for skjermen, er den fasit — canvasen her
gjenskaper den i den sammenhengen skjermen faktisk skal stå i. Finnes ingen fasit
(nye IA-flater som Kø), er canvasen her utkastet Anders godkjenner.

## Slik seeder du en canvas på nytt

```
node "<design-skillens base>/seed-canvas.mjs" \
  --template "<design-skillens base>/payload.template.html" \
  --out <navn>.html --title "<Navn>" \
  --artboard Main.dc.html --artboard <flere>.dc.html \
  --canvas canvas.json
```

Publiser deretter med Artifact-verktøyet, og **send URL-en i samtalen** — Anders
jobber ofte fra mobil, og en filsti når ham ikke.

## To slag canvas — ikke samme krav

**Retningsutkast** svarer på ett spørsmål: er dette riktig inndeling? Tegnes bredt,
mange skjermer om gangen, så Anders kan velge retning før noe bygges.

**Byggeklar canvas** er den som ligger til grunn for en PR. Den må være komplett,
fordi koden skrives etter den.

| Krav | Retningsutkast | Byggeklar |
|---|---|---|
| Verdier fra `train-lock-tokens.css` | ja | ja |
| Ekte norsk tekst, umålte tall merket | ja | ja |
| Mac 1440 | ja | ja |
| Mobil 390 | for de skjermene Anders bruker daglig | ja |
| Lys modus | nei | ja |
| Tom tilstand | nei | ja |

Et retningsutkast som får ja, tegnes ferdig i bygge-PR-en. Presisert 30.08.2026
etter at STEG 15-utkastene ble tegnet — den opprinnelige regelen skilte ikke, og
ville i praksis stoppet bredden.

## Canvaser

| Mappe | Skjerm | Plan | Canvas |
|---|---|---|---|
| `ko/` | Kø — én adresse, fem faner | MASTERPLAN 15.1 | https://claude.ai/code/artifact/4df52812-fa4f-4654-8564-c46353fe430b |
| `agencyos-ia/` | Hele STEG 15: 13 funksjoner (retningsutkast) | MASTERPLAN 15.2–15.12 | https://claude.ai/code/artifact/581d1668-c627-42eb-a59c-1ba40bfe3751 |
| `team-norway/` | Team Norway Workdesk — 20 skjermer | MASTERPLAN STEG 17 | Ikke tegnet ennå — `BRIEF.md` + `PROMPT.md` er klare |
| `innsikt/` | Innsikt per spiller — coachens fire spørsmål | MASTERPLAN 16.9–16.11 | https://claude.ai/code/artifact/1b8c837e-9fbe-4f3e-8427-789978a17afc |


## `gen.py`

`agencyos-ia/gen.py` og `innsikt/gen.py` genererer artboards fra en datastruktur (rail, faner, rader,
Mac- og mobilskall). Tegner du flere skjermer i samme språk, gjenbruk den framfor
å skrive HTML for hånd — tokenverdiene står ett sted, og skallene blir like.
