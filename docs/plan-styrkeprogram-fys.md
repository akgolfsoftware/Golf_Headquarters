# Plan — WANGs styrkeprogram inn i FYS-søylen (ikke frittstående funksjon)

**Status:** UTKAST — venter på Anders' godkjenning før noe kodes (per
`ak-master-claude-operativsystem.md`: nummerert plan, godkjenning FØR kode).
**Omfang:** kun planlegging. Ingen kode, ingen migrasjoner, ingen skjermtegning i denne PR-en.

## Bakgrunn — hva som allerede finnes (verifisert mot kildekoden 08.09.2026)

Før noe foreslås er følgende slått fast direkte i repoet, ikke fra hukommelse:

- **`claude-code-handoff/TESTBATTERI.md` finnes ikke i dette repoet.** Testprotokollene er
  derfor verifisert direkte mot `prisma/scripts/seed-ngf-test-protocols.ts` (kjørende seed),
  ikke mot det oppgitte dokumentet.
- **FYS-testbatteriet har i dag nøyaktig fem protokoller** (`pyramidArea: "FYS"` i seed-scriptet):
  Trapbar Deadlift (1RM, kg), Benkpress (1RM, kg), Standing Long Jump (cm), Ball Throw (cm),
  Clubhead Speed/CHS (mph). Ingen knebøy-1RM, ingen 3000 m, ingen egen kroppsvekt-*test*.
- **Kroppsvekt finnes allerede som data — ikke som test.** `HealthEntry.weightKg` er feltet
  (`prisma/schema.prisma`), og `src/lib/domain/fys-score.ts` bruker allerede
  «siste HealthEntry.weightKg» til å regne markløft og benkpress relativt til kroppsvekt
  (`justertVerdi()` — deler 1RM på kroppsvekt for nettopp disse to løftene). Styrkeprogrammet
  trenger altså IKKE en ny kroppsvekt-test — kilden finnes, den må bare leses samme vei.
- **FYS-indeks-formelen er IKKE lenger «avventer».** `docs/STATUS-NÅ.md` linje 273 lister
  `fys-score v1 (stall-relativ, plassholder-merket i UI)` som **ferdig/solid**, bygget
  2026-06-22 (`src/lib/domain/fys-score.ts`). Setningen i det oppgitte TESTBATTERI-dokumentet
  («FYS-resultatformel AVVENTER») er datert 2026-06-24 — FØR v1 ble bygget — og er dermed
  utdatert. Dette er en annen formel enn WANGs %1RM-belastningsberegning, men det betyr at
  denne planen ikke venter på noen ukjent, uavklart FYS-formel — mønsteret for «beregn live,
  lagre aldri» finnes allerede og skal gjenbrukes (se pkt. 3).
- **Datamodellen for et strukturert styrkeprogram finnes allerede i skjemaet, ubrukt av coach.**
  `FysiskPlan → FysUke → FysOkt → FysOvelseRad` (linje 5357–5464 i `prisma/schema.prisma`) er
  nøyaktig strukturen et 6-ukersprogram trenger. `FysOvelseRad` har ALLEREDE feltet
  `belastningPst Int?` — altså «%1RM» — pluss `sett`, `repsMin/Max`, `rir`, `loggBelastningKg`.
  Verifisert med grep: **ingen kode i `src/app` eller `src/lib` skriver til disse tabellene** —
  eneste skriver er `scripts/seed-screentest-komplett.ts` (demo-seed). Det finnes altså per i
  dag INGEN coach-bygger for et FysiskPlan — kun lesing (PlayerHQ-visning) og en lenke fra
  Workbench (`fysPlanHref`). Styrkeprogrammet er derfor ikke en konkurrerende idé til en
  eksisterende bygger — det er den bygger-funksjonen som mangler.
