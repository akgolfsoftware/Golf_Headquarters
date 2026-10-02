# Testbatteri: scorekort og automatisk lagring

Videreføring av [hovedplanen](../planer/testbatteri-felles-testdag-og-livescoring-2026-10-02.md). Grunnlaget ble merget i PR #1086. Denne rapporten dekker også pågående privat bildefunksjon, spillerføring på Team Norway-testdag og automatisk oppdatering av den eksisterende TN-køen. Den dokumenterer ikke flerskolearrangement, WANG-deling eller full visuell eiergodkjenning.

## Design og funksjon

Referanse: Claude Design «AK Golf Precision Athletics», prosjekt `7d7c2994-cf63-4c5f-9bdc-fdaf67655a70`, `ui_kits/testbatteri-komplett/`, eksport 02.10.2026 SHA-256 `40db63fff699e2dc8ef8d06b64f2ffc64f92e8251bd991d7009ececfdb42fb83`.

Ett aktuelt forsøk, 64 px tallfelt, 56 px valg, oversikt som kan åpne hvert forsøk, oppsummering, lys/natt og eksisterende PlayerHQ-navigasjon. Desktop følger 1,3/1-kolonnene; mobil én kolonne. Appens eksisterende Precision-verdier brukes der eksportens variabelnavn er annerledes. Ingen ny formel eller stille endring i protokollversjon.

Claude Design ble kontrollert direkte 02.10.2026 på 1440 × 900 og 390 × 844. Den sammenhengende Precision-prototypen viser arrangør, WANG-skoler, Team Norway-gruppe, flere stasjoner, puljer, én spiller med medlemskap i to grupper uten dobbel tildeling, registrering fra stasjon og liveoversikt fra bekreftede registreringer. Syntetisk 8-ball-registrering gikk fra «Lagrer …» til «Lagret» med én av 24 forsøk og foreløpig 3 av 96 poeng. Dette er simulert prototypelagring, ikke backendbevis eller Anders' designgodkjenning. WANG-prosjektet viser egne oversikts-, scorekort-, historikk- og testdagsskjermer; spillerens profil/historikk er skilt fra arrangør- og stasjonsinnsyn. WANG-prototypen har eksplisitt tilgangstest for skoletrener, annen WANG-skole, TN-trener via aktiv spillerdeling, utløpt deling og stasjonsleder uten historikk; dette må porteres som tilgangsregler og verifiseres i databasen.

Prototypene markerer fortsatt kilde-/produktavklaringer for ni-hullsenhet, Impact Location, fysiske normer/belastning og offentlig felles resultatliste. Kildemerknaden i WANG-prototypen sier selv at Excel/PDF ikke er kontrollert mot designet. Den visuelle gjennomgangen dokumenterer derfor retning og skjermfamilier, ikke endelig kildefasit, alle responsive tilstander eller visuell godkjenning.

Rå inntasting lagres i eieravgrenset IndexedDB før sending. Gyldige delregistreringer sendes etter 600 ms ro; nye registreringer kan fortsette under sending. Nett-/serverfeil beholder sendingen; gjenforsøk bruker nøyaktig samme UUID, revisjon og verdier. En kvittering gjelder bare den sendte utgaven. Nyere tastetrykk blir liggende i køen. Tomme felter er ikke nulltall. Ugyldige eller midlertidige tallstrenger bevares lokalt, men sendes ikke som falske målinger.

Det finnes én ventende, frosset sending per økt. Hele rådatasettet bevares; forsøksidentiteten er kombinasjonen økt-ID, protokollversjon og radnummer. Forsøkene ligger fortsatt i øktens rådatasett; bildet får en separat `TestSessionPhoto`-indeks med unik kombinasjon av økt og forsøksnummer.

Serveren kontrollerer innlogging, eier, versjon, antall og testdagstildeling før den aksepterer en gjentatt operasjon. En spiller kan nå åpne sin aktive tildeling i PlayerHQ; handlingen kobler økten til samme deltaker og lagrer ett resultat på spillerprofilen. Testdag, aktivt gruppemedlemskap, spilleridentitet og protokollversjon kontrolleres i samme transaksjon. En gammel operasjon overskriver aldri en nyere. Avslutning og fullføring er fortsatt atomiske med resultatet.

Valgfritt bilde per lagret forsøk går til privat `tn-test-photos`. Serveren kontrollerer spiller, foresattesamtykke, økteierskap og gyldig forsøk, undersøker faktiske bildefilbytes, avviser SVG/animasjon og lager metadatafri WebP. Filen får kortlivet signert lenke. Bilde deles ikke automatisk med gruppe eller trener. Eksport inneholder filreferanse; kontosletting fjerner først fil og deretter indeks, slik at Storage-feil kan prøves igjen. Kode og målrettede prøver er lagt til, men bucket, SQL, produksjon og faktisk mobilkamera er ikke kontrollert.

