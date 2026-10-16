# Testbatteriet — testlogikk fra Anders' vedlegg

Dato: 02.10.2026. Oppfølging av [kontrollrapporten](testbatteri-kildekontroll-2026-10-02.md) og [gjennomføringsplanen](../planer/testbatteri-felles-testdag-og-livescoring-2026-10-02.md).

## Kildegrunnlag og avgrensning

Anders har levert `team-norway-treningsprotokoll-og-tester-for-spillerv3.xlsx` og `team-norway-beskrivelse-av-tester-2026.pdf` som grunnlag for testbatteriet. Excel-filen er byte for byte identisk med NGF-filen i første kontroll. Tidligere kontroller av 332 målavstander og 650 referanserader gjelder derfor også dette vedlegget.

PDF-en har 21 sider, med 16 navngitte testbeskrivelser. Alle sidene er lest, og de gjengitte sidene er visuelt inspisert. Side 21 er en ufullført mal, ikke en ekstra test. Excel har 16 faner og flere varianter/støtteverktøy enn PDF-en. De 38 variantene som finnes i appkatalogen, er listet i første kontrollrapport.

Kontrollsummer SHA-256:

- Excel: `f9f8ddfeb411b7e2dc84e1935588e7ed950266dda53046e733cbc2d516d03664`.
- PDF: `60aec6026fccf6606cf6e802f1aa348244585c829c3335fff2eafb24ad15d851`.

Disse vedleggene er nå det konkrete grunnlaget for denne gjennomgangen. IUP 2027 beholdes som sammenligningskilde fra forrige runde, men erstatter ikke automatisk den tekniske testen i det leverte v3-arket. Fem fysiske tester er en separat tidligere vedtatt del av den samlede leveransen; de er ikke beskrevet i disse to vedleggene.

Ingen kildefiler, appkode eller design er endret. Kontrollen fastsetter hva som skal registreres, beregnes, vises og prøves før scorekortene videreutvikles.

## PEI-regelen gjelder overalt

**Anders' presisering: PEI vises alltid i prosent. En brøk på 0,032 skal vises som 3,2 %, aldri 0,032 %.**

PEI er restavstand delt på målavstand, med begge avstander i samme enhet. For eksempel: 3,2 meter fra et mål på 100 meter gir 0,032 som lagret brøk og 3,2 % på skjermen. Ved måling av carry, altså ballens lengde gjennom luften, og sideavvik beregnes restavstand slik:

`restavstand = √((målavstand − carry)² + sideavvik²)`

`PEI per slag = restavstand / målavstand`

`samlet PEI = gjennomsnitt av PEI for de gyldige, registrerte slagene`

Lavere PEI er bedre. Sideavvik kan ha fortegn for venstre/høyre; selve PEI er ikke negativ. Et resultat over 100 % er matematisk mulig og må ikke utløse en annen skala.

| Rå brøk | Riktig prosentvisning | Hva prøven beskytter mot |
|---:|---:|---|
| 0 | 0 % | Null er gyldig registrert måling, men ikke et tomt felt |
| 0,032 | 3,2 % | Manglende multiplikasjon eller prosenttegn rett på brøken |
| 0,05 | 5 % | Samme regel på alle flater |
| 1 | 100 % | Ingen automatisk omtolking til prosentpoeng |
| 1,6 | 160 % | Ingen gjetting ut fra størrelsen på tallet |

Med en prosentformatterer skal brøken 0,032 sendes inn direkte. Ved vanlig tallformatering må tallet først ganges med 100. Gjør konverteringen nøyaktig én gang. Menneskelesbar eksport følger samme regel; maskineksport må merke enheten/skalaen eksplisitt. I Excel-eksport lagres brøken med prosentformat.

Bevar presisjon i lagrede verdier. Som visningsregel foreslås inntil to desimaler uten unødvendige nuller, slik at 3,2 % og 3,25 % begge kan vises. Ikke avrund inndata før poengoppslag eller beregning. Fra 5 % til 3,2 % er forbedringen 1,8 prosentpoeng; en eventuell relativ forbedring må navngis separat.

Viktig: gjennomsnitt av PEI er ikke det samme som samlet restavstand delt på samlet målavstand. Restavstand 1 meter fra henholdsvis 10 og 100 meter gir `(10 % + 1 %) / 2 = 5,5 %`, ikke 1,82 %.

