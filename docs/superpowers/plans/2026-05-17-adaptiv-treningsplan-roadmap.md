# Adaptiv treningsplanlegging — Systemarkitektur og roadmap
**Dato:** 2026-05-17  
**Prosjekt:** akgolf-hq + ak-second-brain  
**Mål:** 1000+ spillere med personlige, adaptive treningsplaner

---

## Overordnet arkitektur

```
┌─────────────────────────────────────────────────────────────┐
│                   KUNNSKAPS-LAG (Vault)                     │
│  ak-second-brain: drills, MORAD-konsepter, forskning        │
│  ← Oppdateres av: web-søk, coaching-sesjoner, godkjenning  │
└────────────────────┬────────────────────────────────────────┘
                     │ vault-tools.ts (FERDIG)
┌────────────────────▼────────────────────────────────────────┐
│                 AI-PLAN-MOTOR (akgolf-hq)                   │
│  vault-tools.ts → context.ts → genererPlan()               │
│  ← Trigges av: coach, spiller selv, ukentlig cron          │
│  FERDIG: vault-tools, facility-context, context, system-prompt
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│               SPILLER-PORTAL (akgolf-hq)                    │
│  Fasilitetsregistrering, statistikk, selvbetjent plan       │
│  ← NESTE: UI + API for spillerdata                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Faglige prinsipper (AK Golf Academy, innkodet i systemet)

**Maks 2 hovedfokus per periode** — aldri la spiller velge 6 fokusområder.

**Norsk sesongperiodisering:**

| Fase | Periode | Fokus | Tekniske endringer OK? |
|---|---|---|---|
| Forberedelsesfase | Jan–mars | Teknikk, fysisk, sving-endringer | JA |
| Pre-sesong | April | Overgang, kortspill, rutiner | Begrenset |
| Konkurransefase | Mai–sept | Vedlikehold, mental, scoring | NEI (coach-override kreves) |
| Avslutningsfase | Oktober | Evaluering, refleksjon | Nei |
| Hvile/overgang | Nov–des | Hvile, alternativ trening | Nei |

**Treningspyramide (bunn til topp):**
1. Fundament (setup, grip, alignment, balanse)
2. Avstand + kontroll (fullswing, driver, tee-spill)
3. Konsistens (approach, iron play)
4. Scoring (short game, putting — 65% av slag = størst HCP-effekt)
5. Mental (konkurranse-robusthet — integreres i alle lag)

**Business-rules som systemet må håndheve:**
- Evalueringsintervall: minimum hver 8. uke
- Ingen tekniske sving-endringer i konkurransefasen uten coach-override
- Simulator-sesong (nov–mars): prioriter innendørstrening aktivt
- HCP-stagnasjon definisjon: ingen endring over 8 uker
- Turnering innen 3 uker: automatisk overgang til vedlikeholds-/mental-modus

---

## Komponent 1: Spillerprofil og fasilitetsregistrering (HØYEST PRIORITET)

**Hvorfor først:** Uten dette er alle planer generiske. SpillerFasiliteter-typen er allerede definert.

### 1A — Fasilitetsonboarding UI

Ny side: `/portal/innstillinger/trening`

**Felter:**
```
Basis:
- Treningstimer per uke (1–20)
- Treningsdager (checkboxes)
- Tidspunkt (morgen / ettermiddag / kveld / fleksibel)

Hjemmeklubb-fasiliteter:
- Driving range (ja/nei)
- Putting green (ja + estimert lengde i meter)
- Chipping area (ja/nei)
- Treningsbunker (ja/nei)
- Innendørs simulator (ja/nei)

Trackman:
- Ingen tilgang / Kun vinter / Helår

Sesongens mål:
- Neste HCP-mål (tall)
- Neste turnering (dato)
- Prioritert område (teknikk / scoring / mental / fysisk)
```

**Teknisk:** Lagres i `User.preferences.fasiliteter` som `SpillerFasiliteter` (allerede definert i preferences.ts).

### 1B — Statistikk-registrering

Frivillig, men gjør planen adaptiv:

```
Per runde (manuelt eller GolfBox-import):
- Dato, bane, score
- Fairway%
- GIR%
- Putts per GIR
- Up-and-down%

