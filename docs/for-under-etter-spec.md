# FØR / UNDER / ETTER — designspesifikasjon og pilot

Status: utkast til godkjenning · 2026-07-31 · gren `feature/for-under-etter-spec`

> **⚠ §2 «Designsystem-beslutning: C, smalt» ER HISTORIKK (overstyrt 2026-08-03).**
> Konklusjonen der — behold Inter/Familjen Grotesk/JetBrains Mono, «Poppins/Lora/IBM Plex gir
> null verdi», ingen videre Paper-migrering før piloten — er **forkastet**. Anders overstyrte
> den 03.08: **Claude Paper vinner alltid** (Claude Design `605a48cc`), full port kjører nå,
> og Poppins/Lora/IBM Plex Mono er fasit-fontene. Flyt- og innholdsdelen av spesifikasjonen
> (§3 og utover) står uendret. Gjeldende designregel: `.claude/rules/beslutninger.md` §Tema/design.

Alt i dette dokumentet er verifisert mot kodebasen 2026-07-31. Der briefen og koden
sier forskjellige ting, står koden. Avvikene er listet i §1.

---

## 1. Hva som faktisk finnes (verifisert, ikke anslått)

| Påstand i briefen | Faktisk | Konsekvens |
|---|---|---|
| 452 sider, 616 komponenter, 165 modeller | 451 `page.tsx`, 615 `.tsx` i `src/components`, 165 `model` | Stemmer i praksis |
| Whisper + recording API finnes | Ja: `/admin/recording` + `start`, `upload-chunk`, `complete`, `abort`, `status`, `transcribe`, `analyze` + `src/lib/transcribe.ts` | Fangst er **redesign**, ikke nybygg |
| Signal-modell finnes | Ja, `Signal` med `kind`, `value`, `payload`, `provenance` | Brukes av FØR-kortet |
| CoachingTask mangler | Stemmer — men **`PlanAction` finnes** med `suggestion`, `status` PENDING/ACCEPTED/REJECTED, `agentName`, `provenance`, indeks på `coachId, status, createdAt` | **Ikke bygg CoachingTask.** Se §5 |
| ListRow har ett trailing-element | Stemmer. `meta` er ett slot, pluss `unread`-prikk og `chevron` | Reell blokkering. Se beslutning 8 |
| Claude Paper vs faktisk stack | Faktisk: Inter + Familjen Grotesk + JetBrains Mono, accent `#D1F843` (lime) | Se §2 |
| GDPR/samtykke lydopptak | **Ingen modell finnes.** Kun `HelseSamtykke` (annet formål) og et `consentVerified`-flagg | Kritisk sti. Se §4 |
| Offline-toleranse for Fangst | **Finnes ikke.** `recording-controls.tsx` laster opp biter med rå `fetch` | Må bygges. Se §6 |
| Talegjenkjenning uverifisert | Verre enn antatt: `GOLF_PROMPT` i `transcribe.ts` inneholder **null** AK/MORAD-termer. Ingen P1–P10, ingen CS-nivåer, ingen L-faser | Billig fiks, stor effekt. Se §7 |

Ting briefen ikke nevner, som jeg fant:

- **`VisningsVelger` finnes allerede** i `golfdata/`, men er låst til kalender
  (`KalenderVisning = "agenda" | "uke" | "maned" | "tidslinje"`). Spillere-flatens
  visningsvelger kan ikke gjenbruke den uten å generalisere typen.
- **`Group` har ingen `kind`-felt.** Modellen har `name`, `level`, `coachId`,
  `maxParticipants`. GroupCards tre varianter (kontrakt/program/adhoc) har ingen
  datakilde i dag.
- **`/admin/queue` har allerede «Løst»-kolonnen som tom plassholder**, med kommentar
  i koden om at den venter på en oppgavemodell. Den ventingen er over — `PlanAction`
  dekker det.

---

## 2. Designsystem-beslutning: C, smalt definert

**LÅST 2026-07-31 av Anders** (samme beslutning som `docs/gjenstaaende-plan-2026-07-31.md` §1.1).

