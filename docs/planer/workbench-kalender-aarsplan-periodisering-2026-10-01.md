# Workbench: kodeplan og oppdrag til Claude Design

Dato: 01.10.2026.

**Gjeldende WANG-destinasjon: bare WANG Golf UI prototype (`6cfa623c`). Hele WANG-omfanget samles der. Sendingen til WANG Toppidrett Software er trukket tilbake etter Anders' retting.** Bestilling: konkret plan for forbedret kalender, årsplan og periodisering, sendt til eksisterende Claude Design-prosjekt. Status: planlagt; ingen appendringer utført av denne oppgaven.

Planen er en avgrenset del av [lanseringsplanen](lanseringsplan-2026-10-01.md), og erstatter ikke andre arbeidsstrømmer. [Precision Athletics](../design-system/design-autoritet.md) og [treningsplanlegging](../treningsplanlegging.md) styrer retning og begreper.

## Tillegg: funksjonsdekning mot IUP 2027

Anders ba 01.10 om kontroll mot «Team Norway IUP 2027.xlsx». [Dekningsrapporten](../design-audit/workbench-iup-dekning-2026-10-01.md) kartlegger alle 18 ark mot kode på `f9c40e542`, inkludert konkrete mangler, kildeavvik og prioriterte leveranser. Hele IUP-en er ikke dekket av denne kalenderplanen eller dagens app.

K0 suppleres med feltkart for sesongevaluering, nivåtilpasset utviklingssjekk, prosessmål, kvartalsoppfølging, testprotokoller, faktisk treningsdagbok og støtteapparat. D1 må vise sammenhengen mellom Plan, Stats, Målsetning og Meg samt trenerens samlede IUP. Ingen ekstra IUP-fane innføres i PlayerHQ.

2027-filen har 34/43/47/38 utviklingsspørsmål, mens tidligere kilde har 34/41/41/38. Anders har deretter bestilt dekning av alle funksjonene i AK Golf HQ. Denne planen bruker derfor 2027-innholdet som ny kravversjon, med separate skalaer 1–4 for sesongevaluering og 1–5 for utviklingssjekk. Historiske svar beholder opprinnelig spørsmålsversjon og skala. Vedtatt klassetrinn/alder, målgrupper, AK-begreper og fysisk standardbatteri beholdes. Excel inneholder motstridende formler og historiske datoer; rapporten beskriver hva som må rettes eller defineres før implementering. Revisjonen er en krav- og implementeringsplan, ikke ferdig appkode.

## Bestilling 01.10: AK Golf HQ skal erstatte Excel

Anders: «Dekk alle funksjonene og se hvordan vi kan implementere dette inn i AK Golf HQ uten at det ender med en Team Norway app. […] Team Norway coach og Wang coach får oversikt over alt dette via trener skjermene når spillere har delt tilgang».

**Produktresultat:** Spilleren bruker én AK Golf-app til å planlegge, gjennomføre, registrere og evaluere utviklingen. Data eies av spilleren og lagres én gang. AK-coachen følger spilleren i AgencyOS. WANG og Team Norway viser de samme godkjent delte opplysningene i sine trenerflater. Organisasjonstilhørighet påvirker innsyn og relevante oppfølgingskrav, ikke hvem som eier spillerens historie.

«IUP» er trenerens samlevisning av en individuell utviklingsplan. PlayerHQ får ikke en ny Excel-lignende IUP-fane. Eksisterende organisasjonsprofiler på trenerflatene videreføres; hovedproduktet bruker Precision Athletics og AK-begreper. Testleverandør og kildeversjon kan hete Team Norway i metadata uten at hele produktet merkes slik.

### Hvor funksjonene skal bo

| Krav-ID / ark i Excel | Spillerens inngang | Felles funksjon og trenerens innsyn |
|---|---|---|
| X01 Intro | I dag og kontekstuell hjelp | Veiledet sesongstart, gjenoppta utfylling, tydelig hva som mangler. Trener ser fullføringsstatus og neste oppfølging. |
| X02 TN Coaches | Meg → Mitt team | Eget støtteapparat med fagrolle, ansvar og kontakt. En kontakt får ingen apprettigheter automatisk. |
| X03 Person info | Meg → Profil, Mitt team og Helse | Person-, klubb-, skole- og GolfBox-felt; ansvarlig og fagtrenere/foreldre; skade, medisinske forhold og allergier i beskyttet helsedel. Trener ser bare godkjent delt innhold. |
| X04 Evaluering spørsmål | I dag → Sesongevaluering | Tre fritekstsvar, ti spørsmål 1–4, faktisk/ønsket fordeling og forbedringspunkter. «Lag prosessmål» tar med kilde og begrunnelse. |
| X05 Målsetting og oppfølging | Målsetning og Stats → Utvikling | Alle måltall fra dekningsrapportens ark 3, historikk, kvartal, sesong, målsetning og datagrunnlag. Trener ser samme verdier, ikke en ny manuelt fylt tabell. |
| X06 Prosessmål | Målsetning → Handlinger | Overordnet målsetning, konkret handling, tidsrom, målekriterium, hjelper, fasilitet/utstyr, evaluering og koblede økter. |
| X07 Årsplan | Plan → År/Periode | Perioder, fem områders ukeprioritet, sted, mengde og hendelser. Eksempler per nivå blir valgfrie maler, aldri automatisk fasit for spilleren. |
| X08 Turneringsplan | Plan → Turneringer | Planlagte starter, WAGR Power med kilde/år, hull, datoer/uke, dager, land/tour, reise, nivåbalanse, forberedelse og evaluering. |
| X09 Ukeplan | Plan → Uke og Maler | Grunn/spesial/turnering med og uten konkurranse, treukerssyklus, tidsrom, øktantall og testplassering. |
| X10 Treningsøkter | Plan → Økt og I dag → Gjennomfør | Basisøkter, turneringsoppvarming, slagområde, formål, oppgaver/reps/tid, hovedområde, flere delområder, utstyr/antall og press. |
| X11 Utviklingssjekk | I dag → Oppfølging | Fire nivåer med 34/43/47/38 spørsmål, sju temagrupper, 1–5-skala, lagre underveis, historikk og tiltak. Automatisk fireukersoppfølging fortsatt bare for WANG/TN etter gjeldende vedtak. |
| X12 TN Tester Tot | Stats → Tester | Samlet testbatteri, resultat/dato/historikk, protokollbeskrivelse, egenført/kontrollert, nye tester og planlagt retest. Ingen ny registrering i trenerappen. |
| X13 Teknikktest | Stats → Tester → Teknikktest | Driver/J7/wedge, oppsett A/måling B, sju TrackMan-felt, PEI, statistikk, slagspredning og variasjon. Informasjonen i alle 24 diagrammer dekkes med valgbar måling/visning. |
| X14 Teknikkplan | Plan → Teknisk plan | Begrunnelse fra spill/test, nåværende og ønsket ballflukt/treff, GOBBS/bevegelse, øvelser, film, hjelpemidler og ferdiguke. Samme oppgave kan brukes i økter uten å miste opphavet. |
| X15 TN Fystester | Stats → Tester → Fysisk | Daterte råresultater, testserier og versjonert scoring. Hele arkets funksjon kan registreres som valgbare testprotokoller; gjeldende seksårsløp er fortsatt standardbatteriet. 3000 m/CMJ innføres ikke som obligatoriske tester. |
| X16 Treningsdagbok | Stats → Treningsmengde | Automatisk dag-/måned-/sesongoversikt fra gjennomførte økter; enkel etterregistrering av trening uten plan. Antall, faktisk tid og planlagt tid holdes atskilt. |
| X17 Statistics | Stats → Referanser | Referanser per avstand og ballplassering, PEI/SG/greenandel, datoperiode og utvalg. Utdypingslenker og eksempelgrafer legges ved relevant måling. |
| X18 Ref | Felles beregningsbibliotek | Versjonerte referanseverdier og grenseprøver, med forståelig kildeforklaring i Stats. Spilleren slipper et teknisk oppslagsark. |

