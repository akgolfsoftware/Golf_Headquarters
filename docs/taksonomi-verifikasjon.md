# Taksonomi-verifikasjon — steg 0 foran D1–D6

**Dato:** 2026-08-14 · **Kilde:** `designsystem/paper/kart/prompt-code-session-implementering.md` §step_0_gate
**Metode:** lest mot `prisma/schema.prisma` (5325 linjer) + `src/lib/taxonomy.ts`. Alle påstander har filsti.

## Konklusjon først

**Porten er utløst.** Ordren sier: «STOPP hvis områdetaksonomien ikke deles — da er leveranse 4
migrering, ikke kobling.» Den deles ikke. Test-data har ingen områdekode i det hele tatt.

Omfanget er likevel lite: **ett additivt felt + backfill av 36 testdefinisjoner.** Det er ikke en
strukturell migrering, men det krever Anders' domenekunnskap og kan ikke gjettes av en agent.

De fem andre leveransene er ikke blokkert av dette.

| Leveranse | Kan bygges nå? | Blokkering |
|---|---|---|
| D1 Workbench F4 | Delvis | Mangler utkast-status og faktisk tid på økt-nivå |
| D2 Booking → faktura | Ja | «Forfalt» må utledes — forfallsdato mangler |
| D3 Ukesrapport/digest | Ja | Ingen |
| D4 Test → drill | **Nei** | Testene har ingen områdekode |
| D5 Gapping | Ja | Køllelista bør komme fra TrackMan, ikke Utstyr |
| D6 Skoletidsbekreftelse | Ja | Ingen |

---

## a) Deler runde-, test- og drilldata områdetaksonomi?

### Den kontrollerte lista finnes

`src/lib/taxonomy.ts:93` definerer `TRENINGSOMRADER` — **16 områdekoder** med SG-kategori per kode:

```
TEE · INN200 · INN150 · INN100 · INN50 · CHIP · PITCH · LOB · BUNKER
PUTT0_3 · PUTT3_6 · PUTT6_10 · PUTT10_20 · PUTT20_40 · PUTT40P · SPILL
```

Dette er AK-formelens område-slot. Merk: `~/.claude/CLAUDE.md` sier «17 områder» — koden har 16.
Avviket er ikke avklart her; CLAUDE.md sier selv den ikke er fasit for AK-formelen.

### Hvem bærer den — og hvem gjør det ikke

| Datatype | Modell | Områdefelt | Vurdering |
|---|---|---|---|
| Drill (coach-mal) | `DrillMal` | `pyramide` + `omraade String?` | Bærer koden — men utypet |
| Drill (i økt) | `TrainingDrillV2` | `pyramide` + `omraade String?` | Samme |
| Plan-økt | `TrainingPlanSession` | `pyramidArea` + `skillArea SkillArea?` | Kun 5 grove |
| **Test** | `TestDefinition` | `pyramidArea` **alene** | **Ingen områdekode** |
| Runde-slag | `Shot` | `club`, `lie`, `shotType` | Ingen områdekode |
| TrackMan-slag | `TrackManShot` | `club String` | Ingen områdekode |

### Hvorfor dette stopper D4

`playerhq-test-detalj.html` krever at en test vet hvilket bånd den måler — fasitens egne ord:
«Putt 5–10 ft · ni kuler = testens eget bånd; Portputt 3–5 ft = båndet under». Oppslaget skal være
taksonomi, ikke skjønn.

`TestDefinition` (`prisma/schema.prisma:1520-ish`) har kun `pyramidArea: PyramidArea` — altså
`TEK`/`SLAG`/`SPILL`/`FYS`/`TURN`. Å slå opp «drills i samme bånd» fra `TEK` gir hele det tekniske
biblioteket. Fasitens rangering «nærmeste bånd først» er ikke mulig å regne ut.

**Minste migrering:**
1. `ALTER TABLE test_definitions ADD COLUMN omraade TEXT` — additivt, trygt, følger
   gotchas §Schema-endringer (kirurgisk `db execute`, ikke `migrate dev`).
2. Backfill: hver av de 36 testdefinisjonene får én kode fra `TRENINGSOMRADER`.
   **Krever Anders** — en agent kan ikke avgjøre om «TN Putt Gate» er `PUTT0_3` eller `PUTT3_6`.
3. Først da kan D4 bygges som ren kobling.

### To latente problemer funnet underveis

**1. `omraade` er et fritekstfelt som behandles som kontrollert vokabular.**
Både `DrillMal.omraade` og `TrainingDrillV2.omraade` er `String?`. Det finnes ingen enum, og
`src/lib/validation/schemas.ts` har **null** treff på `omraade`. Ingenting hindrer at en drill
lagres med `"putting"`, `"PUTT_3_6"` eller tom streng. Oppslaget i D4 vil feile stille på slike
rader. Bør strammes til når feltet uansett tas i bruk for tester.

**2. To parallelle femdelinger med ulike navn.**
- `SkillArea` (Prisma): `TEE_TOTAL · TILNAERMING · AROUND_GREEN · PUTTING · SPILL`
- `SGKategori` (`src/lib/taxonomy.ts:91`): `TEE · TILNAERMING · KORT_SPILL · PUTTING · SPILL`