**Valget er C (hybrid), men med en mye smalere migrering enn briefen legger opp til.**

Claude Paper er designfasit i Open Design / speil — men **appen** får kun det som står under
punkt 1–5 her til piloten er evaluert. Full Paper-port til `src/` er en senere beslutning.

Begrunnelse:

A (full Claude Paper) forkastes. Det betyr ny palett, tre nye fonter og en ny
accent-farge på tvers av 615 komponenter og 451 sider — mens vi ennå ikke har
bevist at sløyfen virker. Det er nøyaktig feilen final_instruction advarer mot,
bare i fargeform i stedet for skjermform.

B (bare behold) forkastes fordi én ting i Claude Paper faktisk løser et ekte
problem: **accent-monopolet**. I dag er lime både merkevare, signalfarge,
status og CTA. Da finnes det ingen visuell måte å si «dette er den ene tingen
nå» på. Regel 1 i produktreglene er ikke håndhevbar med dagens tokens.

C, slik jeg definerer det:

1. **Behold** Inter + Familjen Grotesk + JetBrains Mono. Ingen fontbytte.
   Poppins/Lora/IBM Plex gir null verdi for eier og koster hele appen.
2. **Behold** eksisterende token-pipeline i `globals.css` og `src/lib/v2/tokens.ts`.
3. **Innfør ett nytt token:** `--handling` — fargen som kun brukes på skjermens
   ene primærhandling. Verdi `#D97757` (Claude Papers accent). Den er varm og
   står i tydelig kontrast til lime, så «én ting nå» blir umiddelbart lesbar
   uten å røre noe eksisterende.
   **I kode (2026-07-31):** `--v2-handling` + alias `--handling` i `globals.css`,
   `T.handling` i `src/lib/v2/tokens.ts`.
4. **Regel:** `--handling` får forekomme maksimalt én gang per skjerm. Håndheves
   av en ESLint-regel eller en enkel gate i `npm run verify` — ellers forfaller
   den til nok en merkevarefarge innen tre uker.
5. **Ingen ytterligere Paper-migrering før piloten er evaluert.** Etter piloten
   tas beslutningen på nytt, med data.

Det som adopteres fra Claude Paper er altså prinsippet, ikke paletten:
én accent med monopol, rolig base, generøs luft.

**Typografi og tokens som gjelder i resten av dokumentet:**

| Rolle | Verdi |
|---|---|
| Display (kortoverskrifter, tall som skal leses på avstand) | Familjen Grotesk |
| UI og brødtekst | Inter |
| Tall, tid, målinger | JetBrains Mono |
| Primærhandling («Én ting nå») | `--handling` `#D97757` |
| Signal, status, merkevare | eksisterende lime `#D1F843` |
| Flatebakgrunn | eksisterende `--paper` |

---

## 3. Sløyfen i sin helhet

Dette er ryggraden. FØR og ETTER er verdiløse hver for seg — det er tråden mellom
dem som løser at innsikten dør når økta er over.

```
  FØR (30 s)              UNDER (< 20 s)            ETTER (2 min)
  ────────────            ──────────────            ─────────────
  Før-kort                Fangst                    Godkjenningskort
  · tråd fra sist         · én stor knapp           · observasjon
  · sjekkpunktet          · AK-formel forhåndsutfylt· foreslått øvelse
  · hva har skjedd        · tre hurtigtagger        · nytt sjekkpunkt
                                                    · melding til spiller
        ▲                                                   │
        └───────── sjekkpunktet blir neste FØR ─────────────┘
```

**Sjekkpunktet er den tekniske tråden.** Det er ett felt som skrives i ETTER og
leses i FØR. Uten det er dette tre skjermer som ikke kjenner hverandre.

---

## 4. Samtykke — kritisk sti, blokkerer all fangst

Piloten er GFGK-juniorgrupper + WANG Toppidrett. De fleste er mindreårige. Ingen
lyd kan tas opp av noen av dem før samtykke er registrert.

### Datamodell (ny)