Ingen krav-ID regnes som implementert bare fordi den har fått et sted i denne tabellen. Detaljfeltene og testlisten i dekningsrapporten er del av hver rad.

### Sammenhengende spillerreise

1. **Start sesongen:** profil/støtteapparat → evaluering → utvalgte utviklingsområder → resultat- og prosessmål. Kjente opplysninger gjenbrukes; delvis utfylling kan gjenopptas.
2. **Planlegg:** målsetning → år → periode → ukesyklus → økt. Konkurranser, reise, skole og tester vises i samme tidsperspektiv. Valgt spiller, sesong, dato og periode følger alle overganger.
3. **Gjennomfør:** åpne dagens økt/oppvarming/runde → registrer faktisk innhold → lagre. Dagbok, måloppfølging og testhistorikk oppdateres fra samme registrering.
4. **Vurder:** se utvikling og datagrunnlag → gjennomfør relevant fireukers-/sesongsjekk → velg tiltak → juster planen. Et forslag endrer ikke planen før riktig aktør har valgt det.
5. **Del:** Meg → Del tilgang → velg mottaker WANG eller Team Norway og verifisert trener → les nøyaktig omfang → godkjenn eller send til foresatt. Vis aktiv deling, hvem som kan se, dato og «Stopp deling».

På mobil løses én oppgave om gangen med gjenoppta og tilbake. På bred skjerm kan treneren sammenligne periode, måltall og tiltak. Begge bruker samme data og handlinger.

### Trenerskjermene

Trenerens spillerliste viser bare tillatte utviklingsdata. Organisatorisk medlemsliste kan ha en nøytral «Ikke delt»-status, men skal ikke lekke siste test, helsevarsel eller målsetning for spillere uten deling.

Spilleroversikten samler: sesongretning, målsetninger/prosessmål, planlagt mot faktisk trening, turneringer, testutvikling, tekniske oppgaver, siste evaluering, relevante helserammer, støtteapparat og avtalte neste tiltak. Trener kan fordype fra oppsummering til kilde. Delingsomfang og manglende data vises tydelig.

WANG-/TN-coachen kan skrive egen vurdering og foreslå endringer innen tildelte rettigheter. Spilleren godtar/avviser forslag; opprinnelig spillertekst endres ikke av en trenerkommentar. AK-coachens eksisterende direkte arbeidsflyt beholdes innen egen coachrelasjon, med historikk/angre. Kompetansemål og skoleoppfølging finnes bare i WANG-laget.

En person med både AK- og organisasjonsrolle må velge arbeidskontekst. WANG-/TN-innsyn må ikke utvides via en alternativ AgencyOS-rute. Tilbaketrekking for WANG fjerner WANG-innsyn, men sletter verken spillerens data eller et separat gyldig TN-/AK-forhold.

### Deling må være én kontrollert vei

Kontrollert kode på `f9c40e542`:

- `src/lib/deling/samtykke.ts` og `samtykke-regler.ts` har samtykkehistorikk og mottakergrupper.
- `src/lib/auth/ekstern-leser-scope.ts` kobler aktive lesere, medlemskap og samtykke.
- `src/app/team-wang/_data/wang-tilgang.ts` og `src/lib/domain/tn-arbeidsflate.ts:hentTnSpillerTilgang` gir fortsatt trenerinnsyn ut fra medlemskap/rolle uten den komplette delingskontrollen.
- `src/lib/auth/coached.ts` har gruppebaserte coachveier som må gjennomgås for å unngå at samme eksterne trener får en omvei.
- Samtykketeksten for `KOMPLETT_PROFIL` sier fortsatt at helse/private notater ikke deles. Tidligere produktvedtak om komplett innsyn kan ikke gis tilbakevirkende kraft overfor spillere som har godkjent denne teksten.
- Mindreåriges egen tilbaketrekking kan skrives, mens regel-leseren filtrerer bort SELV-rader. Ved likt tidsstempel viser eksisterende test at rekkefølgen i listen avgjør. Begge må få entydig, testet stopp av deling.

Foreslått felles serverfunksjon: `resolvePlayerAccess(viewer, playerId, organisationId, purpose)`. Den returnerer hvilke data som kan leses og hvilke handlinger som er lov. Hver liste, detalj, søk, eksport, fil og skrivehandling må bruke avgjørelsen før data hentes. ID-en i URL-en og en synlig knapp gir ingen rettighet.

Tilgang for WANG/TN krever aktiv, identifisert trener i riktig organisasjonskontekst og aktivt spillergitt samtykke for riktig mottaker og innhold. Et e-postdomene er bare et invitasjonsfilter. Det er ikke alene bevis på at vedkommende er trener. Invitasjonslenkens vedtatte syvdagersfrist er ikke det samme som varigheten på en etablert deling.

For komplett utviklingsinnsyn må ny tekst spesifisere alle delte datakategorier, inkludert helse og meldinger der gjeldende vedtak krever dette. Eksisterende smale samtykker forblir smale til spilleren/foresatt gir nytt samtykke. Under 16 følger gjeldende foreldregodkjenning. Rapport-/filtilgang og mellomlagrede visninger må stoppe sammen med delingen; allerede nedlastede dokumenter kan ikke fjernslettes.

### Felles data og kodeansvar

Modellnavnene nedenfor er forslag til implementering, ikke tabeller som allerede er opprettet. Eksisterende datamodeller utvides bare der det faktisk mangler felt; ingen parallell TN- eller WANG-database.

| Område | Gjenbruk | Konkret tillegg |
|---|---|---|
| Sesong og plan | `SeasonPlan`, `PeriodBlock`, `WeekPlan`, `WorkbenchSession` | Ukeprioritet per område, sted/opphold, versjonerte ukemaler og tydelig sesong-/rapportvindu. Skill øktens faktiske minutter fra plan og unngå dobbelttelling mellom gamle øktmodeller. |
| Målsetninger | `Goal`, målhandlinger og `maal-spor.ts` | Forelder–barn-kobling mellom resultat-/prosessmål; strukturert handling, startdato, målekriterium, ansvar/hjelper, ressursbehov, evaluering og referanser til plan/økt. |
| Evaluering | Felles spilleridentitet og sesong | `AssessmentTemplate`/`AssessmentResponse` med stabile spørsmåls-ID-er, nivå, versjon, skala, utkast/fullført, tidspunkt og historikk. Egen type for sesong, fireukerssjekk og utviklingssjekk. |
| Måltall | Runde-, SG-, test- og treningskilder | `MetricDefinition` og ved behov `MetricObservation` for manuelle/historiske tall: enhet, kilde, fra/til, antall målinger, målt/beregnet/manuelt. Kvartalsvurdering lagrer kildeversjon; levende beregning kan oppdateres uten å omskrive gamle vurderinger. |
| Testbibliotek | `TestDefinition`, `TestSession`, `TestResult`, TN-katalogens eksisterende protokoller | Generell katalog uavhengig av organisasjon. Leverandør/protokollversjon som metadata; alle råfelt, score, norm og måleenhet. Avklarte poengregler implementeres; uavklarte tester kan lagre rådata med «resultat ikke beregnet». |
| Teknikk | `TechnicalPlan`, `PositionTask`, målegrenser og testkobling | Ballflukt/treff før og ønsket etter, begrunnelse, kilde til funnet, hjelpemidler, video og frist. Bevar oppgave-ID/revisjon når den brukes i økter. |
| Turnering | `Tournament`, `TournamentEntry`, `WorkbenchTournamentPlan` | Power-verdi med referanseår/kilde, planlagt hullantall, runder, inkluderende dagsregnskap og nivåanalyse. Ikke bruk ranking eller annet feltstyrkemål som erstatning for Power. |
| Mitt team/helse | User, foresattrelasjoner, eksisterende helse- og skadefunksjoner | Fagroller og kontakt uten automatiske rettigheter. Manglende helsefelt i beskyttet modell, med eksport/sletting og tilgang i samme leveranse. |
| Treneroversikt | Spiller 360 og eksisterende WANG/TN-ruter | Felles `loadPlayerDevelopmentOverview` med samme spillerdata, feltdefinisjoner og beregninger. Separate visuelle rammer, ingen egne kopier av IUP-svar. |
| Tilbakemelding | Eksisterende forslag/oppfølging der formen passer | Felles forslag med kildeobjekt, revisjon, avsenderrolle, mottaker, status og spillerens beslutning. Konflikt dersom kildeobjektet endres før forslaget godtas. |

