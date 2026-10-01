# Kontroll av koblingsgrunnlaget — 01.10.2026

Bestilling: klargjøre design, lagring og brukerreiser mens Claude Design fullfører designet. Arbeidsgren `codex/design-data-journeys-2026-10-01`, utgangspunkt `c8e97c66be98e09c6707381f17cefbcdc8451ddb`. [Koblingsgrunnlaget](../planer/design-lagring-brukerreiser-2026-10-01.md) beskriver overlevering og rester.

## Påviste feil og rettinger

| Før | Etter | Bevis |
|---|---|---|
| `getAllTodaysSessions` og `getTodaysSession` hentet bare V2, selv om Plan også viste Workbench og eldre planøkter | I dag gjenbruker den samme ukeleseren, filtrert til riktig Oslo-dag; samme identiteter, rekkefølge og publiseringsfilter | Lagringsprøven feilet først på manglende dagsøkt, består etter retting. Enhetstest prøver alle tre modeller og feil dag |
| `completeSessionWithEffort` kunne fullføre utkast og overskrive ferdige innsatsdata ved gjentatt innsending | Samme gyldige startstatuser som vanlig fullføring, historikk beholdes ved gjentakelse og samtidig endring avvises med `updatedAt` | To faktiske lokale lagringsprøver feilet før retting og består etterpå; enhetstest prøver status, eierskap og kollisjon |
| `loadNesteOkt` søkte bare V2 og eldre planøkter | Workbench er med i samme tidsordnede kandidatvalg; bare synlig, godkjent publisering og korrekt Oslo-tid | Egen lagringsprøve feilet først på feil lenke, består etter retting; skjult, ubesvart, avvist og trukket tilbake gir ingen kandidat |

Dette endrer ikke databaseskjema, rolle-/samtykkeregler eller produksjonsoppsett. Eksisterende modeller og eierskapsspørringer beholdes.

## Lagringsprøver

`node scripts/local-users-run.mjs journeys`: **13 bestått, 0 feil, 0 utelatt** etter rettingene.

- Coachutkast har samme økt-/øvelse-ID og er skjult i spillerens I dag/Plan.
- Faktiske coachomfang avviser fremmed trener/spiller uten radendring.
- Utkast kan ikke fullføres gjennom innsats-skjemaet.
- Publisering med fremmed økt ruller hele utvalget tilbake.
- Publisert økt vises én gang i I dag/Plan og løses som samme Workbench-økt i Live.
- Live-teller, tid og serievalg overlever ny databaseavlesning.
- Feil øvelses-ID avvises uten overskriving.
- Faktisk innsats lagres; ukeoversikten bruker uttrykkelig planlagte minutter.
- Gjentatt fullføring bevarer innsats og oppdateringstid, og avsluttet økt kan ikke gjenåpnes her.
- Tilbaketrekking fjerner spillerens lesing uten å slette coachutkastet.
- Neste-økt-lenken respekterer publisering/synlighet og Oslo-tid.
- Uke over årsskiftet beholder dato/identitet.
- Slagtelling er absolutt og lagres én gang per nøkkel; oppsummeringen leser sluttelling 17 etter et forsinket forsøk med 99.

Bare forespørselsidentiteten og Next sin cache erstattes i disse serverprøvene. Appens faktiske Prisma-klient, PostgreSQL, domenefunksjoner og eierskapsspørringer brukes. Dette er ikke bevis for nettleserinnlogging, samtykkevakt, visuell samsvar eller produksjon. Testen kontrollerer databaseidentitet før skriving og rydder kun sine egne syntetiske økter/tellinger.

## Kildekart og kontrollgrenser

[Sporingskartet](design-data-journey-map-2026-10-01.json) registrerer 2 765 runtime-kildemoduler, 520 sidefiler, 70 API-ruter og 171 moduler med eksporterte serverhandlinger. Det inkluderer overordnede layout-importer og viser navngitte Prisma-operasjoner. Hver rute står som ikke kontrollert som hel reise, og konkret designreferanse er ennå ikke koblet.

Kartet er generert fra faktisk kode. Det gamle inventarets tall kan ikke brukes som ferske tall: denne kartleggingen oppdager blant annet `use server` etter lange modulkommentarer. Antall filer eller importkoblinger er aldri antall ferdige funksjoner. SQL, Storage, eksterne tjenester, beregnede databasekall og faktisk knappbinding trenger manuell kontroll. Kartets filavtrykk og `--check` avslører kodeendringer etter genereringen.

