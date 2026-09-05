# Design-audit — mekanisk scoreboard 2026-09-05

Kjørt av `scripts/design-audit.mjs`. 104 familier, 199 skjermer (redirect-sider ikke medregnet). Poeng 0–10 er et mekanisk utgangspunkt; den manuelle auditen (fem dimensjoner, 0–4) kommer i tillegg per familie.

Kolonner: **fokus** = filer med `outline: none` uten fokus-erstatning · **alert** = `alert()`-kall · **hex** = hardkodede farger i tsx · **div-klikk** = `<div onClick>` uten rolle · **halve** = tekststørrelser på ,5 · **paper** = `data-paper`-rester · **elite** = `"ELITE"` i UI · **det.** = impeccable-detektor (feil/advarsler) · **fasit** = status i `tests/visual/skjerm-mapping.ts`.

| Familie | Skjermer | Filer | Poeng | fokus | alert | hex | div-klikk | halve | paper | elite | det. | fasit |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| `portal/planlegge` | 3 | 9 | **3,2** | 0 | 0 | 0 | 9 | 86 | 17 | 0 | 0/4 | kalibrert |
| `admin/marketing` | 1 | 3 | **5,4** | 0 | 0 | 0 | 4 | 3 | 7 | 0 | 0/0 | ingen |
| `admin/gjennomfore` | 1 | 4 | **6,4** | 0 | 0 | 0 | 3 | 15 | 7 | 0 | 0/0 | ingen |
| `forelder/innstillinger` | 1 | 3 | **6,4** | 0 | 0 | 0 | 3 | 3 | 7 | 0 | 0/0 | ingen |
| `admin/kommunikasjon` | 1 | 6 | **6,7** | 0 | 0 | 0 | 5 | 10 | 11 | 0 | 0/0 | ukalibrert |
| `admin/hjelp` | 1 | 4 | **7,1** | 0 | 0 | 0 | 3 | 5 | 7 | 0 | 0/0 | ingen |
| `admin/queue` | 1 | 3 | **7,1** | 0 | 0 | 0 | 2 | 5 | 9 | 0 | 0/0 | ingen |
| `admin/videoer` | 1 | 3 | **7,1** | 0 | 0 | 0 | 2 | 6 | 7 | 0 | 0/0 | ingen |
| `portal/kalender` | 2 | 6 | **7,3** | 0 | 0 | 0 | 4 | 10 | 10 | 0 | 0/0 | ingen |
| `portal/utenfor-banen` | 1 | 4 | **7,3** | 0 | 0 | 0 | 2 | 12 | 8 | 0 | 0/0 | ingen |
| `admin/audit-log` | 1 | 4 | **7,3** | 0 | 0 | 0 | 3 | 3 | 7 | 0 | 0/0 | ingen |
| `admin/feillogg` | 1 | 4 | **7,3** | 0 | 0 | 0 | 3 | 3 | 7 | 0 | 0/0 | ingen |
| `admin/plan-templates` | 3 | 11 | **7,4** | 0 | 1 | 0 | 3 | 25 | 19 | 0 | 0/2 | ingen |
| `portal/ukesdigest` | 1 | 3 | **7,4** | 0 | 0 | 0 | 2 | 3 | 7 | 0 | 0/0 | ingen |
| `admin/gdpr` | 1 | 3 | **7,4** | 0 | 0 | 0 | 2 | 3 | 7 | 0 | 0/0 | ingen |
| `admin/profile` | 1 | 3 | **7,4** | 0 | 0 | 0 | 2 | 3 | 7 | 0 | 0/0 | ingen |
| `forelder/coach` | 1 | 3 | **7,4** | 0 | 0 | 0 | 2 | 3 | 7 | 0 | 0/0 | ingen |
| `forelder/fakturaer` | 1 | 3 | **7,4** | 0 | 0 | 0 | 2 | 3 | 7 | 0 | 0/0 | ingen |
| `forelder/okonomi` | 1 | 3 | **7,4** | 0 | 0 | 0 | 2 | 3 | 7 | 0 | 0/0 | ingen |
| `forelder/ukerapport` | 1 | 3 | **7,4** | 0 | 0 | 0 | 2 | 3 | 7 | 0 | 0/0 | ingen |
| `forelder/varsler` | 1 | 3 | **7,4** | 0 | 0 | 0 | 2 | 3 | 7 | 0 | 0/0 | ingen |
| `portal/drills` | 2 | 5 | **7,5** | 0 | 0 | 0 | 2 | 16 | 11 | 0 | 0/0 | ingen |
| `portal/spiller` | 1 | 4 | **7,6** | 0 | 0 | 0 | 2 | 9 | 7 | 0 | 0/0 | ingen |
| `admin/oppgaver` | 1 | 6 | **7,6** | 0 | 0 | 0 | 3 | 12 | 11 | 0 | 0/0 | ingen |
| `portal/trening` | 3 | 8 | **7,7** | 0 | 0 | 0 | 2 | 22 | 11 | 0 | 0/3 | ingen |
| `forelder/barn` | 2 | 5 | **7,7** | 0 | 0 | 0 | 2 | 13 | 10 | 0 | 0/0 | ingen |
| `portal/fysisk` | 1 | 4 | **7,7** | 0 | 0 | 0 | 2 | 4 | 14 | 0 | 0/0 | ingen |
| `admin/runder` | 1 | 4 | **7,8** | 0 | 0 | 0 | 2 | 5 | 10 | 0 | 0/0 | ingen |
| `portal/gjennomfore` | 2 | 6 | **7,9** | 0 | 0 | 0 | 2 | 15 | 15 | 0 | 0/0 | ingen |
| `portal/venner` | 2 | 4 | **7,9** | 0 | 0 | 0 | 2 | 4 | 8 | 0 | 0/0 | ingen |
| `admin/analyse` | 1 | 8 | **7,9** | 0 | 0 | 0 | 4 | 10 | 10 | 0 | 0/0 | ingen |
| `portal/utviklingsplan` | 1 | 4 | **8** | 0 | 0 | 0 | 2 | 3 | 8 | 0 | 0/0 | ingen |
| `portal/varsler` | 1 | 4 | **8** | 0 | 0 | 0 | 2 | 3 | 7 | 0 | 0/0 | ingen |
| `forelder/(rot)` | 1 | 4 | **8** | 0 | 0 | 0 | 2 | 3 | 7 | 0 | 0/0 | ingen |
| `admin/trackman` | 2 | 6 | **8,1** | 0 | 0 | 0 | 2 | 14 | 7 | 0 | 0/0 | ingen |
| `admin/workspace` | 1 | 7 | **8,1** | 0 | 0 | 0 | 3 | 12 | 7 | 0 | 0/0 | ingen |
| `portal/statistikk` | 2 | 6 | **8,2** | 0 | 0 | 0 | 2 | 11 | 10 | 0 | 0/0 | ingen |
| `admin/ko` | 1 | 10 | **8,2** | 0 | 0 | 0 | 4 | 13 | 12 | 0 | 0/0 | ingen |
| `portal/ai` | 3 | 8 | **8,3** | 0 | 0 | 0 | 2 | 12 | 16 | 0 | 0/1 | ingen |
| `admin/tournaments` | 2 | 11 | **8,3** | 0 | 0 | 0 | 3 | 22 | 11 | 0 | 0/1 | ingen |
| `forelder/samtykke` | 2 | 7 | **8,3** | 0 | 0 | 0 | 2 | 15 | 8 | 0 | 0/0 | ingen |
| `admin/email-templates` | 1 | 5 | **8,3** | 0 | 0 | 0 | 2 | 4 | 9 | 0 | 0/0 | ingen |
| `portal/onskeligokt` | 2 | 6 | **8,4** | 0 | 0 | 0 | 2 | 9 | 8 | 0 | 0/0 | ingen |
| `admin/team` | 2 | 7 | **8,4** | 0 | 0 | 0 | 3 | 4 | 7 | 0 | 0/0 | ingen |
| `admin/oppsett` | 1 | 13 | **8,4** | 0 | 0 | 0 | 5 | 14 | 8 | 0 | 0/0 | ingen |
| `admin/recording` | 1 | 5 | **8,4** | 0 | 0 | 0 | 2 | 3 | 7 | 0 | 0/0 | ingen |
| `admin/tester` | 1 | 5 | **8,4** | 0 | 0 | 0 | 2 | 3 | 8 | 0 | 0/0 | ingen |
| `forelder/bookinger` | 5 | 12 | **8,5** | 0 | 0 | 0 | 4 | 15 | 9 | 0 | 0/0 | ingen |
| `portal/utfordringer` | 2 | 6 | **8,5** | 0 | 0 | 0 | 2 | 6 | 9 | 0 | 0/0 | ingen |
| `admin/bookinger` | 2 | 6 | **8,5** | 0 | 0 | 0 | 2 | 4 | 11 | 0 | 0/0 | ingen |
| `admin/workbench` | 1 | 6 | **8,6** | 0 | 0 | 0 | 2 | 4 | 7 | 0 | 0/0 | ingen |
| `admin/turnering` | 1 | 7 | **8,7** | 0 | 0 | 0 | 2 | 8 | 7 | 0 | 0/0 | ingen |
| `portal/tren` | 9 | 26 | **8,8** | 0 | 0 | 0 | 2 | 65 | 31 | 0 | 0/1 | ingen |
| `portal/booking` | 7 | 16 | **8,8** | 0 | 0 | 0 | 2 | 29 | 19 | 0 | 0/1 | ingen |
| `portal/talent` | 4 | 13 | **8,8** | 0 | 0 | 0 | 2 | 22 | 23 | 0 | 0/0 | ingen |
| `portal/gameplan` | 3 | 8 | **8,8** | 0 | 0 | 0 | 2 | 7 | 12 | 0 | 0/0 | ingen |
| `admin/plan` | 3 | 9 | **8,8** | 0 | 0 | 0 | 2 | 9 | 15 | 0 | 0/0 | ingen |
| `admin/spillere` | 8 | 24 | **8,9** | 0 | 0 | 0 | 4 | 31 | 29 | 0 | 0/0 | ukalibrert |
| `portal/(rot)` | 1 | 7 | **8,9** | 0 | 0 | 0 | 2 | 3 | 7 | 0 | 0/0 | kalibrert |
| `admin/jarvis` | 1 | 7 | **8,9** | 0 | 0 | 0 | 2 | 3 | 7 | 0 | 0/0 | ingen |
| `portal/mal` | 12 | 27 | **9** | 0 | 0 | 0 | 2 | 37 | 17 | 1 | 0/1 | ingen |
| `admin/kalender` | 3 | 10 | **9,1** | 0 | 0 | 0 | 2 | 8 | 7 | 0 | 0/0 | ingen |
| `portal/meg` | 30 | 64 | **9,2** | 0 | 0 | 0 | 3 | 90 | 78 | 0 | 0/2 | ingen |
| `portal/coach` | 13 | 27 | **9,2** | 0 | 0 | 0 | 2 | 30 | 53 | 0 | 0/0 | ingen |
| `portal/analysere` | 7 | 19 | **9,2** | 0 | 0 | 0 | 2 | 25 | 12 | 0 | 0/0 | kalibrert |
| `admin/agencyos` | 5 | 19 | **9,2** | 0 | 0 | 0 | 3 | 18 | 7 | 0 | 0/0 | ingen |
| `admin/grupper` | 6 | 16 | **9,3** | 0 | 0 | 0 | 3 | 6 | 7 | 0 | 0/0 | ingen |
| `portal/(fullscreen)` | 9 | 20 | **9,7** | 0 | 0 | 0 | 0 | 19 | 8 | 0 | 0/0 | ingen |
| `admin/agents` | 1 | 5 | **10** | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0/0 | ingen |
| `portal/analyse` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `portal/baneguide` | 0 | 3 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `portal/datagolf` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `portal/oppgrader` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `portal/stats` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `portal/trackman` | 0 | 2 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/(rot)` | 0 | 4 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/agent-team` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/agenticos` | 0 | 6 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ukalibrert |
| `admin/analysere` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/approvals` | 0 | 2 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/brief` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/calendar` | 0 | 2 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/drills` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/finance` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/godkjenninger` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/handlingssenter` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/innboks` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/innboks-epost` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/integrasjoner` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/klubb` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/messages` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/okter` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/oppfolging` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/organisasjon` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/planlegge` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/plans` | 0 | 6 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/reports` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/settings` | 0 | 6 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/stall` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/talent` | 0 | 9 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/teknisk-plan` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/turnering-kart` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/uka` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |
| `admin/varsler` | 0 | 1 | **10** | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0/0 | ingen |

## Sum

- fokus-hull: **0**
- alert(): **1**
- hex i tsx: **0**
- div onClick: **172**
- halve tekststørrelser: **904**
- Paper-rester: **802**
- ELITE i UI: **1**
