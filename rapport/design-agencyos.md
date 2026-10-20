# AgencyOS: kode mot tegning (maskinsjekk 05.10.2026)

Metode: lest `page.tsx` for alle 150 sider under `src/app/admin` og `src/app/meg`, skallet (`AgencyOSSkall`, `AdminSkallVelger`, `precision-ia.ts`, `V2Shell`) og Precision-komponentene `src/components/admin/precision/AG*.tsx`. Kriterier fra skjermlisten og `beslutninger.md`. Tegningene i Claude Design er ikke åpnet fil for fil; «må vise»-kolonnen i `skjermliste-precision-athletics.md` er brukt som tegningsfasit. Rene redirects (ca. 85 sider) er ikke talt som skjermer. Ingenting er kjørt i nettleser.

## Tellinger (49 skjermtyper/rutegrupper)

| Status | Antall |
|---|---|
| GRØNN | 5 |
| GUL | 19 |
| RØD | 25 |

Rød-gruppen består av to ulike typer:
- **Gammelt design** (V2Shell, Train-lock): 14 grupper. Ingen hurtigknapp, gammel meny med «Innsikt», ingen bjelle.
- **Precision-skall, men prototype-innhold** (demodata og ingen handlinger): 6 grupper (AG-17, AG-18, AG-19, AG-21, AG-22, AG-23, AG-24 er felles årsak, se funn 2).

## De 10 viktigste avvikene

