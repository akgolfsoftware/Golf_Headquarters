# Designløft for Team Norway og WANG (16.10.2026)

Status: **kartlegging, venter på Anders' valg av retning.** Ingenting er tegnet eller bygget ennå.

Bestilling 16.10: «Start en session med alle gjenstående oppgaver i Team Norway. Jeg ønsker å forbedre design på hele
Team Norway og WANG skjermene.»

Gjelder trenerskjermene under `/team-norway/*` og trenerflaten i `/team-wang` (bare Trener og Sportssjef). Fellessiden
`/team-wang` røres ikke. Spillerne bruker PlayerHQ.

## 0. Det viktigste først

1. **Skjermene er allerede lagt inn i appen.** Alle sju TN-pakker (#1294–#1320) og WANG-pakke 1–8 (#1322–#1337) ble
   bygget i koden 15.–16.10 etter utkast 1. README-ene for utkastene sier fortsatt «venter på port 7», og Anders har ikke
   sett noen av dem. Et designløft betyr derfor to ting: tegne utkast 2, og deretter bygge om de samme skjermene i koden.
2. **Hele Team Norway krasjer i main i dag** (skjermkontrollen 15.10, funn 1). Økten
   en egen økt («rett-team-norway-krasjet») retter det i `tn-shell.tsx` og
   `rail-mobil.tsx`. Til det er inne, er utkastene det eneste som kan vurderes for TN.
3. **WANG «I dag» i appen viser oppdiktede elever** («Marius Olsen», «112 mph») fra `src/components/wang/wang-data.ts`,
   blandet med ekte gruppedata uten merking (funn 4). Det er en riktighetsfeil, ikke en designfeil, og bør rettes før
   designet løftes.

Grunnlag: utkastene i `docs/design-system/utkast-tn/` og `utkast-wang/`, målt og fotografert i 390, 360 og 1280 px
16.10 (ingen sidelengs rulling, ingen JS-feil, ingen kontrastavvik i de målte filene), designbrevet 13.10, vedtakene i
`.claude/rules/beslutninger.md` og skjermkontrollen 15.10.

## 1. Hva som gjør skjermene svake

Designbrevet 13.10 er målestokken: farge bærer innholdet, store tall først, mindre grå småtekst, golf skal synes.
Anders syntes AK Golf var «kjedelig». Team Norway er i dag det mest kjedelige av alle utkastene; WANG er nærmere målet.

### Team Norway — felles for alle skjermene

- **Nesten alt er hvitt, grått og navy.** Aksefargene (godkjent 14.10) brukes bare i én stripe på Oversikt og i
  pyramiden i IUP-en. Ellers er skjermen tekst i lister. Det er det motsatte av «farge bærer innholdet».
- **Sidemenyen har 22 punkter synlig samtidig.** Den tar hele venstre side og drukner det som skjer på skjermen.
  WANG-vedtaket 27.09 («menyen skal ikke drukne i muligheter») gjelder ikke formelt for TN, men problemet er det samme.
- **For mye grå mono-tekst med store bokstaver.** Hver overskrift har en «TEAM NORWAY JUNIOR · ONSDAG 14. OKTOBER»-linje,
  og hver liste har tall i mono («HCP +1,2 Plan 94 % Test 7. okt»). Designbrevet sier høyst én slik linje per kort.
- **Tall står som tekst, ikke som bilder.** «Plan 94 %» er et ord i en rad, ikke en stolpe. Treneren må lese hver rad
  for å se hvem som henger etter.
- **Ingen golf.** Ingen bilder, ingen bane, ingen mennesker. Flaggstreken er eneste motiv, og den brukes nesten ikke.
- **Mye tom plass på PC.** Uttak og Spillerutvikling fyller under halve skjermen og har store tomme felt nederst.
- **Mobil er en lang stabel.** Oversikt er over to skjermhøyder på 390 px. Fire like knapper øverst tar to rader.

### Team Norway — per pakke

| Pakke | Skjermer | Svakhet i dag |
|---|---|---|
| 2 Daglig | Oversikt, Samlinger, Turneringer og reise, Live Watch | Oversikt er best av TN: navy samlingskort og ett stort tall. Men fire likeverdige knapper øverst, fellestesten er en tekstliste, og gruppeposter er grå tekstblokker. Ingen oversikt over hvem som trenger treneren nå. |
| 3 Spillere | Spillerutvikling, IUP (oversikt, analyse, fireukerssjekk, teknisk plan, tester), Fellestesting, College, Skoler, WANG-resultater | Spillerlista er fem like rader med mono-tall og et lite merke helt til høyre. Ingen stolpe for plan, ingen farge på kategori, ingen sortering på «trenger oppfølging». IUP-hodet mangler et hovedtall. |
| 4 Uttak | Uttak og kriterier, Rangliste | Tre hvite kriteriekort og en liste med tre runder. Ingen tall, ingen tidslinje mot frist, ingen visuell rangering. Nesten halve skjermen tom. |
| 5 Plan og fag | Månedsplan, Workbench, Testprotokoller, Referansenivåer, Fagapparat, Analyse, Trenerkatalog | Mange tabeller og lister. Månedsplan og Workbench bør være der aksefargene gjør mest jobb (fylte øktkort, fordeling per uke), men bruker dem lite. Referansenivåer viser mest «—», fordi tallene mangler. |
| 6 Gruppe | Gruppeposter, Dokumenter | Ren tekstflate. Greit for formålet, men poster og dokumenter ser like ut. |
| 7 Meg og admin | Lisens og økonomi, Trenere og tilgang, Inviter spiller | Skjemaer og tabeller. Lav prioritet for løft; her er ro riktig. |

### WANG — felles

- **Nærmere målet.** Utkastene har aksefarger på fylte øktkort, tidslinje for dagen, golfbilder i uka og tellere øverst,
  etter AgencyOS-malen (Anders 15.10).
- **Høyre kolonne på I dag er tett.** Fem saker i «Krever handling», hver med eget merke, tekst og egen konturknapp.
  Det blir mange like knapper, og ingen sak skiller seg ut.
- **Lange, like lister.** Trening › Per elev er tolv identiske rader med samme navy stolpe; bare de to nederste har farge.
  Rangeringen vises, men ikke spredningen.
- **To primærfarger konkurrerer.** «Før oppmøte» er mint, andre primærknapper navy. Grunnmuren sier navy er handling,
  mint det viktigste valget; i praksis ser det tilfeldig ut.
- **Hovedtallet mangler på flere skjermer.** I dag har fire like tellere i stedet for ett stort tall.
- **Små merker uten logikk.** «3 poeng» i rosa under etterlevelse sier ikke hva det betyr.

### WANG — per pakke

| Pakke | Svakhet i dag |
|---|---|
| 2 I dag | Fire like tellere i stedet for ett hovedtall; tett høyre kolonne; fokuskortet har tre små tall i lys tint. |
| 3 Trening | Per elev er en lang monoton liste; grafen «uke for uke» er tynn strek uten fyll (designbrevet: fylte grafer). |
| 4 Tester | Mest «—» fordi A–K-nivåtall og landslagsnivå mangler. Bra regler, lite å se på. |
| 5 Konkurranse | Kalender og evaluering som lister; turneringer bør ha bilde og tydelig resultat. |
| 6 Meldinger | Ok. Lav prioritet. |
| 7 Elever | Elevlista og IUP har samme svakhet som TN Spillerutvikling: ingen visuell status per elev. |
| 8 Administrasjon | Ok. Ro er riktig her. |

### Dagens kode (ikke design, men må med)

- TN: hele flaten krasjer i main (rettes i annen økt). Uten den rettingen kan ingen TN-skjerm kontrolleres i appen.
- WANG: oppdiktede elever i `WangIdag`, `WangTrening`, `WangTester`, `WangKonkurranse`, `WangMeldinger`, `WangElever`,
  `WangAdmin` (alle importerer `wang-data.ts`, 1 496 linjer). Demoøktene i `src/app/team-wang/_data/live-sesong.ts`
  blandes med ekte data.
- TN-utkastene bruker realistiske norske fornavn og etternavn på spillere (f.eks. i Oversikt og Spillerutvikling).
  De er oppdiktede, men spillerne er mindreårige, og WANG bruker «Elev 04». Utkast 2 bør gjøre det samme som WANG.

## 2. Forslag til designløft

(For TN overstyrt 19.10: hjørner og skygger er tillatt, se beslutninger.md §TEAM NORWAY-APPEN FÅR RETNING «SKRÅ».) Rammene er låst og endres ikke: TN-tokens (Jost, Lato, IBM Plex Mono, hjørner 0 · 2 · 4, ingen skygger, ingen sirkler,
navy `#012B5D`, rød `#D70232` aldri som status eller akse, TN-aksefargene) og WANG-tokens (Montserrat, Quattrocento Sans,
WANG-aksefargene, mint/gul/rosa som status). Løftet handler om hvordan rammene brukes.

### Felles for begge

1. **Ett hovedtall per skjerm, stort.** Hver skjerm svarer på ett spørsmål på ett sekund. Oversikt: «3 spillere trenger
   deg». Spillerutvikling: «78 % av planen gjennomført». Uttak: «12 dager til frist».
2. **Aksefarger på flater, ikke på streker.** Fylte søyler i ukefordeling, fylte øktkort i Månedsplan og Workbench,
   fylt graf under linja i «uke for uke». Aksenavnet står alltid ved fargen.
3. **Status som bilde.** Hver spillerrad får en stolpe for plan (gjennomført mot planlagt) og en farget statusmarkør
   (ok / følg med / trenger deg). Lista sorteres på «trenger deg» først.
4. **Halvparten så mye grå småtekst.** Datolinja over tittelen beholdes én gang per skjerm. Mono bare på tall.
5. **Golf skal synes, uten tekst oppå bildet.** Bilde i toppfeltet på Oversikt / I dag, i samlingskortet og i turneringer.
   Bildespørsmålet fra designbrevet (egne bilder eller lisensierte) er fortsatt åpent; utkastene bruker de samme
   bildene som PlayerHQ og WANG har i dag.
6. **Mobil først.** Toppen av hver skjerm får plass i én skjermhøyde på 390 px: hovedtall, det som haster, én knapp.
   Resten under.

### Team Norway

- **Navy helteflate øverst** på Oversikt med hovedtallet i hvitt og aksefordelingen for uka i de lyse aksefargene
  på navy (`#6FD3C9` osv., alle over 7 : 1). Flaggstreken som kant.
- **Sidemenyen strammes:** seks grupper som kan lukkes, bare gruppen du er i står åpen. Samme seks grupper som i dag
  (`tnHovedmeny`), ingen punkter fjernes.
- **Spillerutvikling som stall:** tre bånd som i AgencyOS (Trenger deg · Følger planen · Ikke delt), plan-stolpe i
  aksefargen som trenes mest, kategori som farget merke.
- **IUP-hodet** får hovedtall (plan siste fire uker) og pyramiden som fylte søyler.
- **Uttak med nedtelling** og kandidater på en rangert stolpe mot kriteriene.
- **Månedsplan og Workbench** med fylte øktkort og «lagt inn mot fordelt» per akse, som PlayerHQ-utkastet.

### WANG

- **I dag:** ett hovedtall i stedet for fire like tellere («5 saker krever deg før 07:50»), de andre tre som små tellere.
  «Krever handling» får én primærknapp per sak og grupperes etter frist.
- **Trening › Per elev:** tre bånd i stedet for tolv like rader; fylt graf for uke for uke.
- **Én primærfarge for handling (navy).** Mint brukes bare som status «ok».
- **Elever og IUP** som TN Spillerutvikling over, med WANGs farger.

## 3. Alle gjenstående oppgaver, i prioritert rekkefølge

### A. Må rettes før noe annet (riktighet)

1. **TN-krasjet i main** (funn 1). Pågår i en egen økt («rett-team-norway-krasjet»).
   Ferdig når alle 21 TN-sider laster for `demo@golfforbundet.no`, og de 14 dynamiske sidene er fotografert.
2. **WANG-eksempeldata uten merking** (funn 4, §ÉN IUP punkt 6). `wang-data.ts` brukes i sju WANG-komponenter.
   Ferdig når trenerflaten bare viser ekte gruppedata eller tydelig merket demo, og demogruppa (11 spillere) viser 11.
3. **Realistiske navn i TN-utkastene** byttes til «Spiller 04» o.l. i utkast 2.

### B. Designløftet (denne økten, steg 2)

4. **TN utkast 2**, pakke 2 → 3 → 4 → 5 (de som har mest å vinne), deretter 6 og 7. Én PR for TN.
5. **WANG utkast 2**, pakke 2 → 3 → 7 → 4 → 5, deretter 6 og 8. Én PR for WANG.
6. **Samlesidene** (`utkast-tn/index.html`, `utkast-wang/index.html`) oppdateres med utkast 2-lenkene.
7. Hver skjerm: 390, 360 og 1280 px, tom/laster/feil, ingen sidelengs rulling, kontrast minst 4,5 : 1, publisert som
   privat Artifact.

### C. Port 7 (Anders)

8. Anders ser utkast 2 for TN og WANG og sier ja eller nei per pakke. Bare aksefargene (TN) og grunnmuren (WANG) er
   godkjent i dag.
9. **Data Golf-utkastene** (TN pakke 9 utkast 2, WANG pakke 10) er tegnet og venter også på port 7. Lisensen er avklart
   16.10 (§DATA GOLF VISES ALDRI TIL KUNDER): coacher i WANG og TN kan få skjermene. README-ene sier fortsatt «bygges
   ikke før lisensen er avklart» og må rettes.

### D. Kode etter port 7

10. **Bygge om de innlagte skjermene etter utkast 2**, pakke for pakke, én PR per pakke, skjermbilder i 390 og 1280.
11. **Data Golf DG-01–09** under `/team-wang` og `/team-norway` bak `kanSeDataGolf`, med test som avviser en spiller
    (§DATA GOLF VISES ALDRI TIL KUNDER punkt 2). TN-menyen får Data Golf-lenke bare for coach-rollen.
12. **IUP-navn i TN** (§SPILLERPROFILEN HETER IUP): sjekk at alle menyvalg og tilbakelenker sier IUP, og at
    «Evaluering» heter «Fireukerssjekk» overalt (pakke 3-PR-en #1310 sier gjort; kontrolleres når krasjet er rettet).
13. **Avvik registrert i README-ene:** delte AK-komponenter i TN og WANG (`Trenerforslag`, `SamlingsprogramKontroll`),
    AK-ikonsettet i TN-kjernen, `--rosa-tekst`-token i WANG.

### E. Deling og tilgang

14. **Delingslås:** trenernes oppslag på en enkelt spiller går i dag gjennom delingskontrollen (`medNavngittProfil` i
    WANG, delingslåsen i `tn-arbeidsflate.ts`). Gruppeporten selv (`hentWangCoachGruppeId`) sjekker bare medlemskap.
    Kontrolleres med test at ingen gruppevisning (lister, summer) viser data fra en spiller som ikke har delt.
15. **Samtykkeoversikt** for sportssjef og TN: `beregnDekningsgrad` (`src/lib/domain/deling/dekningsgrad.ts`) har
    fortsatt ingen kaller utenom testen (§ÉN IUP punkt 4).
16. **Invitasjon til PlayerHQ fra WANG/TN**, landslagsnivå per klasse og kjønn i TN-ranglisten venter til delingen virker.

### F. Åpne spørsmål til Anders (samlet fra README-ene)

Team Norway (10 åpne av 12 i README): gruppas trening på Oversikt, reisefelt på turnering, landslagsnivå og A–K-tall, vurderingsmodell
for kriterium 3, kjønn i rangliste, Workbench og Månedsplan som én eller to skjermer, rolle for fagapparatet, foresatt-sperre
16 eller 18, stipend og budsjett, Assist Coach i egen gruppe. Data Golf-punktene 11–12 er avklart 16.10.

WANG (21 åpne av 24 i README): morgentrening fast eller flyttbar, «Egen» uke, A–K-tall, fysiske tester (vedtaket følges), nasjonal
rangering, hvem publiserer uttak, «College D1 snitt», egen innboks, foreldremøter på e-post, elevens prøveplan,
utviklingssjekkens 41 spørsmål, opptakskriterier, hvem inviterer trenere. Data Golf-punkt 1–2 og Konkurranse-punkt 1 er avklart 16.10.

Ingen av spørsmålene stopper utkast 2. De som påvirker tegningen, tegnes med «—» eller plassholder som i dag.

## 4. Retningsvalg

Artifact: https://claude.ai/artifact/HFEyo7eS5HqLnJxP1uckAR. Anbefaling: **B, «Stall og helteflate»**.

- **A. Rydd og stram.** Samme oppsett, mindre grå tekst, færre knapper, stolper i stedet for tall i lister. Raskest,
  minst risiko, men løfter ikke «kjedelig» nok.
- **B. Stall og helteflate (anbefalt).** A pluss: én farget helteflate med hovedtall øverst på hver hovedskjerm,
  spillere og elever i tre bånd (Trenger deg · Følger planen · Ikke delt), fylte aksefarger i alle fordelinger og
  grafer, bilder i samlinger og turneringer. Samme mønster som AgencyOS-utkastene, så coachen kjenner det igjen.
- **C. Full omtegning.** B pluss nye skjermtyper (dashbord med kort som kan flyttes, kart over spillere, tidslinje for
  sesongen). Størst løft, men nye funksjoner uten vedtak og lang tid før port 7.
