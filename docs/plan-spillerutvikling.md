# Hovedplan — alt som gjenstår for spillerutvikling

> **Status:** UTKAST. Dette er bare fase A. Ingen kode, migrering, produksjonsdata eller
> produksjonsmiljø er endret. Fase B starter først når Anders har skrevet `OK` for den
> aktuelle leveringen i utkast-PR-en. Hver databasemigrering krever i tillegg et eget,
> uttrykkelig skriftlig ja fra Anders.

Den tidligere planen [live-økta skal lagre det som skjer](plan-live-lagring.md) er
detaljgrunnlaget for levering 1. Denne hovedplanen erstatter ikke sikkerhetsportene der, men
samler hele spillerutviklingsløpet og bestemmer rekkefølgen videre.

## Felles mål og regler

- `WorkbenchSession` er den bestemte økttabellen. Nye funksjoner skal ikke opprette en tredje
  økttabell eller skrive nye live-data til `TrainingSessionV2`.
- Hver levering deles i små PR-er som kan godkjennes og rulles tilbake alene. Ingen PR merges
  av Codex.
- Spillerens egne registreringer lagres lokalt før de sendes. Skjermen skal aldri vise
  «lagret» før lokal lagring eller databasen faktisk har bekreftet det.
- Tilgang følger D-04: coach, WANG og Team Norway ser bare egne grupper og navngitte spillere
  med gyldig deling. For spiller under 16 år må foresatt ha godkjent delingen.
- Bilde og video krever samtykke. Filer lagres privat, og lesing krever ny tilgangskontroll.
- Data Golf-tall vises bare for analytiker etter D-19. Denne planen utvider ikke
  tilgangsmodellen.
- Score er alltid brutto. Klasser som begynner på «N», holdes utenfor beregningene.
- Tall bruker desimalkomma og ekte minustegn `−`. Manglende verdi er `—`; en ekte null er `0`.
  Putteavstand vises i fot.
- Alle databaseprøver bruker en separat lokal testdatabase og den syntetiske spilleren
  **Tobias Lindvik**. Produksjonsdatabasen brukes aldri til testing.

## 1. Live-økta lagrer

### Hva som endres for spilleren

`PH05LiveAktiv` blir en faktisk arbeidsflate, ikke bare en skjerm som teller lokalt:

- Spilleren registrerer reps og faktisk tid per øvelse.
- Område, faktisk sted og putteavstand følger registreringen. Planverdien er et forslag, men
  historikken fryser det som faktisk skjedde.
- **ExerciseNotes** gir én kommentar og én video per øvelse, begge med klokkeslett. Knappene er
  sekundære, slik at selve øvelsen fortsatt er hovedhandlingen.
- Når øvelsen er koblet til en `PositionTask`, vises de samme repsene, kommentaren og videoen i
  oppgavehistorikken. Det skal ikke finnes to uavhengige sannheter som kan bli ulike.
- **LiveClock** viser én hovedtid for aktiv øvelse og samlet økttid som mindre tid med etiketten
  **ØKTA**.
- Manglende ekte øktdata gir en ærlig tom- eller feiltilstand. `DEFAULT_DRILLS` og den
  hardkodede starttiden `1452` fjernes fra den virkelige live-flyten.

Ved dårlig nett lagres hvert trykk og hver kommentar først i nettleserens lokale database.
Hver endring får en unik ID og sendes som et absolutt sluttall. Samme sending kan derfor
gjentas uten å telle dobbelt. Den lokale køen slettes først når databasen har bekreftet riktig
revisjon. Video beholdes som en lokal, ventende opplastingsjobb til privat fil og databasereferanse
er bekreftet.

### Berørte filer og modeller

- Skjerm og lasting: `src/components/portal/precision/PH05LiveAktiv.tsx`,
  `src/lib/portal-live/load-ph04-07.ts` og
  `src/app/portal/(fullscreen)/live/[sessionId]/active/page.tsx`.
- Ny felles klokke og notatflate under `src/components/portal/live/`.
- Lagring og nettfeil: `src/lib/workbench/wb-session-life-actions.ts` og mønstrene under
  `src/lib/offline-queue/`.
