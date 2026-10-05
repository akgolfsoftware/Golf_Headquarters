# Backend klar for portering — plan 05.10.2026

**Bestilt av Anders 05.10:** «Fiks alle backend-oppgaver og funksjoner slik at når designprosjektet er 100 % klart, kan du enkelt portere alle skjermer til kode.»

**Arbeidsdeling:** Claude Design ferdigstiller designsystemet og skjermtegningene. Claude Code gjør alt under skjermen: data, tilgang, lagring, regler og tester. Ingen nye skjermtegninger eller UI-portering i denne planen.

**Målet:** for hver skjerm-ID finnes en ferdig «skjermkontrakt»: én funksjon som henter dataene skjermen trenger, ferdige handlinger (lagre, sende, slette), tilgangssjekk, tom/laster/feil-tilstand, testdata og tester. Når tegningen er godkjent, er portering bare å bytte ut selve visningen.

## Grunnlaget

| Kilde | Dato | Hva den sier |
|---|---|---|
| Kodegjennomgang mot tegning (fire rapporter) | 05.10 | `.claude/worktrees/maskinsjekk/rapport/design-*.md` |
| Maskinmåling av alle ruter | 05.10 | `.claude/worktrees/maskinsjekk/rapport/maskin.md` (kjører) |
| Restoppgaver F01–F06, Q01–Q05 | 02.10 | `docs/planer/arbeidsliste-restoppgaver-2026-10-02.md` |
| Fullføringsplan PRE-01–08 | 30.09 | `docs/planer/codex-fullforing-claude-design-2026-09-30.md` |
| WANG/TN pakke 1–7 og åpne spørsmål | 30.09 | `~/ak-brain/claude-code/arbeidsliste-2026-09-30.md` |
| Funksjonsinventar | 01.10 | `docs/design-audit/funksjonsinventar-2026-10-01.json` |
| Beslutninger | løpende | `.claude/rules/beslutninger.md` (vinner ved konflikt) |

**Funnene i kortversjon:**
- **PlayerHQ:** 31 skjermtyper: 5 grønne, 18 gule, 8 røde. 25 sider bruker fortsatt det gamle skallet. Bjella peker feil på 132 steder. Live-økta (fire tellere, fysisk økt, belastning og fokus), runderegistreringen, PH-27 Deling og IUP-delene mangler funksjon.
- **AgencyOS:** 49 grupper: 5 grønne, 19 gule, 25 røde. AG-17 til AG-24 viser demodata i prod. TrackMan viser oppdiktede tall. GDPR-sletting gjør ingenting. `/admin/runder` mangler coach-avgrensning.
- **WANG:** 72 skjermer: 0 grønne, 12 gule, 60 røde. Alt er kulisser uten data. Rollen velges i nettleseren. `/team-wang/skjermer` er åpen uten innlogging. Kvitteringer sier at ting er sendt uten at noe skjer. De ekte datakoblede sidene er gjemt.
- **Team Norway:** 35 ruter: 27 grønne og 8 gule. Én gammel Claw-demo (`TeamNorwayAppView.tsx`) står igjen. #1004 skal plukkes fra, ikke merges.

## Prinsipper

1. **Sannhet før alt:** ingen oppdiktede tall, falske kvitteringer eller demodata i prod. Mangler data, vises «—» eller tom tilstand.
2. **Tilgang avgjøres på serveren**, aldri i nettleseren. Hver handling som tar en spiller-ID, sjekker eier, coach eller gruppe og samtykke.
3. **Skjermkontrakt per skjerm-ID** (`src/lib/skjerm/<ID>/`): `hent<ID>()` med zod-type, handlinger, tilstander og testdata. Visningen kan byttes uten å røre kontrakten.
4. **Databasen endres bare additivt** via `db execute` (gotchas §Database). Hver ny tabell eller kolonne krever Anders' ja.
5. **Ingen nye fagregler på antakelse.** Mangler faglig innhold (standardplaner, A–K-nivåtall, poengskala), bygges strukturen og innholdet står som «venter på Anders».
6. **Én pakke per endringssett**, testet grønt før det legges inn i hovedversjonen. Maks 5 parallelle arbeidsløp, Sonnet som standard.