- **Det finnes til og med en ferdig %1RM-tabellkomponent, men den er koblet fra ingen steder.**
  `src/components/fys-plan/ovelse-tabell.tsx` (`OvelseTabell`) rendrer nøyaktig kolonnene
  Øvelse/Sett/Reps/Hvile/**%1RM**/RIR/Logg fra `belastningPst` — men grep viser at ingen `src/app`-side
  importerer den. Den er skrevet for en tidligere iterasjon og aldri ferdig koblet på. Den
  skal ikke gjenbrukes rått (designfasit er Train-lock siden 25.08, dette er eldre kode), men
  kolonnestrukturen bekrefter at %1RM-visning per øvelsesrad er en allerede tenkt løsning, ikke
  en ny idé.
- **Workbench har allerede et etablert, read-only-mønster for FYS**, men på øktnivå, ikke
  øvelsesnivå: `load-workbench.ts` bygger en palett av FYS-økter fra spillerens `FysiskPlan`
  (økt-tittel + varighet, ikke enkeltøvelser) som coach kan dra inn i uka, og eksponerer
  `fysPlanHref` — en lenke UT til `/portal/tren/fys-plan` (spiller) eller admin-ekvivalenten
  (coach), ikke en inline-redigerbar øvelsestabell inne i `WorkbenchDrill`. `WorkbenchDrill`
  lagrer `akFormel` (JSON, AK-formel-chips) per drill — det finnes intet tilsvarende
  «%1RM-chip»-mønster der i dag.
- **Ingen egen AgencyOS-flate for FYS finnes eller er planlagt.** `docs/MASTERPLAN-GJENSTAAENDE.md`
  punkt 6.5 sier eksplisitt: «Admin har INGEN egen FYS-flate — kun akser i plan/analyse. Avklar
  med Anders om egen admin-FYS-skjerm skal bestilles.» Dette er et allerede kjent, uavklart
  spørsmål — se «Beslutninger til Anders» pkt. (2) under, som kobler seg direkte på dette.
- **`/portal/tren/fys-plan` («FYS-plan»-skjermen) finnes i kode, men har INGEN Train-lock-fasit
  ennå.** MASTERPLAN rad 333 og «D · Canvas for skjermer uten fasit» (rad 272) lister
  «Fysisk + fys-plan» som en av skjermene som **trenger canvas, etter lansering** — nøyaktig
  slik oppgaven antok. Ingen ny flate skal derfor foreslås her (jf. maks 4 PlayerHQ-flater /
  5 AgencyOS-flater) — styrkeprogrammet er innhold PÅ denne allerede planlagte skjermen, ikke
  en ny flate ved siden av den.
- **`docs/AAPNE-SPORSMAAL.md` finnes ikke i repoet** (kan være omdøpt/slettet siden dokumentet
  som beskrev oppgaven ble skrevet) — sjekket direkte mot `docs/STATUS-NÅ.md` og
  `docs/MASTERPLAN-GJENSTAAENDE.md` i stedet, se punktene over.
- **`workbench-funksjoner-roller.md` §5 finnes ikke i repoet** under noe navn jeg kan finne.
  Coach-setter/spiller-leser-mønsteret er i stedet verifisert direkte i kode: `WorkbenchDrill`
  eies og skrives av coach via `wb-actions.ts`; spillerens `/portal`-visninger av Workbench er
  lesevisninger uten skriveadgang til `akFormel` eller andre coach-satte felt. Samme mønster
  legges til grunn for %1RM-feltet under.
- **Scoping-presedens finnes allerede for «WANG-spesifikt, ikke globalt».** `PlayerProgram`-enumet
  har egne verdier `WANG_TOPPIDRETT`/`WANG_UNG`, og `src/lib/domain/grupper.ts` har en kanonisk
  `Group` med `slug: "wang-toppidrett"`. Dette er det etablerte mønsteret for å skille «gjelder
  kun denne skolen/organisasjonen» fra «gjelder alle AK Golf HQ-spillere» — se pkt. 5.

---

## 1. Testdekning — hva mangler, og to alternativer

WANGs program bruker seks mål: kroppsvekt, knebøy 1RM, markløft 1RM, benkpress 1RM,
vertikalhopp, 3000 meter.

