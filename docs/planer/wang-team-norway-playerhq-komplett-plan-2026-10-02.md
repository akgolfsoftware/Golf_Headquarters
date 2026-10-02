# WANG, Team Norway og PlayerHQ — komplett produkt- og designplan

Bestilling fra Anders 02.10.2026. Grunnlag: HQ `25bc3302e`, gjeldende beslutninger og lokal IUP-kilde. Dette er en plan og designbestilling, ikke en påstand om at funksjonene er implementert eller at Team Norway har inngått kundeavtale.

## Gjennomføringsstatus 02.10.2026

Planen er fortsatt ikke fullført. Den løpende [nattjournalen](wang-tn-gjennomforing-natt-2026-10-02.md) er fasit for konkrete merge- og testresultater. [Kontrollmatrisen](wang-tn-leveransekontroll-2026-10-02.md) skiller det som er levert, det som bare er tegnet, og det som gjenstår. Tabeller under beskriver bestilt omfang og det daterte startgrunnlaget; «mangler» ved oppstart er ikke automatisk dagens status.

Spillereid utviklingssjekk og sesongevaluering, lagring, levering, historikk og navngitt trenerdeling er merget. PR #1096 koblet eldre personlige WANG/TN-lesere til samme navngitte deling; 24 syntetiske databasetester og 24 innloggede rutekontroller bestod. Trenerforslag er implementert for WANG og Team Norway: forslag vises i spillerens PlayerHQ-innboks, godkjenning anvender én gang, avslag bevarer planen, og samtidig endring gir konflikt. PR #1099 er merget: WANG- og TN-trenere kan publisere samlingsprogram for valgt gruppe; spillerne mottar private invitasjoner og kan legge øktene i egen Workbench-kalender. CI verifiserte 4 328 enhets- og 101 komponenttester. Rom- og pakkeliste er utenfor den PR-en. PR #1102 er merget som `1e4c2f919`; WANG-turneringshistorikken leses nå gjennom samme tilgangskontrollerte transaksjon. PR #1104 er merget som `63242f9e3`: siste kildevaliderte, innleverte IUP-utviklingssjekk og sesongevaluering vises i WANG- og TN-spillerprofilene innenfor navngitt deling; utkast forblir skjult. Lokal fullkontroll, fersk PR-CI, main-CI, produksjonsrøyktest og Vercel-produksjonsdeploy bestod. Det er fortsatt ikke full dekning av alle 18 Excel-ark. DataGolf DG01–17 er tegnet i alle tre designmiljøer, med [egen kilde- og skjermkontroll](../design-audit/datagolf-precision-wang-team-norway-2026-10-02.md); kundeintegrasjon er ikke aktivert.

PR #1107 er merget som `7413ce739` og legger til et kildekontrollert IUP-felt- og beregningsregister: 18 ark, 1 692 formler og 25 diagrammer er inventert, mens elev-/spillersvar er utelatt. Registeret dokumenterer uttrykkelig at full felt-til-kode-paritet gjenstår. PR #1109 er merget som `49dcc5459`: WANG-trenerens periodevurdering lagres separat fra forslaget til neste periodes fokus, og spillerens årsplan endres først etter godkjenning i PlayerHQ. Avslag, samtidige endringer og lagret oppfølging bevarer eksisterende mål. Lokal `npm run verify` bestod med 4 183 kodeprøver, 101 komponentprøver og produksjonsbygg; PR-CI og Vercel Preview bestod. Main-CI `37024646387`, Vercel-produksjonsutrulling og Playwright-produksjonsrøyktest (236/236) bestod. Full Excel-felt- og beregningsparitet gjenstår.

## 1. Målet

Digitaliser hele IUP-arbeidet i PlayerHQ, slik at spilleren registrerer opplysningene én gang. WANG-trener og Team Norway-trener skal få samme komplette sportslige spillerprofil, IUP-innhold, oppfølging og arbeidsmuligheter, innenfor dokumentert tilgang. Ingen av dem skal være avhengig av å få tilsendt et Excel-ark.

En spiller kan være WANG-elev, Team Norway-spiller, begge deler eller ingen av delene. WANG-tilhørighet og Team Norway-tilhørighet er to uavhengige medlemskap. Alle WANG-elevers testresultater skal kunne vises hos Team Norway, også når eleven ikke er landslagsspiller. Dette gir ikke automatisk tilgang til resten av profilen.

WANG og Team Norway skal kunne:

- Se komplett spillerprofil og samlet IUP fra PlayerHQ.
- Gi konkrete treningsanbefalinger og endringsforslag i spillerens Workbench, som spilleren godtar eller avviser.
- Opprette, publisere og følge opp gruppeplaner og treningssamlinger. Inviterte spillere kan godta og legge planen i egen kalender og Workbench.
- Planlegge felles testdager, føre hele testbatteriet og følge alle resultater på tvers av relevante skoler og grupper.
- Søke i alle spillerprofilene fra AK Golf Pipelines og se tilgjengelige konkurranseresultater.
- Bruke komplett DataGolf-analyse når nødvendig avtale om bruk er på plass. Skjermene tegnes først i Precision Athletics, deretter med samme funksjoner i Team Norway og WANG.

«Fellesstart dag» er her tolket som en felles testdag med flere skoler/grupper, felles oppstart og eventuell rotasjon mellom teststasjoner. Modellen støtter også forskjellige startpuljer.

## 2. Kilder, status og grenser

### Kilder brukt

