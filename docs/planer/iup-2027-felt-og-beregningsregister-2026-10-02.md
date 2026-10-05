# IUP 2027 – felt- og beregningsregister

Kontrollert 02.10.2026 mot den lokale kilden `Team Norway IUP 2027.xlsx`, kildekontrollsum `6786d70f166dc4d5602f792a165eef8372743597ac44904a9fa0a3dd2892f222`, og funksjonskartet kontrollert 01.10.2026. Originalarbeidsboken er bare lest; den er ikke endret, kopiert inn i repoet eller brukt som kilde til spillerbesvarelser.

Dette registeret beskriver kildeinnhold, beregningsområder, kjent status og krav til videre kobling. Det er **ikke** en ferdigattest for Excel-paritet. En feltfamilie merket «delvis» må fortsatt spores til konkret lagring, spillerhandling, WANG-visning, TN-visning, delingsregel og bestått test før den kan regnes som dekket.

## Kontrollert arbeidsbokstruktur

- 18 ark: 17 synlige og `Ref` skjult.
- 1 692 celleformler fordelt på sju ark; de øvrige elleve arkene inneholder ingen celleformler.
- 25 diagramdefinisjoner, én pivottabell/pivot-cache og åtte mediefiler (seks PNG, én EMF og én SVG).
- Formeltetthet: Turneringsplan 64, Ukeplan 3, Teknikktest 844, TN Fystester 7, Treningsdagbok 732, Statistics 30 og skjult Ref 12.
- De originale utviklingsspørsmålene og sesongevalueringsspørsmålene kontrolleres separat av `scripts/check-iup-original.py`; katalogen inneholder 162 spørsmål for 2027 på tvers av nivåene og 13 sesongspørsmål. Spørsmålsordlyd og svarverdier blir ikke gjentatt her.

Formeltallene er kontrollert ved å lese XLSX-pakkens cellestruktur uten å hente eller skrive ut celleverdier. Diagram- og bildefiler er telt som pakkeobjekter; dette registeret hevder ikke at hvert diagram er visuelt gjenskapt i appen.

## Register per ark

Statusnøkkel: **Delvis** = funksjoner finnes, men felt, beregning, sammenheng eller ende-til-ende-test mangler. **Avvik** = kildens beregning/protokoll kan ikke kopieres som fasit. **Mangler** = tilsvarende samlet, lagret funksjon ble ikke funnet i kodegjennomgangen 01.10.2026. **Kildekartlagt** beskriver kun kildeinnhold, ikke produktdekning.

