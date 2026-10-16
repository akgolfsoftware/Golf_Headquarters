# Komplett hovedprompt til Claude Design — Precision, WANG og Team Norway

Kopier hele innholdet fra <oppdrag> til </oppdrag>, eller legg ved denne filen i det aktuelle Claude Design-prosjektet. Den inneholder hele planen og alle 162 utviklingsspørsmål fra IUP 2027. Ruteinventaret i pakken er et supplerende kontrollgrunnlag.

<oppdrag>
<rolle_og_resultat>
Du skal videreføre eksisterende Claude Design-prosjekter for AK Golf HQ og levere komplette, klikkbare skjermer for DataGolf, spillerprofiler, digital IUP, treneroppfølging, forslag til Workbench, samlingsplaner, invitasjoner og felles testdager.

Målet er at Team Norway kan bli organisasjonskunde, og at WANG og Team Norway bruker spillernes PlayerHQ-data i stedet for å sende Excel-ark. Bevar alle eksisterende funksjoner. Spilleren registrerer én gang; begge trenerflater leser samme grunnlag. Én spiller kan være WANG-elev, Team Norway-spiller eller begge. Alle WANG-elevers tester deles med Team Norway også uten TN-medlemskap. Dette gir ikke automatisk tilgang til resten av profilen.

Lever faktiske skjermer og hele sammenhengende reiser, ikke bare en ny plan, et moodboard, en startside eller en funksjonsliste. Dette er designarbeid. Codex eier senere implementering og funksjonstesting. Ikke merk design som ferdig integrasjon med databasen.
</rolle_og_resultat>

<arbeidsrekkefolge>
1. Start med DataGolf i det eksisterende prosjektet «AK Golf Precision Athletics» (7d7c2994). Første klikkbare reise: oversikt → kategoritoppliste → komplett spillerprofil → sammenligning → konkret treningsforslag. Fortsett med alle øvrige DataGolf-skjermer DG-01–DG-17 i produktplanen.
2. Bevar en felles funksjons- og datakontrakt. Lag deretter de samme DataGolf-funksjonene i Team Norway App delivery (bc3e41fc), og i WANG Golf UI prototype (6cfa623c), med hvert prosjekts eget design. Rekkefølgen er Precision først, organisasjonstilpasning etterpå.
3. Fullfør spillerens IUP-funksjoner i PlayerHQ og komplette trenerprofiler for WANG/TN, inklusive alle spørsmål, resultatlinjer, historikk og oppfølgingshandlinger.
4. Fullfør forslag → spillergodkjenning, samling → invitasjon → kalender/Workbench og testdag → resultat → WANG/TN-kartlegging.
5. Kontroller alle krav, tilstander og funksjonsfamilier. Lever en samlet, byggbar designoverlevering til Codex med databehov, komponenter, handlinger, testtilfeller og åpne avvik.

Bruk siste faktiske filer i det aktive prosjektet og neste ledige versjon. Ikke overskriv nyere rettinger med eldre eksport. Arbeider du inne i WANG eller Team Norway, behold dette prosjektets design og bruk den ferdige Precision-kontrakten som funksjonsunderlag. Dersom Precision-leveransen ikke er tilgjengelig der, registrer den konkrete avhengigheten og fullfør uavhengig profil-/IUP-/samlingsdesign. Ikke påstå at du har redigert andre prosjekter eller sendt dem bestillinger uten faktisk tilgang.
</arbeidsrekkefolge>

<bindende_design_og_sprak>
Precision Athletics er valgt system for PlayerHQ og AgencyOS. Grafitt #141413 er primærhandling; rust #9B2415 brukes bare som avgrenset signal. Lyst tema er standard, nattema brukes i relevante Live-/uteflater. Følg siste prosjektfiler for øvrige verdier.
Team Norway bruker Team Norway App, med Jost/Lato, monospaced tall, navy skall, rød #D70232 og egen geometri. WANG bruker siste WANG-system. Train-lock, Paper og Claw er historikk. Ikke spør på nytt om disse systemvalgene.
Norsk bokmål. Bruk gjeldende ordliste, FYS/TEK/SLAG/SPILL/TURN og AK-kategori A–K. Forklar faguttrykk. Ingen emoji i UI.
Bare trener/sportssjef-flater i organisasjonsprosjektene. Eleven/spilleren bruker PlayerHQ. Ingen ny IUP-hovedfane hos spilleren; delene bor i Plan, Stats, Målsetning, Meg og I dag. Samlet IUP finnes hos trenerne.
</bindende_design_og_sprak>

