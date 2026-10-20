# Design-sammenligning PlayerHQ (kode mot Precision Athletics-tegningene)

Dato 05.10.2026. Lesing av `src/app/portal/**`, `src/components/portal/precision/**`, `src/components/precision/**`. Ingen kode endret.
Kilder: `docs/design-system/skjermliste-precision-athletics.md`, `skjermregister.json`, tegninger i Claude Design `7d7c2994` (`ui_kits/playerhq/screens/*.jsx`), `beslutninger.md`.
Metode: ruter -> `page.tsx` -> komponent; skall (PlayerHQSkall = Precision, V2Shell = gammelt), tokens, tilstander, strengsjekk mot skjermlista. Ikke kjørt i nettleser; visuelle avvik er ikke målt.

## Tellinger (31 skjermtyper, utgåtte ikke talt)

| Status | Antall | Typer |
|---|---|---|
| GRØNN | 5 | PH-03, PH-22, PH-24, PH-TP-01, PH-RD-01/08 |
| GUL | 18 | PH-01, 04, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 25, PH-IUP-01 |
| RØD | 8 | PH-05, 06, 07, 08 (inkl. RD-03/04/05), 27, PH-IUP-02, PH-11-MAL-IUP, PH-RD-02/06/07/09 |

Rutefunn på tvers: 25 `page.tsx` rendrer fortsatt `V2Shell` (gammelt skall, fane «Analyse») og 21 sider ligger i `(legacy)` med V2Shell via `(legacy)/layout.tsx`. Alle `loading.tsx`/`error.tsx` finnes på rotnivå (`src/app/portal/`), så tom/laster/feil er dekket grovt; komponentene har egne tom-tilstander. Ingen hex-farger og ingen emoji i `components/portal/precision/*`.

## Tabell

