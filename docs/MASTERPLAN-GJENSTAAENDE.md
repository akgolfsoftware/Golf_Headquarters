# Arbeidsliste — AK Golf HQ

Oppdatert 12.09.2026. Denne filen eier rekkefølge og gjenstående arbeid. [Status nå](STATUS-NÅ.md) oppsummerer leveransen. [Funksjonsregisteret](planer/funksjonsregister-2026-09-11.md) bevarer hele produktbredden; eldre bestillinger er samlet i [planarkivet](arkiv/opprydding-2026-09-10/masterplan-gjenstaaende.md).

## Gjeldende bestilling og design

Anders ønsker en komplett app før åpen lansering med booking og betaling. Han har bestilt videre arbeid, samling av ferdige oppgaver til main, prosjektopprydding og denne oppdaterte restlisten. En merge betyr at kode er samlet; den er ikke visuell godkjenning eller lanseringsvedtak.

Aktiv visuell retning er nå **Atletisk intelligens**. Siste Claude-kandidat består av AgencyOS v0.3.3, AgencyOS Hjem v0.3.2, PlayerHQ v0.3.2 og Stall/spillerkort v0.1. Den er klikkbar, men eksplisitt ikke valgt eller eksportert for bygging. Train-lock, Claw/Team Norway, WANG-speilet og dagens Geist/v3-implementasjon bevares som funksjons-, historikk- og teknisk underlag, men er ikke visuell fasit for nye skjermendringer. [Kontroll av Claude-pakken](design-audit/claude-design-v0-3-3-2026-09-12.md), [designstatus](../designsystem/README.md) og [tidligere portstatus](design-audit/portering-fire-flater-2026-09-10.md).

Eksisterende UI skal ikke slettes på forhånd. Det erstattes kontrollert per brukerreise etter at en designversjon er valgt, kartlagt til kode og funksjons-/visuelt prøvd.

Når Anders velger en komplett Claude Design-pakke med `selectedForBuilding: true`, er den eneste visuelle fasiten for omfanget registrert i pakken. Den ferdige pakken skal inkludere PlayerHQ, AgencyOS, Team Norway og WANG. Booking, marked, innlogging/konto, forelder, delt innsyn og systemtilstander skal før lansering være koblet til samme fundament gjennom en navngitt profil eller et navngitt mønster. Ingen brukerflate kan falle tilbake til gammel design som en skjult standard. Gamle visuelle regler og avhengigheter fjernes kontrollert under porteringen og skal ikke finnes i sluttresultatet. Claude trenger ikke detaljtegne hver rute separat, men alle ruter må kobles til et kontrollert skjermmønster, og alle unike/kritiske reiser skal ha detaljert UI og klikkbar mobil-, iPad- og desktopflyt. [Komplett design- og porteringskontrakt](planer/claude-design-til-grok-portering-2026-09-12.md).

## Kontrollporter som gjør planen komplett

Arbeid kan gå parallelt bare når avhengighetene under er oppfylt. Statusene `åpen`, `pågår`, `bestått` og `blokkert` brukes med lenke til bevis. En grønn test, en merge eller et designbrett teller aldri som bevis for andre porter.

| Port | Eier | Status 12.09 | Bestått når |
|---|---|---|---|
| P0-KILDE | Codex/Anders | Bestått i denne planleveransen | Business Rules, Nordstjernen, designstatus og masterplan har samme kildeorden: valgt Claude-pakke styrer visuelt; produkt- og sikkerhetsregler består |
| P0-OMFANG | Anders/Claude Design | Bestått som bestilling | Fire kjerner er obligatoriske, øvrige brukerflater får navngitt profil/mønster, og 480 ruter samt overlegg skal forklares |
| P0-TEST | Grok | Blokkert uten Docker/testbase. [Bevis](design-audit/p0-test-blokkering-2026-09-12.md) | Separat tom testdatabase kan bygges etter gjeldende oppskrift; syntetiske spiller-, coach-, organisasjons- og avviste roller finnes; kritiske prøver hopper ikke over manglende oppsett; betaling/e-post bruker testmiljø |
| P0-PRODUKT | Anders + fagansvarlig | Åpen per beslutning | Bare produkt- eller fagvalg som faktisk blokkerer neste leveranse avklares før avhengig bygging; beslutning, konsekvens og eier loggføres |
| P0-DEKNING | Teknisk eier | Åpen | Alle 35 funksjonsfamilier, 17 hovedreiser, 480 ruter og manuelle overlegg har ansvarlig arbeidspakke og bevisstatus i [dekningsregisteret](planer/masterplan-dekning-2026-09-12.md) |