| WANG-mål | AK Golf HQ i dag | Vurdering |
|---|---|---|
| Kroppsvekt | `HealthEntry.weightKg` (egen logg, ikke test) | **Dekket** — ikke en test, en løpende måling |
| Markløft 1RM | Trapbar Deadlift (1RM, kg) | **Direkte treff** — annen stangtype (trapbar vs. rett stang), men samme løft og samme 1RM-tall |
| Benkpress 1RM | Benkpress (1RM, kg) | **Direkte treff** |
| Knebøy 1RM | *(finnes ikke)* | **Mangler helt** |
| Vertikalhopp | Standing Long Jump (cm, horisontalt) | **Annen øvelse** — måler eksplosivitet, men ikke samme bevegelse eller enhet |
| 3000 meter | *(finnes ikke)* | **Mangler helt** |

**To alternativer:**

**Alternativ A — legg til de to manglende testprotokollene (Knebøy 1RM, 3000 meter) og bytt
Standing Long Jump ut med Vertikalhopp for styrkeprogrammets bruk.**
Fordel: programlogikken speiler WANGs verktøy 1:1, ingen tilnærming. Kostnad: to nye
protokoller i `seed-ngf-test-protocols.ts` (samme mønster som de fem eksisterende — `scoringMode:
"max"`, `unit`), pluss en beslutning om Standing Long Jump og Vertikalhopp skal sameksistere
(begge er gyldige eksplosivitetsmål, ulike idretter bruker ulike) eller om én erstatter den andre
i CANON-batteriet — CANON-batteriet er et delt, felles testsett for alle spillere (WANG, GFGK,
Team Norway, øvrige), så en endring her påvirker mer enn WANG.

**Alternativ B — bygg programlogikken mot testene som faktisk finnes, og la kroppsvekt/
vertikalhopp/3000m stå som WANG-interne mål utenfor selve %1RM-beregningen.**
%1RM-belastningen for markløft og benkpress trenger uansett bare Trapbar Deadlift- og
Benkpress-resultatene (som finnes) — knebøy-1RM trengs kun hvis knebøy skal inn i selve
%1RM-tabellen. Vertikalhopp/3000m/kroppsvekt-mål-ratio er STATUS-tall (se pkt. 5), ikke input
til belastningsberegningen, og kan vises som «egen test, ikke i CANON» inntil videre.

**Anbefaling: Alternativ A for knebøy og 3000 meter, men lagt inn som en spillers/skoles EGEN
test (`isCustom: true`, `visibility: COACH` eller `GROUP`), ikke som endring av det delte
CANON-batteriet.** `TestDefinition` støtter allerede dette skillet (`erCanon`/`isCustom`/
`visibility`) — WANG-testene trenger ikke gå inn i de 20/21 protokollene alle andre spillere
ser, siden knebøy-1RM og 3000m ikke nødvendigvis er relevante for en golfspesifikk vurdering
av øvrige spillere. Standing Long Jump beholdes uendret i CANON; Vertikalhopp legges til som
egen WANG-test dersom Anders ønsker et separat eksplosivitetsmål for skolen. Dette er raskere å
bygge, endrer ikke det delte batteriet, og bruker en mekanisme som allerede finnes og er testet
(egen-test-funksjonen, `TestDefinition.isCustom`).

**Lagt fram som valg, ikke bestemt** — se «Beslutninger til Anders» pkt. (1).

---

## 2. Beregningslogikken — hvor den porteres til, ikke hvordan den skrives om

Kilden (vedlegget i oppgaven) er WANGs kjørende Python/reportlab-logikk. Den skal PORTERES
til TypeScript, ikke tenkes om. Foreslått plassering: **`src/lib/domain/fys/styrkeprogram.ts`**
(nytt), etter samme mønster som `src/lib/domain/fys-score.ts` (rene funksjoner, ingen
Prisma-kall inni — data hentes av en egen loader, samme arbeidsdeling som
`src/lib/portal-fysisk/fysisk-data.ts` gjør for logging-skjermen).

### Funksjonsspec

