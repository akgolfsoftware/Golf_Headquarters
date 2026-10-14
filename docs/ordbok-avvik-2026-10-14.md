# Ordbok-avvik 14.10.2026

Kartlegging av brukervendt tekst i `src/` mot masteren
[`treningsplanlegging.md`](treningsplanlegging.md) §2–§4 og beslutningene i
`.claude/rules/beslutninger.md`. Ingen skjermtekst er endret i denne runden.

**Omfang:** PlayerHQ, AgencyOS, forelder/innlogging/oppstart, booking/betaling/e-post,
WANG, Team Norway, markedssider, GFGK Junior og Caddie. Fem lesende kartleggingsagenter,
én per flategruppe.

**Tall:** ca. 520 råtreff, med overlapp mellom flatene. Det er samlet til 32 avvik (A) der
masteren eller en beslutning allerede svarer, 18 valg (V) der Anders må bestemme, pluss fire
mindre valg, og 4 faktafeil (F). Linjenumre er fra kartleggingen. Ti stikkprøver ble
kontrollert mot kildefila, og alle ti stemte. Treff på «Logg» alene må sees mot kildelinjen
før retting, fordi «Logg inn» og «Logg ut» er lov (§4.1).

**Regler for lista:**
- Publisert offentlig tekst (markedssidene, GFGK Junior, kvitteringssiden uten innlogging) er
  merket **PUBLISERT**. Den venter på Anders og rettes ikke før han har sagt ja.
- Der masteren er stille står det **VALG**. Ingen nye ord er funnet på.
- Endringer i koden kommer i egne PR-er etter at Anders har godkjent lista.

---

## A. Avvik som masteren eller en beslutning allerede avgjør

