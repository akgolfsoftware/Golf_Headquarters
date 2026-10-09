# Plan — live-økta skal lagre det som skjer

> **Status:** UTKAST. Fase A inneholder bare denne planen. Ingen kode, migrering,
> produksjonsdata eller produksjonsmiljø er endret. Fase B starter først etter at Anders har
> skrevet `OK` i utkast-PR-en. Et slikt `OK` er ikke i seg selv godkjenning av en
> databasemigrering; det krever et eget, uttrykkelig skriftlig ja.

## Felles premiss

- `WorkbenchSession` er den bestemte økttabellen. Nye live-data skal ikke få en tredje
  øktmodell, og ny funksjon skal ikke skrives til `TrainingSessionV2`.
- Den valgte brukerreisen følger **AK Golf Precision Athletics 2.32.0** fra oppdraget.
  Live-skjermen har én hovedtid og en mindre økttid merket **ØKTA**. Meldinger fra coach er
  en del av skjermen, ikke et modalvindu, og stopper ikke klokka.
- Synlige ord, statuser, enheter og avstandsbånd følger `docs/treningsplanlegging.md`.
- Første mål er å bevare data. Analyse og opprydding kommer etter at selve registreringen er
  trygg.

## 1. Lagring i live-økta for `WorkbenchSession`

### Det som skal lagres

Hver øvelse i en pågående Workbench-økt får ett samlet faktisk resultat:

| Data | Hva som lagres |
|---|---|
| Reps | Absolutt antall reps, slik at et nytt forsøk på å sende samme tall aldri dobler antallet |
| Tid | Faktisk tid på øvelsen i sekunder, samt samlet økttid |
| Område | Områdekoden fra øvelsens AK-formel; putteavstand beholdes som eget avstandsbånd når den finnes |
| Sted | Faktisk treningsmiljø: range/treningsområde, bane, inne/simulator eller turnering, pluss mer detaljert sted når det finnes |
| Kommentar | Én spillerkommentar med opprettet- og sist endret-klokkeslett |
| Video | Én aktiv video med opptakstidspunkt og opplastingsstatus |
| Teknisk oppgave | `positionTaskId` beholdes når øvelsen er koblet til en `PositionTask` |

Planlagt område, sted og putteavstand brukes som forslag. Spilleren skal kunne rette faktisk
sted dersom treningen skjer et annet sted. Det faktiske valget fryses sammen med loggen, slik
at en senere planendring ikke omskriver historikken. Manglende avstand blir `ukjent`; appen
skal aldri gjette et avstandsbånd.

### Første lagringssted

Første bygge-PR bruker det eksisterende `WorkbenchSession.liveSnapshot`, et strukturert
livefelt på den bestemte økten. Feltet utvides til en validert versjon 2 med:

- øktens start, samlede tid og siste bekreftede revisjon;
- én rad per `WorkbenchDrill` med reps, faktisk tid og kontekst;
- én kommentar per øvelse med klokkeslett;
- valgfri referanse til én `PlayerSwingVideo` når videodelen bygges;
- `positionTaskId` når øvelsen kommer fra en teknisk oppgave.

Dette krever ingen databasemigrering for første PR. JSON-feltet skal valideres med Zod, altså
en fast kontroll av form og verdier, både ved lesing og skriving. Ukjent eller ødelagt innhold
skal avvises og beholdes urørt, ikke tvinges inn i en antatt form.

`SessionBallLog` beholdes for dagens frie ball-/kølleteller, men blir ikke fasit for reps per
øvelse. Modellen skiller på kølle, ikke på `WorkbenchDrill`, og mangler sted og putteavstand.

### Dårlig nett uten datatap

Den eksisterende offline-køen for den eldre live-flyten gjenbrukes som mønster og tilpasses
`WorkbenchSession`:

1. Hvert trykk og hver kommentar lagres først i nettleserens lokale database, avgrenset til
   innlogget spiller og konkret økt.
2. Skjermen viser endringen først når den lokale lagringen har lyktes. Hvis nettleseren nekter
   lokal lagring, vises en tydelig feil; appen skal aldri late som data er lagret.
3. Køen sender absolutte tall, en unik operasjons-ID og revisjon til serveren. Samme sending kan
   derfor gjentas etter tapt svar uten å telle dobbelt.
4. Serveren kontrollerer innlogging, eierskap, øktstatus og øvelsestilhørighet før én samlet
   databaseoppdatering.
5. Lokal kø slettes først etter at serveren har returnert den revisjonen som faktisk ligger i
   databasen.
6. Uferdige sendinger prøves igjen ved ny nettforbindelse, når appen får fokus og ved neste
   oppstart. Angre lagres på samme måte som andre endringer.

