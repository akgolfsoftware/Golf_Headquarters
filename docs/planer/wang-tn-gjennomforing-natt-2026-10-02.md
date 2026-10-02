# WANG / Team Norway — gjennomføring 02.10.2026

Anders har bestilt gjennomføring av [hele planen](wang-team-norway-playerhq-komplett-plan-2026-10-02.md) og merge til main etter verifisering. Denne filen er arbeidsstatus, ikke en ferdigmelding for appen.

## Arbeidsgren og avgrensning

- Første gren: `codex/wang-tn-iup-plan-2026-10-02`, merget via PR #1077.
- Andre gren: `codex/iup-sesongevaluering-2026-10-02`, merget via PR #1078.
- Tredje gren: `codex/iup-besvarelser-lagring-2026-10-02`, merget via PR #1080.
- Aktiv neste gren: `codex/iup-spillerreise-2026-10-02`, fra main `a437e1e11`.
- Worktree: `.claude/worktrees/codex-wang-tn-iup-plan` under prosjektets hovedmappe.
- Startgrunnlag for kodearbeidet: `da40e700a`, etter PR #1076.
- Andre aktive oppgaver arbeider med DataGolf/pipelines, Workbench, statistikk og testbatteriet. Deres endringer skal bevares og vurderes ved integrasjon.
- Nattlig oppfølging er opprettet i denne samtalen hvert 30. minutt til kl. 07:00 norsk tid. Automatiseringen er fortsettelse av arbeidet, ikke dokumentasjon på fullføring.

## Første leveranse: originaltro spørsmålskatalog

Implementert i `src/lib/iup/utviklingssjekk.ts`, tilhørende JSON og tester:

- IUP 2025: 154 spørsmål — Ung 34, Junior 41, Amatør 41, Profesjonell 38.
- IUP 2027: 162 spørsmål — Ung 34, Junior 43, Amatør 47, Profesjonell 38.
- Sju kategorier, original ordlyd, kildecelle, kildeår og kontrollsum er bevart.
- Originalskalaen er **1–5**, også i de lokale originalfilenes veiledning.
- Utkast tillater ubesvarte spørsmål. Levering krever samtlige spørsmål på valgt nivå.
- Ugyldige verdier, ukjent spørsmål, feil år/nivå og det eldre åttespørsmålsformatet avvises.
- Historikksammenligning krever samme kildeår, samme nivå og to leverte svar.
- Ingen aktiv standardversjon endres. Det tidligere godkjente 2025-grunnlaget og det nye 2027-grunnlaget holdes adskilt inntil versjonsvalget er avklart.

`scripts/check-iup-original.py` er en skrivebeskyttet kontroll mot de to kjente originalfilene. Den kontrollerer filenes SHA-256 før spørsmål leses og sammenligner alle 316 utviklingsspørsmål og 26 sesongspørsmål med katalogene. Ingen besvarelser, kontaktfelt eller originale arbeidsbøker legges i Git. Kjør med `python3 scripts/check-iup-original.py --iup-2025 <lokal-2025-fil> --iup-2027 <lokal-2027-fil>`.

**Viktig begrensning:** Dette er en kilde- og valideringsmodul. Den er ennå ikke koblet til spillerens lagring, års-/fireukerssjekk eller trenernes skjermer. Ingen brukerreise eller Excel-dekning er derfor ferdigmeldt på grunnlag av disse testene.

## Påviste integrasjonsavvik

| Område | Funn | Nødvendig neste arbeid |
|---|---|---|
| PR #1060, `oppfolging/regler.ts` | Validerer åtte spørsmål og skala 1–4 | Bruk originaltro katalog, eksplisitt kildeår og nivå; gamle svar beholdes som historiske data |
| PR #1060, trenerforslag | Godkjenning endrer forslagets status, men anvender ikke økt-/planendring i Workbench | Spillerhandling med før/etter, autorisasjon, versjonskonflikt og atomisk anvendelse |
| PR #1060, fireukerssjekk | Gruppe-/flateavgrenset lagring kan gi to IUP-er for én spiller | Kanonisk spillereid besvarelse og organisasjonsspesifikk frist/oppfølging må skilles |
| Spiller360 på main | Viser utviklingssjekk som ikke implementert og feil etikett «skala 1–8» | Koble faktisk besvarelse og godkjent skjermdesign; ikke bare endre etiketten |
| PR #1004 | Omfattende WANG/TN-port med avhengigheter; visuell godkjenning var oppgitt som uavklart | Kontroller nåstatus, valgt design og avhengigheter før gjenbruk; ikke blind merge |
| Personvern | Eldre fullprofil-samtykke omfatter ikke automatisk helse/private notater | Bevar gjeldende grenser; ikke utvid gammelt samtykke ved å gjenbruke navnet |
| DataGolf | Kundedistribusjon er ikke dokumentert lisensiert | Precision-design først med syntetiske data; lisens og feltfiltrering før ekte kundeaktivering |