## Planen (10 faser + fase 0)

### Fase 0 — Feil i produksjon nå (P0, før alt annet)
Funnet i Vercels feillogg 05.10 (siste 7 dager) og i maskinmålingen:
- **Databasen mangler tabeller og kolonner som koden bruker:** `workbench_tournament_plans`, `workbench_physical_blocks`, `rounds.source`, `test_day_events` og `test_days.eventId`. Det knekker Workbench (spiller og coach), Stats, testene og TN-testdag. Siste feil 04.10. Skriptene finnes (f.eks. `scripts/add-tn-testday-events-2026-10-02.ts`), men er ikke kjørt mot produksjon.
  - Lag en kontroll som sammenligner `schema.prisma` med produksjonsdatabasen (`/db-check`) og lister alle hull.
  - Kjør de manglende additive skriptene (`CREATE … IF NOT EXISTS`). Krever Anders' ja, eller at Anders kjører dem selv.
  - Vakt: CI eller daglig jobb som varsler når koden bruker en tabell som ikke finnes.
- **Notion-synk har feilet over 2 000 ganger siden 12.09.** Databasen `b0f3f0f6-…` er ikke delt med integrasjonen «AK Golf HQ». Anders deler den i Notion, eller koblingen fjernes.
- **`/portal/mal/runder`** sender funksjoner til en klientkomponent (`delHref`, `detaljHref`). Siden krasjer.
- **React-feil #441** på `/portal` og `/admin/workbench/[playerId]`.
- **Upstash Redis** var nede fram til 01.10. Sjekk at nøkkelen er gyldig nå.
- **Testbrukerne** `screentest@` og `screentest-parent@` avviser passordet. Spiller- og forelderflatene kunne derfor ikke måles.

**Ferdig når** feilloggen er tom for databasefeil i 24 timer, og kontrollen av skjema mot database viser 0 hull.

### Fase 1 — Fundament (1 økt)
- Fullfør maskinmålingen og slå den sammen med de fire rapportene til ett **funksjonsregister**: skjerm-ID → rute → data → handlinger → tilgang → status → mangler. Utvider PRE-01 og skjermregisteret med kolonnen `kontrakt`.
- Isolert testrigg med syntetiske brukere (to coacher, to spillere, forelder, WANG-trener og sportssjef, TN-trener) mot lokal database (PRE-02). Ekte e-post, betaling og eksterne jobber er sperret.
- Utgangsmåling: `npm run verify` og innloggede reiser, med bestått, feilet og hoppet over oppgitt separat (PRE-03).

**Ferdig når** hver skjerm-ID har én rad med status, og testriggen kan logge inn som hver rolle.

### Fase 2 — Sikkerhet og tilgang (P0, 1–2 økter)
- WANG: rolle avgjøres på serveren (fjern rollevalg i nettleseren). Administrasjon bare for sportssjef. `/team-wang/skjermer` bak innlogging. Fellessiden `/team-wang` urørt.
- WANG og TN: tilgang krever delingssamtykke, ikke bare gruppe (beslutning 28.09 punkt 1, mulighetskart WC1–WC3).
- `/admin/runder` og alle `/admin`-spørringer avgrenses til coachens spillere. Gjennomgang fil for fil av serverhandlinger som tar spiller-ID (F04).
- Økonomi bare for head coach, også i Mer-menyen (beslutning 28.09).
- Hver regel låses med test for både tillatt og avvist tilgang.

**Ferdig når** syntetisk trener A ikke kan lese eller skrive noe hos trener B, og alle testene er grønne.

