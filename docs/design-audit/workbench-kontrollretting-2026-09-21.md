# Kontrollretting for Workbench — 21.09.2026

**Tidligere resultat (gjeldende videreføring nederst):** full `npm run verify` bestod etter det godkjente kildebyttet:
3312 tester, 4 komponenttester, typesjekk, lint, alle obligatoriske kontrollsteg
og produksjonsbygg inkludert service worker. Ingen tester hoppet over.
`npm run prosjekt:sjekk` og `git diff --check` bestod også. Eldre kontrastkontroll
skriver fortsatt kjente avvik uten å feile; grønn verify er ikke en påstand om
full tilgjengelighet eller visuell godkjenning. Ingen push eller deploy.

Startet etter Anders' beskjed «Start denne planen nå». Dette er oppfølging av
[restplanen](../planer/workbench-design-og-kode-natt-2026-09-20.md), ikke en
godkjenning av publisering eller av tidligere avviste kontrollendringer.

## Abonnementstestene er rettet uten databaseskript

`src/lib/__tests__/stripe/abonnement-v2-indeks.test.ts` krevde at et destruktivt
engangsskript eksisterte i arkivet, og kontrollerte flagget rundt DROP INDEX.
Commit `25067d76e` slettet skriptet 20.09.2026. Den gamle testen krevde dermed
gjeninnføring av pensjonert kjørbar kode for å bestå.

Ny kontroll:

- Begge tidligere skriptstier må være fraværende; ingen npm-kommando får peke på
  skriptet. Det kan ikke lenger gjeninnføres med eller uten destruktivt flagg.
- `Subscription` må fortsatt ha unikhet på kombinasjonen `userId, kind`.
- Unikhet på `userId` alene avvises både som modellregel og som feltregel.
  Kommentarer teller ikke som en faktisk skjemaregel.

De to utdaterte fil-/flaggtestene er erstattet av én sperre mot gjeninnføring.
Skjematesten er beholdt og skjerpet. Ingen test er hoppet over. Dette beviser
repoets regler, ikke hvilke indekser produksjonsdatabasen faktisk har.

Validering: full `npm test` bestod med 3304 tester og 4 komponenttester før den
nye designpakkekontrollen nedenfor ble lagt til. I isolerte testkopier ble seks
bevisste feil avvist: begge skriptstier, npm-kobling, fjernet sammensatt unikhet,
ekstra enkeltfelt-unikhet og `@unique` på `userId`. Uendret kopi bestod.
Første prøveharness endret feil modell ved tekstutskifting; prøven ble rettet
til eksplisitt `Subscription` før resultatene over ble registrert.

## Ny kontroll av valgt designpakke

`scripts/check-workbench-handover.mjs` og `npm run check:workbench-handover`
kontrollerer de 24 påkrevde kildefilene, deres størrelse og SHA-256, samt alle
16 PNG-ers 2×-mål. Manglende filer, duplikater, ukjente stier og symlenker ut av
pakken avvises. Åtte tester består, inkludert endrede dimensjoner med oppdatert
hash. Kontrollen er lagt til i `verify:static` som en ekstra sperre.

Dette beviser at valgt kilde er intakt, ikke at skjermene er ferdig portert.
Den gamle siteringskontrollen beholdes. Grensen er oppdatert etter den konkrete
godkjenningen nedenfor.

## Hvorfor den gamle siteringskontrollen fortsatt feiler

Kontrollen teller forskjellige Train-lock-filnavn i TypeScript-kilde. Den teller
ikke den nye Claude Design-pakken. Ni referanser ble fjernet i disse innhentede
commits, før det lokale porteringsarbeidet:

| Gammel referanse | Fjernet i | Berørt funksjon i ny retning |
|---|---|---|
| A-01c Mac Uke vegg | `9f28c6e1f` | Uke, opptatt-/heldagsbånd |
| A-02b Mac Okt Innspill | `dd53b9143` | Økt og øktdetaljer |
| A-02c Mac Serie-ark | `dd53b9143` | Serier; egen tilstand må fortsatt funksjonskontrolleres |
| A-04 Kilder Ovelsesbank | `4e3982fcf` | Kildepanel og øvelsesbank |
| A-09 Mac Filip Godkjenn | `dd53b9143` | Utkast og godkjenning; Stall/øktflyt er ikke ferdig |
| A-11 Mac Drag | `9f28c6e1f` | Dra/flytt; egen handlingstilstand må kontrolleres |
| A-18 Mac Tom uke | `9f28c6e1f` | Tom uke; lokal prøve finnes, live gjenstår |
| WB-00 Komponenter | `9f28c6e1f` | Valgt Workbench-skall og delte komponenter |
| WB-01 Uke minimum | `6be233049`, `4e3982fcf` | Valgt Uke på desktop og mobil |

