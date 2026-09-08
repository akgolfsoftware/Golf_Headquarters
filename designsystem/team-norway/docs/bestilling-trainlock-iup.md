# Bestilling til Train-lock: skjermer og funksjoner som mangler i Player HQ

Klar til å limes inn i Train-lock-prosjektet. Alt under linjen er prompten.

---

## Kontekst

Vi har lest hele IUP-arket til Team Norway (`team-norway-iup-2025.xlsx`, 18 faner — utøverens individuelle utviklingsplan slik NGF faktisk bruker den i dag) og kryssjekket det mot Player HQ i `akgolfsoftware/Golf_Headquarters@main` (169 ruter under `src/app/portal`). Arket er den prosessen utøvere og coacher jobber etter; Player HQ er verktøyet som skal erstatte det.

Resultatet: **Player HQ dekker konseptet i 6 av 14 punkter helt, 6 delvis, 2 ikke.** Denne bestillingen gjelder de seks pakkene som hører hjemme i Player HQ. De to som hører hjemme på Team Norway-flaten (trenerkatalog og tour-referansenivåer) er tegnet i Claw og bestilles ikke her.

**Ikke bygg noe av dette:** øktmaler, ukemaler, teknisk plan (P1–P10), treningsdagbok, turneringsplan, fystester. Alle seks er allerede dekket — flere av dem mer utviklet enn arket. Fystestene ligger til og med med identiske navn i `TestDefinition` (Trapbar Deadlift, Benkpress, Standing Long Jump, Ball Throw, Clubhead Speed) og `src/lib/domain/fys-score.ts` regner samlet score. Ikke rør dem.

## Rammer som gjelder alle pakker

- Ruter under `/portal/*`, auth via `requirePortalUser`, chrome via `V2Shell` + `PLAYERHQ_NAV`, tokens fra `@/lib/v2/train-lock` (`TL`). Følg mønsteret i `src/app/portal/utviklingsplan/page.tsx`.
- **Ærlige tom-tilstander.** Ingen skjerm skal fabrikkere tall, snitt eller fremdrift som ikke finnes. Mønsteret finnes allerede flere steder i kodebasen (`harTester: false`, `hasData`, «venter på data») — bruk det.
- **Ingen nye ferdighetsscore som ser ut som en dom.** Arket bruker 1–4-skalaer. En 1 skal ikke rendres i rødt.
- Hver skjerm skal ha tom, laster og feil, ikke bare suksess.
- Mobil først, 390 px. Trykkflater aldri under 44 px.
- Norsk klarspråk. Ordboken som gjelder: APP = innspill, ARG = nærspill, PEI = nærhet delt på lengde i prosent (lavere er bedre).

---

## PHQ-A · Utviklingssjekk — fem prosesser, fire nivåer

**Størst pakke. Dette er arkets mest omfattende struktur og har ingen motstykke i Player HQ i dag.**

Arket (fane «9. Utviklingssjekk 5 Prosesser») lar utøveren svare på et spørsmålssett som er *forskjellig per utviklingsnivå*, fordelt på syv kategorier.

Fire nivåer: **UNG (13–15) · JUNIOR (–19) · AMATØR (19–24) · PROFESSIONAL (21–)**

Syv kategorier: **Sosial · Mentalt · Fysisk · Strategisk · Teknisk · Golfutvikling · Neste trinn**

Spørsmålene skifter reelt mellom nivåene, ikke bare i formulering. Eksempler fra arket:
- Sosial, UNG: «Jeg er fornøyd med hvordan det fungerer med vennene mine» → AMATØR: «…med vennene mine på college» + «I have adapted well to the US culture and college life» → PRO: «…med vennene mine på tour».
- Neste trinn, JUNIOR handler om college (forstår akademiske krav, amerikansk kultur, hvordan hjemmetrener/college/Team Norway skal samhandle) → AMATØR og PRO handler om å bli proff (økonomisk støtte, plan B, støtteapparat).
- Teknisk, UNG/JUNIOR handler om oppstilling og bevegelse → AMATØR/PRO handler om ballbanekontroll og forming.

Antall spørsmål varierer per kategori og nivå, fra 4 til 9.

