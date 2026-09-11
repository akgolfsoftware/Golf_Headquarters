# Funksjonsregister — AK Golf HQ

> Samlet 11.09.2026: Dette er bevart planleggingsunderlag fra den separate produktoppgaven. Statusbeskrivelser nedenfor gjelder det oppgitte revisjonsgrunnlaget. Gjeldende rekkefølge og nyere leveranser står i [masterplanen](../MASTERPLAN-GJENSTAAENDE.md).

11.09.2026. Første samling til [produktintervju og gjennomføringsplan](produktplan-og-intervju-2026-09-11.md). Registeret dekker hovedområdene fra gjeldende arbeidsliste, den bevarte masterplanen, baneguideplanen, nyere leveransedokumenter og kodegjennomgangen. Det er ikke en påstand om at alle enkeltsider og eksterne avhengigheter er ferdig revidert.

## Slik leses statusen

- **Kode finnes:** implementasjon er identifisert, men full brukerreise og drift er ikke nødvendigvis prøvd.
- **Pågår:** separat, aktivt arbeid er identifisert. Det skal avstemmes, ikke startes på nytt her.
- **Planlagt:** beskrevet i en kilde; relevans og faktisk rest må kontrolleres før ny byggeordre.
- **Uavklart:** produktvalg eller kobling til kjørende app er ikke dokumentert tilstrekkelig.

En funksjon kan ha flere statuser fordi den består av flere deler. Vi registrerer «i main», «testet», «sett av Anders» og «bekreftet i drift» separat i funksjonskortet. Statusene under er daterte observasjoner; gammelt «merget» i arkivet er ikke en ny driftskontroll.

## Kilder

| Nøkkel | Kilde og hvordan den brukes |
|---|---|
| K1 | [Gjeldende arbeidsliste](../MASTERPLAN-GJENSTAAENDE.md) og [nåstatus](../STATUS-NÅ.md): aktive bestillinger og kontrollstatus. |
| K2 | [Produktregler](../platform/BUSINESS-RULES.md) og [Nordstjernen](../platform/NORDSTJERNE.md): produktets intensjon. Eldre designlåsing i Nordstjernen er overstyrt av siste beskjed og [designstatusen](../../designsystem/README.md). |
| K3 | [Bevart masterplan](../arkiv/opprydding-2026-09-10/masterplan-gjenstaaende.md): funksjoner og gamle beslutningskøer fra steg 0–20. Ingen arkivrad er automatisk en ny kjøreordre. |
| K4 | [Baneguide — produktdokument](../baneguide-produktdokument-2026-08-02.md): detaljert funksjonsliste og foreslåtte faser. Daterte status-, tids-, design- og regelverkspåstander må kontrolleres før bygging. |
| K5 | [DataGolf-spillerverktøy](datagolf-spillerverktoy-2026-09-10.md): nyere leveranse som erstatter flere eldre åpne DataGolf-rader. |
| K6 | [Styrkeprogram i FYS](../plan-styrkeprogram-fys.md): utkast til WANG-styrkeprogram og identifisert eksisterende datamodell. |
| K7 | [Tidligere produktintervju](../beslutningsgrunnlag/grillingen-runde6-2026-08-30.md): blant annet individuell spillerplan, gruppeplanlegging og coachens arbeidsdag. |
| K8 | [AK HQ Design](../design-system/ak-hq-designarbeid.md), [brukerreiser](../../.claude/skills/ak-hq-design/references/flyter-og-wireframes.md) og [skjermvedlegg](design/2026-09-05-komplett-designport-vedlegg-skjermer.md): dekning og arbeidsmåte. Daterte skjermstatuser er ikke fasit for ny kode. |

## Spillerens daglige arbeid

