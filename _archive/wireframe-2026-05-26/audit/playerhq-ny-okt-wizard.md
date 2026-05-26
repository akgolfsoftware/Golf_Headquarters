# Audit: PlayerHQ — Ny økt-wizard

**HTML:** `screen-deck/playerhq/ny-okt-wizard.html`
**URL:** `/portal/sessions/new`
**Tier:** Alle (men "lagre som mal" Pro)
**Antall klikkbare elementer:** 17

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (5) | Skjerm | /portal/* | OK |
| Steg-indikator (6 stk) | State-change | Inline (gå tilbake til steg) | OK |
| "Avbryt" knapp | Modal | ConfirmCancelWizardModal | NEI - ny modal |
| "Endre →" på collapsed steg-card | State-change | Gå til steg | OK |
| Øvelse-cards (6 stk — toggle valg) | State-change | Inline (toggle ✓) | OK |
| "← Forrige steg" | State-change | Inline | OK |
| "Hopp over til bekreft" | State-change | Inline | OK |
| "Neste: Bekreft →" primær | State-change | Inline (next step) | OK |
| Drawer: "Bekreft og book →" primær | Modal | BookSessionModal / SessionConfirmModal | OK (BookSessionModal i tracker) |
| Drawer: "Lagre som mal" | Modal | SaveAsTemplateModal | NEI - ny modal |

## States som må designes (utenom default)
- Steg 1-6 individuelle states (alle 6 wizard-steg)
- Selected øvelse (✓-circle vs tom)
- Validering: "Velg minst 3" warning
- Validering: 60/60 min OK vs 45/60 min warning
- Loading skeleton mellom steg
- Live preview drawer oppdaterer realtime
- Tier-locked-state (Lagre som mal — Pro-only)
- ConfirmCancelWizardModal (mister du data?)
- SaveAsTemplateModal (navn + beskrivelse + del-toggle)
- SessionConfirmModal (oppsummering + book)
