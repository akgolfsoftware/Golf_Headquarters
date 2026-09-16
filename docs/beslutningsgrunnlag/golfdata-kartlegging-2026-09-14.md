# Golfdata-kartlegging — hva vi faktisk har, hvor det ligger, og om mandagsflyten virker

Dato: 2026-09-14. Lesende undersøkelse — ingen kode, database, tilgangsregler eller produksjonsoppsett er endret. Ingen import, synk eller migrasjon er startet.

## 0. Miljø og utgangspunkt (kontrollert)

- Denne økten kjører **direkte på Mac Mini** (Modell «Mac mini», Apple M4, macOS 26.6.2) — ikke på MacBook Air. Du er logget inn via SSH fra MacBook Air (Tailscale-adresse 100.115.94.1) inn til Mac Mini (100.88.144.32), og selve Claude-økten kjører på Mac Mini-siden av den forbindelsen. Det var derfor ikke nødvendig å hoppe videre med SSH — jeg står allerede der dataene og jobbene ligger.
- Prosjekt: `/Users/anderskristiansen/Developer/akgolf-hq`, i en egen arbeidskopi (`git worktree`) på grenen `claude/golf-data-inventory-c71a41`.
- Denne grenen er **identisk** med `origin/main` (0 commits foran, 0 bak) og arbeidskopien var ren (`git status`: nothing to commit) da jeg startet. Ingen andres arbeid er rørt eller overskrevet.
- For å kunne stille skrivebeskyttede spørringer måtte jeg installere avhengigheter (`npm ci`) og generere Prisma-klienten (`prisma generate`) i denne arbeidskopien — dette skriver kun til `node_modules`/generert kode, ikke til databasen. Alle databasespørringer under er `select`/telling — ingen skriving.

---

## 1. Hovedsvar (kort)

**Hvor dataene ligger:** Alt av golfdata bor i **ett** Supabase Postgres-prosjekt (`dcnxoztjtdqoidaekxry`, London) — samme database AK Golf HQ bruker i produksjon. Der finnes to atskilte deler:

- `public`-skjemaet — det AK Golf HQ (PlayerHQ/AgencyOS) faktisk leser fra via Prisma.
- `dashboard`-skjemaet — et større, råere lager driftet av et eget kodeprosjekt (`ak-golf-pipelines`), som er datagrunnlaget FØR det eventuelt kopieres inn i `public`.

**Hva vi faktisk har (kort):** 7 295 turneringer, ~401 000 turnerings-*deltakelser* og 945 932 *runder* i `public`-skjemaet (det appen viser). Ekte, tour-levert Strokes Gained (SG) finnes for 757 928 av disse rundene — alle fra DataGolf, alle proffturneringer. Norske GolfBox-runder (183 657 av dem) har score, men **aldri** SG. Det finnes **ingen** lagret kobling mellom en turnering og hvilken bane den ble spilt på (banetabellen er tom, 0 rader) — vi kan altså ikke fra databasen bekrefte at en gitt historisk turnering ble spilt på Bay Hill eller Shinnecock Hills, kun stole på generell kunnskap om hvor turneringen historisk har vært spilt.

**Det viktigste enkeltfunnet:** Det du kaller «AKG Golf Pipelines» finnes — det heter `ak-golf-pipelines`, ligger på GitHub (ikke lenger på Mac Mini), og kjører via GitHub Actions. Men **den delen som faktisk skriver DataGolf-data inn i `public`-skjemaet (det appen leser) har aldri kjørt automatisk — ikke en eneste gang.** Samtidig finnes det en tredje, helt separat mekanisme — cron-jobber **inne i selve AK Golf HQ-appen** (Vercel) — som i praksis er den som holder norske GolfBox-resultater ferske i dag, og som fungerer stort sett bra. Og en fjerde, gammel mekanisme på selve Mac Mini-en, som er **fullstendig ødelagt** siden 13.–14. september fordi mappene den peker på er slettet. Se del F for detaljer og bevis.

---

## 2. Datalagre — hvor er dataene, og hvem eier hva