### Skjermer
1. **`/portal/utviklingssjekk`** — hub. Hvilket nivå utøveren er på, når sjekken sist ble fylt ut, og de syv kategoriene med utfylt-status per kategori. Én vei videre: fortsett der du slapp.
2. **`/portal/utviklingssjekk/[kategori]`** — utfylling. Ett spørsmål av gangen eller kategori av gangen (velg selv, men ikke alle 45 på én side). 1–4-skala med ord, ikke bare tall — arket sier «der 4 er best», så skalaen trenger tekst per trinn.
3. **`/portal/utviklingssjekk/oppsummering`** — utøverens eget svar per kategori, og forrige gangs svar ved siden av. Utvikling over tid er hele poenget.
4. **Coach-visning: `/admin/spillere/[id]/utviklingssjekk`** — coachens blikk på én utøvers svar. Ikke en rangering mellom utøvere.

### Datamodell (nytt)
```
DevelopmentCheckTemplate   nivå (UNG|JUNIOR|AMATOR|PRO), versjon, aktivFra
DevelopmentCheckQuestion   templateId, kategori (enum 7), sortOrder, tekst, tekstEn?
DevelopmentCheckResponse    userId, templateId, fylltUt (DateTime), status
DevelopmentCheckAnswer      responseId, questionId, verdi (1-4), kommentar?
```
Spørsmålene er **innhold, ikke kode** — de skal ligge som seedet data med versjon, ikke som strenger i en komponent. NGF kommer til å endre dem.

### Funksjoner å kode
- `hentAktivtSjekkTemplate(userId)` — velger nivå fra alder + `TalentTracking.niva`. Der de er uenige: `TalentTracking.niva` vinner, men logg avviket. Aldersgrensene overlapper i arket (AMATØR 19–24, PRO 21–), så alder alene kan ikke avgjøre.
- `lagreSvar(responseId, questionId, verdi)` — inkrementell lagring, aldri «send inn hele skjemaet».
- `sammenlignMedForrige(userId, kategori)` — differanse per spørsmål mot forrige fullførte respons. Returner `null` per spørsmål som ikke fantes i forrige versjon av templaten; ikke sammenlign på tvers av ulike spørsmål.
- **Koble til `TalentTracking`:** arkets syv kategorier er *ikke* de fem talentaksene (fysisk, teknikk, taktikk, mental, motivasjon). Sosial, Strategisk, Golfutvikling og Neste trinn har ingen akse. Ikke tving dem inn. Utvid heller `TalentTracking` med `sosial`, `strategisk`, `golfutvikling` — eller hold utviklingssjekken som eget spor og la radaren være coachens vurdering. **Ta denne avgjørelsen eksplisitt og skriv den ned**; det er den viktigste arkitekturvalget i pakken.

### Ferdig når
Utøveren kan fylle ut sjekken på mobil, se sine egne svar mot forrige gang, og coachen kan lese dem. Fire nivåer med reelt ulike spørsmålssett fungerer. Ingen totalscore på tvers av kategorier.

---

## PHQ-B · Måltavle — historikk mot mål, per kvartal

Player HQ har `Goal` med typene HCP_TARGET, ROUNDS_PER_MONTH, SG_AREA, SESSION_FREQUENCY, TEST_SCORE, FREE_TEXT, fremdriftsberegning og `Achievement`. Det som mangler er **matrisen**: arket (fane «3. Målsetting og oppfølging») viser ~35 målbare størrelser med tre år historikk, fire kvartaler inneværende år, og mål for tre år framover — samtidig, i én tabell.

Radene i arket, gruppert:
- **Score:** ranking, snittscore turnering, snittscore ikke-turnering, beste og verste turneringsscore
- **SG:** total, tee, innspill (samlet + 100–150 m + 151–200 m), nærspill >45, putting (samlet + syv avstandsbånd fra 0–3 fot til 40+ fot)
- **PEI:** samlet + fem bånd (40–80, 80–120, 120–160, 160–200, 200+ m)
- **Ballflukt:** driving distance, avvik fra target line
- **Prosent:** FT %, GIR %, scrambling %
- **Volum:** konkurranser, konkurranserunder, spillrunder utenom turnering, total tid golftrening, total tid fysisk trening

