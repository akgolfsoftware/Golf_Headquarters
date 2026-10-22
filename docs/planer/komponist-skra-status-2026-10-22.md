# Skrå i PlayerHQ og AgencyOS: statustavle

Laget 22.10.2026 av komponist-økta. Oppskriften per pakke står i
`skra-drakt-playerhq-agencyos-plan-2026-10-20.md` §2, PlayerHQ-restene i
`playerhq-resterende-skjermer-skra-2026-10-21.md`.

Tavla som side: https://claude.ai/artifact/4MpWXCU3KEBbaARpvDccad
Skisse bølge 1: https://claude.ai/artifact/NCP3fcTH2qNSYJtYVfWwNa (kilde `docs/design-system/utkast-skra/komponist/bolge-1.html`)

## Slik er tavla laget

- Alle `page.tsx` under `src/app/portal` og `src/app/admin` (374). Sider som bare sender videre er tatt ut (188). Igjen: 186 sider, 114 i PlayerHQ og 72 i AgencyOS.
- **Bruker Skrå** er sjekket i koden, gjennom alt siden importerer (ikke bare om fila selv importerer `SkraTopp`):
  - **ja:** siden når `SkraFlyt`, altså Skrå-innhold under toppen.
  - **bare topp:** siden har Skrå-toppen (oftest via `Topp` i `src/components/admin/agencyos-ny/ny.tsx`, #1559), men innholdet under er fortsatt gamle kort.
  - **nei:** ingen Skrå.
- Målt og sett av Anders føres inn per pakke når den er lagt inn. «—» betyr ikke gjort ennå.

## Sammendrag

| Område | Sider | ja | bare topp | nei |
|---|---|---|---|---|
| PlayerHQ (`/portal`) | 114 | 111 | 0 | 3 |
| AgencyOS (`/admin`) | 72 | 2 | 59 | 11 |

**PlayerHQ er nesten ferdig.** Igjen: `/portal/samlinger` (gammelt skall), `/portal/analysere/datagolf/stasjon` (bare ADMIN) og `/portal/runde/live` (fullskjerm, alltid lys, skal ikke ha topp).

**AgencyOS er hovedjobben.** Alle sider unntatt Cockpit og Stall har bare fått toppen. Innholdet under er ikke portert.

**Avvik å avklare:** de fem live-skjermene i PlayerHQ (#1588) fikk lav Skrå-topp med bilde, mens planen sier at live-økta ikke skal ha topp. Ligger hos Anders.

## Pakker og rekkefølge

| Bølge | Pakke | Sider | Status |
|---|---|---|---|
| 1 | A1 Innboks | 4 | skisse |
| 1 | A2 Stall og Spiller 360 | 6 (+ Stall ferdig) | skisse |
| 1 | A3 Kalender og Booking | 6 | skisse |
| 2 | R10 PlayerHQ-rest | 2 | venter |
| 2 | A4 Workbench og live (lav topp uten bilde; live uten topp) | 5 | venter |
| 2 | A5 Grupper og Tester | 11 | venter |
| 3 | A6a Plan og teknisk plan | 8 | venter |
| 3 | A6b Drift og oppsett (Økonomi bare head coach) | 11 | venter |
| 3 | A6c Data Golf (bare ADMIN), Jarvis og eldre sider | 19 | venter |

Turneringsplanleggeren (`/admin/spillere/[id]/turneringsplan`) har egen fasit (§TURNERINGSPLANLEGGEREN MED WAGR-ANSLAG) og er ikke med i pakkene.

## Andre grener som rører samme område

Sjekket 22.10: `claude/skra-mer-liv` (I dag og Cockpit, ikke i main), `claude/felles-tokens-brytepunkt-vakt` (stilark), `claude/stall-trenger-deg-kalibrering` (stall-data). Byggeøktene skal ikke røre de samme filene.

## Alle sider

| Rute | Pakke | Bruker Skrå | PR | Målt 390/1280/1920 | Sett av Anders |
|---|---|---|---|---|---|
| `/admin/agencyos` | A0 Cockpit | ja | #1554 | — | — |
| `/admin/email-templates/[id]/rediger` | A1 Innboks | nei | — | — | — |
| `/admin/innboks` | A1 Innboks | bare topp | — | — | — |
| `/admin/ko` | A1 Innboks | bare topp | — | — | — |
| `/admin/kommunikasjon` | A1 Innboks | bare topp | — | — | — |
| `/admin/spillere` | A2 Stall og Spiller 360 | ja | #1561 | — | — |
| `/admin/spillere/[id]` | A2 Stall og Spiller 360 | bare topp | — | — | — |
| `/admin/spillere/[id]/profil-komplett` | A2 Stall og Spiller 360 | nei | — | — | — |
| `/admin/spillere/[id]/rediger` | A2 Stall og Spiller 360 | nei | — | — | — |
| `/admin/spillere/[id]/turnering-kobling` | A2 Stall og Spiller 360 | nei | — | — | — |
| `/admin/spillere/ny` | A2 Stall og Spiller 360 | bare topp | — | — | — |
| `/admin/bookinger` | A3 Kalender og Booking | bare topp | — | — | — |
| `/admin/bookinger/[id]` | A3 Kalender og Booking | bare topp | — | — | — |
| `/admin/bookinger/ny` | A3 Kalender og Booking | nei | — | — | — |
| `/admin/kalender` | A3 Kalender og Booking | bare topp | — | — | — |
| `/admin/kalender/hendelse/[id]` | A3 Kalender og Booking | bare topp | — | — | — |
| `/admin/kalender/hendelse/ny` | A3 Kalender og Booking | bare topp | — | — | — |
| `/admin/agencyos/live` | A4 Workbench og live | nei | — | — | — |
| `/admin/agencyos/live/[sessionId]` | A4 Workbench og live | bare topp | — | — | — |
| `/admin/gjennomfore/okter/[id]` | A4 Workbench og live | bare topp | — | — | — |
| `/admin/grupper/[id]/workbench` | A4 Workbench og live | bare topp | — | — | — |
| `/admin/workbench/[playerId]` | A4 Workbench og live | bare topp | — | — | — |
| `/admin/agencyos/ak-stigen` | A5 Grupper og Tester | bare topp | — | — | — |
| `/admin/grupper` | A5 Grupper og Tester | bare topp | — | — | — |
| `/admin/grupper/[id]` | A5 Grupper og Tester | bare topp | — | — | — |
| `/admin/grupper/[id]/analyse` | A5 Grupper og Tester | bare topp | — | — | — |
| `/admin/grupper/[id]/arsplan` | A5 Grupper og Tester | bare topp | — | — | — |
| `/admin/grupper/[id]/arsplan/skoledata` | A5 Grupper og Tester | bare topp | — | — | — |
| `/admin/grupper/[id]/timeplan` | A5 Grupper og Tester | bare topp | — | — | — |
| `/admin/tester` | A5 Grupper og Tester | bare topp | — | — | — |
| `/admin/tester/registrer/[deltakerId]` | A5 Grupper og Tester | nei | — | — | — |
| `/admin/tester/testdag` | A5 Grupper og Tester | nei | — | — | — |
| `/admin/tester/testdag/[eventId]` | A5 Grupper og Tester | nei | — | — | — |
| `/admin/ovelser` | A6a Plan og teknisk plan | bare topp | — | — | — |
| `/admin/plan` | A6a Plan og teknisk plan | bare topp | — | — | — |
| `/admin/plan-templates/[id]` | A6a Plan og teknisk plan | bare topp | — | — | — |
| `/admin/plan-templates/[id]/rediger` | A6a Plan og teknisk plan | bare topp | — | — | — |
| `/admin/plan-templates/ny` | A6a Plan og teknisk plan | bare topp | — | — | — |
| `/admin/plan/teknisk` | A6a Plan og teknisk plan | bare topp | — | — | — |
| `/admin/spillere/[id]/plan/[planId]` | A6a Plan og teknisk plan | bare topp | — | — | — |
| `/admin/spillere/[id]/plan/[planId]/for-og-na` | A6a Plan og teknisk plan | bare topp | — | — | — |
| `/admin/agencyos/okonomi` | A6b Drift og oppsett | bare topp | — | — | — |
| `/admin/audit-log` | A6b Drift og oppsett | bare topp | — | — | — |
| `/admin/drift` | A6b Drift og oppsett | bare topp | — | — | — |
| `/admin/feillogg` | A6b Drift og oppsett | bare topp | — | — | — |
| `/admin/gdpr` | A6b Drift og oppsett | bare topp | — | — | — |
| `/admin/hjelp` | A6b Drift og oppsett | bare topp | — | — | — |
| `/admin/mer` | A6b Drift og oppsett | nei | — | — | — |
| `/admin/oppsett` | A6b Drift og oppsett | bare topp | — | — | — |
| `/admin/profile` | A6b Drift og oppsett | bare topp | — | — | — |
| `/admin/team/ekstern` | A6b Drift og oppsett | bare topp | — | — | — |
| `/admin/team/inviter` | A6b Drift og oppsett | bare topp | — | — | — |
| `/admin/agents/[agentId]` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/datagolf` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/datagolf/kilde` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/datagolf/norske` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/datagolf/proffer` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/datagolf/proffer/[dgId]` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/datagolf/topplister` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/innsikt` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/jarvis` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/oppgaver` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/recording` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/runder` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/tournaments/[id]` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/tournaments/ny` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/trackman` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/trackman/[sessionId]` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/turnering` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/videoer` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/workspace/notion` | A6c Data Golf, Jarvis og eldre sider | bare topp | — | — | — |
| `/admin/spillere/[id]/turneringsplan` | Egen fasit (turneringsplanleggeren, TN-Skrå) | nei | — | — | — |
| `/portal/runde/live` | Live (ingen topp) | nei | — | — | — |
| `/portal` | P/R ferdig | ja | — | — | — |
| `/portal/analysere` | P/R ferdig | ja | — | — | — |
| `/portal/analysere/historikk` | P/R ferdig | ja | — | — | — |
| `/portal/analysere/hull` | P/R ferdig | ja | — | — | — |
| `/portal/analysere/resultater` | P/R ferdig | ja | — | — | — |
| `/portal/analysere/skill-map` | P/R ferdig | ja | — | — | — |
| `/portal/analysere/trackman` | P/R ferdig | ja | — | — | — |
| `/portal/analysere/trackman/[id]` | P/R ferdig | ja | — | — | — |
| `/portal/analysere/trackman/koller` | P/R ferdig | ja | — | — | — |
| `/portal/booking` | P/R ferdig | ja | — | — | — |
| `/portal/booking/[bookingId]` | P/R ferdig | ja | — | — | — |
| `/portal/booking/anlegg/[anleggId]` | P/R ferdig | ja | — | — | — |
| `/portal/booking/bekreftet` | P/R ferdig | ja | — | — | — |
| `/portal/booking/coach/[coachId]` | P/R ferdig | ja | — | — | — |
| `/portal/booking/ny` | P/R ferdig | ja | — | — | — |
| `/portal/booking/ny/bekreft` | P/R ferdig | ja | — | — | — |
| `/portal/coach` | P/R ferdig | ja | — | — | — |
| `/portal/coach/ai` | P/R ferdig | ja | — | — | — |
| `/portal/coach/melding` | P/R ferdig | ja | — | — | — |
| `/portal/coach/melding/ny` | P/R ferdig | ja | — | — | — |
| `/portal/coach/ovelser` | P/R ferdig | ja | — | — | — |
| `/portal/coach/plans` | P/R ferdig | ja | — | — | — |
| `/portal/coach/sporsmal` | P/R ferdig | ja | — | — | — |
| `/portal/coach/sporsmal/[id]` | P/R ferdig | ja | — | — | — |
| `/portal/coach/sporsmal/ny` | P/R ferdig | ja | — | — | — |
| `/portal/coach/tilbakemelding` | P/R ferdig | ja | — | — | — |
| `/portal/coach/tilbakemelding/[oktId]` | P/R ferdig | ja | — | — | — |
| `/portal/coach/videoer` | P/R ferdig | ja | — | — | — |
| `/portal/drills` | P/R ferdig | ja | — | — | — |
| `/portal/drills/[id]` | P/R ferdig | ja | — | — | — |
| `/portal/drills/break-tabell` | P/R ferdig | ja | — | — | — |
| `/portal/gameplan` | P/R ferdig | ja | — | — | — |
| `/portal/gameplan/[baneId]` | P/R ferdig | ja | — | — | — |
| `/portal/gameplan/[baneId]/hull/[nr]` | P/R ferdig | ja | — | — | — |
| `/portal/gjennomfore/[id]` | P/R ferdig | ja | — | — | — |
| `/portal/iup/fireukerssjekk` | P/R ferdig | ja | — | — | — |
| `/portal/mal` | P/R ferdig | ja | — | — | — |
| `/portal/mal/evaluering` | P/R ferdig | ja | — | — | — |
| `/portal/mal/goal/[id]` | P/R ferdig | ja | — | — | — |
| `/portal/mal/maaltall` | P/R ferdig | ja | — | — | — |
| `/portal/mal/ny` | P/R ferdig | ja | — | — | — |
| `/portal/mal/runder` | P/R ferdig | ja | — | — | — |
| `/portal/mal/runder/[id]` | P/R ferdig | ja | — | — | — |
| `/portal/mal/runder/[id]/hull` | P/R ferdig | ja | — | — | — |
| `/portal/mal/runder/[id]/slag` | P/R ferdig | ja | — | — | — |
| `/portal/mal/runder/ny` | P/R ferdig | ja | — | — | — |
| `/portal/mal/sg-hub/coach/[spillerId]` | P/R ferdig | ja | — | — | — |
| `/portal/mal/sg-hub/coach/[spillerId]/[club]` | P/R ferdig | ja | — | — | — |
| `/portal/mal/sg-hub/coach/[spillerId]/equipment` | P/R ferdig | ja | — | — | — |
| `/portal/meg` | P/R ferdig | ja | — | — | — |
| `/portal/meg/abonnement` | P/R ferdig | ja | — | — | — |
| `/portal/meg/abonnement/fortsett` | P/R ferdig | ja | — | — | — |
| `/portal/meg/abonnement/oppgrader/flyt` | P/R ferdig | ja | — | — | — |
| `/portal/meg/bookinger` | P/R ferdig | ja | — | — | — |
| `/portal/meg/bookinger/reschedule/[bookingId]` | P/R ferdig | ja | — | — | — |
| `/portal/meg/deling` | P/R ferdig | ja | — | — | — |
| `/portal/meg/deling/innsyn` | P/R ferdig | ja | — | — | — |
| `/portal/meg/foreldre` | P/R ferdig | ja | — | — | — |
| `/portal/meg/help` | P/R ferdig | ja | — | — | — |
| `/portal/meg/help/artikkel/[slug]` | P/R ferdig | ja | — | — | — |
| `/portal/meg/help/kategori/[slug]` | P/R ferdig | ja | — | — | — |
| `/portal/meg/help/kontakt` | P/R ferdig | ja | — | — | — |
| `/portal/meg/helse` | P/R ferdig | ja | — | — | — |
| `/portal/meg/innstillinger` | P/R ferdig | ja | — | — | — |
| `/portal/meg/innstillinger/anlegg` | P/R ferdig | ja | — | — | — |
| `/portal/meg/innstillinger/eksport` | P/R ferdig | ja | — | — | — |
| `/portal/meg/innstillinger/integrasjoner` | P/R ferdig | ja | — | — | — |
| `/portal/meg/innstillinger/personvern` | P/R ferdig | ja | — | — | — |
| `/portal/meg/innstillinger/personvern/deling` | P/R ferdig | ja | — | — | — |
| `/portal/meg/innstillinger/sikkerhet` | P/R ferdig | ja | — | — | — |
| `/portal/meg/innstillinger/sprak` | P/R ferdig | ja | — | — | — |
| `/portal/meg/innstillinger/varsler` | P/R ferdig | ja | — | — | — |
| `/portal/meg/profil` | P/R ferdig | ja | — | — | — |
| `/portal/meg/resultater` | P/R ferdig | ja | — | — | — |
| `/portal/meg/sikkerhet/2fa` | P/R ferdig | ja | — | — | — |
| `/portal/meg/utstyr` | P/R ferdig | ja | — | — | — |
| `/portal/onskeligokt` | P/R ferdig | ja | — | — | — |
| `/portal/onskeligokt/bekreftet` | P/R ferdig | ja | — | — | — |
| `/portal/planlegge` | P/R ferdig | ja | — | — | — |
| `/portal/planlegge/bygger` | P/R ferdig | ja | — | — | — |
| `/portal/planlegge/fysisk` | P/R ferdig | ja | — | — | — |
| `/portal/planlegge/fysisk/okt/[oktId]` | P/R ferdig | ja | — | — | — |
| `/portal/planlegge/opptatt` | P/R ferdig | ja | — | — | — |
| `/portal/planlegge/periode-ferdig` | P/R ferdig | ja | — | — | — |
| `/portal/planlegge/periode-ferdig/[periodeId]` | P/R ferdig | ja | — | — | — |
| `/portal/planlegge/workbench` | P/R ferdig | ja | — | — | — |
| `/portal/runde/logg` | P/R ferdig | ja | — | — | — |
| `/portal/spiller/[spillerId]` | P/R ferdig | ja | — | — | — |
| `/portal/statistikk/[metric]` | P/R ferdig | ja | — | — | — |
| `/portal/statistikk/runder/[runId]/del` | P/R ferdig | ja | — | — | — |
| `/portal/tren/teknisk-plan` | P/R ferdig | ja | — | — | — |
| `/portal/tren/teknisk-plan/[planId]` | P/R ferdig | ja | — | — | — |
| `/portal/tren/tester` | P/R ferdig | ja | — | — | — |
| `/portal/tren/tester/[testId]` | P/R ferdig | ja | — | — | — |
| `/portal/tren/tester/ny` | P/R ferdig | ja | — | — | — |
| `/portal/tren/tester/ny/egen` | P/R ferdig | ja | — | — | — |
| `/portal/tren/tester/team-norway` | P/R ferdig | ja | — | — | — |
| `/portal/tren/turneringer` | P/R ferdig | ja | — | — | — |
| `/portal/tren/turneringer/[id]` | P/R ferdig | ja | — | — | — |
| `/portal/tren/wb/[sessionId]` | P/R ferdig | ja | — | — | — |
| `/portal/trening/logg` | P/R ferdig | ja | — | — | — |
| `/portal/trening/putte-laboratoriet` | P/R ferdig | ja | — | — | — |
| `/portal/utfordringer` | P/R ferdig | ja | — | — | — |
| `/portal/utfordringer/[id]` | P/R ferdig | ja | — | — | — |
| `/portal/utfordringer/ny` | P/R ferdig | ja | — | — | — |
| `/portal/varsler` | P/R ferdig | ja | — | — | — |
| `/portal/live/[sessionId]/active` | P11 Live (avvik: har topp) | ja | #1588 | — | — |
| `/portal/live/[sessionId]/brief` | P11 Live (avvik: har topp) | ja | #1588 | — | — |
| `/portal/live/[sessionId]/summary` | P11 Live (avvik: har topp) | ja | #1588 | — | — |
| `/portal/live/[sessionId]/tapper` | P11 Live (avvik: har topp) | ja | #1588 | — | — |
| `/portal/tren/tester/[testId]/gjennomfor` | P11 Live (avvik: har topp) | ja | #1588 | — | — |
| `/portal/analysere/datagolf/stasjon` | R10 PlayerHQ-rest | nei | — | — | — |
| `/portal/samlinger` | R10 PlayerHQ-rest | nei | — | — | — |