| ID | Ruter | Kodefil | Status | Konkrete avvik | Innsats |
|---|---|---|---|---|---|
| PH-01 I dag | `/portal` | `app/portal/page.tsx`, `portal/precision/PH01IDag.tsx` | GUL | Fireukerssjekk-kortet fra tegningen finnes ikke: page.tsx:162-168 viser et generisk «Evaluering»-kort som lenker til `/portal/mal/evaluering` (eldre IUP-flate), ikke `/portal/iup/fireukerssjekk` (som ingen UI lenker til). Sesongkort uke 42 mangler. Ingen hurtigknapp. Bjella går til `/portal/varsler`. | M |
| PH-02 (utgår) | `/portal/gjennomfore`, `/portal/tren/wb` | `portal/precision/PH02Gjor.tsx` | Utgår, ikke ryddet | Skulle sendt til `/portal` (28.09); renderer fortsatt egen side. | S |
| PH-03 Øktark | `/portal/gjennomfore/[id]`, `/portal/tren/wb/[sessionId]` | `PH03Oktark.tsx` | GRØNN | Ingen feiltilstand i komponenten (loading/error på rot). | S |
| PH-04 Live før start | `/portal/live/[id]/brief` | `PH04LiveBrief.tsx` | GUL | Ingen AK-formel/pyramide-overskrift (0 treff på «AK-formel»/«Pyramide»). `borderRadius: 8` hardkodet 6 steder (lov i tokens, men ikke via var). | S |
| PH-05 Live aktiv | `/portal/live/[id]/active` | `PH05LiveAktiv.tsx` | RØD | Bygget mot gammel PH-05 (én rep-teller, «snarvei til slagteller», header-kommentar linje 5-9). Runde 24-tegningen (`PH-live.jsx`): fire tellere Uten ball · Lav hastighet · Automatikk · Slag (−1/+1/+5, «40 av 60»), egen klokke per øvelse, teknisk oppgave med bilde/video, hopp over/bytt rekkefølge. 0 treff på alle disse strengene. | L |
| PH-06 Fysisk live | `/portal/live/[id]/tapper` | `PH06Slagteller.tsx` | RØD | Tegningen: fysisk økt (vekt, reps, serier). Koden: slagteller, som er slått inn i PH-05 i runde 24. 0 treff på vekt/serier/RIR. Radius 20 i :378. | L |
| PH-07 Etter økt | `/portal/live/[id]/summary`, `/portal/tren/feiring/[planId]` | `PH07Oktoppsummering.tsx` | RØD | Mangler Belastning 1–10, Fokus 1–10, «Hvor tungt» (fysisk), tid/reps per øvelse mot plan, «Coach ser økta». 0 treff på Belastning/Hvor tungt. `overflowX:auto` linje 323. | M |
| PH-08 Runde live (+RD-03/04/05) | `/portal/runde/live`, `/portal/mal/runder/[id]/slag` | `PH08RundeLive.tsx`; slag: `mal/runder/[id]/slag/page.tsx` | RØD | RD-03: ingen «I hull», straffeslag, SG hittil (0 treff). RD-04 putt (lengde i fot, break, fart, miss) bygget på `V2Shell` (slag/page.tsx:110) med gammelt design. Radius 8 ×16. | L |
| PH-09 / PH-RD Registrer runde | `/portal/runde/logg`, `/portal/mal/runder/ny`, `…/[id]/hull` | `PH09RegistrerRunde.tsx`, `PHRD01VelgNiva.tsx` | GUL | PH-RD-01 og kladd OK. Mangler: RD-02 oppsett med gjenopprett/forkast kladd (0 treff på «kladd» i PH09), RD-07 import (CSV, kolonnemapping), RD-06 manuell SG med sumkontroll, RD-09 `/rediger` (rute finnes ikke). | L |
| PH-RD-01/08 | `/portal/mal/runder/ny`, `/portal/mal/runder/[id]` | `PHRD01VelgNiva.tsx`, `PHRD08RundeFerdig.tsx` | GRØNN | Datakvalitet-merking mangler i RD-01 (0 treff «datakvalitet»). | S |
| PH-10 Plan | `/portal/planlegge`, `/portal/kalender`, `/portal/kalender/opptatt`, `/portal/tren/fys-plan` | `planlegge/page.tsx`, `PH10Plan.tsx` (269 l.) | GUL | Bare ukevisning (dagepiller). Tegningen: zoom År · Måned · Uke · Dag; «Koble Google-kalender», veileder første gang, turneringsreise (B3), treningssamling (B7), «Be coach endre planen» (B8), forslag over 130 %/under 70 % (0 treff). År/måned sender til Workbench. `/portal/kalender*` og `tren/fys-plan` er egne sider, ikke redirects. | L |
| PH-11 Workbench | `/portal/planlegge/workbench` | `workbench/page.tsx`, `PH11Workbench.tsx` (→ `admin/precision/AG11Workbench`), `workbench/WorkbenchAar/Periode/Maned` | GUL | `AG11Niva` har bare uke/okt/vol/mal (AG11Workbench.tsx:42); År/Periode/Måned via eldre `components/workbench/*` (`WorkbenchManed.tsx` 89 l., ingen `pa-`). Mangler måned-innhold (fokus, timer per akse, evaluering) og månedsskjema, «Gjenta» (ikke · hver uke · annenhver …), «Egen»-merke finnes delvis. Opprett årsplan kun i WorkbenchAar. | L |
| PH-12 Velg treningsplan | `/portal/planlegge/bygger`, `/portal/ai/mal-bygger` | `planlegge/bygger/page.tsx`, `PH12VelgPlan.tsx` | GUL | De fem navngitte planene (Weekend Warrior, Klubbspilleren, Junior-aspirant, Konkurransespilleren, Practice like the pros) finnes ikke i `src/` (0 treff); malene er `anbefalMalCore`/PlanTemplate, `.slice(0,5)`. `timer: 12` hardkodet (bygger/page.tsx:28). `ai/mal-bygger` bruker `components/v2`. Faglig innhold må komme fra Anders. | M |
| PH-13 Øvelsesbank | `/portal/drills`, `…/[id]`, `/portal/coach/ovelser`, `/portal/ai/foresla-drill` | `PH13DrillBank.tsx` (857 l.), `PH13DrillDetalj.tsx` | GUL | `ai/foresla-drill` på V2Shell. `coach/ovelser` på V2Shell. `overflowX:auto` DrillBank:436. | M |
| PH-14 Stats › Tester | `/portal/tren/tester*` | `tren/tester/page.tsx`, `components/tester/*` | GUL | `tester/ny` og `ny/egen` blander `components/v2`. Vitnegodkjenning ikke i koden (ok, «kommer senere»). | S |
| PH-15 Test gjennomfør | `/portal/tren/tester/[id]/gjennomfor` | `PH15TestGjennomfor.tsx` | GUL | Beslutning 28.09: fjern sperre på Nærspill Gate, VISA Express og 9 hull lengde, og Wedge Gate skal telle treff. `lib/portal-tester/tn-catalog.ts:75` og :68 har fortsatt `blocked`; Wedge Gate bruker «points»-felt (:73), ikke Treff/Bom. | M |
| PH-16 Stats | `/portal/analysere*` | `analysere/page.tsx`, `PH16Stats.tsx` (1050 l.) | GUL | Fire deler på plass. Mangler: Tiger 5 per runde/sesong, Ytelsesbilde, Kontrollert/Egenregistrert i Tester, Filter-knapp, «Registrer X runder til»-terskeltekster (0 treff). `skill-map` OK. | M |
| PH-17 TrackMan/utstyr | `/portal/analysere/trackman*`, `/portal/mal/trackman/gapping`, `/portal/mal/sg-hub/equipment` | `PH17TrackMan.tsx` | GUL | `sg-hub/equipment` ligger i `(legacy)` (V2Shell-chrome, `UtstyrHelseV2`) – RØD isolert. `analysere/trackman/[id]` blander `components/v2/icon` og gammel `TrackManSessionDetail`. `overflowX:auto` PH17TrackMan:113, :571, :755 (regelbrudd: aldri sidelengs rulling). | M |
| PH-18 Snittscore/runder | `/portal/mal/runder*`, `/portal/analysere/hull`, `…/datagolf`, `/portal/statistikk/*` | `PH18Runder.tsx` | GUL | `analysere/datagolf` (page.tsx:29), `statistikk/[metric]` (page.tsx:368, 516 l.), `statistikk/runder/[id]/del` (:47) på V2Shell. `analysere/hull` blander V2. | L |
| PH-19 Målsetning | `/portal/mal*`, `/portal/talent/*`, `/portal/utviklingsplan` | `mal/page.tsx`, `PH19Malsetninger.tsx` | GUL | Tegningen: åpner Workbench › Målsetninger. Koden: egen flate; lenke til `/portal/mal/evaluering` (gammel IUP-vei). `talent/*` (min-plan, roadmap) og `utviklingsplan` er ikke redirectet (utgår 28.09). PH19Leaderboard.tsx:101 `overflowX:auto`. Enkeltmål bruker V2-datatyper og radius 8 ×13. | M |
| PH-20 Gameplan | `/portal/gameplan*`, `/portal/baneguide*` | `PH20Gameplan.tsx` | GUL | `gameplan/[baneId]` på V2Shell (page.tsx:67); hull-siden blander `components/v2`. «Eksempeldata» er merket (PH20Gameplan.tsx:223, :538) – ok iht. design. `overflowX:auto` :420. `baneguide/*` mangler skall (ikke redirects i skjermregisteret). | M |
| PH-21 Innboks | `/portal/coach*`, `/portal/onskeligokt*`, `…/sg-hub*` | `PH21Innboks.tsx` (853 l.) | GUL | Faner Meldinger/Spørsmål/Tilbakemelding/Videoer/Planer/Ønsket økt finnes. `coach/melding`, `coach/melding/ny`, `coach/sporsmal/*`, `sg-hub` blander `components/v2`; `coach/melding` og `coach/ovelser` på V2Shell. Ingen «Angre» for coachens direkte endringer (0 treff). Forslag fra WANG/TN med avsender ikke funnet. | M |
| PH-22 Caddie | `/portal/coach/ai`, `/portal/ai/foresla-turnering` | `PH22CaddieChat.tsx` | GRØNN | `ai/foresla-turnering` på V2Shell (page.tsx:138). `overflowX:auto` :566. | S |
| PH-23 Booking | `/portal/booking*`, `/portal/meg/bookinger*` | `PH23Booking.tsx` (1305 l.) | GUL | `booking/ny` og `booking/ny/bekreft` på V2Shell. `reschedule`, `[bookingId]`, `anlegg`, `coach` blander `components/v2`. Klippekort for Performance Pro finnes bare i datalag (`ph23-booking-data.ts`); 0 treff i komponenten. | M |
| PH-24 Meg | `/portal/meg*`, `/portal/venner*`, `/portal/spiller/[id]` | `meg/page.tsx`, `PH24Meg.tsx` | GRØNN | 12 seksjoner i riktig rekkefølge (:72–:134). `spiller/[spillerId]` og `venner/[spillerId]` på V2Shell. `meg/helse` har V2-sammenblanding (`MegHelseV2`). | S |
| PH-25 Abonnement og innstillinger | `/portal/meg/abonnement*`, `…/innstillinger/*`, `…/help*`, `/portal/varsler` | `PH25Abonnement.tsx` | GUL | V2Shell: `abonnement/avbestill`, `faktura/[id]`, `meg/feedback`, `meg/help`, `help/artikkel`, `help/kontakt`, `innstillinger/sikkerhet`, `sprak`, `varsler` (9 sider). `abonnement/fortsett` ligger i `(legacy)`. `/portal/varsler` bruker `VarslerV2` inne i Precision-skall. Samtykke til opptak i coachingøkt ikke funnet (0 treff). | L |
| PH-26 (utgår) | `/portal/fysisk`, `tren/turneringer*`, `trening/*`, `ukesdigest` | diverse | Utgår, ikke ryddet | Fortsatt egne sider (`tren/turneringer`, `ukesdigest`, `samlinger` på V2Shell). Skal være redirects/lag i Plan. | M |
| PH-27 Deling | `/portal/meg/deling` | `meg/deling/page.tsx`, `portal/precision/navngitt-deling.tsx` | RØD | Rutas innhold er «Navngitt trenerdeling» fra arkivert prototype (iup-komplett), ikke PH-27: mangler Hvem har tilgang (AK/WANG/TN, «Gruppe»-pille), Hva de ser, Forespørsler (Godta/Avslå), Historikk, U16-variant. Den ekte samtykkesiden er `meg/innstillinger/personvern/deling` med `TnSamtykkeSide` (V2-komponent, bryterlogikk). Lenken «Trekk tilgang» (rust) finnes ikke som i tegningen. | L |
| PH-IUP-01 Fireukerssjekk | `/portal/iup/fireukerssjekk` | `PHIUP01Fireukerssjekk.tsx` | GUL | Selve skjermen følger tegningen (skala 1–5, autolagring, Prøv igjen, historikk). Uten inngang: ingen lenke fra I dag (se PH-01). | S |
| PH-IUP-02 Sesongevaluering | `/portal/iup/sesongevaluering` | — | RØD | Ruten finnes ikke. Eldre `/portal/mal/evaluering` + `iup-evaluering.tsx` dekker utviklingssjekk/sesongevaluering i annet oppsett. | L |
| PH-11-MAL-IUP | `…/workbench?vis=malsetninger&iup=1` | — | RØD | 37 måltall K1–K4 ikke bygget; ingen `iup`-param i workbench/page.tsx. | L |
| PH-TP-01 Teknisk plan | `/portal/tren/teknisk-plan/[planId]` | `PHTP01TekniskPlan.tsx` + `precision/teknisk-plan/tp-deler.tsx` | GRØNN | Kvalitetssjekk, Før og nå, +10/+25 finnes. Utkast-tilstand ok. | S |

