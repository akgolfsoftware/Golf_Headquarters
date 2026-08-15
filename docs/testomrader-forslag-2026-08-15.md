# Testområder — forslagsliste til Anders (D4)

**Dato:** 2026-08-15 · **Formål:** gi hver testdefinisjon en områdekode, slik at
test → drill kan slå opp i delt taksonomi (D4).
**Kilde for testene:** `test_definitions` i prod, 36 rader (`isCustom = false`).

---

## Les dette først: «17 områder» peker på to ulike lister

Anders bekreftet 17 den 15.08. Men repoet har allerede dokumentert at tallet er
tvetydig — se `docs/ordre-ak-formel-v3-2026-08-03.md` §6.4, §6.5 og §6.7:

| | v3-ordren (03.08) | `src/lib/taxonomy.ts` i dag |
|---|---|---|
| **Antall** | 17 | 16 |
| **Innspill** | 5 bøtter: `INNSPILL_200 · _150 · _100 · _50 · _0_50` | 4: `INN200 · INN150 · INN100 · INN50` |
| **Innspill-tall betyr** | **nedre** grense («150» = 150–200 m) | **øvre** grense («INN150» = 100–150 m) |
| **Putt** | 7 bøtter, i **fot**: 0-3 · 3-5 · 5-10 · 10-15 · 15-25 · 25-40 · 40+ | 6 bøtter, i **meter**: 0-3 · 3-6 · 6-10 · 10-20 · 20-40 · 40+ |
| **SPILL** | fjernet fra TEK/SLAG (18 → 17) | med i lista |

Tre konsekvenser:

1. **Innspill-konvensjonen er motsatt.** Samme kode betyr ulikt bånd i de to
   listene. Mapper jeg mot feil lesning, peker halvparten av innspill-testene på
   nabobåndet.
2. **`INNSPILL_50` og `INNSPILL_0_50` ser ut som samme bøtte skrevet to ganger**
   (§6.4). Er de det, er v3 egentlig 16 — og da stemmer koden.
3. **Putt-bøttene kan ikke migreres uten tap** (§6.5): en `3-6 m`-rad kan ikke
   splittes tilbake til `3-5 ft` og `5-10 ft`. Enhetsbyttet meter → fot er heller
   ikke besluttet kjørt.

**Derfor er lista under delt i to:** det som er sikkert uansett hvilken lesning
som gjelder, og det som må vente på avklaringen.

---

## A. FYS — skal IKKE ha områdekode (8 tester)

v3 §2.3: FYS har *delferdighet*, ikke område. Disse skal stå uten.

3000m Utholdenhet · Balanse 30 sek · Ball Throw · Benkpress ·
Clubhead Speed (CHS) · Knebøy 1RM · Standing Long Jump · Trapbar Deadlift

---

## B. Entydige — gruppen er sikker, båndet er sikkert (13 tester)

Disse treffer samme bånd i begge lesninger.

| Test | Pyramide | Forslag | Grunnlag |
|---|---|---|---|
| Drive treffsikkerhet | TEK | `TEE_TOTAL` | 10 driver-slag mot fairway |
| TN Driver Gate | TEK | `TEE_TOTAL` | 6 driver-slag gjennom gate |
| Driver Basic | SLAG | `TEE_TOTAL` | 5 driver-slag, carry + sideavvik |
| Chip-test 4 m | SLAG | `CHIP` | chip fra 4 m |
| Pitch 50 m | SLAG | `PITCH` | pitch mot 50 m flagg |
| TN Wedge Gate | TEK | `PITCH` | wedge, launch + carry-mål |
| Wedge Variation | SLAG | `PITCH` | 9 wedge fra 30–70 m |
| TN Wedgetest | TURN | `PITCH` | 18 wedge, 30/50/70 m |
| TN Nærspill Gate | TEK | `CHIP` | 3 launch-høyder × 3 carry-soner |
| 8-ball Blocked | SLAG | `CHIP` | 24 nærspill, chip 10/30 m + wedge |
| 8-ball Variation | SLAG | `CHIP` | chip · wedge · lobb · bunker, rotert |
| Inspill 160m | SLAG | Innspill 150–200 | 5 slag fra 160 m |
| Inspill 120m | SLAG | Innspill 100–150 | 5 slag fra 120 m |