- Video: `src/app/api/portal/swing-video/upload/route.ts` og dagens private filflyt.
- Modeller: `WorkbenchSession`, `WorkbenchDrill`, `PlayerSwingVideo`, `PositionTask` og
  eventuelt `PositionTaskLog`.

### Forslag til felt eller migrering

Første PR trenger ingen migrering. `WorkbenchSession.liveSnapshot` får et validert format med
versjon 2: øktens tider og revisjon, samt reps, tid, faktisk område/sted/avstand, kommentar,
video-ID og `positionTaskId` per `WorkbenchDrill`.

Bare dersom oppgavehistorikken må ha en fysisk kopi, foreslås valgfrie
`workbenchSessionId`, `workbenchDrillId` og unik `sourceMutationId` på `PositionTaskLog`.
For streng databasegaranti rundt video kan eksplisitte Workbench-ID-er og «én aktiv video per
øvelse» foreslås på `PlayerSwingVideo`. Begge deler krever en egen migreringsgodkjenning.

### Små PR-er

1. Reps, øvelsestid, faktisk kontekst, én kommentar, offline-kø og LiveClock. Samtidig fjernes
   demoøvelser og hardkodet tid fra ekte live-økter.
2. Én video per øvelse med privat opplasting, samtykkekontroll og sikker gjenopptaking etter
   nettfeil.
3. Oppgavehistorikk som leser Workbench-resultatet gjennom `positionTaskId`; fysisk kopi bare
   hvis Anders senere godkjenner behov og migrering.

### Tester som beviser at det virker

- Registrer én rep og én kommentar, last klienten på nytt og les riktig øvelse, kontekst,
  klokkeslett og verdi direkte fra databasen.
- Last opp en syntetisk video og bekreft privat fil og riktig Workbench-økt og øvelse i
  `PlayerSwingVideo`.
- Send samme operasjon to ganger og bekreft én rep, én kommentar og én video.
- Registrer offline, start appen på nytt, koble til og bekreft databasen før lokal kø tømmes.
- Bekreft at en koblet `PositionTask` viser samme resultat, og at en annen spiller eller coach
  uten tilgang får avslag.
- Bekreft at hovedklokken og **ØKTA** fortsetter riktig gjennom nettfeil og sideoppdatering.

### Risiko og usikkerhet

- Nettlesere har ulike grenser for lokal videolagring. For stor fil må stoppes med tydelig
  beskjed; appen må aldri late som den er sikret.
- Det må avgjøres om `PositionTaskLog` trenger en fysisk kopi, eller om én Workbench-sannhet er
  tilstrekkelig. Planen anbefaler én sannhet.
- `liveSnapshot` er raskest uten migrering, men kan senere bli tungt for analyse. Normalisering
  vurderes først når ekte målinger viser behov.

## 2. Én økttabell

### Hva som endres for brukeren

Spiller og coach ser den samme økten i plan, live-visning, LiveBoard og analyse. En fullført
økt forsvinner ikke fordi én skjerm leser `WorkbenchSession` og en annen leser
`TrainingSessionV2`. Historiske økter beholdes og kontrolleres før gammel lagring settes
skrivebeskyttet.

### Berørte filer og modeller

- `src/lib/agencyos/live-tavle-data.ts` og
  `src/components/admin/precision/AG13LiveTavle.tsx`.
- `src/lib/admin/stall-precision-data.ts` som allerede leser Workbench for «Trener nå».
- `src/lib/portal-analyse/trenings-historikk.ts`,
  `src/lib/portal-analyse/treningsanalyse-data.ts` og `src/lib/training/korrelasjon.ts`.
- Eldre live-skriving i `src/app/portal/(fullscreen)/live/[sessionId]/actions.ts`.
- Modeller: `WorkbenchSession`, `WorkbenchDrill`, `TrainingSessionV2`, `TrainingDrillV2`,
  `DrillLogV2`, `SessionDrillNote`, `PlayerSwingVideo` og `PositionTaskLog`.

### Forslag til felt eller migrering

