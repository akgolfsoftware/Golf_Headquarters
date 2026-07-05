# AK Golf HQ — Business Rules

**Dette er ENESTE fasit for låste produktbeslutninger.** Andre dokumenter (`CLAUDE.md`, `AGENT-BRIEF.md`, `PLATFORM-PRD.md`) gir kun et sammendrag og peker hit. Ved konflikt vinner denne fila. Nye låste regler legges KUN her — ikke dupliser til andre filer.

Dokumenterer forretningsregler som ikke kan utledes fra kode alene.
Sist oppdatert: 2026-06-14.

> ⚠ **Status per 2026-07-06** (fulgte opp 2026-06-22-opplåsingen, se `docs/REGLER-OPPLAST-2026-06-22.md`
> for full historikk): 3 av 4 daværende «låst opp»-regler er nå **avklart og bygget** — tema-toggle
> (AgencyOS lys/mørk-bryter), abonnement/pris-modell (300 kr/mnd, ingen årlig — se under) og cockpit
> stall-SG/plan-etterlevelse. Kun **FYS-formel + A–K-nivåtall** har én gjenstående deltråd: onboarding
> steg 6 og en beslutning om drill-retag mellom gammelt HCP-basert og nytt snittscore-basert A–K.
> Seksjonene under i denne fila er oppdatert til å reflektere den faktiske, bygde tilstanden.

---

## Abonnement og tilgang til PlayerHQ

### Gratis tilgang — tre eksakte tilfeller

1. **Prøveperiode:** 1 måneds gratis tilgang etter registrering.
2. **Coaching-pakke:** Spiller har aktiv Performance- eller Performance Pro-pakke.
3. **Gruppe via AK Golf:** Spiller er medlem av en gruppe administrert av AK Golf.

### Betalt tilgang

- **300 kr/mnd** for alle som ikke faller inn under de tre gratis-tilfellene.
- Betaling via Stripe. Abonnement lagres i `Subscription`-tabellen.

### Coaching-pakker (IKKE app-nivåer)

| Pakke | Credits/mnd | Hva det er |
|---|---|---|
| Performance | 2 credits | Coaching-pakke — antall coachet økter |
| Performance Pro | 4 credits | Coaching-pakke — antall coachet økter |

- Performance og Performance Pro er **coaching-pakker**, ikke app-tilgangsnivåer.
- De skal **aldri** vises som app-nivå i UI (hverken som tekst, chip, badge eller gate).
- Spiller booker coachet økt fra PlayerHQ-profilen og trekker ett credit.

### ELITE — finnes ikke i UI

- `ELITE` eksisterer som verdi i Prisma-enum `Tier`, men er et **dødt enum**.
- `ELITE` skal **aldri** vises i UI — hverken som tekst, chip, badge, tier-pill, gate eller filter.
- Samme forbud gjelder all kode som renderer `tier`-verdier.

### Tier-pill i hero (PlayerHQ)

- Tier-pill viser **«PlayerHQ · {tier}»** (+ «· HCP {hcp}» på desktop).
- `{tier}` er `GRATIS` eller `PRO` — aldri `ELITE`, aldri «Performance», aldri «Performance Pro».
- Performance/Performance Pro er coaching-pakker og tilhører ikke app-pillen.

---

## SG-kalibrering (Strokes Gained)

Alle fire SG-kategorier er kalibrert mot kjente referansekilder og godkjent av Anders 2026-06-10.
Implementasjon: `src/lib/domain/sg.ts`.

### Benchmark-kilder per kategori

| Kategori | Beskrivelse | Kilde |
|---|---|---|
| **OTT** (Off the Tee / driving) | Forventet slag fra tee etter distanse | Mark Broadie, «Every Shot Counts» (2014), PGA Tour Top 40-baseline |
| **APP** (Approach to Green) | Forventet slag fra fairway/rough etter distanse | Mark Broadie, «Every Shot Counts» (2014), PGA Tour Top 40-baseline |
| **ARG** (Around the Green) | Forventet slag fra nærspill etter distanse | Mark Broadie, «Every Shot Counts» (2014), PGA Tour Top 40-baseline |
| **PUTT** | Forventet slag per puttavstand | Team Norway IUP Ref-ark 2025 (NGF/Team Norway-fasit) |

### Fortegnskonvensjon

- **Positivt SG-tall** = over benchmark (bedre enn referanse).
- **Negativt SG-tall** = under benchmark (dårligere enn referanse).

### Kalibreringsdetaljer PUTT

- 1 meter → forventet 1,13 slag (tidligere feil: 1,85).
- Referanse: `team-norway-iup-2025.xlsx`, fanen «Ref», meter-intervaller 0–18 m.

### Status

- `skip = false` på alle SG-tester.
- 168/168 tester grønne etter kalibrering 2026-06-10.

### Visningsenhet for putt-avstand (bekreftet 2026-07-06)

