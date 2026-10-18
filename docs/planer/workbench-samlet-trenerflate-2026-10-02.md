# Samlet trener-Workbench

Anders valgte 02.10.2026 å kombinere alle fire Opus-forslagene. Dette erstatter tidligere «ingen retning valgt» for denne leveransen. Precision Athletics gjelder fortsatt. Bestillingen er videre design i eksisterende Claude Design-prosjekt; dette dokumentet er ikke bevis på ferdig appkode.

## Én arbeidsflate, fire innganger

| Inngang | Hovedoppgave | Fordypning |
|---|---|---|
| Sesongkart | Fordele utvikling, tester og konkurranser over tid | År → periode → måned → uke → økt |
| Ukeverksted | Lage og justere den konkrete treningen | Bibliotek, øktbygger, serier, publisering |
| Trenerbord | Følge opp grupper og enkeltspillere | Individuelle unntak, Spiller 360/IUP, live gjennomføring |
| Analyse til tiltak | Bruke observasjoner til neste handling | Datagrunnlag, mål, tiltak, alternativ plan og evaluering |

Valgt spiller/gruppe, dato, periode og utvalg følger treneren mellom visningene. Økten er samme objekt overalt. En justering skal vises i kalender, gruppematrise, dagbok og analyse uten nye kopier. Sjeldnere funksjoner nås i relevante paneler, ikke som en vegg av kort på forsiden.

## Funksjoner og plassering

| Område | Konkret innhold | Plassering |
|---|---|---|
| Planlegging | Frie periodegrenser, fem akser, prioriteringer, uketyper, treukerssyklus, timebudsjett | Sesongkart / periode |
| Kalender | Måned/uke/dag, skole, booking, reise, turnering, test, samling | Sesongkart / Ukeverksted |
| Øktbygging | Oppvarming, øvelser, teknisk fokus per øvelse, press, sted, utstyr, varianter, reps, sett, tid og mål | Ukeverksted / øktpanel |
| Effektiv redigering | Opprett, kopier, flytt, angre, maler, serier med enkelt- og fremtidsendring | Ukeverksted |
| Publisering | Trenerutkast, mottakeroversikt, spillerforhåndsvisning, publisert plan, trekke tilbake | Øktpanel / godkjenning |
| Gruppeledelse | Felles økt, individuelle øvelser/mål/mengder, tydelige inkluderte og utelatte | Trenerbord |
| Gjennomføring | Oppmøte, øvelsesresultater, faktisk varighet, innsats, trenernotat, neste oppgave | Live økt |
| Oppfølging | Uregistrerte økter, spillerinnspill, godkjenning, målefrister, historikk | Trenerbord / Spiller 360 |
| Mål | Resultat- og prosessmål, tidsnivå, kriterium, støtte, evaluering, mål→øvelse-kobling | Spiller 360 / Analyse |
| Tester | Protokoll, råresultat, dato, egenført/kontrollert, versjon og historikk | Analyse / testflate |
| Teknisk/fysisk | Teknisk plan og TrackMan-data; fysisk program og gjeldende testbatteri | Øktbygger / Analyse |
| Konkurranse | Tour, land, runder, hull, dager, brutto resultat, historisk Power-kilde, reise separat | Sesongkart / konkurransepanel |
| Dagbok | Dag, måned, sesong, planlagt/faktisk, fem akser og registreringsgrad | Analyse / spillerflate |
| IUP | Excel-funksjonene X01–X18, støtteapparat, evaluering, utviklingssjekk og referanser | Spiller 360/IUP med relevante snarveier |
| Deling | Spillereid informasjon; separat gyldig TN-/WANG-tilgang; bortfall uten lekkasje | Spiller 360 / tilgang |
| Alternativer | To planer side om side, konkrete forskjeller, eksplisitt ta inn som utkast, angre | Sesongkart / Analyse |

Det detaljerte Excel-inventaret og kildeavvikene står i [dekningsanalysen](../design-audit/workbench-iup-dekning-2026-10-01.md). Alle X01–X18 skal ha en brukbar inngang og registrert status. Antall lenker eller faner er ikke funksjonsbevis.

## Gjennomgående regler

- Fem akser: Fysisk, Teknisk, Golfslag, Spill, Turnering. Brutto score; putting i feet, øvrige avstander i meter.
- Planlagt 60 minutter og faktisk 45 minutter er to opplysninger. Status «delvis» må ikke beregne halv tid. Antall økter er ikke timer.
- Fremtid vises som kommende. Manglende registrering er ukjent, ikke null. Trenerutkast tas ikke med i publisert plan.
- Skole og reise er rådgivende kontekst. Reell bookingkonflikt behandles separat.
- Sesongevaluering gjennomføres uka før uke 43. Dette alene fastsetter ikke universell sesongstart; sesongens datoer vises eksplisitt.
- Nye spørsmål og normer skal ikke diktes opp. 2027- og 2025-versjonene av utviklingssjekken beholdes separat. Automatisk fireukerssjekk gjelder bare WANG-/TN-grupper.
- Deling er én spillereid IUP med separate mottakere. Eldre/smalere samtykke utvides ikke automatisk. Helse/meldinger krever at gyldig samtykke faktisk omfatter dem.
- WANG-design leveres kun i eksisterende WANG Golf UI prototype. Team Norway og WANG beholder sine profiler. AK blir ikke en landslagsapp.