### Design og portering D0–D6

| Port | Eier | Avhengighet | Bestått når |
|---|---|---|---|
| D0 · lås visuell kilde | Claude Design + Anders | P0-KILDE/P0-OMFANG | Én samsvarende eksport har versjon, dato, autoritets-ID, filhash, `selectedForBuilding: true`, endringslogg og eksplisitt omfang |
| D1 · rute → mønster | Claude Design + Grok | D0 | Hver rute og hvert manuelt overlegg er koblet til skjerm-ID/fellesmønster, reise, tilstander, handlinger, formater og unntak |
| D2 · systemfundament | Grok | D0–D1 | Grunnverdi → betydning → komponent, faktiske ressurser, app-ramme, navigasjon og basis-komponenter er bygget uten gammel token-fallback |
| D3 · fire piloter | Grok + Claude Design | D2 og relevant funksjonsport | PlayerHQ J02, AgencyOS hjem/spilleroppfølging, Team Norway testreise og WANG uke/elevreise virker med ekte handlinger og representative tilstander på mobil, iPad og desktop |
| D4 · full flatedekning | Grok | D3 | Fire kjerner og øvrige brukerflater i P0-OMFANG er portert etter dekningsregisteret uten tap av funksjon eller tilgang |
| D5 · fjern gammel design | Grok | D4 | Erstattere er godkjent; gamle CSS/tokens/fonter/komponentvarianter har ingen brukere; prosjektvakt avviser gjeninnføring |
| D6 · sluttgodkjenning | Anders + kvalitetseier | D5 | Visuell sammenligning, responsivitet, tilgjengelighet og kritiske reiser er bestått; avvik er lukket eller uttrykkelig akseptert |

### Åpne avvik i siste Claude-kandidat

Disse er nå eksplisitte D0-blokkeringer, ikke fotnoter: faktisk 320 px-/200 %-kontroll mangler; nyere lagrings-/delingsregler er ikke innarbeidet i systemfilene; gruppeoppmøte mangler godkjent datamodell; prototypeføringen har ikke serverlagring; AgencyOS Hjem har bare to redigeringstider; og skjermregister, filversjoner og Stall-status er ikke samordnet. [Kilde og detaljer](design-audit/claude-design-v0-3-3-2026-09-12.md). Datamodell eller databaseendring krever egen autorisasjon.

## Samlet arbeid og hva kontrollene beviser

