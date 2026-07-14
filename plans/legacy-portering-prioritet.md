# Legacy-portering — prioritert rekkefølge (2026-07-12)

82 sider ligger igjen i `src/app/admin/(legacy)/` med gammelt design. ALLE er
nåbare (fungerer, gammel stil) — flere via Mer-menyen i AgencyOS-nav-en.
Portering skjer bølgevis: én skjerm per commit, master-skjermplanens haker
oppdateres i samme commit (LÅST regel). Ny booking ble portet 2026-07-12.

## P1 — daglig coach-bruk (port først)

| Skjerm | Rute | Merknad |
|---|---|---|
| Turneringer (hub) | `/admin/tournaments` | FERDIG — hub, ny (5-stegs veiviser) og dubletter portet 2026-07-14 (Bølge 1.1/3.29/3.30). Hele klyngen er v2. |
| Drills-bibliotek | `/admin/drills` (+ detalj/rediger/ny/forslag) | Lenket fra Mer-menyen |
| Live-økt coach-flyt | `/admin/live/[sessionId]/brief\|active\|summary` | Kjernen i gjennomføring med spiller |
| Spiller-skjemaer | `/admin/spillere/ny`, `[id]/rediger`, `[id]/tildel-test` | Stall-kompletthet |
| Plan-mal-redigering | `/admin/plan-templates/ny`, `[id]`, `[id]/rediger` | Volum-linje/masseredigering finnes alt (2026-07-11) |

## P2 — ukentlig bruk

Status 2026-07-14 natt: **FERDIG, alt portet eller bekreftet ikke-legacy.** Tjenester og priser
(2.1), Anlegg (2.2), Kapasitet (redirect, verifisert), Stall-oversikt (redirect, verifisert),
Grupper-timeplan (var alt v2, ikke legacy), Økonomi (redirect til alt-portert
`/admin/agencyos/okonomi`, verifisert), Tilgjengelighet (Bølge 3.31 — måned/uke-drag/år-Gantt +
CRUD-modal) og hele Innstillinger-klyngen (Bølge 3.32–3.36: hub, API-nøkler, Google Calendar-sync,
sikkerhet, tilgangsmatrise). `CalendarSyncSectionV2` (async server-komponent) er porten begge
Tilgjengelighet og Innstillinger · Kalender deler — porten LØST, ikke lenger en kjent gap: siden
begge nå bruker v2-komponenten er visuell inkonsistens borte. Se `docs/MASTER-SKJERMPLAN.md`
Endringslogg (Bølge 3.31–3.36) for full detalj per skjerm.

## P3 — sjelden/admin

Status 2026-07-14 sent kveld: **alle listede skjermer er nå portet eller bekreftet ikke-legacy**
— Audit-log, e-postmal-redigering, integrasjoner, klubb-innstillinger, team/inviter, profile,
hjelp, stats-moderering, talent-undersider (kohort/region/ressurser/wagr-benchmark/wagr-import),
tilstander (redirect), trackman, videoer, opptak, board (redirect), reach, kommunikasjon (redirect),
workspace-oppgave-detalj, teknisk-plan-detalj, lag-snitt, foresporsler, godkjenninger-detalj,
approvals-redirects, tester-klyngen (hub/fasiter/foreslåtte/tildel), spiller-full-profil,
turneringer (hub/detalj/ny/dubletter) — se `docs/MASTER-SKJERMPLAN.md` Endringslogg for detaljer
per skjerm. **Talent · Sammenligning** (`/admin/talent/sammenligning`) portet 2026-07-14 (Bølge
3.37, på Anders' eksplisitte beskjed) — `TalentSammenligning`-komponenten viste seg å være
enekonsument, ikke en reell delt v10-komponent, så den ble erstattet direkte. Samtidig fikset:
loaderen beregnet alltid ekte per-spiller SG-verdier og kohort-tall, men mapperen og v10-
komponenten kastet dem bort og viste tomtilstand uansett — v2-versjonen viser nå de ekte tallene.
Se `docs/MASTER-SKJERMPLAN.md` Endringslogg (Bølge 3.37) for full detalj.

**MED DETTE ER HELE LISTEN (P1 + P2 + P3) FERDIG PORTET. Ingen gjenstående punkter.**

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
