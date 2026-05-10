# AK Golf Platform — Modal — PlanApprovalModal (spiller godkjenner)

## Identitet

- **Produkt:** PlayerHQ
- **Trigger:** Klikk på "Anders foreslo en plan — Godkjenn →" notifikasjon (varsel-senter, batch 6) eller fra Hjem-dashboard (batch 1)
- **Type:** Single-step review-modal (med tre handlings-CTA: godta / be om endring / avslå)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/plan-approval.html`
- **Audit:** `wireframe/audit/playerhq-plan-approval.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-modal — mer "lekent" enn CoachHQ. Maks 3 lime per modal.

## Spec — hva modalen er for

Etter at Anders har sendt en treningsplan til Markus (via NewPlanModal pakke 13 eller Plan-builder pakke 7), får Markus varsel og åpner PlanApprovalModal for å se planen og godta/avslå/be om endring. Modal viser hele planen i lett-fordøyelig form med pyramide, ukentlig-oversikt og milestones — ikke som rå tabell.

## Layout — UNIKT for modal

- **Modal-container:** Sentrert, max-width 800px, `rounded-xl` (12px), bakdrop standard
- **Header (sticky, 96px):**
  - Coach-info-bar: avatar (32px) + "Anders K. har foreslått en plan til deg" + tidspunkt "for 14 minutter siden"
  - Plan-tittel italic Instrument Serif 28px: «Sommer-toppform 2026»
  - Periode-pill: "9. mai – 30. jun · 8 uker"
  - Lukk-X
- **Body (max 70vh, scroll):**

### Seksjon 1 — Sammendrag-card

- 4 kompakte stat-kort på rad:
  - "8 uker"
  - "32 økter"
  - "5 fokusområder"
  - "1 milestone — Sørlandsåpent"
- Pyramide-donut (120px) + tall-legend

### Seksjon 2 — Anders' melding (sitat-stil)

- Quote-card med italic Instrument Serif 18px:
  > *"Hei Markus — denne planen bygger opp mot Sørlandsåpent. Tung TEK-fokus første 4 uker, deretter overgang til SLAG og spillforberedelse. Si fra hvis noe ikke passer."*
- Coach-avatar nederst-høyre (24px)

### Seksjon 3 — Uke-for-uke (collapsible)

- Liste over 8 uker, hver collapsible:
  - Uke-header: "Uke 19 (9.–15. mai) · 4 økter · TEK-fokus"
  - Klikk → ekspanderer til full øktliste m/ dag/tid/varighet/øvelser
- Default: kun uke 19 ekspandert

### Seksjon 4 — Hva vil endre seg

Inline highlighting hva som er nytt vs. nåværende plan:
- "+ 4 nye TEK-økter"
- "− 2 SPILL-økter (flyttet til uke 23)"
- "↑ Total volum +12% denne perioden"

### Footer (sticky, 96px) — TRE handlings-knapper

- Venstre: "Avbryt" (link, lukker modal uten valg)
- Sentrum: "Be om endring →" (sekundær — åpner mini-form: tekstboks "Hva vil du endre?")
- Høyre: "Avslå" (ghost destructive) + "Godta og start →" (primary, accent)

## Klikkbare elementer

| Element | States |
|---|---|
| Coach-avatar/info-bar | default, hover (lift), klikk → Coach-detalj (batch 3) |
| Pyramide-donut | static, hover (tooltip per slice) |
| Quote-card | static |
| Uke-header (collapsible) | default, hover, ekspandert (chevron-rotering) |
| Økt-rad (i ekspandert uke) | default, hover (highlight) |
| Endring-highlights | static (info display) |
| "Avbryt"-link | default, hover |
| "Be om endring →"-knapp | default, hover, klikk → ekspanderer mini-form i footer |
| Mini-form tekstboks | default, focus, with-text |
| Mini-form "Send melding →" | default, hover, loading, success → lukker modal med toast |
| "Avslå"-knapp | default, hover (lett rød), klikk → confirm-popover "Sikker? Anders får varsel om at du avslo." |
| "Godta og start →"-CTA | default, hover, active, loading ("Aktiverer plan …"), success (full-modal accent-flash + redirect til Hjem) |
| Lukk-X | default, hover, klikk → ingen confirm (siden ingen endring er gjort) |

## Empty / loading / error / success-states

- **Loading initial:** Skeleton modal-content (sammendrag-skeleton, quote-skeleton, uke-skeleton)
- **Godta loading:** Hele footer disabled, CTA spinner "Aktiverer plan …"
- **Godta success:** Full-modal accent-flash (200ms), tittel endres til "Planen er aktiv!", subtekst "Første økt er i morgen kl 16:00", CTA `Til min hjem →` (auto-close etter 3 sek)
- **Be-om-endring loading:** Mini-form-knapp spinner, "Sender til Anders …"
- **Be-om-endring success:** Toast "Melding sendt til Anders. Han svarer typisk innen 4 timer." + lukker modal
- **Avslå-confirm:** Popover med "Hvorfor? (valgfritt)"-tekstboks + "Bekreft avslag"-knapp
- **Avslå success:** Toast "Anders får varsel" + lukker modal
- **Submit error:** Toast: "Kunne ikke {handling}. Prøv igjen."

## Mobile (≤640px)

Full-screen modal. Sammendrag-stat-kort stables 2×2. Uke-lista beholdes (ekspanderes vertikalt). Footer-knapper stables: "Godta →" på topp (full bredde, primary), så "Be om endring", så "Avslå" + "Avbryt" som mindre tekst-links.

## Ønsket output fra Claude Design

1. Lyst tema, default (uke 19 ekspandert, sammendrag synlig)
2. Lyst tema, alle 8 uker ekspandert (scrollbart)
3. Lyst tema, "Be om endring" mini-form synlig i footer
4. Lyst tema, "Avslå"-confirm-popover åpen
5. Lyst tema, godta success ("Planen er aktiv!")
6. Lyst tema, loading initial (skeleton)
7. Mørkt tema
8. Mobil ≤640px (full-screen, knapper stablet)

## Ikke-mål

- Ikke designe coach-side (hvor Anders ser at Markus godtok — egen CoachHQ-pakke / batch 1)
- Ikke designe Coach-detalj (batch 3)
- Ikke designe Hjem-dashboard hvor planen vises (batch 1)
- Ikke designe varsel-senter (batch 6)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