Anbefalte nye felles moduler ligger under `src/lib/player-development/` og `src/components/player-development/`. Eksisterende aktive moduler gjenbrukes via adaptere før eventuell flytting. Organisasjonsrutene skal bare velge kontekst og presentasjon. Nye felter skal ha eksport-/sletterute og omtale i datakartet fra første leveranse.

### Byggepakker som erstatter Excel

Disse pakkene utvider K0–K6; de er ikke en ny konkurrerende masterplan. Gjeldende main og pågående Workbench-portering må avstemmes før kodearbeid.

| Pakke | Berørte filer / ansvar | Konkret ferdig resultat |
|---|---|---|
| E0 · innsyn og kontrakter | `deling/*`, `auth/ekstern-leser-scope.ts`, `auth/coached.ts`, `wang-tilgang.ts`, `tn-arbeidsflate.ts`, portalens delingshandlinger | Felles felt-/rettighetsmatrise. Aktiv deling åpner bare riktig spiller/organisasjon; stopp av deling virker også via direkte lenke og alternativ rute. Nytt omfang krever nytt samtykke. |
| E1 · målsetning og vurdering | Foreslått `player-development/assessments/*`, eksisterende målhandlinger, `AG08Faner.tsx`, spillerens I dag | Fullføre X04/X06/X11 fra registrering til historikk og neste planlagte tiltak. 2027-spørsmål og gamle versjoner holdes atskilt. |
| E2 · plan og dagbok | K1–K4, Workbench-moduler, perioder, turneringshandlinger, faktiske tidsoppsummeringer | Fullføre X07–X10/X16; før/etter/under turnering, gjenbrukbare ukesykluser, etterregistrering og riktig faktisk tid på alle nivåer. |
| E3 · tester, teknikk og måltall | `portal-tester/*`, `domain/pei/*`, `teknisk-plan/*`, SG/statistikk og fysisk scoring | Fullføre X05/X12–X15/X17/X18, med kildeprøver og avklart scoring. Eksisterende målemetoder får ikke ny betydning uten ny versjon. |
| E4 · profil og trenerreise | Meg, `profil-flate-data.ts`, Mitt team, helse, `spiller360-data.ts`, WANG IUP, TN-spillerprofil | Fullføre X01–X03 og den samlede IUP-visningen for delte spillere. Endring hos spiller vises hos alle tillatte trenere uten ny registrering. |
| E5 · overgang og godkjenning | Egen import-/eksportadapter og ende-til-ende-prøver | Gammelt Excel-innhold kan overføres kontrollert; alle krav-ID-er prøvd; nye sesongdata kan registreres helt uten Excel. |

E0 starter først. E1 og feltene som E2/E3 trenger spesifiseres deretter. Sammenhengende deler prøves fortløpende; treneroversikten bygges på felles dataleser, ikke på særskilt kopierte skjemaer. Claude Design eier skjermleveranser, Codex eier kode og funksjonsbevis. Konkrete databasediffer og valgt skjermversjon må foreligge før avhengig database-/skjermbygging, i tråd med prosjektinstruksen.

### Overgang fra arbeidsboken

1. Bevar original som privat kilde. Les råverdier og cellereferanse, ikke bare mellomlagrede Excel-resultater. Vis dato-/enhets-/protokollavvik i forhåndsvisning.
2. Koble filen uttrykkelig til riktig spiller og sesong. Importer aldri alle kontaktpersoner som brukere eller trenere automatisk.
3. Forhåndsvis hva som blir opprettet, koblet til eksisterende data, hoppet over eller krever avklaring. Duplikatvern baseres på import-ID, kildecelle og spiller, slik at en ny kjøring ikke dobler historikken.
4. Import lagres med kilde, historisk dato, metode og versjon; tvetydige/feilberegnede tall blir ikke autoritative scorer. Spilleren kontrollerer før endelig overføring. Ingen faktisk import inngår i planarbeidet.
5. Behold lesbar sesongoppsummering og maskinlesbar eksport. Excel kan brukes som arkiv/utveksling, men skal ikke være nødvendig i den daglige arbeidsflyten.

### Bevis for at Excel kan tas ut av daglig bruk

Før løsningen kalles komplett skal en syntetisk spiller gjennomføre hele sesongreisen med alle X01–X18. Hver rad har separat status for design, kode, beregning, tilgang og prøvd brukerreise. Blokkerte testresultater er fortsatt åpne avvik, ikke «full dekning».

- Registrer, lagre, lukk og gjenåpne alle felter; rett tidligere registrering med sporbar historikk. Prøv feil, tomtilstand, lastetilstand og avbrutt lagring uten datatap.
- Én treningsøkt på 60 planlagte/45 faktiske minutter gir 45 i dagbok og 60 i plan, med samme summer hos spiller og trener. Øktantall summeres separat. Ukjent tid presenteres som ukjent, ikke automatisk planlagt eller null.
- Kvartal, sesong, årsskifte, uke 53, tidssone og 9/18-hullsrunder gir riktig avgrensning. Appens sesongstart uke 43 og Excel-rapportens oktober–september er navngitte, forskjellige vinduer.
- Alle måle-/poeng-/referanseformler prøves med syntetiske grenseverdier. Gate/Speed/Teknikktest merkes ikke ferdige før faglig protokoll er entydig. Feilene i arbeidsboken brukes som regresjonstilfeller.
- WANG delt/TN ikke delt; TN delt/WANG ikke delt; begge delt; ingen delt; trukket deling; utløpt invitasjon; tidligere gruppetrener; mindreårig uten/med foresatt; gammel smal samtykketekst; flere roller hos samme trener.
- Trukket samtykke stopper både oversikter, detaljer, søk, eksport, filer og forslagshandlinger. Spillerens egne data beholdes. Ingen beskyttet opplysning i tellere eller forhåndslastet nettleserdata uten tilgang.
- Spillerens svar, trenerens vurdering og trenerens forslag er ulike objekter. Å akseptere et forslag endrer riktig revisjon én gang; avslag og dobbeltklikk endrer ikke planen.
- 390 px og desktop viser alle nødvendige handlinger, kildeinformasjon og korrekt tilbakevei. Tidslinje/Planbord/Fokus kan utforskes som visninger av samme data; ingen av dem lager sin egen plan.

Ny kontroll i denne revisjonen: 35 målrettede delings-/WANG-tester besto som kontroll av eksisterende kode (samtykke-regler, samtykke og wang-tilgang). Grønne tester alene beviser ikke det nye tilgangsomfanget. Ingen produksjonsendring, nytt samtykke for ekte spillere eller apppublisering er utført.

## Resultatet vi skal bygge

Én sammenhengende Workbench: År → Periode → Måned → Uke → Økt. Valgt spiller/gruppe, plan, dato og periode beholdes når nivået endres. Årsplanen forklarer sesongen, perioden fordeler arbeidet, kalenderen viser tid og økter. Alle eksisterende funksjoner beholdes gjennom relevante innganger.

Coachens driftskalender og spillerens treningsplan bruker felles visuelle mønstre, men beholder ulike eiere, data og handlinger. «Ny booking» og «Ny økt» må fortsatt være ulike handlinger. Ingen ny integrasjon, endring av tilgang, databasemigrasjon eller automatisk publisering inngår i denne planen.

## Kontrollert utgangspunkt

