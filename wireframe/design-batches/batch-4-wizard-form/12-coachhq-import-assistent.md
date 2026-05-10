# AK Golf Platform — CoachHQ — Import-assistent

## Identitet

- **Produkt:** CoachHQ (cross-cutting — også brukt i Settings og fra Elever-list)
- **URL:** `/admin/import` (også åpnes som overlay fra `/admin/elever` og `/admin/sessions`)
- **Arketype:** D — Wizard / Form (3-step import-wizard)
- **Tier-gating:** Coach Pro+ for store import (>50 rader). Free får 50 rader/import.
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/import-assistent.html`
- **Audit:** `wireframe/audit/coachhq-import-assistent.md`
- **Tilhørende skjermer:** Elever (batch 2), Sessions (batch 2), Plans (batch 2)
- **Tilhørende kilder:** GolfBox, CSV, Trackman, Garmin Golf, Excel

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. CoachHQ-sidebar synlig. Wizard sentrert (max-width 960px — bredere enn andre wizards for å vise data-preview-tabell). Steg-indikator (numbers, **3 steg**).

## Spec — hva skjermen er for

Import-assistent lar Anders importere data fra eksterne kilder — typisk GolfBox-medlemslister, CSV-filer fra annen coaching-software, Trackman-økt-eksport, eller Garmin Golf-runder. 3 steg: velg kilde → last opp/koble til → match kolonner og preview → bekreft import. Viktig at preview-steget viser hvordan data vil bli mappet før commit, slik at Anders kan oppdage feil.

## Layout — UNIKT for denne skjermen

CoachHQ-sidebar venstre. Hoved-content sentrert.

### Steg-indikator (numbers, sticky 56px topp)

`(1) Velg kilde — (2) Koble til / Last opp — (3) Match og bekreft`

### Steg 1 — Velg kilde

Grid 2×3 med kilde-kort (180×140px hver):

- **GolfBox** (anbefalt — accent-badge): Logo + "Synkroniser medlemmer fra klubben"
- **CSV-fil** — ikon `FileText` + "Last opp CSV med spillere/økter"
- **Trackman** — logo + "Importer økt-eksport (CSV/JSON)"
- **Garmin Golf** — logo + "Synkroniser runder fra Garmin Connect"
- **Excel (.xlsx)** — ikon + "Last opp regneark"
- **Annet (manuell)** — ikon `Plus` + "Lim inn data manuelt"

Tooltip per kort: hvilke datatyper som kan importeres (medlemmer / økter / runder / TrackMan-data)

### Steg 2 — Koble til / Last opp (avhenger av kilde)

**For GolfBox / Garmin (OAuth):**
- "Koble til {kilde}-kontoen din" — stor ghost-button med leverandør-logo
- Etter klikk: ny fane → OAuth-flow → tilbake til denne wizard
- Når koblet: ✓ status + valgmulighet (hvilken klubb / hvilket år)

**For CSV / Excel / Trackman (fil-upload):**
- Drag-drop område (300px høyde, dotted border, accent ved drag-over)
  - Ikon `Cloud Upload` + "Dra fil hit, eller klikk for å bla"
  - Sub: "CSV, XLSX, JSON · max 10 MB · max 5000 rader"
- Etter upload: filnavn + størrelse + rad-antall + ✓-ikon
- Eksempel-filer-link: "Last ned eksempel-CSV →"

**For "Annet (manuell)":**
- Stor tekstboks med placeholder: "Lim inn data fra Excel eller annen kilde — vi prøver å gjette format"

### Steg 3 — Match og bekreft

Splitt-view:

**Venstre 50% — Kolonne-mapping:**
- Tabell: Vår-felt (venstre) ↔ Kilde-kolonne (høyre dropdown)
- Eksempel for spillere:
  - Fornavn ↔ dropdown: `[FirstName]`
  - Etternavn ↔ dropdown: `[LastName]`
  - E-post ↔ dropdown: `[Email]`
  - HCP ↔ dropdown: `[Handicap]`
  - GolfBox ID ↔ dropdown: `[MemberID]`
- "Auto-detekt"-knapp øverst (forsøker matching)
- Farge-status per rad: ✓ (matchet), ⚠ (gjettet), ✗ (manuell krevd)

**Høyre 50% — Live preview (5 første rader):**
- Tabell med slik dataen vil se ut etter import
- "Vis alle X rader →"-link

**Under split-view:**
- **Konflikter:** "3 spillere finnes allerede — Markus Pedersen, Henrik Nilsen, Anna Karlsen"
  - Radio: "Hopp over duplikater" / "Oppdater eksisterende" / "Spør per rad"
- **Validering:** "0 feil · 3 advarsler — [Vis detaljer ↓]"

### Footer (sticky)

- Venstre: `Avbryt`
- Høyre: `← Tilbake` + `Importer {N} rader →` (primary, accent)

## Klikkbare elementer

| Element | States |
|---|---|
| Steg-nummer-indikator | static, klikkbar tilbake |
| Kilde-kort (steg 1) | default, hover (lift), valgt (accent ring) |
| OAuth-koblings-knapp | default, hover, loading ("Kobler til …"), success (✓ + grønn) |
| Drag-drop område | default, hover, drag-over (accent border + overlay), uploaded (filnavn + ✓), error (rød border) |
| "Last ned eksempel-CSV →"-link | default, hover |
| Manuell-tekstboks | default, focus, with-text, parsing (spinner), parsed (rad-antall vises) |
| "Auto-detekt"-knapp | default, hover, loading, success (alle rader får ✓ eller ⚠) |
| Mapping-dropdown | default, open, valgt; rad-status: ✓ matchet, ⚠ gjettet, ✗ tom |
| Preview-tabell-rad | static, hover (highlight) |
| "Vis alle X rader →"-link | default, hover, klikk → utvider preview |
| Konflikt-radio | uvalgt, valgt |
| Valider-detaljer-expander | collapsed, expanded |
| `Importer {N} rader →`-CTA | default, hover, disabled (validerings-feil), loading ("Importerer …" + progress %), success (full-screen confirmation) |
| `Avbryt`-knapp | default, hover, klikk → confirm (fil-data mistes) |

## Empty / loading / error / success-states

- **Steg 2 upload error:** Drag-drop område får rød border + inline error: "Ugyldig filformat. Bruk CSV, XLSX eller JSON."
- **Steg 2 file-too-large:** "Filen er for stor (12 MB). Maks 10 MB. [Bruk CSV-eksempel →]"
- **Steg 3 mapping incomplete:** "X feltet kan ikke være tomt — velg kilde-kolonne eller hopp over import"
- **Steg 3 valideringsfeil per rad:** Klikkbar advarsels-detalj som åpner side-panel med liste over feil
- **Importer loading:** Hele wizard låst, progress-bar 0–100%, current-status: "Importerer rad 234 av 1247 …"
- **Importer success:** Full-screen confirmation: stort `CheckCircle`-ikon (accent), "X spillere importert · Y oppdatert · Z hoppet over" + CTA `Til oversikten →`
- **Importer error mid-flow:** Stop-knapp + delvis success: "X av Y rader importert før feil. [Detaljer →] [Prøv på nytt →]"

## Mobile (≤640px)

Sidebar hamburger. Wizard tar full bredde. Steg 3 split-view stables vertikalt (mapping over preview). Preview-tabell blir scrollbar horisontalt.

## Ønsket output fra Claude Design

1. Steg 1 lyst tema (6 kilde-kort, GolfBox anbefalt)
2. Steg 2 lyst tema, drag-drop (CSV-flyt, drag-over state)
3. Steg 2 lyst tema, OAuth-koblet (GolfBox-flyt, ✓ + klubb-velger)
4. Steg 3 lyst tema (mapping + preview, 3 konflikter)
5. Steg 3 lyst tema, mapping-dropdown åpen
6. Importer loading (progress 47%)
7. Importer success ("47 spillere importert")
8. Mørkt tema (steg 3)
9. Mobil ≤640px (steg 3 stacked)

## Ikke-mål

- Ikke designe selve OAuth-flyten (skjer i ny fane hos leverandør)
- Ikke designe scheduler for periodisk auto-import (egen pakke)
- Ikke designe export-assistent (egen pakke — speilet)
- Ikke designe konflikt-resolution per rad (egen sub-modal)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
