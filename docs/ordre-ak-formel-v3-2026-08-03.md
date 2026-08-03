# AK-formelen v3 — strukturoppdatering

**Fra:** Cowork-sporet (Anders + Claude), 3. august 2026
**Til:** design-sporet i Claude Design-prosjektet `605a48cc` («AK Golf HQ — Claude Paper») og kodesporet i akgolf-hq
**Status:** Struktur besluttet av Anders. **Ikke kjørt i kode.** Ingen migrasjon startet.
**Referansefil:** `~/Treningsplanlegger/ak-formel-struktur.html` (interaktiv, viser hele treet).
Merk: den fila finnes **ikke** på denne maskinen (sjekket 03.08) — hentes fra Anders' maskin før den brukes som referanse.

---

## 0. Les dette først

Tre ting du må vite før du gjør noe:

1. **Dette erstatter ordre-ak-formel-v2.md (1. august).** v2 er ikke kjørt. v3 arver v2s
   fem slots, men legger til delferdighet som sjette og — viktigst — gjør områdelista
   **avhengig av pyramiden**. v2s flate 18-liste finnes ikke lenger.
2. **Koden lever fortsatt på det gamle.** `LFase`, `CSNivaa`, `MMiljo`, `PRPress` er live
   i Prisma og i `PositionTask`. Ingenting under er implementert. Dette dokumentet er
   spesifikasjon, ikke tilstandsbeskrivelse.
3. **Drill-banken er tom med vilje** (`masterbrain/knowledge/entities/drills.json`,
   Anders 31.07). Regelen i fila gjelder fortsatt: *ingen agent skal foreslå eller finne på
   en drill før banken er fylt på nytt.* Ikke bruk Notion-Øvelsesbanken som kilde — den
   inneholder Pump Drill, som står på fjernet-lista.

---

## 1. Hva som endret seg fra v2 til v3

| | v2 (1. august) | v3 (3. august) |
|---|---|---|
| Antall slots | 5, fast | **3–7, varierer** — delferdighet lagt til, P-posisjon betinget |
| Områdeliste | Én flat liste på 18, lik for alle | **Avhengig av pyramide** — fem ulike sett |
| Fysisk | «Fysisk drill har ingen formel» | **Har formel** — fire områder |
| Spill/bane | Ett område i felleslista | **Egen pyramide med egne områder** |
| Turnering | Ikke behandlet | **Tre områder** = turneringstyper |
| Delferdighet | Fantes ikke | Nytt nivå under område |
| P-posisjon | Ikke i formelen | **Betinget slot** — kun TEK på tee/innspill |
| Blokk/variasjon | Ikke behandlet | Eget felt ved siden av formelen |

Kjernen i endringen: **pyramiden er ikke lenger bare en etikett — den er en gaffel.**
Velger du TEK, får du golfområdene. Velger du TURN, får du turneringstypene. De to
settene har ingen overlapp. Det betyr at UI-et må rendre stegene dynamisk ut fra
foregående valg, ikke som en fast liste. Med P-posisjonen gjelder det samme ett nivå
ned: TEK på innspill får en slot som TEK på putt ikke har.

---

## 2. Strukturen komplett

### 2.1 Pyramide (5, uendret)

`FYS` Fysisk · `TEK` Teknikk · `SLAG` Golfslag · `SPILL` Spill · `TURN` Turnering

### 2.2 Område — per pyramide

**FYS — 4 områder, ingen gruppering**

```
STYRKE · KONDISJON · SPENST · BEVEGELIGHET
```

**TEK og SLAG — 17 områder, samme sett, fire grupper**

Gruppa er Strokes Gained-aksen. Området er det drillen peker på.

```
Tee        TEE_TOTAL
Innspill   INNSPILL_200 · INNSPILL_150 · INNSPILL_100 · INNSPILL_50 · INNSPILL_0_50
Nærspill   PITCH · CHIP · LOB · BUNKER
Putt       PUTT_0_3 · PUTT_3_5 · PUTT_5_10 · PUTT_10_15 · PUTT_15_25 · PUTT_25_40 · PUTT_40
```

