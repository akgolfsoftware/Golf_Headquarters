# AK Golf Platform — CoachHQ — Bruker-innstillinger

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/settings/bruker`
- **Arketype:** F — Settings + profile
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/settings-bruker.html`
- **Audit:** `wireframe/audit/coachhq-settings-bruker.md`
- **Tilhørende modaler:** `ChangePasswordModal`, `CancelSubscriptionModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Bruker-innstillinger er stedet hvor Anders styrer sitt eget account-nivå: kontaktinfo (forskjellig fra offentlig profil), passord, språk, tidssone, og preferanser for hvordan CoachHQ oppfører seg. Forskjellig fra coach-profil som er offentlig. Skjermen brukes sjelden — typisk når man bytter mobil eller endrer e-post.

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec med settings-sub-nav (Profil / **Bruker** / Sikkerhet / Varsler / API / Abonnement). Form-seksjoner:

**Seksjon: Konto**
| Felt | Default | Edit-mønster |
|---|---|---|
| Brukernavn | "anders.k" | Read-only (kan ikke endres) + tooltip |
| E-post (innlogging) | "anders@akgolf.no" | Inline input + verifiserings-link |
| Passord | "••••••••" | "Endre →" → `ChangePasswordModal` |
| To-faktor | "Aktivert (SMS)" | "Endre →" → går til `/admin/settings/sikkerhet` |

**Seksjon: Lokalisering**
| Felt | Default |
|---|---|
| Språk (UI) | Dropdown: "Norsk bokmål" (default) / "English" |
| Tidssone | Dropdown: "Europe/Oslo (CET/CEST)" |
| Datoformat | Radio: "DD. mmm YYYY" / "YYYY-MM-DD" / "DD/MM/YYYY" |
| Tallformat | Radio: "1 600,50 (NO)" / "1,600.50 (US)" |
| Førstedag i uka | Radio: "Mandag" / "Søndag" |

**Seksjon: CoachHQ-preferanser**
| Felt | Default |
|---|---|
| Default visning ved innlogging | Dropdown: "Hub" / "Daglig brief" / "Approvals" |
| Tett tabellvisning | Toggle (av default) |
| Auto-oppdater hver 30 sek | Toggle (på default) |
| Kompakt sidebar | Toggle (av default) |
| Vis pyramide-fargekoder | Toggle (på default) |

**Seksjon: Tema**
- Radio-gruppe: `Lyst (default) / Mørkt / Følg system`
- Live preview av valgt tema (mini-thumbnail)

**Farezone**
- "Eksporter alle mine data (GDPR)" — secondary-knapp → genererer JSON-zip
- "Slett konto" — destructive → `CancelSubscriptionModal` først (kan ikke slette med aktivt abonnement)

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| "Endre"-link per felt | default, hover, klikk → inline eller modal |
| Verifiserings-link e-post | default, hover, klikk → sender ny verif-e-post + toast |
| Tema-radio | unchecked, checked, hover (live preview-fade) |
| Toggle | av (muted), på (accent), loading (spinner i tracker) |
| "Eksporter data" | default, hover, loading (spinner), success (toast med download-link) |
| "Slett konto" | default, hover (mørkere destructive), klikk → modal |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **Verifiserings-pending:** Gul banner øverst "E-post venter på verifisering. Send på nytt →"
- **Lagring-toast:** "Innstilling lagret kl 14:32"
- **Eksport-loading:** "Genererer eksport… kan ta opp til 2 min"

## Ønsket output fra Claude Design

1. Lyst tema, alle seksjoner default-tilstand
2. Mørkt tema (etter tema-bytte — vis live-preview)
3. Inline-edit på "E-post" med verifiserings-warning
4. Eksport pågår (loading-state)
5. Farezone hover på "Slett konto"
6. Mobil ≤640px — sub-nav som dropdown øverst, form full bredde

## Ikke-mål

- Ikke designe `ChangePasswordModal`, `CancelSubscriptionModal` (egen pakke)
- Ikke designe sikkerhet-skjerm (egen pakke 3)
- Ikke implementere GDPR-eksport-format

## Når du er ferdig

Lim design-link tilbake til Claude Code.