## Neste leveranse: komplett sesongevaluering som datakontrakt

`src/lib/iup/sesongevaluering.ts` og tilhørende kildekatalog bevarer begge originalenes tre fritekstspørsmål og ti vurderingsspørsmål. Originalens skala 1–4 brukes separat fra utviklingssjekkens 1–5. Eksplisitt sesongstart/-slutt hindrer at et gammelt årstall i originalteksten blir ny datoperiode. Faktisk og planlagt fordeling skal hver inneholde FYS/TEK/SLAG/SPILL/TURN og summere til 100 prosent ved levering. Minst tre utfylte forbedringspunkter kreves. Utkast bevarer mangler og får ikke automatisk nullverdier.

Alle 26 sesongspørsmål er kontrollert mot originalfilene. Sju målrettede prøver bestod. Full `npm run verify` for andre leveranse bestod: 3 969 kodeprøver, 18 komponentprøver og Next-/Serwist-bygg. [PR #1078](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1078) ble merget 02.10 kl. 02:11 etter grønn GitHub-kontroll og Vercel på head `bdf2ba66d`; main ble `982debe6a`. Modulen ble levert som datakontrakt uten montert skjerm.

## Tredje leveranse: kanonisk lagring og historikk

`IupBesvarelse` og `IupRevisjon` gir begge skjemaer ett spillereid grunnlag med kildeår, originalens kontrollsum, nivå og periode. Serverlaget henter eier fra innlogging, validerer mot originalkatalogen og håndterer samtidige endringer, gamle klienter og gjenforsøk. Utkast bevares separat fra siste levering. Historikken leses 20 revisjoner om gangen. Ingen trenerlesing eller ny offentlig handling er aktivert av dette grunnlaget.

Dataeksport inkluderer alle revisjoner. Anonymisering sletter råsvar med tilhørende historikk. Ny SQL gir begge tabeller RLS og fjerner alle API-rettigheter for offentlige/innloggede klientroller. Datakartet er oppdatert; gammel fullprofil-deling får ingen utvidede rettigheter.

17 prøver mot en separat lokal database bestod, inkludert reelle transaksjoner, konflikter, eierkontroll og RLS. 30 prøver for eksport/anonymisering og separat TypeScript-kontroll bestod. Oppsett og avgrensning står i `tests/iup-local/README.md`. Full `npm run verify` bestod med 3 970 kodeprøver, 18 komponentprøver og Next-/Serwist-bygg. Ingen prøver ble hoppet over. Typekontrollen i bygget brukte 9,6 minutter; den ble fullført uten å hoppe over kontrollen.

Additiv SQL er deretter kjørt i det kontrollerte HQ-prosjektet `dcnxoztjtdqoidaekxry` som `iup_besvarelser_20261002`. Begge tabeller manglet ved forhåndskontroll. Etterkontroll bekrefter begge tabeller, RLS, ingen klientprivilegier/policyer for offentlig eller innlogget API-bruker, unike nøkler, valideringsbegrensninger og kaskadesletting. Ingen eksisterende brukerdata ble endret, og ingen IUP-svar ble registrert i produksjon som test. [PR #1080](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1080) ble merget kl. 02:51 etter grønn GitHub-kontroll og Vercel på head `7a75b2840`. Main ble `a437e1e11`. Spillerskjema og trenernes visninger gjenstår på dette tidspunktet.

## Kontrolljournal

- Katalog mot originalfiler: bestått, 154 + 162 spørsmål.
- Målrettede kilde-/besvarelsestester: 8 bestått.
- Første fullkontroll stoppet ved TypeScript på grunn av Node-minnegrense. Ny kjøring med prosjektets Node 24 og 8 GiB minnegrense bestod; ingen kontroller ble fjernet.
- Full `npm run verify`: bestått, 3 962 kodeprøver + 18 komponentprøver, ingen hoppet over; Next- og Serwist-bygg bestått. Bygget kjørte uten produksjonsmiljø og meldte manglende lokale databasetabeller/AI-konfigurasjon; dette er ikke bevis på produksjonsdata eller integrasjoner.
- Første leveranse: [PR #1077](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1077), GitHub `verify` og Vercel bestått. Merget 02.10.2026 kl. 01:52 norsk tid som `7430f5410`. Kontrollert PR-head `0544b7590`; ingen produksjonsbrukerreise er prøvd.
- Nettleserreiser, ekte lagring, begge trenerroller, eksport/sletting for nye svar og visuell sammenligning: gjenstår.

## Observert DataGolf-design

Claude Design har en leveranse under `ui_kits/datagolf-komplett/` i [Precision-prosjektet](https://claude.ai/design/p/7d7c2994-cf63-4c5f-9bdc-fdaf67655a70?file=ui_kits%2Fdatagolf-komplett%2Fdesktop.html&present=1). Designverktøyet rapporterer DG-01–DG-17, tilstander og overleveringskontrakt. Denne rapporteringen er ikke alene godkjenning.

Egen nettleserkontroll: desktopoversikt sett; valgt «SG innspill» og «Sesong 2025» i topplisten, åpnet syntetisk spiller, åpnet sammenligning og gått tilbake to ganger. Begge filtrene var bevart. Profilen skilte målt SG fra modell og opplyste at katalogprofilen ikke hadde PlayerHQ-konto eller privat IUP. Mobiloversikten er sett i den faktiske 390-rammen. Resterende skjermer, tallberegning, tastatur og alle tilstander er ikke kontrollert her. Prototypen er ikke koblet til appdata, og TN/WANG-versjonene må kontrolleres separat.

Nyere Precision-eksport `(77)` inneholder også `ui_kits/iup-komplett/`. Dens `dekningsmatrise.md` og `overforing-wang-tn.md` oppgir feilaktig 1–8 for 2025-svar. Originalfilen og kildekontrollen viser **1–5 for både 2025 og 2027**. Ikke kopier prototypens historikketikett eller skala inn i appen. Eksportens utviklingssjekk ligger under Målsetning, mens fireukersoppfølging skal nås fra I dag. Designets rapporterte testresultater er ikke appprøver.

## Neste etapper

1. Fullfør lokal kvalitetskontroll og kildekontroll; lag en avgrenset PR for kildegrunnlaget og planen. Merge først etter grønn kontroll på gjeldende commit.
2. Kontroller ny main og status i eksisterende WANG/TN-arbeid. Gjenbruk verifiserte endringer; ikke kopier de påviste feilene fra #1060.
3. Implementer kanonisk spillereid IUP med versjonert historikk, utkast, levering, eksport og sletting. Verifiser i separat lokalt miljø med syntetiske brukere.
4. Koble PlayerHQ og begge autoriserte trenerflater til samme data etter valgt design. WANG-testdeling til TN skal ikke gi komplett profil eller TN-medlemskap.
5. Implementer forslag/godkjenning, samlingsprogram/invitasjon og kalenderkobling med samtidighets- og duplikatvern. Prøv ingen ekte utsending som test.
6. Integrer testbatteri/testdag og pipeline-resultater med de andre oppgavenes verifiserte leveranser.
7. Følg DataGolf-rekkefølgen Precision → Team Norway/WANG. Kontroller hele feltregisteret og lisens før aktivering.
8. Kjør planens 26 akseptanseprøver, ark-for-ark-dekning og visuelle kontroller. Rapporter bestått, blokkert og uverifisert hver for seg. Hele planen er ikke ferdig før avvikene er lukket eller eksplisitt avgjort.

## Sikkerhets- og personvernkontroll av første leveranse

1. Ingen nye ruter, databasekall eller handlinger. Modulen kan ikke lese eller endre en annen brukers data.
2. JSON inneholder bare generiske spørsmål fra kjent skjema og kildemetadata. Ingen elevsvar, kontaktopplysninger, hemmeligheter eller private filstier.
3. Ingen ny lagring, samtykkeendring, offentlig visning eller sletting. Tilgang, samtykke og livsløp for faktiske besvarelser må implementeres og prøves ved tilkobling til serverlaget.

## Sikkerhets- og personvernkontroll av lagringen

1. `lagreEgenIup` og `hentEgenIup` bruker `requireSpillerActionUser`. Eier kommer fra innlogging; klientens ekstra eier-/gruppefelt avvises. Lesing av fremmed ID returnerer samme tomme resultat som ukjent ID. Slettet/anonymisert eier kontrolleres mot databasen. Dette er prøvd mot lokal database.
2. Kode og tester inneholder bare generiske spørsmål og syntetiske svar. Privat testkonfigurasjon er ignorert, med egen lokal rolle og passord. Ingen svar sendes til AI eller nye logger. Det finnes ingen ny offentlig rute, og SQL fjerner alle klientprivilegier på råsvarene.
3. Den faktiske handlingsvakten stopper barn uten nødvendig foreldresamtykke. Begge datatyper og hele revisjonshistorikken følger eierens eksport og slettes ved anonymisering. Kaskadesletting og API-sperrer er prøvd i den separate databasen. Trenerdeling, samtykketekst og montert spillerskjerm inngår i neste del og er ikke ferdigmeldt.


## Fjerde leveranse: spillerens evalueringsreise

Egen rute `/portal/mal/evaluering`, med inngang fra I dag og Målsetning. Bare aktive spillermedlemmer i en ikke-arkivert WANG-gruppe (Ung/Toppidrett-program) eller den kanoniske Team Norway-gruppen kan skrive. Et visningsnavn eller trenerrolle i gruppen gir ingen skriverett. Tidligere deltakere kan fortsatt lese egne svar. Full-tilgang, innlogging, rolle og foreldresamtykke kontrolleres også ved direkte kall til handlingene.

Skjermen viser originalspørsmålene fra eksplisitt kildeår og nivå, utkast/levering, revisjoner og sideinndelt historikk. Kilde- eller formatavvik blokkerer redigering. Samme skjema/periode gjenopptas også utenfor første listeside. Nettverksbrudd beholder samme lagrings-ID for gjenforsøk; samtidig redigering krever innlasting av siste revisjon. Nytt utkast beholder siste levering. Ingen råsvar lagres i nettleserlagring.

Designreferanse: `ui_kits/iup-komplett/v1.js` fra Precision-prosjekt `7d7c2994`, lokal eksport «AK Golf Precision Athletics (77).zip», SHA-256 `9ded841b0f8696697534eb13dae882b3783d351014dae3a92e6e2bba4f042f07`. Den feilaktige historikketiketten 1–8 er erstattet med originalens 1–5. Reell eksplisitt lagring erstatter prototypens `sessionStorage`-lagring. Ingen automatisk fireukersfrist eller sesongfrist er oppdiktet. Dette er registrerte avvik/avgrensninger, ikke Anders' visuelle godkjenning.

Målrettet kontroll: 25 prøver mot ekte lokal database, 12 komponentprøver og 2 handlingsprøver bestod. Eget lokalt Supabase-prosjekt `ak-hq-iup-app-20261002` er opprettet fra tomt skjema, med RLS på 218 tabeller og to syntetiske voksne brukere. Kun lokale porter 55821/55822 og app 3073 brukes. Ingen produksjonsmiljøfil er kopiert. Nettleserreisen bestod med reell innlogging og database: utkast/omlasting, levering, beholdt siste levering, konflikt fra gammel fane, mistet kvittering uten dobbeltlagring, fremmed eier, avsluttet medlemskap, komplett sesongevaluering 2027, null versus ubesvart, lesbar historikk, avbrutt navigasjon og innganger fra I dag/Målsetning. Mobil 390 px og desktop 1440 px er kontrollert med syntetiske data. Natt-tema ble prøvd via eksisterende designattributt, uten å innføre en ny temabryter. Automatisk logging av serverhandlingsargumenter i Next er slått av slik at fritekst ikke havner i utviklerterminalen. Full `npm run verify` bestod med 3 972 kodeprøver, 30 komponentprøver og komplett Next-/Serwist-bygg, uten hoppede prøver. [PR #1084](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1084) ble merget kl. 04:07 etter grønn GitHub-kontroll og Vercel på head `873bfab399`. Main ble `066ec330e`.

Gjenstår etter denne avgrensede reisen: tidsstyrt fireukers-/sesongoppfølging, trenernes lesing med riktig delingsgrunnlag, øvrige Excel-faner, forslag som faktisk anvendes i Workbench, samlinger, felles testdager, komplett DataGolf-/pipeline-integrasjon og sluttrapport med kildebevis per krav.


Sikkerhetskontroll for spillerreisen:

1. Eier hentes fra innlogging, aldri fra skjemaet. Direkte handlinger krever samme Full-tilgang og foreldresamtykke som siden. Fremmed eier og avsluttet medlemskap er prøvd mot ekte lokal app/database.
2. Katalogene inneholder originalspørsmål uten persondata. Tester og skjermbilder bruker bare syntetiske kontoer/svar. Rå besvarelser går kun til eierens beskyttede skjerm og tidligere etablerte eksport; ingen AI-kall eller ny ekstern deling. Nexts automatiske logging av serverfunksjonsargumenter er deaktivert etter observert testkjøring.
3. Foreldresamtykke håndheves av eksisterende vakt også ved direkte POST. Eksport/anonymisering fra PR1080 beholdes. WANG/TN får ingen ekstra lesegrunnlag fra medlemskapskontrollen for egen utfylling.


## Femte leveranse: navngitt trenerdeling

Utvider eksisterende `DelingsSamtykke` med navngitt mottaker og eget fullprofil-omfang; gamle gruppesamtykker endres ikke. Sjudagers invitasjon lagrer bare token-hash. Eier eller godkjent foresatt gir uttrykkelig nytt samtykke. Aksept krever samme bekreftede Auth-e-post og aktiv WANG/TN-trenertilknytning. WANG-elever kan dele med TN uten TN-medlemskap. Tilbaketrekking er også tilgjengelig for mindreårig eier og etter utmelding. Aksept/tilbaketrekking og autoriserte IUP-oppslag serialiseres per spiller. Den nye leseren viser bare kildevaliderte leveringer.

15 prøver mot den separate lokale databasen og 41 målrettede prøver for regler/logging/eksport/anonymisering har bestått. Prøvene omfatter feil trener/domene/skole, foreldregodkjenning og bortfalt relasjon, utløpt lenke, gjenforsøk, samtidighet, RLS, egen skole, WANG→TN og direkte oppslag etter tilbaketrekking. Ny kode er samordnet med Workbench-leveransen #1082; begge datakilder beholdes i eksport og anonymisering.

Dette er servergrunnlag. Nytt delingsskjema, invitasjonslevering, trenernes samlevisninger og samordning av eksisterende leseveier gjenstår. Ingen ekte invitasjon er sendt. Full `npm run verify` bestod med 4 048 kodeprøver, 48 komponentprøver og komplett Next-/Serwist-bygg. Den additive SQL-en er brukt i HQ-produksjon med migrasjonen `navngitt_trenerdeling_20261002`. Etterkontroll bekreftet RLS, ingen klientrettigheter/policyer, fire fremmednøkler, fire sjekkregler, ny mottakerkolonne og null invitasjoner. PR #1087 ble merget kl. 04:54:57 etter grønn GitHub CI (4 114 kodeprøver, 48 komponentprøver og bygg) og Vercel på head `5890a310f`. Main ble `3df5af7a6`; produksjonsdeploy `6800209192` ble bekreftet vellykket kl. 04:57:10.

Sikkerhet og personvern:
1. Identitet kommer fra innlogging; godkjent foreldrerelasjon og trenerens bekreftede Auth-e-post kontrolleres separat. Plattformadministrator får ikke en automatisk omvei til navngitt deling. Negative og samtidige tilfeller er prøvd mot lokal database.
2. Råtoken finnes bare i første opprettingssvar og akseptkallet, aldri i databasen, dataeksporten eller nye logger. Prisma-feilhendelser er gjort generiske fordi automatiske databasefeil kan røpe argumenter. Ingen invitasjoner eller svar går til ekstern AI.
3. Under 16 krever foresatt for å gi, men kan trekke selv. Eksport/sletting er utvidet sammen med ny lagring. Ingen gammel samtykketekst utvides, og ny tabell er lukket for Data API.

## Sjette leveranse: delingsreise og trenerens IUP-leser

`/portal/meg/deling` gir eier og godkjent foresatt egen delingsoversikt, oppretting med uttrykkelig samtykke og tilbaketrekking. Innganger ligger på de eksisterende delingssidene for spiller og foresatt. WANG-eleven kan velge TN uten TN-medlemskap. Invitasjonslenken leveres til spilleren for egen videresending; ingen e-posttjeneste eller ekte utsending er aktivert. `/auth/trenerdeling` viser ingen spillerdata før riktig innlogget trener har godtatt. Token brukes som fragment, fjernes fra adressen etter innlasting og lagres bare i minnet. Nettverksgjenforsøk bruker samme opprettings-ID. Mistet førstegangskvittering krever tilbaketrekking og ny lenke, fordi råtoken ikke kan hentes fra databasen.

`/portal/meg/deling/innsyn` viser navngitt trener kun kildevaliderte leveringer, perioder og revisjonshistorikk. Oversikten røper ikke et senere utkasts dato eller revisjonsnummer. Nytt oppslag krever fortsatt samtykke, bekreftet Auth-adresse, aktiv trener og riktig miljø. Uventet databasefeil behandles som feil, ikke som tomme svar. Manglende trenerbekreftelse gir stengt innsyn.

Egen nettleserkontroll med faktisk lokal Auth/SQL viste oppretting, avvist feil trener, akseptert riktig trener, 34/34 skrivebeskyttede 2027/UNG-spørsmål, skjult nyere utkast, aktiv status, tilbaketrekking og stengt direkte oppslag. Foresatt opprettet ny deling for syntetisk 14-åring; barnet fikk ikke nytt samtykkeskjema, men kunne trekke foresattes deling. 17 databaseprøver og fire nye komponentprøver bestod. 390/1440 px hadde ingen sidelengs rulling. Skjermbilder er private under Documents/Claude/akgolf-hq/trenerdeling-kode-2026-10-02.

Designreferanse: Precision `7d7c2994`, `iup-komplett/deling-navngitt`, eksport81 SHA-256 `cd9d5b358bd588d3b1428cd49c6db47a4eed2a6469c0c8f7ff3764a0073b92f1`. Reell innlogging erstatter rollebytter; originalens kildevaliderte spørsmål erstatter eldre prototypetekst. Navn på trener hentes ikke før aksept; e-post identifiserer mottaker. Duplikate lenker kan forekomme ved nye opprettinger; tilbaketrekking stenger alle for samme trener/miljø. Ingen ny fagregel om foreldrerequest eller automatisk avvisning av duplikat er innført. Anders har ikke visuelt godkjent denne appvisningen; natt-tema og komplett sammenstilling med referansen gjenstår.

Sikkerhet/personvern: Eier/foreldrerelasjon og bekreftet treneridentitet håndheves i serverlaget uavhengig av knappene. Lenke/hash inngår ikke i oversikten. Bare syntetiske kontoer brukes i prøver og private skjermbevis. Under16 kan ikke gi ny deling selv; eksport/sletting fra #1087 er beholdt. Offentlig akseptside har ingen spillerdata. Gamle gruppesamtykker utvides ikke.

**Avgrensning:** Dette er ikke fullført fullprofilinnsyn. Helse, meldinger, Workbench og andre profildeler er ikke koblet til den nye leseren, og eksisterende WANG/TN-leseveier må fortsatt samordnes. Ingen påstand om at alle Excel-faner er ferdige. Full `npm run verify` bestod med 4 114 kodeprøver, 52 komponentprøver og komplett Next-/Serwist-bygg. Dokumentkontrollen og diffkontrollen bestod. PR #1089 ble merget kl. 05:54:02 etter grønn GitHub CI (4 114 kodeprøver, 52 komponentprøver og bygg) og Vercel på head `a20baa5df`. Main ble `cb42e42d7`. Produksjonsdeploy `6800982318` og Vercel-status er bekreftet vellykket etter merge.

## DataGolf-design levert til videre kontroll

Alle tre DG01–17-moduler er laget i Claude Design, Precision først. Egen feltkontroll finner135/135 i hver; konkrete TN-enhetsfeil er rettet og kontrollert. Egen390/1440-kontroll av feltutforskeren har ingen sidelengs rulling. Kilder, eksporter, kontroller og gjenstående avvik står i [designkontrollen](../design-audit/datagolf-precision-wang-team-norway-2026-10-02.md). Dette er design, ikke appintegrasjon eller lisensiert kundeaktivering. Full visuell godkjenning og alle interaksjoner gjenstår.

## Sjuende leveranse: trenerens spilleroversikt

`/portal/meg/deling/innsyn` uten spillerparameter viser nå «Spillere som deler med meg», med inngang fra trenerens delingsside og tilbakekobling fra besvarelsene. Samme Precision-listekomponent og delingsreferanse brukes. Listen krever bekreftet WANG-/NGF-adresse, akseptert navngitt deling og fortsatt gyldig spiller-/trener-/foreldrerelasjon. Medlemskap alene, ventende lenker og gamle gruppesamtykker gir ingen navn i listen. WANG-elever kan vises hos navngitt TN-trener uten TN-medlemskap.

Databasen henter unike spiller/miljø-par før sidegrensen, slik at flere invitasjoner ikke fyller listen med duplikater. Navn leses først etter den aktuelle delingskontrollen, under samme spillerlås som tilbaketrekking. Maksimalt 20 kandidater kontrolleres per side; en side med bortfalte rettigheter kan være tom og fortsatt ha «Flere delinger».

20 prøver mot den separate lokale databasen og fem komponentprøver bestod. Ny prøving omfatter duplikater, feil trener, tilbaketrekking, WANG→TN, avsluttet treneransvar, ubekreftet adresse og 23 unike delinger fordelt 20/3. Første kjøring fant manglende syntetisk Auth-ID i den nye liste-fixturen; kun fixturen ble rettet, og full lokal databasesuite bestod deretter. Ekte lokal Auth-/nettleserreise viste riktig spiller i trenerlisten og åpnet samme leverte besvarelser. Listen er målt til 390/1440 px uten sidelengs rulling. Full `npm run verify` bestod med 4 114 kodeprøver, 53 komponentprøver og komplett Next-/Serwist-bygg. PR #1090 ble merget kl. 06:15:14 etter fersk grønn CI36962951232 (4 114 kodeprøver, 53 komponentprøver og bygg) og Vercel på head `2b504a350996bdefb52dcce9da45ffb400b42920`. Main ble `1f561cebbcaf6f860797f93df83b641a2b126a36`. Produksjonsdeploy `6801158780` ble bekreftet vellykket kl.06:16:44.

Sikkerhet/personvern: aktuell innlogget trener identifiseres fra bekreftet Auth; rå spiller-/gruppe-ID i sidegrensen er bare søkegrense, aldri rettighet. Parametrisert SQL henter kun kandidat-ID-er, mens navn krever separat gjeldende samtykke i samme transaksjon. Ingen ny lagring, eksport, e-post eller produksjonsmigrasjon. Testene bruker bare syntetiske data. Dette endrer ikke de eldre fullprofilleserne.


## Samlet kontroll etter sju leveranser

[Leveransekontrollen](wang-tn-leveransekontroll-2026-10-02.md) avstemmer alle 18 Excel-ark, de viktigste spiller-/trenerreisene og den automatiske turneringskjeden. Ny kontroll av begge originalfiler bestod med 342 identiske spørsmål. Junior Tours28.09 og Nordic League01.10 har grønne kjøringer; kontokobling på navn alene er fortsatt et konkret hull. Ingen ekte datarader eller produksjonslogger ble hentet. PR #1060 er fortsatt ikke mergeklar: feil spørsmålsmodell, egen gruppe-IUP og manglende anvendelse i Workbench.

Sluttkontroll av dokumentpakken på main-grunnlag `226acab39` bestod med full `npm run verify`: 4 183 kodeprøver, 89 komponentprøver og komplett Next-/Serwist-bygg. Den inkluderer annen økts Workbench #1091. DataGolf-eksportene er oppdatert til Precision82, TN4 og WANG3. Egen kontroll bekrefter TNs 306 layouttilstander og riktige godkjenningsmengder i alle tre; Precision/WANG beholder nå kvitteringen etter ny innlasting. Faktisk appintegrasjon gjenstår. Se designkontrollen for nøyaktige grenser og private bevis.
