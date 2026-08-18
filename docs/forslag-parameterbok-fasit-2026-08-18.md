# Forslag til fasit — alle 26 revisjonspunktene

**Laget:** 18.08.2026. **Status:** FORSLAG — ingenting her er vedtatt før du sier ja per punkt.
Følger `parameterbok-planlegging-2026-08-18.md` punkt for punkt (§17-nummereringen).

**Prinsippet bak alle anbefalingene:** der koden allerede kjører med en løsning i produksjon,
anbefales den som fasit (billigst: bare kunnskapsfiler rettes). Der et vedtak finnes men ikke
er implementert, anbefales implementering. Kun der ingen side har et reelt fortrinn, foreslås
et faktisk valg med begrunnelse.

Hvert punkt har en av tre merkelapper:
- **[DOKUMENT-RETTING]** — koden er fasit, kunnskapsfilene rettes. Billig, ufarlig.
- **[KODE-ENDRING]** — vedtak finnes, koden må oppdateres. Planlegges som vanlig PR.
- **[DITT VALG]** — reell beslutning, jeg gir anbefaling med begrunnelse.

---

## Blokk 1 — AK-formelen (punkt 1–8)

### 1. Områder: 5-verdis SkillArea vs. 16-verdis OMRÅDE-liste

**[DITT VALG] Anbefaling: behold begge, med klar rollefordeling.**
`SkillArea` (5 verdier) forblir databasens grove akse — den driver SG-analyse, drill-valg og
statistikk, og å utvide den ville kreve migrering av alle eksisterende økter og resultater.
Den finkornede 16-listen lever som **OMRÅDE-feltet i formel-strengen** (slik Paper-fasitene
allerede gjør: `INNSPILL_50`, `PUTT_3_5`). Konkret: legg til ett valgfritt felt
`omrade String?` på `TrainingPlanSession` med de 16 verdiene som zod-validert liste (ikke
Prisma-enum — lettere å justere), og la `SkillArea` utledes automatisk fra området
(INN50–200 → TILNAERMING, CHIP/PITCH/LOB/BUNKER → AROUND_GREEN, PUTT* → PUTTING osv.).
Da får du finkornet planlegging uten å røre eksisterende data.

**Normaliser samtidig 16-listen til Paper-skrivemåten** (én stil): `TEE`, `INNSPILL_50`,
`INNSPILL_100`, `INNSPILL_150`, `INNSPILL_200`, `CHIP`, `PITCH`, `LOB`, `BUNKER`, `PUTT_0_3`,
`PUTT_3_5`, `PUTT_5_10`, `PUTT_10_40`, `PUTT_40_PLUSS`, `STYRKE`, `MOBILITET`, `BANE`.

### 2. Motorikk-stavemåte: LAV_HASTIGHET vs. LAV_HAST

**[DOKUMENT-RETTING] Anbefaling: LAV_HAST vinner (Paper-skrivemåten).**
Formelen er en kompakt streng — kortformen er mer lesbar i
`TEK_CHIP_LAV_HAST_TRENINGSOMRADE_ALENE` enn `..._LAV_HASTIGHET_...`. Koden i
`ak-formel-visning.ts` renames `LAV_HASTIGHET` → `LAV_HAST` (én type + interne referanser,
ingen DB-endring siden DB lagrer L-faser, ikke stegene). Teknisk sett en liten kodeendring,
men triviell og uten datarisiko.

### 3. Gamle L-faser (L_KROPP…L_AUTO) i databasen

**[DITT VALG] Anbefaling: behold som lagringsformat bak broen — IKKE migrer nå.**
Broen i `ak-formel-visning.ts` fungerer, all historikk er lagret i 5-fase-formatet, og en
migrering gir null funksjonell gevinst så lenge UI aldri viser de 5 gamle navnene. Sett i
stedet en regel: **L_KROPP/L_ARM/L_KOLLE/L_BALL/L_AUTO er interne lagringsverdier — de skal
aldri vises i UI eller brukes i ny forretningslogikk.** Revisiter når v2-formelen er 100 %
avklart (de 5 gjenstående av 10 åpne punktene).

### 4. Belastning: M0–M5 i DB uten bro til de 4 nye verdiene

**[KODE-ENDRING] Anbefaling: bygg samme bro som for motorikk/press.**
Utvid `ak-formel-visning.ts` med en tredje mapping:

| UI-verdi | Dekker M-verdier | Skrives til DB som |
|---|---|---|
| INNENDORS | M0, M1 | M1 |
| TRENINGSOMRADE | M2, M3 | M2 |
| BANE | M4 | M4 |
| KONKURRANSE | M5 | M5 |

(Fordelingen M0/M1→INNENDORS osv. er mitt forslag ut fra M-skalaens definisjon «kontrollert
range uten ball → faktiske turneringsforhold» — verifiser mot din intensjon før implementering.)
`MMiljo`-enumet blir liggende som lagringsformat, samme regel som punkt 3: aldri vist i UI.

### 5. Press-navn: vedtatt ALENE/OBSERVERT/KONKURRANSE/TURNERING ikke i kode

**[KODE-ENDRING] Anbefaling: implementer vedtaket fra 05.08.**
Ren omdøping i `ak-formel-visning.ts`: FRI→ALENE, KRAV→OBSERVERT, UTFORDRING→KONKURRANSE,
KONKURRANSE→TURNERING. PR-mappingen (PR1–PR5) er uendret. Én felle: gamle «KONKURRANSE» og nye
«KONKURRANSE» betyr ulike nivåer (PR3 vs PR4/5) — søk gjennom all kode som sammenligner på
strengverdien før merge, så ingen logikk stille bytter nivå.

### 6. CS-skalaen

**[DITT VALG — allerede delvis besluttet 18.08] Anbefaling: formaliser beslutningen.**
Vedtatt i økt: CS brukes ikke i noe nytt. Forslag til fullt vedtak: (a) `CSNivaa`-enumet og
`csNivaa`-feltet blir stående i DB (historikk), (b) invariant 2 og 5 omformuleres til å ikke
referere CS (se punkt 14), (c) `csMin`/`csMax` på ExerciseDefinition og `csTargetByKategori`
på de 895 kandidatene ignoreres ved inntak inntil skalaen er avklart, (d) når du en gang
avklarer skalaen: avgjør samtidig om CS20–40 skal inn (DB har kun CS50–100 i dag).

### 7. RANDOM vs VARIABEL i PracticeType-enumene

**[DITT VALG] Anbefaling: VARIABEL vinner, RANDOM utgår.**
«Variabel trening» er det norske fagbegrepet (motorisk læring: blokk/variabel/random er
egentlig tre nivåer, men appen bruker to). Siden alt annet i plattformen er norsk bokmål, er
VARIABEL riktig. `PracticeType.RANDOM` migreres til VARIABEL og de to enumene
(`PracticeType`/`DrillPracticeType`) slås sammen til ett.

### 8. To session-status-enums (SessionStatus + SessionStatusV2)

**[KODE-ENDRING] Anbefaling: konsolider til SessionStatusV2, med migreringsplan.**
V2-settet (PLANNED/IN_PROGRESS/COMPLETED/CANCELLED/SKIPPED) er enklere og dekker behovet.
ACTIVE/PAUSED/ABANDONED fra v1 mappes til IN_PROGRESS/IN_PROGRESS/CANCELLED. Dette er en
opprydding uten hastverk — legges i køen bak de metodikk-kritiske punktene.

---

## Blokk 2 — Periodisering (punkt 9–10)

### 9. To periodesystemer: LPhase vs PeriodeType

**[KODE-ENDRING — den viktigste tekniske oppryddingen i hele lista]
Anbefaling: slå sammen til ETT enum med alle verdiene.**

Forslag til konsolidert enum (7 verdier):

> GRUNN · SPESIALISERING · TURNERING · EVALUERING · TESTUKE · FERIE · SAMLING

Endringer fra i dag: `SPESIAL` → `SPESIALISERING` (fullt navn, matcher PeriodeType og
fagspråket), `EVALUERING` inn (fantes bare i PeriodeType — og IUP-modellen din har alltid hatt
den), `TRENINGSSAMLING`+`HELDAGSSAMLING` → én `SAMLING` med et varighetsfelt (heldag er en
egenskap, ikke en egen periodetype). `PERIODE_CONSTRAINTS` utvides med rader for TESTUKE og
SAMLING (i dag udefinert — CANON sier ingenting om pyramidejustering for disse; forslag:
TESTUKE arver EVALUERING-raden, SAMLING arver gjeldende ytre periode).

Dette er en ekte migrering (LPhase brukes av mange modeller) — planlegges som egen PR-serie
med `PeriodeNavnMapping` som overgangsbro.