| Lager | Formål | Miljø | Identitet (verifisert) | Hvem skriver | Appen leser fra? |
|---|---|---|---|---|---|
| Supabase Postgres `dcnxoztjtdqoidaekxry` (London), skjema **`public`** | AK Golf HQs egen datamodell: turneringer, spillere, deltakelser, runder | **Produksjon** | Bekreftet via `prisma/schema.prisma` + reell tilkobling og telling (se del 3) | AK Golf HQ selv (Prisma) + `ak-golf-pipelines` (kun manuelt, se del F) | **Ja — dette er kilden appen viser** |
| Samme database, skjema **`dashboard`** | Råere, bredere lager: DataGolf-runder, WAGR, college, kohort-analyser | Produksjon | Bekreftet ved direkte spørring fra samme tilkobling | `ak-golf-pipelines` (GitHub Actions) | Nei, kun indirekte via manuell kopiering til `public` |
| `~/ak-golf-data` (lokale filer på Mac Mini) | Mellomlager for Srixon Tour, Norges Cup, WAGR-eksporter m.m. hentet av gamle scraper-skript | Lokal fil, ikke database | Bekreftet — mappen finnes og brukes av `norske-turneringer-sync.sh` | Gamle Mac Mini-skript (delvis ødelagt, se del F) | Kun indirekte, via import-steget i samme skript |
| GitHub-repo `akgolfsoftware/ak-golf-pipelines` | Kildekoden for datainnhenting (Python, GitHub Actions) | Kjører i skyen (GitHub Actions), ikke på Mac Mini | Bekreftet: `git remote -v`, README | — | — |
| `src/generated/prisma/` | Generert databaseklient, ikke et datalager | — | — | — | — |

**Om lagrene er kopier eller selvstendige kilder:** `dashboard` er den brede, «rå» kilden. `public` er en **delmengde** av den, ment å bli fylt via én bestemt, manuell arbeidsflyt (`datagolf-public-sync.yml` i pipelines-repoet). De er ikke automatisk synkronisert — se del F for hvorfor det er et problem akkurat nå.

---

## 3. Hva vi faktisk har — målte tall (fra `public`-skjemaet, det appen bruker)

Alle tall under er hentet med direkte `select count(*)`-spørringer mot produksjonsdatabasen 14.09.2026, ca. kl. 13:00. Metode og eksakte spørringer står i det tekniske vedlegget (del 8).

| Mål | Tall | Kommentar |
|---|---|---|
| Turneringer (`tournaments`) | **7 295** | 7 200 «COMPLETED», 95 «UPCOMING», 0 «CANCELLED» akkurat nå |
| Turnerings-*deltakelser* (`public_player_entries`) — én rad per spiller per turnering | **400 982** | 12 941 unike spillere har minst én deltakelse |
| Spillerprofiler totalt (`public_players`) | **13 096** | Noen har profil uten registrert deltakelse (f.eks. rene DataGolf-oppføringer) |
| Runder (`public_player_rounds`) — én rad per spiller per rundedag | **945 932** | Se fordeling under |
| Spillere med DataGolf-ID | **3 574** | Kun proffer med DataGolf-kobling |
| Spillere med WAGR-ID | **64** | |
| Spillere med NGF-ID | **0** | NGF-spillere matches i dag på navn, ikke lagret ID |

### Turneringer per kilde (`sourceOrigin`)

| Kilde | Antall turneringer | Eldste dato | Nyeste dato |
|---|---|---|---|
| DATAGOLF (proff-tourer) | 3 234 | 1983-03-27 | 2026-12-03 |
| GOLFBOX (norsk, se del C) | 1 345 | 2014-01-21 | 2026-09-19 |
| WAGR (verdens amatørranking) | 544 | 2024-08-11 | 2026-08-05 |
| SENIOR | 457 | 2014-06-28 | 2026-09-13 |
| NM | 432 | 2014-07-28 | 2026-09-12 |
| NGF | 248 | 2016-04-16 | 2026-09-26 |
| NCAA (college) | 207 | 2023-08-28 | 2026-04-20 |
| MIDAM | 164 | 2014-04-26 | 2022-09-23 |
| OLYO Tour | 160 | 2025-04-26 | 2026-09-20 |
| REGIONTOUR | 132 | 2015-04-25 | 2026-09-06 |
| ØSTLANDSTOUR | 112 | 2014-05-10 | 2026-09-19 |
| SRIXON Tour | 111 | 2017-02-14 | 2026-09-26 |
| NORGESCUP | 101 | 2014-05-10 | 2026-09-12 |
| GJGT | 39 | 2026-07-28 | 2027-03-05 |
| MANUAL (håndlagt) | 8 | 2025-09-20 | 2026-08-24 |
| NARVESEN | 1 | 2017-04-22 | 2017-04-22 |

