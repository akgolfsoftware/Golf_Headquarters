# Team Norway-demo 14.09.2026 — statusrapport (sist oppdatert kl. 15.30)

Gren: `codex/team-norway-demo-2026-09-14`, start `e565264b6`.

## Ettermiddags-kvalitetsretting (kl. 15.08–15.30) — kun testverktøy, ingen produktkode, ingen data rørt

Avgrenset oppdrag: rette tre reviewfunn i de lokale TN-demoskriptene. **Ingen restart/stopp av den kjørende reserven, ingen reseed** — reserven på `http://127.0.0.1:3011` sto oppe under hele arbeidet og svarer fortsatt HTTP 200 med det uendrede 49-slag-resultatet.

**Ny fil:** `scripts/tn-demo-lokal-privatfil.mjs` — liten delt hjelper, to funksjoner:
- `skrivPrivatFil(sti, innhold)`: avviser å skrive gjennom en symlink, og tvinger `chmod 0600` etter skriving (løser at `writeFileSync(..., {mode:0o600})` bare gjelder ved OPPRETTELSE av en fil — en allerede eksisterende fil med løsere rettigheter ble tidligere ikke strammet inn).
- `renFeilmelding(feil)`: fjerner URL-er med innebygd brukernavn:passord og JWT-lignende nøkler fra en feilmelding før den når stderr. Et grovt filter, ikke en fullstendig rensing.

**Endret (diff-oversikt):**
- `scripts/tn-demo-lokal-reise.mjs`: feilstien dumpet tidligere RÅ Next-logg (stdout+stderr) til stderr ved feil — kunne inneholde tilkoblingsdetaljer. Nå: den urensede loggen skrives til en PRIVAT lokal fil (`skrivPrivatFil`, aldri via symlink), og stderr får bare en kort, kontrollert setning + filstien, med eksplisitt advarsel om at filen IKKE er automatisk renset. Status-/credsskriving bruker nå `skrivPrivatFil`. Toppnivå-feilmeldingen går nå gjennom `renFeilmelding`.
- `scripts/tn-demo-lokal-standby.mjs`: samme `skrivPrivatFil`/`renFeilmelding`-bytte for status- og PID-filen og toppnivåfeilen.
- `scripts/tn-demo-lokal-menykontroll.mjs`: toppnivåfeilen går nå gjennom `renFeilmelding` (samme forsvar, ingen andre endringer).
- `scripts/tn-demo-lokal-seed.ts`: (a) feiltekst ved manglende `public.users` anbefalte tidligere `prisma db push` direkte — erstattet med en henvisning til prosjektets egne lokale testdatabase-oppskrifter (`docs/utvikling/lokal-testdatabase.md`, `.claude/rules/gotchas.md` §Schema-endringer); runneren anbefaler ikke lenger en automatisk skjemaendring selv. (b) Filhode presiserer nå eksplisitt: dette skriptet ROTERER testpassordet og NULLSTILLER egne fixture-resultater ved hver kjøring — standby gjør ALDRI dette. (c) Creds-skriving bruker nå `skrivPrivatFil`, toppnivåfeil går gjennom `renFeilmelding`. **Ikke kjørt** — ville rotert passordet til den allerede beviste demoen.
- **Ny test** `tests/p0/tn-demo-privatfil.test.mjs`: 6 syntetiske tester av `skrivPrivatFil`/`renFeilmelding`, kun mot egne temp-mapper med dummyverdier (`mkdtempSync`) — aldri de ekte cred-/statusfilene. **6/6 bestått** (`node --test tests/p0/tn-demo-privatfil.test.mjs`).

**Kontroller kjørt:** `npx eslint` på alle 6 endrede/nye filer — 0 feil. `npx tsc --noEmit` for hele prosjektet — 0 feil (exit 0). Ingen 5/5-reise eller 39-sidebesøk gjentatt, som instruert.

**Rester/uverifisert:** de rettede `.mjs`/`.ts`-filene er kopiert til test-arbeidskopien (`tn-demo-lokal-prove-2026-09-14`) men ikke kjørt der ennå — neste faktiske kjøring av `reise.mjs` (etter en fremtidig, bevisst reseed) vil være første gang de nye feilbanene faktisk testes mot en ekte feilsituasjon. Ingen commit/push.

## Gjeldende resultat — 5/5 bestått mot ekte kode og isolert database (kl. 11.34)