En kontrollert historisk overføring kan trenge unike kildefelt, for eksempel
`migrertFraTrainingSessionV2Id` og `migrertFraTrainingDrillV2Id`, slik at samme gamle rad aldri
kopieres to ganger. Dette er bare forslag. Før en migrering skal en lesende rapport mot en
sikker kopi telle gamle økter, øvelser, tid, reps, notater, videoer og oppgavelogger.

`TrainingSessionV2` slettes ikke. Etter dokumentert likhet beholdes den som skrivebeskyttet
historikk og tilbakerullingsmulighet. En eventuell senere sletting blir en egen beslutning.

### Små PR-er

1. Én felles, tilgangssikret lesemodell for Workbench-økter og tydelig statusoversettelse.
2. Bytt LiveBoard og de eksisterende analysegrunnlagene til Workbench uten å endre selve
   analyseutformingen ennå.
3. Lag historisk kontrollrapport og forslag til gjentakbar overføring. Kjør ingen overføring
   før Anders har godkjent både migreringen og målmiljøet skriftlig.
4. Stopp nye V2-skrivinger først når alle produksjonsruter har en verifisert Workbench-vei.

### Tester som beviser at det virker

- Samme Workbench-ID og status vises i plan, LiveBoard og analysegrunnlag.
- Statusene `IN_PROGRESS`, `SCHEDULED`/`PUBLISHED` og `COMPLETED` blir henholdsvis
  «N spillere trener nå», «Ikke startet» og «Gjennomført».
- En sammenligning før og etter viser samme antall økter, samlet faktisk tid, reps, notater,
  videoer og koblede oppgaver. Ethvert avvik stopper overgangen.
- Gjenkjøring av en eventuell overføring oppretter ingen duplikater.
- Tilgangstester viser at gruppetilhørighet eller gyldig D-04-deling kreves.

### Risiko og usikkerhet

- Gamle data kan mangle sted, avstand eller entydig Workbench-motpart. Slike rader merkes
  «ukjent» eller «ikke matchet»; de skal ikke gis oppdiktede verdier.
- Omfanget av duplikater og foreldreløse rader er ukjent før kontrollrapporten er kjørt mot en
  sikker kopi.
- Eksakt D-04-omfang for live-status må bekreftes: navngitt komplett profil anbefales som
  minste grunnlag, men skal ikke utvides av denne planen.

## 3. Cockpit og melding inn i økta

### Hva som endres for coach og spiller

**LiveBoard** viser dagens virkelige Workbench-økter: hvem som trener nå, hvem som ikke har
startet og hvem som er ferdig. Coach ser bare egne grupper og spillere som har delt riktig
omfang.

Fra den aktive økten kan coach sende en **CoachMessage**. Den vises øverst i spillerens
live-økt uten modalvindu, klokka går videre, og samme melding ligger i meldingstråden.

Rekkefølgen er tekst, bilde, video og talemelding. Mens live-siden er synlig og har nett, spør
den etter nye meldinger hvert **5. sekund**. Den spør også straks siden får fokus eller nettet
kommer tilbake, og pauser når siden er skjult. Web Push varsler som beste forsøk, men polling
er den enkle mekanismen som gjør at meldingen faktisk dukker opp i åpen økt.

For talemelding holder coach inne i **Composer**, slipper for å sende og får **Angre** i tre
sekunder. Først etter de tre sekundene sendes privat lyd. **VoiceNote** viser varighet og
avspilling; automatisk transkripsjon er ikke del av leveransen.

### Berørte filer og modeller

- `src/lib/agencyos/live-tavle-data.ts`, `src/lib/agencyos/live-okt-actions.ts`,
  `src/components/admin/precision/AG13LiveTavle.tsx` og
  `src/components/admin/precision/AG13LiveOkt.tsx`.
- Spillerens PH-05-skjerm og nye felleskomponenter `CoachMessage`, `Composer` og `VoiceNote`.
- Varsling under `src/lib/push.ts` og `src/lib/push/`.
- Privat lager og sikre opplastingsruter; `message-attachments` brukes som privat bøtte.
- Modeller: `CoachingSession`, `MessageAttachment`, `Notification`,
  `PushSubscription` og `WorkbenchSession`.

