# Fasit-avviksrapport — repoet mot akhq-tokens v3.1

**Dato:** 2026-08-14 · **Kilde:** `designsystem/paper/fase2/playerhq/w3-base.css` (tokens v3.1)
**Mandat:** rapport, ikke retting. Ordren sier eierens prioritering skal komme først.

## Konklusjon først

**Repoet står vesentlig bedre enn ordren antar.** Arbeidsordren ble skrevet mot en eldre
virkelighetsbeskrivelse og advarer om en fontkonflikt som allerede er løst. De reelle avvikene er
få og små — fire konkrete punkter, ingen av dem blokkerende.

| Sjekk | Resultat |
|---|---|
| Presis-rester (`#005840` / `#D1F843`) | **0 treff** i hele `src/` |
| Fonter — globale tokens | Poppins / Lora / IBM Plex Mono, korrekt |
| Fonter — scoped stylesheets | 1 avvik igjen (var: mange) |
| Radius utenfor stigen | 7 inline-forekomster |
| Clay-monopolet | Holder på tokennivå; krever visuell dom per skjerm |
| Treffmål 44 px | Ikke målbart statisk — se under |

---

## 1. Fontkonflikten i arbeidsordren er utdatert

Ordren sier: «repoet bruker Inter/Familjen Grotesk/JetBrains Mono i dag; FLAGG konflikten, ikke
bytt fonter uten eiers vedtak.»

**Det stemmer ikke lenger.** Byttet er gjennomført:
- `src/app/layout.tsx:16` dokumenterer at Inter, Familjen Grotesk og JetBrains Mono er fjernet.
- `src/lib/v2/tokens.ts:89-92` — `disp`/`ui`/`mono`/`bodyFont` peker alle på `--p-*`-tokenene.
- `src/styles/golfdata-tokens.css:44-46` og `src/components/onboarding/onboarding.css` peker på
  `--p-disp` / `--p-ui` / `--p-mono`.

CLAUDE.md §Stack lister disse filene som «hardkoder fortsatt gamle fonter». **Den påstanden er
utdatert og bør rettes** — den ble sann skrevet 06.08, men steg 10 (14.08) lukket den.

Av 349 filer som setter `fontFamily` inline går praktisk talt alle via `T.*`-speilet eller
`var(--p-*)`. Ingen scoped CSS hardkoder et fontnavn; de fire treffene er `font-family: inherit`.

### Det ene reelle fontavviket

`src/components/planlegge-v2/styles.css:42`:
```css
--font-body:    'Inter', system-ui, sans-serif;
```
Nabolinjene (41, 43, 44) er rettet til `var(--p-disp)` / `var(--p-mono)` / `var(--p-body)`.
Denne ene ble stående. Én linje å rette.

**Bonus-funn utenfor appen:** `src/lib/slack-alert.ts:104` hardkoder `'Familjen Grotesk'` i
e-post-HTML. Utenfor produktflatene, men samme drift.

### Utdatert påstand nummer to

CLAUDE.md sier `--font-ui` (Inter) «brukes fortsatt bredt» i golfdata- og workbench-komponenter.
Faktisk tall: **3 brukssteder**, og tokenen peker nå på `var(--p-ui)`. Ikke et problem.

---

## 2. Radius utenfor stigen

Fasitens stige: `8 / 12 / 16 / 24 / 999px` (`--r-sm`, `--r`, `--r-md`, `--r-lg`, `--r-pill`).

Inline `borderRadius` i `src/components/` med px-verdi:

| Verdi | Antall | Innenfor stigen? |
|---|---|---|
| 4px | 1 | Nei |
| 10px | 2 | Nei |
| 18px | 2 | Nei |
| 20px | 3 | Nei |
| 24px | 1 | Ja |

**7 forekomster å rette.** Lite arbeid, men verdt en lint-regel så det ikke gror tilbake —
samme mønster som typografi-vakten i PR #462.

---

## 3. Clay-monopolet

Fasitene selv bruker ordet «clay» én gang totalt (`playerhq-betaling.html`) — monopolet håndheves
der ved disiplin, ikke ved klassenavn.

I repoet: **10 brukssteder** av clay som *fyll* (utenom `accent-soft`, `accent-fg`, kanter og
fokus), fordelt på FangstSheet, de tre Live-flatene, og fire marketing-komponenter.

Live-flatene og «Én ting nå» er legitime bærere. Marketing-bruken kan være det, men **dette er
ikke et spørsmål statisk telling kan avgjøre** — monopolet betyr én oransje handling per skjerm,
og det må ses. Hører hjemme i skjermbilde-gaten, ikke i en grep-rapport.

Hardkodet clay-hex utenfor `paper-tokens.css`: 17 treff, men 12 av dem er kommentarer som
*forklarer* monopolet. Reelle verdier: `stats.css` (1), `core.tsx` (1), `paper-katalog.css` (3),
`globals.css` (definisjonen — korrekt sted).

---

## 4. Treffmål under 44 px — ikke målt

Ordren ber om dette, men det kan ikke måles troverdig med statisk søk: knappehøyde kommer fra
padding, line-height, ikonstørrelse og klasser i kombinasjon. Et grep på `height:` ville gitt
tall som så presise ut og ikke var det.

**Anbefaling:** mål dette i Playwright i stedet — `boundingBox()` på alle interaktive elementer
ved 390 px. Det er en liten spec som kan kjøre i CI og gi et ekte tall. Foreslås som egen jobb.

---

## Foreslått prioritering

**Rett nå (10 minutter, null risiko):**
1. `planlegge-v2/styles.css:42` → `var(--p-body)`
2. De 7 radius-verdiene til nærmeste trinn i stigen
3. CLAUDE.md §Stack — fjern de to utdaterte påstandene om fonter

**Egen jobb:**
4. Treffmål-spec i Playwright (390 px, alle interaktive elementer)
5. Lint-vakt for radius-stigen, etter mønster fra typografi-vakten

**Krever din dom, ikke kode:**
6. Clay-monopolet på de fire marketing-komponentene — se skjermene, ikke tallene
