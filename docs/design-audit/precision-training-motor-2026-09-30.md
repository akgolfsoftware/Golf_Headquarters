# Precision Athletics, Training Motor og kode — kontroll 30.09.2026

**Konklusjon:** Precision er riktig hoveddesign, men funksjonsoverføringen er ikke komplett. Seks av de sju kopierte funksjonskildene finnes som identiske Training Motor-filer; to av kopiene peker på feil aktive versjon. Teknisk plan mangler derfor viktige liste-, prioriterings- og mediefunksjoner. Koden har samtidig flere funksjoner enn den undersøkte Precision-tegningen viser. Ingen appfunksjoner skal fjernes som følge av dette.

## Grunnlag og bevisgrenser

- Precision-prosjekt: `7d7c2994-cf63-4c5f-9bdc-fdaf67655a70`. Training Motor: `4917465a-5671-4e1a-9b89-3c80adada899`. Begge ble lest i brukerens nettleser; kildefiler ble undersøkt fra eksport.
- Precision ZIP-kontrollsum: `c4f028c7ac42c04c8d031a05d140b037706a7fc0c0c70851ef419574fb3cce0e`. Training Motor: `8d9edb9614e4d9785868e968211945acb3d90676e864fecec133fbc2a9c26755`.
- Private originaler ligger under `~/Documents/Claude/akgolf-hq/designanalyse-2026-09-30/`. De inngår ikke i Git. Bilder og eventuelle personopplysninger er ikke kopiert til denne rapporten.
- Kodegrunnlag: Git `110b4ec8f`, siste hentede `origin/main`. Lokal undersøkelse er fil-/kodeanalyse, ingen gjennomføring i innlogget app. 520 sidefiler, 804 komponentfiler og 236 ramme-/tilstandsfiler ble funnet. Dette er ikke 520 unike design eller bevis på ferdig funksjon.
- [Kilderegister](precision-kilderegister-2026-09-30.json) viser lokale scriptavhengigheter, kontrollsummer og statiske skjermregistreringer. [CSV](precision-skjermeierskap-2026-09-30.csv) viser siste *bokstavelig registrerte* definisjon per vert og ID. Generert bundle, delte verter og dynamiske ID-er gir gjentatte rader; tallene skal ikke tolkes som antall aktive appskjermer. Faktisk kjøring og visuell kontroll gjenstår.

## 1. Precision Athletics først

Precision har et sammenhengende visuelt system: grafitt primærhandling, rust som signal, IBM Plex Sans for tekst og Plex Mono for tall, 8 px standardhjørner, lyst standardtema og nattema ute. FYS/TEK/SLAG/SPILL/TURN er kategorier. Visningsreglene følger [designautoriteten](../design-system/design-autoritet.md), og ordene følger [treningsplanlegging](../treningsplanlegging.md).

Den undersøkte navigasjonen er PlayerHQ **I dag · Plan · Stats · Meg**, og AgencyOS **Cockpit · Innboks · Stall · Kalender · Workbench · Mer**. Eldre analysesider og menyer er delvis samlet i disse inngangene. Historiske adresser må beholdes som undersøkte videresendinger når det er nødvendig.

