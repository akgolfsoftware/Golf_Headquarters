# Portering av de fire appflatene — 10.09.2026

Anders har bestilt at **alle skjermene i PlayerHQ, AgencyOS, interne Team Norway og WANG** skal porteres til kode. Han har valgt designgrunnlaget nedenfor. Arbeidet skjer på `codex/portering-fire-flater-2026-09-10`. Hele bestillingen er fortsatt under arbeid.

## Valgte kilder

| Flate | Valgt kilde | Kontroll |
|---|---|---|
| PlayerHQ og AgencyOS | `Player HQ Train lock (4).zip` | 527 filer. SHA-256 `2bfe81ac5d3f131e5a667fca28205732119e2f6c36c0b50178b57953626fbd85` |
| Interne Team Norway | `Claw Design — Team Norway Golf.zip` | 255 filer. SHA-256 `a43b6e6f18a4cbf3b1b27c661e991104e8e0d441d94d5b17a39b243fc7d8eddc`. 230 sammenlignbare designfiler er identiske med `designsystem/team-norway/`; overleveringens LES-MEG er det eneste nye sammenlignede dokumentet |
| WANG | Eksisterende `designsystem/wang/` | Valgt av Anders som WANG-grunnlag. Registeret beskriver 35 designskjermer; antallet er ikke en påstand om 35 ferdige app-ruter |

To lerretsfiler i Train-lock-pakken er tomme: `AX-01 Skall v3.dc.html` og `PH-17 Meg v2.dc.html`. De er ikke visuelle referanser. Pakkens komponentkilder og øvrige fylte skjermreferanser må brukes der de gir tilstrekkelig grunnlag.

ZIP-originalene ligger i Downloads. Utvalgte designfiler er pakket ut lokalt under `_archive/design-kilder-2026-09-10/`. Kopierte agent-/skill-kataloger fra pakkene er utelatt. Kildeinstrukser om sletting, datamodellendring eller publisering er ikke nye autorisasjoner.

**Train-lock ZIP (4) inneholder v3 «Warm»**, med Geist/Geist Mono, varm lys grunnflate og egne mørke/lyse fargeverdier. Det nye, ruteavgrensede laget er nå lagt inn for PlayerHQ og AgencyOS, inkludert Geist via Nexts fontlasting, lys start i PlayerHQ og mørk i AgencyOS. Lagret tema vinner. Hele skjermene må fortsatt kontrolleres mot pakken; import av verdier alene fullfører ingen skjerm.

## Omfang og beviskrav

Den ferske kodeskanningen finner 171 PlayerHQ-sidefiler, 163 AgencyOS-sidefiler, fire under `/team-norway` og fire under `/team-wang`. [Maskinlesbart register](portering-fire-flater-2026-09-10.json) inneholder samtlige 342 eksisterende sidefiler og deres ramme-/tilstandsfiler.

Dette er et utgangspunkt. Designenes foreslåtte nye ruter, faner, overlegg og tilstander kommer i tillegg. Videresendinger må undersøkes; de er ikke automatisk egne skjermer eller tillatelse til sletting. H1-registeret i ZIP-en bygger på eldre kode og kan bare brukes som koblingsforslag. Mønstre uten egen tegning må knyttes til konkrete felt og handlinger fra den fungerende appen.

Hver reise trenger kilde/versjon, faktiske data og handlinger, verifisert tilgang, mobil/desktop, avtalte temaer, tom/lastende/feil/lagring/fullført og relevante sidegrener. Visuell vurdering av Anders registreres separat fra tekniske kontroller. Ingen av de fire områdene er dokumentert ferdig.

## Første gjennomførte kodearbeid: TN-18

- Tilgangsskjermen har nå personrader på mobil og eget detaljsteg med tilbakevei. Bred skjerm beholder tabell og detaljpanel på 400 piksler.
- Felles TN-knapp følger Claw-størrelsene og støtter native knapp-egenskaper, sperret tilstand, fokus og kildevariantene. Feltene har koblede etiketter, feilmeldinger og bevarte verdier.
- Lagring/avslutting sperrer gjentatte innsendinger, viser bekreftelse og beholder valg ved uventet feil. Siste-trener-sperren er bevart. Ny person gir nytt skjemautkast.
- Tilgang kontrolleres før listen hentes. Eksisterende serverhandlinger og datamodell er beholdt. Ingen reelle tilganger er endret.
- Mobilmenyen har aktiv-rute-markering, knapp på minst 44 piksler og Escape som gir fokus tilbake.