| # | Ord i dag | Hvor (fil:linje, utvalg) | Forslag | Begrunnelse |
|---|---|---|---|---|
| A1 | Drill, drills, drill-bibliotek | PlayerHQ ca. 40: `components/portal/sg-hub/sg-hub.tsx:376`, `meg/help/data.ts:41`, `v2/ForeslaDrillV2.tsx:88`. AgencyOS ca. 55: `add-session-wizard.tsx:168`, `AdminDrillsV2.tsx:46`, `compliance.tsx:845`. WANG-data: `wang-plan.ts:293`, `wang-data.ts:178`. **PUBLISERT:** `(marketing)/playerhq/page.tsx:31`, `MarkedPersonvernV2.tsx:42`, `MarkedStatsHubV2.tsx:87`, `gfgk-junior-data.ts:305` | Øvelse, øvelsesbibliotek | §2.2 og §3 |
| A2 | Logge, logg, logget, loggføring | PlayerHQ ca. 75: `fysisk/actions.ts:69`, `live/LiveActive.tsx:351`, `PH02Gjor.tsx:80`, `AnalysereV2.tsx:173`. AgencyOS ca. 8: `compliance.tsx:708`, `KonsollChat.tsx:395`. **PUBLISERT** ca. 20: `MarkedPriserV2.tsx:60`, `(marketing)/stats/**` | Registrere, registrert, registrering. «Logg inn» og «Logg ut» beholdes | §3 og §4.1 |
| A3 | Pro, Free-konto, «FULL koster …», TALENT som etikett | `oppgrader-flyt-wizard.tsx:69,154`, `BookingNyV2.tsx:318,324`, `CoachMeldingNyV2.tsx:45`, `AdminHjelpV2.tsx:73`, `AdminNySpillerV2.tsx:285`, `ForelderOkonomiV2.tsx:33`, `tier-etikett.ts:13`. **PUBLISERT:** `BK03Kvittering.tsx:145` | Gratis eller Full. FULL og TALENT er interne utfall | §2.5, §3 og beslutning 30.09 |
| A4 | credit, credits, kreditt | `BookingNyV2.tsx:387,471,495`, `oppgrader-flyt-wizard.tsx:14,132`, `BookingAvbestillKnapp.tsx:58`, `meg/bookinger/actions.ts:164`, `hjelpetekster.ts:239`. **PUBLISERT:** `MarkedFaqV2.tsx:42` | Se V6 for hva enheten skal hete | §2.5: ikke «credit» |
| A5 | Hjelpetrener, Hjelpecoach | `app/admin/grupper/[id]/legg-til-medlem-modal.tsx:21`; `GruppeDetaljV2.tsx:150` («assist coach» med liten bokstav) | Assist Coach | Beslutning 22.09 |
| A6 | «Assistent» som rolle i /team-wang | `team-wang/_components/live-seksjoner.tsx:350` | Fjernes. Rollene i /team-wang er Sportssjef og Trener | Beslutning 26.09 og 27.09 |
| A7 | Fullført om økt og booking | `PH02Gjor.tsx:76`, `ForelderBarnDetaljV2.tsx:271`, `forelder/page.tsx:151`, `ukerapport/page.tsx:58`, `AdminBookingerV2.tsx:84`, `team-norway/.../workbench/page.tsx:66`, `OktArk.tsx:93` | Gjennomført. Booking som er utført: Gjennomført | §3 og §4.3 |
| A8 | Kansellert, Avbrutt (økt), Kanseller (abonnement) | `team-norway/.../workbench/page.tsx:65–69`, `kort/ny/page.tsx:86` («Kanseller når som helst») | Avlyst om økt. «Avslutt abonnement» om abonnement | §4.3 og §2.5 |
| A9 | Ferdig som status | `LiveActive.tsx:192,231`, `SessionSummary.tsx:132`, `AdminTesterV2.tsx:17`, `AdminAgentTeamV2.tsx:58`, `AG01Cockpit.tsx:44`, `checkout-resume-client.tsx:62` («Nesten ferdig») | Den presise statusen: lagret, publisert, gjennomført eller utført | §3 |
| A10 | «Mål» om det spilleren sikter mot | `MalHubV2.tsx:46`, `MalDetaljV2.tsx:267`, `ForelderBarnDetaljV2.tsx:251,762`, `AG11Moduler.tsx:298`, `global-search-modal.tsx:384`, `MegV2.tsx:488`; WANG/TN: `coach-arsplan.tsx:809`, `fane-trening.tsx:451`. **PUBLISERT:** `gfgk-junior/_data/veileder-artikler.ts:83` | Målsetning. «Mål» bare om måltall | §2.2 og beslutning 28.09 |
| A11 | Session, Live Session, «Session ikke funnet» | `AdminHjelpV2.tsx:70`, `planlegge/workbench/actions.ts:178`, `profil-form.tsx:308` | Økt. «Sesjon» i `LoggetUtV2.tsx:24` betyr innlogging: se V12 | §2.2 og §3 |
| A12 | Stats i løpende tekst | `SignupV2.tsx:232`, `AG08Stats.tsx:262`, `coach-workbench.tsx:368`. **PUBLISERT:** `MarkedStatsHubV2.tsx:109` («AK GOLF STATS») | Statistikk. Fanenavnet «Stats» i PlayerHQ er unntaket | §2.2 og §3 |
| A13 | «Analyse» som fane i PlayerHQ | `components/v2/shell.tsx:86` (V2-skallet), `analysere/layout.tsx:9` | Stats. For Team Norway: se V13 | §2.6 |
| A14 | Rundt green, kort spill, kortspill | `sg-hub.tsx:378`, `StrokesGainedDeepDive.tsx:59`, `InnstillingerAnleggV2.tsx:103`, `wang-plan.ts:359`, `arsplan-fasit-2026-27.ts:163`. **PUBLISERT:** `gfgk-junior-data.ts:395` | Nærspill | §2.2 og §3 |
| A15 | opp-og-ned | **PUBLISERT:** `gfgk-junior-data.ts:395` | Up and down | §3 (Anders 14.10.2026) |
| A16 | Spesialisering, Spesialiseringsperiode | **PUBLISERT:** `gfgk-junior-data.ts:9,55,142–222`, `veileder-artikler.ts:820`, `lib/gfgk-junior/bootstrap.ts:66` | Spesialperiode | Beslutning 28.09, som gjelder også WANG. GFGK-teksten venter på Anders |
| A17 | «Turnering» som periodenavn i WANG | `team-wang/_data/arsplan-fasit-2026-27.ts:43–61`, `WangTrening.tsx:258` | Turneringsperiode | §6 og beslutning 28.09 |
| A18 | L-faser, Læringsfase, Motorikk som overskrift | `coach-arsplan.tsx:487`, `_data/coach-arsplan.ts:3`, `wang-plan.ts:621`, `AGTP01Oppgaveskjema.tsx:187`. **Caddies instruks:** `lib/caddie/system-prompt.ts:14`, `tools/knowledge.ts:41`. **PUBLISERT:** `veileder-artikler.ts:584` | Læringssteg | §3. L-faser er utgått (beslutning 21.09) |
| A19 | Belastning om treningsstedet | `arsplan-fasit-2026-27.ts:309,624` (`BELASTNING_LABEL`) | Treningsmiljø. Sjekk om etiketten vises | §3 |
| A20 | Elev, elever, utøver | `AG02Ko.tsx:431,646`, `demo/WangGolfDemo.tsx:51`, `team-norway/wang-resultater/page.tsx:85` | Spiller. Elev i WANG: se V14 | §2.2 |
| A21 | Trener alene om AK Golfs coach | `lyd-samtykke-form.tsx:62`, `lyd-samtykke/[token]/page.tsx:45`, `PH22CaddieChat.tsx:246`, `SpillerOppstart.tsx:287`. Unntak: WANGs rolle «Trener» er besluttet | Coach | §2.2 |
| A22 | AI-coach, AI Golf Coach, AI-Caddie, Coach AI, Personlig AI-assistent, Assistent | `LiveCoachPanel.tsx:126,187`, `oppgrader-flyt-wizard.tsx:13`, `v2/samtale.tsx:45`, `CoachAIV2.tsx:162`, `WorkbenchColdstart.tsx:204`, `PH22CaddieChat.tsx:999`. **PUBLISERT:** `MarkedFaqV2.tsx:55`, `MarkedPersonvernV2.tsx:67` | Caddie | §2.2 og §3 |
| A23 | Trackman | **PUBLISERT:** `(marketing)/coacher/*`, `playerhq/page.tsx:21,38,63`, `anlegg/[slug]/page.tsx:25`, `om-oss/page.tsx:11` | TrackMan | §2.3 |
| A24 | Player HQ | `AdminOppsettHubTrainLock.tsx:240` | PlayerHQ | §2.2 |
| A25 | «Hjem» om AgencyOS-startskjermen | `global-search-modal.tsx:164,263` | Cockpit | §2.6 |
| A26 | Kø, Konsoll, Meg i AgencyOS-skallet | `lib/agencyos/skall-ia.ts:8–12,16`, `app/admin/ko/page.tsx:31`, `AG02Ko.tsx:237`, `shell.tsx:1026` | Innboks. Kø, godkjenninger og oppfølgingskø er filter inne i Innboks | §2.6 og beslutning 28.09 |
| A27 | Venter / Behandler / Forespørsel på booking | `AdminBookingerV2.tsx:82`, `[bookingId]/page.tsx:28`, `AdminBookingDetaljV2.tsx:21`, `ForelderBookingerV2.tsx:230`. **PUBLISERT:** `BK03Kvittering.tsx:115` | Ingen ventestatus for offentlig booking som er betalt | Beslutning 27.09 |
| A28 | Hardkodet pris i kvittering og e-post | **PUBLISERT:** `BK03Kvittering.tsx:145`; `lib/email/booking-endret-time.ts:122` | Les pris fra `ServiceType.priceOre` | Beslutning 26.09 og §2.5 |
| A29 | Feil- og lagringsmeldinger som avviker fra mønsteret | `ForelderSamtykkeV2.tsx:207`, `forelder-wizard.tsx:112`, `forelder/samtykke/actions.ts:97`, `app/error.tsx:32`, `feil-laste.tsx:54`, `tn-testforing-actions.ts:113` («draft/avbryt») | «Endringene kunne ikke lagres. Prøv igjen.» Si hva som skjedde, ikke bare «Noe gikk galt» | §2.1 og §4.2 |
| A30 | «Inspill Basic», «Måleverktøy», «Forkastet», «Fullført» på AI-forslag | `SpillerOppstart.tsx:330,331`, `PH13DrillBank.tsx:88`, `caddie-tool-call.tsx:36` | Innspill Basic, Måleutstyr, Avvist, Utført | §4.3 |
| A31 | Utropstegn og floskler | **PUBLISERT:** `BookingKvitteringPrecision.tsx:115,200`, `quiz-shell.tsx:290`, `StatsNorskeV2.tsx:239`; `SignupV2.tsx:101` («Mest populær») | Fjernes | §2.1 |
| A32 | Fem trinn i AK-stigen | **PUBLISERT:** `JuniorAK.tsx:101,125–160` | Fire trinn, Knøtt ved siden av | Beslutning 22.09. Står allerede som ventende |