Dette er sporbarhet for videre funksjonskontroll, ikke ni ferdige erstatningsskjermer.
Den nye pakken har normaltilstander; serier, dra/flytt og godkjenning må prøves
som egne tilstander. Gamle navn skal ikke settes tilbake i kode bare for tellingen.

## Konkret beslutning og godkjenning

Forslag: **endre den historiske Train-lock-grensen fra 153 til 144 av 219**, med
begrunnelse som navngir akkurat de ni erstattede Workbench-referansene. Behold
den gamle kontrollen for øvrig; et nytt fall under 144 skal fortsatt feile.
Behold samtidig den nye obligatoriske kontrollen av den valgte pakken, og
kravet om funksjons- og bildebevis per fane. Ingen historiske tegninger slettes.

Risikoen er at ni gamle referanser ikke lenger kreves i kode. Det er derfor et
eksplisitt bytte av kontrollgrunnlag, ikke en ordinær layoutretting. Automatisk
godkjenningskontroll avviste tidligere senking uten konkret autorisasjon.
Anders svarte 21.09.2026 **«Godkjenn dette konkrete kildebyttet»** på spørsmålet
som eksplisitt navnga 153 → 144 av 219, ny obligatorisk kontroll av 24 filer og
16 PNG-er og fortsatt funksjons-/skjermkontroll. Endringen er derfor nå utført
i `fasitdekning-baseline.json`, med denne begrunnelsen. Godkjenningen gjelder
kun dette kildebyttet; den godkjenner ikke databaseendringer, omgåelse av tilgang
eller publisering. Det pensjonerte databaseskriptet er fortsatt borte.

## Innlogget testmiljø

Eksisterende innloggingshjelper peker på en syntetisk coach-konto og lokalt
testpassord. Ett vanlig innloggingsforsøk mot appen ble avvist med «Feil e-post
eller passord». Ingen konto ble opprettet, passord nullstilt eller rolle endret.
Verdiene er ikke skrevet til rapport eller logger.

Lokal konfigurasjon peker mot eksterne Supabase-/databaseverter. Det er ikke
bevis på et isolert testmiljø. Oppskriften for lokal testdatabase gjelder en
tom Cursor Cloud-VM og skal ikke kjøres på Macens eksisterende konfigurasjon.
Skrivetester venter derfor på avtalt isolert miljø; live-bildekontroll trenger
gyldig eksisterende trenerinnlogging og riktig kodeversjon i forhåndsvisning.

## Sikkerhet og neste steg

Ingen runtime-, skjema-, tilgangs- eller produksjonsendringer i denne runden.
Ingen persondata eller hemmeligheter til nye logger/Git. Barn, samtykke og
åpne sider er ikke endret. De avviste skript-/baseline-endringene er ikke gjentatt.

Neste avhengige handling er Uke-kontroll med riktig innlogging og autorisert
forhåndsvisning/testmiljø. Den tidligere tekniske verify-hindringen er løst.

## Videreføring etter «Fortsett automatisk til neste opgave»

- Hentet GitHub med `git pull --ff-only origin main`: `96aa1503f` → `915680402`.
  De 38 nye commits fjerner bare utgåtte arkivskript; ingen overlapper lokale
  Workbench-endringer. Ingen referanser til disse filene ble funnet i `src`,
  `tests` eller `package.json`. Registrene er regenerert; prosjektkontroll og
  diff-sjekk består. Full verify-resultatet over er fra før dette arkivtrekket;
  appkode og avhengigheter er uendret av trekket.
- `vercel env ls preview` viste at `DATABASE_URL` og `DIRECT_URL` er samme
  konfigurasjonsoppføringer for Production og Preview. En ny preview-URL alene
  gir derfor ikke et isolert miljø for skrivetester. Ingen variabelverdi ble
  hentet, ingen miljøkonfigurasjon endret og ingen deploy utført.
- Chrome sender fortsatt `/admin` tilbake til `/portal`. En egen synlig
  innloggingsfane i Codex er klargjort for en eksisterende coach/admin-konto.
- Docker Desktop og Supabase CLI 2.109.1 finnes lokalt. Docker-daemonen kjører
  ikke. Bare versjon/hjelpetekst er lest; ingen containere eller database er startet.
- Konkret godkjenning er etterspurt for å starte Docker og opprette et separat
  lokalt Supabase-testmiljø med prosjektets skjema og syntetiske kontoer,
  uten endring av eksisterende databaser eller miljøfiler. Ikke opprett miljøet
  før svaret foreligger. Dette vil gi lokal funksjonskontroll, ikke Vercel-bevis.

