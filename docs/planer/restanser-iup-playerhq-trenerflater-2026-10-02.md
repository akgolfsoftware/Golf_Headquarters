# Resterende arbeid i koden — PlayerHQ, Precision, WANG og Team Norway

Dato: 02.10.2026. Omfang: manglene i Excel/IUP-erstatningen, trenerprofilene, Workbench-samarbeidet, testdagene, pipelines og DataGolf fra Anders sin bestilling. Dette er en gjennomføringsplan og designbestilling, ikke en påstand om at koden er endret.

## Hva som faktisk gjenstår

17 arbeidspakker nedenfor dekker hele denne leveransen. Produktreglene er én spiller/én IUP, spillerens godkjenning av personlige planendringer og WANG-testdeling til Team Norway uavhengig av TN-medlemskap. Eksisterende funksjoner skal bevares. Planen konkretiserer pakken `wang-team-norway-plan-2026-10-02-v2`; den erstatter ikke andre oppgaver som booking-/betalingsrettinger utenfor dette omfanget.

**Ny direkte kodekontroll:**

- `src/components/admin/precision/AG08Faner.tsx:141`: tom sesongevaluering og utviklingssjekk; utdatert 1–8-etikett.
- `src/lib/domain/tn-workbench.ts:305`: direkte create/move/delete/publish mot individuell plan; godkjenningsflyten må inn før disse endringene.
- `src/app/portal/(legacy)/coach/actions.ts:244`: eksisterende PlanChangeRequest er spiller→coach, ikke den bestilte trener→spiller-flyten.
- `prisma/schema.prisma:2117`: TestDay har én gruppe og én test. `tn-testdag-actions.ts:33` avgrenser til aktive spillere i TN-gruppen.
- `src/app/team-wang/coach/iup/[elevId]/actions.ts`: evaluerer periode-/gruppefokus; er ikke hele IUP-spørreskjemaet og skriver neste fokus direkte.
- `src/lib/domain/tn-arbeidsflate.ts:266`: antall samlingsdeltakere er gruppemedlemstallet, ikke faktiske påmeldte.
- `src/lib/admin-spiller/spiller360-data.ts:300`: manglende faktisk tid faller tilbake til planlagt tid. Dette må være eksplisitt legacyestimat eller ukjent.
- `src/lib/portal-tester/format-verdi.ts`: poenggrenen formaterer uten desimaler; halve poeng må bevares.

Andre funn er datert kilde-/kodekontroll fra01.–02.10 i vedleggene. Ingen innlogget produksjonsreise eller nye app-/databasetester er kjørt i denne planleveransen. Historiske tester beviser ikke at den nye bestillingen er ferdig.

## Gjennomføringsrekkefølge og ansvar

| Etappe | Pakker | Leveranse |
|---|---|---|
| 0 | R01 og fersk gren-/PR-avstemming | Kravregister, kildeversjoner, eksisterende rettinger og konkrete avvik |
| 1 | R02, R09 | Riktig datatilgang, protokoller og felles resultatformat |
| 2 | R03–R05, R10 | Komplett IUP-lagring, spørsmål/mål og pålitelig testføring |
| 3 | R06–R08, R12 | Samlet Workbench, faktisk tidsbruk og godkjente trenerforslag |
| 4 | R11, R13 | Felles testdag, samlinger, invitasjoner og kalenderkobling |
| 5 | R14–R15 | Automatisk resultatkjede og alle tillatte DataGolf-visninger |
| 6 | R16–R17 | Felles trenerprofiler, full regresjon, innføring og kontrollert Excel-avvikling |

Uavhengige deler kan utføres samtidig innen disse avhengighetene. Codex eier kode, lagring, tilgang og tester. Claude Design eier skjermene og deres tilstander. Anders sine eksisterende produktvalg gjelder; nye fag-/avtalespørsmål dokumenteres bare der de faktisk påvirker en pakke. Ingen ny designsystemavklaring.

Designbestillingen sendes i rekkefølgen **Precision → WANG Golf UI prototype → Team Norway App**. Precision ferdigstiller allerede bestilte DataGolf-familier først og får så hele IUP-/spiller-/trenerreisen. WANG/TN viderefører samme funksjonskontrakt med egen profil og bevarer nyere rettinger. En mottatt bestilling er ikke et ferdig design.

## Arbeidspakker

### R01 — Kravregister og versjoner

**Avhenger av:** Før all bygging. **Dekker:** IUP-01–18, PH-01–34, TR-01–24, DG-01–17.

**Status/kodefunn:** Hele kildeomfanget er kartlagt på arknivå. Detaljert kobling til lagringsfelt og beståtte brukerreiser mangler.

