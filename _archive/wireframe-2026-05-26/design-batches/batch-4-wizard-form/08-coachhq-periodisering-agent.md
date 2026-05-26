# AK Golf Platform — CoachHQ — Periodisering-agent

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/agenter/periodisering`
- **Arketype:** D — Wizard / Form (single agent-form med live preview)
- **Tier-gating:** Coach Pro+ (Free får demo med dummy-data)
- **HTML-referanse:** `wireframe/screen-deck/coachhq/periodisering-agent.html`
- **Audit:** `wireframe/audit/coachhq-periodisering-agent.md`
- **Tilhørende skjermer:** Agenter-oversikt (batch 6), Approvals (batch 2 pakke 3)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. CoachHQ-sidebar synlig. **Form med to-spalters layout:** input venstre (480px), live preview høyre (resten). Ingen multi-step — alt på samme skjerm med tydelig hierarki.

## Spec — hva skjermen er for

Periodisering-agent er en av Signal→Skill→Agent-pipelinens kjerneagenter. Skjermen er konfigurasjons-skjemaet for hvor aggressivt agenten skal foreslå endringer i pyramide-fokus over tid for en gitt spiller eller spillergruppe. Anders justerer terskler og periodiserings-mønster, ser live preview av hva agenten ville foreslått basert på siste 12 ukers historikk, og lagrer konfigurasjonen.

## Layout — UNIKT for denne skjermen

CoachHQ-sidebar venstre. Hoved-content delt:

### Hero-strip (full bredde, 96px)

- Tittel italic Instrument Serif 32px: *"Periodisering-agent"*
- Sub: "Foreslår endringer i pyramide-fokus basert på prestasjonsdata"
- Status-pill høyre: "Aktiv" (accent-prikk) eller "Pause" (muted)
- Toggle: "Aktivér / Pause"

### To-spalters body

**Venstre 40% — konfigurasjons-form:**

1. **Anvendes på (multi-select):**
   - "Alle spillere" (default)
   - Eller velg spesifikke spillere/grupper (chip-select)

2. **Periodiserings-mønster (radio):**
   - "Klassisk lineær" — gradvis økning av en fokus
   - "Bølgende" — alternerer mellom fokusområder
   - "Blokk" — 3 ukers fokus-blokker
   - "Adaptiv" (anbefalt — accent-badge) — agent velger basert på data

3. **Aggressivitet (slider 1–5):**
   - 1 = Kun sterke signaler · 5 = Reagerer på små endringer
   - Default 3
   - Estimat under: "Forventet ~3 forslag per spiller per uke"

4. **Min. data-vindu:**
   - Stepper 2–8 uker (default 4)
   - Tooltip: "Agenten venter til den har minst N uker data per spiller"

5. **Auto-godkjenn under:**
   - Slider 0–100% (default 0% = manuell godkjenning alltid)
   - Tekst: "Forslag med >X% confidence går rett til spiller uten coach-godkjenning"
   - Warning hvis >50%: "Kan føre til mer feil — bruk forsiktig"

6. **Notifikasjoner:**
   - Sjekkbokser: "E-post per forslag" / "Daglig sammendrag" / "Push i app"

CTA: `Lagre konfigurasjon` (sticky bunn) + `Test på Markus →` (sekundær)

**Høyre 60% — live preview:**

- **Tittel:** "Hva agenten ville foreslått siste 12 uker (basert på dine innstillinger)"
- **Tidslinje horisontal** (12 uker):
  - Hver uke som kolonne
  - Pyramide-fordelings-stripe (samme paletten som batch 2 pakke 5)
  - Forslags-pin på uker hvor agenten ville foreslått endring (klikkbar tooltip)
- **Forslags-tabell under tidslinjen:** 5 nyeste foreslag-kandidater
  - Spiller + dato + endring (f.eks. "TEK 32% → 28%, SLAG 24% → 28%") + confidence (%)

Når brukeren endrer et input venstre → tidslinje + tabell oppdateres med 200ms debounce.

## Klikkbare elementer

| Element | States |
|---|---|
| Aktiv/Pause-toggle | aktiv (accent), pause (muted), focus |
| Anvendes-på multi-select | default, chip-velger åpen, spillere valgt som chips |
| Periodiserings-radio | uvalgt, valgt, hover; "Adaptiv" har anbefalt-badge |
| Aggressivitet-slider | default, dragging, fokus |
| Min-data-stepper | default, +/− knapper, fokus |
| Auto-godkjenn-slider | default, dragging, warning-state >50% |
| Notif-checkbox | uvalgt, valgt, focus |
| `Lagre konfigurasjon`-CTA | default, hover, disabled (ingen endringer), loading, success-flash |
| `Test på Markus →`-knapp | default, hover, klikk → mini-modal med spesifikk Markus-output |
| Tidslinje-uke | static, hover (forslag-tooltip), klikk → ekspanderer detalj |
| Forslags-pin | default, hover (tooltip), klikk → forslag-detalj-popover |
| Forslags-rad i tabell | default, hover, klikk → "Hadde du godkjent dette?"-side-by-side preview |

## Empty / loading / error / success-states

- **Idle:** Last-saved konfig (eller defaults) + tidslinje med 12 uker fra nå
- **Live preview loading:** Tidslinje får skeleton mens den re-beregner (sub-sekund)
- **Ingen data:** "For lite data å vise preview. Velg flere spillere eller vent til mer data er tilgjengelig."
- **Save loading:** CTA spinner "Lagrer …"
- **Save success:** Accent-flash + toast "Konfigurasjon lagret. Gjelder fra neste agent-kjøring (om ~15 min)."
- **Save error:** Toast: "Kunne ikke lagre. Prøv igjen."
- **Tier-gating (Free coach):** Hele skjermen disabled med overlay: "Periodisering-agent krever Coach Pro. [Oppgrader →]" — preview viser dummy-data

## Mobile (≤640px)

Stack: form på topp, preview under. Tidslinje blir scrollbar horisontalt. Tabellen blir kort-stack.

## Ønsket output fra Claude Design

1. Lyst tema, default config, preview viser 12 uker for Markus
2. Lyst tema, aggressivitet=5 (mange forslags-pins på tidslinjen)
3. Lyst tema, auto-godkjenn=70% med warning-state
4. Lyst tema, save-loading
5. Lyst tema, "Test på Markus →"-mini-modal åpen
6. Lyst tema, Free-tier blokket med oppgrader-overlay
7. Mørkt tema
8. Mobil ≤640px (stacked)

## Ikke-mål

- Ikke designe agent-historikk-skjerm (egen pakke)
- Ikke designe Approvals-listen som mottar forslagene (batch 2 pakke 3)
- Ikke designe andre agenter (Deload, Escalation — egen pakke 8 i batch 6)
- Ikke designe Signal→Skill-pipeline-konfig (egen pakke senere)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
