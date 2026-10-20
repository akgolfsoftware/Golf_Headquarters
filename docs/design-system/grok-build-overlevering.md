# Precision Athletics → kodeoverlevering

Oppdatert 01.10.2026. Claude Design eier designet og Codex eier appkoden etter Anders’ senere arbeidsdeling. Filnavnet beholdes for tidligere Grok Build-lenker. Samme underlag kan leses av begge kodeverktøy.

**Byggepakken er under fullføring.** Nye Workbench-flater er kandidater; ingen ny designgodkjenning er registrert. [Leveringsstatus](claude-design-konsolidering-2026-09-30.md) og daterte kontrollbevis skiller rapporterte rettinger, egen kilde-/modellkontroll og faktisk skjermreise. Den tidligere samlede mellomversjonshistorikken er [arkivert](../arkiv/designkonsolidering-2026-09-30/grok-build-overlevering-mellomhistorikk.md).

## Kildene byggeren skal følge

- [Designautoriteten](design-autoritet.md): Precision Athletics. Training Motor er funksjonsinventar og historikk.
- [Treningsplanlegging](../treningsplanlegging.md): master for språk, åtte periodetyper, Pyramiden og planregler. Hovedcheckoutens gjeldende master brukes; en eldre arbeidskopi gir ingen ny produktregel.
- [Produktreglene](../platform/BUSINESS-RULES.md): funksjon og tilgang.
- [Godkjenningsregister](skjermgodkjenninger.md): original PH-01, mobil390/Lyst/Data med «Endring i dagens plan» åpen er eneste registrerte godkjenning. Ny kontrastvariant og Workbench får separate valg.
- [Workbench-kontrakt](workbench-fra-tom-plan.md) og [JSON](workbench-fra-tom-plan.json): 77 reserverte skjerm-/overleggs-ID-er og183 kontrollregler. Dette er bestilt oppførsel, ikke77 ferdige sider.
- [Gjeldende appkoblinger](../design-audit/workbench-appkoblinger-2026-09-30.json): kildekontroll 01.10.2026 mot hovedcheckout `c8e97c66be98e09c6707381f17cefbcdc8451ddb`; 20 aktuelle kildefiler samsvarer med committen og 47 ankere er oppdatert. De [15 opprinnelige appobservasjonene](appkoblinger-precision-athletics.json) har fortsatt uendrede kildebytes, med rettet Git-bane for oppgaveskjemaet. Historiske 4b-/110-spor er bevart som historikk, ikke gjeldende kjøreordrer.

Appkildestatus: Hovedcheckoutens språk-master har SHA-256 `baca89953dcf8e0fb61a39483dd931b9067f73a4304e1c0003b535dcb228f094`. Siden 4b er 10 av de 20 oppførte Workbench-filene endret, 11 ankere flyttet og fire erstattet. Adminruten monterer nå AG11Workbench/FYS/TURN; WorkbenchUke bruker useUkeMotor, og spillerens øktoppretting delegerer til createWbSession. Aktive mellomledd, valgt modell og skjermreise må kontrolleres ved implementering. Kildetekstkontrollen beviser ingen kjørt brukerreise, backend-funksjon eller designgodkjenning.


## Fast versjon og eksakt knappmål

Den endelige pakken får readme, eksportdato/prosjekt-ID, ZIP- og kildekontrollsummer, effektiv kildeorden, skjermregister, komponenter/designverdier, syntetiske data, kontrollbevis og restliste. Levende Claude Design-lenke er navigasjon, ikke en frosset kildeversjon.

Hver faktisk trykkbar kontroll skal ha **kontroll-ID + fra-skjerm/rolle/tilstand → konkret mål eller handling + objektkontekst + tilbake/avbryt**. Det omfatter faner, kort, ikoner, hurtigmenyer, skjemaer og dialogknapper. Samme etikett på to økter skal beholde hver sin sessionId. Mål velges aldri fra etikett eller numerisk skjermrekkefølge.

[Knappkartets format](knappkart-kontroll-og-format.md) beskriver kontrollen. [Det første38-raderskartet](knapp-og-skjermkart.md) er historisk analyse; skyprosjektets gamle887-raderskart er også utgående. Ingen av disse er fullstendig siste kart. Nytt kart må ha kildebevis for komponentinstans, binding, betingelse, mål, nødvendige ID-er og retur. Skill erklærte kontroller fra kontroller som faktisk nås. Ufunderte handlingsrester må rettes eller merkes med konkret eierskap/avgrensning før bygging.

