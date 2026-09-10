# Team Norway — kontroll mot Excel v3

Kontrollert 10.09.2026. Kilde: `team-norway-treningsprotokoll-og-tester-for-spillerv3.xlsx`, vedlagt av Anders fra NGF-originalmappen. Arbeidsbokens 16 ark ble kartlagt. Testarkenes felter, rekkefølger og relevante formler er lest direkte. Originalen er uendret. Eksterne dokumenter fra Links-arket er ikke innhentet. Produksjonsdatabasen er ikke lest eller endret.

**Oppdatert status etter retting:** Den aktive appen har nå en egen versjonert Team Norway-katalog og scorekort på `/portal/tren/tester/team-norway`. 38 varianter er registrert; 27 kan fullføres med beregning, 11 kan lagres som råutkast mens fagregler avklares. Fullt samsvar for hele testbatteriet er fortsatt ikke bekreftet: åpne fagspørsmål, historiske sammenligninger og full coach-/talentintegrasjon gjenstår. Ingen nye standardresultater skal gå gjennom de eldre TN-beregningsveiene.

**Tabellen nedenfor beskriver funn før retting. Gjeldende implementeringsstatus står i siste del.**

## Kildematrise og avvik

| Test / variant | Excel-grunnlag | Kontroll mot kode |
|---|---|---|
| 8-ball variation / blocked | Golfslag A4:I35 / K4:S35. 24 slag, samme åtte slagtyper ×3, ulik rekkefølge. Resultat i meter; PEI, PGA-putter og poeng beregnes. | Separat modul har riktig rekkefølge og poengterskler. De to seedene beskriver ulike hovedresultater og det ene ber om poeng manuelt. |
| Golfslag bane | Golfslag U4:AG39, U43:AG78; 30 slag, bunker fra nr. 27. U86:AG121 har egen variant uten faste lengder. | Desimalavstander avrundes i eldre seed. Separat modul mangler den frie varianten. Bunkerstart 28 →27 rettet lokalt. |
| Driver basic | Golfslag AI4:AR10 / AI15:AR21. 5 slag, mål 270/220 m. Carry, side, speed; PEI fra geometrisk avvik. | Eldre seed bruker carry-gjennomsnitt som score. NGF-seed mangler entydig numerisk mål i PEI-beregningen. Speed-enhet er ikke oppgitt i arket. |
| Inspill Basis | Golfslag AT4:BC10, AT15:BC21, AT26:BC32, AT37:BC43. Fire femslagsvarianter: gutter 145/160, jenter 125/145 m. | NGF-seed har 10 forsøk; separat modul har bare 160/125-variantene. |
| Wedge Variation | Golfslag BE4:BM14. 9 mål: 58,37,87,63,48,57,33,66,54 m. | Rekkefølgen finnes riktig i separat modul/eldre seed, men eldre seed beregner carry-snitt og NGF-seed bruker en annen beskrivelse/målsetting. |
| 18 hull | Golfslag BO4:CA25 / BO32:CA53. 18 faste lengder per variant, resultat og lie. | Separat modul har lengdene; databaseprotokoll og aktiv lagring er ikke bekreftet lik. |
| Putt 1–3 m | Golfslag CC4:CI36. 1/1,5/2/2,5/3 m gjentas fem ganger. Antall slag til hull, ikke treff/bom. Sum slag og fem distansesnitt. CI=CH−CG. | Begge seedene bruker treff/bom og blokkerer rekkefølgen per avstand. Separat modul har riktig rekkefølge, men bare valg 1–3 og mangler to distansesnitt. Fortegn rettet lokalt. |
| 9 hull lengde | Golfslag CL4:CR15. Mål 5,7,11,9,6,10,8,7,9; resultat i fot. Poeng fra Referens E11:G15. | Separat modul har rekkefølgen og tersklene. Nullavstand versus faktisk senket putt må avklares; arket gir 6 poeng også for verdier under 0,1 fot. |
| Nærspill Gate | Teknik A4:F16. Lav/middels/høy ×2/3/4 m, 9 poengfelt og SUM. | Eldre seed sier 0–2/maks18; separat modul bruker binært treff/bom. Tillatt poengskala fremgår ikke av de leste cellene. |
| VISA Express | Teknik H4:L16. 2/3/4 m ×3 i vekslende rekkefølge, poengfelt og SUM. | Rekkefølge finnes; gyldige poengvalg krever protokollavklaring. |
| Putt Speed 1×5 /3×3 | Teknik N4:S12 / U4:Z16. 3 m ×5 /3,5,7 m ×3. Distanse og lang/kort separat. AVERAGE av distanse. | NGF-seed slår sammen til én test og bruker laveste verdi. Eldre seed kan la negativt og positivt avvik kansellere hverandre. Definisjon/enhet for Distanse må avklares fra full protokoll. |
| Wedge Gate | Teknik A26:F38. 9 slag: <26°,28–30°,>32° ×40/50/60 m ±3. Poengsummer. | Samme konflikt mellom binært og 0–2. Kilden definerer ikke poengmapping i cellene. |
| Driver Gate | Teknik H26:L35. 6 forsøk, Avstand=2 m, OK. TeeGate F20:F21 angir gateavstand 2 m. | Kode kaller dette 2 m bredde; kildegrunnlaget støtter avstand. Excel L33 bruker COUNT, som teller både numerisk0 og1. Ikke kopier som treffsum. |
| Putt Gate | Teknik N26:S40. 10 forsøk, Avstand=40 cm, OK og V/H. | Kode kaller40cm gatebredde. R40 peker på tom R37; total mangler formel. Detaljert gategeometri og poengregel må bekreftes. |
| PEI Test Bane | Eget ark A3:F22. Nr, hull, slag/lie f/r/t/b, lengde, til hull, PEI=E/D, snitt. Forklaring B4 tillater valgt antall slag. | NGF-seed bruker generisk average; motoren kan velge lengde som hovedverdi og lagre meter som PEI. Separat modul låser til18 og binder hull til radnummer. |
| Frie PEI slag-/wedgetester | PEI Tester A9:G29 / I9:O29. 18 egne målavstander, faktisk distanse og signert side. | Egen slagtest finnes; fri wedgevariant mangler i separat katalog. |
| ST Leon ROT / ST Cloud GC | PEI Tester Q9:W29 /Y9:AE29. 18 mål per variant. | Faste mål samsvarer i separat modul. |
| PGA Tour 27 | PEI Tester AG10:AG36. 27 faste mål. | Separat modul hadde24mål og3null. Rettet til27faste mål, inkl.120/105/90 før siste175. |
| Standard sving | PEI Tester A34:A44. 10 slag mot medianlengde med J7. | Mangler egen protokoll i separat katalog. |
| Inspill120/160 | PEI Tester A45:A56. Fem slag per mål. | Finnes i NGF-seed som gjennomsnittlig restavstand; mangler i separat katalog. |
| InspillVariation | PEI Tester A57:A67. 100,130,110,140,160 m ×2. | Separat modul riktig10slag, NGF-seed9slag. |
| Wedge3Blocked /Variation | PEI Tester I35:I54. 30,30,30,50,50,50,70,70,70 /30,70,50,70,50,70,30,30,50. | Blocked finnes; Variation mangler i separat katalog. Må ikke blandes med Wedge Variation58/37/87… |
| Teknikktest | Teknikktest B1:N20, R1:AD20, AG1:AS20. A med5slag, B med10, carry/side og impact-felter. | Eldre seed har bare10slag og carry/side. Full dekning av oppsett og målinger mangler. |
| Fysiske tester | Ingen tilsvarende scorekort i denne arbeidsboken. | Kan ikke godkjennes fra denne kilden; beholdes som tester med annet kildegrunnlag. |