Dette er nyeste og gjeldende sannhet. Alt under «Historikk» nedenfor er tidligere, delvis feilslåtte forsøk — bevart for sporbarhet, ikke gjeldende status.

```
Running 5 tests using 1 worker
[1/5] Coach: ekte gruppecoach ser oversikt og spillerliste (1440px) — ok
[2/5] Coach: protokolldetalj + EKTE tildeling via /admin/tester/tildel (390px) — ok
[3/5] Spiller: ser EKTE coach-tildelingen og fullfører den med beregnet resultat — ok
[4/5] Coach: ser EKSAKT samme resultat i historikken, også etter gjenåpning, og spillerlisten er oppdatert — ok
[5/5] Utenforstående avvises på /team-norway og /team-norway/spillere — ok
5 passed (50.7s)
```

Kjørt i egen, miljøfil-fri test-arbeidskopi (`.worktrees/codex/tn-demo-lokal-prove-2026-09-14`, fra `e565264b6`), mot den isolerte HQ-Supabase-Docker-stacken (127.0.0.1:54421/54422), egen Next-instans på port 3011. Ekte nettleser (Playwright/Chromium), ekte `/auth/login`, ekte server-actions — ingen mocks, ingen route-intercept.

**Bevist, ikke bare kodelest:**
- En bruker med platform-rolle `COACH` + aktivt `GroupMember.role=COACH` på gruppen `team-norway` logger inn ekte, ser sin egen grupperolle og en reell spillerliste fra databasen (`/team-norway`, `/team-norway/spillere`).
- **Faktisk coach-tildeling, ikke seedet:** coachen tildeler EKTE en TN-protokoll til den syntetiske spilleren via den eksisterende `/admin/tester/tildel/[spillerId]`-skjermen. Server-loggen viser `tildelTest(...)` faktisk kjørt og en `TestAssignment`-rad faktisk skrevet.
- Spilleren logger inn separat, ser nøyaktig denne tildelingen under «Tildelt av coach» (ikke seedet), fyller ut alle 25 forsøk i putt-1–3m-protokollen med et deterministisk syntetisk tallsett, og lagrer. **Eksakt 49 slag** (beregnet uavhengig i testen med samme formel som produktkoden, ikke antatt) vises i UI etter lagring.
- Coachen ser SAMME eksakte tall («49 slag») i «Team Norway-resultater» på `/admin/spillere/[id]/tester`, også etter full sideoppfriskning (server-komponent, ny spørring). Spillerlistens testkolonne gikk fra eksakt «0» til eksakt «1».
- Spilleren kan gjenåpne sitt eget fullførte resultat via «Dine registreringer» (`?session=<id>`).
- En tredje, myndig syntetisk spiller UTEN medlemskap i `team-norway`-gruppen får «Denne siden finnes ikke» på både `/team-norway` og `/team-norway/spillere` — kjørt som en UAVHENGIG prøve (kan ikke skjules av en tidligere feilet test).

**Bekreftet, faktisk kontokrav** (ikke bare antatt fra kodelesing — se «Ekte funn» i historikken for hvordan dette ble oppdaget):
- Sportssjef/trener: platform-rolle `COACH` (eller `ADMIN`) **og** aktivt `GroupMember`-medlemskap med rolle `COACH` på gruppen med `slug = "team-norway"`. `/team-norway/*` sjekker gruppe-rolle; `/admin/tester/tildel/...` og `/admin/spillere/[id]/tester` sjekker platform-rolle — én konto må dekke begge.
- Demospiller: aktivt `GroupMember.role=PLAYER` på samme gruppe, **og** `profilType = "TALENT"` (eller et aktivt PlayerHQ-abonnement/prøveperiode/AK-administrert gruppe) — uten dette treffer `resolveTilgang` nivå INGEN (lanseringsvinduet med gratis full tilgang for alle gikk ut 1. september 2026) og spilleren omdirigeres til `/portal/oppgrader` i stedet for testføringen. Anbefalt myndig fødselsdato (18+) for å unngå samtykke-venter-flyten.