```ts
// src/lib/domain/fys/styrkeprogram.ts

/** De to øvelsene programmet beregner belastning for (v1 — se pkt. 1 for knebøy). */
export type StyrkeloftKode = "MARKLOFT" | "BENKPRESS";

export type EnUkersBelastning = {
  /** Uke 1–6 (to-ukersperioder: uke 1-2 = periode 1, 3-4 = periode 2, 5-6 = periode 3/bølge). */
  uke: number;
  /** Ett sett per rad — periode 3 (bølge) har flere rader per uke enn periode 1/2. */
  sett: { settNr: number; belastningPst: number; belastningKg: number }[];
  /** Sant hvis nedtrappingsregelen har erstattet bølgen (kun mulig uke 5-6). */
  erNedtrapping: boolean;
};

export type StyrkeprogramInput = {
  loft: StyrkeloftKode;
  /** Siste 1RM-testresultat (kg) for dette løftet. Null = kan ikke beregnes. */
  ettRepMaksKg: number | null;
  /** Siste kroppsvekt (kg) fra HealthEntry. Null = nedtrappingsregelen kan ikke vurderes
   *  (uke 5-6 faller da tilbake til vanlig bølge, siden ratioen ikke kan sjekkes). */
  kroppsvektKg: number | null;
};

/**
 * Beregner alle 6 ukers belastning for ett løft. Ren funksjon — ingen sideeffekter,
 * ingen lagring. Kalles på nytt hver gang skjermen rendres (samme mønster som fys-score.ts).
 */
export function beregnStyrkeprogram(input: StyrkeprogramInput): EnUkersBelastning[];

/**
 * Nedtrappingsregelen isolert, for testbarhet og for at UI kan vise HVORFOR bølgen ble
 * erstattet (jf. TruthLayer-prinsippet — vis alltid kilden til et tall).
 *   MARKLOFT:  ettRepMaksKg / kroppsvektKg < 1,0  → bygg (3×5 på 78/80/82,5 %)
 *   BENKPRESS: ettRepMaksKg / kroppsvektKg < 0,8  → bygg (3×5 på 80/82,5/85 %)
 * Returnerer false (aldri nedtrapping) hvis kroppsvektKg er null — ratioen kan ikke vurderes,
 * og programmet skal ikke gjette.
 */
export function trengerNedtrapping(loft: StyrkeloftKode, ettRepMaksKg: number, kroppsvektKg: number | null): boolean;
```

De faste prosenttabellene (periode 1/2, bølgen periode 3, nedtrappingens 3×5-sett) legges inn
som navngitte konstanter i samme fil — direkte avskrift av tallene i oppgavens vedlegg, ikke
frie tolkninger. Målbanen (2,0×/2,0×/1,7× kroppsvekt + lineær gap-fordeling) er en EGEN funksjon
(`beregnMalbane`) i samme fil, siden pkt. 5 flagger den som uavklart skop — den skal kunne slås
av uten å røre selve belastningsberegningen.

**Enhetstester porteres 1:1 fra referanselogikken** — periode 1/2/3-prosentene, nedtrappings-
terskelen ved nøyaktig 1,0/0,8, og at manglende kroppsvekt gir «ingen nedtrapping» (aldri en
gjettet ratio) — før noe UI bygges (TDD, per prosjektets faste arbeidsmåte).

---

## 3. Datamodell — TestResult som input, ingenting nytt for output

**Input:** `TestResult` er allerede riktig sted. `beregnStyrkeprogram()` leser siste
`TestResult` for spillerens Trapbar Deadlift- og Benkpress-testId-er (`score`-feltet, som
allerede er kg for disse to protokollene) og siste `HealthEntry.weightKg`. Ingen ny tabell for
1RM-verdier — de logges allerede der testresultater logges i dag.

**Output (beregnet kg per uke):** **regnes live, lagres ikke** — samme mønster som `fys-score.ts`
(FYS-indeksen regnes på hver rendring, aldri skrevet til en `fysIndeks`-kolonne) og samme
begrunnelse som `fysisk-data.ts` bruker for tonnasje («tonnasje BEREGNES fra loggSettData, aldri
lagret felt»). Å lagre et statisk kg-tall ville blitt feil i det øyeblikket spilleren tar en ny
1RM-test — beregningen må alltid gå ut fra SISTE test, ikke et øyeblikksbilde fra da programmet
ble laget.

