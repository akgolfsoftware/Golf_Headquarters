# Audit: CoachHQ — Coach-profil

**HTML:** `screen-deck/coachhq/coach-profil.html`
**URL:** `/admin/profile`
**Antall klikkbare elementer:** 24

## Klikkbare elementer

| Element (label/ikon) | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Sidebar-nav (12 lenker) | Navigasjon | Ny skjerm | OK |
| "Del profil" knapp | Modal | ShareCoachProfileModal | NEI - ny modal |
| "Rediger" primary | Ny skjerm | `/admin/profile/edit` eller modal | NEI - ny skjerm/modal |
| Tab-rad (5 stk: Oversikt/Spillere/Tilgjengelighet/Sertifiseringer/Innstillinger) | State-change | Inline | OK |
| Stat-rich-card (4 stk) | Drill-down | StatDetailDrawer | NEI |
| Pyramide-tier (5 lag) | Drill-down | PyramidTierDetailDrawer | NEI |
| Tag-pill (~9 spesialiteter) | Modal | EditSpecialtiesModal | NEI - ny modal |
| "+ Legg til" sertifisering | Modal | AddCertificationModal | NEI - ny modal |
| Cert-rad (5 stk) | Modal | CertificationDetailModal (last opp bevis) | NEI - ny modal |
| Activity-item (5 stk feed) | Ny skjerm | `/admin/elever/:id` eller relatert | OK |
| Drawer-close × | State-change | Inline | OK |
| "Endre tilgjengelighet" primary i drawer | Ny skjerm | `/admin/availability` | OK |
| "Sett pause (ferie/sykdom)" | Modal | SetCoachPauseModal | NEI - ny modal |
| "Be om hjelp · co-coach" | Modal | RequestCoCoachModal | NEI - ny modal |

## States som må designes (utenom default)
- Hover på cards
- Loading skeleton
- Empty-state: ingen sertifiseringer
- Cert "utløper snart" warning
- Online/borte/aktiv status-pulse
- Drawer "akkurat nå" live-update