**Fortsatt IKKE verifisert eller implementert:**
- **Egen «testdag»-modell finnes fortsatt ikke, og er fortsatt ikke bygget.** Det som er bevist er at den eksisterende `TestAssignment`-tildelingen faktisk virker ende til ende — det er en ærlig, fungerende erstatning for «planlegg testdag til én spiller», men verken en testdag-til-flere-spillere-funksjon eller en egen datamodell for det. Skal ikke bygges uten egen beslutning.
- Trener-fører-testresultat-på-vegne-av-spiller er ikke lagt til (`saveTnTest` lagrer fortsatt kun på innlogget bruker selv).
- 834px (iPad) kontrollert i menylesekontrollen nedenfor (0 overflow på de 13 sidene). OS-mørk-emulering testet empirisk på oversiktssiden uten synlig endring; se «Mørk modus» nedenfor for skillet mellom det og en full temakontroll.
- Full `npm run verify`/full testsuite er ikke kjørt i denne runden (se eget avsnitt).
- **Denne lokale, syntetiske prøven er IKKE hosted demo.** Den beviser at koden og databindingen fungerer i en isolert kopi av skjemaet — den beviser ikke at den faktiske hostede databasen/kontoen Anders skal logge inn med kl. 14.00 har riktig gruppemedlemskap og `profilType`. Det kontooppsettet er koordinatorens ansvar, se kontokravene over.

Skjermbilder (390 og 1440 px, lys modus) ligger lokalt: `/tmp/ak-hq-tn-demo-playwright-results/*/0X-*.png`, 7 stk, ingen credentials i bildene.

## Kvalitetskontroll av de fem nye test-/skriptfilene (kl. 11.50)

Filene: `scripts/tn-demo-lokal-seed.ts`, `scripts/tn-demo-lokal-reise.mjs`, `scripts/tn-demo-lokal-standby.mjs`, `tests/p0/tn-demo-playwright.config.ts`, `tests/p0/team-norway-demo-innlogget.spec.ts`.

| Kontroll | Kommando | Resultat |
|---|---|---|
| Lint (scoped) | `npx eslint <de fem filene>` | 0 feil, 0 advarsler |
| Typecheck (helprosjekt, prosjektets egen `tsc`) | `npx tsc --noEmit` | Exit 0 — ingen typefeil i hele prosjektet, inkludert disse fem |
| Struktur/dokumentlenker | `npm run prosjekt:sjekk` | `OK: prosjektstruktur, delte instruksjoner og aktive npm-verktøy.` / `OK: lokale Markdown-lenker i 117 vedlikeholdte dokumenter.` |

**Ikke kjørt:** full `npm run verify` (kjører `next build` + hele test- og lint-suiten — for tungt/lenge for et deloppdrag uten kodeendring i produktet, og ingen commit er planlagt). Selve filenes funksjon er allerede bevist ved faktisk kjøring (5/5 bestått) og er en sterkere kontroll enn statisk lint/typecheck alene.

Ingen commit, push eller publisering er gjort.

## Lokal reserve til møtet (kl. 11.50)

Nytt skript `scripts/tn-demo-lokal-standby.mjs` — kjører KUN Next på port 3011 mot den samme isolerte databasen. Kaller aldri seed-skriptet, sletter/gjenoppretter ingenting. Kjørt i samme separate, miljøfil-frie test-arbeidskopi som prøvene (`.worktrees/codex/tn-demo-lokal-prove-2026-09-14`) — ingen ny Claude-økt, ingen berøring av WANG-portene (54321–54324), `.env.local` i hovedarbeidskopien er ikke lest/endret/flyttet.

**Bekreftet oppe, verifisert fra utsiden:**
```
GET / -> 200
GET /auth/login -> 200
```
URL: `http://127.0.0.1:3011`. Innloggingsopplysninger (e-post/passord for coach, spiller og utenforstående, samt spiller-ID) ligger i den lokale filen `/tmp/ak-hq-tn-demo-creds.env` (mode 600) — verdiene er ikke skrevet i denne rapporten, i noen logg eller i noen samtale, kun filbanen. Data i databasen er UENDRET fra den siste beståtte prøven kl. 11.34: den fullførte testen (49 slag) og alle kontoer/medlemskap står slik de var.

Prosessen er startet frakoblet (detached) slik at den fortsetter å svare selv om denne kommandolinjen avsluttes. PID for eventuell manuell stopp ligger i `/tmp/ak-hq-tn-demo-standby.pid`. Skriptet er idempotent — kjøres det på nytt mens reserven allerede svarer, bekrefter det bare status uten å starte en ny instans.

