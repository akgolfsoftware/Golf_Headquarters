# AK Golf Platform — Shared — Confirm-dialogs-katalog

## Identitet

- **Produkt:** Shared / cross-cutting (designer-referanse)
- **URL:** `/admin/design/confirms`
- **Arketype:** G — Other (katalog-grid)
- **Tier-gating:** Admin + designer
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/confirm-dialogs.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** Confirm-dialog-eksempler

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Confirm-dialog-katalogen viser alle bekreftelses-dialoger i plattformen — fra mild ("Er du sikker du vil avbryte?") til alvorlig ("Slett konto permanent — kan ikke angres"). Hver type har spesifikke regler for severity, knapper-rekkefølge, og om type-to-confirm kreves.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Er du sikker?"*
- Subtitle: `8 confirm-typer · 3 alvorlighets-grader`

### Filter-bar
- Chip: Severity (Lav / Middels / Høy / Kritisk)
- Toggle: "Vis type-to-confirm" (kun de hvor man må skrive ord)

### Katalog-grid (3-kolonne)

Hvert kort:
- **Dialog-thumbnail**
- **Tittel** (Geist 14px medium): "ConfirmDeleteSession"
- **Severity-pill** øverst-høyre
- **Eksempel-tekst** (muted): "Slett denne økten? Spilleren vil få beskjed."
- **Knapper-spec**: "Avbryt (ghost) + Slett (destructive)"
- **Type-to-confirm**: "Ja — må skrive 'SLETT'"
- **Brukt i**: "Alle sletting-aksjoner i sessions, plans, bookings"

8 typer:
1. ConfirmDelete (lav severity, soft delete)
2. ConfirmDeletePermanent (høy severity, hard delete + type-to-confirm)
3. ConfirmCancel (lav, om man avbryter en wizard)
4. ConfirmLeave (middels, om man har usaved changes)
5. ConfirmPublish (middels, gjør synlig for spillere)
6. ConfirmRefund (høy, betalings-relatert + type-to-confirm)
7. ConfirmRevokeAccess (høy, fjerner bruker-tilgang)
8. ConfirmDeleteAccount (kritisk, alle data slettes + type-to-confirm + 7-dagers angre-period)

### Right-rail: Regler
- "Severity-fargene styrer Delete-knapp-fargen"
- "Type-to-confirm krever bruker skriver eksakt ord (case-sensitive)"
- "Cancel/Avbryt er alltid VENSTRE, destructive er alltid HØYRE"
- "Aldri auto-fokus på destructive-knapp"

## Klikkbare elementer

| Element | States |
|---|---|
| Card | hover (lift), klikk → preview-overlay (faktisk dialog) |
| Filter-chip | default, hover, selected |
| Type-to-confirm toggle | default, klikk → filter |

## Empty / loading / error

- **Empty (filter null):** "Ingen confirm-typer matcher"

## Ønsket output fra Claude Design

1. Lyst tema, full katalog
2. Mørkt tema, samme
3. Preview-overlay med en dialog åpen (ConfirmDeletePermanent)
4. Filter aktivt: Severity=Kritisk
5. Mobil ≤640px — 1-kolonne grid, dialog blir bottom-sheet

## Ikke-mål

- Ikke designe selve dialogene fra scratch
- Ikke implementere undo-systemet for soft delete

## Når du er ferdig

Lim design-link tilbake til Claude Code.
