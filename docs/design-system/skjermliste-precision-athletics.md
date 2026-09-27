# Skjermliste — AK Golf Precision Athletics (26.09.2026)

Hentet fra appens `page.tsx`-filer 26.09.2026. Omfang: PlayerHQ (`/portal`), AgencyOS (`/admin`),
forelder, innlogging/onboarding, booking, statistikk, innsyn, GFGK Junior og systemsider.
Utenfor: Team Norway, WANG, markedssidene (venter) og `/demos`.
Beslutning: [beslutninger.md](../../.claude/rules/beslutninger.md) §PRECISION ATHLETICS.

**Tall:** 443 sider i omfanget · 163 videresendinger · 280 ekte skjermer (maskinell telling; noen få rutere som `/auth/etter-innlogging` telles som skjerm) · **74 skjermtyper**
(PlayerHQ 26 · AgencyOS 24 · forelder 6 · konto 6 · booking 3 · statistikk 6 · GFGK Junior 2 ·
system 1). Én skjermtype = én tegning som dekker alle rutene i raden.

**Hver tegning leveres i:** mobil 390 · iPad 768 og 1024 · desktop 1280 (1440 for AgencyOS) ·
lyst tema · natt der «Natt» er merket · tilstandene tom, laster og feil. Kontroll:
`scrollWidth === clientWidth` i alle bredder.

## PlayerHQ (`/portal`) — fire faner: I dag · Plan · Analyse · Meg

| ID | Skjermtype | Ruter | Må vise | Natt |
|---|---|---|---|---|
| PH-01 | I dag | `/portal` | Dagens økt, agenda, Caddie-forslag, Start økt | |
| PH-02 | Gjør nå | `/portal/gjennomfore`, `/portal/tren/wb` | Dagens økter og oppgaver, åpne økt | |
| PH-03 | Øktark | `/portal/gjennomfore/[id]`, `/portal/tren/wb/[sessionId]` | Start, fullfør eller hopp over, øvelser med AK-formel | |
| PH-04 | Live-økt: brief | `/portal/live/[id]/brief` | Mål, fokus, øvelser før start | Natt |
| PH-05 | Live-økt: aktiv | `/portal/live/[id]/active` | Klokke, øvelsesfremdrift, registrer repetisjoner | Natt |
| PH-06 | Slagteller | `/portal/live/[id]/tapper` | +1/+5 slag, kølle fra bagen, store treffmål | Natt |
| PH-07 | Øktoppsummering | `/portal/live/[id]/summary`, `/portal/tren/feiring/[planId]` | Slag, tid, pyramidefordeling, del/lagre | Natt |
| PH-08 | Runde live | `/portal/runde/live`, `/portal/mal/runder/[id]/slag` | Hull 1–18, lie, meter til flagg, putter i fot | Natt |
| PH-09 | Registrer runde | `/portal/runde/logg`, `/portal/mal/runder/ny`, `/portal/mal/runder/[id]/hull` | Dato, bane, score per hull, brutto | |
| PH-10 | Plan: uke | `/portal/planlegge`, `/portal/kalender`, `/portal/kalender/opptatt` | Uke/dag/måned, økter per akse, opptatt tid | |
| PH-11 | Workbench (spiller) | `/portal/planlegge/workbench` | År → periode → uke → økt på én flate, dra-og-slipp | |
| PH-12 | Planbygger | `/portal/planlegge/bygger`, `/portal/ai/mal-bygger` | Stegviser, mal, SMART-mål | |
| PH-13 | Øvelsesbank | `/portal/drills`, `/portal/drills/[id]`, `/portal/coach/ovelser`, `/portal/ai/foresla-drill` | Liste med filter per akse, øvelsesdetalj, Caddie-forslag | |
| PH-14 | Tester | `/portal/tren/tester`, `/portal/tren/tester/[testId]`, `…/ny`, `…/ny/egen`, `…/team-norway` | Protokoller, historikk, registrer resultat | |
| PH-15 | Test: gjennomfør | `/portal/tren/tester/[testId]/gjennomfor` | Scorekort, live-registrering | Natt |
| PH-16 | Analyse-hub | `/portal/analysere`, `/portal/analysere/historikk` | SG per kategori, siste runder/økter, filter | |
| PH-17 | TrackMan | `/portal/analysere/trackman`, `…/[id]`, `/portal/mal/trackman/gapping`, `/portal/mal/sg-hub/equipment`, `/portal/analysere/datagolf/stasjon` | Øktliste, spredningskart, gapping, utstyrshelse | |
| PH-18 | Runder og statistikk | `/portal/mal/runder`, `…/[id]`, `/portal/statistikk/[metric]`, `/portal/statistikk/runder/[runId]/del`, `/portal/analysere/hull`, `/portal/analysere/turneringer`, `/portal/analysere/datagolf` | Scorekort, metrikk over tid, hull-analyse, til-par-kurve | |
| PH-19 | Mål og talent | `/portal/mal`, `/portal/mal/goal/[id]`, `/portal/mal/leaderboard`, `/portal/talent/*`, `/portal/utviklingsplan`, `/portal/tren/teknisk-plan/[planId]` | Mål med fremdrift, talentradar, P1–P10-plan | |
| PH-20 | Gameplan og banekart | `/portal/gameplan`, `…/[baneId]`, `…/hull/[nr]` | Banekart, hull-for-hull, slagvalg | |
| PH-21 | Coach-kontakt | `/portal/coach`, `…/melding`, `…/melding/ny`, `…/sporsmal*`, `…/tilbakemelding*`, `…/videoer`, `…/plans`, `…/sg-hub*`, `/portal/onskeligokt*` | Meldingstråd, spørsmål, tilbakemelding, videoer, ønsket økt | |
| PH-22 | Caddie-chat | `/portal/coach/ai`, `/portal/ai/foresla-turnering` | Chat, forslag som utkast, kilder | |
| PH-23 | Booking (spiller) | `/portal/booking`, `…/ny`, `…/ny/bekreft`, `…/bekreftet`, `…/[bookingId]`, `…/coach/[coachId]`, `…/anlegg/[anleggId]`, `/portal/meg/bookinger*` | Klippekort, tjeneste, tid, bekreft, flytt time | |
| PH-24 | Meg | `/portal/meg`, `…/profil`, `…/utstyr`, `…/resultater`, `…/helse*`, `…/foreldre`, `…/dokumenter`, `/portal/spiller/[id]`, `/portal/venner*` | Profil, kategori A–K, bag med 14 køller, helse | |
| PH-25 | Abonnement og innstillinger | `/portal/meg/abonnement*`, `/portal/meg/innstillinger/*`, `/portal/meg/sikkerhet/2fa`, `/portal/varsler`, `/portal/meg/help*`, `/portal/meg/feedback` | TALENT/FULL, faktura, kort, avbestill, samtykke, varsler, hjelp | |
| PH-26 | Utenfor banen | `/portal/utenfor-banen`, `/portal/fysisk`, `/portal/tren/fys-plan`, `/portal/utfordringer*`, `/portal/trening/*`, `/portal/ukesdigest`, `/portal/tren/turneringer*` | FYS-økt, utfordringer, putte-lab, break-tabell, turneringsplan, ukesdigest | |

