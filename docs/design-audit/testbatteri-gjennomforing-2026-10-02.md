# Testbatteri — gjennomføring startet 02.10.2026

Bestilling: «Start denne planen nå». Arbeidsgren: `codex/testbatteri-plan-2026-10-02`, eget arbeidsområde basert på `7430f5410`. Andre lokale endringer er bevart.

## Utført og kontrollgrunnlag

- [Planen](../planer/testbatteri-felles-testdag-og-livescoring-2026-10-02.md) er satt i gang. [Protokollregisteret](../planer/testbatteri-protokollregister-2026-10-02.json) dekker 38 golf-/teknikkvarianter og fem separat vedtatte fysiske tester. Registeret er utkast; åpne enheter/protokoller er merket, ikke gjettet.
- 38 syntetiske fasitsett er skrevet. Automatisk kontroll mot appens 27 åpne protokoller er innført. De 11 sperrede protokollene er fortsatt uferdige i appen og telles ikke som bestått beregning.
- 8-ball-grenser kontrolleres på og rundt 0,1 / 1 / 2 / 3 meter; tomme maler må ikke bli fullscore. Fasit er 4 / 3 / 2 / 1 / 0 ved henholdsvis 0,099 / 0,1 / 1 / 2 / 3 meter.
- PEI formatteres etter eksplisitt brøkskala for versjonerte resultater: 0,032 → 3,2 %, 1,6 → 160 %. Halve poeng beholdes. Historisk leseregel uten skala er beholdt og dokumentert som usikker for store verdier.
- WANGs IUP-målinger, trenerens spillerprofil, testoppfølging og administrativ testoversikt bruker den felles visningen. Dette er avgrensede kodeendringer; alle øvrige forbrukere skal fortsatt kartlegges/kontrolleres før oppgaven erklæres fullført.
- TN-sammenligning beregner nå fra råmålingene, avviser feil score/enhet og bruker beregnet retning. En ferdig beregning tar kopi av råmålingene, slik at senere redigering av scorekortet ikke endrer det allerede beregnede resultatet.
- Treneroversiktens trend velger forrige eldre resultat for samme spiller og test-ID, med kontroll av versjon/antall/enhet. Det gamle oppslaget på testnavn og fast serieindeks kunne velge feil måling.
- Oppsettskriptets fysiske batteri har 3000 meter der det nye vedtaket krever Club Speed. Avviket er rettet i kontrollrapporten; ingen oppsettskript eller produksjonsdata er kjørt/endret.

## Claude Design