**Kontroll mot app:** `tnFormat` bestod alle fem skalatilfellene over. Den generiske `formaterTestVerdi` viser derimot rå brøk 1,6 som 1,60 %, fordi den gjetter at store verdier allerede er prosent. Dette må erstattes med kjent kildeversjon/skala. Den tidligere påviste WANG-feilen skyldes også manglende entydig enhet i hele lesekjeden.

## Alle de 16 testbeskrivelsene

Forkortelser i tabellen: PEI er presisjonsforholdet ovenfor. «Sluttposisjon» er hvor ballen stopper, mens carry er landingspunktet etter ballflukten. Disse målingene skal ikke blandes.

| Test og PDF-side | Gjennomføring og registrering | Resultatlogikk og konsekvens for scorekort |
|---|---|---|
| **8-ball variation**, s. 4 | Åtte oppgaver: chip 10/30 m, wedge 20/40 m, lobb 15/25 m, bunker 10/20 m. Ett slag på hver, tre runder = 24. Startnummer kan velges, men rekkefølgen beholdes. Registrer faktisk restavstand i meter med centimeterpresisjon | PEI per slag, totalt og per slagtype. Excel gir også poeng og forventede putter. Poengskala 4/3/2/1/0 med grenser 0,1/1/2/3 m; maks 96. Alle disse målene holdes atskilt |
| **8-ball blocked**, s. 5 | De samme åtte oppgavene, tre slag etter hverandre per oppgave = 24. Scorekortets radrekkefølge styrer | Samme beregning som variation, men egen variant. Ikke slå sammen variantene i historikk uten merking. Formuleringen «tre runder» skal ikke gi 72 slag |
| **Golfslag på banen**, s. 6 | 30 slag over et tilrettelagt ni-hullsoppsett. Variant for gutter/jenter. Registrer hullnummer, målavstand, restavstand og hvor ballen ender. Bevar slagtype og start fra bunker der protokollen angir det | Total PEI og delresultater for innspill, wedge og bunker. Excel beregner også referansebaserte slag/putter. Jentenes kategoriformler er feil, se avvik nedenfor |
| **18 hulls innspill**, s. 7 | 18 slag i angitt rekkefølge og variant. Registrer faktisk resultat og sluttplassering | Gjennomsnittlig PEI er uttrykkelig målet. Referanseverdier i arket er sekundære; ingen generell «poengscore» skal erstatte PEI |
| **Innspill Basic**, s. 8 | Fem slag fra hver av to baselengder. Gutter 145/160 m, jenter 125/145 m. Utendørs. Carry og sideavvik; eventuell hastighet med måletype/enhet | Geometrisk restavstand og PEI. Appen har fire separate fem-slagsvarianter; full instruksjon omfatter begge relevante distanser. Vis dem som to delserier under samme gjennomføring, med egne resultater. Ikke konstruer en ny samlet offisiell score uten kilde |
| **Driver Basic**, s. 9 | Fem slag med ekte baller og egnet måler. Mål 270/220 m etter variant. Carry og sideavvik; eventuell hastighet | Geometrisk PEI. Arket har også «Retning Total»: gjennomsnittlig sideavvik delt på median carry. Dette er retningsbias i prosent, ikke total PEI og ikke målt antall fairwaytreff |
| **Wedge Variation**, s. 10 | Ni carryslag i rekkefølgen 58, 37, 87, 63, 48, 57, 33, 66, 54 m, målt med egnet instrument | Gjennomsnittlig geometrisk PEI. Kolonnen merket SG i arket er et oppslag for forventede putter fra restavstand; den må ikke omtales som vunne slag uten riktig startreferanse og minus ett slag |
| **Putt 1–3 m**, s. 11 | 25 oppgaver: 1/1,5/2/2,5/3 m gjentas fem ganger, fordelt over 3–5 hull. Registrer antall slag til ballen er i hullet, ikke bare treff/bom | Totalt antall slag, gjennomsnitt per avstand og resultat mot forventede putter. Lavere antall slag er bedre. Forventning minus faktisk gir positivt tall når spilleren gjør det bedre enn referansen |
| **9 hull lengde**, s. 12 | Ni oppgaver fra Excel, registrert restavstand i fot og om ballen er senket. Varier helling. PDF-skjemaets 25 rader er et kildeavvik | Poengsum med halve poeng. Følg eksisterende vedtak ved motstridende grenser, se nedenfor. Målavstandens enhet er fremdeles ikke oppgitt entydig |
| **Nærspill Gate**, s. 14 | Ni slag: lav/middels/høy port og landingssoner 2/3/4 m. Port ca. 2 m foran spilleren; portene er 40 cm og landingssonene 1 m dype | PDF forklarer 1 poeng gjennom port, men utenfor landingssone, og 4 gjennom port og innenfor sonen. Bevar allerede vedtatt manuell poengføring og summering. Vis denne hjelpeteksten; ikke kall skalaen helt ukjent |
| **Wedge Gate**, s. 15 | Ni slag med måler, tre høydevinduer × tre carrysoner. Excel og PDF-tabell angir 40/50/60 m ±3. Vinkler: under 26°, 28–30°, over 32° | Tidligere vedtak styrer appen: tell godkjente treff av ni. PDF beskriver i stedet 1/4 poeng og har 30/40/50 i brødteksten. Dokumenter valgt regelversjon og hva et treff krever; ikke bland poeng og treff |
| **Driver Gate**, s. 16 | Seks slag gjennom port 2 m foran spilleren, 24 cm total bredde. En annen spiller observerer passeringen | Godkjent/ikke godkjent per slag; resultat X av 6. Ikke bruk Excels COUNT på seks utfylte 0/1-celler som antall treff |
| **Putt Gate**, s. 17 | Ti putter gjennom port 6 cm bred, 40 cm foran ballen, med en lengdesone på 50 cm bak porten. Registrer ren passering og stopp innenfor sonen | Godkjent krever begge vilkår. Registrer venstre/høyre ved retningsbom; en ball kan gå rett gjennom og likevel bomme på lengden. Derfor kan ikke alle ikke-godkjente forsøk kreve venstre/høyre |
| **VISA Express**, s. 18 | Ni putter, 2/3/4 m gjentas tre ganger. Gjennom port til målsoner 30 cm dype | PDF beskriver 1 poeng for port uten lengdesone og 4 for begge. Maks 36. Bevar manuell poengføring og sum; tall er poeng, ikke PEI |
| **Putt Speed 1 × 5**, s. 19 | Fem putter mot linje. Scorekortet angir 3 m. Registrer restavstand til linjen og kort/lang/på mål | Gjennomsnitt av avstandenes størrelse. Kort og langt skal ikke oppheve hverandre. Oppgi enhet tydelig; foreslå cm i scorekortet og normaliser internt |
| **Putt Speed 3 × 3**, s. 20 | Ni putter, 3/5/7 m i skiftende rekkefølge gjentatt tre ganger, ikke tre fra hver avstand på rad | Samme restavstandsregel, gjennomsnitt av ni. Ingen treffscore eller PEI skal erstatte dette hovedresultatet |

