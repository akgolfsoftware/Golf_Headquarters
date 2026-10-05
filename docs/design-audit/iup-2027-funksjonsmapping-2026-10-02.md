# IUP 2027 – funksjonsmapping og konkrete kodehull

Kontrollgrunnlag: main `a9a27dd07`, lest 02.10.2026. Originalens SHA-256 er `6786d70f166dc4d5602f792a165eef8372743597ac44904a9fa0a3dd2892f222`. Originalen er uendret. [Det anonyme registeret](../planer/iup-2027-funksjonsmapping-2026-10-02.json) kobler hver native celle og hvert objekt til funksjonsfamilie, lagring, ruter, kode og testfil. Det inneholder ingen utfylte data, rå formler eller mellomlagrede diagram-/pivotverdier.

Dette er full strukturell registrering og et ærlig dekningskart. Det er ikke en attest for at alle inputfelt og skjermreiser erstatter Excel. Celler med innhold kan være etiketter, fagtekst eller input; formatering alene avgjør ikke rollen. Uavklarte felt er derfor ikke feilaktig merket som ferdige.

## Avstemming av hele originalen

| Kontroll | Faktisk |
|---|---:|
| Ark | 18 |
| Native celler med eksakt ID | 14598 |
| Formelceller | 1692 |
| Spørsmål | 175 |
| Diagrammer | 25 |
| Pivottabeller | 1 |
| Excel-tabeller | 3 |
| Tegneobjekter og lenker | 89 |
| Navngitte områder | 1 |

Alle 162 utviklingsspørsmål og 13 sesongspørsmål har stabil ID, konkret originalcelle, skala, lagringsfelt og mapping. Alle 1692 formler har konkret celle, native deling og strukturelle referanser; delte barn er utvidet fra sin egen master med riktige rad-/kolonneforskyvninger. Dette beregner ikke Excel på nytt. Alle 25 diagrammer har individuell objekt-ID og seriehenvisninger. Ingen representativ rad erklæres som bevis for hele en serie.

De 26 mellomlagrede feilcellene i originalen er ført med celle-ID. De er ikke bevis på feil i appen. Standardvalideringer og standardbetingede formateringer i hovednavnerommet er begge 0. Ett ark er skjult. Alle native formelreferanser ble avstemt mot privatregisteret; eksakte uttrykk er ikke kopiert.

## Ark, funksjon og faktisk kode