| ID | Område og innhold som skal beholdes i oversikten | Observasjon | Neste avklaring eller kontroll |
|---|---|---|---|
| P01 | Registrering, introduksjon, profil, programtilhørighet og eventuell nivåquiz | Kode finnes; nivåquiz står som rest i K3 steg 9. | Hva trenger spilleren for å få første nyttige handling? Kontroller hvilke introduksjonssteg som faktisk mangler. |
| P02 | I dag: neste økt, coachforslag, godta/avvise, ukestatus og veien videre | Kode finnes; ny utforming og samordnet øktstatus pågår i porteringen. REV-F7 er rettet i lokal commit `bb66959ef`. | Kontroller den samlede reisen og tidligste økt på tvers av dato og modell; ikke bygg rettingen dobbelt. |
| P03 | Planlegging: uke/måned/år, perioder, egne økter, gruppeøkter, maler, teknisk plan og kalender | Kode finnes; portering pågår. K3 steg 3, 5, 14 og K7 har flere underoppgaver. | Avstem publisert/skjult, egne/coachede økter, redigering og hvilke detaljer som skal følge en gruppeøkt inn i spillerplanen. |
| P04 | Gjennomføring: øktbeskrivelse, start, drill, registrering, opptak, pauser, avslutt/hopp over, oppsummering | Kode finnes; Live og lokal kø endres i annet arbeid. | Fullført er ikke det samme som lagret. Prøv avbrudd, nytt forsøk og gjenopptakelse. REV-F3/F8 gjelder privat lagring. |
| P05 | Mål, startverdi, delmål, frekvens og synlig fremgang | Kode finnes med dokumenterte restpunkter; REV-F6. | Avklar hva hvert mål måler, når perioden starter, hva som teller, og hvordan ukjent historikk vises. |
| P06 | Øvelsesbank, treningsprogram, teknikk, pyramidefordeling og forslag til økt | Kode finnes; K3 steg 5, 9, 14 beskriver utvidelser. | Behold frie faglige merkelapper. Avklar hva spilleren endrer selv, og hva coach anbefaler. Ikke gjeninnfør pensjonerte tvangsregler. |
| P07 | Testbatteri, testdag, individuelle forsøk, protokollvariant, attestering og historikk | Kode finnes; versjonert registrering og flere fagavklaringer følger K1. | Fullfør koblingen mellom faktisk registrering, riktig beregning, mål og coachens oppfølging. Avklar manglende fagregler. |
| P08 | Fysisk trening, helse, belastning og WANG-styrkeprogram | Kode finnes; styrkeprogrammet er et eget utkast i K6. | Kontroller eksisterende programlagring og avklar styrkeinnhold, coachredigering, referansegrunnlag og nødvendig helsedeling. |
| P09 | Coachkontakt: meldinger, spørsmål, tilbakemelding og oppfølging | Kode finnes; K3 steg 5. | Én forståelig vei fra et råd til økten eller resultatet det gjelder, med tydelig forventet svartid. |
| P10 | Kalender, turneringsplan, tilgjengelighet og ønsket økt | Kode finnes; utvidelser i K3 steg 4–5. | Hvilken kalender er styrende, hvordan vises konflikter, og hva er forslag versus bekreftet avtale? |
| P11 | Venner, utfordringer, ukesoppsummering og utenfor banen | Kode/ruter finnes i tidligere kartlegging; komplett bruk er ikke bekreftet her. K3 steg 5. | Avklar konkret nytte og målgruppe før videre utvidelse; kontroller aktive innganger og mottakere. |

## Runde, baneguide og innsikt