Felles instruksjoner fra PDF side 1: legg til rette forhold og utstyr, la spillerne kjenne testen på forhånd, og gjennomfør golfslagtestene med relevante ytre forhold. Avstander kan tilpasses forholdene. Appen må derfor kunne bevare både standardmålet og faktisk målavstand, bruke faktisk avstand i beregningen og merke tilpassede gjennomføringer. Ikke endre mål etter at slaget er slått uten en sporbar rettelse. Sammenligning mellom skoler skal ta hensyn til variant, oppsett og avvik, ikke bare resultatnummeret.

Prioritert rapportering på PDF side 2: Driver Basic minst 1, Innspill Basic 2, Wedge Variation 2, 8-ball variation 2 og Putt 1–3 m 4 gjennomføringer. Dette er dokumentets prioritering for det beskrevne uttaks-/planleggingsopplegget, ikke en universell ukentlig kvote. Avklar hvordan en komplett Innspill Basic-gjennomføring med to delserier telles før automatiske påminnelser eller «ferdig testbatteri» settes. Ingen resultater er sendt til PDF-ens eksterne skjemaer i denne kontrollen.

## Testene og variantene som bare er utdypet i Excel

| Del | Logikk som må beholdes |
|---|---|
| Golfslag bane med egne lengder | 30 egne mål, hull, startplassering og sluttplassering. PEI bruker mål for hvert enkelt slag. Ikke regn dette som uendret standardvariant |
| PEI Test Bane | Antall/mål og startplassering bestemmes før økten. 18 rader i malen; appen tilbyr 1–200. Direkte restavstand / faktisk målavstand. Excel bruker General-format i PEI-kolonnen; brukerens prosentregel overstyrer dette visningsavviket |
| Slagtest og wedgetest med egne lengder | 18 egne mål, målt lengde og sideavvik. Beregn avstand til mål, lengdeavvik og gjennomsnittlig PEI. Tilfeldighetskolonnen er oppsettshjelp, ikke score |
| ST Leon ROT / ST Cloud GC | 18 kildefaste lengder per variant, med samme geometriske beregning. Bevar kildeverdier med desimaler, ikke rundede PDF-eksempler |
| PGA Tour 27 shots | 27 mål i kildens rekkefølge; samme beregning og separat variant |
| Standard sving 7-jern | Ti forsøk mot egen medianlengde. Én fastlagt referanselengde før forsøksserien; ikke median som endrer seg etter hvert slag |
| Innspill 120 / 160 / Variation | Fem, fem og ti slag i respektive serier. Samme geometriske beregning, med forskjellige mål og rekkefølger |
| Wedge 3 Blocked / Variation | Ni slag. Blocked: 30/30/30/50/50/50/70/70/70 m. Variation: 30/70/50/70/50/70/30/30/50 m |
| Teknikktest panel A/B/C | Først fem grunnmålinger. Deretter har de to første panelene ti måleforsøk; det tredje har fem. Felles beregnet referanselengde, carry, sideavvik, restavstand, PEI, lengdeavvik og seks impact-/hastighetsfelt. Appens 15 forsøk i alle tre paneler stemmer ikke med siste panel i vedlegget |

