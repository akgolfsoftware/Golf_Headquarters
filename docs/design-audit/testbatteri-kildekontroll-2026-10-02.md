# Testbatteriet — kildekontroll og faktisk dekning

Kontrollert 02.10.2026 av Codex. Kodegrunnlag: main `25bc3302e4a57cd55eed07dae191d553e5d7a3aa`. Planen ligger i [testbatteri, felles testdag og livescoring](../planer/testbatteri-felles-testdag-og-livescoring-2026-10-02.md).

Dette er en kilde-, kode-, beregnings- og prototypekontroll. Ingen reelle spillerdata er hentet inn som testgrunnlag. Ingen endring i app, database eller Claude Design er gjort. Ingen fullført testdag med flere klienter er kjørt i denne kontrollen.

**Oppfølging etter mottatte vedlegg:** Anders leverte identisk v3-Excel og en 21-siders testbeskrivelse og presiserte PEI 0,032 → 3,2 %. [Gjennomgangen av testlogikken](testbatteri-testlogikk-fra-vedlegg-2026-10-02.md) dokumenterer også nye funn: feilkategorier i jentenes banetest, median telt med i et gjennomsnitt, fem fremfor ti måleforsøk i tredje teknikkpanel og fullscore i tomme maler. Vedleggene er grunnlaget nå; IUP 2027 omtalt nedenfor er en separat sammenligningskilde og erstatter dem ikke automatisk.

## Kilder og versjoner

