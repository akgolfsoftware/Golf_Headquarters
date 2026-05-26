# AK Golf Platform — CoachHQ — API + integrasjoner

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/settings/api`
- **Arketype:** F — Settings + profile (developer-variant)
- **Tier-gating:** Pro-feature (Free får 1 nøkkel, Pro får ubegrenset + webhooks)
- **HTML-referanse:** `wireframe/screen-deck/coachhq/settings-api.html`
- **Audit:** `wireframe/audit/coachhq-settings-api.md`
- **Tilhørende modaler:** `NewAPIKeyModal`, `RevokeKeyModal`, `WebhookConfigModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

API-skjermen er for utviklere og integrasjons-eiere som henter data ut av AK Golf HQ til andre systemer (TrackMan, GolfBox, Mailchimp). Anders selv bruker denne sjelden, men når akgolf-portal eller akgolf-website skal pulle data, lages nøkler her. Webhooks brukes til å pushe events ut (ny booking, plan-endring) til Zapier eller egne endpoints.

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec med settings-sub-nav. To hoved-faner øverst: **API-nøkler** | **Webhooks**.

### Fane: API-nøkler

**KPI-strip (4 kort):**
1. Aktive nøkler: 3 av ∞ (Pro)
2. API-kall siste 30d: 14 280
3. Snitt-respons: 84 ms
4. Feilrate: 0,12%

**Tabell:**
| Navn | Prefix | Tilganger | Sist brukt | Opprettet | Aksjoner |
|---|---|---|---|---|---|
| akgolf-portal-prod | `ak_pk_8f2…` | read:plans, read:players | for 12 min siden | 14. mars 2026 | "..." |
| Mailchimp-sync | `ak_pk_4a1…` | read:players, read:emails | i går 22:14 | 8. feb 2026 | "..." |
| TrackMan-import | `ak_pk_b3e…` | write:sessions | for 3 timer siden | 22. mars 2026 | "..." |

Kolonne `Tilganger` viser små chips med scope-navn. Hover viser full liste.

**Primary CTA:** `+ Ny API-nøkkel` → `NewAPIKeyModal` (med scope-velger)

### Fane: Webhooks

**Tabell:**
| Endpoint URL | Events | Status | Siste levering | Aksjoner |
|---|---|---|---|---|
| `https://zapier.com/hooks/...` | booking.created, booking.cancelled | Aktiv | for 8 min siden (200) | "..." |
| `https://akgolf-portal.no/webhooks/plans` | plan.published, plan.updated | Aktiv | for 2 timer siden (200) | "..." |
| `https://test.akgolf.no/...` | * (alle) | **Feilet** | i går 18:42 (502) — destructive | "..." |

**Primary CTA:** `+ Nytt webhook` → `WebhookConfigModal`

**Test-knapp per webhook:** "Send test-event →" (sender mock-payload)

### Seksjon: Dokumentasjon (under tabellene)

To kort:
- **API-dokumentasjon →** Lenke til `docs.akgolf.no/api`
- **Webhook-eksempler →** Lenke til `docs.akgolf.no/webhooks`

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Fane-toggle (API-nøkler / Webhooks) | default, hover, active (underline accent) |
| API-nøkkel-prefix (klikk) | default, hover (cursor copy), klikk → kopierer prefix + toast |
| Tilganger-chip | default, hover (full scope-liste i popover) |
| "Send test-event" | default, hover, loading (spinner), success (200-toast), error (toast med status-kode) |
| Status-pill webhook | Aktiv (accent), Feilet (destructive med pulse), Pause (muted) |
| "..."-meny per rad | default, hover, popover med [Rediger] [Roter nøkkel] [Slett (destructive)] |
| "Roter nøkkel" | default, hover, klikk → modal med ny nøkkel (engangs-vis) |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **Empty API-nøkler:** "Ingen API-nøkler ennå. Opprett én for å integrere mot AK Golf HQ →" + CTA
- **Empty webhooks:** "Ingen webhooks ennå. Push events til Zapier, n8n eller egen server →"
- **Tier-gate Free:** "Pro: Lag flere nøkler og bruk webhooks → Oppgrader" (banner over tabellen)
- **Failed webhook (banner):** "1 webhook har feilet siste 24 timer. Sjekk loggen →"

## Ønsket output fra Claude Design

1. Lyst tema, fane API-nøkler, 3 nøkler synlig
2. Mørkt tema, fane Webhooks, 3 webhooks (1 feilet)
3. Tier-gate-banner for Free
4. Empty-state webhooks
5. "Roter nøkkel"-flyt: modal med engangs-visning av ny nøkkel + copy-knapp
6. Mobil ≤640px — tabell blir kort-stack, fane-toggle blir segmented øverst

## Ikke-mål

- Ikke designe `NewAPIKeyModal`, `RevokeKeyModal`, `WebhookConfigModal` (egen batch)
- Ikke designe API-dokumentasjon (egen mini-prosjekt)
- Ikke designe rate-limiting-konfig

## Når du er ferdig

Lim design-link tilbake til Claude Code.
