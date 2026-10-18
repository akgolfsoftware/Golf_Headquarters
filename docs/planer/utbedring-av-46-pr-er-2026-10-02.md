# Plan for å ferdigstille de 46 åpne PR-ene

Dato: 02.10.2026. Status: gjennomføring bestilt av Anders natt til 02.10.2026. Opprinnelig oversikt nedenfor; faktisk framdrift føres i nattstatus.

## Anbefaling og mål

Ferdigstill sammenhengende brukerreiser i ni arbeidspakker. Rett risiko for datatap og feil tilgang først. Start deretter med spillerens øktkjede og booking. Flett små, ferdig kontrollerte endringer fortløpende; ikke vent på at alle 46 er ferdige.

Målet er at eksisterende funksjoner virker sammen på main. En PR kan ferdigstilles, deles eller erstattes når dens unike arbeid er bevart. Antallet lukkede PR-er er ikke et kvalitetsmål. Ingen PR-er eller oppgavechatter lukkes eller slettes som del av denne planleggingen.

Dette er en arbeidsplan for PR-køen, som supplerer [lanseringsplanen](lanseringsplan-2026-10-01.md). Den erstatter ikke [forretningsreglene](../platform/BUSINESS-RULES.md), [språk- og planleggingsmasteren](../treningsplanlegging.md) eller [designautoriteten](../design-system/design-autoritet.md). Precision Athletics gjelder. Anders har i den andre Workbench-økten valgt å kombinere alle fire nye visninger. Den samlede prototypen bygges der; den erstatter tidligere «ingen valgt»-status. Det tidligere avviste utkastet skal ikke porteres som godkjent design.

## Kontrollert utgangspunkt

GitHub ble lest på nytt for denne planen. Det var 46 åpne PR-er:

| Tilstand | Antall | Betydning |
| --- | ---: | --- |
| Uten registrert flettekonflikt | 29 | Kan teknisk flettes; funksjon og design er ikke dermed godkjent. |
| Med flettekonflikt | 5 | #993, #1004, #1020, #1024, #1031 må tilpasses nyere kode. |
| Røde kontroller, utenom utkast | 3 | #1032, #1033 og #1060 må få feilene avklart og kontrollene grønne. |
| Utkast | 9 | #931, #1018, #1019, #1021, #1023, #1025, #1030, #1035, #1041. Noen har også testfeil. |

Main: `25bc3302e4a57cd55eed07dae191d553e5d7a3aa`, etter #1034 og #1075. Siste verifisering fra forrige arbeidsøkt: 3946 programtester og 18 komponenttester, bygg og main-CI bestod. Produksjonstesten hadde 236 beståtte og 70 utelatte kontotilfeller. De samme 70 bestod separat lokalt med sju syntetiske kontoer i Chromium og WebKit, uten feil eller utelatelser. Produksjonsversjonen var Ready og innlogging svarte HTTP 200. Dette er bevis for daværende main, ikke for de 46 PR-ene.

Kilder: [main-CI](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36928969528), [produksjonstest](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36928969626), PR-differ og beskrivelser, samt den private kontrollrapporten `~/Documents/Claude/akgolf-hq/pr-kontroll-2026-10-01.md`. Tekniske tilstander og beskrivelser er øyeblikksbilder. PR-beskrivelser er ikke bevis på gjennomført funksjonstest.

Ved ny avlesning hadde #993 ny kodeversjon, `0ae099be7c894edac033f2128442af4bc57be888`. Slettelisten omfatter nå også flere forhåndsvisninger og `public/kino/`. Den faktiske fillisten må styre vurderingen; beskrivelsens «gjenstår» er ikke oppdatert for alle filer. De øvrige 45 hadde samme kildeversjon som i kontrollgrunnlaget.

## Første arbeidsrunde