```prisma
model LydSamtykke {
  id          String    @id @default(cuid())
  userId      String    // spilleren opptaket gjelder
  // GITT | TRUKKET | VENTER
  status      String    @default("VENTER")
  // Hvem som ga det: SELV (myndig) | FORESATT
  gittAv      String
  // Verifisert e-post til foresatt, null når gittAv = SELV
  foresattEpost String?
  gittAt      DateTime?
  trukketAt   DateTime?
  // Ordlyden spilleren/foresatt faktisk sa ja til. Aldri en peker til
  // en tekst som kan endres i ettertid — kopien lagres her.
  ordlyd      String
  createdAt   DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId])
  @@map("lyd_samtykker")
}
```

Schema-endringen er additiv og kjøres med kirurgisk `db execute` per gotchas —
ikke `migrate dev`, ikke `db push`.

### Gating (hard, ikke rådgivende)

Dette er det ene stedet i appen hvor invariant 1 («anbefalinger sperrer aldri»)
**ikke** gjelder. Invariant 1 handler om trening. Dette handler om jussen.

- `status !== "GITT"` → opptaksknappen rendres **ikke**. Ikke deaktivert, ikke
  grå. Borte. En deaktivert knapp inviterer til å finne veien rundt.
- I stedet vises: «Venter på samtykke fra foresatt» + én handling: «Send purring».
- Serversiden avviser `/api/recording/start` uavhengig av hva klienten sender.
  Klientgating er kosmetikk.
- Trukket samtykke sletter eksisterende opptak for den spilleren innen 30 dager.

### Innhenting

E-post til foresatt med lenke til en samtykkeside. Krever verifisert e-post —
mønsteret finnes allerede (`guardian-consent-email-linking`). **Avhengighet:
DKIM/Resend fra Fase 0 må virke først.** Uten det når ikke e-posten fram, og
piloten kan ikke starte.

### Pilot i to bølger

Bølge 1 starter med de spillerne som har samtykke. Resten venter. Vi utsetter
ikke hele piloten på den tregeste foresatte.

---

## 5. ETTER — godkjenningskortet

Jeg tar dette før UNDER, fordi det avgjør datamodellen alt annet henger på.

### Ikke bygg CoachingTask

`PlanAction` har allerede alt briefen ber om: `suggestion` (Json),
`status` PENDING/ACCEPTED/REJECTED, `agentName`, `coachId`, `provenance`, og
riktig indeks. En ny `CoachingTask` ville vært en parallell kø med samme jobb.

**Endring som trengs:** utvid `actionType`-listen med `SESSION_FOLLOWUP`, og legg
til to felter for tråden:

```prisma
// tillegg til PlanAction
sjekkpunkt      String?   // teksten som blir neste FØR-korts sjekkpunkt
fangstId        String?   // hvilken fangst forslaget kom fra
```

`suggestion`-blobben valideres med zod ved lesing (invariant 6 — aldri
`as unknown as T`).

### Skjermen

Godkjenningskortet lever i `/admin/queue`, i «Løst»-kolonnen som allerede står
tom og venter. Kortet:

```
┌──────────────────────────────────────────────┐
│ Øyvind Rohjan          fanget i går 16:42    │  ← Inter, mono på tid
│                                              │
│ OBSERVASJON                                  │  ← Eyebrow
│ Låser høyre albue i P6, mister lav punkt     │  ← Familjen Grotesk, stor
│ på lange jern.                               │
│                                              │
│ FORESLÅTT ØVELSE                             │
│ Albue-vegg mot P6 · CS40 · M1 · PR1          │  ← AKFormelChip (finnes)
│ [ bytt øvelse ]                              │  ← tekstlenke, ikke knapp
│                                              │
│ NESTE SJEKKPUNKT                             │
│ Holder albuen i P6 på 7 av 10 slag           │
│                                              │
│ MELDING TIL SPILLER                          │
│ «Bra økt i dag. Fokuset fram til neste       │  ← redigerbart felt,
│  gang er albuen i P6 — se øvelsen jeg la     │     forhåndsutfylt
│  i planen din.»                              │
│                                              │
│ Hvorfor dette forslaget ⌄                    │  ← provenance, kollapset
│                                              │
│         [ Godkjenn og send ]                 │  ← --handling, eneste
└──────────────────────────────────────────────┘
```

