# Audit: PlayerHQ — Meg Profil

**HTML:** `screen-deck/playerhq/meg-profil.html`
**URL:** `/portal/meg`
**Tier:** Alle
**Antall klikkbare elementer:** 21

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav: Hjem | Skjerm | /portal/hjem | OK |
| Sidebar-nav: Tren | Skjerm | /portal/tren/plan | OK |
| Sidebar-nav: Mål | Skjerm | /portal/mal | OK |
| Sidebar-nav: Coach | Skjerm | /portal/coach | OK |
| Sidebar-nav: Meg (active) | Skjerm | /portal/meg | OK |
| Settings-nav: Profil/Helse/Notif/Personvern/Abonnement/Hjelp (6) | Skjerm | /portal/meg/* | Delvis (helse/notif/help WIREFRAME_NEEDED) |
| "Last opp bilde" | Modal | AvatarUploadModal | NEI - ny modal |
| "Endre →" navn | Modal | EditFieldModal (navn) | NEI - ny modal |
| "Endre →" e-post | Modal | EditFieldModal (epost + verify) | NEI - ny modal |
| "Endre →" telefon | Modal | EditFieldModal (telefon + SMS-verify) | NEI - ny modal |
| "Endre →" fødselsdato | Modal | EditFieldModal (dato) | NEI - ny modal |
| "Manuell override →" HCP | Modal | HcpOverrideModal | NEI - ny modal |
| "Endre →" hjemme-anlegg | Modal | FacilityPickerModal | NEI - ny modal |
| "Legg til →" klubb | Modal | AddClubModal | NEI - ny modal |
| "Avbryt" footer | State-change | Reset form | OK |
| "Lagre" footer (primær) | State-change | Submit + toast | OK |

## States som må designes (utenom default)
- Inline-edit-state (felt åpent for redigering)
- Avatar-upload preview
- Verifisert-pill / unverified-pill
- Foresatt-card (skrivebeskyttet)
- Tier-badge (PRO i sidebar)
- Empty-state (ingen foresatt registrert)