**Begrensning:** dette er samme isolerte, syntetiske lokale database som prøvene — ikke den hostede databasen Anders faktisk logger inn mot kl. 14.00. Reserven er en fallback for «vis at koden fungerer på denne Mac-en» hvis den hostede/koordinator-klargjorte demoen skulle svikte, ikke en erstatning for det faktiske hosted-oppsettet.

## Avgrenset lesekontroll av 13 utvalgte menypunkter (kl. 12.00–12.20, mot kjørende lokal reserve)

Kjørt med et nytt, eget skript (`scripts/tn-demo-lokal-menykontroll.mjs`, eget eierskap) mot den allerede kjørende reserven på port 3011 — **ingen reseed, ingen ny tildeling, ingen ny 5/5-kjøring**, kun lesing. Egen, ikke-interaktiv Playwright-nettleser (chromium headless), ikke Anders' Chrome-fane. Credentials lest programmatisk fra `/tmp/ak-hq-tn-demo-creds.env`, aldri printet.

Dette er **13 utvalgte menypunkter**, ikke hele TN-menyen — den fulle sidemenyen har i tillegg Gruppeposter, Dokumenter, Samtykke, Analyse, DataGolf, Trenere og tilgang og Inviter spiller. Alle syv er nå kontrollert, se eget avsnitt nedenfor.

**13 utvalgte menypunkter — faktisk kontrollert:**

| Side | Meny­lenke funnet | HTTP | Innhold/tomtilstand | Overflow 390/834/1440 | Konsoll/side/serverfeil |
|---|---|---|---|---|---|
| Oversikt | Ja | 200 | Gruppestatus-kort | 0/0/0 | Ingen |
| Fellestesting | Ja | 200 | Spillerkø | 0/0/0 | Ingen |
| Testprotokoller | Ja | 200 | Protokollbibliotek | 0/0/0 | Ingen |
| Månedsplan | Ja | 200 | Økter/perioder eller tomtilstand | 0/0/0 | Ingen |
| Samlingspunkt | Ja | 200 | Liste/tomtilstand | 0/0/0 | Ingen |
| Collegegruppen | Ja | 200 | Liste/tomtilstand | 0/0/0 | Ingen |
| Spillerutvikling (spillere) | Ja | 200 | Spillertabell | 0/0/0 | Ingen |
| Uttaksliste | Ja | 200 | Uttaksgrunnlag + tomtilstand-forklaring | 0/0/0 | Ingen |
| Rangliste | Ja | 200 | Resultattabell | 0/0/0 | Ingen |
| Skoleoversikt | Ja | 200 | Skoletabell | 0/0/0 | Ingen |
| Turneringer | Ja | 200 | Turneringstabell | 0/0/0 | Ingen |
| Referansenivåer | Ja | 200 | Tabell | 0/0/0 | Ingen |
| Trenerkatalog (apparatet) | Ja | 200 | Trenertabell | 0/0/0 | Ingen |

**Spillerpost** (`/team-norway/spiller/[id]`), fulgt via den ekte lenken fra spillerlisten for «TN Demo Spiller»: HTTP 200, viser korrekt «DENNE UTØVEREN / TN Demo Spiller / SYNLIG FOR … UTØVER · 26 ÅR» og riktig tomtilstand «Ingen poster ennå», 0 px overflow ved 390px, ingen konsollfeil. Bekreftet i et eget, målrettet oppfølgingssøk etter at en tidlig automatisk sjekk traff en ANNEN, allerede eksisterende syntetisk spiller («P0 Testspiller») fra en tidligere, urelatert testøkt i samme delte isolerte database — se avvik nedenfor. En upresis testvelger i kontrollskriptet (`.first()` over alle spillerrader) ble korrigert; ingen produktkode er endret.