**Berørt kode:** `docs/planer/`, `src/lib/portal-tester/tn-catalog.ts`, `src/lib/portal-tester/protocol.ts`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Opprett ett register per felt, spørsmål, beregning, referanse, diagram/pivot og handling med stabil ID, kildeversjon, celle/objekt, lagring, spillerflate, begge trenerflater, test og status.
2. Ta inn alle 162 utviklingsspørsmål og 13 sesongspørsmål fra den rensede 2027-kilden. Bevar gamle 2025-besvarelser med opprinnelig skala og versjon.
3. Registrer alle protokollkonflikter og navngi nøyaktig hvilken beregning som avventer kilde. Hold uavhengig arbeid i gang.
4. Kartlegg eksisterende PR-er/arbeidsgrener før en pakke startes; gjenbruk ferdige rettinger og unngå dobbeltarbeid. Fersk status må hentes da, eldre PR-antall er ikke gjeldende fasit.

**Ferdig når:** Ingen krav uten ansvarlig pakke; ingen «dekket» uten bevis. Hver av 18 arkklasser og alle spørsmål har sporbar ID.

**Designleveranse:** Kildematrise, fullføringsstatus, kilde-/versjonsdetalj; registeret alene er ikke en skjerm.

### R02 — Én identitet, riktige organisasjoner og datadeling

**Avhenger av:** R01. **Dekker:** IUP-02/03; PH-02–05; TR-02/20/22/24.

**Status/kodefunn:** Samtykke, medlemskap og flere tilgangsvakter finnes. Full profil og WANG-testdeling uten TN-medlemskap må ha én konsekvent håndheving.

**Berørt kode:** `prisma/schema.prisma`, `src/lib/auth/coached.ts`, `src/lib/auth/ekstern-leser-scope.ts`, `src/lib/deling/samtykke.ts`, `src/lib/deling/samtykke-regler.ts`, `src/app/team-wang/_data/wang-tilgang.ts`, `src/lib/domain/tn-arbeidsflate.ts`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Bevar User som spilleridentitet og publicPlayerId som ekstern kobling. Representer WANG-skole/trinn/skoleår og TN-gruppe som uavhengige tidsavgrensede relasjoner.
2. Utvid eksisterende tilgangsmotor med et eksplisitt WANG→TN-testgrunnlag, registrert avtaleversjon og omfang, uten krav om TN-medlemskap. Ikke gi hele profilen gjennom den gamle smale eksterne leserstien.
3. Bruk samme feltavgrensning i profil, søk, serverhandling, eksport, vedlegg, mellomlagring og liveoppdatering. Tilbaketrekking/avsluttet trenerrolle må stenge nye forespørsler.
4. Vis særskilt full profildeling, testdeling, foresatt venter, utløpt, trukket, manglende svar og ingen data. Helse, tredjepartsdialog og bilder krever eget tillatt omfang.
5. Legg til de nye dataområdene i datakart og innsyn-/slettingsflyt. Definer lagring etter skolebytte/slutt; ikke slett reell historikk som del av oppgraderingen.

**Ferdig når:** Tillatte og avviste prøver for WANG uten TN, TN uten WANG, begge, ingen, annen skole, avsluttet trener, direkte URL, eksport og tilbakekalling.

**Designleveranse:** Komplett profil og nyttig testprofil er to tydelige varianter. Delingsstatus og begrunnelse synlig uten å eksponere skjermede felt.

### R03 — Felles IUP-profil og støtteapparat

**Avhenger av:** R01/R02. **Dekker:** IUP-01–03; PH-02–05; TR-03/04/22.

**Status/kodefunn:** Spiller 360 har seksjoner; full teammatrise og komplett strukturert IUP-profil er ikke ferdig dokumentert.

**Berørt kode:** `src/lib/admin-spiller/spiller360-data.ts`, `src/lib/admin-spiller/spiller360-typer.ts`, `src/components/admin/precision/AG08Faner.tsx`, `src/lib/domain/tn-arbeidsflate.ts`, `src/app/team-wang/coach/iup/[elevId]/page.tsx`, `prisma/schema.prisma`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Lag en felles autorisert profil-lesemodell som returnerer bare tillatte felt, kildedato, versjon og fullføringsstatus. Organisasjonsflatene bruker samme lagrede svar.
2. Fullfør skole/klubb/ambisjon, kontaktfelt, støtteapparat med rolle/gyldighet og bestilte helsefelt. Spilleren redigerer sine egne opplysninger.
3. Erstatt tomme IUP-seksjoner med virkelige innganger til evaluering, mål, plan, tester, teknikk, fysikk og dagbok. Bruk samme sortering som Excel når treneren velger samlet IUP.
4. Bevar eksisterende profil-/kommunikasjonsfunksjoner og godkjent helseinnsyn; kontoinnstillinger, betaling og sikkerhet er fortsatt spillerens ansvar.

**Ferdig når:** Endring lagres én gang og gjenleses med samme revisjon hos spiller og begge autoriserte trenere. Test skjermede felt og historikk.

**Designleveranse:** Spillerliste → profil → IUP → konkret underfunksjon → tilbake med bevart skole/spiller/sesong.

### R04 — Utviklingssjekk og sesongevaluering

**Avhenger av:** R01/R02/R03. **Dekker:** IUP-04/11; PH-14/15; TR-05.