### 10. CANON/IUP/GFGK-periodemodellene vs. databasens

**[DITT VALG] Anbefaling: databasemodellen (punkt 9-versjonen) er systemfasit; CANON/IUP/GFGK
blir pedagogiske kalendere oppå den.**
De tre modellene er ikke konkurrenter — de er årshjul for ulike målgrupper: CANON er
teorirammen, IUP er individkalenderen (og dens Evaluering-periode kommer nå inn i enumet),
GFGK er klubbens kollektive kalender med underfaser (BUILD→STAB osv.). Forslag: underfasene
(BUILD/STAB/TEST/TRANSFER/PERFORM) blir et valgfritt `underfase`-felt på PeriodBlock, ikke et
eget periodesystem. Timing-avvikene (okt–jan vs nov–mar) er tilsiktet ulike kalendere for
ulike kontekster — dokumenteres som sådan, harmoniseres ikke.

---

## Blokk 3 — Kategorier og nivåer (punkt 11–13, 17–19)

### 11. A–K (11) vs A–L (12)

**[DITT VALG] Anbefaling: A–L (12) — databasen vinner.**
L-kategorien finnes allerede i `NgfKategori`, `STANDARD_PYRAMIDE` og `STANDARD_OKT_ANTALL` har
rader for den, og å fjerne den betyr datamigrering for null gevinst. Kunnskapsfilene oppdateres
fra «A–K (11 nivåer)» til «A–L (12 nivåer)». (Merk: også global CLAUDE.md sier «A–K (11
nivåer)» — den rettes samtidig.)

### 12. Masterbrains inverterte kategoriretning

**[DOKUMENT-RETTING] Anbefaling: rett `canon-methodology.json` til A=elite.**
Koden (`ak-kategori.ts`), ak-second-brain og Masterbrains egen MANIFEST er alle enige om at
A=elite er riktig — bare selve fasit-filen henger igjen. Ren retting, ingen beslutning igjen å
ta.

### 13. Tre kategorimålestokker (snittscore/handicap/GFGK-slagsnitt)

**[DITT VALG] Anbefaling: snittscore er primærmålestokken; handicap beholdes som
inngangs-proxy.**
Koden bruker snittscore, og snittscore er det som faktisk måler prestasjon. Men nye
spillere/voksne uten scorehistorikk trenger en inngang — der er handicap nyttig. Forslag: én
offisiell tabell med snittscore som definisjon og en handicap-kolonne merket «veiledende
inngangsverdi». GFGK-slagsnitt-varianten i `veien-til-lavere-score.md` harmoniseres mot samme
tabell (D-gruppe/C-gruppe-navnene i voksen-modellen beholdes, men tallene skal stemme med
hovedtabellen).

### 17. Group.level A1–A5 — tredje nivåsystem

**[DITT VALG] Anbefaling: behold, men omdøp så det ikke kolliderer.**
Gruppenivå (hvor avansert en treningsgruppe er) og spillerkategori (hvor god en spiller er) er
reelt to ulike ting — en A-spiller kan trene i en blandet gruppe. Problemet er bare at begge
bruker bokstaven A. Forslag: `Group.level` omdøpes til `G1–G5` (eller `NIVA_1–5`), så «A» alltid
betyr spillerkategori.

### 18. GFGK-programnavn: DB vs AK-stigen

**[DITT VALG] Anbefaling: utvid `PlayerProgram` til å matche AK-stigen, behold BREDDE/JENTER.**
AK-stigen (Mini/Basis/Utvikling/Elite) er den vedtatte juniormodellen — DB bør ha
GFGK_MINI/GFGK_BASIS/GFGK_UTVIKLING/GFGK_ELITE. Men BREDDE og JENTER er reelle
organisasjonsformer i klubben (tilbud, ikke nivå) — de beholdes ved siden av. Alternativt,
hvis BREDDE/JENTER faktisk ikke brukes av noen rader i produksjon: fjern dem. Sjekk
radantall før valg.

### 19. To pyramidefordelings-tabeller (alders- vs kategoribasert)

**[DITT VALG] Anbefaling: begge beholdes — de svarer på ulike spørsmål.**
Kategoritabellen (`STANDARD_PYRAMIDE` A–L) er individets utgangspunkt; alderstabellen
(GFGK-årsplaner) er gruppens ramme. Regelen som mangler og bør skrives: **ved konflikt for en
konkret junior i en GFGK-gruppe vinner gruppens alderstabell for gruppeøktene, individets
kategoritabell for egentreningen.** Da er det ikke to sannheter, men to lag.