**Endring:** `SPILL` er fjernet herfra. Var med i v2s 18-liste, hører ikke hjemme
under Teknikk (Anders 03.08). 18 → 17.

**SPILL — 4 områder**

```
BANE · TEST · SCORING · INNSPILL
```

**TURN — 3 områder (turneringstypene)**

```
TRENING      turnering som treningsarena
UTVIKLING    turnering for å bygge nivå
PRESTASJON   turnering det skal leveres i
```

Dette er AK-typologien for turneringer og har ingen motpart i koden i dag.
`Tournament.tier` (1–5) og `Tournament.tour` beskriver turneringens *nivå*;
disse tre beskriver spillerens *hensikt* med å delta. Ortogonale akser — en
tier-4 juniorturnering kan være PRESTASJON for én spiller og TRENING for en annen.

### 2.3 Delferdighet — nytt nivå

**Putt-områdene (7) → fire, i årsaksrekkefølge**

```
GREENLESNING → SIKTE → BALLSTART → LENGDEKONTROLL
```

Rekkefølgen er ikke alfabetisk og skal ikke sorteres om. Den er kausal: leser du
fallet feil, hjelper det ikke at ballstarten er perfekt. Greenlesning finnes kun her.

**Tee, innspill og nærspill (10) → seks**

```
OPPSTILLING · GREP · SIKTE · BALLSTART · SKRU · LENGDEKONTROLL
```

**SPILL og TURN → tre**

```
FORBEREDELSER · STRATEGI_TAKTIKK · MENTAL
```

**FYS → ikke definert.** Åpent punkt, se §4.

### 2.4 P-posisjon — betinget slot, kun TEK på tee og innspill

MORAD P1.0–P10.0. Ligger i formelen **rett etter område**, men bare når to vilkår er
oppfylt samtidig:

```
pyramide = TEK    OG    område ∈ { TEE_TOTAL, INNSPILL_200, INNSPILL_150,
                                   INNSPILL_100, INNSPILL_50, INNSPILL_0_50 }
```

Seks av sytten områder. **Nærspill og putt har ikke P-system** (Anders 03.08).
Verdiene er de samme som `P_POSITIONS` i `teknisk-plan/constants.ts` og
`P_POSISJONER` i `taxonomy.ts` — ingen endring der.

**Tre valgmodus:**

| Modus | Betydning | Vises som |
|---|---|---|
| `ENKEL` | Ett punkt i svingen | `P6.0` |
| `FLERE` | Flere punkter som ikke henger sammen | `P2.0+P7.0` |
| `INTERVALL` | Bevegelsen fra ett punkt til et annet | `P5.0-P8.0` |

**Lagring — viktig:** lagre alltid den **ekspanderte lista** pluss modus.
`P5.0-P8.0` lagres som `["P5.0","P6.0","P7.0","P8.0"]` med `pModus: "INTERVALL"`.
Da virker spørringen «hvilke driller trener P6.0» uten spesialbehandling av intervaller.
Modus beholdes kun for visning og for å kunne redigere valget tilbake.

```
pPosisjoner  String[]                              // ekspandert
pModus       ENKEL | FLERE | INTERVALL
```

`PositionTask` har allerede P-tilknytning via `TechnicalPlanPosition.pNummer` (én P per
rad). Den modellen støtter ikke intervall eller flervalg på drill-nivå — avklar med Anders
om drillens P-felt er uavhengig av planposisjonens P, eller om de skal henge sammen.

### 2.5 Motorikk, Belastning, Press (uendret fra v2)