### Skjermer
1. **`/portal/mal/tavle`** — matrisen. Rader = størrelse, kolonner = år/kvartal. Ikke en tabell som må scrolles i to retninger på mobil: på 390 px blir hver størrelse et kort med historikk som sparkline og mål som markør.
2. **`/portal/mal/tavle/[metrikk]`** — én størrelse, full historikk, hvor tallet kommer fra, og målet for hvert framtidig år.

### Funksjoner å kode
- `hentMetrikkHistorikk(userId, metrikk, granularitet: 'ar'|'kvartal')` — aggregerer fra `Round` (SG-feltene finnes: `sgTotal`, `sgApp`, `sgArg`, `sgPutt`), `TestResult`, `TrainingPlanSession` (tid) og turneringsresultater. **Én funksjon per kilde, én felles returtype** — ikke 35 spesialtilfeller.
- Utvid `Goal` med `periode` (år eller kvartal) og `metrikk` (samme nøkkelsett som over) så et mål kan festes til en rad i matrisen.
- `beregnMotMal(historikk, mal)` — returner `{ verdi, mal, avvik, harData }`. **`harData: false` skal aldri bli 0 %.**
- De radene systemet ikke kan regne ut (PEI per bånd, avvik fra target line, spillrunder utenom turnering) skal returnere `null` og vises som «ikke målt», ikke som tom celle.

### Ferdig når
Utøveren ser alle sine målbare størrelser i én oversikt med historikk og mål, og kan trykke på én for å se hvor tallet kommer fra. Rader uten datakilde sier det selv.

---

## PHQ-C · Prosessmål

Arket (fane «4. Prosessmål») har 25 rader med kolonnene: mål (utfall eller ytelse) · hvilke handlinger skal gjøres · hvilke prosesser dekker denne · startdato · sluttdato · hvordan kan du måle framskrittet · hvilke fasiliteter/utstyr krever jeg · hvem krever jeg hjelp fra · evaluering.

I dag er dette modellert som tekniske krav (`TechnicalPlan → positions → tasks`) med reps og status. Det dekker *hva som skal trenes*, men ikke *hvem jeg trenger hjelp fra* eller *hvordan jeg måler framskrittet* — og et prosessmål er ikke alltid teknisk.

### Skjermer
1. **`/portal/mal/prosess`** — listen. Aktive prosessmål med hvor langt de er kommet og hva neste handling er.
2. **`/portal/mal/prosess/ny`** og **`/portal/mal/prosess/[id]`** — opprett og rediger. Alle arkets ni kolonner, men **ikke ni felter på én skjerm**: del i tre steg — hva er målet, hva gjør du, hvordan vet du at det virker.
3. **`/portal/mal/prosess/[id]/evaluering`** — evalueringsfeltet er ikke en tekstboks nederst i skjemaet. Det er noe som skjer *etter* sluttdatoen, og skal etterspørres da.

### Datamodell (nytt)
```
ProcessGoal      userId, tittel, type (UTFALL|YTELSE), prosesser (enum[] — de fem),
                 startDato, sluttDato, maleMetode (tekst), utstyrBehov?, status
ProcessGoalHelp  processGoalId, rolle (COACH|FYSISK|MENTAL|PUTTING|FORELDRE|ANNEN), userId?, navn?
ProcessGoalAction processGoalId, tekst, sortOrder, gjortAt?
ProcessGoalReview processGoalId, skrevetAt, tekst, oppnadd (bool)
```

### Funksjoner å kode
- `forfallendeProsessmal(userId)` — mål der sluttdato er passert uten evaluering. Dette er hele grunnen til at prosessmål feiler i regneark: ingen minner deg på å evaluere. Skal inn i `/portal/varsler`.
- `koblProsessmalTilOkt(processGoalId, sessionId)` — en handling utført i en økt skal kunne kvitteres fra økta, ikke bare fra mål-skjermen.
- `hvemHjelperMeg(userId)` — les fra `ProcessGoalHelp` + PHQ-F-støtteapparatet. Et prosessmål som krever hjelp fra en rolle utøveren ikke har, skal si det.

### Ferdig når
Utøveren kan sette et prosessmål med målemetode og hjelpebehov, kvittere handlinger underveis fra økta, og blir bedt om å evaluere når sluttdatoen passerer.

---

## PHQ-D · Oppvarmingsprogram

