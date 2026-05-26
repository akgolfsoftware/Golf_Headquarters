# AK Golf Platform — Shared — Tilgangskontroll

## Identitet

- **Produkt:** Shared / cross-cutting (admin-flate)
- **URL:** `/admin/access`
- **Arketype:** G — Other (per-bruker tilgangs-oversikt)
- **Tier-gating:** Super-admin
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/tilgangskontroll.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `AssignRoleModal`, `RevokeAccessModal`, `InviteUserModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Tilgangskontroll er per-bruker-flaten — ser hver brukers tildelte rolle, custom capabilities (overstyringer), aktive sesjoner, og tilgangs-historikk. Forskjellig fra CBAC-matrise (rolle × capability) — dette er **bruker × rolle**. Anders bruker dette for å invitere nye coaches, justere tilgang ved permisjoner, og revoke ved offboarding.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Hvem har tilgang."*
- Subtitle: `12 brukere · 3 inviterte (venter) · 1 deaktivert`
- Aksjons-rad: `+ Inviter bruker →` (`InviteUserModal`)

### Filter-bar
- Søk: "Søk navn eller e-post"
- Chip: Rolle (Hovedcoach / Coach / Junior-coach / Foreldre / Spiller / Admin)
- Chip: Status (Aktiv / Invitert / Deaktivert)

### Brukerliste (tabell)

Kolonner:
| Kolonne | Innhold |
|---|---|
| [ ] Bulk | checkbox |
| Bruker | Avatar + navn + e-post |
| Rolle | Pill |
| Custom caps | "+3 / -1" (3 ekstra, 1 fjernet fra rolle) |
| Sist innlogget | Mono "i dag 14:32" |
| Status | Pill (Aktiv accent / Invitert gold / Deaktivert muted) |
| ... | RowActionsMenu |

12 rader.

### Right-rail: Stats
- "Aktive brukere: 12"
- "Aktive sesjoner nå: 4"
- "Sist tilgangs-endring: 2 dager siden"

## KPI-strip (4 kort)

1. Brukere totalt: 16 (12 aktive, 3 inviterte, 1 deaktivert)
2. Aktive sesjoner nå: 4
3. Inviterte (venter aksept): 3
4. Tilgangs-endringer siste 30d: 8

## Klikkbare elementer

| Element | States |
|---|---|
| Bruker-rad | default, hover, klikk → bruker-detail-side |
| Rolle-pill | klikk → `AssignRoleModal` |
| Custom-caps-celle | klikk → vis hva som er overstyret |
| RowActionsMenu | default, hover, popover-open (Endre rolle / Reinviter / Deaktiver / Revoke) |
| Inviter-CTA | default, hover, klikk → `InviteUserModal` |

## Empty / loading / error

- **Empty (ingen brukere):** "Ingen brukere ennå. Inviter din første →"
- **Loading:** Skeleton-rader
- **Invite-error:** Inline rød tekst i modal

## Ønsket output fra Claude Design

1. Lyst tema, full liste 12 brukere
2. Mørkt tema, samme
3. Hover på en rad med RowActionsMenu åpen
4. Filter aktivt: Status=Invitert
5. Mobil ≤640px — kort-layout per bruker

## Ikke-mål

- Ikke designe `AssignRoleModal`, `RevokeAccessModal`, `InviteUserModal` (egen batch)
- Ikke designe SSO-konfig
- Ikke designe per-bruker-aktivitet-logg

## Når du er ferdig

Lim design-link tilbake til Claude Code.