**Merk «1983-03-27» som eldste dato totalt:** dette er en DataGolf-proffturnering (historisk backfill), ikke norsk data. Historisk DataGolf-dekning i `dashboard`-skjemaet strekker seg faktisk enda lenger, med 3 622 proffturneringer fordelt på 26 tourer fra 1983 til 2026 (se del F).

### Deltakelses-status (`public_player_entries.status`)

| Status | Antall | Andel |
|---|---|---|
| FINISHED | 396 850 | 99,0 % |
| TEED_OFF | 3 253 | 0,8 % |
| WITHDREW | 446 | 0,1 % |
| CUT | 351 | 0,1 % |
| REGISTERED | 44 | <0,1 % |
| DQ | 38 | <0,1 % |

3 253 rader står fortsatt som «TEED_OFF» (pågår) — noe som normalt betyr en turnering som aldri fikk sin sluttoppdatering. Ikke undersøkt videre i denne runden, men verdt å sjekke om disse er reelt avsluttede turneringer som «sitter fast».

### Runder — fordelt på kilde, og hvor mye Strokes Gained vi faktisk har

| Kilde | Antall runder | Runder med SG | SG-andel |
|---|---|---|---|
| DATAGOLF | 757 928 | 757 928 | 100 % |
| GOLFBOX (norsk) | 183 657 | 0 | 0 % |
| WAGR | 4 215 | 0 | 0 % |
| NCAA | 92 | 0 | 0 % |
| MANUAL | 40 | 0 | 0 % |
| **Totalt** | **945 932** | **757 928** | **80,1 %** |

**Viktig detalj innenfor DataGolf-tallet:** av de 757 928 rundene med et SG-tall, har **kun 244 577** en fordeling på de fire kategoriene (utslag/innspill/rundt green/putting). De resterende ~513 000 har bare et totaltall for runden, ikke fordelingen. Det betyr: har appen «SG for en runde», er det ikke sikkert den vet HVOR spilleren vant eller tapte slagene — bare at hen gjorde det.

---

## 4. GolfBox-historikken (norske turneringer)

Alt norsk turneringsdata som kommer via GolfBox samles under kildekoden `GOLFBOX` i tabellen (Østlandstour, Srixon Tour, NM, Norgescup m.fl. har egne separate koder, se tabellen over — de kommer fra andre filkilder, ikke direkte fra GolfBox-scraperen).

| År | Antall GolfBox-turneringer |
|---|---|
| 2014 | 37 |
| 2015 | 43 |
| 2016 | 74 |
| 2017 | 63 |
| 2018 | 183 |
| 2019 | 157 |
| 2020 | 137 |
| 2021 | 131 |
| 2022 | 135 |
| 2023 | 158 |
| 2024 | 154 |
| 2025 | 32 |
| 2026 | 41 (år ikke ferdig) |

**Skal ikke leses som «komplett fra 2014».** 2025 og delvis 2026 har markant lavere tall enn 2018–2024 — dette kan bety enten (a) reell nedgang i registrerte turneringer, eller (b) at innhentingen for disse årene ikke er ferdig/oppdatert. Jeg har ikke et uavhengig tall å sammenligne mot (f.eks. NGFs egen offisielle turneringsteller), så jeg kan **ikke bekrefte om dette er full dekning**. Den nyeste GolfBox-turneringen med faktiske deltakerdata i basen er «Hakadal GK Landsdelsfinale Østlandet», spilt 2026-09-05 — det viser at innhentingen har vært aktiv nylig, men sier ikke noe om hvor komplett historikken er.

