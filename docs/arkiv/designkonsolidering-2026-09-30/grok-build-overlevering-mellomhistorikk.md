# Precision Athletics → kodeoverlevering

Oppdatert 30.09.2026. Claude Design eier designet og Codex eier appkoden etter Anders’ senere arbeidsdeling. Filnavnet er beholdt for tidligere Grok Build-lenker; samme presise underlag kan leses av begge kodeverktøy. Dette er kontrakten for å gjøre Anders' valgte skjermer entydige å bygge. Den er et arbeidsgrunnlag; endelig byggepakke blir først komplett når konkrete skjermversjoner, datakoblinger og avvik er registrert. Designgodkjenning og fungerende app kontrolleres hver for seg.

Registrerte konkrete skjermvalg står i [godkjenningsregisteret](skjermgodkjenninger.md). PH-01 er valgt i den viste 390 px-tilstanden med dialogen «Endring i dagens plan» åpen. Bruk bildeidentiteten i registeret ved kobling til kildeeksport; ikke utvid valget til andre visninger automatisk.

## Én inngang, én frosset versjon

Pakken skal inneholde `readme.md`, skjermregister, [knapp- og skjermkart](knapp-og-skjermkart.md) med [maskinlesbart register](knapp-og-skjermkart.json), komponent-/ressurskilder, syntetiske data, funksjonskoblinger, kontrollbevis og restliste. Registrer prosjekt-ID, eksportdato, SHA-256 (filkontroll), nøyaktig Git-versjon og Anders' valg per skjerm. En levende Claude Design-lenke alene er ikke en låst byggeinstruks.

Designautoritet er [Precision Athletics](design-autoritet.md). Funksjon og språk følger [produktreglene](../platform/BUSINESS-RULES.md) og [treningsplanlegging](../treningsplanlegging.md). Sistnevnte er master for begreper og planregler ved konflikt. FYS/TEK/SLAG/SPILL/TURN, ett område/fokus, S1–S5 og synlige Gratis/Full videreføres fra gjeldende master. Et nytt visningsnavn endrer ikke automatisk interne tilgangsnivåer eller priser.

## For hver skjerm, også overlegg

Bruk [skjermkontrakten](../../.claude/skills/ak-hq-design/assets/skjermkontrakt.yaml). Ingen obligatorisk kobling kan stå skjult som en antakelse.

| Felt | Hva Grok må kunne lese |
|---|---|
| Identitet | Skjerm-ID, rolle, brukeroppgave, valgt versjon, kildefil/kontrollsum og faktisk apprute |
| Reise | Hvorfra brukeren kommer, neste handling, tilbakevei, historiske ruter og nødvendige videresendinger |
| Utforming | Faktiske tokennavn/verdier, komponenter/varianter, layout, avstander, typografi, grafskala og ressurser |
| Responsiv oppførsel | 390 px og desktop, avtalt nettbrett, hva som brytes/flyttes/ruller, lange tekster og tastatur |
| Data | Felt, type, enhet, validering, datakilde/beregning, periode og behandling av manglende data |
| Handlinger | Utløser → eksisterende kodefunksjon → adgangskontroll → resultat, feil og korrigering/angre |
| Lagring | Hvilke modeller/felt som brukes, når serveren bekrefter, ventende/feilet tilstand og nettbrudd |
| Publisering | Hvem bekrefter, hvilken revisjon blir synlig for spilleren, konflikter og eventuell tilbaketrekking |
| Tilgang | Egen spiller, coachens tildelte spiller, assistant coach, forelder og avvist/lesetilgang der relevant |
| Kontroll | Konkret funksjonsprøve, visuell sammenligning, resultat, kjent avvik og Anders' kommentar |

Data/tomt/lasting/feil er minimum. Tegn også relevante utkast, redigering, lagring, publisering, avbrutt/fullført, filfeil og avvist tilgang. Inaktive eller irrelevante tilstander begrunnes. Prototypens lokale tilstand, browser-lagring og setTimeout er simulering, aldri en byggeinstruks for faktisk lagring.

## Eksakt mål for hver knapp

Anders har uttrykkelig krevd at Grok skal vite hvilken skjerm hver knapp åpner. Les også [knappkartets format og kontroll](knappkart-kontroll-og-format.md). Bruk knapp- og skjermkartet: **kontroll-ID + fra-skjerm/versjon + rolle/tilstand → mål-skjerm/versjon, overlegg eller handling**. Registrer nødvendig spiller-, plan-, økt-, oppgave- og revisjons-ID, faktisk apprute, kodehandling og tilbakevei. Faner, kort, ikoner, bjelle, hurtigmeny og dialogknapper omfattes også. Gi separate regler for betingede mål, mobil/desktop og låst/åpen tilgang.