- Repo: `c86b0408d`. Før bygging sammenholdes ny main og aktive endringer; planen autoriserer ikke overskriving av andre økter.
- Coach: `src/app/admin/workbench/[playerId]/page.tsx` monterer `src/components/workbench/WorkbenchAar.tsx`, `WorkbenchPeriode.tsx`, `WorkbenchManed.tsx` og `WorkbenchUke.tsx`.
- Spiller: `src/app/portal/planlegge/workbench/page.tsx` monterer `src/components/portal/v2/WorkbenchV2.tsx`. Gruppe: `src/app/admin/grupper/[id]/workbench/gruppe-aarsplan-klient.tsx` bruker `WorkbenchAarsplan.tsx`. De er ulike kodeflater; retting av én beviser ikke de andre.
- Driftskalender: `src/app/admin/kalender/page.tsx`, `src/components/admin/precision/AG05Kalender.tsx`, `src/lib/admin/kalender/faner.ts` og `src/app/admin/kalender/lag/data.ts`. Den har allerede Precision-komponenter; bygg videre på disse.
- Kodefunn: årsplanens uketype bestemmes delvis av `index % 3/4`; periode-ID går ikke gjennom `VisningPiller`; år sender januar til måned/uke; valgt månedsdag blir bare ukestart. Perioder får minimum 3 prosent bredde og feil avgrensning når de begynner før året. Null timer vises som «—».
- Lokal Precision-prototype kontrollert på 1440 × 880 og 390 × 844: første kalenderavtale omtrent 700 px ned på mobil, uten horisontal sideoverflyt. Årsplanens tomtilstand/skjema sett; befolket år/periode kildevurdert, ikke visuelt godkjent. Dette er ikke produksjonsbevis.
- Skyprosjektet er nyere enn den lokale pakken. Ved sending viser chatten en uferdig bundle-/AG-10-/Volum-kontroll og en melding om kvotegrense. Bare den allerede valgte PH-01-varianten er oppgitt visuelt godkjent. Bevar nyere kanoniske kilder og eksisterende kontrolloppgaver.

## Leveranser og rekkefølge

| Trinn | Ansvar / berørte filer | Konkret arbeid | Ferdig når |
|---|---|---|---|
| K0 · grunnlag | Codex: rutene over, `src/lib/domain/workbench/types.ts`, `src/lib/workbench/wb-actions.ts`, `perioder.ts`, `periode-core.ts`, `gruppe-periode-actions.ts` | Kartlegg én kontrakt for eier, plan, dato, periode, økt, kilde/revisjon og status. Registrer hvilke felt som finnes. Les sikkerhets-/personvernskills og installert Next-guide før senere kodeendring. | Hver skjerm og handling har kilde, skriver, leser og test. Manglende datastøtte er konkret beskrevet, ikke erstattet med demodata. |
| K1 · riktig informasjon og navigasjon | Codex: `visning-url.ts`, `VisningPiller.tsx`, coach-ruten, år/periode/måned/uke, `WeekGrid.tsx`, `src/lib/domain/workbench/operations.ts` | Bevar dato/periode ved nivåbytte og tilbake. Fjern konstruerte uketyper. Bruk lagret uketype der grunnlag finnes. Avgrens tidsbånd til sesongen, fjern minimumsvarighet i grafen og skill 0 fra ukjent. Rett «Åpne periode» som faktisk åpner uke. | Oktober forblir oktober; valgt fredag forblir fredag; årsskifte og éndagsperiode gir riktige datoer; 0 t og ukjent er ulike. Ingen nye skjermvalg kreves for rene feilrettinger. |
| D1 · skjermleveranse | Claude Design: eksisterende AG-05, AG-11 og PH-11-familier | Tegn og prøv spesifikasjonen under i ny, sporbar versjon. Bruk nåværende kanoniske Workbench-kilder. | Konkrete skjermer, klikkbare overganger, tilstander, komponentkoblinger og målbare 390/1440-bilder levert. Ikke merk automatisk valgt for bygging. |
| K2 · felles skall og kalender | Codex, etter valgt D1: `WorkbenchShell.tsx`, `SourcesPanel.tsx`, `SessionInspector.tsx`, `WorkbenchUke.tsx`, `WeekGrid.tsx`, `WorkbenchMinKalender.tsx`, `AG05Kalender.tsx`, `workbench-selected.css`, eksisterende Precision-komponenter | Nivåtilpassede sidefelt; kompakt mobilhode; tidsrutenett/agenda; opptatt tid på riktig klokkeslett; tilgjengelige filtre og detaljark. Del rene visningskomponenter, behold separate datalesere og tilgangsvakter. | Første relevante avtale vises innen første mobilskjerm med avtalt testdatasett; samme dag bevares; alle handlinger virker med tastatur og uten dra-og-slipp. Tilgjengelighet og Stall-dag beholdes. |
| K3 · årsplan | Codex, etter K1 og valgt D1: `WorkbenchAar.tsx`, `WorkbenchAarsplan.tsx`, gruppeklienten og eksisterende periodehandlinger | Bred sesongflate med perioder, hendelser og tid på samme akse; månedsliste på mobil; valgt detalj ved behov. Koble opprett/rediger til eksisterende autoriserte handlinger. Hendelser og treningsperioder skilles visuelt uten automatisk datamigrasjon. | Coach/spiller/gruppe leser riktig eier og dato. Opprett/rediger og avbryt prøvd med lagring og ny innlasting. Ingen funksjon forsvinner. |
| K4 · periode og måned | Codex: `WorkbenchPeriode.tsx`, `WorkbenchManed.tsx`, `YearPeriodePanel.tsx`, `WeekPlanEditor.tsx`, aktuelle domene-/lastefunksjoner | Fokus og mål øverst. Uker viser budsjett, planlagt og gjennomført på felles skala. Antall økter og minutter holdes separat. Vis hvor føringer kommer fra og hvilke ukevalg som er endret. Gjenbruk eksisterende beregninger der de er korrekte. | Tall kan spores til de samme øktene gjennom år/periode/måned/uke. Framtidige uker framstilles ikke som uteblitt trening. Endring i én uke overskriver ikke andre uker stille. |
| K5 · sammenheng og publisering | Codex: eksisterende `PublishConfirmDialog.tsx`, publiseringshandlinger, gruppeflyt, PlayerHQ-lesere og tester | Prøv lagret utkast → publisering → riktig spiller → samme økt; retting/tilbaketrekking, delvis feil, foreldet revisjon og bytte av eier. Bevar nylige gruppe-, etterlevelses- og TEK/FYS-rettinger. | Ingen utkastlekkasje, feil eier, dobbeltøkt eller tap av individuell endring i de avtalte prøvene. Lagret og publisert er tydelig forskjellige. |
| K6 · samlet godkjenning | Codex + Anders | Full kvalitetskontroll, innloggede syntetiske reiser og app ved siden av valgt design. Oppdater avviksregister med referanseversjon. | Funksjon, målinger og visuell vurdering dokumentert hver for seg. Push/merge/deploy følger separat uttrykkelig bestilling. |

K0 → K1 kan gjøres uavhengig av skjermdetaljer når kodearbeidet bestilles. D1 forbereder K2–K4. K2–K4 bygges i avgrensede deler, deretter K5–K6. Dette er arbeidsrekkefølge, ikke en ny lanseringsfrist eller ordre om å starte appendringer i denne planleggingsøkten.

## Dataavklaringer før avhengig kode

1. **Uketyper:** eksisterende `WeekPlan.weekType` har standardverdi. En manglende ukepost og et eksplisitt valg må ikke blandes. Ikke krev «valgt av coach» hvis historikken ikke beviser det; fjern først de oppdiktede visningsmerkene.
2. **Budsjett og gjennomføring:** `weeklySessionBudget` er antall, mens ukevolum er minutter/intervall. Gjennomført må følge prosjektets gjeldende kilde for registrert tid; planlagt varighet er ikke automatisk faktisk tid. Uke som deler to perioder eller år må avgrenses etter dato, uten dobbelttelling.
3. **Arv år/periode/måned/uke:** vis eksisterende opphav. Dersom modellen ikke lagrer eksplisitte overstyringer eller månedens føringer, lever et konkret forslag til lagringskontrakt før den delen bygges. Ikke legg skjulte nye felt i JSON eller endre skjema automatisk.
4. **Sesong og årsplan:** støtt eksisterende sesonggrenser. Flere årsplaner per eier og prototypefunksjoner må kontrolleres mot faktisk appmodell før planvelgeren får nye løfter.
5. **Gruppe:** bevar kilde/revisjon, egne versjoner og gjeldende utrullings-/publiseringsregler. Ny visuell sortering gir ingen ny rett til å overskrive spillerens plan.