**Merk de to siste:** båndet er entydig (160 m ligger i 150–200, 120 m i 100–150),
men *kodenavnet* avhenger av konvensjonen — `INNSPILL_200`/`INNSPILL_150` i v3-lesning,
`INN200`/`INN150` i kode-lesning. Innholdet er det samme.

**8-ball-testene** dekker fire nærspillstyper i én test. Jeg foreslår `CHIP` som
primærområde siden chip er tyngst representert — men de kunne like gjerne vært
merket som blandede. Din vurdering.

---

## C. Spenner flere bånd — trenger din vurdering (7 tester)

Disse måler over flere områder. Ett område per test er kanskje feil modell for dem.

| Test | Pyramide | Spennet | Spørsmål |
|---|---|---|---|
| Inspill Basis | SLAG | 100–200 m | Splittes, eller merkes med det bredeste båndet? |
| Inspill Variation | SLAG | 100–130 m | Krysser 100-grensen |
| 18-hull Inspill | TURN | fra 49 m og opp | Dekker trolig alle innspillsbånd |
| PEI Test Bane | TURN | 18 hull, reelle forhold | Samme |
| PGA Tour 27 Shots | TURN | «hele registeret» | Dekker alt — eget område, eller ingen? |
| Golfslag Bane | SLAG | innspill + wedge + bunker | Tre grupper i én test |
| Teknikktest Spredning | TEK | «samme kølle» | Hvilken kølle? Avgjør båndet |

---

## D. Putt — blokkert på enhet og bøtte-grenser (8 tester)

Alle putt-testene er oppgitt i **meter**. v3 vil ha **fot**. Til enhetsspørsmålet er
avklart, kan ingen av disse mappes trygt.

| Test | Pyramide | Oppgitt avstand | I fot (÷0,305) |
|---|---|---|---|
| Putt 2 m | SLAG | 2 m | ~6,6 ft |
| TN Putt Gate | TEK | 40 cm gate, start-retning | (retning, ikke avstand) |
| TN VISA Express | TEK | tre avstander | ukjente |
| Putt 1-3m | SPILL | 1 / 1,5 / 2 / 2,5 / 3 m | 3,3–9,8 ft |
| Putt Speed 1x5 | SPILL | 3 / 5 / 7 m | 9,8 / 16,4 / 23 ft |
| Putt Speed 3x3 | SPILL | 3 / 5 / 7 m | samme |
| 9 hull lengde | SPILL | lengdekontroll | ikke putt-spesifikk? |
| TN Slagtest | TURN | 18 slag jern 7 | ikke putt — se under |

**«Putt 1-3m» krysser en bøttegrense i begge lesninger:** 1 m (3,3 ft) og 3 m (9,8 ft)
faller i ulike bånd uansett om vi bruker v3s `3-5`/`5-10` eller kodens `0-3`/`3-6`.

**«TN Slagtest»** (18 slag med jern 7) hører til innspill, ikke putt — jeg har listet
den her kun fordi den kom i samme bolk. Foreslått: Innspill 100–150 (jern 7 ≈ 150 m
for en god junior). Bekreft.

---

## Hva jeg trenger fra deg

**1. Hvilken 17-liste gjelder?**
   - (a) v3-ordrens liste (nedre-grense-konvensjon, putt i fot, ingen SPILL), eller
   - (b) kodens liste utvidet med ett område — og i så fall hvilket?

**2. Er `INNSPILL_50` og `INNSPILL_0_50` samme bøtte?** Er de det, er v3 egentlig 16.

**3. Skal putt-tallene være fot eller meter?** Fot krever datamigrering av all
   historisk puttdata, og §6.5 sier den ikke kan gjøres uten tap.

**4. De 7 testene i del C** — ett område per test, eller flere?

Når 1–3 er avklart kan del B legges inn umiddelbart (13 tester), og del C+D
gjennomgås med deg.

---

## Ikke gjort her

Ingenting er skrevet til databasen. `TestDefinition.omraade`-kolonnen finnes ikke
ennå — den legges til når lista er godkjent, per gotchas §Schema-endringer.
