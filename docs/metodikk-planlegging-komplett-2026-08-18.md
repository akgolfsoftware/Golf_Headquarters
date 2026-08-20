# Hvordan plattformen planlegger — komplett gjennomgang

**Laget:** 18.08.2026. **Formål:** Ett dokument som viser, for hvert planleggingsområde
(trening, turnering, driller, tester, terminologi), tre ting side om side:

1. **Hva kunnskapskildene sier** (Masterbrain + ak-second-brain + ak-brain — hentet fra kladden
   du allerede har gitt meg, `KLADD metodikk samlet til gjennomgang.md`)
2. **Hva koden faktisk gjør** (verifisert i `~/Developer/akgolf-hq` nå, 18.08.2026 — filsti + linje)
3. **Der de spriker eller noe mangler** — markert **[KONFLIKT]** eller **[UAVKLART]**, med et
   forslag til hvilken side som bør vinne, men ingen side er valgt for deg.

**Slik bruker du dette:** Les gjennom, avgjør punkt for punkt. Der jeg har markert et forslag
(«**Anbefaling:**»), er det fordi én kilde allerede er implementert i produksjonskode og den
andre ikke er — å velge den ikke-implementerte betyr en kodeendring, å velge den implementerte
betyr bare å rette kunnskapsfilene. Ingen endring gjøres før du sier ja.

**Viktig oppdagelse mens dette ble satt sammen:** koden har på flere punkter allerede tatt en
beslutning som verken kladdens «kilde A» eller «kilde B» stemmer helt med — et tredje tall/navn.
Se spesielt punkt 4 (invarianter: koden har 9, ikke 13 eller 7) og punkt 5 (tester: databasen har
31, ikke 20/21/36).

---

## 1. AK-formelen — hvordan en økt klassifiseres

**Kunnskap sier:** Gammel v1-syntaks `PYRAMIDE_OMRÅDE_L-FASE_CS_M_PR` (6 felt) er utgått. Ny v2
(kladden kaller den også «v3» ett sted — se punkt 9) skal ha variabelt antall felt, ikke ferdig
avklart (5 av 10 åpne punkter gjensto per 17.08.2026), ikke implementert i kode ifølge kladden.

**Kode gjør (verifisert 18.08.2026):**
- `src/lib/ak-formel-visning.ts` bygger allerede broen mellom UI og database:
  - Motorikk/læringssteg: `FaseSteg = "UTEN_BALL" | "LAV_HASTIGHET" | "AUTO"` — **NB: koden
    skriver `LAV_HASTIGHET`, Paper-HTML-en skriver `LAV_HAST`.** Kun stavemåten skiller
    (bekreftet i `beslutninger.md` som kjent, akseptert avvik).
  - Press: `PressNivaa = "FRI" | "KRAV" | "UTFORDRING" | "KONKURRANSE"`.
- **[KONFLIKT — ny, ikke i kladden]** `beslutninger.md` (Anders 2026-08-05) sier press-navnene
  skal være `ALENE · OBSERVERT · KONKURRANSE · TURNERING` («følger Paper»). Selve koden i
  `ak-formel-visning.ts` bruker fortsatt de GAMLE navnene `FRI/KRAV/UTFORDRING/KONKURRANSE`.
  Beslutningen er tatt, men ikke implementert i denne fila ennå.
- **Ingen egen «OMRÅDE»-enum i databasen.** Nærmeste er `SkillArea` i `prisma/schema.prisma`,
  som kun har 5 verdier (TEE_TOTAL/TILNAERMING/AROUND_GREEN/PUTTING/SPILL) — mye grovere enn
  AK-formelens 16-verdis OMRÅDE-liste (TEE, INN50/100/150/200, CHIP, PITCH, LOB, BUNKER,
  PUTT0-3…PUTT40+, STYRKE, MOBILITET, BANE) som kladden og Paper-HTML-ene bruker
  (`INNSPILL_50`, `PUTT_3_5`, `CHIP`, `TEE_TOTAL` osv.).
- Full v2-formel per `beslutninger.md`: `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS`, f.eks.
  `TEK_CHIP_LAV_HAST_TRENINGSOMRADE_ALENE` — 5 felt, ikke variabelt (3–7) slik kladden
  beskriver den ikke-ferdige v2/v3-planen. Dette er trolig en forenklet Paper-versjon av det
  som egentlig var planlagt — verdt å avklare om 5-felts-formelen ER v2-fasiten, eller bare et
  midlertidig Paper-visningsformat mens de resterende 5 av 10 åpne punktene avklares.