## Opprinnelige beregnings- og lagringsfunn

- `test-scoring.ts` respekterer ikke `primaryMetric` i generisk average/min/max. Ukjent test eller manglende verdi kan bli score0. PEI uten mål kan bli rå avstand. Dette må stanses før resultatene kan brukes som faglig sammenlignbare tester.
- `protocol.ts` fjerner select-felt. Dermed kan blant annet lie og kvalitative protokollverdier forsvinne fra skjemaet.
- Fullføringshandlingen sjekker om hver innsendte rad har minst én verdi, ikke alle obligatoriske felt eller forventet antall unike forsøk. Delvis test kan bli registrert som fullført.
- Referens-tabellene inneholder ulike grunnlag. Forventede putter er ikke automatisk Strokes Gained. Excel-kolonner med SG-overskrift som bare slår opp forventede slag skal merkes «Forventede slag».
- Workbookens COUNT/tomme referanser, grove omregninger og ukjente poengskalaer er ikke sikre produktregler. Kildekonflikter dokumenteres, de skjules ikke ved å finne på en fasit.

## H2-02 vurdering

HTML åpnet lokalt uten nettverk: startsiden rendret,19knapper,ingen JavaScript-feil. Ikke en full interaksjons- eller tilgjengelighetstest. Kildekoden viser12innspill med Treff/Kant/Bom og én teller for15putter. Dette er et eget treningsoppsett og dokumenterer ikke TN-scorekort. `putt()` avslutter automatisk på15; `puttUndo()` setter status tilbake til pågår. Pause, avslutning og retting bør ha eksplisitte overganger. Alle designvalg er fortsatt åpne.

## Rettet og kontrollert lokalt — gjeldende status