**Detaljnivå:** GolfBox-data er turneringsresultater og runder (`score`, `toPar` per rundedag), **aldri** enkeltslag/hullscore. Det finnes en `shots`-tabell i databasen, men den har bare 162 rader totalt og er tydelig fra AK Golfs eget TrackMan-baserte treningsverktøy for egne spillere — ikke fra noen turneringskilde.

**Statuser observert:** `FINISHED`, `TEED_OFF`, `WITHDREW`, `CUT`, `REGISTERED`, `DQ` — DNF/cut/diskvalifikasjon fanges altså opp som eget felt, ikke bare utelatt.

---

## 5. Strokes Gained-dekning — hva vi faktisk har med tall

- **Kategori:** off-the-tee, innspill (approach), rundt green, putting, totalt — alle fem finnes som egne felt i databasen (`sgOtt`, `sgApp`, `sgArg`, `sgPutt`, `sgTotal`).
- **Nivå:** SG er lagret **per runde** (én verdi per kategori per spiller per rundedag), aldri per hull og aldri per enkeltslag, for turneringsdata. Det finnes ingen distanse-inndeling knyttet til en enkelt runde eller turnering.
- **Hva vi HAR som er distanse-inndelt:** to små tabeller, `pga_approach_distance` (5 rader) og `pga_putt_distance` (10 rader). Disse er **ikke** SG — de er tour-gjennomsnittlig nærhet til hull (i meter) og GIR-prosent, hentet fra DataGolfs «approach skill»-endepunkt. De er dessuten **sesong-snapshot for hele touren**, ikke per spiller og ikke per turnering/bane. De oppdateres ukentlig (mandager, se del F) og overskriver forrige uke — historikk bevares ikke.
- **Antall observasjoner:** 757 928 runder har et SG-totaltall. 244 577 av disse har full kategorifordeling. 0 runder har SG fordelt på slagavstand.
- **Referansepopulasjon/metode/versjon:** ikke dokumentert i koden for de lagrede SG-tallene selv — de kommer rett fra DataGolfs API og lagres som mottatt, uten at appen regner dem om. Det finnes derimot en helt egen, klart merket **estimator** (`src/lib/stats/sg-estimator.ts`) som bruker en 7-rads tabell fra Broadie (2014) «Every Shot Counts» til å *anslå* en SG-fordeling for spillere som **ikke** har ekte SG-data — kildekoden sier selv at dette er «publiserte estimater, ikke per-spiller-eksakt». Dette brukes ikke på turneringsdataene i denne rapporten, men er verdt å vite om hvis noen senere presenterer et SG-tall for en norsk spiller — det er da sannsynligvis dette estimatet, ikke ekte SG.
- **Antall spillere med ekte SG:** 3 574 spillere har DataGolf-ID; et mindre antall av disse har faktisk SG-fylte runder i vårt utvalg (ikke separat opptalt i denne runden — kan hentes på forespørsel).

---

## 6. Bay Hill mot US Open på Shinnecock Hills — konkret svar

**Spørsmål:** har vi SG for innspill, fordelt på avstand, som kan sammenlignes mellom Bay Hill og US Open på Shinnecock Hills?

**Svar: NEI**, med to separate begrunnelser:

1. **Vi har ikke distanse-fordelt SG for noen turnering, noensinne** — verken Bay Hill eller Shinnecock. Det finnes ingen tabell eller felt i databasen som knytter en SG-verdi til et bestemt avstandsintervall for en bestemt runde eller turnering. Den eneste distanse-inndelte tabellen (`pga_approach_distance`) er en sesong-gjennomsnitt for hele touren, ikke per turnering, og måler nærhet i meter — ikke slag vunnet/tapt.
2. **Vi kan ikke fra databasen bekrefte hvilken bane en historisk turnering ble spilt på.** `Tournament`-tabellen har ikke noe bane-felt utfylt for historiske rader (kolonnen `location` er tom for alle unntatt to fremtidige 2026-turneringer, og den lenkede `courses`-tabellen i `dashboard`-skjemaet har **0 rader**, selv om selve databasestrukturen for det finnes). Jeg fant to konkrete turneringsrader som ETTER GENERELL KUNNSKAP (ikke fra databasen) sannsynligvis svarer til spørsmålet:

   - **Arnold Palmer Invitational (Bay Hill), 2018-03-18:** 116 deltakere, 385 runder, alle med SG-totaltall og full kategorifordeling.
   - **U.S. Open 2018-06-17:** 146 deltakere, 422 runder, alle med SG-totaltall og full kategorifordeling. (2018 var faktisk året US Open ble spilt på Shinnecock Hills — men dette er min bakgrunnskunnskap om golf, **ikke** en bekreftelse fra vår database, siden banenavnet ikke er lagret.)