| ID / ark og kildeområde | Felt og funksjon som skal bevares | Formel-/objektkontroll | Status og nødvendig appbevis |
|---|---|---|---|
| IUP-01 Intro · tekstbokser og figur | Arbeidsrekkefølge, nivåvalg, fremdrift og sammenheng mellom evaluering, målsetting og plan | 0 formler; innhold i tekst/figur | **Delvis.** Veiledet PlayerHQ-reise må vise fullføring og manglende deler; WANG og TN må se samme status. |
| IUP-02 TN Coaches · A1:E24 | Fagperson, rolle, telefon, e-post og ansvarsområde | 0 formler | **Delvis.** Spillerstyrt kontakt-/teamregister, kontaktfelt og gyldighet må kobles til korrekt deling. Gruppemedlemskap alene dekker ikke eksterne fagpersoner. |
| IUP-03 Person info · A1:D25 | Klubb, skole/college, adresse, GolfBox-ID, ansvarlig trener, golf-, fysisk-, mental- og puttetrener, foresatte, skade, medisinske forhold og allergi | 0 formler | **Delvis.** Skill profilfelter fra helseopplysninger; dokumenter hvert felts eier, leser, skrivetilgang, kilde og historikk før fullprofilen kalles komplett. |
| IUP-04 Evaluering spørsmål · A1:F39 og tekstboks | Tre fritekstsvar, ti egenvurderinger 1–4, faktisk/planlagt fordeling på fem områder og forbedringspunkter som kan bli prosessmål | 0 formler; spørsmål verifiseres av kildekontrollskriptet | **Delvis etter #1078/#1104.** Sesongevaluering kan fylles og innleverte svar vises i WANG/TN. Matrise, historikk, forbedringspunkt→prosessmål og full kildeparitet er ikke bevist. |
| IUP-05 Målsetting og oppfølging · A1:N43 | Ranking, bruttoresultat, SG, PEI, presisjon, treningsmengde, kvartaler, årsresultat, neste mål og historikk | 0 formler; diagram-/bildeobjekt på arket | **Delvis.** Hver måltallsrad trenger definisjon, enhet, kilde, datovindu, måleantall, mål, kvartalsvurdering og historikk. Ukjent data må ikke bli null. |
| IUP-06 Prosessmål · A1:J29 | Resultat-/prestasjonsmål, handling, prosess, start/slutt, målemetode, fasilitet/utstyr, hjelper og evaluering | 0 formler | **Delvis.** Sporbar kjede fra resultatmål til flere prosessmål og økt mangler som samlet, strukturerte data. |
| IUP-07 Årsplan · A1:BB34 | Uker, perioder, hovedfokus, fem områder, utvikle/vedlikeholde/redusere, tids-/øktbudsjett, oppholdssted og eksempelfigurer | 0 formler; figur-/bildeobjekt | **Delvis.** Plan/perioder finnes. Ukeprioritet per område og planlagt/faktisk oppholdssted må kunne sees sammen med konkurranser og kalender. Eksempelfigurer er veiledning, ikke spillerdata. |
| IUP-08 Turneringsplan · A1:S1001 | Turnering, WAGR Power, hull, uke, datoer, dager, land, tour, reise, totalsummer og nivåfordeling | 64 formler, hovedsakelig IF og WEEKNUM | **Delvis / formelavvik.** Planlagte turneringer og reisedata finnes. Power-kilde, hull-/dagsregnskap og nivåbalanse gjenstår. WAGR-ranking, WAGR Power og DataGolf-feltstyrke er ulike størrelser. Feil summer i kildearket må ikke kopieres. |
| IUP-09 Ukeplan · B1:BA42 | Fire uketyper, dagdel morgen/ettermiddag/kveld, øktantall/tid, treukerssyklus og testplassering | 3 SUM-formler i AA, AL og AW | **Delvis.** Uke-/øktdata finnes. Fire navngitte ukevarianter og redigerbar treukerssyklus med kontrollsummer er ikke verifisert samlet. |
| IUP-10 Treningsøkter · A1:AH124 | Turneringsoppvarming, sving/putt/nærspill/wedge, formål, oppgaver, repetisjoner, tid, område, utstyr/antall og progresjon mot spill/press | 0 formler | **Delvis.** Økter, maler og øvelser finnes; full kildeinventering, utstyrsbehov og kobling fra prosessmål til alle øktvarianter mangler. |
| IUP-11 Utviklingssjekk 5 Prosesser · A3:AU63 | Nivåtilpassede spørsmål, sju kategorier, skala 1–5 og historikk | 0 formler; 162 kildeverifiserte 2027-spørsmål på tvers av nivåer | **Delvis etter #1077/#1080/#1084/#1089/#1090/#1104.** Innlevering, historikk og trenerlesing finnes. Kildeversjon 2025 mot 2027 må være synlig; 1–5 er egen skala; full oppfølging i begge profiler gjenstår. |
| IUP-12 TN Tester Tot · C8:AA42 | Golfslag-/teknikktester, fysiske måltall, dato, kilde, råmålinger, protokoll og scorekort | 0 formler | **Delvis.** Testkatalog og enkelte versjonerte protokoller finnes. Katalogført, utkast og fullført gyldig test må holdes atskilt; protokollvedlegg og skole-/gruppeoversikter mangler. |
| IUP-13 Teknikktest · B1:AV176 | Driver, 7-jern, wedge; A/B; carry, side, restavstand, PEI, målområde, spredning og TrackMan-felter | 844 formler; 24 diagramdefinisjoner | **Avvik / delvis.** Aktuelle paneler bruker annen protokoll og andre felter/forsøk. 2027-feltene Swing Direction, Club Path, Attack Angle, Face to Path, Spin Loft, Smash Factor og Club Speed må versjoneres. Diagrammenes informasjonsinnhold må mappes; 24 kort er ikke et krav. |
| IUP-14 Teknikkplan · B1:P109 | Hvorfor endre, nåværende/ønsket ballflukt og treff, GOBBS, bevegelse, metode, drill, video, hjelpemiddel/utstyr og ferdiguke | 0 formler; tekst-/bildeobjekter | **Delvis.** Strukturert teknisk plan finnes; feltparitet og begrunnelse mot spillstatistikk må verifiseres. Trenerendring må sendes som spillergodkjent Workbench-forslag. |
| IUP-15 TN Fystester · A1:V61 | Daterte serier, trapbar, benkpress, CMJ, stille lengde, knestående ballkast, score og 3000 m-referanse | 7 formler | **Avvik.** Kildeprotokollens vekting avviker fra valgt seksårsløp og appens FYS-score. Ikke gjør 3000 m/CMJ obligatorisk ved import uten uttrykkelig fagvedtak. |
| IUP-16 Treningsdagbok · A1:T367 | Faktisk mengde på fem områder, øktantall, dag/måned/sesong og fordeling | 732 formler, 366 TEXT og 366 SUM; én pivot-cache og ett diagram | **Avvik / delvis.** Workbench har planlagt og faktisk øktdata; aggregeringer må avstemmes mot faktisk varighet uten dobbelttelling. Kildearket har historiske datoer og summer som blander minutter med antall økter. |
| IUP-17 Statistics · A1:Y44 | SG/PEI-referanser etter avstand og ballplassering; utvalg, enhet, bildebasert faginnhold | 30 formler | **Delvis.** Ingen full én-til-én-tabellparitet er bevist. Referanser krever kilde, versjon, utvalg og enhet; kundevendt DataGolf krever separat dokumenterte rettigheter. |
| IUP-18 Ref · A1:C16, skjult | Oppslag/intervaller for forventede putter | 12 formler | **Avvik / delvis.** Referanseverdier finnes i SG-tabell, men grenseverdier, tomrom mellom intervaller og verdier over 18 m er ikke bevist like. Skjult kilde må fortsatt inngå i synlig, versjonert produktregel. |