## Workbench fra tom plan

Reisen er **eier → årsplan → perioder → måned → konkret ISO-uke → konkret økt**. Navn er aldri identitet. Bruk subjectType/Id, planId, periodId, monthKey, weekStartDate og isoWeekYear der valgt nivå krever det. Bevar sessionId, drillInstanceId, sourceOwner/technicalPlanId/taskId/revisjon og returnContext gjennom kildevalg, økt, Live og oppsummering.

Pyramiden har FYS/TEK/SLAG/SPILL/TURN. Periodens og månedens budsjett angis **per uke**; månedens/årets kjente sum og uker med manglende grunnlag vises separat. Null=ikke angitt,0=uttrykkelig null. Budsjett oppretter ingen økter. Minutter, øvelser, reps, slag/putter/hull, turneringsdeltakelser og runder er separate størrelser. Hver kalenderøkt telles én gang på dominerende pyramide. Ingen automatisk norm,21 eller proratering.

Ved flere kildeperioder kreves synlig valg eller eget ukebudsjett. Årsrammeendring må forhåndsvise berørte objekter og avvise strandede økter/perioder. Forkorting over eldre budsjett, mål og grunnlagsvalg avventer Anders’ valg mellom synlig historikk med gjenoppretting og stopp av forkortingen; ikke implementer en antatt kontrakt. Periodefjerning bevarer økter/historikk, og rydder bare dens grunnlag med bekreftelse/angre. Kopi får nye forekomst-ID-er; flytting beholder identitet og kilde. Serien endres bare innen valgt omfang.

Coachens publisering gjelder valgt mottaker/omfang og en fast revisjon. Senere utkast endrer ikke publisert snapshot. Spillerens egne utkast og andre coachutkast er separate. Avbryt, lagringsfeil, retry, konflikt og ulagret navigasjon må ha konkrete resultater. Prototypens lokale lagring og simulerte publisering er aldri produksjonslagring eller ferdig tilgangskontroll.

## Publisert økt → egen gjennomføring → eget resultat

Dette er **byggekrav med avgrensede prototypebevis**, ikke ferdig appfunksjon. [Eksport59 RD](../design-audit/workbench-runde-utforer-historikk-delkontroll-2026-10-01.json) har egen35/0 og modell121 med120 bestått/0 feil/1 uavklart; begge RD-utførerfeil fra55 er rettet. [Eksport64](../design-audit/workbench-drilltid-pause-knapper-delkontroll-2026-10-01.json) har egen21/0 for drilltid, pause og skrivebeskyttet resultatleser. [Eksport65](../design-audit/workbench-leser-kilde-min-full-delkontroll-2026-10-01.json) bevarer disse og har egen43/0 med ulike kilderevisjoner, FYS-null/0, faktisk Plan-retur og lagret golf-/FYS-leser ved revisjonsbytte/tilbaketrekking. RD-kontrollen beviser prototypens identitetsskille for runder; den beviser ikke golf/FYS-flerbrukertilgang eller backend. Visuell Workbench-kontroll, øvrige knappmål, sluttregister og samlet kontroll på fast eksport og i appen gjenstår. Ingen av tallene er Anders' skjermgodkjenning eller bevis på varig lagring.

**Utførende medlemsidentitet er obligatorisk.** Rundekladder, aktive golf-/FYS-gjennomføringer og resultater må bindes til den faktiske utførende spilleren, i tillegg til publicationId, publiseringsrevisjon, planId, sessionId og eventuell roundRef/entryRef. Publiseringens sourceOwnerId eller gruppeplanens eier er kildeeier, ikke utførende medlem. Identiteten kommer fra eksisterende innlogget medlems-/tilgangskontekst; ikke stol på et valgfritt ID-felt fra nettleseren. Knytt den til den eksisterende appmodellen før bygging; dette er ingen beslutning om nye databasefelter.

Alle les-, gjenoppta-, endre-, lagre- og Finish-handlinger skal kontrollere den utførende identiteten. MedlemB skal ikke kunne lese, overta eller fullføre medlemAs kladd ved å sende samme gruppepublisering, sessionId, roundId eller kladd-ID. Lagringsnøkler og oppslag må skille medlemmer også når de deler publisert gruppeøkt. Gjentatt lagring/Finish av samme egen gjennomføring skal gi samme resultatidentitet, uten duplikat eller mutasjon av et annet medlems resultat.