---

## V. Valg som Anders må ta

Maks tre alternativer, med anbefaling. De fem viktigste er V1, V3, V6, V13 og V17.

| # | Spørsmål | Hvor | Alternativer | Anbefaling |
|---|---|---|---|---|
| V1 | **Caddie eller Jarvis?** AgencyOS bruker «Caddie · Jarvis» om hverandre, og skallfanen heter Jarvis. Beslutningene bruker Jarvis om den som forbereder alt og sender ingenting | `skall-ia.ts:11`, `AG19CaddieHub.tsx:82`, `AG04Innboks.tsx:194`, `jarvis/page.tsx:26` | a) Caddie til spiller, Jarvis til coach/Anders i AgencyOS. b) Alt heter Caddie. c) Alt heter Jarvis | **a**: stemmer med beslutningene |
| V2 | **Forelderflatens navn.** «Foreldreportal», «foreldre-portal», «Foreldreportalen», «Forelder» og «(v2)» i tittel | `GuardianConsentV2.tsx:75`, `forelder-wizard.tsx:173`, `bookinger/page.tsx:29`, `forelder/page.tsx:32` | a) Foreldreportal. b) Forelder. c) Foreldreflaten | **a**, uten bindestrek og uten «(v2)» |
| V3 | **Samtykke, godkjenning eller bekreftelse.** Samme handling heter «godkjenne», «gi samtykke», «bekrefte» og «tillatelse» | `GuardianConsentV2.tsx:52`, `SamtykkeVenterV2.tsx:52`, `lyd-samtykke-form.tsx:59`, `forelder-wizard.tsx:243` | a) Forelder «godkjenner» barnets konto, alle andre «gir samtykke». b) Alt «godkjenn». c) Alt «samtykke» | **a**: følger beslutning 06.10 og personvernteksten |
| V4 | **«Barn» eller «spiller» på forelderflaten** | `ForelderSkall.tsx:25`, `ForelderBarnDetaljV2.tsx:411`, åtte skjermer | a) «Barn» på forelderflaten, «Spiller» ellers. b) Alltid «Spiller». c) Barnets fornavn | **a** |
| V5 | **Opprette konto.** «Ny bruker», «Lag konto», «Opprett konto», «Registrer» | `LoginView.tsx:124`, `SignupV2.tsx:229,230,298` | a) Opprett konto. b) Lag konto. c) Registrer deg | **a** |
| V6 | **Enheten for coaching-pakken.** «klipp», «credit», «time», «saldo», «timer igjen». Beslutning 26.09 bruker «klipp» og «klippekort» | `PH23Booking.tsx:57,761`, `avbestilling-mal.ts:44`, `BookingNyV2.tsx:335`, `BookingHubV2.tsx:149` | a) «Klipp» for enheten og «coaching-time» for timen. b) «Coaching-time» overalt. c) «Saldo» | **a** |
| V7 | **Avbestilt eller avlyst** for samme `CANCELLED`. Spilleren ser «Avbestilt», admin og forelder ser «Avlyst» | `AdminBookingerV2.tsx:85`, `ForelderBookingerV2.tsx:218`, `PH23Booking.tsx:206` | a) Avbestilt når spilleren gjør det, Avlyst når coachen gjør det. b) Alltid Avbestilt. c) Alltid Avlyst | **a**: er allerede skillet i §4.1 og §4.3 |
| V8 | **Siste knapp i betaling.** Seks formuleringer | `PH23Booking.tsx:887`, `BookingNyBekreftV2.tsx:167`, `BK01Booking.tsx:46,230`, `MarkedBookingBekreftV2.tsx:200` | a) Bekreft og betal. b) Betal {beløp}. c) Gå til betaling | **a** |
| V9 | **Avbestillingsfrist.** «før», «fram til», «inntil», «senest» | `BookingNyV2.tsx:502`, `BK01Booking.tsx:214`, `MarkedBookingBekreftV2.tsx:157` | a) «Gratis avbestilling inntil 24 timer før». b) «… fram til …». c) «… senest …» | **a** |
| V10 | **Refusjon eller tilbakeføring** | `MarkedBookingBekreftV2.tsx:157`, `policy.ts:147`, `avbestilling-mal.ts:50`, `faktura-document.tsx:378` | a) Refusjon. b) Tilbakeføring | **a** |
| V11 | **Innlogging.** «Magisk lenke», «innloggingslenke», «bekreftelseslenke», «Glemt passord/passordet», «Pålogging» | `LoginView.tsx:118`, `CheckEmailV2.tsx:18`, `ResetPasswordV2.tsx:19`, `bankid/page.tsx:10` | a) «Innloggingslenke», «Glemt passord?», «Logg inn med BankID». b) «Magisk lenke» beholdes. c) «Lenke på e-post» | **a** |
| V12 | **Innloggingsøkt.** «Din sesjon er avsluttet» | `LoggetUtV2.tsx:24` | a) «Du er logget ut». b) «Innloggingen er avsluttet» | **a** |
| V13 | **Team Norways egne ord.** TN bruker «Analyse» som fane, «Protokoll» om test, «Trener» og «Assist Coach» | `tn-shell.tsx:103,272`, `tn-tilgang-visning.tsx:51`, `team-norway/.../workbench/page.tsx` | a) Team Norway holder egne ord, og de skrives inn i masteren. b) Følger PlayerHQ (Stats, Test, Coach). c) Blandet | **a**: eget system og egen designbeslutning |
| V14 | **Elev i WANG.** WANG bruker «Elev» (ca. 80 steder) og «Utøver» (demo) | `WangElever.tsx`, `WangTrening.tsx`, `WangGolfDemo.tsx:381` | a) «Elev» i WANG (skolens ord), «Spiller» ellers. b) «Spiller» overalt. c) «Utøver» | **a** |
| V15 | **Foresatt eller forelder** i skjema og e-post | `SignupV2.tsx:24`, `forelder-wizard.tsx:55,168`, `guardian-consent/[token]/actions.ts:136`, `ForelderInnstillingerV2.tsx:31,71` | a) «Forelder» i all skjermtekst, «foresatt» bare i juridiske samtykketekster. b) «Foresatt» overalt. c) Valg per skjema | **a**: er §2.2 |
| V16 | **Stats-fanene.** Koden har Oversikt · Strokes Gained · TrackMan · Tester · Runder. Masteren har Snittscore · Strokes Gained · Trening · Tester | `statistikk/statistikk.tsx:90–94`, `PH16Stats.tsx` | a) Bytt til masterens fire. b) Legg «Runder» og «TrackMan» til masteren. c) La stå | **a**: beslutning 28.09 |
| V17 | **Gjør, Gjør nå og Skill Map** står ikke i masteren (§2.6 har bare I dag · Plan · Stats · Meg) | `GjorV2.tsx:121`, `fysisk/page.tsx:29`, `gjennomfore/page.tsx:14`, `SkillMapView.tsx:295` | a) Begge beholdes og legges inn i masteren. b) «Gjør» byttes til «Start økt» (hurtigknappens ord), «Skill Map» beholdes. c) Begge utgår som navn | **b** |
| V18 | **Økta eller økten.** «Økta» ca. 65 ganger (mest Live), «økten» ca. 54. Masteren bruker «Økten» (§4.2) | `LiveActive.tsx`, `PH04LiveBrief.tsx:340`, `PH10Plan.tsx:165` | a) «Økten» overalt. b) «Økta» overalt. c) Begge tillatt | **a** |