| Kilde | Celler / formler | Lagring og spillerflate | Dekning og konkret begrensning |
|---|---:|---|---|
| IUP-S01 Intro/veiledning | 0 / 0 | IupBesvarelse · `/portal/mal/evaluering` | Delvis: appens veiledning finnes; native tekst-/bildeobjekter er registrert, men innholdslikhet er ikke attestert. |
| IUP-S02 Støtteapparat | 47 / 0 | User, GroupMember · `/portal/meg` | Delvis: rolle-/kontakt-/gyldighetsfelt og identisk full profil hos begge organisasjoner må fullføres av profileier. |
| IUP-S03 Personopplysninger og avgrenset helse | 58 / 0 | User, HealthEntry · `/portal/meg` | Delvis: generisk profil og helsemodell er ikke per-felt-bevis for hele Excel-skjemaet. |
| IUP-S04 Sesongevaluering | 129 / 0 | IupBesvarelse, IupRevisjon · `/portal/mal/evaluering` | Kildekoblet: alle 13 spørsmål; faktisk/planlagt fordeling og tre forbedringspunkter finnes. Navngitt trenerlesing finnes; organisatorisk profilinnbygging vurderes separat. |
| IUP-S05 Resultatmål og kvartalsmatrise | 459 / 0 | Goal · `/portal/mal` | Delvis: generiske mål finnes. Komplett Excel-radkatalog, rapportvindu, kvartalsrevisjon og kilde-/enhetskontrakt mangler. |
| IUP-S06 Prosessmål og handlingskjede | 262 / 0 | Goal, WorkbenchSession · `/portal/mal` | Delvis: PROCESS og områdekobling finnes. Typet resultatmål→handling→målemetode→hjelper/fasilitet→evaluering→konkret økt mangler. |
| IUP-S07 Årsplan og perioder | 477 / 0 | SeasonPlan, PeriodBlock, WeekPlan · `/portal/planlegge/workbench?flate=sesong` | Delvis: sesonggrenser, perioder, fokus, prioritet og budsjett finnes; ingen attest for hver Excel-celle eller begge organisasjoners forslag. |
| IUP-S08 Turneringsplan og belastning | 1424 / 64 | TournamentEntry, WorkbenchTournamentPlan · `/portal/planlegge/workbench?klassisk=1&pille=turn` | Delvis: turneringsplan finnes; Power, totaler og nivåfordeling krever definisjoner/kilde. Ingen Excel-totalparitet attestert. |
| IUP-S09 Ukeplan og treukerssyklus | 802 / 3 | WeekPlan, WorkbenchSession · `/portal/planlegge/workbench?flate=uke` | Delvis: uketyper, mengde og atomisk syklus finnes. ISO-datoer er appens kontrakt; Excel-totaler er ikke attestert per celle. |
| IUP-S10 Øktinnhold, mål og dose | 1699 / 0 | WorkbenchSession, WorkbenchDrill · `/portal/planlegge/workbench?flate=uke` | Delvis: formål/sted/øktmål, drillmål, dose, rå JSON og referansebevaring finnes. Hvert kildeeksempel er registrert, ikke erklært som individuell appøkt. |
| IUP-S11 Utviklingssjekk | 1986 / 0 | IupBesvarelse, IupRevisjon · `/portal/mal/evaluering` | Kildekoblet: 162 spørsmål med 2027-ID, nivå og 1–5. Historiske 2025-svar beholdes separat. Organisasjonsflate er ikke identisk med navngitt delingsrute. |
| IUP-S12 Samlet testbatteri | 775 / 0 | TestDefinition, TestResult, TestShot, TestSession · `/portal/tren/tester` | Delvis: v3-katalog og sammenligningsvern finnes. IUP2027-matrise og v3 er forskjellige kilder; testagent eier ny komplett protokoll. |
| IUP-S13 IUP2027 teknikktest og spredningsvisning | 2607 / 844 | TestResult, TestShot, TrackManShot · `/portal/tren/tester/team-norway` | Kildeavvik: gammel aktiv katalog er tn-excel-v3. IUP2027 har egne driver/7-jern/wedge-felt og 24 diagrammer; ingen samlet per-celle/objekt-paritet på basen. |
| IUP-S14 Teknisk plan | 759 / 0 | TechnicalPlan, PositionTask, PositionTaskLog, PositionTaskTmGoal, TechnicalPlanAudit · `/portal/tren/teknisk-plan` | Delvis: oppgaver, TM-mål, medie-URL, reps og audit finnes. Typede kildefelt og revisjonskoblet gjennomføring mangler. Tilgangsvakt er rettet i arbeidskopien, testfil finnes; ingen ny kjøreprotokoll fra denne auditen. |
| IUP-S15 Fysisk trening og testhistorikk | 933 / 7 | WorkbenchPhysicalBlock, WorkbenchPhysicalLog, TestResult · `/portal/fysisk` | Delvis: programmering og fem vedtatte tester finnes. Originalens CMJ/3000 m er historikk, ikke automatisk ny standard. Kildens score er ikke stallrelativ FYS-score. |
| IUP-S16 Treningsdagbok, måned og sesong | 1220 / 732 | WorkbenchSession, TrainingLog · `/portal/planlegge/workbench?flate=analyse` | Delvis: faktisk/planlagt, null/0 og deduplisering finnes. Excel-oktober–september/pivot kan ikke likestilles med kalenderår eller uke43-sesong uten rapportvindu. |
| IUP-S17 Statistikkreferanser og faginnhold | 913 / 30 | Referansegrunnlag · `/portal/stats` | Kildeavvik: de tre native tabellene og fagbilder er registrert. v3-paritet er ikke IUP2027-paritet; originalrader og enheter må sammenlignes særskilt. |
| IUP-S18 Skjult puttereferanse | 48 / 12 | Referansegrunnlag · `/portal/stats` | Kildeavvik: appens oppslagsmotor finnes, men v3-tabellen har annen kilde-SHA. Alle 48 native celler og 12 formler registreres; likhet er ikke attestert. |