| ID | Område og planlagt innhold | Observasjon | Neste avklaring eller kontroll |
|---|---|---|---|
| G01 | Runderegistrering: total, hull for hull, slag for slag, manuell korrigering og rundehistorikk | Kode finnes. K3 AP1 beskriver kartbasert Føring 2.0. | Avklar ønsket innsats under runden versus etterregistrering. Ulik datadetalj skal gi ærlig ulike analysepåstander. |
| G02 | Gameplan før runden: banebibliotek, hullkart, sikte, soner, notat og spredningsvisning | Kode bekreftet i `src/app/portal/gameplan/`, `src/components/gameplan/` og `src/lib/gameplan/`. Baneguide-adressene videresender til Gameplan. | Kontroller banedekning, lagring og brukerreise; utvidelse med kølle og plan B står i K4. Ingen ny live-kontroll utført her. |
| G03 | Live baneguide: GPS, greenavstander, kartføring, gameplan i runden og justerbart sikte/pin | Planlagt i K4 M5–M8 og K3 AP2. Søk i `src` fant ingen bruk av `navigator.geolocation`, `watchPosition` eller `getCurrentPosition`. | Etabler konkret brukerreise og datakvalitet før bygging. GPS-integrasjon er ikke bekreftet implementert. Se delplan under. |
| G04 | Baneguide uten nett: lokal slagkø, banedata før start, synk og manuell reserveflyt | Planlagt i K4 M9–M10. Lokal trenings-/opptakskø finnes, men er ikke bevis på ferdig rundekø. | Avklar hva som må fungere uten nett. Skill lagrede banedata fra faktisk tilgjengelig kartbakgrunn; kontroller kartvilkår før eventuell nedlasting. |
| G05 | Vind og spilleforhold: vindstyrke/retning, temperatur, høyde og justerte køllelengder | Beregningskode og `ConditionsSlider` finnes. Søk fant ingen import/bruk av komponenten utenfor definisjonen. En tilgjengelig vindskjerm eller faktisk vindmåler er ikke bekreftet. | Anders nevner vindmåler 11.09. Avklar om behovet er manuell øvelse, værdata eller måling fra en ekstern enhet; se under. |
| G06 | Min bag: køllelengder, gapping, carry/total, spredning, utstyr og bruk i Gameplan | Beregninger og deler av skjermer finnes. K4 fase 2–3 og K3 AP4 planlegger samlet bag/spredning. | Rett TrackMan-enheter først. Vis antall slag, kilde, tid og forskjellen på målt og anslått lengde. |
| G07 | Analyse: SG (slag vunnet mot en referanse), styrker/svakheter, putt, innspill, rundeutvikling og neste trening | Kode finnes. K3 AP3/AP4/AP6 har utvidelser av referanser og koblinger til øvelser. | Avklar referanse og målegrunnlag. Samme skala, enheter og kilde i spiller- og coachvisning. Unngå å fremstille ulike SG-metoder som ett tall. |
| G08 | TrackMan: import, historikk, parametere, teknikk-tagging, målområder og kobling til bag | Import finnes; REV-F4 må håndteres. K3 D9/TM-12–14 inneholder eldre beslutninger om utvidelser. | Kontroller hvilke parametere som faktisk kommer fra kilden før nye analyser bygges; ingen automatisk gjenopptakelse av tidligere «ikke bygg». |
| G09 | DataGolf/GolfBox: proffsammenligning, resultater, innspill, utfordringer og egen historikk | Nyere leveranse i K5 er avstemt til main-grunnlaget for denne planen. Produksjon er ikke kontrollert i denne økten. | Prøv samlet innlogget reise og faktiske kildeoppdateringer. Eldre plan om hvor DataGolf skal ligge er erstattet av `/portal/analysere/datagolf`. |
| G10 | Turneringsdata og talentinnsikt: identitetskobling, feltstyrke, referansestige, alder/kull, klubb/region og manglende kilder | Kode og datalag finnes; K3 steg 4, 16–17 har flere rester og eldre forslag. | Avklar sammenligningsgrunnlag og faktisk datadekning. Kildehull, kalibrering og identitetsusikkerhet vises; produksjonsimport er egen autorisert oppgave. |
| G11 | Banedata og trenerbruk: rette-editor, tee/pin, polygonsoner, høydeprofil, delt strategi og etterlevelse | Detaljert plan i K4 fase 2–3 og K3 AP5. Full implementasjonsstatus er ikke nyverifisert. | Avklar ansvar for banekvalitet og coachens innsyn. Gruppestatistikk er ikke tillatelse til sanntidsdeling av spillerposisjon. |

## Coach, organisasjoner, kunder og drift