### Forslag til felt eller migrering

`CoachingSession` brukes som kanonisk LIVE-tråd med Workbench-ID. For å binde filer til én
bestemt melding og vise lyd riktig foreslås `messageId`, `mediaKind` og `durationMs` på
`MessageAttachment`. Et eget leverings-/opplastingsstatusfelt vurderes bare hvis den
eksisterende trådstrukturen ikke kan uttrykke ventende vedlegg. Alt krever separat
migreringsgodkjenning.

Store filer lastes direkte til privat lager med servergodkjent filsti, fordi serverkallet har
størrelsesgrense. Serveren kontrollerer faktisk filtype, størrelse, eier, samtykke og tilgang.
Bilder normaliseres og metadata som GPS fjernes. Kortvarige, signerte lenker brukes ved lesing.

### Små PR-er

1. Workbench-basert LiveBoard, tekstmelding, femsekundersoppdatering, samme LIVE-tråd i Innboks,
   appvarsel og Web Push.
2. Bilde og video som private `MessageAttachment`-vedlegg med sikker opplasting og lesing.
3. Talemelding med hold/slipp, tre sekunders Angre, lokal ventekø og `VoiceNote`.

### Tester som beviser at det virker

- En coach med tilgang ser riktig antall i alle tre statusgrupper; en coach uten tilgang ser
  ingen av øktene.
- Send tekst og bekreft samme meldings-ID, innhold og klokkeslett både i live-økten og tråden.
- Med falsk klokke bekreftes nytt oppslag etter fem sekunder, pause i skjult fane og umiddelbart
  oppslag ved fokus/nett tilbake. LiveClock påvirkes ikke.
- Bekreft appvarsel og at feil i Web Push ikke sletter meldingen.
- Last opp syntetiske bilde-, video- og lydfiler; avvis feil filtype, for stor fil og uautorisert
  lesing. Bekreft privat lagring og kortvarig lenke.
- Slipp talemelding og trykk Angre innen tre sekunder: ingen melding eller fil skal sendes.

### Risiko og usikkerhet

- Web Push kan være avslått eller utilgjengelig; derfor er det aldri eneste leveringsmåte.
- Nettleserens opptaksformat varierer. Tillatte lydformater må prøves på støttede mobilnettlesere.
- Dagens `sendLiveMelding` skriver i et gammelt sammendragsfelt. Historiske meldinger må enten
  vises separat eller overføres kontrollert før den gamle skrivingen fjernes.

## 4. Treningsanalyse

### Hva som endres for spiller og coach

**TrainingAnalysis** kommer i tre visninger: spilleren selv, coach for én spiller og coach for
en gruppe. Den viser:

- faktisk tid per område × faktisk sted: range/treningsområde, bane, inne/simulator og
  turnering;
- banespill og registrerte golfslag side ved side;
- putting etter `Omraade`-båndene 0–3, 3–5, 5–10, 10–25, 25–40 og 40+ fot.

Hvert tall kan åpnes og vise øktene og øvelsene som danner grunnlaget. Ukjent sted, ukjent
putteavstand og økttid som ikke kan fordeles på øvelser vises som egne mangler, ikke fordelt
etter gjetning. Stats › Trening i PlayerHQ kobles til det samme grunnlaget.

### Berørte filer og modeller

- `src/lib/portal-analyse/trenings-historikk.ts`,
  `src/lib/portal-analyse/treningsanalyse-data.ts` og
  `src/lib/portal-analyse/ph16-stats-data.ts`.
- `src/components/portal/precision/PH16Stats.tsx` og coachvisningen i
  `src/components/admin/precision/AG08Stats.tsx`.
- `src/lib/taxonomy.ts` skal ikke lenger bestemme sted gjennom gamle M-koder.
- Workbench-detaljer i `src/lib/domain/workbench/ovelse-detaljer.ts`.
- Modeller: `WorkbenchSession`, `WorkbenchDrill`, `SessionBallLog` og det validerte
  live-resultatet fra levering 1.

### Forslag til felt eller migrering

