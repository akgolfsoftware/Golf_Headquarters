# Helhetsanalyse: Treningsplanlegging i AK Golf HQ

Endelig syntese av kartlegging (spec, kode, metodikk), fem designlinser (coach, spiller, datamodell, analyse, revolusjon) og tre kritikere (beslutninger, enkelhet, hull). 20.08.2026.

---

## 1. Konseptet i ett bilde

Alt i konseptet hviler på én idé: **hver eneste treningshandling får en adresse.** AK-formelen — pyramide, område (17-listen), motorikk, belastning, press — settes på hver enkelt drill, øvelse og test, ikke på økta. Dermed blir hver logget rep en rad som kan telles og krysses på fem akser, med to verdisett: planlagt og faktisk.

Rundt denne kjernen ligger fire deler som sammen utgjør ETT system:

**Planhierarkiet** gir repen sin plass i tid: Årsplan → Periodeplan (8 merkelapper som GRUNNPERIODE) → Treningsblokk (ukene mellom to turneringer) → Uke → Dag → Økt. Alt kan lages fra mal eller blanke ark, med tre malnivåer: øktmal (alt ferdig), ukemal (økter uten låste dager), periodemal (kun antall økter per pyramide — skallet fylles senere).

**Teknisk utviklingsplan** gir repen sin hensikt: slag → P-posisjon (P1.0–P10.0, MORAD) → arbeidsoppgave med video og rep-mål per motorikk-trinn. Når spilleren logger en drill koblet til en oppgave, teller repsene automatisk mot målet (300/1000 UTEN_BALL) — coach ser innsats uten å åpne en eneste økt.

**Live-økta** er fangstpunktet: «Start økten» → automatisk timer per øvelse, reps med +5/+10/+25, automatisk pause-timer, bilde/video/talenotat, vurdering FOKUS/GJENNOMFØRING/MESTRING til slutt. Det er her plan blir til faktisk — og der TrackMan-slag kan merkes med drillens fulle kontekst.

**Analysen** er utbyttet: fordi alt er merket med samme formel, kan all trening summeres og krysses på enhver akse — treningsmiks, plan mot gjennomført, press-eksponering før turnering, teknisk fremdrift. Målsetninger (resultat og prosess) måles automatisk fra samme datastrøm.

Sløyfen er: planlegg med adresse → gjennomfør og logg med ett tommeltrykk → se speilet → juster planen. Ingen regler håndheves noe sted (18.08-beslutningen) — systemet beskriver, coachen vurderer, spilleren bestemmer.

## 2. Vurdering av logikken

**Det som henger godt sammen:**

- Formelen per drill + live-logging + analyse er en lukket kjede der hvert ledd gir det neste verdi. Ingenting er pyntedata — hver akse har en konkret analysebruk.
- Overraskende mye finnes allerede i koden: live-økt komplett, automatisk rep-telling fra økt til teknisk plan (positionTaskId → applyPositionTaskReps), teknisk plan-familien, årsplan-tidslinjen, målmodellen. v1 er mer sammenkobling og kutt enn nybygg.
- Godkjenningsflyten er riktig dimensjonert: kun spillers komplette årsplan krever coach-blikk, øktnivået er alltid fritt.
- Malnivåene treffer Anders' tre coach-modi presist: øktmal for 1:1-dybde, ukemal for WANG-rytmen, periodemal for grovplanlegging.

**Det som skurrer:**

- **Fire parallelle øktsystemer i databasen** med dobbeltskriving. Hver ny funksjon må i praksis skrives flere ganger, og synk-feil viser seg for spilleren som «repsene mine forsvant». Dette er den ene tingen som må ryddes før noe annet bygges.
- **Databasen snakker fortsatt v1** (L-faser, M0–M5, CS, PR1–PR5) mens fasiten krever v2. Belastning-aksen finnes ikke som felt noe sted, og område er fri tekst — én skrivefeil gir én falsk kategori i analysen.
- **Blandet økt er udefinert:** når formelen flyttes til drillen, mangler regelen for hvordan en økt med både TEK- og PUTT-driller telles mot periodemalens «antall økter per pyramide».
- **Ukemerkene UTVIKLING/FORBEREDELSER/KONKURRANSE finnes ikke i noen fasit-dokumenter.** De må inn i FASIT-AK-GOLF-HQ.md eller erstattes før de fryses i skjema.
- **Registreringsbyrden er konseptets akilleshæl:** fem akser × 5–8 driller per økt er 40–60 skjemavalg hvis noen må taste dem. Formelen må arves fra maler og øvelsesbank — spilleren skal aldri se ordet «belastning».
- **Seks plannivåer er tre for mange i daglig bruk.** En 16-åring trenger dagens økt og en ukevisning; coach trenger tidslinje, perioder og kalender. Uke og dag bør være visninger av øktdatoen, aldri egne objekter.

