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

Status 2026-07-14 sent kveld: Tjenester og priser (2.1), Anlegg (2.2), Kapasitet (redirect,
verifisert), Stall-oversikt (redirect, verifisert), Grupper-timeplan (var alt v2, ikke legacy),
Økonomi (redirect til alt-portert `/admin/agencyos/okonomi`, verifisert) — **alle ferdige eller
bekreftet ikke-legacy**. Gjenstår KUN to klynger, begge bevisst IKKE portet i kveld:

| Skjerm | Rute | Hvorfor ikke i kveld |
|---|---|---|
| Innstillinger | `/admin/settings` (+ `api`/`calendar`/`security`/`tilgang`) | ~1730 linjer fordelt på 5 underskjermer (API-nøkler + modal, Google Calendar-sync m/ egen sync-seksjon, sikkerhet, tilgangsstyring). `settings/calendar/calendar-sync-section.tsx` importeres OGSÅ direkte av `availability/page.tsx` — de to klyngene er koblet, bør planlegges/porteres sammen, ikke separat. |
| Tilgjengelighet | `/admin/availability` | ~1085 linjer: måned/uke(drag-and-drop)/år(Gantt)-trippel-visning + `slot-form.tsx` (CRUD-modal m/ gjentakelse) + samme `CalendarSyncSection` som over. Drag-and-drop-interaksjonen i uke-grid og avhengigheten til Innstillinger gjør dette til en «ikke-triviell»-oppgave per CLAUDE.md — trenger egen Plan Mode-økt mot faktisk kode, ikke en rushet nattlig port. |

Begge bør tas i SAMME økt (felles `CalendarSyncSection`-beslutning: porte den én gang til v2 og
gjenbruke, ikke duplisere). Anbefalt neste steg: egen plan-mode-gjennomgang av disse to klyngene
sammen, ikke en fortsettelse av det bølgevise «én skjerm per commit»-mønsteret som resten av
listen har fulgt.

## P3 — sjelden/admin

Status 2026-07-14 sent kveld: **alle listede skjermer er nå portet eller bekreftet ikke-legacy**
— Audit-log, e-postmal-redigering, integrasjoner, klubb-innstillinger, team/inviter, profile,
hjelp, stats-moderering, talent-undersider (kohort/region/ressurser/wagr-benchmark/wagr-import),
tilstander (redirect), trackman, videoer, opptak, board (redirect), reach, kommunikasjon (redirect),
workspace-oppgave-detalj, teknisk-plan-detalj, lag-snitt, foresporsler, godkjenninger-detalj,
approvals-redirects, tester-klyngen (hub/fasiter/foreslåtte/tildel), spiller-full-profil,
turneringer (hub/detalj/ny/dubletter) — se `docs/MASTER-SKJERMPLAN.md` Endringslogg for detaljer
per skjerm. **Gjenstår i P3:** kun **Talent · Sammenligning** (`/admin/talent/sammenligning`) —
bevisst IKKE portet, avhenger av delt v10-komponent (`TalentSammenligning`,
`src/components/admin/talent/`) utenfor golfdata/v13-generasjonen; krever egen beslutning om
enten å bygge en ny v2-versjon av selve sammenligningskomponenten, eller la den midlertidig
beholde v10-stil inni en v2-ramme.

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