Per periode (estimat hvis ikke Trackman):
- SG:OTT (off the tee)
- SG:APP (approach)
- SG:ARG (around green)
- SG:PUTT

Fysisk:
- Skader/begrensninger (dropdown, ikke fritekst)
- Energinivå siste 2 uker (1–5)
```

**Teknisk:** Lagres i `Signal`-tabellen (allerede i DB). Ny `RoundLog`-tabell for per-runde-data.

### Plan-filer:
- `2026-05-17-player-self-service-plan.md` — allerede skrevet (dekker 1A + selvbetjent plan)
- Ny plan: `2026-05-18-statistikk-registrering.md`

---

## Komponent 2: Selvbetjent planlegging for spillere

**Allerede planlagt** i `2026-05-17-player-self-service-plan.md`.

**Kjerneregler (fra faglig review):**
- Rate-limit: 1 ny plan per spiller per uke
- Maks 2 fokusområder per plan
- Sesong-sjekk: hvis konkurransefase → behold vedlikeholds-modus som default
- Coach-varsling ved ny plan (ikke blokkerende)

**Ny endpoint:** `POST /api/portal/plan/generate`

---

## Komponent 3: Adaptiv plan-justering (signal-monitoring)

**Harde triggere — system foreslår endring automatisk:**

| Trigger | Terskel | Handling |
|---|---|---|
| SG-drop | -0.3 SG/runde i 2 påfølgende perioder | Forslag: øk fokus på svak kategori |
| HCP-stagnasjon | Ingen endring > 8 uker | Forslag: evaluer og juster plan |
| Treningstomrom | Ikke logget økt > 14 dager | Varsel til coach + forslag motivasjonsplan |
| Turnering nær | Turnering innen 3 uker | Automatisk: overgang vedlikeholds-/mental-modus |
| Ny skade | Registrert i profil | Umiddelbart: forslag tilpasset plan |
| Sesongskifte | 1. april, 1. mai, 1. oktober, 1. november | Automatisk sesongfase-overgang |

**Myke triggere — coach varsles, men ingen automatikk:**

| Trigger | Handling |
|---|---|
| Spiller melder "mestrer" 3x på rad | Forslag: eskaler vanskelighetsgrad |
| Coach logger OPPGAVE i coaching session | Oppdater plan med ny drill |
| SG-fremgang: svakeste kategori ikke lenger svakest | Forslag: ny prioritering |
| Fasilitetsendring (sesongstart utendørs) | Forslag: oppdater plan med bane-trening |

**Arkitektur:**

```
Ukentlig cron (mandag kl 07:00): /api/cron/plan-monitor
  For hver aktiv spiller med signal-data:
    1. signal-analysis.ts: beregn trend per SG-kategori
    2. Sjekk alle harde triggere
    3. Hvis trigger: genererPlan() med kontekst om årsak
    4. Lagre forslag i PlanAdjustmentProposal-tabell (ny)
    5. Notify coach: iMessage + Notion-kommentar

Coach-visning: /coach/[spillerId]/plan-forslag
  - Liste over aktive forslag
  - GODKJENN → aktiver ny plan
  - TILPASS → åpne i plan-editor
  - AVVIS + notat
```

**Nye filer:**
- `src/lib/ai-plan/signal-analysis.ts`
- `src/app/api/cron/plan-monitor/route.ts`
- `prisma/migrations/XXXX_plan_adjustment_proposal.sql`
- `src/app/(coach)/coach/[spillerId]/plan-forslag/page.tsx`

---

## Komponent 4: Internett-drevet drillbibliotek-oppdatering

**Arkitektur:**

```
Ukentlig cron (søndag kl 20:00):
  skill: drill-discovery
    → WebSearch: 8–10 søk mot kvalitetskilder
    → Filtrer: MORAD-kompatibel / ny / relevant
    → Tagg: MORAD-kompatibel | Generisk | Potensielt konflikt
    → Opprett staging: raw/drill-staging/YYYY-MM-DD.md
    → Opprett Notion-oppgave i "Drill-kø" DB