**Mørk modus — to ulike ting, ikke sammenblandet:**
- **OS-emulering (faktisk testet):** `page.emulateMedia({colorScheme:'dark'})` + reload på `/team-norway` endret INGEN beregnet bakgrunnsfarge. Dette beviser at siden ikke reagerer på OS-nivå fargeskjema-preferanse — det beviser ikke at det ikke finnes NOEN mørk variant tilgjengelig via en annen mekanisme (cookie/bryter).
- **Full temakontroll (kodelest, ikke browser-testet):** `src/lib/v2/team-norway.ts` dokumenterer i kommentar at mørk er en ROLLE (hero/seksjonsskille/presentasjon), ikke et globalt lys/mørk-tema med bryter — det finnes ingen `data-v2-tema`/tilsvarende kobling for `/team-norway/*` i koden. Dette er lest i kildekoden, ikke bekreftet med en fysisk temabryter i nettleseren, fordi ingen slik bryter er funnet å finnes.
- Samlet: det er et grunnlag for å si at TN-flaten ikke har et globalt mørkt tema å demonstrere — delvis fra kode, delvis fra én empirisk OS-emuleringstest — ikke en fullstendig, uttømmende temakontroll.

## De syv gjenværende menylenkene (kl. 12.25–12.50, kun lesing, 1440px)

Full sidemeny har 20 punkter; de 13 over er «utvalgte». Alle syv er nå kontrollert, alle via reell navigasjon fra den innloggede coach-kontoen. **Ingen skriving**: ingen invitasjon sendt, ingen samtykke endret, ingen opplasting, ingen testutfordring/analyse utført, ingen eksterne nettsidebesøk.

| Menypunkt | Endelig destinasjon | Sideoverskrift | Innhold/tomtilstand | Feil |
|---|---|---|---|---|
| Gruppeposter | `/team-norway/{groupId}` (200) | «Team Norway Golf» | Gruppepost-tidslinje (TN-post-siden) | Ingen |
| Dokumenter | `/team-norway/{groupId}/dokumenter` (200) | «Delte filer» | Dokumentliste/opplastingsskjerm — ikke rørt | Ingen |
| Samtykke | `/portal/meg/innstillinger/personvern/deling` (200) | «Hvem ser dataene mine» | Riktig tomtilstand: «Ingen deler dataene dine» | Ingen |
| Analyse | `/portal/analysere` (200) | «Analyse» | Riktig tomtilstand: «Ingen data ennå. SG kommer fra runder og tester.» | Ingen |
| Trenere og tilgang | `/team-norway/tilgang` (200) | «3 personer med tilgang» | Viser eksisterende trenerliste (leserad, ingen endring gjort) | Ingen |
| Inviter spiller | `/team-norway/inviter` (200) | «Inviter spiller» | Skjema lastet, IKKE fylt ut/sendt | Ingen |
| DataGolf | `/portal/analysere/datagolf` (200) | «DataGolf» | Se eget avsnitt under — lokal databegrensning, 0 px overflow | Ingen konsoll-/side-/serverfeil |

**Retting (kl. 12.50): DataGolf er en INTERN apprute, ikke en ekstern destinasjon.** Forrige versjon av denne rapporten kalte den feilaktig «ekstern destinasjon — listet, ikke besøkt». Lest i koden (`page.tsx` for `/portal/analysere/datagolf`): siden bruker `requirePortalUser({ kreverTilgang: "TALENT" })` og henter data fra lokale kilder (`hentSpillerverktoy`, `hentUtfordringer`) — samme mønster som alle andre PlayerHQ-sider, ingen ekstern nettadresse. Den tidligere instruksen utelukket kun EKSTERNE lenker (utenfor appen), ikke interne sider med et eksternt produktnavn i menyteksten.

Faktisk besøkt nå: HTTP 200, tittel «DataGolf», 0 px horisontal overflow ved 1440px, 0 konsoll-/side-/serverfeil. **Innhold viser en lokal databegrensning, ikke en produktfeil:** siden sier «DataGolf-data kunne ikke hentes. Prøv igjen.» og «Ingen turneringer å vise — Profilen din er ikke koblet til turneringsresultatene ennå. Coachen din kobler den.» Dette er en ærlig tomtilstand/feilmelding for en syntetisk testbruker som mangler DataGolf-kobling og turneringshistorikk i den isolerte lokale databasen — **ikke** noe jeg har rettet, importert data for, eller opprettet skjema for. **Konsekvens for demoreisen: DataGolf-punktet holdes UTENFOR den planlagte 12–15-minutters demoreisen** (den var aldri en del av den bekreftede 5/5-testreisen), nettopp fordi den lokale, syntetiske databasen ikke har grunnlaget klart — dette sier ingenting om hva den hostede kontoen vil vise.

Ingen konsoll-/side-/serverfeil på noen av de syv besøkte sidene.