Registeret med 38 kildekoblede kontrollrader er **før-retting-grunnlaget**, ikke hele eller siste kart. Claude-prosjektets gamle kart med 887 rader er også under erstatting: det har ufullstendig instans- og kildekobling. Et antall rader eller status «utledet» beviser ikke at hver faktisk knapp er dekket. Bruk først et nytt kart etter egen kontroll av effektiv kildeorden, komponentinstanser, hele handleruttrykk, objektbinding, mål og retur/avbryt. Ingen skjerm kan ferdigmeldes for bygging med uforklarte trykkbare kontroller. Grok skal ikke velge mål ut fra knappetekst, numerisk skjermrekkefølge eller likhet med en annen skjerm. Samme knappetekst i ulike kort skal bevare riktig objekt-ID. Kontroller handling, suksess, feil, avbryt, ulagrede endringer og retur med samme syntetiske objekt. Frys koblingskartet samtidig med skjermpakken.

## Gjenbruk av undersøkt appkode

**Historisk kodegrunnlag `110b4ec8f`:** tabellen under dokumenterer den første analysen, ikke dagens monterte Workbench. Hovedcheckout `4b553524585f6eec26037930800f355e78caba89` har senere fjernet blant annet AG11Workbench og fys-turnering-actions/data. Bruk [dagens kildeverifiserte Workbench-koblinger](../design-audit/workbench-appkoblinger-2026-09-30.json) før bygging. Ikke gjenopprett slettede filer ut fra denne historiske tabellen.

| Designområde | Eksisterende kode | Byggekrav |
|---|---|---|
| Coach Workbench AG-11 | `src/app/admin/workbench/[playerId]/page.tsx`, `src/components/admin/precision/AG11Workbench.tsx`, `src/lib/workbench/wb-actions.ts` | Gjenbruk vertens tilgang og datalastere. Uke/Økt/Målsetninger er allerede koblet til Precision; År/Periode/Måned og øvrige importerte visninger må sammenlignes separat. Ikke opprett en konkurrerende planmotor. |
| Spiller Plan/Workbench | `src/app/portal/planlegge/workbench/page.tsx`, `src/components/portal/v2/WorkbenchV2.tsx` | Gjenbruk eksisterende handlinger og teknisk oppgavekobling. Designadresse oversettes til virkelig rute; gammel komponentprofil erstattes innen samme funksjon. |
| Publisering | `src/lib/workbench/publish-actions.ts` og wb-actions.publishSessions | Avklar planpublisering versus øktpublisering per knapp. Vis endringsoversikt og faktisk svar; ingen automatisk coachgodkjenning. |
| Teknisk plan AG-10 / AG-TP / PH-TP | `src/app/portal/tren/teknisk-plan/actions.ts`, `src/lib/teknisk-plan/ensure-plan-access.ts`, `src/components/teknisk-plan/constants.ts` | Bruk eksisterende plan-/task-ID-er, tilgang, mellomposisjoner og sortering. Bevar rep- og TrackMan-koblinger. |
| Reps og mål | PositionTaskLog, PositionTaskMaal, PositionTaskTmGoal i `prisma/schema.prisma` | Loggen er grunnlaget for antall; målene skiller motorikk og belastning. TrackMan-grense, målenhet, protokoll og utvalg skal beholdes. Veiledning skal ikke blokkere neste læringssteg. |
| Stats | `src/app/portal/analysere/page.tsx`, `src/lib/portal-analyse/tm-hub-data.ts`, relevante SG/TrackMan-kilder | Erstatt utgående visning kontrollert. Koble hver fane og hvert tall til riktig eksisterende datakilde; ikke lag ett oppdiktet samlet API. |
| Live / sRPE | wb-actions.startSession/completeSessionWithEffort/saveWorkbenchLiveSnapshot, `src/lib/training/srpe.ts` | Bruk serverens varighet og faktisk vurdering. Null betyr manglende data. Skill gjennomføring fra lagring, og bevar avbrutte økter. |
| Fysisk / turnering | `src/lib/workbench/fys-turnering-data.ts`, `src/lib/workbench/fys-turnering-actions.ts` | Behold eksisterende oppretting/flytting/publisering og regler for konflikter; bruk godkjente visningsbegreper. |

