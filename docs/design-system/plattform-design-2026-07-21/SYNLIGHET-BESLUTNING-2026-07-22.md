# Synlighetsbeslutning — 2026-07-22

**Beslutning (Anders):** Alternativ **1 — Alt synlig**.

## Regel

| Type | Synlighet |
|---|---|
| Alle produktflater i PlayerHQ, AgencyOS, Forelder, Auth, marketing/stats | **JA** (synlig) |
| Undermenyer, TrackMan, runde, talent, AI, live, osv. | **JA** |
| Forbud (K.*): egen FullSving-app, GolfBox uten GO, CoachHQ-navn, to import-modaler | **NEI** |
| P0 panel (DKIM, Stripe, DNS, merge) | **ANDERS** — ikke meny, men jobben gjelder fortsatt |

## Kode

`src/lib/product-visibility.ts` — alle `VisibilityArea` er `core` eller `on` (ingen `off` for produktflater).

## Neste

Bygg/prioriter TODO-punkter uten å skjule flater. Si **GO L1** / **GO L2** … eller **bygg resten** for implementasjon.