Full avgrenset testbestilling er sendt til eksisterende [Precision Athletics](https://claude.ai/design/p/7d7c2994-cf63-4c5f-9bdc-fdaf67655a70), [WANG](https://claude.ai/design/p/6cfa623c-b2c7-494f-b1bd-9c254b02f335) og [Team Norway](https://claude.ai/design/p/bc3e41fc-0386-4624-9b14-27355b64e2f7). Den omfatter alle variantene, scorekort, frivillige bilder, automatisk lagring/konflikter, delingsstatus, felles testdag og livescoring.

8-ball-grensene var feil skrevet som øvre inklusive grenser i første designprompt. En eksplisitt rettelse er sendt og synlig i alle tre chatter; bruk alltid nedre intervallgrenser som angitt ovenfor. Dette endret ikke appens eksisterende 8-ball-formel, som allerede brukte korrekt oppslag.

Claude viste først bruksgrense. En senere videreføring ble mottatt, men Precision meldte samtidig arbeid i annen fane, TN stoppet igjen på bruksgrensen, og WANG arbeidet videre. Ingen ny samlet leveranse er ennå kontrollert eller valgt for portering. Ikke bruk «bestilling sendt» som designgodkjenning. Privat skjermbevis og eksakt prompt er lagret under `Documents/Claude/akgolf-hq/testbatteri-kontroll-2026-10-02/`.

## Kontrollstatus

- Siste målrettede kodekontroll: 88 av 88 prøver bestod (86 beregnings-/visningsprøver og to tilgangsprøver), inkludert de 27 uavhengige fasitsettene.
- Prosjektstruktur og lokale dokumentlenker: bestått.
- Målrettet lint og TypeScript-kontroll på siste kode: bestått.
- Full `npm run verify`: første forsøk stoppet ved minnegrense i TypeScript. Ny kjøring bruker Node 24 og 8 GB maksimal prosessminne. Typekontroll, lint og prosjektets statiske vakter har passert. Hele testpakken bestod med 3 999 kodetester og 18 komponenttester, inkludert de målrettede prøvene ovenfor. Produksjonsbygg og Serwist fullførte, og `npm run verify` avsluttet med kode 0. Sidebyggingen logget manglende lokal database ved enkelte dynamiske oppslag; bygget håndterte dette, men kjøringen er ikke en lagrings-/databasetest. Siste tilgangsrettelse er i tillegg kjørt gjennom egen typekontroll og målrettet lint etter endringen; begge bestod.
- Faktisk databasegjenlesing, bildeopplasting, tilgang mellom skoler, nettbrudd, flere enheter og livescoring er ikke verifisert ennå.
- Første kontrollerte del lagres på egen arbeidsgren. Ingen PR, merge eller deploy av denne leveransen er utført. CI og faktisk produksjon er ikke kontrollert for denne grenen.

## Avklaringer og neste avhengigheter

Spurt Anders om målavstandens enhet i ni-hullsputting og om spillere skal se felles live resultatliste eller bare egne resultater. Ingen svar registrert. Impact Location og de fysiske måleprotokollene trenger dessuten konkret faglig grunnlag før de kan låses.

Fortsett TB01–TB02 med de gjenstående sekundærverdiene, versjoneringen og protokollavklaringene. TB03 er bestilt, men designet må fullføres og kontrolleres i Claude før portering. TB05–TB06 kan videreføres uavhengig der logikk og tilgang er avklart. TB07–TB10 er ikke ferdige: skjermportering, felles testdag, bilder, reell lagring/live, pilot og sluttkontroll gjenstår.

## Ekstra tilgangsfunn under gjennomføringen

`src/app/admin/tester/page.tsx` har rolle-/rettighetsvakt via `MANAGE_TESTS`, men dataspørringene for resultater, pågående økter og antall mangler avgrensning til trenerens spillere. Dette eksisterende avviket er nå rettet i `admin-resultat-data.ts`: alle fire spørringer bruker `coachScopedPlayerWhere`, og andre roller avvises før databaseoppslag. To nye regresjonstester med simulerte databasekall består og kontrollerer begge trenere, administrator og avviste roller. Faktisk radisolasjon må fortsatt prøves i lokal database i TB06. Kontroller også coach-gruppetilhørighet mot separat delingsgrunnlag i WANG/TN; ikke betrakt en rettighetsknapp som radtilgang. Ingen produksjonsdata er lest for dette funnet.

Sikkerhets-/personvernvakt for første kodedel: ingen utvidede rettigheter (treneroversiktens lesetilgang er snevret inn), ingen nye offentlig tilgjengelige ruter, ingen nye lagringsfelt og ingen eksterne dataoverføringer. Råmålinger leses på serveren og gjøres om til visningstekst; de sendes ikke samlet til klienten i disse endringene. Den samlede datadelingen og øvrige brukerreiser er fortsatt ikke ferdig verifisert, så testbatteriet kan ikke kalles lanseringsklart.

## Språkkontroll mot master

`docs/treningsplanlegging.md` kapittel 2.4 og 4.1–4.3 styrer synlig språk også i WANG/TN. PEI bruker desimalkomma og mellomrom før prosenttegn. Lagringsstatus skal være «Kunne ikke lagres», med meldingen «Endringene kunne ikke lagres. Prøv igjen.»; første designprompt hadde den kortere varianten «Kunne ikke lagre». Øktstatus er «Gjennomført».

Masteren bruker fot for putting og mph for Club Speed/Ball Speed. Designpromptens foreslåtte centimeterfelt for Putt Speed må derfor justeres i brukerflaten før portering: bevar kilde-/registreringsenheten eksplisitt, men bruk fot som ordinær puttingvisning og dokumenter omregningen. Den matematiske fasiten for 10 cm absolutt avvik beholdes (10/30,48 fot); dette er ikke en ny påstand om kildens enhet. «Putt 1–3 m» og andre offisielle protokollnavn må fortsatt identifisere kilden; enhetskonvertering i visningen må aldri endre fysisk testoppsett. Masterens visningsregel avgjør ikke om de umerkede tallene i ni-hullskilden opprinnelig betyr meter eller fot; den konkrete kildeavklaringen står fortsatt åpen. Ingen ny ordliste er opprettet.

## Oppsummering før lagring på arbeidsgren

Kontrollert diff: beregning/visning, trenerens radtilgang, syntetiske regresjonsprøver og datert gjennomføringsunderlag. Ingen hemmeligheter, ekte spilleropplysninger, produksjonsskriving, invitasjoner eller e-post. Eksisterende samtykke- og foresattvakter er beholdt. Den avsluttende visningsteksten «Resultatet må kontrolleres» er kontrollert med seks egne visningsprøver etter tekstjusteringen. Automatisk datostempel i `docs/ordbok.json` er tilbakeført; språk-masteren er ikke endret.

## Videreføring etter bestilling om fullføring og merge

Arbeidsgrenen er oppdatert med `origin/main` på `55bf1d5ca` (lokal merge `08fe725ac`). Kontrollstatus ovenfor gjelder første del; denne seksjonen dokumenterer videreføringen.

### Beregning og historikk

- Nærspill Gate og VISA Express summerer manuelle desimalpoeng. Fasit 12,5 beholdes.
- Wedge Gate teller ni treffvilkår. Driver Gate teller seks faktiske treff. Putt Gate krever både ren gate og lengdesone; en rett putt som er for kort/lang krever ikke oppdiktet sidebom.
- Putt Speed beregner gjennomsnittlig absolutt restavstand. Råenheten (m/cm/fot) og kort/lang beholdes; resultatet vises i fot. Kort og lang utligner ikke hverandre.
- Ny regelutgave `tn-excel-v3-2026-10-02` har egne definisjons-ID-er. Gamle definisjoner, rådata og utkast beholder utgaven fra 10.09. Ukjente og feil kombinerte versjoner avvises.
- Teknikk C har fem grunnmålinger og fem måleforsøk i ny utgave. Gamle 15-radersutkast kan fortsatt åpnes med sin opprinnelige versjon. Fullføring venter fortsatt på Impact Location.
- Syv tidligere sperrede varianter er åpnet. Totalt 34 varianter kan fullføres; ni-hullsputting og teknikk A/B/C har fortsatt konkrete faglige sperrer. Fysiske protokoller er fortsatt ikke ferdig implementert.

### Faktisk lokal databasekontroll

Egen container `ak-hq-testbatteri-20261002-db`, kun `127.0.0.1:56022`, database `testbatteri_20261002`. Skjema generert fra prosjektets Prisma-skjema i en tom database, uten produksjonsdata eller produksjonslegitimasjoner. Testen kontrollerer vert, port, databasenavn og egen identitetsrad før skriving. Se [testoppskriften](../../tests/testbatteri-local/README.md).

**35 av 35 databaseprøver bestod:** alle 34 fullførbare protokoller gjennom utkast, gjenlesing med separat SQL-klient, avvist annen spiller, fullføring, gjentatt innsending og historisk resultatkontroll, samt én prøve med samtidige rettelser. Innlogget identitet og etterarbeid er isolert; dette beviser ikke Auth, RLS, nettleser eller produksjon.

To faktiske feil ble oppdaget og rettet:

1. PostgreSQL JSONB kan endre feltenes rekkefølge. Sammenligning med `JSON.stringify` avviste identisk gjentatt innsending. Spiller- og trenerhandlingene sammenligner nå nøkler og verdier uavhengig av rekkefølge.
2. Gjenlest flyttall kunne være `0,0161410033903111` mens beregningen var `0,016141003390311135`. Helt eksakt likhet kunne derfor skjule gyldige resultater. Kontrollene tillater nå kun maskinpresisjonens avrundingsstøy (16 × Number.EPSILON), mens reelle score-/enhetsavvik fortsatt avvises. Visningsavrunding brukes aldri som sammenligningsgrunnlag.

### Claude Design og overlevering

Alle tre prosjektene har nå klikkbare testmoduler og testdagprototyper med kildeuttrekket fra vedleggene. Private prosjektarkiver er lastet ned via Claude Designs eksport. Arkivene er kilde-/designbevis, ikke ferdig appkode. De er lagret under `Documents/Claude/akgolf-hq/testbatteri-kontroll-2026-10-02/design-eksport/`.

Korrigeringer i denne runden: Precision Innspill Basis bruker faktisk tilpasset mål i PEI, og holder tilpassede serier utenfor standardrangering. Team Norway-baneføring bruker restavstand til hull, korrekt påkrevd hullnummer og ballplassering, og beholder standard-/faktisk mål separat. WANG har rettet målserier, språk og bildeoppstart. Claude rapporterer egne skjerm-/tilstandsprøver; dette erstatter ikke Codex sin uavhengige sammenligning mot appen.

### Gjenstående omfang

Skjermportering fra den nye eksporten, automatisk/offline lagring per forsøk, private forsøksbilder, felles arrangement på tvers av skoler/grupper, deltakerføring, tilgangskontroll gjennom hele reisen og ekte liveoppdatering er fortsatt uferdig. Disse delene må ikke merkes fullført eller blandes inn i en påstand om at hele testbatteriet er lansert.

Fagspørsmålene om ni-hullsmål, Impact Location, fysiske protokoller og hvem som får se felles spillerliste er sendt til Anders og står fortsatt ubesvart. Allerede avklarte poeng-/gate-/speedregler er gjennomført uten å be om ny godkjenning.

Sikkerhetskontroll for den opprinnelige egenføringen: ingen nye åpne ruter, ingen utvidelse av eksisterende spiller-/coachrettigheter, ingen nye produksjonstabeller eller lagringskategorier. Alle prøvepersoner er syntetiske og ligger kun lokalt. Senere tillegg omfatter nå egen spillerføring på aktiv TN-testdag, privat bildeindeks og automatisk køoppdatering; se oppdatert [scorekort- og autolagringskontroll](testbatteri-scorekort-og-autolagring-2026-10-02.md). Flerskolemodell, WANG-kobling og full liveoppdatering er fortsatt uferdig.

Oppdatert isolert databasekontroll 02.10: **37 av 37 prøver bestod**, inkludert unik og eier-/øktkoblet metadata for privat testbilde. Tabellen ble opprettet med additiv SQL mot `127.0.0.1:56022/testbatteri_20261002`; RLS-status ble kontrollert som aktiv. Ingen bucket eller produksjon ble endret.

### Eksportidentitet og uavhengig kontroll

Siste private designarkiver (SHA-256):

- Precision: `40db63fff699e2dc8ef8d06b64f2ffc64f92e8251bd991d7009ececfdb42fb83`.
- WANG: `94ec9278498c217a831ced9a4657202ddff30f7db9fe18807fef1577740c151a`.
- Team Norway: `6cb7fd24df5b3069982f8e9fa741b73c272687753be5b82706739e844d598080`.

Codex har gjenåpnet Precision-scorekortet etter siste retting: Driver 270 med rest 8,64 m viser foreløpig PEI 3,2 %. Skjermbevis: privat `claude-design-sluttkontroll-pei.png`. Prototypen merker lagring som simulert. Dette er designkontroll, ikke bevis på bildeopplasting eller liveoppdatering i appen.

Siste målrettede kodekontroll bestod med 105 av 105 prøver. I tillegg bestod 35 av 35 lokale databaseprøver. Full kvalitetskontroll og CI dokumenteres separat når de er avsluttet.

### Avsluttet lokal kvalitetskontroll

Full `npm run verify` avsluttet med kode 0: 4 024 kodetester, 18 komponenttester, statiske vakter, TypeScript, lint, produksjonsbygg og Serwist bestod. Egen dokumentkontroll bestod etter oppdatering av rapporten. Siste rene innrykksretting og presisering av versjonsfeilmeldingen er også kontrollert med målrettet lint, og inngikk i den etterfølgende byggkontrollen. Kontrollen brukte ikke produksjonslegitimasjoner; databasebeviset kommer fra den separate lokale prøven beskrevet over. GitHub CI og merge er neste separate steg.

### Videreføring på oppdatert main, 02.10.2026

Etter ombasering mot `c8a44556a` og PR #1096 bestod full `npm run verify` med Node 24 og 8 GB maksminne. Prisma, TypeScript, lint, prosjektvakter, komplette kildetester, 94 komponenttester, produksjonsbygg og Serwist passerte; lint rapporterte 76 advarsler og 0 feil. Byggingen logget gjentatte meldinger om manglende lokal database og deaktivert AI, men sluttet med suksess. På samme versjon bestod 177 målrettede tester og 37/37 prøver mot isolert PostgreSQL. Reell Supabase Storage-bøtte/opplasting, flerskolearrangement, full livestrøm, Claude Design-sluttgodkjenning, CI, PR og merge gjenstår.

### Kontrollpunkt etter lokal sluttkontroll

Commit `d96195ba0` (`fix: make test session saves retry-safe`) inneholder kun serverhandlingen for retry-sikker lagring og aktiv egen tildeling, sesjonskvittering og regresjonstester. Verifikasjonen på samme arbeidsversjon bestod: full `npm run verify`, 177 målrettede tester, 37/37 isolerte PostgreSQL-prøver, 5/5 nettleserlagerprøver, 36/36 Excel-/kildeprøver og dokument-/diffkontroll. Øvrig scorekort-, foto-, GDPR-, offline- og testdagkode står fremdeles utenfor committen i arbeidskopien. Ingen PR, push, merge eller deploy er utført. Denne committen lukker ikke åpne krav om WANG-skolegrupper, felles flerskolearrangement, resultatmottakere, sanntidsstrøm, privat Storage-bøtte eller Anders' visuelle godkjenning.

### Rebasing og opplasting-sikkerhet

Den opprinnelige committen `d96195ba0` er bevart i sikkerhetsstash før oppdateringen; samme tre filers endring er rebassert som `c9f53ea41` oppå PR #1098 (`3cbe3e216`). Main sin sperre mot egenredigering av trenerførte testdagøkter er beholdt; spillerføringen tillater bare en aktiv, egen tildeling med aktivt medlemskap. På den nye arbeidskopien består bilde-rutetestene 8/8, eksport-/GDPR-/fotoprøvene 54/54, lokal PostgreSQL 37/37 og full `npm run verify` med 4 310 kildetester og 94 komponenttester. Multipart leses nå med en håndhevet kroppsgrense uavhengig av `Content-Length`, endringer krever samme `Origin`, og opplasting/opprydding gir generelle tjenestefeil uten interne detaljer. Selve Storage-bøtten, ekte bildeopplasting og mobilkamera er fortsatt uverifisert.
