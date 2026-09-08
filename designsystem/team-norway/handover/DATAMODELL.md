# DATAMODELL — hullene samlet, gruppert etter modell

Hver skjerm navngir sitt eget hull i designnotatet sitt. Her er de samlet **etter modell**,
ikke etter skjerm, og sortert etter hvor mange skjermer hver modell låser opp.

## Om schema-endringer i dette repoet

`prisma migrate dev`, `prisma db push` **og** `prisma migrate deploy` er alle blokkert.
Additive endringer kjøres kirurgisk med `prisma db execute` + et script under `scripts/`,
etter mønsteret som allerede finnes for `primaryCoachId`, `DelingsSamtykke` og `TnPost`.

**Modellene under er derfor skrevet som forslag, ikke som migrasjoner.** Formen følger
husreglene i de eksisterende additive tabellene: `String @id @default(cuid())`,
`@@map("snake_case")`, **ingen `@relation`** (plain FK-kolonner med `ON DELETE` satt i DDL-en),
og soft-end (`endedAt`/`revokedAt`) i stedet for sletting der historikken har verdi.

Rekkefølgen under er anbefalt byggerekkefølge.

---

## 1 · Rundescore og resultatprovenens — låser opp 4 skjermer

**Venter:** TN-13 Turneringsoversikt · TN-17 Legg til turnering manuelt · TN-07 Rangliste · TN-00 (spiller-arkets turneringsblokk)

### Finnes fra før

- `Tournament` — turneringskatalogen.
- `TournamentEntry` — påmelding, med `manualName` / `manualDate` / `manualEndDate` for
  turneringer som ikke ligger i katalogen. **Det manuelle sporet finnes altså allerede på
  påmeldingssiden** — det som mangler er resultatsiden.
- `TournamentResult` — `position`, `score`, `notes`, `@@unique([tournamentId, userId])`.
- `PublicPlayer` + `User.publicPlayerId` — turneringsidentitet.
- `WagrSnapshot` — WAGR-status per spiller.
- `docs/turnering-datakilder.md` + `src/lib/turneringer/golfbox-sync.ts` — GolfBox-feltene
  `Position.Calculated`, `ScoringToPar.ToParText`, `Rounds[]`, `Wagr`.

### Hva som mangler

`TournamentResult.score` er **ett** tall. Skjermene viser runder (`71 · 69 · 74`), til par
per runde, og «mot felt» = til par minus feltets snitt samme runde. Ingen av de tre kan
utledes fra ett score-felt. I tillegg mangler provenensen: TN-17 krever at en manuelt
innlagt rad **aldri** kan forveksles med en hentet, og det skillet må ligge i data, ikke i UI.

```prisma
// Én rad per spilt runde. Erstatter ikke TournamentResult.score — den blir
// summen, som allerede er lest av eksisterende flater.
model TnTurneringRunde {
  id                 String   @id @default(cuid())
  tournamentResultId String
  rundeNr            Int
  brutto             Int
  banePar            Int
  // Feltets snitt samme runde. null = ikke tilgjengelig (manuelle rader har
  // ALDRI dette; «mot felt» tegnes som «ikke mulig», aldri som 0).
  feltSnitt          Float?
  createdAt          DateTime @default(now())

  @@unique([tournamentResultId, rundeNr])
  @@index([tournamentResultId])
  @@map("tn_turnering_runder")
}
```

```prisma
// Provenens på en resultatrad. Additiv sidetabell i stedet for felter på
// TournamentResult, fordi den skal kunne kreves (NOT NULL i praksis) for nye
// rader uten å måtte fylles bakover for de historiske.
model TnResultatKilde {
  id                 String   @id @default(cuid())
  tournamentResultId String   @unique
  // GOLFBOX | WAGR | LAGT_INN_SELV
  kilde              String
  // Protokoll/versjon slik kildelinjen viser den: "GOLFBOX V2", "MANUELT SKJEMA V1".
  kildeVersjon       String
  // Hvem som la den inn (LAGT_INN_SELV) eller kjørte synken.
  registrertAvUserId String?
  registrertAt       DateTime @default(now())
  // Belegg for manuelle rader: lenke eller filnavn på resultatlisten.
  // null + kilde=LAGT_INN_SELV => raden er UTKAST og teller ikke i
  // rangliste eller uttak. Håndheves i domenelaget, ikke bare i UI.
  beleggUrl          String?
  // RESULTATLISTE | SKJERMBILDE | TRENER_BEKREFTER
  beleggType         String?

  @@index([kilde])
  @@map("tn_resultat_kilder")
}
```

### Konsekvenser for porten

- Kildelinjeformatet er `<FØRSTEORD> dd.mm.åååå · protokoll vN · initialer`. Førsteordet er
  en kontrakt: `MÅLT` = sporbar protokoll, `TALT` = opptelling i systemet, `LAGT INN SELV` =
  menneske uten protokoll. Se `guidelines/16-truthlayer.html`.
