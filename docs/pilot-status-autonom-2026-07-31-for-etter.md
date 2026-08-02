# Pilot-status — 2t autonom (Før/Etter-tråd) 2026-07-31

**Gren:** `feature/pilot-for-etter-trad`  
**Base:** `main` (etter #213)

## Ferdig
| P | Leveranse |
|---|-----------|
| P0 | Etter fangst-analyse: `PlanAction` type `FANGST_SJEKKPUNKT` med sjekkpunkt + fangstId |
| P0 | Executor + label for FANGST_SJEKKPUNKT (godkjenn = lukk ETTER) |
| P0 | **Før-kort** på spillerprofil (`/admin/spillere/[id]`) via `hentSisteSjekkpunkt` |
| P1 | **Løst · sjekkpunkt** nederst på `/admin/godkjenninger` |

## Flyt
1. Opptak + analyse ferdig → PlanAction i kø  
2. Coach godkjenner → `sjekkpunkt` lagres på PlanAction  
3. Spillerprofil viser Før-kort  
4. Godkjenninger viser Løst-seksjon  

## Test
- [x] Enhetstest `byggSjekkpunktFraAnalyse`  
- [x] tsc / eslint (husky)  
- [ ] Smoke: fangst → analyse → kø → godkjenn → se Før-kort  

## Ikke i denne runden
- Paper-port, foresatt-e-post, TradApning-UI, Group.kind