### Fase 3 — Sannhet: fjern alt falskt (P0, 1–2 økter)
- AgencyOS: fjern fallbacken `STANDARD_DATA` i AG-17 til AG-24, de oppdiktede tallene i TrackMan (`trackman/page.tsx:61-91`), turneringskoordinater fra løpenummer og DataGolf-raden. Gjør GDPR-slettingen ekte (`opprettGdprForesporsel`) eller skjul knappen.
- WANG: fjern falske kvitteringer, formelgenererte elevtall og «Signert digitalt» uten kobling. Hent inn igjen de tre datakoblede rutene (IUP, testresultater, turneringer) som er gjemt bak `?visArsplan=1`.
- TN: slett `TeamNorwayAppView.tsx` og katalogoppføringene.
- Utvid vakten `ingen-demovisning-i-ruter.test.ts` med alle `Wang*`- og `AG1x/2x`-moduler, og slå fargevakten på igjen for WANG.

**Ferdig når** et søk etter demodata i prod-vei gir 0 treff og vakttestene er grønne.

### Fase 4 — Felles skall-data (1 økt)
Det designet trenger fra alle skall, uansett utseende:
- Antall uleste fra ett sted (layout) til bjella i PlayerHQ og AgencyOS. Bjella går til innboksen (PH-21).
- Mål for hurtigknappen: PlayerHQ (Spør Caddie · Ny økt · Registrer runde · Start økt) og AgencyOS (fem handlinger). Ekte ruter: «Ny booking» → `?fane=ny`, «Workbench» → ekte AG-11-inngang.
- Rolle i skallet (head coach eller assistant coach), menyoppsett etter IA 28.09.
- Videresending fra utgåtte ruter: `kalender`, `gjennomfore`, `tren/fys-plan`, `fysisk`, `ukesdigest`, `talent/*`, `utviklingsplan`.

**Ferdig når** skallene får alle tall og mål fra kontrakten, uten hardkoding.

### Fase 5 — Datamodell (additiv, krever Anders' ja per tabell)

| Tabell eller kolonne | Til | Kilde |
|---|---|---|
| `MonthPlan`, `SeasonPlan.createdById` + start/slutt | Workbench År/Måned, opprett årsplan | beslutning 28.09 |
| `FollowUpCase` | Innboks «Løst» | beslutning 23.09 |
| Live-økt: fire tellere per drill, fysisk sett (vekt/reps/serier), belastning og fokus 1–10, «Hvor tungt» | PH-05/06/07 | beslutning 28.09 |
| Målsetning: start, slutt, type (resultat/prosess) | PH-11 Målsetninger | beslutning 28.09 |
| Samtykke til opptak og Ytelsesbilde | onboarding, AG-13 | beslutning 28.09 |
| «Egen»-merke og gjentakelse på økter | Workbench gruppe | beslutning 28.09 |
| `DrillChallenge` retning | Utfordringer | beslutning 22.09 |
| `ExerciseDefinition` AK-formel-felt | øvelsesredigering | AG-11b |
| Utviklingssjekk (41 spørsmål per nivå) | WANG/TN/PlayerHQ | beslutning 28.09 |
| WANG pakke 2–5 og TN pakke 6–7 | trener-skjermene | arbeidsliste 30.09 |
| Stjernemarkering og kontaktlogg per skole | WANG-33 | beslutning 26.09 |

**Ferdig når** hver godkjent endring finnes i basen (bekreftet med lesespørring), Prisma er generert, og ingen rader er endret.

### Fase 6 — PlayerHQ-funksjoner (3–4 økter)
1. **Live-kjeden:** fire tellere mot plan, fysisk økt som fører vekt og serier, oppsummering med belastning og fokus. Samme økt-ID hele veien (PRE-05).
2. **Runderegistrering RD-02 til RD-09:** kladd, slag per hull (avstand, underlag, kølle), putt (fot, break, fart, miss V/H/linja), SG, brutto og Tiger 5 rett etter runden, import og redigering. Runde-agentene startes etter `logRoundManual` (A1).
3. **IUP:** PH-IUP-02 sesongevaluering, PH-11-MAL-IUP med 37 måltall, kortene i PH-01 (fireukerssjekk og sesong i uke 42), bare for WANG- og TN-medlemmer.
4. **PH-27 Deling:** delingslenke bare til @wang.no og @golfforbundet.no, gyldig i sju dager, forelder godkjenner under 16, tilbaketrekking virker med en gang, historikk.
5. **Plan:** zoom År, Måned, Uke og Dag fra samme data. Google-kalender begge veier (coach ser bare opptatt). Coach varsles når spilleren endrer coachens økt eller turnering.
6. **Stats:** datanok-grenser (under 4, 4–7, 12, 24 runder), Broadie merket ESTIMAT, PGA Tour på valg. Ingen sammenligning med andre spillere.
7. **Tester:** TN-poeng (8-ball, putt, Gate summerer, Wedge Gate teller treff), ett testbatteri, «Egenført» og «Kontrollert».
8. **Planmotor:** de fem standardplanene som struktur (innholdet venter på Anders), justeringsforslag bare ved de fire avtalte utløserne, fasilitetsskjemaet styrer flaggene (fjern hardkodet `hasBunker: false`).
9. **Én etterlevelse:** minutter mot plan siste fire uker, likt på alle flater (beslutning 26.09).