## Kodeplan etter designkontroll

Kodepunktene under er observert i hovedprosjektet 02.10.2026. Eksistens og eksportnavn beviser ikke en fungerende kundereise. Ingen ny database- eller øktmodell skal opprettes før eksisterende ansvar og koblinger er kontrollert.

| Trinn | Berørte eksisterende områder | Konkret endring og ferdigbevis |
|---|---|---|
| 1 Felles ramme | `src/components/workbench/WorkbenchShell.tsx`, `src/lib/workbench/load-context.ts` | Felles kontekst og Precision-komponenter. Naviger A→B→C→D→A med samme spiller/dato; tilbake og direkte lenke virker. |
| 2 Tid og navigasjon | `WorkbenchAar`, `WorkbenchPeriode`, `WorkbenchManed`, `WorkbenchUke`; `YearGrid`, `MonthGrid`, `WeekGrid` | Viderefør tidslinje og zoom. Prøv månedsskifte, årsskifte, frie periodegrenser, overlapp og tom plan. |
| 3 Øktverksted | `WorkbenchOkt`, `SessionInspector`, `OvelseSkjema`, `SourcesPanel`, `DrillListEditor`; `wb-actions.ts`, domeneoperasjoner | Bevar kildebibliotek og alle øvelsesfelt. Prøv serie/unntak, rekkefølge, flytt/angre og publiseringsmottakere. |
| 4 Gruppe og live | `WorkbenchStall`, `WorkbenchLive`, `gruppe-periode-actions`, `wb-actions.ts` | Matrise og individuelle overstyringer. Følg én gruppeøkt gjennom plan, oppmøte, 60/45-føring og individuell oppfølging uten duplisering. |
| 5 Analyse og tiltak | `insights`, `compliance`, `maal-spor`, `teknisk-plan-panel`, `src/lib/teknisk-plan/`, `src/lib/portal-tester/` | Kildebevisste resultater, mål og øktkobling. Lag seksukerstiltak som utkast og angre; skille test fra SG. Ny scenariesammenligning må avklare lagring/versjonering. |
| 6 Excel-erstatning | Eksisterende IUP-, mål-, evaluering-, test- og dagbokflyter, kartlagt per X01–X18 | Gjennomfør hvert kildebehov fra føring til gjenfinning. Verifiser spørsmålstall, historiske skalaer, sumtimer, referansemetoder og råresultater. |
| 7 Trenerinnsyn | Eksisterende tilgangsvakter og TN-/WANG-trenerflater | Samme spillerdata uten parallelle kopier. Test tillatt/avvist, separat tilbakekalling, direkte rute, eksport og mellomlager. |

## Leveranse- og kontrollkrav

Designet skal ha én fungerende inngang, responsive arbeidsflater på desktop 1440 og mobil 390, relevante tomme/lastende/feil-/tilgangstilstander og tastaturflyt. Desktop-komposisjonen skal ikke bare krympes på mobil.

Tre bevisnivåer føres separat: designverktøyets egen rapport, Codex sin observerte kontroll, og senere fungerende app med lagring og tilgang. Anders skal se appen ved siden av valgt design før skjermen ferdigmeldes som visuelt godkjent.

Bestilling sendt og mottatt i Precision med Opus 5.5 Medium. Ny kombinert prototype er under arbeid. Appkode og produksjon er ikke endret i denne bestillingen.


## Første prototype og observerte avvik

Hovedinngang: https://claude.ai/design/p/7d7c2994-cf63-4c5f-9bdc-fdaf67655a70?file=ui_kits%2Fworkbench-samlet%2Findex.html&present=1

Opus leverte fire samlede hovedflater, Spiller360, funksjonsregister, tilstandsgalleri og overlevering. Egen skriptrapport oppgir gjennomførte hovedreiser og iframebredder390/1440. Dette er ikke app-/produksjonsbevis.

Codex prøvde selv:

- Uke40→41→Sesongkart→Trenerbord: spiller og dato9.okt beholdt. Ved Analyse viste ukeindikatoren42 mens adressen fortsatt9.okt: konkret feil, retting bestilt.
- Analyse: to45minøkter plassert, før/etter viste +1t30, seksukersutkast opprettet, Angre tilbakeførte status.
- Ny60minøkt lagt inn fredag17:00, forhåndsvisning viste riktig spiller og én økt, publisering endret kalenderstatus og ukesum. Startet og fullført med45min. Kalender/øktpanel/dagbok viste45min; teknisk ukesum økte fra1t40 til2t25. Notatføring ble ikke fullført etter en verktøyfeil; ingen notatkontroll hevdes.
- Dagbok viste83% som5av6 registrerte økter, ikke som tidsprosent for60/45. Én økts tidsandel er75%.
- Funksjonsregisteret avslørte X09 manglende, X05/X14/X15 kun lesing, X08 kun lesing, X10/X12 delvis. Rettbar trenerføring skal fullføres før komplettdekning hevdes. Profil-/referanselesing kan være riktig ut fra rolle, men referansevalg og kildegrenser må være reelle.
- Sesongkart hadde fortsatt fremtid som registrert0 og grafmerker bare til25t med verdi26t45. Begge rettinger bestilt.
- Dagbokens uketabell viste Spill plan0 mens ukeplanen har2t30 kommende lørdag. Avgrensning «til og med i dag» manglet: full ukes plan bør samsvare med kalender, eller tidsvinduet må angis tydelig.