Ingen migrering er nødvendig for første analyse når det validerte live-resultatet kan leses
fra `liveSnapshot`. Dersom målinger senere viser at gruppeanalyse er for treg eller vanskelig å
kontrollere, kan en normalisert `WorkbenchDrillResult` med faktisk tid, område, sted,
puttebånd og slag foreslås. Det opprettes ikke uten dokumentert behov og eget ja.

«Turnering» brukes bare når økten eller runden uttrykkelig er markert som turnering. Pressnivå
er ikke et sted. Andre fysiske eller ukjente steder beholdes i «Annet/ukjent» og tvinges ikke
inn i de fire golfkategoriene.

### Små PR-er

1. Felles beregning fra Workbench-resultater, med datadekning og uten M-koder.
2. Spillervisning i Stats › Trening med nedbryting til grunnlaget.
3. Coachvisning for én spiller og gruppe, med samme beregning og D-04-filter.

### Tester som beviser at det virker

- Kjente syntetiske økter summeres korrekt per område og sted; totalen kan spores til eksakte
  øvelser.
- Tid uten øvelsesfordeling og ukjent sted vises separat og blåser ikke opp en kategori.
- Baneminutter og golfslag vises som to ulike størrelser, uten oppdiktet prosent.
- Alle seks puttebånd summeres i fot, og manglende avstand havner i «Ukjent».
- Spillervisning, coachens enkeltvisning og gruppevisning gir samme sum for samme tillatte
  utvalg. Uten D-04-deling er data utilgjengelig.
- En klasse som begynner på «N», påvirker ingen analyse som bygger på konkurransedata.

### Risiko og usikkerhet

- «Banespill mot golfslag» kan bety to tall side ved side eller et bestemt forholdstall.
  Planen anbefaler to sporbare tall inntil Anders eventuelt definerer en formel.
- Eldre økter mangler faktisk øvelsestid og sted. De skal vises med lavere datadekning, ikke
  fylles ut med planlagt tid som om den var målt.
- Det må bekreftes hvilke Workbench-markeringer som alene er sterke nok til å kalle et sted
  «turnering».

## 5. SG-analyse

### Hva som endres for spiller og coach

Et negativt SG-tall vises i tapsfarge og alltid med ekte minustegn. Tallet blir trykkbart i
PlayerHQ og AgencyOS. Det åpner **SGCategoryPanel** med:

- SG i treningsrunder og turneringsrunder i valgt periode;
- faktisk treningstid i samme periode og tilsvarende SG-kategori;
- økter og runder som inngår i tallet;
- et databasert forslag til treningsområde. Forslaget låser aldri planen.

`SGValue` håndterer visning av desimalkomma, `−`, `—` og ekte null likt overalt. Egne Data
Golf-tall hentes ikke inn i panelet for vanlige roller.

### Berørte filer og modeller

- `src/components/portal/precision/PH16Stats.tsx` og
  `src/components/admin/precision/AG08Stats.tsx`.
- Nye delte komponenter `SGValue` og `SGCategoryPanel`.
- `src/lib/training/korrelasjon.ts` og relevante SG-/rundelesere.
- Modeller: `Round`, `TournamentEntry`, `TrainingLog`, `WorkbenchSession` og
  `WorkbenchDrill`/live-resultat.

Turneringsrunde betyr `tournamentEntryId` satt eller `roundType = "turnering"`.
Treningsrunde betyr `roundType = "trening"` uten turneringskobling. Ukjent rundetype holdes
synlig som ukjent, men blandes ikke inn i sammenligningen. Hurtigscore fra levering 7 skal
alltid holdes utenfor SG.

Treningstid kobles slik: utslag til OTT, innspillområdene til APP, nærspill/bunker til ARG og
de seks puttebåndene til PUTT. Bane, fysisk trening og ukjent område vises som uklassifisert i
stedet for å bli tvunget inn i en SG-kategori.

### Forslag til felt eller migrering

Første versjon trenger ingen nye SG-felt. `beregnKorrelasjon` summerer Workbench-logg og
manuell `TrainingLog` etter deres avtalte betydning. Hvis historiske rader kan representere
samme aktivitet to ganger, kan en valgfri `source` eller `workbenchSessionId` på `TrainingLog`
foreslås for sikker deduplisering. Det krever eget ja.