Samme fem inndelinger, to navnesett. `TEE_TOTAL`↔`TEE` og `AROUND_GREEN`↔`KORT_SPILL` må broes
eksplisitt. Broen finnes ikke som egen modul i dag.

---

## b) Har RSVP/booking feltene F4/D1-fasitene antar?

| Fasit-begrep | Finnes? | Hvor |
|---|---|---|
| kilde («født av») | **FINNES** | `TrainingSessionV2.generertFra` + `.generertFraId` |
| hoppet | **FINNES** | `SessionStatusV2.SKIPPED` |
| done | **FINNES** | `SessionStatusV2.COMPLETED` |
| RSVP-svar | **FINNES** | `SessionParticipant.status` + `.respondedAt` |
| faktisk tid (drill) | **FINNES** | `TrainingDrillV2.actualDurationSec` |
| **ghost-utkast** | **MANGLER** | `SessionStatusV2` har ingen `DRAFT` |
| **låst** | **MANGLER** | Ingen locked-felt på økt |
| **sendt/publisert** | **MANGLER** | `isShared` finnes, men betyr delt økt — ikke «publisert til spiller» |
| **faktisk tid (økt-nivå)** | **DELVIS** | `completedSummary Json?` — utypet, ikke egne felt |

**Godt nytt for D1c:** fasitens viktigste skille — hoppet (aktivt nei) mot passert-ulogget
(stillhet) — er allerede mulig. `SKIPPED` finnes som egen status, og «passert ulogget» utledes av
`status = PLANNED AND endTime < now()`. Ingen migrering nødvendig for etterlevelses-nevneren.

**Blokkering for D1a/D1b:** ghost-blokker skal «oppføre seg som blokker, men ikke telle». Uten en
`DRAFT`-status må utkast enten få eget felt (`erUtkast Boolean @default(false)`) eller ny enum-verdi.
Anbefaling: **eget boolsk felt**, ikke ny enum-verdi — en enum-utvidelse tvinger gjennomgang av
alle `switch` på `SessionStatusV2`, mens et boolsk felt med default er additivt og lar
eksisterende telle-logikk filtreres med ett `where`.

---

## c) Har TrackMan-økter carry per kølle koblet mot utstyr?

**Carry per kølle: FINNES.** `TrackManShot` har `club String` + `carryDistance Float?`, og er
indeksert på `@@index([sessionId, club])` — akkurat spørringen gapping trenger.

**Koblingen mot Utstyr: FINNES IKKE maskinelt.** `EquipmentBag` lagrer køllene som seks fritekst-
felter (`driver`, `fairwayWoods`, `hybrids`, `irons`, `wedges`, `putter`). Det er prosa, ikke en
liste. `TrackManShot.club` er på sin side parset fra CSV («7-jern», «Driver»). Å matche «irons»-
strengen mot «5-jern» krever tekstparsing som vil feile.

**Anbefaling:** D5 bygges med køllelista utledet fra TrackMan-dataene selv — de siste 90 dagenes
distinkte `club`-verdier. Fasiten trenger uansett slag-antall per kølle som nevner, og det tallet
kommer fra samme spørring. `EquipmentBag` brukes da ikke i D5. Det gjør leveransen ufarlig og
utsetter utstyrsnormaliseringen til den faktisk trengs.

Flaggregelen (gap over 22 m, begge køller minst 20 slag, driver unntatt) er ren regnelogikk uten
databehov. Egner seg for `node:test`.

---

## d) D2 — booking → faktura

Kjeden fasiten tegner finnes: `Booking.trainingSessionV2Id` knytter booking til økt, og
`Payment.bookingId` + `Payment.stripe*`-feltene knytter fakturalinje til booking. Proveniensen
«født av booking tor 13:00» kan altså regnes ut for hver linje.

**Ett hull:** fasiten krever Stripes tre ord — betalt / åpen / **forfalt**. `PaymentStatus` har
`PENDING · SUCCEEDED · FAILED · REFUNDED · PARTIALLY_REFUNDED`. «Forfalt» er ikke en status, og det
finnes ingen forfallsdato på `Payment` å utlede den fra. Enten legges `dueDate DateTime?` til
(additivt), eller så hentes forfallsstatus fra Stripe ved visning. Fasitens egen regel — «Stripe
eier status, vi lagrer referanse» — peker mot Stripe som kilde.

---

## Anbefalt rekkefølge etter dette

1. **D3, D6** — ingen blokkeringer, bygges som de er
2. **D5** — bygges med TrackMan-utledet køppelliste
3. **D2** — avklar forfallskilde (Stripe vs. eget felt) først
4. **D1** — legg til `erUtkast` + publiseringsfelt, så bygg
5. **D4** — venter på Anders' backfill av 36 testområder

## Åpne spørsmål til Anders

1. **36 testdefinisjoner trenger hver sin områdekode.** Skal jeg lage en liste med forslag du kan
   rette, eller vil du sette dem selv? (Forslag-lista er raskest — du retter det som er feil.)
2. **16 eller 17 områder?** Koden har 16. CLAUDE.md sier 17.
3. **Forfalt-status i D2:** hentes fra Stripe ved visning, eller egen forfallsdato i vår base?