## Tverrgående avvik (gjelder flere skjermer)

1. Fanenavn: `PLAYERHQ_NAV` i `src/components/v2/shell.tsx:86` heter «Analyse»; Precision-skallet (`PlayerHQSkall.tsx:25`) sier «Stats». 25 sider + `(legacy)` viser derfor feil fane og gammel navigasjon.
2. Bjella går til `/portal/varsler` (132 steder, `innboksHref`), ikke innboksen PH-21 (`/portal/coach`, bare 2 steder). Tegning og beslutning: bjella åpner innboksen.
3. `uleste={0}` hardkodet på 54 sider: bjella viser aldri antall der.
4. Ingen hurtigknapp i PlayerHQ (Spør Caddie · Ny økt · Registrer runde · Start økt) – komponenten finnes (`precision/Hurtigknapp.tsx`) men brukes bare i AgencyOS.
5. Utgåtte flater (28.09) er ikke gjort til redirects: `kalender`, `gjennomfore`, `tren/fys-plan`, `tren/turneringer`, `fysisk`, `trening/*`, `ukesdigest`, `talent/*`, `utviklingsplan`.
6. `overflowX:auto` på rader/tabeller mot «aldri sidelengs rulling»: PH07:323, PH13DrillBank:436, PH17TrackMan:113/571/755, PH19Leaderboard:101, PH20Gameplan:420, PH22CaddieChat:566.
7. Tokens: ingen hex/emoji i Precision-komponentene (bra). `borderRadius` er tall (8, 12, 20) i stedet for `var(--radius*)`: PH04 ×6, PH05 ×13, PH06 ×12 (20 i :378), PH08 ×16, PH09 ×17, PH19Enkeltmal ×13. Kosmetikk.
8. Demodata i prod-vei: PH-20 eksempeldata (merket, ok); `timer: 12` i PH-12 (bygger/page.tsx:28); ellers ingen funnet i Precision-komponentene.