### Små PR-er

1. Felles `SGValue`, tapsfarge, formatering og tilgjengelig trykk i PlayerHQ og AgencyOS.
2. `SGCategoryPanel` med rundeinndeling, Workbench-treningstid, grunnlag og forslag.
3. Utvid `beregnKorrelasjon` med loggede Workbench-økter, kildeoversikt og vern mot
   dobbelttelling.

### Tester som beviser at det virker

- `−0,8` vises i tapsfarge og er trykkbart; `0` vises som `0`; manglende verdi som `—`.
- Treningsrunde, turneringsrunde og ukjent runde plasseres riktig med både `roundType` og
  `tournamentEntryId`.
- Hurtigscore og N-klasser gir aldri SG-grunnlag.
- Treningstid i OTT, APP, ARG og PUTT stemmer med underliggende Workbench-øvelser i samme
  periode.
- Korrelasjonen bruker både Workbench og gyldig manuell `TrainingLog` uten å doble samme logg.
- Vanlige roller får ikke Data Golf-tall. Coach uten D-04-tilgang får avslag.

### Risiko og usikkerhet

- `UserRole` har ikke en tydelig analytikerrolle i dagens skjema. D-19 må finnes som en
  verifiserbar rettighet før Data Golf-data kan vises noe sted; planen gjetter ikke en rolle.
- Sammenligning krever nok runder og nok treningstid. Panelet må vise «for lite grunnlag» i
  stedet for et skråsikkert råd.
- Manuelle `TrainingLog`-rader kan overlappe Workbench-historikk; omfanget må måles før de
  summeres blindt.

## 6. Spillerprofil

### Hva som endres for brukeren

Spillerprofilen blir et dashboard i AgencyOS, WANG og Team Norway:

- profilbildet vises når en tillatt `avatarUrl` finnes, ellers initialer;
- nøkkelinfo, nåsituasjon og neste turnering vises fra ekte data;
- trening per dag, uke og måned vises fra fullførte Workbench-økter;
- turneringer og historikk bruker samme spiller og tilgangsomfang.

Hvis ekte data mangler, vises `—` eller en tydelig tomtilstand. Demokonstanter skal aldri
presenteres som spillerens virkelige konkurranser eller tester.

### Berørte filer og modeller

- AgencyOS: `src/lib/admin-spiller/spiller360-data.ts` og
  `src/components/admin/precision/AG08Spiller360.tsx`.
- Team Norway: `src/components/team-norway/skjermer/tn-spillerprofil-skjerm.tsx` og tilhørende
  profillaster.
- WANG: `src/components/wang/WangElever.tsx`, tilhørende spillerprofiler og
  `src/app/team-wang/_data/live-sesong.ts`.
- Deling: `src/lib/deling/profil-lesing.ts`, `src/lib/deling/navngitt-regler.ts` og
  eksisterende WANG-/Team Norway-porter.
- Modeller: `User` (`avatarUrl`), `WorkbenchSession`, `Round`, `TournamentEntry` og gjeldende
  navngitte delingsmodeller.

### Forslag til felt eller migrering

Ingen migrering er forventet. `avatarUrl`, økter, runder, turneringskoblinger og navngitt
deling finnes. En felles lesemodell beregner dag, uke og måned i tidssonen Europe/Oslo og
returnerer bare data rollen allerede kan lese.

`COMPS`, `TESTS` og øvrige visuelle demo-reserver i `live-sesong.ts` flyttes ut av
produksjonsgrenen eller erstattes av ærlige tomtilstander. De slettes ikke før hver ekte
datakilde er kartlagt.

### Små PR-er

1. Felles, tilgangssikret profiloppsummering og bilde/fallback i AgencyOS.
2. Trening per dag, uke og måned i Team Norway med eksisterende navngitte delingsport.
3. Ekte WANG-profilgrunnlag og fjerning av demo-reserver fra `live-sesong.ts`.

### Tester som beviser at det virker