Teknikkarket krever både måledata og spredningsvisning. Det har 21 diagrammer: tre spredningsdiagrammer med sideavvik/lengdeavvik, og seks målediagrammer per panel. Ikke reduser leveransen til én totalscore. Median, gjennomsnitt og lengdeavvik må hete det de faktisk er, og hastighets-/impact-enheter må være definert. Enheten/metoden for Impact Location er ikke avklart av et tomt kolonnenavn.

De øvrige fanene er forklaring, lenker, strategiprediksjon, beslutnings-/spredningsstøtte, TeeGate-geometri, øktplanlegging, observasjon, referanser og startoppsett. De er kartlagt i den første rapportens 16-fanersoversikt. De er ikke ekstra fullførte tester bare fordi de inneholder formler.

## Nye og presiserte avvik

| ID | Kilde og konkret avvik | Riktig behandling i appen |
|---|---|---|
| F01 | `Scorekort GolfslagTester!F5` er tom, men G5 er lagret som 0, I5 som 4; I29 viser 96 og H31 0 % uten førte slag | Tomt gir ingen score. Skill registrert null fra manglende resultat. Eksisterende fullføringsvalidering i TN-motoren beskytter mot dette; behold den |
| F02 | Ni-hullsputting CP5 er tom, men CR5 gir 6 og CR14 54. IF sjekker målet CO, ikke registrert rest CP | Ikke importer malens fullscore som et resultat. Ingen senket putt uten registrering |
| F03 | Jentenes baneformler AD76/AD78 blander kategorier: wedge på rad 50 regnes som innspill, mens innspill på rad 51 og 60 regnes som wedge | Gruppér etter faktisk slagtype. Behold total PEI separat. De riktige kategoriene er 20 innspill, 6 wedge, 4 bunker; kildeformlene grupperer 19/7/4 |
| F04 | `Teknikktest!V20 = AVERAGE(V9:V19)` inkluderer medianen i V19 som et ellevte resultat | Gjennomsnitt skal tas av de ti råforsøkene V9:V18. Syntetisk 1 m ni ganger + 10 m gir 1,9 m, mens kildens formel gir 1,81818 m |
| F05 | Tredje teknikkpanel har fem grunnmålinger og fem oppgaveforsøk, ikke fem + ti | Scorekort og fullføringskrav må følge riktig panel/versjon |
| F06 | `Teknikktest!D2` inkluderer C7, en ekstra blank celle etter fem nummererte grunnmålinger | Bruk de fem definerte grunnmålingene; en tilfeldig verdi på ekstraraden skal ikke endre referanselengden |
| F07 | Putt Gate har manglende totalformel og dagens validator krever venstre/høyre når OK=Nei | Tell begge godkjenningsvilkår. Tillat lengdebom uten oppdiktet sidebom. Reprodusert: rett gjennom, men for langt, avvises med «Oppgi bomretning» |
| F08 | Driver Gate bruker COUNT på OK-celler | Summer reelle godkjente slag. Både 1 og 0 er tall og telles av COUNT |
| F09 | Wedge Variation BL5 skjuler resultat når carry er 0 | Skill ugyldig instrumentmåling fra et faktisk dårlig/mislykket slag. Ikke la et registrert dårlig slag automatisk forsvinne fra gjennomsnittet |
| F10 | Felt merket «SG» inneholder flere steder forventede putter, ikke vunne slag | Gi verdiene presise navn. Banens formel bruker fairway-start og green-slutt selv om registrert lie er en annen; merk dette som Excel-referanse, ikke full lie-justert SG |
| F11 | PDF-tabeller viser enkelte avrundede mål, f.eks. 237 der Excel har 236,5 | Bevar Excel-grunnverdien og mål faktisk oppsett. Ikke rund datagrunnlaget ved import |
| F12 | PEI-format varierer i Excel: heltallsprosent, to desimaler og General | Vis alltid korrekt prosent i appen uavhengig av kildens celleformat |

