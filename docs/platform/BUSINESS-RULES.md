# AK Golf HQ — Business Rules

**Dette er ENESTE fasit for låste produktbeslutninger.** Andre dokumenter (`CLAUDE.md`, `AGENT-BRIEF.md`, `PLATFORM-PRD.md`) gir kun et sammendrag og peker hit. Ved konflikt vinner denne fila. Nye låste regler legges KUN her — ikke dupliser til andre filer.

Dokumenterer forretningsregler som ikke kan utledes fra kode alene.
Sist oppdatert: 2026-08-17 (dato rettet — §Abonnement og tilgang er fra 2026-08-16; headeren sa 2026-06-14 og fikk fila til å se gammel ut).

> ⚠ **Status per 2026-07-06** (fulgte opp 2026-06-22-opplåsingen — historikken lever i git
> for full historikk): 3 av 4 daværende «låst opp»-regler er nå **avklart og bygget** — tema-toggle
> (AgencyOS lys/mørk-bryter), abonnement/pris-modell (299 kr/mnd, ingen årlig — se under) og cockpit
> stall-SG/plan-etterlevelse. Kun **FYS-formel + A–K-nivåtall** har én gjenstående deltråd: onboarding
> steg 6 og en beslutning om hvordan gammelt HCP-basert A–K og nytt snittscore-basert A–K skal henge sammen
> i drill-filtrering (`kategoriFraHcp` vs. `kategoriFraSnittscore` gir ulik bokstav i dag).
> Seksjonene under i denne fila er oppdatert til å reflektere den faktiske, bygde tilstanden.

---

## Abonnement og tilgang til PlayerHQ

