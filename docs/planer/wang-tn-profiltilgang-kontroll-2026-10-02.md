# WANG/TN: kontroll av samordnet profiltilgang, 02.10.2026

Dette er en avgrenset tilgangspakke i [hovedplanen](wang-team-norway-playerhq-komplett-plan-2026-10-02.md). Hele Excel-erstatningen er fortsatt ikke ferdig. Regelen fra 28.09 gjelder: treneren trenger navngitt deling, og spilleren kan trekke den tilbake.

## Endringer

- Eksisterende WANG IUP- og turneringssider leser under den samme spillerlåsen som brukes ved tilbaketrekking. Eget innsyn og godkjent foresatts innsyn beholdes.
- TN-spillerliste, skoler, turneringer, rangliste, lisens/helseattest, college og uttak begrenses til aktuelle delinger. Eldre gruppe- eller administratorrolle erstatter ikke deling.
- TN-profil, testhistorikk, analyse, evaluering og teknisk plan kontrollerer aktuell tilgang gjennom dataoppslaget. En tidligere lest tilgangsverdi er ikke et varig bevis.
- TN-protokollanalyse av historiske spillerresultater bruker samme navngitte grense. Selve gjennomføringen av gruppens testdag er en separat arbeidsflyt og omfattes ikke av denne endringen.
- Workbench-sidens personlige lesing beskyttes gjennom hele innhentingen. Eksisterende krav i den delte Workbench-motoren beholdes; dette er ikke ferdigstillelse av forslagsflyten.
- Personlige TN-poster, lesekvitteringer og vedlegg bruker aktuell navngitt deling. Gruppeposter og gruppedokumenter følger fortsatt sine eksisterende mottakerregler.
- En aktiv WANG-elev uten TN-medlemskap kan dele profilen med en navngitt TN-trener. Visningen kaller dette en delt profil og tilbyr ikke å avslutte et TN-medlemskap eleven ikke har.

## Kontrollgrunnlag

Kun syntetiske personer, eget Supabase/Auth-miljø på 127.0.0.1:55821/55822. Databaseidentiteten kontrolleres før testing. Ingen produksjonsdata, e-post, betalinger eller kundelisens for DataGolf er brukt.

- 24 faktiske databaseprøver: blant annet mindreårig/foresatt, aksept, utmelding, tilbaketrekking, samtidighet, WANG-elev uten TN-medlemskap, samleoversikter, personpost og vedlegg.
- En uavhengig PostgreSQL-forbindelse bekrefter at spillerlåsen holdes til profiloppslaget er ferdig. Tilbaketrekking venter på et allerede pågående oppslag; neste oppslag avvises.
- 24 innloggede sidekontroller i lokal Chrome med faktisk Supabase Auth: åtte ruter × uten deling / delt / trukket. Alle forventede avvisninger og viste profiler ble kontrollert; TNs strømmede 404 kan ha HTTP 200, så prøven kontrollerer også sideinnholdet.
- Skjermbilder av WANG IUP og TN-profil er lagret privat ved 390 og 1440 px. Disse viser eksisterende skjermer og er ikke ny visuell godkjenning fra Anders. Samtykkebanner er synlig i bildene.
- Den første fullkjøringen avdekket ni WANG-testfeil fra en ny importavhengighet og en foreldet rutemock. Koblingen ble gjort behovsstyrt og rutetesten ble oppdatert; alle 17 berørte regresjonsprøver bestod deretter.
- `npm run verify` fullførte med exit 0 etter innfletting av main: 4 286 kildeprøver, 94 komponentprøver, TypeScript, lint, statiske kontroller, 178 dokumentlenker og produksjonsbygg. `git diff --check` bestod.
- UI-kontrollens første kjøring hang under avslutning etter alle 24 visningspåstander. Lokal avslutning ble avgrenset; den påfølgende kjøringen skrev eksplisitt «Alle 24 innloggede sidekontroller bestod» og avsluttet med exit 0. Testkontoer, delinger og medlemskap ble deretter slettet fra den merkede lokale databasen og lokal Auth.
- Diffkontroll og hovedgrenbasert fullverifisering bestod før innsending. PR [#1096](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1096) ble merget 02.10.2026 kl. 10:36 norsk tid som `c8a44556a96fc74ed9ec1fea38db814700c6dcd5`. Fersk GitHub-kontroll `36983958429` bestod med 4 286 kildeprøver og 94 komponentprøver; Vercel-preview bestod. Ingen produksjonsdata, e-post eller DataGolf-kundedata ble brukt.

Lokale logger og bilder: `Documents/Claude/akgolf-hq/profiltilgang-kontroll-2026-10-02/`. Vedlikeholdte tester: `src/lib/deling/profil-lesing.test.ts`, `src/lib/domain/tn-spiller-oversikt.test.ts`, `src/lib/domain/tn-vedlegg.test.ts`, WANG-rutetester og `tests/iup-local/trenerdeling.test.ts`.

## Sikkerhet og personvern

1. Innlogget trener verifiseres mot faktisk bekreftet Auth-e-post, aktivt ansvar og gjeldende navngitt deling. Feil aktør, manglende deling og trukket deling avvises før private data returneres. Administrator får ingen profilomvei.
2. Ingen nye logger, hemmeligheter eller persondata eksporteres. Testdata er syntetiske. Ingen nye personfelt eller databaser opprettes av pakken.
3. Den eksisterende kontrollen av foresatt for under 16 år, aktiv spiller og tilbaketrekking gjenbrukes. Eldre test-/statistikksamtykke blir ikke komplett profildeling. Skoleavtalens obligatoriske testdeling er fortsatt en separat avklaring.

## Status for denne pakken og neste komplette pakke

Samordningen av eldre personlige WANG/TN-lesere med navngitt deling er merget i #1096 og er kontrollert med syntetisk database og innloggede ruter. Dette gjør ikke alle Excel-felt, testdelingsregler eller trenerprofiler komplette. Datert kontrollmatrise beskriver hva hver rute prøvde; visuell godkjenning fra Anders er fortsatt egen kontroll.

Neste komplette pakke er samling → invitasjon → spillerens godkjenning → kalender/Workbench. Workbench-PR #1099 er åpen; dens invitasjonsendringer må kontrolleres i endelig PR-diff og fersk CI før eventuell merge. Den fullfører ikke automatisk resterende IUP-felt, skolebasert testdeling, felles testdag eller Excel-register. PR #1060 skal ikke merges uendret: den avviker fra kanonisk spørsmålsmodell og godkjenningen anvender ikke planen. De andre øktenes arbeid må innarbeides fra verifisert main, ikke fra umergede eller lokale endringer.