Arket krever det eksplisitt: «Du må også ha et skrevet program for hvordan oppvarmingen din skal gjennomføres», med fem referanserutiner (Mickelson, McIlroy, Thomas, Scheffler, Hovland).

Søk i hele kodebasen gir **ett** treff på oppvarming: en hardkodet øvelsesrad i `admin/gjennomfore/okter/[id]`. Det finnes ingen flate for dette.

### Skjermer
1. **`/portal/tren/oppvarming`** — utøverens eget program. Blokker med varighet, slag og antall. Skal kunne kjøres: start øverst, hak av nedover.
2. **`/portal/tren/oppvarming/referanse`** — de fem tourrutinene som mal å starte fra. Kopier og rediger, ikke bruk direkte.

### Funksjoner å kode
- Gjenbruk `TrainingPlanSession`-strukturen med en ny `sessionKind: WARMUP` framfor en egen modell. Oppvarming *er* en økt, den er bare kort og gjentas.
- `foreslaOppvarming(userId, sessionType)` — oppvarming før en turneringsrunde er ikke den samme som før en teknikkøkt. Bruk økttypen.
- Kobling: når en økt eller turneringsrunde startes, skal oppvarmingsprogrammet være ett trykk unna — ikke noe man må huske å finne.

### Ferdig når
Utøveren har et skrevet oppvarmingsprogram som kan kjøres fra mobil før en økt, startet fra økta selv.

---

## PHQ-E · Teknikktest — launchmonitor slag for slag

Player HQ har TrackMan-økter (`/portal/trackman`, `/portal/analysere/trackman/[id]`) og TM-mål per teknisk krav (spredning, spinnakse, smash-faktor, carry, ballhastighet, kølleblad-stabilitet). Det som mangler er arkets **faste protokoll** som en test man gjennomfører.

Arket (fane «Teknikktest») kjører tre køller — **Driver · J7 · Wedge** — i to deler:
- **Del A:** fem slag, kolonnene carry, målt lengde, side.
- **Del B:** ti slag, kolonnene målt lengde, carry, side, **til hull**, **PEI**, lengde, club path, face angle, attack angle, dynamic loft, impact location, ballhastighet. Med snitt og standardavvik nederst.

`/portal/tren/tester/[testId]/gjennomfor` finnes og har PEI som scoring-kind, men ikke launchmonitor-kolonnene.

### Skjermer
1. **`/portal/tren/tester/teknikktest/gjennomfor`** — innlegging. Slag for slag, én kølle av gangen, del A før del B. På mobil ved siden av en launchmonitor: store felter, tabulering mellom kolonner, ingen scroll mellom hvert slag.
2. **`/portal/tren/tester/teknikktest/[resultatId]`** — resultatet. Snitt og spredning per kolonne, og forrige gjennomføring ved siden av.

### Funksjoner å kode
- `TestDefinition` med `scoringRule` for teknikktest + `ShotResult`-rader (én per slag) knyttet til `TestResult`. Ikke ett JSON-felt med tolv verdier.
- `beregnPEI(tilHull, lengde)` — nærhet delt på lengde. Regelen finnes allerede konseptuelt i systemet (TN-07 og tester-hubben viser PEI); sørg for at det er **én** implementasjon, ikke to.
- `importerFraTrackMan(sessionId, testResultId)` — slagene finnes ofte i en TrackMan-økt allerede. Manuell innlegging skal være reserven, ikke normalen.
- Snitt og standardavvik per kolonne. **Del A og del B skal ikke slås sammen** — de måler forskjellige ting (kalibrering vs. prestasjon).

### Ferdig når
Utøveren kan kjøre arkets teknikktest på tre køller, få slagene inn enten fra TrackMan eller manuelt, og se snitt og spredning mot forrige gjennomføring.

---

## PHQ-F · Mitt støtteapparat + helseopplysninger

Helsedelen er allerede bedre løst i Player HQ enn i arket: `/portal/meg/helse` har `HealthEntry`, skade via `Leave.isInjury`, belastning, og eksplisitt art. 9-samtykke med en ærlig avvisningsflate. **Ikke rør den.**