Ved godkjenning brukes egen prosjektidentitet, separate porter og egne lokale
miljøverdier. Ingen produksjonsdata kopieres. Databasekommandoer må kontrollere
loopback-målet og bruke separat konfigurasjon; repoets standard Prisma-config
laster `.env.local` og må ikke brukes ukritisk. Auth-vakter beholdes. Lokal
oppskrift: [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started).

## Innlogging bekreftet etter Anders' beskjed

Anders fullførte innlogging i eksisterende Codex-fane. AgencyOS-hjem og
planoversikten åpnet. Lenken «Åpne uke i Workbench» åpnet den beskyttede
Workbench-ruten; ferdig lastet side viste Uke og Publiser uten innloggingskrav
eller generell applikasjonsfeil. Ingen data ble endret eller publisert.

Innlogging er derfor ikke lenger hindringen for lesekontroll i denne fanen.
Dette beviser ikke hvilken eksakt rolle kontoen har, tilgangsavgrensning mot
andre spillere eller at lokal, upublisert kode er levert. Skrivetestene venter
fortsatt på avtalt isolert testmiljø. Personnavn og spilleridentifikatorer er
utelatt fra kontrollnotatet.

## Autorisert lokal testing og faktiske funn

Anders ba 21.09: «Ednre prosjekt regeln først, og deretter fiks alt nå
automatisk». Prosjektets `AGENTS.md` ble først oppdatert med forhåndsgodkjent
isolert lokal testing. Tidligere ventepunkter over er dermed historiske.

- Separat Supabase-prosjekt `ak-hq-isolert-test-20260921`, API 55421, database
  55422 og lokal app 3105. Alle publiserte Docker-porter er kontrollert bundet
  til 127.0.0.1. Eksisterende appmiljø og hostede databaser er ikke endret.
- Ignorert appkopi i `_archive/workbench-isolert-app`, separat Prisma-config og
  lokal miljøfil. Oppstart validerer lokale mål og bruker et renset prosessmiljø.
  Testnøkler/passord ligger privat, ikke i Git. Kun syntetiske kontoer og data.
- Skjema etablert lokalt. Prisma avviste `--accept-data-loss` med sin AI-sperre;
  ingen samtykkevariabel eller omgåelsesflagg ble brukt. Alternativet var en
  lest og kontrollert skjemadifferanse med bare oppretting av tabeller/indekser
  og tilføyelse av fremmednøkler, brukt i lokal transaksjon. Tomme tabeller var
  kontrollert før oppretting. Ingen produksjonsmigrasjon.
- Vanlig coach-innlogging, oppretting, flytting til annen dag/tid, publisering,
  oppfriskning med bevart lagring, tilbaketrekking, lagring som mal og oppretting/
  fjerning av øvelse er bekreftet i faktisk UI mot testdatabasen.
- Fant at `loadWeek` alltid sendte tomme skole-/opptattblokker. Koblet inn egne
  spillerblokker og relevant skoleår etter eksisterende tilgangskontroll.
  Private avtaler viser bare «Opptatt», uten privat tittel eller kategori.
  Norsk klokkeslett, ukentlig gjentakelse over vintertid og døgnklipping prøves.
  Skolebånd vises nå i faktisk app.
- Åtte målrettede prøver bestod. Full `npm run verify` bestod deretter med
  3318 tester, 4 komponenttester, statiske kontroller, typesjekk og bygg.
- Etter dette ble mørke skjemafelt i lyst Workbench og overflyt i øvelsesraden
  rettet lokalt. Nettlesermåling bekrefter hvite felt med grafitttekst og ingen
  synlig horisontal overflyt i detaljpanelet ved 1440 × 880.

Kildedrag ga ingen synlig effekt i første nettleserprøve; dette er ikke godkjent.
Serie, publiseringsutvalg, avvist spiller i faktisk UI og nye innloggede bilder
på mobil/desktop gjenstår. Det gamle komponentbildebeviset er ikke erstattet
av disse funksjonsprøvene. Ingen commit, push eller deploy i denne runden.

Anders har satt lansering til 22.09.2026 kl. 18.00 Europe/Oslo. Separat
prosjektløs designoppgave er startet for iterasjon i Claude Design sammen med
Anders; den endrer ikke appkode eller den allerede valgte eksportpakken.

## Uke-kontroll videreført med lagring og bilder

- Serie med to uker opprettet fra skjemaet. Ukebytte viste forekomsten på
  riktig søndag neste uke. «Hele serien» slettet begge forekomster; neste uke
  ble tom og forrige-uke-kilden mistet den andre forekomsten.