## 3. Anbefalt konseptuell arkitektur

**Grunnmur (gjenbruk med opprydding):** Gjør V2-løpet kanonisk — Økt → Innslag → InnslagLogg (dagens TrainingSessionV2/TrainingDrillV2/DrillLogV2). Frys skriving til de tre andre familiene og fjern dobbeltskrivingen som første steg. Nye v2-felter på innslaget: motorikk, belastning (nytt), press, typet område fra 17-listen. Innslaget får ett typefelt: DRILL / ØVELSE / TEST / TEKNISK_OPPGAVE med valgfrie koblinger til øvelsesbank, testprotokoll og arbeidsoppgave — én tabell gjør live-feed, analyse og plan-mot-faktisk lik for alle fire.

**Hierarkiet:** Fire lagringsnivåer, to beregnede. Gjenbruk SeasonPlan (årsplan) og PeriodBlock (periode). Treningsblokk er det eneste ekte nye — en rad forankret i turneringer, men den kan vente til merkene er avklart. Uke og dag beregnes alltid fra øktas dato via uke-helpers (Oslo-korrekt) — aldri egne rader, så flytting av en økt er én skriving. Blandet økt løses med avledet dominant akse: økta telles på pyramiden med mest planlagt tid; en valgfri økt-merkelapp overstyrer når hele økta er lik.

**Teknisk plan:** Behold hele familien (TechnicalPlan → Position → PositionTask). Døp rep-trinnene om fra DRY/LAV/FULL til UTEN_BALL/LAV_HAST/AUTO — ren omdøping, tellingen finnes. Slag-nivået over P-posisjonen bygges som visningsinngang først; typet felt kan vente. Oppgavebank (forfatt én gang, tildel mange) kommer i v1.5 — nødvendig før stallen skaleres, ikke for de fire akademispillerne.

**Live-økt:** Gjenbruk dagens fullskjerm-flyt. Nytt: pausetid-felt, HOPPET_OVER-status, tre vurderingsfelter (hoppbare) på øktloggen, generalisert notatmodell (bilde/video/tekst/talenotat med «lest av coach» og kobling til teknisk plan), og TrackMan-nøkkelen (session-/slag-id per innslag) lagret stille fra dag én.

**Maler:** v1 = øktmal (erstatt den døde OktMal-koden) + «kopier forrige uke/blokk» som én handling — det dekker 80 prosent av gjenbruket. Ukemal i v1.1, periodemal med skall-økter og fyll-senere-kø i v1.5. Malmodellen holdes bevisst adskilt fra AI-motoren i PlanTemplate — v1 er 100 prosent manuell.

**Analyse:** To faste kort i v1: Treningsmiksen (pyramide × område, plan ved siden av faktisk) og P-progresjonen (300/1000-barene, live-oppdatert). Aldri en pivot-utforsker — hvert kort svarer på ett spørsmål med maks én handling.

## 4. Det revolusjonerende

I prioritert rekkefølge:

1. **Merket slag-data — verdens eneste golfdatasett der hvert slag vet hvorfor det ble slått.** TrackMan vet hva ballen gjorde, aldri i hvilken drill, under hvilket press, på hvilket motorikk-trinn. Kobles hvert slag til drillens formel og tekniske intensjon, oppstår datasettet AI Coach mot 10M USD ARR skal bygges på — og TrackMan selv kan aldri lage det uten planleggingslaget. Datamodellen ER produktet; v1s viktigste jobb er at hver rep og hvert slag fødes med riktig, typet kontekst.

2. **Teknikk-telleverket.** Teknikkendring er golfens mest umålbare prosess. P-posisjonsfremdrift med automatisk rep-telling gjør den til fremdriftslinjer coach ser uten å åpne økter — og til spillerens XP-bar i live-økta. Ingen konkurrent kan svare på «hvor langt er spilleren i P4-endringen». 80 prosent av grunnmuren finnes i koden.

