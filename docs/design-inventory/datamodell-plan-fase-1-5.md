# Datamodell-plan — Fase 1–5 (additivt)

> **Hva dette er:** Samlet oversikt over datamodell-endringene hver fase trenger, slik at de kan gjøres
> **additivt og kirurgisk** uten å brekke noe. Dette er en PLAN — ingen tabeller opprettes her.
> Hver tabell opprettes i sin egen fase.
>
> **Metode (LÅST, jf. `.claude/rules/gotchas.md`):** `prisma migrate dev` og `db push` er BEGGE blokkert
> (shadow-replay feiler; push vil droppe `dashboard`-data). Trygg vei for ADDITIVE endringer:
> 1. Legg modellen i `schema.prisma` med **plain `userId String` (ingen `@relation`)** så endringen er isolert.
> 2. Kjør `CREATE TABLE IF NOT EXISTS …` via `tsx` + `pg`/`PrismaPg` mot `DIRECT_URL` (rører kun din tabell).
> 3. `npx prisma generate`.
>
> Generert 2026-06-30.

---

## Prinsipper
- **Utvid før du lager nytt.** Flere behov dekkes av eksisterende modeller (under).
- **Delt motor → delt tabell.** AgencyOS og PlayerHQ leser samme data; tabellen er felles, UI er to lag.
- **Benchmark-referansene bor i Intelligence** (`dashboard`-schema, delt DB) — HQ lager IKKE kopier av dem.

## Eksisterende modeller vi bygger på (verifisert i `prisma/schema.prisma`)
| Modell | Bruk | Fase |
|---|---|---|
| `Round`, `BrukerSgInput`, `SgInsight`, `SgBaseline` | runder + SG (spillerens egne tall) | 1 |
| `Signal` (kind/value/payload), `PlanAction` | signaler + plan-forslag | 3 |
| `TrainingPlanSession` | plan-økter (AK-formel kanon) | 3 |
| `Payment` | betaling | 4 |
| `HealthEntry` (date/restingHr/sleepHours/weightKg/notes) | helse-logg | 5 |
| `dashboard.sg_benchmarks` (delt DB) | HCP-benchmarks — **kun lese** | 1 |

---

## Fase 1 — Benchmark + datainntak

**Leser fra Intelligence:** `dashboard.sg_benchmarks` (allerede seedet, 24 rader) via `benchmark-provider.ts`. Ingen HQ-tabell for selve benchmarkene.

**Ny (valgfri cache) — `benchmark_cache`:** per-spiller beregnet percentil/slag-gap, så vi slipper å regne på hver render.
```sql
CREATE TABLE IF NOT EXISTS "benchmark_cache" (
  "id"          text PRIMARY KEY,
  "userId"      text NOT NULL,
  "category"    varchar(16) NOT NULL,   -- OTT|APP|ARG|PUTT
  "percentile"  double precision,        -- 0-100 mot kohort/HCP-nivå
  "slagGap"     double precision,        -- slag unna neste nivå
  "level"       smallint,                -- HCP-referansenivå brukt
  "computedAt"  timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("userId","category")
);
CREATE INDEX IF NOT EXISTS "benchmark_cache_user_idx" ON "benchmark_cache" ("userId");
```