## AgencyOS (`/admin`) — Hjem · Innboks · Kalender · Stall · Workbench · Kø · Caddie

| ID | Skjermtype | Ruter | Må vise | Natt |
|---|---|---|---|---|
| AG-01 | Hjem (cockpit) | `/admin/agencyos`, `/meg` | Én ting nå, dagens plan, kø-tellere, AI-dispatch | |
| AG-02 | Kø | `/admin/ko` | Faner: godkjenninger, agentforslag, tester, dubletter, moderering | |
| AG-03 | Oppfølgingskø | `/admin/queue` | Risiko · Følg med · Sjekk inn · Løst | |
| AG-04 | Innboks | `/admin/kommunikasjon`, `/admin/email-templates/[id]/rediger` | Saker, e-postutkast, maler | |
| AG-05 | Kalender | `/admin/kalender`, `/admin/kalender/hendelse/[id]`, `…/ny`, `/admin/availability` | Uke/måned/dag, lag, stall-dag, tilgjengelighet | |
| AG-06 | Booking (coach) | `/admin/bookinger/[id]`, `/admin/bookinger/ny`, `/admin/services` | Bookingdetalj, bekreft/avvis booking, ny booking, tjenester og pris | |
| AG-07 | Stall | `/admin/spillere`, `/admin/spillere/ny` | Spillere gruppert etter status, tabell → kortrader | |
| AG-08 | Spiller 360 | `/admin/spillere/[id]`, `…/rediger`, `…/turnering-kobling` | Profil, nøkkeltall, fremgang, endringshistorikk | |
| AG-09 | Spilleranalyse | `/admin/spillere/[id]/analyse`, `/admin/analyse`, `/admin/runder` | SG, trend, etterlevelse, stall-analyse | |
| AG-10 | Teknisk plan | `/admin/plan/teknisk`, `/admin/spillere/[id]/plan`, `…/plan/[planId]` | P1–P10, oppgaver, TrackMan-mål, treffrate | |
| AG-11 | Workbench (coach) | `/admin/workbench/[playerId]`, `/admin/grupper/[id]/workbench` | Samme motor som spiller, stall-velger og gruppemodus | |
| AG-12 | Øktark (coach) | `/admin/gjennomfore/okter/[id]` | Økt med spiller, øvelser, notat | |
| AG-13 | Live-tavle | `/admin/agencyos/live`, `…/live/[sessionId]` | Pågående økter nå, én økt i sanntid | |
| AG-14 | Plan-hub, maler og øvelser | `/admin/plan`, `/admin/plan/maler`, `/admin/plan-templates/[id]`, `…/rediger`, `…/ny` | Ukemaler, program, standardøkter, aksefordeling, opprett/rediger øvelse | |
| AG-15 | Tester (coach) | `/admin/tester`, `/admin/tester/benchmarks`, `/admin/tester/tildel/[spillerId]`, `/admin/spillere/[id]/tester` | Resultater, nivåstiger, tildel test | |
| AG-16 | Grupper | `/admin/grupper`, `/admin/grupper/[id]`, `…/timeplan`, `…/arsplan`, `…/arsplan/skoledata`, `/admin/agencyos/ak-stigen` | Medlemmer, faste tider, årsplan, AK-stigen (4 trinn, Knøtt ved siden av) | |
| AG-17 | Turneringer | `/admin/turnering`, `/admin/tournaments/[id]`, `/admin/tournaments/ny` | Alle, mine spillere, kart, dubletter, ny turnering | |
| AG-18 | TrackMan og video | `/admin/trackman`, `…/[sessionId]`, `/admin/videoer`, `/admin/recording` | Økter på tvers av spillere, video, opptak | |
| AG-19 | Caddie / Jarvis | `/admin/jarvis`, `/admin/agents/[agentId]` | Agentkø, prosjekter, skills, kjøringsdetalj, Caddie-samtale for coach | |
| AG-20 | Økonomi | `/admin/agencyos/okonomi` | Tall fra Tripletex, per virksomhet, avvik | |
| AG-21 | Oppgaver | `/admin/oppgaver`, `/admin/workspace/notion` | Prosjekter, rutiner, tildelte oppgaver | |
| AG-22 | Innsikt og talent | `/innsyn/talent/radar`, `…/discovery`, `…/sammenligning`, `…/wagr-import` | Radar mot peer-snitt, opptil fire spillere side ved side | |
| AG-23 | Oppsett | `/admin/oppsett`, `/admin/profile`, `/admin/team/ekstern`, `/admin/team/inviter`, `/admin/marketing` | Åtte faner, tilgang, inviter coach, egen profil | |
| AG-24 | Drift (kun admin) | `/admin/audit-log`, `/admin/feillogg`, `/admin/gdpr`, `/admin/hjelp` | Logg, feil, sletteforespørsler, hjelp | |