### Fase 7 — AgencyOS-funksjoner (3–4 økter)
1. **Innboks:** én kø for meldinger, forslag, varsler, leads og oppfølging (`FollowUpCase`). Ubesvart spillerspørsmål over 24 timer haster. Svar uten utkast gir «Lag utkast».
2. **Workbench:** opprett årsplan fra fire utgangspunkt, coachen kan endre og slette perioder (`coachLagrePeriode` og `coachSlettPeriode` kobles inn), månedsskjema, gruppeplan som arves med «Egen»-merke.
3. **Kalender:** alle coachers bookinger, filter på coach, flytting varsler spilleren med angre i 10 sekunder, forslag til gruppeøkter med inntektsanslag.
4. **Live coaching (AG-12/13):** opptak bare med samtykke, navn tas ut før tekst sendes til AI, sammendraget er utkast og «Godkjenn og send» går til spilleren.
5. **Økonomi:** fordeling på AK Golfs fem tjenester fra budsjett, Tripletex-eksport og Stripe, aldri anslått.
6. **Oppgaver (AG-21)** fra Notion Tasks og Prosjekter. **Oppsett (AG-23)** lagrer ekte. **Jarvis (AG-19)** leser ekte agentkø. **Drift (AG-24)** med ekte revisjonslogg og feillogg.
7. **TrackMan og turneringer** fra ekte økter og `public_player_entries`. DataGolf bare for Anders.
8. **Øvelsesredigering:** coach oppretter og endrer øvelser.
9. **Caddie-samtale:** `getOrCreateActiveConversation` kobles inn, så forslag lagres som utkast.
10. **Assistant coach:** ser bare egne økter og gruppeøkter.

### Fase 8 — WANG og Team Norway (3–4 økter)
- **WANG:** pakke 2–5 (trening og oppmøte, meldinger og elever, konkurranse, tester og administrasjon) kobles til de 72 skjermene. Samtykkeoversikt via `beregnDekningsgrad`. Fireukerssjekk vises for trener. Periodene leses fra `arsplan-fasit-2026-27.ts`. Testbatteriet uten CMJ og knebøy. PR #1060 (pakke 1) rettes og legges inn først. Demoradene i tabellene `fireukerssjekker`, `trener_forslag` og `elev_samtaler` ryddes.
- **TN:** plukk fra #1004 (tokendiff, uttak-plan-gruppe-admin, kartlegging, `tn-ruter.ts`, `tn-flate-tilgang.ts`). Pakke 6–7. Deling per organisasjon. Utviklingssjekk 2027. Tilstandene lagringsfeil, ingen tilgang og trukket. #1004 lukkes etterpå.