Ett trykk på «Godkjenn og send» gjør fire ting i én transaksjon:

1. `PlanAction.status = ACCEPTED`
2. Øvelsen skrives til spillerens plan via v2-sync-helperne
   (plan-live-synk-invarianten — aldri direkte skriving)
3. `sjekkpunkt` lagres og blir neste FØR-korts tråd
4. Meldingen sendes til spilleren

Feiler ett av dem, feiler alle. Halvveis godkjenning er verre enn ingen.

### Regelsjekk

- Regel 1: én `--handling`-knapp. «Bytt øvelse» er tekstlenke, «Hvorfor» er
  kollapset. ✓
- Regel 2: alt er forfattet av systemet. Eier redigerer eller godkjenner. ✓
- Regel 3: ingen tom skjerm. Meldingen er alltid forhåndsutfylt. ✓
- Regel 5: «Hvorfor dette forslaget» leser fra `provenance`. ✓

---

## 6. UNDER — Fangst

### Hva finnes

`recording-controls.tsx` (678 linjer) har MediaRecorder, bit-opplasting, avbryt,
statuspolling. Motoren er der. Det som mangler er at den overlever rangen.

### Hva må endres

**Offline-toleranse.** I dag: `fetch` per bit, ingen kø. Mister du dekning,
mister du opptaket.

Ny flyt:

1. Hver lydbit skrives til **IndexedDB først**, med sekvensnummer.
2. En opplaster tømmer køen når nett finnes. Feiler den, blir biten liggende.
3. UI-en viser aldri «lagret» før biten faktisk ligger i IndexedDB. Den viser
   «lastet opp» som en egen, senere tilstand.
4. Serwist er allerede i stacken — background sync hører hjemme i `src/app/sw.ts`.
5. Ved neste åpning av appen: står det biter i køen, tømmes de før noe annet.

**Dette er den tekniske jobben med høyest risiko i hele leveransen.** Alt annet
er skjermer. Dette er data som forsvinner hvis det er feil.

### Skjermen

Én skjerm, én hånd, ingen scrolling.

```
┌──────────────────────────┐
│ Øyvind Rohjan        ✕   │
│ TEK · TEE · L-BALL       │  ← forhåndsutfylt AK-formel,
│ CS60 · M2 · PR2          │     trykk for å endre
│                          │
│                          │
│        ┌────────┐        │
│        │        │        │  ← 96 px, --handling
│        │   ●    │        │     eneste primærhandling
│        │        │        │
│        └────────┘        │
│         02:14            │  ← JetBrains Mono
│                          │
│  [ P6 ]  [ Lav punkt ]   │  ← tre hurtigtagger, 56 px
│  [ Tempo ]               │
│                          │
│  ◆ Lagret lokalt         │  ← ærlig tilstand
└──────────────────────────┘
```

- **AK-formelen er forhåndsutfylt** fra spillerens aktive plan for dagen. Eier
  fyller aldri ut noe fra scratch (regel 3).
- **De tre hurtigtaggene er ikke faste.** De genereres fra forrige økts
  sjekkpunkt og spillerens åpne fokusområder. Det er her sløyfen lukkes: FØR-kortets
  sjekkpunkt dukker opp som en tagg du kan trykke med tommelen.
- Alle trykkmål 56 px. Opptaksknappen 96 px.
- Ingen skjerm uten samtykke (§4).

### Målet under 20 sekunder

Fra du løfter telefonen til opptaket går: åpne app (PWA, allerede innlogget) →
spiller er forhåndsvalgt fra dagens kalender → trykk. Tre trinn. Er spilleren
ikke i kalenderen, er det fire.

---

## 7. FØR — før-kortet

### Hva det leser

- **Sjekkpunktet** fra forrige godkjente `PlanAction` — dette er tråden.
- **Hva som har skjedd siden:** `Signal`-rader nyere enn forrige økt, spillerens
  gjennomførte økter i PlayerHQ, nye runder.
