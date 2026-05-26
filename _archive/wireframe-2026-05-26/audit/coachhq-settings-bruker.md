# Audit: CoachHQ — Innstillinger · Bruker (Profil)

**HTML:** `screen-deck/coachhq/settings-bruker.html`
**URL:** `/admin/settings`
**Antall klikkbare elementer:** 22

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| Settings-undernav (9 lenker: Profil, Konto, Sikkerhet, Notifikasjoner, Tilgang, Integrasjoner, API, Fakturering, Avansert) | Navigasjon | Sub-skjermer | Delvis - flere mangler wireframe |
| "Last opp nytt bilde" | Modal | AvatarUploadModal | NEI - ny modal |
| "Endre →" på 6 felt (Navn, E-post, Telefon, Tittel, Tidsone, Språk) | Inline state | InlineEditField (input + lagre/avbryt) | NEI - state mangler |
| "Avbryt" knapp | State-change | Reset-form | OK |
| "Lagre endringer" primary | Modal eller direct | Toast SaveSuccess | OK (toast) |

## States som må designes (utenom default)
- Inline-edit alle 4 states: default → active (input synlig) → saving → error
- Avatar hover (last opp-overlay)
- Verifisert-pill click (popover med detaljer)
- Disabled "Lagre endringer" når ingenting endret
- Validation-error per felt (rød border + melding)
- Saving spinner i knapp
- Success toast etter lagring
