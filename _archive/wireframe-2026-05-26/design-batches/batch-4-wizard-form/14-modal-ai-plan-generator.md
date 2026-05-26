# AK Golf Platform — Modal — AIPlanGeneratorModal

## Identitet

- **Produkt:** CoachHQ
- **Trigger:** "AI-generer →"-knapp i NewPlanModal steg 2 (pakke 13) eller Plan-builder steg 4 (pakke 7)
- **Type:** Multi-step modal (3 steg + spinner-state)
- **Tier-gating:** Coach Pro+ (Free får demo med dummy-output)
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/ai-plan-generator.html`
- **Audit:** `wireframe/audit/coachhq-plans.md` (modal-seksjon)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. CoachHQ-modal med accent-stripe topp (4px lime) som signaliserer AI-funksjon. Maks 3 lime per modal.

## Spec — hva modalen er for

AIPlanGeneratorModal lar Anders gi naturlig-språk-input om hva han vil agenten skal generere ("Markus skal forberede seg til Sørlandsåpent om 6 uker — fokus på TEK og bunkerspill"), velge generator-modus (konservativ / balansert / aggressiv), og se forslaget inkrementelt. Etter generering kan han "godta og legg til plan" eller "regenerer".

## Layout — UNIKT for modal

- **Modal-container:** Sentrert, max-width 720px, accent-stripe 4px topp, `rounded-xl` (12px), bakdrop som standard
- **Header (sticky, 72px):**
  - Tittel italic: «AI-generert plan» + Lucide `Sparkles`-ikon (accent)
  - Sub: steg-progress «Steg {n} av 3»
  - Lukk-X
- **Steg-indikator:** 3 dots

### Steg 1 — Brief

- **Kontekst-block (read-only fra parent-wizard):** "For Markus Pedersen · 9. mai – 30. jun 2026"
- **Tekstboks (multi-line, 6 rader):** placeholder "Beskriv målet og fokus med dine egne ord …"
- Forslag-chips under tekstboks (klikkbar → setter eksempel):
  - "Forberedelse til turnering"
  - "Ta opp progresjon etter pause"
  - "Bygg generelle ferdigheter"
  - "Jobbe med svake områder"
- **Generator-modus (radio):**
  - "Konservativ" — "Fokuser på det Markus allerede gjør bra"
  - "Balansert" (default, accent) — "Mix av styrking og utvikling"
  - "Aggressiv" — "Push hardt på svakheter"
- **Avansert (collapsible):**
  - Lengde-preferanse, ukentlig-volum, hvilke øvelses-kilder å bruke (eks. "Kun fra mal-bibliotek" / "Også eksperimentelle")

### Steg 2 — Genererer (loading state, ikke skippable)

- Sentrert sirkel-progress med subtil accent-glow
- Tittel italic: "Genererer plan for Markus …"
- Status-tekst som oppdateres live:
  - "Analyserer 12 ukers historikk … ✓"
  - "Vurderer pyramide-fokus … ✓"
  - "Bygger 32 økter …"
  - "Optimaliserer rekkefølge …"
- "Avbryt generering"-link nederst

### Steg 3 — Resultat (review)

- **Sammendrags-card:**
  - "32 økter over 8 uker"
  - Pyramide-donut + tall (TEK 32% / SLAG 28% / SPILL 18% / FYS 14% / TURN 8%)
  - "AI-konfidens: 87%" (progress-bar)
- **Plan-uke-fane** (kompakt, 8 uker): klikk for å se økter per uke
- **Per uke:** mini-liste med økt-titler + pyramide-stripes
- **Tre handlings-knapper i bunn av body:**
  - `← Endre brief` (tilbake til steg 1, behold tekst)
  - `↻ Regenerer` (samme brief, ny output)
  - `Bruk dette forslaget →` (primary, accent, lukker modal og legger inn i parent-wizard)

## Klikkbare elementer

| Element | States |
|---|---|
| Steg-indikator-prikk | static, klikkbar tilbake (steg 3 → 1, ikke 2) |
| Tekstboks | default, focus, with-text, max-length-warning (>1000 tegn) |
| Forslag-chip | default, hover, klikk → setter tekst |
| Modus-radio | uvalgt, valgt, hover; "Balansert" har default-badge |
| "Avansert"-expandable | collapsed, expanded |
| `Generer →`-CTA (steg 1) | default, hover, disabled (tom tekst), loading → går til steg 2 |
| "Avbryt generering"-link (steg 2) | default, hover → returnerer til steg 1 |
| Plan-uke-fane (steg 3) | default, hover, aktiv |
| `← Endre brief` | default, hover, focus |
| `↻ Regenerer` | default, hover, loading (går tilbake til steg 2) |
| `Bruk dette forslaget →` | default, hover, active, loading → lukker modal |
| Lukk-X | default, hover, klikk → confirm hvis steg 3 (resultat mistes) |

## Empty / loading / error / success-states

- **Steg 1 idle:** Forhåndsutfylt med kontekst, tom tekstboks
- **Steg 2 loading:** Status-tekst oppdateres ~hver 1.5 sek, samlet ~15 sek
- **Steg 2 timeout:** Etter 30 sek: "Tar lengre tid enn forventet … [Avbryt]" — fortsetter
- **Steg 2 error:** Bytter til error-state: "AI kunne ikke generere plan. Prøv igjen eller endre brief." + `Tilbake til brief →`
- **Steg 3 lav konfidens (<60%):** Warning-bar: "Lav AI-konfidens. Vurder å [Endre brief →] eller [Bygg manuelt]"
- **Steg 3 success → bruk:** Modal lukker + parent-wizard får inn pre-utfylte øvelser (steg 3 i NewPlanModal/Plan-builder)

## Mobile (≤640px)

Full-screen modal. Tekstboks tar full bredde. Plan-uke-fane (steg 3) blir scrollbar horisontalt. Tre handlings-knapper stables vertikalt.

## Ønsket output fra Claude Design

1. Steg 1 lyst tema (kontekst-block + tom tekstboks + forslag-chips)
2. Steg 1 lyst tema, mid-typing m/ "Avansert" ekspandert
3. Steg 2 lyst tema, loading midt i ("Bygger 32 økter …")
4. Steg 2 lyst tema, error-state
5. Steg 3 lyst tema (sammendrags-card + 8 uke-fane + uke 19 vist)
6. Steg 3 lyst tema, lav konfidens (warning-bar)
7. Mørkt tema (steg 1)
8. Mobil ≤640px (steg 3)

## Ikke-mål

- Ikke designe parent-wizardene (NewPlanModal pakke 13, Plan-builder pakke 7)
- Ikke designe AI-feedback-skjerm (egen pakke — for å trene agenten)
- Ikke designe historikk over genererte planer (egen pakke)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
