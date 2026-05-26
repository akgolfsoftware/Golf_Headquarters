# AK Golf Platform — PlayerHQ — Helse

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/meg/helse`
- **Arketype:** F — Settings + profile (helse-variant)
- **Tier-gating:** Pro+ (Free får kun "Du er aktiv" status uten detaljer)
- **HTML-referanse:** `wireframe/screen-deck/playerhq/meg-helse.html`
- **Audit:** finnes ikke ennå — generer i denne pakken
- **Tilhørende modaler:** `LogInjuryModal`, `LogIllnessModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Helse-skjermen er hvor Markus logger skader, sykdom, søvn og restitusjon. Dette mater inn i Periodisering-agenten (CoachHQ) som anbefaler deload-uker eller pyramide-justering. For Anders som coach er denne dataen kritisk — han ser den i `/admin/elever/markus`.

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec.

### Hero-strip (info-status)

Stor banner øverst: "Du er aktiv. Ingen pågående skader." (eller destructive om aktiv skade). Bakgrunn lyst-grønn (success/15) eller rød (destructive/15).

Hvis skade aktiv:
- "Pågående: Strekk i venstre håndledd (2 av 3 uker rehab)"
- Knapp: "Oppdater status →"

### Seksjon: Pyramide-restitusjon (siste 7 dager)

7 mini-kort i rad, ett per dag:
- Dag-label (M/T/O/T/F/L/S)
- Søvn-tall (timer, JetBrains Mono): "7,2"
- Restitusjon-prikk (groenn/gul/roed)
- Hover viser detaljer

### Seksjon: Skader (kronologisk tabell)

| Dato | Område | Type | Status | Varighet | Aksjoner |
|---|---|---|---|---|---|
| 18. apr 2026 | Venstre håndledd | Strekk | **Pågående** | 14 dager | "..." |
| 22. feb 2026 | Høyre kne | Smerte | Helbredet | 21 dager | "..." |
| 5. nov 2025 | Nedre rygg | Stivhet | Helbredet | 7 dager | "..." |

**Primary CTA:** `+ Logg ny skade` → `LogInjuryModal`

### Seksjon: Sykdom (kronologisk)

| Dato | Symptom | Varighet | Påvirket trening | Aksjoner |
|---|---|---|---|---|
| 12. mar 2026 | Forkjølelse | 4 dager | Ja (3 økter avlyst) | "..." |
| 28. jan 2026 | Mage | 2 dager | Nei | "..." |

**Primary CTA:** `+ Logg sykdom` → `LogIllnessModal`

### Seksjon: Daglig logging (toggles + sliders)

Vises som "I dag, fredag 10. mai":

| Felt | Input |
|---|---|
| Søvn forrige natt | Slider 0–12 timer (default: 7,5) |
| Energi | Slider 1–10 (default: 7) |
| Stivhet/smerte (1–10) | Slider |
| Stress | Slider 1–10 |
| Notat | Textarea (valgfritt) |

Knapp: `Lagre dagens logg` (primary)

### Seksjon: Coach-tilgang

Toggle-blokk:
- "Coach Anders kan se all helse-historikk" (på, default for junior)
- "Coach kan se kun siste 7 dager" (av)
- "Coach får varsel ved ny skade" (på)

## KPI-strip (4 kort)

1. Pågående skader: 1
2. Snitt-søvn siste 7d: 7,4 t
3. Snitt-energi siste 7d: 7,2/10
4. Avlyste økter pga helse YTD: 6

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Mini-dag-kort | default, hover (lift + tooltip med detaljer) |
| Restitusjon-prikk | grønn (>7t søvn + >6 energi), gul (mellom), rød (<5t søvn eller <4 energi) |
| Skade-rad "..." | meny: [Oppdater status] [Marker som helbredet] [Slett] |
| Slider | default, drag-thumb (accent), value-tooltip på drag |
| "Lagre dagens logg" | default, hover, loading, success (toast + reset til neste dag) |
| Coach-tilgang-toggle | av/på (accent), warning hvis junior prøver å skru av "Coach Anders kan se all helse" |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **Tier-gate Free:** Stor blur over hele helse-tabellen + CTA "Pro: Track skader, søvn og restitusjon → Oppgrader"
- **Empty skader:** "Ingen skader logget. Bra! Logg første om noe skjer →"
- **Empty daglig logg:** "Du har ikke logget i dag ennå. Tar 30 sek →"

## Ønsket output fra Claude Design

1. Lyst tema, Pro-tier, full data (1 pågående skade)
2. Mørkt tema, samme data
3. Tier-gate for Free (blur + upgrade CTA)
4. Daglig logg med sliders mid-drag
5. Empty-state skader (Markus uten historikk)
6. Mobil ≤640px — alle seksjoner stables, 7-dag-strip blir horisontal scroll

## Ikke-mål

- Ikke designe `LogInjuryModal`, `LogIllnessModal` (egen batch-7)
- Ikke designe coach-view av spillerens helse (det er i CoachHQ /admin/elever/:id — egen batch-3)
- Ikke designe Apple Health / Garmin-sync (framtidig integrasjon)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