### Mindre valg (lav risiko)
- **«Opp-og-inn» i WANG** (`wang-plan.ts:369–372`, ca. 10 treff): hva betyr det, og skal det være «Up and down», «Chip-in» eller stå som eget uttrykk? Anbefaling: avklar betydningen først.
- **Samlingsord i WANG:** Fellessamling, Samlingsuke, Øktplan, Fellesøkt (`arsplan-fasit-2026-27.ts:106,1164`). Masteren har Treningssamling og Heldagssamling. Anbefaling: bytt Fellessamling til Treningssamling, og legg de tre andre inn som WANG-ord hvis Anders vil beholde dem.
- **Kontakt:** «support», `post@akgolf.no`, `anders@akgolf.no`, `support@akgolf.no` (`ForgotPasswordV2.tsx:63`, `ForelderSamtykkeV2.tsx:354`). Anbefaling: `post@akgolf.no`.
- **Plantyper utenfor masteren:** IUP (133 treff), Utviklingsplan, Sesongplan (`team-wang/layout.tsx:26`), Månedsplan (TN). Anbefaling: IUP og Månedsplan inn i masteren, «Sesongplan» byttes til «Årsplan».

---

## F. Faktafeil som ikke er ordvalg

| # | Funn | Hvor | Konsekvens |
|---|---|---|---|
| F1 | Fristen for forelderens godkjenning står som sju dager i venterommet, men 30 dager i e-posten | `SamtykkeVenterV2.tsx:53` mot `app/auth/onboarding/actions.ts:663` | Forelder kan få feil frist. Beslutningen er sju dager (06.10). Må verifiseres mot kilden |
| F2 | Caddies systeminstruks nevner MORAD og L-faser og har ingen regel som forbyr å gjenta dem | `lib/caddie/system-prompt.ts:14`, `tools/knowledge.ts:39,47` | MORAD nevnes aldri offentlig, og L-faser er utgått. Svar til brukere er ikke offentlige, men regelen bør stå i instruksen |
| F3 | Seed-e-poster bruker «AK Golf Pro», «Pro-time», «Live Session», «Loggføring av runder» | `prisma/seed.ts:156–182,237` | Går til nye brukere hvis malen ligger i databasen. Sjekk om malen er i bruk |
| F4 | `leaderboards/page.tsx:689–703` har tre `sitat`-felt uten kilde | `app/(marketing)/stats/**/leaderboards/page.tsx` | Kan leses som vitnesbyrd. Beslutning: ingen vitnesbyrd eller sitater. **PUBLISERT** |

---

## Ikke dekket i denne runden
- E-postmalenes brødtekst ord for ord (bare emner, knapper og mønstre).
- Sidetitler og metadata (`<title>`, `description`) utenfor markedssidene.
- `lib/v2/hjelpetekster.ts` mot §2.3 (TrackMan-forklaringer): bare credit-treffene er tatt.
- Stripe-kundeportalen og push-varslenes tekst.
- Kode som ikke er rutet (`ForelderPrecisionView`, `BookingHubV2`, `MegAbonnementV2`, `MarkedBookingV2`) er kartlagt, men bør ikke være grunnlag for retting før de er fjernet eller portert.