**Der beregningen MØTER lagring:** `FysOvelseRad.belastningPst` (finnes allerede i skjemaet) er
riktig sted å skrive selve %-verdien når coach bygger en FysOkt — det er en PLANLAGT verdi
(«denne uka skal du løfte 82 % av 1RM»), ikke en beregnet konsekvens av et testresultat, og
`FysOvelseRad` har ingen kobling til hvilket 1RM-tall prosenten ble regnet fra. Konkret forslag:
- Coach genererer et 6-ukers program → `beregnStyrkeprogram()` kjøres én gang med spillerens
  daværende 1RM → resultatet (%1RM per uke) skrives inn i `FysOvelseRad.belastningPst` for de
  seks `FysOkt`-radene, akkurat som om coach hadde tastet prosentene inn manuelt.
- **kg-verdien vises aldri lagret** — `belastningPst` (lagret) × spillerens **nyeste** 1RM
  (live-lest ved visning) = kg-tallet spilleren faktisk ser. Endrer spilleren 1RM-testen sin
  midt i programmet, oppdateres kg-tallet automatisk uten at noen redigerer planen — kun
  prosenten er «programmets sannhet», kiloene er alltid ferske.
- Dette krever ingen ny kolonne. Det ENESTE nye databasebehovet er å vite HVILKET løft
  (`MARKLOFT`/`BENKPRESS`) en `FysOvelseRad` representerer, slik at riktig 1RM-test kobles til
  riktig rad ved visning — `FysOvelseRad.exerciseId` peker allerede til `ExerciseDefinition`,
  så løftet identifiseres via øvelsens navn/tag, ikke et nytt felt. Bekreftes i byggefasen om
  dette holder, eller om et lite tillegg (f.eks. en tag på øvelsen: `styrkeloft: "MARKLOFT"`)
  trengs — flagges her som en åpen, liten detalj, ikke en beslutning som venter på Anders.

---

## 4. UI-plassering — FYS-plan-skjermen (spiller) og Workbench (coach)

**Ingen ny flate.** Styrkeprogrammet er innhold på de to skjermene som allerede finnes/er
planlagt:

- **Spiller (PlayerHQ):** `/portal/tren/fys-plan` — allerede i MASTERPLANs kø for canvas
  («trenger canvas, etter lansering»). Styrkeprogrammets 6-ukers %1RM-tabell (uke, sett,
  %1RM, beregnet kg) tegnes inn i DENNE skjermens canvas, ikke som en ny rute. Spilleren ser,
  logger faktisk løftet vekt (samme `loggBelastningKg`/`loggSettData`-mønster som resten av
  FYS-loggingen), men overstyrer ikke prosenten.
- **Coach (AgencyOS/Workbench):** i dag har Workbench kun en LENKE ut (`fysPlanHref`) til
  spillerens FysiskPlan — ingen inline-redigering av øvelsesrader finnes i
  `WorkbenchDrill`/`wb-actions.ts`. To reelle veier:
  1. **Bygg et eget «Styrkeprogram»-panel i Workbench-inspektøren** (samme sted som
     AK-formel-chips redigeres i dag) der coach velger løft, ser spillerens siste 1RM, trykker
     «generer 6-ukersprogram», og får det skrevet til `FysiskPlan`/`FysUke`/`FysOkt`/
     `FysOvelseRad`. Dette er en UTVIDELSE av Workbench, konsistent med at Workbench allerede
     er der coach planlegger alt annet.
  2. **Bygg en enkel, dedikert «generer program»-handling** (server action) som coach kaller
     fra spillerkortet i Stall eller fra selve FYS-plan-lenken, uten å bygge et helt nytt
     Workbench-panel først.
  Anbefaling: (2) først (mindre, isolert, testbar uavhengig av Workbench-inspektørens øvrige
  UI), (1) som naturlig utvidelse når Workbench-canvasen for FYS uansett skal tegnes.
  **Dette treffer MASTERPLAN 6.5 direkte** («Admin har INGEN egen FYS-flate — avklar med
  Anders om egen admin-FYS-skjerm skal bestilles») — se Beslutning (2).