## Beregnings- og datakvalitetsavvik

Følgende observasjoner fra kontrollen 01.10 er kildefeil eller tolkningsrisiko, ikke godkjente produktregler:

1. Treningsdagbokas datokolonne viser 01.10.2023–30.09.2024 selv om arbeidsboken gjelder 2027. Appens sesong må styre datoene.
2. Dagbokformlene J2 og J4 summerer D:I og blander minutter og øktantall; J3 bruker D:H. Hold varighet og antall separate.
3. Turneringsplanens summer i D33 og H33 blander kolonner og overser rader 27–32. Definer summer fra feltets enhet og alle rader.
4. Teknikktesten merker D21 som gjennomsnitt selv om formelen bruker MEDIAN. U21-formelen utelater første slag og inkluderer medianraden. A/B-områdene varierer mellom paneler.
5. Fysisk score B9 bruker andre vekter enn den viste A14:B18-tabellen. Den er heller ikke lik appens kroppsvekt-/stallrelative FYS-score.
6. Statistics bruker yards × 0,9; eksakt yard→meter er 0,9144. Kildens historiske intervall og enhetskonvertering må spores hver for seg.
7. Putting-/PEI-intervaller, «> 45 Total», FT %, WAGR Power og historiske ranking-/nivåbilder mangler entydig definisjon eller gyldig kilde/år. Ikke fyll ut med antakelser.

Ingen av disse avvikene er merket rettet av denne dokumentkontrollen. Før de kan implementeres må hver regel ha en godkjent definisjon og syntetisk fasitprøve.

## Status i PlayerHQ, WANG og Team Norway

Kildekontrollen alene gir ikke grunnlag for å si «alle Excel-funksjoner er i PlayerHQ». Spillerens IUP-spørsmål, sesongevaluering, lagring/revisjoner, navngitt deling og trenerens lesing av leverte svar finnes i merget kode. #1104 monterer innleverte svar i WANG/TN-profilene. Dette dekker ikke alle arkfeltene over.

Neste kodekontroll må registrere per feltgruppe: konkret PlayerHQ-skjerm/handling, databasefelt eller beregnet kilde, WANG-leser, TN-leser, leser-/skriverolle, delingsgrunnlag, versjon og syntetisk test-ID. Ikke utled tilgang til helse, meldinger eller vedlegg fra at IUP-svar kan deles. Obligatorisk tverrskole-testdeling krever separat dokumentert skole-/NGF-grunnlag.

## Kontrollrevisjon

- Kildekontrollsum: `6786d70f166dc4d5602f792a165eef8372743597ac44904a9fa0a3dd2892f222`.
- Kildeversjon: lokal original IUP 2027; ingen svar, navn, e-post eller kontaktverdier ble lagt i dette registeret.
- Formel-/objekttelling: automatisk, skrivefri XLSX-lesing 02.10.2026; celleformler og diagramobjekter ble telt uten å eksportere celleverdier.
- Funksjonsgrunnlag: tidligere lokal kodegjennomgang 01.10.2026 (`f9c40e542`), supplert med merget leveranse #1104. Dette er eldre enn dagens `main` for øvrige kodeområder; felt-til-kode-paritet må oppdateres før hver implementeringspakke.
- Begrensning: kildeobjekter og arkområder er inventert, men ikke alle individuelle layout-/celleetiketter er publisert her. Eksterne lenker/protokoller er ikke kontrollert. Anders' visuelle godkjenning er separat.
