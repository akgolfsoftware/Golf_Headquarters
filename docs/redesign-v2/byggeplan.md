# Byggeplan — v2 til kode (eksekverbar ved «godkjent»)

Konkret plan for fase 6. Starter i det Anders har godkjent skjermene. Kilde = de godkjente
mockupene i Claude Design (`ui_kits/v2/`); mål = diff-til-null i appen. Ingen datalag-endring
utenom de to eksplisitt additive (utviklingsplan-merge, fysisk-logging).

## STEG 0 — Fundament (én gang, før første skjerm)

0.1 **Branch:** `redesign/v2` fra `main`. Alt bygges her; merge til main bølge for bølge.
0.2 **Golden masters:** kjør fersk skjermbilde-pakke av alle godkjente mockups (desktop+mobil)
    → `docs/redesign-v2/golden/<skjerm>-<device>.png`. Dette er diff-fasiten.
0.3 **Tokens til repo:**
    - `src/styles/v2-tokens.css` ← `tokens/v2/tokens.css` (verbatim, `:root` CSS-variabler).
    - `src/lib/v2/tokens.ts` ← TS-speil av mockupens `T`-objekt (samme verdier; typed).
    - Importér `v2-tokens.css` i `globals.css` (additivt, rører ikke eksisterende `--cream` osv).
0.4 **Komponent-lag:** `src/components/v2/` — port hver mockup-komponent til TypeScript:
    én fil per komponent, typed props (fra `.jsx`-signaturene), inline styles fra `tokens.ts`
    (1:1 med mockup — raskeste vei til diff-null; Tailwind kun for layout-utilities).
    Familier: `core/`, `data/`, `kalender/`, `domene/`, `skjema/`, `overlays/`, `struktur/`,
    `spesialviz/`, `fysisk/`, `utviklingsplan/`, `wb/`. `Icon` = eksisterende Lucide-wrapper.
0.5 **Hjelpetekster:** `src/lib/v2/hjelpetekster.ts` — «?»-innhold ett sted (SG/ACWR/CS/L-fase/…).
0.6 **Konsistens-vakt:** utvid `scripts/check-no-hex.mjs` → nekt rå hex utenfor tokens,
    lime på opp/ned-data, ulovlige radier/størrelser. Legg i `npm run verify`.
0.7 **Grønt-krav:** `npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build`.
    Ingen skjerm bygges før 0.1–0.6 er grønt.

## STEG 1–6 — Bølger (hver: bygg → verifiser → Vercel-preview → Anders godkjenner → merge)

**Per skjerm, done-kriterier (alle grønne før neste):**
- Rekomponert 1:1 fra godkjent mockup, KUN fra `src/components/v2/` (gap → meld, aldri ad-hoc).
- Ekte data via eksisterende loaders/server-actions (ingen skjema-endring her).
- «?»-hjelp + ordbok (aldri egne ord); norsk bokmål æøå.
- `npm run verify` + eslint + `npm test` grønt; `npm run dev` uten warnings.
- Skjermbilde-diff mot golden master (desktop+mobil) → diff ≈ 0. Dataliv aktiveres her.
- ak-designekspert-dom ≥9 (wireframe + 6 akser).
- MASTER-SKJERMPLAN-rad (6 haker) oppdatert i samme commit.

**Bølge 1 — PlayerHQ kjerneløkka** `src/app/portal/**` + `src/components/portal/**`
Hjem (`portal/page.tsx`→HybridHomePage), Plan, Gjør/Live, Analysere (5 faner, TrackMan per
kølle), Meg, Kalender (dag/uke/måned/år), Økt-detalj. Loaders finnes (getDashboardData,
loadMinGolf, hentTreningsanalyse). URL-tab-state på Analysere (`?tab=`).