Det betyr: **på runde-nivå** finnes det faktisk fullt sammenlignbare tall — begge turneringene har 100 % av rundene med `sgApp` (innspill, totalt for runden). En grov sammenligning av *gjennomsnittlig innspill-SG per runde* mellom disse to turneringene er derfor teknisk mulig å regne ut (jeg har ikke gjort selve utregningen her, siden den ikke svarer på det egentlige spørsmålet om avstand). Men det du konkret spurte om — SG for innspill **fordelt på avstand**, sammenlignbart mellom banene — finnes ikke i noen form, for noen turnering.

**Konklusjon: NEI.** Det som mangler er ikke en teknisk detalj vi kan fikse med et lite skript — det er en hel datatype (distanse-inndelt SG per turnering) som aldri har blitt hentet inn eller lagret, kombinert med at bane-identiteten for historiske turneringer aldri er lagret. Begge må eventuelt hentes fra DataGolfs mer detaljerte (og dyrere) API-endepunkter, hvis de finnes der i det hele tatt — det er ikke undersøkt i denne runden, siden oppdraget var å kartlegge hva VI har, ikke starte ny innhenting.

---

## 7. Mandagsoppdateringen — hvordan systemet faktisk fungerer, og om det virker

### Det jeg trodde jeg skulle finne, og det jeg faktisk fant

Du regnet med at løsningen het «AKG Golf Pipelines» på Mac Mini. Det jeg fant er mer komplisert — og det er selve funnet:

**Det finnes IKKE ett system for dette. Det finnes tre, og de gjør delvis samme jobb uavhengig av hverandre:**

#### System 1 — `ak-golf-pipelines` (GitHub, ikke Mac Mini)

Dette er det nærmeste vi kommer «AKG Golf Pipelines». Riktig navn: **`ak-golf-pipelines`**, GitHub-repo `akgolfsoftware/ak-golf-pipelines`. Flyttet ut av det gamle TalentHQ-prosjektet 26.08.2026. Kjører **ikke** på Mac Mini — den kjører i GitHub sin egen sky, styrt av GitHub Actions. Skriver til to mål: `dashboard.*` (eget ansvar) og — kun ved manuell håndkjøring — `public.*` (AK Golf HQs egne tabeller).

| Jobb | Skal kjøre | Faktisk status (siste kjøringer, kontrollert 14.09.2026) |
|---|---|---|
| DataGolf inkrementell synk → `dashboard` | Daglig 06:00 UTC | **Virker.** Lykkes hver dag siste 12 dager. |
| DataGolf ferdighetstall (skill-ratings) → `dashboard` | Søndag 04:00 UTC | Virker. |
| **DataGolf → `public`** (den som faktisk oppdaterer spillerprofiler appen viser) | Kun manuell | **Har aldri kjørt. Null kjøringer, noen gang**, ifølge GitHubs egen kjøringshistorikk. |
| Nordic League daglig synk | Daglig 04:00 UTC | **Feiler hver dag**, minst siste 12 dager i rad (03.–14.09). Samme feil hver gang: en database-operasjon («oppdater kohort-oversikter») treffer et 120-sekunders tidsavbrudd i Postgres. |
| Junior Tours (GolfBox) ukesynk | Mandag 04:00 UTC | **Har ikke lykkes en gang** i de tre kjøringene jeg kunne se historikk for (31.08, 07.09, og dagens 14.09 som fortsatt ikke var ferdig etter 59 minutter da jeg sjekket — normal kjøretid ser ut til å være 1,5–2 timer, og den ender i feil). |
| College ukentlig innhenting | Mandag 06:00 UTC | Feilet siste observerte kjøring (07.09). |
| WAGR ukentlig | Onsdag 08:00 UTC | Feilet siste to observerte kjøringer. |