- Putt-avstand vises i **fot (ft)** i alt brukergrensesnitt — aldri meter som primærenhet.
  Meter kan vises som forklaring/sekundærverdi der det er nyttig, ikke som standard.
- Dette er en **visningsregel**, ikke en re-kalibrering: selve datafangsten og
  `BENCHMARK_PUTT`-tabellen i `src/lib/domain/sg.ts` forblir meter-indeksert internt (kilden er
  Team Norway IUP-referansen, målt i meter). Kun det brukeren ser konverteres til fot.
- Matcher repoets egen ordbok (`docs/ordbok-ak-golf-konsept.md`: «Putting ALLTID i fot (ft), aldri
  meter», MasterBrain CANON v3.5) — koden har foreløpig ikke fulgt denne regelen overalt.
- Gjenbruk `meterTilFot()` fra `src/lib/min-golf/format.ts` — ikke lag en ny konverterer.

---

## Booking-regler

### Lokasjon vs Fasilitet

- **Lokasjon** = parent-enhet (f.eks. GFGK Golf Club, AK Golf Academy).
- **Fasilitet** = child-enhet under lokasjon (f.eks. Performance Studio, Simulator Bay 1).
- Booking skjer mot Lokasjon (påkrevd). Fasilitet (facilityId) er valgfritt — brukes der bookingen er koblet til et spesifikt rom/range/simulator. Drop-in kan være uten fasilitet.
- `Booking.facilityId` er valgfri referanse; `Booking.locationId` er påkrevd.

### Booking og credits

- Coaching-bookinger mot credits trekkes fra `Subscription.creditsRemaining`.
- Spiller booker selv fra sin PlayerHQ-profil (`/portal/booking`).
- Coach kan booke på vegne av spiller fra AgencyOS (`/admin/bookinger/ny`).

### Dobbelbooking-sperre

- Unik constraint `booking_no_double_slot` på `(coachId, startAt, serviceTypeId)` i `Booking`-tabellen hindrer at samme coach har to bookinger i samme slot for samme tjenestetype.

---

## Live-økt dual-track

To separate live-systemer sameksisterer **bevisst** og skal **ikke merges uoppfordret**.

| Spor | Tabell | Rute | Use case |
|---|---|---|---|
| **Spor A** | `TrainingPlanSession` | `/portal/live/[sessionId]` | Spillerens selvstyrte treningsøkt fra egen plan |
| **Spor B** | `TrainingSessionV2` | `/admin/live/[sessionId]` + Workbench | Coachens styrte økt med spiller |

- Spor A og B er to forskjellige use cases med separate datamodeller.
- Workbench er primærpunktet for planlegging i Spor B — planlegge er ett trykkpunkt dit, ikke en meny.

---

## Demo-data vs ekte data

### Demo-spiller (PlayerHQ-screenshots og seed)

- **Navn:** Øyvind Rohjan
- **E-post:** `screentest@akgolf.test`
- Brukes kun i `scripts/seed-screentest.ts` og screenshot-testing.
- Skal **aldri** dukke opp som data i AgencyOS-seed eller produksjonsmiljø.

### Demo-coach

- **Navn:** Anders Kristiansen (Anders selv)
- Brukes i demo-kontekst og AI-genererte planeksempler.

### Avatar-initialer

- Initialer (f.eks. «ØR» for Øyvind Rohjan) **avledes fra ekte navn i DB** — aldri hardkodet.
- Designfasiten hardkoder «MB» (levning fra gammelt navn Markus Berg) — det skal IKKE kopieres til kode.

### Ekte coach på markedssider

- **Markus Røinås Pedersen** er en ekte, navngitt coach på markedssidene.
- Dette er en **ekte person**, ikke demo-data.
- Hans navn, profil og innhold skal **aldri** erstattes med demo-navn eller endres uten eksplisitt instruksjon.

### Coach-stall seed

- Script: `scripts/seed-screentest-coach.ts`
- Seeder 38 spillere, er idempotent (trygt å kjøre flere ganger).

---

## FYS-testresultat-formel

- **Formelen er bygget og live** (`src/lib/domain/fys-score.ts`), godkjent av Anders 2026-06-22.
  Vekter: markløft 100 % · benkpress 100 % · stille lengde 50 % · ballkast 16,6 % · CHS 100 %.
  Stall-relativ scoring (beste spiller i stallen = 100) — ingen faste normverdier hardkodet.
  Vises i PlayerHQ Helse (`/portal/meg/helse`) som FYS-SCORE 0–100.
- **Gjenstår (ikke selve formelen):** onboarding steg 6 (nivå-visning ved førstegangsoppsett) og
  en beslutning om hvordan gammelt HCP-basert A–K og nytt snittscore-basert A–K skal henge sammen
  i drill-filtrering (`kategoriFraHcp` vs. `kategoriFraSnittscore` gir ulik bokstav i dag).
- A–K-kategoriene selv (11 nivåer, snittscore-basert) er bygget og i bruk (`src/lib/domain/ak-kategori.ts`).

---

## Adressestruktur