1. Les fersk main, PR-versjoner og aktive arbeidskopier. Registrer hvem som eier hver pakke før endringer, og unngå samtidige endringer i samme filer. Bevar alle andre sesjoner og private filer.
2. Undersøk #1056 først: PR-en endrer lagring fra hvert slag til fullført hull. Bevar eller gjenopprett slagvis mellomlagring før skjermen flettes. Lag en prøve som avdekker tap ved omlasting midt i hullet.
3. Undersøk tilgangsrettingen som omtales i #1018 mot dagens main. Hvis hovedkoden mangler nødvendig eierskapskontroll ved gruppesletting, skill ut en minimal feilretting og test tillatt og avvist tilgang. Dette er et kontrollpunkt, ikke en påstand om at main fortsatt har feilen.
4. Registrer eksisterende skjermreferanse og manglende bevis for øktkjeden. Gjør ferdig #1037 → #1036 → #1055 → #1038 → #1053 som første hele brukerreise. Rekkefølgen er funksjonell, ikke en påstått Git-avhengighet.
5. Ta bookingpakken etterpå. Oppdater e-postarbeidet mot gjeldende refusjons- og leverandørfeilhåndtering før eldre maler flettes.

Rutiner, avhengighetsoppdatering og tekniske feil kan løses uten nye produktvalg. Bare arbeid som faktisk avhenger av en uavklart skjerm eller forretningsregel venter på den beslutningen.

## Rekkefølge og ferdigkrav

| Pakke | Antall | Leveranse og ferdigkrav |
| --- | ---: | --- |
| 1. Treningsøkt | 5 | Åpne, starte, gjennomføre, registrere og avslutte samme økt. Tid, slag og evaluering finnes igjen etter omlasting. |
| 2. Booking og e-post | 9 | Tilgjengelighet → valg → betaling/testbetaling → kvittering → flytting/avbestilling. Riktig status og ingen dobbel belastning/refusjon. |
| 3. Runder og tester | 7 | Runde og test kan startes, avbrytes, gjenopptas og fullføres med korrekte resultater og historikk. |
| 4. Konto og tilgang | 7 | Opprettelse, oppstart, samtykke, profil og roller fungerer med riktig tilgang for hver rolle. |
| 5. Analyse og kommunikasjon | 5 | Reelle lagrede data vises korrekt; eksisterende funksjoner, meldinger og historikk beholdes. |
| 6. Grupper, WANG og Team Norway | 5 | Gruppe-/organisasjonsgrenser holder; årsplan, analyse og fireukersoppfølging henger sammen. |
| 7. Workbench og planbygger | 3 | Valgt skjermretning og avklart lagringsflyt, uten å gjeninnføre avvist design. |
| 8. Administrasjonsverktøy | 3 | E-postmaler, drift/personvern og assistentkontroller har faktisk funksjon og riktig tilgang. |
| 9. Fag og dokumentopprydding | 2 | Faglig forslag har eksplisitt status; bare bekreftet utgåtte filer fjernes uten brutte referanser. |
| **Sum** | **46** | Hver PR er plassert én gang i detaljlisten nedenfor. |

Dette er anbefalt kø, ikke et krav om å blokkere all fremdrift bak én pakke. Konto- og tilgangsrettinger trekkes frem når de er nødvendige for andre pakker. Workbench-valget kan tas mens tekniske pakker arbeides med. Dokumentopprydding tas sist for å bevare referanser under arbeidet.

## Konkret arbeidsliste per PR

### 1. Treningsøkt — første hele leveranse