**Åpent:** Hvilken av de to OMRÅDE-listene er riktig fremover — 16-verdis (kladd/Paper) eller
5-verdis `SkillArea` (database)? Databasen er grovere; en full port av Workbench til produksjon
må enten utvide `SkillArea` eller innføre et eget, mer detaljert OMRÅDE-felt.

---

## 2. Kategori-system A–K

**Kunnskap sier [KONFLIKT i kladden]:** Masterbrain (`canon-methodology.json`) sier A=nybegynner
(handicap 54+) → K=elite. ak-second-brain (`iup-kategorisystem.md`) sier motsatt: A=World Elite
(snittscore <68) → K=Nybegynner Junior (100+). Masterbrains egen MANIFEST.md innrømmer at
canon-methodology.json «har den invertert og skal rettes».

**Kode gjør:** `src/lib/domain/ak-kategori.ts` bruker **A=elite, K=nybegynner**, snittscore-basert
— samme retning og samme skala som ak-second-brain sin `iup-kategorisystem.md`. Kodekommentar:
«avklart i kode, bekreftes av Anders», datert 2026-06-22.

**Anbefaling:** Dette er allerede avgjort i praksis — koden har kjørt med A=elite siden juni.
Rett Masterbrain sin `canon-methodology.json` til samme retning, ikke omvendt. (Punkt 16,
spørsmål 1 i kladden kan trolig lukkes med dette som svar — men bekreft selv, dette er ditt kall.)

**Fortsatt åpent:** Målestokk (handicap vs. snittscore vs. GFGK-slagsnitt-varianten) — tre ulike
tabeller finnes fortsatt i kunnskapsfilene, og `ak-kategori.ts` bruker kun snittscore. Er
handicap-varianten (Masterbrain) og GFGK-slagsnitt-varianten (`veien-til-lavere-score.md`) ment
å leve videre til andre formål (voksne uten aktiv snittscore-tracking?), eller skal alt
konsolideres til snittscore slik koden allerede gjør?

---

## 3. Periodisering

**Kunnskap sier [KONFLIKT i kladden]:** tre periodiseringsmodeller — CANON (3 perioder,
okt–jan/feb–apr/mai–sep), IUP (4 perioder inkl. Evaluering, 52 uker), GFGK (3 perioder × 5
underfaser BUILD→STAB→TEST→TRANSFER→PERFORM, nov–mar/apr–jun/jun–okt).

**Kode gjør:** `prisma/schema.prisma:85-94`:
```
enum LPhase { GRUNN, SPESIAL, TURNERING, TESTUKE, FERIE, TRENINGSSAMLING, HELDAGSSAMLING }
```
Kommentert «8c.1, Anders 2026-07-12». Dette bekrefter kladdens punkt om at produksjonssystemet
bruker et FJERDE navnesett (`GRUNN`/`SPESIAL`/`TURNERING`) pluss de fire ekstra verdiene CANON
ikke kjenner (`TESTUKE`, `FERIE`, `TRENINGSSAMLING`, `HELDAGSSAMLING`) — alt sammen allerede i
produksjon, ikke bare et forslag. Ingen av CANON/IUP/GFGK sine periodenavn eller
Evaluering-periode er i databasen.

**Anbefaling:** `LPhase`-enumet i databasen er den eneste av de fire modellene som faktisk
kjører og lagrer data i dag. En manuelt vedlikeholdt oversettelsestabell (nevnt i kladden) bør
være eneste bro mellom CANON/IUP/GFGK sine begreper (brukt i coaching-samtaler, sportsplaner) og
`LPhase` (brukt i systemet) — ikke fire parallelle sannheter.

**Fortsatt åpent:** Skal `LPhase` utvides med en egen `EVALUERING`-verdi (slik IUP-modellen har),
og skal pyramidejustering for `TESTUKE`/`FERIE`/`TRENINGSSAMLING`/`HELDAGSSAMLING` defineres et
sted (CANON sier i dag ingenting om disse fire)?

---

## 4. Invarianter (faste regler)

**Kunnskap sier [MOTSTRID i kladden]:** to sett — 13 stk i `canon-methodology.json` (v1), 7 stk
i `sg-principles.json`, delvis overlappende, ingen bekreftet liste for v2.

**Kode gjør — TREDJE tall, matcher verken 13 eller 7:** `src/lib/canon/invarianter.ts` (414
linjer) har **9 invarianter** (8 «harde» + 1 «myk»):
- `tek-min` — **ikke flat 15 % slik kladden/CLAUDE.md sier.** Varierer per periode: SPES 15 %,
  GRUNN 25 %.