```
Motorikk     UTEN_BALL · LAV_HASTIGHET · AUTO          (erstatter LFase + CSNivaa)
Belastning   INNENDORS · TRENINGSOMRADE · BANE · KONKURRANSE   (erstatter MMiljo M0–M5)
Press        ALENE · OBSERVERT · KONKURRANSE · TURNERING       (erstatter PRPress PR1–PR5)
```

### 2.6 Slots per pyramide

| Pyramide | Slots |
|---|---|
| FYS | pyramide · område · belastning **(3)** |
| TEK på tee/innspill | pyramide · område · **P-posisjon** · delferdighet · motorikk · belastning · press **(7)** |
| TEK på nærspill/putt | pyramide · område · delferdighet · motorikk · belastning · press **(6)** |
| SLAG · SPILL · TURN | pyramide · område · delferdighet · motorikk · belastning · press **(6)** |

Slot-antallet varierer altså med både pyramide og område. Rendring må være datadrevet,
ikke en fast rekke felt.

### 2.7 Praksisform — eget felt, IKKE en slot

Blokk vs variasjon hører hjemme i modellen, men **ikke i formelstrengen**. Grunnen er
strukturell: en variert drill spenner over flere formler — den har ikke én.
Varierer drillen på område, er område-sloten ikke ett fast punkt.

To felt på drillen:

```
praksisform   BLOKK · SERIELL · VARIABEL
varierer      OMRADE · DELFERDIGHET · KOLLE · UNDERLAG · MAL   (flervalg, kun ved SERIELL/VARIABEL)
```

| Verdi | Betydning |
|---|---|
| `BLOKK` | Samme slag om og om igjen. Alt fast. |
| `SERIELL` | Fast rotasjon i kjent rekkefølge — A, B, C, A, B, C. |
| `VARIABEL` | Aldri to like slag etter hverandre. Uforutsigbart. |

Eksempler fra Anders' egen ukeplan:

```
«Full sving 7-jern, blokket»                        BLOKK
«9 baller, skiftende mål — aldri to like slag»      VARIABEL på MAL
«Wedge-matrise, tre lengder × tre trajektorier»     VARIABEL på OMRADE + DELFERDIGHET
```

**Ryddejobb:** `DrillPracticeType` finnes allerede i Prisma med verdiene
`BLOKK · VARIABEL · KONKURRANSE · SPILL_TEST`. Den enumen blander to akser — `BLOKK`
og `VARIABEL` er repetisjonsstruktur, mens `KONKURRANSE` dupliserer Press-sloten og
`SPILL_TEST` dupliserer området `TEST` under SPILL. Enumen skal reduseres til
repetisjonsstrukturen alene når v3 implementeres.

**Hvorfor det betyr noe:** blokk bygger mønsteret, variasjon overfører det til banen.
Uten feltet kan ikke systemet skille en spiller som har slått 500 baller blokkert fra en
som har slått 500 variert — de to har trent helt ulike ting. Det har også direkte
periodiseringskonsekvens: GRUNN tåler mye blokk, TURNERING nesten ikke.

**Åpent:** vil Anders ha `SERIELL` som egen verdi, eller holder `BLOKK` og `VARIABEL`?

---

## 3. Eksempler — verifisert mot strukturen

