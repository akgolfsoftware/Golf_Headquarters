# DataGolf og turneringsdata i AK Golf HQ

Kontrollert 10.09.2026. Opprinnelig bestilling: analysere data som hentes inn og anbefale optimal bruk. Anders bestilte deretter ferdigstilling i prosjektet. Se [implementasjon og kontroll](../planer/datagolf-spillerverktoy-2026-09-10.md) for endringer gjort etter analysen. Databasemålingene nedenfor beskriver tilstanden ved analysen.

**Avklart formål fra Anders:** DataGolf skal være et verktøy for spillere inne i appen, der de kan sammenligne seg med proffene og forstå hvor gode proffene er. Dette styrer prioriteringen nedenfor. Den første anbefalingen la for stor vekt på treneroppfølging og treningsplanlegging.

**Anbefaling:** Bygg rundt **velg proff eller referansegruppe → utforsk ferdighetene → sammenlign med egne tall → forstå forskjellen → prøv selv**. Verktøyet skal gi innsikt, nysgjerrighet og motivasjon også før spilleren har registrert egne tall. Treningsplanlegging er en mulig videre handling. De målte datakvalitetsfunnene gjelder fortsatt og må håndteres for måltallene som tas i bruk.

**Hva som er kontrollert.** Nåværende kode i AK Golf HQ og innhentingsprosjektet `ak-golf-pipelines`, planlagte jobber i begge prosjekter, DataGolfs offisielle dokumentasjon og 15 lesende SQL-spørringer mot Golf_Headquarters. Datakontrollen eksporterte bare summer og datadekning, ingen spilleridentiteter eller individuelle resultater. Målingene er separate øyeblikksbilder, ikke én felles databasetransaksjon. Ingen innhenting, dataendring, utsending eller publisering ble startet.

[Maskinlesbart målegrunnlag](datagolf-datakontroll-2026-09-10.json). Tall nedenfor er målt nå; eldre dokumenters antall er ikke gjenbrukt som nåstatus. Innloggede skjermreiser og driftslogger er ikke testet i denne analysen.

**1. Hvilke data som faktisk finnes**

| Datasett | Målt dekning | Bruk og begrensning |
|---|---|---|
| DataGolf-runder i historikklageret `dashboard` | **1 306 489 runder**, 26 tourkoder, 3 605 turneringer med runder; år 1983–2026 | Alle har total-SG. Bare **313 102 / 23,97 %** har alle fire kategoriene. Ikke komplett historikk for alle tourer og år. |
| DataGolf-runder i appens `public`-lager | **757 928 runder**, 3 448 spillere, 3 165 turneringer | 244 577 har alle kategorier. Seneste tilknyttede turneringsdato er **21.06.2026**; siste rundeoppdatering **24.08.2026**. |
| DataGolf-deltakelser i `public` | **248 783** | Bare **527** har plassering, **880** har score til par og **0** har samlet bruttoscore i deltakelsesraden. Bruttoscore finnes derimot i mange underliggende runder. |
| GolfBox-runder i `public` | **183 997**, 9 475 spillere, 2 032 turneringer | Bruttoscore uten SG; siste tilknyttede turneringsdato 08.09.2026. Spillerantallene i ulike datasett kan overlappe. |
| WAGR- og NCAA-runder i `public` | **4 215 WAGR-runder**, **92 NCAA-runder** | Ingen SG-kategorier. NCAA har i tillegg 199 turneringer med deltakelser; 92 er antallet normaliserte runder, ikke all collegeinformasjon. |
| DataGolf-ferdighetsprofiler i `public` | **457 spillere × 3 tourmerker = 1 371 rader** | De samme 457 spillerne og alle kontrollerte SG-/driververdier er identiske i PGA, Euro og KFT. Ikke tre ulike populasjoner. Sist oppdatert 07.09.2026. |
| Historiske ferdighetssnapshots i `dashboard` | **2 221 rader / 457 spillere**, 19.07–06.09.2026 | Daterte modellanslag; bedre utgangspunkt for historikk enn en årsrad som overskrives. |
| Detaljert innspill i `dashboard` | **474 spillerrader**, datert 08.09.2026 | Mapper brede fairwayintervaller til smalere lagringsfelt ved å kopiere samme verdi. Gir ikke reell 25-yards oppløsning. |
| Treningsreferanser: «tak-pakken» | **6 aktive proffer og 36 bånd** | Alle 36 har nærhet, SG per slag, greentreff, gode slag og antall slag. Dette er et nyttig, allerede fylt grunnlag. |
| Generelle innspillsreferanser | **0 `sg_baselines`**, **5 `pga_approach_distance`** | De fem radene er faste verdier fra koden, merket `datagolf-approach-skill`. Alle fem mangler GIR. |
| Putt per avstand | **10 rader** | Fast estimattabell merket Broadie. Ingen løpende DataGolf-puttdata per avstand. |
| Spillerdekomponering – modellens delbidrag | **503 rader / 438 spillere** | Alle 503 mangler kontrollert `true_skill`, total-SG, OTT, APP og rangering. Radantall betyr her ikke brukbar analyse. |
| Separate sluttresultater, prediksjoner, odds og fantasydata i `dashboard` | **0 rader** i hver av de kontrollerte tabellene | Delvis støttet i innhentingskoden, men ikke tilgjengelig som fylt funksjon. |

