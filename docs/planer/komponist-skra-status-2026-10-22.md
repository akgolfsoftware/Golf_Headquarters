# Skrå i PlayerHQ og AgencyOS: statustavle

Laget 22.10.2026 av komponist-økta. Sist oppdatert 23.10 etter bølge 3. Oppskriften per pakke står i
`skra-drakt-playerhq-agencyos-plan-2026-10-20.md` §2, PlayerHQ-restene i
`playerhq-resterende-skjermer-skra-2026-10-21.md`.

Tavla som side: https://claude.ai/artifact/4MpWXCU3KEBbaARpvDccad
Skisse bølge 1 (godkjent og bygget): https://claude.ai/artifact/NCP3fcTH2qNSYJtYVfWwNa (kilde `docs/design-system/utkast-skra/komponist/bolge-1.html`)
Skisse bølge 2 (godkjent og bygget): https://claude.ai/artifact/781SDnPSrEGK7Kc6uy4K77 (kilde `docs/design-system/utkast-skra/komponist/bolge-2.html`)
Skisse bølge 3 (godkjent 22.10 og bygget i #1652, #1654): https://claude.ai/artifact/P6v1JmmgNHf9YVtM86EF5y (kilde `docs/design-system/utkast-skra/komponist/bolge-3.html`)

## Slik er tavla laget

- Alle `page.tsx` under `src/app/portal` og `src/app/admin`. Sider som bare sender videre er tatt ut. Igjen 22.10 etter bølge 1: 187 sider, 115 i PlayerHQ og 72 i AgencyOS.
- **Bruker Skrå** er sjekket i koden, gjennom alt siden importerer (ikke bare om fila selv importerer `SkraTopp`):
  - **ja:** siden når `SkraFlyt`, altså Skrå-innhold under toppen.
  - **bare topp:** siden har Skrå-toppen (oftest via `Topp` i `src/components/admin/agencyos-ny/ny.tsx`, #1559), men innholdet under er fortsatt gamle kort.
  - **nei:** ingen Skrå.
  - Pakker som er levert av en byggeøkt føres etter PR-en, ikke etter kodesjekken: undersider kan ha Skrå-kort gjennom stilen uten å bruke `SkraFlyt`.
- Målt og sett av Anders føres inn per pakke når den er lagt inn. «—» betyr ikke gjort ennå.

## Sammendrag

| Område | Sider | ja | bare topp | nei |
|---|---|---|---|---|
| PlayerHQ (`/portal`) | 115 | 112 (6 av dem live uten topp) | 0 | 3 (1 er ferdig som den er) |
| AgencyOS (`/admin`) | 72 | 17 (6 med PR åpen) | 49 | 6 |

**PlayerHQ:** igjen er `/portal/samlinger` og `/portal/analysere/datagolf/stasjon` (bølge 2). `/portal/runde/live` er fullskjerm, alltid lys og uten topp, og er ferdig som den er. Live-skjermene og Team Norway-testen er uten topp (#1623, #1631).

**AgencyOS:** bølge 1 er levert: Innboks (#1634), Spiller 360 (#1632) og Kalender og Booking (#1637, auto-merge på). Kortene starter under den skrå toppen (#1619).

## Pakker og rekkefølge

| Bølge | Pakke | Sider | Status |
|---|---|---|---|
| 1 | A1 Innboks | 4 | lagt inn #1634 |
| 1 | A2 Stall og Spiller 360 | 6 (+ Stall ferdig) | lagt inn #1632 |
| 1 | A3 Kalender og Booking | 6 | PR #1637, auto-merge |
| 2 | R10 PlayerHQ-rest | 2 | skisse |
| 2 | A4 Workbench og live (lav topp uten bilde; live uten topp) | 5 | skisse |
| 2 | A5 Grupper og Tester | 11 | skisse |
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
| `/admin/email-templates/[id]/rediger` | A1 Innboks | ja | #1634 | — | — |
| `/admin/innboks` | A1 Innboks | ja | #1634 | — | — |
| `/admin/ko` | A1 Innboks | ja | #1634 | — | — |
| `/admin/kommunikasjon` | A1 Innboks | ja | #1634 | — | — |
| `/admin/spillere` | A2 Stall og Spiller 360 | ja | #1561 | — | — |
| `/admin/spillere/[id]` | A2 Stall og Spiller 360 | ja | #1632 | — | — |
| `/admin/spillere/[id]/profil-komplett` | A2 Stall og Spiller 360 | ja | #1632 | — | — |
| `/admin/spillere/[id]/rediger` | A2 Stall og Spiller 360 | ja | #1632 | — | — |
| `/admin/spillere/[id]/turnering-kobling` | A2 Stall og Spiller 360 | ja | #1632 | — | — |
| `/admin/spillere/ny` | A2 Stall og Spiller 360 | ja | #1632 | — | — |
| `/admin/bookinger` | A3 Kalender og Booking | ja (PR åpen) | #1637 | — | — |
| `/admin/bookinger/[id]` | A3 Kalender og Booking | ja (PR åpen) | #1637 | — | — |
| `/admin/bookinger/ny` | A3 Kalender og Booking | ja (PR åpen) | #1637 | — | — |
| `/admin/kalender` | A3 Kalender og Booking | ja (PR åpen) | #1637 | — | — |
| `/admin/kalender/hendelse/[id]` | A3 Kalender og Booking | ja (PR åpen) | #1637 | — | — |
| `/admin/kalender/hendelse/ny` | A3 Kalender og Booking | ja (PR åpen) | #1637 | — | — |
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
| `/portal/meg/deling/team-norway` | P/R ferdig | ja | — | — | — |
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
| `/portal/tren/turneringer` | P/R ferdig | ja | — | — | — |
| `/portal/tren/turneringer/[id]` | P/R ferdig | ja | — | — | — |
| `/portal/tren/wb/[sessionId]` | P/R ferdig | ja | — | — | — |
| `/portal/trening/logg` | P/R ferdig | ja | — | — | — |
| `/portal/trening/putte-laboratoriet` | P/R ferdig | ja | — | — | — |
| `/portal/utfordringer` | P/R ferdig | ja | — | — | — |
| `/portal/utfordringer/[id]` | P/R ferdig | ja | — | — | — |
| `/portal/utfordringer/ny` | P/R ferdig | ja | — | — | — |
| `/portal/varsler` | P/R ferdig | ja | — | — | — |
| `/portal/live/[sessionId]/active` | P11 Live (uten topp) | ja (uten topp) | #1623 | — | — |
| `/portal/live/[sessionId]/brief` | P11 Live (uten topp) | ja (uten topp) | #1623 | — | — |
| `/portal/live/[sessionId]/summary` | P11 Live (uten topp) | ja (uten topp) | #1623 | — | — |
| `/portal/live/[sessionId]/tapper` | P11 Live (uten topp) | ja (uten topp) | #1623 | — | — |
| `/portal/tren/tester/[testId]/gjennomfor` | P11 Live (uten topp) | ja (uten topp) | #1623 | — | — |
| `/portal/tren/tester/team-norway` | P11 Live (uten topp) | ja (uten topp) | #1623 | — | — |
| `/portal/analysere/datagolf/stasjon` | R10 PlayerHQ-rest | nei | — | — | — |
| `/portal/samlinger` | R10 PlayerHQ-rest | nei | — | — | — |


## Status 23.10 etter bølge 3

- **Bygget:** alle 38 sider i A6a, A6b og A6c har Skrå-toppen og hvite kort (stilen `agencyos-ny-a6-skra.css`, klassen `agn-a6`). Økonomi, Data Golf og Jarvis har flat mørk topp. Plan-hub og teknisk plan hadde egen topp og er byttet til `Topp` (#1654).
- **Målt i 390, 1280 og 1920 px uten avvik** (sidelengs rulling, noder utenfor rammen, konsollfeil): AG-10, 11, 14, 17, 18, 19, 20, 21, 22, 23, 24, DG, RD-01, TP-01, TP-02 og `AG-A6-REST` (eksterne lesere, inviter, Notion, ny turnering, agent, fellesmelding). Prøvene bruker syntetiske data.
- **Ett avvik som ikke er rettet:** TrackMan-plottet (`/admin/trackman/[sessionId]`, `TrackManSessionDetail`) har for små treffmål (1σ/2σ-knapper 37×22 px, slagprikker 11–24 px). Komponenten er eldre og ikke endret av Skrå. Ingen sidelengs rulling.
- **Luften under den skrå toppen** var 50–58 px i stedet for 16/24: `gap: 0` på rotelementet tapte mot `.agn-s` (32 px). Rettet for Cockpit, Innboks, Kalender, Grupper, Tester og bølge 3. Nå 16–19 px på mobil og 24–27 px på PC (målt).
- **Felles tekstbredde:** `--ak-tekst-maks` (720 px) i `ak-tokens.css`, brukt i AgencyOS og PlayerHQ, låst i `src/styles/tekst-maks.test.ts`.
- **Ikke gjort:** (1) ingen side er sett mot ekte data (port 7). (2) Hovedtall i toppen på Plan-hub: tallene i skissen («utløper snart», «venter på coach») finnes ikke i dagens data, og lav topp har ikke tallrad. Uke-tallene står i ingressen. (3) Hurtigknappen: rettet 23.10. Den glir ut ved ned-rulling på mobil (under 900 px) og kommer tilbake ved opp-rulling eller etter 0,7 s stillstand (`hurtigknapp-rulling.ts`, låst med test). (4) Nye toppbilder fra Anders. (5) Artifact-siden for tavla må oppdateres for hånd; skriptet ligger ikke i repoet.