Spørsmålene kan leses hos navngitt trener gjennom `/portal/meg/deling/innsyn` med gyldig deling og innlevert revisjon. Organisasjonsrutene `/team-wang/coach/iup/[elevId]` og `/team-norway/spiller/[spillerId]` finnes, men rutenavn er ikke bevis på at hvert dataområde har identisk feltdekning. Fullprofil-/delingsarbeideren eier videre organisasjonsinnbygging. Testagenten eier katalog og protokollgjennomføring.

## R05 – mål og prosess

Det konkrete manifestet `result_matrix_rows` har kildeceller for alle identifiserte resultat-/mengderader i IUP-S05. Samtlige native celler er også bevart i arkets cellemanifest. Generisk `Goal` støtter resultat-/prosesskategori, verdi, frist, test-/områdekobling og JSON. Det er ikke en full matrise med enheter, kilde, kvartalsvurderinger og revisjoner. Prosessarket har egne headerceller C1–J1 for handling, prosess, start/slutt, målemetode, utstyr/fasilitet, hjelper og evaluering. De må få typet lagring og lenker, ikke bare samles i tittelen.

- **R05-G01 (P1, R05.1/R05.2):** Komplett måltallskatalog og spillereid målmatrise med enhet, kilde, periode, antall, mål, faktisk og registreringstype; kvartalsvurdering/årsresultat i append-only historikk. Generisk Goal skal bevares, ikke omtolkes. Bevis: `prisma/schema.prisma:2435`. Ja: typede manuelle mål og eksplisitt rapportvindu kan bygges uten å finne på SG/PEI/ranking. Tvetydige beregningsrader blokkeres enkeltvis.
- **R05-G02 (P1, R05.3):** Typet resultatmål→prosessmål→handling→start/slutt→målemetode→hjelper→fasilitet/utstyr→evaluering→økt. category=PROCESS og linkedPyramidArea er ikke konkret resultatmål-/øktkobling. Bevis: `prisma/schema.prisma:2435`. Ja: bevar fritekst med kilde-ID, revisjon og tydelig manuell føring. Ikke autogenerer mål eller endre personlig kalender uten godkjent forslag.
- **R05-G03 (P1, R05.4):** En eksplisitt metricsammenligningskontrakt må holde automatisk råmåling, manuell vurdering og ukjent verdi atskilt; mål må ikke hentes fra den generiske payload.currentValue uten metode/versjon/periode. Bevis: `prisma/schema.prisma:2435`. Ja: provenance-/kildemerking og nullvern; beregning krever riktig kilde. SG-agent eier SG-integrasjon.

## R08 – teknisk og fysisk plan

