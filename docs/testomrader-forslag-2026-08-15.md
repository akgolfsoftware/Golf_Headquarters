# Testområder — forslagsliste til Anders (D4)

**Dato:** 2026-08-15 · **Formål:** gi hver testdefinisjon en områdekode, slik at
test → drill kan slå opp i delt taksonomi (D4).
**Kilde for testene:** `test_definitions` i prod, 36 rader (`isCustom = false`).

---

## AVKLART 15.08: innspill bruker NEDRE grense

Anders 15.08: «innspill 50-100 er nederste grense». Det lukker to av de tre
spørsmålene under, og bekrefter **v3-ordrens liste** (lesning a).

De fem innspillsbøttene er dermed entydige:

| Kode | Bånd |
|---|---|
| `INNSPILL_0_50` | 0–50 m |
| `INNSPILL_50` | 50–100 m |
| `INNSPILL_100` | 100–150 m |
| `INNSPILL_150` | 150–200 m |
| `INNSPILL_200` | 200 m + |

**`INNSPILL_50` og `INNSPILL_0_50` er IKKE samme bøtte** — §6.4s mistanke om en
dublett er dermed avkreftet. Regnestykket går opp: 1 tee + 5 innspill + 4 nærspill
+ 7 putt = **17**.

**Konsekvens: `src/lib/taxonomy.ts` er feil.** Den bruker øvre grense
(`INN150 = "Innspill 100-150m"`) og har fire innspillsbøtter, ikke fem. Lista må
bygges om før backfillen kjøres — ellers peker halvparten av innspillstestene på
nabobåndet.

## AVKLART 15.08: innspill i meter, PUTT I FOT

Anders 15.08, to meldinger: «alt her er i m» og deretter **«putter er ft»**.

Enhetene er altså delt:

| Gruppe | Enhet |
|---|---|
| Tee, innspill, nærspill | **meter** |
| Putt | **fot** |

Det bekrefter v3-ordrens §4.5 («enhet for putt-tallene: FOT») og CANON v3.5,
som bruker fot for putting.

De sju puttbøttene, i fot:

| Kode | Bånd | ≈ meter |
|---|---|---|
| `PUTT_0_3` | 0–3 ft | 0–0,9 m |
| `PUTT_3_5` | 3–5 ft | 0,9–1,5 m |
| `PUTT_5_10` | 5–10 ft | 1,5–3,0 m |
| `PUTT_10_15` | 10–15 ft | 3,0–4,6 m |
| `PUTT_15_25` | 15–25 ft | 4,6–7,6 m |
| `PUTT_25_40` | 25–40 ft | 7,6–12,2 m |
| `PUTT_40` | 40 ft + | 12,2 m + |

**Datamigrering er dermed nødvendig likevel** — §6.5 gjelder. All eksisterende
puttdata i appen ligger i **meter** i seks bøtter med andre grenser. Den
konverteringen er en egen jobb og er ikke besluttet kjørt. Til den er gjort:
**vis alltid enheten eksplisitt i UI, aldri et bart tall** (v3-ordrens egen regel).

Testdefinisjonene under er oppgitt i meter i databasen, så mappingen krever
omregning (1 m = 3,281 ft).

**Alle tre spørsmålene er dermed lukket.**

---

## Bakgrunn: hvorfor tallet var tvetydig

Se `docs/ordre-ak-formel-v3-2026-08-03.md` §6.4, §6.5 og §6.7:

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
| Inspill 160m | SLAG | `INNSPILL_150` | 160 m ligger i 150–200 |
| Inspill 120m | SLAG | `INNSPILL_100` | 120 m ligger i 100–150 |
| Inspill Variation | SLAG | `INNSPILL_100` | 100–130 m ligger helt innenfor 100–150 |

De tre siste er entydige etter avklaringen 15.08. **Merk at «Inspill 120m» blir
`INNSPILL_100`, ikke `INNSPILL_150`** — det er nettopp forskjellen konvensjonen
avgjør, og den ville gått feil vei uten Anders' svar.

**8-ball-testene** dekker fire nærspillstyper i én test. Jeg foreslår `CHIP` som
primærområde siden chip er tyngst representert — men de kunne like gjerne vært
merket som blandede. Din vurdering.

---

## C. Spenner flere bånd — trenger din vurdering (7 tester)

Disse måler over flere områder. Ett område per test er kanskje feil modell for dem.

| Test | Pyramide | Spennet | Spørsmål |
|---|---|---|---|
| Inspill Basis | SLAG | 100–200 m | Spenner `INNSPILL_100` + `INNSPILL_150`. Splittes, eller merkes med det bredeste? |
| 18-hull Inspill | TURN | fra 49 m og opp | Dekker trolig alle fem innspillsbånd |
| PEI Test Bane | TURN | 18 hull, reelle forhold | Samme |
| PGA Tour 27 Shots | TURN | «hele registeret» | Dekker alt — eget område, eller ingen? |
| Golfslag Bane | SLAG | innspill + wedge + bunker | Tre grupper i én test |
| Teknikktest Spredning | TEK | «samme kølle» | Hvilken kølle? Avgjør båndet |