- `cs50-ballkontakt`
- `alder-timer` (ukentlige timer ≤ alder — hard)
- `maks-2-svingendringer-turnering`
- `cs-tak`
- `l-fase-tillatt`
- `pyramide-maks`
- `volum-uke-maks`
- `hviledager-min` (myk — eneste myke invariant)

**Anbefaling:** Dette er den mest oppdaterte kilden av de tre — 9-tallet bør trolig BLI
v2-fasiten, ikke 13 eller 7. Men det er ikke bekreftet av deg at dette faktisk ER den ferdige
v2-listen, eller om den fortsatt er under arbeid. **Én ting er sikkert: TEK-minimum er ikke ett
tall (15 %) — det er periodeavhengig (15–25 %), og CLAUDE.md sin «TEK min 15 %» under §Faglig
grunnlag er dermed unøyaktig/forenklet mot det koden faktisk håndhever.**

**Fortsatt åpent:** Er `invarianter.ts` sine 9 den avklarte v2-listen? CS50-regelen (invariant
2 i gammel v1-liste) finnes fortsatt som `cs50-ballkontakt` i kode, til tross for at hele
CS-skalaen er uavklart (se punkt 6) — bør denne invarianten omformuleres til å ikke referere en
uavklart skala?

---

## 5. Testprotokoller

**Kunnskap sier [MOTSTRID i kladden]:** to systemer — IUP (20 tester, 7 dimensjoner, danner
kategori A–K) og Team Norway/NGF-tester (gate-tester, brukt fra U15), ikke koblet sammen.

**Kode gjør — FJERDE tall:** Databasen har **31 `TestDefinition`-rader** i dag (verken 20, 21
eller 36). Seedskript `prisma/scripts/seed-ngf-test-protocols.ts` (godkjent av Anders
2026-05-23) beskriver strategien: behold de 31 som fantes, oppdater protokoll-JSON på 15 av dem
som matcher NGF-20-listen, legg til 5 nye. Modeller: `TestDefinition`, `TestResult`,
`TestSession`, `TestAssignment`.

**Anbefaling:** 31-tallet er det som faktisk står i databasen og er allerede en bevisst
sammenslåing (15 fra én liste + 5 nye + resten urørt) — ikke et uavklart tall som 20/21/36-
spriket i kladden antyder. Trolig bør kunnskapsfilene oppdateres til å referere 31 som gjeldende
antall, med en liste over hvilke som er IUP-baserte og hvilke som er NGF/Team Norway-baserte.

**Fortsatt åpent (uendret fra kladden):** skal IUP sine tester og Team Norway sine tester være
koblet sammen konseptuelt (samme formål, ulike navn), eller bevisst separate (intern
kategori-plassering vs. ekstern landslagsuttak)? 31-tallet i databasen svarer ikke på dette —
det bekrefter bare at NOE sammenslåing allerede har skjedd, ikke hvilken logikk som styrer den.

---

## 6. Driller og øvelser

**Kunnskap sier:** Masterbrain sin godkjente drill-bank (`drills.json`) ble tømt 31.07.2026 —
14 drill-navn fjernet pga. selvmotsigende CS/pyramide-data. 895 kandidat-driller ligger
ugjennomgått i `ovelsesbank/kandidater/`. ak-second-brain har IKKE fått samme opprydding — tre
filer der refererer fortsatt aktivt til de samme 9+ drill-navnene Masterbrain fjernet som
upålitelige.

**Kode gjør:** Ingen modell heter `Drill` — heter `ExerciseDefinition` i `prisma/schema.prisma`,
med felter `pyramidArea`, `lPhase`/`lPhases` (**NB: bruker periodiserings-enumet, ikke en egen
læringsfase-type — mulig navnekollisjon med L-faser i formelen, bør sjekkes nærmere**),
`skillArea`, `csMin/csMax`, `minKategori/maxKategori` (`NgfKategori`).

**Viktig, bekrefter kladden:** produksjonskoden respekterer allerede tom-bank-regelen.
`src/lib/agents/drill-forslag-agent.ts` sjekker eksplisitt `erMasterbrainDrillBankTom()` og
NEKTER å foreslå drillnavn så lenge Masterbrains `drills.json` er tom. Dette kalles
«never-invent-loven» i kode, innført 07.08.2026 etter at agenten tidligere fant på drillnavn
selv. Agenten finner stallens svakeste SG-område (60 dagers snitt) og rapporterer
`DRILL_BANK_EMPTY` i stedet for et faktisk forslag.