---

## Blokk 4 — Invarianter (punkt 14–15)

### 14. Invariant-antall: 9 (kode) vs 13/7 (kunnskap)

**[DITT VALG] Anbefaling: de 9 i `invarianter.ts` opphøyes til v2-fasiten, med to justeringer.**
9-listen er nyest, mest presis (periodeavhengige tall) og faktisk implementert. Justeringene:
- Invariant 2 (`cs50-ballkontakt`) og 5 (`cs-tak`) refererer den uavklarte CS-skalaen —
  **suspenderes** (deaktiveres i kode med kommentar, står i lista som «hviler til CS-avklaring»)
  i stedet for å slettes.
- De 4 av v1-13-listens invarianter som IKKE er dekket av 9-listen og heller ikke er
  CS-relaterte, vurderes én for én ved neste metodikk-runde: SG-krav (nr. 6, 7, 8 i v1-lista —
  konfidens 0.70, rough-justering, SG-uten-teknisk-plan) og anbefalingsformatet (nr. 13:
  why + what + expected_effect + why_now). Disse er analyse-/agentregler, ikke planregler —
  forslag: de flyttes til et eget dokument «agentregler» så invariant-lista kun handler om
  planlegging.

Resultat: **7 aktive planinvarianter + 2 suspenderte + agentregler i eget dokument.**

### 15. TEK-minimum: periodeavhengig (15–25 %) vs flatt 15 %

**[DOKUMENT-RETTING] Anbefaling: koden er fasit.**
Periodeavhengig TEK-min (GRUNN 25 %, SPESIALISERING 15 %, osv. per §4.1 i parameterboka) er
faglig riktigere enn ett flatt tall. Global CLAUDE.md og kunnskapsfilene rettes fra «TEK min
15 %» til «TEK-minimum per periode, 15–25 % (se PERIODE_CONSTRAINTS)».

---

## Blokk 5 — Blokk-typer og Workbench (punkt 16, 20)

### 16. Blokk-typer: 9 i fasit vs 5 fritekst i DB

**[KODE-ENDRING] Anbefaling: innfør fasitens 9 typer som enum, migrer friteksten.**
Forslag til enum: `OKT · SKOLE · BOOKING · TURNERING · REISE · TEST · SJEKKPUNKT · HELSE ·
GRUPPEOKT`. Dagens fritekst-verdier mappes: SKOLE→SKOLE, REISE→REISE, JOBB→SKOLE (eller egen
JOBB-verdi hvis voksne spillere trenger den — anbefaler å legge til JOBB som 10. verdi, siden
voksen-segmentet finnes), AVTALE/ANNET→SJEKKPUNKT eller ny ANNET-verdi. Merk: flere av de 9 er
ikke busy-blokker men egne modeller (BOOKING=Booking-modellen, TURNERING=TournamentEntry,
TEST=TestAssignment, GRUPPEOKT=GroupSchedule) — enumet er altså *visningslaget* i Workbench,
ikke nødvendigvis én lagringstabell. Det bør dokumenteres eksplisitt: blokk-type = hvordan
Workbench tegner den, kilde = hvilken modell den kommer fra.

### 20. Turnering ikke integrert i Workbench

**[KODE-ENDRING — allerede vedtatt 04.08] Anbefaling: gjennomfør integrasjonen.**
`TurneringPlanleggerV2.tsx` bygges inn som sone/fane i WorkbenchV2 per
`workbench-turnering.html`-fasiten. Ingen ny beslutning — bare gjenstående arbeid som bør inn
i porteringsplanen med egen PR.

---

## Blokk 6 — Tester (punkt 21–22)

### 21. Testantall 31 vs 20/21/36 + IUP/Team Norway-kobling

**[DITT VALG] Anbefaling: 31 er fasit-antallet; systemene forblir atskilte med felles
merking.**
Databasens 31 er allerede en bevisst sammenslåing (15 NGF-oppdaterte + 5 nye + 11 øvrige).
Forslag: hver TestDefinition får et `opphav`-felt (IUP / TEAM_NORWAY / AK_EGEN) så begge
systemene er synlige i samme liste uten å tvinges sammen. IUP-testene fortsetter å drive
kategoriplassering; Team Norway-testene er NGF-krav fra U15. Kunnskapsfilene oppdateres til
31 med opphavsfordelingen som forklaring. (Avklar samtidig 20 vs 21-spørsmålet fra
beslutninger.md — hvilke av de 31 spilleren skal SE i Workbench-testbatteriet.)