| Pakke | Resultat | Status og bevis |
|---|---|---|
| DataGolf/GolfBox og tidligere rettinger | Kode fra tidligere arbeidsgrener samlet | I main via PR #833/#834. [Grenregnskap](beslutningsgrunnlag/grener-og-main-2026-09-10.md) |
| D2 grunnlag, navigasjon, I dag, Plan, PH-04/PH-05, TN-18/WANG C7 | Første seks porteringspakker | I main via PR #835. Kode- og komponentprøver; alle skjermfamilier er ikke ferdige |
| Manuell SG | Manuell runde-/SG-registrering og dokumentert skjermarbeid | I main via PR #836. Ingen ny måling eller innlogget godkjenning er utledet av flettingen |
| Claude PH-06-testpakke | Seks enhetstester og første visuelle rigg | I main via PR #837. Den pakken endret ikke skjermen; den opprinnelige ferdigpåstanden er korrigert i [PH-06-rapporten](design-audit/playerhq-ph06-2026-09-11.md) |
| D2-PLAN | Eldre godtatte planøkter uten V2-speil kommer med i Plan/ukeprogresjon, uten dobbelttelling | Samlet i denne leveransen fra `0c060141c`. 11 målrettede kontrolltilfeller; [rapport](design-audit/plan-legacy-2026-09-11.md). Innlogget reise gjenstår |
| D2-PH06 / R2 | Valgt resultathierarki, lesbare lagrede notater/vurdering, ekte appskrifter, feil/venting/nytt forsøk, trygg feltskriving | Bygget og komponentprøvd i denne leveransen. Fem nye handlingstester, 64 skjermvarianter, interaktive feilprøver og isolert PostgreSQL-prøve. [Rapport og begrensninger](design-audit/playerhq-ph06-2026-09-11.md) |
| Produktplan/intervju | Funksjonsregister, funksjonskort og intervjuguide bevart fra separat gren | Dokumentene er integrert som arbeidsunderlag. Intervjuet og de foreslåtte produktbeslutningene er ikke erklært ferdige |
| Prosjektopprydding | Ferdige grener/arbeidskopier avstemt, gjeldende innganger og register oppdatert | [Samlingsrapport](vedlikehold/samling-og-opprydding-2026-09-11.md). Historiske sikkerhetskopier og originaldesign bevares |
| R-A/R-B/R-C/R-D/R-H | Caddie-ressursgrenser og AI-minimering, privat lokal lagring, TrackMan-enheter og sikker abonnementshenting | I main via samlingsarbeidet. [Kontroll og åpne grenser](vedlikehold/sikkerhet-og-enheter-2026-09-11.md). Innlogget kontroll og produksjonsbevis registreres separat |
| D2-TN/D2-WANG tilgangsgrunnlag | Sikret Team Norway-oversikt og samme konkrete WANG-gruppe/elev gjennom trenerliste, IUP-lesing og IUP-lagring | Bygget og testet i PR #842. [Kontroll og gjenstående brukerreiser](design-audit/tn-wang-tilgang-2026-09-11.md). Innlogget og visuell kontroll gjenstår |
| R-I handlingstilgang | Avvisningstester som kaller eksporterte handlinger; ubrukt vaktimport feiler i verify; coach-notat, fys-logg og IUP-skriving ressursavgrenset | Bygget på `grok/r-i-handlingstilgang-2026-09-12`. [Kontroll](design-audit/handlingstilgang-r-i-2026-09-12.md). Innlogget reise gjenstår |

Siste samlede testresultat og flettepunkt skal leses i samlingsrapporten og tilhørende GitHub PR. Innlogget produksjonsreise, faktisk betaling og Anders' visuelle vurdering er egne kontroller som fortsatt gjenstår.

## Neste oppgaver, i rekkefølge

Aktiv arbeidsdeling 12.09.2026: Claude Design eier Design System v0.1 og de første pilotskjermene. Grok 4.6 leverte R-E del 1 via PR #845 og kan fortsette med designuavhengig teknisk arbeid etter [Grok-planen](planer/grok-4-6-start-2026-09-12.md). Grok kan bruke siste prototype til funksjonell kartlegging, men endrer ikke globale designverdier, navigasjon eller visuelt komponentuttrykk før D0 er bestått.

| Prioritet / ID | Konkret neste leveranse | Inngang | Ferdig når |
|---|---|---|---|
| 1 · P0-TEST → R-E / R1–R3 | Fullfør innlogget Next-/databasereise I dag → Plan → PH-04 → PH-05 → PH-06. Enhetstester er i PR #845. Isolert testdatabase er blokkert uten Docker | `docs/utvikling/lokal-testdatabase.md`, [blokkering](design-audit/p0-test-blokkering-2026-09-12.md), [R-E](design-audit/playerhq-r-e-spillerreise-2026-09-12.md) | P0-TEST er bestått; samme økt/tall i innlogget isolert base; gjenåpning virker; uvedkommende avvises |
| 2 · D2-AO | Teknisk AgencyOS-reise: stall bruker samme spillerporte som kort/Workbench; oversikt lastes ikke uten tilgang. Visuell port venter på D0 | `src/lib/admin/stallen-scope.ts`, `src/lib/agencyos/coach-reise.ts`, [kontroll](design-audit/agencyos-d2-ao-teknisk-2026-09-12.md) | Innlogget reise og visuell port gjenstår; tilgang på stall/kort er prøvd uten visuell endring |
| 3 · Caddie-kø/AI-grense | Avgrens AgencyOS-køene til utkast eieren faktisk kan godkjenne, og hold ukjent databasefritekst unna ekstern modell. Bygget på `grok/caddie-ko-eier-fritekst-2026-09-12` | `src/lib/caddie/draft-eier.ts`, `src/lib/caddie/modell-felt.ts`, kø- og innboks-lastere | Kø og godkjenning bruker samme eierregel. Ukjent fritekst går ikke til ekstern modell uten en dokumentert tillatt datastruktur |
| 4 · D2-TN | Fullfør den sikrede Team Norway-oversikten → testføring → resultat/historikk → dokumenter/poster | `src/app/team-norway/`, `src/components/team-norway/`, valgt TN-pakke | Samme testvariant og resultat gjennom reisen, korrekt spiller-/coach-/organisasjonsinnsyn og ærlig manglende data |
| 5 · D2-WANG | Fullfør WANG-hjem fra den sikrede Toppidrett-grensen → skole-/treningsuke → økt → elev/gruppe → rapport | `src/app/team-wang/`, WANG-komponenter og `designsystem/wang/` | Innlogging og skole-/gruppeavgrensning virker; ingen demonstrasjonsdata fremstilles som faktiske elevdata |

