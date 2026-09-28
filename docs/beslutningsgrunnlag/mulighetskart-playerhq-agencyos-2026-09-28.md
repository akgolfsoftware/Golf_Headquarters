# Mulighetskart — PlayerHQ og AgencyOS (28.09.2026)

Fase 3 av [grillingen runde 8](grillingen-runde8-skjermer-2026-09-28.md). Funksjoner som finnes
i koden, men som ingen skjerm viser eller ingen knapp starter. Grunnlag:
[skjermkartlegging-2026-09-28.md](skjermkartlegging-2026-09-28.md) §C og
[kapabilitetskart-spillerutvikling-2026-09-28.md](kapabilitetskart-spillerutvikling-2026-09-28.md).

- **MÅLT** = funnet i koden 28.09 (søk på navn, «0 kallere» = ingen bruk utenom definisjon og
  tester). Ikke kjørt mot databasen.
- **Verdi, innsats og mål** er Claudes VURDERING.
- Mål: **500k** = 500 000 USD netto per år · **AI** = AI Coach · **Produkt** = fra timer til
  produkt og IP.
- Innsats: **lav** = koble eksisterende kode til en skjerm eller knapp · **middels** = ny flyt
  eller ny beregning oppå det som finnes · **høy** = ny grunnmur.

## A. Høy verdi, lav innsats — koden er skrevet, bare ikke koblet

| # | Mulighet | Hva den gjør i praksis | Finnes (MÅLT) | Mangler | Område | Mål |
|---|---|---|---|---|---|---|
| A1 | Runde-agentene starter etter ny runde | SG, prestasjoner og planforslag oppdateres rett etter runden | Agentene + gammel `lagreLoggetRunde` | `logRoundManual` og turneringsrunder starter dem ikke | 5 | AI |
| A2 | Opptak i live coachingøkt | Coach snakker, appen lager sammendrag og hjemmelekse | `SessionRecording`, `/api/recording/*`, AI-analyse, Notion-side | Koblet til «Start live»; anonymisering av navn | 6 | Produkt, AI |
| A3 | Workbench-verktøy | Dupliser uke og økt, bruk mal på spiller, coachnotater, søk i tekniske oppgaver | `lib/workbench/*` | Knapper | 10 | 500k (flere spillere per coach) |
| A4 | Gruppeplan som arves | Gruppeøkter vises hos alle medlemmer; «Egen» når spilleren er tilpasset | `gruppesynk.ts` | Skjerm og merking | 10 | 500k |
| A5 | Reps mot plan per læringssteg | Live-økta viser «gjort 40 av 60 lav hastighet» | `teknisk-maalmatrise.ts`, `DrillLogV2` | Tellere i live-økt | 5 | Produkt |
| A6 | Nærhet til hull mot PGA per avstand | «Fra 100 m: PGA X m, du Y m» | `PgaApproachDistance` (modell uten bruk) | Data inn og visning | 3 | Produkt |
| A7 | Kundeemner i Innboks | Nye kunder følges opp med utkast fra Jarvis | Lead-oppfølging kjører daglig, `Lead` | Visning i Innboks | 7, 11 | 500k |
| A8 | Pyramidefordeling mot ønsket | «Du trener 5 % TEK, planen sier 20 %» på I dag og Stats | `pyramid-weighting.ts` | Visning | 1, 3 | Produkt |
| A9 | Skadevarsel på køllehastighet | Varsel når Club Speed faller over fire uker | `cs-progression.ts` | Visning i Innboks | 1, 8 | AI |
| A10 | TrackMan-baseline inn i teknisk plan | Første TrackMan-økt setter startverdien på oppgaven | `applyTmBaselineProposal` | Knapp | 8 | Produkt |
| A11 | Stripe-kundeportal | Spilleren bytter kort og ser kvitteringer selv | `/api/stripe/portal` | Knapp i Meg | 4 | 500k (mindre frafall) |
| A12 | Oppfølgingssaker i Innboks | Risiko · Følg med · Sjekk · Løst som filter | `FollowUpCase`, `/admin/queue` | Inn i Innboks | 7 | Produkt |

## B. Høy verdi, middels eller høy innsats