Det gjenstår å bygge TN-18s trenerkatalog/invitasjon, avstemme alle designvarianter mot reelle data og gjennomføre innlogget kontroll. Arbeidet er ikke en fullført TN-leveranse.

## Train-lock: felleslag og Nå-kort

- `data-train-lock="4"` følger direkte åpning og klientnavigasjon, også fullskjermruter uten V2Shell. Øvrige flater beholder sine skrifter og paletter.
- Lys papirflate, hvite kort, varm fremdrift, 24-pikslers kort og 32-pikslers arktopp følger valgt v3. Fem ark brukte en ugyldig sammensetting av radius; de leser nå hele radiusverdien én gang.
- Nå-kortet har status, metadata som chips, fleksible knapper og fremdrift. Dagens kalender, tester, godkjenningskort og øvrige innganger er beholdt. Ukeindikatoren bruker eksisterende `WeekPlanProgress` for TrainingSessionV2 og skjules uten planlagte minutter. Den er **ikke** en samlet fullføringsmåling for alle øktmodeller; Workbench-kobling gjenstår.
- Ni rute-/tematester og 32 nettleservarianter bestod. Dette gjelder komponentene, ikke hele I dag, navigasjonsskallet, full treningsreise eller endelig fontgjengivelse.
- Kildens små signalfargede tekster holder ikke alltid kontrastkravet. Den målte tilpasningen står i [kildespeilet](../../designsystem/train-lock/valgt-zip-4/README.md). Kontrastverktøyet viser nå både eldre og valgt lag, 88 par og 25 problematiske kombinasjoner. Disse kombinasjonene er ikke godkjent som liten tekst.

### PlayerHQ-navigasjon, andre del 11.09

Første del er lagret lokalt i `608afccf2`. Den påfølgende endringen erstatter V2Shells gamle PlayerHQ-dock med valgt Islands fire faner og mikrofon. Menyen er fast, 64 px høy, med 48 px sirkler og 12 px løft over safe-area. Stående iPad beholder menyen; Mac får 64 px sideskinne med fire destinasjoner. Mikrofonen åpner Caddie i et ark, og kladden beholdes ved lukking. På iPad/Mac åpnes arket fra høyre med 380 px bredde. Stemmekomponenten rendres i samme nettleserlag og holder tastaturfokus. I dag har egen mikrofonknapp på Mac; øvrige V2Shell-sider har inngangen i sideskinnen. Gammel fade ved rutebytte er fjernet for PlayerHQ.

Åtte komponentvarianter bestod sammen med de tidligere 64. Innlogget kontroll av hele skallet, bevegelse ved faktisk rutebytte, full I dag-geometri og AgencyOS-navigasjon gjenstår. Stemmekomponentens visuelle innhold er fortsatt eldre enn v3. Den pågående endringen er ikke en fullført skjermreise.

## WANG C7: innlogging

Skjemaet sender nå e-post og passord til eksisterende Supabase-innlogging, beholder feltene ved feil, sperrer gjentatt innsending og går tilbake til WANG ved suksess. WANGs navnefrie fellesside, glemt passord, trenerflate og eksisterende elevadministrasjon har ekte lenker. Den åpne demoen for å skrive elevnavn er erstattet av eksisterende beskyttet elevadministrasjon; ingen lagrede brukere er slettet.

Mobil og desktop følger C7s kort, topp og tilgangspanel. Tilgangsteksten lover ikke skoleregler eller funksjoner som ennå ikke er kontrollert. Kildens oppdiktede «tre forsøk / 15 minutter» er ikke lagt inn. Tolv skjema-/feilvarianter bestod med syntetiske svar; faktisk innlogging og retur med en testkonto gjenstår.

### Feil funnet i det faktiske Next-bygget

Nettleserprøven avdekket at CSP-nonce bare ble satt på svaret og i `x-nonce`, mens Next leser den fra forespørselens `Content-Security-Policy`. Den samme, uendrede policyen følger nå begge veier, også etter fornyelse av sesjonscookies. WANG-innloggingen hadde dessuten `force-static`, som fjernet forespørselsverdiene; den rendres nå dynamisk. Ingen tilgangsregler eller produksjonsvariabler er endret. To regresjonstester kontrollerer at serverens policy overstyrer klientverdier og bevares ved cookie-fornyelse.

