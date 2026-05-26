# AK Golf Platform — Modal — NewPlanModal

## Identitet

- **Produkt:** CoachHQ
- **Trigger:** `+ Ny plan`-CTA på `/admin/plans` (CoachHQ Plans-list, pakke 01)
- **Type:** Multi-step wizard-modal (4 steg)
- **Tier-gating:** Ikke relevant (CoachHQ — kun coaches)
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/new-plan.html`
- **Audit:** `wireframe/audit/coachhq-plans.md` (modal-seksjon)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. CoachHQ-modal — bruker `card`-bg på lyst tema, `popover`-bg på mørkt. Maks 3 lime per modal. Eksakte token-navn — ikke hardkode hex.

## Spec — hva modalen er for

NewPlanModal lar coach (Anders K.) lage en ny treningsplan for en spiller på under 2 minutter. Wizard guider gjennom: velg spiller + periode → velg mal eller start blank → tilpass øvelser → bekreft og send. Alternativ AI-generering tilbys i steg 2. Etter steg 4 sendes plan til spiller for godkjenning og lukker modal.

## Layout — UNIKT for modal

- **Modal-container:** Sentrert, max-width 720px, høyde auto, `rounded-xl` (12px), bakdrop `rgba(0,0,0,0.5)` med subtle blur(4px)
- **Header (sticky, 72px):**
  - Tittel italic Instrument Serif 24px: «Ny treningsplan»
  - Sub: steg-progress «Steg {n} av 4 · {steg-navn}»
  - Lukk-X øverst-høyre (lucide `X` 20px)
- **Steg-indikator:** 4 prikker under header (accent for aktiv, primary for fullført, muted for ufullført) + linjer mellom
- **Body (variabel høyde, max 70vh, scrollbar):**
  - **Steg 1 — Velg spiller + periode:**
    - Spiller-autocomplete med avatar-resultater (henter fra `/admin/elever`, viser Markus Pedersen som første eksempel)
    - Periode-velger: dato-fra + dato-til (default: «9. mai – 30. jun 2026»)
    - Pyramide-fokus-velger: 5 slidere (FYS/TEK/SLAG/SPILL/TURN) som summeres til 100%
  - **Steg 2 — Mal-valg:**
    - 3 store cards i grid: «Bruk mal →» (åpner `TemplateSelectorModal`, pakke 22) · «AI-generer →» (lime accent, høyre-stripe) · «Start blank →»
  - **Steg 3 — Tilpass øvelser:**
    - Liste over auto-foreslåtte øvelser (12 stk basert på pyramide-fokus)
    - Per rad: drag-handle + øvelse-navn + kategori-pill + varighet + «✕»-fjern
    - «+ Legg til øvelse»-link nederst (åpner søke-popover)
  - **Steg 4 — Bekreft + send:**
    - Sammendragskort: spiller, periode, antall økter, pyramide-fordeling
    - Sjekkbokser: «Send til Markus for godkjenning» (default på) · «Notifiser foresatt» (default av)
    - Footer-tekst: «Markus får varsel og kan godta/avvise i sin portal»
- **Footer (sticky, 72px):**
  - Venstre: «Avbryt»-knapp (sekundær)
  - Høyre: «← Tilbake» + «Neste →» (primary, accent-pill) — i steg 4 endres «Neste» til «Send forslag →»

## Klikkbare elementer

| Element | States |
|---|---|
| Steg-indikator-prikk | static, klikkbar tilbake til fullførte steg, ikke fremover |
| Spiller-autocomplete | default, focus, typing, suggesting, no-results, selected |
| Dato-felt | default, open (kalender), valgt-state |
| Pyramide-slider | default, dragging, summen-validering (100% påkrevd — viser warning hvis ikke) |
| Mal-card | default, hover (lift), klikk → laster valgt sti |
| Øvelse-rad | default, hover (drag-handle synlig), drag-active (rotert 2°), drop-zone |
| «+ Legg til øvelse»-link | default, hover, focus, klikk → søke-popover |
| Sjekkboks | uvalgt, valgt, focus |
| «Avbryt»-knapp | default, hover, focus, klikk → confirm-popover hvis endringer gjort |
| «← Tilbake»-knapp | default, hover, focus, disabled (steg 1) |
| «Neste →» / «Send forslag →»-CTA | default, hover, active, focus, disabled (validering feil), loading (under AI-generering / send) |
| Lukk-X | default, hover, focus, klikk → confirm-popover hvis endringer gjort |

## Empty / loading / error / validation-states

- **Steg 1 validering:** Pyramide ≠ 100% → warning-tekst under sliderne; periode tom → felt rødt
- **Steg 2 AI-generering:** Loading-state inni modalen — sentrert spinner + «Genererer plan basert på Markus' historikk … (~15 sek)»
- **Steg 3 empty:** «Ingen øvelser ennå. Velg fra mal eller AI-generer →»
- **Steg 4 send loading:** Hele footer disabled, «Sender …» tekst på CTA
- **Send error:** Toast inni modal: «Kunne ikke sende. Prøv igjen.» + retry
- **Avbryt med endringer:** Mini-confirm-popover «Forkast endringer?» + «Bli» / «Forkast»

## Mobile (≤640px)

Full-screen modal (`rounded-none`, hele skjermen). Footer sticky-bunn. Pyramide-slidere stables vertikalt. Mal-cards 1 kolonne.

## Ønsket output fra Claude Design

1. Steg 1 lyst tema (Markus valgt, periode satt, pyramide ved 100%)
2. Steg 2 lyst tema (3 mal-cards synlige, hover på «AI-generer»)
3. Steg 3 lyst tema (12 øvelser i liste, en under drag)
4. Steg 4 lyst tema (sammendrag + sjekkbokser)
5. Mørkt tema (steg 2)
6. Steg 2 AI-generering loading-state
7. Validation-state steg 1 (pyramide 95%, warning under)
8. Mobile full-screen (steg 1)
9. Avbryt-confirm-popover

## Ikke-mål

- Ikke designe `TemplateSelectorModal` (pakke 22)
- Ikke designe selve plan-detalj-skjermen som åpnes etter send (egen batch)
- Ikke designe AI-generator inn-detalj — vis bare loading