1. **Skall og meny.** `AdminSkallVelger` gir alle sider under `(legacy)` V2Shell, og 17 sider utenfor `(legacy)` importerer V2Shell selv (`bookinger/[id]`, `bookinger/ny`, `grupper/[id]*`, `kalender/hendelse/*`, `tournaments/*`, `trackman/[sessionId]`, `team/*`, `marketing`, `analyse`, `spillere/ny`, `workspace/notion`, `agencyos/ak-stigen`, `kommunikasjon`). `AGENCYOS_NAV` i `src/components/v2/shell.tsx:109-117` har fortsatt «Innsikt», ingen «Mer» med Booking · Grupper · Tester · Økonomi · Oppsett, og V2Shell har ingen hurtigknapp (`grep -i hurtig shell.tsx` gir 0 treff). Dette bryter beslutningen «hurtigknapp på alle sider i skallet».
2. **Fem Precision-skjermer er prototyper med demodata i prod.** `src/app/admin/jarvis/page.tsx:33`, `oppgaver/page.tsx:41`, `innsikt/page.tsx:24`, `oppsett/page.tsx:56`, `drift/page.tsx:25` (samt `feillogg`, `audit-log`, `gdpr`, `hjelp`, `profile`, `innsyn/talent/radar`) rendrer `AG19/21/22/23/24` uten data-prop. Komponentene faller da tilbake til `STANDARD_DATA` (`AG19CaddieHub.tsx:86`, `AG21Oppgaver.tsx:72`, `AG22InnsiktTalent.tsx:77`, `AG23Oppsett.tsx:71`, `AG24Drift.tsx:90`) med «Tobias Lindvik», «Magnus Aasheim», «Kari Demo», `anders@demo.no`, org.nr. «000 000 000» og oppdiktet ACWR 1,58. Ingen av dem har server actions eller `fetch`. Sletteforespørsler (GDPR) og «SLETT»-bekreftelsen i `AG24Drift` gjør ingenting, og det er coachens eneste GDPR-vei i den nye menyen.
3. **TrackMan fabrikerer tall.** `src/app/admin/trackman/page.tsx:61-91`: ekte `TrackManSession`-rader får hardkodet kølle «7-jern», Club Speed 91,4, Ball Speed 124,6, Carry 158,4 og videonotat «God rotasjon, sjekk hoftevinkel på toppen». Bryter «alt appen sier om en spiller skal ha måling, dato og kilde». Samme side viser demo hvis ikke både økter og videoer finnes (`data` blir `undefined`).
4. **Turneringer (AG-17) har falske data.** `src/app/admin/turnering/page.tsx:66-67` setter `lat/lon` fra løpenummer, `level: "Nasjonal"`, `place: "Norge"`; `:96-101` hardkoder DataGolf-rader («Feltstyrke +1.42», «Vinn-sannsynlighet 14.2 %»). Skal vises bare for Anders og med ekte kilde. Faller til `STANDARD_DATA` når listen er tom (`AG17Turneringer.tsx:113`). Opprett/påmelding er ikke koblet (`onOpprettTurnering` valgfri, aldri sendt inn).
5. **«Ny booking» går til gammel flyt.** `precision-ia.ts:34` (hurtigknapp) peker på `/admin/bookinger/ny`, som er V2Shell + `NyBookingWizard` (`bookinger/ny/page.tsx:120`). Tegningen AG-06-NY er fanen «Ny booking» i `AG06Booking` (finnes, `AG06Booking.tsx:89`), men siden tar ikke `searchParams` så den kan ikke åpnes direkte. Samme for `bookinger/[id]` og `services` (Train-lock).
6. **Workbench-menyen åpner Plan-hub, ikke Workbench.** `precision-ia.ts:18` og `:30` bruker `/admin/planlegge`, som er `permanentRedirect("/admin/plan")` (AG-14), mens AG-11 ligger på `/admin/workbench/[playerId]` og det finnes ingen `/admin/workbench`-side uten spiller-ID. Samme for hurtigknappen «Ny økt i Workbench».
7. **Bjella viser aldri antall utenfor Innboks og Kø.** Bare `innboks/page.tsx:94` og `ko/page.tsx:144` sender `uleste`; Cockpit og alle andre sider viser bjelle uten tall. Gjelder også Cockpit (`agencyos/page.tsx`).
8. **Loading og error er gammelt design.** `agencyos/loading.tsx:8` (`V2Laster variant="cockpit"`), `src/app/admin/error.tsx:30` (`V2Feil`) og `(legacy)/loading.tsx`. 82 av 116 `loading.tsx`/`error.tsx` under `/admin` bruker V2Laster/V2Feil; 34 bruker Precision. Cockpit, Kø, Turnering, Jarvis, Oppgaver, Innsikt, Oppsett, Drift, TrackMan har ingen egen `loading.tsx` og får V2-skjelettet fra `(legacy)` eller ingen.
9. **Rundeanalyse mangler coach-scope.** `src/app/admin/runder/page.tsx:26` henter `prisma.round.findMany` uten `coachScopedPlayerWhere`: assistant coach ser alle spilleres runder (personvern). AG-RD-02 «Manglende SG-grunnlag» (`?fane=kvalitet`) finnes som Datakvalitet i Innboks, ikke på `/admin/runder`, og AG-A02–A06 (`/admin/analyse`) er fortsatt V2Shell.
10. **Datamodell for år/måned mangler.** `prisma/schema.prisma:3597` `SeasonPlan` har ingen `createdById`; ingen `MonthPlan`-modell finnes (beslutning 28.09 punkt 2 og 3). `WorkbenchAar`/`Periode`/`Maned` kjører likevel i `AgencyOSSkall` og bruker Precision-komponenter; månedsinnhold (fokus, timer per akse, evaluering) har dermed ikke lagring. Utover dette: Økonomi (AG-20) har ikke fordeling på AK Golfs tjenester (`AG20Okonomi.tsx:37`, `data.hull.budsjettkilde`), kalender (AG-05) mangler coach-filter, år-visning og dra-flytt (`AG05Kalender.tsx:8-12`), og AG-12 «Godkjenn og send» er ikke bygget (`AG12Oktark.tsx:128`).

Tokenfunn: ingen hardkodede hex-farger, ingen emoji og ingen `overflow-x` i `src/components/admin/precision/*` og `src/components/precision/*`. Rust (`variant="signal"`) brukes bare på slett/avvis/avlys/avslutt og tellertall: i samsvar med beslutningen. Unntak: `AG17Turneringer.tsx:381,389` bruker `signal` som status «Påmeldt» (rust som status, ikke signal). Mye inline-stil i `AG07Stall.tsx` (fungerer, ikke tokenbrudd).

## Tabell

Innsats: S = under en halv dag, M = 1-3 dager, L = over 3 dager.