**Konkret feilbevis (Nordic League, dagens kjøring kl. 09:24 UTC):**
```
FEIL (120.9s): canceling statement due to statement timeout
... REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard.mv_player_unified_timeline
##[error]Process completed with exit code 1.
```
Dette er en presis, reproduserbar feil — ikke tilfeldig — og den har gjentatt seg identisk i minst 12 dager.

#### System 2 — cron-jobber inne i AK Golf HQ-appen selv (Vercel)

Dette fant jeg ved å følge sporene bakover fra faktiske, nylige databaseendringer. AK Golf HQ har sine **egne** planlagte jobber (i `vercel.json`), som kjører inne i selve appen og skriver rett til `public`-skjemaet — helt uavhengig av både Mac Mini og GitHub-repoet over:

| Jobb | Tidsplan (UTC) | Hva den gjør |
|---|---|---|
| `/api/cron/turneringer-schedule` | Daglig 04:00 | Henter turneringskalender |
| `/api/cron/turneringer-ngf` | Daglig 04:30 | NGF-spesifikk synk |
| `/api/cron/turneringer-players` | Mandag 05:00 | Spillerkobling |
| `/api/cron/turneringer-live` | Hvert 10. minutt | Live-oppdatering av pågående turneringer |
| `/api/cron/turnering-agent` | Daglig 07:00 | Overordnet turnerings-agent |
| `/api/cron/pga-skill-ratings`, `/api/cron/pga-putt-distance`, `/api/cron/pga-approach`, `/api/cron/datagolf-tak` | Mandag 06:00–08:00, i rekkefølge | Oppdaterer de små DataGolf-sammenligningstabellene (se del 5) |

**Faktisk resultat siste 30 dager (fra appens egen kjøringslogg, `agent_runs`):**

| Jobb | OK | Feil |
|---|---|---|
| `golfbox-schedule` | 161 | 0 |
| `golfbox-link-backfill` | 161 | 0 |
| `golfbox-leaderboards` | 144 | 17 (feilmelding typisk: «33–60 GolfBox-turneringer var ufullstendige» — delvis, ikke total svikt) |
| `turnering-agent` | 29 | 0 |
| `wagr-sync` | 4 | 0 |

**Dette er, i praksis, det systemet som faktisk holder norske turneringsresultater ferske i dag.** Det kjører flere ganger daglig (ikke bare mandager), og lykkes stort sett. Den nyeste GolfBox-turneringen i basen er fra 2026-09-05, og spillerprofiler ble sist oppdatert i dag kl. 12:41 — begge tegn på at dette systemet fungerer.

#### System 3 (gammelt) — Mac Mini `launchd`-jobber, nå ødelagt

Tre gamle bakgrunnsjobber på Mac Mini (`com.akgolf.norske-turneringer` — nettopp mandagsjobben du spurte om, satt til hver mandag kl. 07:00 norsk tid — samt `com.akgolf.datagolf-public-sync` og `com.akgolf.datagolf-historical`) peker på skript i to mapper: `ak-golf-talenthq` og `ak-golf-intelligence`. **Begge disse mappene er slettet fra disken.** Siste vellykkede kjøring av mandagsjobben var 07.09.2026 (som fortsatt klarte å importere 240 turneringer/17 178 deltaker-rader — men delvis fra gamle, ikke-oppdaterte filer, siden flere av under-hentingene allerede feilet den dagen òg). **Dagens kjøring (14.09.2026 kl. 07:00) feilet umiddelbart** med:
```
FEIL: mangler venv /Users/anderskristiansen/Developer/ak-golf-talenthq/.venv/bin/python
```
Denne jobben er død og har vært det siden 13.09. Den daglige `datagolf-public-sync`-jobben på Mac Mini feilet av samme grunn samme dag.

### Direkte svar på kontrollspørsmålet