**Status/kodefunn:** AG08Faner viser fortsatt «FINNES IKKE I APPEN ENNÅ» og skala 1–8. WANG IUP-samtalen er ikke hele spørreskjemaet.

**Berørt kode:** `src/components/admin/precision/AG08Faner.tsx`, `src/lib/domain/tn-evaluering.ts`, `src/app/team-wang/coach/iup/[elevId]/actions.ts`, `prisma/schema.prisma`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Opprett versjonerte skjemadefinisjoner, besvarelser og innleveringer med nivå, kildecelle, svartype, skala og revisjon; bruk ny modul bare der eksisterende modell ikke passer.
2. Implementer alle nivåer 34/43/47/38 spørsmål på 1–5 og sesongens 3 fritekstsvar + 10 på 1–4. Hold de sju spørsmålkategoriene atskilt fra fem treningsområder.
3. Lagre/fortsett, feltvalidering, ufullstendig innlevering, historikk og sammenligning innen samme skjema; ikke sammenlign 1–8 og 1–5 som samme skala.
4. Implementer faktisk/ønsket fordeling FYS/TEK/SLAG/SPILL/TURN og minst tre tiltak som kan kobles til prosessmål.
5. Fireukerspåminnelse gjelder WANG/TN; sesongevaluering før uke43. Dette bestemmer ikke startdato for alle årsplaner.

**Ferdig når:** Alle 175 spørsmål lagres/gjenåpnes med eksakt ordlyd og riktig skala; nivåskifte bevarer svar; begge trenere ser samme delte innlevering.

**Designleveranse:** Full skjema-/historikkreise, ikke 3 eksempelspørsmål. Oppfølging → tiltak → treningsforslag.

### R05 — Mål, kvartalsmatrise og prosessmål

**Avhenger av:** R03/R04. **Dekker:** IUP-05/06; PH-13/21; TR-06.

**Status/kodefunn:** Mål finnes; hele Excel-matrisen og prosesskjeden er ikke samlet.

**Berørt kode:** `prisma/schema.prisma`, `src/lib/workbench/maal-spor.test.ts`, `src/lib/admin-spiller/spiller360-data.ts`, `src/lib/portal-stats/`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Definer hver resultatlinje med ID, enhet, kilde, periode, antall, mål, faktisk verdi og registreringstype. Ta med samtlige mål fra Excel, inkludert delintervaller for SG/PEI/putting.
2. Legg til kvartalsvurderinger, årsresultat og historikk uten å endre eksisterende måltype. Oktober–september er et rapportvindu der det brukes.
3. Fullfør resultatmål → prosessmål → handling → start/slutt → målemetode → hjelper → utstyr/fasilitet → evaluering → konkret økt.
4. Automatiske tall og egenrapportering merkes ulikt. Manglende eller usammenlignbare tall får ikke null eller oppdiktet prognose.

**Ferdig når:** Hver matriserad testes mot syntetisk kilde; periodegrenser og enheter samsvarer mellom spiller og begge trenere.

**Designleveranse:** Målmatrise, målredigering og tydelig overgang mellom funn, mål, økt og evaluering.

### R06 — Samlet Workbench: år, perioder, måned og uke

**Avhenger av:** R03/R05. **Dekker:** IUP-07–09; PH-06–09; TR-07/08.

**Status/kodefunn:** Kjerneplanlegging finnes; valgt kombinasjon er fortsatt design og flere IUP-felt trenger lagring/kobling.

**Berørt kode:** `src/lib/workbench/wb-actions.ts`, `src/lib/workbench/load-workbench.ts`, `src/lib/workbench/week-types.ts`, `src/lib/workbench/periode-core.ts`, `src/lib/workbench/turnering-actions.ts`, `src/lib/domain/tn-workbench.ts`, `src/components/workbench/`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Porter valgt workbench-samlet: Sesongkart, Ukeverksted, Trenerbord og Analyse med én delt spiller-/års-/periodekontekst. Bevar alle eksisterende handlinger.
2. Fullfør ukevis prioritet per treningsområde, fokus, tids-/øktbudsjett og oppholdssted. Støtt år som krysser kalenderår og faktiske datoer.
3. Lagre fire uketyper og redigerbar treukerssyklus med tester, opphold og kopiering; vis skole, reise, konkurranse og samling i samme kalender.
4. Turneringsplan: tour/land/sted, datoer, 9/18 hull og runder, reisedager separat, prioritet og historisk WAGR Power med kildeår. Ingen sammenblanding med DG-feltstyrke.
5. Kontroller flytt/kopier/angre, gjentakelser, tidssone/sommertid, kollisjoner, perioder og mål utenfor endret år. Endring med uavklart konsekvens skal bevares som utkast, ikke slette data.

**Ferdig når:** Samme valgt uke og summer i alle fire visninger; uke40→41 må ikke hoppe til42. Kalendergrenser, tomme perioder, turnering/reise og gjentakelser testes.

**Designleveranse:** 1440/390 og mellomformat; full redigeringsreise med forståelig før/etter og minst mulig trykk.

### R07 — Økter, gjennomføring og korrekt treningsdagbok