- **R08-G01 (P1, R08 tilgang):** Basen ga enhver COACH/ADMIN tilgang via ensurePlanAccess uansett personlig relasjon. Arbeidskopien krever nå harCoachTilgangTilSpiller og beholder godkjent foresattspor. Tilgangseier har lagt til tillat/avvis-prøver; direkte plan-/oppgave-/mediebruk må gjenkontrolleres etter integrasjon. Bevis: `src/lib/teknisk-plan/ensure-plan-access.ts:15`. Tilgangseier avslutter retting og tester; ikke bygg en konkurrerende vakt. Profil-/testdeling må fortsatt samordnes.
- **R08-G02 (P1, R08.1):** Typede tekniske kildefelt mangler: hvorfor score bedres, nåværende/ønsket ballflukt/treff, GOBBS, bevegelse, metode, hjelper, utstyr/fasilitet, ferdiguke. beskrivelse/videoUrl/maaleutstyr er eksisterende deldekning, ikke komplett struktur. Bevis: `prisma/schema.prisma:5186`. Ja: lagre kildefeltene med validering/revisjon; ikke finn på faglig årsak eller automatisk fullføring.
- **R08-G03 (P1, R08.2):** Historisk gjennomføring mangler binding til eksakt oppgaverevisjon. PositionTaskLog og WorkbenchDrill.positionTaskId peker på muterbar task; TechnicalPlanAudit er hendelseslogg, ikke en versjons-ID i gjennomføringen. Bevis: `prisma/schema.prisma:5186`. Ja: additive snapshot-/revisjonsreferanser ved plan→økt→gjennomføring; bevar alle eksisterende logger. Eldre referanser merkes revisjon ukjent.
- **R08-G04 (P1, R08.3/R09):** IUP2027-teknikktest, sju TM-felt og 24 native diagrammer er ikke den aktive v3-katalogens teknikkpanel. Full objektsammenligning og gjenåpning med protokollversjon mangler i kontrollert base. Bevis: `src/lib/portal-tester/tn-catalog.ts:4`. Testagent eier katalog/regler. Koordiner ny IUP2027-versjon; råmålinger kan lagres med kjent enhet, ukjent Impact Location-metode må ikke få score.
- **R08-G05 (P2, R08.4):** Bevar CMJ/3000 m som historiske kilde-ID-er og vis metode/versjon. FYS-score er vedtatt stallrelativ score, ikke automatisk identisk med originalens sju fysiske testformler. Bevis: `src/lib/domain/fys-score.ts:18`. Ja: lesende historikk og tydelig kilde/versjon; ingen endring av fem vedtatte obligatoriske tester eller scorevekter.

## R01.3 – presise kildekonflikter og manglende regler

| ID | Kildested | Regel og avgrenset følge |
|---|---|---|
| K01 | IUP-S05-C-A16 | Den tvetydige nærspilletiketten med 45-grense må få definert måling, avstandsgrense, startplassering og utvalg før automatisk matriseverdi. Bare automatisk nærspillrad; manuelle kildebevarte mål kan lagres. |
| K02 | IUP-S05-C-A33 | FT må defineres: fairwaytreff eller annet, nevner, hull/slag som ekskluderes og brutto periode. Bare automatisk FT-prosent. |
| K03 | IUP-S05-C-A18, IUP-S05-C-A19, IUP-S05-C-A20, IUP-S05-C-A21, IUP-S05-C-A22, IUP-S05-C-A23, IUP-S05-C-A24, IUP-S05-C-A26, IUP-S05-C-A27, IUP-S05-C-A28, IUP-S05-C-A29, IUP-S05-C-A30 | Hvilken rad eier eksakt grense (3/5/10/15/25/40 fot og 80/120/160/200 m), åpne/lukkede intervaller og om tallet er SG, forventning, gjennomsnittlig PEI eller en annen aggregasjon må være eksplisitt. Automatisk bøttefordeling; ikke fritekst eller manuelle mål. |
| K04 | IUP-S05, IUP-S16 | Kvartal/årsrapport oktober–september må ha eget eksplisitt rapportvindu. Det er ikke automatisk appens uke43-IUP-år eller kalenderår. Års-/kvartalsparitet til Excel; eksplisitte datoer kan bygges autonomt. |
| K05 | IUP-S13 | Impact Location-metode og enhet, de sju TM-feltenes enheter og A/B-grunnlag må bindes til IUP2027. Den separate v3-filen eller en tom etikett avgjør ikke dette. Beregning/sammenligning som krever udefinert måling; kjente carry/side-råmålinger kan bevares. |
| K06 | IUP-S15 | Originalens fysiske scoreformler og normgrunnlag må holdes atskilt fra vedtatt femtesters seksårsløp og stallrelativ FYS-score. Kun kildeparitet/automatisk konvertering av gammel score. |
| K07 | IUP-S17, IUP-S18 | Eksakt IUP2027-referansetabell, enhet, nedre grense og eventuell interpolering må valideres. v3-oppslagsparitet har SHA f9f8dd… og er ikke bevis for IUP2027 med SHA6786d70…. IUP2027-referanseparitet; eksisterende versjonsmerket v3 kan fortsatt brukes. |
| K08 | IUP-S08-C-E2, IUP-S08-C-E3 | Excel WEEKNUM bruker standard søndagsuke; appens ISO-ukeår bestemmes av torsdag. Dette er dokumentert kildemotstrid, ikke grunn til å gjeninnføre feil ukeår. Behold eksplisitte datoer og ISO-identitet i appen. Ingen selvstendig bygging; blokkerer påstand om identisk Excel-ukenummer. |
| K09 | IUP-S13, IUP-S16 | IUP2027 har24 teknikktestdiagrammer og1 dagbokdiagram. Separat testprotokoll-v3 har21 teknikktestdiagrammer. Diagramtall/seriegrunnlag kan ikke brukes om hverandre. Diagramparitet for berørte objekter; alle25 objekt-ID-er er registrert. |
| K10 | IUP-S08 | WAGR Power, WAGR-ranking og DataGolf-feltstyrke er forskjellige mål med hver sin autoriserte datakilde; ingen utledning fra turneringsnavn eller brutto score alene. Automatiske Power-/rankingverdier; manuell tydelig føring og turneringsplan kan bygges. |
| K11 | IUP-S05-C-A7, IUP-S05-C-A13 | Den øvrige turneringsscorestatistikken og SG-totalraden må få eksakt måledefinisjon før de knyttes til en automatisk metrikk. Funksjonsfamilie og kilde-ID er registrert; en uklar etikett skal ikke gjettes til worst-score eller SG-innspill. Bare automatisk beregning for disse to radene; manuelle kildebevarte mål kan lagres. |