> Oppdatert 2026-08-16 (Anders' beslutninger i hovedplanen): tilgang har nå TRE nivåer —
> FULL, TALENT (gratis låst profil) og INGEN. Eneste sannhetskilde i kode:
> `resolveTilgang` i `src/lib/feature-flags.ts`.

### FULL tilgang gratis — fire eksakte tilfeller

1. **Prøveperiode:** 1 uke full app, **starter i Stripe og krever kort**
   (Anders 2026-08-29). Går automatisk over til betaling på dag 8 med mindre
   spilleren sier opp. Kun ved FØRSTE PlayerHQ-abonnement.
   - **Registrering gir ingen prøve av seg selv.** Den gamle regelen
     (`createdAt` + 30 dager, uten kort) er FJERNET fra `resolveTilgang`.
     Nye spillere opprettes med `profilType = "TALENT"` og lander på
     gratisnivået — aldri INGEN.
   - `User.trialEndsAt` består som manuell overstyring (gitt tilgang,
     forlengelse, opprydding). Det er nå eneste vei til kilde `PROVEPERIODE`.
   (`User.trialEndsAt` kan forlenge/forkorte per bruker).
2. **Coaching-pakke:** Spiller har aktiv Performance- eller Performance Pro-pakke.
   **Oppsagt pakke gir tilgang UT den betalte perioden.**
3. **Gruppe via AK Golf:** Spiller har AKTIVT spiller-medlemskap (`GroupMember.endedAt`
   null) i en AK Golf-administrert gruppe (`Group.managedByAkGolf` — GFGK-stigen,
   WANG Toppidrett, WANG UNG, AK Golf Academy, AK Golf Junior Academy).
4. ~~**Lanseringsvinduet:** alle frem til 1. september 2026 (`gratisForAlle`)~~ **UTLØPT
   01.09.2026** (verifisert i kode 02.09.2026: `BETALING_STARTER` er satt til
   `2026-09-01T00:00:00+02:00` i `src/lib/feature-flags.ts`, `gratisForAlle(now)` returnerer nå
   alltid `false`). De tre gjenstående veiene over (prøveperiode, coaching-pakke, AK-gruppe) er
   de eneste aktive fra og med 2. september.

### TALENT — gratis, låst profil (Anders 2026-08-16)

- `User.profilType = "TALENT"` (TalentHQ-inngangen: `?kilde=talenthq`-registrering eller
  gruppe-invitasjon). Utløper aldri.
- ÅPENT: testbatteriet (CANON-protokollene), stats-/analyse-lesing, SG-/runderegistrering,
  DataGolf-sammenligning, talent-flatene, **booking av enkelttimer**, konto/abonnement.
- ALT annet låst med oppgraderingsvei. Håndheves FAIL-CLOSED i `requirePortalUser`
  (`kreverTilgang`); rutekontrakten står i `src/lib/auth/talent-allowlist.ts`.
- Kjøper spilleren abonnement eller meldes inn i AK-gruppe, vinner FULL automatisk.

### Betalt tilgang

- **299 kr/mnd** eller **2 690 kr/år** (Anders-beslutning 2026-08-16 — årsprisen ER nå
  kanon: «tre måneder gratis — spar 898 kr»; 299 × 9 = 2 691).
- Betaling via Stripe. Abonnement lagres i `Subscription`-tabellen — én rad per
  `(userId, kind)` der kind er `COACHING` eller `PLAYERHQ` (siden 2026-08-16 kan en
  spiller ha begge samtidig).

### Vinn-tilbake ved coaching-oppsigelse (Anders 2026-08-16)

- Når coaching-pakken sies opp (i appen, Billing Portal eller Stripe-dashbordet), får
  spilleren AUTOMATISK tilbud om å beholde PlayerHQ til 299 kr/mnd eller 2 690 kr/år.
- Tilbudet vises som exit-skjerm ved oppsigelse og sendes på e-post (mindreårige:
  til godkjent foresatt — aldri barnet). Påminnelse < 7 dager før coaching-perioden
  utløper. Aksept gir nytt PlayerHQ-abonnement med `trial_end` = periodens slutt —
  **aldri dobbelbetaling**.
- Dette er et bevisst unntak fra «kun purring sendes automatisk»-regelen for e-post.

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

> **Design (ENDRET 25.08.2026 — Train-lock vinner alltid, Anders i økt):** Train-lock
> (`designsystem/train-lock/`) er eneste designfasit for ALLE skjermer i PlayerHQ og AgencyOS.
> Paper-låsen fra 03.08 er supersedert; Claude Paper (`605a48cc`) er historikk. Mangler en
> skjerm fasit: spør Anders. Ved konflikt mellom et dokument og Train-lock vinner Train-lock.
>
> **Token i kode (ny skjerm):** `--tl-*` / `TL` (`src/styles/train-lock-tokens.css`,
> `src/lib/v2/train-lock.ts`). Én primær CTA per skjerm (fill/on-fill). Fullført = warm.
> `T` / `--p-*` / `--v2-*` er utgående Paper-bro — ikke bruk i ny kode.
>
> **Palett:** Train-lock (scene `#000000` / lys `#FFFFFF`). Paper-cream og Presis-skog/lime
> er **ikke** fasit. Marketing har egen palett.
>
> Det under er beskrivelse av nåværende tema-oppførsel i kode, ikke en konkurrerende designkanon.

Nåværende oppførsel i kode: `/portal` og `/admin` er **mørke** som standard; `/auth` og
`/forelder` er lyse; landingssider alltid lyse. Cookie `ak-v2-tema` vinner over defaulten.
Implementasjon: `src/lib/v2/tema-default.ts` + `src/app/layout.tsx` + `src/components/v2/shell.tsx`.

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
- Push til `main`-branch deployer produksjon **automatisk** (git-integrasjonen koblet til ny GitHub-konto 10. juli 2026). Kjør ALDRI `vercel deploy --prod` manuelt — det omgår git-historikken og har overskrevet prod med feil branch.


---

## Presisjonsstrategi (strategimetodikken) — navne- og rettighetsregel

- Ordet **«DECADE» brukes ALDRI** i produktet: ikke i UI, hjelpetekster, marketing,
  app-store-tekster, SoMe eller kodekommentarer som kan nå kunder.
- Metodikken heter **«Presisjonsstrategi»** (Masterbrain CANON) i alt internt og eksternt.
- Alt strategiinnhold skrives fra AK-metodikkens egne dokumenter og plattformens egen
  dispersjonsmotor — aldri fra DECADE-materiale (kurs, tekster, yardage books).
- Full vurdering og sjekkliste: `docs/juridisk/presisjonsstrategi-rettigheter.md`.

---

## CANON-invariantene — de 13 (metodikk)

> **UTGÅTT (se `.claude/rules/beslutninger.md`, «ALLE TRENINGSPLANREGLER LÅST OPP», 2026-08-18):**
> all regel-håndheving i planlegging er slettet fra koden — `src/lib/canon/` og
> `canon-invariants-13.md` finnes ikke lenger i repoet. CANON som overstyrende fasit-begrep er
> pensjonert; L-fase (#4) og CS50-minimum (#2) er utgåtte begreper. Listen under er historikk.
> Club Speed (Anders, 2026-09-01): motorikk AUTO, «uten ball» er en egenskap ved øvelsen, ikke
> eget motorikk-steg — se `docs/ordbok-ak-golf-konsept.md` §3.

> Navngitt kanonisk liste (A4, forankret 2026-07-18). Kilde: `src/lib/masterbrain/rag-corpus/morad/canon-invariants-13.md`
> (CANON v3.5). **Invariantene er ANBEFALINGER som varsler ved avvik — aldri harde sperrer.**
> Ingenting i appen blokkerer trening; sterkt avvik vises i klarspråk og kan varsle coach.
> Pyramide-fordelingen (#1, #5) er coach-redigerbar per periode (`/admin/settings/periode-fordeling`).

1. **TEK ≥ minimum** — teknisk andel alltid over periodens minimum (coach-satt, standard grunn 25 % / turneringsfase 15 %). Teknikk forsvinner aldri helt.
2. **CS50-minimum for ballkontakt** — slag med ballkontakt krever ferdighetsnivå (CS) ≥ 50 %. Under: kun ren bevegelse uten ball.
3. **Junior volum-tak** — under 18: treningstimer per uke ≤ alder i år. Vern mot overbelastning.
4. **L-fase overstyrer alt** — læringsfasen har forrang over SG-data, turneringskalender og coach-input.
5. **Pyramide = 100 %** — fordelingen mellom FYS/TEK/SLAG/SPILL/TURN summerer til 100 %.
6. **SG krever teknisk plan** — et Strokes Gained-tiltak må kobles til en konkret teknisk plan, ikke stå som diagnose alene.
7. **Konfidens < 0,70 = retningssignal** — anbefalinger under 0,70 konfidens er hint, aldri definitive.
8. **Rough-baseline +0,15–0,25** — SG fra rough legger til 0,15–0,25 slag; aldri fairway-baseline for rough.
9. **Lav readiness → lavere PR + volum** — lav dagsform/restitusjon senker både intensitet og volum.
10. **Alle 5 APP-bånd med baseline** — alle fem APP-bånd må ha baseline før tiltaket settes i produksjon.
11. **Metrikker ≠ sjekkpunkter** — måltall og sjekkpunkter er separate felt; en måling er ikke en godkjenning.
12. **MORAD-feil → P-posisjon påkrevd** — sving-feil må lokaliseres til en P-posisjon (P1–P10), ikke bare beskrives.
13. **Anbefalings-format** — enhver anbefaling har fire ledd: why + what + expected_effect + why_now.

**Kode-håndhevelse:** #1–#5 og #cs-tak/#l-fase/#volum/#hviledager er implementert som rene funksjoner i
`src/lib/canon/invarianter.ts` (9 invarianter, testet). #6, #7, #8, #11, #12, #13 bor foreløpig i
AI-coach-kunnskapen (retningsgivende), ikke som validerings-funksjoner — et kjent gap hvis full
kode-håndhevelse av alle 13 ønskes senere.
