# AK Golf Platform — Shared — Tilgangskontroll

## Identitet

- **Produkt:** Shared / cross-cutting
- **URL:** `/admin/tilgang`
- **Arketype:** F — Settings + profile (bruker-tilgang)
- **Tier-gating:** Admin-only
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/tilgangskontroll.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `InviteUserModal`, `RevokeAccessModal`, `ImpersonateModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Tilgangskontroll viser **hvem som har tilgang til hva**, sett fra bruker-siden (CBAC-matrisen viser fra capability-siden). Anders bruker denne når en ny coach starter, en forelder skal få barn-innsyn, eller når noen skal sparkes ut. Skjermen lister alle aktive brukere, deres rolle, scope (klubb/team/spiller-liste), siste aktivitet, og handlinger.

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec, men med stor user-tabell som hovedinnhold.

### KPI-strip (4 kort)

1. Aktive brukere: 47
2. Pending invitasjoner: 3
3. Inaktive >90d: 5
4. Admin-rolle: 2 (Anders + Sara)

### Filter-bar

- Søk: "Søk navn, e-post, rolle"
- Chip: Rolle (Coach / Hovedcoach / Admin / Spiller / Forelder / Klubb)
- Chip: Status (Aktiv / Pending / Suspendert / Inaktiv)
- Chip: Scope (GFGK / WANG / AK Academy)
- Sort: Sist aktiv / A–Å / Rolle / Opprettet
- Primary CTA: `+ Inviter bruker` → `InviteUserModal`

### Bruker-tabell

| Bruker | Rolle | Scope | Sist aktiv | Capabilities | Aksjoner |
|---|---|---|---|---|---|
| Anders Kristiansen (deg) | Admin | Alle | Nå | Alle (49) | "Du" |
| Sara Larsen | Hovedcoach | GFGK + WANG | i dag 09:14 | 32 av 49 | "..." |
| Tom Nilsen | Coach | WANG | for 2 timer siden | 18 av 49 | "..." |
| Markus R Pedersen | Spiller | – | for 30 min siden | 8 av 49 | "..." |
| Anne Pedersen | Forelder | Markus | i går 22:14 | 4 av 49 | "..." |
| Bossum GK Admin | Klubb | Bossum | for 4 dager siden | 12 av 49 | "..." |
| ny@coach.no | (Pending) | WANG | Aldri | – | "Send på nytt" |

Hver "Capabilities"-celle har lite expand-ikon → popover med liste.

### Bulk-actions (når ≥1 valgt)

- "Endre rolle" → modal
- "Endre scope"
- "Suspender" (destructive)
- "Slett (GDPR)" (destructive)

### Side-panel: Audit (kollapsbart)

Live-feed av tilgangs-endringer:
- "10. mai 14:32 — Sara fikk capability `plan.publish` av Anders"
- "10. mai 09:14 — Tom logget inn fra ny enhet"
- "9. mai 16:42 — Anne fikk forelder-tilgang for Markus"

"Se full audit-log →"

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Bruker-rad | default, hover, klikk → bruker-detalj-side `/admin/tilgang/:userId` |
| "..."-meny | default, hover, popover med [Endre rolle] [Imperson­er] [Suspender] [Slett] |
| "Imperson­er" | default, hover (advarsel-tint), klikk → `ImpersonateModal` (krever 2FA) |
| Pending-rad | annerledes bg (warning/5), CTA "Send invitasjon på nytt" inline |
| Capability-expand | default, hover, klikk → popover med scrollable capability-liste |
| Suspender-knapp | default, hover destructive, klikk → confirm-modal |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **Empty (ingen brukere):** "Ingen brukere ennå. Inviter første →"
- **Pending invitasjon utløpt:** Rad markeres med "Utløpt — send på nytt"
- **Imperson­er-aktivt:** Sticky banner øverst på alle sider "Du imperson­erer Sara Larsen — Tilbake til deg →" (warning bg)

## Ønsket output fra Claude Design

1. Lyst tema, 8 brukere synlig (mix av roller + statuser)
2. Mørkt tema
3. Bulk-mode aktiv: 3 brukere valgt, bulk-bar synlig
4. Imperson­er-banner aktivt (vises på toppen av alle skjermer)
5. Capability-popover åpen
6. Mobil ≤640px — tabell blir kort-stack, hver bruker som card

## Ikke-mål

- Ikke designe `InviteUserModal`, `RevokeAccessModal`, `ImpersonateModal` (egen batch)
- Ikke designe bruker-detalj-side `/admin/tilgang/:userId` (egen batch-3)
- Ikke designe SCIM/SSO-provisioning (Pro+, framtidig)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