To hull:
1. **«My Team».** Player HQ kjenner *én* coach (`getCoachProfile`) pluss foresatte. Arket (fane «1. Person info») har fire roller: **golftrener, fysisk trener, mental trener, putting-trener** — hver med navn, e-post og mobil, og de er ofte ikke ansatt samme sted.
2. **Allergier** finnes ikke som felt. Skader og medisinske forhold finnes; allergier er tredje raden i arket og mangler.

### Skjermer
1. **`/portal/meg/apparatet`** — utøverens eget støtteapparat. De fire rollene, hvem som fyller dem, trykkbar kontakt. Roller uten person vises som hull, ikke skjules.
2. Utvid **`/portal/meg/helse`** med allergier. Samme samtykkeport som resten av helsedataen — allergier er art. 9-data.

### Funksjoner å kode
```
SupportTeamMember  userId, rolle (GOLF|FYSISK|MENTAL|PUTTING|ANNEN),
                   navn, epost?, mobil?, coachUserId?, organisasjon?
```
- `coachUserId` er valgfri: putting-treneren har ofte ikke konto i systemet. Da er navn og telefon nok. **Ikke krev bruker for å registrere en person.**
- `hentStotteapparat(userId)` — slår sammen `SupportTeamMember`, den tildelte AK-coachen fra `getCoachProfile`, og Team Norway-apparatet der utøveren er i en TN-gruppe. Én liste, med kilde per rad.
- Utvid `HealthEntry` eller lag `HealthNote` med `type: ALLERGI|MEDISINSK|SKADE` framfor å legge et fritekstfelt til.

### Ferdig når
Utøveren kan registrere hele apparatet sitt, også personer uten konto, og allergier ligger bak samme samtykke som resten av helsedataen.

---

## Rekkefølge og størrelse

| Pakke | Størrelse | Rekkefølge | Begrunnelse |
|---|---|---|---|
| PHQ-A Utviklingssjekk | Stor | 1 | Størst hull, og NGF bruker den aktivt i dag. Blokkerer ingenting, men er den som betyr mest. |
| PHQ-F Støtteapparat | Liten | 2 | Billig, og PHQ-C trenger den (hvem hjelper meg). |
| PHQ-C Prosessmål | Middels | 3 | Avhenger av PHQ-F. |
| PHQ-D Oppvarming | Liten | 4 | Selvstendig, gjenbruker `TrainingPlanSession`. |
| PHQ-E Teknikktest | Middels | 5 | Avhenger av at PEI-implementasjonen samles først. |
| PHQ-B Måltavle | Stor | 6 | Størst datajobb (35 metrikker fra fire kilder). Kan starte parallelt med A om det er kapasitet. |

## Én avgjørelse må tas før PHQ-A starter

Skal arkets syv kategorier utvide `TalentTracking` til syv akser, eller skal utviklingssjekken være et eget spor ved siden av coachens femakse-radar?

Argumentet for eget spor: radaren er *coachens vurdering*, utviklingssjekken er *utøverens selvvurdering*. Å slå dem sammen gjør det umulig å se når de er uenige — og uenigheten er ofte det mest interessante i en utviklingssamtale.

Argumentet for å utvide: to strukturer som måler nesten det samme blir to steder å vedlikeholde, og utøveren ser to radarer som ikke stemmer.

Vi heller mot **eget spor, med de to visningene side om side i utviklingsplanen**. Men det er Train-locks avgjørelse, og den bør skrives ned før første fil.

## Referansenivåer — hva Player HQ skal lese, ikke bygge

Team Norway-flaten får skjermen som eier tour-referansen (median PEI per avstandsbånd, treff green/fringe, forventet slag per underlag). Player HQ skal **konsumere** den, ikke duplisere den:

- `/portal/talent/mitt-niva` viser i dag `benchmarkLabel` per test fra `testNivaaer`. Den skal peke på det samme referansesettet.
- `/portal/talent/sammenligning` sammenligner i dag mot kohorten på samme nivå. Legg tourreferansen inn som en tredje linje, tydelig merket som referanse og ikke som mål.
- Referansesettet må ha `sesong` og `populasjon` som felter. Dagens kilde (IUP-arket) mangler begge — navnelisten daterer den til rundt 2010–2013, og den kan ikke brukes som krav før den er byttet ut. Bygg for at settet skiftes per sesong.