---

## D. Putt — omregnet til fot (8 tester)

Testene er lagret i meter. Omregnet med 1 m = 3,281 ft:

| Test | Pyramide | Avstand (m) | I fot | Forslag | Sikkerhet |
|---|---|---|---|---|---|
| Putt 2 m | SLAG | 2 | 6,6 | `PUTT_5_10` | Entydig |
| Putt 1-3m | SPILL | 1 / 1,5 / 2 / 2,5 / 3 | 3,3 / 4,9 / 6,6 / 8,2 / 9,8 | `PUTT_5_10` | **Blandet** — 1 og 1,5 m faller i `PUTT_3_5` |
| TN Putt Gate | TEK | 40 cm gate | (retning) | `PUTT_3_5` | Trolig kort putt. Bekreft |
| Putt Speed 1x5 | SPILL | 3 / 5 / 7 | 9,8 / 16,4 / 23,0 | `PUTT_15_25` | **Blandet** — hopper over `PUTT_10_15` |
| Putt Speed 3x3 | SPILL | 3 / 5 / 7 | samme | `PUTT_15_25` | Samme |
| TN VISA Express | TEK | «tre avstander» | — | — | Avstandene står ikke i basen |
| 9 hull lengde | SPILL | lengdekontroll | — | — | Er dette putt i det hele tatt? |
| TN Slagtest | TURN | 18 slag jern 7 | — | `INNSPILL_100` | Ikke putt — jern 7 ≈ 130–150 m |

**Omregningen flytter tre av testene** i forhold til et meter-utgangspunkt. «Putt 2 m»
er 6,6 fot og havner i `PUTT_5_10`, ikke `PUTT_0_3` — `PUTT_0_3` er under én meter og
brukes knapt av noen av testene.

**«Putt Speed»-testene hopper over et helt bånd:** 3 m er 9,8 ft (like under 10) og
5 m er 16,4 ft (i 15–25). Ingen av avstandene lander i `PUTT_10_15`. Det tyder på at
testene er designet i meter uten hensyn til fot-båndene — verdt å vite når du vurderer
om de skal ha ett område eller merkes som blandede.

---

## Hva jeg trenger fra deg

~~**1. Hvilken 17-liste gjelder?**~~ **AVKLART 15.08:** v3-ordrens liste, nedre grense.

~~**2. Er `INNSPILL_50` og `INNSPILL_0_50` samme bøtte?**~~ **AVKLART:** nei —
0–50 og 50–100.

~~**3. Fot eller meter?**~~ **AVKLART 15.08:** innspill i meter, **putt i fot**.
   Konverteringen av eksisterende puttdata (meter → fot, seks bøtter → sju) er en
   egen jobb som ikke er besluttet kjørt.

**Gjenstår — din vurdering, ikke en blokkering:**

**4. De 6 testene i del C** spenner flere bånd (Inspill Basis, 18-hull Inspill,
   PEI Test Bane, PGA Tour 27 Shots, Golfslag Bane, Teknikktest Spredning).
   Ett område per test, eller trenger de en «blandet»-merking?

**5. Tre løse tråder i del D:** TN VISA Express (avstandene står ikke i basen),
   «9 hull lengde» (er det putt?), og om TN Putt Gate skal ha `PUTT_0_3` når den
   egentlig måler startretning.

**6. 8-ball-testene og Putt Speed-testene** er blandede på samme måte — samme
   spørsmål som punkt 4.

## Status: 19 av 36 er klare

- **8 FYS** — ingen områdekode (avklart)
- **13 entydige** i del B
- **6 mappbare** i del D — men tre av dem er blandede etter omregning til fot
- **9 venter** på din vurdering (6 i del C + 3 løse tråder i del D)

**Neste tekniske steg:** bygg om `src/lib/taxonomy.ts` til v3-lista — 17 områder,
innspill med nedre grense i meter, 7 puttbøtter **i fot**, `SPILL` ut av TEK/SLAG.
Enheten må ligge i selve taksonomien, ellers arver hver konsument tvetydigheten.
Deretter `ALTER TABLE test_definitions ADD COLUMN omraade TEXT` og backfill.

**Egen jobb, ikke besluttet:** konvertering av eksisterende puttdata fra meter til
fot. Til den er kjørt skal UI vise enheten eksplisitt.

---

## Ikke gjort her

Ingenting er skrevet til databasen. `TestDefinition.omraade`-kolonnen finnes ikke
ennå — den legges til når lista er godkjent, per gotchas §Schema-endringer.