- Ingenting av dette er nye spørringer mot nye tabeller. Alt finnes.

### Skjermen

```
┌──────────────────────────────────────────────┐
│ Øyvind Rohjan · A3        neste økt om 40 min│
│                                              │
│ DER DERE SLUTTET                             │
│ Albue i P6 på lange jern. Sjekkpunktet var   │  ← Familjen Grotesk
│ 7 av 10 slag.                                │
│                                              │
│ SIDEN SIST                                   │
│ · 3 økter gjennomført, 2 av 3 planlagte      │
│ · SG tilnærming +0,3 (14 dager)              │  ← mono på tall
│ · Ingen runder registrert                    │
│                                              │
│ Hvorfor disse tallene ⌄                      │
│                                              │
│              [ Start fangst ]                │  ← --handling
└──────────────────────────────────────────────┘
```

30 sekunders lesing betyr maks tre punkter under «Siden sist». Er det flere,
velger systemet de tre viktigste. Det er ikke en liste, det er en redigering.

### Hvor det dukker opp

Ikke som en ny skjerm eier må huske å gå til. Før-kortet vises:

- i `/admin/innboks` for dagens økter
- automatisk når fangst startes på en spiller

Et før-kort eier må navigere til, blir ikke lest.

---

## 8. Instrumentering — hvordan vi vet om det virker

Piloten er verdiløs uten måling. Alt logges til `AgentRun`-mønsteret eller en
enkel hendelsestabell:

| Måling | Hvorfor | Suksess etter 2 uker |
|---|---|---|
| Sekunder fra app-åpning til opptak startet | Regel 4 | Median < 20 s |
| Andel økter med fangst | Blir det brukt i det hele tatt? | > 60 % |
| Andel fangster som blir godkjent | Er utkastene gode nok? | > 70 % |
| Sekunder brukt i godkjenningskortet | Regel 2 | Median < 120 s |
| Andel fangster som mistet data | Offline-jobben | 0 |
| Andel før-kort åpnet før økt | Blir tråden lest? | > 50 % |
| Transkripsjonsfeil på AK-termer | §9 | < 10 % |

Den viktigste er ikke i tabellen fordi den ikke kan telles: **klarer eier å holde
tråden mellom to økter uten å huske den selv?** Den måles ved å spørre etter to uker.

---

## 9. Talegjenkjenning — billig fiks først

`GOLF_PROMPT` i `src/lib/transcribe.ts` inneholder generiske golftermer på engelsk
(«swing path», «low point», «smash factor») og **null AK/MORAD-terminologi**.
Whisper har derfor ingen sjanse på «P6», «CS60», «L-BALL» eller «M2».

Fiks før spike: utvid glossaret med P1.0–P10.0, CS20–CS100, L-fasene, M0–M5,
PR1–PR5, AK-stigen og kategoriene A–K. Det er en strengendring.

**Deretter** spike: 10 ekte opptak fra rangen, mål feilrate på AK-termer. Er den
fortsatt høy, er neste steg etterbehandling som mapper lydlike treff til kanoniske
termer — ikke å bytte modell.

---

## 10. Spillere-flaten

Bygges **parallelt med** sløyfen (besluttet av Anders 2026-07-31). Anatomien under er
låst, ikke til diskusjon — den er allerede kritikk-passert.

Parallellkjøringen er trygg fordi sporene ikke deler avhengigheter: Spillere rører
hverken `LydSamtykke`, opptakskøen eller `PlanAction`. De eneste schema-endringene
Spillere trenger (`TradApning`, `Group.kind`) er additive og uavhengige av sløyfens
endringer, så de kan kjøres i samme `db execute`-runde uten å vente.

Den ekte flaskehalsen er Anders' oppmerksomhet, ikke koden: piloten krever daglig
godkjenning i to uker samtidig som Spillere trenger designavgjørelser.
**Prioriteringsregel ved kollisjon: piloten vinner.** Den har en klokke som går —
Spillere har ikke.

### Hva finnes