**Avhenger av:** R06. **Dekker:** IUP-10/16; PH-10–12; TR-14.

**Status/kodefunn:** Øktbygging og faktisk tid finnes. Spiller360 bruker fortsatt fallback actualMinutes ?? durationMinutes som kan skjule ukjent faktisk tid.

**Berørt kode:** `src/lib/workbench/session-actions.ts`, `src/lib/workbench/live.ts`, `src/lib/workbench/wb-session-write.ts`, `src/lib/domain/workbench/operations.ts`, `src/lib/admin-spiller/spiller360-data.ts`, `src/components/workbench/`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Fullfør økt/drillfelt: formål, område, sted, utstyr/antall, metode, læring, fokus, press, mengde, mål, oppvarming, varianter og progresjon.
2. Gjenbruk samme økt-ID gjennom plan, Live og logg. Avstem eldre øktmodeller etter eksisterende overgangsplan, uten å slette dem eller telle dobbelte kopier.
3. Lag en felles summering som skiller planlagt, faktisk registrert, anslått legacytid, ukjent og fremtid. Fjern skjult presentasjon av planlagt tid som faktisk.
4. Støtt etterregistrering/retting og årsak, øktantall separat fra minutter, dag/uke/måned/sesong og fordeling på fem områder.
5. Ved start/pause/fortsett/fullfør/avbryt skal lagringstilstand og gjennomføringsstatus være separate. Ingen «Lagret» før bekreftelse.

**Ferdig når:** 60 planlagt/45 faktisk gir45 i alle actualsummer. 0, null og fremtid holdes fra hverandre; samme datospenn og ingen dobbelttelling.

**Designleveranse:** Øktbygger → gjennomføring → oppsummering → dagbok, med retting og lagringsfeil.

### R08 — Teknisk og fysisk plan

**Avhenger av:** R05/R06/R07. **Dekker:** IUP-13–15; PH-16/17/19.

**Status/kodefunn:** Teknisk plan og fysikk finnes; komplett før/etter-innhold og sammenhengen til IUP/tester trenger avstemming.

**Berørt kode:** `src/app/portal/tren/teknisk-plan/actions.ts`, `src/lib/workbench/teknisk-plan-panel.ts`, `src/lib/workbench/fys-turnering-actions.ts`, `prisma/schema.prisma`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Fullfør hvorfor endring skal bedre score, nåværende/ønsket ballflukt og treff, GOBBS, bevegelse, metoder, driller, video, hjelpemidler og ferdiguke.
2. Koble oppgaverevisjon til økt, mål og målegrunnlag. Bevar tidligere versjon og gjennomføring ved ny teknisk retning.
3. Skill IUP2027-driver/7-jern/wedge og sju TrackMan-felt fra den gamle tekniske testprotokollen. Vis metode og versjon ved sammenligning.
4. Bevar fysisk programmering og fem vedtatte tester: benkpress, trapbar, lengdehopp, rotasjonskast og Club Speed. Historiske CMJ/3000m-data leses uten å bli ny obligatorisk standard.

**Ferdig når:** Endret teknisk oppgave sletter ikke gammel gjennomføring; riktige målefelt/enheter og testversjoner vises hos alle autoriserte roller.

**Designleveranse:** Teknisk før/etter, drillkobling, fysisk progresjon og kildedetalj.

### R09 — Testprotokoller, referanser og resultatformat

**Avhenger av:** R01. **Dekker:** IUP-12/13/15/17/18; PH-18/21; TR-10–13.

**Status/kodefunn:** Datert kontroll:38 varianter/11 sperret. Felles formatterer runder points_total/sum til hele poeng.

**Berørt kode:** `src/lib/portal-tester/tn-catalog.ts`, `src/lib/portal-tester/tn-scoring.ts`, `src/lib/portal-tester/test-scoring.ts`, `src/lib/portal-tester/format-verdi.ts`, `src/lib/portal-tester/validate-completion.ts`, `src/lib/portal-tester/fixtures/tn-excel-v3.json`, `src/lib/portal-tester/fixtures/tn-excel-v3-references.json`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Lag versjonert protokollkontrakt: forsøk/rekkefølge, mål, råfelt, enhet, grenser, beregning, presisjon, bedre-retning og referansekilde. Avstem alle38 katalogvarianter og gjenværende sperrer enkeltvis.
2. Rett 8-ball til24 forsøk/maks96 i design der feil; kontroller kode mot eksisterende v3-testgrunnlag. Wedge Gate9treff; Nærspill Gate/VISA manuelle poeng etter vedtak.
3. Vis PEI-brøk0,05 som5%; behold12,5poeng. Avklar eldre data eksplisitt, ikke gjett prosent fra tallstørrelse.
4. Valider skjult Ref-intervall, SG/PEI-referanser, median vs gjennomsnitt, eksakt enhetskonvertering og alle25diagrammenes/énpivots informasjon. Korriger kjente Excel-feil med sporbar beslutning.
5. Bevar gamle resultaters formel/protokoll/referanseversjon; ikke utfør stille omberegning. Løs kjente beslutninger uten å be om dem igjen.