Den eksisterende Team Norway-køen leser lagrede deltakerøkter og viser antall gyldige forsøk. Aktiv oversikt ber serveren laste ny databasevisning hvert fjerde sekund. Fullført score kommer fra TestResult; ufullstendige målinger vises som fremdrift, ikke som en oppdiktet totalscore. Dette er polling, ikke bekreftet push/sanntid. WANG-køen og ny flerskole-/stasjonmodell er ennå ikke koblet på.

## Kontroller

- Faktisk nettleserprøve på egen lokal opprinnelse, bare syntetiske verdier: 5 av 5 IndexedDB-kontroller bestod. Rådata og frosset sending overlevde ny tilkobling; samtidige skriver ga én vinner og synlig konflikt; avbrutt transaksjon rullet tilbake; kontobytte tømte data og sperret gammel eier; utlogging slettet data og avviste en forsinket skriving. Kontrollskjermbilde ble vist under arbeidet.

- 37 prøver mot isolert lokal PostgreSQL: 34 fullførbare varianter, samtidige rettelser, tapt utkastkvittering og én privat bildeindeks med unik per-forsøk-grense. Innloggingsidentiteten er erstattet i disse testene, ikke database eller lagringshandling. `test_session_photos` ble opprettet additivt i den isolerte databasen; kontroll bekreftet RLS aktivert.
- Etter innsynsoppdatering på `main` (PR #1096) er WANGs gruppeport, navngitt trenerdeling og samtykke kontrollert på nytt: 49/49 tester bestod. Foto/GDPR/lagring og PlayerHQ-testdag bestod også; sammen med kilde-/formatteringsprøvene er 177 målrettede tester grønne. Dette beviser ikke en flerskolearrangementsreise.
- Egen lokal Auth på `127.0.0.1:56021`, database på `127.0.0.1:56022`, app på localhost:3062. Bare syntetiske kontoer; ingen produksjonsdata, e-post, betaling eller hemmeligheter kopiert.
- Appreise med ekte lokal innlogging: Driver Gate, seks forsøk → tre treff og 50 %. Fullføring og separat gjenåpning fra databasen kontrollert.
- Driver 270, fem registreringer med carry 270 og side 8,64 → PEI 3,2 %, restavstand 8,64 m. Fullført i appen.
- Mobil 390 × 844: dokumentbredden er 390; lyst tema og nattema er avbildet. Desktop 1440 × 900 er avbildet i begge temaer. Dette er Codex-kontroll, ikke Anders' visuelle godkjenning.
- To faner med samme utkast: den tapende fanen viser egne verdier og konflikt, tilbyr nedlasting og overskriver ikke den andre fanen.
- Testen dekker lokal gjenopptakelse og eierbytte, men ikke en varig avbrutt nettforbindelse gjennom en allerede åpen appfane. Etter ombasering mot PR #1098 bestod full `npm run verify` 02.10.2026: 4 310 kildetester, 94 komponenttester, statiske kontroller, produksjonsbygg og Serwist. I tillegg bestod 37/37 isolerte PostgreSQL-prøver og 54 målrettede bilde-/GDPR-prøver. Kjøringen logget forventede meldinger om manglende lokal database/AI-tjeneste under prerendering. CI, Supabase-bøtte og faktisk bildeopplasting, visning på flere enheter og flerskolearrangement er ikke verifisert.

Private skjermbilder ligger under `Documents/Claude/akgolf-hq/testbatteri-kontroll-2026-10-02/appkontroll/`, aldri i Git eller public.

## Personvern og begrensninger

Lokale utkast tømmes ved utlogging eller kontobytte. Gamle utkast ekskluderes etter sju døgn og ryddes ved neste autentiserte åpning. Serverlagrede TN-økter følger eierens kontoeksport. Kontovask tømmer TN-notater, operasjonskvittering og ukjent JSON, og bevarer kun validerte råmålinger. Ingen delingsrett eller trener-/spillersperre er utvidet.

Konfliktløsing viser foreløpig ikke begge server-/klientverdier side om side: egen kopi kan lastes ned, og lagret versjon åpnes. Et helt lukket program kan ikke starte offline fra denne dynamiske ruten; rådata fra en allerede åpnet test overlever nettbrudd og kan gjenopptas når appen er tilgjengelig igjen. Bildefunksjonen er ikke testet med faktisk kamera og privat Storage-bucket. Felles arrangement på tvers av flere grupper/stasjoner, WANG-visning/deling og mottakernes liveoppdatering må fortsatt gjennomføres og kontrolleres.

Arbeidsgrenen er oppdatert mot `origin/main` 02.10.2026, inkludert PR #1096s navngitte WANG/TN-deling. Gjeldende WANG-app avgrenser trenerlisten til gruppen `wang-toppidrett`; egne campusgrupper som WANG Oslo/Fredrikstad/Bergen finnes ikke i gruppeoppsettet. Designets flerskolearrangement kan derfor ikke kobles direkte til dagens WANG-tilgangsmodell. Ny modell må holde arrangementsdata atskilt fra navngitt profil-, testhistorikk- og bildedeling.