Ved **ny Start** kreves en fersk kontroll av at publiseringen/økta finnes, er tilgjengelig for dette medlemmet og ikke er trukket tilbake eller unntatt for medlemmet. En tidligere rendret knapp eller lokal adapter er ikke denne kontrollen. Etter en legitim start følger den egne gjennomføringen sitt bundne innhold. Tilbaketrekking fjerner nye innganger til publiseringen, men sletter ikke medlemmets egen påbegynte gjennomføring, lagrede resultat eller historikk. Gjenopptakelse/avslutning av egen tidligere startet gjennomføring skal ha egen tilgangsregel og lagret kildebevis; den må ikke behandles som en ny Start med automatisk ny kildeversjon.

Resultatet skal bevare disse bindingene og tallene:

- **Runde:** egen kladd-/resultatidentitet, utførende medlem, publicationId/revisjon, plan/session og roundRef/entryRef, samt faktisk bane, eventuelt valgt tee, hullliste og brutto score. Ukjent manuelt hullvalg er tomt/ikke valgt;18 hull er ingen taus standard. Ikke før score mot en eksempelbane når planens bane/hull mangler.
- **FYS:** hver faktisk serie og dens øvelses-/drillinstans, sett/repetisjoner, belastning, utførtstatus og kilde-/program-/programøktreferanse med den bundne kilderevisjonen. Et serietotal eller radnummer alene erstatter ikke serieinnholdet og instanskoblingen.
- **Golf:** hver drillinstans og registrerte målerader/tellere, gjennomført/delvis/hoppet over, kildeøvelse og eventuell technicalPlanId, taskId, oppgaverevisjon og bundet oppgaveinnhold. Program- og tekniskplanreferanser beholdes også når øvelsen er kopiert inn i økta.
- **Revisjon og tid:** kilde-/program-/oppgaverevisjon er forskjellig fra publiseringsrevisjon. Ikke bruk publishedRev som sourceRev. Ukjent planlagt varighet forblir null/—, mens uttrykkelig0 forblir0; ingen null→0-konvertering ved summering. Faktisk varighet må komme fra den egne gjennomføringens klokke, med avtalt behandling av pauser og gjenopptakelse. Ikke rapporter eksempelminutter eller bare veggklokketid som dokumentert aktiv treningstid.

Publiseringsidentiteter må være entydige i kodekartet: **TP-oppgavepublisering**, **WB-øktpublisering** og **faktisk kildeoppgaverevisjon** er tre separate verdier. Eksport65 prøver kildeoppgaverevisjon4, TP-publiseringsrevisjon1 og WB-publiseringsrevisjon3, med ulike publicationId-er og bevart full tpRef/snapshot, drillinstans og faktisk sessionId gjennom PH03, Live og resultatkopien. `publishTechPlanTask` gir `publicationId/publishedRev/sourceTaskRev`; `publishSessions` gir en annen `publicationId/rev` med `sessions[].sessionId/snapshot`. `e.tp.rev/publicationRev` i den frosne økta viser tekniskoppgavens publiseringsrevisjon, som ikke erstatter faktisk `sourceTaskRev`. Planlagt antallsgrunnlag og fysisk program har egne kildeverdier. Oppgaveoppretting, flere utkast og TP-publisering er uttrykkelig merkede direkte modell-fixtures i denne prøven; øktinnsetting og WB-publisering bruker de faktiske skjermknappene.

PH-adapteren bruker `PHQ_SEL.sessionId` som intern mellomlagringsnøkkel (`pub:WBpubId:sessionId`). Den faktiske økt-ID-en finnes i `PHQ_SEL.pub.sessionId` og må følge resultat, knappkart, retur og appkobling. Ikke lagre mellomlagringsnøkkelen som appens økt-ID. Eksport65 prøver dette i spillervert og mottakeroppslag; et coachoppslag er ikke mottakerbevis. Prototypens valgte spillerkontekst er heller ikke appens innloggede medlemskontekst.

**Plan/I dag → eget resultat → samme inngang** skal prøves på de faktiske spillerflatene. Resultatkortet bærer egen resultId og utførende medlem, åpner akkurat dette resultatets uforanderlige innholdskopi og beholder returnContext til PH-10 eller PH-01. Det skal ikke åpne siste globale PHQ_SESSION, en annen spillers resultat eller et nyere coachutkast. Lagre uten vurdering bevarer gjennomføringen og null vurderingsfelt; lagringsfeil bevarer kladden og viser feil uten falsk «lagret» eller duplikat ved retry.