**Anbefaling:** Koden er allerede strengere og mer forsiktig enn ak-second-brain sine tre
filer — koden nekter å dikte, kunnskapsfilene presenterer fortsatt de samme fjernede drillene
som om de virker. **Dette er den klareste konflikten å lukke:** enten rettes
`morad-common-faults.md`/`morad-diagnostiske-regler.md`/`morad-drill-bibliotek.md` til å fjerne
de 9 upålitelige drill-navnene (matcher hva koden allerede håndhever), eller så må noen faktisk
verifisere om drillene er pålitelige og gjeninnføre dem BEGGE steder samtidig.

**Fortsatt åpent:** 895 kandidat-driller er ikke gjennomgått for samme type CS/pyramide-
motsigelser. `ExerciseDefinition.lPhase`-feltet bør avklares — er det faktisk periodiserings-
`LPhase` (GRUNN/SPESIAL/...) eller en feilbenevnt kobling til motorikk-steget (UTEN_BALL/
LAV_HASTIGHET/AUTO)? Dette bør sjekkes i kode før noe av de 895 godkjennes.

---

## 7. Turneringsplanlegging

**Kunnskap sier:** `beslutninger.md` (Anders 2026-08-04): turneringsplanlegging skal inn i
Workbench — fasiten `workbench-turnering.html` bygges som DEL av `WorkbenchV2`, ikke som egen
ombygging av gammel `/admin/tournaments`.

**Kode gjør:** `Tournament`, `TournamentResult`, `TournamentEntry`, `TournamentPreparation` — 4
modeller i `prisma/schema.prisma`. På komponentsiden finnes `TurneringPlanleggerV2.tsx` som
**egen, separat komponent — IKKE integrert i selve `WorkbenchV2.tsx`** slik beslutningen og
Paper-fasiten (`workbench-turnering.html`) faktisk tegner det.

**[KONFLIKT]** Beslutningen fra 04.08 er altså ikke fullført i kode ennå — turnering lever som
en frittstående planlegger, ikke som en sone/fane inne i Workbench.

**Fortsatt åpent (fra min forrige Workbench-revisjon):** `workbench-turnering.html` bruker
andre demo-navn (Max Risvåg, Sondre U. Thøgersen) enn Øyvind Rohjan — er det bevisst (flere
deltakere i samme turnering) eller bør hovedspilleren også vises der?

---

## 8. Workbench — hvor selve porten faktisk står

Ikke en metodikk-konflikt, men verdt å ha med som statuskart for oppryddingen:

- **PlayerHQ:** `WorkbenchV2.tsx` (3325 linjer, hovedporten fra `fase1/workbench-mobil.html`) +
  `WorkbenchV2Mobil.tsx` + `WorkbenchColdstart.tsx` + `WorkbenchAarsplan.tsx` +
  `WorkbenchV2Sheets.tsx` + `WorkbenchInngang.tsx`.