## Anbefalt rekkefølge for retting

1. Skall og navigasjon (S–M, størst gevinst): bjella til innboksen, `uleste` fra ekte tall, hurtigknapp i PlayerHQSkall, rett «Analyse» -> «Stats», redirects for utgåtte ruter.
2. Flytt de 25 V2Shell-sidene til `PlayerHQSkall` (mekanisk først, design etterpå): start med de brukerrettede (`booking/ny*`, `meg/help*`, `innstillinger/*`, `abonnement/*`, `statistikk/*`, `gameplan/[baneId]`).
3. PH-01 -> fireukerssjekk-kort og sesongkort; bygg PH-IUP-02; knytt PH-IUP-01 til inngangen.
4. Live-kjeden PH-05 → PH-06 → PH-07 (runde 24/36): fire tellere, fysisk økt, Belastning/Fokus.
5. Runde-registrering RD-02/03/04/05/06/07/09 (stor, samme komponentfamilie).
6. PH-27 Deling etter tegningen (personvern, bør før videre WANG/TN-bruk).
7. PH-10 zoom/Google/turneringsreise og PH-11 måned/gjenta/IUP-måltall (L, krever avklart datamodell).
8. PH-15 TN-sperrer og Wedge Gate treff; PH-16 Tiger 5/Ytelsesbilde/Kontrollert.
9. PH-12 fem standardplaner (venter faglig innhold fra Anders).
10. Opprydding: `overflowX:auto`, radius til tokens.
