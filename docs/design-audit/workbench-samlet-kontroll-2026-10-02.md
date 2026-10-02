# Samlet Workbench — kode, kilde og kontroll

Arbeidsgren: `codex/workbench-samlet-2026-10-02`. Bestilling: [arbeidslisten med 82 oppgaver](../planer/workbench-fullforing-2026-10-02.json). Dette dokumentet beskriver faktisk deldekning; det er ikke en erklæring om at Excel eller alle trenerflater kan avvikles.

## Kilde og omfang

Gjeldende system er [Precision Athletics](../design-system/design-autoritet.md); språk, tall og treningsregler kommer fra [treningsplanlegging](../treningsplanlegging.md). Valgt eksport er `AK Golf Precision Athletics (77).zip`, SHA-256 `9ded841b0f8696697534eb13dae882b3783d351014dae3a92e6e2bba4f042f07`. Den inneholder `ui_kits/workbench-samlet/` med Sesongkart, Ukeverksted, Trenerbord og den historisk navngitte analyseflaten. Synlig navn i appen er **Stats** etter språk-masteren; `flate=analyse` er teknisk URL-verdi.

Kildepakken ligger privat under `Documents/Claude/akgolf-hq/workbench-code-2026-10-02/`. Første lokale referansekopi manglet de importerte `tokens/`- og `components/`-stilfilene; de første private `design-*.png` viser derfor ikke en gyldig stilgjengivelse. Åtte originale stilfiler er hentet uendret fra samme kontrollerte ZIP. Nye `design-77-styled-{uke,sesong,bord,analyse}-{390,1440}.png` er tatt med CUA ved 390 × 844 og 1440 × 900. Ingen ny designversjon er valgt gjennom denne rettingen.

Grunnlaget fra PR1082 er allerede merget og produksjonsdeploy `6799533729` har bekreftet success 02.10 kl. 02:02 UTC. Ukeplanens nullable JSONB-kolonne ble lagt til i riktig produksjonsbase; RLS var aktiv og ingen spillerdata ble omskrevet. Denne grenen har dessuten tatt inn spillerens IUP-reise fra PR1084, tallfontrettingen fra PR1085 og testbatteriberegningene fra PR1086, ved main `c76f4e83f`.

## Faktiske kjeder

| Del | Implementert kjede | Avgrensning |
|---|---|---|
| Fire visninger | Begge beskyttede Workbench-ruter → `loadWorkbenchSamletData` → felles DTO → fire egne komponenter | Samme spiller, dato, uke, planår, måned, periode og økt følger navigasjonen. Spillerbytte rydder bort den andre spillerens periode-/økt-ID |
| Trenerbord | Eksisterende coach-scope → avgrenset spillerliste → samme `loadWeek` per spiller, høyst fire samtidige lesere | Spillerflaten har bare egen rad; en skjult knapp er ikke tilgangskontrollen |
| Plan og perioder | Valgt årsplan-ID → eierkontroll → faktisk datointervall → eksisterende periodehandling | Sesonggrenser har samtidighetsvakt og avvises når eksisterende perioder havner utenfor |
| Uke og øvelse | Én eksisterende `useUkeMotor` → AG11-ark → faktiske serverhandlinger | Redigering beholder øvelse-ID-er og andre øvelser; rå mal-/tidligere-øktkopi får nye ID-er uten å flytte logger |
| Treningsvolum | Workbench + eldre modeller → felles deduplisert summering → alle fire flater | Planlagt, registrert 0, ukjent, framtid og anslått eldre klokketid holdes atskilt. Klientens ukemotor erstatter ikke dette grunnlaget |
| Stats | Eier og valgt datovindu → brutto runder, tester, TrackMan og samlet volum | SG per runde beholder kilde og hullantall. Aggregert SG blir ikke beregnet uten dokumentert felles referanse; 9 hull blir ikke stille 18 |
| Live | Eksplisitt økt-ID → faktisk tilgang → synlig godkjent gjennomføringsøkt | Fremmed, skjult, utkast, ubesvart og mal avvises. Start/fullføring oppdaterer valgt ID; uendret URL henter bekreftet status på nytt |
| Min kalender | Spillerens egen ID → egen uke og bookinger → portallenker | Coachkalenderens lenker åpner riktig spiller; annen spillers periode-ID følger ikke med. Kalender-/planår følger valgt kontekst også over ISO-årsskifte |
| Innsyn og vask | Kontoens eksisterende vakt → egne Workbench-rader og avgrensede barn → eksport/anonymisering | Ingen andre medlemmers kopier eller gruppeoriginal via samme trener/gruppe. Tall og validerte fagkoder/dose beholdes; fritekst og ugjennomsiktig JSON vaskes |