```
TEK_INNSPILL_150_P6.0_BALLSTART_LAV_HAST_TRENINGSOMRADE_ALENE   + BLOKK
  Teknikk · innspill 150–200 · P6.0 · ballstart · lav hastighet · treningsområde · alene

TEK_INNSPILL_150_P5.0-P8.0_BALLSTART_LAV_HAST_TRENINGSOMRADE_ALENE   + BLOKK
  Intervall — bevegelsen fra transisjon til tidlig oppfølging
  lagres som ["P5.0","P6.0","P7.0","P8.0"], pModus = INTERVALL

TEK_TEE_TOTAL_P2.0+P7.0_SKRU_LAV_HAST_TRENINGSOMRADE_ALENE       + BLOKK
  To punkter som ikke henger sammen — takeaway og impact

TEK_PUTT_5_10_BALLSTART_AUTO_TRENINGSOMRADE_ALENE                + BLOKK
  Teknikk · putt 5–10 · ballstart · auto · treningsområde · alene
  (ingen P — putt har ikke P-system)

SLAG_INNSPILL_150_SKRU_AUTO_TRENINGSOMRADE_OBSERVERT       + VARIABEL på DELFERDIGHET
  Golfslag · innspill 150–200 · skru · auto · treningsområde · observert

SLAG_INNSPILL_50_LENGDEKONTROLL_AUTO_TRENINGSOMRADE_ALENE  + VARIABEL på OMRADE, DELFERDIGHET
  Golfslag · innspill 50–100 · lengdekontroll · auto · treningsområde · alene
  (wedge-matrisen — tre lengder × tre trajektorier)

SPILL_SCORING_STRATEGI_TAKTIKK_AUTO_BANE_KONKURRANSE       + VARIABEL på MAL
  Spill · scoring · strategi/taktikk · auto · bane · konkurranse

TURN_PRESTASJON_MENTAL_AUTO_KONKURRANSE_TURNERING          + VARIABEL på MAL
  Turnering · prestasjon · mental · auto · konkurranse · turnering

FYS_SPENST_INNENDORS                                        + BLOKK
  Fysisk · spenst · innendørs
```

---

## 4. Åpne punkter — ikke implementer disse

Spør Anders. Ikke gjett.

1. **Delferdighet for FYS.** Ikke definert. Sett/reps/kg/tid dekker mye, men trenger
   styrke f.eks. RFD / maksstyrke / utholdenhet som eget nivå?
2. **Motorikk og press for FYS.** Golf-språk. Gjelder de fysisk trening, eller stopper
   formelen på belastning?
3. **`BANE` under SPILL.** Sto der fra før v3. Behold eller fjern?
4. **Putt under TEK/SLAG.** Anders skrev «Tee total og innspill og nærspill er knyttet til
   Teknikk og Golfslag» — putt ble ikke nevnt eksplisitt. Antatt inkludert i begge.
   **Bekreft.**
5. **Enhet for putt.** Strukturen bruker tallene 0-3, 3-5, 5-10, 10-15, 15-25, 25-40, 40+.
   v2 sa fot med meter i parentes; all eksisterende kode lagrer meter. Ikke avgjort.
6. **`STRATEGI_TAKTIKK` inneholder understrek** — se §5.1.
7. **`SERIELL` som praksisform** — tre verdier eller bare blokk og variabel? Se §2.7.
8. **P på SLAG?** Anders sa «Teknikk må P1.0 til P10.0 inn». Gjelder P-systemet også
   pyramide SLAG på tee/innspill, eller er det TEK-eksklusivt? Implementert som
   TEK-eksklusivt.
9. **Drillens P vs planposisjonens P.** `TechnicalPlanPosition.pNummer` har én P per rad.
   Skal drillens P-felt være uavhengig, eller arves fra planposisjonen den ligger under?
10. **Overlapp delferdighet/P.** `OPPSTILLING` og `GREP` beskriver i praksis egenskaper
    ved `P1.0`. Er det redundans som skal ryddes, eller to gyldige innfallsvinkler?

*Tillegg fra kode-verifiseringen 03.08, se §6 — tre punkter til som må avklares samtidig:
innspill-navnekonvensjonen (§6.4), putt-bøttene (§6.5) og P-formatet P1.0 vs P1 (§6.6).*

---

## 5. Tekniske funn design-sesjonen må ta høyde for

### 5.1 Formelstrengen kan ikke parses med `split("_")`

Både områdekoder (`PUTT_5_10`, `INNSPILL_0_50`) og delferdigheter (`STRATEGI_TAKTIKK`)
inneholder understrek. Strengen er derfor **kun for visning og søk — aldri en nøkkel
å parse tilbake**. Lagre de seks feltene hver for seg; generer strengen ved behov.

