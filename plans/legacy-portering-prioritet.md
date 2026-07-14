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

Status 2026-07-14 natt: Tjenester og priser (2.1), Anlegg (2.2), Kapasitet (redirect, verifisert),
Stall-oversikt (redirect, verifisert), Grupper-timeplan (var alt v2, ikke legacy), Økonomi
(redirect til alt-portert `/admin/agencyos/okonomi`, verifisert), **Tilgjengelighet** (Bølge 3.31
— se under) — **alle ferdige eller bekreftet ikke-legacy**. Gjenstår KUN:

| Skjerm | Rute | Status |
|---|---|---|
| Innstillinger | `/admin/settings` (+ `api`/`calendar`/`security`/`tilgang`) | IKKE portet — ~1730 linjer fordelt på 5 underskjermer (API-nøkler + modal, Google Calendar-sync m/ egen sync-seksjon, sikkerhet, tilgangsstyring). |

**Rettelse:** Tilgjengelighet ble likevel portet (Bølge 3.31) — ved nærmere lesing var kalender-
triplet (måned/uke-drag/år-Gantt) + `slot-form.tsx` ren, isolert UI-logikk uten arkitektur-risiko,
samme vurdering som snudde på «Ny turnering»-veiviseren. Eneste reelle hinder var at
`CalendarSyncSection` er en ASYNC SERVER-KOMPONENT og ikke kan importeres direkte i en klient-
komponent — løst ved at `page.tsx` render'er den og sender den inn som en `calendarSync`-slot-
prop til klient-komponenten (standard Next.js-mønster). `CalendarSyncSection`-INNHOLDET selv er
bevisst IKKE re-skinnet til v2 — den porteres sammen med Innstillinger når den økten kommer, ikke
duplisert. Se `docs/MASTER-SKJERMPLAN.md` Endringslogg (Bølge 3.31) for full detalj.

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