## Konkret oppdrag til Claude Design

Viderefør **AK Golf Precision Athletics**, prosjekt `7d7c2994-cf63-4c5f-9bdc-fdaf67655a70`. Dette er bestilt videreutvikling i eksisterende system. Codex skal kode appen. Bevar PH-01 og nyere TEK-, lagrings-, kilde-/revisjons-, publiserings- og gruppefunksjoner. Ingen tilbakeføring til gamle AG-10-/demo-/arkivkilder. Uferdig tidligere verifikasjon registreres separat og må fortsatt fullføres før samlet leveranse.

**Skjermer:** AG-05 med dag/uke/måned/år og eksisterende øvrige innganger; AG-11, AG-11-AR, AG-11-PER/PERSKJEMA, AG-11-MND/MNDSKJEMA, årsplanoppretting og gruppeårsplan; tilsvarende PH-11-varianter. Behold gjeldende kanoniske ID-er der de er endret. Målsetninger, Volum, Stall og Live beholder tydelige innganger; å rydde nivåvelgeren betyr ikke å fjerne funksjonene.

**Kalender:** komprimer topplinjen; filtre samles bak tydelig filterknapp med aktivt antall på mobil. Synkdetaljer og forslag åpnes ved behov. Mobil bruker lesbar agenda/dagvelger. Desktop gir tidsrutenett og agenda. Vis start/slutt og opptatt tid; separate heldagshendelser. Datoklikk beholder dagen. Ingen ny kalenderintegrasjon eller påstand om fungerende ekstern synk fra demodata.

**Årsplan:** prioriter selve sesongen. Øvelsesbanken vises når oppgaven gjelder økt; på årsnivå åpnes periodedetalj ved valg. Felles månedsakse for perioder, hendelser og treningsmengde. Faktisk datolengde, årsskifte, i-dag-markør og klikkbare korte hendelser uten kunstig lengde. Mobil blir månedsliste. Viderefør eksisterende YearBand/YearList eller dagens kanoniske erstatning. Testuke, treningssamling og heldagssamling er hendelser etter siste språkavklaring, ikke nye treningsperioder.

**Periode/måned:** navn + eksakte datoer → fokus og målsetning → ukevis fordeling → fem akser. Hver uke viser budsjett, planlagte økter og gjennomført, med timer og øktantall atskilt. Vis lagret uketype/oppgitt kilde; ingen automatisk treningsrytme. Vis «fra periode/måned» og «endret denne uken» bare når data kan underbygge det. Framtid er framtid; 0 er null; «—» er manglende verdi. Graf får lesbart tabell-/listealternativ.

**Skisser å konkretisere:**

```text
Felles: Spiller/gruppe + valgt plan | År → Periode → Måned → Uke → Økt
År:     sesongdatoer + Ny periode | perioder / hendelser / tid | valgt detalj
Periode: datoer + Rediger | fokus + mål | uker: budsjett / planlagt / gjennomført
Uke:    dato + Ny økt | Tidsrutenett/Agenda + filtre | økter | ukens mengde
Mobil:  eier + kompakt nivåvalg | dato/dager | relevant innhold | detaljark ved valg
```

**Bevar funksjonene:** kildevalg, øvelsesbank, teknisk plan, fysisk program, turnering, maler, duplisering, serieendring, flytting, målsetninger, volum og publisering. Lag en før/etter-liste med ny inngang for hver berørt funksjon. Ikke skjul en fjernet funksjon bak «forenkling».

**Leveranse:** wireframes → klikkbare, detaljerte skjermer → komponent-/handlingskart → eksport med versjon og kontrollsum. Følg eksisterende Precision-tokens, Plex-typografi, grafitt primærhandling og avtalt rustregel. Lyst planleggingstema; ingen ny nattvariant. Kun syntetiske data. Bruk siste faktiske skyversjon og oppgi hva som er endret fra denne.

**Vis og prøv:** data/tom/laster/feil; lagret/ulagret; feil ved lagring; utkast/publisert/endret; foreldet kilde; delvis publisering; ingen perioder; mange hendelser samme dag; årsskifte. 390 × 844 og 1440 × 880 som hovedbilder, samt overflytkontroll på 768/1024/1280. Behold fokus og avbrutt skjema ved nivå-/eierbytte. Minst 44 px treffmål, tastatur og «Flytt» som alternativ til dra.

**Målbare krav:** første relevante kalenderkort fullt synlig innen første 390 × 844-skjerm i standard datasett uten å skjule nødvendig informasjon; ett klikk fra valgt uke i perioden til samme uke; dato/periode beholdes fram og tilbake; ingen horisontal rulling; graf og liste har samme tall; kjent null skilles fra ukjent; hver funksjon har en synlig inngang. Ikke merk skjermene som visuelt godkjent eller valgt for bygging uten Anders' konkrete valg.

Svar kort med skjerm-ID-er og lenker, eksakt versjon, endrede filer, prøvde reiser/bredder, faktiske kontrollresultater og gjenstående avvik. Hvis kvote stopper utføring: bekreft mottatt oppdrag og nøyaktig hva som gjenstår; ikke oppgi at design er endret.

## Testplan for Codex

- Utvid eksisterende `visning-url.test.ts`, `calendar-layout.test.ts`, `min-calendar.test.ts` og `src/lib/domain/workbench/operations.test.ts`. Nye prøver legges nær ansvarlig funksjon; ikke opprett dupliserte testmotorer.
- Datoer: 31.12 → 01.01, skuddår, Oslo/sommertid, deluke og periode som starter før synlig sesong. Kort hendelse må ikke forlenge tidsskalaen.
- Navigasjon: valgt fredag → måned → periode → tilbake; valgt økt → lagring → tilbake; eierbytte nullstiller bare ugyldige objektvalg. Sidevaktene kontrollerer alle mottatte ID-er.
- Mengde: 0, ukjent, antall, minutter, planlagte/gjennomførte data, to perioder i samme uke og flere treningsakser. Ingen dobbelttelling eller framtidig uteblitt-status.
- Syntetisk lokal reise med coach A/spiller A, coach B/spiller B og gruppe: opprett → rediger → publiser → spiller leser → tilbake. Prøv tillatt og avvist tilgang, feil og ny innlasting. Eksisterende sidevakter beholdes.
- Per kodeleveranse: relevante tester, deretter `npm run verify`; dokumenter også `npm run prosjekt:sjekk`. Innloggede nettleserreiser og visuell sammenligning er egne kontroller utover fullkontrollen.
- Appbilder mot eksakt valgt designeksport ved 390/1440. Rapporter referanse, datagrunnlag, avvik, test og Anders' vurdering separat.

## Status og overleveringskvittering