Utviklingssjekkens 2027-uttrekk er 34/43/47/38 på 1–5. Tidligere 2025 er 34/41/41/38. Sesongevalueringen er 3 fritekst + 10 på 1–4. Disse kontraktene finnes i kildekatalogene og er holdt atskilt; gamle 1–8-etiketter er ikke en konverteringsregel.

## Kontroller og gjenstående bevis

- SHA og alle 175 spørsmåls-ID-er/cellehenvisninger avstemt mot privatregister og appens to kilderegistre. Ingen utfylte spørsmålsverdier lest inn i artefaktene.
- Alle 18 ark, 1692 formelceller, 25 diagrammer, 1 pivot og 3 tabeller har individuelle manifestposter. Alle native celle-ID-er er unike; formel-/spørsmålsceller er del av dette manifestet.
- Kodehenvisningene har konkret fil, linje, symbol og filhash. Alle oppførte testfiler finnes. Ingen testfil er automatisk en grønn kjøreprotokoll.
- Ingen fullgate, testdatabase, serverstart, import eller produksjonsendring kjørt i auditen. Ingen kildeformler, verdier, diagram-/pivotcache, helse-/kontaktopplysninger eller bilder kopiert til Git.
- Per-felt rolle for innhold/layout, alle inputkontrakter, native tekst-/bildeinnhold, IUP2027-beregningsparitet, alle 25 objektvisninger og full spiller/WANG/TN-reise er fortsatt egne beviskrav. R01-registeret kan brukes til tildeling; Excel kan ikke avvikles ut fra denne auditen alene.
- Samtidig kodearbeid kan endre status. Kodebevisene gjelder den kontrollerte filhashen, ikke en senere usett revisjon. Basens generiske tester må suppleres av felt-/versjons-/tilgangs- og gjenåpningsprøver for de nye pakkene.

## Anbefalt tildeling

Tilgangseier tar R08-G01 først. Egen målmatriseeier tar R05-G01–G03 med kildebevarte manuelle rader og eksplisitt rapportvindu. Teknisk planeier tar R08-G02/G03 additivt uten å omskrive logger. Testagenten tar R08-G04; SG-agenten eier SG-grunnlaget. R08-G05 kan løses som historisk lesing uten å endre vedtatt teststandard. Kun den konkrete automatiske raden som mangler regel, skal stå sperret.

Foreslått AGENTS.md-regel: Et representativt Excel-eksempel eller en grønn generell test er ikke dekningsbevis for resten. Registrer alle kildeceller/objekter eksplisitt, bind målemetode og versjon, og skill strukturell kartlegging fra faktisk funksjonsparitet.