- Tillatt profil med `avatarUrl` viser bildet; tom eller utilgjengelig URL viser initialer.
- Økter på dag-, uke- og månedsgrenser summeres én gang og i riktig Oslo-dato.
- Samme tillatte spiller gir samme treningssum i AgencyOS, WANG og Team Norway.
- Uten navngitt D-04-deling, eller uten foresattgodkjenning under 16 år, returneres ingen
  profildata.
- Manglende konkurranse/test gir tomtilstand og aldri `COMPS`/`TESTS`-demo.

### Risiko og usikkerhet

- WANG-skjermen bruker i dag mye demooppsett. Ekte kilde for alle feltene i «nåsituasjon» må
  kartlegges; manglende felt skal ikke fylles med eksempeldata.
- Ekstern bildelevering må passe dagens bilde- og tilgangsoppsett. Signert privat URL må
  fornyes uten at profilen eksponeres bredere.
- «Neste turnering» må ha én tydelig regel når påmelding og kalender peker på ulike hendelser.

## 7. Rask score

### Hva som endres for spilleren

**QuickScoreEntry** lar spilleren registrere brutto score per hull uten å føre hvert slag.
Runden vises i scorehistorikken, men gir aldri SG-grunnlag. Appen skal ikke lage oppdiktede
slag for å få hurtigregistreringen til å ligne en full slagrunde.

Rundens formål, trening eller turnering, beholdes i `roundType`. Registreringsmåten er en egen
egenskap, slik at «hurtigscore» ikke blandes med «treningsrunde».

### Berørte filer og modeller

- `src/components/portal/runde-live/RundeLiveKlient.tsx` og relevant recap-/lagringsflyt.
- `src/lib/runde-logg/syntetiser-hurtig.ts`, eksisterende rundehandlinger og alle SG-lesere.
- Modeller: `Round` og `HoleScore`. Hurtigscore oppretter ikke `Shot`, `PuttDetail` eller
  `ShotSgResult`.

### Forslag til felt eller migrering

Det foreslås et eksplisitt felt på `Round`, for eksempel `entryMode` med verdiene
`FULL_SHOTS`, `QUICK_SCORE` og eventuelt `MANUAL_TOTAL`. Feltet må få en sikker standard for
eksisterende runder. Dette er en databasemigrering og bygges ikke uten et eget skriftlig ja.

En `QUICK_SCORE`-runde lagrer bare runden og `HoleScore` per hull. Alle SG-felt, kilde- og
versjonsfelt for SG er tomme, og alle SG-spørringer har en eksplisitt sperre mot denne modusen.

### Små PR-er

1. Etter migreringsgodkjenning: felt, domeneregel og felles sperre som utelukker hurtigscore
   fra SG.
2. QuickScoreEntry med bare brutto score per hull, redigering og tydelig merking i historikken.
3. Kontrollrapport for eldre syntetiske hurtigrunder; usikre historiske runder endres ikke
   automatisk.

### Tester som beviser at det virker

- En hurtigrunde lagrer riktig brutto score per hull og total, men ingen slag eller SG-resultat.
- Hurtigrunden vises i scorehistorikk og er fraværende i alle SG-summer, paneler og
  korrelasjoner.
- Full slagrunde fortsetter å gi SG når datagrunnlaget er komplett.
- Trenings-/turneringsmerking virker uavhengig av registreringsmåten.
- N-klasser holdes utenfor konkurranseanalyse, også når scoren er komplett.

### Risiko og usikkerhet

- Dagens hurtigflyt lager syntetiske slag i minnet. Historiske runder kan derfor være vanskelige
  å skille sikkert fra ekte slagdata. Bare entydige rader kan tilbakefylles automatisk.
- Feltnavn og verdier må avklares i migrerings-PR-en, men de må uttrykke registreringsmåte og
  ikke gjenbruke `roundType`.

## 8. Metric med vurdering

### Hva som endres for brukeren

Alle endringstall får en eksplisitt vurdering: `improvement`, `worsening` eller `neutral`.
Fargen bestemmes av vurderingen, aldri automatisk av pluss eller minus. Derfor blir for
eksempel lavere score en forbedring, mens negativ SG fortsatt er tap. Tall uten vurdering er
nøytrale.