| ID | Ruter | Kodefil | Status | Avvik | Innsats |
|---|---|---|---|---|---|
| AG-01 Cockpit | `/admin/agencyos` | `agencyos/page.tsx`, `AG01Cockpit.tsx` | GUL | Teller «Økter i dag» i stedet for «Forslag venter» (`:148`); «Åpne køen» til `/admin/ko` (`:74`); ingen `uleste` til bjella; «kort svar», huk av Notion-oppgave og «Start live» ikke bygget (hode i `AG01Cockpit.tsx`); gammel `loading.tsx:8` | M |
| AG-01 /meg | `/meg`, `/meg/dispatch`, `/meg/morgenbrief` | `src/app/meg/page.tsx` | RØD | `MegApp`, ikke AgencyOSSkall; `notFound()` for ikke-ADMIN (`:20`) | M |
| AG-02 Kø | `/admin/ko` | `ko/page.tsx`, `AG02Ko.tsx` | GRØNN | Ekte data; ingen `loading.tsx`; `STANDARD_DATA` med Magnus Aasheim (`AG02Ko.tsx:146`) er død fallback | S |
| AG-03 Oppfølgingskø | `/admin/queue` | redirect | utgår | Ikke talt | |
| AG-04 Innboks | `/admin/innboks` | `innboks/page.tsx`, `AG04Innboks.tsx` | GUL | «Lag utkast» disabled (`:194`), designet vil ha Jarvis-utkast; ellers komplett (filtre, Haster, «Alt er håndtert», datakvalitet) | M |
| AG-04 e-postmal liste | `/admin/kommunikasjon?fane=maler` | `kommunikasjon/page.tsx:77` | RØD | V2Shell + `AdminEmailV2` | S |
| AG-04 e-postmal rediger | `/admin/email-templates/[id]/rediger` | `AG04MalRediger.tsx` | GRØNN | | |
| AG-05 Kalender | `/admin/kalender` | `kalender/page.tsx`, `AG05Kalender.tsx` | GUL | Ingen coach-filter, ingen år-visning, ingen dra-flytt med «Angre 10 s» (`:8-12`), ingen farge etter akse | L |
| AG-05 hendelse | `/admin/kalender/hendelse/[id]`, `/ny` | `kalender/hendelse/*/page.tsx` | RØD | V2Shell, `TilbakeLenke/Tittel` fra v2 | S |
| AG-05 tilgjengelighet | `/admin/availability` | `(legacy)/availability/page.tsx` | RØD | V2Shell via velger, `AdminAvailabilityV2` | M |
| AG-06 Booking | `/admin/bookinger` | `bookinger/page.tsx`, `AG06Booking.tsx` | GUL | Flytt/avlys bekreftet mangler (`:11`), ingen klipp-felt; ikke `?fane=ny` | S |
| AG-06 detalj | `/admin/bookinger/[id]` | `bookinger/[id]/page.tsx:81` | RØD | V2Shell + `AdminBookingDetaljV2` | S |
| AG-06-NY | `/admin/bookinger/ny` | `bookinger/ny/page.tsx:120` | RØD | V2Shell + `NyBookingWizard`; hurtigknappen peker hit | M |
| AG-06 tjenester | `/admin/services` | `(legacy)/services/page.tsx` | RØD | `AdminServicesTrainLock`, V2Shell | S |
| AG-07 Stall | `/admin/spillere` | `spillere/page.tsx`, `AG07Stall.tsx` | GUL | «Neste turnering», «Plan slutter», ACWR hardkodet «—» (`:103-105`) | M |
| AG-07 ny spiller | `/admin/spillere/ny` | `spillere/ny/page.tsx:27` | RØD | V2Shell + `TrainLockSpillerNy` | S |
| AG-08 Spiller 360 | `/admin/spillere/[id]` | `AG08Spiller360.tsx`, `AG08Faner.tsx` | GUL | Fireukerssjekk og utviklingssjekk finnes ikke (`AG08Faner.tsx:143,170`) | M |
| AG-08 rediger | `/admin/spillere/[id]/rediger` | `AG08Rediger.tsx` | GRØNN | | |
| AG-08 turnering-kobling | `/admin/spillere/[id]/turnering-kobling` | `turnering-kobling/page.tsx:71` | GRØNN | Precision-skall; ikke i tegningslisten | |
| AG-A02–A06 | `/admin/analyse`, `/analyse/stall`, `/analysere/compliance` | `analyse/page.tsx:32` | RØD | V2Shell, `InnsiktHubV2`, `WorkbenchAnalyseV2`; navigerer fra runder | L |
| AG-RD-01/02 | `/admin/runder` | `runder/page.tsx:26`, `AGRD01Runder.tsx` | GUL | Ingen coach-scope på `round.findMany`; ingen `?fane=kvalitet`; | S |
| AG-10 oversikt | `/admin/plan/teknisk` | `plan/teknisk/page.tsx`, `AG10Oversikt.tsx` | GUL | Ikke verifisert utover skall | S |
| AG-10 / AG-TP-01 | `/admin/spillere/[id]/plan/[planId]` | `AG10TekniskPlan.tsx:5-12` | GUL | Posisjonsstatus, kvalitetssjekk og «Før og nå» tomt; coach kan ikke svare på registrering | M |
| AG-TP-02 | `…/for-og-na` | `AGTP02ForOgNaa.tsx:3-8` | GUL | Ett bilde, ingen dato, delelinje mangler; krever datamodell | M |
| AG-11 Workbench | `/admin/workbench/[playerId]` (uke/økt/mål/fys/turn) | `AG11Workbench.tsx`, `AG11Moduler.tsx:12-18` | GUL | Parkert: trekk tilbake, kopier uke, ACWR/dagsform, gruppemodus i FYS/TURN | L |
| AG-11 År/Periode/Måned | `?niva=ar|periode|maned` | `workbench/[playerId]/page.tsx:118-160`, `schema.prisma:3597` | GUL | `MonthPlan` finnes ikke, `SeasonPlan.createdById` mangler; coach kan ikke lagre månedsinnhold | L |
| AG-11 Gruppe | `/admin/grupper/[id]/workbench` | `AG11Gruppe.tsx`, `wb-tl-scope` | GUL | Train-lock-scope (`TL_SCOPE`) rundt gammel komponent | M |
| AG-12 Øktark | `/admin/gjennomfore/okter/[id]` | `AG12Oktark.tsx:22,128` | GUL | «Godkjenn og send» og TrackMan-baseline ikke bygget | M |
| AG-13 Live | `/admin/agencyos/live/[sessionId]` | `AG13LiveOkt.tsx:12-20` | GUL | Samtykke-felt, spillerkort, teknisk plan, «Fra iPhone», hjemmelekse mangler | L |
| AG-14 Plan-hub og maler | `/admin/plan`, `/plan/maler` | `AG14PlanHub.tsx:10-24` | GUL | «Bruk i Workbench» åpner bare mal | M |
| AG-14 mal-detalj/rediger/ny | `/admin/plan-templates/*` | `AG14Mal*.tsx` | GRØNN | | |
| AG-15 Tester | `/admin/tester` | `AG15Tester.tsx:8-17` | GUL | Tildel test, normer A–K, TN-skala og nivåstige parkert | L |
| AG-15 undersider | `/admin/tester/benchmarks`, `/tester/tildel/[spillerId]` | `(legacy)/tester/*` | RØD | V2Shell, `AdminTildelTestV2` | M |
| AG-16 Grupper liste | `/admin/grupper` | `AG16Grupper.tsx:8-14` | GUL | Medlemsliste, «Legg til spillere», «Tildel test» mangler | M |
| AG-16 gruppedetalj | `/admin/grupper/[id]`, `/timeplan`, `/arsplan`, `/arsplan/skoledata` | `grupper/[id]/**/page.tsx:231,107,43,22` | RØD | V2Shell (`aktiv="spillere"`) | L |
| AG-16 AK-stigen | `/admin/agencyos/ak-stigen` | `ak-stigen/page.tsx:20` | RØD | V2Shell + `AkStigenV2` | S |
| AG-17 Turneringer | `/admin/turnering` | `turnering/page.tsx:66,96`, `AG17Turneringer.tsx:113` | RØD | Fake lat/lon, hardkodet DataGolf, fallback til demo, ingen handlinger | L |
| AG-17 detalj/ny | `/admin/tournaments/[id]`, `/ny` | `tournaments/*/page.tsx:158,23` | RØD | V2Shell, Train-lock | M |
| AG-18 TrackMan/video | `/admin/trackman`, `/recording`, `/videoer` | `trackman/page.tsx:61-91` | RØD | Fabrikerte måleverdier og videonotat; demo-fallback | M |
| AG-18 økt | `/admin/trackman/[sessionId]` | `trackman/[sessionId]/page.tsx:71` | RØD | V2Shell (`aktiv="innsikt"`) | S |
| AG-19 Jarvis | `/admin/jarvis` | `jarvis/page.tsx:33`, `AG19CaddieHub.tsx:86` | RØD | Kun `STANDARD_DATA`, ingen handlinger; skjuler ekte agentkø | L |
| AG-19 agent | `/admin/agents/[agentId]` | `agents/[agentId]/page.tsx:328` | RØD | `AgenticosRamme` → V2Shell | M |
| AG-20 Økonomi | `/admin/agencyos/okonomi` | `okonomi/page.tsx`, `AG20Okonomi.tsx:8-14` | GUL | Head coach-sperre OK (`:19`); fordeling på tjenester, budsjett og «Resultat per virksomhet» ikke bygget | L |
| AG-21 Oppgaver | `/admin/oppgaver` | `oppgaver/page.tsx:41`, `AG21Oppgaver.tsx:72` | RØD | Demo, ingen Notion-kobling (skal være eneste kilde) | M |
| AG-21 Notion | `/admin/workspace/notion` | `workspace/notion/page.tsx:50` | RØD | V2Shell | S |
| AG-22 Innsikt/talent | `/admin/innsikt`, `/innsyn/talent/radar` | `AG22InnsiktTalent.tsx:77-86` | RØD | Demo med navngitte «spillere» født 2008/2009; ekte talentradar bor i AG-08 | M |
| AG-23 Oppsett | `/admin/oppsett`, `/admin/profile` | `oppsett/page.tsx:56`, `AG23Oppsett.tsx:71-117` | RØD | Demo-team, `demo.no`, lokal state; lagrer ingenting | L |
| AG-23 team | `/admin/team/ekstern`, `/team/inviter` | `team/*/page.tsx:58,20` | RØD | V2Shell | S |
| AG-23 markedsføring | `/admin/marketing` | `marketing/page.tsx:56` | RØD | V2Shell | S |
| AG-24 Drift | `/admin/drift`, `/feillogg`, `/audit-log`, `/gdpr`, `/hjelp` | `drift/page.tsx:25`, `AG24Drift.tsx:90-116` | RØD | Demo; GDPR-sletting gjør ingenting | L |