I tillegg ligger norske deltakelsesresultater i `dashboard`: Olyo 55 106, Nordic League 22 786, Srixon 6 090, GolfBox 6 000, Norgescup 3 029 og to Østlandstour-kilder med 824 samlet. Disse er **deltakelser**, ikke antall runder, og kan overlappe med `public` og andre kilder. De skal ikke legges sammen til «unike norske resultater» uten identitetskontroll.

**Detaljdybden varierer mye.** PGA har 306 162 runder med alle fire SG-kategorier, LIV har 6 940. De øvrige 24 kontrollerte tourkodene, inkludert Euro og KFT, har ingen runder med alle fire kategorier i dette lageret. Det betyr ikke at kategoriinformasjon aldri kan finnes hos kilden; det beskriver det som er lagret her.

**2. Hvordan dataene kommer inn og når skjermene**

| Innhenting | Konfigurert rytme | Mål og nåværende bruk |
|---|---|---|
| DataGolf-kalender for PGA, Euro, KFT og ALT/LIV | Daglig i HQ | Turneringskalender, offentlige turneringssider og planlegging. Kalenderdata er oppdatert 10.09. |
| DataGolf-spillerliste, norske spillere | Ukentlig; også i mandagskjeden | Offentlige profiler og kobling til egen spillerkonto. |
| DataGolf live-statistikk for PGA/opp | Hvert 10. minutt i HQ | Siste råsvar lagres per turnering; deltakelse, plassering og score til par oppdateres. Detaljert live-SG normaliseres ikke til spillerens historiske runder her. |
| Ferdighetsprofiler, puttreferanser, innspill og tak-pakke | Ukentlig i HQ | Offentlig PGA-statistikk, sammenligning, DataGolf-kort og treningsstasjon. Flere ulike rutiner leser samme API med forskjellig forståelse. |
| Historiske DataGolf-runder | Daglig jobb i eget Python-prosjekt | Skriver til `dashboard`; ferskeste lagrede turneringsdato 06.09.2026, siste innsetting 08.09. |
| DataGolf-speiling til `public` | Separat, manuelt startet jobb | Dette er forbindelsen til lageret spillerens DataGolf-kort faktisk leser. Den er ikke automatisk lik den daglige historikksynken. |
| GolfBox | Kalender daglig; resultatjobb hver time 06–20 UTC | Norske tourer/klasser, frister, runder og kobling til spillerens turneringer. |
| GJGT, Clippd/college og Golfstat | Egne dags-/ukejobber i HQ | Kalender, deltakelser og varierende resultatdybde. |
| WAGR, Nordic League, juniortourer og college | Egne jobber i pipeline-prosjektet | Beriker `dashboard`; egne tabeller og sammenstilte oversikter må avstemmes mot appens lager. |

En konfigurert jobb er ikke bevis på en vellykket kjøring. Eksempel: siste DataGolf live-snapshot i databasen er 31.08.2026. Dette alene beviser ikke driftsfeil; kalenderen og hvilke tourer som faktisk har live-dekning må vurderes samtidig.