### Berørte filer og modeller

- Ny eller utvidet felles `Metric`-kontrakt i komponent-/presentasjonslaget.
- Kjente steder som må gjennomgås:
  `src/lib/admin-spiller/spiller-profil-panel-data.ts`,
  `src/components/stats/stats-wrapped-slide.tsx`,
  `src/components/portal/precision/PH16Stats.tsx`,
  `src/components/admin/precision/AG08Stats.tsx`,
  `src/components/admin/v2/AdminSpillerAnalyseV2.tsx`,
  `src/components/marketing/v2/MarkedStatsMinProgresjonV2.tsx`,
  `src/components/marketing/v2/MarkedTurneringDetaljV2.tsx`,
  `src/components/portal/skill-map/SkillMapView.tsx`,
  `src/components/ui/kpi-card.tsx` og `src/components/ui/swiss-metric-grid.tsx`.
- `src/lib/portal-tester/format-verdi.ts` brukes som mønster fordi den allerede skiller verdi
  fra vurderingsretning.
- Ingen databasemodell endres.

### Forslag til felt eller migrering

Ingen migrering. `assessment` beregnes av domenet som kjenner målet: lavere er bedre for
score, høyere er bedre for enkelte tester, og noen tall skal være nøytrale. Komponenten får
ikke lov til å gjette ut fra fortegnet.

### Små PR-er

1. Felles type, formatering og komponenttest for `Metric` og `assessment`.
2. Spiller- og coachflater for trening, SG, score og tester.
3. Resterende markeds-, profil- og oversiktsflater etter en dokumentert søkekontroll.

### Tester som beviser at det virker

- Score 78 → 74 er forbedring selv om endringen er negativ; 74 → 78 er forverring.
- SG `−0,5` → `−0,2` er forbedring, mens selve SG-verdien fortsatt vises som negativ.
- Ekte null vises som `0`, manglende tall som `—`, og nøytral verdi får ingen gevinst-/tapsfarge.
- Komponenttester feiler hvis en endringsfarge brukes uten eksplisitt `assessment`.
- Visuell kontroll dekker mobil 390 px og desktop i de berørte skjermene.

### Risiko og usikkerhet

- Noen eksisterende skjermer farger selve nivået, andre farger endringen. De må klassifiseres
  før de endres, ellers kan riktig domeneinformasjon gå tapt.
- Ikke alle målinger har dokumentert «høyere/lavere er bedre». De beholdes nøytrale til en
  regel er bestemt.

## Godkjenningsrekkefølge og stoppunkt

Leveringene bygges i rekkefølgen 1–8. Anders kan skrive `OK levering 1`, `OK levering 2` og så
videre i utkast-PR-en. Et slikt OK åpner bare den navngitte leveringen og dens første lille PR.
Det åpner ikke senere leveringer, migreringer, produksjonsdatabase, merge eller deploy.

Før hver bygge-PR skal prosjektets gjeldende lint, typesjekk og tester kjøres. Faktiske
kommandoer, resultat og det som ikke er testet, skrives i PR-beskrivelsen.

## Samlet liste over uavklarte punkter

1. Om «Banespill mot golfslag» skal være to sporbare tall eller en bestemt formel.
2. Hvilken eksplisitt Workbench-markering som gjør et sted til «turnering».
3. Om tekniske oppgaver trenger fysisk kopi i `PositionTaskLog`, eller kan lese én
   Workbench-sannhet.
4. Eksakt D-04-omfang som åpner live-status for en coach utenfor egne grupper.
5. Hvor D-19-rettigheten «analytiker» er definert, siden den ikke finnes tydelig i `UserRole`.
6. Omfanget og kvaliteten på historiske `TrainingSessionV2`-rader og eldre hurtigscore-runder.
7. Én regel for «neste turnering» når kalender og påmelding peker på ulike hendelser.
8. Om analysevolum senere krever normaliserte Workbench-resultater; første løsning bruker det
   eksisterende, validerte `liveSnapshot`.