C7 er ennå ikke visuelt ferdig: desktop har fortsatt en egen blå overskrift over skjemaet, mens kilden samler dette i et hvitt kort. Avstander og mobilens tilgangspanel må avstemmes. Kildens tilgangstekst motsier seg selv mellom mobil og desktop; appen lover bare kontrollert oppførsel.

## Gjennomgang etter emil-design-eng

| Before | After | Why |
|---|---|---|
| Eldre Poppins/ren hvit lysflate på PlayerHQ/AgencyOS | Valgt Geist, varm papirflate og eget tema per område | Følger ZIP (4); temavalg bevares |
| TN-18 klippet tabell på mobil | Personliste og eget detaljsteg | Samme oppgave er mulig på liten skjerm |
| WANG ignorerte utfylte innloggingsfelt | Ekte innsending med venting og feiltilstand | Én innlogging i skjermen brukeren faktisk fylte ut |
| Ark fikk en ugyldig sammensatt radius; kalenderlukk var 32 px | Én radiusverdi og kalenderlukk på 44 px med fokusretur | Fungerende geometri og berørings-/tastaturbruk |

## Faktisk kontroll

`npm run verify` bestod i den isolerte arbeidskopien, inkludert Nexts produksjonsbygg og Serwist. `npm test` bestod til slutt med 2 294 tester, inkludert de to nye regresjonstestene for CSP/cookie-fornyelse. Kontrollene bruker syntetiske miljøverdier og kjører ingen migrasjoner.

`wang-next.py` bestod 11.09 i det faktiske Next-bygget på 390 og 1280 px: Montserrat, ingen breddeoverløp, aktiv CSP, ny nonce per forespørsel, korrekte Next-skript og ekte feltverdier frem til Supabase-SDK-en. Forespørselen ble avskåret lokalt med et syntetisk feilsvar; feil bevarer feltene. Ingen skript- eller CSP-feil ble registrert. C7s originale mobil- og desktoprammer er rendret med de samme fontfilene. Dette beviser ikke vellykket innlogging eller skolens tilgangsmodell.


Den [lokale komponentprøven](../../tests/visual/portering/README.md) bestod i 20 varianter: fire bredder (320, 390, 834, 1440) med liste, valgt person, tom, lasting og feil. Den prøver også navigasjon, tastaturmeny, dobbeltinnsending, nettfeil med nytt forsøk, bevarte felt, siste trener, feltnavn og redusert bevegelse. Ingen JavaScript-feil ble registrert.

Prøven bruker faktiske appkomponenter med syntetiske serversvar, simulert Next-ruting og lokale reservefonter. Den beviser ikke innlogget lagring, produksjonsoppførsel, nøyaktig fontgjengivelse eller visuell godkjenning. Bilder og råresultat ligger Git-ignorert under `_archive/portering-kontroll-2026-09-10/`.

Supabase-prosjektet `Golf_Headquarters` (`dcnxoztjtdqoidaekxry`) er bekreftet tilgjengelig. Bare tabellmetadata er lest for å planlegge datakoblingene. Pakkens gamle påstander om manglende modeller må kontrolleres mot dagens skjema og kode før nye modeller foreslås. En oppført RLS-verdi er ikke bevis på korrekt tilgang.

GitHubs [CI](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/34526418860) og [produksjonsrøyktest](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/34526418763) er grønne for hovedgrenens `8e6f346d`. De gjelder ikke denne lokale arbeidsgrenen. Endringene her er ikke pushet eller publisert.

## Neste innganger i hele bestillingen

1. Fullfør kontrollene for TN-18, inkludert valgt referanse og appens faktiske font-/rutingmiljø.
2. Fullfør I dag og navigasjonsskallet mot v3; port I dag → Plan → økt → oppsummering og Analyse. Felles typografi/tema og Nå-kort er påbegynt og komponentprøvd.
3. Bygg TN-skall, oversikt, eksisterende poster/dokumenter og alle øvrige TN-skjermreiser. Kontroller datakoblinger mot dagens skjema.
4. Port WANGs 35 registrerte skjermdesign og deres tilstander, med eksisterende årsplan, gruppe-/elevtilgang og fagdata som funksjonsgrunnlag.
5. Gjennomgå alle rader, nye ruter og manuelle overlegg; full kodekontroll, relevante integrasjonsprøver og sammenligning med valgt design før ferdigstatus. Arbeidslisten eies fortsatt av MASTERPLAN-GJENSTAAENDE.