`src/lib/dashboard-data/queries.ts` har lesefunksjoner for runder, tidslinje, årskull og utvikling, men ingen direkte kall fra appens skjermkode ble funnet. Intelligence-klienten har også DataGolf-metoder uten funnet skjermbruk. Det finnes altså lagrings- og lesearbeid som ennå ikke gir spillerverdi. Coachens eksisterende spilleroversikt viser turneringsresultater gjennom andre, enklere tabeller.

**3. Funn som må håndteres før nye treningsløfter**

**A. Rå SG vises som True SG.** Importen kopierer `historical-raw-data/rounds.sg_total` direkte. DataGolf-kortet kaller snittet av disse rundene `trueSg` og trekker fra en aktuell ferdighetsrating som «Rest». Rå SG måler prestasjon mot feltet i den aktuelle runden og banen; det er ikke automatisk justert for feltstyrke. Dermed er denne differansen ikke et dokumentert mål på form eller tilfeldigheter. Kilde: [DataGolfs rådatadefinisjoner](https://datagolf.com/raw-data-notes). Kode: [kortets datalesing](../../src/lib/portal-stats/datagolf-data.ts), [importoversettelsen](../../../ak-golf-pipelines/pipelines/datagolf/transform.py).

Anbefaling: vis «SG mot rundefeltet» for disse verdiene. Bruk «True SG» bare når en verifisert justert serie foreligger. En eventuell egen feltjustering må ha eget navn, metode og validering. Ikke beregn «Rest» mellom ulike referanser eller tidsgrunnlag. En historisk prestasjon kan først vurderes mot et modellanslag fra før turneringen; dagens anslag kan allerede inneholde resultatet.

**B. Ferdighetsanslag er feil lagret som tour-/sesongstatistikk.** `pga-sync.ts` henter samme ferdighetsliste tre ganger og setter ulik tour og inneværende år. Målingen bekrefter identiske rader. Driving varierer fra −28,097 til +22,552 og accuracy fra −17,1 til +12,3 i lagringen; dette er relative størrelser, ikke faktisk slaglengde og absolutt treffprosent. Ferdighetsratingene er modellanslag på prestasjon, ikke ordinære sesongsnitt. Se [Skill Ratings](https://datagolf.com/skill-ratings) og [forklaring av driververdiene](https://datagolf.com/frequently-asked-questions).

Anbefaling: lagre én datert ferdighetsprofil per spiller. Lag reelle tourreferanser fra faktisk deltakelse og sammenlignbare runder, med tydelig vekting. PGA, KFT og Euro må ikke dannes ved bare å bytte etikett. Enkelte feilmerkede offentlige undersider er allerede sperret i produksjonskoden; det løser ikke datagrunnlaget.

**C. Innspill har to inkompatible innhentingsmodeller.** Tak-pakken leser spillerens faktiske brede bånd. De eldre rutinene forventer derimot rader med `dist`, `lie` og `sg_gained`. Den generelle SG-baselinetabellen er tom. PGA-innspillsrutinen skriver uansett faste avstander **3 / 5 / 7,5 / 10,2 / 12 meter**, med DataGolf-kildemerke. Disse verdiene er bekreftet i databasen. Kode: [PGA-synk](../../src/lib/stats/pga-sync.ts), [eldre SG-synk](../../src/lib/sg-hub/datagolf-sync.ts), [korrekt båndlesing](../../src/lib/datagolf/tak.ts).

Anbefaling: én validert innspillsadapter. Bevar kildens bånd, underlag, måleenhet, periode og antall slag. `dashboard`-importen må heller ikke fremstille kopierte 50-yards-bånd som separate observerte 25-yards-bånd.

**D. «Du slo proffen» overdriver hva øvelsen viser.** Stasjonen bruker nærhet × elevens carry / midtpunktet i proffens avstandsbånd. Det er en egen treningsregel, ikke en DataGolf-validert ferdighetskonvertering. Nærhetsmålet er dessuten justert for slagets vanskelighet hos DataGolf; et gjennomsnitt er verken treffgrense, median eller spredningssirkel. Se [DataGolfs innspillsforklaring](https://datagolf.com/frequently-asked-questions).

Kodefunn: valgt rough bruker fortsatt fairwaybåndets midtpunkt i skaleringen. «Lekkasje» settes fra referanseproffens SG, ikke elevens egne resultater. Resultatteksten hevder at eleven slo proffen på et antall slag. Kode: [stasjon](../../src/lib/datagolf/stasjon.ts), [skalering](../../src/lib/datagolf/tak.ts).

Anbefaling: behold det motiverende formatet, men kall det «treningsmål inspirert av proffreferansen» og skriv «7 av 10 innenfor målet». Vis faktisk elevsnitt og utvikling ved samme testoppsett. Sammenligning mot tour krever sammenlignbart underlag, avstand, registrering og nok observasjoner. En sirkel må merkes som valgt treningsmål, ikke sannsynlighetsområde.

**E. Testfasiter kan drifte på feil grunnlag.** `benchmark-sync.ts` skalerer driver-testnivåer som forholdet mellom nye og gamle relative driveranslag, og lar køllehastighet følge lengden. Relative anslag kan være nær null eller skifte fortegn; forholdstall er derfor ikke en robust skaleringsmetode. Kopierte PGA/KFT-profiler forsterker problemet. Ingen endring av testfasiter er gjort i denne kontrollen.

Anbefaling: faglig vurdering av synken før den brukes til nye nivåbeslutninger. Hold versjonerte Team Norway-/NGF-testprotokoller adskilt fra løpende tourreferanser. Ikke endre historisk vurdering av en test fordi verdenseliten flytter seg denne uken. [Koden](../../src/lib/admin/benchmark-sync.ts).

**F. Turneringsslutt og rundedata møtes ikke.** Python-speilingen lager historiske deltakelser som `FINISHED`, men skriver ikke plassering, samlet score eller korrekt cut-/WD-status til deltakelsesraden. Den lagrer selve rundene. Sluttresultattabellen er tom. Dermed finnes omfattende rundedata bak svært ufullstendige resultatkort. Appens turneringsstatistikk leser dessuten ett bestemt JSON-format i `rounds`, fremfor felles normaliserte runder. [Resultatstatistikk](../../src/app/(marketing)/stats/turneringer/[slug]/statistikk/page.tsx).

Anbefaling: materialiser én entydig deltakelsesoppsummering fra kilden og de fullførte rundene, med separat plassering, bruttoscore, score til par, antall runder og status. `CUT` er ikke `DNF`; spilleren kan ha fullført alle rundene vedkommende fikk spille. Ikke bland to og fire runders totalscore i samme prestasjonsfordeling. I speilingen til `TournamentResult.score` blandes også score til par og bruttosum som alternativ i samme felt; skill disse størrelsene før analysen bygger på dem. [HQ-speiling](../../src/lib/turneringer/materialize-entry.ts).

**G. Estimat kan bli behandlet som egen måling.** Den offentlige SG-sammenligningen fordeler snittscore på SG-kategorier fra en fast tabell og lagrer dette som `MANUELL`, samme kildeetikett som faktisk oppgitt SG. Coachens benchmarklesing bruker nyeste slike rad. En total bruttoscore forteller ikke hvor spilleren tapte slag. [Sammenligningshandlingen](../../src/app/(marketing)/stats/sg-sammenlign/actions.ts), [estimatoren](../../src/lib/stats/sg-estimator.ts), [coachens lesing](../../src/lib/intelligence/benchmark-provider.ts).

Anbefaling: lag estimater i et eget spor som ikke blir målt spillerhistorikk eller personlig treningsdiagnose. Registrer alltid hvilken SG-referanse en import eller egenregistrering bruker. «Manuell», «TrackMan» og «DataGolf» er datakilder, ikke tilstrekkelig informasjon om sammenlignbarhet.

**H. Oppdatert dato og historikk må kunne stoles på.** Historikkleseren filtrerer på innsettingstid, mens spillerkortet bruker turneringens dato for alle rundene og som «oppdatert»-dato. Kortets turneringer sorteres også etter formaterte `dd.mm.åååå`-strenger. Innhentingen hopper som standard over allerede synkroniserte turneringer, slik at senere kildekorrigeringer ikke nødvendigvis kommer inn. De ulike kildene oppdateres uavhengig.

Anbefaling: separate datoer for konkurranse, runde, kildens oppdatering og egen henting. Bruk tidsverdier til sortering. Oppdater nylig avsluttede turneringer igjen og ha en kontrollert rutine for eldre rettelser. Varsle om manglende dataoverføring til skjermlageret selv om rådatainnhentingen er grønn.

**4. Spillerverktøyet: «Meg mot proffene»**

Arbeidstittel, ikke et endelig designvalg. Verktøyet har to like viktige oppgaver: gjøre proffnivået forståelig og la spilleren sammenligne egne prestasjoner med et relevant, tydelig beskrevet grunnlag.

| Spillerens spørsmål | Anbefalt funksjon | Grunnlag |
|---|---|---|
| **Hvor god er denne proffen?** | Søk etter eller velg en proff. Se ferdighetsprofil, styrker, turneringsresultater og utvikling. | Datert DataGolf-profil og faktisk tilgjengelige resultater. Manglende kategoriinformasjon gir en enklere profil. |
| **Hvor står jeg sammenlignet med proffen?** | Egne tall og proffens tall side om side, med forskjellen forklart i vanlig språk. | Egne runder, import eller målinger. Direkte differanse bare når enhet, målemetode og referanse er sammenlignbare. |
| **Hvordan skiller proffene seg fra hverandre?** | Velg to proffer og sammenlign utslag, innspill, nærspill, putting og resultater der data finnes. | Samme metrikk og periode. Ferdighetsanslag og faktisk turneringsprestasjon presenteres som forskjellige visninger. |
| **Hvor nær slår de fra denne avstanden?** | Utforsk innspill etter kildens avstandsintervall og fairway/rough. Vis nærhet, greentreff, gode slag og antall slag. | Start med de seks proffene og 36 utfylte båndene som allerede finnes. Utvid til flere profiler når deres detaljer er tilgjengelige. |
| **Hvordan ser et typisk proffnivå ut?** | Velg en navngitt proff eller et dokumentert tourutvalg; se gjennomsnitt og variasjon der dette kan beregnes. | Bygg reelle utvalg. De identiske PGA/Euro/KFT-kopiene kan ikke brukes som tre ulike nivåer. |
| **Kan jeg prøve selv?** | Gå fra en valgt referanse til en tydelig utfordring, registrer egne slag og se eget resultat. | Forklar tilpasninger. Skriv eksempelvis «7 av 10 innenfor treningsmålet». En skalert sirkel beviser ikke at eleven har samme ferdighet som proffen. |
| **Nærmer jeg meg?** | Lagre favorittreferanse og følg egen utvikling ved samme måling. | Bevar referanseversjonen. Vis om forskjellen endres fordi spilleren forbedres, proffens anslag endres eller begge deler. |

**Anbefalt spillerreise:**

1. Åpne verktøyet og velg en proff eller et dokumentert referanseutvalg.
2. Utforsk en ferdighet eller proffens turneringsresultater, uten krav om egne data.
3. Velg «Sammenlign med meg». Bruk eksisterende egne målinger der de passer; vis en enkel vei til å registrere det som mangler.
4. Se egne tall og profftall sammen med en kort forklaring på forskjellen. Skill mellom direkte sammenligning og illustrerende referanse.
5. Velg eventuelt «Prøv selv» og gjennomfør et tydelig beskrevet oppsett.
6. Lagre egen måling og se utvikling mot samme referanse over tid.

**Spilleren trenger ingen DataGolf-ID.** ID-en er nødvendig for å finne den valgte proffen hos DataGolf, men egne appdata kan tilhøre enhver spiller. Utforsking skal være fullt nyttig uten egne målinger; egen sammenligning blir tilgjengelig per måltall etter hvert som spilleren har passende data.

**Gjør tallene konkrete.** Bruk meter for avstand i presentasjonen, med originale avstandsgrenser bevart i omregningen. Forklar SG som slag vunnet eller tapt mot den angitte referansen. En forskjell i prosentpoeng må ikke merkes som prosentvis forbedring. Vis god og svak prestasjon like leselig. Beskriv hva proffene vanligvis gjør, ikke bare rekordrunden.

**Eksempel på skjerminnhold, uten oppdiktede resultater:** «Innspill fra fairway» → velg kildens avstandsintervall → se proffens referanse og ditt registrerte resultat → «Dette måles likt» eller «Proffreferansen er justert; din måling er ujustert» → «Prøv selv». Ikke presenter statistisk justert nærhet som en målt råavstand eller en sikker treffgrense.

**Tilleggsbruk:** Treneren kan bruke samme sammenligning i en samtale og spilleren kan ta et mål videre til Plan. Turneringsplanlegging, coachvarsler og offentlig statistikk er tilgrensende bruksområder, og styrer ikke førstegangsreisen for dette spillerverktøyet.

**5. Felles regler for statistikken**

Hvert måltall bør følge en liten datakontrakt: kilde, person/gruppe, faktisk målt eller estimert, referansenivå, måleenhet, per slag/per runde/per turnering, periode, antall observasjoner, datadekning, versjon og oppdateringsdato.

| Type tall | Kan brukes til | Skal ikke automatisk tolkes som |
|---|---|---|
| Bruttoscore / score til par | Resultat, egen historikk og kontekst | Netto, handicap eller kategori-SG |
| Rå turnerings-SG | Prestasjon mot rundefeltet på aktuell bane | True SG eller globalt ferdighetsnivå |
| Verifisert justert SG | Sammenligning på tvers der metoden tillater det | Identisk med alle andre SG-systemer |
| DataGolf Skill | Datert anslag på ferdighet | Sesongsnitt, siste runde eller faktisk driver-carry |
| Innspillsstatistikk per bånd | Referanse for et definert intervall og underlag | Et eksakt tall ved hver meter eller en elevs svakhet |
| Broadie/IUP-baserte egne slagberegninger | Slagprestasjon mot angitt referanse | DataGolf-observasjon |
| PEI/testresultat | Prestasjon i en spesifisert test | Samme måleskala som SG |

Et kildemerke alene er ikke nok til å avgjøre om to tall kan trekkes fra hverandre. «0 = feltsnitt» må navngi hvilket felt; spillerkortets HCP 0–5-utvalg er koblede appbrukere med DataGolf-runder, ikke et representativt utvalg av alle spillere med HCP 0–5.

Manglende verdi skal være manglende, ikke null prestasjon. Nuller skal samtidig bevares som gyldige resultater. Percentiler krever en faktisk fordeling og et beskrevet utvalg; de kan ikke utledes fra ett gjennomsnitt. Fastlåste minsteantall bør behandles som produktregler som må prøves mot variasjon og beslutningsrisiko, ikke universelle statistiske sannheter.

**6. Innhenting og arkitektur som støtter dette**

- Behold Python som innhenting, og etabler én autoritativ lesekontrakt som både coach og spiller bruker. Velg eksplisitt om skjermene skal lese et klargjort utvalg fra historikklageret eller et automatisk vedlikeholdt `public`-speil. Ikke introduser en tredje uavhengig beregning av samme tall.
- Avstem turnering og spiller på kildens ID, tour og år. Bruk en eksplisitt kobling mellom kilder, og håndter flere klasser i samme arrangement. Navn alene og navnebasert nettadresse er ikke tilstrekkelig identitet.
- Samle API-lesing og validering. Mål oppdaterte, avviste og manglende felt, ikke bare antall upsertede rader. En dekomponeringsrad med null i alle faglige felter skal ikke rapporteres som vellykket analyseimport.
- Gi historiske rettelser en vei helt frem til resultatkort, statistikk og treningsgrunnlag. Separat status per datasett og per overføring mellom lagre.
- Server ferdig beregnede, avgrensede perioder og summer til skjermene. Dagens spillerkort henter hele relevant rundehistorikk og grupperer i appkoden før det velger 12 runder. Millionlageret bør ikke flyttes til nettleseren eller behandles på nytt for hver sidevisning.
- Planlegg kall på tvers av jobbene. DataGolf oppgir 45 forespørsler per minutt; prosjektets 40-grense gir margin. Dagens separate prosesser må vurderes samlet, særlig når ukentlige jobber starter samtidig. [API-dokumentasjon](https://datagolf.com/api-access).
- Nye muligheter som feltoppdateringer, starttider, løpende statistikk og hullfordelinger vurderes etter at grunnlaget virker. Dokumentasjonen beskriver dem, men det betyr ikke at de er fylt i dagens app. Prognoser skal lagres før resultatet dersom de senere skal evalueres. [API-dokumentasjon](https://datagolf.com/api-access).
- Ikke utled banestrategi eller presise siktepunkter fra brede innspillsbånd alene. De importerte eksterne turneringene har ingen koblet `courseId`; historikklageret har heller ingen fylte bane-ID-er på eventene. Banetilknytning, utslagssted, lengde, faktisk spredning og situasjonsdata må på plass for slike råd.
- Behold prosjektets krav til DataGolf-attribusjon og avtalekontroll ved utvidet bruk. Denne analysen er ingen ny vurdering av lisens eller publiseringstillatelse, og innebærer ingen rådataredistribusjon.

**7. Anbefalt gjennomføringsrekkefølge**

| Trinn | Konkret leveranse | Ferdig når |
|---|---|---|
| **P0 – korrekt sammenligningsgrunnlag** | Rett måltall, kildeetiketter og enheter for profilene og innspillsdataene som tas i bruk. Skill rå SG fra justert SG og modellanslag. | Hvert brukt måltall har dokumentert betydning; de tre kopierte tourlistene brukes ikke som ulike utvalg. |
| **P1 – utforsk proffene** | Velg proff, se styrker og utforsk innspill per avstand/underlag. | En spiller uten egne data får et nyttig verktøy; de seks eksisterende referansene kan utforskes med ekte detaljer. |
| **P1 – sammenlign med meg** | Koble relevante egne målinger til samme visning og forklar forskjellen. | Det virker uten egen DataGolf-ID, og direkte differanser krever sammenlignbart grunnlag. |
| **P2 – sammenlign proffer og prøv selv** | To proffer side om side, praktisk utfordring og lagret eget resultat. | Proffstatistikk og egne treningsregler er tydelig forklart; resultatteksten beskriver det som faktisk ble målt. |
| **P2 – resultater og utvikling** | Ferske proffresultater, historikk, favoritter og egen utvikling mot en lagret referanse. | Kildekorrigeringer når skjermene; valgt periode og referanseversjon er synlig. |
| **P3 – bredere referanseutvalg** | Flere proffer og faktisk beregnede tour-/nivågrupper, med større statistikkdybde. | Hvert utvalg og måltall har verifisert dekning; manglende data erstattes ikke av antatte verdier. |

**Mål effekten:** om spilleren forstår proffnivået og sin egen sammenligning, finner relevante profiler, bruker «Sammenlign med meg», prøver utfordringer og kommer tilbake for å se utvikling. Følg samtidig datadekning, ferskhet og andelen gyldige sammenligninger.

**Foreslått første byggeoppgave:** En komplett spillerreise fra «Velg proff» til «Utforsk innspill» og «Sammenlign med meg», med de eksisterende seks referanseproffene og passende egne målinger. «Prøv selv» følger som videre handling. Den valgte proffen kan utforskes selv om egne tall mangler. Endelig visuelt uttrykk velges i det pågående Claude Design-arbeidet.

**Kontrollstatus:** Databasen er bare lest. Appkode, synkjobber, testprotokoller og produksjonsoppsett er ikke endret. Målingene bekrefter datadekning og mangler; de er ingen visuell godkjenning eller bevis på at alle skjermreiser virker. `npm run prosjekt:sjekk`, kontroll av rapportens 14 lokale kildelenker, JSON-totalsummer og diffkontroll bestod. 29 eksisterende tester for DataGolf-klient, kort, tak-pakke og stasjon bestod via `node --import tsx --conditions=react-server --test …`; disse bekrefter dagens implementasjon, ikke faglig gyldighet av modellen. Første forsøk med tsx-CLI ble stoppet av lokal IPC-sperre før testkjøring. Full `npm run verify` og produksjonsbygg er ikke kjørt for denne dokumentanalysen.