| Område | Implementert | Gjenstår / begrensning |
|---|---|---|
| Felles kilde | `tn-catalog.ts` knytter 38 varianter til Excel-celler og versjon. Nye scorekort bruker denne katalogen ved både visning og lagring. | Gamle seed/protokolldata beholdes som historikk; ingen produksjonsmigrering utført. |
| Standardmål | 25 faste målserier er kontrollert mot råuttrekk fra originalen. PGA27, bunker fra nr.27, puttefølge, variantmål og frie PEI-varianter er inkludert. | Fysiske tester krever separat kilde. |
| Beregning | `tn-scoring.ts` krever komplette gyldige data. PEI bruker snitt av forholdstall og geometrisk rest ved carry/side. Putt bruker slag og alle fem snitt. 8-ball bruker poeng som hovedresultat, med separate PEI-/forventningsmål. | Banetest viser eksplisitt Excel-fairway/green-referanse, ikke feilaktig lie-justert SG. |
| Referansetabeller | Grov putt, fin green og fairway er sammenlignet med celleuttrekk. Excel har duplisert nedre terskel 411,01 i fairway; siste rad brukes som i omtrentlig oppslag. Numerisk toleranse 1e-12 håndterer binær desimalrepresentasjon. | Dette er kildesamsvar, ikke en vurdering av om denne eldre referansen er den faglig beste modellen. |
| Lagring | Autentisering, eierskap, versjon, antall forsøk, revisjon og komplette målinger valideres på server. Resultat beregnes på server. Transaksjon og revisjonskontroll beskytter mot delvis lagring og overskriving fra gammel fane. Gjentatt identisk fullføring oppretter ikke nytt resultat. | Atomisk oppførsel er enhetstestet med databaseadapter; faktisk databaseforløp er ikke kjørt i denne kontrollen. |
| Utkast/historikk | Rådata og notat bevares i utkast/avbrutt. Ingen standardscore for ufullstendig test. Fullførte resultater leses fra lagret resultat ved gjenåpning, og feltene er skrivebeskyttet. | Etterfølgende korrigering med revisjonshistorikk er ikke bygget. Utkast krever eksplisitt lagring; offline-kø på enheten er ikke implementert. |
| Eldre registrering | Offisielle TN-tester omdirigeres til ny katalog eller avvises ved gammel manuell/scorekort-fullføring. Select-felt bevares. Fullføringsvalidering krever forventet antall og obligatoriske felt. `primaryMetric` respekteres ved gjennomsnitt/min/maks. | Generiske gamle forhåndsvisninger og eksisterende resultater er ikke globalt omskrevet. |
| Integrasjon | Ny inngang fra testhub og egen historikk. Nye definisjoner har versjonerte ID-er og holdes utenfor gamle kanoniske sammenligninger. | Coach-tildelinger, talentgrunnlag og all sammenligning må kobles eksplisitt til riktig versjon før helheten er ferdig. |

`npm run verify` bestod i isolert kopi, inkludert produksjonsbygg og prosjektkontroller. Alle 2 210 automatiserte tester bestod i siste samlede kjøring, inkludert referansetabellkontrollen. Ingen CI-kjøring på disse endringene er bekreftet.

Lokal nettleserprøve av putt, wedge og 8-ball med syntetisk lagringsadapter bestod: 24/25 kan ikke fullføres, komplette data fullføres, feltene låses, og 390/1440 px i begge temaer har ikke horisontal overflyt. Dette er funksjonell prøve, ikke faktisk database-/betalingskontroll eller godkjenning av visuelt design.

## H2-03 i siste ZIP

Se [full review av ZIP (2)](claude-design-zip-2-review-2026-09-10.md). Nyeste prototype har forbedret puttereferanse og tallvalidering. Påstander om tomme PGA-mål og wedge-mål i feil kolonne er derimot motbevist ved ny direkte lesing av samme arbeidsbok. Blokkert 8-ball bruker fortsatt variasjonsrekkefølge. Fullføring, retting og faktisk lokal lagringsfeil trenger retting i prototypen.

Neste designbestilling er [komplett overleveringsprompt](../design-system/claude-design-komplett-overlevering.md). Den erstatter ikke de faglige avklaringene nedenfor.

## Åpne fagspørsmål

- Nærspill Gate, Wedge Gate og VISA Express: tillatt poengskala og mapping fra måling til poeng.
- Driver/Putt Gate: geometri og betydning av OK/poeng; avstand til gate er ikke gatebredde. Ikke kopier feilaktig COUNT eller tom formel.
- Putt Speed: hva Distanse måler og hvilken enhet som gjelder.
- 9 hull lengde: målavstandens enhet og skille mellom senket putt og svært kort rest ved toppscore.
- Teknikktest: fullstendig måleoppsett og enheter, særlig treffpunkt.

Disse 11 variantene tillater råutkast og avbrutt registrering, men ingen standardfullføring før reglene er bekreftet. Det er sendt et faglig avklaringsspørsmål til Anders; ingen svar er lagt til grunn ennå.