**Avvik oppdaget under selve kontrollen (ikke produktfeil):**
- Første kjøring av mitt eget menykontroll-skript rapporterte feilaktig at ALLE 13 menylenker «ikke fantes» — en race i skriptet (mangler `waitUntil: "networkidle"` før sjekken), ikke et reelt meny-problem. Rettet, kjørt på nytt: alle 13 bekreftet.
- Den delte isolerte databasen inneholder allerede andre syntetiske `team-norway`-medlemmer fra en tidligere, urelatert testøkt (`p0-coach`, `p0-spiller`, `p0-fremmed-coach`, `tn-signoff-spiller`) — datert 13.09. Dette er IKKE noe jeg har opprettet eller rørt (min seed leser/skriver kun egne `tn-demo-20260914-*`-brukere), men det gjorde at en naiv «første spiller i lista»-velger i kontrollskriptet traff feil rad. Ingen data er endret eller fjernet av meg.

**Ingen skrivehandling utført:** ingen invitasjon sendt, ingen slett/lagre/opprett-knapper trykket i denne kontrollen.

**Grønn navigasjon beviser ikke alle handlinger** — denne kontrollen er lesing (sidevisning, konsoll, overflow), ikke et bevis på at hver knapp/handling på disse 13 sidene faktisk gjør noe. Den ende-til-ende-bevisen for testreisen står fortsatt i «Gjeldende resultat» øverst.

## Liten skriptretting etter kontroll (kl. 12.05, ingen restart av kjørende reserve)

`scripts/tn-demo-lokal-standby.mjs` rettet på tre punkter påpekt i review:
1. «Allerede oppe»-grenen krevde tidligere bare status < 500 fra `/auth/login`, som også ville godtatt en helt annen app som svarer 404 på samme sti. Krever nå eksakt HTTP 200 (`ventPaEksakt200`), og teksten sier nå eksplisitt at port + 200 IKKE identifiserer prosesseier/arbeidskopi/database — bare at noe login-aktig svarer.
2. Samme skjerpelse på sluttbekreftelsen («Lokal reserve klar») — krever nå eksakt 200, ikke «under 500».
3. Feilmeldingen som viste til en `logFil` som aldri opprettes (stdio er `ignore`) er fjernet/rettet — feilmeldingen viser nå PID i stedet, ikke en ikke-eksisterende filsti.

Ingen restart av den kjørende serveren på 3011 er gjort for denne rettingen — den fortsetter å kjøre uendret med det beviste 49-slag-resultatet.

## Ruter og produktatferd kontrollert ved kodelesing (fortsatt gyldig, uendret av prøvene)

| Rute | Fungerer teknisk | Krav |
|---|---|---|
| `/team-norway` (TN-02 Oversikt) | Ja, bevist | `hentTnOversiktForBruker`: ADMIN ser aggregat uten medlemskap; alle andre krever aktiv `GroupMember` i gruppen med slug `team-norway`. |
| `/team-norway/spillere` | Ja, bevist | Coach-only. Viser navn, hcp, aktiv plan, antall tester, siste test — alt fra ekte `User`/`TestResult`/`TrainingPlan`. |
| `/team-norway/fellestesting` | Ja, men enkel | Spillerkø + lenke til protokollbiblioteket. Ingen «opprett testdag»-modell eller -handling finnes i koden. |
| `/team-norway/protokoller` og `/protokoller/[id]` | Ja, bevist | Coach-only. Leser fra `TN_CATALOG`, lenker til `/portal/tren/tester/team-norway?test=…`. |
| `/team-norway/spiller/[spillerId]` | Ja | Spillerpost/tidslinje (TN-10), ikke full testprofil. Full testhistorikk ligger i AgencyOS. |
| `/team-norway/rangliste`, `/skoler`, `/samlinger`, `/manedsplan`, `/turneringer`, `/referansenivaer`, `/apparatet`, `/uttak` | Ja (kodelest, ikke browser-kjørt) | Leser eksisterende data med `Ukjent`/tomtilstand der data mangler. |
| `/team-norway/inviter` | Ja (kodelest) | Kun `kanAdministrere`. Bruker eksisterende invitasjons-/e-postflyt. |

---

# Historikk (eldre, delvis feilslåtte forsøk — bevart for sporbarhet, ikke gjeldende status)

## 10.55 — opprinnelig kodelesing