**Ferdig når:** Fasitsett rett under/på/over hver grense, null/tomt/desimal/full/ufullstendig. Samme tall i spiller, WANG, TN, matrise og eksport.

**Designleveranse:** Riktig scorekort per resultatfamilie, ikke generisk ti-slagskort; rådata og beregning er synlig.

### R10 — Forsøkslagring, bilder og testhistorikk

**Avhenger av:** R02/R09. **Dekker:** PH-18; TR-12/13.

**Status/kodefunn:** Eierskap og fullføring finnes; automatisk forsøkslagring og ende-til-ende gjenopptak må fullføres.

**Berørt kode:** `src/lib/portal-tester/tn-session.ts`, `src/lib/portal-tester/tn-persistence.test.ts`, `src/lib/portal-tester/session-data.ts`, `src/lib/portal-tester/test-tilgang.ts`, `src/app/team-norway/tn-testforing-actions.ts`, `prisma/schema.prisma`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Lagre gyldige forsøk automatisk med stabil ID, revisjon og idempotensnøkkel slik at samme innsending ikke dobler resultatet.
2. Gjenoppta etter oppfriskning/nettbrudd med minimal kø for egne usendte data; rydd ved utlogging/brukerbytte. Vis lagrer/lagret/venter/feil.
3. Fullfør råforsøk og beregnet resultat samlet på serveren. Delvis test må ikke gå inn som gyldig standardresultat/toppliste.
4. Koble frivillig slagbilde til forsøk med privat lagring, størrelses-/typekontroll og samme tilgang ved visning/eksport. Ikke send bilder til AI som sideeffekt.
5. Retting etter fullføring får årsak, aktør, tidspunkt og ny revisjon; oppdater graf/matrise uten å slette historikk.

**Ferdig når:** Ny innlogget økt/enhet gjenleser samme verdier; dobbeltklikk, retry, to samtidige redigeringer og avbrutt opplasting prøves i lokal testdatabase.

**Designleveranse:** Store scorekort på mobil, rediger tidligere forsøk, gjenoppta, bilder og alle lagringstilstander.

### R11 — Felles testdag på tvers av WANG og TN

**Avhenger av:** R02/R09/R10. **Dekker:** TR-10–13; PH-18/27.

**Status/kodefunn:** TestDay har ett groupId og ett testDefinitionId; opprettTestdag krever aktive medlemmer i én TN-gruppe.

**Berørt kode:** `prisma/schema.prisma`, `src/app/team-norway/tn-testdag-actions.ts`, `src/lib/domain/tn-arbeidsflate.ts`, `src/lib/domain/tn-testdag-lock.ts`, `src/components/team-norway/tn-testdag-opprett.tsx`, `src/components/team-norway/tn-testdag-scorecard.tsx`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Utvid TestDay bakoverkompatibelt med deltakende skoler/grupper, stasjoner/protokoller, puljer, fellesstart, kapasitet og ansvar. Gamle dager får lesbar én-stasjonstolkning.
2. Dedup samme spiller på tvers av medlemskap; opprett egne spiller–stasjon-tildelinger. Bevar kø og historiske resultatreferanser.
3. Tilby føring på egne tildelte stasjoner, trenerføring og kontroll. Arrangør/stasjonstrener får bare nødvendig innsyn, ikke hele IUP.
4. Bygg felles resultatmatrise med skole/kull/gruppe/test/protokoll/dato/status og sammenlignbare utvalg. Alle WANG-testresultater blir synlige for tillatt TN-leser uten TN-medlemskap.
5. Oppdater andre autoriserte skjermer fra bekreftet lagring, med gjenopptak etter nettbrudd og siste oppdatering. Innfør ikke åpen deltaker-/resultatliste uten vedtatt publikum.

**Ferdig når:** To skoler +TN-gruppe +dobbelmedlem; flere tester, én invitasjon/tildeling, riktige rolletilganger, liveoppdatering mellom enheter og korrigert resultat.

**Designleveranse:** Trenerens arrangement/stasjonsmatrise, spillerens stasjonsløp, fellesstart/puljer og autorisert liveoversikt.

### R12 — Trenerforslag som spilleren godkjenner

**Avhenger av:** R02/R05/R06. **Dekker:** PH-26; TR-07/19.

**Status/kodefunn:** TN kaller create/move/delete/publish direkte. PlanChangeRequest er i lest legacy-flyt spiller→coach; PlanSuggestion er teknisk-plan-forslag. Ingen av navnene beviser bestilt motsatt flyt.