## Hull som må være synlige før endelig bygging

[Gjennomgangen 30.09.2026](../design-audit/precision-gjennomgang-2026-09-30.md) gjelder opprinnelig eksport: gammel PH-12-planbygger, faste Live-resultater og eldre AG-23. Disse er senere rettet i designprosjektet. Den nye eksporten 17:54 har gjennomført lokal reisetest **180/0** og PH-07-layout **112/0**; dette er prototypekontroll, ikke fungerende app. [Utføringskvitteringen](claude-design-konsolidering-2026-09-30.md) skiller gamle funn, senere endringer og egen kontroll. Eksisterende teknisk fokus som ikke finnes i de aktuelle redigeringsvalgene skal behandles uttrykkelig, uten stille datatap.

1. **Prioritet per uketype:** eksisterende PositionTask.sortOrder er én rekkefølge. Designet trenger medlemskap og rekkefølge for tre uketyper uten å duplisere eller miste task-ID/replogg. En konkret utvidelse må beskrives og autoriseres før databaseendring.
2. **Før-/ettermedier:** bildeUrl/videoUrl er enkeltfelter. To daterte mediespor med erstatting, fjerning og sammenligning trenger konkret lagrings-/tilgangsløsning. Filvalidering, feil, ressurskobling og tilbakevei skal spesifiseres. Ingen private spillermedier i designpakken.
3. **Slaghøyde og skru:** slagNavn er fritekst, og undersøkt createTask skriver ikke strukturerte høyde-/skru-felt. Definer felter, gyldige valg og behandling av putting før implementering; ikke skjul struktur i en tilfeldig tekststreng.
4. **Video ved replogg / milepæler:** de tegnede funksjonene må kobles til verifisert eksisterende lagring eller føres som konkret gap. Loggmodellen som ble undersøkt har notater og reps, men ingen egen videoUrl.
5. **Analyse og budsjetter:** årsbudsjett, ukemål, normgrunnlag og belastningsetiketter må bruke valgt kilde og regel. Kladdens timer, datoer og risikoetiketter er eksempler; ikke produksjonsstandarder.
6. **Øktvurdering og valgfritt fokus:** Kvalitet 1–5 og RPE 1–10 er separate eksisterende appfelt. Det foreløpige golfdesignet har i tillegg valgfritt Fokus 1–10 som konsentrasjon i økta; dette finnes ikke som eget appfelt, og Anders har ikke besluttet ny lagring. Ingen automatisk omregning mellom skalaene. «Lagre uten vurdering» skal beholde samme økt, gjennomføring og tid/reps/serier uten å opprette en oppdiktet vurdering. Simulert prototypebekreftelse erstattes av faktisk svar fra lagringen ved appbygging.

Grok skal presentere løsningsforslag for slike konkrete hull, mens designarbeid og kode som allerede har grunnlag kan fortsette. Databaseskjema, tilgangsregler og produksjonsendringer krever konkret autorisasjon etter prosjektinstruksen.

## Anders' skjermgjennomgang

Gå gjennom sammenhengende reiser med samme syntetiske spiller, plan og økt:

1. I dag → Plan → økt → Live → oppsummering → Stats.
2. Coach: Stall/Spiller 360 → Stats → tiltak → teknisk P-liste → oppgave → før/etter → Workbench → publisering → spillerens visning.
3. År → periode → uke → økt, med planlagt/faktisk volum og fysisk/turnering der det inngår.
4. Booking, konto og forelder gjennomgås som egne reiser; Training Motor er ingen dekningskilde for dem.

Registrer skjerm-ID/versjon og Anders' konkrete endringsønske eller valg. Etter kodebygging vises samme referanse ved siden av fungerende app på 390 px og desktop, aktuelle temaer og relevante tilstander. Gjennomfør innlogget prøve med syntetiske data og eksisterende tilgangsvakter. En standalone-demo eller grønn byggkontroll er ikke en ferdig appreise.

## Kontroll og levering

Før ferdigmelding: ingen uforklart funksjon/rute/tilstand i avtalt omfang, ingen avhengighet på en arkivert definisjon, ingen fake «lagret», og alle relevante tall har kilde/enhet. Kjør passende funksjonskontroller og prosjektets kvalitetskontroll etter faktiske kodeendringer. Oppgi hva som er prøvd og hva som bare er rapportert av andre.