- **AgencyOS (coach-siden):** `src/components/admin/coach-workbench/coach-workbench.tsx` +
  `WorkbenchMobilV2.tsx` + `CoachWorkbenchMount.tsx` — dette er trolig det som skal erstatte
  `templates/agencyos-workbench/AgencyosWorkbench.dc.html`-malen jeg nettopp ryddet i (PR #561).
  **Verdt å sjekke:** er navnekanon/raster/L-fase-rettingene fra PR #561 allerede riktige i
  `coach-workbench.tsx`, eller må samme rydding gjøres der også når porten når dit?
- **Turnering:** egen `TurneringPlanleggerV2.tsx`, ikke integrert (se punkt 7).

---

## 9. AK-formel-navngivning: v2 eller v3

**Kunnskap sier [KONFLIKT i kladden]:** Din egen instruks kaller det «v2». Tre
ak-second-brain-filer kaller samme 03.08.2026-beslutning «v3».

**Kode gjør:** `beslutninger.md` — kodens egen låste, kanoniske beslutningsfil for dette
repoet — kaller det **v2** konsekvent, flere steder, med formelen skrevet ut
(`PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS`).

**Avgjort av deg i denne økten (18.08.2026):** v2 er navnet fremover, per `beslutninger.md`.
ak-second-brain sine tre filer (`ak-formelen.md`, `ak-golf-canon.md`, `iup-kategorisystem.md`)
bør rettes fra «v3» til «v2» for å matche. (Allerede brukt i PR #561, se punkt 8.)

---

## 10. Ord og uttrykk — status

**Ingen reell konflikt her**, kun ufullstendighet og ett åpent bekreftelsesspørsmål:

- **Ordbok** (`knowledge/entities/ordbok.json`, MORAD-fagspråk): kun 75 av 1 081
  kildesegmenter destillert. 1 006 gjenstår i råtranskripsjonene.
- **Attribusjon:** rettet fra «Mac Malaska» til «Mac O'Grady» 31.07.2026, men filen selv
  markerer `uverifisert_av_anders: true` — **du bør bekrefte dette siden det er ditt eget
  treningsmateriale fra 2011–2016.**
- **Konseptkatalog** (36 MORAD-konsepter, C001–C036): hub-oversikt komplett, men 18 av de
  underliggende detaljbegrepene er ikke lest fullt ut i kladd-gjennomgangen.
- Ingen av disse har motstridende definisjoner mellom kildene — kun ulik fullførelsesgrad.

**P-posisjoner (P1.0–P10.0)** og **LIFE-koder**: ingen motstrid funnet noe sted — begge kan
regnes som stabil fasit allerede.

---

## 11. Samlet liste — alt som trenger et JA/NEI fra deg

Sortert etter hvor mye som allerede er avgjort i praksis (kode) vs. reelt åpent:

**Kan trolig lukkes raskt (koden har allerede valgt, bare kunnskapsfilene må rettes):**
1. Kategoriretning A–K → kode sier A=elite. Rett Masterbrain sin `canon-methodology.json`.
2. v2/v3-navn → kode sier v2. Rett ak-second-brains tre filer. *(Avgjort i denne økten.)*
3. Drill-navnene i ak-second-brain (`morad-common-faults.md` m.fl.) → kode nekter allerede å
   bruke dem. Rett de tre filene til å matche never-invent-regelen i `drill-forslag-agent.ts`.
4. Testprotokoll-antall → kode/database sier 31. Oppdater kunnskapsfilene til dette tallet med
   forklaring på hvilke 15+5+resten som utgjør det.

**Krever et faktisk valg fra deg (ingen side er "koden" ennå):**
5. Målestokk for kategori — handicap, snittscore, eller begge med omregningstabell?
6. Periodiseringsmodell — er CANON/IUP/GFGK sine tre modeller ment for ulike formål, eller skal
   én vinne? `LPhase` i database er allerede sin egen, fjerde variant.
7. To testsystemer (IUP vs. Team Norway) — koble sammen eller bevisst atskilt?
8. 895 drill-kandidater — gå gjennom nå, eller vente til resten av dette dokumentet er avklart?
9. Ordbok-attribusjon (Mac O'Grady, ikke Malaska) — bekreft.
10. CS-nivåene — fortsatt bevisst uavklart (bekreftet i denne økten: fjernes fra ny kode inntil
    videre, men brukes fortsatt aktivt andre steder i både kode og kunnskapsfiler).

**Nye funn fra denne kodegjennomgangen, ikke i kladden:**
11. Press-navn i `ak-formel-visning.ts` (`FRI/KRAV/UTFORDRING/KONKURRANSE`) matcher IKKE
    `beslutninger.md` sin vedtatte `ALENE/OBSERVERT/KONKURRANSE/TURNERING` — koden må rettes,
    ikke bare kunnskapsfilene. (Punkt 1)
12. `SkillArea`-enumet (5 verdier) er mye grovere enn AK-formelens OMRÅDE-liste (16 verdier) —
    avklar om dette skal utvides før full Workbench-port. (Punkt 1)
13. TEK-minimum er periodeavhengig i kode (15–25 %), ikke flatt 15 % slik CLAUDE.md sier —
    CLAUDE.md bør rettes til å matche `invarianter.ts`. (Punkt 4)
14. Turneringsplanlegging er IKKE integrert i `WorkbenchV2` ennå, til tross for
    04.08-beslutningen om at den skal være det — `TurneringPlanleggerV2.tsx` står fortsatt for
    seg selv. (Punkt 7)
15. `ExerciseDefinition.lPhase` i databasen kan være en navnekollisjon mellom periodiserings-
    `LPhase` og motorikk-steget — bør avklares før driller kobles til periode. (Punkt 6)

---

*Kilder: `KLADD metodikk samlet til gjennomgang.md` (kunnskapssiden) + direkte lesning av
`~/Developer/akgolf-hq` 18.08.2026 (kodesiden — `ak-formel-visning.ts`,
`src/lib/domain/ak-kategori.ts`, `src/lib/canon/invarianter.ts`, `prisma/schema.prisma`,
`src/lib/agents/drill-forslag-agent.ts`, `beslutninger.md`, `WorkbenchV2.tsx` og tilhørende
komponenter). Ingen kode er endret som del av dette dokumentet.*
