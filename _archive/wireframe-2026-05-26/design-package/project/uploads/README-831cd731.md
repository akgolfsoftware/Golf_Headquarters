# For claude.ai/design — opplastings-pakke

**Bruk denne mappa når du laster opp filer i claude.ai/design.**

Innholdet er sanitised (ASCII-sikker) og inkluderer fontfiler — slik at det ikke blir encoding-problemer eller "Missing brand fonts"-varsler.

---

## Hvorfor en egen mappe?

Claude Design parserte de første filene med Latin-1 i stedet for UTF-8 → norske tegn (æ/ø/å) og em-dash (—) ble korrupt (`â€"` osv). Denne mappa har **0 non-ASCII-tegn** i tekst, og inkluderer fontene Claude Design ikke kunne hente automatisk.

---

## Hva du laster opp i Claude Design

### 1. Designsystem (2 filer)
- `branding-style-guide.html` — visuell systemreferanse (sanitised)
- `design-system-v2.md` — tekstuell backup-spec (sanitised)

### 2. Fonter (20 .woff2-filer i `fonts/`)

Last opp **alle filene i `fonts/`-mappa**. De er splittet etter unicode-subset (latin, latin-ext, etc.) for hver font-vekt — Claude Design plukker det som trengs.

**Hva fontene er:**
- `inter-tight-*.woff2` — Inter Tight (display, hero-headlines, italic editorial)
- `inter-*.woff2` — Inter (body, UI default)
- `jetbrains-mono-*.woff2` — JetBrains Mono (KPI-tall, tabular nums, kode)

**CSS-mapping** (Claude Design trenger denne mapping i `colors_and_type.css`):
```css
@font-face { font-family: 'Inter Tight'; src: url('inter-tight-1.woff2') format('woff2'); }
@font-face { font-family: 'Inter'; src: url('inter-1.woff2') format('woff2'); }
@font-face { font-family: 'JetBrains Mono'; src: url('jetbrains-mono-1.woff2') format('woff2'); }
```

(Hvis Claude Design ikke gjør dette automatisk, lim det inn manuelt eller be Claude i samme session om å generere `@font-face`-reglene.)

### 3. Logoer (når Claude Design spør)

Last opp alle 7 SVG-er fra `wireframe/screen-deck/assets/logos/`:
- `ak-golf-logo-primary-on-light.svg` (default)
- `ak-golf-logo-primary-on-dark.svg`
- `ak-golf-logo-white-on-green.svg`
- `ak-golf-logo-white-on-dark.svg`
- `ak-golf-logo-primary-mono.svg`
- `ak-golf-logo-black-mono.svg`
- `ak-golf-logo-white-mono.svg`

---

## Hvis du ser encoding-feil ennå

Sjekk i CSS-output: `--` skal være ren ASCII-hyphen, ikke em-dash (`—`). Hvis du ser `â€"` eller andre `â`-prefikser, er filen lest som Latin-1.

**Workaround:**
- Gi Claude i samme session beskjed: "Filene er UTF-8. Erstatt alle `â€"` med `--` og `Ã¦/Ã¸/Ã¥` med `ae/oe/aa` i CSS-output."

---

## For batch-pakkene (batch-1, batch-2, ...)

Pakkene i `wireframe/design-batches/` er IKKE sanitised — de er for menneske-lesing i editor. Hvis du laster en pakke direkte i Claude Design og ser encoding-feil, kjør først:

```bash
python3 wireframe/brain/for-claude-design/sanitize.py wireframe/design-batches/batch-1-dashboard/01-coachhq-hub.md
```

(Skriptet lages neste runde hvis behovet bekreftes.)