3. **Etterlevelse per akse — TrainingPeaks-disiplin golf aldri har hatt.** «Du planla 40 prosent TEK på CHIP, du gjorde 22» — per drill, ikke per økt. Pluss overføringsanalysen: gapet mellom ALENE/TRENINGSOMRÅDE og KONKURRANSE/BANE som tall, ikke magefølelse. Dette selger v1 uten AI.

4. **Turneringsblokka som planleggingsenhet.** TrainingPeaks tenker generiske uker; golf tenker «neste turnering». Ingen konkurrent bruker golfens naturlige tidsenhet som førsteklasses begrep.

5. **Frihet med speil — posisjoneringen.** Konkurrentene er enten rigide (TrainingPeaks) eller strukturløse (CoachNow/Skillest). Ingen regler, ingen sperrer, men et ærlig beskrivende speil — treffer elitespillere som eier egen prosess.

Ingen konkurrent har noen av de fire første enkeltvis; kombinasjonen på én delt taksonomi finnes ikke i markedet. I praksis planlegges elitegolf i dag i Notion og regneark.

## 5. Forenklinger og fasering for v1

Anbefalingen er tydelig: **v1 er sammenkobling og kutt, ikke nybygg.** Suksesskriteriet er at coach og en 16-åring bruker det daglig i én hel treningsblokk.

**Må med fra dag én (v1):**
1. V2-øktmodellen kanonisk, dobbeltskriving fjernet, v2-vokabular og typet 17-område i databasen, nytt belastningsfelt
2. Tre plannivåer: årsplan, periode, økt — uke og dag som beregnede visninger
3. Kalender: uke (mobil-standard), måned (desktop), eksisterende årsplan-tidslinje med test-/samlingsmarkører
4. Øktmal + «kopier forrige uke/blokk»
5. Live-økt-kjernen: start, timere, +5/+10/+25 med angre, hopp over, spontan drill (to-trykks minimum: pyramide + område, resten arves), oppsummeringskort, hoppbar vurdering — og **offline for selve live-flyten**
6. Teknisk plan med 1–3 aktive oppgaver løftet frem + eksisterende auto-telling, med 300/1000-baren synlig live i drill-kortet
7. To analysekort: Treningsmiksen og P-progresjonen
8. TrackMan-nøkkelen lagret stille per innslag
9. «Sett av coach»-kvitteringen tilbake til spilleren — én boolean som lukker motivasjonsloopen

**Kan vente:**
- **v1.1:** talenotat med transkripsjon, ukemal, hurtigsvar fra stall-innboksen
- **v1.5:** treningsblokk (etter merke-avklaring), periodemal med skall-økter og fyll-senere-kø, oppgavebank for teknisk plan, gruppe-utvifting med den bevisst enkle regelen (propagerer til spilleren rører sin kopi — da løsrives den permanent)
- **v2:** AI/Caddie, resten av analysekortene (pressetrapp, test-mot-trening, blokkrapport, øktkvalitet-trend), 3-dagersvisning og øvrige tidslinjer, akse-filter for automatiske prosessmål, mal-deling og versjonering

Kutt helt: 3-dagersvisningen (uke på mobil dekker det), obligatorisk sted/fasilitet (valgfritt med default fra forrige økt), felt-diff i godkjenningskøen.

## 6. Risikoer

1. **Datagrunnlag-forurensning.** Bygges logging oppå fire parallelle familier og v1-enums, arver AI-laget flere sannheter, og vaskejobben vokser for hver økt. *Mottrekk:* konsolidering og v2-vokabular i skjema FØR loggingsvolum; enum-mapping besluttes eksplisitt av Anders før migrering.

2. **Registreringsbyrden dreper vollgraven.** Slutter en 16-åring å logge etter tre uker, er analyselaget og Truth Layer tomt. *Mottrekk:* formelen arves alltid som defaults; maks tre trykk per drill i live-flyt; offline-først; etterregistrering på under 60 sekunder; mestringsbaren live i økta.

3. **Kompleksitet mot Paper-prinsippet.** Seks nivåer, fem akser og åtte kalenderflater blir Notion-kaos, ikke Claude-enkelhet. *Mottrekk:* tre nivåer i v1, to kalendervisninger pluss én tidslinje, faste analysekort — og skjermbilde-gaten på 390px per skjerm.