For video lagres selve filen som en lokal, ventende opplastingsjobb før opplasting forsøkes.
En fil som er for stor for enhetens lokale lagring blir ikke markert som lagret; spilleren får
beskjed før siden kan forlates uten et uttrykkelig valg. Etter vellykket opplasting beholdes
bare filstien og databasekvitteringen lokalt.

### Øvelser koblet til `PositionTask`

`WorkbenchDrill.positionTaskId` finnes allerede. Anbefalt løsning er én sannhet, ikke to
uavhengige tellinger:

- Reps, kommentar og video lagres på Workbench-økten.
- Den tekniske oppgaven leser de samme dataene via `positionTaskId` og viser økt, øvelse og
  klokkeslett i oppgavehistorikken.
- Dermed kan retting og angre aldri gjøre `WorkbenchSession` og `PositionTask` uenige.

Hvis oppgavehistorikken må ha en fysisk kopi i `PositionTaskLog`, kreves de foreslåtte feltene
i punkt 3 og en egen migreringsgodkjenning. Dagens `sessionV2Id` skal ikke misbrukes til en
Workbench-økt.

### Avgrensning for første bygge-PR

Den første PR-en bygger bare reps, faktisk øvelsestid, faktisk kontekst og én kommentar i
`PH05LiveAktiv`, med offline-kø og databaseprøver. Video og coachmeldinger kommer i senere
PR-er. Hardkodet starttid og demoøvelser skal ikke brukes når en gyldig Workbench-økt er
lastet; manglende ekte data skal gi en ærlig feiltilstand.

## 2. Melding fra coach inn i økta

### Enkleste løsning uten sanntid

Den eksisterende `CoachingSession` brukes som én kanonisk meldingstråd:

- én rad med `kind = "LIVE"`, `liveSessionId = WorkbenchSession.id` og
  `liveSessionKind = "workbench"`;
- samme melding leses både øverst i live-økta og i spillerens meldingstråd, slik at teksten
  ikke kopieres til to steder som kan bli uenige;
- hver melding får en stabil meldings-ID, avsender og klokkeslett inne i det validerte
  meldingsinnholdet;
- `sendLiveMelding` skal ikke lenger skrive nye meldinger til
  `TrainingSessionV2.completedSummary`.

Spillerens synlige live-side spør serveren etter nye meldinger **hvert 5. sekund** mens siden
er synlig og har nett. Den spør også umiddelbart når nett kommer tilbake eller appen får fokus.
Spørringen pauses når siden er skjult. Dette er enkel polling, altså regelmessige oppslag, og
krever verken Supabase Realtime eller websocket. Live-klokkene går lokalt videre selv om et
oppslag feiler.

Når coach sender, opprettes også et vanlig appvarsel gjennom den eksisterende varslingsflyten.
Web Push brukes som beste forsøk der spilleren har tillatt det, men femsekundersoppdateringen er
det som garanterer at meldingen vises i den åpne live-økta.

### Rekkefølge

1. **Tekst:** ikke-modal `CoachMessage` øverst i live-økta og samme innhold i LIVE-tråden.
2. **Bilde:** privat `MessageAttachment`, med kortvarig signert leselenke.
3. **Video:** privat, direkte opplasting med filkontroll og samme samtykkeport som annen
   spillermedia.
4. **Talemelding:** privat lydvedlegg med varighet; ingen automatisk transkripsjon i denne
   leveransen.

Vedlegg får servergenerert filsti, størrelsesgrense, kontroll av faktisk filtype og eierkontroll
ved hver lesing. Bilder normaliseres og metadata, blant annet GPS, fjernes. Video og lyd
leveres fra privat lager med kortvarige lenker. Mislykket vedlegg gjør ikke at den tilhørende
tekstmeldingen forsvinner.

Coachens serverhandling må kontrollere at coachen har tilgang til spilleren og den konkrete
økten. LiveBoard og meldinger gir ingen ny tilgang til spillere utenfor coachens egne grupper
eller spillerens uttrykkelige deling.

## 3. Modeller og felt

### Det som finnes og kan brukes