**Berørt kode:** `src/lib/domain/tn-workbench.ts`, `src/lib/workbench/wb-actions.ts`, `src/app/portal/(legacy)/coach/actions.ts`, `src/app/team-wang/coach/iup/[elevId]/actions.ts`, `prisma/schema.prisma`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Kartlegg eksisterende forslagstyper og utvid felles kontrakt for trener→spiller uten å endre retningen til legacy-forespørsler eller tekniske AI-forslag.
2. Lagre avsender/organisasjon, målspiller, før/etter, begrunnelse, berørte økter/plan, basisrevisjon, gyldighet og status.
3. Bytt TN/WANGs direkte personlige planendringer til forslag. Gruppeplaner og trenerens egne notater følger sine egne rettigheter.
4. Gi spilleren godta/avvis; anvend hele endringen atomisk én gang etter fersk tilgangs- og revisjonssjekk. Ved konflikt skal nyere plan bevares.
5. Støtt utkast/send/sett/godkjent/avvist/trukket/utløpt/konflikt og beslutningshistorikk. WANGs IUP-fokus som endrer personlig plan følger samme godkjenning.

**Ferdig når:** Før godkjenning uendret plan; avvisning uendret; godta nøyaktig én gang; to trenere og spillerens egne endringer gir synlig konflikt.

**Designleveranse:** Funn → konkret forslag → før/etter → spillerbeslutning → synlig oppdatering i Workbench og treneroversikt.

### R13 — Samlinger, gruppeplaner og invitasjoner

**Avhenger av:** R02/R06/R12. **Dekker:** PH-27; TR-08/09.

**Status/kodefunn:** hentTnSamlinger viser GroupSchedule og antall gruppemedlemmer; dette er ikke faktisk deltaker-/invitasjonsstatus.

**Berørt kode:** `src/lib/domain/tn-arbeidsflate.ts`, `src/app/team-norway/samlinger/page.tsx`, `src/app/team-norway/samlinger/[id]/page.tsx`, `src/app/team-wang/_components/fane-samlinger.tsx`, `src/lib/workbench/gruppe-periode-actions.ts`, `prisma/schema.prisma`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Gjenbruk gruppeplan/GroupSchedule som utgangspunkt; legg til versjonert program, deltakelse og invitasjonsstatus fremfor separate kopier av kalenderplan.
2. Lag komplett dags-/ukeprogram med økter, stasjoner, trener, sted, ressurser, mål og deltakende grupper/skoler.
3. Publisering oppretter én invitasjon per valgt spiller, også ved dobbelmedlemskap. Bruk varslingsmønster i appen; ekte e-post/invitasjoner er et eget driftstrinn.
4. Spilleren forhåndsviser hele planen og kollisjoner, godtar/avviser, og legger godkjent program inn én gang i kalender/Workbench med opphavskobling.
5. Nye vesentlige programendringer krever ny beslutning. Avlysning og uttrekk påvirker framtid uten å ødelegge fullførte økter. Vis faktiske inviterte/bekreftede/møtte antall.

**Ferdig når:** Publiser → én invitasjon → godta → én komplett plan; prøv avslag, reprise, endring, avlysning, uttrekk og fullførte økter.

**Designleveranse:** Samlingsbygger, publiseringsoversikt, invitasjon hos spiller, konflikter og deltaker-/oppmøteoversikt.

### R14 — Automatiske turneringsresultater og alle pipeline-profiler

**Avhenger av:** R02/R03. **Dekker:** IUP-08; PH-20/22; TR-15/16/23.

**Status/kodefunn:** publicPlayerId og resultatlesere finnes. Automatisk korrekt oppdatering i alle tre flater er ikke produksjonsbevist.

**Berørt kode:** `src/lib/domain/tn-arbeidsflate.ts`, `src/lib/portal-stats/datagolf-data.ts`, `prisma/schema.prisma`, `../ak-golf-pipelines/.github/workflows/junior-tours-sync.yml`, `../ak-golf-pipelines/pipelines/`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Bruk pipelines som eneste innhenter; identitetskoble med stabile kilde-ID-er. Samme navn alene gir aldri automatisk kontokobling.
2. Standardiser kilde/event/runde/spiller/revisjon, brutto, status og tidspunkt; korrigering oppdaterer samme resultat uten duplikat. Bevar kildehistorikk.
3. Oppdater lesemodell/mellomlager etter vellykket innhenting. Mål faktisk tid til profilen oppdateres; femminuttersmål er foreslått tjenestemål, ikke dagens garanti.
4. Gi trenerne tilgjengelig katalog over alle tillatte pipeline-profiler, også uten appkonto; vis identitetskonflikt og dekning. Konto-/IUP-tilgang tildeles aldri fra katalogen.
5. Hold egne treningsrunder, offisielle turneringsrunder, ranking, WAGR Power og DataGolf-data atskilt. Vis siste vellykkede synk ved nedetid og kildejustering ved retting.

**Ferdig når:** Samme resultat to ganger, senere korreksjon, to spillere med samme navn, DNS/WD/CUT,9/18hull, kildebrudd og uautorisert profil; alle tillatte flater samsvarer.

**Designleveranse:** Katalog → konkurranseprofil → turnering/runde → kilde; komplett appprofil bare ved faktisk kobling og tilgang.

### R15 — DataGolf: hele datagrunnlaget og skjermsettet

**Avhenger av:** R01/R02/R14; kundedata krever bruksrett. **Dekker:** DG-01–17; PH-24; TR-17.