4. **Regler sniker seg tilbake via UI-språket.** Rød/grønn etterlevelse, «maks to oppgaver»-sperre eller automatiske metodikk-hint bryter 18.08-beslutningen selv uten kode-sperre. *Mottrekk:* all avviksvisning beskrivende («planlagt 4, gjennomført 2»), binær prioritetsfarge, ingen automatiske forslag uten ny beslutning.

5. **Sync- og tellefeil spiser tillit.** «Repsene mine forsvant» og en teller som drifter fra loggene er stille tillitsdrepere. *Mottrekk:* loggene er alltid fasit, telleren avledet cache med rekalkulering ved enhver redigering; siste lokale logg vinner ved offline-synk.

6. **Coach-taushet bryter loopen.** Uten reell respons lærer spilleren at logging ikke betyr noe. *Mottrekk:* stall-innboks som enkel kronologisk liste med «merk alle som sett», og «Sett av coach» tilbake til spilleren — pluss en faktisk arbeidsrutine hos coach.

7. **Gruppe-synk blir et kalenderproblem.** Propagering med lokal overstyring er notorisk vanskelig. *Mottrekk:* den dumme v1-regelen (løsrivelse ved første endring), aldri delvis fletting.

8. **Liten N for AI-løftet.** 4 + 11 spillere gir dyp per-spiller-data, tynt tverrsnitt. *Mottrekk:* mal-IP og klubbdistribusjon inn i strategien tidlig — malene er både coach-verktøy og lisensierbar AK-metodikk.

## 7. Åpne spørsmål til Anders

Prioritert, med foreslått default:

1. **Ukemerkene UTVIKLING/FORBEREDELSER/KONKURRANSE finnes ikke i fasiten — skal de inn, eller brukes BYGG/TOPP/DELOAD?** *Default: legg de tre inn i FASIT-AK-GOLF-HQ.md — de er turneringsforankret og passer blokk-konseptet. Skrives inn i fasiten FØR skjemaendring.*

2. **Mapping av historiske data: M0–M5 til fire belastningsverdier, og hva skjer med CS?** *Default: M0/M1 → INNENDØRS, M2/M3 → TRENINGSOMRÅDE, M4 → BANE, M5 → KONKURRANSE; DRY/LAV/FULL → UTEN_BALL/LAV_HAST/AUTO 1:1; CS arkiveres som historisk lesefelt uten arvtaker.*

3. **Blandet økt: er avledet dominant akse (mest planlagt tid vinner) riktig regel for pyramide-telling?** *Default: ja, med valgfri økt-merkelapp som overstyring.*

4. **Fargekoden i teknisk plan: binær (farget = prioritert denne uka, grå = ikke)?** *Default: ja — én betydning, to tilstander, følger oppgaven fra teknisk plan til drill-kortet.*

5. **Nådd rep-mål: feiringskort alene, eller også forslag om neste motorikk-trinn?** *Default: feiringskort i v1 (ren beskrivelse). Neste-trinn-forslag er et anbefalings-hint av typen 18.08 fjernet — krever din eksplisitte beslutning før det bygges.*

6. **Planlegges reps per motorikk-trinn per økt, eller kun logges mot totalmål?** *Default: kun mot totalmål — auto-tellingen finnes, og per-økt-planlegging av trinn er unødvendig friksjon.*

7. **Er «maks 15 oppgaver per P» hard grense eller veiledning?** *Default: veiledning — mykt hint ved 15+, aldri sperre. UI-et som kun løfter frem 1–3 aktive løser det reelle problemet.*

8. **Vurderingen FOKUS/GJENNOMFØRING/MESTRING: hoppbar?** *Default: ja — manglende svar lagres som tomt, aldri som 3, og analysen viser svarandel ved siden av snittet.*

9. **Godkjenning: bekreft at den kun er en status-merkelapp — spilleren kan planlegge, trene og logge uavbrutt mens årsplanen venter?** *Default: ja, og re-godkjenning utløses kun av endringer på periode-/blokknivå.*

10. **FYS: samme økt- og innslagsmodell som golf, med egen logger-variant (sett × reps × vekt)?** *Default: ja — én verden for kalender, periodemal og analyse; aldri to øktfamilier.*
