# AK Golf Platform — CoachHQ — Coach-team

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/team`
- **Arketype:** B — List + filter (card-grid, ikke tabell)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/team.html`
- **Audit:** `wireframe/audit/coachhq-team.md`
- **Tilhørende modaler:** `InviteCoachModal`, `ConfirmRevokeInviteModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Coach-teamet i AK Golf Group består av 4 personer per nå. Hver coach har rolle, ansvarsområde og sertifiseringer. Skjermen viser laget som card-grid (visuelt, mer som «hvem-vi-er»-side enn tabell), og lar Anders som hovedcoach invitere nye, redigere roller eller pause coacher midlertidig.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec, men med **card-grid (4 kort i 2×2-layout på desktop)** istedenfor tabell.

### Coach-card (per kort)

- Stort avatar (96px sirkulært) sentrert øverst
- Navn (Geist 18px bold), rolle under (muted 14px)
- Tags-rad: rolle-pill (Hovedcoach / Coach / Assistent), pause-pill hvis pauset
- 3 datapunkter i grid:
  - Spillere: «12»
  - Tilgjengelig denne uka: «18 timer»
  - Sertifiseringer: «4»
- Sertifisering-rad nederst: små lucide-ikoner med navn (PGA Class A, NGF Trener 2, TPI L1, etc.)
- 3 knapper nederst: `Meld →` (primary), `Profil →` (secondary), `...` (RowActionsMenu)

### De 4 coachene

| Avatar | Navn | Rolle | Spillere | Sertifiseringer |
|---|---|---|---|---|
| AK | Anders Kristiansen | Hovedcoach + CEO | 18 | PGA Class A, TPI L2, NGF Trener 3, MOG-sertifisert |
| SH | Sara Halvorsen | Coach | 12 | NGF Trener 2, TPI L1 |
| TJ | Tom Johansen | Coach | 8 | NGF Trener 2 |
| MK | Markus K. (assistent) | Assistent | 0 | NGF Trener 1 (under utdanning) |

## KPI-strip (4 kort)

1. Aktive coacher: 4
2. Spillere fordelt: 38 (snitt 9.5 per coach)
3. Tilgjengelighet uka: 84 timer totalt
4. Snitt SG-trend (siste 30d): +0.8

## Filter-bar — UNIKT

- Søk: «Søk navn eller sertifisering»
- Chip: Rolle (Hovedcoach / Coach / Assistent)
- Chip: Status (Aktiv / Pauset)
- Sort: Navn / Spillere / Tilgjengelighet
- Primary CTA: `+ Inviter coach` → `InviteCoachModal`

## Klikkbare elementer

Se `wireframe/audit/coachhq-team.md`. UNIKT:

| Element | States |
|---|---|
| Coach-card | default, hover (lift + accent border), klikk avatar/navn → `/admin/team/:id` |
| Avatar | default, hover (subtilt zoom), upload-overlay for egen profil |
| Sertifisering-ikon | default, hover (tooltip med utdyp + utstedelsesdato) |
| `Meld →` | default, hover, klikk → `SendMessageModal` |
| `...` meny | default, hover, popover med: Rediger rolle / Pause / Tilbakekall invitasjon → `ConfirmRevokeInviteModal` |
| Pending invite-card | spesiell variant med stiplet border + «Avventer svar», «Sendt 3. mai» |

## Empty / loading / error

Felles arketype-B + UNIKT:
- **Empty:** «Bare deg så langt. Inviter din første coach →» (relevant for nye organisasjoner)
- **Loading:** 4 skeleton-cards
- **Invite-error:** Inline rød tekst «E-post finnes allerede i systemet»

## Ønsket output fra Claude Design

1. Lyst tema, 4 coacher i 2×2 grid
2. Mørkt tema
3. Hover-state på Anders K-card
4. Pending invite-card variant (5. card med stiplet)
5. Empty (kun Anders K, før invitering)
6. Mobil ≤640px — 1-kolonne card-stack

## Ikke-mål

- Ikke designe `InviteCoachModal`, `ConfirmRevokeInviteModal` (egen batch)
- Ikke designe `/admin/team/:id` profil-skjerm
- Ikke designe `/admin/team/:id/permissions` eller `/admin/team/:id/calendar` (sub-skjermer)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