## Øvrige kontroller

`node scripts/local-users-run.mjs users`: **26 bestått, 0 feil, 0 utelatt**, Chromium desktop 1440 px og mobil 390 px. To av prøvene følger ekte nettleserinnlogging, coachutkast, publisering, spillerens I dag, start, tre slag, ny innlasting, avslutning og oppsummering etter ny innlasting. Databasen bekrefter samme økt-ID, sluttstatus og én rad per kølle; køller uten slag kan ha nullrad. De øvrige 24 kontrollerer eksisterende innlogging, roller, gruppetilgang, fremmed spiller, treneromfang, foresatt, samtykkeventerom og lokale kode-/lenkeflyter.

Testforventningene ble rettet for forsinket cookie-banner, skjult desktop-kopi på mobil og nullrader per kølle. Ingen appvakt eller skjerm ble endret for å få prøven grønn.

Fra I dag åpner nettleserprøven øktens brief med den lagrede ID-en direkte. Den beviser data-/ruteflyten og handlingene videre derfra, men erstatter ikke kontrollen av hver kortknapp mot ferdig valgt design.

Målrettede enhetsprøver: **13 bestått**. Lokal mål-/port-/outputkontroll: **20 bestått**. Lint på berørte filer: **0 feil, 0 advarsler**. Dokumentkontroll: **bestått, 178 dokumenter**. Sporingskartets `--check`: **bestått**.

Samlet `node scripts/local-users-run.mjs verify` → uendret `npm run verify`: **bestått, avsluttet med kode 0**. Prisma-validering/-generering, typekontroll, lint, statiske sikkerhets-/dokumentkontroller, **3 818 enhetsprøver + 14 komponentprøver**, Next-produksjonsbygg og Serwist er gjennomført på denne diffen. Ingen prøve feilet eller ble utelatt. Dev-serveren var stoppet før generering/bygging. Den første frittstående typekontrollen uten prosjektets minnegrense gikk tom for minne; den autoriserte lokale kjøreren bruker samme 5 GB-grense som CI, og både samlet kontroll og bygg består.

Dette er lokale resultater. Ingen GitHub CI, apppublisering eller ny visuell godkjenning er gjennomført i denne arbeidsrunden.

## Sikkerhet og personvern i denne diffen

1. Fremmed spiller og trener avvises i de faktiske eierskapsspørringene uten radendring. Dagsleseren gjenbruker den tilgangsvoktede ukeleseren. Neste-økt-leseren er server-only og kalles med innlogget brukers ID. Innsats-fullføringen beholder eksisterende eierskap og krever gyldig synlig status.
2. Nye prøver bruker bare syntetiske personer og egne økt-ID-er. Kartgeneratoren leser kildefiler og skjema, ingen database eller miljøfiler. Private runtime-/brukerfiler er ignorerte; ingen verdier er lagt i diffen. Nettleseren sperrer eksterne mål, og eksisterende outputfilter brukes.
3. Samtykke- og sidevaktene er beholdt. Syntetisk spiller uten foreldresamtykke blir i venterommet på begge bredder. Ingen ny offentlig personvisning, eksport eller sletting innføres; kjente hull i de siste to områdene står fortsatt som rest.

## Neste kontrollhull

Ferdig designversjon og knappbinding, teknisk kilde/revisjon → resultat, FYS-dose, gruppepublisering, offline/eierskifte, samtidige redigeringer, full analyse, booking/betaling, samtykke/eksport/sletting, organisasjoner og AI-godkjenning står fortsatt åpne. Kilderegistreringen dekker inngangene til alle områder; den gjør ikke disse reisene ferdige.

Konkrete neste lesere: `getRecentActivity`, `getStatsSnapshot`, `getKpiStats` og `getTrainingHeatmap` i `src/app/portal/actions.ts` har fortsatt V2-baserte deler. De må prøves mot gjennomført Workbench-økt og riktig skjerm før tallene kan erklæres sammenhengende. Denne runden retter dags-/ukevisning og neste-økt-kjeden; den hevder ikke at hele analysekjeden er dekket.