Eksport65 viser faktisk retur til Plan (PH-10) og gjenåpning av eget lagret resultat. En allerede åpen golfleser og FYS-null-leser beholder samme hovednode, tekst og execution ved nyere coachpublisering, tilbaketrekking av den tidligere publiseringen og tømming av Live-cache. FYS0-leseren bevarer uttrykkelig0 etter revisjonsbytte; åpen node-identitet er prøvd for golf og FYS-null. Lagret vurdering er skrivebeskyttet i eksport64. FYS-null/0-øktene er merkede syntetiske fixtures før publisering/gjennomføring med skjermknappene; cachetømming og savedView i en ny vert er direkte testinjeksjon. En ny vert uten PHQ_RESULTS viser ærlig «Ingen gjennomføring registrert» og går faktisk tilbake til PH-10 uten å endre den gamle vertens resultat. Dette beviser Plan-grenen med oppgitt testgrunnlag, ikke alle I dag-, gruppe- eller medlemsgrener.

I eksport65 er golf/FYS-resultatene i PHQ_RESULTS fortsatt **bare i minnet**. PHQ_SESSION/PHQ_SAVED, timersimulert lagring og lokale resultatkort er ikke appens varige lagring eller tilgangskontroll. `execution.performerId` mangler, og prøvens utfører er samme personlige spiller som kildeeieren. Byggeren må binde innlogget utfører separat fra plan-/sourceOwner, kontrollere lesing og skriving på serveren og koble til dokumentert eksisterende lagring. Test reload, medlemsskifte, samtidige gruppeutøvere, feil/retry, tilbaketrekking og samme-sted-retur i appen. Ingen golf/FYS-flerbrukertilgang eller backend er bevist av disse prototypevariablene eller av RD-kontrollen.

Kildeavgrensning: eksport59 `mellomversjon-wb3-runde-medlem-slutt`, eksport64 og eksport65 «AK Golf Precision Athletics (65).zip» (SHA256 `427c5476d45ef1346f0d5376df50eec4ead9f3c49854da0b435bbea997db8a8f`). De to nyere auditene over dokumenterer rettingene og prøvegrensene; den eldre eksport56-observasjonen om feil sourceRev er historikk. Modellen og data-wb3 er uendret fra59/64, og modell121 ble ikke kjørt på nytt for65. Ingen nye godkjenninger, appkoblinger eller produksjonsbevis følger av denne oppdateringen.

## Konkrete appgap

| Område | Hva som må spesifiseres og kobles |
|---|---|
| Teknisk prioritering | Uketyper med samme taskId/replogg; eksisterende sortOrder er ikke tre separate ordener. |
| Før-/ettermedier | To daterte mediespor, validering/feil, tilgang, erstatting/fjerning og tilbakevei; enkeltfelt er ikke denne løsningen. Ingen private spillermedier i byggepakken. |
| Slaghøyde/skru | Strukturerte valg og putting-regler; fritekst slagNavn beviser ikke strukturerte felt. |
| Reploggvideo/milepæler | Faktisk eksisterende lagring eller uttrykkelig gap, ikke oppdiktet videoUrl. |
| Planlagte teknikkøkter | Ny uttrykkelig antallkilde per kildeeier/technicalPlanId med planningCountId/revisjon, fra/til, utkast/publisert/egen og bekreftet TEK-budsjettsnapshot. Oppgaver/reps blir aldri antall økter. Samme kilde kan brukes i flere årsplaner. |
| Opprett teknisk plan | Coach→valgt eier→ny technicalPlanId/tom oppgaveliste→første oppgave→samme Workbench. PH-tomtilstand ber coach via PH-21 uten å få coachrettigheter. Ingen taus global eksempelfallback. |
| Fysisk program | Virkelig kilde/revisjon/valgte forekomster, med ærlig manglende data. Eksempelprogram er ikke produksjonskilde. |
| Turneringsplan | calendarTournamentId, tournamentEntryId, roundId og valgt kalenderøkt holdes adskilt. Bare faktisk innsetting skaper TURN-økt. Brutto score. |
| Etter økt | Kvalitet1–5 og RPE1–10 er separate eksisterende felt. Valgfritt Fokus1–10 er foreløpig kandidat og har ikke besluttet ny lagring. Lagre uten vurdering beholder gjennomføring uten oppdiktede skårer. |