| Funksjonsfamilie | Precision-kilde / inngang | Hva som faktisk finnes i koden | Gjenstående forskjell |
|---|---|---|---|
| År, periode, måned, uke, økt | AG-11 / PH-10 / PH-11, WB3 | `src/lib/workbench/wb-actions.ts`: loadYear, loadPeriod, loadMonth, loadWeek, loadSession; coachvert `src/app/admin/workbench/[playerId]/page.tsx` | Coachvertens Uke/Økt/Målsetninger bruker Precision-komponenter; andre visninger importerer eldre komponenter. Hele reisen er ikke visuelt kontrollert her. |
| Øvelser og planlegging | Workbench og plan-komponentene | createSession, createSessionSeries, addDrillFromSource, reorderDrills, moveSession, removeDrill | Kildekobling, validering og planlagte/faktiske verdier må vises konsekvent i designet. |
| Publisering og spillerens svar | Workbench, «Venter på coach» | wb-actions.publishSessions; `src/lib/workbench/publish-actions.ts`: hentPubliserDiff, publishWorkbenchPlan, acceptWorkbenchPlan, rejectWorkbenchPlan | Planpublisering og øktpublisering er ulike kodeveier. Koble riktig handling; en prototype-toast beviser ingen av dem. |
| Live og vurdering | PH-04–07, AG-13, RD-live | startSession, completeSessionWithEffort, startNextWorkbenchLiveSession, saveWorkbenchLiveSnapshot | Samme økt/data må følge hele flyten; nettbrudd og lagring må vises separat fra fullført/avbrutt. |
| Teknisk plan og oppgaver | AG-10, AG-TP-01/02, PH-TP-01 | `prisma/schema.prisma`: TechnicalPlan, TechnicalPlanPosition, PositionTask; opprette/redigere/slette/sortere i `src/app/portal/tren/teknisk-plan/actions.ts` | Precision viser i undersøkt oppgaveskjema bare ti hovedposisjoner. Koden har mellomposisjoner og numerisk sortering i `src/components/teknisk-plan/constants.ts`. |
| Repmål og repregistrering | RepBars og PH-TP-01 | PositionTaskMaal: motorikk × belastning; PositionTaskLog; logReps; startLiveSessionForTask | Veiledende progresjon, manglende kontekst og korrigering av feil må beholdes. Video ved logg er tegnet, men finnes ikke som eget felt i undersøkt PositionTaskLog. |
| TrackMan-mål og testprotokoll | TargetWindow og HitGrid | PositionTaskTmGoal; createTask skriver mål, intervall, HIT_RATE-protokoll, windowSize, requiredHits og korridor | Designets visning må bruke riktig enhet, sammenligning og protokoll; ikke erstatte dem med fritekst eller fast demo. |
| Før-/ettermedier | AG-TP-02 | PositionTask har én bildeUrl og én videoUrl | Separate daterte før-/etterspor er ikke dokumentert støttet. Tegnet opplasting gir toast; den er ikke en filintegrasjon. |
| Stats og slagdata | PH-16, PH-16b, AG-08/09, AG-22 | `/portal/stats` sender til `/portal/analysere`; tm-hub-data leser SG, runder og TrackMan. Huben bruker fortsatt AnalyseHubTrainLock | Precision samler andre faner og data enn kodehuben. For hvert tall må faktisk datakilde kobles før bygging. Koden bruker intern TALENT-tilgang; synlig navn følger Gratis/Full, ikke endret tilgang. |
| Treningsbelastning | Stats › Trening | `src/lib/training/srpe.ts`: vurdert innsats × serverens øktminutter; manglende grunnlag gir null | Årsbudsjett, belastningskurver og risikoetiketter fra motoren er ikke dermed implementert eller produktvedtatt. |
| Fysisk / turnering | AG-WB-FYS, AG-WB-TURN, PH-WB | Coachvert kobler loadFysTurneringWorkbenchData og de seks eksisterende opprett/flytt/publiser-handlingene | Gjenbruk eksisterende funksjoner; nye symboler og styrketekst følger språk-masteren. |
| Booking, konto, forelder og øvrige flater | Precisions egne skjermfamilier | Ruteinventaret viser booking, konto, forelder og andre flater | Ikke funksjonstestet eller fullstendig feltkartlagt i denne kontrollen. Behold i dekningsregisteret; Training Motor dekker dem ikke. |

Koden underbygger at funksjoner finnes, men en kontroll av hver rolle, lagring og faktisk appvisning er fortsatt nødvendig. Designruter som `/admin/workbench` må kobles til eksisterende vert `/admin/workbench/[playerId]`; en designadresse er ikke automatisk en fungerende appadresse.

## 2. Training Motor deretter

Arbeidsdokumentets `DELER` peker på følgende versjoner. Dette er sterkere versjonsbevis enn filnavnets «v2».

| Rolle | Faktisk fil | Status / behandling |
|---|---|---|
| Treningsmotor | `AK Treningsmotor.dc.html` | Aktiv: år/periode/uke/økt/analyse, akkumulert volum og sRPE. Kopien `Treningsmotor2.html` i Precision er fra `AK Treningsmotor v2.dc.html`, en annen versjon. |
| Teknisk plan | `Teknisk Plan v2.dc.html` | Aktiv: posisjonsliste, mellomposisjoner, prioritet per uketype, strukturerte slagvalg og før-/ettermedier. Precisions `TekniskPlan.html` er den tidligere kortvisningen. |
| Teknisk kortvisning | `Teknisk Plan.dc.html` | Tidligere visning; arkiver etter at brukte funksjoner er sporet. |
| Progresjon | `Teknisk Progresjon.dc.html` | Funksjonsunderlag; rep/logg/milepæl videreføres, gamle progresjonssperrer utgår etter godkjent master. |
| Spilleranalyse | `Spilleranalyse v2.dc.html` | Aktiv; identisk kildekopi finnes i Precision. |
| Første analyse | `Spilleranalyse.dc.html` | Historisk sammenligning. |
| Formel / systemkart | `AK-formelen.dc.html`, `AK Systemkart.dc.html` | Fag-/funksjonsunderlag. Systemkartkopien er identisk; `Formelen.html` kan ikke identifiseres som identisk kopi av en Training-fil. Bruk godkjent språk-master ved konflikt. |
| Masterutforsker | `AK Masterutforsker.dc.html` | Arbeidsdokumentet merker den «Arkiv» og «Ikke oppdatert». Skal ikke være aktiv appinngang. |

De ti plan-komponentene i Precision er allerede på plass: SwingTimeline, FormulaCode, RepBars, TargetWindow, HitGrid, DevelopmentPyramid, SignedBars, NormBars, ZoneGauge og PhaseTrack. En komponent eller kildekopi er ikke bevis på at alle kildefunksjonene er overført.