Første fullføringsbestilling sendt: X09, målredigering, teknisk plan, fysisk program/råtest, referansevalg, datobug, null/ukjent/fremtid, grafskala og komplette mobil-/desktoprammer.


### Andre prototypekontroll

Opus rapporterer X09, X05, X14 og X15 som redigerbare, med felles modell og utkastflyt. Referansevalg/grenseprøve for X17/X18 er lagt til; syntetiske referanser skal ikke tolkes som godkjente normer.

Codex har deretter sett hele mobilappen og Spiller360 i390-iframe og desktop i1440-iframe. Faktiske tastetrykk Tab→Oversikt→Tab→Mål→Enter åpnet mål; Escape lukket og ga fokus tilbake tilIUP. Dette er avgrenset tastaturprøve, ikke full tilgjengelighetsgodkjenning.

Datofeilen er gjentatt og rettet: valgt9.okt/uke41 beholdes iAnalyse. Sesongkart viste sammeuke, fremtid«kommer» og skala0–30t. Nytt observert visuelt avvik: august/september overlapper i starten av full sesong, der første månedssegment er svært smalt.

Siste avgrensede bestilling er sendt for X08-turneringsredigering, dagbok/kalender-samsvar og komplette X10-/X12-føringsfelt. Endelig resultat avventes.


## Leveranse etter sluttkontroll

Opus5.5 har fullført kombinert prototype i eksisterende Precision-prosjekt. Hovedfilen er `ui_kits/workbench-samlet/index.html`, med `desktop.html`, `mobil.html`, `tilstander.html`, funksjonsregister og `overlevering.md`. X01–X18 har nå definerte innganger og status; X02/X03 beholdes som trenerlesing av spillereid profil/støtteapparat, X17/X18 som sentralt forvaltede referanser som treneren kan velge/sammenligne.

Siste rapport fra designverktøyet: X08 kan opprettes/redigeres med separat reise, kildeår og forhåndsvisning; X10 har komplette øvelsesfelt med lagring og rekkefølge; X12 har katalog/protokoll/råforsøk/resultat/historikk. Verktøyet rapporterer prøvd turneringsendring/angre, Wedge Gate6av9 og Innspill Basic snitt7,0. Disse siste prøvene er ikke alle gjentatt av Codex.

Codex sluttkontroll:

- Åpnet faktisk skjema for ny turnering og kontrollerte felt, reise og forhåndsvisningsinngang.
- Dagbok uke40 viser nå Spill plan2t30/registrertkommer, Golfslag1t30+—, Turnering0/0 og eksplisitt registreringsgrad4av5 ferdig forventede økter per2.okt14:20. Dette samsvarer med kalenderens valgte uke.
- Sett rettet full sesong i1440-ramme; de smale månedsetikettene overlapper ikke lenger. Nytt bilde lagret privat.
- Sett mobil390 inkludert Spiller360, og prøvd Tab/Enter/Escape i den avgrensede reisen beskrevet over.

Lenker:

- Hovedflate: https://claude.ai/design/p/7d7c2994-cf63-4c5f-9bdc-fdaf67655a70?file=ui_kits%2Fworkbench-samlet%2Findex.html&present=1
- Desktop1440: https://claude.ai/design/p/7d7c2994-cf63-4c5f-9bdc-fdaf67655a70?file=ui_kits%2Fworkbench-samlet%2Fdesktop.html&present=1
- Mobil390: https://claude.ai/design/p/7d7c2994-cf63-4c5f-9bdc-fdaf67655a70?file=ui_kits%2Fworkbench-samlet%2Fmobil.html&present=1

Private bilder: `~/Documents/Claude/akgolf-hq/workbench-samlet-sesongkart-2026-10-02.png` og `workbench-samlet-mobil-2026-10-02.png`.

Begrensninger før appbygging: Ingen backend/produksjonskobling er lagt til. Full X01–X18-kildekontroll, alle valideringsgrenser, fysisk mobil, mus-/berøringsdraing, full tastaturrekkefølge og skjermleser er ikke verifisert av Codex. Syntetiske referanser må erstattes av godkjente kilder; automatisk beregnet turneringstid må kontrolleres mot produktregelen og skille planestimat fra faktisk tid. Valgt retning er bekreftet, men ny appskjerm er ikke visuelt godkjent. TN/WANG er ikke endret i denne kombinasjonsrunden; tidligere delingskontrakt og riktige designprosjekter består.
