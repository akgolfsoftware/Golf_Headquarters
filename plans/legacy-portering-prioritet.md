# Legacy-portering — prioritert rekkefølge (2026-07-12)

82 sider ligger igjen i `src/app/admin/(legacy)/` med gammelt design. ALLE er
nåbare (fungerer, gammel stil) — flere via Mer-menyen i AgencyOS-nav-en.
Portering skjer bølgevis: én skjerm per commit, master-skjermplanens haker
oppdateres i samme commit (LÅST regel). Ny booking ble portet 2026-07-12.

## P1 — daglig coach-bruk (port først)

| Skjerm | Rute | Merknad |
|---|---|---|
| Turneringer (hub) | `/admin/tournaments` | Detalj er alt v2; hub-lista + ny + dubletter gjenstår |
| Drills-bibliotek | `/admin/drills` (+ detalj/rediger/ny/forslag) | Lenket fra Mer-menyen |
| Live-økt coach-flyt | `/admin/live/[sessionId]/brief\|active\|summary` | Kjernen i gjennomføring med spiller |
| Spiller-skjemaer | `/admin/spillere/ny`, `[id]/rediger`, `[id]/tildel-test` | Stall-kompletthet |
| Plan-mal-redigering | `/admin/plan-templates/ny`, `[id]`, `[id]/rediger` | Volum-linje/masseredigering finnes alt (2026-07-11) |

## P2 — ukentlig bruk

| Skjerm | Rute |
|---|---|
| Innstillinger | `/admin/settings` (+ api/calendar/security/tilgang) |
| Tilgjengelighet | `/admin/availability` |
| Tjenester og priser | `/admin/services` |
| Anlegg | `/admin/anlegg` (+ detalj) |
| Kapasitet | `/admin/kapasitet` |
| Grupper-timeplan-verktøy | gruppe-sider er v2; sjekk restflater |
| Stall-oversikt | `/admin/stall` |
| Økonomi (full) | `/admin/okonomi` — v2-versjon på `/admin/agencyos/okonomi` finnes; slå sammen |

## P3 — sjelden/admin

Audit-log, e-postmal-redigering, integrasjoner, klubb-innstillinger, team/inviter,
profile, hjelp, stats-moderering, talent-undersider (kohort/region/ressurser/
wagr-import), tilstander, trackman, videoer, opptak, board, reach, kommunikasjon,
workspace-oppgave-detalj, teknisk-plan-detalj, lag-snitt, foresporsler,
godkjenninger-detalj, approvals-redirects (kan slettes når godkjenninger-detalj er v2).

## Dobbelt-adresser (redirect) — verifisert 2026-07-13: allerede fullstendig ryddet

`/admin/finance`→okonomi · `/admin/calendar`(+`/maned`)→kalender · `/admin/messages`→innboks ·
`/admin/approvals`(+`/[id]`)→godkjenninger · `/admin/plans/templates`(+`/[id]`,`/[id]/rediger`,
`/[id]/effectiveness`,`/ny`)→plan-templates. Alle rutene (inkl. undersider) er allerede rene
`permanentRedirect()`-stubs — ingen duplikat-UI er nåbar. **IKKE slett filene i disse mappene**:
`actions.ts`/`_components/*`/`approval-actions.tsx`/`[id]/approval-detail-client.tsx` i
`(legacy)/messages`, `(legacy)/approvals` og `(legacy)/calendar` er fortsatt aktivt importert av de
NYE v2-kanoniske sidene (`AdminComplianceV2.tsx`, `inbox-conversation.tsx`,
`AdminGodkjenningerV2.tsx`, `admin/agents/[agentId]/page.tsx`, `godkjenninger/[id]/page.tsx`,
`ny-booking-wizard.tsx`) — de er delt backend-logikk, ikke gammel UI. Å flytte dem ut av
`(legacy)/`-navnerommet er en ren navnehygiene-refaktor (lav prioritet, egen commit, IKKE en del
av porterings-bølgene) — ikke gjør det sammen med skjerm-porting for å unngå unødvendig risiko.
`/admin/coach-workbench` (prototype) slettes fortsatt når Bølge 1 er ferdig.