- Mangler `feltSnitt`, skal «mot felt» stå som **ikke mulig** i ravgult — ikke som strek,
  ikke som 0, ikke som tomt.
- En manuell rad kan ikke konverteres til hentet. Den erstattes av en hentet rad når synken
  finner den; det er en sletting + innsetting, ikke en oppdatering av `kilde`.

---

## 2 · Invitasjon av spiller til gruppe — låser opp 2 skjermer

**Venter:** TN-19 Inviter spiller · TN-02 (dekningsgraden får sin forklaring)

### Finnes fra før

`ParentInvitation` er **nesten** modellen: `token @unique @default(cuid())`, `email`,
`expiresAt`, `acceptedAt`, `acceptedById`. Den dekker foresatt-invitasjon og er et ferdig
utprøvd mønster i dette repoet.

### Hva som mangler

Tre ting: gruppen invitasjonen gjelder, telefon som kanal, og statusen `åpnet`/`ikke levert`
som TN-19 tegner. `ParentInvitation` har bare sendt/akseptert.

```prisma
model TnSpillerInvitasjon {
  id             String    @id @default(cuid())
  token          String    @unique @default(cuid())
  groupId        String
  // Nøyaktig én av disse er satt — CHECK-constraint i DDL-en.
  epost          String?
  telefon        String?
  // Avsenderen står i invitasjonen og får svaret. Kan ikke være en
  // organisasjon: en invitasjon uten navngitt menneske behandles som spam.
  avsenderUserId String
  expiresAt      DateTime
  // Settes ved lenkeklikk, ikke ved sporingspiksel (beslutning B3).
  openedAt       DateTime?
  // Settes når PlayerHQ har opprettet kontoen.
  fullfortAt     DateTime?
  fullfortUserId String?
  // Serverens avvisning: "550 5.1.1". Satt => status IKKE LEVERT, aldri SENDT.
  leveringsfeil  String?
  createdAt      DateTime  @default(now())

  @@index([groupId, createdAt])
  @@index([expiresAt])
  @@map("tn_spiller_invitasjoner")
}
```

Statusen er **utledet**, ikke et lagret felt — samme prinsipp som `TournamentEntryStatus`
ikke skal dupliseres i UI:

```
leveringsfeil != null  → IKKE LEVERT
fullfortAt != null     → FULLFØRT
openedAt != null       → ÅPNET
expiresAt < now()      → UTLØPT
ellers                 → SENDT
```

**TN-19 kan bygges før denne tabellen finnes** hvis `ParentInvitation` gjenbrukes for det
enkle sporet (e-post, sendt/fullført/utløpt). Da mangler SMS-kanalen, `åpnet` og
`ikke levert` — tre av fem statuser skjermen tegner. Anbefaling: bygg tabellen.

---

## 3 · Protokollversjon og deling på tvers av organisasjoner — låser opp 5 skjermer

**Venter:** TN-04 Protokollbibliotek · TN-05 Protokolldetalj · TN-03 Fellestesting · TN-07 Rangliste · TN-21 Referansenivåer

### Finnes fra før

- `TestDefinition` — `name`, `pyramidArea`, `omraade`, `erCanon`, `scoringRule`,
  `protocol Json?`, `visibility` (`PRIVATE | COACH | GROUP | ACADEMY`), `isCoachApproved`,
  `approvedAt`.
- `TestResult` — `takenAt`, `score`, `details Json?`, `witnessUserId`,
  `witnessStatus` (`PENDING | ATTESTED | REJECTED`), `attestationMode` (`DIGITAL | MANUAL | NONE`).
  **Attesteringen TN-05 tegner finnes altså allerede.**
- `TestShot` — slag for slag, med `pei`, `sg`, `x`, `y`.
- `TestSession` — live føring, per spiller.

### Hva som mangler

1. **Versjon.** Kildelinjen sier `TN-BATTERI Q1 V3`. `TestDefinition` har ingen
   versjonskolonne, og et resultat peker på definisjonen — ikke på versjonen den ble målt
   under. Endres protokollen, endres historikkens betydning stille.
2. **Låsedato.** TN-00 sier «protokollversjonen låses ved første bruk». Ingen kolonne.
3. **Eier-organisasjon og deling på tvers.** `visibility: ACADEMY` betyr «hele akademiet» —
   det finnes ingen «delt med disse tre organisasjonene», som er hele TN-04s poeng
   (spriket 16/11 mellom protokoller og batteri).
4. **Kø for føring av flere spillere i én seanse.** `TestSession` er per spiller; TN-03
   fører en gruppe gjennom en protokoll i rekkefølge.

