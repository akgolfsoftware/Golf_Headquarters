# AK Golf Platform — Modal — EditPlanModal

## Identitet

- **Type:** Modal (drawer-stil, høyrejustert 640px bred)
- **Åpnes fra:** Plan-detalj `Endre`-knapp · CoachHQ kontekstmeny på plan
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/edit-plan.html`
- **Forholdt til:** Plan-edit-skjerm (pakke 04) — denne modalen er light-versjonen for hurtig-edit av navn/datoer/coach uten å åpne full editor

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva modalen er for

Hurtig-edit av plan-meta-data: navn, datoer, ansvarlig coach, tags. Større endringer (faser, pyramide-allokering, økter) krever full plan-edit-skjerm.

## Layout

### Header (modal-top)
- Lucide `Pencil` 20px ikon + tittel `Endre plan` (Geist 18px)
- `×`-lukk høyre

### Body (form-fields stable)

| Felt | Type | Validation |
|---|---|---|
| Plan-navn | text input | min 3, max 80 chars |
| Coach | dropdown med søk | required |
| Spiller (read-only) | label | – |
| Start-dato | date picker | må være ≤ slutt |
| Slutt-dato | date picker | må være ≥ start |
| Type | radio: Manuell / AI-generert / Mal | – |
| Tags | chip-input | optional |
| Beskrivelse (optional) | textarea | max 500 chars |

### Footer (sticky bottom)
- `Avbryt` (ghost) — venstre
- `Lagre endringer` (lime CTA) — høyre, disabled hvis ingen endringer

## States

| State | Beskrivelse |
|---|---|
| Default | Pre-fylt med eksisterende plan-data |
| Loading initial data | Skeleton form-fields |
| Field-validation-error | Rød border + tekst under felt |
| Save-loading | CTA "Lagrer..." + spinner |
| Save-success | Toast "Plan oppdatert" + lukk modal |
| Save-conflict | Banner topp: "Plan er endret av annen coach. Last på nytt." |
| Slett-plan-knapp | Sekundær link nederst venstre, åpner ConfirmDeleteModal |

## Klikkbare elementer

| Element | States |
|---|---|
| `×`-lukk | default, hover (rotate 90deg) |
| Form-input | default, focus (ring), with-value, error, disabled |
| Coach-dropdown | default, open, item-hover, item-selected |
| Date-picker | default, open, hover-day, selected-day, today-marked |
| Chip-input (tags) | default, focus, with-chips, removable-× |
| `Lagre endringer` | disabled, default, hover, loading, success |
| `Slett plan` link | default, hover (destructive underline) |

## Eksempel-data

- **Plan:** "Sommer-toppform"
- **Coach:** Anders Kristiansen
- **Spiller:** Markus Roinås Pedersen
- **Periode:** 9. mai – 30. juni 2026
- **Tags:** Sørlandsåpent · Peak-juni · Elite

## Ønsket output fra Claude Design

1. Lyst tema, default state med pre-fyllt data
2. Mørkt tema, samme
3. Field-validation-error på Slutt-dato (før start)
4. Save-loading-state
5. Save-conflict-state (banner topp)
6. Mobil ≤640px — modal blir bottom-sheet 90vh

## Ikke-mål

- Ikke designe `ConfirmDeleteModal` (egen generic confirm-pakke)
- Ikke designe full plan-edit-skjerm (pakke 04)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