R-A–R-J og REV-F1–F11 er forklart i [produktplanen](planer/produktplan-og-intervju-2026-09-11.md). Funn fra den eldre gjennomgangen må kontrolleres mot dagens kode før endring. R-G «neste økt» er allerede rettet i porteringen og skal verifiseres i prioritet 1, ikke bygges på nytt.

## Resterende oppgaver etter neste pakker

| Område / ID | Konkret restarbeid | Avhengighet / ferdigkriterium |
|---|---|---|
| PlayerHQ · D2-PH | Resterende Analyse, mål, kalender, øvelsesbank/program, profil, meldinger, deling, test/retest og sosiale reiser | Knytt hver skjerm til valgt kilde og appdata. Fullfør relevante tom-/laste-/feiltilstander. [Funksjonene P01–P11](planer/funksjonsregister-2026-09-11.md) |
| Plan/Live | Full ny/rediger/flytt-reise, FYS-standardverdier/detaljgjenoppretting, Caddie i live, frekvensmål på tvers av øktmodeller | Separate modeller beholdes. Ingen dubletter, gjenopplivede avlyste økter eller oppfunnet målt treningstid |
| Mål · R-F / F1 | Startverdi, periode og faktisk gjennomføring; TN-mål med variant, antall, enhet og retning | Faglige definisjoner før avhengige beregninger. Eventuelle nye databasefelt krever konkret autorisasjon |
| Team Norway-tester | Avstem testbatteriet mot Excel v3, variantbundet føring, korrigering/angre og historikk | [Fagkontroll](beslutningsgrunnlag/team-norway-excel-v3-kontroll.md). Ugyldige resultater avvises, og lagringsfeil bevarer registreringen |
| WANG/GFGK | Årsplan, juniorgrupper, testdager, styrkeprogram, rapporter og foresatte | Virkelige rollegrenser og avklarte fagregler; P08/O03 i funksjonsregisteret |
| Booking · R4/R5/R9 | Valgt bookingdesign og samlet coach/sted/tid → pris → betaling → bekreftelse → administrasjon | Bookingens designversjon må identifiseres for den konkrete byggepakken. Testnøkler og innloggede testroller trengs for betalingsreisen; ingen reell betaling er bestilt |
| Betaling/tilgang · R6/R8 | Credits, abonnement, oppsigelse/refusjon, TALENT/FULL og publisering av flere økter | Tillatte/avviste roller og hendelser i vilkårlig rekkefølge; ingen skjult delpublisering |
| Forelder/delt innsyn | Bytte mellom barn, plan/mål/booking, betaling og tilbakekalling av tilgang | Formål og rettigheter må stemme for hver rolle; samtykke og datadeling følges gjennom hele reisen |
| Runde/SG/DataGolf | Full runde-/slagreise, manuell korrigering, importkilder, datadekning og gjenåpning | Manuell SG i PR #836 er et delresultat. Sammenligningsgrunnlag, rå brutto score og kilder må være tydelige |
| Baneguide · BG-01–06 | Gameplan/kart/soner, samme slagkjede i kart og liste, GPS, offline, bag/spredning og coachvisning | Seks konkrete delpakker står i funksjonsregisteret. Avklar datakilde, bruker, offline-omfang og valgt design ved oppstart |
| Vindverktøy | Avklar treningsberegning, værkilde eller fysisk måler; bygg deretter én valgt funksjon | Ingen sensor- eller værintegrasjon er bekreftet som valgt. Usikkerhet og datakilde skal vises |
| AgenticOS/Jarvis | Innkurv, utkast, godkjenning, rutiner, oppgaver og kalender koblet til faktisk kjøring | Ingen editor-agentkopier som runtime. Utsending til andre krever gjeldende eksplisitt autorisasjon |
| Marked/salg | Nettsider, tilbud, coachprofiler, innhold og fungerende overgang til booking | Avstem bestilt omfang; ikke aktiver et historisk markedsføringssystem automatisk |
| Økonomi/personlig | Beslutningsstøtte, rapportgrunnlag og egne oppgaver | Avklar konkret behov; økonomitall kun fra autorisert Tripletex-eksport |
| Samtykke · R-J | Formål, opplysningstype, alder, rolle, deling, lagringssted og historikk | Verifiser regelgrunnlaget før tekst/tilgang endres. Ingen automatisk bytting av aldersgrense |
| Kodekontroll · R-I | Avvisningstester på eksporterte handlinger i PlayerHQ, AgencyOS, Team Norway, WANG og forelder. Ubrukt vaktimport feiler i `check-action-auth` | Bygget 12.09; venter samling. [Kontroll](design-audit/handlingstilgang-r-i-2026-09-12.md). Innlogget isolert reise og øvrige handlinger gjenstår |
| Felles design/kvalitet | Avstem alle 480 sideruter og deres mønstre, visuell kontroll, kontrast, fokus, mobil og stor tekst | 480 ruter er inventar, ikke 480 unike ferdige design. Ingen ny kontrastbaseline for å skjule brudd |
| Drift/lansering | Produksjonens innloggings-/funksjonsvern, alarmprøve, gjenoppretting med filer og full kundereise | Konkret miljøautorisasjon for tidligere avvist funksjonssikkerhetsendring; testoppsett for betaling og varsling; dokumentert faktisk publisert versjon |
| Produktbeslutninger | Avklar blokkerende produkt-/fagspørsmål rett før den avhengige leveransen; samle resten i intervjuet uten å stoppe uavhengig teknisk arbeid | [Intervjuguide](planer/produktplan-og-intervju-2026-09-11.md). Familie-OS/eldre sideprosjekter er bevart som underlag, ikke automatisk aktivert |