P-posisjonen bruker i tillegg to egne separatorer inne i sitt eget felt: `+` for flere
punkter (`P2.0+P7.0`) og `-` for intervall (`P5.0-P8.0`). Enda en grunn til at strengen
er visning, ikke nøkkel.

Om Anders vil ha en parsebar ID: bytt separator til `·` eller `/`, eller fjern understrek
fra kodene (`PUTT5_10` → `PUTT510`, `STRATEGI_TAKTIKK` → `STRATEGI`). Ikke gjør dette
uten at han har sagt ja.

### 5.2 UI-konsekvens: steg 2 og 3 er dynamiske

Kaskaden er: velg pyramide → områdelista byttes ut → velg område → delferdighetslista
byttes ut. Skifter brukeren pyramide, må område, delferdighet og alt under nullstilles.
Referanseimplementasjonen i `ak-formel-struktur.html` gjør dette (se `nullstill`-kartet
i klikk-handleren).

Delferdighet for TEK/SLAG avhenger av **områdegruppa**, ikke av området direkte:
gruppe `Putt` → fire valg, alle andre → seks valg.

P-posisjonssteget vises kun når `pyramide === "TEK"` og området er tee eller innspill.
Det er ikke et felt som deaktiveres — det finnes ikke for de øvrige. Bytter brukeren fra
innspill til putt, skal P-valget nullstilles, ikke bare skjules.

P-velgeren har tre modus som endrer klikk-oppførselen på de samme ti knappene:
`ENKEL` er enkeltvalg, `FLERE` er flervalg, `INTERVALL` tar to trykk (start, så slutt) og
markerer alt imellom. Bytte av modus nullstiller valget.

### 5.3 Berørte filer når v3 skal implementeres

| Fil | Hva |
|---|---|
| `prisma/schema.prisma` | Nye enums; `LFase`/`CSNivaa`/`MMiljo`/`PRPress` fases ut. Migrasjon, ikke in-place-endring |
| `src/lib/taxonomy.ts` | `TRENINGSOMRADER`, `L_FASER`, `CS_NIVAER`, `M_MILJO`, `PR_PRESS`, `PERIODE_TYPER.lFaserTillatt` |
| `src/components/teknisk-plan/constants.ts` | `SG_BUCKETS`, `L_PHASES`, `CS_LEVELS`, `M_LEVELS`, `PR_LEVELS` |
| `PositionTask` (schema) | Feltene `lFase`, `cs`, `miljo`, `prPress` → nye felt + `delferdighet`, `pPosisjoner`, `pModus`, `praksisform`, `varierer` |
| `masterbrain/knowledge/concepts/canon-methodology.json` | `session_id_format`, `l_faser`, invariant 2/4/9, `pyramid_rules` pr_1–pr_5 |
| `masterbrain/knowledge/entities/drills.json` | `skjema_for_ny_drill` bruker `cs_min`/`cs_max` — må til v3-slots |
| `src/lib/ai-plan/system-prompt.ts` | Tagging-dimensjonene |
| `~/Treningsplanlegger/treningsplan.html` | Spillervisningen, bygget på v2 |
| **`src/lib/ak-formel-visning.ts`** | **Tillegg 03.08:** Vei B-broen 5→3 L-faser og 5→4 press. Med v3 blir broen overflødig — modellen ER 3 og 4. Filen skal avvikles, ikke oppdateres |
| **`src/lib/workbench/ak-formel.ts`** | **Tillegg 03.08:** saniterer Workbench-skrivestien mot `L_FASE`/`MILJO`/`CS`/`PRESS`-settene + P-regex. Hele fila må skrives om |

### 5.4 Regler som mister sitt grunnlag

Disse i CANON v3.5 bygger på L-fase eller CS og må omskrives i samme operasjon:

- **Invariant 2** «CS50 minimum for balltrening» → CS finnes ikke. Forslag: balltrening
  krever Motorikk `LAV_HASTIGHET` eller `AUTO`; `UTEN_BALL` kan per definisjon ikke ha ball.
- **Invariant 4** «L-fase overstyrer alle andre prioriteringer» → ingen L-fase å overstyre med.
- **Invariant 9** «lav readiness → lavere PR-nivå» → PR1–PR5 blir fire trinn.
- **`pyramid_rules` pr_1–pr_5** justerer pyramideprosentene per L-fase. pr_6–pr_10
  (periode og kategori) står.
- **`PERIODE_TYPER.lFaserTillatt`** i `taxonomy.ts` — kolonnen har ingen verdier igjen.

Invariant 1, 3, 5, 6, 7, 8, 10, 11, 12, 13 er ikke berørt.

---

## 6. Funn mot designprosjektet og koden (lagt til 03.08 ved innlegging)

Verifisert mot Claude Design-prosjektet `605a48cc` og mot koden i denne grenen samme dag.
Dette er §7 punkt 5 utført: alt som motsier dokumentet, flagget.

### 6.1 `LFaseBadge` i designbiblioteket hardkoder de fem L-fasene

`components/domene/LFaseBadge.jsx` eksporterer
`LFASER = ["L-KROPP", "L-ARM", "L-KØLLE", "L-BALL", "L-AUTO"]` og tegner en femstegs
prikk-indikator. Kommentaren i fila flagger allerede konflikten: Bølge 1 fjernet L-faser
fra fase1-skjermene, men badgen ble bestilt 03.08 fordi «appvisningen Vei B bruker
fortsatt fase-steg».

**v3 svarer på det:** L-fasen finnes ikke. Motorikk har tre verdier
(`UTEN_BALL · LAV_HASTIGHET · AUTO`) — nøyaktig de tre stegene Vei B allerede viser.
Badgen skal enten omdøpes til en `MotorikkBadge` med tre steg, eller utgå.
Dette er svaret på åpent punkt 2 i `kart/sluttstatus-2026-08-03.md`.

### 6.2 `AKFormelChip` er allerede v3-kompatibel — bare kommentaren er feil

`components/domene/AKFormelChip.jsx` tar enten `formula` (ferdig streng) eller `parts`
(array som settes sammen med `·`). Den formaterer ikke og validerer ikke. Det er nøyaktig
kontrakten §5.1 krever, og den varierende slot-lengden (3–7) håndteres av `parts` uten
endring. Kildekommentaren sier «v2-formatet (17 områder)» og må rettes til v3.

Bonus: chippens `·`-skilletegn er allerede den separatoren §5.1 foreslår om Anders vil
ha en parsebar ID. Den avgjørelsen er hans.

### 6.3 Formel**velgeren** finnes ikke i designbiblioteket

Biblioteket har 145 komponenter og dekker visning av formelen (`AKFormelChip`),
P-posisjoner (`PPositionRail`, `PositionMarker`) og pyramiden (`PyramideFasett`,
`PyramidProgress`). Det finnes **ingen** komponent som *velger* en formel.
Kaskaden i §5.2 — dynamiske steg, betinget P-slot, P-velger med tre modus — er en ny
komponent som må bygges. Dette er den konkrete designjobben v3 utløser.

### 6.4 Innspill-navnene i §3 motsier koden

v3 skriver `TEK_INNSPILL_150` og forklarer det som «innspill 150–200».
`TRENINGSOMRADER` i `src/lib/taxonomy.ts` har `INN150 = "Innspill 100-150m"` — altså
tallet som **øvre** grense, ikke nedre. To motsatte konvensjoner for samme kode.
Må avklares før noe bygges, ellers får to skjermer ulik betydning av samme etikett.