| Adresseprefiks | Produkt | Målgruppe |
|---|---|---|
| `/portal` | PlayerHQ | Spiller (utøver) |
| `/admin` | AgencyOS | Coach (intern admin) |
| `/booking` | Booking-flyt | Alle (spiller + gjest) |
| `/(marketing)` / `/` | Offentlige markedssider | Alle (ikke autentisert) |

- AgencyOS het tidligere «CoachHQ» — dette navnet skal **ikke** brukes i ny UI-tekst.
- Alle fire produkter deler én Postgres-database via Prisma og én Supabase-instans.

---

## GDPR og mindreårige

### Soft-delete

- Bruker markeres med `deletedAt = now()` ved kontosletting (soft-delete).
- Cron-jobb `/api/cron/cleanup-deleted-accounts` sletter raden permanent etter 30 dager.
- Aldri slett brukere direkte uten soft-delete-steget.

### Mindreårige og foreldresamtykke

- Norge: 16 år er aldersgrensen for selv å samtykke til behandling av persondata (GDPR art. 8).
- Brukere under 16 har `requiresGuardianConsent = true`.
- Foreldresamtykke registreres via `guardianConsentGivenAt` og `guardianConsentByUserId`.
- Mindreårige uten godkjent samtykke sendes til `/auth/samtykke-venter`.

---

## Spiller-status og permisjon

- Aktiv spiller: `userStatus = AKTIV`.
- Ved permisjon eller skade: `userStatus = PERMISJON` eller `SKADET` → abonnement settes på pause.
- Return-to-play-protokoll aktiveres automatisk ved `SKADET`-status.
- `INAKTIV` brukes for lengre pause (over 6 måneder) — historikk beholdes.

---

## Pyramide-fordeling (treningsplan)

AK Golf Academy bruker en 5-trinns trenings-pyramide:

| Nivå | Kode | Beskrivelse |
|---|---|---|
| 1 | FYS | Fysisk trening |
| 2 | TEK | Teknisk trening |
| 3 | SLAG | Slagøvelser |
| 4 | SPILL | Spilltrening |
| 5 | TURN | Turneringsspill |

- En plan setter idealfordeling (summerer til 1,0).
- Faktisk fordeling beregnes fra gjennomførte økter.
- Avvik rapporteres per kategori og vises som anbefaling i UI.
- Implementasjon: `src/lib/domain/pyramid-weighting.ts`.

---

## Tema per produkt

| Produkt | Tema | Kan endres av bruker? |
|---|---|---|
| PlayerHQ (`/portal`) | Alltid **lyst** | Nei — fast |
| AgencyOS (`/admin`) | **Lyst/mørkt, brukervalgt** | Ja — sol/måne-bryter i topbar, standard mørk |

- **Oppdatert 2026-06-22:** AgencyOS har en lys/mørk-bryter (`admin-theme-toggle.tsx`), valget
  persisteres i cookie `ak-admin-theme` og leses server-side i `AdminShell` (ingen flash).
  Coach-chrome (sidebar/topbar) er alltid forest uansett tema — kun arbeidsområdet bytter.
  PlayerHQ er uendret: fortsatt fast lyst, ingen bryter.
- Begge paletter finnes i `globals.css`.

---

## Planlegging og Workbench

- All planlegging for spiller går gjennom **Workbench**.
- «Planlegge»-knappen er **ett trykkpunkt** til Workbench — ikke en meny av valg.
- Workbench er delt kjerne: coachens endringer i sin spiller-Workbench propagerer til spillerens visning.
- Plan-status-flyt (DRAFT → PENDING_PLAYER → ACCEPTED/REJECTED → ACTIVE) håndteres via Workbench, ikke kanban-drag.

---

## Handicap-beregning (WHS)

- Algoritme: World Handicap System (WHS) 2020-spesifikasjonen.
- Tar siste 20 runder, beregner score-differensial per runde, sorterer stigende, tar snittet av de 8 laveste.
- Minimum 8 runder for full beregning — under 8 markeres som `lavBeregning = true`.
- Plusshcp (bedre enn scratch) vises med `+`-fortegn.
- Implementasjon: `src/lib/domain/hcp.ts`.

---

## Analyse samlet (ikke separate moduler)

- Analysere + TrackMan + Runder + SG er **én flate med faner** i PlayerHQ og AgencyOS.
- Mål bor i Oversikt og redigeres i Workbench.
- Separate moduler for disse er ikke tillatt.

---

## Benchmark-synkronisering (DataGolf)

- DataGolf-fasiter auto-oppdateres **mandager 08:00** via cron-jobb.
- Benchmark-sync kjøres via den generiske cron-ruten `/api/cron/[agent]` med agent-verdien `benchmark-sync`. Implementasjon i `src/lib/admin/benchmark-sync.ts`.
- Nye benchmarks må godkjennes av coach på `/admin/tester/benchmarks` før de tas i bruk.
- Push til `main`-branch deployer **ikke** produksjon automatisk — bruk `vercel deploy --prod`.