`/admin/spillere` med `loadStallen`-loader, `StallV2`-komponent, `SevChip`,
pyramide-akser. Auth via `requirePortalUser`. Datalaget er på plass.

### Hva må legges til

| Element | Status | Arbeid |
|---|---|---|
| To faner «Alle spillere» · «Alle grupper» | Mangler | `SegmentedTabs` finnes, gjenbrukes |
| Visningsvelger, 5 valg | `VisningsVelger` finnes, men låst til kalendertyper | Generaliser typen, ikke ny komponent |
| «Sist sjekket av meg» | Datamodell mangler | Ny tabell, se under |
| Filterchips | `FilterPills` finnes | Legg til fjern-knapp |
| Rad med tre trailing-elementer | Blokkert | Beslutning 8 |
| GroupCard, tre varianter | `Group.kind` mangler i schema | Additivt felt |
| Gruppert liste kun ved Behov | Ny | `ListGroup` må lages |

### Ny modell for «Sist sjekket av meg»

```prisma
model TradApning {
  id       String   @id @default(cuid())
  coachId  String
  spillerId String
  apnetAt  DateTime @default(now())

  @@unique([coachId, spillerId])
  @@map("trad_apninger")
}
```

Skrives kun når **Tråd-fanen** åpnes, ikke profilen. Upsert på `apnetAt`.

### Group.kind

```prisma
// tillegg til Group
kind String @default("adhoc")  // kontrakt | program | adhoc
```

WANG-gruppene settes til `kontrakt`, Junior Academy til `program`. Da har
GroupCard en ekte datakilde i stedet for gjetting på navn.

---

## 11. Åpne beslutninger — lukket med anbefaling

**8. `trailing="compound"` på ListRow vs midlertidig SpillerRad**

Anbefaling: **utvid ListRow**. `meta` tar allerede `React.ReactNode`, så en
`SpillerRad` ville i praksis bare vært en wrapper som stapper tre ting inn i ett
slot og kjemper mot `.ak-row__meta`-CSS-en. Legg til:

```ts
/** Flere trailing-elementer i fast rekkefølge: badge → metrikk → chevron. */
trailing?: { badge?: React.ReactNode; metrikk?: React.ReactNode };
```

`meta` beholdes uendret, så ingen eksisterende bruk brekker. CSS-en får én ny
regel i `golfdata.css`. Dette er timer, ikke dager, og fjerner en midlertidig
komponent som ellers ville levd i to år.

**9. Kan en ad hoc-gruppe forfremmes til program?**

Anbefaling: **ja, men ikke nå.** Med `kind` som felt er forfremmelse en
oppdatering av én kolonne. Men program-varianten viser fordeling på AK-stigen,
som krever at medlemmene har stige-nivå. Bygg forfremmelsen når det finnes en
ad hoc-gruppe som faktisk skal forfremmes — ikke før.

**10. Gjelder invariant 1 for samtykkegating?**

Anbefaling: **nei.** Invariant 1 sier at ingenting blokkerer trening. Samtykke
blokkerer ikke trening — det blokkerer opptak. Fangst uten samtykke er ikke
tilgjengelig i det hele tatt. Dette er det eneste unntaket, og det bør skrives
inn i `BUSINESS-RULES.md` så det ikke diskuteres på nytt.

**11. Hvor lenge lagres lyd?**

Anbefaling: **slettes når transkripsjonen er godkjent, maks 30 dager.** Vi trenger
teksten, ikke lyden. Med mindreårige er kortest mulig lagring det eneste
forsvarlige. Må inn i personvernerklæringen før pilot.

**12. Hva skjer med en fangst eier aldri godkjenner?**

Anbefaling: **den forfaller etter 14 dager** og markeres REJECTED med grunn
«ikke behandlet». En kø som bare vokser, blir ikke lest. Det er samme
mekanisme som gjør at innsikten dør i dag.

---

## 12. Prioritert komponentrekkefølge

To spor som går parallelt. Innenfor hvert spor er rekkefølgen valgt slik at hvert
steg kan testes alene, og slik at det som kan miste data kommer før det som bare
ser pent ut.

