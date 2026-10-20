# Precision Athletics — leveringsstatus

Oppdatert 01.10.2026. Anders har bestilt Training Motor → Precision Athletics, opprydding i begge prosjekter og komplett Workbench fra tom plan. Oppdatering av Claude Design og parallelt Workbench-arbeid er uttrykkelig autorisert. Claude Design eier designet og Codex appkoden etter den senere arbeidsdelingen.

**Arbeidet pågår. Ingen komplett/frosset byggepakke eller ny samlet godkjenning er gitt.** Original PH-01 er bevart i [godkjenningsregisteret](skjermgodkjenninger.md). Tidligere bestillinger og mellomkontroller er [arkivert](../arkiv/designkonsolidering-2026-09-30/claude-design-bestillinger-og-mellomkontroller.md); de er historikk, ikke nye kjøreordrer.

## Gjennomført og kontrollens grenser

| Område | Faktisk bevis | Grense |
|---|---|---|
| Training Motor | Historikkoversikt, fire utgående rotfiler arkivert,85/85referanser,4/4kontrollsummer,6/6historikkmarkører. [Arkivkontroll](../design-audit/training-motor-arkivkontroll-2026-09-30.json). | Precision-overføringens samlede ferdigstatus gjenstår. Ingen permanent sletting. |
| Planvalg/tekniskplan/Live/oppsummering | Tidligere egen eksport17:54: teknisk reise180/0, PH-07-layout112/0. Faktisk tid/reps/status og separate skårer. | Senere Workbench-endringer trenger ny regresjons-/layoutkontroll; test er ikke Andersgodkjenning eller appbevis. |
| Workbench grunnreise | År/periode/måned/uke/økt, åtte periodetyper, bank/mal, teknisk/FYS/turneringskilder, gjentakelse/kopi/flytt/angre, årsredigering, mål og periodefjerning er bygget som prototype gjennom flere mellomversjoner. | Ny tekniskplan, lagring/publisering, komplett visuell kontroll og sluttregister gjenstår. |
| TEK-kildemodell | Ny antallkilde per uke, delt per kildeeier/technicalPlanId, fast publisert snapshot, vakt mot fremmed skriving. Egen modell21/21PASS i eksport17. | Modellprøven er avgrenset; faktisk UI og produksjonslagring vurderes separat. |
| TEK-editor | Egen eksport17:291parserte skript hvorav51inline/0syntaksfeil; egen skjermreise48/0 i PH/AG og to testområder. [Kontroll](../design-audit/workbench-editor-kontroll-2026-10-01.json). | Gamle dirty-felt etter vellykket lagring er rettet. Konfliktvalg ved gjentatt import og feilet save/reset har konkrete rester. |
| Knappkontrakt |77kandidatflater/183kontrollregler, unik ID/rolle/fra-skjerm kontrollert uten metadatafeil. Native skjema-/disabledkartlegging forbedres parallelt. | Metadata er ikke bevis på faktisk knappdekning. Endelig kilde-/instans-/mål-/returkart må genereres fra siste eksport. |

Siste egen mellomversjon er **eksport59**, med620 filer,319 skript hvorav75 innebygd i HTML og ingen syntaksfeil. [RD, utfører og historikk](../design-audit/workbench-runde-utforer-historikk-delkontroll-2026-10-01.json) har egen **35 kontroller / 0 feil**, og modell121 har **120 bestått / 0 feil / 1 uavklart**. Gruppemedlemmer har nå separate rundekladd/resultater, personlig feil mottaker avvises, manuell hullvalg er tomt, lagringsfeil/retry bevarer bruttohull, og faktisk Plan-historikkknapp virker på ny vert etter tilbaketrekking. Kontrollgrenser er dokumentert: syntetiske modellfixtures/testidentitet, enkelte negative modellkall, ingen produksjonslagring, og I dag-rundeinngang/flere revisjoner av samme runde gjenstår. Egen58-prøve33/0 er bevart privat;59 inkluderer to nye negative kontroller.