| PR | Hva som må gjøres | Bevis før fletting |
| --- | --- | --- |
| [#1037](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1037) Øktark | Kontroller at tegnede handlinger har lagring. Bevar eksisterende Workbench-, plan- og V2-kilder. | Åpne samme økt fra relevante kilder; rediger og last på nytt; identitet, innhold og status beholdes. |
| [#1036](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1036) Før start | Koble startskjermen riktig til de tre øktkildene. | Faktisk innlogget start fra hver kilde, også tom økt og utilgjengelig økt. |
| [#1055](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1055) Aktiv økt | Fullfør kontroll av kø, øvelsesrekkefølge, tidtaking og navigasjon; kjør endrede tester. | Pause, fortsett, bytt øvelse og last på nytt; feil og frakobling mister ikke registreringer. |
| [#1038](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1038) Slagteller | Verifiser forsinket lagring og gjenoppretting ved frakobling. | Raske trykk, tilbake/inn igjen og omlasting gir samme antall lokalt og på server. |
| [#1053](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1053) Etter økt | Avklar og verifiser lagring av RPE, fokus og valgfri kvalitet; kontroller når planloggen oppdateres. | Fullføring både med og uten kvalitetsverdi; evaluering, planlogg og statistikk viser riktig resultat. |

### 2. Booking og e-post

| PR | Hva som må gjøres | Bevis før fletting |
| --- | --- | --- |
| [#1010](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1010) Kalender/booking | Del gjennomgangen i kalender, booking og additive schemaendringer. Tilpass gjeldende roller, betaling og forslag til ny tid. | Lokal databaseoppgradering med eksisterende syntetiske bookinger; visning, flytting og tilgang uten tap av historikk. |
| [#1045](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1045) Tilgjengelighet | Avklar skjermreferanse mot kalenderen. Bevar tidsvinduer, steder, unntak, årsvisning og Google-funksjoner. | Nye tider kan bookes; unntak og opptatte tider kan ikke bookes; ingen funksjon forsvinner ved eventuell samling. |
| [#1019](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1019) Offentlig booking | Samordne inngang og firetrinnsreise med #1025. Gjennomfør full kontroll som manglet ved tidligere commit. | Begge offentlige innganger når riktig trener/tid og samme betalingsflyt. Ingen omgåelse av kontrollkroker. |
| [#1025](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1025) Tid/betaling | Kontroller rutene og hva databaseklokkeslett faktisk betyr før Oslo-formatering endres. | Sommer-/vintertid og begge innganger viser samme bookede tidspunkt; pris og betalingsfeil prøves. |
| [#1051](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1051) Spillerbooking | Koble oversikt/detalj til dagens kreditt-, flytte- og refusjonslogikk. | Klippekort, flytting og gjentatt avbestilling gir riktig saldo; ingen dobbelt tilbakebetaling. |
| [#1022](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1022) Kvittering | Fjern ubekreftet «e-post sendt»-påstand. Unngå rå gjesteadresse i nettadressen; bruk etablert sikker kvitteringstilgang. | Kvittering fungerer ved vellykket, utsatt og feilet levering; uvedkommende får ikke innsyn. |
| [#1021](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1021) Bekreftelsesmail | Samle malrammen med eksisterende `precision-epost.ts`; ikke innfør en parallell ramme uten behov. | Gratis, betalt og klippekort; deaktivert mal og leverandørfeil respekteres; lokal e-postmottaker. |
| [#1033](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1033) Påminnelse | Oppdater mot main og avklar tidligere font-/byggfeil. Bevar gjeldende sende- og feilkontroller. | Grønt bygg; riktig tidspunkt/innhold; deaktivert mal og feilsvar testes uten ekte sending. |
| [#1020](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1020) Avbestillingsmail | Løs konflikt ved å legge malendringen over dagens refusjonslogikk, ikke ved å hente tilbake gammel logikk. | Refusjonsstatus i tekst er sann; gjentakelse gir ikke dobbel refusjon; sendeproblemer håndteres. |

Flettet #1034 er referanse for felles mal og feilhåndtering. Den aktiverte ikke i seg selv en produksjonskallende sender. Full bookingreise må derfor dokumentere hvilke hendelser som faktisk sender e-post, ikke bare at en mal kan tegnes.

### 3. Runder og tester

| PR | Hva som må gjøres | Bevis før fletting |
| --- | --- | --- |
| [#1040](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1040) Start runde | Bevar opprettelse og gjenopptaking med samme rundeidentitet. | Ny runde, eksisterende utkast og ugyldige valg gir riktig resultat uten duplikater. |
| [#1056](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1056) Aktiv runde | Bevar slagvis mellomlagring før ny skjerm tas inn. | Omlasting midt i hull, frakobling, angre, straffeslag og putt mister ingen lagrede slag. |
| [#1044](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1044) Ferdig runde | Kontroller redigering, import, deling og beregninger mot reelle datakilder. | Endret score slår riktig gjennom; manglende målinger fremstilles ikke som målte tall. |
| [#1047](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1047) Runder/statistikk | Sikre brutto score, korrekt kilde og tydelig mangel på data. | Null og ukjent er ulike; egen og fremmed spiller prøves; summer stemmer med lagrede runder. |
| [#1043](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1043) Testoversikt | Kontroller gruppering, historikk, enheter og tilgjengelige normer. | Flere målinger og manglende norm viser riktig historikk uten oppdiktede sammenligninger. |
| [#1054](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1054) Utfør test | Kontroller overgang til eksplisitt lagring og riktig testdefinisjon. | Lagre, feil, nytt forsøk og omlasting; ingen duplikat eller feil enhet/testvariant. |
| [#1023](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1023) Normer/tildeling | Ferdigstill utkast og kontroller `MANAGE_TESTS` både på side og handlinger. | Tillatt trener kan tildele; annen trener avvises; tildeling og resultat finnes hos riktig spiller. |

### 4. Konto, oppstart, profil og tilgang

| PR | Hva som må gjøres | Bevis før fletting |
| --- | --- | --- |
| [#1029](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1029) Registrering | Sammenhold navn, passord, roller og mindreårigflyt med gjeldende regler. Avklar bare reelle gjenværende produktforskjeller. | Voksen/mindreårig, eksisterende adresse og feilet registrering; ingen utilsiktet privilegieøkning. |
| [#1028](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1028) Oppstart | Koble de sju stegene til profil og gjeldende samtykkeflyt. | Tilbake/frem, avbrudd og fortsettelse; ingen duplisert bruker eller omgått samtykke. |
| [#1032](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1032) Samtykkelenke | Avklar ubrukt variabel mot ny main; kontroller lenkens gyldighet og tilknytning. | Utløpt, ugyldig, brukt og feil barns lenke avvises riktig; gyldig samtykke lagres. |
| [#1052](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1052) Ny spiller | Bekreft konkret skjermreferanse og bevar eksisterende opprettelses-/invitasjonsregler. | Validering, duplikat og eierskap prøves; invitasjoner fanges lokalt. |
| [#1059](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1059) Meg | Koble oversikten til eksisterende underskjemaer; bevar samtykke og tilgang til helseopplysninger. | Redigering og gjenåpning av egen profil; uvedkommende får ikke innsyn. |
| [#1057](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1057) Innstillinger/abonnement | Kontroller faktisk abonnementstilstand, samtykke og feilhåndtering. | Visning/retur fra testbetalingsflyt og mislykket handling; ingen falsk bekreftelse på oppsigelse. |
| [#1026](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1026) Adminoppsett | Bevar funksjoner fra åtte eksisterende faner når tegningen har seks. Avklar betydningen av markedsføring. | Team, roller, profil og lagring fungerer; minste nødvendige tilgang og lokalt fangede invitasjoner. |

### 5. Analyse, kommunikasjon og utfordringer

| PR | Hva som må gjøres | Bevis før fletting |
| --- | --- | --- |
| [#1048](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1048) TrackMan | Bevar tilgang til funnliste, bøttevisning, slagdetaljer og sammenligning som forsvinner i forslaget. | Alle tidligere funksjoner nås og bruker samme datasett; ingen funksjon fjernes stilltiende. |
| [#1046](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1046) Spilleplan/kart | Kontroller egne slagdata, utilstrekkelig utvalg, kart og posisjonstilgang. | Svakt datagrunnlag gir ikke sikker kølleanbefaling; kart-/GPS-feil har brukbar reservevisning uten oppdiktede hindre. |
| [#1050](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1050) Innboks | Prøv ekte lagring, historikk og lest/ulest mellom syntetiske brukere. | Sending, åpning og omlasting gir riktig teller; fremmed samtale avvises. |
| [#1049](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1049) Caddiechat | Kontroller kvoter, abonnementstilgang, feil og faktisk støtte for utkast/turneringsforslag. | Syntetisk/anonymisert dialog, avbrudd og grense; ingen persondata til sky eller uautorisert handling. |
| [#1058](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1058) Utfordringer | Kontroller opprettelse, deltakelse, detalj og rangering. | Gjentatt trykk skaper ikke duplikat; rett eier; ukjent resultat er ikke null. |

### 6. Grupper, WANG og Team Norway

| PR | Hva som må gjøres | Bevis før fletting |
| --- | --- | --- |
| [#1018](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1018) Gruppedetalj | Kontroller omtalt tilgangsretting straks. Avstem gruppeoversikt/-detalj og bevar medlems-, plan-, trener- og skolefunksjoner. | Riktig gruppe og eier, faste tider, medlemsendring og avvist fremmed tilgang; ingen skjult funksjonsreduksjon. |
| [#1027](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1027) Gruppeårsplan | Verifiser årsplan/skoledata og firetrinns AK-stige mot master; Knøtt håndteres etter gjeldende regel. | År/måned/dag lagres og gjenåpnes; syntetisk import med ugyldig rad og manglende tilgang. |
| [#1024](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1024) Gruppeanalyse | Løs konflikt og avstem nye måltall mot spillergrunnlaget. | Gruppeutvalg, tomt grunnlag, null og ukjent gir riktige summer; fremmede spillere utelates. |
| [#1004](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1004) WANG/TN-skjermer | Oppdater stor skjermendring mot main i forståelige deler; bevar de valgte profilene og nyere tilgangs-/samtykkerettinger. | Elev/spiller/trener på tvers av organisasjoner; avvisning, samtykke, tomme og utfylte visninger. |
| [#1060](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1060) Fireukersoppfølging | Bygger på #1004, ikke main. Vurder bare egne endringer først, rett røde kontroller og tilpass grunnlaget etter #1004. | Additive schemaendringer lokalt; opprett, svar, godta/avvis forslag; riktig historikk og organisasjonstilgang. |

**Bekreftet grenavhengighet:** #1004 må håndteres før #1060 kan vurderes endelig mot main. Endringene fra #1004 skal ikke telles eller flettes to ganger.

### 7. Workbench og planbygger

| PR | Hva som må gjøres | Bevis før fletting |
| --- | --- | --- |
| [#1031](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1031) År/periode | Løs kodekonflikter uten å gjøre gammel tegning til designvalg. Tilpass skjermarbeidet først når konkret ny variant er valgt. | År/periode følger planleggingsmasteren; lagring og navigasjon testes i valgt variant. |
| [#1041](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1041) Måned | Fullfør reell måned-/notatlagring og periodetilknytning innen valgt variant; form var ikke ferdig bygget. | Rediger, lagre, bytt måned og gjenåpne; notater og fokus ligger på riktig periode. |
| [#1042](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1042) Velg treningsplan | Avklar hva SMART-mål og «send til trener» skal opprette og vise. Tomt planutkast med flagg er ikke dokumentert fullført deling. | Mål, planstatus, trenerens mottak og spillerens tilbakemelding henger sammen. Ingen gjeninnføring av AI-planbygger til lansering. |

Tekniske lagringsfeil kan behandles separat. Denne planen velger ikke A/B/C/D og gjør ikke et gammelt skjermutkast gyldig.

### 8. Administrasjonsverktøy

| PR | Hva som må gjøres | Bevis før fletting |
| --- | --- | --- |
| [#1039](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1039) E-postmalredigering | Hold faktisk avgrensning til malredigering; kø/kommunikasjon er allerede tatt ut av PR-en. | Rediger, forhåndsvis, lagre og deaktiver; senderen respekterer lagret mal og aktiv-status. | Status 02.10: merget i main 4f87518d5d621c3e49aef5d21df09e0c01683a21. PR-CI og main-CI grønne; Vercel-produksjonsstatus SUCCESS; røyktest 236 bestått/70 utelatt og /auth/login HTTP200. |
| [#1030](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1030) Drift/personvern | Bruk den nå tilgjengelige lokale innloggede riggen. Bevar nyere personvernrettinger og skjul sensitive loggdata. | Admin/ikke-admin, feiltilstander og lokal syntetisk eksport/sletting; ingen ekte sletting som skjermtest. |
| [#1035](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1035) Jarvis/adminchat | Avklar navn/rolle og faktisk støtte for massehandlinger og lagring av brytere. Ikke gjør eksterne agentkataloger til runtime. | Innstillinger overlever omlasting; tilgang og eksplisitt handlingsintensjon håndheves; ingen virkningsløse kontroller. |

### 9. Fag og dokumentopprydding

| PR | Hva som må gjøres | Bevis før fletting |
| --- | --- | --- |
| [#931](https://github.com/akgolfsoftware/Golf_Headquarters/pull/931) Junior 16-årsplan | Behold som fagutkast til fordeling og turneringsuker er vurdert. Ikke gjør forslaget til standardregel gjennom teknisk fletting. | Faglig beslutning med tydelig målgruppe; samsvar med planleggingsmaster og korrekt dokumentstatus. |
| [#993](https://github.com/akgolfsoftware/Golf_Headquarters/pull/993) Opprydding | Gå gjennom fersk sletteliste fil for fil, løs konflikter og bevar aktive referanser, gjeldende designkilder og unikt arbeid. Oppdater PR-beskrivelse til faktisk omfang. | Søk etter bruk/referanser, kontroller private bevaringsbehov og kjør dokumentkontroll. Ingen katalogvis sletting basert på gammel merkelapp. |

## Felles filer og sammenslåingsregler

Én ansvarlig håndterer hver delt fil om gangen. Uavhengige pakker kan planlegges separat; tabellen er ikke en bestilling av nye agentøkter.

| Felles område | Berørte PR-er | Regel |
| --- | --- | --- |
| `src/lib/email/booking-emails.ts` | #1010, #1020, #1021, #1033 | Start fra dagens main med #1034 og nyere refusjonsrettinger. Én malramme, behold deaktivert mal og returnerte leverandørfeil. |
| `prisma/schema.prisma` | #1010, #1060 | Samordne additive endringer og test oppgradering lokalt. Ikke kjør generell migrasjonshistorikk mot hostet database. |
| Bookingdetalj og `src/lib/portal-booking/uleste.ts` | #1010/#1051 og #1051/#1057 | Flett i avtalt rekkefølge; prøv detalj og ulest-teller på samlet kode. |
| `src/app/admin/workbench/[playerId]/page.tsx` | #1031, #1041 | Samme eier og samme valgte skjermvariant. |
| `src/styles/precision-a24.css` | #1030, #1059 | Kontroller begge skjermområder etter sammenslåing. |
| `tests/visual/precision/maal.mjs` | #1019, #1025, #1027, #1032, #1037, #1043, #1044, #1046, #1048, #1050 | Bevar alle relevante målinger; ikke erstatt hele filen med én grens eldre variant. |

Registrer per PR: ansvarlig, kildecommit, testet main-commit, designreferanse, konkret hindring, testresultat og endelig mergecommit eller begrunnet erstatning. Startstatus er «planlagt», ikke «godkjent». Oppdater bare når beviset finnes. Hvis en annen økt endrer PR-en, les endringene før arbeidet fortsetter.

Ved erstatning skal unike funksjoner og dokumentasjon være bevart i navngitt erstatnings-PR før gammel PR foreslås lukket. Ingen oppgavechatter slettes. Arbeidskopier ryddes først etter kontroll av upushet og ucommittet arbeid.

## Beslutninger som kan kreve Anders

Disse avklares bare hvis de fortsatt er åpne etter lesing av gjeldende beslutninger og valgt skjermreferanse. Rutinefeil, bevaring av funksjoner og allerede vedtatte sikkerhetsregler krever ikke nye spørsmål.

- Workbench-retningen er nå en kombinasjon av de fire forslagene. Les den ferske samlede leveransen og registrer eventuelle konkrete avvik før avhengig skjermarbeid; ikke spør om samme valg igjen.
- Valgt tilgjengelighetsskjerm dersom dagens kalender og #1045 ikke allerede har en entydig referanse.
- Eventuelle reelle produktforskjeller i registreringsflyt, seks/åtte adminfaner og betydningen av «markedsføring». Førstevalg er å bevare dagens funksjoner.
- Hva spillerens «send til trener» skal innebære dersom mottak, status og oppfølging ikke allerede er bestemt.
- Faglig status for Junior 16-årsplanen; eventuelt navn/rolle i adminassistenten dersom dette ikke er fastsatt.

Ikke spør på nytt om Precision Athletics, allerede valgte WANG/TN-profiler, samtykkekrav eller stående godkjenning for nødvendig ikke-destruktivt produksjonsarbeid.

## Kontroll før hver fletting

1. Les relevant kilde og gjeldende regler. Før kilde-/datakode endres, bruk prosjektets sikkerhets- og personvernkontroll. Gjennomgå diffen mot fersk main og bevar nyere rettinger.
2. Kjør målrettede tester for konkret feil og sammenhengende brukerreise. Bruk eksisterende lokale testmiljø og sju gjenbrukbare syntetiske kontoer. Testtilfeller er handlinger, ikke krav om én konto per tilfelle.
3. Kontroller tilgang både med tillatt og uvedkommende bruker. For nye datatabeller: lokale oppgraderingsprøver og nødvendige tilgangsregler. Ingen produksjonsdata kopieres.
4. For skjermarbeid: sammenlign app med valgt referanse ved 390 px og desktop, relevante temaer og tomme/lastende/feiltilstander. Registrer avvik. Grønt bygg er ikke visuell godkjenning; Anders skal se avtalt sammenligning før skjermen regnes som ferdig.
5. Kjør `npm run verify` og relevante tester på samlet kode. For dokumentendringer også `npm run prosjekt:sjekk`. Kjør én tung full kontroll om gangen på vertsmaskinen; aldri `--no-verify`.
6. Kontroller CI, altså automatiske GitHub-kontroller, på den aktuelle versjonen. Flett bare ferdig gjennomgått kode. Bekreft resultatcommit og at publisert versjon svarer riktig. Oppdater PR-beskrivelse og kontrollbevis.
7. Etter pakker som endrer felles innlogging, datalagring eller grunnleggende spillerflyt: kjør relevante deler av de 70 lokale kontotestene, og hele settet ved samlet lanseringskontroll. Eventuelle utelatelser i produksjon rapporteres separat; lokalt grønt er ikke bevis på hostet kontoflyt.

E-post prøves med lokal mottaker og betaling med isolert testoppsett. Ekte e-post/invitasjon, betaling, sletting av ekte data og destruktive schemaendringer krever egen uttrykkelig bestilling. Ingen slike handlinger er nødvendig for å skrive denne planen.

## Når arbeidet er ferdig

Hver av de 46 PR-ene skal ha en dokumentert sluttstatus: ferdigstilt og flettet, erstattet med bevart arbeid, eller fortsatt åpen med en konkret beslutning/hindring. Alle ni brukerreisepakker skal ha synlig testbevis og relevante skjermkontroller. En utsettelse er ikke det samme som at funksjonen er ferdig.

Deretter oppdateres lanseringsplanen med det som faktisk er levert. Abonnementsfornyelse, mislykket betaling, oppsigelse, faktisk e-postleveranse og komplett personverneksport/ekstern sletting må fortsatt vurderes der. Å håndtere PR-køen alene dokumenterer ikke at hele produktet er lanseringsklart.

Det settes ingen fast lanseringsdato ut fra PR-antallet. Etter øktpakken og bookingpakken har vi målt hvor mye som er feilretting, manglende bevis og reelt uferdig funksjon, og kan gi et bedre tidsanslag.

## Verifisering av denne planen

Dette dokumentet endrer ikke applikasjon, database eller produksjon. Kontrollert ved lagring: detaljlisten inneholder alle 46 åpne PR-er nøyaktig én gang. `npm run prosjekt:sjekk` bestod, og dokumentets egne relative lenker er kontrollert. Program- og nettlesertestene over er historiske resultater eller fremtidige ferdigkrav, ikke nye kjøringer i denne planleggingsøkten.