Ni-hullsputting har i tillegg tre motstridende beskrivelser: PDF skriver «>1 fot» ved 3 poeng, Excel-oppslaget skifter ved 0,1/1,1/2,1/4,01, og Anders' eksisterende vedtak har andre tydelige grenser. Vedtaket styrer appen: senket/0–0,1 fot = 6, deretter til 1 = 3, til 2 = 1, til 4 = 0,5, over 4 = 0. Vis avviket som dokumentert regelversjon. Måleenheten for de ni målavstandene er fortsatt uavklart.

## Konkrete fasitprøver før skjermarbeid

| Prøve | Forventet resultat |
|---|---|
| 100 m mål, carry 96,8 m, side 0 | Rest 3,2 m; PEI 3,2 % |
| 100 m mål, carry 97 m, side ±4 m | Rest 5 m; PEI 5 % uansett sidefortegn |
| Rest 1 m fra mål 10 og 100 m | Samlet PEI 5,5 % |
| 8-ball, 24 restavstander på 1 m | 48 poeng; PEI 5,8125 % før visningsavrunding; kategoriresultater skal regnes separat |
| 8-ball, rest 0,099 / 0,1 / 1 / 2 / 3 m | 4 / 3 / 2 / 1 / 0 poeng, uten forhåndsavrunding |
| Driver Gate: 1/0/1/0/1/0 | 3 av 6, ikke 6 av 6 |
| Putt Gate: ren passering, utenfor lengdesone | Ikke godkjent, men ikke krav om venstre/høyre |
| Putt Speed: 10 cm kort og 10 cm lang | 10 cm gjennomsnittlig restavstand, ikke 0 cm |
| Tom 8-ball eller ni-hullsputting | Ingen sluttverdi og ikke mulig å fullføre |
| Jentenes banetest med syntetisk kjent PEI per slagtype | Kategorisnitt følger etikettene og 20/6/4 forsøk |
| Teknikkpanel B: avstandene 1×9 og 10 | Gjennomsnitt 1,9, median 1; median teller ikke som forsøk |
| Teknikkpanel C | Fullføres etter fem grunnmålinger og fem måleforsøk; ingen oppdiktede fem ekstra |

I denne oppfølgingen er PEI-formatprøvene, 8-ball-eksempelet og Putt Gate-valideringen faktisk kjørt mot dagens kode. Formel-/kategorifunn er kontrollert direkte mot vedlegget, med uavhengig regning av eksemplene. Resten av tabellen er akseptprøver for gjennomføringen. Tidligere 169 grønne tester er tidligere testbevis, ikke en ny full testkjøring nå. Ingen full Excel-rekalkulering eller virkelig databasetest er utført.

## Følge for planen

Før videre scorekortarbeid må hver test ha avklart inndata, rekkefølge, enhet, forsøksantall, hoved-/delresultater og eksakt regelversjon. Start med entydig PEI, kategoriene i banetesten, de manglende gate-/speedberegningene og teknikkpanelene. Gi hver kildefeil et eget fasitsett og dokumentert avvik fra regnearket.

Deretter kan samme testlogikk brukes i spillerføring, trenerføring, WANG/TN-profiler og felles testdag. Livevisningen skal vise samme enheter og beregning, og alltid skille foreløpig fra fullført resultat. Designet skal bygges rundt den riktige testen, inkludert dens delresultater og oppsett.
