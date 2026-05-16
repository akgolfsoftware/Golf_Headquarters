# Sesjon 1 — Hurtigstart

> Start her. 5 kjerneflater. ~45 minutter.

## Forhåndssjekk

- [ ] Åpne https://claude.ai/new
- [ ] Velg en sterk modell (Sonnet 4.6 eller Opus)
- [ ] Aktivér artifacts/design-mode

## Skjerm 1 av 5 — Krysstabell (VIKTIGST)

**Steg 1:** Kopier hele innholdet av filen `00-shared-spec.md` (start med `# Felles designspec`).

**Steg 2:** Trykk Enter et par ganger, lim deretter inn denne prompten:

```
Du er senior UI/UX-designer for AK Golf HQ. Design TRENINGSANALYSE KRYSSTABELL-skjermen — det viktigste analyse-verktøyet for coach Anders.

[lim spec over som referanse]

## Skjerm: Treningsanalyse Krysstabell
URL: /admin/analyse?view=krysstabell

### Kjerneprinsipp
"Tee Total" som treningsområde kan trenes som:
- TEK · L-KROPP · M0 = Teknikk-trening
- SLAG · L-AUTO · M2 = Golfslag-trening på simulator
- SPILL · L-AUTO · M4 = Driving på bane

Krysstabellen viser MINUTTER per kombinasjon av to dimensjoner. Tre helt ulike treningssignaturer for samme område.

### Layout — tre-panel
Standard CoachHQ-tre-panel.

### Hovedinnhold

#### Header
- Eyebrow: "COACHHQ · ANALYSE · KRYSSTABELL"
- Tittel: "Hvor trener hva trent som hva?" (italic på siste fragment)
- Sub: "Sammenlign treningsområde × pyramide for å forstå treningssignaturen din"

#### Dropdown-rad (top, sticky)
- "Rader (Y-akse):" [Treningsområde ▾]
- "× Kolonner (X-akse):" [Pyramide ▾]

Dimensjoner: Pyramide / Treningsområde / L-fase / CS-nivå / M-miljø / PR-press / Praksistype / Komponentfokus

#### Preset-knapper
[Område × Pyramide] (aktiv) · [Område × Miljø] · [Pyramide × Praksistype] · [L-fase × Komponentfokus]

#### Heatmap-tabell

Rader (16 treningsområder): TEE, INN200, INN150, INN100, INN50, CHIP, PITCH, LOB, BUNKER, PUTT 0-3, PUTT 3-5, PUTT 5-10, PUTT 10-15, PUTT 15-25, PUTT 25-40, PUTT 40+
Kolonner (5 pyramide-kategorier): FYS, TEK, SLAG, SPILL, TURN
Total-rad + total-kolonne

Realistiske minutter per celle (eks. TEE × SLAG = 360 min, TEE × TEK = 240, INN200 × SLAG = 180, osv.). Sum-totaler beregnet.

Heatmap-fargekoding:
- 0 min: lys grå (var(--secondary))
- 1-30 min: lys grønn
- 31-90 min: middels grønn
- 91-180 min: mørk grønn
- 180+ min: mørkest grønn med hvit tekst

#### Innsikts-banner under
3 caddie-funn:
1. "TEE-trening domineres av SLAG (50%) — vurder mer TEK-fokus (now 33%)"
2. "PUTT 0-3 ft er overweight på SPILL (50%) — TEK-konsistens kunne hjelpe"
3. "Ingen TEK på PUTT 5-10 ft — kritisk distanse-felt mangler systematisk trening"

#### Sliding panel (vist som åpen state nederst på skjermen)
Når Anders klikker celle TEE × SLAG (360 min):
- Panel 400px fra høyre
- Header: "TEE × SLAG · 360 min · 12 økter"
- Liste over 12 økter med dato, varighet, suksess-rate

Editorial moment: "Hvor trener hva *trent som hva?*" — italic på siste 3 ord.

Lever én HTML-fil med inline CSS. Vis BÅDE tabellen full og sliding panel som åpen state (nederst for context).
```

**Steg 3:** Trykk Send. Claude Design genererer HTML.

**Steg 4:** Lagre output som `docs/design-prompts/_outputs/coachhq/04.2-krysstabell.html`

**Steg 5:** Åpne i nettleser, vurder. Iterere om nødvendig.

---

## Skjerm 2 av 5 — Årsplan

I samme samtale (eller nytt vindu):

```
Send neste skjerm i samme samtale, eller start ny.

Bruk prompt 1.1 fra docs/design-prompts/01-treningsplanlegger.md.
```

Åpne filen `01-treningsplanlegger.md`, kopier hele prompt 1.1 (starter med `## Prompt 1.1 — Årsplan (Gantt 52 uker)`). Lim inn i Claude Design.

Lagre som `_outputs/coachhq/01.1-aarsplan.html`.

---

## Skjerm 3 av 5 — Turneringskalender

Fra `02-turneringsplanlegger.md` — Prompt 2.1.

Lagre som `_outputs/coachhq/02.1-turneringskalender.html`.

---

## Skjerm 4 av 5 — Live session aktiv

Fra `03-live-session.md` — Prompt 3.1.

Lagre som `_outputs/playerhq/03.1-live-aktiv.html`.

---

## Skjerm 5 av 5 — Caddie chat

Fra `05-coachhq-admin.md` — første prompt.

Lagre som `_outputs/coachhq/05.1-caddie-chat.html`.

---

## Etter Sesjon 1 er ferdig

```bash
cd /Users/anderskristiansen/Developer/akgolf-hq
git add docs/design-prompts/_outputs/
git commit -m "design: sesjon 1 ferdig — 5 kjerneflater"
git push origin main
```

Vis filene til Anders for godkjenning. Hvis OK → start Sesjon 2.

## Tips

- Hvis Claude Design produserer noe rart: legg til "Bruk eksakt token-paletten fra spec — IKKE eget design-bibliotek." og send igjen
- Hvis kontrast er feil (TURN hvit på lime): "Tekst på TURN-bakgrunn skal være #0A1F18 (mørk), aldri hvit"
- Hvis fonten er feil: "Bruk Inter Tight som display, ALDRI Lora eller Playfair"
- Hvis du vil se mobile-versjon: legg til "Lever både desktop 1440px og mobile 375px-versjon i samme HTML"