| Kilde | Bruk og bevisgrense |
|---|---|
| Anders' bestilling 02.10.2026 | Eier ønsket sluttresultat og rekkefølgen for DataGolf-design. |
| `AGENTS.md`, `docs/platform/AGENT-BRIEF.md`, `docs/platform/BUSINESS-RULES.md`, `docs/treningsplanlegging.md` | Gjeldende produkt-, språk- og arbeidsregler. Faglige detaljer kontrolleres mot master ved bygging. |
| `docs/design-system/design-autoritet.md` og `.claude/rules/beslutninger.md` | Precision Athletics, eget WANG-system og Team Norway App. Tidligere designlåser er historikk. |
| `docs/beslutningsgrunnlag/grillingen-runde9-wang-tn-2026-09-28.md` | Felles IUP, spillerens eierskap, deling, fireukerssjekk, testbatteri og trenerroller. Designresultater der er rapportert av designverktøyet, ikke kontrollert her. |
| Lokal `Team Norway IUP 2027.xlsx` | Direkte struktursjekk 02.10: 18 ark, 17 synlige, ett skjult, 1 692 formler, 25 diagramdefinisjoner, én pivottabell og åtte mediefiler. Se [felt- og beregningsregisteret](iup-2027-felt-og-beregningsregister-2026-10-02.md). Originalen er uendret. |
| `workbench-iup-dekning-2026-10-01.md` i Documents/Claude/akgolf-hq | Detaljkontroll av felter, spørsmål, formler og kode 01.10. Brukt som datert revisjonsgrunnlag, ikke dagens produksjonsbevis. |
| `docs/beslutningsgrunnlag/team-norway-excel-v3-kontroll.md` | Den separate testprotokollfilen v3. Denne filen er ikke identisk med IUP 2027. |
| `src/components/admin/precision/AG08Faner.tsx`, `src/lib/domain/tn-arbeidsflate.ts`, `tn-workbench.ts`, `src/lib/portal-stats/datagolf-data.ts` | Direkte lest kode bekrefter eksisterende visninger, lesere, planhandlinger og gjenværende IUP-plassholdere. Ingen innlogget funksjonstest i denne økten. |
| `ak-golf-pipelines/README.md`, `docs/datagolf-endpoints.md`, `docs/datagolf-status.md`, `.github/workflows/junior-tours-sync.yml` | Datakjeder og kildetyper. Eldre radtall i dokumentene er historiske, ikke ferske målinger. Den undersøkte arbeidsflyten har identitetskobling, nivåberegning og oppdatering av lesetabeller. |
| [DataGolf API](https://datagolf.com/api-access), [vilkår punkt 13](https://datagolf.com/terms-and-conditions) | Kontrollert 02.10.2026. API-tilgang er ikke i seg selv rett til å vise data til kunder. |

IUP 2027 har SHA-256 `6786d70f166dc4d5602f792a165eef8372743597ac44904a9fa0a3dd2892f222`. Kildefilen ligger lokalt i `Documents/Claude/ak-golf-academy/region-satsing/innkommende/`. Kontaktopplysninger, helseopplysninger og utfylte spillersvar skal ikke følge designpakken.

### Hva som er kjent nå

- PlayerHQ har mange av byggesteinene: profil, Workbench, økter, målsetninger, teknisk plan, tester, statistikk og konkurranser. Det er ikke det samme som full Excel-dekning.
- Spiller 360 har en IUP-visning med tolv seksjoner. Direkte kodekontroll viser fortsatt tom sesongevaluering og teksten «Utviklingssjekken finnes ikke i appen ennå». Den viser også skala 1–8, som avviker fra IUP 2027.
- Team Norway har spillerlister, test-/protokollvisninger, gruppekommunikasjon og Workbench-handlinger. Disse må kontrolleres mot regelen om forslag før endring av spillerens personlige plan.
- WANG har trenerflate, IUP-samtale og turneringsvisning. Flereskoleoversikt og komplett profil må ferdigstilles mot valgt design.
- Pipelines er vedtatt eneste innhenter av turneringsresultater. Automatisk innhenting alene beviser ikke at alle resultater treffer riktig PlayerHQ-profil.
- Ingen produksjonsdata, ekte spilleropplysninger, innlogging, invitasjoner eller databaseendringer er utført i denne planøkten.

Bruk statusene **kildekartlagt**, **tegnet**, **klikkbart**, **kodet**, **funksjonstestet**, **vist til Anders**, **produksjonsverifisert** hver for seg. Utestede funksjoner merkes utestet.

## 3. Produktregler som skal bevares

1. **Én spiller, én profil, én IUP.** Organisasjonene leser samme grunnlag, med egne arbeidsflater og tilgangsgrenser. Opprett ikke en WANG-kopi og en Team Norway-kopi av samme svar eller test.
2. **Spilleren bruker PlayerHQ.** Ingen separat WANG-/TN-spillerapp og ingen ny IUP-hovedfane. Utfyllingen ligger i I dag, Plan, Stats, Målsetning og Meg. Trenerne får samlet IUP i spillerprofilen.
3. **To uavhengige medlemskap.** Skole, skoleår, trinn, gruppe, organisasjon og gyldighetsperiode skal kunne endres uten å slette spillerens historikk.
4. **Samme funksjonsdekning hos begge trenere.** WANG-spesifikke kompetansemål vises bare i WANG. TN-spesifikke uttak og landslagsklasser ligger hos TN. Felles IUP/testdata og planforslag fungerer likt.
5. **Personlig plan endres etter spillerens godkjenning.** WANG/TN kan publisere egne gruppeplaner, men dette gir ikke fri redigering av spillerens individuelle kalender. Trenerført testresultat trenger ikke plan-godkjenning; retting av resultat følger egen historikk.
6. **Fireukerssjekk bare for WANG-/TN-spillere.** Full sesongevaluering før uke 43. IUP-året starter etter gjeldende vedtak i uke 43; Excel-rapporten oktober–september må merkes som eget rapportvindu dersom den beholdes.
7. **Felles testbatteri og fagord.** FYS, TEK, SLAG, SPILL, TURN. AK-kategori A–K. TN-klasse kommer i tillegg. Grunnperiode, Spesialperiode, Turneringsperiode, Evaluering, Ferie og Restitusjon er perioder; samling og testdag er hendelser.
8. **Fysisk testbatteri følger vedtatt seksårsløp.** Benkpress, trapbar-markløft, lengdehopp, rotasjonskast og Club Speed. Excel-felter for CMJ/3000 m beholdes i kildekartet, men blir ikke automatisk obligatoriske tester.
9. **Alle golfresultater er brutto.** Ikke beregn Strokes Gained, WAGR Power eller ranking fra utilstrekkelige data. Ukjent er «—», ikke 0.
10. **Bevar øvrige PlayerHQ-funksjoner.** Kontoinnstillinger, abonnement og private sikkerhetshandlinger forblir spillerhandlinger. «Komplett trenerprofil» betyr sportslig og avtalt innsyn, ikke at treneren kan overta kontoen eller betalingskortet.

## 4. Tilgang og deling

Tilgang må beregnes på serveren for hver lesing og skriving, også eksport, søk, vedlegg, direkte lenker og mellomlagrede data. E-postdomene og medlemskap alene er ikke tilstrekkelig.

| Spillerens tilhørighet | WANG-trener | Team Norway-trener |
|---|---|---|
| WANG, ikke TN | Komplett profil ved gyldig profildeling og skole-/trenerrelasjon | WANG-testdata gjennom skoleavtalen, selv uten TN-medlemskap. Øvrig profil krever egen deling. |
| TN, ikke WANG | Bare eventuell særskilt tildelt og gyldig profildeling | Komplett profil ved gyldig profildeling og trenerrelasjon |
| Både WANG og TN | Komplett profil ved gyldig deling | Komplett profil ved gyldig deling; WANG-testdeling er en separat tilgangsvei |
| Ingen av delene | Bare særskilt autorisert relasjon | Ingen privat profiltilgang som standard. Kan se tilgjengelig konkurranseprofil fra tillatte kilder. |
| Ingen PlayerHQ-konto, men finnes i pipelines | Tilgjengelig konkurranseprofil og mulighet til å be om kontokobling | Samme. Ingen oppdiktet privat IUP eller automatisk kontoovertakelse. |

WANG-testdeling skal være en eksplisitt organisasjonsregel med dokumentert avtaleversjon, skole, mottaker, gyldighet og tilgangsformål. Spilleren ser tydelig at testene deles med Team Norway uavhengig av landslagsmedlemskap. Ikke lag en bryter som later som denne avtalte delingen er valgfri. Avtalegrunnlag og håndtering av slutt på skoleforhold må dokumenteres før ekte drift; et produktvedtak alene er ikke bevis på gyldig behandlingsgrunnlag.

Full profildeling er separat og kan trekkes tilbake. Etter tilbaketrekking skal den ordinære treneren straks miste denne tilgangen, mens egenført/trenerført historikk blir hos spilleren. WANG-testdelingen påvirkes av skoleavtalens egne vilkår, ikke av en tilfeldig profilbryter. Avsluttet trenerrolle skal umiddelbart stenge vedkommendes tilgang i begge spor.

Gjeldende vedtak om delingslenke: sju dagers gyldighet, navngitt mottaker på `wang.no` eller `golfforbundet.no`, nødvendig foresattgodkjenning under 16 år. Vis hva «komplett» omfatter, inkludert helse og meldinger. Helseinnhold, tredjepersoners meldinger og vedlegg må ha uttrykkelig avgrenset tilgangsgrunnlag. Ikke gjør hele innboksen til en offentlig journal. Kontroller hvert dataområde mot gjeldende personvernregler før aktivering.

Sportslige oversikter skal fortsatt virke når enkelte felt er skjermet: «Ikke delt», «Mangler svar» og «Ingen data» er tre forskjellige tilstander.

## 5. Full dekning av Excel-innholdet

Tabellen er komplett på arknivå for den kontrollerte IUP 2027-filen. Den er et kravkart, ikke en ferdigattest. [Felt- og beregningsregisteret](iup-2027-felt-og-beregningsregister-2026-10-02.md) teller alle kildeobjekter og beskriver feltfamilier, kjente formler og avvik uten å lagre elev-/spillersvar. Det felt-for-felt-beviset som gjenstår, er konkret lagring, PlayerHQ-skriveflyt, WANG- og TN-leser, delingsgrunnlag og bestått test for hver aktiv kravrad.

| ID / ark | Innhold som skal digitaliseres | PlayerHQ | Begge trenerprofiler | Statusgrunnlag |
|---|---|---|---|---|
| IUP-01 Intro | Veiledning, arbeidsrekkefølge, nivåvalg, fremdrift og manglende opplysninger | Veiledet utfylling på eksisterende flater | Samlet status og lenker til manglende deler | Delvis |
| IUP-02 TN Coaches | Fagperson, rolle, kontakt, ansvarsområde og gyldighet | Meg / Mitt støtteapparat | Fagapparat og spillerens team | Delvis |
| IUP-03 Person info | Profil, klubb, skole/college, kontakt, GolfBox-ID, ansvarlig trener, golf/fysisk/mental/puttetrener, foresatte, skade/medisin/allergi | Meg, med avgrenset helsedeling | Samme opplysninger når de er delt, synlig kilde og sist endret | Delvis |
| IUP-04 Evaluering spørsmål | Tre fritekstsvar, ti egenvurderinger 1–4, faktisk/planlagt prosentfordeling på fem områder, minst tre forbedringspunkter | Årlig evaluering; lagre og fortsette | Alle svar, historikk, kommentarer og forslag til tiltak | Samlet funksjon mangler i datert kontroll |
| IUP-05 Målsetting og oppfølging | Alle resultatlinjer, historikk, kvartaler, årsresultat, nye målsetninger og vurdering | Stats og Målsetning | Komplett matrise og oppfølging per spiller | Delvis |
| IUP-06 Prosessmål | Resultatmål, handling, prosess, start/slutt, målemetode, utstyr/fasilitet, hjelper, evaluering | Målsetning → Workbench | Se sammenheng og foreslå endring | Delvis |
| IUP-07 Årsplan | Uker, perioder, hovedfokus, prioritet per område, tids-/øktbudsjett og oppholdssted | Workbench År/Periode | Samme plan og forslag med før/etter | Delvis |
| IUP-08 Turneringsplan | Turnering, Power, hull, uke, datoer, dager, land/tour, reise, totalsummer og nivåfordeling | Turneringsplan i Workbench | Samme plan, historikk og konkurransebelastning | Delvis |
| IUP-09 Ukeplan | Fire uketyper, morgen/ettermiddag/kveld, antall/tid, treukerssyklus og testplassering | Workbench Uke/Måned og maler | Foreslå uke, syklus eller enkeltøkter | Delvis |
| IUP-10 Treningsøkter | Oppvarming, sving/putt/nærspill/wedge, formål, oppgaver, repetisjoner, tid, utstyr/antall og progresjon mot spill/press | Øktbygger, maler, Live og logg | Hele øktinnholdet, gjennomføring og tiltak | Delvis |
| IUP-11 Utviklingssjekk 5 Prosesser | Alle spørsmål per nivå, de sju kategoriene, riktig skala og historikk | Fireukerssjekk i I dag/innboks | Alle spørsmål og svar, endring over tid og oppfølging | Mangler / versjonsavvik |
| IUP-12 TN Tester Tot | Hele testbatteriet, daterte resultater, råmålinger, protokoll og scorekort | Stats / Tester | Resultatmatrise for spiller, gruppe, skole og testdag | Delvis; flere protokoller sperret |
| IUP-13 Teknikktest | Driver, 7-jern og wedge; A/B; carry/side, restavstand, PEI, målfelt, slagspredning og statistikk | Gjennomføring og testanalyse | Samme rådata og forklarte beregninger | Vesentlig protokollavvik |
| IUP-14 Teknikkplan | Hvorfor endre, nåværende/ønsket ballflukt og treff, GOBBS, bevegelse, metoder, driller, video, utstyr og ferdiguke | Teknisk plan / Workbench | Se plan og sende konkrete oppgaveforslag | Delvis |
| IUP-15 TN Fystester | Måleserier, historikk, referanser og scoreformler | Tester / Fysisk | Samme resultater og referansegrunnlag | Avvik mot vedtatt seksårsløp |
| IUP-16 Treningsdagbok | Faktisk mengde FYS/TEK/SLAG/SPILL/TURN, antall økter, dag/måned/sesong og fordeling | Gjennomføring og Stats | Planlagt mot faktisk, utvikling og manglende registrering | Delvis; faktisk tid må avstemmes |
| IUP-17 Statistics | Referanser for SG/PEI, avstander og ballplassering, tabeller og bildebasert faginnhold | Stats / Referanser | Samme tabeller med kilde, utvalg og metode | Ikke full likhetskontroll |
| IUP-18 Ref, skjult | Intervaller og oppslag for forventede putter | Beregningsgrunnlag med forklaring | Samme versjon og grenseverdier | Delvis / intervallavvik |

### Målmatrisen må inneholde alle disse måltallene

Ranking WAGR og NGF juniorranking; gjennomsnittlig brutto turneringsscore; brutto utenfor turnering; beste/verste turneringsscore; SG totalt, utslag, innspill totalt og 100–150/151–200 m, nærspill og putting; putting i 0–3, 3–5, 5–10, 10–15, 15–25, 25–40 og 40+ fot; PEI totalt og 40–80, 80–120, 120–160, 160–200 og 200+ m; slaglengde, avvik fra mållinje, FT %, GIR %, scrambling; konkurranser, konkurranserunder, treningsrunder 9/18 hull, golftreningstid og fysisk treningstid.

Hver rad trenger stabil ID, definisjon, enhet, kilde, periode, antall målinger, målsetning og historikk. Avklar utydelig nærspilletikett «> 45 Total», FT-definisjon og overlappende intervaller. WAGR Power, WAGR-ranking og DataGolf-feltstyrke er forskjellige mål. Skilj manuell rapportering fra automatisk beregning.

### Spørsmål og protokoller: versjoner må holdes atskilt

- Direkte uttrekk 02.10 bekrefter Ung 34, Junior 43, Amatør 47 og Profesjonell 38 spørsmål: 162 totalt. Ordlyd og cellehenvisninger følger i `wang-tn-iup-2027-sporsmal.md`. Tidligere vedtak bygger på IUP 2025: 34/41/41/38. Forskjellen skal være synlig i registeret og avklares før bytte av aktiv spørsmålsversjon. Historiske svar beholder sin versjon.
- Utviklingssjekken i 2027 bruker 1–5. Sesongevalueringen bruker 1–4. Appens uferdige 1–8-etikett skal ikke bli ny fasit.
- Nivå følger gjeldende skole-/aldersvedtak; Ung etter klassetrinn og Junior til og med året spilleren fyller 19. Nivåskifte sletter ikke historikk.
- De sju kategoriene er sosialt, mentalt, fysisk, strategisk, teknisk, golfutvikling og neste trinn. Arkets tittel «5 Prosesser» er ikke grunn til å kutte to kategorier.
- Teknikktestens 2027-felt omfatter Swing Direction, Club Path, Attack Angle, Face to Path, Spin Loft, Smash Factor og Club Speed. Face Angle, Dynamic Loft og Impact Location fra andre protokoller er ikke erstatninger.
- Testprotokoll v3 og IUP 2027 er to ulike kilder. Katalogføring, råutkast og gyldig fullføring skal skilles. Eksterne protokollvedlegg må hentes og kontrolleres før de regnes som dekket.

### Kjente regnearkfeil skal korrigeres åpent

Kontrollen 01.10 fant gamle dagbokdatoer, totalsummer som blander minutter med antall økter, turneringssummer som blander hull og ukenummer og utelater rader, «gjennomsnitt» som bruker median, avvikende A/B-områder i teknikktest, motstridende FYS-vekter og yards × 0,9 i stedet for eksakt enhetskonvertering. Dokumenter original, korrekt faglig regel, beslutning og referansetest. Ikke kopier feilen, og ikke merk avviket løst uten kilde.

### Registeret som beviser dekning

Én rad per spørsmål, felt, beregning, validering, relevant diagram/pivot, referanse og brukerhandling:

`krav-ID · kildefil/hash · ark/celle/objekt · kildeversjon · kravtekst · datatype/enhet/skala · obligatoriskhet · lagringsfelt · PlayerHQ-inngang · WANG-visning · TN-visning · leser/skriver · tilgang · skjerm-ID · handling/tilstand · test-ID · resultat · avvik`

Statusene per krav: dekket, delvis, mangler, versjonskonflikt eller eksplisitt erstattet ved beslutning. Ingen tomme rader eller automatisk «dekket» fordi et navn ligner. Tell dekning separat for registrering, lagring, beregning, historikk og hver trenerflate. «100 % Excel-dekning» krever bestått kontroll på alle aktive krav og dokumenterte erstatninger. Dagens plan gir ikke dette stempelet.

## 6. Komplett funksjonsliste for PlayerHQ

Dette er funksjonsomfanget som skal bevares og fullføres. «Eksisterende område» betyr funnet i ruter/kilder, ikke fullført kundereise. Det medfølgende ruteinventaret viser alle observerte sidefiler ved målingen, inkludert eldre omdirigeringer: 177 i PlayerHQ, 7 i WANG og 35 i Team Norway. Det er 219 sidefiler, ikke 219 verifiserte brukerfunksjoner.

| ID | Funksjonsfamilie og underfunksjoner | Statusgrunnlag |
|---|---|---|
| PH-01 | I dag: dagens økt, neste handling, varsler, ventende planer, fireukerssjekk, samlingsinvitasjoner | Eksisterende område + nye koblinger |
| PH-02 | Profil: personinfo, klubb, skole/trinn, ambisjon, medlemskap, spiller-ID og pipeline-kobling | Eksisterende + IUP-felt |
| PH-03 | Mitt team: ansvarlig, golf/fysisk/mental/puttetrener, andre fagpersoner og foresatte | Utvides |
| PH-04 | Helse: skade, relevante medisinske forhold, allergi, fravær og avtalt deling | Eksisterende + strukturerte IUP-felt |
| PH-05 | Deling: mottaker, omfang, foresattgodkjenning, lenke, utløp, tilbakekalling og WANG-testavtale | Delvis / må kontrolleres |
| PH-06 | Workbench: År, Periode, Måned, Uke, Økt, Volum og Målsetning | Eksisterende |
| PH-07 | Årsplan/perioder: opprette, redigere, kopiere år, fokus, budsjett, ukeprioritet, oppholdssted | Eksisterende + IUP-utvidelse |
| PH-08 | Kalender: egen plan, arvede gruppeøkter, skole, turnering/reise, kollisjoner og endringer | Eksisterende + full sammenheng |
| PH-09 | Ukemaler og sykluser: fire uketyper, treukerssyklus, gjentakelser, kopiering og testplan | Eksisterende + IUP-utvidelse |
| PH-10 | Øktbygger og bibliotek: øvelser, oppvarming, teknikk, golfslag, spill, fysikk, utstyr, tid, repetisjoner og press | Eksisterende + IUP-utvidelse |
| PH-11 | Live/gjennomføring: start, pause, fortsett, registrer slag/repetisjoner/tid, avbryt, fullfør og oppsummer | Eksisterende |
| PH-12 | Treningsdagbok: faktisk tid, område, øktantall, refleksjon, dag-/uke-/måneds-/sesongsummer og etterlevelse | Eksisterende + avstemming |
| PH-13 | Målsetning: resultat, prestasjon, prosess, tiltak, frist, måling, hjelper, utstyr, evaluering og kobling til økt | Eksisterende + IUP-utvidelse |
| PH-14 | Fireukerssjekk: alle nivåspørsmål, prosessmål, historikk, lagre/fortsette og levere | Må fullføres |
| PH-15 | Sesongevaluering: fritekst, 1–4-skala, tidsfordeling, forbedringspunkter og neste mål | Må fullføres |
| PH-16 | Teknisk plan: oppgaver, posisjoner, læringssteg, miljø, repetisjoner, før/etter, video, målegrenser og revisjoner | Eksisterende + IUP-utvidelse |
| PH-17 | Fysisk plan: programmer, øvelser, periodisering, gjennomføring og progresjon | Eksisterende |
| PH-18 | Tester: katalog, tildeling, protokoll, fullføring/utkast, rådata, egenført/kontrollert, resultater og historikk | Eksisterende; protokollgap |
| PH-19 | TrackMan: import/registrering, økt/slag, spredning, gapping, testkobling og utvikling | Eksisterende |
| PH-20 | Runder: bane/tee, 9/18 hull, brutto, hull/slag, lagring, retting, historikk og SG der grunnlaget finnes | Eksisterende |
| PH-21 | Stats: SG per område, PEI, testutvikling, treningsmengde, mål/kvartaler, referanser og datakvalitet | Eksisterende + IUP-utvidelse |
| PH-22 | Konkurranse: katalog, kommende plan, reise, runder, resultat-/rankinghistorikk og automatisk pipeline-oppdatering | Eksisterende + datakjede må bevises |
| PH-23 | Gameplan: bane-/hullplanlegging og spillerens strategi | Eksisterende område |
| PH-24 | DataGolf: spiller, sammenligning, kategorier, turnering, historikk og full datautforsking | Utvides; tilgangsvilkår |
| PH-25 | Coach-kontakt: meldinger, spørsmål, svar, samtaler, video og tilbakemeldinger | Eksisterende område |
| PH-26 | Forslag: avsender, begrunnelse, før/etter, godta/avvis, konflikt, utløp og beslutningshistorikk | Må bevises ende til ende |
| PH-27 | Samlinger/grupper: invitasjon, program, svar, legg i Workbench/kalender, oppmøte og oppdateringer | Må bevises ende til ende |
| PH-28 | Booking: coach, anlegg, ønsket økt og eksisterende time-/endringsflyt | Bevares; ikke del av Excel-kravet |
| PH-29 | Utstyrsbag: køller, utstyr og relevante målinger | Eksisterende område |
| PH-30 | Talent/utvikling: nivå, fremdrift, utfordringer, prestasjoner og sammenligning | Eksisterende område; kilder må skilles |
| PH-31 | Venner og øvrige eksisterende sosiale funksjoner | Bevares med egne delingsregler |
| PH-32 | Konto: innlogging, profilinnstillinger, varsling, personvern, eksport/slettingsforespørsel og abonnement | Bevares som spillerens kontoansvar |
| PH-33 | AI-støtte som finnes i ruteinventaret: forklaringer, drill-/turnerings-/planforslag og chat | Bevares etter eksisterende synlighetsvedtak; AI-planbygger er ikke automatisk aktivert |
| PH-34 | Hjelp, oppsummeringer/ukesdigest, tilgjengelighet og alle nødvendige tom-/feil-/lagringstilstander | Tverrgående |

Treneren får sportslige lesninger og relevante handlinger fra disse familiene i profilen. Handlinger som «Godta som spiller», endre passord, betale og slette konto speiles ikke som trenerknapper.

## 7. Komplett funksjonsliste for begge trenerflater

| ID | Felles funksjon for WANG og Team Norway |
|---|---|
| TR-01 | I dag: spillere som trenger oppfølging, manglende sjekker/tester, ventende forslag og neste samling |
| TR-02 | Spiller-/elevliste: søk, filter på skole, gruppe, trinn, nivå, medlemskap, datastatus og deling |
| TR-03 | Spillerprofil: oversikt, Plan, Stats, Tester, IUP, teknisk/fysisk plan, Samtaler, Turneringer og støtteapparat |
| TR-04 | Komplett IUP i Excel-rekkefølge: alle felt/svar, kilde, versjon, dato, mangler og lenke til underfunksjonen |
| TR-05 | Sesong- og fireukersoppfølging: alle spørsmål, utvikling, notat, avtalt tiltak og forslag til spiller |
| TR-06 | Mål-/kvartalsmatrise: historikk, mål, prognose bare når faglig dokumentert, vurdering og prosesskobling |
| TR-07 | Individuell Workbench: full planinnsikt, før/etter-forslag til økt/uke/periode/år og status på svar |
| TR-08 | Gruppeplanlegging: år/perioder/uker/økter, maler, øvelser, treneransvar, ressurser og publisering |
| TR-09 | Samlinger: opprette, program, grupper, deltakere, invitasjon, kalenderkobling, oppmøte, endringer og evaluering |
| TR-10 | Tester: full matrise over egne/relevante spillere, alle resultater og manglende leveringer |
| TR-11 | Felles testdag: flere skoler/TN-grupper, puljer, stasjoner, protokoller, ansvarlige, registrering og avslutning |
| TR-12 | Testdetalj: råforsøk, metode, enheter, utstyr/forhold, dato, protokollversjon, beregning og korrigeringshistorikk |
| TR-13 | Testanalyse: spiller over tid, sammenlignbart utvalg, kategori, TN-klasse og referansenivå |
| TR-14 | Trening: planlagt mot faktisk tid, oppmøte, gjennomføring, kategorifordeling og tiltak |
| TR-15 | Konkurranse: kommende/siste, brutto, plassering, ranking, runder, nivå og kilde fra pipelines |
| TR-16 | Alle pipeline-profiler: søk, filter, tilgjengelig konkurransehistorikk og tydelig kobling/ikke koblet til PlayerHQ |
| TR-17 | DataGolf: samme komplette analysefunksjoner som Precision, tilpasset egen merkevare |
| TR-18 | Kommunikasjon: spillerdialog, samtaler, gruppeposter, dokumenter, vedlegg og lesekvittering |
| TR-19 | Forslagsoversikt: utkast, sendt, sett, godkjent, avvist, utløpt, trukket og konflikt |
| TR-20 | Delingsoversikt: hvorfor tilgang finnes, omfang, gyldighet, dokumentasjon og forespørsel om utvidet innsyn |
| TR-21 | Rapportering: IUP-/test-/samlingsoverblikk, datagrunnlag og tilgangskontrollert eksport der bestilt |
| TR-22 | Fagapparat: ansvar, kontakt og rettigheter for den aktuelle spilleren/gruppen |
| TR-23 | Datakvalitet: siste oppdatering, manglende data, kildefeil, identitetskonflikt og trygg ny henting |
| TR-24 | Administrasjon for rett rolle: organisasjon, skoler/grupper, trenere, tilgang, avtaler og livssyklus |

### WANGs særfunksjoner

- Trenerens seks hovedinnganger: I dag, Trening, Tester, Konkurranse, Meldinger, Elever. Sportssjef får Administrasjon i tillegg. Full funksjonsbredde løses med faner og detaljer, ikke flere titalls hovedmenypunkter.
- Skoler, skoleår, trinn/kull, seksårsløp og koordinering mellom skolene. Trener ser egne tildelinger; felles testdag gir avgrenset tverrskoleadgang, ikke generell tilgang til andre skolers private profiler.
- Kompetansemål fra Udir, koblet til riktig treningsområde og oppfølging.
- Morgenøkter, oppmøte og arvet gruppeplan inn i PlayerHQ; timeplan-/skolekollisjoner.
- Sportssjefens trener-/rolleforvaltning, opptak, avtale-/delingsoversikt og planadministrasjon.
- Den eksisterende åpne WANG-fellessiden holdes separat. Prosjektet `~/Developer/wang-toppidrett` er et annet produkt og skal ikke bygges om som del av denne planen.

### Team Norways særfunksjoner

- Landslagsgrupper, samlinger, månedsplan og oversikt over hvem som trenger oppfølging.
- Nasjonal WANG-kartlegging: alle skoler og alle aktuelle elever, også uten TN-medlemskap, leveringsgrad per test og testdato, råresultater og sammenlignbare utviklingsforløp.
- Landslagsklasse ved siden av AK-kategori; referansenivåer og uttaksgrunnlag med synlig kilde. Manglende vurderingsmodell vises som manglende, aldri oppdiktet uttakspoeng.
- Skoler, college, rangliste, turneringer og live-watch, med avgrensning etter faktisk datadekning.
- Fagapparat, lisens/økonomi, gruppeposter, dokumenter og rolleforvaltning beholdes som egne funksjoner. Økonomi er kun for autorisert lederrolle og skal ikke fylles med estimerte tall.
- «Bare testinnsyn» er en komplett, nyttig profilvariant med tester og nødvendig identitet, ikke en feilside og ikke full privat profil.

## 8. Forslag direkte til spillerens Workbench

1. Trener åpner spiller, riktig dato/økt/plannivå og velger «Foreslå endring».
2. Trener endrer i en egen forslagsversjon: innhold, tid, mål, belastning, øvelser eller hele perioden. Begrunnelse og kobling til IUP/test/konkurranse kan legges til.
3. Vis nøyaktig før/etter: hvilke økter legges til, flyttes, endres eller foreslås fjernet, tidsendring og eventuelle kalenderkollisjoner.
4. Publisering sender ett forslag til spillerens innboks og viser markering i Workbench. Den aktive planen endres ikke ennå.
5. Spilleren kan åpne detaljene, godta eller avvise, og eventuelt be om justering. Ikke gjør «sett» til «godkjent».
6. Ved godkjenning kontrolleres at planen fortsatt er den versjonen forslaget gjaldt. Ved konflikt vises hva som er endret av spiller/annen trener, og det lages et oppdatert forslag.
7. Godkjent forslag anvendes samlet én gang. Spilleren og treneren ser samme status og ny plan. Gjentatt klikk eller nettverksforsøk skal ikke duplisere økter.
8. Historikken viser avsender, organisasjon, grunnlag, tidspunkt og beslutning. Avvisning bevarer planen. Angring må ivareta gjennomførte økter og nye endringer.

Tilstander: utkast, sendt, sett, godkjent, avvist, trukket, utløpt, konflikt, lagringsfeil. Samtidige WANG-/TN-forslag skal kunne vurderes uten at den ene organisasjonen overskriver den andre.

## 9. Samlings- og gruppeplan

1. Opprett samling: navn, formål, sted, tidssone, datoer, ansvarlige, skoler/grupper, kapasitet og deltakere.
2. Bygg komplett program med økter, tester, pauser, fasiliteter, utstyr, individuelle tilpasninger og mål. Deltakerne kan være fra flere skoler/TN-grupper; en dobbeltmedlemsspiller skal bare forekomme én gang.
3. Forhåndsvis deltakere, program og kollisjoner. Publiser en nummerert programversjon.
4. Opprett én invitasjon per spiller og samling. Invitasjonen åpnes i PlayerHQ med avsender og hele programmet. Innmelding i en samling gir ikke automatisk landslagsmedlemskap eller utvidet profildeling.
5. Spilleren velger «Godta og legg i planen» eller «Avslå». Det skal ikke kreve manuell kopiering av hver økt. Kalender og Workbench viser samme hendelser, koblet til samlingen.
6. Ved kollisjon får spilleren se alternativene og velge. Systemet flytter ikke spillerens private økter i bakgrunnen.
7. Endret tid/innhold etter publisering gir en tydelig oppdatering. Vesentlige endringer i en allerede godtatt individuell plan krever nytt svar. Gjennomførte økter omskrives ikke.
8. Trener ser inviterte, levert invitasjon, venter, godtatt, avslått, utmeldt og oppmøtt. Vis deltakerens godkjente programversjon.
9. Avlysing stopper framtidige hendelser med sporbar melding; historiske resultater og gjennomføring bevares. Varselkanal avtales og testes før ekte sending.

## 10. Felles tester og testdager

Vis en matrise spiller × test med dato, verdi, enhet, status, egenført/kontrollert, protokollversjon og siste gyldige resultat. Åpne en celle til råmålinger og historikk. Filter: skole, skoleår/trinn, gruppe, TN-medlemskap, nivå, test, periode og leveringsstatus.

Testdagbyggeren skal støtte felles start, flere startpuljer, stasjonsrotasjon, kapasitet, trener/testleder per stasjon, testrekkefølge og pauser. Samme spiller kan være medlem av flere målgrupper uten dobbelt påmelding eller dobbelt resultat.

Spiller og trener kan føre. Lagring skjer på spillerens profil med testdag som opphav. Resultatet vises deretter i PlayerHQ, hos WANG og i Team Norways tillatte kartlegging. «Kontrollert» følger verifisert trenerføring eller egen kontrollhandling, ikke bare at en trener har åpnet resultatet.

Delvis test, ugyldig forsøk, manglende obligatorisk måling, avbrudd og ukjent poengregel skal aldri produsere et fullført standardresultat. Vis råutkast der det er meningsfullt. Rettelser versjoneres med grunn, forfatter og tidligere verdi. Testforhold og protokollversjon følger sammenligninger. Ulike metoder blandes ikke i én toppliste.

Mobil registrering må bevare inntastede data ved feil. Vis «Ikke lagret» tydelig. Frakoblet kø må bare loves dersom den faktisk bygges og prøves; ellers brukes beholdt lokalt utkast og kontrollert ny innsending.

## 11. Automatisk turneringsdata fra AK Golf Pipelines

Mål: `kilde → ak-golf-pipelines → identitetskobling → resultatlager → felles profilleser → PlayerHQ/WANG/TN`. HQ skal ikke starte en ny parallell innhentingskjede.

- Bruk stabil intern spiller-ID og kilde-ID-er fra GolfBox, DataGolf, WAGR og øvrige kilder. Navnelikhet alene er aldri nok til å koble private profiler.
- `User.publicPlayerId` er en eksisterende kobling som skal gjenbrukes og kontrolleres. Offentlig konkurranseperson og privat brukerkonto er forskjellige tilgangsnivåer.
- Behold ekstern turnerings-ID, kilde, runde, status, brutto, dato og oppdateringstid. Rettede resultater oppdaterer samme post; de skal ikke bli en ny runde.
- Skill meldt på, startet, fullført, cut, trukket og diskvalifisert. Ikke vis plassering eller SG uten data. Banenavn, par og hulldata kan mangle.
- Identitetskonflikter havner i en avgrenset kontrollkø. Ikke automatisk slå sammen personer med samme navn eller skrive over manuelle treningsrunder.
- Tilgangsregler følger datakilden også i blandede profiler: DataGolf-avledede felt må ikke lekke via en generell «pipeline-resultater»-visning.
- Sjekk faktiske jobbplaner og alle skrivere før endring. Den undersøkte juniorjobben kjører ukentlig og har identitets-/nivåkjede; fersk produksjonskjøring og ende-til-ende oppdatering er ikke bekreftet her.
- Krav til ferskhet fastsettes per kilde. Foreslått akseptanse: appen viser ny publisert resultatversjon senest fem minutter etter vellykket, komplett pipeline-synk. Dette er et mål som må implementeres og måles, ikke dagens garanti.
- Vis «Sist hentet», «Kildens dato», «Ingen nye resultater» eller «Oppdatering feilet». En feilet kilde skal beholde siste gyldige resultat med tydelig dato.
- Varsling ved uteblitt jobb skal ha testbevis. Ikke gi treneren tilgang til hemmeligheter eller rå driftslogger.

Katalogen «Alle spillere» omfatter alle tilgjengelige pipeline-profiler, ikke bare spillere som har appkonto. Filter: navn, klubb, land, skole når grunnlaget tillater det, tour, alder/kategori der kilden støtter det, sesong, ranking og koblingsstatus. Full IUP åpnes bare når riktig konto og deling finnes.

## 12. DataGolf: komplette skjermer, Precision først

«All DataGolf» skal måles mot et datert register over både API-familier, faktisk lagrede felter og relevante nettstedsfunksjoner. At noe finnes på DataGolf-nettstedet betyr ikke at det finnes i API-et eller i våre tabeller. Hvert element får status: tilgjengelig, må kobles, mangler i kilden, krever egen avtale eller uttrykkelig utenfor den aktuelle brukerrollen. Ikke begrens leveransen til ett spillerkort.

Skjerm-ID-ene under er nye arbeids-ID-er og må kobles til eksisterende prosjekt-ID-er uten navnekollisjon.

| ID | Skjerm og nødvendig innhold |
|---|---|
| DG-01 | Analyseoversikt: datadekning, kildedato, lagrede utvalg, innganger til spiller/topplister/turneringer/sammenligning |
| DG-02 | Spillerkatalog: søk, land, tour, amatør/proff, kilde-ID, ranking, sortering og feltvalg |
| DG-03 | Komplett spillerprofil: grunninfo, faktiske resultater, SG-områder, modellestimert ferdighet, utvikling, turneringer og dekning |
| DG-04 | Topplister: SG totalt, utslag, innspill, nærspill, putting, tee-to-green/ball striking der kilden støtter det, lengde/presisjon og relevante tradisjonelle mål |
| DG-05 | Sammenligning: to eller flere spillere, spiller mot referanse/utvalg, samme periode, måleenhet, minimumsgrunnlag og tabell/graf |
| DG-06 | Innspill: avstands- og lie-intervaller, SG per slag, nærhet til hull, GIR, gode/dårlige slag, antall og kildeperiode |
| DG-07 | Historikk: turnering → runde → tilgjengelige målinger, brutto, SG, plassering, status og datadekning |
| DG-08 | Turneringskalender og felt: tour, sesong, bane, deltakere, starttider, endringer, resultat og detaljside |
| DG-09 | Turneringsanalyse: tilgjengelig feltstyrke, resultatfordeling, statistikk, banerunder, poeng og premieinformasjon med kilde |
| DG-10 | Live: leaderboard, tilgjengelige SG-/tradisjonelle mål og hullfordeling, tidspunkt, forsinkelse og oppdateringsfeil |
| DG-11 | Modellanalyse: ranking, ferdighetsestimat, dekomponering og før-/underveis-sannsynligheter, tydelig skilt fra målte resultater |
| DG-12 | Bane og felt: historikk, banepassform og hull-/banestatistikk bare der datagrunnlaget er dokumentert |
| DG-13 | Karriere/trend/utvalg: datoperiode, prestasjonsutvikling, referansegrupper, tabellbygger og eksplisitte begrensninger for nettsidefunksjoner uten API-støtte |
| DG-14 | Datautforsker: alle dokumenterte, tillatte datasett/felt; forklaring, filtre, kolonnevalg, sideinndeling og eksport bare når avtalen tillater det |
| DG-15 | Kilde og dekning: hvilke tourer/år/felter finnes, hullet i historikken, siste synk, kildefeil og koblingsstatus |
| DG-16 | Fra analyse til tiltak: velg funn → målsetning → konkret treningsforslag → spillerens Workbench-godkjenning |
| DG-17 | Spesialistdata: komplett register og voksenavgrenset design for eventuelle odds-/fantasydatasett; ingen spillhandling, betaling eller lenke til pengespill |

API-familier som må avstemmes mot det lokale endepunktregisteret: spillere; terminliste; felt/starttider; ranking; førturneringsmodell og arkiv; ferdighetsnedbrytning; skill ratings; approach skill; live-modell; live turnerings- og hullstatistikk; historiske runder; historiske turneringsresultater; fantasyprognoser; oddsverktøy; historiske odds; historiske fantasyresultater. Dokumenter også utgåtte endepunkter. Disse familiene er katalogisert i pipeline-prosjektet; faktisk kontotilgang og feltdekning må fortsatt prøves kontrollert.

Anders' «all data» skal ikke lydløst reduseres til SG. Odds/fantasy er ført i omfanget som separat spesialistområde, men aktivering for WANG-/TN-rollene er et konkret produktvalg. Skole- og spillerflater skal ikke få oppfordringer til pengespill. Sportslige modellprosenter kan forklares uten å fremstilles som spilltips.

På alle analyser:

- Forklar Strokes Gained som slag vunnet/tapt mot et angitt sammenligningsgrunnlag. Skill DataGolf-modell, faktisk DataGolf-resultat, Broadie-beregning, AK-nivåtall og PEI.
- Vis kilde, periode, enhet, utvalg og antall. En modellscore er ikke et målt runderesultat. Lik skala på begge sider av null.
- Ikke finn på tour-/kjønnsdekning. Kontroller om ønskede kvinne-, amatør- og juniordata finnes per datasett.
- Null måling, ukjent verdi, lite grunnlag, tomt søk, manglende avtale og kildefeil får ulike tilstander.
- Bevar valgt filter, spiller og periode gjennom navigasjonen. Mobil skal ha alle funksjoner uten sideveis scrolling av hele siden.

### Rekkefølge og designautoritet

1. Første designetappe i **AK Golf Precision Athletics** (`7d7c2994`): tegn DG-01–DG-17 med syntetiske data, oversikt → toppliste → spiller → sammenligning → tiltak som første klikkbare reise. Fullfør deretter resterende DataGolf-familier.
2. Lever skjermkart, datakart, komponenter og alle tilstander. Precision bruker sitt valgte uttrykk: grafitt som primærhandling, rust som avgrenset signal, lyst som standard. Ikke start nytt designsystem.
3. Viderefør samme funksjonskontrakt i **Team Norway App delivery** (`bc3e41fc`): Jost/Lato, monospaced tall, marineblått, rød `#D70232`, eget skall og geometri. Ikke kopier Precision-farger inn i TN.
4. Tilpass samme funksjoner til **WANG Golf UI prototype** (`6cfa623c`) i WANGs eksisterende system, under relevant hovedmeny. Bevar samme filter-, måle- og tilgangslogikk.
5. Fullfør IUP-profiler, forslag, samlinger og testdager i de tre prosjektene. Dokumenter kobling mellom hvert felles krav og alle tre designversjoner.

DataGolfs standardvilkår begrenser bruken til personlig, ikke-kommersiell bruk og forbyr videreformidling. Kundevisning trenger derfor dokumentert særskilt rett. Denne planen endrer ikke lisensen og forutsetter ingen slik avtale. Design kan ferdigstilles med syntetiske data. Avtalen må dekke aktuelle mottakere, lagring, avledede visninger og eventuell eksport før ekte data aktiveres. Kilde: [DataGolf, punkt 13](https://datagolf.com/terms-and-conditions).

## 13. Felles datamodell og kundeoppsett

Gjenbruk appens eksisterende modeller før nye foreslås. Følgende er logiske behov, ikke vedtatte tabellnavn:

- Spilleridentitet med kilde-ID-er og kontrollert kontokobling.
- Organisasjon, skole, gruppe og tidsavgrenset medlemskap/ansvar; ingen hardkodet enkelt-WANG-skole eller én gruppe som erstatning for hele Team Norway.
- Avtalebasert WANG-testdeling og valgfri full profildeling som separate rettigheter.
- Versjonert IUP-spørsmålssett, svar, evaluering, mål/prosessmål, rapportvinduer og historikk.
- Felles referanse fra IUP til eksisterende Workbench-, test-, teknikk-, fysikk- og turneringsdata. Ikke samle alt i et stort fritekstfelt.
- Forslag med avsender, mottaker, opprinnelig planversjon, endring, beslutning og anvendt resultat.
- Samling/programversjon, invitasjon, svar, deltaker og koblede kalenderøkter.
- Testdag, stasjon, protokollversjon, råforsøk, validert resultat og korreksjon.
- Kilderegister og synkstatus per kilde med egnet tilgangsstyring.

Team Norway og WANG skal kunne etableres som organisasjonskunder med egne ansvarlige, grupper, onboarding, tilgang, avtaler og support. Pris, fakturering og hvem som betaler spillertilgangen skal ikke oppfinnes i designet. Gjeldende vedtak sier at spilleren betaler PlayerHQ selv. Kundeambisjonen alene endrer ikke dette; organisasjonsbetaling krever et eget konkret kommersielt valg. Ikke dobbeltfakturer en spiller som er i begge organisasjonene.

Innfasingen fra Excel skal støtte forhåndskontroll, feltmapping, kildeversjon, feilrapport og prøveimport i separat lokalt miljø. Import skal ikke overskrive nyere appregistreringer eller ta med ukjente formler som produktregler. Ekte persondata importeres først i riktig miljø med avklart grunnlag. Bevar importopphav og mulighet til å korrigere. Designpakken inneholder bare anonymiserte feltdefinisjoner og syntetiske personer.

## 14. Gjennomføringsplan

Planen er avhengighetsstyrt. Det er ikke gitt et tidsestimat uten detaljert felt- og kodekontroll.

| Etappe | Leveranse | Ansvar og avhengighet | Avsluttes når |
|---|---|---|---|
| P0 Kilde- og funksjonskart | Spørsmål/protokollversjoner, felt-til-kode-matrise per trenerflate, DataGolf-feltregister, tilgangsmatrise og avvik | Codex; før de aktuelle feltene bygges | Hvert aktivt felt har eier, lagring/beregning, spillerhandling, WANG/TN-leser, tilgang, skjerm og test |
| P1 DataGolf Precision | DG-01–17, komplett klikkbar analyseflyt og data-/tilstandskontrakt | Claude Design; første skjermetappe | Alle DataGolf-familier forklart, mobil/desktop kontrollert, syntetiske data |
| P2 DataGolf TN/WANG | Samme funksjoner i egne designsystemer | Claude Design; bygger på P1-kontrakten | Ingen tap av felt/handlinger ved tilpasning |
| P3 Profiler og IUP-design | Full spillerutfylling i PlayerHQ, komplett trener-IUP i begge organisasjoner, testinnsynsvariant | Claude Design; P0; versjonsavhengige deler merkes | Hvert IUP-krav har spillerflate og begge trenerflater |
| P4 Samarbeidsdesign | Forslag/godkjenning, samlingsinvitasjon, kalenderkobling, testdag og flerskolekartlegging | Claude Design; felles kontrakt fra P0 | Alle sentrale reiser er klikkbare med feil/avvisning/konflikt |
| P5 Felles datagrunnlag og tilgang | Identitet, organisasjoner, rettigheter, IUP-lagring og versjoner | Codex; valgt konkret design og avklarte fagregler | Positive og negative tilgangstester består |
| P6 Spiller og trenerfunksjoner | Alle IUP-hull, spørsmål, kvartalsmatrise, forslag, samlinger og testdager | Codex; P5, konkrete designversjoner | Samme lagrede data gjenåpnes riktig i alle tre flater |
| P7 Datakjeder | Pipelines → profiler og DataGolf → dokumenterte visninger | Codex; riktig prosjekt/skjema, kildeavtaler for aktivering | Automatisk oppdatering målt, ingen duplikater eller kildelekkasje |
| P8 Samlet kvalitetskontroll | Excel-paritet, hele brukerreiser, mobil/desktop, tilgang, feil og datakorrigering | Codex; syntetiske testpersoner | Akseptanseprøvene under består og gjenstående avvik er synlige |
| P9 Kundeinnføring | Organisasjonsoppsett, veiledning, avtaler, eventuell datainnflytting og kontrollert pilot | Anders eier kommersielle valg; Codex klargjør | Faktisk spiller/trenerreise bekreftet før Excel avvikles |

Denne bestillingen leverer planen og prompten. Den starter ikke bygging, sender ikke bestillingen til andre økter, aktiverer ikke produksjonsdata og inviterer ingen kunde.

## 15. Akseptanseprøver som må bestås

| ID | Prøve | Forventet resultat |
|---|---|---|
| A01 | WANG-elev uten TN-medlemskap fullfører test | Resultatet vises hos Team Norway via WANG-testdeling, med riktig elev/skole og protokoll |
| A02 | Samme elev uten full profildeling åpnes av TN | Bare avtalte testdata og nødvendig identitet vises; privat IUP/helse/meldinger er sperret |
| A03 | Spiller med WANG og TN registrerer ett svar/resultat | Samme post og revisjon vises i alle tillatte flater, uten kopier |
| A04 | Full profildeling trekkes eller trener slutter | Nye og direkte forespørsler avvises straks; historikken blir hos spilleren |
| A05 | Trener fra en annen skole prøver elevens lenke | Avvises uten relevant tildeling; en testdag gir bare avgrenset adgang |
| A06 | WANG/TN sender forslag | Gammel plan er uendret til godkjenning; avsender, begrunnelse og før/etter er synlig |
| A07 | Godta/avvis, dobbeltklikk og ny innsending | Godkjenning endrer planen én gang; avvisning endrer ingenting |
| A08 | To trenere foreslår endring og spilleren redigerer selv | Gammel planversjon kan ikke overskrive nyere arbeid; konflikt forklares |
| A09 | Samling med to skoler og TN-gruppe publiseres | Dobbeltmedlem får én invitasjon; alle riktige mottakere kan se programmet |
| A10 | Spiller godtar samling | Planen vises én gang i kalender og Workbench; medlemskap og personvern endres ikke skjult |
| A11 | Samling endres, avlyses eller spiller trekker seg | Varsel/status er korrekt; framtid håndteres uten å ødelegge fullførte økter |
| A12 | Testdag med rotasjon, kapasitet og flere testledere | Riktig test på riktig spiller; bare tillatt testleder kan føre/korrigere |
| A13 | Test mangler ett slag eller faglig poengregel | Kan ikke fremstå som fullført standardresultat eller komme på toppliste |
| A14 | Test korrigeres etter publisering | Historikk, graf og tillatte trenerflater oppdateres fra samme revisjon |
| A15 | Alle spørsmål i valgt IUP-versjon fylles, lagres og gjenåpnes | Eksakt ordlyd, skala, nivå, svar og historikk bevares hos spiller og begge trenere |
| A16 | Alle 18 ark spores gjennom kravregisteret | Ingen ubehandlet celle-/objekt-/funksjonsklasse; skjult Ref og bilde-/diagraminnhold inkludert |
| A17 | Syntetiske grenseverdier for formler og referansetabeller | Avrunding, enheter, median/snitt, intervaller og manglende verdier følger dokumentert regel |
| A18 | 60 planlagte / 45 faktiske minutter | Alle dag-/måned-/sesongsummer viser 45 faktisk og 60 planlagt uten dobbelttelling |
| A19 | Samme pipeline-resultat mottas to ganger og senere korrigeres | Én runde; korrekt ny versjon i PlayerHQ/WANG/TN |
| A20 | To konkurransespillere med samme navn | Ingen automatisk sammenblanding; usikker kobling vises til kontroll |
| A21 | DataGolf-data uten kundevisningsrett eller med blandede kilder | Ingen lekkasje gjennom skjerm, eksport, cache eller generell spillerprofil |
| A22 | Toppliste med ulike perioder/protokoller/lite grunnlag | Bare sammenlignbare data rangeres; utvalg og begrensning vises |
| A23 | Kildenedetid, tomt utvalg, treg lagring og nettverksbrudd | Riktig tilstand, bevarte data og trygg ny innsending; ingen falsk bekreftelse |
| A24 | Mobil 390 og desktop 1440, samt WANG 1280 | Alle handlinger finnes, lesbare tall, riktig merkevare, tastaturfokus og ingen global sideveis scrolling |
| A25 | Eksisterende funksjons-/ruteinventar avstemmes | Hver rute og underhandling er bevart, tilsiktet omdirigert eller erstattet med eksplisitt kobling |
| A26 | Profil uten appkonto og elev som bytter skole/slutter i TN | Konkurransehistorikk bevares; konto- og medlemskapsrettigheter følger faktisk status |

Kjør relevante automatiserte tester og nettleserreiser ved implementering. `npm run verify` er HQs kvalitetskontroll; `npm run prosjekt:sjekk` kontrollerer dokumentasjon. Pipelines har egne tester for identitet, kildekontrakt og resultatskriving. Grønn byggkontroll beviser ikke visuelt samsvar eller komplett Excel-integrasjon. Anders skal se de valgte skjermene ved siden av appen før de merkes visuelt godkjent.

## 16. Konkrete avklaringer uten å stoppe uavhengig arbeid

1. **Aktiv IUP-versjon:** velg om 2027 erstatter 2025-spørsmålene. Planen dekker 2027s innhold, men omskriver ikke historiske svar eller tidligere fagvedtak.
2. **Testkonflikter:** avgjør teknikktestens A/B, måleenheter, avvikende FYS-formler og gjenværende poengregler mot originalprotokoll og senere vedtak. Design kan vise råmålinger og avklaringsstatus i mellomtiden.
3. **DataGolf-rettigheter:** dokumenter eventuell eksisterende særavtale eller få nødvendig bruksrett før kundeaktivering. Ikke anta at abonnement eller kildehenvisning er tilstrekkelig.
4. **Kundemodell:** Team Norway som organisasjonskunde er målet. Pris, institusjonslisens og eventuell endring av spillerbetaling besluttes før betalingsflyt bygges.
5. **WANG-avtalens livssyklus:** dokumenter testdelingens gyldighet etter skolebytte/slutt, ansvar mellom organisasjonene og håndtering av foresatt-/helsedata før ekte drift.
6. **Spesialistdata:** bestem hvilke voksne trenerroller som eventuelt skal ha odds-/fantasydatasett; sportslig DataGolf-design fortsetter uavhengig.
7. **Eksisterende åpent Workbench-valg:** hva skjer med mål, perioder og budsjetter utenfor ny sluttdato ved forkorting av året? Bevar dagens sikre oppførsel til det er avgjort.

Ingen av disse punktene krever at Anders velger designsystem på nytt eller godkjenner hvert rutinemessige delsteg.

## 17. Leveranse og ærlig ferdigstatus

Denne pakken leverer én komplett hovedprompt, denne planen, et ferskt register over sidefiler og et anonymisert uttrekk av utviklingsspørsmål. Første handling hos Claude Design er DataGolf i Precision. Den videre bestillingen omfatter hele spiller-/trenerreisen og alle Excel-gapene, ikke bare første analyseoversikt.

Ved hver senere levering oppgis konkret prosjekt/versjon, ferdige skjerm-ID-er, hvilke krav de dekker, gjennomførte prøver og åpne avvik. «Komplett integrert» brukes først når alle aktive Excel-krav og trenerreiser faktisk består kontrollene.