```prisma
model TnProtokollVersjon {
  id                String    @id @default(cuid())
  testDefinitionId  String
  versjon           Int
  // Frosset kopi av TestDefinition.protocol slik den var da versjonen ble låst.
  protokollSnapshot Json
  // Settes ved første bruk. Satt => versjonen er uforanderlig.
  laastAt           DateTime?
  laastAvUserId     String?
  createdAt         DateTime  @default(now())

  @@unique([testDefinitionId, versjon])
  @@index([testDefinitionId])
  @@map("tn_protokoll_versjoner")
}

model TnProtokollDeling {
  id             String    @id @default(cuid())
  testDefinitionId String
  // Group-id (org-light: WANG og TN finnes som kanoniske grupper).
  eierGruppeId   String
  delMedGruppeId String
  // LES | LES_OG_FOR — om mottakeren kan føre resultater på protokollen.
  niva           String    @default("LES")
  createdAt      DateTime  @default(now())
  revokedAt      DateTime?

  @@unique([testDefinitionId, delMedGruppeId])
  @@index([eierGruppeId, revokedAt])
  @@map("tn_protokoll_delinger")
}
```

I tillegg trengs **én additiv kolonne** på `TestResult`:
`protokollVersjonId String?` — plain FK mot `tn_protokoll_versjoner.id`, `ON DELETE SET NULL`.
Uten den kan ikke kildelinjen skrives, og TN-07s rangliste kan ikke si hvilken versjon
tallene er sammenlignbare under. Dette er den enkeltendringen som låser opp flest kildelinjer.

Køen i TN-03 kan bygges som utledet tilstand over `TestAssignment` (finnes: coach tildeler
test til spiller) uten ny tabell — verifiser mot loaderen før du legger til noe.

---

## 4 · Samling og uttak på gruppenivå — låser opp 4 skjermer

**Venter:** TN-14 Samlingspunkt · TN-06 Uttaksliste · TN-02 (kommende samlinger) · TN-00 («krever handling»)

### Finnes fra før

- `TrainingCamp` — men **per spiller** (`userId`, `name`, `startDate`, `endDate`, `location`,
  `partner`). Den er en oppføring i spillerens egen sesong, ikke en samling forbundet arrangerer.
- `GroupSchedule` — gruppeøkter med `startAt`/`endAt`/`location` og `kind`
  (`SAMLING`/`HELDAGSSAMLING`). Nærmeste eksisterende modell for programmet time for time.
- `GroupPeriodBlock`, `GroupPeriodGoal` — periodisering på gruppen.

### Hva som mangler

En samling som **ett punkt** med uttatte spillere og svar. TN-14 viser bekreftet / venter /
meldt av, TN-06 viser vurderingsmatrisen som fører til uttaket, og TN-02 teller «kommende
samlinger». Ingen av dem har en modell.

```prisma
model TnSamling {
  id            String    @id @default(cuid())
  groupId       String
  navn          String
  startDato     DateTime  @db.Date
  sluttDato     DateTime  @db.Date
  sted          String?
  // Frist for spillerens svar. Vises som «frist» i TN-14, aldri som kildelinje.
  svarfrist     DateTime?
  publisertAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([groupId, startDato])
  @@map("tn_samlinger")
}

model TnUttak {
  id             String    @id @default(cuid())
  samlingId      String
  userId         String
  // UTTATT | RESERVE | IKKE_UTTATT
  status         String    @default("UTTATT")
  uttattAvUserId String
  uttattAt       DateTime  @default(now())
  // Spillerens svar. null = venter. VENTER er fravær av rad-verdi, ikke en verdi.
  // BEKREFTET | MELDT_AV
  svar           String?
  svarAt         DateTime?
  svarKommentar  String?

  @@unique([samlingId, userId])
  @@index([samlingId, status])
  @@map("tn_uttak")
}
```

TN-06s vurderingsmatrise (Resultater · Prestasjoner · Prosess/adferd) er **underlag**, ikke
en totalscore. Den skal ikke lagres som ett tall:

```prisma
model TnUttakVurdering {
  id            String   @id @default(cuid())
  samlingId     String
  userId        String
  // RESULTATER | PRESTASJONER | PROSESS_ADFERD — de tre uttakskriteriene,
  // ordrett fra terminologien. Aldri en fjerde, aldri en sum.
  kriterium     String
  // Tre trinn, samme kanon som PeriodGoalStatus. Aldri en 1-10-skala.
  // IKKE_STARTET | PAA_VEI | NAADD
  trinn         String
  begrunnelse   String?
  vurdertAvUserId String
  vurdertAt     DateTime @default(now())

  @@unique([samlingId, userId, kriterium])
  @@index([samlingId])
  @@map("tn_uttak_vurderinger")
}
```