Anders godkjenner i Notion:
  → Webhook/cron sjekker status
  → Godkjent: skill: drill-ingest
      → Legg til i wiki/concepts/morad-drill-bibliotek.md
      → Oppdater index.md + log.md + git push

Avvist: arkiver i raw/drill-avvist/ med begrunnelse
```

**Kvalitetskilder:**
- MORAD (primær): ak-second-brain vault (allerede inne)
- Forskning: MyGolfSpy, Golf Science Lab, PubMed ("golf swing kinematics")
- Strategi: DECADE Golf (Scott Fawcett) — banemanagement
- Generisk (terstiær): Golf Digest, PGA.com — kun MORAD-kompatible elementer

**Tagge-regel:** Alle drills tagges med:
- `kilde: morad-vault | web-forskning | web-generisk`
- `morad-kompatibel: ja | nei | usikker`
- `sesongfase: forberedelsesfase | alle | ikke-konkurransefase`

**Nye filer:**
- `~/.claude/skills/drill-discovery.md`
- `~/.claude/skills/drill-ingest.md`
- Notion DB: "Drill-kø" (navn, kilde, kompatibilitet, status, URL)

---

## Datamodell-utvidelser (Prisma/Supabase)

```prisma
// Ny: per-runde logging
model RoundLog {
  id          String   @id @default(cuid())
  userId      String
  date        DateTime
  course      String?
  score       Int?
  fairwayPct  Float?
  girPct      Float?
  puttsPerGir Float?
  upAndDownPct Float?
  sgOtt       Float?   // Off the tee
  sgApp       Float?   // Approach
  sgArg       Float?   // Around green
  sgPutt      Float?   // Putting
  notes       String?
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}

// Ny: plan-endringsforslag fra signal-monitor
model PlanAdjustmentProposal {
  id          String   @id @default(cuid())
  userId      String
  triggerKind String   // "SG_DROP" | "HCP_STAGNATION" | etc.
  triggerData Json
  proposal    Json     // PlanForslag-struktur
  status      String   @default("PENDING") // PENDING | APPROVED | REJECTED | MODIFIED
  coachNote   String?
  createdAt   DateTime @default(now())
  reviewedAt  DateTime?
  user        User     @relation(fields: [userId], references: [id])
}
```

---

## Implementeringsrekkefølge (sprints)

### Sprint 1 — Spillerprofil (1–2 dager)
1. `2026-05-17-player-self-service-plan.md` — selvbetjent planlegging (allerede planlagt)
2. Fasilitets-UI: `/portal/innstillinger/trening` (ny plan)
3. Statistikk-registrering: manuell runde-logging (ny plan)

### Sprint 2 — Adaptiv justering (3–4 dager)
1. `RoundLog` + `PlanAdjustmentProposal` tabeller (DB-migrasjon)
2. `signal-analysis.ts` — trend-beregning per SG-kategori
3. `/api/cron/plan-monitor` — ukentlig analyse
4. Coach-visning: `/coach/[spillerId]/plan-forslag`

### Sprint 3 — Skills og automatisering (2 dager)
1. `skill: drill-discovery` — ukentlig web-søk
2. `skill: drill-ingest` — godkjenning → vault
3. `skill: plan-justering` — manuell coach-skill
4. Notion "Drill-kø" DB

### Sprint 4 — Statistikk-integrasjon (2–3 dager)
1. GolfBox-import (round scores)
2. Trackman CSV-import til Signal-tabell
3. Automatisk SG-beregning fra scorekort

---

## Neste steg

**Anbefaling:** Start med Sprint 1.

`2026-05-17-player-self-service-plan.md` er allerede skrevet. Gjenstår:
1. Skrive plan for fasilitets-UI (ny)
2. Skrive plan for runde-statistikk (ny)

Kjør dette: `git checkout feat/vault-knowledge-tools && git merge origin/main && start sprint 1`.