| ID | Område og innhold | Observasjon | Neste avklaring eller kontroll |
|---|---|---|---|
| O01 | AgencyOS: hjem, spillerliste, spillerkort, behov for oppfølging og arbeidskø | Kode finnes; portering pågår. K7 og K3 steg 15 beskriver konsolideringen. | Prioritering skal kunne forstås på mobilen mellom økter. Avklar hvilke signaler som faktisk krever coachens handling. |
| O02 | Coachens Workbench: individuell/gruppeplan, blokker, ansvarlig trener, maler, publisering og gjennomføring | Kode finnes; aktiv portering og tidligere rettinger i K1. | Bevar spillerplanen som mottaker. Gruppeendringer må ikke gi skjult delpublisering, dubletter eller bortfall av spillerens egne økter. |
| O03 | WANG/GFGK: årsplan, skole-/treningsuke, juniorgrupper, testdager, rapport og foresatte | Kode og designunderlag finnes; portering pågår. K3 steg 6/14/17. | Avstem virkelige skole-/gruppedata, personvern og eventuelle demonstrasjonsrester. WANG-styrkeprogram følger P08. |
| O04 | Team Norway: organisasjonsoversikt, testføring for mange, uttaksgrunnlag, poster, dokumenter/lesekvittering og organisasjonsdeling | Kode og utvidelser finnes; portering og fagavklaringer pågår. K3 steg 11/17. | Uttak gir beslutningsgrunnlag; mennesket avgjør. Testregler, innsyn og datakilder må stemme gjennom hele reisen. |
| O05 | Forelder og delt innsyn: barn, plan, bookinger, mål, samtykke og tillatelser | Kode finnes. K3 steg 9 dokumenterer foreldrebooking; revisjonen berører lokal lagring og mål. | Kontroller bytte mellom barn, hvem som kan betale og lese/endre hvilke opplysninger, samt tilbakekalling av delt tilgang. |
| O06 | Booking og betaling: offentlig booking, valgt coach/sted/tid, credits, abonnement, oppsigelse, refusjon og bekreftelse | Kode og tidligere rettinger finnes; hel kundereise gjenstår å dokumentere samlet. K1 R4/R5/R9 og K2. | Prøv korrekt testmiljø, kollisjoner, frister og gjentatte betalingshendelser. Ingen betalingstest mot virkelige kort uten konkret avtale. |
| O07 | Tilgang og konto: TALENT/FULL, organisasjonsfinansiering, profil, varsler, sikkerhet, datauttrekk og sletting | Kode finnes; deler av organisasjonsbetaling står i K3 steg 6. REV-F9/F11 berører tilgang/samtykke. | Følg gjeldende produktregler. Ikke still gamle pris-/tilgangsspørsmål på nytt uten å ha kontrollert nyere svar. |
| O08 | Caddie/AI Coach: forslag, forklaringer, økter, faglig kunnskap og coachstøtte | Kode finnes; AI Coach-utvidelse står utsatt i K3 steg 9. REV-F1/F2 må håndteres. | Avklar konkret rolle og menneskets kontroll. Forslag må bygge på tillatte, tilstrekkelige og forståelige data. |
| O09 | Jarvis/AgenticOS: innboks, utkast, godkjenninger, rutiner, oppgaver, prosjekter, kalenderkontroll, brief og mulig stemme | Kode og eldre restplaner i K3 steg 8/12/15 og K7. | Kontroller det som faktisk er koblet til kjøring. Tidligere regel om at Jarvis forbereder og Anders godkjenner utsending gjelder der relevant. |
| O10 | Marked og salg: nettsider, tilbud, coachprofiler, innhold, kampanjer, henvendelser og bruksmåling | Offentlig app og designplan finnes; K3 steg 18 skiller leveranser fra ubestilt markedsføringssystem. | Knytt nettstedet til fungerende booking og oppfølging. Skill ønsket fremtidig markedsføringssystem fra allerede bestilt arbeid. |
| O11 | Økonomi og personlig arbeidsflate: oversikt, rapportgrunnlag og egne oppgaver | Kode/planer i tidligere kartlegging og K3. Dette intervjuet henter ingen økonomidata. | Avklar hvilke beslutninger flaten skal støtte. Økonomitall hentes fra autorisert Tripletex-eksport; vi logger ikke inn i Tripletex. |
| O12 | Familie-OS og eldre sideprosjekter | Bevarte planer i K3 steg 12, ikke bekreftet som ny bestilling for golfappen. | Avklar plass og prioritet senere i intervjuet. Ikke bland familieopplysninger inn i spiller-/coachdata eller aktiver arkivplanen automatisk. |
| O13 | Felles kvalitet: tilgjengelighet, ytelse, komponenter, språk, testmiljø, logger, alarmer, sikkerhetskopi og publisering | Kontroller og designunderlag finnes; flere faktiske driftsprøver gjenstår i K1. | Hver funksjon får relevante krav i sitt kort. Full kontroll av reiser og faktisk versjon før lansering; REV-F3/F5/F10 hører hit. |

## Baneguide som første eksempel på oppdeling

**Foreløpig hensikt fra eksisterende plan:** Spilleren skal kunne forberede runden, registrere spillet og bruke resultatet til bedre trening sammen med coach. Intervjuet må bekrefte hvordan dette skal fungere i praksis.