## Lanseringsporter L0–L8

Lansering kan først vurderes når alle porter under har datert bevis mot én eksakt commit:

| Port | Målbart bevis |
|---|---|
| L0 · omfang | P0-DEKNING og D6 bestått; ingen ukjent brukerflate eller kritisk tilstand |
| L1 · funksjon/roller | Kritiske ende-til-ende-reiser består med tillatte og avviste roller; ingen kritisk prøve er hoppet over |
| L2 · integrasjoner | Booking, betaling, e-post/varsling og avtalte importer består i testmiljø med gjentakelse, feil og returflyt |
| L3 · tilgjengelighet | Tastatur, synlig fokus, skjermlesernavn, kontrast, 320 px og 200 % tekst består for kritiske reiser |
| L4 · enheter/nettlesere | Avtalte mobil-, iPad- og desktopbredder samt støttede nettlesere består uten funksjonstap |
| L5 · ytelse | Avtalte måltall for last, respons og sentrale nettsignaler er definert og bestått på representative sider |
| L6 · sikkerhet/personvern | Tilgang, handlingstilgang, ressursavgrensning, samtykke, dataminimering og hemmeligheter er kontrollert uten kritiske funn |
| L7 · drift | Logger/alarmer er prøvd; sikkerhetskopi og faktisk gjenoppretting møter dokumentert RTO/RPO (maks tid/datapunkt-tap); rollback er prøvd |
| L8 · produksjon | Eksakt commit er publisert med autorisasjon, røyktest og full kritisk kundereise; resultat og tidspunkt er dokumentert |

## Arbeidsmåte og oppdatering

Arbeid på egen gren, bevar andres endringer, og bruk én ansvarlig oppgave per filområde. Kjør relevante tester, full `npm run verify` og `npm run prosjekt:sjekk` før commit. Anders har bestilt fletting av denne samlingen; senere oppgaver følger sin gjeldende autorisasjon. Ikke kjør migrasjoner, seed/import, reelle betalinger eller utsending som opprydding.

Marker separat: **bygget**, **komponentprøvd**, **innlogget prøvd**, **sett av Anders**, **flettet** og **publisert kontrollert**. Arkiv inneholder historiske oppgaver og målinger; dokumentert intensjon er ikke bevis på ferdig funksjon. Oppdater denne listen etter hver sammenhengende leveranse, uten en konkurrerende masterplan.
