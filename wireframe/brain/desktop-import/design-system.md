# Design System — AK Golf HQ (Sprint 0 Foundation)

> **EN SANN KILDE** etter Sprint 0 konsolidering 2026-05-10.
> Heritage Grid (M3) er DEPRECATED. All ny kode bruker Sprint 0 tokens.

**Designfasit:** `public/design-reference/` + `~/Documents/Claude/akgolf-platform/branding-style-guide.html`

---

## TYPOGRAFI

| Bruk | Font | CSS-variabel | Storrelse |
|---|---|---|---|
| Hero-greeting | **Inter Tight** italic | `--font-inter-tight` | 36px, -0.02em |
| Seksjonstittler | **Inter Tight** bold | `--font-inter-tight` | 24px, -0.01em |
| KPI-tall | **JetBrains Mono** medium | `--font-jetbrains-mono` | 32-48px, tabular-nums |
| Body | **Inter** regular | `--font-inter` | 15px |
| Labels | **Inter** medium uppercase | `--font-inter` | 12px, 0.04em spacing |

Bruk italic sparsomt — maks 1 per skjerm for personlig element.

**LEGACY:** DM Sans og Material Symbols migreres i Sprint 2.

---

## FARGER

### Brand
- `--color-primary: #005840` — skogsgronn, primaer brand
- `--color-primary-hover: #00472f`
- `--color-primary-soft: #E8F0EC`
- `--color-primary-deep: #003B2A`

### Accent (bold lime)
- `--color-accent: #D1F843` — high-energy lime
- `--color-accent-hover: #C2EE2F`
- `--color-accent-on: #0A1F18` — tekst PA lime-bg
- `--color-accent-bg: rgba(209,248,67,0.12)` — featured kort-bakgrunn
- `--color-accent-fill: rgba(209,248,67,0.25)` — progress-bars, gradient-fill
- `--color-accent-soft: #ECFCC0` — subtile accent-bokser

### Surface (varm krem)
- `--color-surface: #FAFAF7` — varm krem bakgrunn
- `--color-surface-alt: #F5F2EA` — differensierte seksjoner (sand)
- `--color-card: #FFFFFF`

### Tekst (varmere gra-toner)
- `--color-ink: #0A1F18` — primaertekst (gronn-svart)
- `--color-ink-muted: #5E5C57` — sekundaertekst
- `--color-ink-subtle: #9C9990` — tertiaertekst
- `--color-ink-disabled: #C4C0B8`

### Borders (varmere)
- `--color-line: #E5E3DD`
- `--color-line-soft: #EFEDE6`

### Status (raffinert)
- `--color-success: #1A7D56` / `--color-success-bg: #E5F1EA`
- `--color-warning: #B8852A` / `--color-warning-bg: #FFF0D6`
- `--color-danger: #A32D2D` / `--color-danger-bg: #FAE3E3`

### Sidebar-spesifikke
- `--player-sidebar-bg: #FFFFFF`
- `--player-sidebar-border: #F0EDE5`
- `--player-sidebar-active: rgba(0,88,64,0.08)`
- `--coach-rail-bg: #061210`
- `--coach-nav-bg: #FAFAF7`
- `--coach-nav-active: rgba(209,248,67,0.30)`

### Landing
- `--landing-hero-bg: #0A0A0A`
- `--landing-hero-text: #FFFFFF`

---

## RADIUS

| Token | Verdi | Bruk |
|---|---|---|
| `--radius-card` | 20px | Standard kort |
| `--radius-sidebar-pill` | 12px | Sidebar nav pills |
| `--radius-button` | 12px | Knapper |
| `--radius-input` | 10px | Inputfelter |
| `rounded-full` | 9999px | Pills, avatars, prikker |

---

## SHADOWS

| Token | Verdi | Bruk |
|---|---|---|
| `shadow-card` | `0 1px 2px rgba(15,31,24,0.04), 0 4px 12px rgba(15,31,24,0.04)` | Standard kort |
| `shadow-card-hover` | `0 1px 2px rgba(15,31,24,0.06), 0 14px 32px rgba(15,31,24,0.08)` | Kort hover |
| `shadow-rim` | `inset 0 0 0 1px rgba(15,31,24,0.06)` | Subtil indre kant |
| `shadow-accent-glow` | `0 0 0 1px rgba(209,248,67,0.5), 0 8px 24px rgba(209,248,67,0.18)` | Accent CTA |

---

## IKONER

Lucide, `stroke-width: 1.75` (lettere enn default 2).

| Storrelse | Tailwind | Bruk |
|---|---|---|
| 18px | `w-4.5 h-4.5` | Standard |
| 20px | `w-5 h-5` | Headers |
| 24px | `w-6 h-6` | Hero/empty-states |

---

## KORT-HIERARKI (3 nivaer)

| Nivaa | Bg | Border | Radius | Shadow |
|---|---|---|---|---|
| **Flush** | transparent | ingen | - | ingen |
| **Standard** | hvit | 1px `--color-line` | 20px | `shadow-card` |
| **Featured** | `--color-accent-bg` | 1px `--color-line` | 20px | `shadow-card-hover` |

---

## LIME-BRUK

**JA:** CTA-knapper, active pills, streak-prikker, progress-fill, positiv delta
**NEI:** store bakgrunnsflater, tekst-farge, alle badges
**Maks 3 lime-elementer** synlige samtidig per skjerm.

---

## MOTION

- Ease-out: `cubic-bezier(0.16, 1, 0.3, 1)` pa entrance
- 120ms mikro, 200ms kort, 320ms stor
- Aldri bounce/spring

---

## FOTOGRAFI

- Golfbane i desaturert varm tone
- Glassmorfisk overlay, aldri frittstaende
- Landing hero: foto + mork overlay 0.65 opacity

---

## ANTI-AI-REGLER

1. Flat avatar-farger (ingen gradienter)
2. Asymmetriske grid-layouts (ikke uniform 3x1)
3. Ingen `translateY(-3px)` hover pa alt
4. Maks 1-2 eyebrows per skjerm
5. Variert seksjonslayout pa landing
6. Redusert pill-tetthet
7. Ingen ambient-glow dekorasjoner
8. Sterkere typografisk kontrast mellom nivaer

---

## FORBUDTE TOKENS (migreres Sprint 2)

- `#154212` (Heritage primary) -> `#005840`
- `#d2f000` (Heritage accent) -> `#D1F843`
- `#fdf9f0` (Heritage surface) -> `#FAFAF7`
- `#1c1c16` (Heritage on-surface) -> `#0A1F18`
- DM Sans -> Inter / Inter Tight
- Material Symbols -> lucide-react
- `--hg-*` -> fjernet
- `--color-portal-*` -> fjernet

---

## AUTHORITATIVE FILES

- `app/globals.css` — alle tokens i `@theme inline`
- `app/layout.tsx` — Inter + Inter Tight + JetBrains Mono
- `.claude/rules/branding.md` — designretning og anti-AI-regler
- `.claude/rules/component-library.md` — komponent-katalog