Samme sted: v3 har fem innspill-bøtter (`INNSPILL_200 · _150 · _100 · _50 · _0_50`),
koden har fire (`INN200 · INN150 · INN100 · INN50`). `INNSPILL_50` og `INNSPILL_0_50`
ser ut som samme bøtte skrevet på to måter.

### 6.5 Putt-bøttene i koden er seks, ikke sju — og andre grenser

| v3 | `taxonomy.ts` i dag |
|---|---|
| 0-3 · 3-5 · 5-10 · 10-15 · 15-25 · 25-40 · 40+ | 0-3 · 3-6 · 6-10 · 10-20 · 20-40 · 40+ |

Sju mot seks, og fire av grensene er ulike. All historisk puttdata ligger i dagens seks
bøtter. Migreringen kan ikke gjøres uten tapt presisjon — en 3-6-rad kan ikke splittes
tilbake til 3-5 og 5-10. Må planlegges, ikke improviseres.

### 6.6 P-formatet er allerede inkonsistent i koden

`taxonomy.ts` (`P_POSISJONER`) og `teknisk-plan/constants.ts` (`P_POSITIONS`) bruker
begge `P1.0`–`P10.0`, som v3 sier. Men `src/lib/workbench/ak-formel.ts` validerer
lagrede P-verdier mot `/^P([1-9]|10)$/` — altså `P1`…`P10` **uten** `.0`.
Workbench skriver derfor et annet format enn taksonomien definerer. v3 må ta stilling
til hvilket som gjelder, ellers arver v3 feilen.

### 6.7 «17 områder» brukes allerede som v2-merkelapp i designprosjektet

`kart/mangler-2026-08-01.md` §0 skriver «AK-formel v2 (17 områder) er gjennomført i alle»
og at L-faser, CS, M0–M5 og PR1–PR5 ikke lenger finnes i fase1-flatene. v3 sier v2 var en
flat liste på **18**. Tallet 17 er altså allerede i bruk om noe annet enn det v3 kaller 17.
Før noen sier «flatene er oppdatert», må de sytten i flatene sjekkes mot de sytten i §2.2.

### 6.8 Referansefila mangler på denne maskinen

`~/Treningsplanlegger/ak-formel-struktur.html` finnes ikke her (`~/Treningsplanlegger/`
er tom/fraværende, sjekket 03.08). Den ligger sannsynligvis på Anders' andre maskin.
Uten den kan §5.2-kaskaden bare bygges fra teksten over, ikke mot referansen.
Det samme gjelder `~/Treningsplanlegger/treningsplan.html` i §5.3.

---

## 7. Seks strukturtiltak — anbefalt, ikke besluttet

Dette er ikke del av v3-spesifikasjonen. Det er tiltakene som gjør taksonomien
selvkontrollerende i stedet for noe man må passe på manuelt. Rangert etter forholdet
mellom kostnad og hvor mye feil de fjerner. **Anbefaling: 1 og 2 tas sammen med v3.
3–6 etter at masterdokumentet er låst.**

### 7.1 Én maskinlesbar kilde som genererer resten — ROTÅRSAK

Taksonomien finnes i dag i fem håndholdte kopier: `taxonomy.ts`,
`teknisk-plan/constants.ts`, Prisma-enums, `canon-methodology.json` og Notion.
MANIFEST innrømmer mønsteret selv: *«appen speiler CANON manuelt i TypeScript»*.
Alle konfliktene i denne sesjonen — tre områdelister, tre periodenavn-sett, tre
M0–M5-labelsett, `SkillArea` vs `SGKategori` — er symptomer på det ene problemet.
Funnene i §6.4–6.6 er tre nye eksempler på nøyaktig samme mønster.

**Tiltak:** definer strukturen i én JSON (`knowledge/concepts/ak-formel.json`), og
generer `taxonomy.ts`, `constants.ts` og Prisma-enumene fra den ved bygg.
Da blir drift teknisk umulig i stedet for noe man må oppdage i ettertid.

### 7.2 Gyldighetsmatrise — hvilke kombinasjoner finnes ikke

