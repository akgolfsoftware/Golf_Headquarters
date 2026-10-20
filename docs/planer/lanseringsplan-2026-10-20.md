# Lanseringsplan AK Golf HQ (oppdatert 20.10.2026, kl. 02:30)

Bestilt av Anders 20.10: oppdatert plan for lanseringen med design for alle sider, datasikkerhet og
GDPR, alt i main, komplett rydding og verdensklasse kodekvalitet, og status fra alle økter.

Bygger på [demoplanen for 21.10](demo-lansering-2026-10-21.md) (demoen er delmål 1),
[designauditen](../design-system/audit-design-fire-flater-2026-10-20.md),
[front end-analysen](../design-system/analyse-frontend-playerhq-agencyos-2026-10-20.md),
[nettstedsplanen](akgolf-no-nettsted-reise-plan-2026-10-15.md) og
[bookingplanen](booking-komplett-agencyos-plan-2026-10-15.md). Alt målt mot main `396b630db`.
Regel som før: en status oppgraderes bare med bevis. «Bygget» er ikke «målt», «målt» er ikke «sett av Anders».

## 1. Slik står det nå

| Flate | Status | Sant nå | Bevis |
|---|---|---|---|
| PlayerHQ `/portal` | **Nær klar** | I dag, Plan, Stats, Meg og Workbench med nivåene (Uke, Gjenta, Målsetninger) er i main i Precision. Småfeil igjen: Stats-bildet på PC, «0 av —» i Live, «0 organisasjoner» mot «WANG-gruppen» i Meg. | Audit C, #1459 |
| AgencyOS `/admin` | **Delvis** | Skall og meny ferdig. Cockpit under 2 s (#1466). Tomme forslag stoppet, 3 498 merket avvist, 148 saker igjen. Gjenstår: «Trenger deg» i Stall rød på 37 av 62, kickere «MER ·», `/admin/plan` i gammel port med MORAD- og CS-tekst, 17 skjermer i eldre Precision-port. | Audit B1, B5, B6; `precision-a*.css` 17 filer |
| Markedssidene | **Mangler** | 74 sider. Forside, booking (5 sider) og kvittering i Precision. 51 sider bruker fortsatt `marketing/v2`: coacher, anlegg, blogg, cases, kontakt, personvern, vilkår, FAQ, hele `/stats/*` (31 sider), turneringer, suksess. | `grep marketing/v2` |
| Booking | **Klar til røyktest** | BK-01 til BK-04 i Precision, e-postene EP-01–06, gjest endre/avbestill, auto-bekreftelse etter betaling. Ikke gjort: én ekte betaling i Stripe live, Apple Pay, duo og gavekort (bookingplanen steg 6–8). | #1433–#1441 |
| WANG `/team-wang`, `/wang` | **Demoklar, ikke lansert** | W1–W4 i main, demotreneren slipper inn (#1465). `/wang` har stilen fra før 16.10 (navy, runde hjørner). Fellessiden `/team-wang` er egen, uendret. | #1429, #1423, #1427, #1425, #1465 |
| Team Norway `/team-norway`, `/teamnorway` | **Demoklar for TN-01, resten gammel** | T1–T3 i main, demotreneren slipper inn (#1465). Retning «Skrå» er fasit (19.10): TN-01 hjem er bygget, 25 av 27 skjermer gjenstår i Skrå. Meny og skrift uavklart (§SKRÅ punkt 7–8). | #1463, `skjermer/` 27 filer, 2 i Skrå |
| Forelder `/forelder` | **Bygget, ikke sett** | Alle elleve sider i Precision (#1456). Port 7 gjenstår. | #1456 |
| Data Golf | **Avgjort** | Bare ADMIN (Anders), aldri utad (20.10). Gjenstår: lesespørring at bare Anders har ADMIN, og at markedssidene ikke lenker til `/stats/pga`. | §DATA GOLF ER ANDERS' PRIVATE VERKTØY |
| Pipelines | **Delvis** | GolfBox-RID som nøkkel, mandagskjeden grønn 19.10. Profilkobling `User.publicPlayerId` bygges i økta «Profilside» (annet repo). | demoplanen §4 |

## 2. De fem sporene

### Spor A · Design for alle sider

Målet: hver side i hver flate følger sin fasit, målt i 390 og 1280 px uten sidelengs rulling, og sett av Anders (port 7).

| # | Pakke | Omfang | Ferdig når |
|---|---|---|---|
| A1 | Markedssidene, kjernesider | `/coacher/[slug]`, `/kontakt`, `/faq`, `/treningsfilosofi`, `/cases`, `/suksess`, `/anlegg`, `/turneringer`, `/blogg`, `/jobb` (ca. 14 sider) til Precision etter nettstedsplanen steg 3–5. | 0 treff på `marketing/v2` utenfor `/stats` og juridisk |
| A2 | Markedssidene, juridisk | `/personvern`, `/vilkar`, `/cookies` i Precision, med tekst fra spor B. | Sidene viser den juridisk godkjente teksten |
| A3 | Markedssidene, `/stats/*` | 31 sider. Beslutning trengs: hvilke av dem skal lanseres åpent? Anbefaling: lanser `/stats/spillere`, `/stats/turneringer`, `/stats/klubber` og `/stats/sok` i Precision; resten (quiz, wrapped, verktøy, blogg, sg-sammenlign) skjules bak feature-flagg til etter lansering. | Anders har valgt; de valgte er i Precision, resten er skjult |
| A4 | AgencyOS resten | Stall «Trenger deg» kalibrert (B1), kickere rettet (B5), `/admin/plan` portert og teksten renset for MORAD, CS og engelsk (B6), de 17 eldre Precision-skjermene (`precision-a*.css`) over på `.agn-s`-byggeklossene. | `precision-a*.css` er borte, ingen «MER ·» kicker, test på «Trenger deg» |
| A5 | PlayerHQ småfeil | Audit C for PlayerHQ (fem punkter). | Alle fem rettet i én PR |
| A6 | Team Norway i Skrå | 25 skjermer i fem pakker etter §SKRÅ punkt 5: spillere og IUP · samlinger og fellestesting · uttak, rangliste, turneringer, live · månedsplan og Workbench · analyse og administrasjon. Først: Anders svarer på meny (navy sidemeny eller hvit topplinje) og skrift (Jost/Lato eller Schibsted Grotesk). | Hver pakke målt og sett |
| A7 | WANG innlogging og fellesside | `/wang` i vinrødt og firkantet. Fellessiden `/team-wang` vurderes mot WANG-designsystemet (`3580374e`), er i dag egen stil. | `/wang` følger §WANG-TRENERFLATEN; fellessiden har Anders' ja |
| A8 | Fellesskjermer | 404, feilside, vedlikehold, cookie-banner og innlogging per flate: AK Golf, WANG og Team Norway skal hver ha sin stil (audit B4). | Et søk etter AK Golf-klasser i `team-wang`- og `team-norway`-feilsider gir 0 treff |
| A9 | Ett tokensett og delte byggeklosser | PR #1467 (forslag 1+2), deretter forslag 3–5 i analysen. | #1467 i main; `ak-byggeklosser.css` brukt av neste rettepakke |

### Spor B · Datasikkerhet og GDPR

| # | Punkt | Status | Ferdig når |
|---|---|---|---|
| B1 | Personvernerklæring | Utkast i `docs/gdpr/personvernerklaering-utkast.md` med `[FYLL INN]`-felter og løfter om kode som ikke finnes. Publisert tekst er fra 12. mai. | Jurist har godkjent, feltene er fylt, `/personvern` viser den nye teksten, og hvert løfte i den har kode bak seg |
| B2 | Rettighetene i praksis | Innsyn og eksport finnes (JSON, forelder-eksport, `DataExportRequest`). Sletting finnes (bekreftelsesord, soft-delete, daglig cron). `docs/gdpr/rettigheter-status.md` har åtte merkede gap. | Hvert gap er lukket eller teksten i B1 sier det som faktisk stemmer |
| B3 | Barn og foreldre | Sju dagers forelderfrist, fødselsdato påkrevd, deling sperret til forelder har godkjent (#1211). Gjenstår: eksisterende spillere uten fødselsdato må spørres (§KODEGJENNOMGANGEN punkt 8). | Skjermen som spør om fødselsdato finnes, låst med test |
| B4 | PII i AI-prompter | Navn vaskes i ukeforslag, vinn-tilbake, live-chat og opptak. Gjenstår: fritekst (chatmeldinger, øktnotater, coachnotater, AI-minne) sendes uvasket (§SKJERMENE … RUNDE 8 punkt 3). | Caddies navnedetektor brukes på all fritekst før den går til Anthropic, låst med test |
| B5 | Tilgangsvakt | `check-tilgang-vakt.mjs` grønn med to kjente gjeldsposter: TA-05 (`api/upload`) og TA-07 (`api/parse-date`). | Begge ute av `KJENT_GJELD` |
| B6 | RLS | `scripts/audit-rls.ts` finnes. Ikke kjørt etter nattkjøringene 16.–19.10, som la til nye tabeller (`tn_uttaksrunde`, `wang_trener_invitasjoner`, `wang_timeplan_unntak`, opptak). | Kjørt mot produksjon, 0 funn, resultatet lagt i `docs/sikkerhet/` |
| B7 | Avhengigheter | `npm audit --omit=dev`: 2 høye (`sharp`, `source-map-js`), 4 moderate. | 0 høye; de moderate vurdert og dokumentert |
| B8 | Hemmeligheter og konfig | `.env` gitignored, Stripe-webhook signert, CSP med nonce. Sjekk: Vercel-env for produksjon mot preview, `CRON_SECRET` rotert siste 90 dager. | Sjekkliste i `docs/sikkerhet/` fylt ut med dato |
| B9 | Data Golf-lisens | Bare ADMIN. | Lesespørring viser at hver ADMIN-konto er Anders; `grep /stats/pga src/app/(marketing)` gir 0 |
| B10 | Logging og e-post | Agent-handlinger logges; e-post til ekte personer er sperret til lansering. | Sperren tas bort bevisst, i én PR, dagen før lansering |

### Spor C · Alt i main og komplett rydding

Målt 20.10 kl. 02:

| Hva | Nå | Mål |
|---|---|---|
| Åpne PR-er | 2: #1467 (tokensett, auto-merge, venter CI) og #1083 (utkast fra 02.10, foreldet) | 0 utover dagens arbeid; #1083 lukkes med begrunnelse |
| Lokale grener / eksterne grener | 51 / 114 | Bare `main` og aktive arbeidsgrener; grenene i demoplanen §2 slettes etter Anders' ja (ingen tvangssletting, ingen force-push) |
| Arbeidsmapper (worktrees) | 13 | Bare de som har en aktiv økt |
| Sider som importerer `components/v2` eller TrainLock | 140 | 0 |
| Filer i `src/components/v2` / med TrainLock i navnet | 34 / 33 | 0; funksjonene er flyttet før fila slettes |
| `train-lock-*.css`, `paper`-rester | 2 stilark | 0 (`check-ingen-paper.mjs` utvides til Train-lock) |
| Eldre Precision-port (`precision-a*.css`) | 17 | 0 (spor A4) |
| Ruter merket `legacy` | 50 | 0 |
| Sider som bare er videresending | 270 | Beholdes (én inngang per funksjon, gamle adresser lever), men listes i én fil |
| `TODO`/`FIXME` i `src` | 34 | 0: gjort, eller flyttet til en beslutning |
| Dokumenter under `docs/` | 521, ingen `docs/arkiv/` | Utgåtte planer (alle fra før 13.10 som er erstattet) flyttes til `docs/arkiv/`; `START-HER.md` peker bare på levende dokumenter |

Rekkefølgen for rydding: først flytt (funksjon), så slett (fil), aldri omvendt. Hver slettepakke er høyst 20 filer, og `npm run verify` og lenkesjekk er grønn før PR (minnet: oppryddinger gjorde main rød i et døgn).

### Spor D · Verdensklasse kodekvalitet

Det som finnes: `npm run verify` (prisma validate, tsc, lint, tre vakter, 761 testfiler, bygg), 44 e2e-tester, ingen `any` i `src`, auto-merge bare på grønn CI.

| # | Tiltak | Ferdig når |
|---|---|---|
| D1 | Ett tokensett og fem delte byggeklosser (analysen forslag 1–5) | Ingen skjerm definerer eget kort eller egen knapp; hex-treff i nye stilark under 20 |
| D2 | Brytepunkt-vakt og hjørne-vakt i verify (#1467 har den første) | Vaktene er grønne og nye avvik stopper PR |
| D3 | Ytelsesbudsjett | Hver hovedside under 2 s serverside og Lighthouse over 90 på mobil for `/portal`, `/admin/agencyos`, forsiden og `/booking`; målt i CI |
| D4 | E2E for hovedveiene | Opprett konto → oppstart → book → betal (testmodus) → bekreftelse; coach: innboks → stall → workbench; WANG og TN: innlogging → hjem → én elev. Alle grønne i CI |
| D5 | Død kode | Én kjøring av `knip` (eller tilsvarende) etter spor C; 0 ubrukte eksporter i `src/lib` |
| D6 | Dokumentasjon | `AGENTS.md`, `START-HER.md` og `docs/platform/AGENT-BRIEF.md` stemmer med koden (prosjekt:sjekk grønn); `docs/design-system/skjermregister.*` bygget på nytt i egen PR |

### Spor E · Prosess og det bare Anders kan gjøre

| # | Punkt | Hvem |
|---|---|---|
| E1 | Demo 21.10 etter [demoplanen](demo-lansering-2026-10-21.md) §3 og §5 | Koordinator + Anders |
| E2 | Port 7 på forelder, booking, WANG, TN og markedssidene | Anders |
| E3 | Svar: TN-meny og TN-skrift (§SKRÅ 7–8), `/stats/*`-omfang (A3), fellessiden `/team-wang` (A7) | Anders |
| E4 | Jurist på personvernerklæringen (B1) | Anders |
| E5 | Stripe live: én ekte betaling av hver type, Apple Pay og domene bekreftet i Stripe | Anders |
| E6 | Domeneflytting akgolf.no fra Acuity (nettstedsplanen steg 10), først når E2 og E5 er gjort | Anders |
| E7 | Tillatelsesendringene i `.claude/settings.json` og `beskytt.mjs` (nattmodus, 20.10): behold bevisst i en PR, eller rull tilbake | Anders |

## 3. Rekkefølge (anbefalt)

1. **Før demo 21.10 (i dag):** demoplanen §3 punkt 1–3 er gjort (#1465, #1466). Gjenstår punkt 4 (Stall), 5 (`/wang`), 6 (#1467), 7 (profilkobling), 8 (ADMIN-sjekk), 9 og 10. Ingen nye store PR-er før demoen.
2. **Uke 43 etter demo:** spor B6–B9 (sikkerhetssjekk som ikke rører design), A5 og A4, A6 pakke 1–2, C-rydding av grener og arbeidsmapper (etter ja).
3. **Uke 44:** A1 og A2 (markedssidene), A6 pakke 3–5, A8, B1–B5 med jurist, C-rydding av `v2`/TrainLock (fire slettepakker).
4. **Uke 45:** A3 (`/stats`), D3–D5, E5 røyktest, E2 port 7 på alt.
5. **Lansering:** E6 domeneflytting, B10 e-postsperren av, morgenrapport.

Lansering betyr: alle sider i Precision, Skrå eller WANG-stil og sett av Anders; B1–B9 grønne; 0 i hver «Nå»-rad i spor C unntatt videresendinger; D1–D6 grønne; én ekte betaling røyktestet; akgolf.no svarer fra appen.

## 4. Status fra øktene (20.10 kl. 02:30)

| Økt | Status | Bevis |
|---|---|---|
| Demotrenerne (A2+A3) | **Ferdig, i main** | #1465 merged 00:31 |
| Cockpit og tomme forslag (A1+A4) | **Ferdig, i main**; ryddeskript kjørt i produksjon (3 498 avvist, 148 igjen) | #1466 merged 00:40 |
| Ett tokensett (forslag 1+2) | **PR laget, auto-merge på, venter CI**. Skjermbilder før/etter pikselidentiske, verify grønn lokalt | #1467 |
| Profilside og auto-innlasting (`ak-golf-pipelines`) | **Jobber** (demoplanen §3 punkt 7) | økt `profilside-og-auto-innla` |
| Spillerprofiler komplett fra GolfBox (`ak-golf-pipelines`) | **Idle**, ingen PR registrert | økt `profiler-golfbox` |
| Koordinator «AK Golf HQ orchestration til demo» | Skrev demoplanen (#1464) | #1464 |

Merknad: koordinatoren skriver at Anders natt til 20.10 ba om PR uten auto-merge og ingen innlegging før han har sett over om morgenen. #1465 og #1466 ble lagt inn med auto-merge etter `CLAUDE.md` §Push og merge før den beskjeden nådde denne økta. Begge er små og testet; vil Anders se dem først, kan de rulles tilbake med én revert hver.