- **Mønster for coach-setter/spiller-leser:** verifisert i kode (ikke i det oppgitte, ikke-
  eksisterende dokumentet) — samme retning som `WorkbenchDrill.akFormel` i dag: coach skriver
  via `wb-actions.ts`/server actions, spillerens `/portal`-lesing har ingen skriveadgang til
  de coach-eide feltene. Spilleren logger EGET utført resultat (`loggBelastningKg`,
  `loggSett`), men endrer aldri selve `belastningPst`.

---

## 5. Mål-ratio (2,0× kroppsvekt knebøy/markløft, 1,7× benkpress VG3) — skopes, ikke hardkodes

Dette er WANG Toppidretts skolemål, ikke en AK Golf HQ-standard — de gjelder ikke en GFGK-junior
eller en Team Norway-spiller uten videre. **Forslag: en `SkoleMalKonfigurasjon`-tabell (eller
tilsvarende), nøkkel = organisasjon (samme mønster som `PlayerProgram`/`Group.slug` allerede
bruker for WANG_TOPPIDRETT/wang-toppidrett), verdi = mål-ratio per løft + antall år igjen av
skoleløpet for den lineære gap-fordelingen.** Ingen globale konstanter i kode — akkurat som
`beslutninger.md` sier om Team Norway/WANG-branding: organisasjonsspesifikke tall bor i data
koblet til organisasjonen, ikke i en fil alle spillere deler.

Dette er IKKE bestemt her — kun foreslått som retning. Se Beslutning (2)/(3): om
styrkeprogram-*konseptet* i det hele tatt er WANG-scoped eller en generell AK Golf HQ-funksjon,
avgjør om denne konfigurasjonen trengs i det hele tatt nå, eller om den kan vente til flere
skoler ber om samme program.

---

## Beslutninger til Anders

**(a) Testprotokoller — legge til eller tilpasse?**
Anbefaling: legg til Knebøy 1RM og 3000 meter som WANG-EGNE tester (`isCustom`, ikke CANON) —
se pkt. 1, Alternativ A med denne innsnevringen. Standing Long Jump beholdes i CANON uendret;
Vertikalhopp legges kun til hvis Anders vil ha et separat mål for skolen.

**(b) Er styrkeprogram-konseptet WANG-spesifikt (skole-scoped), eller en generell AK Golf
HQ-funksjon for alle spillere?**
Dette avgjør både pkt. 5 (mål-ratio-konfigurasjon) og om Alternativ A/B i pkt. 1 skal gjelde
kun WANG-gruppen eller alle. Dette kobler seg også til det ALLEREDE åpne spørsmålet i
MASTERPLAN 6.5 («Admin har INGEN egen FYS-flate — avklar med Anders om egen admin-FYS-skjerm
skal bestilles») — et JA til «generell funksjon for alle» gjør det spørsmålet mer presserende;
et «kun WANG» gjør det mindre presserende, siden løsningen i pkt. 4 (2) uansett dekker WANG uten
en ny admin-flate.

**(c) Venter dette på at en overordnet FYS-indeks-formel låses, eller kan det bygges uavhengig?**
Anbefaling: **bygges uavhengig.** Styrkeprogrammets %1RM-beregning bruker RÅ 1RM-testresultater
og kroppsvekt direkte — den er ikke avhengig av `fys-score.ts`s stall-relative 0–100-indeks
(som er et ANNET tall, til et annet formål: sammenligne spillere i en stall, ikke foreskrive
belastning til én spiller). De to kan leve side om side uten at den ene venter på den andre.

---

## Ikke gjort i denne PR-en

Ingen Prisma-migrasjon, ingen ny kode i `src/lib/domain/fys/`, ingen endring i
`seed-ngf-test-protocols.ts`, ingen Workbench-UI. Kun dette plandokumentet og en
pekerlinje i `docs/STATUS-NÅ.md`.