5 × 17 × 6 × 3 × 4 × 4 gir tusenvis av kombinasjoner. De fleste er meningsløse:

```
SKRU på en putt                                  ugyldig
GREENLESNING med Motorikk UTEN_BALL              ugyldig (les alltid med ball på green)
TURN_PRESTASJON med Belastning INNENDORS         ugyldig
Press TURNERING med Belastning TRENINGSOMRADE    ugyldig
P-posisjon på et putt- eller nærspillsområde     ugyldig
```

En eksplisitt liste over ulovlige kombinasjoner er det som gjør dette til et system
i stedet for fem nedtrekkslister. Den fanger feil ved inntasting, ikke tre måneder senere.
Legges i samme JSON som 7.1 og valideres med zod ved skriving.

### 7.3 Hver delferdighet skal ha minst én testprotokoll

Testbatteriet (NGF + Team Norway) finnes allerede. Kobles
`delferdighet → testprotokoll → målbar verdi`, kan systemet svare på om treningen virket.
Kan en delferdighet ikke måles, vet man ikke om spilleren ble bedre — da er den i praksis
en mening, ikke en ferdighet. Koblingen avdekker også hull: har `GREENLESNING` ingen test,
kan utvikling på den ikke dokumenteres.

### 7.4 Delferdighet → MORAD-feil → P-posisjon

`knowledge/entities/faults.json` har ti feil, `positions.json` har 289 målefelt over
P1.0–P10.0. Invariant 12 krever allerede koblingen feil → P-posisjon.
Får hver delferdighet en liste over sannsynlige feil og P-posisjoner, kan TrackMan-data
foreslå hvilken delferdighet som bør trenes. Det er der systemet slutter å være et arkiv
og begynner å være en diagnose. Merk `sg_to_morad_faults` i `sg-principles.json` — den
er eneste gyldige kopi av SG→feil, og koblingen er **hypotese, ikke diagnose**.

### 7.5 Dekningskart når drill-banken fylles

Når hver drill har en formel, blir hullene synlige av seg selv:
*«ingen driller for greenlesning under press KONKURRANSE»*.
Systemet genererer sin egen huskeliste i stedet for at hullene må finnes manuelt.
Dette er også den beste rekkefølgen å fylle den tomme banken i.

### 7.6 Versjonsstempel på hver drill og hver logget økt

```
formel_versjon: 3
```

Uten det blir historiske data uleselige neste gang formelen endres — man vet ikke om
`AUTO` i en logg fra 2026 betyr det samme som `AUTO` i 2028. Billig å legge inn nå,
umulig å rekonstruere senere. Gjelder også `PositionTaskLog` og alle øktrader.

---

## 8. Hva design-sesjonen bør gjøre nå

1. **Ikke migrer.** v3 er ikke ferdig — ti åpne punkter i §4, pluss tre til fra §6.
2. **Bygg UI-et mot strukturen i §2** der du trenger en formelvelger. Kaskaden i §5.2
   er ferdig spesifisert og endrer seg ikke av de åpne punktene. Komponenten finnes ikke
   i biblioteket i dag (§6.3) — det er den konkrete jobben.
3. **Bruk `ak-formel-struktur.html` som referanse** for hvordan valgene henger sammen —
   ikke som designfasit. Den er et forklaringsverktøy, ikke en produksjonsskjerm.
   Merk at fila ikke ligger på denne maskinen (§6.8).
4. **Ikke rør Prisma-enumene** før Anders har svart på §4 og godkjent migrasjonsplanen.
   Ordre-v2 §5 sa uttrykkelig at migrasjonen ikke skulle kjøres uten hans ja; det gjelder
   fortsatt.
5. **Flagg alt du finner som motsier dette dokumentet.** Utført ved innlegging — se §6.
   Det finnes fortsatt tre områdelister og tre periodenavn-sett i kodebasen.