- Planen er skrevet på egen `codex/workbench-ux-plan-2026-10-01`-gren. Ingen appkode, database, tilgang eller produksjon er endret.
- Hele planen og bestillingen er sendt som 97 linjer innlimt tekst til [eksisterende Claude Design-prosjekt](https://claude.ai/design/p/7d7c2994-cf63-4c5f-9bdc-fdaf67655a70). Chatten bekrefter mottak, og viser `Edited status.md`. Claude oppgir at oppdraget er registrert med Codex som kodeeier.
- Claude stopper ved oppgitt 90 prosent ukekvote. D1-skjermene er ikke påbegynt; ingen designendring eller ny testkjøring er bekreftet. Den tidligere bundle-/AG-10-/Volum-verifikasjonen står fortsatt som uferdig.
- Dokumentkontroll `npm run prosjekt:sjekk` bestått. Eksistensen av 13 eksplisitte kodefilstier kontrollert. Ingen app-/databasetester kjørt i denne planleggingsøkten.
- D1 og K0–K6 er planlagte leveranser, ikke fullførte oppgaver. Neste kodeleveranse er K0/K1 når utføring bestilles; neste designleveranse er D1.

## Oppfølging etter «Fortsett», 01.10 kl. 20.50

Claude Design har mottatt fortsettelsesbeskjeden og viser faktisk filbehandling. Den tidligere stoppmeldingen ved 90 prosent er derfor ikke bevis for en absolutt sperre. Ferdige D1-skjermer og nye kontrollresultater er ennå ikke bekreftet.

En annen aktiv oppgave porter allerede Workbench på grenen `codex/precision-workbench-port`, fra samme grunncommit. Den arbeider i rutene, visningsvelgeren, år/periode/måned, datalasteren og domenet. Denne oppgaven har derfor ikke startet en konkurrerende implementering i de samme filene. Kartleggingen under er underlag for porteringen; den er en kildekontroll av pågående arbeid, ikke en fullført kode- eller visuell godkjenning.

### K0: konkret datakontrakt

| Begrep | Verifisert kilde og begrensning | Krav til lesing, endring og kontroll |
|---|---|---|
| Eier og plan | `SeasonPlan.userId`, unik kombinasjon `userId/year`; gruppe har egen modell. `WorkbenchSession.playerId`, `groupId`, `sourceGroupSessionId` har forskjellige roller. | Behold eksisterende tilgangsvakter. En planvelger kan ikke love flere planer per spiller og år med dagens unike nøkkel. Prøv spiller A/B og gruppe separat. |
| Sesong og dato | `SeasonPlan.startDate/endDate`; øktens lokale dato og `startMinute`. Årsleseren avgrenser i dag til kalenderår. | Skill synlig kalenderår fra planens sesonggrenser. Navigasjon må bære valgt dato, med utledet uke/måned/år. Bevar kalenderdato gjennom Oslo/sommertid; ikke bruk UTC-konvertering som flytter dagen. |
| Periode | `PeriodBlock.id/seasonPlanId`, start/slutt, fase, fokus. `periode-core.ts` oppretter, oppdaterer og sletter; autorisert eier kommer fra kallende handling. | Behold servervalidering og eierskapskontroll. Ikke utled periode fra radnummer. Kontroller at mottatt periode-ID tilhører den lastede eieren/planen. Lagre → last på nytt → samme dato/fokus. |
| Uketype | `WeekPlan`, unik `playerId/isoYear/weekNumber`, valgfri `seasonPlanId`; `weekType` har standard `UTVIKLING`. | Manglende rad skal være ukjent. Lagret standardverdi beviser ikke et aktivt coachvalg. Ingen `index % 3/4` i presentasjonen. ISO-ukeåret kan avvike fra kalenderåret. |
| Øktbudsjett | `PeriodBlock.weeklySessionBudget`, lest med `parseSessionBudget`; manglende/tomt/ugyldig blir null. `{TEK: 0}` er gyldig nullbudsjett. | Vis antall økter, ikke timer. Ikke bruk `budsjettSum` alene til å avgjøre om grunnlaget finnes, siden både manglende og kjent null gir sum 0. Prøv null, tomt, eksplisitt 0 og positivt antall. |
| Tidsbudsjett | Periodens `weeklyVolMin/Max` er minutter; ukens `plannedHoursFys/Tek/Slag/Spill/Turn` er timer. | Konverter enhet eksplisitt ved grensen. Ikke vis antall økter som timebudsjett eller kall et avledet tall et lagret månedsvalg. |
| Gjennomført | Domenets `WorkbenchSession.actualMinutes` er valgfritt; `durationMinutes` er planlagt. År/periode/måned summerer fortsatt planlagt varighet for gjennomførte økter. | Avklar og gjenbruk eksisterende kilde for faktisk registrert tid i alle nivåer. 60 planlagt / 45 registrert må ikke vises som 60 faktisk. Manglende registrert tid må ikke stille bli et målt nulltall. |
| Kilde og revisjon | Økt: opphav, gruppe-ID, `localOverride`, `updatedAt`, publiseringsfelter. Periode: `sourceGroupId`, men ingen generell revisjonsnøkkel i den inspiserte `PeriodBlock`-modellen. | Vis bare dokumentert opphav. Ikke lov konfliktkontroll for perioder med en revisjon som ikke finnes. Bevar eksisterende øktkonflikt- og gruppebeskyttelse. Eventuelt nytt lagringsbehov behandles separat. |
| Status | Øktstatus, godkjenningsstatus, `publishedAt` og `hiddenByPlayer` er ulike felt. | Lagret utkast er ikke publisert. Skjult eller avvist økt er ikke slettet. Prøv lesing før/etter publisering, avvisning og individuell endring. |

### K1: åpne kontrollpunkter i pågående portering

Kildekontroll kl. 20.50, ikke ferdigmeldt kode: ny `workbenchUrl` støtter `agency/player` og `niva`, og år/periode får opprettings- og redigeringsinnganger. Følgende opprinnelige problemer er fortsatt synlige i de inspiserte filene:

1. **Dato forsvinner fortsatt:** URL-hjelperen beholder bare felt for målnivået; månedens daglenke sender bare ukestart. Innfør én normalisert navigasjonskontekst og bruk den i alle lenker. Behold gamle `vis`-lenker som kompatibel inngang. Utvid eksisterende URL-tester med fredag 02.10.2026 → måned → periode → uke → samme fredag, samt tilbakeknappen og spillerflaten.
2. **Oppdiktet ukerytme:** årsplanen bruker fortsatt `index % 3/4`. Fjern disse markørene først; les reelle `WeekPlan`-rader for valgt eier når uketyper tegnes. Test manglende rad og uke 53 over årsskiftet.
3. **Perioder tegnes for lange:** `periodePosisjon` bruker fortsatt minimum 3 prosent og full `widthPct` selv når starten klippes. Beregn synlig start = maks(start, årsstart), synlig slutt = min(slutt, årsslutt), og utelat tomt snitt. Vis større treffområde separat fra den målte lengden. Test 31.12.2025–02.01.2026 (to synlige dager), én dag og periode helt utenfor året.
4. **Feil handlingstekst:** mobilens «Åpne periode» åpner fortsatt første uke. Bruk «Åpne uke» på den inngangen, og bevar valgt periode i returkonteksten.
5. **Tall må kontrolleres samlet:** test kjent 0 mot ukjent og faktisk mot planlagt tid i alle tre nivåer. Det er utilstrekkelig å rette én etikett eller én summering. Kontroller deluke mellom to perioder uten dobbelttelling.

**Presisering om gjennomføring:** `wb-map.ts` viderefører `actualMinutes`; `completeSessionWithEffort` validerer registrert tid fra 1 til 1 440 minutter eller null. `src/lib/domain/workbench/load.ts` bruker registrert tid, med planlagt tid som reserve for belastningsberegning. `compliance.ts`/etterlevelse vurderer gjennomførte planminutter. Disse er ulike måltall. Behold etterlevelsesreglene; en graf merket faktisk registrert tid må bruke registrert tid og opplyse om manglende grunnlag. Ikke endre belastnings- eller etterlevelsesregler som en sideeffekt av nytt design.

Disse kontrollene legges i de eksisterende testfilene angitt over ved implementering. K0 er konkretisert i denne planen; K1 er fortsatt åpen. Ingen appendring, databasehandling, sammenslåing eller lansering er utført av denne oppgaven.


## Tre alternative Workbench-retninger, 01.10.2026

Ny bestilling fra Anders: fortsett og foreslå tre ulike design. Precision Athletics er fortsatt systemet; alternativene gjelder arbeidsmåte og informasjonsrekkefølge.

| Kandidat | Hovedgrep | Styrke | Avveining |
|---|---|---|---|
| Tidslinje | År med perioder, hendelser og mengde på felles akse; velg periode og uke. Mobil som månedsliste. | Sesongoversikt og periodisering. | Små perioder og detaljredigering trenger fordypning. |
| Planbord | Periodekort og uker ved siden av hverandre; budsjett per akse. Egen kalendervisning. | Sammenligne og fordele arbeid. | Kronologi og klokkeslett er mindre tydelige. |
| Fokus | Én stor arbeidsflate; kalender/agenda først. Verktøy og detaljer åpnes ved behov. | Daglig bruk, lite støy og mobil. | Sammenligning krever flere åpninger. |

Tre statiske prinsippskisser og vurderingsdokument er levert privat under Documents/Claude/akgolf-hq/workbench-tre-design. Skissene er ikke ferdig app, målte mobilvisninger eller valgt designversjon. De bruker syntetiske data og nøytral erstatningsfont. Alle bildene er visuelt inspisert.

Bestillingen med alle tre retninger er faktisk sendt til eksisterende Claude Design-prosjekt. Den krever en sammenligningsside, 390/1440, tilstander og klikkbar År → Periode → Uke → Økt. Tidligere kontroller bevares og kan ikke merkes bestått uten kjøring. Ingen kandidat er valgt for bygging; annen aktiv kodeportering er bevart.


## Kvittering: samlet Excel-erstatning og trenerdeling

01.10.2026: den utvidede designbestillingen med X01–X18, én spillerprofil, felles data og organisasjonsstyrt trenerdeling er sendt til [eksisterende Claude Design-prosjekt](https://claude.ai/design/p/7d7c2994-cf63-4c5f-9bdc-fdaf67655a70). Meldingen og vedlagt tekst på 37 linjer er synlige i samtalen; Claude Design viste pågående arbeid. Dette bekrefter mottatt bestilling, ikke ferdig eller godkjent design.

Personfri kildemal med 162 utviklingsspørsmål og 13 sesongspørsmål er lagret privat som `~/Documents/Claude/akgolf-hq/ak-golf-utviklingssjekk-2027-kildemal.json`. Filopplasting i nettleseren var ikke tilgjengelig. Funksjonskartet er sendt som tekst; de eksakte spørsmålstekstene er fortsatt et eget overleveringspunkt. Originalarbeidsboken og personopplysninger er ikke sendt til Claude Design. Mottakeren er uttrykkelig bedt om ikke å ferdigmelde spørsmålsdekning før kildemalen er kontrollert.

Planen dekker alle 18 funksjonsområder. Implementering, retting av delingskontroll, full dataoverføring og sluttprøving gjenstår. 35 eksisterende tilgangs-/samtykketester bestod i denne oppgaven; dette dokumenterer dagens oppførsel og bekrefter ikke at de beskrevne gapene er rettet. Dokumentkontrollen `npm run prosjekt:sjekk` bestod. Ingen appkode, databaseskjema, faktisk tilgang eller produksjon er endret.


## Historisk kvittering: sending før Anders rettet WANG-destinasjonen

Anders bestilte uttrykkelig sending til Precision, Team Norway og WANG Toppidrett. Bestillingene er nå sendt og synlige i følgende eksisterende prosjekter:

| Designprosjekt | Bestilt omfang |
|---|---|
| [AK Golf Precision Athletics](https://claude.ai/design/p/7d7c2994-cf63-4c5f-9bdc-fdaf67655a70) | Spillerreisen og AK-trenerreisen, samme X01–X18-kontrakt og tidligere manglende eksakte spørsmål. |
| [Team Norway App delivery](https://claude.ai/design/p/bc3e41fc-0386-4624-9b14-27355b64e2f7) | Gjeldende Team Norway App.dc.html: treneroversikt, spillerprofil/IUP, plan, mål, tester og deling. Eget TN-designspråk. |
| [WANG Golf UI prototype](https://claude.ai/design/p/6cfa623c-b2c7-494f-b1bd-9c254b02f335) | Golfdetaljene, særlig WANG-44 elevprofil/IUP, WANG-45 utviklingssjekk, WANG-08 testdag, WANG-22/23 tester og tilhørende planlegging. |
| [WANG Toppidrett Software](https://claude.ai/design/p/e77c6ef7-d31a-47d9-a336-7f4e0ee9359f) | Felles trenerhjem, elevliste, skole-/idrettskontekst, tilgang og innganger til golfprofilen. Skal ikke bygge en parallell golfprofil. |

Den tidligere utestående spørsmålsleveransen er fullført som personfri tekst i Precision, Team Norway og WANG Golf: alle 162 utviklingsspørsmål og 13 sesongspørsmål med eksakt ordlyd, kildecelle, nivå og skala. Filopplasting var ikke nødvendig. Originalarbeidsboken/persondata er ikke sendt. WANG Toppidrett Software mottok koblingskrav og funksjonskart, med tydelig henvisning til Golf-prosjektet som eier golfdetaljene.

Alle prosjekter fikk samme regler om spillerens dataeierskap, organisasjonsspesifikt samtykke og tilbaketrekking, historiske skjemaversjoner og bevaring av nyere avklarte testprotokoller. Gjeldende alders-/klassetrinnsregler beholdes. Eldre 2025-svar skal ikke omskrives til 2027-skala.

Bekreftelse: alle fire meldinger er synlige i sine samtaler. Precision har svart med videre arbeid og åpne kontrollpunkter; Team Norway har kvittert med restliste. WANG-prosjektene viste pågående behandling. Dette er bevis på overlevering, ikke fullført design eller fungerende dataintegrasjon. Faktisk sendte tekster og kvitteringsbilder ligger privat i Documents/Claude/akgolf-hq som designbestilling-*/designoverlevering-* med dato 2026-10-01.


## Gjeldende retting: bare ett WANG-prosjekt

Anders: «Ikke to ulike Wang prosjekter. Wang UI prototype».

Hele WANG-leveransen for denne bestillingen eies av [WANG Golf UI prototype](https://claude.ai/design/p/6cfa623c-b2c7-494f-b1bd-9c254b02f335), også trenerhjem, elevliste, skole-/idrettskontekst og deling. Tidligere foreslått todeling mot WANG Toppidrett Software var feil. Bestillingen dit er trukket tilbake og pågående kjøring stoppet. Eksisterende andre arbeider skal bevares.

Rettelsen er sendt og synlig i WANG UI-prototypen, Precision og Team Norway, samt som tilbaketrekking i Software. Det er tre gjeldende designprosjekter: Precision, Team Norway App delivery og WANG Golf UI prototype. De tidligere kvitteringene med fire destinasjoner er historikk og ikke gjeldende ansvarsfordeling. X01–X18, spørsmålsleveransen og delingskravene består.


## Designrunde: sammenhengende spiller- og trenerreise

Anders bestilte «Fortsett designet». Arbeidet er videreført i de tre gjeldende Claude Design-prosjektene, med syntetiske data og personfri spørsmålsmal.

- Precision: klikkbar IUP-/evalueringsreise i `ui_kits/iup-excel/iup.html` med spillerens fem innganger. År, periode, måned, uke, økt og turneringer er koblet til samme valgte kontekst. Nye prosessmål kan gå videre til plan og registrering. Prototypekontroller er samlet bak lukket åpning og Plex-typografien ryddet. Ingen av de tre Workbench-kandidatene er valgt for bygging.
- Codex har prøvd Precision-eksemplet med 60 planlagte og 45 registrerte minutter. WANG-tilgang kunne trekkes mens TN var aktiv; WANG-treneren viste ingen data. Dette er prototypeprøver, ikke bevis på sikker tilgang i appen.
- WANG UI: faktisk klikket trenerhjem → elevprofil → IUP → sesongevaluering. 2027-utviklingssjekk og 2025-historikk er adskilt. Designverktøyet rapporterer også forslag, avvisning, konflikt og lagringsfeil prøvd. Disse kontrollene er ikke alle gjentatt av Codex.
- Konkret WANG-avvik funnet: «Delvis gjennomført teller halv tid». Rettelse er bestilt til registrerte faktiske minutter, med 60/45, 60/0 og ukjent som separate prøver.
- Team Norway: faktisk skjermbygging pågår i `Team Norway App.dc.html`; sluttresultat og kontroll avventes.

**Bevisbegrensning:** Codex sin siste forespurte viewport-overstyring til 390/1440 slo ikke gjennom: nettleseren målte 1665 × 917. De siste bildene med mobil/desktop i filnavn er derfor ikke gyldige bevis for de navngitte breddekravene. Precision er varslet og bedt om egen faktisk måling og visuell kontroll. Årsplan og WANG-evaluering er sett i ordinær desktopbredde. Breddekrav, tastaturflyt og full deling må fortsatt bekreftes der de mangler.

Ingen appkode, database eller produksjon er endret i denne designrunden. Full X01–X18-dekning er ikke ferdigmeldt. Neste leveranse skal lukke dokumenterte avvik og gjenstående test-/statistikk-/kildevisninger, deretter knytte valgt design til konkret kodeimplementering.


### Sluttkontroll fra designverktøyet

- Precision rapporterer faktisk iframe-bredde 390/1440, ingen overflyt, tilstrekkelige treffmål på de prøvde planflatene, bevart dato, årsskifte, 0/ukjent, 60/45 og separat tilbaketrekking. Forkortede akseoverskrifter er rettet. Faktisk tastaturrekkefølge og skjermbilder ved disse breddene er fortsatt ikke kontrollert. Målefil: `ui_kits/iup-excel/maal.html`. Dette er verktøyets rapport, ikke Codex-gjentatt måling.
- Team Norway har levert nye faktiske skjermer for IUP2027, sesongevaluering, samlet delt treneroversikt, forslag og delingstilstander. Rapporterer 144 målekombinasjoner uten avvik. Codex har kontrollert at den oppdaterte oversikten finnes i den synlige prototypen. Feil akser i sesongfordelingen er korrigert etter kildekontroll mot `docs/treningsplanlegging.md`: Fysisk, Teknisk, Golfslag, Spill, Turnering. Eksakte kildespørsmål og historikk skal være urørt. Tastatur, dobbeltklikk, Excel-beregninger og full dekning gjenstår.
- WANG: den bestilte rettingen fra halv tid til faktisk registrerte minutter behandles fortsatt. Skal følges opp og ikke omtales som ferdig før resultatet er bekreftet.

Private skjermbilder viser årsplanen og WANG-sesongevalueringen i desktop. Ingen visuell godkjenning fra Anders er registrert. Dokumentkontrollen `npm run prosjekt:sjekk` bestod.


### WANG-tidsretting bekreftet av designverktøyet

WANG har nå lagret retting i Elevprofil og register: faktisk registrerte minutter erstatter automatisk halv tid. 60/45 gir45min og75%,60/0 gir0 og0%,ukjent gir—. Gjennomføringsstatus er separat. Uke39/økt/IUP/sammendrag bruker samme data. To observerte mobilbrudd i overskrift/økter er rettet. Designverktøyet rapporterer112 målekombinasjoner og sette bilder i simulert390 og skalert1280. Dette er prototypebevis; dagbok/etterregistrering og fullX01–X18 gjenstår.


## Ny bestilling: fire Workbench-forslag med Opus 5.5

Anders avviste det viste resultatet: «dette ser ikke bra ut» og bestilte flere forslag med Opus 5.5. Årsplanutkastet skal derfor ikke brukes som valgt design for kodeportering.

Modellen er faktisk byttet fra Sonnet 5.5 Medium til Opus 5.5 Medium i Precision-prosjektets modellvelger, bekreftet i grensesnittet. Ny designbestilling er sendt og behandling startet. Det er ikke gjort modellbytte eller nye bestillinger i WANG/Team Norway.

| Retning | Hovedflate | Hva skal sammenlignes |
|---|---|---|
| Sesongkart | Tidslinje med perioder, turneringer, tester og mengde | Oversikt og fordypning fra år til økt |
| Ukeverksted | Kalender med øktblokker og øvelsesbibliotek | Opprette, flytte, kopiere og angre raskt |
| Trenerbord | Matrise med spillere/grupper og dager/uker | Felles plan med individuelle tilpasninger |
| Analyse til tiltak | Analyse og plan side om side | Datagrunnlag → mål → tiltak → økt |

Alle får samme syntetiske sammenligningscase og Precision-profil. Bestillingen krever fire faktisk ulike komposisjoner, høy visuell kvalitet, hovedskjerm på desktop og mobil390, 2–3 klikkbare særtrekk per kandidat og en samlet sammenligningsinngang. Funksjonsbehovet fra X01–X18 bevares i kartet, uten å fylle forsiden med alle feltene. Ingen kandidat velges automatisk. Bestillingen ligger privat som `workbench-opus-5-5-fire-retninger-2026-10-01.txt`.

Status ved bestilling: behandling pågår; ingen nye ferdige design eller målinger er bekreftet ennå.


### Opus 5.5: fire faktiske kandidater levert

Sammenligning: https://claude.ai/design/p/7d7c2994-cf63-4c5f-9bdc-fdaf67655a70?file=ui_kits%2Fworkbench-retninger%2Findex.html&present=1

Alle fire er tegnet og klikkbare. Codex har sett A i full desktopvisning og A/B/C/D med desktop-/mobilrammer i sammenligningen. Ukevalg til uke42 i A er prøvd og viste riktig utfoldet uke. Opus rapporterer egne målinger ved faktisk iframe390/1440, kontroll av utvalgte interaksjoner,60/45,konkurranse-/reisedager og tilpasninger i mobil. Disse målingene er ikke alle gjentatt av Codex. Tabrekkefølge og faktisk dra/slipp er åpne. Sesonggrensen må kontrolleres mot gjeldende produktregel før eventuell kodeportering.

Codex fant at ÅpneB gikk til en direkte claudeusercontent-lenke med «preview token required». En avgrenset retting er sendt: fungerende HTML-innganger i Claude-presentasjonsrammen eller intern stor visning; ingen omgåelse av tilgang. Samtidig bestilt tydelig enhet/skala på mengdegraf og konsekvente fremtid/ukjent/0-verdier og tidsformat. Rettelsen pågår ved denne registreringen.

Foreløpig designvurdering: A gir vesentlig tydeligere tidsoversikt enn avvist kortliste; B støtter daglig planlegging; C er relevant for trenerens mange spillere; D kobler observasjon til konkret endring. A+B anbefales vurdert som hovedflater, med C/D for de respektive treneroppgavene. Ingen kandidat eller kombinasjon er valgt av Anders.


### Sluttkontroll: Opus-forslagene kan sammenlignes

Opus rettet alle åtte kandidat-/mobilinnganger til navngitte filer og samme ramme. Codex har faktisk klikket ÅpneB i Claude-presentasjonen: Ukeverksted lastet uten tokenfeil. Flyttet en syntetisk økt med starttidsknapp og prøvde Angre, som gjenopprettet forrige tidspunkt. Sammenligningen ble deretter lastet på nytt. Alle åtte lenker er ikke gjentatt av Codex; Opus rapporterer egne klikk-/bredde-/treffmålkontroller. Verifikatorens tre siste treffmålfunn er rapportert rettet; full ny verifikatorrunde er ikke bekreftet.

Kandidatinnganger i `ui_kits/workbench-retninger/`: `A-Sesongkart.html`, `B-Ukeverksted.html`, `C-Trenerbord.html`, `D-Analyse-til-tiltak.html`, hver med `-mobil.html`. Kode/data er felles. Grafen i A har nå timeskala, og tidsformatet er rettet til timer/minutter. Fremtidige registreringer markeres som kommende.

Codex har sett alle fire i sammenligningen, A og B i full desktop. Bilder er lagret privat under `workbench-opus-*`. Mobilvisningene er iframebaserte, ikke prøvd på fysisk telefon. Åpne punkter: tastaturrekkefølge, faktisk dra/slipp, sesonggrense og full funksjons-/implementeringsdekning. Ingen appkode eller produksjon er endret. Dokumentkontroll bestod før sluttregistreringen; kjøres på nytt etterpå.


## Kombinasjon valgt 02.10.2026

Anders ønsker alle fire visningene kombinert med komplett trenerfunksjon. Denne beslutningen erstatter de tidligere avsnittenes «ingen kandidat eller kombinasjon valgt». [Samlet trenerflate og kodeplan](workbench-samlet-trenerflate-2026-10-02.md) beskriver videre arbeid. Bestillingen er sendt i samme Precision-prosjekt med Opus 5.5 Medium; fullført kombinert design er ennå ikke kontrollert.