### Fase 9 — Booking, betaling og konto (2 økter)
- Legg inn BK-02 (#1025), BK-03 (#1022) og AU-04 (#1028). Kollisjonene ble løst 05.10.
- Gjestebookinger hentes inn på kontoen ved registrering. Kvitteringen uten e-post i lenken.
- Takke-e-post (EP-05) som utkast innen 24 timer, én oppfølging (EP-06) etter 14 dager.
- Abonnement: fornyelse, mislykket betaling, oppsigelse via Stripe før egen database, gjentatte webhooker (F02).
- Konto: eksport og sletting som rydder Auth, Storage, Stripe og profil (F03).
- Kartleggingsøkt deaktiveres i `ServiceType` hvis den finnes.

### Fase 10 — Porteringssett og kvalitetsport (1 økt + løpende)
- For hver skjerm-ID: kontrakt, testdata (syntetisk, uten persondata), og en side i `docs/skjermkontrakter/` som sier hva visningen får og hvilke handlinger som finnes.
- Full `npm run verify`, innloggede nettleserreiser per rolle, og produksjonsrøyktest (Q01).
- Funksjonsregisteret viser 100 % «kontrakt klar» eller «venter på Anders» med grunn.

**Ferdig når** porteringen av en godkjent tegning bare er å bytte ut visningskomponenten, og ingen skjerm trenger ny backend.

## Rekkefølge og omfang

`Fase 1 → 2 → 3 → 4`, og deretter parallelt: `5`, `6 + 7`, `8`, `9` i hvert sitt arbeidsløp. Til slutt `10`.

Anslag: **14–20 økter** på maks 2 timer. Faser 1–4 er grunnmuren og må gjøres i rekkefølge. Fra fase 5 kan opptil 5 arbeidsløp gå samtidig.

## Det Anders må avgjøre (samles i én runde)

1. **Ja per tabell** i fase 5. Kan gis samlet for hele lista.
2. **DataGolf for WANG-trenere:** tegningen viser det, beslutningen sier «aldri for andre enn Anders».
3. **WANG-spørsmålene fra 30.09:**
   - norske testnavn
   - «Kontroller» lagrer bekreftet
   - tråd mellom sportssjefer
   - gammel IUP-samtale
4. **TN:** skal skjermene bare vise spillere som har delt fra PlayerHQ? «Hjelpetrener» → «Assist Coach»?
5. **Google-kalender:** godkjenne tilkobling (OAuth) for coach og spiller.
6. **Faglig innhold** som venter: fem standardplaner per kategori A–K, A–K-nivåtall og måleenhet i 9 hull lengde.
7. **Vilkårssiden:** «Pro-tier kr 300/mnd» → «Full, 299 kr»?
8. **Fra tilgangsgjennomgangen 05.10** (`docs/design-audit/tilgang-admin-2026-10-05.md`, PR #1190):
   - Skal priser, anlegg, e-postmaler, planmaler, benchmarks og turneringer kunne endres bare av head coach, eller av alle coacher?
   - Skal Rapporter være bare for head coach, også bak menyen?
   - Skal kalenderhendelser (tittel og notat) være synlige på tvers av coacher?
   - Skal assistant coach se alle spillere i booking-veiviseren?
   - Skal live-økt og forespørsler avgrenses til spillerens stall?
9. **WANG:** er sportssjef det samme som rollen ADMIN? PR #1193 antar det, siden det ikke finnes et eget felt for sportssjef.

## Status 05.10 (fase 2–3 levert som endringssett, ikke lagt inn)
| PR | Innhold |
|---|---|
| #1189 | AgencyOS sannhet: TrackMan, Turnering, Jarvis, Oppgaver, Innsikt, Oppsett, Drift med ekte data eller «—»; GDPR-sletting koblet (bare admin) |
| #1190 | Tilgang: 48 handlinger fikk tilgangssjekk (bl.a. testslag uten innlogging, avlysing av andres bookinger, GDPR for enhver coach); `/admin/runder` avgrenset |
| #1191 | Team Norway: Claw-demo slettet, ett skall, tabell uten sidelengs rulling |
| #1193 | WANG: rolle på serveren, skjermoversikt bak innlogging, falske kvitteringer og tall fjernet, ekte sider lenket inn |
| #1022, #1025, #1028 | BK-03, BK-02 (utkast), AU-04 — flettet med main 05.10 |

## Utenfor denne planen
- Nye skjermtegninger og visuell portering (venter på Claude Design 100 %).
- Markedssidene og `/stats`.
- Stripe-live og ekte kjøp (verifiseres sist, rett før røyktesten).