**Felles først — én runde schema-endringer**

Alle fire additive endringene kjøres i samme `db execute`-runde, så vi rører
databasen én gang i stedet for fire:
`LydSamtykke` · `PlanAction.sjekkpunkt` + `.fangstId` · `TradApning` · `Group.kind`

### Spor A — sløyfen (har klokke, vinner ved kollisjon)

1. Samtykkegating i `/api/recording/start` (blokkerer all fangst)
2. AK-glossar i `transcribe.ts` (strengendring, gjør før spike)
3. `--handling`-token + gate i `verify` (deles med spor B — gjør her)
4. Talegjenkjenning-spike, 10 ekte opptak
5. IndexedDB-kø for lydbiter (høyest risiko — gjør tidlig)
6. Fangst-skjermen, redesignet
7. Godkjenningskortet i `/admin/queue`
8. Før-kortet i `/admin/innboks`
9. Instrumentering
10. Pilot bølge 1

### Spor B — Spillere (ingen klokke, ingen avhengighet til spor A)

11. `ListRow.trailing`
12. Generalisert `VisningsVelger` + `ListGroup`
13. Spillere-flaten, fanen «Alle spillere»
14. `GroupCard`, tre varianter
15. Spillere-flaten, fanen «Alle grupper»

Eneste berøringspunkt mellom sporene er `--handling`-tokenet (punkt 3). Det gjøres
i spor A fordi sløyfen trenger det først, og spor B arver det.

Alt etter punkt 15 venter på pilotresultatet. Bevisst.

---

## 13. Selvverifikasjon

**Mot produktreglene**

| Regel | Status |
|---|---|
| 1. Én oransje primærhandling | ✓ Håndheves av `--handling` + gate. Alle tre skjermene har nøyaktig én |
| 2. Systemet forfatter, eier godkjenner | ✓ Observasjon, øvelse, sjekkpunkt og melding er alle forhåndsutfylt |
| 3. Ingen tom skjerm | ✓ AK-formelen forhåndsutfylles, meldingen forhåndsutfylles, hurtigtaggene genereres |
| 4. Fangst < 20 s, én hånd, 56 px, offline, samtykke | ✓ Spesifisert, men **20 s er ikke bevist** — det er en pilotmåling, ikke et løfte |
| 5. «Hvorfor dette tallet» | ✓ Leser `provenance`, som allerede finnes på `Signal` og `PlanAction` |
| 6. Maks fem arbeidsflater | ✓ Ingen nye navigasjonspunkter. Alt lever i Innboks, Kø og Spillere |
| 7. Norsk, rolig, presist | ✓ |

**Mot GDPR**

Samtykke er hard gate på server, ikke bare klient. Ordlyden lagres som kopi.
Trukket samtykke sletter. Lyd slettes etter godkjenning. Foresatt-e-post krever
verifisering. **Åpent:** personvernerklæringen må oppdateres før pilot — ikke
dekket av dette dokumentet.

**Mot offline**

IndexedDB før nett, ærlig tilstandsvisning, kø tømmes ved oppstart. **Dette er
den svakeste delen av spesifikasjonen** — den må valideres med en ekte test i
flymodus på rangen, ikke i devtools.

**Mot ListRow-kontrakten**

`trailing` er additivt. `meta`, `unread` og `chevron` uendret. Ingen av de fem
filene som bruker ListRow i dag påvirkes.

**Mot kodebasen**

Alle referanser til filer, modeller og felter i dette dokumentet er lest
2026-07-31. Fire schema-endringer foreslås, alle additive, alle kjøres med
kirurgisk `db execute` per gotchas.

**Det jeg ikke har dekket, og som du bør vite:**

- Fase 0-infrastrukturen. Kjøres i egen økt. **DKIM blokkerer samtykke, som
  blokkerer fangst.** Den avhengigheten er reell.
- Redesign av de øvrige flatene utover Spillere. Bevisst utelatt — det er
  nøyaktig de 223 skjermene final_instruction advarer mot.
- Kostnadsestimat for Whisper på pilotvolum.