Konklusjon den gang: hele reisen finnes i kode, ingen ny modell nødvendig, kontooppsett gjenstod. Dette var kodelesing, ikke bevis — bekreftet/nyansert av prøvene under.

**Avvik i denne økten (10.5x):** et forsøk på å lese `.env.local`/koble til hostet database ble stoppet av koordinator før det kjørte. Ingen hemmelige verdier eller ekte data kom ut. Ingen videre hosted-tilgang i denne økten.

## 11.05–11.16 — første forsøk på lokal prøve, avbrutt

Terminalen hang over 12 minutter på `mv .env.local .env.local.tn-demo-parkert` og ble avbrutt av koordinator. **Denne kommandoen er ikke gjentatt** — `.env.local`/symlinken i hovedarbeidskopien er urørt fra og med kl. 11.20 og resten av økten.

## 11.16 — korrigering av overstatte påstander

Koordinator påpekte at forrige rapportversjon var for bastant: «62/62 grønt» (mockede enhetstester) ble feilaktig fremstilt som bevis på ende-til-ende-funksjon, og `TestAssignment` ble feilaktig kalt «testdag». Begge rettet — se gjeldende resultat øverst for korrekt formulering.

## 11.24–11.34 — fire iterasjoner i egen test-arbeidskopi, hver rettet konkret funn

Etter koordinatorkontroll (kl. 11.15) ble to kvalitetsproblemer rettet i test-koden: seed skulle IKKE opprette `TestAssignment` direkte (coachen skulle gjøre det via appen), og gruppe-upsert kunne skrive over en eksisterende `team-norway`-rad. Rettet: seed oppretter nå kun brukere + gruppe + medlemskap; selve tildelingen skjer i spec-en via den ekte `/admin/tester/tildel/[spillerId]`-skjermen; gruppe-upsert bruker `update: {}`.

Deretter, i selve kjøringene:
1. **Kl. 11.31, ekte funn (ikke testfeil):** en fersk syntetisk spiller med `profilType: STANDARD` ble omdirigert til `/portal/oppgrader` — lanseringsvinduet med gratis full tilgang for alle gikk ut 1. september 2026, og uten `profilType: TALENT`/abonnement/gruppe treffer `resolveTilgang` nivå INGEN. Rettet i seeden.
2. **Kl. 11.40, to spec-feil (ikke produktfeil):** (a) protokollnavnet forekommer to steder på testsiden («Tildelt av coach» og den alltid synlige «Testvarianter»-katalogen), som ga en strict-mode-kollisjon i lenkevalget — rettet ved å skope til riktig liste. (b) Skjemaets ytre `<fieldset>` matchet `hasText`-filteret for alle 25 forsøk samtidig — rettet med en mer presis CSS-selektor.
3. Et tredje funn (spec-feil): et forsøk på å bevise «gjenåpning» med `page.reload()` på `?test=`-URL-en feilet fordi denne URL-en (uten `?session=`) alltid starter en FERSK, tom økt med vilje i produktkoden — ikke en lagringsfeil. Rettet til å bruke «Dine registreringer»-lenken (`?session=<id>`), som er den faktiske gjenåpningsveien i appen.

Femte og siste kjøring (kl. 11.34): alle 5 bestått — se gjeldende resultat øverst.

## Tidligere, mockede enhetstester (ikke ende-til-ende-bevis, men fortsatt gyldig som logikkontroll)

```
npx tsx --conditions=react-server --experimental-test-module-mocks --test \
  src/lib/portal-tester/tn-j05-reise.test.ts \
  src/lib/portal-tester/tn-persistence.test.ts \
  src/lib/portal-tester/tn-scoring.test.ts \
  src/lib/portal-tester/tn-historikk.test.ts \
  src/lib/portal-tester/tn-integration.test.ts \
  src/lib/domain/tn-oversikt.test.ts \
  src/lib/domain/tn-tilgang-mutations.test.ts \
  src/lib/team-norway/tn-reise.test.ts \
  src/app/team-norway/tn-post-actions.test.ts
```
Resultat: 62/62 grønt. Mocket Prisma/auth — beviser intern logikk-konsistens, ikke ende-til-ende-funksjon mot ekte database (det gjør prøven i gjeldende resultat).

Ikke kjørt: `tests/integration/launch-database.test.ts` (krever egen lokal launch-testdatabase på port 54379, egen oppskrift, ikke denne stacken — irrelevant for TN-reisen).