| Del | Leveranse | Før bygging | Prøve før main |
|---|---|---|---|
| BG-01 | Kontroller og fullfør dagens Gameplan: velg bane/hull, se kart, sett sikte og lagre soner | Aktuell designversjon, banedata og tillatte brukere | Lagre og åpne på nytt; manglende kartdata; feil bruker; telefon og desktop. |
| BG-02 | Felles kartføring under og etter runden, med manuell reserveflyt | Om etterregistrering fortsatt er primærflyten; samme runde/slagkjede i begge visninger | Bytt kart/liste uten tap; rett feil slag; avslutt og kontroller faktisk rundesammendrag. |
| BG-03 | GPS og live avstander | Tillatelsesflyt, nøyaktighet, korrekt tee/green og hvilken hjelp som skal være tilgjengelig | Avslått/unøyaktig GPS, tom banedata, batteribruk og manuell korrigering. Avstander prøves mot kjente koordinater. |
| BG-04 | Lokal kladd, forhåndslastede banedata og synk | Avtalt omfang uten nett, eier, oppbevaring og kartleverandørens vilkår | Mist dekning, fortsett, lukk/åpne, synk én gang uten dubletter; bytt bruker uten datalekkasje. |
| BG-05 | Bag/spredning, køllevalg, plan B, etterlevelse og coachvisning | Korrekte TrackMan-enheter, nok datapunkter og delingsregler | Kildemerking, lite datagrunnlag, riktig spiller/coach og samme plan/resultat på begge sider. |
| BG-06 | Baneredigering, tee/pin, gruppeplaner og eventuell konkurransevisning | Ansvar for banekvalitet og konkret bruksform | Test endringshistorikk og tilgang. Verifiser gjeldende golfregler og lokale bestemmelser før konkurransefunksjoner defineres. |

Dette er foreslåtte leveransegrenser, ikke et vedtak om å redusere baneguideomfanget. Eldre MVP- og tidsanslag i K4 er historiske. BG-02–04 må utvikles med samme datakontrakt; grensene skal ikke skape nye parallelle rundesystemer.

## Vindverktøyet trenger en presis bestilling

Bekreftet kodegrunnlag: [beregningen](../../src/lib/sg-hub/conditions-adjust.ts) justerer lengde med en forenklet modell for vind, temperatur og høyde. [Komponenten](../../src/components/sg-hub/ConditionsSlider.tsx) har manuelle innstillinger. [Køllegrunnlaget](../../src/lib/sg-hub/yardage-calc.ts) inneholder også estimerte verdier. Dette dokumenterer beregningskode, ikke validert vindmåling eller en ferdig tilgjengelig skjerm.

| Mulig behov — skal avklares i intervjuet | Konsekvens for funksjonen |
|---|---|
| Utforske hvordan forhold kan påvirke slag på trening | Manuell vind/temperatur kan være tilstrekkelig; beregningsusikkerhet og begrensninger må vises. |
| Se forholdene på banen fra en værkilde | Krever avklart datakilde, sted, tidspunkt og tydelig forskjell mellom værdata og faktisk målt vind ved ballen. |
| Bruke en fysisk vindmåler | Krever identifisert enhet og dokumentert tilkobling; ingen slik integrasjon er bekreftet i den gjennomgåtte koden. |

Før bygging må vi avklare ønsket hjelp: vise forhold, hjelpe spilleren å forstå effekten, eller foreslå kølle/sikte. Retning i beregningen er relativ til slagretningen, selv om koden også bruker ordet kompassretning; en fremtidig værkobling må definere retningene entydig. Faglig validering og bruksbegrensninger inngår i kortet. Konkurransebruk må vurderes separat mot gjeldende regler; den gamle baneguideplanens regeltekst er ikke tilstrekkelig grunnlag.

## Gjenstående arbeid i kartleggingen

1. Gå gjennom familiene med Anders og registrer mål, relevans og prioritet. Start med produktmålet, ikke alle detaljspørsmålene samtidig.
2. For hver familie som tas til bygging: avstem alle relevante arkivrader, skjermtilstander og gjeldende commits. Marker eksplisitt hva som er levert/erstattet og hva som faktisk gjenstår.
3. Opprett funksjonskort for den konkrete leveransen. Legg oppgavene i masterplanens rekkefølge når prioriteten er avklart; behold gamle kilder som historikk.
4. Kontroller uklare innganger, særlig isolerte komponenter som vindkontrollen. «Fil finnes» er ikke «brukeren kan gjøre dette».
5. Ved nye opplysninger: oppdater denne samlingen og den ansvarlige kilden. Detaljerte feature-flagg, roller, integrasjoner og produksjonsstatus må verifiseres i den aktuelle leveransen.