[FYS-resultat og tid56](../design-audit/workbench-fys-resultat-tid-delkontroll-2026-10-01.json) har egen **10/0**: ulike reps og kilo bevares i resultatleseren, klokka følger starttidspunktet, retry gir ett resultat, og et åpent WB-panel avviser start etter tilbaketrekking. FYS/golfresultater er fortsatt bare i minnet. Golfklokke, separate kilderevisjoner, ukjent tid og resultatleser ved ny publisering inngår nå i bestilt TP-/golfjobb. Ingen samlet ferdigstatus er gitt.

[År, perioder, mål og måned→turnering53](../design-audit/workbench-arsperiode-mal-maned-turn-delkontroll-2026-10-01.json) har egen31/0 og11/0. Mål-eiersjekkene er rettet; økteditoren rydder nå dirty-vakten etter lagring/lukking. Disse daterte prøvene er ikke en samlet app- eller visuell godkjenning.

[Gruppeegenversjon51](../design-audit/workbench-gruppe-egenversjon-grunnlag-delkontroll-2026-10-01.json) har egen15/0 for valgt andre årsplan, separat grunnlag, budsjettbevaring, ny økt-ID og faktisk retur. [Gruppeantall49](../design-audit/workbench-gruppe-antall-delreise-kontroll-2026-10-01.json) har egen18/0 og rettede importmål-vakter. Dette er avgrensede prototypeprøver med dokumenterte grenser. Årsrammeforkorting over eldre budsjett/mål avventer Anders’ allerede etterspurte valg; samlet sluttkontroll gjenstår.

Tidligere kilde-, import-, lagrings-, års- og navigasjonskontroller ligger som daterte bevis i [design-audit](../design-audit/). Blant annet har eksport25 egenversjon/kilder/retur79/0,34 native utganger22/0,36 månedsgrunnlag22/0 og37 periodegrunnlag15/0. Disse har avgrenset dekning og erstatter ikke ny kontroll når berørte komponenter endres. Eldste WB-/TP-prøver skal følge den gjeldende modellen; demoforventninger er ingen grunn til å gjeninnføre gammel flyt.

Råeksporter, prøvelogger og private skjermbilder ligger under Documents/Claude. Ingen råeksport eller private medier ligger i Git/public. Testfane og server fra hver ferdige egenkontroll er lukket. Ingen ny samlet designgodkjenning er gitt.

## Aktivt arbeid i Claude Design

Den opprinnelige samtalen nådde kontekstgrensen. Arbeidet fortsetter i en ny samtale i **samme Precision-prosjekt**, med samme filer og modell. Claude Design har nå den avgrensede TP-/golfjobben: faktisk innsetting i valgt egen årsplan/uke/økt, strukturert kilde og egen revisjon, ukjent tid, tidsmålt golf med pause og riktig lagret resultatsnapshot. Native nested utganger og konkrete kilde-/gruppe-/periodekontroller følger i denne regresjonen. [Mellomversjon60](../design-audit/tekniskplan-publiserings-abort-mellomkontroll-2026-10-01.json) har en konkret testabort: ny innsetting, men gammel demopubliseringsforventning gjør at14 senere kontroller uteblir. Diagnose og kort faktisk øktpubliseringsreise er sendt; dekningsmarkøren skal beholdes.

Deretter gjenstår:

1. Kanoniske Precision-komponenter på alle Workbench-nivåer, ukebudsjett/dekningsgrad og fungerende snarveier. Tom start og anonym eksempelplan må bruke samme nye modell. Mobil390/desktop, avtalt tema og relevante tilstander må kontrolleres.
2. Aktive knapprester utenfor Workbench, medier og utgående rapportinnganger. Andre eieres skjermarbeid bevares. PH-coachinngang åpner eksisterende PH-21; ingen ekte melding sendes.
3. Samlet kontrollregister med kilde/instans/mål/retur, gjeldende skjermversjoner, gjenfinnbart arkiv og nøyaktig kodeoverlevering.
4. Egen sluttkontroll på én endelig eksport: syntaks, modell, relevante faktiske reiser, knappmål, arkivbevaring og visuell sammenligning. Frys først en kontrollert pakke, med gjenværende avvik og eierskap uttrykkelig registrert.

Årsrammeforkorting over berørt budsjett/mål avventer Anders’ allerede etterspurte valg. Dette avhengige produktvalget skal ikke antas mens uavhengig arbeid fullføres. Ingen ny skjerm er godkjent av Anders.

