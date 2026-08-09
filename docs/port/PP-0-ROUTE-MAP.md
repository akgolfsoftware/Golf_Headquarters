# PP-0.6 — Rute-sanering (TrackMan + Workbench)

**Dato:** 09.08.2026 · Del av `PIXEL-PERFECT-PLAN-COMPLETE.md` PP-0

## TrackMan (PlayerHQ)

| URL | Status | Mål |
|---|---|---|
| `/portal/mal/trackman` | **Canonical** hub (liste) | Pixel mot `fase2/playerhq/playerhq-trackman-liste.html` |
| `/portal/mal/trackman/[id]` | **Canonical** detalj | Pixel mot `playerhq-trackman-detalj.html` |
| `/portal/trackman` | Redirect → `/portal/mal/trackman` | Allerede implementert |
| `/portal/trackman/[sessionId]` | Redirect → `/portal/mal/trackman/[sessionId]` | Allerede implementert |
| `/admin/trackman` | AgencyOS admin | Egen flate (AdminTrackmanV2) — ikke PlayerHQ-fasit |

**Regel:** Nye lenker i PlayerHQ peker **kun** på `/portal/mal/trackman…`.  
Ikke gjenåpne legacy-trær.

## Workbench

| URL | Status | Fasit |
|---|---|---|
| `/admin/spillere/[id]/workbench` | **Canonical** spiller-workbench | `workbench-desktop.html` / `workbench-mobil.html` |
| `/admin/grupper/[id]/workbench` | **Canonical** gruppe-workbench | samme mal + gruppe-kontekst |
| `/portal/planlegge/workbench` | PlayerHQ inngang | `WorkbenchInngang` / portal WB |
| `/admin/(legacy)/coach-workbench` | Legacy | Redirect/ut — ikke pixel-target |
| `/admin/workbench` | **Finnes ikke** | Ikke opprett; bruk spiller/gruppe-ruter |

**Turnering-variant:** `workbench-turnering.html` → faner/modus på spiller-workbench (ikke egen top-level rute med mindre produktet krever det).

## Auth shell

| URL | Shell |
|---|---|
| `/auth/logg-inn`, `/auth/login`, signup, check-email, forgot/reset, bankid, logget-ut | Auth midtkort (LoginV2 mønster) |
| guardian-consent, samtykke-venter | Auth-samtykke mal |

## Verifisert PP-0.6

- [x] TrackMan legacy redirect filer finnes og peker til mal/*
- [x] Workbench canonical mapping dokumentert her
- [ ] Manuell smoke etter deploy: `/portal/trackman` lander på mal-hub
