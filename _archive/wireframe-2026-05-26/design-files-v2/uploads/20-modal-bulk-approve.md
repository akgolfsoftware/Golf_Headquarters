# AK Golf Platform — Modal — BulkApproveModal

## Identitet

- **Produkt:** CoachHQ
- **Trigger:** `Godkjenn flere`-CTA på `/admin/approvals` (CoachHQ Approvals-list, pakke 03)
- **Type:** Bulk-action-modal med utvalg-liste
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/bulk-approve.html`
- **Audit:** `wireframe/audit/coachhq-approvals.md` (modal-seksjon)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. CoachHQ-modal — `card`-bg lyst, `popover`-bg mørkt. Eksakte token-navn — ikke hardkode hex.

## Spec — hva modalen er for

BulkApproveModal lar Anders K. godkjenne flere lavrisiko-AI-actions samtidig — istedenfor én og én. Modal viser 7 ventende actions med severity, default-valgte 5 (lav-medium), og lar coach justere før samlet godkjenning. Sparer 30+ klikk per uke for aktiv coach.

## Layout — UNIKT for modal

- **Modal-container:** Sentrert, max-width 640px, høyde auto, `rounded-xl`, bakdrop blur(4px)
- **Header (sticky, 64px):**
  - Tittel italic Instrument Serif 22px: «Godkjenn flere agent-forslag»
  - Sub: «{n} av 7 valgt» (oppdateres live)
  - Lukk-X øverst-høyre
- **Severity-legend (under header, kompakt):**
  - 3 pill-eksempler: «Lav» (accent) · «Medium» (warning) · «Høy» (destructive subtil)
  - Tooltip-ikon (lucide `Info`) ved siden av: «Hva betyr severity?»
- **Body (variabel høyde, max 60vh, scrollbar):**
  - 7 action-rader, 64px høy:
    - Venstre: bulk-checkbox 18px (5 forhåndsvalgt — lav + medium)
    - Action-ikon (lucide pyramide-farge basert på kategori)
    - Tittel (Inter Tight 14px): f.eks. «Flytt Marius' økt fra fre 16:00 → 18:00»
    - Sub (muted 12px): «Begrunnelse: spiller meldte konflikt 2 dager før»
    - Severity-pill: «Lav» · «Medium» · «Høy» — fargekodet
    - Mini «Detaljer →»-link (åpner `PlanActionDetailModal`)
  - Høy-severity-rader er ikke forhåndsvalgt + har subtil destructive-tint på severity-pill
- **Footer (sticky, 80px):**
  - Venstre: «Velg alle (7)» + «Velg ingen» (kompakte sekundær-knapper)
  - Senter: live count «5 forslag valgt»
  - Høyre: «Avbryt» (sekundær) + `Godkjenn 5 valgte →` (primary, accent-pill, oppdateres med count)

## Klikkbare elementer

| Element | States |
|---|---|
| Bulk-checkbox per rad | uvalgt, valgt, focus, hover |
| Action-rad | default, hover (subtil bg-shift), klikk på rad-tittel → `PlanActionDetailModal` |
| Severity-pill | static (ikke klikkbar) |
| «Detaljer →»-link | default, hover, focus, klikk → annen modal |
| Tooltip-ikon (severity-info) | hover viser popover med forklaring |
| «Velg alle (7)»-knapp | default, hover, focus, disabled (når alle valgt) |
| «Velg ingen»-knapp | default, hover, focus, disabled (når ingen valgt) |
| `Godkjenn N valgte →`-CTA | default, hover, active, focus, disabled (N=0), loading (under godkjenning), success-state etter |
| «Avbryt»-knapp | default, hover, focus |
| Lukk-X | default, hover, focus |

## Empty / loading / error / state-varianter

- **State: alle 7 valgt:** CTA «Godkjenn 7 valgte →», «Velg alle» disabled
- **State: ingen valgt:** CTA disabled, footer-count «0 forslag valgt — velg minst ett»
- **State: partial (5 av 7):** default — som beskrevet
- **Godkjenning loading:** CTA viser spinner, footer disabled, modal blokkert
- **Godkjenning success:** Toast + modal lukker etter 800ms, list-skjerm refresher
- **Godkjenning error:** Toast inni modal «Kunne ikke godkjenne 2 av 5. Vis detaljer →» + retry-link
- **Empty (ingen ventende):** «Ingen forslag å godkjenne akkurat nå.» + lucide `CheckCircle2` 48px, lukk-CTA

## Mobile (≤640px)

Full-screen modal. Action-rader stables med severity-pill flyttet til topp av rad. Footer sticky-bunn med count over CTA-rad.

## Ønsket output fra Claude Design

1. Default lyst tema (5 av 7 valgt, partial state)
2. Alle 7 valgt, lyst tema
3. Ingen valgt (CTA disabled), lyst tema
4. Mørkt tema (default)
5. Loading-state under godkjenning
6. Success-state (modal i ferd med å lukke)
7. Error-state (2 av 5 feilet)
8. Mobile full-screen
9. Empty (ingen ventende)

## Ikke-mål

- Ikke designe `PlanActionDetailModal` (egen pakke)
- Ikke designe approvals-list-skjerm (pakke 03)
- Ikke implementere ekte severity-algoritme — bruk eksempel-data