**«Er løsningen i dag riktig innstilt til automatisk å gjøre helgens tilgjengelige resultater og statistikk klare for spillere og coacher hver mandag?»**

**Delvis, og med to alvorlige, aktive feil akkurat nå.**

- **Norske turneringsresultater (GolfBox):** Ja, i praksis — men via et system (Vercel-cron i selve appen) som ikke er det du trodde var ansvarlig, og som kjører daglig, ikke bare mandager. Den formelle «mandagsjobben» du kjenner til på Mac Mini er død.
- **DataGolf/proff-statistikk til spillerprofiler:** **Nei.** Den eneste veien inn til `public`-skjemaet er en GitHub Actions-jobb som er satt til «kun manuell» og som aldri har blitt trigget. De 757 928 DataGolf-rundene som allerede ligger i basen er en historisk snapshot — de vokser ikke automatisk uke for uke i dag.
- **To andre pipelines (Nordic League, GolfBox-ukesynk i GitHub Actions) feiler konsekvent** og har gjort det i minst 12 dager, uten at noen har fått et tydelig varsel om det (feilene ligger i GitHubs kjøringslogg, ikke noe sted du naturlig ville sett dem).

---

## 8. Mangler og uverifiserte områder — prioritert

1. **[Aktiv feil, bør fikses]** Mac Mini-jobbene for `datagolf-public-sync` og `norske-turneringer` peker på slettede mapper (`ak-golf-talenthq`, `ak-golf-intelligence`). Konfigurasjonsfeil, ikke datamangel — skriptene (`~/.claude/scripts/norske-turneringer-sync.sh`, `datagolf-public-sync.sh`) må enten oppdateres til å peke på `ak-golf-pipelines`, eller de gamle `launchd`-jobbene bør deaktiveres helt siden System 2 uansett gjør jobben deres for GolfBox.
2. **[Aktiv feil, bør fikses]** GitHub Actions-jobben `nordic-league-sync.yml` feiler hver dag på et 120-sekunders database-tidsavbrudd ved oppdatering av en materialisert oversikt (`mv_player_unified_timeline` eller en av de foregående). Kodefeil/ytelsesproblem i pipelines-repoet, ikke mangel på data.
3. **[Produktvalg — bør besluttes]** `datagolf-public-sync.yml` er satt til kun manuell kjøring og har aldri kjørt. Hvis målet er «fersk DataGolf-statistikk i spillerprofiler hver mandag», må enten denne jobben automatiseres (legges på en tidsplan), eller ansvaret flyttes til System 2 (Vercel-cron i selve appen). Dette er et bevisst arkitekturvalg som må tas, ikke en bug.
4. **[Manglende datatype]** Ingen distanse-inndelt Strokes Gained finnes for noen turnering. Hvis du vil kunne svare på spørsmål som Bay Hill-mot-Shinnecock, må dette hentes fra et annet, mer detaljert DataGolf-endepunkt enn det som brukes i dag — ikke undersøkt om DataGolf faktisk tilbyr dette på ditt abonnement.
5. **[Manglende data]** Banetabellen (`dashboard.dg_courses`) er fullstendig tom (0 rader) selv om databasestrukturen for bane-kobling finnes. Vi kan ikke bekrefte hvilken bane noen historisk turnering ble spilt på fra databasen.
6. **[Ikke verifisert i denne runden]** Om GolfBox-dekningen faktisk er komplett år for år (spesielt 2025–2026, som har vesentlig færre turneringer enn 2018–2024) — jeg har ingen uavhengig kilde å sammenligne mot.
7. **[Ikke verifisert]** Om det finnes flere separate innloggede visninger i appen som leser feil/utdatert data på grunn av dette — jeg har bekreftet at databasen selv har fersk GolfBox-data (sist 05.09) og at spillerprofiler ble skrevet til i dag, men har ikke logget inn som en spiller/coach for å se den faktiske skjermen.
8. **[Sikkerhetsfunn, lav prioritet, verdt å fikse]** En offentlig markedsside (`/stats/pga/spillere`) har en hardkodet reserveliste med et oppdiktet «Viktor Hovland»-tall (dgId, SG-total 1,18 osv.) som vises hvis databasen er tom. Dette brøt eget prinsipp om «aldri fake data», funnet av underveis-agenten (se del 9). Lav risiko siden det kun vises som nødløsning, men bør rettes eller merkes tydelig som eksempeldata.