## Skall og meny: verifisert

- Menyrekkefølge og Mer-punkter i `precision-ia.ts:17-30` er riktig (Cockpit · Innboks · Stall · Kalender · Workbench · Mer; Booking · Grupper · Tester · Økonomi · Oppsett). Økonomi skjules for ikke-ADMIN (`synligeMer`) og siden redirecter COACH (`okonomi/page.tsx:19`).
- Hurtigknappen (`AgencyOSSkall.tsx:154`) har alle fem handlinger og skjules bare på natt; mangler på alle V2Shell-sider.
- Rapportbygger er fjernet: `/admin/reports` og `/admin/finance` redirecter til Økonomi.
- Lyst tema er standard i Precision-skallet; ingen sidelengs rulling funnet i kildene (ikke målt i nettleser).

## Anbefalt rekkefølge

1. **Rydd demodata fra prod (personvern og sannhet), M-L.** Fjern `STANDARD_DATA`-fallback i AG17–AG24 og vis ekte data eller «—»/tom tilstand. Rett først TrackMan (`trackman/page.tsx`) og GDPR i Drift, deretter Turnering og Jarvis. Alternativt skjul rutene til de er koblet.
2. **Skall og meny, S-M.** Pek «Workbench» og «Ny økt» til en ekte AG-11-inngang; la `bookinger` ta `?fane=ny` og pek hurtigknappen dit; send `uleste` fra et delt sted (layout) slik at bjella virker overalt; bytt `loading/error` til Precision (`LasterTilstand/FeilTilstand`).
3. **Port V2Shell-sidene i klynger (14 rutegrupper, S-M hver):** Booking (`[id]`, `ny`, services), Grupper (`[id]`, timeplan, arsplan, skoledata, ak-stigen), Kalender (hendelse, availability), Oppsett-undersider (team, marketing), Turnering-detalj, spillere/ny, TrackMan-økt, Tester-undersider, analyse.
4. **Koble AG-21 til Notion og AG-23 til ekte lagring**, deretter AG-19 mot agentkøen.
5. **Datamodell for Workbench År/Måned** (`MonthPlan`, `SeasonPlan.createdById`), additivt via `db execute` (gotchas §Database).
6. **Coach-scope på `/admin/runder`.**
7. **Funksjonshull i GUL-sidene** i denne rekkefølgen: Økonomi per tjeneste, Kalender (coach-filter, år, flytt/angre), AG-12 godkjenn og send, AG-13 spillerkort og samtykke, Tester (tildel/normer), AG-04 «Lag utkast».
8. **Port 7:** Anders må se hver skjerm etter portering (beslutninger.md); ingen av radene over er markert som godkjent.