<datagrunnlag_og_sannhet>
Oppdatert gjennomføringsgrunnlag 02.10: originaltro katalog for IUP2025/2027, spillereid lagring/levering/historikk, navngitt trenerdeling og felles leser av leverte besvarelser er nå merget i HQ (#1077/#1078/#1080/#1084/#1087/#1089/#1090). Ikke bygg nye organisasjonseide kopier av disse svarene. Felles Workbench-visninger er merget i #1091, men forslag→godkjenning→anvendelse og full WANG/TN-profil er ikke ferdig. DG01–17 er allerede tegnet i alle tre prosjekter; viderefør disse modulene og deres siste rettinger. Kontroller dagsaktuell leveransekontroll og nattjournal før ny implementasjon. Den innlimte planen nedenfor bevarer opprinnelig kravomfang og historisk startstatus; den er ikke dagens ferdigattest.
Produktplanen nedenfor er bestillingen. Funksjonsstatus i planen skiller eksisterende byggesteiner fra manglende sammenheng. En sidefil er ikke funksjonsbevis. Tidligere rapporter om null designavvik er ikke dagens kontroll.
IUP 2027 har 18 ark. Vedlagt spørsmålsuttrekk har 34/43/47/38 spørsmål. Det avviker fra tidligere IUP 2025-beslutning 34/41/41/38. Vis protokoll-/spørsmålsversjon i designet. Ikke bland skala 1–5 med sesongevaluering 1–4 eller appens uferdige 1–8-etikett.
Bruk bare syntetiske personer og oppdiktede eksempeltall tydelig merket som demodata. Ikke last opp originalarbeidsbøker med kontaktopplysninger, helse eller utfylte elevsvar. Ikke bruk ekte DataGolf-profiler som designdatasett. Kundevisning av DataGolf krever avklart bruksrett; tegn også tilstanden for manglende rettigheter.
Kilderegisteret skal skille faktisk resultat, modell, referanse, manuelt svar og manglende data. Manglende tall er aldri 0. Alle golfresultater er brutto. Ikke utled personlige SG-verdier fra en resultatliste uten nødvendig grunnlag.
</datagrunnlag_og_sannhet>

<konkrete_designleveranser>
A. Skjermregister med stabil ID, prosjekt/versjon, rolle, brukeroppgave, inngang, tilbakevei, felt, handling, tilstander og relevante krav-ID-er.
B. Alle skjermfamilier i planen. Ikke forklar bort hele funksjoner med «gjenbruker mønster» uten eksakt kobling og innhold.
C. Full spillerprofil med felles innhold for WANG og TN. Inkluder komplett IUP i arkets rekkefølge, ikke bare et sammendrag eller ett siste testresultat.
D. Datadictionary: hvert felt har betydning, datatype, enhet/skala, kilde, beregning, periode, tilgang og nulltilstand. Fullt felt-/API-register kan videreføres av Codex når designmiljøet mangler kilden; status må da stå som ukontrollert.
E. Klikkbare reiser med godta, avvis, konflikt, tilbake, feil og lagring. Vis også WANG-elev uten TN-medlemskap og TN-trener med bare testinnsyn.
F. Mobil 390 px og desktop 1440 px for alle familier; WANG også 1280 px. Prøv tekstforstørrelse, tastatur, lange navn/titler og tett datagrunnlag. Ingen global sideveis scrolling og ingen mobilfunksjoner fjernes.
G. Normal, tom, lasting, delvis data, feil, utdatert, ikke delt, manglende avtale, lagrer, lagret og versjonskonflikt der relevant. Skriv begrunnelse der en tilstand ikke gjelder.
H. Samlet funksjonsliste per PlayerHQ, WANG og TN med implementeringsstatus separat fra designstatus. Knytt eksisterende sidefiler til den nye funksjonskontrakten uten å gi omdirigeringer falsk status som egne funksjoner.
I. Overlevering: startfil, klikkbar prototype, gjenbrukbare komponenter, faktiske designverdier, ressurser, skjerm-/tilstandsregister, kravmatrise, datakilder, testbeskrivelse, åpne avvik og endringslogg. Lever én sammenhengende pakke som Codex kan kontrollere.

For hver Excel-rad må matrisen ha kildeark/celle, funksjon, PlayerHQ-inngang, WANG-visning, TN-visning, lagringsbehov, tilgang, skjerm-ID og akseptanseprøve. Ubehandlede originalfelt skal være synlige som mangler; ikke erklær 100 prosent dekning på grunnlag av denne prompten alene.
</konkrete_designleveranser>

<arbeidsmate_og_ferdigkriterier>
Fortsett gjennom alt avklart arbeid uten ny godkjenning for hvert rutinemessige delsteg. Still bare konkrete produktspørsmål som faktisk påvirker avhengig arbeid, og fullfør resten samtidig. Ikke spør om designsystemene på nytt. Ikke lag nye produktregler fra feil i Excel.
Vis korte framdriftsmeldinger med ferdige skjerm-ID-er, konkret neste del og reelle avvik. Rapportér hva som er tegnet, klikkbart, målt og sett av Anders hver for seg. En klikkbar simulasjon av lagring er ikke en test av appen.
Leveransen er komplett når alle bestilte funksjonsfamilier har konkrete skjermer, alle aktive Excel-krav har dokumentert plass hos spiller og begge trenere, og alle sentrale reiser kan prøves uten døde knapper. Detaljer som krever repo, API, fagregel eller lisens må være identifisert med nøyaktig avhengighet. Ikke send e-post, inviter kunder, bestill tjenester eller publiser appen som del av designoppgaven.
</arbeidsmate_og_ferdigkriterier>

<produktplan>
# WANG, Team Norway og PlayerHQ — komplett produkt- og designplan

Bestilling fra Anders 02.10.2026. Grunnlag: HQ `25bc3302e`, gjeldende beslutninger og lokal IUP-kilde. Dette er en plan og designbestilling, ikke en påstand om at funksjonene er implementert eller at Team Norway har inngått kundeavtale.

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
| Lokal `Team Norway IUP 2027.xlsx` | Direkte struktursjekk 02.10: 18 ark, 17 synlige, ett skjult, 25 diagramdefinisjoner og én pivottabell. Originalen er uendret. |
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

Tabellen er komplett på arknivå for den kontrollerte IUP 2027-filen. Den er et kravkart, ikke en ferdigattest. Felt-for-felt-registeret skal fullføres i første gjennomføringsfase; eksisterende detaljer fra kontrollen 01.10 gjenbrukes.

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
| P0 Kilde- og funksjonskart | Fullt Excel-register, spørsmål/protokollversjoner, rute-/funksjonskart, DataGolf-feltregister, tilgangsmatrise og avvik | Codex; før de aktuelle feltene bygges | Hvert ark, felt og datakildesett har eier, status og skjermtilordning |
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

</produktplan>

<sporsmalsvedlegg>
# Utviklingsspørsmål fra IUP 2027

Uttrekk 02.10.2026 av bare spørsmålsordlyd, ikke utfylte svar eller kontaktopplysninger. Original ordlyd er bevart. Dette er referanseversjon 2027; aktiv spørsmålsversjon må avklares mot vedtaket basert på 2025.

Kilde: Team Norway IUP 2027.xlsx, arket «9. Utviklingssjekk 5 Prosesser». Skala i 2027-kontrollen: 1–5. Egen sesongevaluering har en annen skala. Utviklingssjekken skal ikke reduseres til noen representative spørsmål.

Kildefil SHA-256: `6786d70f166dc4d5602f792a165eef8372743597ac44904a9fa0a3dd2892f222`.

## Ung — 34 spørsmål

| Krav-ID | Celle | Ordlyd |
|---|---|---|
| IUP27-C-01 | C5 | Jeg er fornøyd med hvordan det fungerer med vennene mine |
| IUP27-C-02 | C6 | Jeg har noen å snakke med om personlige saker |
| IUP27-C-03 | C7 | Jeg er en god venn for vennene mine |
| IUP27-C-04 | C8 | Jeg får støtte i golfsatsingen min |
| IUP27-C-05 | C11 | Min mentale tilstand er |
| IUP27-C-06 | C12 | Mine forventninger er i balanse med min innsats |
| IUP27-C-07 | C13 | Andres forventninger er i balanse med mine egne |
| IUP27-C-08 | C14 | Min motivasjon for trening er |
| IUP27-C-09 | C17 | Kostholdet jeg spiser er av god kvalitet |
| IUP27-C-10 | C18 | Mengden mat jeg spiser er nok |
| IUP27-C-11 | C19 | Min fysiske form for trening er |
| IUP27-C-12 | C22 | Min plan for å håndtere livet er |
| IUP27-C-13 | C23 | Planen min for å takle skolearbeid er |
| IUP27-C-14 | C24 | Jeg er i fase med skolen |
| IUP27-C-15 | C25 | Jeg tar avgjørelser i livet som jeg vinner i det lange løp |
| IUP27-C-16 | C28 | Jeg har et tydelig bilde/film av hvordan mine GOBBS skal være |
| IUP27-C-17 | C29 | Jeg har et tydelig bilde/film av hvordan bevegelsen min skal være |
| IUP27-C-18 | C30 | Jeg vet hvordan det skal føles når jeg gjør mine korrekte GOBBS |
| IUP27-C-19 | C31 | Jeg vet hvordan det skal føles når jeg utfører min korrekte bevegelse (teknikk) |
| IUP27-C-20 | C32 | Jeg kjenner til en/flere spillere som har en teknikk som ligner på min ønskede teknikk |
| IUP27-C-21 | C33 | Jeg har kunnskap om hvorfor mine GOBBS og min bevegelse skal være på en bestemt måte |
| IUP27-C-22 | C34 | Jeg vet hva mønstrene mine er innen teknikk |
| IUP27-C-23 | C35 | Jeg har øvelser/øvelser som vil hjelpe meg med å trene riktig svingbevegelse. |
| IUP27-C-24 | C38 | Jeg har klare mål for golfutviklingen min |
| IUP27-C-25 | C39 | Min treningsplan for golfutviklingen min er |
| IUP27-C-26 | C40 | Jeg implementerer innholdet i planleggingen min |
| IUP27-C-27 | C41 | Jeg gjennomfär mengden trening i planleggingen min |
| IUP27-C-28 | C42 | Jeg har treningskompiser |
| IUP27-C-29 | C45 | Jeg dokumenterer og evaluerer treningen/turneringen min |
| IUP27-C-30 | C46 | Jeg har balanse mellom golf og livet utenfor golfen |
| IUP27-C-31 | C47 | Energinivået mitt til å takle trening og livet generelt er |
| IUP27-C-32 | C48 | Jeg tar beslutninger om golf som jeg vinner i det lange løp |
| IUP27-C-33 | C49 | Jeg har funnet ut ting jeg trenger for å ta gode beslutninger |
| IUP27-C-34 | C50 | Jeg har forutsetninger for å gjennomføre treningen min (lokaler/treningsområde etc.) |

## Junior — 43 spørsmål

| Krav-ID | Celle | Ordlyd |
|---|---|---|
| IUP27-O-01 | O5 | Jeg er fornøyd med hvordan det fungerer med vennene mine |
| IUP27-O-02 | O6 | Jeg har noen å snakke med om personlige saker |
| IUP27-O-03 | O7 | Jeg er en god venn for vennene mine |
| IUP27-O-04 | O8 | Jeg får støtte i golfsatsingen min |
| IUP27-O-05 | O11 | Min mentale tilstand er |
| IUP27-O-06 | O12 | Jeg har balanse mellom golf og livet utenfor golfen |
| IUP27-O-07 | O13 | Mine forventninger er i balanse med min innsats |
| IUP27-O-08 | O14 | Andres forventninger er i balanse med mine egne |
| IUP27-O-09 | O15 | Min motivasjon for trening er |
| IUP27-O-10 | O18 | Energinivået mitt til å takle trening og livet generelt er |
| IUP27-O-11 | O19 | Min søvnkvalitet og kvantitet er |
| IUP27-O-12 | O20 | Kostholdet jeg spiser er av god kvalitet |
| IUP27-O-13 | O21 | Mengden mat jeg spiser er |
| IUP27-O-14 | O22 | Mitt fysiske nivå er god nok for de tekniske målene jeg har. |
| IUP27-O-15 | O23 | Mitt fysiske nivå er god nok til å gjennomføre den treningsmengden jeg trenger. |
| IUP27-O-16 | O24 | Min fysiske form for trening er |
| IUP27-O-17 | O27 | Min plan for å håndtere livet er |
| IUP27-O-18 | O28 | Planen min for å takle skolearbeid er |
| IUP27-O-19 | O29 | Jeg er i fase med skolen |
| IUP27-O-20 | O30 | Jeg tar avgjørelser i livet som jeg vinner i det lange løp |
| IUP27-O-21 | O31 | Jeg tar beslutninger om golf som jeg vinner i det lange løp |
| IUP27-O-22 | O32 | Jeg har funnet ut ting jeg trenger for å ta gode beslutninger |
| IUP27-O-23 | O33 | Jeg dokumenterer og evaluerer treningen/turneringen min |
| IUP27-O-24 | O36 | Jeg har et tydelig bilde/film av hvordan mine GOBBS skal være |
| IUP27-O-25 | O37 | Jeg har et tydelig bilde/film av hvordan bevegelsen min skal være |
| IUP27-O-26 | O38 | Jeg vet hvordan det skal føles når jeg gjør mine korrekte GOBBS |
| IUP27-O-27 | O39 | Jeg vet hvordan det skal føles når jeg utfører min korrekte bevegelse (teknikk) |
| IUP27-O-28 | O40 | Jeg kjenner til en/flere spillere som har en teknikk som ligner på min ønskede teknikk |
| IUP27-O-29 | O41 | Jeg har kunnskap om hvorfor mine GOBBS og min bevegelse skal være på en bestemt måte |
| IUP27-O-30 | O42 | Jeg vet hva mønstrene mine er innen teknikk |
| IUP27-O-31 | O43 | Jeg har øvelser/øvelser som vil hjelpe meg med å trene riktig svingbevegelse. |
| IUP27-O-32 | O44 | Jeg har en teknisk plan for de fleste golfslagene (utslag, innspill, nærspill, putt) |
| IUP27-O-33 | O47 | Jeg har klare mål for golfutviklingen min |
| IUP27-O-34 | O48 | Min treningsplan for golfutviklingen min er |
| IUP27-O-35 | O49 | Jeg implementerer innholdet i planleggingen min |
| IUP27-O-36 | O50 | Jeg gjennomfär mengden trening i planleggingen min |
| IUP27-O-37 | O51 | Jeg har forutsetninger for å gjennomføre treningen min (lokaler/treningsområde etc.) |
| IUP27-O-38 | O52 | Jeg har treningskompiser |
| IUP27-O-39 | O55 | Jeg har en god forståelse av hva collegelivet innebærer. |
| IUP27-O-40 | O56 | Jeg har en god forståelse av amerikansk kultur. |
| IUP27-O-41 | O57 | Jeg har en klar plan for hvordan mine ulike trenere (hjemme, college, Team Norway) skal samhandle. |
| IUP27-O-42 | O58 | Jeg forstår de akademiske kravene som vil bli stilt til meg på college. |
| IUP27-O-43 | O59 | Jeg forstår hvordan treningskulturen kan være annerledes i USA sammenlignet med Norge. |

## Amatør — 47 spørsmål

| Krav-ID | Celle | Ordlyd |
|---|---|---|
| IUP27-AA-01 | AA5 | Jeg er fornøyd med hvordan det fungerer med vennene mine på college |
| IUP27-AA-02 | AA6 | Jeg er fornøyd med hvordan det fungerer med vennene mine i Norge |
| IUP27-AA-03 | AA7 | Jeg har noen å snakke med om personlige saker |
| IUP27-AA-04 | AA8 | Jeg har tilpasset meg godt til amerikansk kultur og college-livet. |
| IUP27-AA-05 | AA11 | Min mentale tilstand er |
| IUP27-AA-06 | AA12 | Jeg har balanse mellom golf og livet utenfor golfen |
| IUP27-AA-07 | AA13 | Mine forventninger er i balanse med min innsats |
| IUP27-AA-08 | AA14 | Andres forventninger er i balanse med mine egne |
| IUP27-AA-09 | AA15 | Min motivasjon for trening er |
| IUP27-AA-10 | AA16 | Jeg utnytter den mentale coachingen som er tilgjengelig for meg |
| IUP27-AA-11 | AA19 | Energinivået mitt til å takle trening og livet generelt er |
| IUP27-AA-12 | AA20 | Min søvnkvalitet og kvantitet er |
| IUP27-AA-13 | AA21 | Kostholdet jeg spiser er av god kvalitet |
| IUP27-AA-14 | AA22 | Mengden mat jeg spiser er |
| IUP27-AA-15 | AA23 | Min fysiske form for trening er |
| IUP27-AA-16 | AA24 | Jeg har tilgang til gode treningsfasiliteter |
| IUP27-AA-17 | AA27 | Min plan for å håndtere livet er |
| IUP27-AA-18 | AA28 | Planen min for å takle skolearbeid er |
| IUP27-AA-19 | AA29 | Jeg er i fase med skolen |
| IUP27-AA-20 | AA30 | Jeg tar avgjørelser i livet som jeg vinner i det lange løp |
| IUP27-AA-21 | AA31 | Jeg tar beslutninger om golf som jeg vinner i det lange løp |
| IUP27-AA-22 | AA32 | Jeg har funnet ut ting jeg trenger for å ta gode beslutninger |
| IUP27-AA-23 | AA33 | Jeg dokumenterer og evaluerer treningen/turneringen min |
| IUP27-AA-24 | AA36 | Jeg har et tydelig bilde/film av hvordan mine GOBBS skal være |
| IUP27-AA-25 | AA37 | Jeg har et tydelig bilde/film av hvordan bevegelsen min skal være |
| IUP27-AA-26 | AA38 | Jeg vet hvordan det skal føles når jeg gjør mine korrekte GOBBS |
| IUP27-AA-27 | AA39 | Jeg vet hvordan det skal føles når jeg utfører min korrekte bevegelse (teknikk) |
| IUP27-AA-28 | AA40 | Jeg kjenner til en/flere spillere som har en teknikk som ligner på min ønskede teknikk |
| IUP27-AA-29 | AA41 | Jeg har kunnskap om hvorfor mine GOBBS og min bevegelse skal være på en bestemt måte |
| IUP27-AA-30 | AA42 | Jeg vet hva mønstrene mine er innen teknikk |
| IUP27-AA-31 | AA43 | Jeg har øvelser/øvelser som vil hjelpe meg med å trene riktig svingbevegelse. |
| IUP27-AA-32 | AA44 | Jeg har en teknisk plan for de fleste golfslagene (utslag, innspill, nærspill, putt) |
| IUP27-AA-33 | AA45 | Jeg kan forme ballbanen når det kreves. |
| IUP27-AA-34 | AA46 | Jeg har en god forståelse av hvordan påvirkning påvirker ballbanen. |
| IUP27-AA-35 | AA47 | Jeg har et godt utvalg av øvelser i alle deler av spillet. |
| IUP27-AA-36 | AA50 | Jeg har et godt forhold til college-trenerne. |
| IUP27-AA-37 | AA51 | Jeg opprettholder god kontakt med min hjemmetrener. |
| IUP27-AA-38 | AA52 | Jeg opprettholder god kontakt med trenerne på Team Norway. |
| IUP27-AA-39 | AA53 | Jeg har klare mål for golfutviklingen min. |
| IUP27-AA-40 | AA54 | Treningsplanen for golfutviklingen min er på plass. |
| IUP27-AA-41 | AA55 | Jeg har tilgang til gode treningsfasiliteter. |
| IUP27-AA-42 | AA58 | Jeg har en klar plan for min utvikling. |
| IUP27-AA-43 | AA59 | Jeg har tilstrekkelig økonomisk støtte for å støtte mine aktiviteter. |
| IUP27-AA-44 | AA60 | Spillet mitt er på et passende nivå for å bli profesjonell. |
| IUP27-AA-45 | AA61 | Jeg har en god forståelse av hva et proffliv innebærer. |
| IUP27-AA-46 | AA62 | Jeg har en plan B hvis profflivet ikke fungerer for meg. |
| IUP27-AA-47 | AA63 | Jeg er fornøyd med mitt støtteapparat |

## Profesjonell — 38 spørsmål

| Krav-ID | Celle | Ordlyd |
|---|---|---|
| IUP27-AM-01 | AM5 | Jeg er fornøyd med hvordan det fungerer med vennene mine på tour |
| IUP27-AM-02 | AM6 | Jeg er fornøyd med hvordan det fungerer med vennene mine hjem i Norge |
| IUP27-AM-03 | AM7 | Jeg har noen å snakke med om personlige saker |
| IUP27-AM-04 | AM8 | I have adapted well to life on the Pro tour. |
| IUP27-AM-05 | AM11 | Min mentale tilstand er |
| IUP27-AM-06 | AM12 | Jeg har balanse mellom golf og livet utenfor golfen |
| IUP27-AM-07 | AM13 | Mine forventninger er i balanse med min innsats |
| IUP27-AM-08 | AM14 | Andres forventninger er i balanse med mine egne |
| IUP27-AM-09 | AM15 | Min motivasjon for trening er |
| IUP27-AM-10 | AM16 | Jeg utnytter den mentale coachingen som er tilgjengelig for meg |
| IUP27-AM-11 | AM19 | Energinivået mitt til å takle trening og livet generelt er... |
| IUP27-AM-12 | AM20 | Jeg bruker fysisk coaching som er tilgjengelig for meg. |
| IUP27-AM-13 | AM21 | Kostholdet jeg spiser er av god kvalitet. |
| IUP27-AM-14 | AM22 | Mengden mat jeg spiser er... |
| IUP27-AM-15 | AM23 | Jeg har en god årsplan for fysisk vedlikehold/utvikling. |
| IUP27-AM-16 | AM24 | Jeg har tilgang til gode treningsfasiliteter. |
| IUP27-AM-17 | AM27 | Min plan for å håndtere livet er... |
| IUP27-AM-18 | AM28 | Jeg tar avgjørelser i livet som jeg vinner i det lange løp. |
| IUP27-AM-19 | AM29 | Jeg tar beslutninger om golf som jeg vinner i det lange løp. |
| IUP27-AM-20 | AM30 | Jeg har funnet ut ting jeg trenger for å ta gode beslutninger. |
| IUP27-AM-21 | AM31 | Jeg dokumenterer og evaluerer treningen/turneringen min |
| IUP27-AM-22 | AM34 | Jeg har et klart bilde av hvordan jeg skal stille opp for ballen. |
| IUP27-AM-23 | AM35 | Jeg har et klart bilde/film av hvordan jeg skal bevege kroppen min. |
| IUP27-AM-24 | AM36 | Jeg har god kontroll over ballbanen. |
| IUP27-AM-25 | AM37 | Jeg kan forme ballbanen når det kreves. |
| IUP27-AM-26 | AM38 | Jeg har en god forståelse av hvordan påvirkning påvirker ballbanen. |
| IUP27-AM-27 | AM39 | Jeg har et godt utvalg av øvelser i alle deler av spillet. |
| IUP27-AM-28 | AM42 | Jeg opprettholder god kontakt med min hjemmetrener. |
| IUP27-AM-29 | AM43 | Jeg opprettholder god kontakt med trenerne på Team Norway. |
| IUP27-AM-30 | AM44 | Jeg har klare mål for golfutviklingen min. |
| IUP27-AM-31 | AM45 | Treningsplanen for min golfutvikling er på plass. |
| IUP27-AM-32 | AM46 | Jeg har tilgang til gode treningsfasiliteter. |
| IUP27-AM-33 | AM50 | Jeg har en klar plan for min utvikling. |
| IUP27-AM-34 | AM51 | Jeg har tilstrekkelig økonomisk støtte for å støtte mine aktiviteter. |
| IUP27-AM-35 | AM52 | Spillet mitt er på et passende nivå for å bli profesjonell. |
| IUP27-AM-36 | AM53 | Jeg har en god forståelse av hva et proffliv innebærer. |
| IUP27-AM-37 | AM54 | Jeg har en plan B hvis profflivet ikke fungerer for meg. |
| IUP27-AM-38 | AM55 | Jeg er fornøyd med mitt støtteapparat. |

</sporsmalsvedlegg>
</oppdrag>