---

## 9. Teknisk vedlegg — kilder, spørringer og metode

**Miljøkontroll:** `hostname`, `system_profiler SPHardwareDataType`, `sw_vers`, `echo $SSH_CONNECTION`, `git status`/`git branch --show-current`/`git log`/`git fetch origin main && git rev-list --count`.

**Databasetilkobling:** samme mekanisme som appen selv bruker — `@prisma/adapter-pg` mot `DATABASE_URL` (pooler, port 6543) lest fra `.env.local` via `dotenv`. Ingen hemmeligheter er skrevet ut eller lagret noe sted i denne rapporten. Alle spørringer er `select`/`count`, kjørt via `npx tsx` fra et engangs-skript i arbeidskopien (fjernet etter kjøring).

Sentrale spørringer (forkortet, fullstendige varianter kan gjenskapes fra denne lista):
- `select count(*) from public_players / tournaments / public_player_entries / public_player_rounds`
- `select "sourceOrigin", count(*), min("startDate"), max("startDate") from tournaments group by 1`
- `select status, count(*) from tournaments group by 1` / `from public_player_entries group by 1`
- `select source, count(*), count("sgTotal") from public_player_rounds group by 1`
- `select count("sgOtt"), count("sgApp"), count("sgArg"), count("sgPutt"), count("sgTotal") from public_player_rounds`
- `select * from information_schema.columns where table_name in ('tournaments','public_player_rounds','pga_approach_distance','pga_putt_distance','shots')`
- `select count(*) from dashboard.dg_rounds / dg_events / dg_courses / tournament_results`
- `select "agentName", status, count(*) from agent_runs where "createdAt" > now() - interval '30 days' group by 1,2`

**GitHub Actions-historikk:** `gh auth status`, `gh run list --workflow=<navn>.yml --limit N`, `gh run view <id> --log-failed`, kjørt mot repoet `akgolfsoftware/ak-golf-pipelines` (klonet lokalt på Mac Mini, `git remote -v` bekrefter GitHub-opphav).

**Mac Mini-jobber:** `crontab -l`, `ls ~/Library/LaunchAgents/`, `launchctl print gui/$(id -u)/<jobb>`, samt direkte lesing av logg-filene under `~/.claude/logs/` og plist-filene under `~/Library/LaunchAgents/`.

**Kildekode-kartlegging** (DataGolf-klient, GolfBox-scraper, SG-estimator, skjema-modeller m.m.) ble gjort av en underordnet, skrivebeskyttet undersøkelses-agent innenfor samme økt, med eksplisitt forbud mot å kjøre noe som skriver data. Alle konkrete kodepåstander i denne rapporten (f.eks. Broadie-estimatoren, «Viktor Hovland»-reservedataen, `datagolf-sync.ts` sin egentlige rolle) er hentet derfra og kan spores til: `src/lib/datagolf/client.ts`, `src/lib/stats/sg-estimator.ts`, `src/lib/sg-hub/datagolf-sync.ts`, `src/lib/scrapers/golfbox.ts`, `prisma/schema.prisma`, `src/app/(marketing)/stats/pga/spillere/page.tsx`.

**Ikke gjort i denne runden** (ville krevd skriving eller ekstern pålogging, utenfor mandatet): innlogget test av faktisk spiller-/coach-skjerm; kjøring av selve DataGolf-detaljerte-endepunkter for å se om avstandsdata finnes der; kontakt med DataGolf om abonnementsgrenser.

---

*Lagret av Claude (lesende kartlegging), 2026-09-14. Faktisk sti: `docs/beslutningsgrunnlag/golfdata-kartlegging-2026-09-14.md` i arbeidskopien `/Users/anderskristiansen/Developer/akgolf-hq/.claude/worktrees/golf-data-inventory-c71a41`. Filen er ikke committet eller pushet — det var ikke bedt om, og oppdraget var rent lesende.*
