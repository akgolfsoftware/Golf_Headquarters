# Kodegjennomgang AK Golf HQ — 06.10.2026

**Grunnlag:** `main` på commit `9f39c7d44` (06.10.2026) · **Fase:** 1 av 3 (bare lesing, ingen kode er endret) · **Gren:** `review/kodegjennomgang`

Dette dokumentet beskriver hva som er galt eller uryddig i koden i dag, hvor alvorlig det er, og i hvilken pull request (PR, altså en samlet endring som Anders godkjenner før den legges inn i hovedversjonen) det skal rettes i fase 2. Ingenting her er rettet ennå.

**Slik leser du et funn.** Hvert funn har en kode (f.eks. `TO-01`), alvorlighet, fil og linje, hva som er galt, hva som kan skje, forslag til retting, hvilken PR-gruppe det hører til, og status. Bokstavene i koden viser området:

| Kode | Område |
|---|---|
| TO · TA · TP | Personvern og tilgang: organisasjoner og Data Golf (TO), API-ruter og innlogging (TA), handlinger i PlayerHQ og forelder (TP) |
| DI | Dataintegritet: data som kan gå tapt eller vises feil |
| RF | Riktighet og feil, inkludert de 30 motsigelsene fra Workbench-beskrivelsen |
| RY | Rydding: død kode, dubletter, avhengigheter |
| ST | Struktur før nytt design |
| SP | Språk mot master-ordboken |
| DO | Dokumenter |

**Alvorlighet.** *Kritisk:* persondata når feil person eller organisasjon, eller en bruker kan endre andres data. *Høy:* feil tall som brukes til beslutninger, krasj i en hovedvei, eller brudd på en bindende personvernbeslutning. *Middels:* feil i en sidevei, manglende feilhåndtering, motsigelser som skaper forvirring. *Lav:* rydding og navn.

**Ord som går igjen.** *Server action:* en funksjon i appen som nettleseren kan kalle direkte, med hvilke som helst verdier. Derfor må hver av dem selv sjekke hvem som spør. *API-rute:* en adresse appen svarer på med data i stedet for en side. *Eiersjekk:* kontroll av at dataene tilhører den som spør. *ID-bytte (IDOR):* å se eller endre andres data ved å bytte ut en ID i forespørselen. *Org-gruppe:* en gruppe som tilhører WANG eller Team Norway, ikke AK Golf. *Reserve:* kode som viser «—» eller en tom tilstand i stedet for å krasje når noe mangler.

**Begrensninger.** Gjennomgangen er gjort ved å lese koden. Databasen i produksjon er ikke åpnet, og innstillingene i Supabase og Vercel er ikke sett. Funn som avhenger av dem, er merket «Usikker». Beslutningene D-01–D-46 ligger i Claude Design og ikke i repoet. D-04, D-13 og D-19 er brukt slik de står i bestillingen. Master-ordboken og Workbench-beskrivelsen er lest fra grenene `docs/ordbok-master` og `docs/workbench-beskrivelse`, fordi de ikke er lagt inn i `main` ennå.

---

## Sammendrag

### Antall funn

| Alvorlighet | Antall |
|---|---|
| Kritisk | 4 |
| Høy | 35 |
| Middels | 77 |
| Lav | 63 |
| **Sum** | **179** |

Seks funn som ble meldt fra flere områder, er slått sammen og telles én gang (se «Samme funn fra flere områder» under). Fordelingen per område: tilgang 73, dataintegritet 26, riktighet 18, rydding 24, struktur 11, språk 14, dokumenter 13.

### De fem viktigste funnene

1. **WANG- og Team Norway-trenere kan endre elevenes plan uten samtykke** (TO-01, TO-02 · Kritisk). En trener som er lagt inn i skolegruppa, får samme skriverett i AgencyOS som coachens egen stall. Treneren kan lage, flytte og publisere økter, rulle ut perioder i alle elevenes planer og starte lydopptak. Ingen elev har delt noe, og ingen åpen PR retter det. Det bryter D-04: organisasjonene skal bare se det spilleren har delt, og bare kunne foreslå.
2. **Coacher kan se og slette video av alle spillere** (TP-01 · Kritisk). Opplasting, avspilling og sletting av coachvideo sjekker bare at brukeren er coach, ikke at spilleren hører til coachen. Det gjelder også eksterne trenere med coach-rolle.
3. **En spiller kan skrive over andres AI-samtale** (TA-01 · Kritisk). AI-chatten lagrer samtalen på den tråd-ID-en nettleseren sender, uten å sjekke eier. Hele historikken i en annens tråd kan erstattes. ID-ene er vanskelige å gjette, så risikoen er lav i praksis, men det er en ren eiersjekk som mangler.
4. **Spillere under 16 slipper gjennom uten forelder** (TA-03, TA-04, TP-02 · Høy). Fødselsdato samles bare i et oppstartssteg som kan hoppes over. Uten fødselsdato regnes spilleren som voksen. Spilleren kan selv skrive om fødselsdatoen, og coachen kan registrere lydsamtykke for et barn som «gitt av spilleren selv». Opptaket sendes videre til tredjeparter for teksting og analyse.
5. **Data Golf er åpent for alle** (TO-07, TA-06, TO-08 · Høy). D-19 sier at Data Golf bare er for analytiker (Anders). I dag når Data Golf-flaten alle spillere, også gratisprofiler, og alle coacher. Et åpent søk viser Data Golf-tall uten innlogging, og `/stats/pga` er offentlig. Rollen «analytiker» finnes ikke i koden.

Rett etter disse kommer to feil som gir **feil eller tapte data**. Sesongen regnes som kalenderår, så en WANG-årsplan for aug–jun blir usynlig fra nyttår (DI-01). Når et scorekort redigeres, slettes slag uten advarsel (DI-04). I tillegg viser tre flater **oppdiktede tall som om de var ekte**: TrackMan (DI-02), Årgang-statistikken (DI-03) og live-økta (RF-10).

### De to kjente hullene fra bestillingen

| Hull | Bekreftet | PR i dag | Hva som gjenstår |
|---|---|---|---|
| `src/lib/auth/coached.ts:96-102` gir trenermedlemmer skrivetilgang | Ja, lest og kontrollert i koden. Testen `src/lib/__tests__/auth/coached.test.ts:78` låser dagens (feil) oppførsel og må skrives om | Ingen. #1190 endrer ikke fila og bygger samme regel inn i nye sjekker (TO-12) | Alt (TO-01, TO-02) |
| Automatisk deling av WANG-tester med Team Norway (D-13) | Ja | #1192 (åpen, kan legges inn, ikke lagt inn) retter hovedveien | Testdag-velgeren viser fortsatt alle WANG-elever til TN, og TN kan føre resultater for dem uten samtykke (TO-03) |

### Plan for PR-ene i fase 2 (i rekkefølge)

Alle PR-ene i gruppe 1 endrer tilgangsregler. Etter oppdraget stopper jeg og spør før hver av dem. Det samme gjelder PR-er som rører betaling og økonomi (merket «spør først»).

| # | PR | Funn | Merknad |
|---|---|---|---|
| 1a | Org-trenere får bare lese det som er delt, og skriver bare via forslag | TO-01, TO-02, TO-12, TO-13, TO-15, TO-04 | Spør først. Største og viktigste. Bygges oppå #1190 når den er lagt inn |
| 1b | AI-chat: tråden må tilhøre brukeren | TA-01 | Liten |
| 1c | Coachvideo: bare egne spillere | TP-01, RF-13 | Liten |
| 1d | Talenotat og slag: eiersjekk og ingen falsk «lagret» | TP-06/RF-02, RF-03, TP-05 | Liten |
| 1e | Under 16: fødselsdato kreves, kan ikke skrives om, lydsamtykke bare fra forelder | TA-03, TP-02, TA-04/TP-03/TO-06, TO-14, TA-21 | Spør først (påvirker innlogging) |
| 1f | Team Norway testdag: bare WANG-elever med samtykke | TO-03 | Etter at #1192 er lagt inn |
| 1g | Småhull i actions og API-ruter | TA-05, TA-07, TP-08, TP-10, TP-13, TP-14–TP-21, TP-26–TP-38 | Deles i 3–4 små PR-er per område |
| 1h | Vaktskriptet sjekker også API-ruter, og «bare innlogget» godtas ikke som tilgangssjekk | TA-12 | Hindrer at nye hull kommer inn |
| 1i | Innlogging via Google kobler ikke over eksisterende kontoer | TA-02 | Spør først. Krever sjekk i Supabase |
| 2 | Data Golf-sperre: én port `kanSeDataGolf`, bare analytiker | TO-07, TO-09, TA-06 | `/stats/pga` venter på din avgjørelse (TO-08) |
| 3a | Sesong følger årsplanens datoer, ikke kalenderåret | DI-01, DI-18, DI-21, RF-14 | |
| 3b | Ingen demotall i produksjonsveien | DI-02, DI-03, RF-10 | |
| 3c | Scorekort-redigering sletter ikke slag stille | DI-04, DI-26 | |
| 3d | «—» i stedet for 0 der målingen mangler | DI-05–DI-08, DI-23–DI-25, SP-09 | DI-08 rører økonomivisning: spør først |
| 3e | Dato og tid: én uke-hjelper, ingen UTC-dato som «i dag» | DI-15–DI-17, DI-19, RY-10 | Uke 53 regnes riktig i dag, se DI-18 |
| 3f | Stille feil: «lagret» bare når noe faktisk ble lagret | TP-11, TP-12, RF-12 | |
| 3g | Netto gjenkjennes med hviteliste, ikke «ender på N» | DI-10 | |
| 3h | Puttavstand runder ikke 15 og 40 fot til feil SG-bøtte | DI-22 | |
| 4 | Tester for innlogging, deling, publisering, forslag og runde | se §7 | Én PR per flyt |
| 5 | Død kode, delt per område (P5a–P5v, maks 20 filer per PR) | RY-01–RY-08, RY-13, RY-14, RY-17–RY-19, RY-24, ST-03, ST-10, TO-10 | Krever at du bekrefter RY-02 |
| 6 | Avhengigheter: fjern ubrukte, legg til manglende, `npm audit fix` | RY-20–RY-23 | Stripe-oppgradering (22→23) holdes utenfor: spør først |
| 7 | Forslag til skjemaendringer, merket «Krever godkjenning» og ikke kjørt | RF-04–RF-08, SP-02–SP-04 | Prod-basen mangler tabeller og kolonner som koden allerede bruker |
| 8 | Forberedelse for designsystemet: mappe, tokens som CSS-variabler, tom plass | ST-01, ST-02, ST-04–ST-07, ST-09, ST-11 | Utseendet endres ikke |
| 9 | Slett utgåtte dokumenter, én PR per mappe (P9a–P9j), og `docs/README.md` | DO-01–DO-13 | P9b venter på avgjørelsen om Workbench-designet (M1) |

Betaling og økonomi som **ikke** rettes uten at du sier ja: TP-09 (kontosletting stopper ikke Stripe-abonnementet), TP-26 (avbestilling kan treffe feil abonnement), DI-09 (faktura deler beløpet 80/20 i netto og mva uten å lese det fra betalingen) og RY-15 (Tripletex-klienten bygger på antatte endepunkter).

### Samme funn fra flere områder

| Telles som | Også meldt som |
|---|---|
| TO-01 | RF-01, TP-04 |
| TP-06 | RF-02 (meldt som Kritisk; satt til Høy fordi koden bare legger til tekst, og økt-ID-en må være kjent) |
| TP-07 (satt til Middels: fila har ingen kallere, og #1190 legger på tilgangssjekk) | DI-14 |
| TA-04 | TP-03, TO-06 |

TA-03 og TP-02 handler begge om fødselsdato, men beskriver to ulike hull og telles hver for seg.

---


## 1. Personvern og tilgang

Tre deler: organisasjoner, Data Golf og logger (TO) · API-ruter og innlogging (TA) · handlinger i PlayerHQ, forelder og innsyn (TP).


## 1a. Organisasjoner, AgencyOS, Data Golf, logger og hemmeligheter (TO)

Grunnlag: `main` 9f39c7d44 (06.10.2026). Bare lesing. Åpne PR-er lest: #1190, #1192, #1193.

### Oppsummering
- Funn: 2 Kritisk, 6 Høy, 5 Middels, 4 Lav (17 totalt).
- Dekket: coached.ts og alle skrivende kallere i workbench/admin, WANG/TN-tilgangslagene, PR #1192/#1190/#1193, under-16-regler for deling og opptak, Data Golf-kartlegging, logger, hemmeligheter.
- IKKE dekket: full gjennomgang av alle ca. 380 kallsteder av coach-portene enkeltvis (stikkprøver og alle workbench-filer er lest); RLS-regler i databasen; faktiske data i produksjon (hvem som i dag er trenermedlem i WANG/TN-gruppene); `/api/*`-ruter utenfor recording.
- Hemmeligheter: ingen ekte nøkler funnet i sporede filer (se TO-17). Logger: ingen klare lekkasjer (se TO-16).
- Viktigste mønster: appen har to tilgangssystemer. Det nye (DelingsSamtykke, `medNavngittProfil`, `eksternLeserSpillerIder`) er riktig bygd. Det gamle (gruppemedlemskap i `coached.ts`) går rett forbi det.

---

#### TO-01 · WANG-/TN-trener som gruppemedlem får full coach-tilgang til alle elever uten samtykke
- Alvorlighet: Kritisk
- Fil: `src/lib/auth/coached.ts:96-102` (tredje OR-gren), `src/lib/domain/grupper.ts:104` (`aktivtTrenerMedlemskapWhere` = COACH eller ASSISTANT), `src/app/admin/grupper/[id]/actions.ts:62-135` (`leggTilGruppemedlem`)
- Hva er galt: `coachScopedPlayerWhere` gir en coach tilgang til alle spillere i en gruppe der coachen er aktivt trener-medlem. Den gjør ikke forskjell på AK Golfs egne grupper og organisasjonsgrupper (`wang-toppidrett`, `wang-ung`, `team-norway`). Samme port brukes av `harCoachTilgangTilSpiller` / `assertCoachTilgangTilSpiller` til både lesing og skriving. Kommentaren i koden sier «innsyn, ikke redigering», men porten skiller ikke på det. En WANG- eller TN-trener må ha `User.role = COACH` og aktivt COACH/ASSISTANT-medlemskap i organisasjonsgruppa for å i det hele tatt komme inn på trenerflatene (`hentWangCoachGruppeId`, `krevNavngittTrener`), så ALLE ekte WANG/TN-trenere oppfyller vilkåret. `/admin` slipper inn enhver bruker med rolle COACH (`src/app/admin/layout.tsx` via `requirePortalUser`), og `coachedPlayerWhere` regner WANG-/TN-elever som «coachet» (gruppemedlemskap).
- Hva kan skje: En WANG-trener (en trener på skolen) logger inn i AgencyOS og ser og endrer planen til alle elever i sin skolegruppe, selv om eleven aldri har delt noe. Konkret skriveveier som slipper gjennom på `harCoachTilgangTilSpiller`: opprette/flytte/slette økter (`wb-actions.ts:171`, `session-actions.ts:58,90,180,199,222,283,299,313,346`), publisere økter til spilleren (`publish-actions.ts`), øvelser (`drill-actions.ts`), treukerssyklus, malpåføring (`apply-template-actions.ts`), FYS/turnering (`fys-turnering-actions.ts`), turnering (`turnering-actions.ts`), planforslag og mål (`src/app/admin/plans/[planId]/actions.ts`, `spillere/[id]/plan/[planId]/plan-actions.ts`, `oppgave-actions.ts`), meldinger (`messages/actions.ts`), pluss start av lydopptak (`api/recording/start/route.ts`) og registrering av lydsamtykke (`lyd-samtykke-actions.ts:60`). Lesing går gjennom `spiller360-data`, `workbench/[playerId]`, stall, analyse m.fl. (ca. 380 kallsteder). Dette bryter D-04 (innsyn krever uttrykkelig deling, kan bare foreslå) og er i konflikt med den riktige stien `lagTrenerforslag` (`src/lib/workbench/trenerforslag.ts`), som bare lager forslag etter `medNavngittProfil`.
- Forslag til retting: (1) I `coachScopedPlayerWhere` og `harCoachTilgangTilSpiller`: tredje OR-gren skal bare gjelde grupper med `managedByAkGolf = true` og IKKE `program` WANG_UNG/WANG_TOPPIDRETT og ikke slug `team-norway`. For org-grupper kreves `DelingsSamtykke` (via `navngittTrenerHarTilgang`) i tillegg. (2) Del opp i to funksjoner: `kanLeseSpiller` (stall/innsyn) og `kanSkriveSpiller` (bare enrollment eller gruppe eid av coachen, aldri medlemskap alene). Skriving for org-trenere skal gå via `lagTrenerforslag`. (3) Test: org-trener med COACH-medlemskap uten samtykke får `false` fra begge. (4) Sjekk i produksjon hvem som i dag er trenermedlem i org-gruppene (egen databasesjekk, ikke gjort her).
- PR-gruppe: P1-tilgang
- Status: Ny (ingen åpen PR endrer `coached.ts`; sjekket #1190/#1192/#1193 — #1190 endrer ikke `coachScopedPlayerWhere`)

#### TO-02 · COACH-medlem i organisasjonsgruppe kan redigere gruppa og skrive i alle medlemmenes planer
- Alvorlighet: Kritisk
- Fil: `src/lib/workbench/group-scope.ts:15-22` (`editableGroupWhere`), `src/lib/workbench/gruppe-periode-actions.ts:95-175` (`coachRullUtGruppeAarsplan`), `src/lib/workbench/group-session-actions.ts`, `samlingsinvitasjon-actions.ts:150`, `src/app/admin/grupper/[id]/actions.ts` (`eierGruppen`)
- Hva er galt: `editableGroupWhere` gir redigeringsrett til «aktiv COACH-medlem», uten å skille organisasjonsgrupper. `coachRullUtGruppeAarsplan` oppretter `SeasonPlan` og `PeriodBlock` direkte i hvert medlems egen plan. Gruppeøkter publiseres tilsvarende inn i medlemmenes ukeplan. `leggTilGruppemedlem` lar en COACH-medlem også melde spillere inn i/ut av gruppa.
- Hva kan skje: En ekstern WANG- eller TN-trener kan rulle ut perioder og økter inn i alle elevers planer i én handling, uten at noen elev har delt noe og uten «foreslå»-trinnet. Under 16 år uten foresattes samtykke.
- Forslag til retting: `editableGroupWhere` skal bare gi redigering til gruppeeier (`coachId`) og ADMIN for org-grupper; COACH-medlem i WANG/TN-gruppe skal bare kunne lage forslag (`PlanAction`, som `trenerforslag.ts`). #1190 beholder dagens regel uendret (se diffen), så dette må rettes separat.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TO-03 · Automatisk deling av WANG-tester til Team Norway: #1192 dekker hovedveien, men ikke alle
- Alvorlighet: Høy
- Fil: `src/lib/domain/tn-arbeidsflate.ts:404-440` (`hentTnFellesTestdagGrupper`), `src/app/team-norway/tn-testdag-actions.ts:82-153,192-252`, `src/lib/portal-tester/wang-resultat-tilgang.ts`
- Hva er galt: #1192 (diff lest) gjør `hentWangTestresultatSkolerForTeamNorway` om til samtykkestyrt (`medTnTestsamtykke`, under 16 krever FORESATT-rad), fjerner `harAutomatiskWangTestdeling`, og legger inn forespørsel-skjerm for eleven. Det er riktig for `/team-norway/wang-resultater` og gruppeanalysen (`tn-arbeidsflate.ts:1087`). Hull som PR-en ikke rører (ingen av disse filene er i diffen):
  1. `hentTnFellesTestdagGrupper` lister ALLE aktive elever (navn) i alle WANG-skoler til TN-treneren, uten samtykke.
  2. `tn-testdag-actions.ts` lar TN-treneren legge WANG-elever inn som deltakere i et fellesarrangement og føre testresultater for dem (sjekker bare at eleven er aktiv i WANG-gruppa, ikke samtykke).
  3. `hentTnGruppeanalyse`-rader for TN-elevene bruker `lesNavngitteProfiler` (riktig), men WANG-radene bygger på lista fra #1192 først etter at PR-en er merget; før merge gjelder gammel automatikk.
  4. `harAutomatiskWangTestdeling` er fortsatt kalt i fire sider på main; PR-en bytter dem, men tester i `tests/` utenfor PR-listen kan bryte (ikke verifisert).
- Hva kan skje: Etter merge av #1192 ser TN fortsatt navn på alle WANG-elever (også mindreårige) i testdag-velgeren, og kan legge dem inn i arrangement og føre resultater uten samtykke.
- Forslag til retting: Filtrer `hentTnFellesTestdagGrupper` og deltakervalidering i `tn-testdag-actions.ts` med samme `medTnTestsamtykke`; før resultater for ikke-samtykkende elever kun etter at eleven selv har akseptert invitasjonen til arrangementet.
- PR-gruppe: P1-tilgang
- Status: Rettes delvis i åpen PR #1192 (venter); punkt 1 og 2 er Ny

#### TO-04 · Team Norway-trener kan skrive helse- og lisensdata og avslutte medlemskap uten samtykke
- Alvorlighet: Middels
- Fil: `src/lib/domain/tn-redigering.ts:272-293` (`lagreSpillerstatus`: helseattest-utløp, antidoping, lisens), `:307-330` (`lagreCollege`, notat), `:336-345` (`avsluttSpiller`), `:28-39` (`krevSpillerIGruppe`)
- Hva er galt: Lesing av disse dataene går via `lesTnProfiler` (samtykkestyrt), men skriving krever bare at treneren er TN-trener og eleven er aktiv i TN-gruppa.
- Hva kan skje: TN-trener registrerer helseattest-datoer og fritekstnotat om en elev som ikke har delt noe; kan også avslutte elevens medlemskap. Skjermen vil ikke vise det tilbake (lesing er gated), så ingen oppdager det.
- Forslag til retting: Krev `navngittTrenerHarTilgang` (eller `medNavngittProfil`) også ved skriving, bortsett fra `avsluttSpiller` (ren organisasjonsadministrasjon, kan bli som den er).
- PR-gruppe: P1-tilgang
- Status: Ny

#### TO-05 · WANG-trener ser hele elevlista (navn på mindreårige) uten samtykke
- Alvorlighet: Middels
- Fil: `src/app/team-wang/coach/page.tsx:36-39` (`hentWangGruppe({ medElevnavn: true })`), `src/app/team-wang/_data/hent-wang-gruppe.ts:162-237`
- Hva er galt: `hentWangCoachGruppeId` sjekker bare trenermedlemskap; elevnavn (og IUP-lenker per elev) hentes uten delingsstatus. Selve profilene er riktig låst bak `medWangElevData` → `medNavngittProfil`.
- Hva kan skje: Trener ser navnelista til alle elever. Rimelig for en skole, men strider mot D-04 slik den er formulert («bare det spilleren har delt»). Beslutning trengs: er elevlista (kun navn) akseptabel, eller skal den bare vise delte elever?
- Forslag til retting: Vis bare elever med gyldig deling, eller bare antall. #1193 fjerner `medElevnavn: true` fra siden (sett i diffen: test `doesNotMatch(side, /medElevnavn:\s*true/)`).
- PR-gruppe: P1-tilgang
- Status: Rettes i åpen PR #1193 (venter)

#### TO-06 · Lydsamtykke kan føres inn av coach for mindreårige uten alderssjekk eller bekreftet foresatt (telles som TA-04)
- Alvorlighet: Høy
- Fil: `src/lib/recording/lyd-samtykke-actions.ts:72-135` (`registrerLydSamtykkeGitt`), `src/app/api/recording/start/route.ts:36-50,107,149,199`
- Hva er galt: Coach kan sette status GITT for en spiller med `gittAv: "SELV"` eller `"FORESATT"` (da bare en e-postadresse coachen skriver inn, uten verifisering). Ingen sjekk mot `maaHaForesattSamtykke` / alder (ingen import av `minor` i `src/lib/recording/` eller `api/recording`). Opptaksstart krever bare at status er GITT.
- Hva kan skje: Coach (inkl. en org-trener via TO-01) kan starte opptak av en 14-åring med «SELV»-samtykke registrert av coachen selv. Strider mot regelen om foresattes godkjenning under 16 (opptak er nevnt eksplisitt i D-04).
- Forslag til retting: I `registrerLydSamtykkeGitt`: hvis `maaHaForesattSamtykke(spiller)` → avvis `SELV` og krev at foresatt bekrefter via lenken (`sendLydSamtykkeForesattEpost`); den manuelle «pilot/nød»-veien bør bare gjelde myndige.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TO-07 · Data Golf er åpent for alle spillere med gratis/Talent-profil og alle coacher (brudd på D-19)
- Alvorlighet: Høy
- Fil: `src/app/portal/analysere/datagolf/page.tsx:17-18`, `.../datagolf/stasjon/page.tsx:18`, `.../datagolf/actions.ts:7`, `src/lib/auth/talent-allowlist.ts:33`, `src/components/portal/v2/AnalysereV2.tsx:247,343`, `src/lib/portal-analyse/tm-hub-data.ts:251`, `src/components/team-norway/tn-shell.tsx:86` (lenke fra TN-menyen)
- Hva er galt: Siden bruker `requirePortalUser({ kreverTilgang: "TALENT" })`: alle spillere, også den låste gratisprofilen, slipper inn. D-19 sier bare rollen «analytiker» (Anders). `UserRole` har ingen analytiker (verdier: ADMIN, COACH, PLAYER, PARENT, GUEST; `prisma/schema.prisma:16`). Det finnes ingen e-post-/ID-sjekk for «bare Anders» noe sted (søkt etter isAnders og lignende uten treff).
- Hva kan skje: Hver spiller og coach ser DG-spillerkort, sammenligning mot proffer og lagrer utfordringer mot DG-data. Lisensvilkårene fra Data Golf kan være brutt; D-19 er brutt.
- Forslag til retting: Innfør en eksplisitt «analytiker»-port (egen enum-verdi eller allowlist på bruker-ID i miljøvariabel) og bruk den på `/portal/analysere/datagolf*`, `/api`-ruter og inngangene i Analyse-huben og TN-menyen. Skjul inngangene for andre. Fjern fra `talent-allowlist.ts`.
- PR-gruppe: P2-datagolf
- Status: Ny

#### TO-08 · Offentlige /stats/pga-sider viser Data Golf-baserte tall til alle
- Alvorlighet: Høy (beslutning trengs)
- Fil: `src/app/(marketing)/stats/pga/page.tsx`, `.../pga/sg-total/page.tsx`, `.../pga/spillere/page.tsx`, `.../pga/spillere/[dg_id]/page.tsx`, `src/components/stats/pga-kategori-page.tsx`, `src/lib/stats/pga-sync.ts`, `src/app/(marketing)/stats/page.tsx`, `stats/spillere/[slug]/page.tsx` (leser `dataGolfId`)
- Hva er galt: Åpne sider uten innlogging (ISR, 1 time) viser `PgaPlayerSeason`, «synket ukentlig fra DataGolf». Prosjektets `beslutninger.md` sier samtidig «Powered by Data Golf på alle offentlige statistikkflater» og «DataGolf vises aldri for andre enn Anders». De to utsagnene motsier hverandre.
- Hva kan skje: Enten brytes D-19, eller så er «Powered by»-kravet feil. Lisensrisiko dersom DG-tillatelsen ikke dekker offentlig visning.
- Forslag til retting: Anders avklarer: skal /stats/pga bort/bak innlogging for analytiker, eller er offentlig visning dekket av avtalen? Til avklart: ingen kodeendring, men merk i rapporten til Anders.
- PR-gruppe: P2-datagolf
- Status: Usikker (krever beslutning og sjekk av DG-avtale)

#### TO-09 · Data Golf-kartlegging (tabell, D-19)
- Alvorlighet: Middels
- Fil: se tabell
- Hva er galt: Ingen enhetlig port. Tabellen viser hvem som i dag når hva.
- Hva kan skje: Se TO-07 og TO-08.
- Forslag til retting: Én felles `kanSeDataGolf(user)` brukt overalt.
- PR-gruppe: P2-datagolf
- Status: Ny

| Fil / rute | Hvem kan se i dag | Burde (D-19) | Vurdering |
|---|---|---|---|
| `/portal/analysere/datagolf` (+ `/portal/datagolf` redirect, `/stasjon`) | Alle PLAYER med TALENT/FULL (også gratis), COACH, ADMIN | Bare analytiker (Anders) | Brudd |
| `src/app/portal/analysere/datagolf/actions.ts` (lagre utfordring mot DG) | Samme | Bare analytiker | Brudd |
| `/stats/pga`, `/stats/pga/sg-total`, `/stats/pga/spillere`, `/stats/pga/spillere/[dg_id]` | Alle på nett (offentlig) | Bare analytiker, eller avklar «Powered by» | Brudd / avklares (TO-08) |
| `/stats/spillere/[slug]`, `/stats/turneringer/[slug]` (viser `dataGolfId`, turneringsdata med DG-kilde) | Offentlig | Interne ID-er bør ikke vises | Lav risiko, vurder |
| `AnalysereV2` / `tm-hub-data` (inngangskort «DataGolf») | Alle spillere i Analyse | Skjules for andre | Brudd |
| `tn-shell.tsx:86` (menypunkt DataGolf i Team Norway) | TN-trenere (peker til /portal-flaten) | Skjules | Brudd |
| `src/lib/domain/sg-tour-benchmark-data.ts` (leser `dashboard.dg_rounds`, sender bare antall videre) | Intern, kalibrering for spillerens SG-sammenligning | Greit så lenge råtall ikke vises | OK, men verifiser at ingen DG-fordeling vises i PH-16 Stats |
| `src/lib/admin/benchmark-sync.ts`, cron `datagolf-sync`, `pga-*` | Server/cron | Intern | OK |
| `src/app/admin/turnering/page.tsx:96`, `AG17Turneringer.tsx:228` («DATAGOLF_PREDICT_V1») | Coach/ADMIN | Bare analytiker | Sjekk om tall er ekte eller demo (utenfor dette området) |
| `src/lib/dashboard-data/*` (`dashboard.dg_*` lesing) | Server | Intern | OK, men kallere må portes |

#### TO-10 · `kanSeIup` gir alle COACH/ADMIN innsyn i alle IUP-er (ubrukt kode)
- Alvorlighet: Lav
- Fil: `src/lib/auth/spiller-side-tilgang.ts:32-43`
- Hva er galt: Predikatet sier «ADMIN/COACH ser alle». Ingen kaller den i dag (bare testen). Selve IUP-siden bruker `medWangElevData` (samtykke) — riktig.
- Hva kan skje: Hvis noen tar den i bruk senere, åpner den alle IUP-er.
- Forslag til retting: Slett eller omskriv med samtykkekrav.
- PR-gruppe: P5-dødkode
- Status: Ny

#### TO-11 · Admin-handlinger uten eier-/scope-sjekk: #1190 dekker 48, resten står åpent
- Alvorlighet: Høy
- Fil: se `docs/design-audit/tilgang-admin-2026-10-05.md` på grenen `claude/admin-tilgang-2026-10-05` (liste over «Åpent»)
- Hva er galt: #1190 retter 48 handlinger (runder, TrackMan, live-økt, bookingflytt, godkjenninger, GDPR-moderering, talent, testslag m.fl.). Det den selv lister som ikke rettet: `lib/agencyos/live-okt-actions.ts` (coach avgrenses til `coachId` på økta, ikke stall), `foresporsler/actions.ts` (forespørsel uten coach kan besvares av enhver coach), `gjennomfore/okter/[id]/actions.ts` (hopper over spillersjekk når `booking.userId` er null), `innsyn/talent/wagr-import/actions.ts`, `api/upload/route.ts` (staff kan skrive i annen coachs spillers filsti), `api/coach/ai-chat/route.ts` (`sessionId` ikke eierkontrollert), `workbench/drill-actions.ts`/`wb-drill-write.ts` (`templateId` uten eiersjekk), `api/admin/reports/[type]` (COACH kan eksportere selv om menyen er skjult), samt ca. 45 globale ressurser (pris, planmaler inkl. selvgodkjenning, benchmarks, e-postmaler).
- Hva kan skje: Se hvert punkt; verst er upload til annen coachs spillers sti og eksport av spillerdata.
- Forslag til retting: Egen oppfølgingsrunde etter at #1190 er merget. Bestem policy for globale ressurser (bare head coach/ADMIN?).
- PR-gruppe: P1-tilgang
- Status: Rettes delvis i åpen PR #1190 (venter); restpunkter Ny

#### TO-12 · #1190 reparerer lesing/skriving, men låser ikke org-gruppe-hullet
- Alvorlighet: Høy
- Fil: `docs/design-audit/tilgang-admin-2026-10-05.md` (på #1190): «Rollemodell: ... egen gruppe eller gruppe der coachen er aktivt COACH-/ASSISTANT-medlem» (beskrevet som riktig); `src/lib/workbench/group-scope.ts` (ny `gruppeInnsynWhere` videreformidler regelen til gruppeårsplan og gruppeinnsyn)
- Hva er galt: #1190 lager en ny `gruppeInnsynWhere` som gir lesing av gruppeårsplan/skoledata til COACH/ASSISTANT-medlem i alle grupper, også WANG/TN, og `harCoachTilgangTilSpiller` brukes i mange nye sjekker. Dermed bygger PR-en inn TO-01 i flere flater i stedet for å fjerne det. WANG/TN er uttrykkelig utenfor omfang i dokumentet.
- Hva kan skje: En «sikret» flate gir likevel org-trenere tilgang.
- Forslag til retting: Rett TO-01 først (eller i samme PR), så arver alle de nye sjekkene den riktige regelen.
- PR-gruppe: P1-tilgang
- Status: Rettes i åpen PR #1190 (venter) — delvis; org-hull Ny

#### TO-13 · Gruppemedlemskap og samtykke-bevis er to separate systemer uten felles port
- Alvorlighet: Middels
- Fil: `src/lib/auth/ekstern-leser-scope.ts` (riktig: krever EksternLeserGruppe + medlemskap + DelingsSamtykke), `src/lib/deling/navngitt.ts` (riktig), versus `src/lib/auth/coached.ts` (ingen samtykke)
- Hva er galt: Samtykke bevises tre ulike måter (`DelingsSamtykke` mot gruppe, `TrenerDelingsInvitasjon` via e-postdomene, gruppemedlemskap). Bare de to første sjekkes av TN/WANG-profilene. Alt som bygger på `coached.ts` ser aldri på dem.
- Hva kan skje: Nye flater velger lett feil port (har skjedd, se TO-01/03/04).
- Forslag til retting: Dokumentert én inngang: `kanSeSpiller(viewer, spillerId, formål)` som velger riktig regel per rolle (egen stall vs. org-trener).
- PR-gruppe: P1-tilgang
- Status: Ny

#### TO-14 · Opptak av video og live-økt: foresattes godkjenning er ikke koblet til coach-opptak
- Alvorlighet: Middels
- Fil: `src/app/api/portal/swing-video/upload/route.ts:36-70` (sjekker `isAwaitingGuardianConsent` — riktig for spilleropplasting), `src/app/api/recording/*`, `src/lib/recording/okt-tilgang.ts`
- Hva er galt: Spillerens egen videoopplasting stoppes for under-16 uten foresattes samtykke. Coachens opptak (lyd) styres bare av `LydSamtykke`-status (se TO-06) og ikke av `requiresGuardianConsent`; `consentVerified` på video settes til `!requiresGuardianConsent` men videoUrl er fri URL fra klienten.
- Hva kan skje: Se TO-06. `videoUrl` fra klienten uten verifisering at den peker til appens lager (liten risiko, Usikker: sjekk om `videoUrl` kan peke til ekstern side).
- Forslag til retting: Se TO-06; valider `videoUrl` mot egen bucket.
- PR-gruppe: P1-tilgang
- Status: Usikker (må sjekkes mot lagrings-oppsettet)

#### TO-15 · Aktivt medlem i flere grupper: samtykke mot én gruppe kan gjenbrukes feil via coach-stien
- Alvorlighet: Lav
- Fil: `src/lib/auth/coached.ts:76-111`, `src/lib/deling/navngitt.ts` (delingsMiljo)
- Hva er galt: Ekstern-leser-stien (`eksternLeserSpillerIderPerGruppe`) holder samtykke per gruppe riktig adskilt. Coach-stien har ingen gruppeskille overhodet, så et elevmedlemskap i flere grupper (WANG + TN) gir treneren fra begge sammenhenger samme tilgang.
- Forslag til retting: Løses av TO-01.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TO-16 · Logger: ingen klare lekkasjer, to småting
- Alvorlighet: Lav
- Fil: `src/app/api/meg/telegram/route.ts:38` (logger Telegram `chatId` ved uautorisert kall), `src/lib/stripe/handle-event.ts:272,416` og `src/lib/domain/tn-redigering.ts:41` (`console.error(err)` med hele feilobjektet fra e-post-/Stripe-klient)
- Hva er galt: 186 `console.*`-kall søkt gjennom; ingen skriver e-post, navn, helse, token eller hele request-body direkte. Feilobjekter fra e-post/Stripe kan i enkelte tilfeller inneholde mottakeradresse; `chatId` er en personlig ID.
- Hva kan skje: Små mengder personopplysninger i Vercel-logg.
- Forslag til retting: Logg `err.message`/kode, ikke hele objektet; utelat `chatId` eller hash den. Bruk den eksisterende `sanitizeMessage` (`src/lib/error-tracking.ts`).
- PR-gruppe: P3-data
- Status: Ny

#### TO-17 · Hemmeligheter i repoet: ingen funnet
- Alvorlighet: Lav
- Fil: Sjekket alle sporede filer (`git grep`): Stripe live/test-nøkler, webhook-hemmeligheter, JWT-lignende `eyJ…`, private nøkler, AWS/GitHub/Slack/Anthropic/Google-nøkler, tilkoblingsstrenger med passord, `Bearer`, `password=`, `api_key=`, `service_role`. Eneste treff er: (a) testfikstur med falske verdier i `src/lib/error-sanitize.test.ts`, `error-tracking-logg.test.ts`, `o13-ytelse.test.ts` (type: falsk Stripe-test-/webhook-/Bearer-/Postgres-verdi, bevisst for å teste sanitering); (b) plassholdere i `.env.example`, `.github/workflows/ci.yml:21-22`, `playwright.yml:39-40,101-102` og `prisma.config.ts:27` (dummy-passord); (c) eksempeltekst i `.claude/skills/**`; (d) `service_role` som SQL-rolle i migrasjoner og `scripts/sql/*.sql` (ikke en nøkkel). Den eneste sporede miljøfila er `.env.example`.
- Hva er galt: Ingenting; testfiksturen `error-sanitize.test.ts:12` inneholder prosjektreferansen til produksjonsdatabasen (`db.<ref>.supabase.co`) med fiktivt brukernavn. Referansen er ikke en hemmelighet, men avslører prosjektet.
- Hva kan skje: Ingenting direkte.
- Forslag til retting: Bytt prosjektreferansen i testen til `db.example.supabase.co` (valgfritt).
- PR-gruppe: Ingen (bare rapport)
- Status: Ny

---

## 1b. API-ruter og innlogging (TA)

Grunnlag: `main` på 9f39c7d44 (06.10.2026). Bare lesing. Åpen PR #1190 er sammenlignet via `gh pr diff 1190`.

### Oppsummering

- Antall funn: 1 Kritisk · 4 Høy · 7 Middels · 9 Lav (21 totalt).
- Dekket: alle 71 `route.ts` under `src/app` (api + `forelder/samtykke/eksport` + `kino`), `src/proxy.ts`, `src/lib/auth/*`, `src/lib/supabase/*`, `scripts/check-sensitive-route-guards.mjs`, `scripts/check-action-auth.mjs`, samt de lib-filene rutene støtter seg på (cron-vakt, rate-limit, lagring, MCP-auth, lydsamtykke, onboarding, forelder).
- IKKE dekket: server actions og sider (andre agenter), selve Supabase-prosjektets innstillinger (e-postbekreftelse, passordkrav, RLS i databasen) og Vercel-miljøvariabler. Funn som avhenger av disse er merket «Usikker».
- Gode nyheter: alle 9 cron-ruter bruker felles vakt som stenger alt når `CRON_SECRET` mangler (ingen «tom streng slipper inn»-feil). Stripe-webhooken sjekker signatur og dobbeltbehandling. Telegram, snarvei, helse-inntak og MCP bruker hemmelighet/nøkkel. Spiller-sider i API-et henter nesten alltid data på innlogget bruker-ID, ikke ID fra klienten.
- Den viktigste rotårsaken: proxyen (`src/proxy.ts`) beskytter bare sidene `/portal`, `/admin`, `/intern`, `/innsyn` og to enkeltsider. Alle `/api/*`-ruter må derfor sjekke selv, og det er opp til hver rute. Vaktskriptene sjekker ikke API-ruter i det hele tatt (se TA-12).

Forklaring av to ord: «IDOR» betyr at en innlogget bruker kan se eller endre andres data ved å bytte en ID i forespørselen. «CRON_SECRET» er passordet Vercel sender når den starter planlagte jobber.

### Tabell: rute · metode · innlogging · rolle · eiersjekk · vurdering

| Rute (under `src/app`) | Metode | Innlogging | Rolle | Eiersjekk | Vurdering |
|---|---|---|---|---|---|
| api/admin/ai-plan/batch | POST | requirePortalUser | COACH/ADMIN | harCoachTilgangTilSpiller per spiller | OK |
| api/admin/ai-plan | POST | requirePortalUser | COACH/ADMIN | harCoachTilgangTilSpiller; `iterationOf` ikke sjekket | Hull (TA-10, PR #1190) |
| api/ai-plan/generate | POST | getCurrentUser | COACH/ADMIN | harCoachTilgangTilSpiller; `iterationOf` ikke sjekket | Hull (TA-10, PR #1190) |
| api/admin/cleanup-recordings/preview | POST | getCurrentUser | ADMIN | – | OK |
| api/admin/coach-ai | POST | getCurrentUser | COACH/ADMIN | ingen ID; spillerkontekst kommer fra klienten | OK (se TA-20) |
| api/admin/reports/[type] | GET | getCurrentUser | COACH/ADMIN (abonnement: ADMIN) | coachScopedPlayerWhere | OK |
| api/admin/search | GET | getCurrentUser | COACH/ADMIN | coachScopedPlayerWhere + booking-scope | OK (økonomi-treff: TA-19, PR #1190) |
| api/auth/oauth-callback | GET | Supabase-kode | – | omkobler eksisterende konto på e-post | Hull (TA-02) |
| api/caddie/approve | POST | canAccessMissionControl | ADMIN | utkast filtrert på bruker | OK |
| api/caddie/chat | POST | canAccessMissionControl | ADMIN | samtale filtrert på bruker | OK |
| api/caddie/conversations | GET | canAccessMissionControl | ADMIN | userId i where | OK |
| api/caddie/conversations/[id] | GET, DELETE | canAccessMissionControl | ADMIN | userId i where | OK |
| api/client-error | POST | ingen (åpen) | – | – | Hull, Lav (TA-16) |
| api/coach/ai-chat | POST | getCurrentUser | alle unntatt GRATIS | **ingen** på `sessionId` | **Hull (TA-01)** |
| api/cron/[agent] | GET | CRON_SECRET (fail-closed) | – | – | OK (TA-15 lav) |
| api/cron/check-stuck-bookings | GET | CRON_SECRET | – | – | OK |
| api/cron/cleanup-deleted-accounts | GET | CRON_SECRET | – | – | OK |
| api/cron/cleanup-error-logs | GET | CRON_SECRET | – | – | OK |
| api/cron/cleanup-guest-bookings | GET | CRON_SECRET | – | – | OK |
| api/cron/notion-sync | GET | CRON_SECRET | – | – | OK |
| api/cron/refresh-topar-grunnlag | GET | CRON_SECRET | – | – | OK |
| api/cron/webhook-failures-alert | GET | CRON_SECRET | – | – | OK |
| api/cron/webhook-retry | GET | CRON_SECRET | – | – | OK |
| api/google-calendar/callback | GET | HMAC-state (ingen økt) | – | state ikke bundet til økt | Lav (TA-14) |
| api/google-calendar/connect | GET | getCurrentUser | COACH/ADMIN | – | OK |
| api/google-calendar/webhook | POST | HMAC kanal-token | – | kanal-ID mot DB | OK (TA-15 lav) |
| api/health/ingest | POST | token, tidskonstant, fail-closed | – | – | OK |
| api/health | GET | ingen (kun status) | – | – | OK |
| api/inbox/inbound | POST | delt hemmelighet i header | – | – | OK (TA-15 lav) |
| api/kommando/chat | POST | canAccessMissionControl | ADMIN | – | OK |
| api/kommando/team | POST | canAccessMissionControl | ADMIN | projectId eiersjekket | OK |
| api/lead | POST | ingen (åpen) + same-origin + rate-limit | – | – | Lav (TA-17) |
| api/live/coach-chat | POST, GET | getCurrentUser | spiller/deltaker | eier/deltaker av økt; tråd på (bruker, økt) | OK |
| api/mcp/akgolf | GET, POST | GET åpen; POST API-nøkkel | ADMIN | – | Lav (TA-18) |
| api/meg/shortcut | POST | Bearer, tidskonstant | Anders | – | OK |
| api/meg/telegram | POST | secret + allowliste | Anders | – | OK |
| api/notifications/mark-all-read | POST | getCurrentUser + same-origin | alle | egne | OK |
| api/notion/oauth/callback | GET | HMAC-state (ingen økt) | – | state ikke bundet til økt | Lav (TA-14) |
| api/notion/oauth/connect | GET | getCurrentUser | COACH/ADMIN | – | OK |
| api/notion/sync | POST | getCurrentUser | ADMIN | egne koblinger | OK |
| api/parse-date | POST | requirePortalUser | alle roller | **ingen** på `spilllerId` | **Hull (TA-07)** |
| api/player-depth | POST, GET | getCurrentUser | alle | egen | OK |
| api/portal/chat | POST | getCurrentUser | ikke PARENT/GUEST | verktøy bruker egen ID | OK |
| api/portal/live/[sessionId]/snapshot | POST | getCurrentUser | eier eller coach | eier eller harCoachTilgang | OK |
| api/portal/search | GET | getCurrentUser | alle | userId i where | OK |
| api/portal/swing-video/upload | POST | getCurrentUser | alle | `liveSessionId`/`drillId` ikke sjekket; fri URL | Lav (TA-21) |
| api/portal/tester/test-photo | GET, POST, DELETE | getCurrentUserRaw + samtykke | PLAYER | egen økt/forsøk, signert URL 5 min | OK |
| api/portal/trening/logg | POST | getCurrentUser | alle | egne | OK |
| api/push/subscribe | POST | via lib (getCurrentUser) | alle | – | OK |
| api/push/unsubscribe | POST | via lib | alle | kun egne | OK |
| api/recording/start | POST | getCurrentUser | COACH/ADMIN | coach-scope; booking uten tjenestecoach hullet | Hull (TA-09, PR #1190) |
| api/recording/upload-chunk | POST | getCurrentUser | opptakets eier/ADMIN | uploadedById | OK |
| api/recording/complete | POST | getCurrentUser | eier/ADMIN | uploadedById | OK |
| api/recording/abort | POST | getCurrentUser | eier/ADMIN | uploadedById | OK |
| api/recording/status | GET | getCurrentUser | eier/ADMIN | uploadedById | OK |
| api/recording/transcribe | POST | getCurrentUser | COACH/ADMIN | uploadedById | OK |
| api/recording/analyze | POST | getCurrentUser | eier/ADMIN | uploadedById; navn anonymisert før AI | OK |
| api/recording/dummy-transcript | POST | getCurrentUser | eier/ADMIN | uploadedById; av i prod uten flagg | OK |
| api/stats/search | GET | ingen (åpen) | – | – | **Hull (TA-06)** |
| api/stripe/checkout | POST | getCurrentUser | alle | egen kunde | OK (Lav, TA-19) |
| api/stripe/portal | POST | getCurrentUser | alle | egen kunde | OK |
| api/stripe/setup-intent | POST | getCurrentUser | alle | egen kunde | OK |
| api/stripe/setup-intent/bekreft | POST | getCurrentUser | alle | SetupIntent mot egen kunde | OK |
| api/stripe/webhook | POST | Stripe-signatur + dedup | – | – | OK |
| api/team-norway/dokumenter | POST | getCurrentUser + same-origin | trener i gruppen | krevDokumentOpplastingstilgang | OK |
| api/team-norway/vedlegg/[attachmentId] | GET | getCurrentUser + samtykke | gruppemedlem/delt | hentTnVedleggForViewer | OK |
| api/upload | POST | getCurrentUser | alle (staff-bøtter kun COACH/ADMIN) | **bare avatar og swing-video** har eierprefiks | **Hull (TA-05)** |
| api/view-as-player | GET | getCurrentUser | COACH/ADMIN | – | Lav (TA-19) |
| api/view-mode | POST | getCurrentUser + same-origin | COACH/ADMIN | – | OK |
| forelder/samtykke/eksport | GET | getCurrentUser | PARENT/ADMIN | godkjent ParentRelation, uten alder | Hull (TA-08) |
| kino | GET | ingen | – | – | OK (ren omdirigering) |

---

### Funn

#### TA-01 · AI-samtale: en innlogget bruker kan skrive over andres samtaletråd
- Alvorlighet: Kritisk
- Fil: `src/app/api/coach/ai-chat/route.ts:99-146` (sessionId tas fra body), `:152-160` (oppdatering på `sessionId`)
- Hva er galt: Ruten tar `sessionId` fra forespørselen og bruker den uten å sjekke at samtalen tilhører innlogget bruker. Når AI-svaret er ferdig kjører koden `coachingSession.update({ where: { id: sessionId } ... })` og erstatter hele meldingshistorikken med det klienten sendte. Svaret sender også `sessionId` tilbake i headeren `x-session-id`.
- Hva kan skje: Enhver betalende spiller som kjenner (eller gjetter) ID-en til en annen samtaletråd, også en direktemelding mellom coach og spiller eller en live-økt-tråd, kan slette og erstatte innholdet. Tapt data uten varsel, og mulighet til å legge falske coach-/spillermeldinger i andres tråd. Bonus: nye AI-samtaler får `coachId` = første coach som finnes i databasen (`findFirst({ role: "COACH" })`), ikke spillerens egen coach. Sjekk om AgencyOS viser AI-tråder til den coachen (da ser en tilfeldig coach spillerens AI-samtaler).
- Forslag til retting: Slå opp tråden med `where: { id: sessionId, userId: user.id, kind: "AI" }` før streaming; avvis med 404 hvis ikke funnet. Bruk `updateMany` med `userId` i where når tråden lagres. Sett `coachId` til spillerens faktiske coach, eller null.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TA-02 · Innlogging via Google/e-postkode omkobler en eksisterende konto til hvem som helst med samme e-post
- Alvorlighet: Høy (kan bli Kritisk, avhenger av Supabase-oppsett)
- Fil: `src/app/api/auth/oauth-callback/route.ts:60-72`
- Hva er galt: Hvis det allerede finnes en bruker i databasen med samme e-post, overskriver koden `authId` (nøkkelen som knytter innloggingen til brukeren) med ID-en til den som nettopp logget inn. Den sjekker ikke at e-posten er bekreftet (`email_confirmed_at`), og den begrenser ikke omkoblingen til kontoer som venter på kobling (`pending-`/`pending:`). Den tilsvarende koden i `claim-pending-account.ts` er derimot bevisst begrenset til ventende kontoer.
- Hva kan skje: Dersom en angriper kan få en Supabase-innlogging med Anders' (admin) e-post uten at e-posten er bekreftet (for eksempel hvis «bekreft e-post» er slått av, eller en tilbyder sender ubekreftet e-post), blir angriperens innlogging den ekte brukeren, inkludert ADMIN. Den ekte eieren blir samtidig låst ute. Kan ikke bekreftes fra koden alene: Supabase-innstillingene ligger ikke i repoet, og `SignupV2.tsx:191` har en gren for `data.session` rett etter registrering, som tyder på at bekreftelse kan være av.
- Forslag til retting: Krev `authUser.email_confirmed_at`, og omkoble bare rader der `authId` starter med `pending-`/`pending:` (gjenbruk `claimPendingAccountByEmail`). Ellers avvis med feilmelding. Sjekk i Supabase at «Confirm email» er på.
- PR-gruppe: P1-tilgang
- Status: Usikker (må sjekke Supabase: e-postbekreftelse og identitetskobling)

#### TA-03 · Under 16: uten fødselsdato regnes brukeren som voksen, og utfylling av fødselsdato kan hoppes over
- Alvorlighet: Høy
- Fil: `src/lib/auth/minor.ts:47-65` (mangler begge signaler = «anta voksen»), `src/components/portal/v2/SignupV2.tsx:171-181` (registrering samler ikke fødselsdato), `src/lib/auth/requirePortalUser.ts:33-74`, `src/app/portal/layout.tsx:28`, `src/app/auth/etter-innlogging/page.tsx:46` (sender rett til /portal), `src/app/api/auth/oauth-callback/route.ts:73-93` (ny Google-bruker uten fødselsdato)
- Hva er galt: Fødselsdato og foreldresamtykke-flagget settes først i onboarding-trinnet (`setDateOfBirthAndCheckMinor`, `onboarding/actions.ts:525`). Ingenting tvinger brukeren gjennom onboarding: `requirePortalUser` slipper inn alle som mangler fødselsdato, og `isAwaitingGuardianConsent` ser bare på flagget `requiresGuardianConsent`, som er `false` til fødselsdato er fylt ut.
- Hva kan skje: En 13-åring registrerer seg (e-post eller Google), skriver `/portal` i adressefeltet i stedet for å fullføre onboarding, og bruker hele spillerappen uten at foreldre er varslet eller har godkjent: runderegistrering, AI-chat (data sendes til Anthropic), opplasting av bilder/video, lydopptak kan også komme senere. Fødselsdato er selvoppgitt uten kontroll, så en bevisst feil dato slipper også gjennom, men det er en mindre sak enn at steget kan hoppes over.
- Forslag til retting: Krev fødselsdato i `requirePortalUser`/`getCurrentUser` for PLAYER (mangler dato: send til onboarding-steget, bortsett fra på selve onboarding-sidene). Eventuelt be om fødselsdato allerede i registreringsskjemaet og i oauth-callback. Gjør `isAwaitingGuardianConsent` mer forsiktig: ukjent alder for PLAYER = ikke bekreftet voksen.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TA-04 · Under 16: lydsamtykke kan registreres uten bevis fra foresatt
- Alvorlighet: Høy
- Fil: `src/lib/recording/lyd-samtykke-actions.ts:75-110` (`registrerLydSamtykkeGitt`), `src/app/portal/meg/actions.ts:110-135` (`settEgetLydSamtykke`)
- Hva er galt: (1) Coachen kan sette lydsamtykke til «GITT» for en spiller med `gittAv: "SELV"` uten at koden sjekker at spilleren er over 16, eller med `gittAv: "FORESATT"` og en vilkårlig e-postadresse uten at noen foresatt har svart. Kommentaren kaller det «manuell pilot/nød». (2) Spillerens egen knapp bruker bare `isMinor(dateOfBirth)`; mangler fødselsdato (se TA-03) eller er `requiresGuardianConsent` satt uten dato, slipper spilleren gjennom og kan gi samtykke selv. Hjelperen `maaHaForesattSamtykke` i `minor.ts` er laget for å bruke strengeste signal, men brukes ikke her.
- Hva kan skje: Grensen i `recording/start` («uten GITT lydsamtykke, ingen opptak», `route.ts:36-47`) er den eneste sperren for opptak av samtaler med barn. Den kan omgås av coach eller av barnet selv. Lyden sendes dessuten til OpenAI (Whisper, `recording/transcribe`) og transkripsjonen til Anthropic og Notion; for barn er det kun lovlig med foresattes samtykke.
- Forslag til retting: Bruk `maaHaForesattSamtykke` i begge handlingene; for mindreårige tillat bare samtykke som kommer via foresatt-lenken (`auth/lyd-samtykke/[token]`). Fjern eller begrens «SELV»/manuell registrering for under 16 (eventuelt kun ADMIN, med logg). Ta også med i samtykketeksten at lyd behandles hos tredjeparter.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TA-05 · Opplastings-API: alle innloggede kan skrive til nesten alle lagringsbøtter, også offentlige
- Alvorlighet: Middels
- Fil: `src/app/api/upload/route.ts:25-45` (liste over staff-bøtter), `:88-125` (sti og eierprefiks), `src/lib/storage/buckets.ts:30-37` (offentlige bøtter)
- Hva er galt: Bare fem bøtter er stengt for vanlige brukere (miniatyrer, klubblogoer, rapporter, fakturaer, trenerbilder, TN-vedlegg). Alle andre, inkludert den offentlige `task-media`, `message-attachments` og den private `recordings`, kan en hvilken som helst innlogget bruker (også forelder og gjest) skrive til med fritt valgt sti. Eierprefiks (`<bruker-id>/`) kreves bare for `player-avatars` og `player-swing-videos`. Filtypen avgjøres av filens egen påstand (`file.type`), ikke innholdet.
- Hva kan skje: Misbruk av firmaets lagring (50 MB video per fil) som delingstjeneste via offentlig lenke på firmaets Supabase-domene; ugyldige filer i opptaksbøtta; noen kan okkupere forutsigbare stier. Ingen lesing av andres filer, siden bøttene er private/ikke listet, så ikke Høy. Usikkert om Supabase avviser `..` i stier (`<id>/../annen-id/fil`), må testes.
- Forslag til retting: Lag en hviteliste per rolle og bøtte (hvem får skrive hvor), krev alltid `<bruker-id>/`-prefiks for brukerbøtter, nekt `..`, og kontroller filinnhold (magic bytes) i tillegg til MIME-påstand. Gjelder særlig `recordings` og `task-media`.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TA-06 · Åpen søke-API viser Data Golf-tall uten innlogging
- Alvorlighet: Høy
- Fil: `src/app/api/stats/search/route.ts:42-52` (`pgaPlayerSeason` med `sgTotal`, `dgPlayerId`), `prisma/schema.prisma:4713-4719` (modellen er «synket fra DataGolf»)
- Hva er galt: Ruten krever ikke innlogging og returnerer for PGA-spillere strokes gained totalt (`sgTotal`) og Data Golf-ID (`dgPlayerId`), hentet fra Data Golf. Beslutning D-19 sier Data Golf bare skal vises for rollen analytiker (Anders). Ruten har ingen rollesjekk.
- Hva kan skje: Hvem som helst på internett kan hente Data Golf-data via søk, i strid med D-19 og trolig Data Golfs lisensvilkår (data skal ikke videreformidles åpent). Sjekk også at spillernavn for norske spillere (`publicPlayer`) bare returneres via `offentligSpillerFilter()` (det gjøres, men `bio` og `tier` returneres også).
- Forslag til retting: Fjern `pgaSpillere` fra åpent svar, eller krev innlogging + rolle analytiker. Avklar med Anders om «Powered by Data Golf» på offentlige flater er en bevisst unntaksregel; i så fall må D-19 skrives om.
- PR-gruppe: P2-datagolf
- Status: Ny

#### TA-07 · Dato-tolkeren lar hvem som helst spørre om en annen spillers turneringer
- Alvorlighet: Middels
- Fil: `src/app/api/parse-date/route.ts:14-62` (`spilllerId` fra body), `src/lib/portal/training/date-parser.ts:231-260`
- Hva er galt: Ruten tar en spiller-ID fra klienten og slår opp den spillerens turneringspåmeldinger ved tekst som «2 uker før Bossum Open», uten å sjekke at ID-en er innlogget brukers egen (eller at brukeren er coach for spilleren). Alle roller, også foreldre, kan kalle den.
- Hva kan skje: Med en kjent spiller-ID kan man teste om spilleren er påmeldt en turnering med et gitt navn og få datoen (turneringsdatoen minus/pluss antall dager). Liten mengde data, men det er andres kalender, også for mindreårige.
- Forslag til retting: Bruk `canAccessPlayer(user, spilllerId)` (finnes i `lib/auth/own-or-coached.ts`), eller ignorer klientens ID og bruk `user.id`.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TA-08 · Forelder beholder full innsyn og får full dataeksport også etter at barnet er 16 eller eldre
- Alvorlighet: Middels
- Fil: `src/app/forelder/samtykke/eksport/route.ts:155-190`, `src/lib/forelder.ts:14, 20-45, 90-95` (`GODKJENT_FORELDER = { approved: true }`)
- Hva er galt: Eneste vilkår for forelders tilgang er en godkjent forelderrelasjon. Det finnes ingen aldersgrense eller utløp, og ingenting sjekker barnets egen vilje. Eksporten henter profil (e-post, telefon, fødselsdato), bookinger, betalinger, alle runder med slag, treningslogger og varsler for hvert barn. Prosjektets egen regel (`minor.ts`) sier at 16-åringer samtykker selv.
- Hva kan skje: En forelder kan laste ned all data om et barn på 17 eller 20 år uten at barnet vet det eller har sagt ja, som er i strid med prinsippet om at innsyn følger samtykke (D-04: innsyn krever uttrykkelig deling, forelder godkjenner bare under 16). Eksporten registrerer ingen melding til barnet.
- Forslag til retting: Avklar regelen med Anders (anbefaling: forelderinnsyn faller bort ved 16, eller krever barnets aktive deling). Legg alderssjekk inn i `hentBarnForForelder`/`GODKJENT_FORELDER` og i eksporten, og varsle barnet ved eksport.
- PR-gruppe: P1-tilgang
- Status: Usikker (regelen må bekreftes av Anders)

#### TA-09 · Opptak kan startes på en booking der tjenesten ikke har fast coach
- Alvorlighet: Middels
- Fil: `src/app/api/recording/start/route.ts:164-176` (`user.role !== "ADMIN" && coachId && coachId !== user.id`)
- Hva er galt: Er `serviceType.coachUserId` tom, hopper sjekken over og alle coacher kan starte opptak på hvilken som helst spillers booking (rollesjekk finnes, men ingen sjekk av at spilleren er coachens).
- Hva kan skje: En coach kan ta opp lyd i en annen coachs spiller-booking. Lydsamtykke (TA-04) må fortsatt være gitt, så skaden begrenses av den sperren.
- Forslag til retting: Bruk `harCoachTilgangTilSpiller(user, booking.userId)` i bookinggrenen, slik som i de to andre grenene.
- PR-gruppe: P1-tilgang
- Status: Rettes i åpen PR #1190 (venter)

#### TA-10 · AI-plan: forrige forslag kan hentes via ID uten eiersjekk
- Alvorlighet: Middels
- Fil: `src/lib/ai-plan/generate.ts:136-146` (`findUnique({ where: { id: iterationOf } })`), kalt fra `src/app/api/admin/ai-plan/route.ts:60-66` og `src/app/api/ai-plan/generate/route.ts:62-69`
- Hva er galt: Coachen sjekkes mot spilleren i selve forespørselen, men `iterationOf` (ID på et tidligere AI-forslag) slås opp uten å sjekke at forslaget tilhører den spilleren/coachen.
- Hva kan skje: En coach kan trekke et annet forslag, for en annen coachs spiller, inn i sin egen forespørsel og få innholdet (treningsplan basert på spillerdata) gjengitt i det nye forslaget.
- Forslag til retting: Filtrer på `userId` (og coach) i oppslaget.
- PR-gruppe: P1-tilgang
- Status: Rettes i åpen PR #1190 (venter)

#### TA-11 · Rate-limit stenger ikke ved Redis-feil (og mangler helt eller er lokal på noen ruter)
- Alvorlighet: Middels
- Fil: `src/lib/rate-limit.ts:1-10, 98-135`, `src/app/api/client-error/route.ts:28-50` (egen lokal teller)
- Hva er galt: Uten Redis (mangler/feil) bruker rate-limit en teller i minnet per server-instans, og bare hvis `RATE_LIMIT_FAIL_CLOSED=1` kaster den feil. På Vercel er hver forespørsel ofte en ny instans, så minnetelleren stopper lite. Rate-limit i `mcp`, `team-norway/dokumenter` (kun opplastingsstørrelse) og `recording/*` følger samme mønster eller mangler (dokumenter har ingen).
- Hva kan skje: AI-ruter (kostnad på Anthropic), innlogget misbruk og åpne skjema (lead, klientfeil) kan overbelastes hvis Redis er nede eller ikke konfigurert i produksjon. Dette kan ikke ses fra koden: sjekk at `REDIS_URL` er satt i Vercel og vurder `RATE_LIMIT_FAIL_CLOSED=1` for AI- og skriveruter.
- Forslag til retting: Bekreft miljøvariabler; bruk fail-closed for kostbare og åpne ruter; legg rate-limit på `team-norway/dokumenter`.
- PR-gruppe: P1-tilgang
- Status: Usikker (må sjekke Vercel-miljøet)

#### TA-12 · Vaktskriptene dekker ikke API-ruter og godtar «bare innlogget» som tilgangskontroll
- Alvorlighet: Middels
- Fil: `scripts/check-action-auth.mjs:11-26, 82-110`, `scripts/check-sensitive-route-guards.mjs:19-41`
- Hva er galt: (1) `check-action-auth` ser bare på filer med `"use server"` (server actions). Ingen `route.ts` blir sjekket; en ny API-rute uten innlogging passerer. (2) Vakten godtar `getCurrentUser` som «tilgangskontroll», selv om det bare betyr innlogget. En handling som kaller `getCurrentUser()` og deretter bruker en ID fra klienten uten eiersjekk (som TA-01 og TA-07) passerer. (3) Sjekken er per fil: én beskyttet funksjon i fila dekker for en annen funksjon uten sjekk. `check-sensitive-route-guards` sjekker bare tre navngitte sider (to årgang-sider og team-gfgk).
- Hva kan skje: Hullene i denne rapporten ville ikke blitt fanget; nye hull dukker opp uten at `npm run verify` slår ut.
- Forslag til retting: Utvid vakten til å kreve at hver `route.ts` (med unntak av eksplisitt hvitelistede webhooks, cron, health, kino) kaller en kjent vakt (rolle/eier/secret), og legg en eier-test for ruter som tar ID fra body/query/params.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TA-13 · Innlogging, registrering og glemt passord har ingen egen forsøksbegrensning
- Alvorlighet: Lav
- Fil: `src/components/portal/v2/LoginV2.tsx:375`, `SignupV2.tsx:180`, `ForgotPasswordV2.tsx:34`, `src/app/team-wang/logg-inn/wang-login.tsx:18`
- Hva er galt: Nettleseren kaller Supabase direkte; appen har ingen server-side rate-limit eller kontosperre på innlogging, passordtilbakestilling eller registrering. Bare `oauth-callback` har IP-grense (30/min).
- Hva kan skje: Gjetting av passord er begrenset av Supabases innebygde grenser, som ikke kan leses fra koden. Ingen e-postvarsel ved mange mislykkede forsøk.
- Forslag til retting: Sjekk Supabase Auth-innstillinger (rate limits, minste passordlengde, e-postbekreftelse, CAPTCHA); vurder egen server-rute med rate-limit for innlogging hvis de er svake.
- PR-gruppe: Ingen (bare rapport)
- Status: Usikker

#### TA-14 · OAuth-tilstand (state) for Google og Notion er ikke bundet til innlogget økt
- Alvorlighet: Lav
- Fil: `src/app/api/google-calendar/callback/route.ts:44-62`, `src/app/api/google-calendar/connect/route.ts:34-42`, `src/app/api/notion/oauth/callback/route.ts:60-80`, `src/app/api/notion/oauth/connect/route.ts:44-48`
- Hva er galt: Statestrengen er `bruker-id.nonce.signatur`. Callback sjekker bare signaturen, ikke at den som kommer tilbake er innlogget som den brukeren, at statestrengen er brukt før, eller at den har utløpt. Notion bruker `NOTION_WEBHOOK_SECRET` (webhook-hemmelighet) også som signeringsnøkkel for OAuth-state.
- Hva kan skje: Får noen tak i en gammel statestreng (nettleserhistorikk, logg), kan de koble sin egen Google-kalender eller sitt Notion-område til den coachens konto; Google-kalenderen speiles inn og kan endre/avlyse bookinger (`reflekterTilBookinger`). Krever lekkasje først, derfor Lav.
- Forslag til retting: Lagre nonce i en kortlevd cookie eller tabell og kreve at innlogget bruker i callback er samme som i state; legg til utløp (10 min) og engangsbruk; bruk egen nøkkel per formål.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TA-15 · Hemmeligheter sammenlignes ikke i konstant tid på noen steder
- Alvorlighet: Lav
- Fil: `src/lib/cron/auth.ts:25-31` (`authHeader === \`Bearer ${secret}\``), `src/app/api/inbox/inbound/route.ts:53`, `src/app/api/google-calendar/webhook/route.ts:60`, `src/app/api/google-calendar/callback/route.ts:60`
- Hva er galt: Vanlig `===`/`!==` kan i teorien lekke lengden på riktig treff via svartid. Helse-inntak, snarvei, Telegram og Notion-state gjør det riktig (tidskonstant).
- Hva kan skje: Praktisk risiko er svært liten over internett; rettes for ensartethet. Cron-vakten er ellers korrekt fail-closed (tom `CRON_SECRET` avviser alt).
- Forslag til retting: Én felles `tidskonstantLik(a, b)` basert på `crypto.timingSafeEqual` og bruk den overalt.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TA-16 · Åpen feilrapport kan fylle varslene dine
- Alvorlighet: Lav
- Fil: `src/app/api/client-error/route.ts:28-50, 74-101`
- Hva er galt: Ruten krever ingen innlogging eller same-origin. Hvem som helst kan sende en feil med `context: "global-error"`, som får alvorlighet «fatal» og gir Telegram/Slack-varsel til Anders. Rate-limit er en lokal teller per instans (nullstilles ved kald start, vokser uten opprydding), og IP tas fra `x-forwarded-for` (første verdi).
- Hva kan skje: Støy og falske «fatal»-varsler; feillogg fylles med falsk innhold.
- Forslag til retting: Bruk felles `rateLimit` + `requireSameOrigin`, og begrens «fatal» til forespørsler med gyldig innlogging eller en signert token fra feilsiden.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TA-17 · Lead-skjemaet sender velkomstmelding til hvilken som helst adresse
- Alvorlighet: Lav
- Fil: `src/app/api/lead/route.ts:46-88`
- Hva er galt: Ruten godtar alt med `@` som e-post, lagrer det og sender velkomst-e-post fra firmaets avsenderdomene uten bekreftelse. `name` og `source` har ingen lengdegrense. Same-origin-sjekk og 5/min per IP finnes.
- Hva kan skje: Noen kan få firmaets domene til å sende e-post til tredjeparter (spam/trakassering) og skade avsenderomdømmet.
- Forslag til retting: Dobbel bekreftelse (send bare bekreftelseslenke), streng e-postvalidering og lengdegrenser, og Turnstile/CAPTCHA på skjemaet.
- PR-gruppe: Ingen (bare rapport)
- Status: Ny

#### TA-18 · MCP-endepunktet: rate-limit teller per forespørsel, ikke per verktøykall, og kataloglisten er åpen
- Alvorlighet: Lav
- Fil: `src/app/api/mcp/akgolf/route.ts:30-47, 70-95`, `src/lib/mcp/auth.ts:54-80`
- Hva er galt: GET viser alle verktøynavn uten innlogging. Én batch-forespørsel kan inneholde ubegrenset mange kall, men teller bare som ett mot grensen på 60/min. API-nøkkelens eier sjekkes mot rolle ADMIN, men ikke mot `deletedAt` (slettet admin).
- Hva kan skje: Begrenset: kreve gyldig admin-nøkkel først. Verktøylisten røper hva systemet kan. En slettet admins nøkkel virker til den utløper/tilbakekalles.
- Forslag til retting: Begrens batch-størrelse (f.eks. 10), tell hvert kall, skjul verktøylisten bak nøkkel, avvis nøkler for slettede brukere.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TA-19 · Småting i rutelaget: rettigheter overstyrt per bruker virker ikke, få ruter sjekker same-origin, og noen svarer med omdirigering
- Alvorlighet: Lav
- Fil: `src/app/api/**` (ingen bruker `canUser`/`requireCapability`; bare 4 av 71 bruker `requireSameOrigin`), `src/app/api/view-as-player/route.ts:15-33` (GET som endrer tilstand), `src/app/api/admin/search/route.ts:93` (økonomi-treff for coach), `src/lib/auth/getCurrentUser.ts:152-158` og `requirePortalUser.ts:51` (redirect i stedet for 401)
- Hva er galt: (a) Capabilities som kan tildeles/trekkes per bruker (`VIEW_REPORTS`, `USE_AGENTS` m.fl.) håndheves ikke i API-ruter; de sjekker rå rolle. En coach som fikk trukket rapportrettighet kan likevel laste ned CSV. (b) `view-as-player` endrer tilstand via GET og kan utløses fra en annen nettside (liten effekt, bytter visning). (c) For mindreårige uten samtykke og for `requirePortalUser` gir API-ruter en 307-omdirigering til en HTML-side i stedet for 401/403 JSON. (d) Søket viste «Økonomi» som rutetreff for coach, som ikke har tilgang (rettes i PR #1190).
- Hva kan skje: Forvirrende feil for klienter; rettighetsmatrisen i `/admin/settings/tilgang` gir falsk trygghet.
- Forslag til retting: Bruk `canUser` i ruter for rapporter, AI og agenter; gjør `view-as-player` til POST; la API-ruter bruke JSON-feil via en felles hjelper.
- PR-gruppe: P1-tilgang
- Status: Rettes i åpen PR #1190 (venter) for punkt (d); øvrige Ny

#### TA-20 · Coach-AI sender klientoppgitt spillerkontekst til Anthropic
- Alvorlighet: Lav
- Fil: `src/app/api/admin/coach-ai/route.ts:14-53, 62-85`
- Hva er galt: Spillernavn og spillerkontekst (HCP, ambisjon, runder, tester) kommer ferdigbygget fra nettleseren og stoles på. Navnet pseudonymiseres (hash av navn), men innholdet verifiseres ikke mot database og coach-scope. Kommentaren i koden kaller dette en kjent svakhet.
- Hva kan skje: Ingen lekkasje av andres data siden coachen selv leverer innholdet; men fritekst i konteksten kan inneholde navn og helseopplysninger som sendes uvasket til Anthropic (gjelder også mindreårige).
- Forslag til retting: Send bare `playerId`, bygg konteksten på serveren etter `harCoachTilgangTilSpiller`, og kjør navnevask på fritekst.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TA-21 · Swing-video: fri URL og ukontrollert økt-ID, og samtykkeflagget regnes feil
- Alvorlighet: Lav
- Fil: `src/app/api/portal/swing-video/upload/route.ts:11-14, 52-70`
- Hva er galt: `videoUrl` er hvilken som helst gyldig URL (ikke lenke til egen lagring), `liveSessionId` og `drillId` sjekkes ikke mot brukeren. `consentVerified: !user.requiresGuardianConsent` blir `false` for en mindreårig som HAR fått foreldresamtykke (flagget forblir `true`), og `true` for en som aldri har blitt spurt (TA-03). Ruten er merket «F3 scaffold» og ingen annen kode leser videoene ennå (kun slettes ved kontosletting).
- Hva kan skje: Lagring av ekstern/ondsinnet URL som senere kan vises til coach; feil samtykkeflagg den dagen funksjonen tas i bruk.
- Forslag til retting: Godta kun stier i `player-swing-videos` under brukerens ID, sjekk økt-eierskap, og sett `consentVerified` til `!isAwaitingGuardianConsent` og aldersregel.
- PR-gruppe: P1-tilgang
- Status: Ny

---

### Spillere under 16: oppsummering

| Område | Funn |
|---|---|
| Hvordan en spiller blir regnet som under 16 | Bare via fødselsdato satt i onboarding, som ikke er tvunget (TA-03). |
| Lydopptak | Sperre finnes (`recording/start`), men samtykket kan registreres av coach/spiller uten bevis fra foresatt (TA-04). Lyd sendes til OpenAI/Anthropic/Notion. |
| Video | Ingen aktiv videorute ut over «scaffold» (TA-21); `/api/upload` tillater video-opplasting til `player-swing-videos` for innloggede med samtykkeflagg (TA-03/TA-05). |
| Deling | TN-vedlegg og testbilder sjekker foreldresamtykke i rutene; forelderinnsyn har ingen aldersgrense (TA-08). |
| AI-chat | Portal-chat og live-chat sjekker samtykkeflagg via `getCurrentUser`; navn pseudonymiseres, men uten fødselsdato regnes brukeren som voksen (TA-03). |

### Hva som er sjekket og funnet i orden (kort)

- Cron: alle 9 ruter kaller `avvisUgyldigCron`, som avviser når `CRON_SECRET` mangler eller er tom.
- Stripe-webhook: signatur med `constructEvent`, dedup, retry-kø; SetupIntent-bekreftelse sjekker eier.
- Meg (Telegram, snarvei), helse-inntak: hemmelighet i tidskonstant, fail-closed.
- Opptaks-ruter, snapshot, TN-vedlegg og testbilder: eiersjekk på bruker/gruppe, signerte URL-er (5 min).
- Caddie/Kommando: kun ADMIN, samtaler filtrert på bruker.
- Rapporter (CSV): coach-scope, CSV-injeksjon nøytralisert, Stripe-kolonner kun ADMIN.

---

## 1c. Handlinger i PlayerHQ, forelder og innsyn (TP)

Grunnlag: `main` commit 9f39c7d44. Bare lesing. ID-prefiks TP-.

### Oppsummering

- Funn: 1 Kritisk, 12 Høy, 22 Middels, 3 Lav (38 totalt).
- Dekket: alle filer som faktisk har direktivet `"use server"` på toppen under `src/app/portal`, `src/app/forelder`, `src/app/innsyn`, `src/app/auth`, `src/app/(marketing)` og `src/lib/*` unntatt `src/lib/workbench`. Pluss de små «use server»-funksjonene som ligger inne i sidefiler (tapper, summary, booking, utfordringer, turneringer, samtykke-deling). I tillegg leste jeg støttekode actions kaller for å vurdere eiersjekk: `src/lib/deling/*`, `src/lib/health/samtykke.ts`, `src/lib/iup/lagring.ts`, `src/lib/auth/*`, `src/lib/plan-builder/index.ts`.
- `git grep '"use server"'` gir mange falske treff (ordet står i kommentarer). Ikke faktiske actions: `src/lib/domain/tester-live.ts`, `src/lib/plan-builder/index.ts`, `src/lib/portal-tester/session-data.ts`, `src/lib/portal-tester/test-scoring.ts`, `src/lib/kalender-lag/player-dag.ts`, `src/lib/auth/assert-own-or-coached.ts`, `src/lib/auth/booking-scope.ts`, `src/lib/teknisk-plan/ensure-plan-access.ts`. De er lest som støttekode.
- IKKE dekket: `src/lib/workbench/*` (annen agent), `src/app/inviter/forelder/[token]/actions.ts` (utenfor listen, men er foreldre-invitasjonen; bør leses), API-ruter, sider (server components) som ikke inneholder egne actions, `src/app/team-wang`, `src/app/team-norway`, `src/app/admin`. Sender de ikke-leste AI-agentene (`src/lib/ai/*`, `src/lib/meg/*`, Caddie) fritekst til AI uten vask er ikke vurdert her.
- Hva som er bra (verifisert): hovedvaktene `requirePortalUser`, `requireConsentingUser`, `requireSpillerActionUser`, `requireCoachActionUser` og `assertCanViewPlayerData` brukes i praktisk talt alle actions. Det finnes en gate (`scripts/check-action-auth.mjs`) som krever at hver actions-fil importerer og kaller en slik vakt. Navngitt trenerdeling (`src/lib/deling/navngitt.ts`) er solid: sju dagers utløp, domenesjekk (@wang.no / @golfforbundet.no, bekreftet e-post), tilbaketrekking med en gang, forelder godkjenner under 16, serialisert transaksjon. IUP-lagring (`src/lib/iup/lagring.ts`) krever aktivt WANG/TN-medlemskap og eier. `saveTnTest`, `fullforTestSession`, mål-actions, runde-actions (`assertRoundOwner`), booking (slot og eier), kalender opptatt-tid, varsler og `loggFysOkt` har gode eiersjekker.

Forklaring: «server action» = en funksjon nettleseren kan kalle direkte med hvilke som helst argumenter, uten å gå via siden. Sidevakten beskytter derfor ikke; hver action må sjekke selv.

### Tabell: de viktigste action-gruppene

| Fil | Action | Innlogging | Eiersjekk | Vurdering |
|---|---|---|---|---|
| `src/lib/storage/video.ts` | getSignedVideoUrl / deleteVideo / uploadVideo | Ja (coach) | Nei, alle coacher får alt | TP-01 |
| `src/lib/actions/test-shot-actions.ts` | alle 5 | Nei (`publicAction`) | Nei | TP-07 |
| `src/app/auth/onboarding/actions.ts` | setDateOfBirthAndCheckMinor, resendGuardianInvitation | Ja | Egen konto, men fødselsdato kan skrives om | TP-02, TP-16 |
| `src/lib/recording/lyd-samtykke-actions.ts`, `src/app/portal/meg/actions.ts` | registrerLydSamtykkeGitt, settEgetLydSamtykke | Ja | Ingen aldersregel for opptak | TP-03 |
| `src/app/portal/mal/runder/[id]/actions.ts` | deleteShot | Ja | Runde sjekkes, slaget ikke | TP-05 |
| `src/app/portal/live/voice-actions.ts` | saveVoiceRangeMemo | Ja | Nei på sessionId | TP-06 |
| `src/lib/venner/actions.ts` | sokSpillere, sendVenneforesporsel | Ja | Alle spillere søkbare | TP-08 |
| `src/app/portal/meg/innstillinger/actions.ts` | deleteUserAccount, exportUserData | Ja | Egen konto | TP-09, TP-33 |
| `src/app/portal/(legacy)/utfordringer/actions.ts` | bliMed | Ja | Nei | TP-10 |
| `src/app/forelder/samtykke/actions.ts` | alle 5 | Ja (forelder/admin) | Ja, godkjent relasjon (låst av test) | TP-14 (smått) |
| `src/app/auth/guardian-consent/[token]/actions.ts` | confirmGuardianConsent | Nei (token) | Token + utløp | TP-15 |
| `src/lib/deling/navngitt.ts` via `portal/meg/deling` og `auth/trenerdeling` | opprett/trekk/aksepter | Ja | Ja, grundig (låst av tester) | OK |
| `src/app/portal/meg/innstillinger/personvern/*-samtykke-actions.ts` | gi/trekk deling og helse | Ja | Ja, under-16-regel (låst av tester) | OK |
| `src/app/portal/actions.ts`, `analysere/actions.ts` | alle `get*` | Ja | `assertCanViewPlayerData` | OK |
| `src/app/portal/(fullscreen)/tren/tester/.../gjennomfor/actions.ts`, `tren/tester/team-norway/actions.ts` | alle | Ja | Ja | OK |
| `src/app/portal/(legacy)/mal/goals-actions.ts` | alle | Ja | Ja (testet) | OK |
| `src/app/portal/booking/*`, `meg/bookinger/actions.ts`, `lib/booking/credit-booking.ts` | opprett/flytt/avbestill | Ja | Ja (testet) | OK |

---

#### TP-01 · Hvilken som helst coach kan se, laste opp og slette video av hvilken som helst spiller
- Alvorlighet: Kritisk
- Fil: `src/lib/storage/video.ts:36` (uploadVideo), `:126` (getSignedVideoUrl), `:154` (deleteVideo)
- Hva er galt: Alle tre sjekker bare at brukeren har rollen COACH eller ADMIN. De sjekker ikke at spilleren hører til coachen (`harCoachTilgangTilSpiller` finnes, men brukes ikke her). `getSignedVideoUrl` gir en nedlastingslenke til video av enhver spiller til enhver coach. `deleteVideo` lar enhver coach slette enhver videos, og `uploadVideo` lar enhver coach legge video på hvilken som helst spiller-ID (bare at brukeren finnes sjekkes).
- Hva kan skje: En trener fra en annen organisasjon (WANG, Team Norway har egne COACH-kontoer) kan hente video av spillere, også under 16, som de ikke har noen relasjon til. En coach kan slette en annen coachs videoer uten varsel (tapt data). Videoene er også personvernfølsomme opptak.
- Forslag til retting: Bruk `requireCoachActionUser()` og `harCoachTilgangTilSpiller(user, video.playerId)` i alle tre (ADMIN slipper gjennom som i resten av systemet). For `deleteVideo`: bare coachen som lastet opp (`coachId`) eller admin. Sjekk filens innhold (magic bytes), ikke bare `file.type` fra klienten.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-02 · Spiller kan skrive om egen fødselsdato og dermed fjerne foreldrekravet
- Alvorlighet: Høy
- Fil: `src/app/auth/onboarding/actions.ts:525` og `:566` (setDateOfBirthAndCheckMinor), `src/app/portal/meg/actions.ts:51` (oppdaterProfil), `src/app/portal/meg/profil/actions.ts` (lagreProfil)
- Hva er galt: `setDateOfBirthAndCheckMinor` kan kalles når som helst, også etter at fødselsdato er satt og foreldre har godkjent. Den setter `requiresGuardianConsent` til det nye resultatet. En 14-åring som sender en voksen fødselsdato får flagget satt til «nei». `oppdaterProfil`/`lagreProfil` lar brukeren sette `dateOfBirth` fritt (ingen sperre, ingen validering av dato i selve actionen).
- Hva kan skje: All foreldre-godkjenning (deling, helse, opptak, portal-tilgang) kan omgås av barnet selv. Strider mot D-04 (godkjenning under 16) og GDPR artikkel 8.
- Forslag til retting: Når fødselsdato er satt, skal den ikke kunne endres av spilleren; endring går via coach/admin eller forelder med logg. Aldri nullstill `requiresGuardianConsent` automatisk når allerede satt til true.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-03 · Lydopptak av under 16-åringer kan godkjennes uten forelder (telles som TA-04)
- Alvorlighet: Høy
- Fil: `src/lib/recording/lyd-samtykke-actions.ts:72` (registrerLydSamtykkeGitt), `src/app/portal/meg/actions.ts:137` (settEgetLydSamtykke)
- Hva er galt: Coachen kan registrere samtykke som «gitt av SELV» for hvilken som helst coachet spiller, uten aldersregel. Og spilleren kan selv gi opptakssamtykke hvis `dateOfBirth` er tom eller endret, fordi kun `isMinor(dateOfBirth)` sjekkes, ikke `maaHaForesattSamtykke` (som også ser på `requiresGuardianConsent`). Koblet til TP-02 kan barnet først endre fødselsdato, så samtykke selv. «FORESATT manuelt» godtas også uten at noen verifiserer det.
- Hva kan skje: Opptak av mindreårige uten reell foreldregodkjenning, mot D-04.
- Forslag til retting: Bruk `maaHaForesattSamtykke(bruker)` begge steder. For under 16: bare token-lenke til forelder (som allerede finnes) eller forelder i portalen. Fjern «SELV» for under 16 i coach-registreringen.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-04 · Coach-tilgang til spillerdata ser bare på gruppe/rolle, ikke på delingssamtykke (telles som TO-01)
- Alvorlighet: Høy
- Fil: `src/lib/auth/coached.ts` (`coachScopedPlayerWhere`, `harCoachTilgangTilSpiller`), brukt av `assertCanViewPlayerData`, `canAccessPlayer` og ca. 30 actions
- Hva er galt: En COACH som er trener-medlem i en gruppe (tredje gren i `coachScopedPlayerWhere`) får full tilgang til alle spillere i gruppen: økter, runder, TrackMan, mål, tester, helse-relatert. Ingen sjekk mot `DelingsSamtykke`. Samme mønster er allerede listet som åpent «Personvern først» i `.claude/rules/beslutninger.md` (WANG/TN skal kreve delingssamtykke; D-04, D-13).
- Hva kan skje: WANG- eller Team Norway-trenere med COACH-rolle ser alt om en spiller uten at spilleren/forelder har gitt deling.
- Forslag til retting: Skille AK Golf-coacher (full tilgang) fra eksterne gruppetrenere (tilgang bare via `navngittTrenerHarTilgang`/`harGyldigSamtykke`). Lås med test.
- PR-gruppe: P1-tilgang
- Status: Usikker (kjent åpent punkt; jeg har ikke funnet om en nyere PR har stengt det. Må sjekkes: om WANG/TN-trenere faktisk legges inn som gruppe-trenere med rolle COACH i produksjon)

#### TP-05 · deleteShot kan slette andres slag
- Alvorlighet: Høy
- Fil: `src/app/portal/mal/runder/[id]/actions.ts:259-263`
- Hva er galt: Eiersjekken gjelder `roundId`, men slaget slettes med bare `shotId` (`prisma.shot.delete({ where: { id: shotId } })`). Slaget sjekkes aldri mot runden.
- Hva kan skje: En bruker som kjenner en annen spillers slag-ID kan slette det (ID-er er ikke gjettbare, men dukker opp i data som deles). Slettingen utløser i tillegg omberegning av feil runde.
- Forslag til retting: `deleteMany({ where: { id: shotId, roundId } })` og sjekk antall.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-06 · Talenotat kan skrives på andres økt
- Alvorlighet: Høy
- Fil: `src/app/portal/live/voice-actions.ts:69` (saveVoiceRangeMemo)
- Hva er galt: Ved `destination: "session"` hentes og endres `trainingSessionV2` med `sessionId` fra klienten uten eier- eller deltakersjekk. Feil svelges (`catch {}`) og svaret er alltid «Notat lagret». Innholdet (`observation`) kommer fra klienten uten validering.
- Hva kan skje: Hvem som helst innlogget kan føye tekst til en annen spillers økt-notater (også synlig for deres coach). Spilleren får aldri vite om lagringen feilet.
- Forslag til retting: Sjekk at økten tilhører brukeren (som `verifyAccess`), valider med zod (lengde), returner feil i stedet for å svelge.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-07 · Fem actions for treningsslag uten innlogging (Middels etter samlet vurdering: ingen kallere, og #1190 legger på tilgangssjekk)
- Alvorlighet: Høy
- Fil: `src/lib/actions/test-shot-actions.ts:20` (`publicAction()` på toppen), actions `createTestShot`, `createTestShotsTransaction`, `getTestShots`, `deleteTestShotsForResult`, `migrateDetailsJsonToTestShots`
- Hva er galt: Ingen innlogging og ingen eiersjekk. `publicAction()` er bare en markør som får sjekk-skriptet (`check-action-auth`) til å tie. Alle bruker `testResultId` fra argumentet. Ingen andre filer importerer modulen.
- Hva kan skje: Hvis Next.js eksponerer actionen, kan hvem som helst (uten å være innlogget) lese, opprette eller slette PEI/SG-slag på et testresultat.
- Forslag til retting: Slett filen (ubrukt, jf. P5-dødkode). Strammer inn gaten slik at `publicAction` bare tillates i en eksplisitt liste.
- PR-gruppe: P5-dødkode
- Status: Usikker (jeg har ikke testet om Next bygger en kallbar action for en ubrukt eksport; bør uansett fjernes)

#### TP-08 · Alle spillere kan søkes opp på navn, også under 16
- Alvorlighet: Høy
- Fil: `src/lib/venner/actions.ts:114` (sokSpillere) og `sendVenneforesporsel`
- Hva er galt: Alle `PLAYER` med navn som inneholder søketeksten (to bokstaver holder) returneres med navn, avatar, HCP og kategori. Ingen filter på mindreårige, ingen samtykke, ingen grense på forespørsler. En venneforespørsel kan sendes til hvilken som helst bruker-ID.
- Hva kan skje: En fremmed voksen kan finne barn ved navn, se HCP og bilde, og sende venneforespørsel. Barnet kan akseptere uten forelder. Gjelder «Barnevern»-regelen (spillere født 2008 eller senere vises ikke åpent uten samtykke). Venners økt-feed er av som standard (`venneOktSynlig: false`), som begrenser skaden.
- Forslag til retting: Skjul mindreårige uten samtykke fra søket; begrens søket til gruppe/venner av venner; rate limit; sjekk at mottaker er en aktiv PLAYER.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-09 · Kontosletting stopper ikke betalingen på 30 dager
- Alvorlighet: Høy
- Fil: `src/app/portal/meg/innstillinger/actions.ts:337` (deleteUserAccount)
- Hva er galt: Actionen setter bare `deletedAt`. Stripe-abonnementet kanselleres først når nattjobben sletter kontoen for godt (30 dager senere, `src/lib/gdpr/slett-eksterne-data.ts`). I mellomtiden er kontoen låst ute, men abonnementet kan trekke penger (299 kr/mnd).
- Hva kan skje: Kunde betaler for en konto de ikke kan bruke, og kan kreve refusjon.
- Forslag til retting: Kanseller abonnement (`cancel_at_period_end`) i samme handling før `deletedAt`, som `cancelPro`.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-10 · Hvem som helst kan bli med i en hvilken som helst utfordring
- Alvorlighet: Høy
- Fil: `src/app/portal/(legacy)/utfordringer/actions.ts:141` (bliMed)
- Hva er galt: Bare at utfordringen finnes og er aktiv sjekkes. Bindende beslutning 22.09.2026 sier at deltakere velges fra venner og gruppe, aldri via delt lenke. `bliMed(challengeId)` er i praksis en åpen lenke: den som har ID-en blir med, også barn.
- Hva kan skje: Fremmede kommer inn i utfordringer med mindreårige og ser navn og score.
- Forslag til retting: `bliMed` bare for brukere som står i `hentGyldigeDeltakerIder(eier)` (venn/gruppe) eller har fått invitasjon. Fjern `bliMed` hvis den ikke brukes av annet enn lenke.
- PR-gruppe: P1-tilgang
- Status: Ny (test finnes for andre deler av utfordringer: `utfordringer/actions.test.ts`; sjekk om den dekker dette)

#### TP-11 · «Logg symptom» lagrer ingenting, men sier at det er lagret
- Alvorlighet: Høy
- Fil: `src/app/portal/meg/helse/symptom/ny/actions.ts:25` (`void input;` så `redirect`)
- Hva er galt: Actionen sjekker samtykke og sender deg tilbake, men skriver ikke noe til databasen. Helsedata spilleren fører går tapt uten varsel.
- Hva kan skje: Spiller tror smerte/symptom er registrert for coach/fysio. Det er det ikke.
- Forslag til retting: Enten bygg lagring (additivt via `db execute`, jf. gotchas) eller skjul skjermen til den virker.
- PR-gruppe: P3-data
- Status: Ny

#### TP-12 · Slagteller og øktnotat «lagres» uten å bli det
- Alvorlighet: Høy
- Fil: `src/app/portal/(fullscreen)/live/[sessionId]/tapper/page.tsx:134-151`, `src/app/portal/(fullscreen)/live/[sessionId]/summary/page.tsx:49-58`
- Hva er galt: De innebygde actions kaller `saveTapperCounts`, `finishTapperSession` og `lagreDineOrd`. Disse returnerer `{ ok:false, error }` ved feil (kaster ikke), men siden ignorerer returverdien og har tom `catch`. `handleFinish` sender deg til oppsummering selv om økten ikke ble fullført.
- Hva kan skje: Ved nettfeil, utløpt økt eller nektet tilgang mister spilleren ballantall og notat uten å få beskjed.
- Forslag til retting: Sjekk `ok`, vis feil, ikke redirect før lagret.
- PR-gruppe: P3-data
- Status: Ny

#### TP-13 · Betalingssperren (nivå) gjelder ikke alle actions
- Alvorlighet: Høy
- Fil: alle actions som bruker `requireConsentingUser`/`getCurrentUser` uten tilgangsnivå, f.eks. `mal/trackman/actions.ts` (importTrackMan, parseTrackManPhotoForPreview), `mal/goals-actions.ts`, `mal/runder/logg/actions.ts`, `(legacy)/ny-okt/actions.ts`, `live/[sessionId]/actions.ts`, `(legacy)/coach/actions.ts`, `(legacy)/tren/...`
- Hva er galt: Nivå-sperren (`kreverTilgang`: FULL/TALENT/INGEN) ligger i `requirePortalUser`, ikke i `requireConsentingUser`. En spiller på nivå INGEN eller TALENT (ikke betalt, gratis-vinduet gikk ut 1. september) kan kalle disse actions direkte selv om sidene redirecter dem.
- Hva kan skje: Gratis-/ikke-betalende kan bruke betalte funksjoner (TrackMan-import med bildetolkning via AI som koster penger, runder, mål).
- Forslag til retting: Én vakt som gjør samtykke + nivå, og bruk den i alle spillerflater. Velg nivå per action ut fra `talent-allowlist.ts`.
- PR-gruppe: P1-tilgang
- Status: Ny (for ikke-betalte spillere; sjekk at nivåene faktisk håndheves nå)

#### TP-14 · Foreldre-samtykke: skriver fritt i barnets innstillinger, og ingen aldersgrense
- Alvorlighet: Middels
- Fil: `src/app/forelder/samtykke/actions.ts:17` (lagreSamtykker, linje 38), `:61`/`:90` (settHelseSamtykkeForBarn, settDelingsSamtykkeForBarn)
- Hva er galt: (1) `lagreSamtykker(childId, samtykker: Record<string, boolean>)` flettes rett inn i barnets `preferences` uten nøkkelliste eller zod. Forelder (eller admin) kan skrive hvilken som helst nøkkel. (2) `settHelse…`/`settDelings…SamtykkeForBarn` sjekker godkjent relasjon, men ikke at barnet faktisk er under 16 (så en forelder kan gi/endre samtykke for en 17-åring) og `ADMIN` kan gi samtykke som «FORESATT». Eierskapet er ellers låst av `actions.test.ts`.
- Hva kan skje: Uventede nøkler i preferanser; juridisk uklare samtykker på vegne av en ungdom over 16 eller av admin.
- Forslag til retting: Egen zod-liste over tillatte samtykke-nøkler; avvis foreldre-samtykke når `!maaHaForesattSamtykke(barn)`; ADMIN skal ikke registreres som FORESATT.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-15 · Foreldresamtykke-lenken: svak token, rolle kan byttes, ingen bremse
- Alvorlighet: Middels
- Fil: `src/app/auth/guardian-consent/[token]/actions.ts:27` og `:69`, `prisma/schema.prisma:1176` (`token @default(cuid())`)
- Hva er galt: (a) Token lages med `cuid()` (delvis tidsbasert, ikke kryptografisk tilfeldig; lydsamtykke bruker `randomBytes(32)`). (b) Ingen rate limit på forsøk. (c) Hvis invitasjonens e-post tilhører en eksisterende spiller, endres den kontoen fra PLAYER til PARENT. (d) `guardianName` er fritekst uten validering og settes rett inn i HTML i e-postene. (e) Ingenting hindrer at invitert «forelder» er barnets egen e-post.
- Hva kan skje: Gjetting av lenke (lav sannsynlighet), spiller som mister spillertilgang, barn som godkjenner seg selv, HTML-injeksjon i e-post.
- Forslag til retting: `randomBytes(32)`-token (hash i DB), rate limit, ikke endre rolle på eksisterende konto (krev innlogget forelder), escape og lengdegrense på navn, avvis forelder-e-post lik barnets e-post.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-16 · Invitasjon til foresatt kan misbrukes til spam og selv-godkjenning
- Alvorlighet: Middels
- Fil: `src/app/auth/onboarding/actions.ts:525` og `resendGuardianInvitation`
- Hva er galt: Hvilken som helst innlogget bruker kan sende e-post med eget navn til hvilken som helst adresse, uten rate limit, og hver gang utløper tidligere invitasjoner.
- Hva kan skje: E-post-spam med AK Golf som avsender; barn kan sende invitasjonen til en egen e-postadresse og godkjenne selv.
- Forslag til retting: Rate limit per bruker og døgn; krev at foresatts e-post ≠ egen e-post; kopier ikke fritekst-navn rett inn.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-17 · Onboarding lagrer ikke-validert data
- Alvorlighet: Middels
- Fil: `src/app/auth/onboarding/actions.ts` (`saveSpillerOnboardingStep`, `saveForelderOnboardingStep`, `completeOnboarding`)
- Hva er galt: `data` spres rett inn i `preferences.onboarding` og kolonnene `phone`, `hcp`, `homeClub`, `playingYears`, `drillDelingGodtatt` uten zod (bare noen få felt valideres). Tillatt: vilkårlige nøkler (også `acceptedTerms: true`) og vilkårlige typer i HCP/telefon. `saveOnboardingProfile` validerer før innloggingskontroll og kaster rå zod-feil. Alle roller kan kalle.
- Hva kan skje: Ugyldige eller svært store JSON-verdier i brukerprofilen; feil HCP i statistikk; feil gir intern feiltekst.
- Forslag til retting: zod-skjema per steg (alle felt, `.strict()`), auth først, så validering.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-18 · Hvilken som helst coach kan godkjenne TrackMan-baseline for en annen spillers mål
- Alvorlighet: Middels
- Fil: `src/app/portal/tren/teknisk-plan/apply-tm-baseline.ts:11-35`
- Hva er galt: For COACH sjekkes bare rollen, ikke at spilleren er coachet av vedkommende (`harCoachTilgangTilSpiller`). `suggestion.goalId` skrives direkte. Samme mønster er korrekt i `lib/agents/actions.ts` (`kanBehandlePlanAction`).
- Hva kan skje: En coach endrer startverdi på målene til en spiller de ikke har.
- Forslag til retting: Bruk `assertPlanActionAccess`-mønsteret eller `harCoachTilgangTilSpiller`.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-19 · Anleggsvalg kan overstyre bruker-ID
- Alvorlighet: Middels
- Fil: `src/app/portal/planlegge/workbench/actions.ts:437` (`saveFacilities`: `create: { userId: user.id, ...state }`, `update: state`)
- Hva er galt: `state` er ikke validert og spres etter `userId`. Sender klienten `userId` i objektet, overstyrer det.
- Hva kan skje: Skrive anleggsprofil for en annen bruker, eller kræsje på ukjente felt (Prisma-feil vises).
- Forslag til retting: Plukk ut de ti boolske feltene eksplisitt (zod).
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-20 · «Dupliser øvelse» kopierer andres private øvelser og coach-notater
- Alvorlighet: Middels
- Fil: `src/lib/portal-drills/duplicate-drill.ts:23-55`
- Hva er galt: Original hentes med bare ID. Ingen sjekk på `visibility` eller eier. `coachNotes` kopieres med til spillerens kopi.
- Hva kan skje: Spiller får se en annen spillers private øvelse, og coachens interne notater (`coachNotes`) om en øvelse.
- Forslag til retting: Tillat kun øvelser som er offentlige/godkjente eller egne; ikke kopier `coachNotes`.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-21 · ID-er fra klienten brukes uten eiersjekk (flere små)
- Alvorlighet: Middels
- Fil: `src/app/portal/(legacy)/tren/turneringer/actions.ts:100` (oppdaterTournamentEntry: `seasonPlanId` fra annen bruker), `src/lib/plan-builder/index.ts:323` (genererPlanForslagCore: `turneringId` leser andres påmelding inn i AI-prompt), `src/app/portal/tren/teknisk-plan/actions.ts:370` (reorderPositions/reorderTasks: ID-er ikke sjekket mot plan), `src/lib/portal-live/actions.ts:215` (sendOktNotatTilCoach: `sessionId` ikke sjekket, varsler tilfeldig coach), `src/app/portal/(legacy)/coach/actions.ts` (createPlanChangeRequest: `planId`/`sessionId` ukontrollert), `src/app/portal/(legacy)/ny-okt/actions.ts:45` (exerciseId kan være andres private øvelse), `src/app/portal/(legacy)/onskeligokt/actions.ts:18` (coachId vilkårlig bruker)
- Hva er galt: Hver action sjekker innlogging, men ikke at den refererte raden tilhører brukeren.
- Hva kan skje: Små lekkasjer og forstyrrelser (andres turneringsnavn i en AI-plan, sortering av andres oppgaver, varsler til fremmede coacher, «planendringsønsker» knyttet til andres plan).
- Forslag til retting: En eierskaps-sjekk per ID (`where: { id, userId: user.id }`). Se lignende rettet mønster i `tapper/actions.ts`.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-22 · Fritekst og bilder sendes til AI uten vask
- Alvorlighet: Middels
- Fil: `src/lib/plan-builder/index.ts:323` (`egendefinertTekst` rett til Anthropic via `genererPlan`, ingen lengdegrense), `src/app/portal/mal/trackman/actions.ts:81` (`parseTrackManPhotoForPreview`: bilde til AI, ingen størrelses-/nivåsjekk), `src/app/portal/live/voice-actions.ts:19` (lydfil til Whisper uten størrelsesgrense)
- Hva er galt: Spillerens egen tekst kan inneholde navn (eget, andres, barns). Bildet av TrackMan-skjermen kan vise navn. Lydopptak av spillerens stemme/ord sendes til ekstern tjeneste. Ukensforslag (`week-suggest.ts`) er derimot rent (navn sendes ikke; verifisert).
- Hva kan skje: Persondata (også mindreårige) til AI-leverandør uten anonymisering, mot reglene «PII går aldri i sky-prompts uten anonymisering». Ubegrenset størrelse gir også kostnad.
- Forslag til retting: Bruk samme navnevask som Caddie (`src/lib/caddie/privacy.ts`) på `egendefinertTekst`; lengde- og størrelsesgrenser; nivåsjekk (TP-13).
- PR-gruppe: P1-tilgang
- Status: Ny (kjent åpent punkt i beslutninger.md §Personvern før annen kode, punkt 3)

#### TP-23 · Intern feiltekst vises til bruker
- Alvorlighet: Middels
- Fil: `src/lib/portal-coach/ph21-actions.ts:80,94,124,153,180` (alle `catch` returnerer `err.message`), `src/lib/actions/drills-actions.ts` (`err.message` fra Prisma), `src/app/portal/live/voice-actions.ts:36`, `src/app/portal/booking/actions.ts` (`err.message` fra booking), `src/lib/storage/avatar.ts` / `task-media.ts` (`error.message` fra lagring), `src/app/innsyn/talent/wagr-import/actions.ts` (synkWagrNaa), `src/app/portal/planlegge/bygger/actions.ts` (lagrePlanV2)
- Hva er galt: Rå systemfeil (Prisma, Supabase) returneres som feilmelding.
- Hva kan skje: Brukeren kan se tabell-/kolonnenavn og interne detaljer; ellers dårlig opplevelse.
- Forslag til retting: Logg detaljen, vis en fast norsk tekst.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-24 · Mangler validering (zod) i mange actions; ugyldig dato gir krasj
- Alvorlighet: Middels
- Fil: bl.a. `src/app/portal/mal/runder/[id]/actions.ts:208` (saveShot), `src/app/portal/mal/runder/ny/actions.ts` (`input.holeScores` ikke validert i enkeltslag-grenen: negative/NaN-slag), `src/app/portal/meg/actions.ts:51` (oppdaterProfil: HCP/navn uten grenser), `src/app/portal/(legacy)/ny-okt/actions.ts`, `onskeligokt/actions.ts`, `tren/aarsplan/periode/actions.ts`, `tren/[sessionId]/club-tagging-actions.ts`, `src/lib/gameplan/actions.ts`, `src/app/portal/(fullscreen)/live/[sessionId]/actions.ts` (logDrillReps: `successRate`, `notes` ubegrenset), `src/app/innsyn/talent/wagr-import/actions.ts` (ManuellInput), `src/lib/portal-coach/ph21-actions.ts` (tittel/body/rating), `tren/teknisk-plan/actions.ts` (`updateTaskBasics`: patch)
- Hva er galt: Argumenter brukes direkte i databaseskrivinger. `new Date(ugyldig)` gir «Invalid Date» som Prisma avviser med intern feil.
- Hva kan skje: Forurensede tall (feil score/hcp i statistikken), krasj med feiltekst, ubegrenset tekst.
- Forslag til retting: zod-skjema per action (mønster: `fysisk/actions.ts`, `opptatt-actions.ts`).
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-25 · «Anonym» tilbakemelding er ikke anonym
- Alvorlighet: Middels
- Fil: `src/app/portal/meg/feedback/actions.ts:24-45`
- Hva er galt: Ved «anonym» settes bare `actorId: "anonym"` i logglinjen. `appFeedback.create` lagrer `userId: user.id`, og logglinjen har fortsatt `target: user.id`.
- Hva kan skje: Brukeren tror svaret er anonymt og det er det ikke. Personvernløfte brytes.
- Forslag til retting: Lagre `userId: null` og ikke bruk bruker-ID i `target` når anonym.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-26 · Avbestilling kan treffe feil abonnement
- Alvorlighet: Middels
- Fil: `src/app/portal/meg/abonnement/avbestill/actions.ts:17-34`
- Hva er galt: Finner ikke abonnement av valgt type, faller koden tilbake til hvilket som helst abonnement brukeren har. Hvis det ikke finnes noe, logges «avbestilt» og brukeren sendes videre som om det virket.
- Hva kan skje: Bruker som vil avbestille coaching mister i stedet PlayerHQ (eller omvendt); eller tror avbestilling er gjort uten at noe skjedde.
- Forslag til retting: Ingen fallback; feilmelding hvis aktuell type ikke finnes.
- PR-gruppe: P1-tilgang
- Status: Ny (avbestill har test: `avbestill/actions.test.ts`, sjekk at den ikke låser fallback)

#### TP-27 · Push-abonnement tar imot hvilken som helst adresse
- Alvorlighet: Middels
- Fil: `src/lib/push/subscriptions.ts:26-60`
- Hva er galt: `endpoint`, `p256dh`, `auth` valideres ikke (ikke zod, ikke HTTPS, ikke tillatte push-tjenester). Serveren sender senere push til `endpoint`.
- Hva kan skje: Brukeren kan få serveren til å sende forespørsler til vilkårlige adresser (blind SSRF, altså at serveren «ringer» steder den ikke skulle).
- Forslag til retting: zod + tillatte verter (fcm.googleapis.com, web.push.apple.com, mozilla), maks lengde.
- PR-gruppe: P1-tilgang
- Status: Ny (jeg har ikke lest `src/lib/push.ts` fullt ut for å bekrefte at den sender uten verts-sjekk)

#### TP-28 · Offentlige lagringsområder for avatar og teknisk-plan-media
- Alvorlighet: Middels
- Fil: `src/lib/storage/avatar.ts:41` (bøtten «avatars», navn `users/<id>.<ext>`), `src/lib/storage/task-media.ts` (`TASK_MEDIA` er offentlig i `src/lib/storage/buckets.ts` `PUBLIC_BUCKETS`)
- Hva er galt: Profilbilder og bilder/video av spillerens teknikk ligger i åpne bøtter med forutsigbar sti. Avatar bruker bøtte «avatars» som ikke finnes i `STORAGE_BUCKETS` (uklart om den er offentlig/ er opprettet).
- Hva kan skje: Bilder og video av barn nåbare uten innlogging for den som har lenken (lenke lekker i delte skjermbilder/e-post). Bryter «barn vises aldri åpent».
- Forslag til retting: Privat bøtte + signerte lenker (som `coaching-videos`).
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-29 · Åpne skjemaer og e-post uten bremse
- Alvorlighet: Middels
- Fil: `src/app/(marketing)/kontakt/actions.ts:60` (ingen rate limit, ingen lengdegrense, ingen bot-beskyttelse), `src/app/(marketing)/booking/[slug]/bekreft/actions.ts:44` (offentlig, oppretter booking og slot-hold for en gjest-e-post, ingen rate limit; `coachId` fra klient kontrolleres mot ledige tider, så ok), `src/app/portal/meg/abonnement/faktura/[id]/actions.tsx` (PDF per kall, ingen grense; navn settes uescapet i HTML), `src/app/portal/meg/help/kontakt/actions.ts`
- Hva er galt: Ingen grense på hvor mange kall.
- Hva kan skje: Spam til post@akgolf.no og Resend-kostnad; tidsluker blokkert midlertidig av en bot (hold), ressursbruk på PDF.
- Forslag til retting: `rateLimit` (finnes og brukes i `deling/navngitt.ts`) per IP/bruker, honeypot/Turnstile på offentlige skjema.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-30 · Enhver coach kan endre eller slette felles øvelser
- Alvorlighet: Middels
- Fil: `src/app/portal/(legacy)/coach/ovelser/actions.ts:50,75`, `src/lib/actions/drills-actions.ts` (oppdaterOvelseAction, slettOvelseAction)
- Hva er galt: Ingen sjekk på `createdBy` eller eier; `videoUrl` er ikke validert som web-adresse. Hvem som helst med rolle COACH kan endre eller slette også Anders' felles øvelsesbank (sletting stoppes bare hvis øvelsen er i bruk).
- Hva kan skje: Utilsiktet eller bevisst sletting/endring av faglig innhold.
- Forslag til retting: Bare opphavsperson eller ADMIN; valider `videoUrl` (https).
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-31 · Innboksen: enhver coach kan sende e-post fra AK Golf
- Alvorlighet: Middels
- Fil: `src/lib/innboks/actions.ts:37` (sendGodkjentSvar), `arkiverEpost`
- Hva er galt: Tillater både ADMIN og COACH. Sender e-post til kundens adresse med fritekst, ingen lengdegrense. Rutinen sier at e-post til kunder ikke skal gå uten Anders' godkjenning og at økonomi/innboks er hans.
- Hva kan skje: En assistent-coach svarer kunder fra AK Golfs konto (og ser alle henvendelser).
- Forslag til retting: Bare head coach/admin.
- PR-gruppe: P1-tilgang
- Status: Ny (usikker om assistent-coach reelt har tilgang til innboks-siden; actionen i seg selv slipper dem inn)

#### TP-32 · Gammel melding-action til coach er ikke låst til egen coach
- Alvorlighet: Middels
- Fil: `src/app/portal/(legacy)/coach/actions.ts:142` (sendMessage)
- Hva er galt: Sjekker bare at spilleren er coachet og at mottaker er COACH/ADMIN. `coachId` kan være hvilken som helst coach. Den nye PH-21-veien (`ph21-actions.ts`, `coach/melding/ny/actions.ts`) er låst til egen coach (PR #1187); denne gamle er ikke. Meldingene lagres som JSON-liste (les-og-skriv), så to meldinger samtidig kan miste en.
- Hva kan skje: Spiller sender melding til en coach som ikke er deres.
- Forslag til retting: Samme sjekk som `hentPH21MottakerCoachId`; eller fjern den gamle actionen hvis ubrukt.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-33 · Dataeksport inneholder andres personopplysninger og interne felt
- Alvorlighet: Middels
- Fil: `src/app/portal/meg/innstillinger/actions.ts:84-100` (exportUserData: `parentRelations: { include: { parent: true } }`, `childRelations: { include: { child: true } }`, `fullUser`)
- Hva er galt: Eksporten tar med hele brukerradene til foresatte (og barn for en forelder), inkludert e-post, telefon, innstillinger og interne ID-er/Stripe-kunde.
- Hva kan skje: Et barn får ut forelderens fulle profil; en forelder får ut barnets (kan være ok, men uten markering). Brudd på dataminimering.
- Forslag til retting: Velg ut felter (`select`), uten interne id-er.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-34 · Talent-sporing og WAGR: coach kan legge til/slette hvem som helst
- Alvorlighet: Middels
- Fil: `src/app/innsyn/talent/discovery/actions.ts:30`, `src/app/innsyn/talent/wagr-import/actions.ts:46,155,176`
- Hva er galt: `leggTilITalent` tar `userId` fra skjema og sjekker ikke at brukeren er en spiller coachen følger (eller finnes). `importerWagrSpiller` kobler en WAGR-rad til en vilkårlig bruker via e-post, uten lengde-/tallvalidering; `slettWagrSnapshot` sletter hvilken som helst rad.
- Hva kan skje: Barn legges i talent-sporing uten at coachen har relasjon; feil kobling av rangering; sletting av andres data.
- Forslag til retting: `coachScopedPlayerWhere` på `userId`; zod på manuell import.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-35 · Økt-fullføring: deltakere kan fullføre andres økt
- Alvorlighet: Middels
- Fil: `src/app/portal/(fullscreen)/live/[sessionId]/actions.ts` (`verifyAccess`, `startSession`, `completeSession`)
- Hva er galt: Tilgang gis også til gruppeøkt-deltakere (ACCEPTED). Da kan en deltaker starte og fullføre økta for alle, og `completeSession` endrer eierens treningsplan-økt (`trainingPlanSession.updateMany` via `generertFraId`).
- Hva kan skje: En deltaker (eller kamerat) markerer en annens plan-økt som gjennomført, og påvirker etterlevelsestallet.
- Forslag til retting: Start/fullfør bare for eier/coach; deltakere kan bare logge egen drill.
- PR-gruppe: P1-tilgang
- Status: Ny

#### TP-36 · Dagsform-tilbakemelding overskriver øktnotater
- Alvorlighet: Lav
- Fil: `src/lib/portal-coach/ph21-actions.ts:107-130` (`data: { notes: noteText }`)
- Hva er galt: Erstatter eksisterende `notes` (som også inneholder talenotater, TP-06) i stedet for å føye til. `rating` er ikke validert.
- Hva kan skje: Tap av notat.
- Forslag til retting: Egen kolonne/JSON-felt som `lagreSpillerVurdering`, ikke `notes`.
- PR-gruppe: P3-data
- Status: Ny

#### TP-37 · «Del runde» gir en lenke som ikke finnes
- Alvorlighet: Lav
- Fil: `src/app/portal/mal/runder/[id]/actions.ts:49-70` (shareRound)
- Hva er galt: Returnerer `https://akgolf.no/r/<8 tegn av ID>`. Det finnes ingen rute `/r/`, og valgt synlighet («offentlig») lagres ikke. «coach» varsler alle coacher i alle grupper spilleren er med i (også gruppeeiere som ikke er «min coach»).
- Hva kan skje: Dødlenke og villedende «offentlig»-valg; for bred coach-varsling.
- Forslag til retting: Fjern eller bygg skikkelig (lagre valg, tilfeldig token); begrens varsling til valgt coach.
- PR-gruppe: P5-dødkode
- Status: Ny

#### TP-38 · Auth-gaten kan tystes og sjekker ikke eierskap
- Alvorlighet: Lav
- Fil: `scripts/check-action-auth.mjs`, `src/lib/auth/action-guards.ts` (`publicAction`)
- Hva er galt: Gaten godtar en fil som bare importerer og kaller en vakt. Den ser ikke at eierskap mangler (TP-05, TP-06) og `publicAction()` kalles på modulnivå og lar alle actions i filen slippe gjennom (TP-07).
- Hva kan skje: Nye hull kommer inn uten at noe røde lys tennes.
- Forslag til retting: Tillat `publicAction` bare for filer i en eksplisitt allowlist; legg til en enhetstest-mal per action som sjekker «annen bruker får nei» (som `coach-scope-idor.test.ts`).
- PR-gruppe: P4-tester
- Status: Ny

---

### Allerede låst av eksisterende tester (verifisert at testfil finnes og dekker eiersjekken)

- `src/app/forelder/samtykke/actions.test.ts`: godkjent relasjon, ikke andres barn, skriving for godkjent foresatt (ikke aldersgrense, jf. TP-14).
- `src/app/portal/meg/innstillinger/personvern/deling-samtykke-actions.test.ts` og `helse-samtykke-actions.test.ts`: medlemskap kreves, forelder-rolle avvises.
- `src/lib/deling/samtykke.test.ts`, `navngitt-regler.test.ts`, `profil-lesing.test.ts`: under 16 kan ikke gi selv, mindreårig kan trekke.
- `src/lib/auth/action-guards.test.ts`, `guards-avvis.test.ts`, `coach-scope-idor.test.ts`, `ekstern-leser-*.test.ts`, `spiller-side-tilgang.test.ts`.
- `src/app/portal/(legacy)/mal/goals-actions.test.ts`, `portal/fysisk/actions.test.ts`, `portal/kalender/opptatt-actions.test.ts`, `portal/meg/bookinger/actions.test.ts`, `portal/meg/profil/actions.test.ts`, `portal/meg/utstyrsbag/actions.test.ts`, `portal/mal/evaluering/actions.test.ts` (IUP), `lib/portal-gjennomfore/okt-status-actions.test.ts`, `lib/portal-tester/test-followup-actions.test.ts`, `lib/booking/credit-booking.test.ts`, `lib/agencyos/live-okt-actions.test.ts`, `lib/portal-coach/ph21-actions.test.ts`.
- IUP-eier/medlemskap: `src/lib/iup/*.test.ts`.

Ingen av testene over låser TP-01 til TP-13 (jeg fant ingen test for video-eierskap, slag-ID, talenotat, fødselsdato-endring, aldersgrense for lydsamtykke eller bliMed).

---

## 2. Dataintegritet (DI)

Grunnlag: `main` på 9f39c7d44, worktree `kodegjennomgang`. Bare lesing, ingen kjøring mot database.

### Oppsummering
- Kritisk: 0
- Høy: 6 (DI-01 til DI-05, DI-09)
- Middels: 12
- Lav: 9
- Totalt 27 funn.

**Dekket:** sesongåret (kalenderår mot skoleår), uke/dato/tidssone (inkl. uke 53), ukjent mot målt null i stats, SG, etterlevelse, ACWR, test, TrackMan, booking-kreditt, sletting og samtidig endring i Workbench/runder/live/booking, stille feil (`.catch(() => {})`), netto/brutto, enheter for putt, `as unknown as` på JSON.
**Ikke dekket (ikke lest til bunns):** alle 66 stedene som leser `prisma.round`, hele `src/lib/agents/*`, Stripe-webhook utover kreditt, TrackMan-import, Team Norway/WANG-skjermer, GDPR-sletting, cron-jobber. Tilgangsfeil er ikke vurdert her (annen agent).

**Det som ser godt ut (verifisert):** Workbench-økter slettes bare med lås på `updatedAt` og blokkeres hvis økten har gjennomføringshistorikk (`wb-actions.ts:1850-1870`, `1975-1990`); gruppeøkter skjules heller enn slettes. Sesonggrenser lagres med sammenlign-og-skriv (`workbench-samlet-sesong-actions.ts`). Booking med klippekort er atomisk og refunderer klipp ved avbestilling i samme transaksjon (`credit-booking.ts`, `meg/bookinger/actions.ts`). Etterlevelse returnerer `null`, ikke 0, når grunnlaget mangler (`domain/etterlevelse.ts`). Testresultat lagres bare ved komplett registrering (`validate-completion.ts`). Putt lagres i meter og vises i fot konsekvent. ISO-uke 53 regnes riktig i de aktive helperne (`uke-helpers.ts`, `ukeplan-schema.ts`, `plan-kontekst.ts`).

---

#### DI-01 · Sesong regnes som kalenderår, så skoleårsplaner (aug–jun) forsvinner etter nyttår
- Alvorlighet: Høy
- Fil: `src/lib/workbench/workbench-samlet-data.ts:76-77`, `src/lib/workbench/plan-kontekst.ts:107`, `src/lib/workbench/load-workbench.ts:333,409`, `src/lib/workbench/wb-actions.ts:937-940,1017-1020`, `src/app/portal/kalender/data.ts:183,196`, `src/lib/workbench/periode-core.ts:75-85`, `src/lib/workbench/gruppe-periode-actions.ts:135-141`, `src/lib/workbench/wb-actions.ts:343-345`
- Hva er galt: Årsplanen slås opp med `findFirst({ userId, year: kontekst.year })`, og `year` er kalenderåret til datoen som vises. Men en plan som lages i veilederen for aug 2026–jun 2027 lagres med `year = 2026` (startåret, `wb-actions.ts:345`). Opprettelse uten valgt plan (`opprettPeriodeCore`, `gruppe-periode-actions`) lager alltid en plan 1. jan–31. des med navnet «Sesong YYYY», selv om perioden går over nyttår, og sjekker ikke at perioden ligger innenfor planen. Startåret hentes dessuten på to måter (lokal tid `getFullYear()` i `periode-core`, UTC i `wb-actions`).
- Hva kan skje: En WANG-spiller har planen «2026/27». I februar 2027 åpner Anders Workbench for Tobias Lindvik: koden leter etter plan for år 2027, finner ingen, og viser ingen perioder, ingen periodefokus, ingen ukevolum-mål og ingen sesongkart. Planen ligger i basen, men er usynlig fra nyttår til juni. Legger han inn en ny periode i februar, lages det en ny tom «Sesong 2027» ved siden av. Da finnes to planer, og periodene ligger spredt.
- Forslag til retting: Finn aktiv plan på dato (`startDate <= dato <= endDate`), slik `portal-plan/uke-periode.ts:29` allerede gjør, ikke på `year`. Bruk `year` bare som etikett/startår. Ved opprettelse uten valgt plan: bruk planen som dekker datoen, ellers lag plan fra skolestart (aug) for WANG eller kalenderåret ellers, og valider at perioden ligger innenfor. Samle «hvilken sesong er dette» i én funksjon (jf. beslutning 28.09 om årsplan med fritt tidsrom).
- PR-gruppe: P3-data
- Status: Ny

#### DI-02 · PH-17 TrackMan viser oppdiktede økter og tall til spillere uten data, og ved feil
- Alvorlighet: Høy
- Fil: `src/lib/portal-analyse/load-ph17-trackman.ts:48-58,127-176`, `src/lib/portal-analyse/ph17-trackman-data.ts:142`, `src/components/portal/precision/PH17TrackMan.tsx:24,50`
- Hva er galt: Loaderen returnerer `STANDARD_PH17_DATA` (tre ferdig skrevne økter, gapping, utstyr, stasjonsrader) når spilleren ikke har økter, når det bare finnes færre enn tre køller (`gapping`), når `sessionItems` er tom, og i `catch` etter en databasefeil. Utstyret (`gear`) er alltid demodata. Snittverdier regnes som `sum / (antall || 1)`, så en kølle uten målt clubspeed/ballspeed/smash/launch/path viser 0 i stedet for «—».
- Hva kan skje: En ny spiller åpner TrackMan-fanen og ser økter, gapping og utstyr som ikke er hennes, med navnet sitt på toppen. Hvis databasen svarer med feil, vises demodata uten feilmelding. En kølle som mangler smash factor viser 0,00 og ser ut som en målt, svært dårlig verdi. Strider mot «ingen demodata i prod» og TruthLayer-regelen om at alt skal ha måling og kilde.
- Forslag til retting: Returner tom tilstand (`null`/«Ingen TrackMan-økter ennå») i stedet for demodata, og la feil vise en feiltilstand. Regn snitt bare over verdier som finnes og returner `null` ellers (slik `snittFace`/`snittSpin` allerede gjør).
- PR-gruppe: P3-data
- Status: Ny

#### DI-03 · Offentlig statistikkside «Årgang» fyller inn oppdiktede spillere og tall
- Alvorlighet: Høy
- Fil: `src/app/(marketing)/stats/aargang/[aar]/page.tsx:150-190` (`fallbackTopp10`, `scoreDist` med `|| 2`, `|| 5`, `|| 12`…, `totalSpillere … : 87`), og tilsvarende `norskeFallback` i `src/app/(marketing)/stats/leaderboards/page.tsx:100-`
- Hva er galt: Når databasen har under tre spillere vises en hardkodet topp 10 med personnavn og snitt. Hver score-gruppe i histogrammet får en oppdiktet verdi (`|| 12`) når tellingen er 0, så en tom gruppe vises som 12 spillere. Antall spillere faller tilbake til 87. Dessuten er alder hardkodet som `2026 - aar`.
- Hva kan skje: En forelder eller journalist ser rangering og fordeling for en årgang som ikke finnes i dataene. Navnene er trolig oppdiktede, men kan treffe ekte personer. Alt dette står på en åpen side uten forbehold. Brutto score/«ikke oppdikt tall»-regelen brytes.
- Forslag til retting: Fjern fallback-dataene. Vis «Ikke nok data» når grunnlaget er for lite. Regn alder fra gjeldende år.
- PR-gruppe: P3-data
- Status: Ny

#### DI-04 · Å redigere et scorekort sletter slag og hull uten advarsel, uten lås, og SG regnes utenfor transaksjonen
- Alvorlighet: Høy
- Fil: `src/app/portal/mal/runder/[id]/actions.ts:436-486` (`lagreHullScorer`), `501-540` (`lagreHullKjede`), `293-340` (`importUpGameHoleScores`), `259-265` (`deleteShot`)
- Hva er galt: `lagreHullScorer` tar listen over hull og (a) sletter alle hull som ikke er med, (b) sletter hele slagkjeden for hvert hull der antall slag er endret, og (c) setter rundens totalscore til summen av hullene som ble sendt inn. Det er ingen sjekk på `updatedAt`, ingen bekreftelse og ingen angre. `recomputeRoundSg` kjøres etter at transaksjonen er ferdig, så feiler den ligger runden med ny score og gammel SG. `deleteShot` er hard sletting.
- Hva kan skje: Tobias har ført slag for slag på 18 hull på telefonen. Han åpner samme runde på iPad (gammel visning) og lagrer scorekortet med færre hull eller en rettet score på hull 7: slagkjeden for hull 7 forsvinner stille, og hvis iPad-listen mangler hull, forsvinner de også, og totalscoren faller til summen av de gjenværende hullene. Ingen varsel. Samtidig endring fra to enheter vinner den siste.
- Forslag til retting: Send med `expectedUpdatedAt` for runden og avvis ved avvik. Krev eksplisitt bekreftelse («slagene på hull 7 slettes») før sletting av kjeder. Flytt SG-omregning inn i samme transaksjon, eller marker runden som «SG må regnes om» hvis den feiler. Vurder myk sletting av slag.
- PR-gruppe: P3-data
- Status: Ny

#### DI-05 · ACWR (belastningsratio) gir falsk «kraftig økning» for alle med under fire ukers historikk, og teller hoppede økter
- Alvorlighet: Høy
- Fil: `src/lib/workbench/load-workbench.ts:805-826`, `src/lib/health/belastning.ts:41-67`, vist i `src/components/portal/v2/WorkbenchV2.tsx:888-900`
- Hva er galt: Kronisk last deles alltid på 28 dager (eller 4 uker), også når spilleren bare har data fra siste uke. `harData` betyr bare «kronisk > 0». Ratio = akutt/kronisk blir da 4,0 for en spiller med én trent uke og ellers ingenting. I Workbench teller alle planlagte økter i vinduet uavhengig av status, også hoppet over, avbrutt og avlyst (kommentaren sier det er med vilje, men tallet vises som belastning). `belastning.ts` teller bare fullførte økter og anslår hver runde til 240 min, så de to ACWR-tallene i appen er ikke like for samme spiller.
- Hva kan skje: Coach ser advarselen «Kraftig belastningsøkning (ACWR > 1,4) — vurder å lette uka» for en spiller som nettopp har begynt, eller etter en ferie. En spiller som hoppet over alle øktene sine i uka får høy «belastning». Coach justerer plan på feil grunnlag.
- Forslag til retting: Krev minst 21–28 dagers historikk før ratio vises (ellers «—»). Tell bare gjennomførte økter, eller merk tydelig «planlagt». Bruk ett felles regnestykke. Ikke bruk ACWR i varselstekst før formelen er avklart (beslutningene sier ACWR i stall er hardkodet/«—» til den er regnet ut).
- PR-gruppe: P3-data
- Status: Ny

#### DI-06 · Manglende prosent blir 0 i snitt og aksevisning for etterlevelse
- Alvorlighet: Middels
- Fil: `src/lib/admin-compliance/compliance-data.ts:332,338`, `src/lib/admin/stallen-data.ts:328`, `src/components/portal/v2/WorkbenchV2.tsx:1091`, `src/components/admin/v2/AdminComplianceV2.tsx:188`
- Hva er galt: Etterlevelse returnerer riktig `null` når ingen økter har passert slutt, men flere brukere gjør `?? 0` av den. Gjennomsnittet for stallen (`cohortAvg`) summerer `s.pct ?? 0` og deler på alle spillere med plan, så spillere uten forfalte økter drar snittet ned. Stallen viser `pct: result.pct ?? 0` per akse (alarm er riktig bare for `!== null`). Sorteringen behandler `null` som 0 og legger dem øverst som «bakerst».
- Hva kan skje: Etter en ferie eller en ny plan viser stallen lavt snitt og 0 % på akser der ingen økt er forfalt ennå. Coach tror spillere ligger bak, mens det egentlig er «ingen data».
- Forslag til retting: Utelat `null` fra snittet (som `cohortMedian` allerede gjør), vis «—» per akse og sorter `null` sist. Sjekk også `data.adherencePct ?? 0` i Workbench (vis «—»).
- PR-gruppe: P3-data
- Status: Ny

#### DI-07 · Slagchips og SG-kort viser «0 FT» / «0 M» / 0,0 når målingen mangler
- Alvorlighet: Middels
- Fil: `src/lib/portal-runder/ph08-09-data.ts:133,135`, `src/app/portal/coach/sg-hub/page.tsx:42-46`, `src/lib/portal-runder/ph18-data.ts:164-168`, `src/app/portal/spiller/[spillerId]/page.tsx:123`
- Hva er galt: `slag.fot ?? 0` og `slag.meter ?? 0` gjør et slag uten avstand til «PUTT 0 FT». SG-hubben viser `sgOtt/sgApp/sgArg/sgPutt ?? 0` per kategori: bare «ingen input i det hele tatt» er skilt ut (`ingenData`), så én manglende kategori (f.eks. putting ikke ført) vises som 0,0 slag. PH-18 hullsnitt bruker `par ?? 0` og `snitt = 0` for hull uten data, og «dyreste/beste hull» velges blant disse nullene.
- Hva kan skje: En spiller som ikke har ført putting ser «Putting 0,0», som leses som «helt gjennomsnittlig». «Beste hull» kan bli et hull uten data.
- Forslag til retting: La verdiene være `number | null` hele veien og vis «—». Utelat hull uten data fra dyreste/beste.
- PR-gruppe: P3-data
- Status: Ny

#### DI-08 · Forelderens økonomivisning viser 0 kr når tallene mangler
- Alvorlighet: Middels
- Fil: `src/app/forelder/okonomi/page.tsx:80-89`
- Hva er galt: `betaltIAarOre ?? 0`, `utestaaendeOre ?? 0`, `monthlyCredits ?? 0`, `creditsRemaining ?? 0` når barnets oppsummering eller abonnement ikke finnes.
- Hva kan skje: Forelderen ser «0 kr utestående» og «0 klipp igjen» når systemet egentlig ikke har noe svar (feil, manglende rad). Hun tror hun ikke skylder noe eller har brukt opp klippene.
- Forslag til retting: Skille «ingen rad» fra «0» og vis «—» / «Ikke tilgjengelig».
- PR-gruppe: P3-data
- Status: Ny

#### DI-09 · Faktura-PDF deler beløpet 80/20 i netto og mva uten å lese det fra betalingen
- Alvorlighet: Høy
- Fil: `src/app/portal/meg/abonnement/faktura/[id]/page.tsx:71-72`, `src/app/portal/meg/abonnement/faktura/[id]/faktura-document.tsx:395-396` (kommentaren på linje 6 sier selv at splitten er avledet)
- Hva er galt: `netto = round(beløp × 0,8)` og `mva = beløp − netto` er antakelser (25 % mva), ikke tall fra Stripe/Tripletex.
- Hva kan skje: Kunden får en faktura/kvittering med mva-linje som kan være feil (treningstjenester og abonnement kan ha ulik mva-behandling; avrunding stemmer ikke mot Tripletex). Beløp merket «Netto» og «MVA» kan avvike fra regnskapet.
- Forslag til retting: Hent mva og netto fra betalingen/Stripe tax, eller fjern linjene og kall dokumentet «kvittering» uten mva-spesifikasjon til tallene er verifisert mot Tripletex.
- PR-gruppe: P3-data
- Status: Usikker (må avklares med regnskapsfører om mva-sats per produkt)

#### DI-10 · Netto-klasser kjennes igjen på «ender på N», ikke hviteliste, og to ulike regler brukes
- Alvorlighet: Middels
- Fil: `src/lib/scrapers/golfbox.ts:285-295` (`erNettoKlasse`), `src/lib/domain/turneringsresultat.ts:30,44,47`
- Hva er galt: Prosjektregelen (gotchas/CLAUDE) sier netto filtreres med hviteliste av faktiske nettokoder, aldri «ender på N». Begge steder brukes mønstre som `(\s|-)N$`, `(N)$`, `\bnet\b`. De to reglene er ikke like (skraperen tar også eksakt «N» og «Net»). I `lesTurneringsresultat` blokkeres bare `plassering` og `motPar` for nettoklasser, mens `brutto` (`totalScore`) ikke sjekker klassen.
- Hva kan skje: En brutto-klasse hvis navn ender med « N» (f.eks. et klubbnavn eller en gruppe) feiltolkes som netto, og spillerens plassering og til-par forsvinner. Motsatt kan en nettoklasse med uvanlig navn slippe gjennom som brutto. For eldre rader uten rundeblokk (`blob == null`) vises `totalScore` som brutto uten klassesjekk.
- Forslag til retting: Én felles hviteliste/funksjon som begge bruker, og som eies av pipelines (D-regel «ak-golf-pipelines er eneste kilde»). Legg klassesjekk også på `brutto` for rader uten rundeblokk.
- PR-gruppe: P3-data
- Status: Usikker (må sjekkes mot faktiske klassenavn i `public_player_entries.klasseNavn`)

#### DI-11 · Live-økt: siste skriving vinner, uten versjonsnummer på serveren
- Alvorlighet: Middels
- Fil: `src/app/api/portal/live/[sessionId]/snapshot/route.ts:68-75`, `src/lib/portal-live/actions.ts:147,190`, `src/lib/workbench/wb-actions.ts:2210`
- Hva er galt: Snapshot-ruten overskriver `liveSnapshot` på økten uten å sammenligne revisjon. Klienten har `revision`/`synketRevision` lokalt (`live-state.ts`), men serveren sjekker dem ikke.
- Hva kan skje: Spilleren har en gammel fane åpen på iPad og økten pågår på telefonen. Fanen sender et eldre øyeblikksbilde og overskriver nyere repetisjoner. Reps går tapt uten varsel.
- Forslag til retting: Send `revision` med og avvis (409) hvis serverens revisjon er høyere; la klienten slå sammen.
- PR-gruppe: P3-data
- Status: Ny

#### DI-12 · Perioder (PeriodBlock) har ingen versjon/lås og slettes hardt
- Alvorlighet: Middels
- Fil: `src/lib/workbench/periode-core.ts:98-131` (`oppdaterPeriodeCore`, `slettPeriodeCore`), `prisma/schema.prisma:3618-3645`, `src/app/portal/(legacy)/tren/aarsplan/periode/actions.ts:124`
- Hva er galt: `PeriodBlock` mangler `updatedAt`, så ingen sammenlign-og-skriv er mulig. `slettPeriodeCore` gjør `delete` rett etter eierskapssjekk, uten angre. (Sesonggrensene og økter i samme område har lås, så dette er et hull i ellers godt mønster.)
- Hva kan skje: Coach og spiller redigerer samme periode samtidig, siste lagring vinner. En periode med fokus, ukevolum og øktbudsjett kan slettes med ett trykk og kan ikke hentes tilbake.
- Forslag til retting: Legg til `updatedAt` (additivt via `db execute`) og bruk `expectedUpdatedAt`. Vurder «angre» som for planhandlinger (`plan-angre-token.ts`).
- PR-gruppe: P7-skjema
- Status: Ny

#### DI-13 · Sletting uten angre: mål, tester, slag, turneringspåmelding
- Alvorlighet: Lav
- Fil: `src/app/portal/(legacy)/mal/goals-actions.ts:156`, `src/app/portal/mal/runder/[id]/actions.ts:263`, `src/app/portal/(legacy)/tren/turneringer/actions.ts:531`, `src/lib/actions/test-shot-actions.ts:104-113`, `src/lib/storage/video.ts:97,168`
- Hva er galt: `goal.delete`, `shot.delete`, `tournamentEntry.delete` er hard sletting direkte fra en knapp. Videoopprydding sletter storage-filen med `.catch(() => {})` og deretter rad (`video.ts:168-169`), så en feil i storage gir en rad uten fil, eller omvendt en fil uten rad (`video.ts:97`).
- Hva kan skje: Spiller sletter et mål og mister fremdriften for godt; en video kan bli liggende som fil uten rad.
- Forslag til retting: Vurder myk sletting (`deletedAt`) for mål og påmeldinger. Logg feil fra storage-opprydding.
- PR-gruppe: Ingen (bare rapport)
- Status: Ny

#### DI-14 · Test-slag-funksjoner uten tilgangskontroll i en «use server»-fil (ingen kallere) (telles som TP-07)
- Alvorlighet: Middels
- Fil: `src/lib/actions/test-shot-actions.ts:8-20,104-113` (`createTestShot`, `deleteTestShotsForResult`, `migrateDetailsJsonToTestShots`)
- Hva er galt: Filen er merket «use server» og kaller bare `publicAction()` (en tom markør). Funksjonene tar `testResultId` og skriver/sletter uten å sjekke hvem som ber om det eller at resultatet tilhører brukeren. Ingen andre filer importerer dem (ingen kallere funnet i `src/`).
- Hva kan skje: Hvis Next gjør eksporten nåbar som server action, kunne hvem som helst slette alle slag for et annet testresultat når id-en er kjent. Siden ingen importerer filen, fjernes den trolig fra bygget, men det er ikke verifisert.
- Forslag til retting: Slett filen (dødkode), eller legg på innlogging og eierskapssjekk. Sjekk i bygget om action-id-ene finnes.
- PR-gruppe: P1-tilgang
- Status: Usikker (må sjekkes i et bygg om funksjonene er eksponert)

#### DI-15 · To tidskonvensjoner blandes: «naiv veggklokke» mot ekte tidspunkt
- Alvorlighet: Middels
- Fil: `src/lib/domain/etterlevelse.ts:25-27` mot `src/lib/portal/etterlevelse-data.ts:14-23` (kaller med `new Date()`), `src/lib/workbench/workbench-samlet-volum.ts:73,88`, `src/lib/google-calendar-tid.ts:70-100`, `src/lib/booking/policy.ts:59-68`
- Hva er galt: `scheduledAt` for trening lagres som Oslo-klokkeslett skrevet som om det var UTC (tester bruker `09:00Z` for 09:00 Oslo). Booking og kalender konverterer riktig (`tilNaivVeggklokke`/`naivOsloTilTidspunkt`), men etterlevelse, compliance og belastning sammenligner ekte `now` (UTC) direkte mot disse tidspunktene. `TrainingSessionV2.startTime` regnes derimot som ekte tidspunkt og konverteres.
- Hva kan skje: En økt 09:00–10:00 Oslo regnes først som «forfalt» kl. 12:00 (sommertid) eller 11:00 (vintertid) Oslo-tid. Etterlevelsen er 1–2 timer forsinket, og dagens dato kan peke feil mellom 00:00 og 02:00.
- Forslag til retting: Konverter `now` med `tilNaivVeggklokke(new Date())` der det sammenlignes mot lagrede økter, i én felles hjelper. Dokumenter hvilke felt som er naive.
- PR-gruppe: P3-data
- Status: Usikker (verifisert for etterlevelse; ikke alle kallere sjekket)

#### DI-16 · «I dag» fra nettleserens UTC-dato gir gårsdagen mellom 00 og 02 norsk tid
- Alvorlighet: Middels
- Fil: `src/components/portal/runde-logg/oppsett-steg.tsx:51,125`, `src/components/portal/v2/TreningLoggV2.tsx:23`, `src/components/portal/v2/OnskeligOktV2.tsx:56`, `src/components/admin/add-session-wizard.tsx:94`, `src/components/portal/v2/MalByggerV2.tsx:176`, `src/components/portal/precision/PHIUP01Fireukerssjekk.tsx:184`, `src/app/team-wang/coach/coach-arsplan.tsx:108`, `src/app/portal/meg/helse/page.tsx:123` (server, UTC), `src/components/shared/trackman-import-modal.tsx:152`, `src/app/auth/onboarding/onboarding-wizard.tsx:496`
- Hva er galt: `new Date().toISOString().slice(0, 10)` gir UTC-dato. I Norge er det i sommertid 00:00–02:00 (vintertid 00:00–01:00) fortsatt «i går». Regelen i `gotchas.md` §Tid forbyr dette. Rundeskjemaet bruker det både som standarddato og som `max`.
- Hva kan skje: Spilleren registrerer en runde kl. 00:30 etter kveldsgolf: standarddatoen er i går, og «i dag» kan ikke velges (max = i går). Mål får feil startdato, IUP-fireukerssjekk får «levert»-dato i går, og Mål/TrackMan-import får feil dag.
- Forslag til retting: Én felles hjelper `osloDagIso(new Date())` (`Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" })`) og bruk den i alle disse.
- PR-gruppe: P3-data
- Status: Ny

#### DI-17 · Server-kode med rå `setHours(0,0,0,0)` / `getDay()` på `new Date()`
- Alvorlighet: Lav
- Fil: `src/lib/streak.ts:14`, `src/lib/admin-brief.ts:21`, `src/lib/admin/stallen-data.ts:200`, `src/lib/admin/oppsett/lastere.ts:134`, `src/lib/agencyos/daily-brief-data.tsx:149,605-615`, `src/lib/booking/availability.ts:55,94`, `src/lib/stats/turnering-queries.ts:76-79`, `src/lib/portal-fysisk/fysisk-data.ts:165`, `src/lib/admin-kalender/week-data.ts:121,168`, `src/lib/workbench/load-workbench.ts:756,782`
- Hva er galt: På Vercel (UTC) peker dette på UTC-dagen. Hjelperne i `uke-helpers.ts` finnes for å unngå akkurat dette.
- Hva kan skje: Mellom 00:00 og 02:00 norsk tid regnes «i dag», ukedag og «nå»-linjen i Workbench/kalender og dagsbrief som i går. Streak kan brytes for noen som trente rett før midnatt.
- Forslag til retting: Bruk `startOfDay`/`startOfWeek`/`dagNavn*` fra `uke-helpers.ts`.
- PR-gruppe: P3-data
- Status: Ny

#### DI-18 · Enkelte steder lager årsområder med lokal `new Date(year,0,1)`, og eldre helper regner uke feil
- Alvorlighet: Lav
- Fil: `src/lib/training/korrelasjon.ts:47-61` (`nesteIsoUke`), `src/components/shared/calendar/AarsplanView.tsx:44-58,113` (52 kolonner, uke = dag/7), `src/components/portal/v2/WorkbenchAarsplan.tsx:59-64`
- Hva er galt: `nesteIsoUke` finner «siste uke i året» som `ceil(dagnr(28. des)/7)`, som alltid blir 52. 2026, 2020 og 2032 har uke 53, så uke 53 hoppes over og uke 52 går rett til neste års uke 1. `AarsplanView` har fast 52 kolonner og regner uke som `floor(dagIAar/7)+1` (ikke ISO-uke, uke 53 og 1.–3. jan havner feil). Begge er i praksis ubrukt (`koblTreningOgSg` brukes bare i test, `AarsplanView` importeres ikke andre steder). `WorkbenchAarsplan.dagIAaret` bruker millisekunder/døgn og blir én dag skjev for lokale midnattsdatoer etter sommertid starter (23-timers døgn).
- Hva kan skje: Hvis en av disse tas i bruk igjen: korrelasjon mellom trening og SG mister uke 53 i 2026, og Gantt-visningen viser perioder én uke feil. Forskyvning på én dag i dra-og-slipp i årsplanen etter mars.
- Forslag til retting: Slett dødkoden eller bruk `isoUkeIdentitet`/`isoUkeMandag` fra `ukeplan-schema.ts`. Bruk kalenderdag-aritmetikk (UTC) i `dagIAaret`.
- PR-gruppe: P5-dødkode
- Status: Ny

#### DI-19 · Syv egne kopier av ISO-ukeregning
- Alvorlighet: Lav
- Fil: `src/app/team-wang/coach/coach-arsplan.tsx:49`, `src/app/team-wang/_components/fane-kalender.tsx:67`, `src/components/shared/calendar/CalendarShell.tsx:214`, `src/components/shared/calendar/AarsplanView.tsx:44`, `src/lib/workbench/ukeplan-schema.ts:53`, `src/lib/domain/workbench/operations.ts:391`, `src/lib/workbench/plan-kontekst.ts:51`
- Hva er galt: Alle gir riktig svar for uke 53 i dag (testet mentalt mot torsdagsregelen), men det er syv kopier. Kopiene som bruker `getFullYear()`/`getDate()` på `Date` er avhengige av enhetens tidssone.
- Hva kan skje: Fremtidig endring i én kopi gir uke-uenighet mellom visninger.
- Forslag til retting: Samle til `isoUkeIdentitet` i `uke-helpers.ts`.
- PR-gruppe: P5-dødkode
- Status: Ny

#### DI-20 · Rundekladd (localStorage) kastes stille hvis formatet endres
- Alvorlighet: Middels
- Fil: `src/lib/runde-logg/draft.ts:1-12` (kommentaren: «ødelagt/utdatert kladd forkastes stille»), nøkkel `akgolf.runde-logg.kladd.v2`
- Hva er galt: En pågående runde ligger bare i nettleseren til serveren har bekreftet. Passerer kladden ikke zod-skjemaet (f.eks. etter en utgivelse som endrer skjemaet eller en ny lie-verdi) forkastes den uten varsel.
- Hva kan skje: Spilleren er på hull 12, appen oppdateres midt i runden, siden lastes på nytt, og alle førte slag er borte uten beskjed.
- Forslag til retting: Behold den gamle kladden under en annen nøkkel, migrer, og vis «Fant en runde vi ikke kunne åpne, last ned». Test at skjemaendringer er bakoverkompatible.
- PR-gruppe: P3-data
- Status: Ny

#### DI-21 · Sesongsnitt til A–K-kategori blander 9- og 18-hullsrunder og kalenderåret
- Alvorlighet: Middels
- Fil: `src/lib/domain/spiller-kategori.ts:48-60` (`hentSesongSnittscore`)
- Hva er galt: Snittet er gjennomsnitt av `Round.score` for alle runder siden 1. januar, uten å skille 9 og 18 hull (PH-16 gjør det riktig med «18-hullsrunder» og minst fire runder, `ph16-stats-data.ts`). I tillegg regnes «sesong» som kalenderår, så snittet er tomt 1. januar.
- Hva kan skje: En spiller med flere niårsrunder (score rundt 40) får et snitt som trekkes ned mot 60, og blir plassert i en altfor høy A–K-kategori. Kategorien styrer øvelsesfilter og AI-planforslag, så spilleren får feil treningsforslag.
- Forslag til retting: Bruk samme regel som PH-16 (siste 10 18-hullsrunder, minst 4). Return `null` ellers.
- PR-gruppe: P3-data
- Status: Ny

#### DI-22 · Puttavstand fot → meter → fot flytter 15 og 40 fot over i neste SG-bøtte
- Alvorlighet: Lav
- Fil: `src/components/portal/runde-logg/avstand-velger.tsx:15-16`, `src/lib/runde-logg/granulaer-sg.ts:25-33`
- Hva er galt: Velgeren runder meter til én desimal. En 15-fots putt lagres som 4,6 m (= 15,09 ft) og en 40-fots putt som 12,2 m (= 40,03 ft). Bøttegrensene er «≤ 15» og «≤ 40», så begge havner i bøtten over. (Verifisert for 1–60 fot: bare 15 og 40 er berørt.) Enheten er ellers konsekvent: meter lagret, fot vist.
- Hva kan skje: Putter fra 15 og 40 fot telles som 15–25 og 40+, og SG per puttlengde forskyves litt.
- Forslag til retting: Lagre ufortrutt (`ft / 3.28084` uten avrunding) eller regn bøtte med toleranse (`fot <= 15.1`).
- PR-gruppe: P3-data
- Status: Ny

#### DI-23 · Test-score blir 0 når det ikke finnes gyldige verdier (forhåndsvisning)
- Alvorlighet: Lav
- Fil: `src/lib/portal-tester/test-scoring.ts:217-219,285-290,321-324,350`
- Hva er galt: `snitt([]) = 0`, `min`/`max` uten verdier = 0, `PEI` uten gyldige slag = 0. For tester der lavere er bedre er 0 «best mulig». Lagring blokkeres riktig av `validate-completion.ts`, så et ufullstendig resultat lagres ikke, men live-forhåndsvisningen i scorekortet bruker samme motor (`scorekort-klient.tsx:261`).
- Hva kan skje: Midt i en PEI-test, før første slag, viser forhåndsvisningen score 0 (perfekt) i stedet for «—».
- Forslag til retting: Returner `null` fra motoren når `antallSlag === 0`, og vis «—».
- PR-gruppe: P4-tester
- Status: Ny

#### DI-24 · Offentlige Data Golf-sider viser 0 for manglende SG, putts og fairway
- Alvorlighet: Lav
- Fil: `src/app/(marketing)/stats/pga/spillere/page.tsx:95-99`, `src/app/(marketing)/stats/pga/spillere/[dg_id]/page.tsx:96-105`, `src/app/(marketing)/stats/sg-sammenlign/resultat/[id]/page.tsx:109-123`, `src/app/(marketing)/stats/sg-sammenlign/actions.ts:86`
- Hva er galt: `db.sgTotal ?? 0`, `puttsPerRound ?? 0`, `avgScore ?? 0`, `fairwayPct ?? 0`. En proff uten tall vises med 0,0 SG og 0 putts per runde. (Leaderboard-lista filtrerer riktig på `!= null` før sortering.) I `sg-sammenlign` blir en manglende SG-kategori 0 i summen.
- Hva kan skje: Spiller uten målt putting får «SG putting 0,0» og «0 putts per runde» på åpen side. «Powered by Data Golf»-flatene viser dermed tall Data Golf ikke har levert.
- Forslag til retting: Behold `null` og vis «—».
- PR-gruppe: P2-datagolf
- Status: Ny

#### DI-25 · Kurvedata: runde uten score blir 0, tilleggsfelt blir 0 ved manglende data
- Alvorlighet: Lav
- Fil: `src/lib/portal/min-kurve-data.ts:70-71`, `src/lib/sg-hub/fatigue.ts:74`, `src/lib/workbench/load-workbench.ts:828-835` (`pctOfTotal30` gir 0 uten data)
- Hva er galt: `toparTotal: result.motPar ?? 0` og `rundescorer: ... brutto ?? 0` fylles med 0. `fullstendig` er satt riktig bare når `motPar != null`, så konsekvensene er avgrenset. Fatigue: `targetSpeed: valid[0]?.clubSpeed ?? 0`. Akseprosent i Workbench er 0 når spilleren ikke har treningsdata siste 30 dager.
- Hva kan skje: En ufullstendig turnering kan tegnes som 0 mot par i kurven hvis noen senere fjerner `fullstendig`-sjekken. Akser vises som «0 %» i stedet for «—».
- Forslag til retting: Bruk `number | null` i `KurveRad`.
- PR-gruppe: P3-data
- Status: Ny

#### DI-26 · Samme økt-/runde-sletting påvirker mange steder uten transaksjon rundt lagring og speiling
- Alvorlighet: Middels
- Fil: `src/lib/workbench/wb-session-write.ts:196-216` (`removeWbSession` sletter V2-speil først, deretter økten, uten transaksjon og uten gjennomføringssjekk), `src/lib/workbench/session-actions.ts:207`, `src/lib/workbench/drill-actions.ts:371`
- Hva er galt: `removeWbSession` (den eldre veien) kaller `deleteV2ForPlanSession` og deretter `workbenchSession.delete({ where: { id } })` uten `updatedAt`-lås og uten sjekk av `harGjennomforingshistorikk`, som den nyere `wb-actions.ts`-veien har. Hvis andre sletting feiler etter at speilet er slettet, har økten mistet speilraden. Tilsvarende `session-actions.ts:207` og `drill-actions.ts:371` sletter direkte.
- Hva kan skje: Hvis denne varianten fortsatt kalles fra en flate, kan en gjennomført økt med faktiske minutter og RPE slettes, og tallene i etterlevelse og volum faller. Jeg har ikke sporet alle kallere.
- Forslag til retting: Fjern den eldre veien eller la den kalle samme vakt som `wb-actions.ts`. Gjør speilsletting og hovedsletting i én transaksjon.
- PR-gruppe: P3-data
- Status: Usikker (kallere ikke fullt sporet)

#### DI-27 · JSON-felt leses med cast i stedet for zod (få, men forretningsnære)
- Alvorlighet: Lav
- Fil: `src/lib/talent/test-sync.ts:98,109,129` (`milepaeler as unknown as Milepael[]`), `src/app/api/cron/webhook-retry/route.ts:86` (`rad.payload as unknown as Stripe.Event`), `src/lib/agents/fabrikk-agent.ts:41`
- Hva er galt: Disse leser JSON fra basen uten `safeParse`. De fleste andre steder (Workbench, tester, Live) bruker zod riktig; resten av `as unknown as` (ca. 64 forekomster) er skriv til `Prisma.InputJsonValue` og er greie.
- Hva kan skje: Er `milepaeler` ikke en liste, skrives `[...gamle, ...nye]` over med feil innhold. En ødelagt webhook-payload ville krasjet retry-jobben.
- Forslag til retting: `safeParse` med lite skjema og falle tilbake til `[]` (talent) eller markere raden som defekt (webhook).
- PR-gruppe: P3-data
- Status: Ny

---

### Svar på de seks punktene
1. Datatap: DI-04, DI-11, DI-12, DI-13, DI-20, DI-26. Stille svelging finnes mest som `.catch(() => {})` på best-effort-ting (varsler, logging, kladdopprydding). Ikke funnet noen som svelger lagring av treningsdata og returnerer ok. `$transaction` brukes riktig i booking, planendringer og hulledring (men se DI-04 om SG-omregning utenfor).
2. Ukjent mot 0: DI-02, 06, 07, 08, 23, 24, 25.
3. Brutto/netto og enheter: DI-10 (netto-heuristikk), DI-09 (netto/mva på faktura, ikke golf), DI-22 (fot/meter). Ingen yards funnet.
4. Sesong som kalenderår: bekreftet i DI-01, med de andre stedene med samme feil listet. Se også DI-21 (`hentSesongSnittscore`).
5. Uke og tid: uke 53 håndteres riktig i aktive helpers; feil i dødkode (DI-18). UTC-dato-feil DI-16/17. Konvensjonsblanding DI-15.
6. JSON uten zod: DI-27.

---

## 3. Riktighet og feil, og de 30 motsigelsene (RF)

Grunnlag: main på 9f39c7d44 (06.10.2026). Bare lesing. Ingen databaseforbindelse.

### Oppsummering

| Alvorlighet | Antall |
|---|---|
| Kritisk | 2 |
| Høy | 6 |
| Middels | 8 |
| Lav | 4 |
| Sum | 20 |

Dekket: `any` / `@ts-ignore` / `eslint-disable` i hele `src/` (unntatt generert Prisma-kode), fire-og-glem-kall, tomme feilfangere, server actions med `ok: true`, alle lesere av tabellene/kolonnene som mangler i prod-DB, og alle 30 motsigelser (del B).
IKKE dekket: kjøring av appen, `npm run build`, faktisk innhold i prod-DB (vi vet bare hva Vercel-loggen 05.10 sa), full gjennomgang av alle 210 server actions (kun stikkprøver på betaling, booking, GDPR og tilgang), ruter utenfor Workbench/runder/TN-tester for «funksjon sendt til klientkomponent».

#### Ren kode (gode nyheter)
- `: any`, `as any`, `<any>`: 0 treff i `src/` (utenom generert kode).
- `@ts-ignore` / `@ts-nocheck`: 0 utenom `src/generated/prisma/*` (Prisma lager dem selv). `@ts-expect-error`: 1, i en test (`src/lib/agents/provenance.test.ts:43`).
- `eslint-disable`: 49 stk. Nesten alle er `react-hooks/*` (hook-regler i skjermkomponenter) og `no-img-element`. Ingen i tilgang, betaling eller beregning. Ingen `no-explicit-any`.
- `as unknown as`: 64 stk i ikke-testkode. De viktigste: `src/app/api/cron/webhook-retry/route.ts:86` (lagret Stripe-hendelse tolkes som `Stripe.Event` uten sjekk) og `src/lib/sg-hub/insight-engine/index.ts:196,290,342` (JSON til Prisma). Se RF-19.
- Server actions i betaling/booking er stort sett pakket i `try/catch` og gir `{ ok: false }` ved feil. Stikkprøve `src/components/admin/precision/ag02-handlinger.ts` er riktig.

---

### Del A: funn

#### RF-01 · Trener i en WANG-/TN-gruppe kan lese og endre spillerens plan i AgencyOS uten samtykke (telles som TO-01)
- Alvorlighet: Kritisk
- Fil: `src/lib/auth/coached.ts:96-102` (tredje OR-gren), brukt av `src/lib/workbench/plan-tilgang.ts:7-13`, `src/lib/workbench/fys-turnering-actions.ts:296,397`, `assertCoachTilgangTilSpiller` (`coached.ts:125`)
- Hva er galt: Funksjonen som avgjør «er dette spilleren min?» slipper inn enhver som er aktiv COACH eller ASSISTANT i en gruppe der spilleren er medlem. Kommentaren i fila sier «innsyn, ikke redigering», men samme funksjon brukes som skrivetilgang i Workbench. Grenen sjekker ikke at gruppen er AK-styrt (`managedByAkGolf`) og ikke at spilleren har delt noe.
- Hva kan skje: En trener i WANG Toppidrett eller Team Norway, som også har rollen COACH i appen, kan åpne spillerens Workbench i AgencyOS, flytte, kopiere og publisere økter og endre turnerings- og fysiske planer. Dette gjelder også mindreårige og går uten delingssamtykke (D-04) og uten forelders godkjenning under 16. Beslutningene 28.09 sier at WANG/TN bare kan foreslå. WANG-/TN-lesestiene (`src/lib/deling/navngitt.ts`, `src/lib/iup/trener-lesing.ts`) sjekker deling riktig, men denne veien går utenom dem.
- Forslag til retting: La grenen 3 bare gi lesing (egen funksjon for innsyn) og fjern den fra skrivetilgang. Eller krev `managedByAkGolf: true` på gruppen og gyldig delingssamtykke. Skriv test som viser at en TN-/WANG-trener ikke kan kalle `flyttWorkbenchPlanOkt`.
- PR-gruppe: P1-tilgang
- Status: Ny (Anders må avgjøre «Ja/Nei» på spørsmål 5 i Workbench-beskrivelsen §10, men anbefalingen er nei)

#### RF-02 · Talenotat på rangen kan skrives på andres treningsøkt (telles som TP-06)
- Alvorlighet: Kritisk
- Fil: `src/app/portal/live/voice-actions.ts:59-90`
- Hva er galt: `saveVoiceRangeMemo` slår opp økta med `findUnique({ where: { id: sessionId } })` og oppdaterer `notes`. Det er ingen sjekk av at økta tilhører innlogget bruker eller at brukeren er coach for spilleren. Kun `requireConsentingUser()` (innlogget og samtykket) kreves.
- Hva kan skje: En innlogget bruker som kjenner (eller får tak i) en annen økts id kan legge tekst inn i den andres øktnotat. Idene er tilfeldige, så risikoen er lav i praksis, men en bruker kan endre andres data, og teksten kommer rett til coach og spiller.
- Forslag til retting: Hent økta med `where: { id: sessionId, userId: user.id }` (eller via `assertCoachTilgangTilSpiller`). Gi `{ ok: false }` hvis den ikke finnes.
- PR-gruppe: P1-tilgang
- Status: Ny

#### RF-03 · Samme talenotat-funksjon sier «lagret» selv når lagring feilet eller ikke skjedde
- Alvorlighet: Høy
- Fil: `src/app/portal/live/voice-actions.ts:86` (tom `catch {}`), `:134` (`task_proposal`)
- Hva er galt: Databasefeil svelges av en tom `catch {}`, og funksjonen svarer likevel `{ ok: true, message: "Notat lagret på økten." }`. Hvis økta ikke finnes, blir ingenting lagret, men svaret er likevel «lagret». Valget `task_proposal` lagrer ingenting og svarer «Observasjon registrert.»
- Hva kan skje: Spilleren snakker inn en observasjon på rangen og tror den er lagret. Den er borte, uten varsel.
- Forslag til retting: Fang feilen, logg den (`logError`) og returner `{ ok: false, message: ... }`. Returner ikke «registrert» for `task_proposal` før noe faktisk lagres.
- PR-gruppe: P3-data
- Status: Ny

#### RF-04 · Eksport og anonymisering av brukerdata krasjer hvis Workbench-tabellene mangler
- Alvorlighet: Høy
- Fil: `src/lib/workbench/workbench-personvern.ts:37-50` (eksport), `:94-101` (anonymisering), kalt fra `src/app/portal/meg/innstillinger/actions.ts:179` og `src/lib/gdpr/anonymiser-bruker.ts:225`
- Hva er galt: Begge leser/oppdaterer `workbench_physical_blocks`, `workbench_tournament_plans`, `workbench_tournament_rounds` osv. direkte med Prisma, uten reserve. Vercel-loggen 05.10 sa at disse tabellene mangler i prod. Da kaster hele funksjonen (`P2021`), og kallet står uten `try/catch` rundt seg.
- Hva kan skje: «Last ned mine data» og «Slett kontoen min» (GDPR-innsyn og sletting) feiler for alle brukere i prod, så lenge tabellene mangler. Det er et lovpålagt krav.
- Forslag til retting: Vent med å rette til tabellene er opprettet (se RF-05), og legg samtidig inn samme reserve som i `fys-turnering-data.ts` (sjekk `to_regclass`, behandle `P2021` som «ingen rader»). Test at eksport og anonymisering virker uten tabellene.
- PR-gruppe: P7-skjema
- Status: Ny

#### RF-05 · Tabellene `workbench_tournament_plans` og `workbench_physical_blocks` mangler i prod, og flere veier har ingen reserve
- Alvorlighet: Høy
- Fil: `prisma/schema.prisma:6931` (`WorkbenchPhysicalBlock`), `:7058` (`WorkbenchTournamentPlan`); `prisma/migrations/20260927201000_workbench_physical_tournament_plan/migration.sql` (bare en «record», kjøres ikke, jf. gotchas); `prisma/additive/workbench-turneringsplan-2026-10-02.sql`; `scripts/add-workbench-fys-turnering-2026-09-27.ts`
- Hva er galt: Koden bruker tabellene på mange steder. Reserve finnes bare to steder: `src/lib/workbench/fys-turnering-data.ts:177-203` (`to_regclass` + `P2021`) og `src/lib/workbench/plan-kalender-data.ts:35-36` (`P2021`). Uten reserve:
  - `src/lib/workbench/plan-handlinger-actions.ts:31` (`kollisjoner`, brukt av flytt, kopier og angre av en økt): leser `workbenchTournamentPlan` i transaksjonen. Alt feiler og brukeren får «Flyttingen kunne ikke lagres» (`:65`, `:102`, `:123`). Dette er dra-og-slipp i uka, hovedveien i Workbench.
  - `src/lib/workbench/fys-turnering-actions.ts:130-414` (opprett/endre fysisk blokk og turneringsplan), `src/lib/workbench/turneringsplan-actions.ts:23-58`.
  - `src/lib/admin/analyse/lastere.ts:283-288` (admin-analyse), `src/lib/workbench/workbench-personvern.ts` (se RF-04).
- Hva kan skje: Så lenge tabellene mangler, kan ikke spillere flytte eller kopiere økter, og turnerings- og fysiske planer kan ikke opprettes. Admin-analysen kan krasje.
- Forslag til retting: To spor. (1) Anders kjører de additive SQL-skriptene i prod (utenfor denne gjennomgangen, jf. gotchas §Database). (2) Til det er gjort: gjør `kollisjoner` tolerant (bruk en `try/catch` rundt turneringsdelen eller `harModulTabeller()`), og gjenbruk samme reserve i lastere/personvern.
- PR-gruppe: P7-skjema
- Status: Ny

#### RF-06 · Kolonnen `rounds.source`/`sourceDate` mangler i prod, og mange rundelesere har ingen reserve
- Alvorlighet: Høy
- Fil: `prisma/schema.prisma:1778-1830` (`Round.source`, `sourceDate`, `dataQuality`, `status`, `partialSave`, `importMetadata`); `scripts/add-round-registration-metadata-2026-09-27.ts`; `src/app/portal/mal/runder/page.tsx:22-30,50` (`include` uten `select`, leser `r.source`)
- Hva er galt: Prisma henter alle kolonner når en spørring ikke bruker `select`. Er `source` (og `sourceDate` mfl.) ikke lagt til i basen, feiler alle slike spørringer. Uten `select`: `src/app/portal/mal/runder/page.tsx`, `src/app/portal/mal/runder/[id]/page.tsx:36`, `[id]/actions.ts:110`, `[id]/sg-actions.ts:43`, `ny/actions.ts:175`, `src/app/api/coach/ai-chat/route.ts:81`, `src/lib/portal/optimal-session.ts:40`, `src/lib/agents/round-agent.ts:26`, `src/lib/agents/sg-analyse-ekspert.ts:23`, `src/lib/agents/treningsdata-ekspert.ts:20`, `src/lib/ai/live-coach-context.ts:157`. Alle `prisma.round.create/update` returnerer også alle kolonner. Ingen av dem har reserve.
- Hva kan skje: Rundelisten (`/portal/mal/runder`), rundedetaljen, registrering av runde og tre AI-agenter krasjer for alle spillere hvis kolonnen mangler.
- Forslag til retting: Kjør det additive skriptet i prod. Ellers: legg inn `select` med bare kolonnene som er sikre, og bruk reserve (tomt resultat + `FeilTilstand`) på rundelisten.
- PR-gruppe: P7-skjema
- Status: Ny

#### RF-07 · `test_days.eventId` og tabellen `test_day_events` mangler i prod, og Team Norway-testsidene har ingen reserve
- Alvorlighet: Høy
- Fil: `prisma/schema.prisma:2283-2335` (`TestDay.eventId`, `TestDayEvent`); `scripts/add-tn-testday-events-2026-10-02.ts`; `src/lib/domain/tn-arbeidsflate.ts:443-448,488-496,1030-1036`; `src/app/portal/tren/tester/team-norway/page.tsx` (13 treff); `src/app/portal/tren/tester/team-norway/actions.ts`; `src/app/team-norway/tn-testdag-actions.ts`; `src/app/team-norway/tn-testforing-actions.ts`; `src/lib/domain/tn-redigering.ts:153-169`
- Hva er galt: Alle `prisma.testDay.*`-kall henter `eventId`, og flere filtrerer på relasjonen `event: { organizerGroupId }`. Mangler kolonnen/tabellen, kaster alle. Ingen `P2021`/`P2022`-fangst.
- Hva kan skje: Team Norway-testdager, scorekortet til spillerne og treneres testføring krasjer.
- Forslag til retting: Kjør det additive skriptet i prod. Midlertidig: fang `P2021`/`P2022` i `tn-arbeidsflate.ts` og vis tom liste.
- PR-gruppe: P7-skjema
- Status: Ny

#### RF-08 · Reserven i Workbench sjekker bare om tabellen finnes, ikke om kolonnene finnes
- Alvorlighet: Middels
- Fil: `src/lib/workbench/fys-turnering-data.ts:178-196`; kolonner lagt til senere i `prisma/additive/workbench-turneringsplan-2026-10-02.sql` (`tour`, `country`, `location`, `holes`, `priority`, `wagrPower`, `wagrSourceYear`, `wagrSource`)
- Hva er galt: Sjekken `to_regclass` bekrefter tabellnavn. Hvis tabellene finnes men de nyere kolonnene mangler, går sjekken gjennom, og `findMany` kaster `P2022` (manglende kolonne). Feilfangsten tar bare `P2021` (manglende tabell).
- Hva kan skje: Etter at Anders oppretter tabellene med den eldste SQL-en, men ikke kjører tilleggsfila, krasjer hele Workbench-siden i stedet for å vise en tom fane.
- Forslag til retting: Fang også `P2022`. Eller sjekk `information_schema.columns` for de nyeste kolonnene i samme spørring.
- PR-gruppe: P7-skjema
- Status: Ny

#### RF-09 · `/portal/mal/runder` «funksjon sendt til klientkomponent»: ikke gjenfunnet i koden på main
- Alvorlighet: Middels
- Fil: `src/app/portal/mal/runder/page.tsx:64-70`, `src/components/portal/precision/PH18Runder.tsx:25-37`
- Hva er galt: Feilen i Vercel-loggen 05.10 kan ikke gjenskapes ved å lese koden. Server-siden sender bare tekster, tall og datoer (`modell` er rene data). `delHref` og `detaljHref` i `PH18Props` er funksjoner, men siden sender dem ikke. Feilen er trolig rettet i #1156 eller #1166 (04.10), eller kommer fra en annen rute. I stedet fant jeg to sider som legger hendelsesfunksjoner direkte på HTML-elementer i en serverkomponent (samme feilklasse): `src/app/(marketing)/stats/pga/page.tsx:708` (`onClick`) og `src/app/(marketing)/stats/turneringer/[slug]/page.tsx:1031,1036` (`onMouseEnter`/`onMouseLeave`).
- Hva kan skje: De to offentlige statistikksidene kan krasje når de rendres på serveren med innhold i tabellen eller kortet.
- Forslag til retting: Fjern hendelsene (ren CSS `:hover`) eller flytt dem til en liten klientkomponent. Bekreft mot Vercel-loggen hvilken rute som faktisk feilet 05.10.
- PR-gruppe: P3-data
- Status: Usikker (må sjekkes mot Vercel-loggen og en lokal bygging)

#### RF-10 · Live-økt (PH-04–07) viser oppdiktede tall som om de var ekte
- Alvorlighet: Høy
- Fil: `src/lib/portal-live/load-ph04-07.ts:188-200` (syntetisk fallback: «Slagøkt · Range og nærspill», «I dag · 14:30», «BAY 3»), `:217` (`initialSeconds: 1452`), `:284-295` (`dateStr: "LØR 26.09"`, `actualMinutes: 72`, `dagsform: "8 / 10"`, faste minutter per akse)
- Hva er galt: Når økta ikke finnes eller skal oppsummeres, returnerer lasteren faste demotall. Beslutningene 04.10 (§LANSERING) sier «ingen demodata i produksjon», og prosjektregelen er at manglende verdi skal vises som «—», aldri gjettes.
- Hva kan skje: En spiller ser et sammendrag med 72 minutter og dagsform 8/10 som ikke er hans, og coach kan lese det som ekte.
- Forslag til retting: Returner `null`/tom tilstand i stedet for demo. Les ekte minutter, dagsform og akser fra økta. Se også Workbench-beskrivelsen §10 spørsmål 8.
- PR-gruppe: P3-data
- Status: Ny

#### RF-11 · Utgåtte AK-formel-koder (L-faser, M0–M5, CS, PR1–PR5) skrives og kopieres fortsatt
- Alvorlighet: Middels
- Fil: `src/lib/workbench/ak-formel.ts:31-56` (`sanitizeAkFormel` godtar L_KROPP…, M0–M5, CS50–CS100, PR1–PR5), `src/lib/workbench/wb-session-write.ts:107,282` (skriver/kopierer `pressureLevel`), `src/lib/workbench/plan-handlinger-actions.ts:85` (kopierer `lFase`, `miljo`, `csNivaa`), `src/lib/workbench/session-actions.ts:119`
- Hva er galt: Prosjektreglene sier at L-faser, Miljø og Press (PR1–PR5) er endret og ikke skal brukes, og CS-nivåene er uavklart. Koden renser og lagrer dem likevel. `wb-session-write.ts:175` har en kommentar om at L-fase/miljø/CS er «utelatt med vilje», men `pressureLevel` og kopiene i `plan-handlinger-actions.ts` er ikke det.
- Hva kan skje: Gamle koder lever videre i nye økter og dukker opp i analyser og AI-prompter som om de var gjeldende. Det gir rot i statistikken når v2-kodene (ALENE/OBSERVERT/KONKURRANSE/TURNERING) tas i bruk.
- Forslag til retting: Stopp skriving av de utgåtte feltene; behold lesing for gamle rader. Kopier ikke `lFase`/`miljo`/`csNivaa` i `plan-handlinger-actions.ts`.
- PR-gruppe: P3-data
- Status: Ny

#### RF-12 · Agenter startes med `void` uten å vente, og kan bli avbrutt på Vercel
- Alvorlighet: Middels
- Fil: `src/app/portal/(fullscreen)/live/[sessionId]/actions.ts:291`, `src/lib/portal-live/actions.ts:56,150,193`, `src/app/api/recording/complete/route.ts:158`, `src/app/api/recording/transcribe/route.ts:133`, `src/app/api/lead/route.ts:83` (totalt 48 `void fn()` i `src/`)
- Hva er galt: Etter at svaret er sendt, kan en Vercel-funksjon fryses eller stoppes før bakgrunnsarbeidet er ferdig. Bare `src/lib/stripe/handle-event.ts` bruker `waitUntil`/`after`. Funksjonene `triggerLiveSessionAgent` og `triggerSwingVideoAnalyst` fanger feil selv (bra), men kan likevel bli kuttet midt i.
- Hva kan skje: Noen ganger får spilleren ikke agent-forslag eller videoanalyse, uten at det logges noe.
- Forslag til retting: Bruk `after()` fra `next/server` (eller `waitUntil`) rundt disse kallene.
- PR-gruppe: P3-data
- Status: Ny

#### RF-13 · Slett video: filen i lagringen kan bli liggende igjen mens databaseraden slettes
- Alvorlighet: Middels
- Fil: `src/lib/storage/video.ts:166-169`
- Hva er galt: `sb.storage.from(...).remove([...]).catch(() => {})`. Supabase-klienten kaster ikke ved feil, den returnerer `{ error }`, så `.catch` gjør ingenting, og feilen leses aldri. Databaseraden slettes uansett på neste linje. Samme mønster ved opplasting (`:97`) er greit, men der finnes ingen fil.
- Hva kan skje: En spillers swing-video (personopplysning, ofte mindreårig) blir værende i lagringen uten noen kobling i appen. Brukeren tror den er slettet.
- Forslag til retting: Les `{ error }` fra `remove`; ved feil, ikke slett raden, og returner feil.
- PR-gruppe: P3-data
- Status: Ny

#### RF-14 · Eierskap av `new Date(year, 0, 1)` bryter tidssone-regelen
- Alvorlighet: Lav
- Fil: `src/lib/workbench/periode-core.ts:84-85`, `src/lib/workbench/gruppe-periode-actions.ts:139`
- Hva er galt: Gotchas sier at dagsdatoer bygges med `Date.UTC(y, m-1, d)`. Disse to stedene bruker lokal tid. På Vercel (UTC) blir resultatet riktig, men på en Mac i Oslo (lokal utvikling, tester, skript) blir 1. januar til 31. desember kl. 23:00 UTC, altså en dag feil. `gruppe-periode-actions.ts:25` gjør det riktig.
- Hva kan skje: Ulike resultater lokalt og i prod. Tester kan bestå på CI og feile hos Anders.
- Forslag til retting: Bytt til `new Date(Date.UTC(year, 0, 1))` og `Date.UTC(year, 11, 31)`.
- PR-gruppe: P3-data
- Status: Ny

#### RF-15 · Coach kan flytte spillerens økt direkte, mens en annen vei sier at bare spilleren kan det
- Alvorlighet: Middels
- Fil: `src/lib/workbench/wb-actions.ts:1595-1626` (`moveSession`), mot `src/lib/workbench/plan-handlinger-actions.ts:46` (flytt: «Den opprinnelige økten flyttes bare av spilleren») og `:83-90` (coachens kopi blir `needsPlayerApproval`)
- Hva er galt: To veier for «flytt økt» gir ulike regler: ny dra-og-slipp-vei (`flyttWorkbenchPlanOkt`) tillater bare spilleren, gammel vei (`moveSession`) lar coach flytte uten spørsmål. Beslutningene 28.09 sier at AK-coach endrer direkte (spilleren kan angre), og at WANG/TN foreslår. Ingen av veiene gjør nøyaktig det.
- Hva kan skje: Samme dra-og-slipp gir ulik oppførsel i to flater. Coachen kan ikke flytte i den ene, og spilleren får ikke varsel i den andre.
- Forslag til retting: Anders må avgjøre regelen (Workbench-beskrivelsen §10 spørsmål 3 og 4). Deretter én vei for flytting, med varsel og angre-vindu.
- PR-gruppe: P3-data
- Status: Ny (trenger Anders)

#### RF-16 · «Send til coach» og AI-ukeforslag er fortsatt synlig for spilleren
- Alvorlighet: Middels
- Fil: `src/app/portal/planlegge/bygger/actions.ts:67` og `src/app/portal/planlegge/bygger/page.tsx:36` (`sendPlanTilCoachV2`), `src/components/admin/precision/AG11Workbench.tsx:242` (`role === "player" && <Ukeforslag>`)
- Hva er galt: Beslutningene 28.09 sier at «Send til coach» på forslag fjernes og at AI-planbyggeren skjules for spillere ved lansering. Begge ligger i koden og er tilgjengelige.
- Hva kan skje: Spillere kan bruke funksjoner som er besluttet fjernet, og planen får status «Venter på coach» som ikke lenger skal finnes.
- Forslag til retting: Skjul begge bak en feature-flagg for lansering. Fjern «Send til coach» når Anders bekrefter.
- PR-gruppe: P8-designforberedelse
- Status: Ny

#### RF-17 · Spilleren kan ikke opprette fysisk program, og to rutetyper lever i gammelt skall
- Alvorlighet: Lav
- Fil: `src/lib/workbench/fys-turnering-actions.ts:110-125` (`requireCoachAccess`, bare COACH/ADMIN), `src/app/portal/tren/turneringer/page.tsx:10` og `src/app/portal/fysisk/page.tsx` (bruker `V2Shell`, eget gammelt skall), `src/app/portal/tren/fys-plan/page.tsx`
- Hva er galt: Beslutningen 28.09 sier at fysisk og turnering er samme plan og at spilleren endrer selv. Koden lar bare coach opprette fysisk blokk; spilleren kan lese og føre logg. Turneringsplan kan spilleren lage selv (`editable` når `createdBy` er spilleren). Egne sider finnes fortsatt.
- Hva kan skje: Forvirring: spilleren ser en «fysisk»-side han ikke kan endre. Beslutningen er ikke fulgt, men Workbench-beskrivelsen §10 spørsmål 9 foreslår et midlertidig unntak.
- Forslag til retting: Avklar med Anders (spørsmål 9). Ved lansering: behold unntaket, og sørg for at sidene sender til samme Workbench.
- PR-gruppe: Ingen (bare rapport)
- Status: Ny (trenger Anders)

#### RF-18 · Ubrukt Workbench-komponent og gammelt mønster i koden
- Alvorlighet: Lav
- Fil: `src/components/workbench/WorkbenchUke.tsx` (ingen import funnet i `src/`), `src/lib/portal-live/load-ph04-07.ts` (se RF-10)
- Hva er galt: Beslutningen sier at `WorkbenchUke` ikke skal bygges videre. Komponenten ligger der uten at noen bruker den. Det finnes bare omtale i kommentarer (`AG11Workbench.tsx:11`, `admin/workbench/[playerId]/page.tsx:6`).
- Hva kan skje: Forvirrer neste utvikler. Ingen driftsrisiko.
- Forslag til retting: Slett fila og bekreft med `knip` (jf. P5-dødkode).
- PR-gruppe: P5-dødkode
- Status: Ny

#### RF-19 · Uvalidert JSON og typekast i betaling og cron
- Alvorlighet: Lav
- Fil: `src/app/api/cron/webhook-retry/route.ts:86` (`rad.payload as unknown as Stripe.Event`), `src/lib/sg-hub/insight-engine/index.ts:196,290,342`, `src/app/api/caddie/chat/route.ts:42`, `src/app/api/kommando/chat/route.ts:38`
- Hva er galt: Gotchas krever `safeParse` på forretningskritiske JSON-felt. Lagrede Stripe-hendelser tolkes uten kontroll.
- Hva kan skje: Dårlig lagret hendelse gir feil i behandling av betaling ved retry.
- Forslag til retting: Valider med zod (eller sjekk at `event.type` og `event.data.object` finnes) før `handleStripeEvent`.
- PR-gruppe: P3-data
- Status: Ny

#### RF-20 · Server actions som kaster rå feil (129 av 210 filer mangler `try/catch`)
- Alvorlighet: Lav
- Fil: stikkprøver: `src/app/admin/(legacy)/bookinger/actions.ts:27-99` (`throw new Error("Kan ikke bekrefte: mangler betaling…")`), `src/app/portal/meg/abonnement/fortsett/actions.ts:15-35`, `src/app/admin/gdpr/actions.ts`, `src/app/portal/meg/deling/actions.ts`, `src/app/team-norway/tilgang/tn-tilgang-actions.ts`
- Hva er galt: 129 av 210 filer med `"use server"` har ingen `try/catch`. Kaster noe (databasefeil, mangler rolle), ser brukeren en generisk feilside og skjermen kan henge i «lagrer». Ingen av dem returnerer `ok: true` ved feil. Stikkprøvene i betaling og GDPR er ellers riktig skrevet.
- Hva kan skje: Dårlig brukeropplevelse; ingen datalekkasje funnet. Next.js skjuler detaljer i prod.
- Forslag til retting: Ta de mest brukte (booking, abonnement, deling) først og returner `{ ok: false, feil }`.
- PR-gruppe: Ingen (bare rapport)
- Status: Ny

---

### Del B: de 30 motsigelsene sjekket mot koden på main

Forkortelser: Ja = påstanden om koden stemmer. Delvis = stemmer for noen veier. Nei = stemmer ikke lenger. Fasit = beslutningene (04.10 > 30.09 > 28.09 > …) og masteren `docs/treningsplanlegging.md` (jf. AGENTS.md).

| M# | Tema | Bekreftet i koden? | Riktig etter fasit | Forslag | Anders? |
|---|---|---|---|---|---|
| M1 | Hvilken Workbench-design gjelder | Ja. Fire visninger bygget (`src/lib/workbench/samlet-url.ts:8-12`: sesong, uke, bord, analyse; `WorkbenchSesongkart.tsx`, `WorkbenchSamlet.tsx`). Nivåene År · Periode · Måned · Uke · Økt · Vol · Målsetninger ligger i designet (`docs/design-handoff/design/shared/WB3.jsx.txt:8`). Docs sier også 20.09-bestillingen er «aktiv» (`docs/platform/AGENT-BRIEF.md:10`, `designsystem/README.md:12-19`) | Ikke avgjort. Beslutningene 04.10 sier handoff-skjermene portes, men peker ikke ut Workbench | Bruk de fire visningene som ramme, tegn nivåene inn i dem (Workbench-beskrivelsen §10-1). Fjern «aktiv bestilling» fra de to eldre dokumentene | Ja |
| M2 | Spilleren endrer fritt, eller forslag | Delvis. `plan-handlinger-actions.ts:83-90`: coachens kopi settes til `needsPlayerApproval`/`PENDING`. `plan-angre-token.ts:26`: angre er bundet til den som handlet (`actorId`). BUSINESS-RULES.md:317 har fortsatt DRAFT → PENDING_PLAYER → ACCEPTED | 28.09: spilleren endrer selv; AK-coach endrer uten godkjenning og spilleren kan angre. Forslag bare for WANG/TN | Fjern godkjenningsflyten for AK-coach; la spilleren angre fra varsel. Rett BUSINESS-RULES.md:317 | Ja (Workbench-beskrivelsen §10-3, 4) |
| M3 | Spillerens egne økter som utkast | Delvis. `src/lib/domain/workbench/operations.ts:104` og `wb-actions.ts:1301-1345` (`createSession`) gir `DRAFT` også for spiller. Men `wb-session-write.ts:98-107` (brukt av `src/app/portal/planlegge/workbench/actions.ts`) gir `PUBLISHED` direkte | Spilleren eier planen, utkast er et coachbegrep (28.09) | Samle på én vei. Spillerens egne økter skal vises med en gang (PUBLISHED) | Ja (Workbench-beskrivelsen §10-2). Kode-feil: RF-15 |
| M4 | Coach flytter spillerens økt | Ja. `plan-handlinger-actions.ts:46` forbyr, `wb-actions.ts:1595-1626` (`moveSession`) tillater | AK-coach endrer direkte, spilleren kan angre (28.09) | Samme regel i begge veier, se RF-15 | Ja |
| M5 | WANG/TN kan bare foreslå | Ja. `src/lib/auth/coached.ts:96-102`, brukt av `plan-tilgang.ts:11` og skrive-actions, gir skrivetilgang til enhver trener i spillerens gruppe | Beslutningene 28.09: WANG og TN foreslår, spilleren bestemmer. D-04: innsyn krever deling | Fjern grenen fra skrivetilgang, se RF-01 | Nei (anbefaling stilt: nei). Kode-feil: RF-01 |
| M6 | Innsyn for WANG og TN | Delvis. `docs/design-handoff/README.md:32-37` sier «innsyn automatisk, kan ikke trekkes». Koden bruker delingssamtykke (`src/lib/deling/navngitt.ts`, `src/lib/iup/trener-lesing.ts:24,52`). PH-27-skjermen har «Trekk tilgang» | Beslutningene 04.10: trenerinnsyn uten ja fra spiller/forelder venter. Anders 04.10: «Del opp». D-04: innsyn krever delt per organisasjon og kan trekkes | Behold deling som regel. Fjern setningen om «automatisk innsyn» fra handoff-README | Ja (juridisk avklaring av automatisk innsyn) |
| M7 | Hvilket dokument er master | Ja. `docs/treningsplanlegging-og-sprak.md:3-5` kaller seg «eneste gjeldende master» og kaller `docs/treningsplanlegging.md` historisk. AGENTS.md:11-12,29 og beslutningene 29.–30.09 sier `docs/treningsplanlegging.md` | `docs/treningsplanlegging.md` | Merk `treningsplanlegging-og-sprak.md` som historisk, og rett skillen `playerhq-arkitektur` | Nei |
| M8 | Låste treningsregler | Delvis. `docs/treningsplanlegging-og-sprak.md` har faste prosenter og tak, og masteren §3.2 har veiledende prosenter. Skillen `playerhq-agents` nevner `junior-guard.ts`, men filen finnes ikke (`src/lib/training/skills/` har bare drill-selection, morad-fault, periodization, progression, pyramid, weakness). Ingen kode som håndhever «maks 4 økter per uke under 16 år» funnet | «Ingen treningsregel er låst» (beslutningene §Treningsfag, 18.08) | Rett skillen og marker prosentene som veiledende | Nei |
| M9 | Pyramiden styrer eller foreslår | Ja (dokument). Masteren `docs/treningsplanlegging.md:454`: «foreslår område og felt, men låser dem ikke» | 28.09 og §Treningsfag: pyramiden velges først og styrer kategoriseringen og banken; området styrer feltene | Presiser i masteren: pyramiden styrer filtrering, ikke feltene | Nei |
| M10 | «Send til coach» | Ja. `src/app/portal/planlegge/bygger/actions.ts:67`, `page.tsx:36` | Fjernes (28.09) | Skjul/fjern. Se RF-16 | Nei |
| M11 | AI-planbygger synlig for spilleren | Ja. `src/components/admin/precision/AG11Workbench.tsx:242` | Skjules for spillere ved lansering (28.09 punkt 8) | Skjul bak flagg. Se RF-16 | Nei |
| M12 | Én økttabell | Delvis. BUSINESS-RULES.md:168 sier tre modeller «bevisst», men :179-181 sier «Besluttet 15.09: `WorkbenchSession` overlever, `TrainingPlanSession` migreres inn». Selve motsigelsen ligger altså innen samme dokument og er løst med «inntil da». Gamle modeller brukes fortsatt (`TrainingSessionV2` i live-økt, se `load-ph04-07.ts`) | `WorkbenchSession` er den ene (§Workbench) | Skriv migreringsplan; fjern «skal ikke slås sammen» fra :168 | Nei |
| M13 | `WorkbenchUke` | Delvis. `src/components/workbench/WorkbenchUke.tsx` finnes, men ingen importerer den (bare kommentarer). `WeekPlan` finnes i schema (`prisma/schema.prisma:3688`, `WeekType` med UTVIKLING/VEDLIKEHOLD/TURNERING), så `KARTLEGGING-TRENINGSPLANLEGGING.md:11` («ingen ukemodell») er utdatert | Skal ikke bygges videre | Slett komponenten (RF-18), oppdater kartleggingsfila | Nei |
| M14 | De åtte feltene i en øvelse | Ja (dokument). `docs/workbench-handover.md` har «8 + ?» med Motorikk/Belastning/Press/Hensikt/Måte/Målsetning. Koden (`src/lib/domain/workbench/ovelse-detaljer.ts`) følger masterens åtte trinn | Pyramide · område · sted · måleutstyr · gjennomføring · press · mengde · mål (masteren) | Merk `workbench-handover.md` som historisk | Nei |
| M15 | Måleutstyr | Delvis. Workbench: fire valg (`ovelse-detaljer.ts:97`). Teknisk plan har seks, `RADAR_UTSTYR` = TRACKMAN, FLIGHTSCOPE, GARMIN_R10, MEVO_PLUS (`src/lib/teknisk-plan/tp-visning.ts:64`, `ak-formel-v2.ts:204`) | Fire valg: Med TrackMan · Uten · Annen radar · Ikke relevant (masteren) | Beholder to lister, men dokumenter skillet: teknisk plan tillater radar-merke, Workbench bare «Annen radar» | Ja (vil Anders ha merkene?) |
| M16 | Uketyper | Ja. `WeekType` i `prisma/schema.prisma:3667-3671` har UTVIKLING, VEDLIKEHOLD, TURNERING. AVLASTNING og TEST finnes ikke i koden (TEST er en `WeekNote`) | Tre uketyper i koden; avvik X09 åpent | Rett `AARSPLAN-MOTOR-STATUS.md:15` | Ja (åpent avvik X09) |
| M17 | Tidsrom i uka | Ja. Koden og Cockpit er 05–22 (`WeekGrid.tsx:11`, `AG01Cockpit.tsx:48`); designdata er 07–20 (`designsystem/precision-athletics/ui_kits/_shared/data-wb3.js:6`) | 05–22 (Cockpit, workbench-handover) | Endre design-data til 05–22 | Nei |
| M18 | Uten ball | Ja. `src/lib/domain/ak-formel-v2.ts:139` har `UTEN_BALL` som egen motorikk-verdi (steg), mens BUSINESS-RULES.md:367-369 sier «egenskap ved øvelsen, ikke et eget steg» | Masteren og §Treningsfag: eget læringssteg | Rett BUSINESS-RULES.md:367-369 | Nei |
| M19 | Utgåtte PR-koder | Ja. `src/lib/workbench/ak-formel.ts:31-43`, `wb-session-write.ts:107` | PR1–PR5, L-faser, M0–M5 utgått | Se RF-11 | Nei. Kode-feil: RF-11 |
| M20 | Fysisk og turnering: egne sider eller samme plan | Ja. `/portal/tren/turneringer` (`V2Shell`, gammelt skall), `/portal/fysisk`, `/portal/tren/fys-plan` finnes som egne sider | Samme plan, egne sider utgår (28.09) | Videresend til Workbench ved portering | Nei |
| M21 | Hvem endrer fysisk og turnering | Delvis. Fysisk: bare coach/admin kan opprette (`fys-turnering-actions.ts:110-125`). Turnering: spilleren kan lage egen plan (`fys-turnering-data.ts:332`) | Spilleren endrer alt selv, coach varsles (28.09) | Midlertidig unntak ved lansering (Workbench-beskrivelsen §10-9) | Ja (spørsmål 9). Se RF-17 |
| M22 | Hvor målsetninger bor | Ja (dokument). BUSINESS-RULES.md:334: «Mål bor i Oversikt» | Workbench › Målsetninger (28.09) | Rett BUSINESS-RULES.md:334 | Nei |
| M23 | Samlinger (R13) | Ja. `src/lib/workbench/samlingsinvitasjon-actions.ts` finnes (+ test og kontrakt) | Levert (#1099) | Oppdater `workbench-fullforing-2026-10-02.json` | Nei |
| M24 | Gruppeukeplan | Nei. `AG11Gruppe.tsx:12` sier at den ikke finnes, men `src/lib/workbench/group-session-actions.ts` og gruppeplan i trenerbordet finnes | Gruppeplan er grunnmuren (28.09) | Fjern kommentaren i `AG11Gruppe.tsx:12` | Nei |
| M25 | Beslutningsfila er utdatert | Ja. `wb-actions.ts:418-421` lar coach redigere periode; AG14 kan opprette øvelse (`AG14Ovelseark.tsx:62,104`); etterlevelse er samlet (`compliance.ts:52`). Merk: `coachLagrePeriode` (`session-actions.ts:275`) har ingen kaller | Se punkt 4–5 i beslutningene 27.–28.09 | Oppdater beslutninger.md og fjern død `coachLagrePeriode` | Nei |
| M26 | UTC-regelen | Ja. `periode-core.ts:84-85`, `gruppe-periode-actions.ts:139` | `Date.UTC` (gotchas §Tid) | Se RF-14 | Nei. Kode-feil: RF-14 |
| M27 | Periodenavn | Ja (dokument). `docs/design/workbench-handover/SKILL.md:36` sier «Spesialiseringsperiode» | «Spesialperiode» (28.09) | Rett fila | Nei |
| M28 | Demodata i live-økt | Ja. `src/lib/portal-live/load-ph04-07.ts:188-200,217,284-295` | Ingen demodata i prod (04.10) | Se RF-10 | Nei. Kode-feil: RF-10 |
| M29 | Spillerens tekniske plan | Ja (dokument). `docs/design-handoff/regler/skjermliste.md:32` har «ny teknisk plan» i PH-11, mens `spesifikasjon-workbench-og-datakontrakt.md:101` sier «forespørsel via PH-21» | IA 28.09 og skjermlista er fasit | Velg én og rett den andre | Ja (skal spilleren lage egen teknisk plan?) |
| M30 | Utdaterte skills | Delvis. `playerhq-arkitektur/SKILL.md:21,59` sier planendring via coachens godkjenning (strider mot 28.09). `playerhq-agents/SKILL.md:133-145,228` nevner `junior-guard.ts` (filen finnes ikke), 50 %-terskel. Skillene ligger i `.claude/skills/` og `~/.claude/skills/` | Beslutningene 28.09 | Oppdater skillene (P9-dokumenter) | Nei |

#### Motsigelser som er kode-feil
M3 (to opprettelsesveier), M4 (to flytteveier), M5 (RF-01), M10/M11 (RF-16), M19 (RF-11), M21 (RF-17), M26 (RF-14), M28 (RF-10).

#### Motsigelser som er ren dokumentfeil
M1, M7, M8, M9, M12, M13, M14, M16, M17, M18, M22, M23, M24, M25, M27, M29, M30 (alle P9-dokumenter).

#### Må avgjøres av Anders
M1, M2, M3, M4, M6, M15, M16, M21, M29 (fra Workbench-beskrivelsen §10: spørsmål 1, 2, 3, 4, 5, 9 er de viktigste).

---

## 4. Rydding (RY)

Grunnlag: `main` på 9f39c7d44 (06.10.2026). Bare lesing.

### Oppsummering
- Kritisk: 0 · Høy: 0 · Middels: 8 · Lav: 12 (20 funn)
- Dekket: død kode i `src/` (knip 5 pluss egen import-graf over src, tests og scripts), redirect-sider, dubletter (dato, uke, etterlevelse, knapper, toast, Caddie), TODO og utkommentert kode med `git blame`, avhengigheter i package.json, `npm audit` og `npm outdated`.
- IKKE dekket: død kode i `designsystem/`, `.design-sync/`, `docs/`, `.agents/`, `.codex/` (knip meldte ca. 470 «ubrukte» filer der, vurdert som støy). Ikke kontrollert om døde filer var planlagt gjenbrukt i den pågående Precision-porteringen (se RY-01). Strengreferanser i Notion/Drive er ikke sjekket.
- Metode for «død»: en fil regnes som død når ingen levende fil importerer den (statisk, `@/`-alias eller relativt, også `import()`), og ingen script, test eller config peker på den. Next.js-spesialfiler (page, layout, route, loading, error osv.) er sjekket og ingen av dem står på lista. Gjenstående usikkerhet: filer lastet via strengbygde stier. Fant ingen slike (ingen `import(\`...\`)` i src).
- Rådata ligger i `docs/review/vedlegg/doedkode-filliste.txt` (alle 432 filer med område og linjetall), `docs/review/vedlegg/doedkode-per-pr.txt` (filene fordelt på del-PR-ene) og rå knip-rapport (ikke lagt inn; kjør `npx knip@5` på nytt).

---

### 1. Død kode

#### RY-01 · 432 filer (ca. 112 000 linjer) i src/ importeres ikke av noe levende
- Alvorlighet: Middels
- Fil: se `docs/review/vedlegg/doedkode-filliste.txt`. Størst: `src/components/admin/v2/` (115 filer, 32 600 linjer), `src/components/portal/v2/` (51 filer, 20 700 linjer), `src/app/portal/` (24 hjelpefiler, 5 700 linjer), `src/components/shared/` (19), `src/components/admin/` (17), `src/components/portal/` (16 + 14 i `runde-logg`), `src/components/ui/` (16), `src/app/team-wang/` (9), `src/components/sg-hub/` (9), `src/lib/*` (ca. 70 filer fordelt på 40 mapper)
- Hva er galt: Av 4 073 filer i `src/` er 432 «døde» (ca. 11 %). De fleste er gamle skjermer fra før Precision-bytte (navn med `V2`, `TrainLock`, `Admin…V2`) og skjermer som er erstattet av `src/components/admin/precision/AG*` og `src/components/portal/precision/*`. 8 av dem importeres bare av visuelle testoppsett (`tests/visual/portering/*`, `tests/visual/workbench/fixture.tsx`).
- Hva kan skje: Ingenting krasjer i dag. Men: (1) en utvikler eller AI-agent kan «fikse» feil fil fordi den ser levende ut, (2) bygg, lint og typesjekk bruker tid på 112 000 linjer ingen kjører, (3) de døde filene inneholder gamle regler (f.eks. nivånavn, ordbruk) som dukker opp i søk.
- Forslag til retting: Slett i lag, etter at porteringen er ferdig (se RY-02 for forbehold). Rekkefølge og del-PR-er: P5a–P5v i `docs/review/vedlegg/doedkode-per-pr.txt` (22 PR-er à maks 20 filer, sortert slik at filer som importerer andre slettes først, ellers brekker `tsc`). Anbefalt prosedyre per PR: slett filene, kjør `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run prosjekt:sjekk`, og `npm run prosjekt:register` (filregisteret `docs/vedlikehold/filregister.json` peker på mange av filene). Kjør `npx knip@5` på nytt etter hver PR; nye filer kan da bli «døde».
  Oversikt (antall filer / linjer):
  - P5a (20/6 005) app/portal, app/(marketing) pga-explorere, app/admin, app/innsyn
  - P5b (20/8 647) components/admin (compliance, spiller-detalj, caddie v1), app-filer
  - P5c–P5f (4×20 / 23 000) components/admin/v2
  - P5g (20/3 977) admin/v2-rest, forelder, kommando, agencyos, marketing, onboarding
  - P5h–P5j (60 / 19 600) components/portal, runde-logg, portal/v2
  - P5k–P5q (140) components/shared, sg-hub, workbench, toppidrett, resten av admin/v2
  - P5r–P5v (92) lib/* og components/ui (til slutt, fordi alt annet importerer dem)
- PR-gruppe: P5-dødkode
- Status: Ny

#### RY-02 · Døde V2/Train-lock-skjermer kan være «funksjonsinventar» som Anders har bedt om å beholde
- Alvorlighet: Middels
- Fil: `.claude/rules/beslutninger.md` (§Design 21.09.2026: «Kode med Train-lock-/Paper-/v2-navn beholdes til funksjonene er flyttet»); `src/components/portal/v2/WorkbenchV2.tsx` (3 900 linjer; nå bare brukt av døde `src/components/admin/v2/CoachWorkbenchMount.tsx`)
- Hva er galt: Prosjektets regel sier at gamle skjermer ikke skal slettes før funksjonene er flyttet til Precision. Samtidig er de nå ikke koblet til noen rute. Jeg kan ikke avgjøre fra koden om alle funksjonene er flyttet (f.eks. dra-og-slipp i uka, `@dnd-kit` finnes bare her).
- Hva kan skje: Slettes for tidlig, forsvinner den eneste kopien av logikk som ikke er portert (f.eks. dra-og-slipp med @dnd-kit/core, mobil dag-agenda, årsplan-visning). Beholdes alt, vokser rotet.
- Forslag til retting: Før P5c–P5j: Anders (eller portering-agenten) krysser av mot `docs/design-handoff/regler/claude-code.md` og skjermlista at hver slettet skjerm er portert. Slett gamle skjermer i den rekkefølgen portering bekreftes. Git-historikken beholder alt, så sletting kan angres.
- PR-gruppe: P5-dødkode
- Status: Usikker (krever Anders' ja)

#### RY-03 · Filer som ser døde ut, men som ikke kan slettes uten å endre en sjekk
- Alvorlighet: Lav
- Fil: `src/app/sw.ts` (bygges av `serwist.config.mjs`), `src/components/workbench-hybrid/taxonomy.ts` (leses av `scripts/ordbok-json.ts`, som kjører i `verify`), `src/components/workbench/wb-ak-scope.ts` (nevnt i CSS), `src/lib/scrapers/gjgt.ts` (`scripts/import-gjgt.ts`), `src/app/team-gfgk/data.ts` (`scripts/check-sensitive-route-guards.mjs`), `src/components/shared/del-runde-modal.tsx`, `src/components/workbench/WeekPlanEditor.tsx`, `src/components/workbench/WorkbenchUke.tsx` (alle tre nevnt i `scripts/check-token-gap.mjs`), `src/components/portal/v2/chat/PortalChatHjem.tsx` (se RY-04). Ni filer til sammen.
- Hva er galt: Knip eller importgrafen sier «ubrukt», men en vakt eller bygging peker på dem.
- Hva kan skje: Sletter noen dem, blir `npm run verify` rød eller service worker (offline-støtten) slutter å bygges.
- Forslag til retting: Holdt utenfor P5-listene. Ta dem i egen liten PR sammen med endring av skriptene.
- PR-gruppe: P5-dødkode
- Status: Ny

#### RY-04 · «Kritisk» inngang som ikke brukes: PortalChatHjem
- Alvorlighet: Middels
- Fil: `scripts/check-critical-imports.mjs:7-13`, `src/components/portal/v2/chat/PortalChatHjem.tsx`
- Hva er galt: Vakten `check-critical-imports` bygger fem «kritiske» filer for å fange importfeil, og én av dem (`PortalChatHjem`) importeres ikke av noen side lenger. Vakten gir falsk trygghet: den tester en fil brukerne aldri laster.
- Hva kan skje: En ekte importfeil i den levende portal-chatten blir ikke fanget før bygging/kjøring.
- Forslag til retting: Bytt ut oppføringen med filen som faktisk monteres i portalen (finn den fra `src/app/portal/layout.tsx`). Gjøres sammen med RY-03.
- PR-gruppe: P5-dødkode
- Status: Ny

#### RY-05 · Server-actions og hjelpefiler under `src/app/` er døde
- Alvorlighet: Lav
- Fil: bl.a. `src/app/portal/(legacy)/ny-okt/actions.ts`, `…/onskeligokt/actions.ts`, `…/tren/ovelser/actions.ts`, `…/tren/aarsplan/periode/actions.ts`, `…/mal/runder/logg/actions.ts`, `src/app/portal/mal/trackman/actions.ts`, `src/app/portal/talent/sammenligning/actions.ts`, `src/app/portal/(legacy)/coach/actions.ts`, `src/app/innsyn/talent/ressurser/actions.ts`, `src/app/team-wang/_components/*` (9), `src/app/team-gfgk/_components/*` (5), `src/app/(marketing)/stats/pga/*/explorer.tsx` (6) — 51 filer totalt (src/app)
- Hva er galt: «Server actions» er funksjoner som skjemaer og knapper kan kalle fra nettleseren. Disse har ingen kaller. En server action som ingen bruker er likevel en åpen inngang som kan kalles direkte hvis noen kjenner adressen.
- Hva kan skje: Hvis en av dem mangler tilgangssjekk, er det en uutnyttet, men reell angrepsflate. `npm run check:action-auth` sjekker for dette, så risikoen er trolig lav (ikke verifisert per fil).
- Forslag til retting: Slett (P5a, P5d, P5n i planen) fremfor å vedlikeholde. Ekstra gevinst for sikkerhet.
- PR-gruppe: P5-dødkode
- Status: Ny

#### RY-06 · 163 av 532 sider er bare videresending (redirect)
- Alvorlighet: Lav
- Fil: liste i `docs/review/vedlegg/redirect-sider.txt`. Flest: `src/app/admin/(legacy)/` (24), `src/app/portal/(legacy)/` (19), `src/app/admin/talent/` (9), `src/app/admin/settings/` (6), `src/app/admin/plans/` (6), `src/app/admin/agenticos/` (6), `src/app/portal/meg/` (5), `src/app/innsyn/talent/` (5), `src/app/admin/spillere/` (5), `src/app/admin/agencyos/` (5)
- Hva er galt: Nesten hver tredje side gjør ikke annet enn å sende brukeren videre. Det er etter prosjektregelen «gamle adresser blir redirects, ingenting fjernes», så det er bevisst.
- Hva kan skje: Ingenting galt, men mange er lagt som egne filer i stedet for i `redirects()` i `next.config.ts` (der det finnes ca. 80 oppføringer). Det gjør rutekartet tungt å lese.
- Forslag til retting: IKKE slett. Valgfritt senere: flytt statiske videresendinger til `next.config.ts` (én fil) og behold sider bare der videresendingen avhenger av data (som `src/app/admin/plans/[planId]/page.tsx`). Krever kontroll av at ingen e-post, QR-kode eller bokmerke bruker adressene.
- PR-gruppe: Ingen (bare rapport)
- Status: Ny

#### RY-07 · 386 ubrukte eksporter og 612 ubrukte typer
- Alvorlighet: Lav
- Fil: rå knip-rapport (kjør `npx knip@5`). Flest: `src/lib/domain` (95), `src/components/portal` (88), `src/components/admin` (57), `src/lib/agents` (55), `src/components/v2` (51), `src/app/portal` (33), `src/components/marketing` (31), `src/lib/portal` (30), `src/lib/workbench` (26), `src/components/athletic` (25)
- Hva er galt: Funksjoner og typer som eksporteres, men aldri importeres (mange er bare brukt i egne tester).
- Hva kan skje: Støy; vanskelig å se hva som er offentlig kontrakt. Ikke farlig.
- Forslag til retting: Ta etter at P5 er ferdig (tallet synker kraftig når døde filer er borte). Fjern `export` fra det som bare brukes lokalt, og slett det som ikke brukes av tester heller. Fire dubletter å se på først: `src/components/v2/core.tsx` (`IkonRail`, `Sidebar`), `src/components/v2/domene.tsx` (`OktKort`, `OektKort`), `src/lib/agencyos/agent-registry.ts` (`AGENTER_UTEN_TIDSPLAN`, `MANUELLE_AGENTER`) eksporteres to ganger under ulike navn.
- PR-gruppe: P5-dødkode
- Status: Ny

#### RY-08 · Stilark som ikke importeres av noen fil
- Alvorlighet: Lav
- Fil: `src/styles/ak-golf-ds.css`, `src/styles/ak-golf-ds-grunnlag.css`, `src/styles/ak-golf-ds-tokens.generert.css`, `src/styles/workbench-lov.css`
- Hva er galt: De tre første importerer hverandre, men ingen `.tsx` eller `globals.css` importerer toppfila `ak-golf-ds.css`. `workbench-lov.css` importeres bare av den døde `CoachWorkbenchMount.tsx`. `npm run verify` kjører en vakt (`scripts/ak-golf-ds-tokens.mjs --sjekk`) som holder den genererte fila i takt, så vi bruker tid på å vedlikeholde en fil ingen laster.
- Hva kan skje: Ingenting synlig. Forvirring om hva som er gjeldende tokens (`src/styles/ak-hq-tokens.css`, `globals.css`).
- Forslag til retting: Sjekk først om `ak-golf-ds.css` brukes av Tailwind-oppsettet (`postcss.config.mjs`) eller `@import` i et annet stilark jeg ikke fant. Hvis ikke: fjern sammen med vakten.
- PR-gruppe: P5-dødkode
- Status: Usikker

---

### 2. Dubletter

#### RY-09 · Ca. 60 hjemmelagde datoformaterere
- Alvorlighet: Lav
- Fil: Eksempler: `formatDato` i 17 filer (`src/app/portal/booking/[bookingId]/page.tsx:45`, `src/app/portal/meg/abonnement/page.tsx:25`, `src/app/portal/meg/dokumenter/page.tsx:14`, `src/components/portal/v2/BookingHubV2.tsx:51`, `src/components/portal/v2/MegV2.tsx:107`, `src/lib/email/templates/shared.ts:9` m.fl.), `fmtDato` i 11 filer (`src/app/team-wang/_components/live-seksjoner.tsx:30`, `src/lib/pdf/plan-document.tsx:266`, `src/lib/portal-okt/coach-tilbakemelding-data.ts:63` m.fl.), `datoKort` i 9 filer (`src/components/portal/v2/CoachHubV2.tsx:44`, `src/components/workbench/WorkbenchAar.tsx:47`, `src/components/workbench/WorkbenchPeriode.tsx:44`, `src/components/workbench/YearPeriodePanel.tsx:22`, `src/lib/datagolf/stasjon.ts:314` m.fl.), `formatDatoTid`, `formatTid`, `formatKlokke` m.fl. I tillegg 503 direkte kall til `Intl.DateTimeFormat`/`toLocaleDateString` i 315 filer.
- Hva er galt: Hver fil har sin egen måte å skrive «6. okt.» på. Det finnes ingen felles dato-formaterer (kun `formatPeriode`, `dagNavnKort`, `dagNavnLang` i `src/lib/uke-helpers.ts`).
- Hva kan skje: Ulik datoskrivemåte mellom skjermer, og risiko for feil tidssone (appen skal alltid bruke Oslo, jf. gotchas §Tid og datoer). Hvis én bruker `toLocaleDateString` uten `timeZone: "Europe/Oslo"`, kan en økt kl. 00:30 norsk tid vises på feil dag på serveren (UTC).
- Forslag til retting: Lag `src/lib/dato-format.ts` med 4–5 funksjoner (kort, lang, med klokkeslett, bare klokkeslett, relativ) som alltid bruker Oslo, og bytt ut kopiene etter hvert som skjermer portes. Ikke gjør det i én stor PR.
- PR-gruppe: P3-data
- Status: Ny

#### RY-10 · Uke-hjelpere finnes i minst 30 utgaver
- Alvorlighet: Middels
- Fil: ISO-ukenummer: `isoUke` i 8 filer (`src/app/team-wang/_components/fane-kalender.tsx:67`, `src/app/team-wang/coach/coach-arsplan.tsx:49`, `src/components/shared/calendar/CalendarShell.tsx:214`, `src/lib/admin-kalender/week-data.ts:32`, `src/lib/admin/ukesrapport-deling.ts:15`, `src/lib/agents/weekly-plan-proposals.ts:157`, `src/lib/domain/tn-manedsplan.ts:54`, `src/lib/iup/fireukerssjekk.ts:26`), `isoWeek`/`isoUkeNr`/`isoUkeNummer`/`isoWeekKey`/`isoWeekNumber`/`getISOWeek` i 10 til (bl.a. `src/lib/workbench/insights.ts:88`, `src/lib/workbench/load-workbench.ts:200`, `src/lib/training/volum.ts:17`, `src/lib/pdf/plan-document.tsx:293`). Mandag i uka: `mondayOf` i 5 filer (`src/lib/workbench/apply-template-actions.ts:28`, `src/lib/workbench/load-workbench.ts:209`, `src/lib/workbench/session-move-math.ts:33`, `src/lib/domain/workbench/operations.ts:67`, `src/lib/admin-spiller/spiller-oversikt-data.ts:30`), `mandagFor` i 2, `startOfWeek` i 3, `weekStartOf`/`weekStartUtc`/`weekStartFor`/`weekStarts`/`mandagAv` i 5 til. Fasit skal være `src/lib/uke-helpers.ts` (`startOfWeek`, `ukenummer`).
- Hva er galt: Samme beregning skrevet om og om igjen, uten felles kilde. Noen bruker lokal tid, noen UTC, noen Oslo.
- Hva kan skje: Rundt nyttår og ved sommer/vintertid kan to skjermer vise ulik «uke 53» eller «uke 1», eller en økt havne i feil uke (spesielt nær søndag natt/mandag morgen, siden Vercel kjører UTC). Dette gir feil planlagt tid/etterlevelse i Workbench og ukerapporter.
- Forslag til retting: La `src/lib/uke-helpers.ts` eie `isoUke(date)` og `mandagIUken(date)` (Oslo-tid, med test rundt årsskifte og DST-bytte), og bytt ut de andre. Små PR-er per område (workbench, kalender, team-wang). Verifiser at tester dekker uke 52/53/1.
- PR-gruppe: P3-data
- Status: Ny

#### RY-11 · Etterlevelse er nå ett regnestykke (OK), men to navn
- Alvorlighet: Lav
- Fil: `src/lib/domain/etterlevelse.ts:32` (`etterlevelse`), `src/lib/workbench/compliance.ts:52` (`adherencePct`, kaller `etterlevelse`)
- Hva er galt: Ingenting alvorlig. Beslutningen 26.09 er fulgt: `adherencePct` er bare en tynn omskriver av `etterlevelse` (minutter, fire uker). Funnet er ment som bekreftelse. Rester: to navn (`etterlevelse`/`adherence`) og to filer for samme begrep; `src/lib/portal/etterlevelse-data.ts` og `src/lib/admin-compliance/compliance-data.ts` er egne innhentingsfiler.
- Hva kan skje: Ny kode kan lage en tredje variant.
- Forslag til retting: Marker `adherencePct` som utgående og la nye kall bruke `etterlevelse()`. Lite arbeid.
- PR-gruppe: Ingen (bare rapport)
- Status: Ny

#### RY-12 · Tre knappe-familier, tre kort-familier, to toast-systemer
- Alvorlighet: Lav
- Fil: Knapper: `src/components/ui/button.tsx` (6 importerere), `src/components/athletic/golfdata/Button.tsx`, `src/components/marketing/ak/Knapp.tsx`. Kort: `src/components/athletic/golfdata/Card.tsx`, `src/components/marketing/ak/Kort.tsx`, `src/components/ui/kpi-card.tsx`, `src/components/ui/athletic-hero-card.tsx` (død). Toast: `src/components/shared/toast.tsx` + `toast-provider.tsx` (9 importerere), `src/components/ui/toast.ts`, og `sonner` direkte (17 importerere). Skall: `src/components/v2/shell.tsx`, `src/components/agencyos/workbench/shell.tsx`, `src/components/team-norway` (`TnShell`). Skjelett: `ui/skeleton.tsx` og `athletic/golfdata/Skeleton.tsx`.
- Hva er galt: Flere parallelle komponentsett for samme jobb. En del er bevisst (Team Norway og markedssidene har eget uttrykk, jf. beslutninger.md).
- Hva kan skje: Ulik utseende og oppførsel (f.eks. toast som forsvinner etter 3 sek i én og 5 i en annen), og feilretting må gjøres to–tre steder.
- Forslag til retting: Ikke slå sammen nå. Velg ett toast-system (sonner er mest brukt) og flytt resten når skjermene portes. Behold Team Norway og marketing som egne.
- PR-gruppe: P8-designforberedelse
- Status: Ny

#### RY-13 · Caddie-chat finnes i to generasjoner (v1 er død)
- Alvorlighet: Lav
- Fil: Død v1: `src/components/admin/caddie/caddie-approval-modal.tsx`, `caddie-chat.tsx`, `caddie-message.tsx`, `caddie-tool-call.tsx` (+4 filer), `src/components/admin/caddie/use-caddie-chat.ts`. Levende v2: `src/components/admin/v2/caddie/*-v2.tsx`, og `src/components/portal/v2/chat/use-portal-chat.ts` som importerer fra v1-hooken.
- Hva er galt: Samme chat i to sett. `use-caddie-chat.ts` er «død» ifølge importgrafen, men `use-portal-chat.ts` nevner den (bekreftet: `use-portal-chat.ts` nevner den bare i en kommentar, så den kan slettes).
- Hva kan skje: Retting gjøres i feil versjon.
- Forslag til retting: Slett v1 (P5b). Etter det kan `react-markdown` og `remark-gfm` i package.json bli ubrukt (se RY-19), siden bare v1 importerer dem.
- PR-gruppe: P5-dødkode
- Status: Ny

#### RY-14 · To nesten like globale søke-modaler
- Alvorlighet: Lav
- Fil: `src/components/admin/global-search-modal.tsx` (1 075 linjer), `src/components/portal/global-search-modal.tsx` (824 linjer)
- Hva er galt: Begge er levende og har mye felles struktur (`formatDateTime` finnes i begge, 360 og 313). Portal-utgaven har også et utkommentert blokk-eksempel (se RY-17).
- Hva kan skje: Samme feil i to filer.
- Forslag til retting: Trekk ut felles del (liste, tastaturhåndtering, formatering) til `src/components/shared/`. Gjør etter portering.
- PR-gruppe: P8-designforberedelse
- Status: Usikker (jeg har ikke lest filene linje for linje for å bekrefte graden av likhet)

---

### 3. Gamle eksperimenter, utkommentert kode, TODO

#### RY-15 · Tripletex-integrasjonen har ubekreftede antakelser (79 dager gamle)
- Alvorlighet: Middels
- Fil: `src/lib/tripletex/client.ts:13, 48, 122, 167` (`TODO(verifiser-mot-api)`, alle fra 19.07.2026), `src/lib/agents/mulligan-vaskeliste-agent.ts:13`
- Hva er galt: Kommentarene sier at ALLE endepunkt-stier og svarformer mot Tripletex er antatt, ikke bekreftet mot API-dokumentasjonen. De er 79 dager gamle (grensen var 60).
- Hva kan skje: Lønns- og månedsavslutningsagentene (`src/lib/agents/tripletex-*`) kan hente feil felt eller feile stille, og gi tomme eller feil økonomitall. Prosjektregelen er at økonomitall aldri skal estimeres (`admin-tripletex.md`).
- Forslag til retting: Bekreft hver sti mot Tripletex' API-dokumentasjon (ev. Anders eksporterer et eksempel), fjern TODO-ene, og gjør at agentene viser «mangler» ved uventet svar i stedet for å anta. Hører mer hjemme under data/tester enn rydding.
- PR-gruppe: P3-data
- Status: Ny

#### RY-16 · Notion-koblingen (Meg) antar feltnavnet «Virksomhet»
- Alvorlighet: Lav
- Fil: `src/lib/meg/connectors/notion.ts:101`, `src/lib/meg/connectors/notion.test.ts:8` (`TODO(verifiser-mot-notion-schema)`, 19.07.2026)
- Hva er galt: Koden antar at Notion-egenskapen «Virksomhet» finnes med bestemt navn og type. Testene bygger på samme antakelse, så de fanger ikke feil.
- Hva kan skje: Oppgaver fra Notion får ingen virksomhet i Meg-oversikten hvis feltet heter noe annet.
- Forslag til retting: Sjekk i Notion hva feltet heter og fjern TODO-en.
- PR-gruppe: P4-tester
- Status: Ny

#### RY-17 · Utkommentert kode og stubber
- Alvorlighet: Lav
- Fil: `src/components/portal/global-search-modal.tsx:208-216` (utkommentert tema-bytte, 25.05.2026, 134 dager); `scripts/scrape-wagr-rounds.ts:77-100` (to TODO og en utkommentert plan på 6 linjer, stub som skriver «STUB» og returnerer tomt, 25.05.2026, listet i `scripts/katalog.md:148`); `scripts/import-norske-turneringer.ts:822` (`TODO: egen tabell senere`, 25.05.2026: score_by_age lagres som JSON i feltet `ngfId`); `src/lib/avatar-colors.ts:4` (TODO: gjør om til tokens, 13.05.2026, 146 dager); `src/components/gruppe-kalender/gruppe-kalender-wrapper.tsx:8` og `src/lib/gruppe-kalender/bygg-visninger.ts:5` (`eslint-disable … TODO(opprydding)`, 08.07.2026, 90 dager). Bare 2 blokker på 5+ linjer med utkommentert kode i hele `src/`, `scripts/`, `prisma/` og `tests/`; øvrig kode er ren.
- Hva er galt: Gamle ufullførte spor. `scripts/import-norske-turneringer.ts` lagrer en annen type data i `ngfId`-feltet (misbruk av feltnavn).
- Hva kan skje: Hvis noen kjører `scrape-wagr-rounds.ts` tror de at WAGR-data hentes, men ingenting lagres. Misbrukt `ngfId`-felt kan gi feil ved senere NGF-kobling.
- Forslag til retting: Slett eller merk stubben tydelig i `scripts/katalog.md`; slett utkommentert blokk; legg tokens for avatar-farger inn med Precision-tokens (P8).
- PR-gruppe: P5-dødkode
- Status: Ny

#### RY-18 · Eksportfunksjon som lover nedlasting fra en rute som ikke finnes
- Alvorlighet: Middels
- Fil: `src/app/admin/tournaments/actions.ts:418-449` (`exportTournamentsReport`, linje 434 er en «Placeholder URL», 13.07.2026)
- Hva er galt: Funksjonen sjekker tilgang og skriver revisjonsspor, men returnerer en nedlastingslenke `/api/exports/tournaments/<fil>`. Mappen `src/app/api/exports/` finnes ikke. Funksjonen kalles heller ikke fra noen skjerm (bare tester).
- Hva kan skje: Kaller noen den, får de «Eksport klar», men lenka gir 404. Revisjonsloggen viser en eksport som aldri skjedde.
- Forslag til retting: Slett funksjonen (og testene) eller bygg ruta. Siden ingen skjerm bruker den: slett.
- PR-gruppe: P5-dødkode
- Status: Ny

#### RY-19 · Midlertidig telemetri i fangst-arket
- Alvorlighet: Lav
- Fil: `src/components/portal/v2/chat/FangstSheet.tsx:28, 224, 814`
- Hva er galt: «Stoppeklokka er midlertidig telemetri — skal ut når tallet er …» (lagt til 11.08.2026, 56 dager, under 60-dagersgrensen, men ligger tett på).
- Hva kan skje: Gjenstående måling lever videre i produksjon.
- Forslag til retting: Fjern når 20-sekundersmålet er verifisert. Filen er ellers levende (portal chat).
- PR-gruppe: Ingen (bare rapport)
- Status: Ny

---

### 4. package.json

#### RY-20 · Avhengigheter som ikke brukes (eller bare av død kode)
- Alvorlighet: Lav
- Fil: `package.json`
- Hva er galt (verifisert med søk i src, scripts, tests og config):
  - Ingen bruk: `@vercel/blob` (0 treff), `@dnd-kit/sortable` (0 treff), `@ai-sdk/gateway` (bare i en kommentar som sier «IKKE @ai-sdk/gateway», `src/lib/ai-plan/week-suggest.ts:3`), `@types/pixelmatch` (skriptene er .mjs), `@types/dompurify` (dompurify 3 leverer egne typer; usikker), `@types/mapbox-gl` (mapbox-gl 3 leverer egne typer; usikker).
  - Bare brukt av død kode: `@dnd-kit/core` (kun `WorkbenchV2.tsx`), `react-markdown` og `remark-gfm` (kun de døde `caddie-message.tsx`; v2 nevner dem i en kommentar), `rrule` (kun død `session-generator.ts` og ett seed-skript).
  - Må beholdes selv om knip sier «ubrukt»: `@serwist/next` og `serwist` (service worker), `@serwist/cli` (kommandoen `serwist build`), `@mdx-js/loader` og `@mdx-js/react` (kreves av `@next/mdx` i `next.config.ts`, usikker på om Next 16 krever begge; sjekk før fjerning), `@prisma/client` (brukes av `@prisma/adapter-pg`/generert klient), `pngjs`/`pixelmatch` (bildesammenligningsskript).
- Hva kan skje: Større installasjon og flere pakker å oppdatere og sikre uten nytte.
- Forslag til retting: Fjern `@vercel/blob`, `@dnd-kit/sortable`, `@ai-sdk/gateway` og de to ubrukte `@types`-pakkene nå (liten PR). Fjern `@dnd-kit/core`, `react-markdown`, `remark-gfm`, `rrule` først når P5 har slettet de døde filene (rrule bare om seed-skriptet er foreldet).
- PR-gruppe: P6-avhengigheter
- Status: Ny

#### RY-21 · Pakker koden bruker, men som ikke står i package.json
- Alvorlighet: Middels
- Fil: `src/lib/portal-tester/tn-photo.ts:2` og `src/app/api/portal/tester/test-photo/route.ts` (importerer `sharp`), `src/lib/google-calendar.ts:17` (`google-auth-library`), `postcss.config.mjs` (`postcss`), `tests/integration/agencyos-live-summary.test.mjs` (`@electric-sql/pglite`)
- Hva er galt: `sharp` og `google-auth-library` er levende kode i produksjon, men kommer bare med fordi andre pakker (`next`, `googleapis`) trekker dem inn. De er ikke nevnt i `package.json`.
- Hva kan skje: Oppdaterer Next eller googleapis og slutter å trekke dem inn (eller bytter versjon), slutter bildeopplasting av testbilder (Team Norway) og Google-kalender-synk å virke. Feilen vises først ved kjøring i produksjon.
- Forslag til retting: Legg `sharp`, `google-auth-library`, `postcss` (og `@electric-sql/pglite` som devDependency) til i `package.json` med samme versjon som i `package-lock.json`.
- PR-gruppe: P6-avhengigheter
- Status: Ny

#### RY-22 · Sårbarheter (`npm audit`, 06.10.2026)
- Alvorlighet: Middels
- Fil: `package.json`, `package-lock.json`
- Hva er galt: Bare produksjon (`--omit=dev`): 0 kritiske, 1 høy, 4 moderate. Med dev-pakker: 0 kritiske, 6 høye, 4 moderate.
  - Høy, i produksjon: `source-map-js` (1.0.0–1.2.1, lar noen fryse en prosess med spesiallaget input — «denial of service»). Retting finnes uten major-hopp: `npm audit fix`.
  - Moderat, i produksjon: `gray-matter` (direkte) trekker inn `js-yaml` 3.x, `argparse` og `sprintf-js` (alle med kjente DoS-svakheter). Brukes av `src/lib/blogg/posts.ts` til å lese blogginnlegg fra filer, ikke brukerinput. `npm audit` foreslår å gå ned til gray-matter 2.0.1, noe som er feil vei; reell retting er å bytte til en annen frontmatter-leser eller overstyre `js-yaml` til 4.x (`overrides`).
  - Høy, kun utvikling: `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob`/`micromatch`/`braces` (stack-overflow-DoS). Påvirker bare lint på utviklermaskiner og CI, ikke produksjon. Forslaget om å gå til `eslint-config-next@14` er feil; vent til ny 16.x eller overstyr `braces`.
- Hva kan skje: Lav praktisk risiko: ingen av dem behandler uskikket data fra brukere i dag.
- Forslag til retting: Kjør `npm audit fix` for `source-map-js`. Overstyr `js-yaml` eller bytt gray-matter. Resten kan vente.
- PR-gruppe: P6-avhengigheter
- Status: Ny

#### RY-23 · 50 utdaterte pakker, 13 med nytt hovedversjonsnummer
- Alvorlighet: Lav
- Fil: `package.json`
- Hva er galt: Nye hovedversjoner (kan ha brytende endringer): `ai` 6→7, `@ai-sdk/anthropic` 3→4, `@ai-sdk/gateway` 3→4, `@ai-sdk/openai-compatible` 2→3, `@ai-sdk/react` 3→4, `openai` 6→7, `stripe` 22→23, `@stripe/stripe-js` 9→10, `@stripe/react-stripe-js` 6→7, `googleapis` 171→183, `eslint` 9→10, `typescript` 5.9→7.0, `prisma` 7.10→8.0.0-rc (forhåndsversjon, ikke gå dit), `dotenv` 17→18, `pixelmatch` 7→8, `@types/node` 20→26 (prosjektet krever Node 24, så `@types/node@24` er riktigere enn 20). Merk: `@anthropic-ai/sdk` står på 0.95 mot siste 0.131 (ikke «major», men ligger langt bak og er 0.x der alt kan brekke). Småoppdateringer innenfor `^`: ca. 35 pakker (bl.a. `@supabase/supabase-js`, `@playwright/test`, `next` er allerede 16.3.8, `react`/`react-dom` 19.2.4→19.3.0).
- Hva kan skje: Ingen akutt feil. Stripe og AI-pakkene er viktigst: betaling og AI-svar er de stedene en sen oppdatering gir sikkerhets- eller kompatibilitetsproblemer.
- Forslag til retting: Egen PR for småoppdateringer (`npm update`, kjør `npm run verify`). Hovedversjoner én og én, med Stripe og `ai`-pakkene først, hver med røyktest. Ikke hopp til TypeScript 7 eller Prisma 8 rc nå.
- PR-gruppe: P6-avhengigheter
- Status: Ny

#### RY-24 · Døde dev-skript og engangsskript
- Alvorlighet: Lav
- Fil: `scripts/` (217 filer, 41 med dato i navnet, bl.a. 19 `add-*-2026-*.ts`)
- Hva er galt: Datostemplede engangsskript (`add-follow-up-case-2026-09-23.ts`, `add-tn-test-photos-2026-10-02.ts` osv.) er allerede kjørt mot basen; de står som «record» (prosjektregel gotchas §Database). Knip meldte 211 skript som «ubrukte», men dette er forventet for kjørbare skript.
- Hva kan skje: Ingenting. Risiko ved å kjøre dem på nytt (de bruker `CREATE TABLE IF NOT EXISTS`, så trygge).
- Forslag til retting: IKKE slett. Valgfritt: flytt eldre enn 30 dager til `scripts/arkiv/`.
- PR-gruppe: Ingen (bare rapport)
- Status: Ny

---

## 5. Struktur før nytt design (ST)

Grunnlag: `main` 9f39c7d44 (06.10.2026). Bare lesing. Tall er målt maskinelt (egne engangsskript, ikke lagt inn) og stikkprøvekontrollert for hånd. Det fulle skjermkartet ligger i `docs/review/vedlegg/skjermkart.md`.

### Oppsummering

**Funn:** 0 kritiske · 0 høye · 6 middels · 5 lave (11 totalt).
Ingen sikkerhets- eller persondatafunn i dette området; alt gjelder det som må ryddes for at et nytt design kan tas inn uten at skjermer brekker.

**Dekket:** alle 349 `page.tsx` under `src/app/portal` (183) og `src/app/admin` (166). Skall, komponenter, stilfiler og tokens under `src/`. Hardkodede farger/fonter/avstander i alle 3 049 `.ts/.tsx/.css`-filer under `src/` (ikke tester, ikke genererte filer).
**Ikke dekket:** `/forelder`, `/auth`, `/team-wang`, `/team-norway`, markedssider og `/stats` (bare telt i token-tallene, ikke kartlagt som skjermer). Ingen visuell kontroll i nettleser; «samme skjerm vises likt» er ikke testet. Tester og skript er ikke med i importgrafen (derfor «Usikker» på død kode).

#### Antall sider per flate

| Flate | Sider totalt | Ekte sider (viser innhold) | Redirects (sender bare videre) |
|---|---|---|---|
| PlayerHQ `/portal` | 183 | 135 | 48 |
| AgencyOS `/admin` | 166 | 64 | 102 |
| Sum | 349 | 199 | 150 |

43 % av rutene er bare videresendinger (gamle adresser som beholdes). 59 av de «ekte» sidene kan i tillegg sende videre betinget (feil rolle, manglende tilgang eller parameter).

**Skall på de 199 ekte sidene:**
- Nytt Precision-skall: `PlayerHQSkall` 100 sider, `AgencyOSSkall` 40 sider.
- Gammelt `V2Shell`: 45 sider (25 i PlayerHQ, 20 i AgencyOS) + 5 sider som får det via `(legacy)/layout.tsx`.
- Fullskjerm uten skall (live-økt, runde, test): 7 sider.
- Ingen skall funnet: 2 sider (se ST-10).

**Skjerm-IDer:** Hver rute har en ID i `docs/design-system/skjermregister.csv` (150 «VIDERESENDING», 10 «UTEN-TEGNET-TYPE», resten PH-/AG-nummer). Registeret er laget på commit 127c49e7, eldre enn dagens main.

---

### Del 2: Komponenter som skal erstattes av designsystemet

«Sider» = antall av de 349 portal-/admin-sidene som når filen via import (også via skall og barnekomponenter). «Direkte» = antall filer som importerer den rett. Tall over ca. 85 betyr at filen sitter i skallet og dermed treffer nesten alle skjermer. «Dødt» = ingen side, layout eller rute når filen; tester/skript ikke sjekket (Usikker, se ST-03).

#### Skall og navigasjon

| Fil | Linjer | Sider | Direkte | Blander logikk og utseende? |
|---|---|---|---|---|
| `src/components/v2/shell.tsx` (V2Shell) | 1 454 | 45 | 48 | Ja. Inneholder navigasjonsdata (`PLAYERHQ_NAV`, `AGENCYOS_NAV`, `FORELDER_NAV`), tema- og cookie-logikk (`onsketTema`), 13 tilstandskall og 89 innebygde stilblokker. Navn og menypunkter må trekkes ut til egen datafil før bytte. |
| `src/components/precision/PlayerHQSkall.tsx` | 94 | 100 | 123 | Nei, nesten bare utseende. Vet hvilken fane som er aktiv ut fra adressen. Gode kandidat til å bli designsystemets skall. |
| `src/components/precision/AgencyOSSkall.tsx` | 157 | 40 | 68 | Lett blanding (6 tilstandskall: nattemodus, hurtigknapp, meny). |
| `src/components/precision/ForelderSkall.tsx` | 95 | 16 (alle sider) | 16 | Nei. |
| `src/components/precision/AdminSkallVelger.tsx` | 19 | 0 (kjøres i layout) | 1 | Ren logikk. Velger V2Shell eller ingenting ut fra listen `PORTERT`. |
| `src/components/precision/Hurtigknapp.tsx` | 112 | 40 | 1 | Lett blanding (flytting, meny). |
| `src/components/precision/pa.tsx` + `pa-a2..a5` + `pa-workbench.tsx` | 104 + 456 + 116 | 145 (pa.tsx) | 190 (pa.tsx) | Nei. Dette er allerede et lite designsystem (Knapp, Ikon, StatusPille, AkseMerke, Tidslinje, Sidehode, tilstander, Ark, Side, Nøkkelverdi). Se Del 3. |

#### Kalender

| Fil | Linjer | Sider | Direkte | Blander? |
|---|---|---|---|---|
| `src/components/v2/kalender.tsx` + `time-grid.tsx` | 438 + 317 | 89 | 3 + 3 | Mest utseende (75 innebygde stilblokker). Når alle sider fordi skallet importerer dem. |
| `src/components/portal/v2/KalenderV2.tsx` (brukt av `/portal/kalender`) | 389 | 1 | 1 | Lett. |
| `src/components/portal/precision/PH10Plan.tsx` (`/portal/planlegge`) | 269 | 1 | 1 | Ja: kaller server-handlinger for å flytte økter (`moveSession`) og viser samtidig kalenderen. |
| `src/components/admin/precision/AG05Kalender.tsx` (`/admin/kalender`) | 242 | 1 | 1 | Lett. |
| `src/components/athletic/golfdata/MaanedKalender.tsx` | 371 | 9 | 1 | Nei. |
| `src/components/gruppe-kalender/flere-grupper-kalender.tsx` | 56 | 1 | 1 | Nei. |
| DØDE: `AgencyKalenderV2.tsx` (1 767), `KalenderLagUkeV2.tsx` (953), `admin/kalender/week-calendar.tsx` (425), `shared/calendar/CalendarShell.tsx` (222) + `SessionCard.tsx` (134), `AdminKalenderManedV2.tsx` (224) | 3 725 | 0 | 0 | Ikke i bruk, se ST-03. |

Kalenderen finnes altså i tre levende utgaver (spiller, coach, golfdata-måned). Ingen felles kalenderkomponent.

#### Workbench

Levende motor: `WorkbenchSamlet` (`src/components/workbench/`) med `WorkbenchSesongkart`, `WorkbenchUkeverksted`, `WorkbenchTrenerbord`, `WorkbenchAnalyse`, `WorkbenchAar`, `WorkbenchPeriode`, `WorkbenchManed`, `WorkbenchStall`, og `AG11Workbench` + `AG11Ark` + `AG11Moduler` + `AG11Gruppe` (`src/components/admin/precision/`). Spillerens `/portal/planlegge/workbench` bruker `PH11Workbench` (60 linjer), som bare pakker inn `AG11Workbench`.

| Fil | Linjer | Sider | Direkte | Blander? |
|---|---|---|---|---|
| `workbench/WorkbenchSamlet.tsx` | 102 | 2 | 2 | Nei, tynn styring. |
| `workbench/WorkbenchUkeverksted.tsx` | 194 | 2 | 1 | Ja. Importerer server-handlinger direkte, 18 tilstandskall, 71 `className`. |
| `workbench/WorkbenchSesongkart.tsx` | 111 | 2 | 1 | Ja, samme mønster (17 tilstandskall + server-handlinger). |
| `workbench/WorkbenchTrenerbord.tsx` | 73 | 2 | 1 | Ja (16 tilstandskall + server-handlinger). |
| `workbench/WorkbenchPeriode.tsx` / `WorkbenchAar.tsx` / `WorkbenchManed.tsx` | 250 / 152 / 90 | 2 | 2 | Ja, server-handlinger i selve visningen. |
| `admin/precision/AG11Workbench.tsx` | 491 | 2 | 3 | Ja. 19 tilstandskall, dra-og-slipp, plan-logikk (`flyttPlanUke`) og utseende i én fil. |
| `admin/precision/AG11Ark.tsx` | 481 | 3 | 8 | Ja. 33 tilstandskall og server-handlinger i ark-visningene. |
| `admin/precision/AG11Moduler.tsx` / `AG11Gruppe.tsx` | 324 / 70 | 2 / 1 | 2 / 1 | Moduler: lett. Gruppe: nei. |
| `workbench/WeekGrid.tsx` | 72 | 2 | 7 | Nei, men `osloIdag` fra denne filen brukes av AG11 (logikk i visningsfil). |
| `workbench/DrillListEditor.tsx` | 854 | 3 | 2 | Ja, mye. Øvelsesliste, redigering og server-handlinger i én fil, 37 innebygde stilblokker. |
| `workbench/OvelseSkjema.tsx` | 332 | 3 | 2 | Ja (10 tilstandskall). |
| `workbench/useUkeMotor.ts` | – | – | – | Ren logikk, bra. Trekk-ut-mønsteret som resten bør følge. |
| `portal/v2/WorkbenchAarsplan.tsx` | 621 | 1 | 2 | Ja, server-handlinger. |
| DØDE: `portal/v2/WorkbenchV2.tsx` (3 914, den største enkeltfilen i komponentlaget) + `WorkbenchV2Mobil`, `WorkbenchInngang`, `WorkbenchColdstart`, `WorkbenchV2Sheets`; `admin/coach-workbench/coach-workbench.tsx` (867) + `CoachWorkbenchMount`, `admin/v2/WorkbenchMobilV2`; `workbench/WorkbenchUke.tsx`, `WorkbenchOkt.tsx`, `WorkbenchShell.tsx`, `MonthGrid.tsx`, `YearGrid.tsx`, `SessionInspector.tsx`, `WeekPlanEditor.tsx` | ca. 8 000 | 0 | 0–3 (bare fra andre døde filer) | Ikke i bruk, se ST-03. |

#### Øktkort, øvelseskort, scorekort

| Fil | Linjer | Sider | Direkte | Blander? |
|---|---|---|---|---|
| `precision/pa-workbench.tsx` (`Oktkort`, `Listerad`, `Aksestang`, `Fremdrift`) | 116 | 3 | 5 | Nei. Dette er det levende øktkortet. |
| `fys-plan/okt-kort.tsx`, `fys-plan/plan-card.tsx`, `teknisk-plan/task-card.tsx`, `teknisk-plan/plan-card.tsx` | 74 / 123 / 108 / 111 | 0 | 0–1 | Døde (ingen side når dem). Det er andre «kort» for samme ting: tre ulike øktkort-implementasjoner finnes i koden. |
| `portal/precision/PH13DrillBank.tsx`, `PH13DrillDetalj.tsx` (levende øvelseskort/-liste) | – | – | – | Levende, ikke målt i detalj. |
| `portal/drill-editor.tsx` (503) + `portal/add-exercise-sheet.tsx` (356) | 859 | 0 | 0 | Døde. |
| `app/portal/tren/tester/team-norway/scorecard.tsx` (TN-scorekort) | 118 | 1 | 1 | Ja: henter data (`fetch`) og viser (9 tilstandskall). |
| `app/portal/(fullscreen)/tren/tester/[testId]/gjennomfor/scorekort-klient.tsx` | 1 150 | 0 | 0 | Død (siden bruker `gate-live-artefakt` og `pei-live-artefakt`). 63 innebygde stilblokker. |
| `team-norway/tn-testdag-scorecard.tsx` | 251 | 0 på portal/admin | 1 | Ja (server-handlinger, 36 stilblokker). Team Norway-flate. |

#### Grafer

| Fil | Linjer | Sider | Direkte | Blander? |
|---|---|---|---|---|
| `src/components/v2/datavis.tsx` | 1 150 | 90 | 3 | Mest utseende, 173 innebygde stilblokker. Sitter i skallet. |
| `src/components/v2/spesialviz.tsx` | 719 | 89 | 2 | Utseende (88 stilblokker). |
| `src/components/v2/compliance-viz.tsx` | 97 | 89 | 1 | Utseende. |
| `src/components/stats/stats-trend-graf.tsx`, `stats-kohort-linjegraf.tsx` | 159 / 156 | 0 (marked/stats) | 1 | Nei. |
| `recharts` | – | – | – | Eneste grafbibliotek i `package.json`. Sjekk om det brukes (ikke gjort). |
| `sg-hub/FatigueChart.tsx` | 157 | 0 | 0 | Død. |

#### Skjemafelt og datovelger

| Fil | Linjer | Sider | Direkte | Blander? |
|---|---|---|---|---|
| `src/components/v2/skjema.tsx` | 1 019 | 90 | 12 | Utseende + validering/tilstand (12 tilstandskall, 83 stilblokker). |
| `src/components/auth/onboarding/wizard-fields.tsx` | 1 016 | – (auth) | 2 | Utseende (72 stilblokker). |
| `src/components/v2/core.tsx` | 964 | 107 | 36 | Grunnkomponenter (knapper, kort m.m.), 104 stilblokker. Den mest gjenbrukte gamle filen. |
| `src/components/v2/domene.tsx`, `domene2.tsx`, `overlays.tsx`, `bunn-ark.tsx` | 904 / 417 / 452 / 167 | 89–90 | 2–4 | Utseende, sitter via skall. |
| Datovelger | – | 1 | – | Det finnes ingen felles datovelger. Eneste egne er `app/portal/meg/bookinger/reschedule/[bookingId]/reschedule-dato-velger.tsx` (69 linjer). Resten bruker nettleserens egne felt (`type="date"`/`time`) eller egne rutenett. `react-day-picker` er ikke installert; `date-fns` er. |

---

### Del 3: Hvor designsystemets komponenter bør ligge, og hvordan de tas inn

#### Hva som finnes i dag (målt)

- **Designkilde (speil, ikke app-kode):** `designsystem/precision-athletics/` med `tokens/*.css`, `components/*` (ca. 70 komponenter som `.jsx` + `.prompt.md`: Button, Card, DataTable, Dialog, Sheet, Tabs, TopBar, SideNav, Metric, Chart, interaksjon som ConfirmDialog/MoveSheet/SortableList, analyse som TrendChart/ChartTable m.fl.) og `ui_kits/`. ESLint hopper over hele `designsystem/`.
- **Allerede i appen:** `src/styles/precision-athletics.css` (1 107 linjer, alt avgrenset til `.pa-root`, med lyst tema som standard og natt via `data-theme="night"`), pluss `precision-komponenter.css`, `precision-a2…a24.css` (én fil per skjermbolk). `src/components/precision/pa.tsx` og `pa-a2…a5.tsx` er et miniatyrsystem på ca. 15 komponenter brukt av 190 filer. Per-skjerm-filer (`PH01IDag … PH25Abonnement`, `AG*`) bruker det.
- **Gamle lag som lever parallelt:** `globals.css` (955 linjer, `--v2-*`, shadcn-`hsl(var(--…))`), `train-lock-tokens.css` + JS-objektet `TL` i `src/lib/v2/train-lock.ts` (brukes i 441 filer), `ak-hq-tokens.css` (`--ak-*`), `golfdata-tokens.css`, og egne for Team Norway/WANG/GFGK/marked. `scripts/ak-golf-ds-tokens.mjs` genererer `ak-golf-ds-tokens.generert.css` (markedsflatens system, scopet til `.ak-ds`), og vakten feiler bygget hvis den sklir.
- Mønsteret «skopet token-sett + en wrapper-klasse» er altså allerede etablert og fungerer (`.pa-root`, `.ak-ds`, `TL_SCOPE`/`AK_SCOPE`). Det er det tryggeste å bygge videre på.

#### Forslag

1. **Mappe:** `src/components/ds/` (ikke `src/design-system/`). Grunn: `src/components/precision/` finnes og importeres 190 ganger via `@/components/precision/pa`; ds/ kan starte som en omdøping uten at noen skjerm merker det. Struktur speiler designkilden: `ds/core`, `ds/display`, `ds/forms`, `ds/feedback`, `ds/navigation`, `ds/interaction`, `ds/analysis`, `ds/shell` (PlayerHQ-, AgencyOS-, Forelder-skall). Tokens: `src/styles/ds/tokens.css` (fra `designsystem/precision-athletics/tokens/`) og `ds/components.css`.
2. **Adapter-lag (ingen skjerm brekker):**
   - Flytt `pa.tsx`, `pa-a2..a5.tsx`, `pa-workbench.tsx` til `ds/` og la de gamle filene re-eksportere (`export * from "@/components/ds/…"`). Sidene endres ikke.
   - Ta inn nye designsystem-komponenter ved siden av, ikke oppå: `ds/Button` ved siden av `Knapp`. `Knapp` kan bli en tynn oversetter (norsk prop-navn → ds-prop) til alle bruksteder er byttet.
   - Hold alle farger/avstander som CSS-variabler fra `ds/tokens.css` under `.pa-root` (finnes allerede). Ikke legg dem som JS-objekter (som `TL`).
3. **Ett skjermbytte om gangen:** bruk den eksisterende listen `src/lib/agencyos/precision-portert/a1..a5.ts` (i dag nesten tom; bare `/admin/spillere/[id]/rediger`) som sannhetskilde for hvilke sider som er flyttet, og la tilsvarende liste finnes for PlayerHQ. Rekkefølge etter skjermfamilie (se `docs/review/vedlegg/skjermkart.md`): først de 45 sidene som fortsatt bruker `V2Shell` (ST-01), deretter de 40 + 100 som allerede bruker nytt skall men har innebygde stiler.
4. **Før noe byttes:** trekk logikk ut av visningsfilene (liste i «Hva som må trekkes ut»). Mønster som allerede fungerer: `useUkeMotor.ts`.
5. **Vakt:** utvid `scripts/check-ingen-paper.mjs`-tankegangen med en vakt som teller hex/`rgb(` utenfor token-filer og feiler ved økning, slik `ak-golf-ds-tokens.mjs --sjekk` gjør for markedsflaten.

#### Hva som må trekkes ut av visningsfilene før bytte (rangert)

1. `v2/shell.tsx`: navigasjonsdata, tema-/cookie-logikk, nyttelast-henting.
2. `DrillListEditor.tsx`, `AG11Ark.tsx`, `AG11Workbench.tsx`: tilstand + server-handlinger + utseende i samme fil.
3. `WorkbenchUkeverksted/Sesongkart/Trenerbord/Periode/Aar/Maned/Stall`: server-handlinger direkte i visningen.
4. `PH10Plan.tsx`: flytting av økter og kalendervisning i samme komponent.
5. `v2/skjema.tsx` og `wizard-fields.tsx`: feltvisning og validering sammen.

---

### Funn

#### ST-01 · To skallsystemer kjører samtidig, og AG-04 Innboks står fortsatt på det gamle
- Alvorlighet: Middels
- Fil: `src/components/v2/shell.tsx:1189`, `src/components/precision/AdminSkallVelger.tsx:14`, `src/lib/agencyos/precision-portert.ts`, `src/lib/agencyos/precision-portert/a2.ts`
- Hva er galt: 45 ekte sider bruker gammelt `V2Shell` (25 i PlayerHQ, 20 i AgencyOS), og 100 + 40 bruker nytt `PlayerHQSkall`/`AgencyOSSkall`. Blant V2Shell-sidene er skjermer som ifølge skjermlista er portert, f.eks. `/admin/kommunikasjon` (AG-04 Innboks), `/admin/grupper/[id]` (AG-16), `/admin/analyse`, `/admin/bookinger/ny` (AG-06), `/portal/mal/runder/[id]/slag` (PH-RD-04), `/portal/statistikk/[metric]`. I tillegg velger `/admin/(legacy)/layout.tsx` skall ut fra listen `PORTERT`, som bare har én side (`/admin/spillere/[id]/rediger`), mens 40 andre admin-sider ligger utenfor `(legacy)` og legger skallet inn selv. To ulike mekanismer for «hvilket skall».
- Hva kan skje: Et nytt designsystem må byttes to steder; en side kan få dobbelt meny (V2Shell rundt AgencyOSSkall) hvis noen legger en side i `(legacy)` og glemmer `PORTERT`. Brukeren ser to ulike menyer i samme app.
- Forslag til retting: Velg ett skallkall per side (side-nivå, som AgencyOSSkall allerede gjør), flytt de 45 V2Shell-sidene én og én, og fjern `AdminSkallVelger`/`PORTERT` når `(legacy)` er tom. Se Del 3.
- PR-gruppe: P8-designforberedelse
- Status: Ny

#### ST-02 · Temastandard for /admin er mørk, mot beslutningen om lyst som standard
- Alvorlighet: Middels
- Fil: `src/lib/v2/tema-default.ts:8-34`
- Hva er galt: `erMorkFlate()` sier at `/admin` er mørk, og `onsketTema()` gir mørkt for alt som ikke er `/portal`, `/auth`, `/forelder` uten lagret valg. Beslutningen 26.09 (§PRECISION ATHLETICS, punkt 4) sier at lyst tema er standard i `/admin` også, og at funksjonen skal bli lys. Filhodet viser fortsatt «Train-lock ZIP (4)» som begrunnelse.
- Hva kan skje: En coach som åpner AgencyOS første gang får `html data-v2-tema="dark"` fra serveren. Sider som bruker gamle `--v2-*`-tokens (V2Shell-sidene) blir mørke, mens Precision-sider (`.pa-root`) styrer sitt eget tema. Resultat: blandede flater og feil sammenligning mot designet.
- Forslag til retting: Gjør `/admin` lys i `onsketTema`; behold natt bare for Live-økt og slagregistrering. Må gjøres sammen med ST-01 fordi V2Shell-sidene har mørke standarder.
- PR-gruppe: P8-designforberedelse
- Status: Ny (står som åpent punkt 4 i beslutninger.md)

#### ST-03 · Over 13 000 linjer komponenter som ingen side bruker
- Alvorlighet: Middels
- Fil: `src/components/portal/v2/WorkbenchV2.tsx` (3 914 linjer), `src/components/admin/v2/AgencyKalenderV2.tsx` (1 767), `src/app/portal/(fullscreen)/tren/tester/[testId]/gjennomfor/scorekort-klient.tsx` (1 150), `src/components/admin/v2/kalender/KalenderLagUkeV2.tsx` (953), `src/components/admin/coach-workbench/coach-workbench.tsx` (867), `src/components/workbench/WorkbenchUke.tsx`, `WorkbenchOkt.tsx`, `MonthGrid.tsx`, `YearGrid.tsx`, `SessionInspector.tsx`, `WeekPlanEditor.tsx`, `src/components/portal/drill-editor.tsx`, `add-exercise-sheet.tsx`, `src/components/fys-plan/okt-kort.tsx`, `src/components/teknisk-plan/task-card.tsx`, `src/components/shared/calendar/CalendarShell.tsx`, `SessionCard.tsx`, `src/components/admin/kalender/week-calendar.tsx`, `src/components/sg-hub/FatigueChart.tsx`
- Hva er galt: Importgrafen (fra alle `page`, `layout`, `route`, `template`, `loading`, `error`-filer og `proxy.ts`) når ikke disse filene. Totalt 550 `.ts/.tsx`-filer under `src/` er ikke nådd fra noen inngang (størst: `components/admin` 143, `components/portal` 85, `lib/domain` 31, `components/shared` 24). De største i listen over er gamle Workbench-, kalender- og scorekort-utgaver erstattet av `WorkbenchSamlet`, `AG11*`, `AG05Kalender` og `gate-/pei-live-artefakt`.
- Hva kan skje: Når nytt design skal inn blir det synlig arbeid å lese, oppdatere og teste kode som ingen ser; de teller i tokentallene (ST-05/06) og skjuler hva som faktisk er live. Gamle `v2`-tokens holdes i live bare for dem.
- Forslag til retting: Slett etter å ha sjekket tester/skript (se Status). Hvis ikke slettes, ekskluder dem fra token-målingen.
- PR-gruppe: P5-dødkode
- Status: Usikker. Tester og skript er ikke med i grafen. Kjente treff: `tests/komponenter/workbench-ovelse-felter.test.ts` nevner `WorkbenchOkt`, `src/lib/admin/legacy-agencyos-inventory.test.ts` nevner `coach-workbench`, `scripts/check-token-gap.mjs` nevner `WorkbenchUke`. Fjerning krever at disse sjekkes. Dynamiske importer med variabel sti (`import(\`./${x}\`)`) fanges ikke.

#### ST-04 · Fem parallelle stil-/tokensystemer
- Alvorlighet: Middels
- Fil: `src/app/globals.css` (`--v2-*`, shadcn `hsl(var(--…))`), `src/lib/v2/train-lock.ts` (JS-objektet `TL`), `src/styles/train-lock-tokens.css`, `src/styles/ak-hq-tokens.css` (`--ak-*`), `src/styles/precision-athletics.css` (`.pa-root`), `src/styles/ak-golf-ds-tokens.generert.css` (`.ak-ds`)
- Hva er galt: Samme app bruker (målt i antall filer): `TL.*` fra JavaScript i 441 filer, `var(--p-/--v2-/--ak-…)` i 67 filer, shadcn `hsl(var(--…))` i 56 filer, Precision-tokens (`var(--surface-/--text-/--border-/--primary/--signal/--axis-…)`) i 179 filer og `pa-`-klasser i 274 filer. Designautoriteten sier at Train-lock og Paper er utgående, men Train-lock-tokens brukes mest.
- Hva kan skje: Å endre én farge i det nye designet slår ut i ett av fem lag. Lag som ligger på `:root` (globals) og lag som ligger bak `.pa-root` kolliderer i navn (`--primary`, `--radius`), derfor måtte Precision skopes. Skjermer som blander lag får feil tema (se ST-02).
- Forslag til retting: Én kilde: `.pa-root`-tokens blir fasit; `TL` og `--v2-*` utfases skjerm for skjerm (Del 3). Ikke start med globals.
- PR-gruppe: P8-designforberedelse
- Status: Ny

#### ST-05 · Hardkodede farger utenfor token-filer
- Alvorlighet: Middels
- Fil: se tabellene under «Del 4». Verst: `src/components/team-norway/app/TeamNorwayAppView.tsx` (779 hex), `src/components/portal/teknisk/TekniskPlanPrecisionView.tsx` (548), `src/components/portal/toppidrett/PeriodeplanPyramideView.tsx` (365), `src/components/wang/WangRekrutteringView.tsx` (293), `src/components/forelder/ForelderPrecisionView.tsx` (185), `src/app/skjermer/SkjermKatalog.tsx` (182)
- Hva er galt: 4 571 hex-farger og 811 `rgb()/rgba()/hsl()` utenfor token-filer, i 911 filer. Ca. 2 350 av hex-ene ligger i seks prototype-/katalogfiler som bare vises på `/skjermer` (bare coach/admin) eller i WANG/Team Norway (egne systemer). De mest brukte verdiene er Precision-fargene selv (#141413 grafitt 750 stk., #ddd9d1 552, #faf8f3 332, #9b2415 rust 137), skrevet som bokstaver i stedet for variabler.
- Hva kan skje: Nytt design får ikke effekt der fargen er skrevet rett inn; flaten ser «halvt byttet» ut. Nattemodus virker ikke på hardkodede farger.
- Forslag til retting: Erstatt etter familie: først Precision-verdiene (rene 1-til-1 mot token), så `rgba(...)`-overlegg. Ikke rør WANG/Team Norway (egne systemer).
- PR-gruppe: P8-designforberedelse
- Status: Ny

#### ST-06 · Innebygde avstander og stiler i stedet for tokens
- Alvorlighet: Middels
- Fil: se «Del 4». Verst blant live-filer: `src/components/v2/datavis.tsx` (108 avstandsverdier, 173 stilblokker), `src/components/v2/domene.tsx`, `src/components/admin/v2/AgencyLiveV2.tsx`, `src/components/workbench/DrillListEditor.tsx`, `src/styles/precision-komponenter.css` (143)
- Hva er galt: 16 874 avstandsverdier (padding/margin/gap/innrykk i `style={{…}}`, Tailwind `p-[13px]` og px-verdier i CSS) utenfor token-filer. Verdiene er spredt: `gap: 8` (1 247 ganger), `gap: 12` (698), `gap: 10` (629), `gap: 16` (623), `gap: 6` (538), `gap: 14` (300), `gap: 18` (109). Seks forskjellige mellomrom mellom 6 og 18 px.
- Hva kan skje: Ny avstandsskala (4/8-grid i designsystemet) kan ikke innføres uten å røre hver fil. Mange 10-/14-/6-verdier faller utenfor skalaen og må avgjøres enkeltvis.
- Forslag til retting: Innfør `--space-*` og la en kodemod mappe vanlige verdier (6→8 eller 4, 10→8 eller 12, 14→16 eller 12 avgjøres av design). Ikke gjør automatisk uten designsjekk.
- PR-gruppe: P8-designforberedelse
- Status: Ny

#### ST-07 · Skjermregisteret og skjermlista stemmer ikke med sidene
- Alvorlighet: Lav
- Fil: `docs/design-system/skjermregister.csv`, `docs/design-system/skjermregister.json` (kodeversjon 127c49e7), `docs/design-handoff/regler/skjermliste.md` (443 sider, 108 skjermtyper)
- Hva er galt: Registeret er laget før dagens main. 10 ekte sider står som «UTEN-TEGNET-TYPE»: `/admin/bookinger`, `/admin/innboks`, `/admin/spillere/[id]/plan/[planId]/for-og-na`, `/portal/mal/evaluering`, `/portal/mal/sg-hub/coach/[spillerId]` (+ `/[club]`, `/equipment`), `/portal/meg/deling/innsyn`, `/portal/samlinger`, `/portal/tren/teknisk-plan`. Skjermlista markerer flere skjermer «Utgår 28.09» (PH-02, PH-26, AG-02, AG-03, AG-17…), men beslutningen 04.10 beholder seks AG-skjermer; ID-ene i registeret kan derfor peke på skjermer som lista kaller utgått mens siden lever. IDen sier ikke alltid om en side er live.
- Hva kan skje: Den som skal bytte design finner ikke riktig tegning for en side, eller bygger en skjerm som er besluttet fjernet.
- Forslag til retting: Regenerer registeret på dagens main og avklar de 10 sidene uten type. `docs/review/vedlegg/skjermkart.md` kan være grunnlaget.
- PR-gruppe: P9-dokumenter
- Status: Ny

#### ST-08 · To sider uten skall
- Alvorlighet: Lav
- Fil: `src/app/portal/meg/deling/page.tsx:18` (renderer `NavngittDeling`), `src/app/portal/meg/abonnement/fortsett/page.tsx:35` (renderer `MegFortsettV2`)
- Hva er galt: Verken siden, `meg/layout.tsx` (rent gjennomtrekk) eller komponenttreet (3 nivå) legger inn `PlayerHQSkall`/`V2Shell`. Alle andre ekte `/portal`-sider utenom live-økt/runde/test har skall.
- Hva kan skje: Siden kan vise uten meny og uten tilbakevei, eller bevisst som fullskjerm (D-04-deling, tilbud om å fortsette abonnement). Bare designkontroll i nettleser avgjør.
- Forslag til retting: Sjekk i nettleser om dette er bevisst; legg ellers inn skall.
- PR-gruppe: P8-designforberedelse
- Status: Usikker (ikke sett i nettleser)

#### ST-09 · Redirect-kjeder (to hopp)
- Alvorlighet: Lav
- Fil: `src/app/admin/(legacy)/agenter`, `caddie`, `agencyos/caddie`, `agent-team`, `agents` (→ `/admin/agenticos` → `/admin/jarvis`); `coach-workbench`, `plans`, `plans/new` (→ `/admin/planlegge` → `/admin/plan`); `plan-templates`, `plans/templates*` (→ `/admin/plan-templates` → `/admin/plan`); `oppfolging` (→ `/admin/queue` → innboks); `approvals`, `drills/forslag`, `workspace/tildelt-meg`, `agencyos/caddie/dashbord` (→ `/admin/godkjenninger` → innboks). Totalt 20 av 150 redirects.
- Hva er galt: Gamle adresser sender via en mellomadresse som selv er en redirect. Ingen sendes til en adresse som mangler (kontrollert: 0 døde mål blant de 140 statiske målene).
- Hva kan skje: En ekstra omlasting; søkeparametre kan gå tapt mellom hoppene. Ingen brukerskade i dag.
- Forslag til retting: La hver gammel adresse peke rett på sluttmålet.
- PR-gruppe: P8-designforberedelse
- Status: Ny

#### ST-10 · Prototypefiler fra design ligger som app-kode og vrir tallene
- Alvorlighet: Lav
- Fil: `src/app/skjermer/SkjermKatalog.tsx`, `src/components/team-norway/app/TeamNorwayAppView.tsx` (779 hex), `src/components/portal/teknisk/TekniskPlanPrecisionView.tsx` (1 122 linjer), `src/components/portal/toppidrett/PeriodeplanPyramideView.tsx`, `src/components/wang/WangRekrutteringView.tsx`, `src/components/forelder/ForelderPrecisionView.tsx`
- Hva er galt: Seks demovisninger med innebygd demodata og egne farger importeres bare av `/skjermer` (bare coach/admin, innlogging kreves). `/skjermer` er korrekt låst (`requirePortalUser`).
- Hva kan skje: Ingen risiko for brukere. De vrir token-målingene og blir tatt med i et designbytte uten at noen bruker dem.
- Forslag til retting: Flytt til `designsystem/` eller slett når `/skjermer` ikke trengs.
- PR-gruppe: P5-dødkode
- Status: Ny

#### ST-11 · Tre ulike øktkort og to separate kalenderimplementasjoner for samme data
- Alvorlighet: Lav
- Fil: `src/components/precision/pa-workbench.tsx` (`Oktkort`), `src/components/fys-plan/okt-kort.tsx`, `src/components/teknisk-plan/task-card.tsx`; kalender: `src/components/portal/v2/KalenderV2.tsx` (389), `src/components/admin/precision/AG05Kalender.tsx` (242), `src/components/portal/precision/PH10Plan.tsx` (269)
- Hva er galt: Samme begrep (økt, kalenderuke) er tegnet i flere komponenter. Den som ikke er død (`pa-workbench`) er den eneste som brukes av Workbench; `PH10Plan` og `KalenderV2` har hver sin kalender for spilleren.
- Hva kan skje: Nytt kalender-/øktdesign må implementeres to-tre ganger. Skjermene blir ulike selv om designet er likt.
- Forslag til retting: Én `ds/Kalender` og én `ds/Oktkort` med samme data-kontrakt; la spiller- og coachflaten bruke begge.
- PR-gruppe: P8-designforberedelse
- Status: Ny

---

### Del 4: Hardkodede farger, fonter og avstander (bare liste, ingenting endret)

Metode: alle `.ts/.tsx/.css` under `src/` (3 049 filer; ikke tester, ikke `generated`). «Token-filer» som ikke telles med: `globals.css`, `precision-athletics.css`, alle `*tokens*.css`, `ak-golf-ds-grunnlag/-tokens.generert`, `ak-golf-grunnlag`, `train-lock-valgt`, `v2/patterns.css`, `v2/motion.css` (14 filer). Kommentarer er fjernet før telling. Hex = `#rgb/#rrggbb/#rrggbbaa` (ikke `&#39;`), pluss Tailwind `text-[#…]`. Avstand = `padding/margin/gap/inset/top/left/right/bottom` med tall eller px-streng i `style={{…}}`, Tailwind `p-[13px]`/`gap-[…]`, og px i padding/margin/gap i CSS. «Font» = alle forekomster av `font-family`/`fontFamily:`, også de som peker på variabel (`TL.font.sans`, `var(--font-mono)`), så tallet viser hvor mange steder fonten settes for hånd, ikke hvor mange som er feil.

#### Totalt

| | Utenfor token-filer (3 035 filer, 911 med treff) | I token-filer (14) |
|---|---|---|
| Hex-farger | 4 571 | 613 |
| `rgb()/rgba()/hsl()` | 811 | 229 |
| `font-family`/`fontFamily` | 5 439 | 26 |
| Avstandsverdier | 16 874 | 542 |

#### Per mappe (topp 16 av alle)

| Mappe | Filer | Hex | rgb/hsl | Font | Avstand |
|---|---|---|---|---|---|
| `src/components/portal` | 270 | 1 587 | 67 | 1 606 | 5 131 |
| `src/components/admin` | 242 | 62 | 12 | 1 086 | 3 780 |
| `src/app/(marketing)` | 107 | 25 | 302 | 416 | 1 115 |
| `src/components/v2` | 34 | 0 | 11 | 463 | 1 131 |
| `src/components/team-norway` | 44 | 779 | 0 | 198 | 538 |
| `src/components/wang` | 11 | 828 | 17 | 83 | 507 |
| `src/components/marketing` | 66 | 187 | 11 | 319 | 770 |
| `src/app/team-wang` | 49 | 105 | 2 | 260 | 708 |
| `src/app/portal` | 366 | 16 | 2 | 243 | 673 |
| `src/components/workbench` | 44 | 11 | 0 | 123 | 356 |
| `src/components/meg` | 15 | 0 | 0 | 134 | 199 |
| `src/app/(internal)` | 7 | 171 | 71 | 1 | 50 |
| `src/components/stats` | 24 | 46 | 48 | 54 | 102 |
| `src/styles/workbench-selected.css` (1 fil) | 1 | 19 | 2 | 2 | 222 |
| `src/components/forelder` | 6 | 185 | 0 | 14 | 17 |
| `src/app/team-norway` | 48 | 0 | 0 | 19 | 177 |

(`src/app/admin` har bare 11 hex og 130 avstander over 367 filer: sidene er tynne, utseendet bor i komponentene.)

#### De 25 verste filene (sum av alle fire)

Merket **(død)** = ST-03, **(proto)** = prototype/katalog (ST-10), **(WANG/TN)** = eget system utenfor Precision.

| # | Fil | Hex | rgb/hsl | Font | Avstand |
|---|---|---|---|---|---|
| 1 | `src/components/team-norway/app/TeamNorwayAppView.tsx` (proto, TN) | 779 | 0 | 0 | 3 |
| 2 | `src/components/portal/teknisk/TekniskPlanPrecisionView.tsx` (proto) | 548 | 0 | 0 | 2 |
| 3 | `src/components/portal/v2/WorkbenchV2.tsx` (død) | 0 | 0 | 159 | 327 |
| 4 | `src/components/portal/toppidrett/PeriodeplanPyramideView.tsx` (proto) | 365 | 0 | 0 | 0 |
| 5 | `src/components/wang/WangRekrutteringView.tsx` (proto, WANG) | 293 | 0 | 0 | 6 |
| 6 | `src/components/wang/WangElever.tsx` (WANG) | 155 | 0 | 19 | 110 |
| 7 | `src/components/wang/WangKonkurranse.tsx` (WANG) | 162 | 0 | 13 | 95 |
| 8 | `src/styles/workbench-selected.css` | 19 | 2 | 2 | 222 |
| 9 | `src/components/portal/v2/WorkbenchV2Sheets.tsx` (død) | 0 | 0 | 59 | 142 |
| 10 | `src/components/wang/WangAdmin.tsx` (WANG) | 119 | 0 | 13 | 63 |
| 11 | `src/components/forelder/ForelderPrecisionView.tsx` (proto) | 185 | 0 | 0 | 1 |
| 12 | `src/app/skjermer/SkjermKatalog.tsx` (proto) | 182 | 0 | 0 | 2 |
| 13 | `src/app/(marketing)/stats/sg-sammenlign/start/skjema.tsx` | 0 | 64 | 33 | 66 |
| 14 | `src/components/v2/datavis.tsx` | 0 | 0 | 54 | 108 |
| 15 | `src/lib/v2/ak-palett.ts` | 41 | 113 | 0 | 0 |
| 16 | `src/app/(marketing)/(mlegacy)/stats/stats.css` | 19 | 12 | 25 | 95 |
| 17 | `src/styles/precision-komponenter.css` | 2 | 2 | 3 | 143 |
| 18 | `src/app/(marketing)/stats/sammenlign-spillere/resultat.tsx` | 0 | 61 | 37 | 50 |
| 19 | `src/components/admin/v2/AgencyLiveV2.tsx` | 0 | 0 | 47 | 97 |
| 20 | `src/components/portal/live/live-active.module.css` | 55 | 34 | 1 | 54 |
| 21 | `src/components/marketing/booking/BookingPrecisionFlow.tsx` | 140 | 0 | 0 | 0 |
| 22 | `src/components/v2/domene.tsx` | 0 | 0 | 47 | 93 |
| 23 | `src/components/marketing/v2/MarkedStatsVerktoyV2.tsx` | 0 | 0 | 37 | 100 |
| 24 | `src/app/team-gfgk/deck.css` | 25 | 30 | 33 | 48 |
| 25 | `src/components/onboarding/onboarding.css` | 60 | 5 | 12 | 48 |

#### Verdiene som går mest igjen (utenfor token-filer)

**Hex (topp 25):** #141413 (750) · #ddd9d1 (552) · #faf8f3 (332) · #736e65 (242) · #17446f (210) · #5e6e7f (172) · #012b5d (154, Team Norway navy) · #0d6338 (143) · #ffffff (140) · #9b2415 (137, rust) · #e3ecf6 (104) · #0c1219 (92) · #5b7793 (92) · #d2d2d2 (82) · #b83217 (57, gammel «verksted»-signalfarge) · #f1eee8 (53) · #64748b (52) · #f2f7fc (50) · #01234c (43) · #e2e8f0 (38) · #e4dfd5 (34) · #0a2540 (34) · #f1eee5 (33) · #d70232 (32, Team Norway rød) · #2e857d (29). De fire første er Precision-fargene (grafitt, sand-300, sand-100, en grå) skrevet som bokstaver. #17446f/#5e6e7f/#5b7793/#e3ecf6/#0c1219 ser ut til å være en blå palett som ikke står i `precision-athletics.css` (ikke avklart hvor den kommer fra).

**rgb/hsl (topp):** `hsl(var(--primary))` 107 · `hsl(var(--muted-foreground))` 106 · `hsl(var(--accent))` 45 · `hsl(var(--foreground))` 36 · `hsl(var(--border))` 21 · `hsl(var(--background))` 18 · `hsl(var(--secondary))` 17 · `hsl(var(--destructive))` 16 (alle shadcn-laget, ikke hardkodet farge men tilhører det gamle laget) · `rgba(255,255,255,0.06)` 10 · `rgba(99,120,74,0.18)` 8 (FYS-aksefarge med gjennomsiktighet).

**Avstand (topp):** `gap: 8` 1 247 · `margin: 0` 792 · `gap: 12` 698 · `gap: 10` 629 · `gap: 16` 623 · `gap: 6` 538 · `marginTop: 2` 322 · `gap: 14` 300 · `marginTop: 8` 291 · `margin: "0 auto"` 269 · `marginTop: 12` 266 · `marginTop: 4` 229 · `marginTop: 14` 209 · `marginTop: 16` 201 · `marginTop: 6` 195 · `gap: 4` 194 · `marginTop: 10` 188 · `padding: 0` 135 · `padding: 16` 133 · `marginBottom: 8` 129 · `margin: "6px 0 0"` 114 · `gap: 18` 109 · `margin: "8px 0 0"` 107 · `padding: "12px 16px"` 106.

**Fonter (mest brukt som `fontFamily`):** `TL.font.sans` 446 · `TL.font.mono` 322 · `"var(--font-mono)"` 215+183 · `"var(--font-brand)"` 155 · `var(--font-display)` 49 · `var(--font-body)` 45. Bokstavelige fontnavn er få: `Montserrat` 55 (bare WANG: `team-wang/layout.tsx`, `wang-*.css`, `components/wang/*`; WANGs eget system), `Helvetica/Arial` 11 (PDF-eksport og faktura: `lib/pdf/plan-document.tsx`, `lib/sg-hub/pdf-export.tsx`, `faktura-document.tsx`), `system-ui` 6, `monospace` 4, `Poppins` 3, `Lora` 1, `IBM Plex Mono` 1. Fontene er altså stort sett styrt via variabler og `TL.font`; selve fontproblemet er `TL`-objektet (ST-04), ikke hardkodede navn. Designautoriteten (24.09) sier IBM Plex Sans/Mono; Poppins og Lora er utgått, bør sjekkes i de få filene (ikke gjort).

---
Hele skjermkartet (alle 349 ruter i PlayerHQ og AgencyOS, med komponent, skjerm-ID og skall): [`vedlegg/skjermkart.md`](vedlegg/skjermkart.md).

---

## 6. Språk mot master-ordboken (SP)

Grunnlag: `main` 9f39c7d44, master-ordboken fra grenen `docs/ordbok-master` (`docs/ordbok/ordbok-master-2026-10-06.md`). Bare lesing; ingenting endret.

### Oppsummering

| Alvorlighet | Antall |
|---|---|
| Kritisk | 0 |
| Høy | 0 |
| Middels | 6 |
| Lav | 8 |

**Dekket:** (1) forbudte ord i skjermtekst, (2) database-navn i `prisma/schema.prisma` mot ordboken, (3) formateringsfunksjoner og skriveregler (tall, prosent, minus, dato, klokkeslett, enheter, «mål»).
**Ikke dekket:** e-postmaler er bare sjekket via ordsøk, ikke lest én og én. Ordene i design-prosjektet (Claude Design) er ikke sjekket (tilkoblingen var utilgjengelig for ordboken også).

**Slik er skjermtekst talt (viktig for å tolke tallene):** jeg har søkt i `src/` etter JSX-tekst mellom `>…<` og tekstfelt som `label`, `title`, `placeholder`, `description`, `error`, `toast(...)` osv. Tester, genererte filer, kommentarer og AI-prompt-mapper (`lib/ai-plan`, `lib/caddie`, `lib/masterbrain`, `lib/agents`) er utelatt. Søket er konservativt og går glipp av tekst som står som verdi i et objekt (eksempel: «Til godkjenning» i `WorkbenchV2.tsx:182` ble ikke funnet av søket, men står der). **Tallene er derfor minimum, ikke fasit.** Fil-tallene i tabellene er antall filer med minst ett treff.

---

### 1. Forbudte ord i skjermtekst (PR-gruppe: Ingen, bare rapport)

Ordene kommer fra «Ikke bruk»-kolonnen og B12 i ordboken. Skjermtekst endres ikke nå; den kommer med nytt design.

| Forbudt ord (ordbokens ord i parentes) | Linjer (min.) | Filer | Viktigste filer |
|---|---|---|---|
| Drill / drills (Øvelse) | 95 | 48 | `components/admin/add-session-wizard.tsx` (10), `lib/taxonomy.ts` (8), `components/admin/v2/AgencyKalenderV2.tsx` (6), `lib/agencyos/agent-registry.ts` (5), `components/admin/compliance/compliance.tsx` (5), `lib/portal-drills/ph13-drills-data.ts`, `components/admin/v2/AdminDrillsV2.tsx` |
| Fullført / Fullførte / Fullfør (Gjennomført; for utfordring: Avsluttet) | 78 | 64 | `app/admin/plans/[planId]/actions.ts`, `components/team-norway/skjermer/tn-spillerprofil-skjerm.tsx`, `components/portal/v2/idag/IDagTrainLock.tsx`, `components/portal/v2/RundeDetaljV2.tsx`, `lib/portal-turnering/turnering-detalj-data.ts:110`, `components/admin/v2/AdminAgentTeamV2.tsx` |
| Logg / Logget / logg (Registrere) | 90 | 68 | `components/portal/v2/GjorV2.tsx`, `LoggetUtV2.tsx`, `AnalysereHullV2.tsx`, `components/portal/global-search-modal.tsx`, `lib/meg/briefs.ts`. Merk: «Logget ut» (innlogging) er lovlig, så en del treff er falske |
| Ferdig (som status) | 11 | 9 | `components/admin/precision/AG04Innboks.tsx` (3), `components/portal/precision/PHRD08RundeFerdig.tsx`, `lib/agencyos/live-data.ts` |
| Mål oppnådd / Oppnådd (Målsetning nådd / Nådd) | 9 | 7 | `components/portal/v2/MalDetaljV2.tsx`, `components/portal/precision/PH19Enkeltmal.tsx`, `lib/notifications/triggers.ts` |
| «Mål» alene i knapper/overskrifter (Målsetning) | 10 | 6+ | `components/portal/precision/PH19Enkeltmal.tsx`, `PH13DrillDetalj.tsx`, `components/portal/global-search-modal.tsx`, `components/shared/cmd-palette.tsx`, `components/portal/v2/MalHubV2.tsx`. «Målsetning» står 50 ganger i koden, så reglen følges delvis |
| Teknikk (Teknisk) | 16 (+19 filer via aksenavnet) | 12 | `components/v2/core.tsx:206` (`AKSE_NAVN`), `lib/portal/translate-taxonomy.ts:66`, `components/v2/kalender.tsx`, `components/v2/domene.tsx`, `lib/gfgk-junior/bootstrap.ts` |
| Slag som aksenavn (Golfslag) | ikke talt separat | – | `components/v2/core.tsx:206`, `lib/taxonomy.ts`, `lib/labels/taxonomy.ts`, `lib/pyramide.ts` (ordboken B12) |
| Slagtrening / Spilltrening / Banespill som aksenavn | 13 | 9 | `app/gfgk-junior/_data/gfgk-junior-data.ts` (3), `lib/gfgk-junior/bootstrap.ts` (2), `app/team-wang/_data/wang-plan.ts` (2) |
| Spesialisering (Spesialperiode) | 6 | 2 | `app/gfgk-junior/_data/gfgk-junior-data.ts` (5, bevisst: publisert tekst, venter på Anders), `components/v2/kalender.tsx` |
| Til godkjenning / Endring bedt om (Venter på spiller / Avvist) | 2 (min.) | 1 | `components/portal/v2/WorkbenchV2.tsx:182-183` |
| Foresatt (Forelder) | 54 | 38 | `lib/recording/lyd-samtykke-actions.ts` (4), `components/wang/WangMeldinger.tsx`, `components/wang/wang-data.ts`, `components/admin/v2/AdminSpillerRedigerV2.tsx`, `components/portal/v2/MegForeldreV2.tsx`. Ordboken tillater «foresatt» juridisk og i WANG, så dette må sorteres |
| Elev / elever (Spiller; unntatt WANG-menyen) | 14 | 9 | `components/wang/WangElever.tsx` (3, WANG, tillatt), `components/wang/WangKonkurranse.tsx`, `WangAppSkall.tsx`; ordboken D37 nevner også `AG02Ko.tsx` («eleven», «utøvere») |
| Atlet / Utøver (Spiller) | 7 | 5 | `components/team-norway/app/TeamNorwayAppView.tsx` (3), `components/wang/WangMeldinger.tsx`, `components/team-norway/skjermer/tn-lisens-skjerm.tsx`, `tn-college-skjerm.tsx` |
| Hjelpetrener / Hjelpecoach (Assist Coach) | 1 funnet av søk; ordboken sier 8 | 7+ | `app/admin/grupper/[id]/legg-til-medlem-modal.tsx`, `components/admin/v2/GruppeDetaljV2.tsx` (2), `app/team-norway/wang-resultater/page.tsx`, `app/team-norway/spiller/[spillerId]/tester/page.tsx` |
| Assistent / assistant coach (Assist Coach) | 5 | 5 | `components/portal/v2/CoachAIV2.tsx`, `components/admin/team/team-kit.tsx`, `app/team-wang/_components/live-seksjoner.tsx`, `app/(marketing)/coacher/page.tsx` |
| Head coach / HEAD COACH (Hovedcoach; ordboken: «Uavklart») | 6 | 5 | `components/team-norway/app/TeamNorwayAppView.tsx` (2), `components/admin/team/team-kit.tsx`, `app/(marketing)/coacher/page.tsx`, `coacher/[slug]/page.tsx` |
| DataGolf / Datagolf / DATAGOLF (Data Golf) | 30 | 18 | `components/portal/v2/DataGolfV2.tsx` (8), `components/portal/v2/StasjonTrainLock.tsx` (3), `components/admin/v2/AdminBenchmarksV2.tsx` (3, bl.a. «Data powered by DataGolf», ordboken vil ha «Powered by Data Golf»), `lib/v2/hjelpetekster.ts`, `lib/portal-analyse/tm-hub-data.ts`, `components/team-norway/tn-shell.tsx:86` |
| SG Total / SG total (SG totalt) | 36 | 26 | `app/(marketing)/stats/leaderboards/page.tsx` (4), `components/portal/v2/SpillerDetaljV2.tsx` (3), `app/(marketing)/stats/pga/sg-total/page.tsx` (3), `components/admin/v2/AdminRunderV2.tsx` |
| Approach / Around green (Innspill / Nærspill) | 10 | 6 | `data/quiz-questions.ts` (3), `components/marketing/v2/MarkedStatsMinProgresjonV2.tsx` (2), `app/(marketing)/stats/pga/page.tsx` (2). I tillegg `lib/training/labels.ts:3-8` |
| Tee Total (Utslag) | 4 | 4 | `components/teknisk-plan/constants.ts:38`, `lib/domain/skill-map.ts`, `components/hole-analysis/hole-analysis.tsx`, `app/portal/analysere/hull/page.tsx` |
| Mot par (Til par) | 4 | 4 | `components/portal/v2/RundeDetaljV2.tsx`, `SpillerDetaljV2.tsx`, `AnalysereHullV2.tsx`, `TurneringshistorikkTrainLock.tsx` |
| Fairwaytreff / Fairway treff / FIR (Fairway-treff) | 3 | 2 | `components/portal/v2/DataGolfV2.tsx` (2), `lib/portal-runder/ph18-data.ts` |
| Compliance (Etterlevelse) | 8 | 4 | `components/admin/v2/AdminReachV2.tsx` (4, bl.a. «Snitt-compliance»), `components/admin/compliance/compliance.tsx`, `AdminComplianceV2.tsx`. Merk: «compliance» kan også bety personvern/regelverk, ikke alltid treningsetterlevelse |
| Pro / Premium / Plus / ELITE (nivå: Full) | 43 | 32 | `components/portal/v2/CoachPlanerV2.tsx` (3), `CoachMeldingNyV2.tsx` (3), `components/admin/v2/AdminEmailV2.tsx` (3), `MegAbonnementV2.tsx`, `MegAvbestillV2.tsx`; `app/auth/onboarding/onboarding-wizard.tsx:242,926` (valget heter PRO). Mange treff er trolig «Performance Pro» (tillatt) eller navn, må sorteres |
| Teknikk-drill, «Hoy press», «Lav press», «Slow-motion», «Tørrsving», «Lav fart», «Full fart» (utgåtte press/miljø/læringssteg) | – | `lib/taxonomy.ts:221-223,237`, `lib/portal/translate-taxonomy.ts:22`, `components/v2/skjema.tsx:470` |
| CS-koder i tekst (CS50–CS100, utgått) | – | 22 filer | `components/v2/skjema.tsx:470` («CS50–CS70», «CS80–CS100»), `components/v2/overlays.tsx:292`, `components/v2/core.tsx:737` (`NivaSkala`: CS90–CS120). Ordboken D42 sier 38 filer, mitt søk fant 22 utenfor masterbrain |
| PR1–PR5 / L-Kropp… / M0–M5 i tekst | – | 3 / 15 / 3 tsx-filer | `components/admin/add-session-wizard.tsx`, `components/portal/v2/MegV2.tsx`, `PortalChatHjem.tsx` |
| Recovery / Avlastning (Restitusjon) | 4 | 2 | `app/(internal)/demos/plan-bygger/[steg]/page.tsx` (3, intern demo), `components/admin/recording-controls.tsx` |
| Sesongplan (Årsplan) | 5 | 3 | `app/portal/(legacy)/tren/turneringer/actions.ts` (3), `components/portal/precision/PH19Talent.tsx` |
| Yards (aldri yards for spillere) | – | 5 tsx-filer | `components/portal/profile/PreferencesCard.tsx` (spillervalg), `components/portal/v2/DataGolfV2.tsx`, `components/marketing/v2/MarkedStatsVerktoyV2.tsx`, `app/(marketing)/stats/verktoy/avstand/page.tsx`, `pga/drive-distance/explorer.tsx` |

Kode-navn som ikke er skjermtekst og derfor ikke tatt med: CoachHQ (0 treff i synlig tekst, rent), «Kladd»/«Draft» (1 treff i `lib/runde-logg/kontrakt.ts`), «Compliance» som filnavn.

#### SP-01 · Forbudte ord i skjermtekst: oversikt
- Alvorlighet: Lav
- Fil: se tabellen over
- Hva er galt: ordene over står i tekst brukeren ser. Størst: «Drill» (min. 95 linjer, 48 filer), «Logg/Logget» (90), «Fullført» (78), «Foresatt» (54, delvis lovlig), «SG Total» (36), «DataGolf» (30).
- Hva kan skje: spillere og coacher ser to ord for samme ting («Fullført» på én skjerm, «Gjennomført» på en annen), og designsystemet i Claude Design får ikke ett språk å forholde seg til.
- Forslag til retting: ingen kodeendring nå. Når nytt design portes: bytt via én fellesliste per ord, og legg en vakt i `npm run verify` som søker etter ordene i `src/` (kode-vakt på lovlige unntak: WANG-«elev», juridisk «foresatt»).
- PR-gruppe: Ingen (bare rapport)
- Status: Ny

---

### 2. Database-navn som bryter ordboken (PR-gruppe: P7-skjema, bare forslag, kjøres ikke)

Regel for å forstå «krever migrering»: å gi en **modell** nytt navn i Prisma og beholde tabellnavnet med `@@map("gammelt_navn")` krever **ingen** migrering i databasen. Å gi et **felt** nytt navn og beholde kolonnen med `@map` krever heller ingen. Å endre en **enum-verdi** eller **enum-navn** krever migrering (`ALTER TYPE`) og en datakjøring, og prosjektet har blokkert `migrate dev`/`db push`/`migrate deploy`; additive endringer gjøres kirurgisk (gotchas §Database). Antall filer er utenom `src/generated`, tester og migrasjoner.

#### 2a. Utgåtte koder (ordboken: «skal aldri vises eller skrives på nytt»)

| Modell/enum | Nåværende navn | Ordbokens navn | Filer | Migrering? |
|---|---|---|---|---|
| enum `LFase` (L_KROPP, L_ARM, L_KOLLE, L_BALL, L_AUTO) | feltet `lFase` på `TrainingPlanSession`, `SessionDrill`, `TrainingDrillV2`, `DrillMal`, `OktMalDrill`, `WorkbenchSession`, `PositionTask` | utgått (erstattet av `Motorikk`: UTEN_BALL, LAV_HAST, AUTO) | enum 15, felt `lFase` 48 | Å fjerne: ja, rens kolonner og enum. Anbefalt som etterarbeid, ikke nå |
| enum `CSNivaa` (CS50–CS100) | felt `csNivaa` på de samme modellene | utgått | enum 6, felt 23 | Som over |
| enum `MMiljo` (M0–M5) | felt `miljo`. **`TrainingSessionV2.miljo` er ikke-valgfritt** (linje 4174) | utgått (erstattet av `Belastning`: INNENDORS, TRENINGSOMRAADE, BANE, KONKURRANSE, og `SessionEnvironment`) | enum 8 | Å fjerne kreves først å gjøre feltet valgfritt (additiv) |
| enum `PRPress` (PR1–PR5) | felt `prPress` på `SessionDrill`, `TrainingDrillV2`, `DrillMal` m.fl. | utgått (erstattet av `Press`: ALENE, OBSERVERT, KONKURRANSE, TURNERING) | enum 5, felt 15 | Som over |
| enum `PressureLevel` (PR1–PR5) | felt `pressureLevel` på `TrainingPlanSession` | utgått (samme som over) | 5 | Som over |

#### 2b. Navn som avviker, men er kodenavn (skjermtekst oversettes i kode)

| Modell/enum | Nåværende navn | Ordbokens navn | Filer | Migrering? |
|---|---|---|---|---|
| enum `Tier` | GRATIS · PRO · ELITE | Gratis · Full. ELITE finnes ikke (beslutning 24.09). Koden mapper `ELITE` til `PRO` i `app/portal/mal/sg-hub/coach/[spillerId]/page.tsx:62` | `Tier` 29; `"ELITE"` 4; `"PRO"` brukes i onboarding, admin-ny-spiller, leaderboard | Å bytte PRO→FULL og fjerne ELITE: ja (`ALTER TYPE`), plus data. Lav gevinst; anbefaling: behold koden, fiks bare skjermtekst |
| enum `SkillArea` | TEE_TOTAL · TILNAERMING · AROUND_GREEN · PUTTING · SPILL (gammel 5-delt liste) | de 19 `Omraade`-verdiene (UTSLAG finnes som TEE_TOTAL i `Omraade`) | 26 filer; `TEE_TOTAL` 59, `TILNAERMING` 44, `AROUND_GREEN` 41 | Ja hvis fjernet. Brukes på `TrainingPlanSession`, `ExerciseDefinition`, `SessionDrill`, `PlanTemplateSession`. Gammelt kart ved siden av `Omraade`: to systemer for samme ting |
| enum `Belastning` | INNENDORS · TRENINGSOMRAADE · BANE · KONKURRANSE | **Treningsmiljø** (ordboken: «Belastning (om sted)» er ikke bruk; belastning = opplevd anstrengelse 1–10) | 34 filer | Gi enumen navnet `Treningsmiljo` med `@@map`: enum-navn krever `ALTER TYPE ... RENAME`, altså migrering. Felt `belastning` på `ExerciseDefinition` (linje 1553), `TrainingDrillV2` (4352) m.fl. kan bytte navn med `@map` uten migrering |
| enum `PracticeType` / `DrillPracticeType` | BLOKK · RANDOM · KONKURRANSE · SPILL_TEST | **Treningsmåte**: Blokktrening · Variasjonstrening · Konkurranseform · Spill/test («Random» står i «Ikke bruk») | `PracticeType` 15, `DrillPracticeType` 3, `"RANDOM"` 12 | Å bytte RANDOM→VARIASJON: ja. `DrillPracticeType` har VARIABEL, `PracticeType` har RANDOM: to ord for samme ting i to enumer |
| enum `WeekType` / `WeekNote` | UTVIKLING · VEDLIKEHOLD · TURNERING / FERIE · TEST · SAMLING · EVALUERING · PRE_TURNERING · TEKNIKK_UKE | ordboken: **Uavklart** (D18, E10). `TEKNIKK_UKE` bruker «Teknikk» | `WeekType` 7, `WeekNote` 5, `TEKNIKK_UKE` 6 | Vent på Anders (E10) |
| enum `SessionStatus` | PLANNED · ACTIVE · PAUSED · COMPLETED · ABANDONED · SKIPPED · CANCELLED | Planlagt · Pågår · Gjennomført · Avlyst · Hoppet over (D13: «Avbrutt» foreslås som sjette). `ABANDONED` = «Avbrutt» i `lib/domain/workbench/labels.ts:59` | `SessionStatus` 15, `"ABANDONED"` 36 | Ingen migrering nødvendig: kodenavn er ASCII. Skjermtekst styres av `labels.ts`. To statusenumer: `SessionStatus` og `SessionStatusV2` (IN_PROGRESS i stedet for ACTIVE) |
| enum `PlanStatus` | DRAFT · PENDING_PLAYER · ACCEPTED · REJECTED · ACTIVE · PAUSED · ARCHIVED | Utkast · Venter på spiller · Godtatt · Avvist · Aktiv · Arkivert. «Pause» er ikke i ordboken (D17). `WorkbenchV2.tsx:177-186` viser «Til godkjenning» / «Endring bedt om» | `PlanStatus` 12; `PENDING_PLAYER` 14 | Ingen migrering. Bare skjermtekst + beslutning om PAUSED |
| enum `UserRole` | ADMIN · COACH · PLAYER · PARENT · GUEST | Hovedcoach (uavklart, E3) · Coach · Spiller · Forelder. Ordboken: «Admin» som rollenavn står i «Ikke bruk» | `"ADMIN"` brukes i 358 sammenligninger i koden | Ikke rør. Å endre ADMIN er svært risikabelt (tilgangsstyring). Bare skjermtekst |
| enum `PeriodeType` / `LPhase` | GRUNN · SPESIAL · TURNERING · EVALUERING · TESTUKE · FERIE · TRENINGSSAMLING · HELDAGSSAMLING · RESTITUSJON | Stemmer med ordboken (kodenavn er bestemt i beslutning 28.09). Merk: Testuke, Treningssamling og Heldagssamling er «hendelser, ikke treningsperioder» i ordboken, men ligger i samme enum som periodene | 19 / 34 | Ingen nå. Mulig opprydding senere |
| Modell med «Drill» i navnet | `SessionDrill`, `TrainingDrillV2`, `DrillLogV2`, `DrillMal`, `OktMalDrill`, `SessionDrillInstance`, `SessionDrillNote`, `CoachDrillDirectiv`, `WorkbenchDrill`, `DrillChallenge`; enum `DrillFasilitet`, `DrillPracticeType` | Øvelse (`ExerciseDefinition` finnes allerede, og `Workbench…` bruker «øvelse» i UI) | `SessionDrill` 16, `TrainingDrillV2` 11, `WorkbenchDrill` 8, `DrillLogV2` 8, `DrillChallenge` 6, `DrillFasilitet` 12 | Prisma-modellnavn kan byttes med `@@map` uten migrering, men hvert navn er brukt i 6–16 filer, og modellnavn vises ikke for brukeren. Anbefaling: ikke omdøp; skriv «Drill = Øvelse» i ordboken som kodebegrep |
| `ExerciseSource`, `Maaleutstyr`, `NgfKategori`, `PlayerProgram` | kodeverdier | Maaleutstyr har 6 verdier (TRACKMAN, FLIGHTSCOPE, GARMIN_R10, MEVO_PLUS, ANNET, UTEN), ordboken M 585–590 har 4 (D10) | `Maaleutstyr` 3 | Vent på beslutning (D10) |

#### SP-02 · Utgåtte koder (L-fase, CS, M0–M5, PR1–PR5) skrives fortsatt i ny kode
- Alvorlighet: Middels
- Fil: `src/lib/workbench/session-update.ts:48,104,183,237`; `src/lib/portal/training/session-generator.ts:151,224,253` (`miljo: "M2"`); `src/app/team-wang/_data/wang-plan.ts:663,671` (`miljo: "M1"`/`"M2"`); `prisma/schema.prisma:4174` (`TrainingSessionV2.miljo` er påkrevd)
- Hva er galt: ordboken og beslutningene sier at L-faser, CS-nivåer, M0–M5 og PR1–PR5 er utgått og «aldri skrives på nytt». Likevel tar `session-update.ts` imot `lFase` fra skjema og skriver `prPress: "PR1"` / `"PR3"` når en øvelse lagres (linje 237). Økt-generatoren og WANG-planen setter `miljo: "M2"`/`"M1"` fordi feltet er påkrevd i databasen.
- Hva kan skje: nye rader får utgåtte koder; analyser og AI som leser dem må kjenne to systemer; gamle visninger som «Lav fart / CS50–CS70» (`components/v2/skjema.tsx:470`) lever videre. Ingen krasj, men språket blir aldri rent.
- Forslag til retting: (1) gjør `TrainingSessionV2.miljo` valgfritt (additivt, via `db execute`); (2) sett `prPress` ut av `session-update.ts` og bruk `Press`-feltet (ALENE/OBSERVERT/…); (3) fjern `lFase` fra skjema-valideringen; (4) først deretter vurdere å droppe v1-kolonnene. Hele kjeden er et forslag, ingenting kjøres.
- PR-gruppe: P7-skjema
- Status: Ny

#### SP-03 · To parallelle skalaer for samme ting i databasen
- Alvorlighet: Middels
- Fil: `prisma/schema.prisma:100` (`SkillArea`) mot `:286` (`Omraade`); `:150` (`DrillPracticeType`: VARIABEL) mot `:433` (`PracticeType`: RANDOM); `:39` (`SessionStatus`) mot `:51` (`SessionStatusV2`); `:218` (`PressureLevel`) og `:264` (`PRPress`) mot `:324` (`Press`)
- Hva er galt: samme begrep finnes to ganger med ulike verdier. `SkillArea` er en gammel 5-delt liste (`TEE_TOTAL`, `TILNAERMING`, `AROUND_GREEN`, `PUTTING`, `SPILL`) som fortsatt er i bruk i 26 filer, mens fasiten er de 19 områdene i `Omraade`.
- Hva kan skje: statistikk og AI-plan som leser det gamle feltet får «Tilnærming» og «Around green» (ordboken: Innspill / Nærspill); nye områder som «Innspill 150» finnes bare i det nye. Det er opphavet til at «Approach» og «Around green» fortsatt vises (`lib/training/labels.ts:3-8`).
- Forslag til retting: legg opp en felles oppslagsfunksjon `SkillArea → Omraade` og la visningen alltid gå via den; fjern `SkillArea` når alle skrivesteder bruker `Omraade`. Migrering trengs først ved fjerning.
- PR-gruppe: P7-skjema
- Status: Ny

#### SP-04 · Nivåkoder `PRO` og `ELITE` lever i koden, ordboken sier Gratis / Full
- Alvorlighet: Lav
- Fil: `prisma/schema.prisma:24-28` (`Tier`); `src/app/portal/actions.ts:609,665`; `src/app/auth/onboarding/onboarding-wizard.tsx:242,891,926`; `src/app/admin/(legacy)/spillere/ny/constants.ts:22`; `src/app/portal/mal/sg-hub/coach/[spillerId]/page.tsx:62`
- Hva er galt: `ELITE` skal ikke finnes (beslutning 24.09) men enum-verdien står der, og koden bruker `tier: "ELITE" ? "PRO"` som en lapp. Skjermvalg i onboarding og admin heter `PRO`.
- Hva kan skje: en bruker med `ELITE` i databasen vises som `PRO`; skjermtekst som viser kodeverdien direkte viser «PRO».
- Forslag til retting: behold kodeverdiene (tilgang styres av `resolveTilgang`), men sørg for at all visning går via ett ord-oppslag (Gratis / Full). Å fjerne ELITE fra enumen krever migrering og datasjekk: bare forslag.
- PR-gruppe: P7-skjema
- Status: Ny

---

### 3. Skriveregler: systematiske brudd (PR-gruppe: P8-designforberedelse / Ingen)

Fasit er Del C i ordboken og `src/lib/format-tall.ts` («den ENE kilden for hvordan et tall vises»).

#### SP-05 · Åtte konkurrerende tallformatterere; fasiten brukes bare i 35 filer
- Alvorlighet: Middels
- Fil: `src/lib/format-tall.ts` (fasit, 35 filer bruker den); konkurrenter: `src/lib/v2/format.ts:12` (`fmtSg`), `src/lib/min-golf/format.ts:11` (`fmtSg`), `src/lib/sg.ts:71` (`formatSg`), `src/lib/domain/sg.ts:155` (`formaterSg`), `src/lib/sg-hub/format.ts:4` (`formatNumber`), `src/lib/portal-tester/format-verdi.ts`, `src/lib/portal-live/format.ts`; i tillegg lokale hjelpere som `fmt…`/`pct…` i 129 filer
- Hva er galt: fasiten i `format-tall.ts` ble laget for å stoppe nettopp dette, men eldre hjelpere ligger igjen. Fire av dem gjør «Strokes Gained med fortegn» litt ulikt: `v2/format.ts` gir 1 desimal og viser «+0,0» for 0,04 (fortegn på noe som avrundes til null); `formaterFortegn` gir 2 desimaler og viser «0,00». `sg-hub/format.ts:4` bruker `toFixed` + egen komma-bytte og lar negative tall ha ASCII-bindestrek («-1,2»), ikke ekte minus.
- Hva kan skje: samme SG-tall vises som «+0,0», «0,00» eller «−0,0» avhengig av skjerm; negativt tall kan stå med bindestrek i SG-hubben. Ordbokens regel («+1,2 / −0,4», ekte minus, komma) brytes.
- Forslag til retting: la de fire `fmtSg`-variantene bare kalle `formaterFortegn` (avgjør 1 eller 2 desimaler som ordbokregel: Del C sier «+1,2 / −0,4» = 1 desimal, mens `format-tall` default er 2); fjern `sg-hub/format.ts` til fordel for `formaterTall`. Gjøres sammen med nytt design, ikke før.
- PR-gruppe: P8-designforberedelse
- Status: Ny

#### SP-06 · Tall vises med punktum: 117 `toFixed` rett i JSX, 43 filer
- Alvorlighet: Middels
- Fil: `src/components/marketing/v2/MarkedStatsVerktoyV2.tsx` (11), `src/components/sg-hub/SgTrainingScatter.tsx` (9), `src/app/(marketing)/stats/pga/scoring-avg/explorer.tsx` (7), `…/pga/putts-per-round/explorer.tsx` (7), `src/components/sg-hub/TempoRibbon.tsx` (6), `src/app/(marketing)/stats/sg-sammenlign/resultat/[id]/page.tsx` (5), `src/components/v2/spesialviz.tsx` (4), `src/components/admin/v2/AdminCaddieAktivitetV2.tsx` (4). 23 av de 43 filene er offentlige markeds- og statistikksider
- Hva er galt: `{x.toFixed(1)}` gir «62.4» med punktum. Totalt 333 `toFixed`-kall i 157 filer; 194 av dem ligger i tekst som vises (resten er grafikk-koordinater, som er greit). 96 steder bytter punktum til komma med `.replace(".", ",")`, men 117 gjør det ikke. Regelen er «komma alltid» (C2).
- Hva kan skje: offentlige statistikksider og SG-hubben viser «0.41» og «62.4 %» blant sider som ellers viser «0,41». Dette var akkurat feilen `format-tall.ts` sier den skulle fjerne.
- Forslag til retting: bytt til `formaterTall`/`formaterFortegn`/`formaterProsent`. Legg en ESLint-regel som forbyr `.toFixed(` i `.tsx` utenfor SVG-hjelpere. Tas når markedssidene og SG-hubben får nytt design.
- PR-gruppe: P8-designforberedelse
- Status: Ny

#### SP-07 · Prosent skrives uten mellomrom: «73%» i stedet for «73 %»
- Alvorlighet: Lav
- Fil: JSX `{x}%`: `src/components/admin/player/player-detail-panel.tsx`, `src/components/v2/core.tsx`, `src/components/admin/v2/AdminReachV2.tsx`, `AdminCaddieDashbordV2.tsx` (10 linjer, 8 filer). Tekstfelt som `label`/`value`/`title` med `}%`: 12 linjer i 8 filer, f.eks. `src/components/stats/stats-heatmap.tsx`, `putt-preview.tsx`, `src/components/sg-hub/TempoRibbon.tsx` (`${consistencyPct}%`)
- Hva er galt: ordboken C2 og norsk rettskrivning krever mellomrom før %, og `formaterProsent` setter inn hardt mellomrom. Rundt 155 filer inneholder `}%`, de fleste er CSS (`width: 50%`) og er greit; de ca. 22 linjene over er synlig tekst.
- Hva kan skje: kosmetisk avvik; samme tall står «73 %» på én skjerm og «73%» på en annen.
- Forslag til retting: bytt til `formaterProsent`. Samme tidspunkt som SP-06.
- PR-gruppe: P8-designforberedelse
- Status: Ny

#### SP-08 · Dato: tre ulike stiler, og klokkeslett med og uten punktum
- Alvorlighet: Lav
- Fil: `Intl.DateTimeFormat`/`toLocale…("nb-NO")` brukes 212 + 345 ganger, med `month: "short"` 105 steder og `month: "long"` 96 steder, `day/month: "2-digit"` 53 steder; `src/lib/portal-live/format.ts:18-24` lager «ONS 28 MAI» i store bokstaver og fjerner punktum med regex; `src/lib/min-golf/format.ts:29` lager «12. mai». Klokkeslett: «kl. 09:00» 96 steder, «kl 09:00» uten punktum 10 steder
- Hva er galt: ordboken C1 fastsetter «19. mai 2026» (full), «man 5. okt.» (kort, anbefaling), «kl. 09:00». I koden finnes både korte former med og uten punktum, store bokstaver (`.toUpperCase()` i `portal-live/format.ts`) og rene «dd.mm.åååå». D30 i ordboken har allerede dette som en motsigelse. Uke skrives «Uke 41» 113 steder og «uke 41» 112 steder (regelen: stor forbokstav i overskrift, liten i løpende tekst, så dette kan stemme, men er ikke kontrollert).
- Hva kan skje: samme dato skrives tre måter i appen. Ingen feil i tall.
- Forslag til retting: lag én modul `src/lib/format-dato.ts` med tre funksjoner (`datoFull`, `datoKort`, `klokkeslett`) bygget på `Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo" })`, og bytt når design er låst. Avgjør først D30 / C1-«kort dato» (antatt, ikke fastsatt i M).
- PR-gruppe: P8-designforberedelse
- Status: Ny

#### SP-09 · Ukjent verdi vises med «0» eller «–» i stedet for «—»
- Alvorlighet: Lav
- Fil: `?? "0"`: 6 steder; `?? "–"` (kort tankestrek): 7 steder; `?? "—"` (riktig): 251 steder (søk i `src/`, utenom tester). Regelen C3: «—» betyr ukjent, «0» betyr målt null; bindestrek brukes aldri.
- Hva er galt: syv steder bruker «–» (en-dash) og seks bruker «0» som reserve. «0» som reserve er den farligste (ukjent ser ut som målt null; reglen er «manglende verdi blir antakelse», jf. minnet om PH-07–PH-12).
- Hva kan skje: en spiller uten målt verdi ser «0» og tror det er resultatet.
- Forslag til retting: finn de 13 stedene med `rg '\?\? ?["\x27](0|–)["\x27]' src` og bytt til `formaterTall()` (som gir «—»). Små, sikre endringer; kan tas som rene kodeoppryddinger, men er skjermtekst så de venter på design.
- PR-gruppe: P8-designforberedelse
- Status: Ny

#### SP-10 · Putting i fot er ikke gjennomført overalt, og yards finnes i spillervalg
- Alvorlighet: Lav
- Fil: `src/components/portal/profile/PreferencesCard.tsx` (valg av yards), `src/components/portal/v2/DataGolfV2.tsx`, `src/components/marketing/v2/MarkedStatsVerktoyV2.tsx`, `src/app/(marketing)/stats/verktoy/avstand/page.tsx`, `src/app/(marketing)/stats/pga/drive-distance/explorer.tsx`; meter ved putting: `src/app/(marketing)/stats/pga/putt-explorer/explorer.tsx` (`{distance}m`), `src/components/hole-analysis/hole-analysis.tsx` («Lag-putt», «> 5 m»); riktig: `src/components/portal/runde-logg/ShotEntryNumpad.tsx` (fot for putt, m ellers)
- Hva er galt: ordboken C2/B 1037: putting alltid i fot (meter i parentes), alt annet i meter, aldri yards for spillere. Runderegistreringen følger regelen, offentlige PGA-sider og hullanalysen gjør ikke det. PGA-statistikken stammer fra amerikansk kilde (yards er kilde-enhet).
- Hva kan skje: samme putt står i fot i appen og i meter på analysekortet; en spiller kan velge yards i preferanser mot ordboken.
- Forslag til retting: bruk `meterTilFot` (finnes i `lib/min-golf/format.ts:24`) i putteflater; avklar med Anders om yards skal være et valg for spillere (ordboken sier nei, koden tilbyr det).
- PR-gruppe: Ingen (bare rapport)
- Status: Usikker (må sjekke om `PreferencesCard` faktisk styrer visning)

#### SP-11 · «Mål» og «Målsetning» blandes
- Alvorlighet: Lav
- Fil: `src/components/portal/precision/PH19Enkeltmal.tsx`, `src/components/portal/precision/PH13DrillDetalj.tsx`, `src/components/portal/global-search-modal.tsx`, `src/components/shared/cmd-palette.tsx`, `src/components/portal/v2/MalHubV2.tsx`, `src/lib/domain/pei/protokoll-definisjoner.ts` (alle ca. 10 treff på «Mål» som egen knapp/overskrift); «Mål oppnådd/Oppnådd» i `src/components/portal/v2/MalDetaljV2.tsx`, `src/lib/notifications/triggers.ts`; «Målsetting» (feil stavemåte) i `src/lib/portal-tester/tn-catalog.ts`, `src/components/v2/struktur.tsx`, `src/components/admin/precision/AG08Faner.tsx`
- Hva er galt: C5 sier «Målsetning» om det spilleren sikter mot og «mål» bare i «rep-mål», «TrackMan-mål». «Målsetting» er en tredje skrivemåte. Ordboken D16 viser at selve masteren også blander.
- Hva kan skje: spilleren leser «Mål» på én skjerm og «Målsetning» på en annen. Treffene på «Målsetning» (50) viser at regelen følges i hovedsak.
- Forslag til retting: bytt tre «Målsetting» først (ren stavefeil), resten med nytt design.
- PR-gruppe: Ingen (bare rapport)
- Status: Ny

#### SP-12 · «uken» og «uka» blandes
- Alvorlighet: Lav
- Fil: søkt i hele `src/`; «denne/neste/forrige uka» 166 steder, «…uken» 63 steder. Eksempel i samme skjerm: `PH10Plan.tsx:149, 199` (ordboken D51)
- Hva er galt: ordboken bruker «denne uka» (M 91), men M 298 skriver «denne uken». Begge former er gyldig bokmål; regelen er ikke avgjort (E4).
- Hva kan skje: ingenting alvorlig; bare ujevn tone.
- Forslag til retting: avgjør E4 og kjør ett søk-og-erstatt. Det er bare 63 steder.
- PR-gruppe: P8-designforberedelse
- Status: Ny

#### SP-13 · Engelsk i skjermtekst (D33)
- Alvorlighet: Lav
- Fil: ordbokens D33 nevner Recap, Skills, digest, peer-snitt, discovery, Plan-hub, Live Watch, Daily Brief, lead, Leaderboard, Skill map. Jeg har ikke gjort eget søk på disse; funnene er fra ordboken. Bekreftet ved lesing: «Hoy press», «Slow-motion» i `lib/taxonomy.ts:221-223` og `lib/portal/translate-taxonomy.ts:22` (også ASCII-stavemåte uten ø: «Hoy», «Innendors», «Loping», «Svomming», «Kolle» i `lib/taxonomy.ts:82-85,134-138,174,223`)
- Hva er galt: engelske ord i norsk skjermtekst og manglende æ/ø/å i visningsnavn («Hoy press», «Loping»). Regelen: norske tegn skal vises riktig.
- Hva kan skje: brukeren ser «Hoy press» og «Svomming» med feil tegn.
- Forslag til retting: legg inn et visningsnavn med riktige tegn i `lib/taxonomy.ts`; hold kodenavnet ASCII.
- PR-gruppe: P8-designforberedelse
- Status: Ny

#### SP-14 · Mal: AI-prompt-mapper og interne demosider bruker forbudte ord (informasjon)
- Alvorlighet: Lav
- Fil: `src/lib/ai-plan/coach-prompt.ts`, `src/lib/ai-plan/schema.ts`, `src/lib/caddie/tools/knowledge.ts`, `src/lib/masterbrain/**`, `src/app/(internal)/demos/plan-bygger/[steg]/page.tsx`
- Hva er galt: ordene «drill», «drills», «Avlastning» brukes i tekst som sendes til AI eller vises på en intern demoside. Ikke skjermtekst for spillere, så utelatt fra tabellen over.
- Hva kan skje: AI-svar til spilleren kan bruke «drill» fordi prompten gjør det. Det er den veien «Drill» siver inn i spillerens skjerm uten at noen har skrevet det i koden.
- Forslag til retting: legg «Bruk ordet øvelse, aldri drill» i AI-promptene. Test med et eksempelsvar. Ikke endre tekstene før design er låst, men prompt-teksten er ikke skjerm og kan rettes tidligere hvis Anders vil.
- PR-gruppe: Ingen (bare rapport)
- Status: Usikker (må sjekke et faktisk AI-svar)

---

### Tre viktigste

1. **SP-02:** utgåtte koder (L-fase, CS, M0–M5, PR1–PR5) skrives fortsatt i nye rader, og `TrainingSessionV2.miljo` er påkrevd slik at ny kode må sette «M2». Hovedårsaken til at det gamle systemet ikke dør.
2. **SP-05 + SP-06:** åtte tallformatterere og 117 `toFixed` i tekst som vises. Offentlige statistikksider og SG-hubben viser «62.4» med punktum og «-1,2» med bindestrek.
3. **SP-03:** to parallelle skalaer for samme ting i databasen (`SkillArea` mot `Omraade`, to statusenumer, to treningsmåte-enumer). Fører til «Tilnærming» og «Around green» i skjermtekst.

---

## 7. Tester og bygg (målt 06.10.2026)

| Kontroll | Resultat |
|---|---|
| Typesjekk (`tsc --noEmit`) | Grønn. Krever `NODE_OPTIONS=--max-old-space-size=5120`, som GitHub-kontrollen bruker. Uten den går maskinen tom for minne lokalt |
| Lint (`npm run lint`) | Grønn |
| Statiske vakter (`npm run verify:static`, 18 skript) | Grønn |
| Enhetstester (`npm test`) | 4 485 av 4 485 bestått i 307 grupper, pluss 185 av 185 komponenttester |
| Bygg (`npm run build`) | Grønn. 598 filer lagres for bruk uten nett (15,8 MB) |
| Sikkerhetsrevisjon (`npm audit`) | 10 pakker: 6 høye, 4 moderate, 0 kritiske. Alle har retting. Bare 1 høy og 4 moderate gjelder pakker som er med i appen. Resten er utviklerverktøy (RY-22) |

Én liten feil: `verify:static` skriver om `docs/ordbok.json` med dagens dato hver gang den kjøres, slik at arbeidsmappa blir «endret» uten at noen har gjort noe (Lav, P4).

**Hvor mye som har tester.** Det finnes 650 testfiler i `src/`, 34 komponenttester og 59 nettlesertester (Playwright). Dekningen er skjev:

| Område | Kildefiler | Testfiler |
|---|---|---|
| `src/lib/auth` (tilgang) | 23 | 12 |
| `src/lib/deling` (deling) | 7 | 5 |
| `src/lib/workbench` | 85 | 47 |
| `src/lib/domain` | 98 | 69 |
| `src/app/portal` (PlayerHQ-sider og handlinger) | 360 | 16 |
| `src/app/admin` (AgencyOS) | 363 | 57 |
| `src/app/team-wang` | 43 | 6 |
| `src/app/team-norway` | 44 | 3 |
| `src/app/forelder` | 38 | 2 |
| `src/app/api` (API-ruter) | 70 | 6 |

Det finnes ikke noe dekningsmål (prosent av linjer), fordi testoppsettet (`node:test` med `tsx`) ikke måler det. Tallene over er antall filer.

**Nettlesertestene kjører mot produksjon etter publisering** (`.github/workflows/playwright.yml`), ikke før en endring legges inn. De tester at sider laster og at uinnloggede blir stoppet. De logger ikke inn som spiller eller coach.

**De viktigste flytene som mangler tester:**

| Flyt | Hva som finnes | Hva som mangler |
|---|---|---|
| Innlogging | Nettlesertest av at innloggingssiden vises (`tests/e2e/auth.spec.ts`), og test av hvem som blir regnet som mindreårig (`minor.test.ts`) | Ingen test av `requirePortalUser` eller `getCurrentUser` (0 testfiler), og ingen av innlogging via Google (`oauth-callback`). Ingen test av at en spiller uten fødselsdato sendes til oppstart |
| Tilgang for org-trener | `coached.test.ts` | Testen låser hullet som riktig (linje 78). Det mangler en test som avviser en WANG/TN-trener uten samtykke |
| Deling | Gode tester for navngitt deling og samtykkeregler (`navngitt-regler.test.ts`, `samtykke-regler.test.ts`) | Ingen test av at tilbaketrukket deling stenger AgencyOS-veien, fordi den veien ikke ser på deling i det hele tatt |
| Publisering av plan | `publish-actions.test.ts`, `publish-atomic.test.ts` | Ingen test av at spilleren ser publisert versjon og ikke et nyere utkast i samme flyt (spesifikasjonen sier «nyere utkast skal aldri lekke») |
| Forslag mellom spiller og coach | `trenerforslag.test.ts`, `plan-handlinger-actions.test.ts`, nettlesertest `workbench-suggest.spec.ts` | Ingen test av hele kjeden forslag → godta/avvis → varsel, og ingen av at Angre gjelder for spilleren (M2) |
| Føring av runde | `runde-logg.test.ts`, `manuell-sg-lagring.test.ts`, nettlesertest `runde-foring.spec.ts` | Ingen test av redigering av scorekort (der slag slettes, DI-04), og ingen av eiersjekk ved sletting av slag (TP-05) |
| AI-chat, video, opplasting | Ingen | Eiersjekk (TA-01, TP-01, TA-05) |

---

## 8. Dokumenter (DO)

Grunnlag: `main` på commit 9f39c7d44 (06.10.2026), lest i arbeidskopien `kodegjennomgang`. Bare lesing; ingen filer i repoet er endret, ingen databasekall.

### Oppsummering

- 766 Markdown-filer og 48 andre tekstdokumenter i docs/ er gjennomgått og merket i `docs/review/vedlegg/dokumentliste.md`. Under designsystem/ ligger i tillegg ca. 1 700 tegnings- og kildefiler som følger mappens status.
- Status: Gjeldende 467 (derav 387 Markdown i eksterne skill-pakker, RAG-korpus og komponent-README) · Utgått 171 · Gammelt 133 · Dublett 6 · Motstrid 37 (se `docs/review/vedlegg/dokumentliste.md` for nøyaktige tall og tall per mappe).
- 13 funn: 0 Kritisk · 5 Høy · 6 Middels · 2 Lav.
- Dekket: alle `.md/.mdx` i repoet (unntatt node_modules og src/generated), json/txt/csv/sql/patch/html/zip i docs/, og mappene designsystem/, .claude/, .agents (peker til .claude/skills), tests, scripts, content.
- IKKE dekket: innholdet i de ca. 1 700 designsystem-tegningene (html/jsx) er ikke lest linje for linje; status følger mappen. Innholdet i eksterne skill-pakker (react-best-practices, impeccable, security-review m.fl.) er ikke vurdert mot fasit. Dokumenter på grener og i Claude Design (D-01–D-46, `docs/workbench/workbench-beskrivelse-2026-10-05.md`) er ikke lest. Skillene `playerhq-agents` og `hq-godkjenning` ligger ikke i repoet (M30 nevner playerhq-agents); de må vurderes der de bor.
- `docs/arkiv/` finnes ikke i `main`, selv om AGENTS.md og 8 andre dokumenter peker dit.

---

#### DO-01 · Tre dokumenter kaller seg «eneste master» for språk og planlegging
- Alvorlighet: Høy
- Fil: `docs/treningsplanlegging.md` (fasit), `docs/treningsplanlegging-og-sprak.md:3-5`, `designsystem/precision-athletics/guidelines/ordmaster.md` + `readme.md`, `.claude/skills/playerhq-arkitektur/SKILL.md:9,55`
- Hva er galt: `treningsplanlegging.md` er fasit (AGENTS.md, beslutningene 29.–30.09). Likevel sier `treningsplanlegging-og-sprak.md` (27.09) at den er «eneste gjeldende master» og at `treningsplanlegging.md` er historisk. Skillen `playerhq-arkitektur` sier at plan og begreper følger den feilen. Precisions ordmaster og readme kaller seg «autoritativ» (beslutning 29.09: de er avledet). Beslutningene §Treningsfag sier i tillegg at valgtreet eies av `treningsplanlegging-og-sprak-gjennomgang.md`. Den nye ordbok-masteren (06.10) kommer som et fjerde dokument.
- Hva kan skje: En agent eller designer som følger feil dokument bruker utgåtte ord og regler: «Spesialisering» i stedet for Spesialperiode, faste prosentfordelinger og tak (M8), putt i meter, fem uketyper. `playerhq-arkitektur` lastes automatisk ved PlayerHQ-arbeid, så feilen kommer inn i ny kode.
- Forslag til retting: (1) Merk `treningsplanlegging-og-sprak.md` og `-gjennomgang.md` som historiske øverst, eller slett i P9a/P9i. (2) Rett `playerhq-arkitektur` til `treningsplanlegging.md`. (3) Rett beslutningene §Treningsfag (valgtreet) til masteren. (4) Når `docs/ordbok/ordbok-master-2026-10-06.md` legges inn: gjør `docs/ordbok.md` om til en peker dit og la `treningsplanlegging.md` vise til den for ord og skjermtekst, slik at det bare finnes én rekkefølge (ordbok for ord, treningsplanlegging for fag).
- PR-gruppe: P9-dokumenter
- Status: Ny

#### DO-02 · «Aktiv Workbench-bestilling 20.09» (åtte piller) står fortsatt som aktiv i innganger og vaktes av verify
- Alvorlighet: Høy
- Fil: `START-HER.md`, `docs/FASIT.md`, `docs/platform/AGENT-BRIEF.md:10`, `designsystem/README.md` (avsnittet «Aktiv Workbench-leveranse»), `docs/workbench-handover.md`, `docs/design/workbench-handover/*` (SKILL.md:36, manifest.md), `docs/patches/wb-v2-lov.patch`, `.claude/skills/ak-hq-design/references/workbench-design-og-kode.md`, `scripts/check-workbench-handover.mjs` (kjøres i `verify:static`)
- Hva er galt: Fem innganger som alle agenter leser først peker på 20.09-masteren: åtte piller (År·Periode·Måned·Uke·Økt·Stall·Live·Min kalender), radius 2, meny Hjem·Innboks·Kalender·Stall·Workbench·Godkjenninger, formel «8 + ?», tidsrom 05–22, uketyper UTVIKLING/VEDLIKEHOLD/TURNERING. Beslutningene og bygget kode har fire visninger (Sesongkart, Ukeverksted, Trenerbord, Stats, valgt 02.10), Precision radius 8 px, IA 28.09 (Cockpit·Innboks·Stall·Kalender·Workbench·Mer) og åtte trinn i øvelsen (M1, M14, M16, M17). Skriptet `check-workbench-handover` holder den utgåtte pakken i live ved å kontrollere 16 PNG-er og kontrollsummer i hver `verify`. SKILL.md i pakken bruker dessuten «Spesialiseringsperiode», som er forbudt (M27).
- Hva kan skje: Nye økter porterer eller tegner mot feil Workbench. Anders' spørsmål 1 om hvilken Workbench som skal tegnes (nivåer eller fire visninger) er fortsatt åpent, og dokumentene gir to forskjellige svar.
- Forslag til retting: Anders avgjør M1 først. Deretter: rett de fem inngangene (kort tekst, peker til Workbench-beskrivelsen), merk 20.09-pakken Utgått, og fjern den i egen PR (P9b) sammen med `check:workbench-handover`, skriptets test og `tests/visual/workbench/README.md`-referansen.
- PR-gruppe: P9-dokumenter
- Status: Ny

#### DO-03 · Skills som sier feil ting om plan, meny og designretning
- Alvorlighet: Høy
- Fil: `.claude/skills/playerhq-arkitektur/SKILL.md:9,59`, `.claude/skills/agencyos-arkitektur/SKILL.md` (meny, `/admin/godkjenninger`, tema), `.claude/skills/ak-hq-design/references/atletisk-intelligens.md`, `references/produkt-og-retning.md`, `references/workbench-design-og-kode.md`, `.claude/skills/README-AK-HQ.md`, `.claude/skills/design-system/SKILL.md`, `.claude/skills/frontend-design/SKILL.md`
- Hva er galt: (M30) `playerhq-arkitektur` sier at planendringer «går via coachens godkjenning» og at designretningen er «App design». Beslutningene 28.09 sier at spilleren endrer selv, coach endrer uten godkjenning, og spilleren kan angre. `agencyos-arkitektur` har den gamle menyen. `README-AK-HQ.md` sier at «Atletisk intelligens / ak-hq-design» vinner ved konflikt, mens atletisk-intelligens er erstattet av Precision. Skillene refererer også til skills som ikke finnes i repoet (`hq-godkjenning`, `playerhq-agents`).
- Hva kan skje: Skillene lastes automatisk og styrer koden. En agent kan bygge «Send til coach»-godkjenning eller den gamle menyen på nytt, som beslutningene har fjernet.
- Forslag til retting: Skriv om `playerhq-arkitektur` og `agencyos-arkitektur` mot beslutningene 28.09/04.10 (korte, uten egne regler). Merk atletisk-intelligens, produkt-og-retning og workbench-design-og-kode Utgått (P9g). Rett `README-AK-HQ.md`.
- PR-gruppe: P9-dokumenter
- Status: Ny

#### DO-04 · AI-kunnskapsfiler i koden bruker utgåtte L-faser, CS- og PR-koder
- Alvorlighet: Høy
- Fil: `src/lib/masterbrain/rag-corpus/morad/morad-p1-setup.md:32`, `.../morad/confidence-bands-coaching.md:22`, `.../morad/truth-layer-prioritet.md:12`, `.../live/live-readiness-check.md:12`, `src/lib/masterbrain/training-data/examples/README.md:29,76`, `.../eval/RUBRIC.md:11`; `src/lib/ai-coach/rag-select.ts:9` (leser `rag-corpus/morad`); `src/lib/masterbrain/utgatt-kunnskap.test.ts`
- Hva er galt: Filene lærer AI-en «L-KROPP/L-ARM: CS20-40, M0-M1, PR1» og lignende. L-faser, CS, M0–M5 og PR1–PR5 er utgått (AK-formel v2). Testen `utgatt-kunnskap.test.ts` vokter bare tre fjernede filer (`canon-invariants-13`, `canon-l-fase-overrides`, `canon-pyramide-ak-formel`), ikke disse fire i `morad/` og `live/`. `rag-select.ts` leser hele `morad/`-mappen, så tre av filene kan komme inn i AI-coachens svar. Teksten i `src/lib/masterbrain/MANIFEST.md` innrømmer selv at skalaene er «under revisjon».
- Hva kan skje: AI-coachen foreslår økter og nivåer i et format coachene ikke lenger bruker, og eval-rubrikken måler mot utgåtte regler.
- Forslag til retting: Rett kilden (masterbrain-repoet, ellers overskrives det av `sync:masterbrain`) eller fjern filene, og utvid `utgatt-kunnskap.test.ts` med et søk etter `\bCS\d+`, `PR[1-5]`, `L-(KROPP|ARM|KØLLE|BALL|AUTO)` i `rag-corpus` og `training-data`. Oppdater index.json tilsvarende.
- PR-gruppe: P9-dokumenter (kunnskapsfiler i kode; koordiner med P5-dødkode)
- Status: Ny (innholdet verifisert ved grep; at tre av filene når AI-promptene er lest ut av `rag-select.ts:9` og ikke kjørt)

#### DO-05 · Handoff-dokumentene sier at WANG/TN-innsyn er automatisk og ikke kan trekkes
- Alvorlighet: Høy
- Fil: `docs/design-handoff/README.md:34`, `docs/design-handoff/regler/claude-code.md` (punkt 3), `docs/design-handoff/regler/overforing-wang-tn.md:7`, `docs/design-handoff/regler/iup-i-playerhq.md:25`
- Hva er galt: Handoff 04.10 sier at gruppen «får innsyn automatisk, uten at spilleren deler noe», og at spilleren ikke kan trekke det. Beslutning D-04 og beslutningene 28.09 sier at innsyn krever uttrykkelig deling per organisasjon, kan trekkes, og at forelder godkjenner under 16. Beslutningene 04.10 setter automatisk innsyn på vent til juridisk avklaring, men handoff-filene er ikke rettet, og porteringskøen (`claude-code.md` punkt 3) bygger på dem. M6 i Workbench-beskrivelsen peker på den samme motsigelsen. `PH-27` i handoffen viser dessuten ingen «Trekk tilgang».
- Hva kan skje: Hvis køen porteres som skrevet, kan WANG- og Team Norway-trenere se helse, meldinger og testresultater for mindreårige uten at spiller eller forelder har sagt ja.
- Forslag til retting: Legg et tydelig «SETT PÅ VENT»-banner øverst i de fire filene som viser til beslutningene 04.10 og D-04, og la `navngittTrenerHarTilgang` være uendret til juridisk avklaring (som beslutningene allerede krever). Meld tilbake til Claude Design at skjermene PH-27/PH-IUP må tegnes med deling og tilbaketrekking.
- PR-gruppe: P1-tilgang (kode) og P9-dokumenter (banner)
- Status: Ny

#### DO-06 · BUSINESS-RULES.md kaller seg «eneste fasit», men motsier masteren og beslutningene
- Alvorlighet: Middels
- Fil: `docs/platform/BUSINESS-RULES.md:168,180,277-281,334,367-369` (og §Credits 79–86)
- Hva er galt: «Uten ball» er «en egenskap ved øvelsen, ikke et eget steg» (masteren: eget læringssteg, D8). «Mål bor i Oversikt» (fasit: Workbench › Målsetninger, M22). Tre øktmodeller «skal ikke slås sammen» mens beslutningene og koden peker mot `WorkbenchSession` som den ene (M12). Aksen SPILL heter «Spilltrening» (fasit: Spill, D4). «Credits» (fasit: klipp om enheten, coaching-time om timen, D52). Dokumentet er lenket fra AGENTS, README, docs/README, AGENT-BRIEF og 3 kodefiler, og sier at det vinner ved konflikt.
- Hva kan skje: Produktregler og vokabular trekker i to retninger; en agent som holder seg til «eneste fasit» her bygger mot utgått språk.
- Forslag til retting: Rett de fem stedene, eller legg inn en kort seksjon «Språk og planlegging: se treningsplanlegging.md» og fjern duplikatene.
- PR-gruppe: P9-dokumenter
- Status: Ny

#### DO-07 · Fire dokumenter gir feil tema og feil designautoritet
- Alvorlighet: Middels
- Fil: `docs/design-system/TEMA-LYS-MORK.md:5-8`, `docs/design-system/design-autoritet.md` (§Arbeidsdeling og «Markedssidene venter»), `designsystem/README.md` (tabellen «Eksisterende referanser»), `docs/FASIT.md`
- Hva er galt: TEMA-LYS-MORK sier PlayerHQ og AgencyOS er mørke som standard. Koden (`src/lib/v2/tema-default.ts:8-15`) har PlayerHQ lyst og /admin mørkt. Beslutning 26.09: lyst er standard begge steder, natt bare i Live og slagregistrering. Dokumentet er altså feil for PlayerHQ, og koden er feil for /admin. `design-autoritet.md` sier «Codex eier appkoden» og «markedssidene venter»; beslutningene 04.10: Claude Code porterer, markedssidene får Precision. `designsystem/README.md` peker PlayerHQ/AgencyOS til Train-lock og markedssider til AK Golf-master. `FASIT.md` har radius 2 og gammel meny, og lister samme fil to ganger.
- Hva kan skje: Forvirring om hvilken design som gjelder; /admin starter mørkt for coacher selv om beslutningen sier lyst.
- Forslag til retting: Oppdater de fire filene (kort), slett tabellrader som peker på utgående systemer. Rett `erMorkFlate` i `tema-default.ts` i en egen kodeendring (P8-designforberedelse).
- PR-gruppe: P9-dokumenter
- Status: Ny

#### DO-08 · AGENTS.md og CLAUDE.md gir ulike regler for publisering, og peker på fjernede dokumenter
- Alvorlighet: Middels
- Fil: `AGENTS.md` (§Data og sikkerhet «Stående forhåndsgodkjenning», §Git-arbeidsflyt, §Kildeorden), `CLAUDE.md` (§Git-arbeidsflyt), `.claude/commands/beslutning.md:2,34,49`, `.claude/rules/beslutninger.md:4`
- Hva er galt: AGENTS.md gir stående forhåndsgodkjenning til push, PR, merge og deploy. CLAUDE.md sier at bestilt lokalt arbeid «ikke i seg selv gir tillatelse til publisering». AGENTS.md sier «gren codex/» og peker på `docs/arkiv/` (finnes ikke i main). Kommandoen `/beslutning` skriver til `docs/MASTERPLAN-GJENSTAAENDE.md`, som ble fjernet i b700ce008 (beslutninger.md:4 sier det selv). 18 Markdown-filer peker fortsatt på MASTERPLAN uten historisk-lenke, 7 på STATUS-NÅ.md og 8 på docs/arkiv.
- Hva kan skje: Agenter vet ikke om de får lov å pushe. `/beslutning` forsøker å skrive til en fil som ikke finnes eller gjenskaper den.
- Forslag til retting: Velg én regel (anbefaling: AGENTS.md er eneste kilde, CLAUDE.md viser dit). Skriv om `/beslutning` slik at utløst arbeid står i beslutningens egen blokk. Fjern «docs/arkiv» fra AGENTS.md eller legg arkivet tilbake som historisk mappe.
- PR-gruppe: P9-dokumenter
- Status: Ny

#### DO-09 · Handoff-kopiene av skjermlisten og masteren kan drive fra repoet (og beslutningene peker på den gamle)
- Alvorlighet: Middels
- Fil: `docs/design-handoff/regler/skjermliste.md:60` (AG-02 «Utgår 28.09»), `docs/design-system/skjermliste-precision-athletics.md` (AG-02 «beholdes»), `docs/design-handoff/regler/treningsplanlegging-master.md`, `.claude/rules/beslutninger.md` (§04.10: «Skjermlista i docs/design-handoff/regler/skjermliste.md er fasit»), `designsystem/precision-athletics/skjermliste.md`
- Hva er galt: Handoff-kopien av skjermlisten er eldre enn `docs/design-system/skjermliste-precision-athletics.md` og sier at AG-02, AG-17, AG-18 skal bort, mens beslutningene 05.10 beholder dem. Beslutningene 04.10 peker likevel på handoff-kopien som fasit. `treningsplanlegging-master.md` er en kopi av masteren (3 linjer topptekst skiller) som blir utdatert ved første endring. Tredje kopi av skjermlisten ligger i `designsystem/precision-athletics/skjermliste.md`. Dessuten finnes Precision i tre versjoner i repoet: speil 28.09, zip 02.10 og handoff 04.10.
- Hva kan skje: Porteringen følger en liste som sier at seks skjermer skal fjernes, mens Anders har bestemt at de skal beholdes.
- Forslag til retting: Gjør `docs/design-system/skjermliste-precision-athletics.md` til eneste skjermliste og la handoff-kopien være en peker. Rett beslutningene 04.10 til den. Merk `designsystem/precision-athletics/skjermliste.md` som eldre kopi.
- PR-gruppe: P9-dokumenter
- Status: Ny

#### DO-10 · Utgåtte kode og ord i skjermtekst- og planleggingsdokumenter
- Alvorlighet: Middels
- Fil: `docs/skjermtekst/skjerm-tekst-hovedskjermer.md:145,179,241`, `docs/treningsplanlegger/wang-toppidrett/oktmal.md:67`, `docs/treningsplanlegger/wang-toppidrett/design-handoff-arsplan-2026-27/README.md`, `designsystem/precision-athletics/guidelines/ordmaster.md` + `overlevering/codex.md` (TALENT/FULL, «SPILL (Banespill)»), `docs/arkitektur/wang.md` + `team-norway.md` («Hjelpetrener»), `docs/AARSPLAN-MOTOR-STATUS.md`
- Hva er galt: «Oppgrader til Pro» og «Pro: 299 kr/mnd» (fasit: Gratis/Full), drill-kode `TEK·INN150·L-BALL·CS70·M2·PR2` (markert utgått i selve filen, men står), «CS50 min» i WANG-årsplan og øktmal (D42), «Hjelpetrener» (fasit Assist Coach, og bare Trener/Sportssjef i /team-wang), putt i meter og fem uketyper i `AARSPLAN-MOTOR-STATUS.md` (D7/D18).
- Hva kan skje: Skjermtekst kopiert fra copy-decken bruker utgåtte ord; Claude Design får samme feil tilbake.
- Forslag til retting: Én rettepass mot ordbok-masteren. De som bare er historikk merkes som det.
- PR-gruppe: P9-dokumenter
- Status: Ny

#### DO-11 · Over 1 700 filer i designsystem/ tilhører utgående systemer, og noen holdes i live av verify-vakter
- Alvorlighet: Middels
- Fil: `designsystem/train-lock/` (244 filer), `designsystem/canvas/` (45), `designsystem/team-norway/` (243), `designsystem/ak-golf/` (253) + `ak-golf-ds/` (23), `designsystem/wang/` (87); vakter: `scripts/check-fasit-sitering.mjs`, `check-fasitdekning-baseline.mjs`, `tests/visual/skjerm-mapping.ts`, `ak-golf-tokens.mjs`, `ak-golf-ds-tokens.mjs`, `check-ak-golf-kits.mjs`, `bygg-skjermregister.mjs`
- Hva er galt: Train-lock, Paper, App design og Claw er erstattet av Precision (og Team Norway App). Likevel kontrollerer `verify:static` fortsatt «fasit-sitering» mot Train-lock (99 kodefiler siterer `designsystem/train-lock/…`), tokens for AK Golf-systemet og kit-manifest. Det koster tid og holder gamle ord som «Fasit», «låst» og «valgt» i live.
- Hva kan skje: Nye utviklere og agenter leser gamle tegninger som om de gjelder. Sletting krever mange samtidige endringer (vakter, 99 kommentarer, 10 `canvas`-kommentarer).
- Forslag til retting: Slettes i egne PR-er (P9c, P9d, P9e) etter at vaktene er fjernet. `designsystem/ak-golf` slettes først etter at Anders har bestemt om merkevaren (ak-merkevare-skillen, trykk/sosiale) skal ha egen kilde (P9f; Usikker).
- PR-gruppe: P9-dokumenter (og P8-designforberedelse for vaktene)
- Status: Usikker (ak-golf: bruken i merkevare må avklares)

#### DO-12 · Dokumentlenke-sjekken og dokumentregisteret skjuler døde lenker og tvinger regenerering ved sletting
- Alvorlighet: Lav
- Fil: `scripts/check-doc-lenker.mjs` (hopper over `docs/arkiv`, `referanse`, `planer`, `design-audit`, `beslutningsgrunnlag`, `merkevare`, `gdpr`, `juridisk`, `design-handoff`), `docs/vedlikehold/prosjektstruktur.json`, `docs/vedlikehold/dokumentregister.md`, `scripts/prosjekt-register.mjs`
- Hva er galt: Over halvparten av docs/ er unntatt lenkesjekken, så døde lenker (MASTERPLAN, STATUS-NÅ, arkiv) i disse fanges ikke. Registeret lenker til hvert dokument og må regenereres i hver sletting.
- Hva kan skje: Døde lenker hoper seg opp; en sletting uten `npm run prosjekt:register` gir rød `prosjekt:sjekk`.
- Forslag til retting: Ta med regenerering i hver P9-PR. Vurder å fjerne `planer` og `design-audit` fra unntakslisten etter opprydding (eller flytte dem til lokalt arkiv, P9j).
- PR-gruppe: P9-dokumenter
- Status: Ny

#### DO-13 · Småting: dubletter, utdaterte tall, uten lenker
- Alvorlighet: Lav
- Fil: `.claude/skills/source-command-db-check/SKILL.md` + `source-command-pr/SKILL.md` (samme som kommandoene), `.claude/commands/web-design-guidelines.md` + `.claude/skills/web-design-guidelines/SKILL.md`, `docs/planer/wang-tn-iup-2027-sporsmal.md` (samme 162 spørsmål som `design-handoff/kilde/iup-2027-kilde-2026-10-01.*`), `docs/skjermbilder/` (58 PNG uten lenker), `docs/ARKITEKTUR-KART.md` + `docs/arkitektur/*` (overlappende kart), `docs/testing.md` (testtall fra 16.08)
- Hva er galt: Dubletter og utdaterte tall gir støy. Ingen funksjonell skade.
- Forslag til retting: Slett dublettene (P9h), og flytt skjermbilder og kartene til arkiv (P9j) etter at Anders har sett over.
- PR-gruppe: P9-dokumenter
- Status: Ny

---

### Foreslåtte slette-PR-er (kort; full liste i `docs/review/vedlegg/dokumentliste.md`)

| PR | Innhold | Filer |
|---|---|---|
| P9a | Utgåtte dokumenter i docs/ | 33 |
| P9b | `docs/design/workbench-handover/` + `docs/workbench-handover.md` + patch + vakt (etter M1) | 27 |
| P9c | `designsystem/canvas/` | 45 |
| P9d | `designsystem/train-lock/` + fasit-vaktene | 244 |
| P9e | `designsystem/team-norway/` (behold SKJERMREGISTER) | 243 |
| P9f | `designsystem/ak-golf/` + `ak-golf-ds/` (Usikker, avklar merkevare) | 276 |
| P9g | Utgåtte skill-referanser | 3 |
| P9h | Dubletter | 4 |
| P9i | (rette, ikke slette) Motstrid-dokumenter | 37 |
| P9j | (valgfritt) Gammelt til arkiv | ca. 133 |

Rekkefølge: DO-01 til DO-03 og DO-05 først (rette), deretter P9a, P9g, P9h, så P9c–P9f, og P9b etter at Anders har avgjort hvilken Workbench-design som gjelder (spørsmål 1 i Workbench-beskrivelsen).

---
Hele dokumentlista med status per fil: [`vedlegg/dokumentliste.md`](vedlegg/dokumentliste.md).

---

## Vedlegg

| Fil | Innhold |
|---|---|
| [`vedlegg/skjermkart.md`](vedlegg/skjermkart.md) | Alle ruter i PlayerHQ og AgencyOS: ekte side eller videresending, hovedkomponent, skjerm-ID, skall |
| [`vedlegg/dokumentliste.md`](vedlegg/dokumentliste.md) | Alle dokumenter med status (Gjeldende · Utgått · Gammelt · Dublett · Motstrid) og forslag til slette-PR-er |
| [`vedlegg/doedkode-filliste.txt`](vedlegg/doedkode-filliste.txt) | De 432 filene i `src/` som ingen levende kode bruker, med område og linjetall |
| [`vedlegg/doedkode-per-pr.txt`](vedlegg/doedkode-per-pr.txt) | De samme filene fordelt på slette-PR-ene P5a–P5v |
| [`vedlegg/redirect-sider.txt`](vedlegg/redirect-sider.txt) | Sidene som bare sender videre til en annen adresse |

## Status per funn

Alle funn har status «Ny», «Usikker» eller «Rettes i åpen PR #NNN (venter)» etter fase 1. Når fase 2 starter, oppdateres status etter hver PR til Rettet (PR-nummer), Venter eller Krever avgjørelse.