## 3. Konkret overføring som fortsatt trengs

| Behov | Tegnes i Precision | Kontroll mot kode |
|---|---|---|
| P-liste med mellomposisjoner | AG-10 + AG-TP-01; tomme posisjoner, åpne/lukk og tilgjengelig sortering | Eksisterende P-konstanter og sortering kan gjenbrukes. Ikke begrens til ti hoved-P fordi tegningen gjør det. |
| Prioritet per uketype | Separate oppgavelister for Treningsuke, Utviklingsuke, Prestasjons-/turneringsuke; «Ikke med» bevarer oppgaven | PositionTask.sortOrder er global innen posisjonen. Egen ukeprioritet/utvelgelse mangler i undersøkt modell. |
| Strukturert slagbeskrivelse | Kølle, starthøyde/toppunkt, skru/startretning; putting uten høyde/skru | slagNavn er fritekst. Modell og undersøkt createTask tilbyr ikke strukturerte høyde-/skru-felt. |
| Før og etter | Bilde/video per spor, dato, bytt/erstatt/fjern og brukbar sammenligning | Krever konkret mediemodell og sikker filhandling; eksisterende enkelt-URL-er er ikke et par. Ingen databaseskriving er utført her. |
| Progresjon til faktisk trening | Repmatrise, ukemål, milepæl, siste registrering og øktkobling | Bevar logg som kilde, veiledning uten sperrer, og eksisterende task-ID ved innsetting i økt. |
| Aktuell motorversjon | Akkumulert årsmål/faktisk, periodebudsjett og ukevalg i Workbench; årstall/dato fra data | Årsmål og terskler skal være data/avklart regel, aldri demoens faste 1250 timer eller dato. |
| Analyse → tiltak | Stats/Spiller 360 viser grunnlag og gir coach tiltaksutkast i Workbench | SG, kategori A–K, tester, TrackMan og Tiger 5 trenger egne datakoblinger; ingen automatisk publisering eller oppdiktet medisinsk konklusjon. |

ACWR-/skaderisikoetiketter og TrackMan-årsaksforklaringer i kladden er ikke dokumenterte faglige vedtak. De kan ikke kopieres som autoritative anbefalinger. Rapporten vurderer ikke slike påstander medisinsk.

## 4. Opprydding og skillkvalitet

AK HQ Design er riktig prosjektspesifikke arbeidsmåte. Før kontrollen var hovedfilen stort sett oppdatert, men underfilene inneholdt utgått Team Norway Claw, blank v0.1-start og en fjernet arbeidsliste. Disse er rettet i v7, den aktive henvisningen til en historisk Train-lock-prompt er erstattet, og originalene bevart i [arkivet](../arkiv/designkonsolidering-2026-09-30/README.md). Aktiv inngang er nå Precision, gjeldende språk-master og konkret Grok-kontrakt.

I designeksporten finnes doble registreringer, også i generert `_ds_bundle.js`. AgencyOS laster `AG-mer.jsx` før `AG-23.jsx`/`AG-24.jsx`, slik at siste definisjon ikke nødvendigvis er nyeste avklarte variant. PlayerHQ laster eldre filer før nye Stats/Live/WB3-varianter. Flytting krever kontroll av faktisk kjørt variant og brukte hjelpefunksjoner. Det statiske kilderegisteret er en kandidatliste, ikke en automatisk sletteliste.

Repoets utgående innganger/rundeplaner er erstattet med korte henvisninger; tidligere versjoner er bevart. Gamle tekniske designmapper beholdes der kode og skript fortsatt bruker dem. De har ingen visuell autoritet. Det ville være uforsvarlig å flytte dem blindt og bryte eksisterende funksjoner.

## 5. Hva som er kontrollert, og hva som gjenstår

Utført: kildeidentitet, aktiv filutvelgelse, identiske kopier, statisk scriptrekkefølge, relevante modeller/kodehandlinger, ferskt ruteinventar og retting av skillens motstridende føringer. Prosjekt-/lenkekontroll rapporteres i leveransens kontrollstatus.

Claude Design rapporterte runde 35 med 96 bredde-/tilstandstilfeller og 288 treffmål-/inngangstilfeller. PH-10 ved 1024 px ble rettet; resten av appen var ikke kontrollert etter den delte komponentendringen. Dette er **Claude Designs rapport**, ikke en egen måling eller Anders' visuelle godkjenning.

Gjenstår: utføre [den konkrete konsolideringen i Claude Design](../design-system/claude-design-konsolidering-2026-09-30.md), kontrollere endrede skjermflyter, fullstendig rute/feltkobling, Anders' konkrete skjermvalg og deretter fungerende app mot [Grok Build-kontrakten](../design-system/grok-build-overlevering.md). Denne rapporten er ikke en ferdig, godkjent designpakke.