## Målrettet kontroll før samlet gate

- Samlet dataleser, datoavgrensning og sesonggrenser: 55 målrettede prøver grønne i UTC og Oslo. Valgt årsplan ved periodeoppretting har egne positive/negative prøver.
- Øvelsesredigering og kopibevaring: fem prøver mot ekte separat lokal Postgres/Auth samt faktiske komponentprøver grønne.
- Live-valg og egen kalender: fire prøver med ekte lokal innlogging/database grønne, inkludert avvist fremmed/skjult/utkast/ubekreftet/mal. Direkte start/neste-handlinger avviser også mal uten å endre lagret status; siste fire lokale DB/Auth-prøver er grønne.
- Live-handlingenes navigasjon: åtte faktiske komponentprøver grønne for spiller- og trenersti, valgt ID, uendret URL, kalenderkontekst og feilrespons. Live/Min-kontekst: ti prøver grønne i UTC og Oslo.
- Personvern: 44 målrettede handling-/enhetstester og tre ekte lokale databaseprøver grønne. Eier, barn, gruppe-master/kopi, null/0/dose, tørrkjøring, feil/gjenforsøk og idempotens er kontrollert. Ekte ekstern sletting er erstattet av testdobler.
- Fire visninger og ukeplanark er prøvd for trener/spiller på 390 og 1440. En lokal videresending etter innlogging feilet én gang; målrettet ny prøve var grønn med ekte Auth-innlogging og uendrede appvakter. Korrekt autentisering blir bekreftet før beskyttet Workbench åpnes.

Lokal prosjektidentitet er `ak-hq-workbench-20261002`; DB `127.0.0.1:55722`, Auth `55729`, API `55721`, app `3072`. Runneren kontrollerer prosjektidentitet, Docker-bindinger og loopbackmål, renser arvet miljø og skjermer lokale hemmeligheter. Bare syntetiske data er brukt. Den opprinnelige arbeidskopien og produksjonsmiljøfilene er bevart.

## Pågående og åpne avvik

Mobilkalenderen viser kalender/dagvalg først, kompakt kontekst og bibliotek/detaljer i ark. Faktisk kontroll fant og rettet to feil: samtidige desktopøkter utvidet timeraden, og PlayerHQ-menyen dekket Workbench-menyen. Desktop har nå fast tidsakse og separate overlappspor; spillerens Workbench-meny plasseres over den eksisterende hovedmenyen. 11 komponentprøver i UTC/Oslo er grønne. Ferske trenerreiser på 390/1440 er grønne; lokal spillerinnlogging undersøkes fordi dispatcheren returnerte til innlogging selv etter Auth-token200. Dette skjules ikke med en omgått vakt.

Øvelsesfeltene er implementert og målrettet kontrollert: utstyr med valgfritt antall, banespillets oppgaver, kondisjonssegmenter og ny RIR-grense0–4. Historisk RIR5–10 bevares ved urelatert redigering. Konkrete bank-/oppgavekoblinger følger øvelsen gjennom oppretting, serie, gruppeoriginal og medlemskopi med eierkontroll. Uendrede rå listeposter bevarer ukjente historiske nøkler; en bevisst listeendring eller tømming erstatter listen. Feltpakken har34 domenetester,5 komponentprøver og4 ekte DB/Auth-prøver grønne. Bankpakken har23 enhetstester og5 ekte DB/Auth-prøver grønne. Ingen ny DBkolonne er nødvendig.

Redigerbar treukerssyklus, full hendelseskalender, enkelte øktfelt (oppvarming/varianter/progresjon), sammenligning og komplette WANG/TN-leser-/forslags-/samling-/testdagreiser har separate restoppgaver. Testprotokollenes kildeavklaringer er navngitt i eget register. DataGolf aktiveres bare ved dokumentert rett. Den historiske P-posisjonen i `techniqueFocus` er ikke automatisk omtolket som ny måltekst.

Full `npm run verify`, ny CI, ny PR/merge/deploy og siste visuelle kontroll skal registreres etter kodefrys. Grunnpakkens grønne kontroll er ikke bevis på denne større pakken. Anders sin vurdering ved siden av valgt skisse er ikke registrert; teknisk grønt eller disse bildene er ikke visuell godkjenning. Komplett fil-/ballogg-/foresatteksport og ekte ekstern sletting er heller ikke sluttverifisert.
