# Skjermplan — spec-modell

Levende kart over alle flater i AK Golf HQ, løftet fra tabell til **spec-modell** etter
mønster fra Fredrikstad Total. Hver skjerm utvides til sin komplette spesifikasjon:
tilstander, modaler/paneler, handlinger og detaljsider — utledet automatisk fra skjermtype.

## Filer

| Fil | Rolle |
|---|---|
| `data.js` | `window.PLAN` — alle skjermer (moduler → grupper → skjermer med 6 haker). **Auto-generert — ikke rediger for hånd.** |
| `spec.js` | `window.SPEC` — utleder tilstander/modaler/handlinger per skjermtype (`kind`) + bespoke tillegg per nøkkelskjerm. |
| `index.html` | Interaktiv visning (vanilla JS, ingen build). Åpne i nettleser. |
| `gen-data.mjs` | Generator: parser `docs/MASTER-SKJERMPLAN.md` → `data.js`. |

## Slik bruker du den

- **Se planen:** åpne `index.html` i nettleser. Klikk en skjerm for å se den utledede spec-en.
- **Oppdater etter endring i skjermplanen:** rediger `docs/MASTER-SKJERMPLAN.md` (sannhetskilden),
  så kjør:
  ```bash
  node docs/skjermplan/gen-data.mjs
  ```
  Det regenererer `data.js`. `index.html` og `spec.js` røres ikke.

## Hvordan status utledes

`data.js` regner status per skjerm fra de 6 hakene (Design · Mobil/Desktop/iPad · Adresse · Flyt · Data · Funker):

- **ferdig** — i praksis alle kategorier grønne (poeng ≥ 5 av 6; responsiv = snitt av mob/desk/iPad, så desktop-bare AgencyOS-skjermer ikke straffes urettferdig).
- **delvis** — designet, men ikke ferdig koblet.
- **planlagt** — ikke designet ennå (ruten finnes).
- **system / droppoff / mangler** — kuraterte spesial-seksjoner fra skjermplanen.

## Hvordan skjermtype (`kind`) utledes

`spec.js` → `inferKind()` leser rute + navn og gir én av: liste, detalj, dashbord, tavle,
kalender, skjema, pålogging, markedsside, **workbench, live-økt, analyse, test**, side.
De fire siste er golf-coaching-spesifikke (AK HQ sin utvidelse over Fredrikstad-modellen).

Sannhetskilde for selve skjermlisten er fortsatt `docs/MASTER-SKJERMPLAN.md`.