## Forelder (`/forelder`)

| ID | Skjermtype | Ruter | Må vise |
|---|---|---|---|
| FO-01 | Forelder i dag | `/forelder`, `/forelder/ukerapport`, `/forelder/varsler` | Dagens økt, neste booking, uke, ACWR-varsel |
| FO-02 | Barn | `/forelder/barn`, `/forelder/barn/[childId]` | Koblede barn, utviklingsprofil |
| FO-03 | Booking for barn | `/forelder/bookinger*` | Velg barn, tjeneste, tid, bekreft |
| FO-04 | Økonomi | `/forelder/okonomi`, `/forelder/fakturaer` | Abonnement, neste trekk, fakturaer |
| FO-05 | Samtykke | `/forelder/samtykke`, `/forelder/samtykke/deling/[childId]` | Under 16 år, deling, revisjonshistorikk |
| FO-06 | Coach og innstillinger | `/forelder/coach`, `/forelder/innstillinger` | Coach, siste melding, egen kontakt |

## Konto, innlogging og onboarding

| ID | Skjermtype | Ruter | Må vise |
|---|---|---|---|
| AU-01 | Logg inn | `/auth/login`, `/auth/bankid`, `/auth/logget-ut` | E-post/passord, Google, BankID-plassholder |
| AU-02 | Registrer | `/auth/signup`, `/auth/check-email`, `/auth/checkout-resume` | Pakke, samtykke, sjekk e-post |
| AU-03 | Passord | `/auth/forgot-password`, `/auth/reset-password` | Be om lenke, nytt passord |
| AU-04 | Onboarding | `/auth/onboarding`, `/auth/onboarding/forelder` | Stegviser for spiller/coach og forelder |
| AU-05 | Samtykke via lenke | `/auth/guardian-consent/[token]`, `/auth/lyd-samtykke/[token]`, `/auth/samtykke-venter`, `/inviter/forelder/[token]` | Forelder bekrefter, spiller venter |
| AU-06 | Innsyn (ekstern leser) | `/innsyn`, `/innsyn/[spillerId]` | Samtykkede resultater per gruppe og spiller |