**Systemet konkluderer aldri.** Ingen kolonne skal kunne bli en totalscore, og
`TnUttakVurdering` har derfor ingen numerisk verdi.

Programmet time for time i TN-14 bygges på `GroupSchedule` med `TnSamling.id` som
gruppering — vurder en additiv kolonne `samlingId String?` på `GroupSchedule` framfor en
ny programtabell.

---

## 5 · Avvik mot publisert plan — låser opp 3 skjermer

**Venter:** TN-16 Månedsplan · TN-00 («krever handling») · Periodeplan-malen

### Finnes fra før

- `TrainingPlan.publishedSnapshot Json?` — «snapshot av øktene ved forrige publisering
  (diff-grunnlag)». **Grunnlaget finnes allerede.**
- `TrainingPlanSession` med `status SessionStatus` og `sourceGroupId`.
- `OktAvbruddAarsak` — `SYK | SKADE | REISE | VAER | ANNET`, med kommentaren at «årsaken ER
  datapunktet» og at avlyste økter vises men holdes utenfor etterlevelsen.

### Hva som mangler

Ingen tabell, bare en beregning som ikke finnes: **avvik = publisert plan minus
gjennomført**, per uke, med årsak. TN-16 viser måned · uke · fokus · avvik, og avvikstallet
er målt mot publisert plan — ikke mot spillerens egen redigerte plan.

Anbefaling: **ingen ny modell.** Skriv `src/lib/domain/tn-avvik.ts` som leser
`publishedSnapshot` og de faktiske sesjonene og returnerer avviket. Grunnen er at et lagret
avvikstall må vedlikeholdes ved hver endring i planen, og da drifter det fra sannheten.
Beregnes det ved lesing, kan det ikke bli feil.

Kildelinjen blir da `TALT dd.mm.åååå · publisert plan vN · initialer`, der `vN` er
snapshot-versjonen.

---

## 6 · Skole som normalisert enhet — låser opp 1 skjerm

**Venter:** TN-08 Skoleoversikt

### Finnes fra før

- `User.school String?` og `User.schoolYear String?` (`VG1 | VG2 | VG3`) — **fritekst**.
- `PlayerProgram` — enum med `WANG_TOPPIDRETT`, `WANG_UNG`, `GFGK_*`, `AK_ACADEMY*`.
  Dekker AK Golfs egne program, ikke landets toppidrettsgymnas.
- `EksternLeserGruppe` — GUEST-bruker med lesetilgang til samtykkede data i tildelte grupper.
  Dette er skolekontaktens modell, hvis skolekontakt skal ha innsyn.

### Hva som mangler

`school` er fritekst, så «NTG Bærum», «NTG Bærum ", "ntg bærum» er tre skoler. Aggregatet
kan telles i dag, men terskelen på tre utøvere kan ikke håndheves trygt på fritekst — og
terskelen er selve personvernmekanismen.

```prisma
model TnSkole {
  id        String    @id @default(cuid())
  navn      String
  // Normalisert oppslagsnøkkel, som Group.slug.
  slug      String    @unique
  sted      String?
  // VG1-VG3, VG2-VG3 osv. Fritekst — en ny variant skal ikke kreve migrasjon.
  trinn     String?
  arkivertAt DateTime?
  createdAt DateTime  @default(now())

  @@map("tn_skoler")
}
```

Pluss én additiv kolonne på `User`: `tnSkoleId String?`, plain FK, `ON DELETE SET NULL`.
`User.school` beholdes som spillerens egen fritekst; `tnSkoleId` er den normaliserte
koblingen forbundet teller på. Backfill kirurgisk med et script som matcher slug.

**Navn-varianten i TN-08 krever ingen av dette.** Den er låst av en hjemmelsgrunn, ikke en
datagrunn — se `TILGANGSMATRISE.md` §TN-08.

---

## Rekkefølgen, kort

| # | Modell | Låser opp | Tyngde |
|---|---|---|---|
| 1 | Rundescore + resultatprovenens (§1) | 4 skjermer | To nye tabeller |
| 2 | Protokollversjon + deling (§3) | 5 skjermer | To tabeller + én kolonne på `TestResult` |
| 3 | Samling + uttak (§4) | 4 skjermer | Tre tabeller |
| 4 | Avvik mot publisert plan (§5) | 3 skjermer | **Ingen tabell** — ren beregning |
| 5 | Spillerinvitasjon (§2) | 2 skjermer | Én tabell, ferdig mønster i `ParentInvitation` |
| 6 | Skole normalisert (§6) | 1 skjerm | Én tabell + én kolonne |

§3 låser opp flest skjermer, men §1 er tyngst i vekt per skjerm og treffer de to nyeste.
§5 er billigst — én tabell etter et mønster som allerede er utprøvd. §4 koster ingenting i
schema og bør gjøres uansett rekkefølge.