## Arbeidsgrense og gjennomgang

Ingen appkode, database, tilgangsregel, commit/push/merge eller deploy er endret av dette designarbeidet. Nye antall-/kilde-/mediespor er byggekrav der dagens app mangler felter; prototypens lokale lagring er ikke produksjonslagring.

[Workbench-kontrakten](workbench-fra-tom-plan.md), [knappkartets format](knappkart-kontroll-og-format.md) og [kodeoverleveringen](grok-build-overlevering.md) beskriver kravene. [Skjermgjennomgangen](skjermgjennomgang-precision-athletics.md) viser rekkefølgen for Anders’ konkrete valg. Nytt design blir ikke automatisk godkjent av det tidligere PH-01-bildet.

## Teknisk plan – mellomversjon61, 01.10.2026

Egen nettleserprøve består192 kontroller/0 feil i to gjennomløp. Testen bruker nå det faktiske innsettingsarket, WB-publisering, PH-10 og PH-03. Endringen moderniserer bare testen; den lukker ikke kilde-, tids- eller resultatrestene. Se [avgrensningene](../design-audit/tekniskplan-publisering-modernisert-delkontroll-2026-10-01.json). Kilde/tid/resultat-retting pågår i Claude Design, mens tre skjerpede regresjonsprøver for periode, gruppekilde og PH-kildevalg kontrolleres lokalt. Ingen frys eller ny skjermgodkjenning.

## Kilde, tid og resultat – mellomversjon65, 01.10.2026

Egen43/0 i [avgrenset delkontroll](../design-audit/workbench-leser-kilde-min-full-delkontroll-2026-10-01.json): ulike TP-/oppgave-/WB-revisjoner, åpne golf/FYS-lesere under ny publisering, null ulik0 og ærlig tom ny vert. Klokken/read-only ble rettet64, egen21/0. Ingen varig resultathistorikk eller gruppens golf/FYS-utførerisolasjon er bevist.

Årsoversikten har fortsatt [bekreftet17/4-dekningsfeil](../design-audit/workbench-arsdekning-negativ-nativekontroll-2026-10-01.json). En egen fokusert Claude-økt i samme prosjekt retter nå Workbench-konsistens, årsdekning, tom start/eksempel og mobil/desktop. Øvrige knapprester og sluttregister gjenstår. Ingen frys, appkode eller ny godkjenning.


### Årsdekning – eksport66

Egen native kontroll består **17/0** med uendret testfil (SHA-256 `f548d22f0d87736fcafa1fa30ecc989ea9b5cb6cabb0e8d1068b525defdb2b02`). Den tidligere negative kontrollen 17/4 fra eksport64 er rettet i årsvolum: kjent delsum og manglende ukebudsjetter vises for alle fem antallsakser og separat for minutter. Kjent0 og ukjent skilles, og retur bevarer budsjettene uten nye økter. Eksport66: 623 filer, syntaks322/78/0. Dette er delkontroll, ikke full visuell godkjenning. Tomstart og ren anonym skjermgjennomgang er sendt som egen avgrenset Claude-leveranse og pågår. Se [årsdekningens kontroll](../design-audit/workbench-arsdekning-rettet-delkontroll-2026-10-01.json).


### Tomstart – eksport67

Egen native prøve **26/0**: tomstart på syv nivåer, avbryt uten objekter, lagringsfeil/retry uten duplikat, faktiske årsplandatoer, planbytte og reload. Bare eksempelplanens grunnoppsett er direkte modellfixture. Claude-regresjoner:17/0 årsdekning,34/0 periode,20/0 gruppe,22/0 PH-kilde; disse er ikke egenkjørt på67. Eksport67:625filer, syntaks324/80/0. Den nye `ui_kits/Workbench-gjennomgang.html` er en kandidat: egen Tom-start-kontroll viser ennå gammel profiltekst og teknisk lagringsstripe; breddevalgene må måles på faktisk ramme. Visuell planflatejobb pågår. Gamle demoavhengige reisetester og demoarkivering gjenstår. Se [tomstartens kontroll](../design-audit/workbench-tomstart-delkontroll-2026-10-01.json).