- Kildedrag fra tidligere uke opprettet og lagret økt. Første manglende effekt
  var ikke tilstrekkelig bevis på en funksjonsfeil. Gjentatt prøve med mål fra
  synlige elementer lyktes.
- Prøven avdekket at domenekoden rundet 75 minutter opp til 90. Starttid skal
  følge rutenettet, men valgte varigheter 15/45/75 skal beholdes. Oppretting og
  flytting er rettet; eksisterende varighet får også et gyldig valg i skjemaet.
  41 domenetester består, inkludert tre nye varighetsprøver. Ny kildedragprøve
  lagret 09.00–10.15 og viste 75 min i detaljpanelet.
- Publiseringsdialogen med to utkast: fjernet én avkrysning og publiserte én.
  Bare valgt serieøkt fikk PUBLISERT; den andre beholdt UTKAST. Prøveøktene er
  ryddet gjennom vanlig UI i det isolerte testmiljøet.
- Coachens direkte URL til en annen treners syntetiske spiller ga 404 uten
  spillerdata. Bytte til egen spiller med tom plan viste ingen gamle økter;
  tilbakeknappen gjenopprettet riktig spiller og åttetimersplan.
- Mobil: dagvelger byttet mandag → onsdag med Skole og korrekt økt. Økt åpnet
  i bunnark med 45 minutter; lukking og bytte tilbake til mandag fungerte.

Målt i nettleseren ved 1440 × 880: topp 56, kilder 236, detaljpanel 340,
alle 18 timerader 32 og minste øktkort 44 CSS-px. Fonter var lastet.
Nye innloggede bilder og sammenstillinger ligger privat under
`/private/tmp/ak-hq-isolert-test-20260921/bilder/`.

| Bilde | Diagnostisk pikselavvik | Merknad |
|---|---|---|
| `uke-desktop-side-ved-side.png` | 4,672 % | 1440 × 880 per side |
| `uke-mobil-side-ved-side.png` | 8,212 % | 390 × 844 per side |

Fasit til venstre, faktisk app til høyre. JPEG 1× mot eksplisitt nedskalert
PNG 2×; tallene er ikke en godkjenningsgrense. Appen har konsistent uke 38,
14.–20. september 2026 og syntetiske åtte timer; fasiten blander uke/dato/år
og viser andre data. Mobilfasiten viser tirsdag, appbildet mandag. Formelfelt
uten datakilde vises som «—». Kildebank, uketype, periodebeskrivelse og formel
har fortsatt innholds-/funksjonsavvik som ikke kan skjules av grønn pikselmåling.
Utviklingsindikatoren fra Next vises i appbildet.

Vanlige nettleserbilder ga feil leverte dimensjoner og ble avvist av verktøyet.
De nye bildene er tatt med dokumentert `clip` fra 0,0 over hele den avtalte
visningsrammen. Ingen etterfølgende beskjæring, maskering eller oppskalering.
Midlertidig viewport ble nullstilt etter kontrollen.

Arbeidet er nå på `codex/workbench-launch-20260922` i samsvar med de nyeste
prosjektinstruksene; alle eksisterende endringer er bevart. Ny full verify
stoppet på manglende Avvik-blokk i endret DrillListEditor. Det faktiske nye
Workbench-avviket er dokumentert i filhodet; ny full kjøring pågår. Ingen
kontroll er svekket. Ingen commit/push/deploy.

## Siste kontrollresultat

Full `npm run verify` bestod med **3321 tester, 4 komponenttester, typesjekk,
alle statiske kontroller og produksjonsbygg/Serwist**. Ingen hoppede tester.
Kjøringen krevde vanlig tillatelse til lokal serverbinding etter at sandkassen
avviste `listen 127.0.0.1` med EPERM; dette var ikke en feil i appen eller en
avvist brukerautorisasjon. Ingen kontrollkode ble endret for å løse dette.
`npm run prosjekt:sjekk` og `git diff --check` består.

Tom tittel ble i tillegg avvist i det innloggede skjemaet med «Økten må ha en
tittel», og Escape lukket skjemaet uten lagring. Travle/lastende knapper ble
observert under faktiske lagringer. Simulert nettverksbrudd er ikke utført.

Det tekniske Uke-kontrollpunktet er nå dokumentert med faktisk lokal lagring,
tilgang og bildebevis. Sammenstillingene vises til Anders; ingen personlig
visuell godkjenning eller produksjonskontroll tilskrives ham. Manglende
periode-/uketype-/formeldata forblir «—» eller generelle etiketter, og
kildebankens tomtilstand er reell for testkontoen. Neste byggetrinn er Periode
mot samme valgte pakke, med eksisterende SeasonPlan/PeriodBlock-data og
serverens spilleravgrensning. Ingen databaseskjemaendring er planlagt.
