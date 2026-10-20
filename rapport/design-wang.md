# Kontroll av WANG-skjermene mot tegningene

Dato: 05.10.2026 · Kode: main @ 1afdd40e0 (inkl. PR #1181, d85a17dd7) · Fasit: Claude Design «WANG Golf UI prototype» (`6cfa623c`, WANG Golf Skjermoversikt B0 + kildemateriale) og `.claude/rules/beslutninger.md`.
Metode: leste alle komponentfilene i `src/components/wang/` (unntatt gamle `WangRekrutteringView.tsx`), `src/app/team-wang/coach/*`, `skjermer/page.tsx`, `layout.tsx`, `src/styles/wang-app.css`, testene, og tegningens skjermregister + dekningsmatrise. Ingenting kjørt i nettleser; alt under er lest i kildefilene.

## 1. Hovedkonklusjon

PR #1181 er ikke «71 implementerte skjermer». Det er ett skall og seks områdekomponenter som tegner **faste demodata** fra `src/components/wang/wang-data.ts`. Ingen komponent henter fra database, server action eller API (ingen `fetch`, ingen action, ingen Prisma i `src/components/wang/`). Alle knapper endrer bare lokal `useState` og viser kvitteringer som hevder noe som ikke har skjedd.

I tillegg ble de ekte, datakoblede trenerflatene (IUP, testresultater, turneringer per elev, med delingssamtykke) lagt bak `?visArsplan=1` og er ikke lenket fra det nye skallet.

## 2. Tellinger

### Om tallet 71
- «71» = antall oppføringer i `WANG_SKJERMER_KATALOG` (`wang-data.ts:530`) og låst i `tests/komponenter/wang-app.test.ts`. Testen sjekker bare at katalogen har 71 rader, ikke at skjermene finnes.
- Tegningens register (WANG Golf Skjermoversikt, `WG_SKJERMER`) har **78** rader. Katalogen mangler Workbench WANG-51 + 51.01–51.06 (7 rader).
- Av de 78 er 6 ikke trener-/sportssjefskjermer: WANG-28 (egen åpen side), WANG-36, 25, 35 (utenfor WANG, PlayerHQ), og WG-02, WANG-06 (utgår 28.09, erstattet av IUP-fanen i WANG-44). Katalogen har likevel alle seks i de 71 (`wang-data.ts`, `arkiv: true`).
- **Skjermer som skal finnes for Sportssjef/Trener: 72** (78 − 6). I katalogen: 65 av dem (71 − 6) + 7 Workbench-rader som mangler.
- **Skjermer med noen som helst seksjon i koden: 40.** 32 mangler helt (egen komponent finnes ikke).

### Status (72 skjermer)
| Status | Antall |
|---|---|
| GRØNN | 0 |
| GUL | 12 |
| RØD | 60 |

Av de 60 RØDE: 32 mangler helt (7 Workbench, 16 DataGolf-undersider, WANG-17, 18, 22, 41, 48A, 48C, 49, 08; WANG-16 er slått inn i WANG-29), og 28 finnes men er plassholder, feil innhold, oppdiktede tall eller falske handlinger.

Kriterium brukt: GUL = seksjon finnes, struktur og ord stemmer i hovedsak med tegning, ingen falske påstander (kun syntetiske, tydelig lokale data). RØD = mangler, feil innhold, oppdiktede tall, plassholder, eller handling som påstår effekt uten effekt. GRØNN = 0 fordi ingen skjerm er koblet til ekte data (strengt etter oppdragets definisjon er alle 40 fasade).

### Per område (72)
| Område | Skjermer | GUL | RØD (mangler helt) |
|---|---|---|---|
| I dag | 4 | 2 | 2 (0) |
| Trening | 14 | 2 | 12 (9) |
| Tester | 11 | 1 | 10 (5) |
| Konkurranse | 21 | 2 | 19 (16) |
| Meldinger | 4 | 0 | 4 (0) |
| Elever | 9 | 1 | 8 (0) |
| Administrasjon | 6 | 2 | 4 (0) |
| System | 3 | 2 | 1 (1) |

## 3. Tverrgående funn (gjelder alle skjermer)

**T1. Skjermene er ikke koblet til data.** Kilde er `wang-data.ts` (1632 linjer, faste elever, økter, tester, turneringer, kandidater, samtykker). Rutene i `coach/page.tsx:41` henter `hentWangGruppe({ medElevnavn: true })` (ekte elevnavn) og kaster resultatet (`live` brukes bare til `notFound`-sjekk og den gamle `CoachArsplan`). `WangCoachKlient` får ikke `live`.

**T2. De ekte flatene er skjult.** `coach/page.tsx:36-39`: den gamle koblede årsplanen vises bare ved `?visArsplan=1`. Lenkene til `/team-wang/coach/iup/[elevId]`, `/coach/tester` og `/coach/turneringer/[elevId]` ligger bare i `_components/live-seksjoner.tsx:358,381` og `coach/coach-arsplan.tsx:263`, altså i den gamle visningen. Det nye skallet lenker ikke dit. Disse tre har ekte data og samtykkekontroll (`medWangElevData`/`hentWangTestresultatSkolerForTrener`) og ligger nærmere beslutningene enn alt PR #1181 la til.

**T3. Vakten mot demovisninger er omgått.** `src/lib/__tests__/ingen-demovisning-i-ruter.test.ts` forbyr at ekte ruter importerer demovisninger med oppdiktede spillere (bakgrunn: 26.–27.09). Listen `DEMOVISNINGER` ble ikke utvidet med `@/components/wang/WangIdag`, `WangElever`, `WangTester` o.fl., så `coach/WangCoachKlient.tsx:6-13` (importert fra `coach/page.tsx`) passerer vakten selv om den bryter formålet. Samme mønster som `/team-wang/rekruttering` ble redirectet for.

**T4. Rolle kan velges fritt i nettleseren.** `WangAppSkall.tsx:48` `useState<WangRolle>('Trener')` og knappene `:258,:276,:619,:629` lar enhver trener bytte til «Sportssjef» og få Administrasjon. `WangCoachKlient.tsx` og `coach/page.tsx:60-68` sjekker ikke rolle for `omraade=admin`; `?omraade=admin` åpner den uansett. Beslutning (27.09): Administrasjon bare for sportssjef. Sportssjef-rolle finnes ikke som sjekk i `wang-tilgang.ts` (kun `ADMIN`/`COACH` + gruppemedlemskap).

**T5. `/team-wang/skjermer` er åpen uten innlogging.** `src/proxy.ts:193` sperrer bare `/team-wang/coach*`. `skjermer/page.tsx` har ingen `requirePortalUser` og rendrer `WangCoachKlient` (klient-komponent som importerer alle områder og hele `wang-data.ts`, inkl. elevnavn, fravær, IUP-tekster, kandidater, trenernavn) i bundelen til en åpen rute. Innholdet er syntetisk, men det er fortsatt navn i en offentlig JS-bunke og et internt skjermregister på en åpen adresse. Strider mot `coach/page.tsx`-kommentaren fra 15.08 og rettelsen i `rekruttering/page.tsx`.

**T6. Falske kvitteringer.** Handlinger som ikke gjør noe, men melder at de er gjort (mer under per skjerm): «Sendt til kontaktlærer» (`WangIdag.tsx:241`), «Eleven har fått beskjed om omprøve» (`WangTester.tsx:53`), «oppdatert fra AK Golf Pipeline og GolfBox» (`WangKonkurranse.tsx:48`), «Invitasjon sendt til …» (`WangElever.tsx:56`), «Melding … er publisert til …» (`WangMeldinger.tsx:57`), «Laster ned …» via `alert()` (`WangMeldinger.tsx:301`). Ingenting lagres; alt forsvinner ved oppdatering. Stemmer ikke med «Lagring: Lagret/Kunne ikke lagres» i tegningens statusord.

**T7. Oppdiktede tall presentert som målt.** `WangKonkurranse.tsx:452-456` genererer snittscore, fairway, GIR og putter per elev med formler (`71.5 + i * 0.8`, `68 - i * 2`). `WangElever.tsx:548-549` gir alle elever «2.4 %» fravær og «14 dager (Turnering)». `WangElever.tsx:412` «4 turneringer … 72.5 slag». `WangIdag.tsx:372-411` ukesnøkkeltall (91 %, 96 %, 24,5 t, «Garmin Norgescup Finale») er faste. `WangAdmin.tsx:165-182` viser samtykkestatus («Signert digitalt») for navngitte elever, uten kobling til `DelingsSamtykke` eller `beregnDekningsgrad`.

**T8. Tilstander.** Tegningen krever data/tom/laster/feil (CLAUDE.md i designprosjektet, R16). I komponentene finnes ingen laster- eller feiltilstand og én tom-tilstand (`WangMeldinger.tsx:253`). `app/team-wang/error.tsx` dekker bare runtime-feil.

**T9. Deep-lenker og faner virker ikke som de skal.**
- `WangTester.tsx:23` default `valgtFane="fokus"`, men ingen seksjon rendres for «fokus» (`:168,241,349,419`). **`/team-wang/coach?omraade=tester` (og mobilfanen «Tester») viser tittel og fanerad, men tomt innhold.** Testen i `tests/komponenter/wang-app.test.ts:113-119` passerer fordi «WG-03» står i fane-teksten.
- `WangSkjermoversikt.tsx` «Åpne skjerm» sender `fane=` fra katalogens visningsnavn (`"Trenger deg"`, `"Oversikt"`, `"Batteri"`, `"Felles testdag"`, `"DataGolf"`, `"Kilder"`, `wang-data.ts:540,596,776,837,975,1384`), mens komponentene forventer interne id-er (`trenger-deg`, `oversikt`, `WANG-50`, `WANG-47` …). Resultat: ingen seksjon rendres, eller feil seksjon. Skjermer uten `fane` åpner områdets standardfane, ikke skjermen.
- `WangIdag`, `WangTrening`, `WangTester` bruker bare lokal `setFane` og kaller ikke `onFaneEndret` (`WangTrening.tsx:15`, `WangIdag.tsx:25`, `WangTester.tsx:25` har `_onFaneEndret` ubrukt): fane havner ikke i adressen, ikke delbar, ikke bak-knapp-vennlig.
- `WangAppSkall`-prop `faner` (`:45`) brukes aldri; fanene er hardkodet som chips i hver områdefil, ikke som tegningens fanerad/menyvelger («Plan · Økter»-deler mangler).

**T10. Tokens og design.**
- Fonter og palett stemmer med tegningen (Montserrat/Quattrocento Sans, `#17446F`, `#2E857D`, `#49CA9F`, `#D12A5C`) og ikke Precision. Brytepunkt 820 px og bunnmeny (4 + Mer) følger tegningens `WG_MOBIL`.
- Men fargene er satt i en parallell palett: `wang-app.css:9-22` definerer `--wang-blue/-green/-pink …` på `.wang-app`, mens eksisterende `wang-tokens.css` har `--wang-navy/--wang-teal …` (to kilder). Hardkodet hex i komponenter: Elever 155, Konkurranse 162, Admin 119, Meldinger 50, Skjermoversikt 24 (vs. Idag 7, Trening 5, Tester 3, Skall 10). `scripts/check-token-gap.mjs` fikk i samme PR `src/components/wang/` og `src/app/team-wang/` på ALLOW_KATALOGER, så vakten mot hardkodede farger er slått av for hele WANG.
- `wang-app.css` er importert i `team-wang/layout.tsx:5` og klassen `wang-app` er lagt på layout-diven (`:72`), dvs. for **hele** `/team-wang`, også den åpne fellessiden som ikke skulle endres. `.wang-app a { color: var(--wang-pink) }` (`wang-app.css:41-43`) har høyere vekt enn Tailwind-klasser og kan endre lenkefarger på fellessiden; `.wang-app` setter også bakgrunn og `min-height`. `src/app/team-wang/page.tsx` er uendret (bekreftet med diff), men layoutendringen kan påvirke den. Må sjekkes visuelt.
- Skallet bruker en grønn «W»-firkant og tekst (`WangAppSkall.tsx:93`) i stedet for WANG-logoen (finnes: `public/team-wang/wang-logo-horizontal.svg`, tegningen bruker `wang-toppidrett-horisontal-hvit.png`).
- Skallet har fast tekst «Anders Kristiansen» og initialer «AK» (`WangAppSkall.tsx:223`) for hvem som helst som logger inn, og `/auth/logout` (`:333`) finnes ikke som rute (`src/app/auth/logout` mangler).

**T11. Rolleregler for elev/foresatt.** OK. `requirePortalUser({allow:["ADMIN","COACH"]})` (`coach/page.tsx:30`) sender PARENT til `/forelder` og PLAYER til `/portal` (`requirePortalUser.ts`: roller utenfor `allow`). COACH uten WANG-gruppe og ADMIN går via `hentWangCoachGruppeId` (`notFound`). Elev/foresatt-skjermene (WANG-28 åpen, 36, 25, 35) er korrekt ikke egne ruter. Avvik: `logg-inn/page.tsx:15` beskriver innlogging «for elever og foreldre» (strider mot beslutning 27.09: bare trener/sportssjef i `/team-wang`).

**T12. Språk (CLAUDE.md i designprosjektet + masteren).** Funn: «Loggfør samtale» (`WangElever.tsx:363`; skal være Registrer), «drill» (`wang-data.ts:178,210`; skal være Øvelse), desimalpunktum i visning («1.48», «+2.5°», «72.5 slag», «2.4%», `WangIdag.tsx`, `WangElever.tsx`; skal være komma og mellomrom før %), «Etterlevelse (4 uker)» ok, «Elev» i skolesammenheng ok. Skjerm-ID-er vises i faneetiketter («Oversikt (WANG-42)» o.l.; tegningen viser ID bare som liten overskriftslinje).

## 4. Skjerm for skjerm

Rute = tegningens `sti`. Kodefil er områdekomponenten (felles `WangAppSkall.tsx`, adressen i koden er `/team-wang/coach?omraade=<område>&fane=<id>`, ingen av tegningens egne ruter finnes som `page.tsx`, bortsett fra WANG-24, WANG-00 og `/team-wang/coach`). Innsats: S = under en dag, M = noen dager, L = uke eller mer (inkl. datamodell/server).

### I dag (`WangIdag.tsx`)
| ID | Rute | Kodefil | Status | Avvik | Innsats |
|---|---|---|---|---|---|
| WANG-43 Elever som trenger deg | /team-wang/i-dag | WangIdag.tsx:184-263 | RØD | Faste elever; «Ta oppfølging» viser «Sendt til kontaktlærer» uten å sende (:241); «Løst» fjerner bare lokalt (:251). Ingen delingssamtykke-filter (tegning: trukket deling → eleven forsvinner). Tegningens fire statuser/ årsaker mangler. | L |
| WANG-30 Kalender og uke | /team-wang?fane=kalender | WangIdag.tsx:266-346 | GUL | Bare liste «Morgentreninger», ikke kalender/uke. Faste datoer («Uke 40 · 28.09–02.10», :40). «Se økt» viser bare melding (:340). Fane i URL virker ikke (T9). | M |
| WG-01 Morgentrening og uke | /team-wang | WangIdag.tsx:113-180 | GUL | «Dagens fokus» er fast tekst med «Anders Kristiansen», 112 mph, «1.48», «+2.5°» (:134-158): ikke fra planen, desimalpunktum. | M |
| WANG-12 Ukessammendrag | /team-wang/coach/ukessammendrag | WangIdag.tsx:350-415 | RØD | Fire faste nøkkeltall; ingen kladd/publisert/tidligere uker. Modell `Ukesrapport` finnes ikke. | L |

### Trening (`WangTrening.tsx`)
| ID | Rute | Kodefil | Status | Avvik | Innsats |
|---|---|---|---|---|---|
| WANG-42 Treningsoversikt | /team-wang/trening | WangTrening.tsx:122-240 | GUL | Etterlevelse = tid mot plan siste 4 uker er riktig regel. Men faste elever; trinnfilter har hardkodede antall «VG1 (4)» osv. (:101-117); ingen fire-ukers vindu fra ekte økter. | M |
| WANG-29 Årsplan og periode | /team-wang?fane=trening | WangTrening.tsx:243-328 | RØD | Oppdiktet periodisering: «Spesialperiode uke 36–43», «Turneringsavslutning», «Vinteroppkjøring» (:258-321). Fasiten `arsplan-fasit-2026-27.ts` har TURN til uke 42, GRUNN fra uke 44, 44 uker totalt. Ordet Spesialperiode er riktig, ukene er feil. | M |
| WANG-16 Periodeplan | /team-wang/plan/periode | (slått inn i WANG-29, samme blokk) | RØD | Ikke egen skjerm; ingen «ny periode»-skjema. `Periode`-modell venter. | L |
| WANG-17 Månedsplan | /team-wang/plan/maned | — | RØD | Mangler. | L |
| WANG-51 Workbench | /team-wang/trening/workbench | — | RØD | Mangler (ikke i katalog heller). | L |
| WANG-51.01–.06 (økt og serie, treukerssyklus, kopier, forslag, spillerens beslutning, tilgang) | /team-wang/trening/workbench/… | — | RØD | Alle 6 mangler. | L (samlet) |
| WANG-18 Kalender og økt | /team-wang?fane=kalender&okt=[id] | — | RØD | Mangler (kun «Se økt»-melding i WangIdag). | M |
| WANG-04 Morgenøkter | /team-wang/morgenokter | WangTrening.tsx:331-395 | GUL | Fast liste. Tidspunkt-inkonsistens: «Tirsdag og torsdag» i WangIdag.tsx:276 vs. Tir/Ons/Fre i WangAdmin.tsx:196-225. | S |
| WANG-38 Oppmøte | /team-wang/coach/oppmote | WangTrening.tsx:122 (samme seksjon som WANG-42) | RØD | Fanen «Oppmøte» viser samme tabell som Oversikt; ingen oppmøteføring per økt. | M |

### Tester (`WangTester.tsx`)
| ID | Rute | Kodefil | Status | Avvik | Innsats |
|---|---|---|---|---|---|
| WG-03 Fysiske tester | /team-wang/tester | WangTester.tsx:168-238 + wang-data.ts:423 | RØD | Testene er trapbar, knebøy, benkpress, medisinball, CMJ. Beslutning 28.09 / register X15: CMJ og knebøy innføres ikke; batteriet er benkpress, markløft trapbar, lengdehopp, rotasjonskast, Club Speed. Hardkodede «nasjonalt snitt/topp». Default-fane «fokus» gir tomt innhold (T9, `:23`). | M |
| WANG-48 Testbatteri | /team-wang/tester/batteri | — (nærmeste: WangTester.tsx:349) | RØD | NGF/Team Norway-batteriet (TN v3, 38/5 tester, Wedge Gate treff/bom, 8-ball, PEI) finnes ikke. Poengskala skal vises «—» til arket er lagt inn; her er ingen skala. | L |
| WANG-48A Testoppsett | /team-wang/tester/[test] | — | RØD | Mangler. | L |
| WANG-48B Scorekort | /team-wang/tester/[test]/[spiller] | WangTester.tsx:349-415 | RØD | Ett tekstfelt «Målt resultat» (`:395`), ikke forsøk-for-forsøk. Registrert som «Kontrollert» umiddelbart (`:69`), ingen «Egenført»/«Kontrollert»-skille, ingen lagring (T6), fast dato «04.10.2026» og «Anders Kristiansen» (`:71-72`), desimalpunkt i eksempel. | L |
| WANG-48C Testhistorikk | /team-wang/tester/historikk/[spiller] | — | RØD | Mangler. | M |
| WANG-49 Felles testdag | /team-wang/tester/testdag/[id] | — | RØD | Mangler. | L |
| WANG-08 Testdag | /team-wang/coach/test/[id] | — | RØD | Mangler. | L |
| WANG-37 Testkø | /team-wang/coach/tester | WangTester.tsx:241-346 | RØD | Falske handlinger: «flyttet til elevens offisielle historikk» (`:44`), «Eleven har fått beskjed om omprøve» (`:53`). Den ekte, datakoblede `coach/tester/page.tsx` finnes og er ikke lenket. | M (koble til ekte side) |
| WANG-22 Testprotokoller | /team-wang/protokoll | — | RØD | Mangler (`Protokoll`/`ProtokollVersjon` finnes ikke). | L |
| WANG-23 Resultater per elev | /team-wang/elev/[id]/tester | WangElever.tsx:337 (underfane Tester) | GUL | Delvis via WANG-44 Tester: viser de 5 fysiske testene, ingen kildelinje/«Egenført/Kontrollert», bruker bare `WANG_TEST_RESULTATER`. | M |
| WANG-39 Rangering | /team-wang/coach/rangering | WangTester.tsx:419-470 | RØD | Tittel «Toppliste Trapbar Markløft (relativ styrke x KV)» (`:434`), men sorterer på golf-snittscore **synkende** (`:440`, dårligst først) og viser HCP. Feil innhold og feil rekkefølge. | M |

### Konkurranse (`WangKonkurranse.tsx`)
Tegningens menyer: WANG-10 Turneringer, WANG-11 Turneringsdetalj, WANG-09 Samlinger og uttak, WANG-27 Golfstatistikk, WANG-50 DataGolf. Koden har skrevet seg om til andre navn: «Rapportering (WANG-11)», «Analyse (WANG-09)», «Samlinger og leir (WANG-27)» (`:63-67`). Dvs. innholdet i WANG-09 og WANG-27 er byttet om og ikke det tegningen viser.

| ID | Rute | Kodefil | Status | Avvik | Innsats |
|---|---|---|---|---|---|
| WANG-10 Turneringer | /team-wang/turneringer | WangKonkurranse.tsx:99-226 | GUL | Fast kalender. «Hent resultater» later som synk mot Pipeline/GolfBox (`:46-48,113`): pipelines er eneste kilde (beslutning 26.09), ikke en knapp i UI. Ekte side `coach/turneringer/[elevId]` finnes (`hentTurneringshistorikk`) og er ikke lenket. | M |
| WANG-11 Turneringsdetalj | /team-wang/turnering/[id] | WangKonkurranse.tsx:229-398 | GUL | Resultatliste + skjema «Registrer rundeoppfølging» (rapport lagres ikke, `:52-55`). Fairway/GIR/putter-felt ikke i tegning. Brutto er riktig. | M |
| WANG-09 Samlinger og uttak | /team-wang/samlinger | WangKonkurranse.tsx:402-461 (viser «Turneringsanalyse») | RØD | Feil innhold. Tallene er formelgenerert (T7, `:452-456`). Samling/uttak (`Samling`, `Uttak`) finnes ikke. | L |
| WANG-27 Golfstatistikk | /team-wang/statistikk | WangKonkurranse.tsx:465-518 (viser «Samlinger og leir») | RØD | Feil innhold. Samlingene er fast tekst som motsier fasiten: «Vinterleir Marbella 18.–26. feb. 2027» mot Alicante 16.–30.01 i `arsplan-fasit-2026-27.ts:106`; «12 elever påmeldt» (:491) uten kobling til ekte påmelding. | M |
| WANG-50 DataGolf | /team-wang/konkurranse/datagolf | WangKonkurranse.tsx:521-560 | RØD | Én overskrift og to setninger («mot NCAA Division 1 & DP World Tour», `:534`); ingen tall. Beslutning: DataGolf vises aldri for andre enn Anders; tegningen viser det for Sportssjef/Trener. Konflikten må avgjøres av Anders før bygging. | L |
| WANG-50.02–50.17 (16 undersider: katalog, profil, topplister, sammenligning, innspill, historikk, turneringskalender, turneringsanalyse, live, modellanalyse, bane og felt, trend, datautforsker, kilde og dekning, fra analyse til tiltak, spesialistdata) | /team-wang/konkurranse/datagolf/* | — | RØD | Alle 16 mangler. | L (samlet) |

### Meldinger (`WangMeldinger.tsx`)
| ID | Rute | Kodefil | Status | Avvik | Innsats |
|---|---|---|---|---|---|
| WANG-13 Gruppeposter | /team-wang/gruppe/poster | :106-250 | RØD | «Publisert»-kvittering uten sending (`:57`); ingen lesekvittering (viser fast «6/7 lest»); avsender fast «Anders Kristiansen / Sportssjef» (`:42`). Kommunikasjon skal godkjennes av Anders før sending: her er det fasade, men UI-et påstår publisering. `GruppePost`/`Vedlegg` finnes ikke. | L |
| WANG-14 Post til elev | /team-wang/post | samme | RØD | Samme som WANG-13; sperret/innboks-tilstander fra tegning mangler. | L |
| WANG-15 Foreldremøte | /team-wang/foreldremote | samme | RØD | Bare en melding til foresatte; ingen invitasjon/påmelding/referat (D6). | L |
| WANG-21 Dokumenter | /team-wang/dokumenter | :260-310 | RØD | Fem hardkodede filnavn; «Last ned» er `alert()` (`:301`). Ingen opplasting, ingen `Dokument`-modell. | M |

### Elever (`WangElever.tsx`)
| ID | Rute | Kodefil | Status | Avvik | Innsats |
|---|---|---|---|---|---|
| WANG-07 Elever | /team-wang/elever | :109-203 | GUL | Liste/søk/filter OK strukturelt. Faste elever; ingen delingsstatus (seks statuser i tegningen); ikke filtrert på samtykke. | M |
| WANG-44 Elevprofil | /team-wang/elev/[id]?fane=… | :207-418 | RØD | IUP-fane med faste tekster og «Godkjent av sportssjef og elev» (`:307`, fabrikert godkjenning); Plan og Turneringer er ett avsnitt (`:318, :412`: «72.5 slag»); «Lagre samtale» lagrer ikke (`:65`). Omgår delingssamtykke (`medWangElevData` brukes ikke). IUP skal hentes fra PlayerHQ (beslutning 28.09). Den ekte `coach/iup/[elevId]` finnes. | L |
| WANG-45 Fireukerssjekk | /team-wang/fireukerssjekk | :422-458 | RØD | Tabell over etterlevelse med fast terskel 85 % (`:448-450`), ikke utviklingssjekk (Ung 34 / Junior 43 spørsmål, prosessmål, målsetninger, sesongevaluering). Gjelder bare WANG-/TN-spillere. | L |
| WANG-46 Forslag til elev | /team-wang/forslag | :462-478 | RØD | Plassholder: én setning, ingen skjema, ingen statuser (Venter/Godtatt/Avvist), ingen spillerbeslutning. | L |
| WANG-47 Skjema og kildeversjoner | /team-wang/kilder | :483-502 | RØD | «Versjon 2.4», «Versjon 3.1», «DataGolf API v1.2 Live» er oppdiktet (`:495-497`). | M |
| WG-05 Trenerflate | /team-wang/coach | :506-523 | RØD | Plassholder: én setning. Ruten `/team-wang/coach` er i stedet selve skallet. | M |
| WANG-05 Skole og fravær | /team-wang/skole-fravaer | :527-556 | RØD | Alle elever: «2.4 %» og «14 dager (Turnering)» (`:548-549`), oppdiktet. Fraværsdata om mindreårige er skolens, ikke trenerens (`wang-toppidrett.md`). | L |
| WG-04 Prøveplan | /team-wang/proveplan | :559-586 | RØD | Plassholder med én fast prøve («12. oktober Matematikk 1T», `:575`). Krever `SchoolScheduleEntry`-utvidelse. | L |
| WANG-20 Inviter elev | /team-wang/tilgang/inviter | :590-650 | RØD | «Invitasjon sendt» uten sending (`:56`). Mangler domenesjekk (@wang.no) og sju-dagers invitasjon (beslutning 28.09). | L |

### Administrasjon (`WangAdmin.tsx`)
| ID | Rute | Kodefil | Status | Avvik | Innsats |
|---|---|---|---|---|---|
| WANG-19 Trenere og roller | /team-wang/tilgang/trenere | :106-141 | GUL | Fast liste med fem navngitte trenere (`:124-130`, personnavn i kode) og bare rolle Sportssjef/Trener, riktig sett. Ingen redigering; ikke fra `GroupMember.role`. | M |
| WANG-34 Samtykkeoversikt | /team-wang/admin/samtykke | :145-190 | RØD | Seks navngitte elever med oppdiktet samtykke («Signert digitalt», `:165-182`); tegningens seks statuser (Aktiv, Begrenset, Venter på forelder, Ikke delt, Trukket, Ingen tilgang) mangler. `beregnDekningsgrad` er ikke koblet. Svært misvisende i en personvernskjerm. | L |
| WANG-26 Timeplanføring | /team-wang/skole/timeplan | :193-226 | RØD | Tre faste kort; ingen ukemal/ny time/unntak. | L |
| WANG-31 Rekruttering | /team-wang/rekruttering | :230-350 | RØD | Kandidater kun i minnet (`:21`): «Legg til» og statusendring tapes ved oppdatering; vurderingspunkter og felles ark mangler (tegning WANG-31). Gammel `/team-wang/rekruttering` er redirect til coach. | L |
| WANG-32 Plasser | /team-wang/plasser | :354-385 | RØD | Faste kapasiteter «18 / 20», «24 / 24», «14 / 16» (`:367-380`), oppdiktet. `Skole`/`Plass` finnes ikke. | L |
| WANG-33 Koordinering mellom skoler | /team-wang/rekruttering/koordinering | :388-426 | GUL | Personvernregel (kun kontaktlogg, ikke innhold) er korrekt gjengitt; tre faste loggrader. Mangler stjernemerking per skole og ekte `KoordineringsTråd`. | L |

### System
| ID | Rute | Kodefil | Status | Avvik | Innsats |
|---|---|---|---|---|---|
| WANG-24 Logg inn | /team-wang/logg-inn | src/app/team-wang/logg-inn/* | GUL | Ekte Supabase-innlogging, fasit c7 oppgitt i kommentar. Metadata sier «elever og foreldre» (`page.tsx:15`) mot beslutning om trener/sportssjef. | S |
| WANG-00 Skjermoversikt | /team-wang/skjermer | WangSkjermoversikt.tsx, skjermer/page.tsx | GUL | Åpen uten innlogging (T5). «Åpne skjerm» sender feil `fane` (T9). Mangler tegningens avsnitt «Uavklart». Katalogen inkluderer utgående og PlayerHQ-skjermer. | S |
| WANG-41 Gjennomgang | /team-wang/gjennomgang | — | RØD | Mangler. | M |

### Utenfor trener/sportssjef (6 i katalogen, ikke talt over)
WANG-28 (åpen fellesside: `src/app/team-wang/page.tsx` uendret, bekreftet), WANG-36, 25, 35 (PlayerHQ, ingen rute i `/team-wang`, riktig), WG-02 og WANG-06 (utgår, finnes ikke som ruter; den ekte IUP-ruten er `coach/iup/[elevId]` og skal bli fanen IUP i WANG-44). Katalogen i `wang-data.ts` fører likevel alle seks som «skjermer» og teller dem i de 71.

## 5. Rolle og meny mot beslutningene
- Seks hovedpunkter I dag · Trening · Tester · Konkurranse · Meldinger · Elever + Administrasjon: riktig (`WangAppSkall.tsx:52-62`). Mobil 4 + Mer: riktig. Men Administrasjon vises ut fra en klientvelger (T4).
- Rollenavn Sportssjef/Trener: riktig. Ingen Assist Coach/Admin/Foresatt/Rektor i menyen: riktig.
- Ordet «Spesialperiode»: brukt riktig i `WangTrening.tsx:258,284`; ingen «Spesialisering». Kategori A–K brukes ikke noe sted (ingen E–A+ heller); IUP/testbatteri/kategorier er ikke bygget.
- Delingssamtykke (28.09): ingen av skjermene sjekker det; bare de ikke-lenkede ekte rutene gjør det.

## 6. Anbefalt rekkefølge
1. **Stopp skade først (S):** legg `requirePortalUser`/rolle på `/team-wang/skjermer`; fjern klientvalgt rolle i skallet og gate `omraade=admin` på sportssjef server-side; fjern «W»-/Anders-hardkoding. Utvid `ingen-demovisning-i-ruter.test.ts` med de nye `Wang*`-modulene, og ta `src/components/wang/` og `src/app/team-wang/` ut av ALLOW_KATALOGER i `check-token-gap.mjs`.
2. **Gjør løgner umulige (S–M):** fjern/skjul alle falske kvitteringer og oppdiktede tall (T6, T7), merk resten tydelig som demo, eller skjul de 28 fasade-skjermene til de er koblet. Rett WangTester default-fane og katalog-lenkene (T9).
3. **Koble de ekte flatene inn i skallet (M):** IUP (`coach/iup/[elevId]`) som fane i WANG-44, testresultater (`coach/tester`) som WANG-37/23, turneringer (`coach/turneringer/[elevId]`) som WANG-10/11. Dette gir tre GUL→GRØNN uten ny datamodell.
4. **Personvern (L, haster):** samtykkeoversikt WANG-34 mot `DelingsSamtykke`/`beregnDekningsgrad`, delingsstatus i WANG-07/44 (beslutning 28.09 punkt 1, 4).
5. **Testbatteriet (L):** ett batteri (WANG-48/48A/48B/48C/49/08/22/23/37/39), riktige fysiske tester, poengskala «—» til arket er lagt inn. Venter delvis på Team Norways ark.
6. **Plan (L):** Periode/Måned/Workbench (WANG-16/17/18/51*) mot `arsplan-fasit-2026-27.ts`; Workbench krever datamodell (`MonthPlan` m.fl., additivt via `db execute`).
7. **Meldinger, foreldremøte, dokumenter, invitasjon (L):** krever nye modeller; invitasjon med domenesjekk og godkjenning før sending.
8. **DataGolf (16+1 skjermer) sist og først etter Anders' beslutning** om DataGolf kan vises for andre enn ham.
9. Fireukerssjekk/utviklingssjekk (WANG-45/46/47) når datamodell for utviklingssjekk finnes (beslutning 28.09 punkt 5).

## 7. Tillegg: vurderinger jeg ikke kunne gjøre
- Ingen visuell sammenligning i 390/1280 (kun kodelesing). Påvirkning av `wang-app.css` på åpen fellesside er en risiko fra kode, ikke observert.
- Tegningenes enkeltskjermer (B2–B21) er bare lest via skjermregisteret og dekningsmatrisene; detaljstruktur per skjerm er avledet fra disse og fra skjermnavn/ruter.