**Bølge 2 — Workbench** `src/components/workbench-hybrid/` (rolle player|coach)
Tidslinje-ukekalender, bibliotek m/ ukemaler, Balanse-panel (Neste viktig/ACWR/SG), palett
m/ smart-default, «Foreslå uke»/«Gjenta forrige uke», mal-forhåndsvisning, DnD (session-move-
math finnes), gjentakelse, publiser, plan-kvalitet (validatePlan finnes).
+ **Fysisk logging** (D2): SettRepsLogger/TonnasjeHero/IntervallBlokk/PulsSoneVelger; fysisk
plan → dra økter til kalender → logg vekt×reps → økt-total → ACWR. Data: `FysOkt`/`FysOvelseRad`
finnes; legg til logging-felter additivt (CREATE TABLE IF NOT EXISTS via tsx).
+ **Utviklingsplan-merge** (D2): én Utviklingsplan-skjerm (spiller `portal/tren/teknisk-plan`
+ coach `admin/spillere/[id]/plan`) som samler TalentTracking-radar + TechnicalPlan P1–P10;
strukturert `Milestone`-modell additivt (erstatter TalentTracking JSON-blob).

**Bølge 3 — AgencyOS** `src/app/admin/**`
Cockpit, Stall/Spillere, Triage/Innboks, Kalender m/ gjentakende serier, Grupper m/
egentrening-vindu. Recurrence-editor + gruppe-datamodell (additivt om nødvendig).

**Bølge 4 — Øvelsesbank + booking + DataGolf + tester**
Øvelsesbank (hero-bilde/video, alle AK-formel-parametere, nivåanbefaling, A–K-tilpasning,
fysiske øvelser) — `ExerciseDefinition`-modellen finnes. Booking (fra PlayerHQ + admin) —
`ServiceType`/`Location`/`Booking`/Stripe finnes (også i akgolf-booking-repoet). DataGolf
(BrukerSammenligning) + tester-scorekort (TestDefinition/TestResult).

**Bølge 5 — Auth · onboarding · profil · innstillinger · forelder**
Login/BankID/Google, onboarding m/ profilbilde-opplasting + ambient (storage-bucket finnes),
MinProfil, Innstillinger (299 kr-kanon), forelder-flatene. getCurrentUser-consent-gate respekteres.

**Bølge 6 — Marketing** `src/app/(marketing)/**`
Forside, coaching (Markus Røinås Pedersen), playerhq, priser, booking, anlegg, stats.

## Verifiserings-pipeline (per skjerm, automatiserbar)

1. `npm run verify` (prisma/tsc/build) + eslint + `npm test`.
2. `scripts/route-shot.mjs <rute>` desktop+mobil → diff mot `golden/`.
3. ak-designekspert-skill dømmer; <9 → fiks → re-dømm (maks 3, ellers eskaler Anders).
4. Commit m/ MASTER-SKJERMPLAN-oppdatering. Bølge ferdig → Anders godkjenner → merge til main → Vercel deploy.

## Datamodell-tillegg (kun disse, additivt — gotcha-regelen)

- `Milestone` (utviklingsplan-merge) — strukturerte milepæler m/ status/krav.
- Fysisk-logging-felter på `FysOvelseRad` (vekt/reps/sett-logg) + økt-total (tonnasje/volum).
- Evt. gruppe-/recurrence-felter for AgencyOS-kalender.
Alle via `CREATE TABLE IF NOT EXISTS`/`ADD COLUMN IF NOT EXISTS` i tsx mot DIRECT_URL,
deretter `prisma generate`. ALDRI `migrate dev`/`db push`. Zod-validering på JSON-felter.

## UTSATT til post-lansering/beta

AI-golf-coach (agent-ekspertene + video-analyse). Arkitektur klar i `ai-coach-arkitektur.md`.

## Oppstart ved «godkjent»

Kjør STEG 0 (branch + tokens + komponent-lag + vakt + golden masters) → start Bølge 1,
skjerm for skjerm mot done-kriteriene → Vercel-preview til Anders → merge. Deretter Bølge 2 osv.