**Datainntak (#6/P3):** `Round` finnes. Verifiser om selvbetjent runde-logg trenger felt (kilde=manual). Sannsynligvis **ingen ny tabell** — utvid evt. `Round` med `source`-felt hvis det mangler (sjekk før Fase 1).

---

## Fase 2 — Fokus + nivå

**Ingen ny tabell strengt nødvendig** — «hva-jobbe-med» og nivå-score utledes av `benchmark_cache` (Fase 1) + drill-bibliotek (eksisterende `ExerciseDefinition`).

**Valgfri — `player_focus`** (cache av dagens fokus, så Hjem/Caddie er rask):
```sql
CREATE TABLE IF NOT EXISTS "player_focus" (
  "id"         text PRIMARY KEY,
  "userId"     text NOT NULL,
  "category"   varchar(16) NOT NULL,
  "rationale"  text,                     -- kort begrunnelse (størst slag-gap …)
  "drillIds"   text[],                   -- matchede driller
  "computedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("userId")
);
```
> Nivå-score (5 trinn) er en **ren funksjon** av percentil/SG — ingen tabell. Terskler i config, ikke hardkodet (FYS-formel ikke låst).

---

## Fase 3 — Adaptiv signal-loop

**Gjenbruker `Signal` + `PlanAction`.** To tillegg:

**Ny — `signal_threshold`** (konfigurerbare triggere):
```sql
CREATE TABLE IF NOT EXISTS "signal_threshold" (
  "id"         text PRIMARY KEY,
  "kind"       varchar(32) NOT NULL,     -- SG_DROP|HCP_STAGNATION|TRAINING_GAP|TOURNAMENT_NEAR|INJURY
  "threshold"  double precision,         -- f.eks. -0.3
  "windowDays" integer,                  -- f.eks. 14
  "active"     boolean NOT NULL DEFAULT true,
  "createdAt"  timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("kind")
);
```

**Ny — `plan_adjustment_proposal`** (det A3-hullet mangler: et forslag som faktisk kan ANVENDES på planen):
```sql
CREATE TABLE IF NOT EXISTS "plan_adjustment_proposal" (
  "id"         text PRIMARY KEY,
  "userId"     text NOT NULL,
  "planId"     text NOT NULL,            -- TrainingPlan
  "signalId"   text,                     -- utløsende Signal
  "diff"       jsonb NOT NULL,           -- hva som endres (økter/fokus)
  "status"     varchar(16) NOT NULL DEFAULT 'PENDING', -- PENDING|ACCEPTED|REJECTED
  "createdAt"  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "plan_adj_user_idx" ON "plan_adjustment_proposal" ("userId","status");
```
> **Kjernefiks (kode, ikke tabell):** `acceptPlanAction` skal anvende `diff` på planen, ikke bare sette status.

---

## Fase 4 — Forretning / Stripe

**Gjenbruker `Payment`.** Tillegg avhenger av Stripe-oppsett:
- Evt. **`stripe_event`** (idempotent webhook-logg) hvis vi tar imot webhooks:
```sql
CREATE TABLE IF NOT EXISTS "stripe_event" (
  "id"          text PRIMARY KEY,        -- Stripe event id (idempotensnøkkel)
  "type"        varchar(64) NOT NULL,
  "payload"     jsonb NOT NULL,
  "receivedAt"  timestamptz NOT NULL DEFAULT now()
);
```
> MRR/utestående beregnes fra `Payment` — ingen ny tabell for det.

---

## Fase 5 — Differensierende delspor

**#9 Helse/wellness — UTVID `HealthEntry`** (ikke ny tabell). Legg til kolonner:
```sql
ALTER TABLE "health_entries" ADD COLUMN IF NOT EXISTS "soreness"   smallint;  -- 1-5
ALTER TABLE "health_entries" ADD COLUMN IF NOT EXISTS "stress"     smallint;  -- 1-5
ALTER TABLE "health_entries" ADD COLUMN IF NOT EXISTS "loadRpe"    smallint;  -- økt-RPE for ACWR
```
> ACWR (akutt/kronisk last) **beregnes** fra `loadRpe`-historikk — ingen egen tabell.

**#10 Live / #11 Dispersion:**
- Live/ukeresultat leser fra Intelligence (`dashboard.dg_*`) + eksisterende turnerings-/round-data — ingen ny HQ-tabell.
- Dispersion bruker banedata (Mapbox/OSM, jf. `baneguide-dispersion-plan`) + spillerens shot-data (`Round`/shots) — egen plan, ikke her.

---

## Oppsummert — nye tabeller per fase
| Fase | Nye tabeller | Utvidelser | Mest gjenbruk |
|---|---|---|---|
| 1 | `benchmark_cache` (valgfri) | evt. `Round.source` | `dashboard.sg_benchmarks` (lese) |
| 2 | `player_focus` (valgfri) | — | `benchmark_cache`, `ExerciseDefinition` |
| 3 | `signal_threshold`, `plan_adjustment_proposal` | — | `Signal`, `PlanAction`, `TrainingPlanSession` |
| 4 | `stripe_event` (valgfri) | — | `Payment` |
| 5 | — | `health_entries` (+3 kol) | `HealthEntry`, Intelligence `dashboard.*` |

**Til sammen 3–5 nye tabeller + 4 kolonner** for hele V1. Alt additivt, alt via `db execute`. Ingen migrasjon kjøres før hver fase faktisk starter.