| Kilde | Bekreftet versjon og anvendelse |
|---|---|
| [NGF Skjemaer](https://www.golfforbundet.no/spiller/toppidrett/skjemaer) | Siden lenket ved kontrollen til v3-scorekortet nedenfor. «Siste» betyr siste tilgjengelige lenke og kontrollerte Drive-kopier, ikke garanti om upublisert materiale |
| [Team Norway treningsprotokoll og tester spiller v3](https://www.golfforbundet.no/files/documents/team-norway-treningsprotokoll-og-tester-for-spillerv3.xlsx) | Lastet ned på kontrolldatoen; 1 650 754 byte. Identisk kontrollsum med de to lokale v3-kopiene |
| [Scorekort i Drive](https://docs.google.com/spreadsheets/d/1MoUYHDDQTQv8aeHYSJl7YRYXt-XhwkFG/edit) | Nyeste funne scorekortkopi i Drive-søket, endret 28.08.2026. Metadata kontrollert; det er den nedlastede NGF-filen som er fullstendig sammenlignet mot appens data |
| [Testbeskrivelse 2026](https://www.golfforbundet.no/files/documents/team-norway-beskrivelse-av-tester-2026.pdf) | Brukt til å avklare oppsett, antall forsøk og betydningen av felter; kildeavvik beholdes eksplisitt |
| [Team Norway IUP 2027](https://docs.google.com/spreadsheets/d/1rdC3bySjG-KAFyWgw0OzxDnNN9GwTQJC/edit) | Drive endret 29.09.2026; lokal fil 924 022 byte. Nyere teknisk test og testoversikt; ikke automatisk erstatning for hele v3-scorekortet |
| [WANG Golf 6-års løp](https://docs.google.com/spreadsheets/d/1AEdCmaxIA32f__W_rw_fVE0QO7VqoKbF/edit) | Nyere funnet Drive-kopi 28.09.2026. Lokal fil 290 710 byte; fem fys-tester står i C47/C61 i hovedarket |
| Eldre Team Norway Tester Treningsprotokoll Spiller.xlsx | Lokal fil 1 648 841 byte, Drive-kopi fra 27.05.2025. Har avvikende formelfordeling; skal ikke blandes med v3 fordi navnene ligner |
| [Beslutningsgrunnlag 28.09](../beslutningsgrunnlag/grillingen-runde9-wang-tn-2026-09-28.md) og [beslutninger](../../.claude/rules/beslutninger.md) | Styrer allerede avklart manuell poengsum, Wedge Gate-treff, fem fys-tester, nivåsystem og WANG/TN-deling |

SHA-256, v3: `f9f8ddfeb411b7e2dc84e1935588e7ed950266dda53046e733cbc2d516d03664`.

SHA-256, eldre scorekort: `86a758f922013a7d684777ad850958a0ff01f2c4a02316c1eeffc6a63e7fdbe0`.

SHA-256, IUP 2027: `6786d70f166dc4d5602f792a165eef8372743597ac44904a9fa0a3dd2892f222`.

Nedlastet kontrollkopi er privat i `~/Documents/Claude/akgolf-hq/testbatteri-kontroll-2026-10-02/`. Regnearkene er lest med openpyxl 3.1.5, både formler og lagrede resultatverdier. Excel er ikke startet for full rekalkulering. Lagrede formelfeil i tomme malfelt er derfor ikke uten videre appfeil eller ødelagte formler.

## Alle 16 faner i v3

| Fane | Formelceller | Lagrede feilverdier | Dekning og videre behandling |
|---|---:|---:|---|
| Forklaring | 0 | 0 | Instruksjoner; nødvendig protokollkontekst |
| Links | 0 | 0 | Kildelenker og hjelp |
| Scorekort GolfslagTester | 881 | 90 | Golfslag/putting; katalogkart nedenfor |
| Scorekort TeknikTester | 13 | 4 | Gate, VISA og Putt Speed; flere ufullstendige beregninger |
| PEI Test Bane | 19 | 19 | Egne målavstander; variable antall forsøk må støttes i testdag |
| PEI Tester | 406 | 10 | Flere standard- og egenvalgte avstandsserier |
| SG Tee App Predict | 186 | 0 | Analyse-/prediksjonsverktøy; ikke dokumentert full appdekning |
| Avgjørelse | 156 | 0 | Beslutnings-/analyseverktøy; ikke dokumentert full appdekning |
| Teknikktest | 146 | 96 | Eldre tre-panelmodell; må skilles fra 2027-protokollen |
| Planer for treningsøkter | 0 | 0 | Planleggingsinnhold, ikke egen testberegning |
| TeeGate | 84 | 0 | Støtteverktøy for oppsett; appdekning må kartlegges eksplisitt |
| Treningsplanleggning | 0 | 0 | Planleggingsinnhold; kobles til gjeldende planmodell |
| Spillerobservation | 0 | 0 | Observasjonsskjema; ikke likt et numerisk testresultat |
| Referens | 40 | 0 | Referanse- og poengtabeller |
| Avstånd&Pei Shortgame | 0 | 0 | Støttedata for avstand/PEI |
| Startfelt | 103 | 0 | Oppsett-/startfeltverktøy; ikke bevis på appens flerskoletestdag |
| **Sum** | **2034** | **219** | Formelantall og feilstatus, ikke 2034 individuelt verifiserte beregninger |

Appens faste målavstander er direkte sammenlignet med kilden: **25 serier / 332 celler, alle like**. Referanser er direkte sammenlignet mot regnearkets lagrede tall med toleranse 10⁻¹²: **650 rader, alle like** — 15 grove puttreferanser, 79 fine puttreferanser, 546 fairwayreferanser, fem 8-ball-poengtrinn og fem ni-hulls-poengtrinn. Dette beviser importerte data, ikke automatisk at alle formler rundt dem brukes riktig.

## Katalogens 38 varianter

Kilde: [tn-catalog.ts](../../src/lib/portal-tester/tn-catalog.ts), `tn-excel-v3-2026-09-10`. «Åpen» betyr ikke sperret i katalogen; ikke fullstendig kvalitetssikret brukerreise. «Sperret» betyr at fullføring avvises. Alle 38 er kartlagt nedenfor; 27 åpne og 11 sperret.

| Variant | Forsøk | Status | Ark og område |
|---|---:|---|---|
| 8-ball variation (`8-ball-variation`) | 24 | Åpen | Scorekort GolfslagTester!A4:I35 |
| 8-ball blocked (`8-ball-blocked`) | 24 | Åpen | Scorekort GolfslagTester!K4:S35 |
| Golfslag bane · gutter (`golfslag-bane-gutter`) | 30 | Åpen | Scorekort GolfslagTester!U4:AG78 |
| Golfslag bane · jenter (`golfslag-bane-jenter`) | 30 | Åpen | Scorekort GolfslagTester!U4:AG78 |
| 18 hull · gutter (`18-hull-gutter`) | 18 | Åpen | Scorekort GolfslagTester!BO4:CA53 |
| 18 hull · jenter (`18-hull-jenter`) | 18 | Åpen | Scorekort GolfslagTester!BO4:CA53 |
| Golfslag bane · egne lengder (`golfslag-bane-egen`) | 30 | Åpen | Scorekort GolfslagTester!U86:AG121 |
| Driver basic · 270 m (`driver-270`) | 5 | Åpen | Scorekort GolfslagTester!AI4:AR10 |
| Driver basic · 220 m (`driver-220`) | 5 | Åpen | Scorekort GolfslagTester!AI15:AR21 |
| Innspill Basis · gutter 145 m (`inspill-gutter-145`) | 5 | Åpen | Scorekort GolfslagTester!AT4:BC10 |
| Innspill Basis · gutter 160 m (`inspill-gutter-160`) | 5 | Åpen | Scorekort GolfslagTester!AT15:BC21 |
| Innspill Basis · jenter 125 m (`inspill-jenter-125`) | 5 | Åpen | Scorekort GolfslagTester!AT26:BC32 |
| Innspill Basis · jenter 145 m (`inspill-jenter-145`) | 5 | Åpen | Scorekort GolfslagTester!AT37:BC43 |
| Wedge Variation (`wedge-variation`) | 9 | Åpen | Scorekort GolfslagTester!BE4:BM14 |
| Putt 1–3 m (`putt-1-3m`) | 25 | Åpen | Scorekort GolfslagTester!CC4:CI36 |
| 9 hull lengde (`9-hull-lengde`) | 9 | Sperret | Scorekort GolfslagTester!CL4:CR15; Referens!E11:G15 |
| Nærspill Gate (`naerspill-gate`) | 9 | Sperret | Scorekort TeknikTester!A4:F16 |
| VISA Express (`visa-express`) | 9 | Sperret | Scorekort TeknikTester!H4:L16 |
| Wedge Gate (`wedge-gate`) | 9 | Sperret | Scorekort TeknikTester!A26:F38 |
| Driver Gate (`driver-gate`) | 6 | Sperret | Scorekort TeknikTester!H26:L35 |
| Putt Gate (`putt-gate`) | 10 | Sperret | Scorekort TeknikTester!N26:S40 |
| Putt Speed 1 × 5 (`putt-speed-1x5`) | 5 | Sperret | Scorekort TeknikTester!N4:S12 |
| Putt Speed 3 × 3 (`putt-speed-3x3`) | 9 | Sperret | Scorekort TeknikTester!U4:Z16 |
| PEI Test Bane (`pei-test-bane`) | 18 | Åpen | PEI Test Bane!A3:F22; Forklaring!B4 |
| Slagtest · egne lengder (`pei-slagtest-egen`) | 18 | Åpen | PEI Tester!A9:G29 |
| Wedgetest · egne lengder (`pei-wedgetest-egen`) | 18 | Åpen | PEI Tester!I9:O29 |
| ST Leon ROT (`pei-st-leon`) | 18 | Åpen | PEI Tester!Q9:W29 |
| ST Cloud GC (`pei-st-cloud`) | 18 | Åpen | PEI Tester!Y9:AE29 |
| PGA Tour · 27 slag (`pei-pga27`) | 27 | Åpen | PEI Tester!AG10:AG36 |
| Innspill 120 m (`pei-inspill-120`) | 5 | Åpen | PEI Tester!A45:A50 |
| Innspill 160 m (`pei-inspill-160`) | 5 | Åpen | PEI Tester!A51:A56 |
| Innspill Variation (`pei-inspill-variation`) | 10 | Åpen | PEI Tester!A57:A67 |
| Wedge 3 Blocked (`pei-wedge-blocked`) | 9 | Åpen | PEI Tester!I35:I44 |
| Wedge 3 Variation (`pei-wedge-variation`) | 9 | Åpen | PEI Tester!I45:I54 |
| Standard sving · 7-jern (`standard-sving`) | 10 | Åpen | PEI Tester!A34:A44 |
| Teknikktest · panel A (`teknikktest-a`) | 15 | Sperret | Teknikktest!B1:N20 |
| Teknikktest · panel B (`teknikktest-b`) | 15 | Sperret | Teknikktest!R1:AD20 |
| Teknikktest · panel C (`teknikktest-c`) | 15 | Sperret | Teknikktest!AG1:AS20 |

`PEI Test Bane` har standard 18, men tillater variabelt antall 1–200 i spillerprotokollen. Testdagens oppretting avviser foreløpig variable protokoller. «Teknikktest panel A/B/C» er gammel katalogmodell og er ikke dokumentasjon på dekning av Driver/J7/Wedge i IUP 2027.

## Konkrete funn i kildene

### Formler og avvik som må håndteres

- `Scorekort TeknikTester!L33` bruker `COUNT(L27:L32)`. Hvis alle seks celler fylles med numerisk 0/1, blir resultatet seks uansett antall treff. Tell godkjente forsøk i henhold til protokollen.
- Putt Gate-resultatet `R40` peker bare på `R37`, som er tom. Dette er ikke en komplett opptelling.
- Putt Speed har gjennomsnittsformler. Kildeteksten definerer restavstand til mållinjen; katalogens spørsmål om rullelengde/restavstand er derfor delvis utdatert. Måleenheten må fortsatt fastsettes.
- Ni-hullsputting har målverdiene 5, 7, 11, 9, 6, 10, 8, 7, 9 uten eksplisitt målenhet i målkolonnen. Restavstanden er oppgitt i fot.
- `Referens!E11:G15` har nedergrenser 0, 0,1, 1,1, 2,1 og 4,01 og poeng 6, 3, 1, 0,5 og 0. Omtrentlige oppslag har en annen grenseoppførsel enn vedtakets «inntil 1/2/4 fot». Prøv særlig 0,1, 1,05, 2,05 og 4,005. Det er også et avvik mot vedtaksteksten «0–0,1 fot = senket». Vedtaket styrer appens regel; dokumenter forskjellen fra Excel og ikke skjul den med avrunding eller be om samme beslutning igjen.
- Den eldre scorekortfilen og v3 har forskjellige formelceller: GolfslagTester har tre bare i v3 og 40 bare i eldre; TeknikTester har ni bare i v3 og seks bare i eldre. Filnavn alene er ikke versjonskontroll.

Testbeskrivelsen bekrefter 24 slag i 8-ball. Driver Gate har seks forsøk. Putt Gate har ti, og godkjenning krever både passering gjennom porten og riktig lengdesone. Putt Speed 3 × 3 bruker tre målavstander. PDF-en har interne avvik i Wedge Gate-avstander og et ni-hullsskjema med for mange rader. Derfor må kildevalg dokumenteres per protokoll; vedtaket om Wedge Gate-treff gjelder. [NGFs testbeskrivelse](https://www.golfforbundet.no/files/documents/team-norway-beskrivelse-av-tester-2026.pdf).

### IUP 2027 og fysisk testbatteri

`TN Tester Tot` i IUP 2027 lister åtte golfslagtester og ti tekniske tester. Den tekniske måleflaten bruker Driver, J7 og Wedge, med Swing Direction, Club Path, Attack Angle, Face to Path, Spin Loft, Smash Factor og Club Speed. Dette avviker fra den gamle modellens blant annet Face Angle, Dynamic Loft og Impact Location.

Grunnmålingene bruker ikke én universell formel: Driver D3 viser gjennomsnitt av C3:C8, J7 U3 median av T3:T7, Wedge AK3 gjennomsnitt av AJ3:AJ7. Antall oppgaveforsøk varierer også. Dette må kontrolleres og versjoneres før implementering; ikke kopier panel A/B/C eller anta 15 forsøk på alle køller.

IUP 2027 har også eldre fystester og en samlet formel `B3+B4+(B5/2)+(B6/6)+B7`. Dette er ikke grunnlag for å overstyre de fem nye vedtatte testene. Kontroll av [seed-test-definitions.ts](../../scripts/seed-test-definitions.ts) ved gjennomføringsstart viste et konkret avvik: de fem definisjonene er benkpress, trapbar, lengdehopp, rotasjonskast og **3000 meter**, mens vedtaket krever **Club Speed** som den femte. Den gamle løpstesten må beholdes historisk, men skal ikke erstatte Club Speed i det nye batteriet. Belastning, gyldige forsøk og aggregering må fortsatt kildeavklares.

Rotasjonskast har forskjellige ballvekter i kilde/kode/design. WANG-prototypen viser 4 kg, TN 3 kg. Lengdehopp vises i meter respektive centimeter. Normaliser enheter uten å sammenligne ulike belastningsprotokoller. AK A–K og eventuelle TN-nivåer skal være separate fra målt testresultat; ikke fyll manglende normer med oppdiktede tall.

## Funn i koden

| Funn | Kilde | Betydning |
|---|---|---|
| Bare putt- og avstandsgrener i beregningsmotoren | [tn-scoring.ts](../../src/lib/portal-tester/tn-scoring.ts) | Ikke fjern sperrene alene. Gate, poeng, lengdeputt, speed og teknikk trenger egne regler; funksjonen forsøker dessuten å hente målavstand før grenvalget |
| Testområde alltid SLAG; sammenligningsretning spesialbehandler bare 8-ball | [tn-integration.ts](../../src/lib/portal-tester/tn-integration.ts) | Teknikk havner feil; nye treff-/poengtester kan få feil «bedre»-retning |
| Resultatskjema krever eksakt nåværende TN-versjon | [tn-scoring.ts](../../src/lib/portal-tester/tn-scoring.ts) og [tn-session.ts](../../src/lib/portal-tester/tn-session.ts) | Versjonsløft trenger bakoverkompatibel lesing av historikk/utkast |
| Eierskap, revisjon, samlet fullføring og vern mot dobbel fullføring finnes | [spillerhandlinger](../../src/app/portal/tren/tester/team-norway/actions.ts) | Godt grunnlag, men testene bruker simulert database |
| Spiller avvises fra testdagkoblet økt | Samme spillerhandlinger | Den bestilte spillerføringen i felles testdag virker ikke i denne modellen |
| Utkast lagres via eksplisitt handling, ikke automatisk per forsøk | [scorecard.tsx](../../src/app/portal/tren/tester/team-norway/scorecard.tsx) | Nett-/fanetap før lagring kan miste føring. Ingen forsøksbilder i denne flyten |
| Trener har rolle-/gruppetilgang, revisjon og transaksjon med ny prøve ved konflikt | [tn-testforing-actions.ts](../../src/app/team-norway/tn-testforing-actions.ts) | Bevar disse egenskapene når arrangementet utvides |
| Én gruppe og én test per testdag | [datamodellen](../../prisma/schema.prisma) og [tn-testdag-actions.ts](../../src/app/team-norway/tn-testdag-actions.ts) | Ikke flere skoler og stasjoner i ett arrangement; TN-gruppen er særskilt avgrenset |
| Oppretting setter ACTIVE, også med fremtidig tidspunkt | Samme testdaghandlinger | Planlagt→åpen→avsluttet må bli en reell livssyklus |
| Oppfriskning etter egne handlinger, ingen automatisk fjernoppdatering i undersøkt flyt | [tn-testdag-ko.tsx](../../src/components/team-norway/tn-testdag-ko.tsx) | Dagens kø er ikke dokumentert livescoring mellom brukere |
| Ingen bildekobling på TestShot; TN-resultat ligger i JSON | [datamodellen](../../prisma/schema.prisma) og spillerhandlingene | Planlegg stabil forsøksidentitet før filkobling |
| Samtykke finnes, men direkte trenerlesing bruker egne medlemskontroller | [samtykkeregler](../../src/lib/deling/samtykke-regler.ts), [TN-arbeidsflate](../../src/lib/domain/tn-arbeidsflate.ts), [WANG-tilgang](../../src/app/team-wang/_data/wang-tilgang.ts) | Test samme avgrensning i alle lesere; deltakelse på testdag skal ikke åpne hele profilen |
| Fysaggregat henter hele stallen og vektdata uten gruppeskille lokalt i funksjonen | [fys-data.ts](../../src/lib/fys-data.ts), [fys-score.ts](../../src/lib/domain/fys-score.ts) | Kontroller kallernes tilgang og gruppescope; ikke fremstill relativ stallscore som NGF-norm eller spre uautoriserte underlagsdata |

### Reproduserte visningsfeil

WANGs [IUP-side](../../src/app/team-wang/coach/iup/[elevId]/page.tsx) kombinerer testens protokollstubbe med den generiske formateringen. Med `tnDefinitionData(driver-270).protocol` ga `parseForScoring` fallback uten enhet. Score 0,05 ble derfor vist som «0,05», ikke «5 %». TNs egen prosentformatterer håndterer verdien riktig.

[format-verdi.ts](../../src/lib/portal-tester/format-verdi.ts) runder poengsummer til null desimaler. Syntetisk 12,5 poeng ble «13 p». Det eksisterer også en eldre prosentregel som gjetter skala ut fra om verdien er ≤1,5. Nye resultater må ha eksplisitt enhet og skala.

## Claude Design: undersøkt innhold og avvik

Prosjektene Precision Athletics `7d7c2994`, WANG `6cfa623c` og TN `bc3e41fc` ble åpnet og navigert i nettleseren. Ingen meldinger eller redigeringer sendt til Claude Design.

| Flate | Observert | Vurdering |
|---|---|---|
| PH-15-TN 8-ball, mobil 390 | Åtte slag, maks 32, ingen tydelig blocked/variation eller mål per forsøk | Feil protokollomfang; må være 24/maks 96 |
| PH-15-TN presisjon | Eksempelverdi 0,05 vises avrundet til 0,1, men poeng følger mer presis verdi | Spilleren kan oppleve poeng som feil; samsvar mellom inndata, visning og grense må løses |
| PH-15-TN ni-hullsputting, desktop 1280 | Ni slag, maks 54, senket-valg og halve poeng; smal mobilkolonne | Godt deler av poenggrunnlag; målopplysning og desktopoversikt mangler |
| PH-15 ordinær | Generisk innspillkort med ti slag og treffgrense | Kan ikke brukes som universell protokoll for katalogen |
| PH-15-TN generell | Ingen synlig forsøksbilde, lagringsstatus eller testdag-/delingskobling i undersøkt kort | Mangler for den bestilte reisen |
| TN fellestesting | Flere avstandstester, blant annet Driver Basic, fremstilles som poeng; også generiske teknikk-/speedverdier | Visningsmodellen må kobles til faktisk protokoll/enhet |
| TN Wedge Gate/fys | Wedge Gate 7/9 treff; fem nye fysnavn; enkelte gamle tekster lever videre | Behold korrekt treffmodell, fjern inkonsekvent eldre innhold |
| WANG-08 Testdag | Øvelse-/spillervisning, kø, talltastatur, lagringsstatus og simulert uten-nett-tilstand | Godt utgangspunkt for arbeidsflyt; ingen bekreftet database-/livesynk eller flerskolearrangement |
| WANG fys | Fem nye tester; rotasjonskast 4 kg og lengdehopp i meter | Avklar mot TN-visning og gjeldende protokoll |

PH-15-TN ble visuelt inspisert ved 390 og 1280 i lyst tema. WANG/TN-flytene ble undersøkt gjennom nettleserens tekst og kontroller. Dette er ikke full visuell godkjenning av alle skjermer, temaer eller feiltilstander. Lokal eksport fra 01.10.2026 støtter 8-ball-funnet: `_shared/tn-scoring.js` angir `n:8,max:32`.

## Kjørte kontroller

| Kontroll | Resultat | Grense for beviset |
|---|---|---|
| Portaltester, PEI-domene, generisk testberegning, trenerføring, samtykke og TN-arbeidsflate | 164 bestått, 0 feil, 0 hoppet over | Enhets-/handlingstester, blant annet med simulert database |
| TN-testdetaljkomponent | 5 bestått, 0 feil | Komponentnivå |
| Ekstra syntetisk hovedresultat, alle åpne protokoller | 27/27 bestått | Enkel uavhengig kontroll av hovedformel; ikke alle sekundærverdier eller hele brukerreisen |
| Målavstander og tabellreferanser | 332 celler + 650 rader stemmer | Sammenligning med kildefilen, ikke full Excel-rekalkulering |
| Prosent-/poengvisning | To feil reprodusert | Rene funksjonskall, ikke innlogget nettleserbevis |
| Prosjektstruktur og dokumentlenker | Se sluttnotat nedenfor | Dokumentkontroll |

Kjørte kommandoer fra prosjektroten:

```sh
node_modules/.bin/tsx --conditions=react-server --experimental-test-module-mocks --test \
  'src/lib/portal-tester/*.test.ts' 'src/lib/domain/pei/*.test.ts' \
  src/lib/__tests__/test-scoring.test.ts \
  src/app/team-norway/tn-testforing-actions.test.ts \
  src/lib/deling/samtykke-regler.test.ts \
  src/lib/domain/tn-arbeidsflate.test.ts

node_modules/.bin/tsx --experimental-test-module-mocks --test \
  tests/komponenter/tn-testdetalj.test.ts
```

Første forsøk blandet komponenttesten med `react-server`-betingelsen og feilet på testoppsettet. Komponenttesten ble deretter kjørt separat med riktig oppsett; sluttallene over gjelder rene kjøringer. Midlertidige logger: `/tmp/testbatteri-audit-tests-clean-2026-10-02.log` og `/tmp/testbatteri-komponent-2026-10-02.log`.

Ikke kjørt: komplett `npm run verify`, hele prosjektets `npm test`, virkelig databaserundtur for testbatteriet, nettleserreise med flere skoler, mobilkamera, tilbakekalling under aktiv sanntidsforbindelse, lasttest eller produksjonsskriving. Eksisterende `tests/p0/tn-fullfor-testdag-reise.spec.ts` beskriver en eldre trenerreise; den dekker ikke den nye bestillingen og ble ikke kjørt her.

## Eksisterende arbeid som må samordnes

Dette er åpne PR-er kontrollert som bakgrunn, ikke gjennomført eller godkjent i denne økten:

| PR | Kontrollert hode | Relevans / begrensning |
|---|---|---|
| [#1043 PH-14](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1043) | `9ad875208645bda9b5ef61bd99411749abf7fb90` | Testoversikt; gjennomgang av brukerreise gjenstår |
| [#1054 PH-15](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1054) | `f7bc6262451e6b3ed96a00ffe1ce86270092900e` | Gjennomføringsskjerm; erstatter ikke manglende katalog-/beregningsgrener |
| [#1023 AG-15](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1023) | `1bcaac964c0a741b18e95b83d5840d513ccb8b4a` | Normer og tildeling; samme protokollidentitet må brukes |
| [#1004 WANG/TN](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1004) | `5693da104a04075ce7f5adfbbc7ac03a8ad1435d` | Undersøkt testdagdiff utvider TN-demogruppevalg, ikke flere skoler/stasjoner |
| [#1060 felles kjerne](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1060) | Avhengighet til #1004 kontrollert | Samordne profil-/IUP-lesing; ikke anta at all deling er løst |
| [#1056 live runde](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1056) | `a3cb9cd391a6003a99411f054c71ce2d158c3ddf` | Gjelder golf-runde, ikke automatisk testdagens spillerføring/livescoring |

Ingen av disse PR-ene skal telles som levert før de er kontrollert mot en samlet sluttversjon og akseptprøvene i planen.

## Sluttnotat for dokumentkontroll

`npm run prosjekt:sjekk` bestod: prosjektstruktur og vedlikeholdte dokumentlenker. Egne lenker i disse to daterte dokumentene er i tillegg kontrollert separat, siden den generelle kontrollen unntar daterte underlag. Rapporten skiller mellom kildeverifisert, kodeobservert, reprodusert og ikke prøvd i faktisk brukerreise.