### 22. TestResult → TalentHQ-sync mangler

**[KODE-ENDRING — allerede vedtatt 04.08] Anbefaling: bygg synken.** Gjenstående arbeid, egen
PR, blokkert kun av punkt 21-avklaringen om hvilke tester som vises.

---

## Blokk 7 — Driller (punkt 23–25)

### 23. ExerciseDefinition.lPhase — periode eller læringsfase?

**[KODE-ENDRING] Anbefaling: avklar ved inspeksjon, deretter omdøp.**
Feltet bruker periodiserings-enumet i dag. Hvis intensjonen var «hvilken periode passer
øvelsen i» → omdøp til `periode` så navnet er ærlig. Hvis intensjonen var læringsfase →
feltet er feiltypet og må byttes til motorikk-steget. Første steg er å se hvordan feltet
faktisk settes/brukes i drill-selection.ts — gjøres som del av punkt 25-gjennomgangen.

### 24. Drill-navnene i ak-second-brain i strid med never-invent-loven

**[DOKUMENT-RETTING] Anbefaling: rett de tre ak-second-brain-filene.**
Koden nekter allerede å bruke de 9 fjernede drillene. `morad-common-faults.md`,
`morad-diagnostiske-regler.md` og `morad-drill-bibliotek.md` oppdateres: drill-referansene
erstattes med «drill fjernes — banken gjenoppbygges, se never-invent-loven». Feil→årsak-delen
av filene (som er verdifull og ikke bestridt) beholdes urørt.

### 25. 895 drill-kandidater ugjennomgått

**[DITT VALG] Anbefaling: strukturert inntak ETTER at punktene 1–24 er avgjort.**
Kandidatene arver CS-verdier og pyramide-koblinger fra samme kilder som skapte de
selvmotsigende dataene som tømte banken. Å godkjenne dem før område-listen (punkt 1),
CS-status (punkt 6) og lPhase-feltet (punkt 23) er avklart, betyr å bygge på sand. Når
fundamentet står: inntak i bolker per fokusområde (putting først — størst fil, mest brukt),
med automatisk validering mot parameterboka før hver bolk godkjennes av deg.

---

## Blokk 8 — Kurs (punkt 26)

### 26. Kurs-modell finnes ikke

**[DITT VALG] Anbefaling: bygg en enkel Kurs-modell — men definer først hva «kurs» er hos deg.**
Forslag til minimal modell: `Kurs` (navn, program (PlayerProgram), kapasitet, pris?) →
`KursOkt` (kobling til GroupSchedule-mønsteret) → `KursPamelding` (spiller/forelder, status,
betaling via eksisterende Stripe-flyt). Gjenbruk Group-maskineriet der det går — et kurs er i
praksis en tidsavgrenset gruppe med påmelding og betaling. Ikke bygg før du har bekreftet at
kurs (VTG-kurs? nybegynnerkurs? camps?) faktisk skal planlegges i plattformen i 2026.

---

## Gjennomførings-rekkefølge (forslag)

**Runde 1 — dokumentrettinger (ingen kode, kan gjøres samlet i én økt):**
punkt 2*, 12, 15, 24 + kunnskapsfil-oppdateringene fra 11, 21. (*2 har en triviell kodedel.)

**Runde 2 — vedtatt-men-ikke-bygget (egen PR per punkt):**
punkt 5 (press-navn), 20 (turnering inn i Workbench), 22 (TalentHQ-sync).

**Runde 3 — konsolideringer (krever migrering, planlegges nøye):**
punkt 9 (ett periodesystem — størst og viktigst), 16 (blokk-typer), 8 (session-status),
7 (VARIABEL), 17 (G1–G5), 18 (GFGK-programnavn).

**Runde 4 — metodikk-avhengige (venter på dine valg over):**
punkt 1 (område-felt), 4 (belastnings-bro), 6 (CS-formalisering), 14 (invariant-fasit),
23+25 (driller), 13, 19, 21-visning, 26 (kurs).

---

*Alle anbefalinger er forslag. Kryss av per punkt (enig / uenig / endre slik: …) i Typora,
så settes vedtakene inn i beslutninger.md og arbeidet planlegges i runder som over.*
