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