Ingen automatisk deploy, merge, betaling, e-post eller databaseendring følger av denne kontrakten. De gjeldende arbeidsreglene står i [AGENTS.md](../../AGENTS.md). [Kildeanalysen](../design-audit/precision-training-motor-2026-09-30.md) og [konkret designbestilling](claude-design-konsolidering-2026-09-30.md) viser utgangspunktet.

## Tillegg: kildeverifiserte appkoblinger

[Appkoblinger](appkoblinger-precision-athletics.md) og [JSON](appkoblinger-precision-athletics.json) viser 15 separate observasjoner fra faktisk kode, inkludert tre øktmodeller, oppgave-ID som mistes på vei til Workbench og publisering som aktiverer hele planen. De erstatter ikke kontroll av valgt ny designversjon. Prototypeavvikene over beskriver opprinnelig eksport; [mellomkontrollen](../design-audit/precision-mellomkontroll-2026-09-30.json) gjelder eksporten under pågående retting.

## Workbench fra tom årsplan – utvidet bestilling

Anders har bestilt en sammenhengende Workbench fra tom plan til planlagte økter. [Workbench-kontrakten](workbench-fra-tom-plan.md) og [maskinlesbart knapp-/skjermgrunnlag](workbench-fra-tom-plan.json) reserverer nå 77 skjerm-/overleggs-ID-er og 183 rollekoblede kontrollregler i eksisterende PH-11/AG-11. Dette er bestilte kandidater, ikke en påstand om at alle skjermene er bygget eller godkjent. [Kildeanalysen](../design-audit/workbench-fra-tom-plan-2026-09-30.md) skiller eksisterende flater, knapper uten virkning og manglende bindinger.

Flyten er **eier → årsplan → periode → måned → konkret uke → konkret økt**. Antall økter FYS/TEK/SLAG/SPILL/TURN fra Pyramiden oppgis uttrykkelig; minutter, repetisjoner, øvelser, turneringsdeltakelser og runder er separate størrelser. Tekniske oppgaver beholder oppgave-ID og revisjon, og turneringer beholder deltakelses-ID, datoer og valgte runder. Det opprettes aldri økter bare fordi et budsjett er skrevet.

Planleggingsmasteren i den nyere hovedcheckout er kilde for åtte periodetyper. Ved uke over flere perioder vises valg av kildeperiode eller eget ukebudsjett; ingen skjult automatisk fordeling. Nye designflate-ID-er og kontraktrader må kobles til den faktisk ferdige Claude-eksporten før det samlede knappkartet fryses. Egen WB1-eksport er kjørt lokalt med64/0, men [uavhengig kildekontroll](../design-audit/workbench-wb1-mellomkontroll-2026-09-30.json) finner15 reelle avvik og testsvakheter. Manuell oppretting av egen årsplan/periode er bekreftet; videre rettinger, økt-/kildekoblinger og layout pågår. Ingen samlet godkjenning eller frosset byggepakke er gitt.

### Workbench: ny kildekontroll etter teknisk kobling

[Egen WB2-kontroll](../design-audit/workbench-wb2-teknisk-kontroll-2026-09-30.json) gjelder eksport-SHA `ff40a5af2cca27754354f32e4976f6bf628ef9001c94e40a1c9df054e9382d18` (584 filer). Den lukker ni av femten tidligere kildefunn, vurderer fire som delvis rettet og to som åpne. Den dokumenterer nye avvik i foreldrens planoppdatering, gammel ukekontekst, kildeeier/revisjon, ikke-publiserte medier, dato utenfor kalender og tilgjengelighetsrolle. Egen eksportreise171/0 er derfor ikke bevis på komplett Workbench. Dette er fortsatt et kontrollgrunnlag; Grok skal bruke en senere uttrykkelig fryst versjon, ikke behandle denne som godkjent fasit.


### Teknikkøktantall fra tekniskplan – særskilt designkrav

Den undersøkte tekniske designkilden har oppgaver, revisjoner og reps, men ingen faktisk kilde for planlagte teknikkøkter per uke. En egen bestilling legger til et brukerangitt planleggingsantall med gyldighetsdatoer, kilde-ID/revisjon, publiseringsstatus og bekreftet overføring til valgt TEK-budsjett. «Se tekniskplan» skal returnere til samme årsplan/periode/måned/uke. Blank, eksplisitt 0 og plasserte økter er separate størrelser. Antall oppgaver eller repetisjoner skal aldri omregnes til økter. Dette er et manglende planleggingsfelt/byggekrav i appen; designarbeidet er bestilt, ikke kontrollert ferdig.