| Modell | Kan brukes til | Det som mangler i dag |
|---|---|---|
| `WorkbenchSession` | Kanonisk økt, status, miljø, sted, faktisk tid og `liveSnapshot` | Validert liveformat med reps, øvelsestid, kommentar, video-ID og faktisk kontekst |
| `WorkbenchDrill` | Den konkrete øvelsen, AK-formel, dose, rekkefølge og `positionTaskId` | Egne normaliserte resultatfelt; ikke nødvendig i første PR når `liveSnapshot` brukes |
| `TrainingSessionV2` | Historisk kilde ved kontrollert overgang | Skal ikke motta nye Workbench-live-data |
| `TrainingDrillV2` | Historiske øvelser med område og faktisk tid | Er bundet til feil økttabell for ny live-flyt |
| `DrillLogV2` | Historiske reptall for `TrainingDrillV2` | Sted, faktisk område og putteavstand; kan ikke bindes trygt til `WorkbenchDrill` |
| `SessionDrillNote` | Historiske tekst-/videonotater på `SessionDrillInstance` | Ingen kobling til `WorkbenchSession` eller `WorkbenchDrill` |
| `PlayerSwingVideo` | Spiller, privat filsti, samtykkeflagg, økt-ID, øvelse-ID og status | Workbench er ikke tillatt i dagens API; ingen databasegaranti for maks én aktiv video per øvelse |
| `PositionTask` | Teknisk oppgave som en Workbench-øvelse allerede kan peke til | Ingen direkte Prisma-relasjon til `WorkbenchDrill`; oppslag skjer via ID |
| `PositionTaskLog` | Historisk rep-logg på teknisk oppgave | Har bare `sessionV2Id`; mangler Workbench-økt, Workbench-øvelse og idempotensnøkkel |
| `CoachingSession` | LIVE-tråd, spiller, coach, øktbinding og meldinger | Dagens kommentar og validering kjenner bare eldre økttyper; Innboks må også lese LIVE-tråder |
| `MessageAttachment` | Privat vedlegg knyttet til en `CoachingSession` | Mangler meldings-ID, medietype og varighet for lyd/video |
| `SessionBallLog` | Eksisterende ball-/kølletelling for en økt | Ikke øvelsesspesifikk og mangler sted/putteavstand |

### Forslag som kan kreve migrering senere

Disse er forslag, ikke godkjente endringer:

1. `PositionTaskLog`: valgfrie `workbenchSessionId`, `workbenchDrillId` og en unik
   `sourceMutationId` dersom en fysisk oppgavekopi blir et krav.
2. `PlayerSwingVideo`: eksplisitte Workbench-ID-er og en regel som sikrer én aktiv video per
   spiller, økt og øvelse. Før dette kan eksisterende strengfelt brukes med
   `liveSessionKind = "workbench"` og applikasjonskontroll.
3. `MessageAttachment`: `messageId`, `mediaKind` og `durationMs` for å binde vedlegget til
   riktig melding og vise lyd/video korrekt.
4. En normalisert `WorkbenchDrillResult` vurderes bare dersom målinger viser at analyse av
   validerte `liveSnapshot`-data er for treg eller for vanskelig å kontrollere. Det skal ikke
   opprettes en ekstra tabell av vane.

Alle eventuelle endringer skal være additive, prøves mot separat lokal database med syntetiske
data og ha et eget skriftlig ja før migrering. Ingen migrering er del av fase A.

## 4. Én økttabell

Målet er at både gjennomføring, LiveBoard og TrainingAnalysis bruker `WorkbenchSession`, uten
å slette historiske data.

### Ny flyt

1. `PH05LiveAktiv` laster en autorisert `WorkbenchSession` og dens `WorkbenchDrill`-rader.
2. Den samme økten mottar live-revisjoner, status, faktisk tid og sluttresultat.
3. LiveBoard leser bare spiller-synlige Workbench-økter:
   - `IN_PROGRESS` → **N spillere trener nå**;
   - spiller-synlig `SCHEDULED`/`PUBLISHED` i dag → **Ikke startet**;
   - `COMPLETED` i dag → **Gjennomført**.
4. Coach ser bare egne aktive grupper og spillere som har delt det avtalte omfanget. En
   administratorrolle skal ikke brukes som snarvei rundt D-04-regelen.
5. TrainingAnalysis leser fullførte Workbench-økter og validerte live-resultater.

### Analyse som blir mulig

| Analyse | Beregning |
|---|---|
| Tid per område × sted | Summer faktisk øvelsestid etter område og faktisk miljø: range/treningsområde, bane, inne/simulator og turnering |
| Banespill mot golfslag | Vis faktisk tid på bane og antall registrerte slag med ball ved siden av hverandre; ikke lag en prosent av ulike enheter |
| Putting per avstand | Summer reps etter de eksakte putteavstandsbåndene i språk-masteren; ukjent avstand vises separat |

Data Golf-tall holdes utenfor denne grunnregistreringen og vises fortsatt bare for rollen
analytiker, i tråd med D-19.

### Historiske `TrainingSessionV2` uten datatap

Overgangen gjøres i egne, kontrollerbare trinn:

1. Lag en lesende rapport mot en sikker kopi som teller gamle økter, øvelser, reptall,
   øvelsestid, notater, videoer og tekniske oppgavelogger. Produksjonsdatabasen røres ikke.
2. Match eksisterende par gjennom `generertFra`/`generertFraId` og kjente kilde-ID-er. Hver
   gammel rad får enten én dokumentert Workbench-motpart eller status **ikke matchet**.
3. Foreslå en idempotent tilbakefylling, altså en prosess som trygt kan kjøres flere ganger,
   for historiske rader som mangler Workbench-motpart. Gammel ID beholdes som sporbar kilde.
4. Sammenlign antall økter, samlet tid og samlet reps før og etter på spiller- og øvelsesnivå.
   Avvik stopper overgangen.
5. Bytt LiveBoard og TrainingAnalysis til Workbench først når sammenligningen er lik og
   tilgangstestene er grønne.
6. Behold `TrainingSessionV2`, `TrainingDrillV2`, `DrillLogV2` og `SessionDrillNote` som
   skrivebeskyttet historikk og tilbakerullingsmulighet. Sletting vurderes i en senere, egen
   beslutning og er ikke del av denne planen.

## 5. Foreldreløse skjermer og filer som kan fjernes senere

Ingen av disse slettes nå.

| Kandidat | Verifisert status | Senere handling |
|---|---|---|
| `src/components/portal/live/LiveActive.tsx` | Ikke montert i dagens produksjonsrute; brukes av visuell prøve | Flytt nyttig offline-/loggerlogikk først, erstatt prøven og fjern deretter |
| `src/components/portal/live/use-live-session.ts` | Tilhører den eldre `TrainingSessionV2`-flyten | Port kø- og revisjonsmønsteret til Workbench før mulig fjerning |
| `src/components/portal/live/DrillLogger.tsx` og `FysDrillLogger.tsx` | Brukes gjennom den eldre `LiveActive` | Sammenlign funksjonsdekning mot ny PH-05 før mulig fjerning |
| `src/app/portal/(fullscreen)/live/[sessionId]/tapper/tapper-shell.tsx` | Har ingen produksjonskaller; dagens tapper-side bruker `PH06Slagteller` | Behold til PH-06-funksjoner er kontrollert, fjern i egen oppryddings-PR |
| `src/components/portal/live/LiveCoachPanel.tsx` | Kalles bare av den eldre live-/tapperkjeden og visuell prøve | Erstatt med `CoachMessage` og fjern etter meldingsmigrering |
| `src/app/portal/(fullscreen)/live/[sessionId]/actions.ts` | Skriver til `DrillLogV2`/`PositionTaskLog` for eldre økttype | Behold gjennom historisk overgang; fjern når ingen produksjonsrute skriver V2 |
| `src/app/api/portal/swing-video/upload/route.ts` | Har ingen kaller i grensesnittet og kjenner ikke Workbench | Koble til etter sikkerhetsherding, eller fjern hvis en ny avgrenset rute erstatter den |
| `sendLiveMelding` i `src/lib/agencyos/live-okt-actions.ts` | Skriver i gammelt `completedSummary`, som spilleren ikke leser | Erstatt med LIVE-tråd; migrer/bevar historikk før fjerning |
| Demo-reserven i `src/lib/portal-live/load-ph04-07.ts` | Gir demoøvelser og hardkodet tid når ekte økt mangler | Behold bare i eksplisitte visuelle prøver, aldri i en ekte live-økt |

Offline-køen og synk-oppstarten er ikke oppryddingskandidater; de er verdifullt, eksisterende
grunnlag som skal gjenbrukes.

## 6. Tester som beviser lagring

Alle databaseprøver kjøres mot en separat lokal testdatabase med demospilleren **Tobias
Lindvik**. Ingen ekte navn, produksjonsdata, e-post, betaling eller eksterne utsendinger brukes.