## Booking (offentlig)

| ID | Skjermtype | Ruter | Må vise |
|---|---|---|---|
| BK-01 | Velg tjeneste | `/booking` | Fire steg i én flyt, pauset-tilstand |
| BK-02 | Velg tid og betal | `/booking/[slug]`, `/booking/[slug]/bekreft` | Dag/uke, tidsluker, Stripe, Vipps |
| BK-03 | Kvittering | `/booking/kvittering/[bookingId]` | Referanse i mono, .ics, opprett konto |

## Statistikk (`/stats`, `/turneringer`)

| ID | Skjermtype | Ruter | Må vise |
|---|---|---|---|
| ST-01 | Stats-hub og søk | `/stats`, `/stats/sok`, `/stats/uka`, `/stats/2026`, `/stats/leaderboards`, `/stats/norske` | Live-snapshot, innganger, «Powered by Data Golf» |
| ST-02 | Liste med filter | `/stats/spillere`, `/stats/klubber`, `/stats/baner`, `/stats/turneringer`, `/stats/aargang*`, `/stats/regions`, `/stats/pga/spillere`, `/stats/blogg`, `/turneringer` | Tabell → kortrader, filter som bryter linje |
| ST-03 | Profil/detalj | `/stats/spillere/[slug]`, `/stats/klubber/[slug]`, `/stats/baner/[slug]`, `/stats/regions/[slug]`, `/stats/tour/[slug]`, `/stats/pga/spillere/[dg_id]`, `/stats/blogg/[slug]` | Nøkkeltall, trend, resultater |
| ST-04 | Turnering | `/stats/turneringer/[slug]`, `…/statistikk`, `/turneringer/[slug]` | Leaderboard live, scorefordeling |
| ST-05 | PGA-kategori og utforskere | `/stats/pga`, `/stats/pga/*` (6 kategorier), `/stats/pga/putt-explorer`, `/stats/sammenlign-spillere`, `/stats/sg-sammenlign*`, `/stats/min-progresjon` | Percentil, sammenligning, egne tall |
| ST-06 | Verktøy og moro | `/stats/verktoy*` (6), `/stats/quiz`, `/stats/wrapped/[slug]` | Kalkulatorer, quiz, sesongoppsummering |

## GFGK Junior og system

| ID | Skjermtype | Ruter | Må vise |
|---|---|---|---|
| GJ-01 | GFGK Junior forside og grupper | `/gfgk-junior`, `/gfgk-junior/gruppe/[gruppe]`, `/gfgk-junior/treningsplaner`, `/gfgk-junior/kalender` | AK-stigen (fire trinn), gruppeplan, kalender |
| GJ-02 | GFGK veileder | `/gfgk-junior/veileder`, `/gfgk-junior/veileder/[slug]` | Kategorier, artikkel |
| SY-01 | Systemtilstander | `/offline`, `/vedlikehold`, 404, 500 | Feilkode i mono, hva nå |

## Merknader

- `/team-gfgk` er slått av med `notFound()` fordi siden viste juniorresultater uten samtykke. Den tegnes ikke.
- `/portal/tren/tester/team-norway` er en PlayerHQ-flate og tegnes som del av PH-14, ikke i Team Norway-språket.
- Sider med flere faner (`/admin/ko`, `/admin/kommunikasjon`, `/admin/oppsett`, `/admin/turnering`, `/admin/jarvis`) tegnes med alle faner i samme skjermtype.
- Alle navn og tall i tegningene er oppdiktet. Barn under 16 vises aldri med fullt navn på åpne flater.
- Videresendingene tegnes ikke. De peker alle til en rute i tabellene over.