**Status/kodefunn:** Flere lesere og pipeline-klient finnes; DataGolf-prototypen er under arbeid. API/nettside/kodedekning/drift/kunderett må skilles.

**Berørt kode:** `src/lib/portal-stats/datagolf-data.ts`, `src/lib/datagolf/player-tool-data.ts`, `src/lib/datagolf/stasjon-data.ts`, `src/app/portal/analysere/datagolf/`, `../ak-golf-pipelines/pipelines/datagolf/client.py`, `../ak-golf-pipelines/pipelines/datagolf/backfill.py`, `../ak-golf-pipelines/pipelines/datagolf/schema.py`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Kartlegg hvert dokumentert datasett/felt mot API/nettside, lokal tabell, oppdatering, enhet, periode og kundevisningsrett. Ikke ta eldre endepunktdokument som bevis på dagens kjøring.
2. Fullfør felles datalesere for katalog/profil, kategori-topplister, sammenligning, innspill, historiske runder, kalender/felt, turnering/live, modell, bane/trend og datautforsking.
3. Skill faktiske resultater og SG fra ferdighetsestimat/prognoser; vis datadekning, utvalg og antall. Ingen modellscore fremstilt som målt runde.
4. Bevar filtre og sammenlignbare perioder ved navigasjon. Analyse → mål/forslag bruker R12. Nettsidefunksjoner uten API får eksplisitt kildebegrensning.
5. Aktiver bare datasett med dokumentert bruksrett; samme kontroll i eksport, mellomlager og profil. Spesialist-/oddsregister er avgrenset til relevante voksne roller uten spillhandlinger.

**Ferdig når:** DG01–17 med normal/tom/delvis/feil/ingen tilgang/forsinkelse; kategorier, rådata, kildeskille, sammenligning og godkjent tiltak kontrolleres.

**Designleveranse:** Precision først, deretter samme funksjonskontrakt i WANG og TNs egne profiler. Ikke 17 hovedmenypunkter.

### R16 — Trenerflater, administrasjon og full regresjon

**Avhenger av:** R02–R15. **Dekker:** PH-01–34; TR-01–24.

**Status/kodefunn:** Eksisterende funksjoner ligger spredt. Sidetelling er ikke dokumentasjon på full trenerdekning.

**Berørt kode:** `src/app/team-wang/`, `src/app/team-norway/`, `src/app/portal/`, `src/lib/admin-spiller/`, `docs/gdpr/datakart.md`, `tests/`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Koble felles autoriserte data til Precision/PlayerHQ, WANG og TN uten egne kopier av IUP. Bevar valgt designprofil per flate.
2. WANG: egne skoler/kull/grupper, morgenøkter, oppmøte, kompetansemål og sportssjefadministrasjon. TN: landslagsgrupper, nasjonal WANG-testoversikt, samlinger, relevante uttak/college/ranking.
3. Bevar eksisterende meldinger, dokumenter, fagapparat, gameplan, TrackMan, fysikk, booking, utstyr, sosiale funksjoner og konto med sine eksisterende rollegrenser. Nye data skal med i innsyn/eksport og dokumentert livssyklus.
4. Lag riktig kunde-/organisasjonsoppsett med roller og avtaleversjoner. Ingen oppdiktet pris, fakturering eller automatisk kundeaktivering.
5. Avstem samtlige ruter/underhandlinger mot funksjonsregisteret; fullfør tom/loading/feil/ikke-delt. Test390/1440 ogWANG1280, tastatur, stor tekst, fokus og kontrast.

**Ferdig når:** Alle aktive IUP-krav ogPH/TR/DG-familier har faktisk skjerm, lagring, tilgangsprøve og reisebevis; ingen skjult funksjonsreduksjon.

**Designleveranse:** Begge trenerprofiler gir samlet oversikt og åpner underfunksjoner med bevart spiller-/sesongkontekst.

### R17 — Samlet prøve, innføring og avvikling av Excel

**Avhenger av:** R01–R16. **Dekker:** Alle.

**Status/kodefunn:** Ingen samlet produksjonsverifisert Excel-erstatning foreligger.

**Berørt kode:** `tests/`, `docs/testing.md`, `docs/utvikling/lokal-testdatabase.md`, `docs/planer/`. Stier som slutter i `/` er områder; nye modul-/modellnavn bestemmes etter gjenbrukskontroll.

1. Kjør nye modeller/tilgangsregler først i separat lokal database med syntetiske kontoer: WANG-only, TN-only, begge, voksen/mindreårig, ulike skoler, trener og stasjonsleder.
2. Kjør målrettede enhetstester, databaseprøver og hele nettleserreiser; npm run verify, npm test og npm run prosjekt:sjekk etter relevant endring. Rapporter faktiske resultater.
3. Sammenlign de konkrete designversjonene med appen på390/1440 ogWANG1280. Registrer Anders sin vurdering separat fra tekniske tester.
4. Rull ut additive og bakoverkompatible kode-/skjemaendringer med tilgangsregler, nødvendige indekser og kontroller. Ha reverserbar aktivering per organisasjon og behold data ved tilbakerulling.
5. Eventuell Excel-innflytting: forhåndsvisning, feltmapping, kildeversjon, feilliste, duplikatkontroll og sporbar import. Ekte persondataimport/invitasjoner behandles som egne eksplisitte driftstrinn.
6. Avvikle Excel først når alle aktive krav er kontrollert, data avstemt, spiller/trenerreise prøvd og ingen kritiske avvik står åpne. Kundepilot og faktisk produksjonsoppdatering må dokumenteres.

