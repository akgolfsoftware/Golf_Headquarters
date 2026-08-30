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

## Faste krav per canvas

- Verdiene hentes fra `src/styles/train-lock-tokens.css`, aldri fra hukommelsen.
- Mobil 390 og Mac 1440 skal begge finnes. Lys og mørk skal begge finnes.
- Tom tilstand tegnes — det er den Anders møter oftest når køen er unnagjort.
- Ekte norsk skjermtekst, aldri lorem ipsum. Tall som ikke er målt, sies å være eksempler.

## Canvaser

| Mappe | Skjerm | Plan | Canvas |
|---|---|---|---|
| `ko/` | Kø — én adresse, fem faner | MASTERPLAN 15.1 | https://claude.ai/code/artifact/4df52812-fa4f-4654-8564-c46353fe430b |