| Test | Bevis |
|---|---|
| Rep lagres | Start en Workbench-økt, registrer én rep, les økten på nytt med en separat databaseforespørsel og bekreft riktig øvelse, antall, område, sted, avstand og revisjon |
| Kommentar lagres | Skriv én kommentar, last siden/klienten på nytt og les samme tekst og klokkeslett direkte fra databasen |
| Video lagres | Last opp en syntetisk videofil, bekreft privat fil i testlageret og en `PlayerSwingVideo` med riktig spiller-, Workbench-økt- og øvelse-ID |
| Samme sending to ganger | Send identisk operasjons-ID to ganger og bekreft at rep fortsatt er 1 og at det bare finnes én kommentar/video |
| Tapt serversvar | La databasen lagre, skjul svaret for klienten og prøv igjen; bekreft ingen duplikat |
| Offline og omstart | Registrer rep og kommentar uten nett, last appen på nytt, koble til og bekreft samme resultat i databasen før lokal kø tømmes |
| Angre | Registrer og angre offline; databasen skal ende med det absolutte sluttallet, ikke summen av forsøkene |
| To faner | Samtidige revisjoner skal flettes eller avvises synlig; en eldre revisjon får ikke overskrive en nyere |
| Tilgang | En annen spiller eller uvedkommende coach får verken lese eller endre økten, notatet eller mediet |
| Teknisk oppgave | En øvelse med `positionTaskId` vises én gang i oppgavehistorikken med samme reps, kommentar og video |
| Samtykke | Video/bilde av spiller avvises uten gyldig samtykke; spiller under 16 krever foresatt |
| Analyse | Fullført økt gir riktig tid per område/sted og riktig puttingbånd; ukjent data forblir ukjent |

Prøvene skal kontrollere databasen etter handlingen, ikke bare stole på en grønn melding i
grensesnittet. Nye persondatafelter må samtidig legges til i datakart, innsyn og sletting.
Storage-filen må slettes sammen med databaseoppføringen i test av sletting.

## 7. Oppdeling i små PR-er

Rekkefølgen under holder hver endring forståelig og mulig å rulle tilbake:

1. **Reps og kommentar i live-økta:** Workbench-loader, faktisk tid/kontekst,
   `liveSnapshot` v2, offline-kø, synlig lagringsstatus og direkte databaseprøver.
2. **Video per øvelse:** én privat `PlayerSwingVideo`, lokal ventekø, samtykke,
   filkontroll, innsyn og sletting.
3. **Coachmelding — tekst:** LIVE-tråd, `CoachMessage`, femsekundersoppdatering, Innboks og
   varsel.
4. **Coachmelding — bilde:** privat `MessageAttachment` knyttet til stabil meldings-ID.
5. **Coachmelding — video:** privat video, opplastingsgrenser og samtykke.
6. **Coachmelding — talemelding:** privat lyd, varighet og avspillingsstatus.
7. **LiveBoard på Workbench:** egne grupper/delt omfang, de tre avtalte statusvisningene og
   ingen global administratorliste.
8. **TrainingAnalysis på Workbench:** tid per område × sted, bane mot golfslag og putting per
   avstandsbånd.
9. **Historisk overgang:** lesende sammenligning, eventuell godkjent tilbakefylling og stopp av
   nye V2-skrivinger. En databaseendring får egen skriftlig godkjenning først.
10. **Opprydding:** fjern kun filer som etter overgangen er bevist uten produksjonskall og ikke
    lenger trengs av prøver.

Før hver bygge-PR kjøres minst:

- `npm run lint`
- `npx tsc --noEmit`
- `npm test`
- målrettede database-/nettleserprøver for den delen som er endret
- `npm run prosjekt:sjekk` når dokumenter eller prosjektstruktur er berørt

Resultatene skrives ordrett i PR-beskrivelsen. Codex pusher aldri til `main` og slår aldri
sammen en PR.

## Det som fortsatt er usikkert

1. **D-04-kilden:** Jeg finner ikke et entydig felt eller en kanonisk funksjon som sier at en
   spiller har delt live-status med en coach utenfor coachens egne aktive grupper. Denne
   kilden må pekes ut eller bestemmes før LiveBoard-PR-en.
2. **`PositionTask`-historikk:** Anbefalingen er at oppgaven leser den kanoniske
   Workbench-loggen. Hvis «lagres også på oppgaven» betyr en egen fysisk `PositionTaskLog`-rad,
   trengs feltene og migreringsgodkjenningen i punkt 3.
3. **Banespill mot golfslag:** Min anbefaling er å vise banetid og antall slag ved siden av
   hverandre. Hvis det skal beregnes ett forholdstall, må enheten og definisjonen bestemmes
   først.
4. **Mediesamtykke og levetid:** `PlayerSwingVideo.consentVerified` og foresattporten finnes,
   men jeg finner ikke et versjonert, uttrykkelig samtykke for bilde/video av spiller eller en
   vedtatt lagringstid og filgrense for øvelsesvideo og talemelding.
5. **Historisk mengde:** Faktisk antall og kvalitet på gamle `TrainingSessionV2`-rader er ikke
   kontrollert, fordi oppdraget forbyr tilgang til produksjonsdatabasen. Overgangsrapporten må
   kjøres mot en godkjent, sikker kopi eller et anonymisert uttrekk i en senere fase.