**Ferdig når:** Samlet godkjenningsrapport med krav-ID→kode→test→design→produksjonsbevis. Åpne kilde-/avtalespørsmål blokkerer bare berørte funksjoner.

**Designleveranse:** Oversikt for innføring og forklarende tomtilstander; ikke lov full integrasjon før siste kontroll er gjennomført.

## Datakontrakter som design og kode skal dele

Navnene under beskriver ansvar og er ikke ordre om å opprette parallelle tabeller. Gjenbruk eksisterende modeller etter kontroll.

| Kontrakt | Minimum |
|---|---|
| IUP-svar | spiller, skjema-/spørsmålsversjon, nivå, svar, dato, utkast/innlevert, revisjon, kilde |
| Tilgang | mottaker/rolle/organisasjon, datakategorier, grunnlag/avtaleversjon, gyldighet, tilbakekalling |
| Planforslag | avsender, mottaker, basisrevisjon, før/etter, begrunnelse, berørte objekter, status og beslutning |
| Samlingsprogram | arrangør, programversjon, deltakelse, invitasjon, svar, økter og opphav til kalenderinnlegg |
| Testdag | arrangement, skoler/grupper, stasjoner, puljer, spiller–stasjon, protokoll, forsøk/resultatrevisjon |
| Konkurranseresultat | stabil kilde-/spiller-/event-/runde-ID, brutto, status, revisjon, kildeklokke |
| DataGolf-måling | datasett/felt, målt/modell, enhet, periode, grunnlag, kilde, oppdatering og bruksrett |

Alle personlige skriv krever fersk serverkontroll, validert input, avgrenset målobjekt og beskyttelse mot dobbel innsending/samtidig overskriving. Varsler/logg skal ikke inneholde private svar/helse. Nye data medfører oppdatert innsyn, eksport, livssyklus og datakart.

## Felles kontroll før en pakke kan lukkes

1. Kilde og eksisterende oppførsel dokumentert; nye datatyper/endringer er bakoverkompatible.
2. Funksjon og lagring prøvd med syntetiske data, også negativ tilgang og nett-/samtidighetsfeil.
3. Samme lagrede verdi vises korrekt i PlayerHQ, WANG og TN der tilgang finnes.
4. Ingen mistet funksjon i eksisterende rute-/handlingsregister.
5. Skjermreferanse, faktisk app,390/1440 og relevant1280, temaer og tilstander er kontrollert. Anders sin vurdering føres separat.
6. Relevante tester og prosjektkontroller består; faktiske testresultater registreres.
7. Produksjonskjede/kundedata merkes først verifisert når målt. Lisens- eller kildebegrensning skal aldri maskeres med syntetiske tall.

## Avhengigheter som må være avklart før berørt produksjonsdel aktiveres

- DataGolf-kundevisning: dokumentert særrett/avtale, ikke bare API-nøkkel. Design med syntetiske data kan ferdigstilles nå.
- Uavklarte testprotokolldetaljer: konkrete råfelt kan tegnes og lagres som utkast; gyldig sluttresultat krever dokumentert formel. Allerede vedtatte poengregler skal ikke spørres om på nytt.
- WANG-testdelingens skoleavtale og livssyklus: definer gyldighet/ansvar etter skolebytte/slutt og relevante foresattkrav. Full profildeling er separat.
- Eventuell rangering synlig for andre elever må ha definert publikum; treneroversikten kan bygges uten en offentlig rangering.
- Årsforkorting med eksisterende mål/perioder utenfor ny sluttdato må bevare data til håndtering er valgt.

## Leveranse til Claude Design

Alle tre prosjekter får denne planen og den tidligere fullstendige funksjons-/spørsmålspakken. De skal levere klikkbare reiser og én rad per R-/IUP-/PH-/TR-/DG-krav med eksakt fil/skjerm, handling, tilstand, format, kildeversjon og faktisk prøve. En generell «profilside ferdig» lukker ikke alle underkrav.

Sentrale reiser: (1) alle IUP-svar registreres hos spiller og leses hos begge trenere; (2) WANG-elev uten TN-medlemskap vises med testinnsyn i TN; (3) trenerforslag godtas/avvises uten direkte overskriving; (4) samling publiseres og hele programmet legges inn én gang; (5) flerskole-testdag fører og deler verifiserte resultater; (6) korrigert pipeline-resultat oppdaterer riktig profil; (7) DataGolf-analyse blir et konkret godkjent treningstiltak.

Dette er en komplett plan for de avtalte hullene, ikke en ferdigattest på appen.