Endringer i databaseskjema, tilgangsregler og produksjon trenger konkret autorisasjon etter prosjektinstruksen. Designbestillingen autoriserer ingen slike endringer. Kode som har grunnlag kan planlegges uavhengig av et uavklart feltvalg.

## Kontroll og Anders’ gjennomgang

[Skjermgjennomgangen](skjermgjennomgang-precision-athletics.md) følger sammenhengende reiser med samme syntetiske plan/økt. Registrer skjerm-ID, eksport/kildeversjon, bredde, tema, tilstand og konkret kommentar etter [skjermkontrakten](../../.claude/skills/ak-hq-design/assets/skjermkontrakt.yaml). Godkjenning flyttes aldri automatisk til en endret variant.

Etter bygging prøves reell innlogget app med syntetiske data, eksisterende tilgangsvakter og faktisk lagring. Vis appen ved siden av valgt design på mobil390 og desktop. Modellkontroll, klikkbar prototype og grønn byggkontroll er ulike bevis; ingen av dem er alene en ferdig appreise.

Før ferdigmelding må relevante funksjoner, ruter, tilstander, tall/enheter og knappmål være forklarte. Rapportér prøvde kontroller og konkrete grenser. Ingen automatisk merge, deploy, betaling, e-post eller databaseendring følger av denne overleveringen.

## Native Workbench-mål er også skjermtilstander

Kildekontroll av eksport 31 viser at PH/AG-11-AR/NY/PER/MND er vertsaliaser. Egenplanens faktiske navigasjon bruker intern `level/view` mens vertens render-ID kan stå. Sluttkartet må derfor angi vert, nivå/visning, modal/panel, valgt eier/plan/periode/måned/uke/økt og retur. De eldre `*-PERSKJEMA`-/`*-MNDSKJEMA`-aliasene med demoparametre er ikke bevis på en valgt egen editor. PH-10 Rediger gir foreløpig en generell PH-11-inngang uten valgt dato/uke/økt; samme-sted-retur er et konkret gjenstående krav, ikke levert oppførsel.

## Faktiske kildevalg og årsredigering i mellomversjon 49

Årseditoren er `WB3_PLAN.PlanEdit` i `WB3-plan.jsx`, montert av `WB3-lokal` ved `plan-rediger/pe`. `planred-navn/fra/til` endrer skjemautkast; `planred-lagre` lagrer med feilmelding og samme skjema ved feil, mens `planred-avbryt` går tilbake uten endring. `WB3-ar` er årsvisning. [Kildedelta45](../design-audit/workbench-knappregister-kildevalg-arsdelta-2026-10-01.json) dokumenterer faktiske kontroll-ID-er og bindinger; dette er kildebevis, ikke nye skjermgodkjenninger.

Kilderadioen lagrer valget straks, per målårsplan. `tp-kilde-lukk` lukker velgeren; den lagrer ikke på nytt. `tek-valg-ok` har foreløpig misvisende «Bruk valgt kilde» og skal få tekst som samsvarer med lukking. Ingen kilde er automatisk valgt. Månedsporten lukker TEK-panelet og går til det eksisterende månedsgrunnlaget.

GruppeANTALL har egen `tekKildeValg` adskilt fra oppgavelisten. I prototypen49 kan medlemmet bare lese publisert antall og publiseringsmetadata fra egen gruppe i samme testområde; lokale gruppeutkast/historikk skygger ikke publisert revisjon. Gruppens kildeeier, tekniskplan-ID, antall-ID og revisjon beholdes i importreferansen. Import endrer bare TEK/ref i den valgte personlige planen. Gruppens oppgaver/media åpnes ikke av dette; spilleren kan ikke skrive gruppens antall ved å sende gruppeplan-ID. [Delkontroll49](../design-audit/workbench-gruppe-antall-delreise-kontroll-2026-10-01.json) har110/111 modeller bestått, én uavklart årsrammekontrakt, samt egen gruppeantallreise18/0 med oppgitte grenser. Import sjekker også målplanens eier før mutasjon; direkte annen spiller-/gruppeplan-ID avvises. Gruppens økt til egenversjon med separat månedsgrunnlag kontrolleres videre. Syntetisk medlemsoppslag i prototypen er ikke appens produksjonstilgang.