| # | Mulighet | Hva den gjør i praksis | Finnes (MÅLT) | Mangler | Område | Mål |
|---|---|---|---|---|---|---|
| B1 | Inntektsforslag for gruppeøkter | «Tirsdag 17–18, nærspill, 8 plasser, anslått 2 400 kr» | `booking-optimizer` (starter bare manuelt) | Kjøreplan, beregning mot ledig tid, visning | 9 | 500k |
| B2 | Hvilken standardplan virker | Måler effekten av de fem standardplanene per kategori | `plan-effectiveness.ts` | Automatisk kjøring, visning for coach | 0, 8 | AI, Produkt |
| B3 | Turneringsreise | Forberedelse → runde → brutto score → evaluering | `WorkbenchTournamentPreparation`, `…Goal`, `…Evaluation` (ubrukt) | Hele flyten | 2, 3 | Produkt |
| B4 | AI-plan for mange spillere | Coach lager planforslag for en hel gruppe | `/api/admin/ai-plan/batch` | Knapp, kø, coach-godkjenning. Skjules ved lansering (område 0) | 10 | AI, 500k |
| B5 | Spillerminne for AI | AI husker samtaler og vurderinger per spiller | `AiSpillerminne`, `KnowledgeChunk` (ubrukt) | Hele flyten, personvern | 0 | AI |
| B6 | Svingvideo | Spilleren og coach laster opp video med analyse | `SwingAnalysis` (ubrukt), opplasting uferdig | Opplasting og visning | 5, 6 | Produkt |
| B7 | Treningssamlinger | Samling som egen blokk i plan og kalender | `createTrainingCamp` | Skjerm | 2, 10 | 500k |
| B8 | Be coach endre planen | Spilleren ber om endring, coach svarer i Innboks | `createPlanChangeRequest` | Skjerm | 2, 7 | Produkt |

## C. Må gjøres uansett — personvern og riktighet (ikke valgfritt)

| # | Funn (MÅLT) | Hvorfor |
|---|---|---|
| C1 | Ukeforslaget sender ekte spillernavn til Anthropic (`week-suggest.ts:194`) | Bryter regelen om anonymisering, også for mindreårige |
| C2 | Slett konto (`deleteUserAccount`) har 0 kallere, mens oppryddingsjobben venter | Retten til sletting |
| C3 | Hardkodede fasilitetsflagg (`context.ts:579-581`) | Planforslag utelater bunker og nett uansett |
| C4 | Signalnavn som ikke matcher (`plan-builder/index.ts:191`, `SG_AREA`) | Spillerens svakhet blir alltid tom i planforslaget |
| C5 | ACWR er hardkodet i stallvisningen | Tallet ser ekte ut, men er det ikke |
| C6 | Sjekk om opptak og avskrift sender navn til eksterne tjenester | Samme regel som C1 |

## D. Lav verdi nå

| # | Mulighet | Finnes (MÅLT) | Hvorfor vente |
|---|---|---|---|
| D1 | Samtykkedekning «4 av 11» | `deling/dekningsgrad.ts` | Nyttig for WANG, ikke for lansering |
| D2 | «Neste økt» for forelder | `forelder-neste-okt.ts` | Forelderflaten er ikke grillet i denne runden |
| D3 | Radar- og fabrikkfunn | `RadarFunn` | Uklart hva funnene brukes til |
| D4 | Enkel/dyp modus, dato i fritekst | `/api/player-depth`, `/api/parse-date` | Ikke etterspurt |
| D5 | Sosiale medier-agent, tilgjengelighetsvakt | `social-media-agent`, `availability-24-7-monitor` | Starter bare manuelt, ikke etterspurt |

## Anders' valg (28.09.2026)

«Jeg ønsker at du implementerer alle disse forslagene. Foruten skade, hvis køllehastighet
faller.»

- **Inn i designbestillingene:** A1–A8, A10–A12 og B1–B8.
- **Ikke med:** A9 skadevarsel på køllehastighet.
- **C1–C6** blir kodeoppgaver etter denne runden (ingen kode i runde 8).
- **D1–D5** er ikke valgt.
- Tolkning: «implementerer» betyr i designet nå. Selve koden bygges etter at Anders har sett
  tegningene (port 7).
