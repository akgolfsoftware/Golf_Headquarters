# Utvidet slagregistrering — end-shot-kategorier og putting-detaljer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Utvide den eksisterende live rundeføringen (`runde-logg`) slik at hvert slag kan få en end-shot-resultatkategori (tee/approach/short game) og putt-slag kan få detaljerte putting-data (break, slope, linje-miss, fart-utfall) — datagrunnlaget for TrackMan-kategoriene tee-analyse, approach-analyse, short game-analyse og putting-analyse. Kun datafangst, ingen visningsskjermer.

**Architecture:** Additiv Prisma-utvidelse (ny `PuttDetail`-tabell 1:1 mot `Shot`, ett nytt nullable felt `Shot.endShotKategori`), fanget i den eksisterende posisjonskjede-modellen (`LoggetSlag`/`LoggetHull` → `byggShotRader` → `Shot`/`PuttDetail`-rader) og i den eksisterende live UI-flyten (`slag-editor.tsx`), ikke en ny skjerm.

**Tech Stack:** Next.js App Router, Prisma (Postgres via `pg`-adapter), zod, React (TL/Train-lock-komponenter), `node --test`.

**Spec:** [docs/superpowers/specs/2026-09-16-utvidet-slagregistrering-design.md](../specs/2026-09-16-utvidet-slagregistrering-design.md)

## Global Constraints

- Enheter: alle avstander i runde-logg-domenet er METER, unntatt putt-lengde som lagres i FOT (`lengdeFot`) — matcher TrackMans fot-baserte visning.
- Skjemaendringer skjer ALDRI via `prisma migrate dev/deploy` eller `db push` — kun additiv DDL via tsx-skript mot `DIRECT_URL` (`.claude/rules/gotchas.md` §Schema-endringer).
- JSON-blob-regelen: alt fra klienten valideres med zod, både server-side (`src/lib/runde-logg/schema.ts`) og i kladd-lagringen (`src/lib/runde-logg/draft.ts`).
- `null` betyr «ikke logget», aldri fabrikkert — samme konvensjon som `HoleScore.putts`/`fairway`/`gir` i dette repoet.
- `npm run verify` skal være grønt før hver commit som rører produksjonskode (`prisma validate && prisma generate && tsc --noEmit && lint && test && build`).

---

## Task 1: Prisma-skjema — nye enumer, `Shot.endShotKategori`, `PuttDetail`

**Files:**
- Modify: `prisma/schema.prisma` (enum `ShotType`-blokken rundt linje 1720, `Shot`-modellen rundt linje 1731, `HoleScore`-modellen rundt linje 1779)
- Create: `scripts/add-slag-detaljer-2026-09-16.ts`

**Interfaces:**
- Produces: Prisma-typene `EndShotKategori`, `PuttBreakRetning`, `PuttSlopeAlvorlighet`, `PuttLinjeMiss`, `PuttFartUtfall`, `PuttDetail` (eksportert fra `@/generated/prisma/enums` / `@prisma/client` etter `prisma generate`) — brukes av Task 2–6.

- [ ] **Step 1: Legg til enumer og felt i `prisma/schema.prisma`**

Rett før `model Shot` (linje ~1731), legg til enumene:

```prisma
enum EndShotKategori {
  IN_PLAY
  MINOR_MISS
  MAJOR_MISS
  GREEN_HIT
  LETT
  MIDDELS
  VANSKELIG
  PENALTY_1
  PENALTY_2
}

enum PuttBreakRetning {
  VENSTRE_HOYRE
  HOYRE_VENSTRE
  OPPOVER
  NEDOVER
}

enum PuttSlopeAlvorlighet {
  SVAK
  MODERAT
  KRAFTIG
}

enum PuttLinjeMiss {
  VENSTRE
  HOYRE
  PAA_LINJE
}

enum PuttFartUtfall {
  HOLED
  FORBI
  KORT
  SONE_FORBI
  SONE_KORT
}
```

I `model Shot` legg til (etter `mentalScore Int? @db.SmallInt`, før `round Round @relation(...)`):

```prisma
  endShotKategori EndShotKategori?
  puttDetail      PuttDetail?
```

Legg til ny modell rett etter `model Shot` (før `model SessionBallLog`):

```prisma
model PuttDetail {
  id               String                @id @default(cuid())
  shotId           String                @unique
  lengdeFot        Float
  breakRetning     PuttBreakRetning
  slopeAlvorlighet PuttSlopeAlvorlighet
  linjeMiss        PuttLinjeMiss?
  fartUtfall       PuttFartUtfall
  createdAt        DateTime              @default(now())

  shot Shot @relation(fields: [shotId], references: [id], onDelete: Cascade)

  @@map("putt_details")
}
```

- [ ] **Step 2: Valider skjema lokalt**

Run: `npx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid 🚀`

- [ ] **Step 3: Skriv additivt DDL-skript**

```typescript
// scripts/add-slag-detaljer-2026-09-16.ts
/**
 * Kirurgisk DDL for end-shot-kategorier + putting-detaljer i runde-logg.
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer).
 *
 * Idempotent. Kolonnenavn matcher Prisma (camelCase).
 *
 *   npx tsx scripts/add-slag-detaljer-2026-09-16.ts
 *   npx tsx scripts/add-slag-detaljer-2026-09-16.ts --rollback
 */
import "./_env";
import { Client } from "pg";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const rollback = process.argv.includes("--rollback");

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    if (rollback) {
      await client.query(`DROP TABLE IF EXISTS "putt_details";`);
      await client.query(`ALTER TABLE "shots" DROP COLUMN IF EXISTS "endShotKategori";`);
      await client.query(`DROP TYPE IF EXISTS "EndShotKategori";`);
      await client.query(`DROP TYPE IF EXISTS "PuttBreakRetning";`);
      await client.query(`DROP TYPE IF EXISTS "PuttSlopeAlvorlighet";`);
      await client.query(`DROP TYPE IF EXISTS "PuttLinjeMiss";`);
      await client.query(`DROP TYPE IF EXISTS "PuttFartUtfall";`);
      console.log("Rullet tilbake: putt_details droppet, shots.endShotKategori droppet, enumer droppet");
      return;
    }

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "EndShotKategori" AS ENUM (
          'IN_PLAY', 'MINOR_MISS', 'MAJOR_MISS', 'GREEN_HIT',
          'LETT', 'MIDDELS', 'VANSKELIG', 'PENALTY_1', 'PENALTY_2'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "PuttBreakRetning" AS ENUM (
          'VENSTRE_HOYRE', 'HOYRE_VENSTRE', 'OPPOVER', 'NEDOVER'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "PuttSlopeAlvorlighet" AS ENUM ('SVAK', 'MODERAT', 'KRAFTIG');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "PuttLinjeMiss" AS ENUM ('VENSTRE', 'HOYRE', 'PAA_LINJE');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "PuttFartUtfall" AS ENUM (
          'HOLED', 'FORBI', 'KORT', 'SONE_FORBI', 'SONE_KORT'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    const cols = await client.query<{ column_name: string }>(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'shots' AND column_name = 'endShotKategori'
    `);
    if (cols.rows.length === 0) {
      await client.query(`
        ALTER TABLE "shots" ADD COLUMN "endShotKategori" "EndShotKategori";
      `);
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS "putt_details" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shotId" TEXT NOT NULL UNIQUE,
        "lengdeFot" DOUBLE PRECISION NOT NULL,
        "breakRetning" "PuttBreakRetning" NOT NULL,
        "slopeAlvorlighet" "PuttSlopeAlvorlighet" NOT NULL,
        "linjeMiss" "PuttLinjeMiss",
        "fartUtfall" "PuttFartUtfall" NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "putt_details_shotId_fkey"
          FOREIGN KEY ("shotId") REFERENCES "shots"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    const { rows } = await client.query(`SELECT count(*)::int AS n FROM "putt_details"`);
    console.log(`putt_details klar (${rows[0].n} rader) — shots.endShotKategori klar`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 4: Kjør skriptet mot `DIRECT_URL`**

Run: `npx tsx scripts/add-slag-detaljer-2026-09-16.ts`
Expected: `putt_details klar (0 rader) — shots.endShotKategori klar`

- [ ] **Step 5: Generer Prisma-klienten på nytt**

Run: `npx prisma generate`
Expected: ingen feil, `EndShotKategori`/`PuttDetail` m.fl. tilgjengelig fra `@/generated/prisma/enums`.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma scripts/add-slag-detaljer-2026-09-16.ts
git commit -m "feat: legg til EndShotKategori og PuttDetail i skjemaet

Additiv DDL — ny putt_details-tabell (1:1 mot shots) + shots.endShotKategori.
Grunnlag for TrackMan-kategoriene tee/approach/short game/putting-analyse.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Domenetyper — `LoggetSlag` med `endShotKategori` og `putt`

**Files:**
- Modify: `src/lib/runde-logg/types.ts`

**Interfaces:**
- Consumes: `EndShotKategori`, `PuttBreakRetning`, `PuttSlopeAlvorlighet`, `PuttLinjeMiss`, `PuttFartUtfall` fra `@/generated/prisma/enums` (Task 1).
- Produces: `PuttRegistrering`, utvidet `LoggetSlag` — brukes av Task 3 (`byggShotRader`), Task 4 (zod-schemas), Task 6/7 (UI).

- [ ] **Step 1: Utvid importen og legg til `PuttRegistrering` + felt på `LoggetSlag`**

I `src/lib/runde-logg/types.ts`, erstatt importlinjen:

```typescript
import type { ShotLie, WindDir } from "@/generated/prisma/enums";
```

med:

```typescript
import type {
  ShotLie,
  WindDir,
  EndShotKategori,
  PuttBreakRetning,
  PuttSlopeAlvorlighet,
  PuttLinjeMiss,
  PuttFartUtfall,
} from "@/generated/prisma/enums";
```

Legg til rett før `export type LoggetSlag = {`:

```typescript
/**
 * Putting-detaljer for ETT putt-slag (kun når startLie = GREEN). Valgfritt
 * i sin helhet — null/utelatt betyr «ikke logget», samme konvensjon som
 * HoleScore.putts/fairway/gir.
 */
export type PuttRegistrering = {
  breakRetning: PuttBreakRetning;
  slopeAlvorlighet: PuttSlopeAlvorlighet;
  /** Utelates når fartUtfall = HOLED. */
  linjeMiss?: PuttLinjeMiss;
  fartUtfall: PuttFartUtfall;
};
```

Utvid `LoggetSlag` med to nye, valgfrie felt (etter `notat?: string;`):

```typescript
export type LoggetSlag = {
  resultat: SlagResultat;
  /** Kølle brukt (fritekst fra spillerens bag, f.eks. "Driver", "PW"). */
  kolle?: string;
  /** Vind under slaget — vedvarer typisk per hull i UI. */
  vind?: WindDir;
  /** Mental score 1–5 for slaget (valgfritt). */
  mental?: number;
  /** Ballen gikk i vann/OOB på dette slaget — resultat er posisjon etter drop. */
  straffe?: boolean;
  notat?: string;
  /** Kun for ikke-putt-slag (tee/approach/short game) — se gyldigeEndShotKategorier(). */
  endShotKategori?: EndShotKategori;
  /** Kun for putt-slag. */
  putt?: PuttRegistrering;
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: ingen feil (typen brukes ikke ennå, så ingen andre filer skal rammes).

- [ ] **Step 3: Commit**

```bash
git add src/lib/runde-logg/types.ts
git commit -m "feat: legg til endShotKategori og putt på LoggetSlag

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: Gyldighetsregel for end-shot-kategorier (`gyldigeEndShotKategorier`)

**Files:**
- Create: `src/lib/runde-logg/end-shot-kategori.ts`
- Test: `src/lib/runde-logg/end-shot-kategori.test.ts`

**Interfaces:**
- Consumes: `ShotType`, `EndShotKategori` fra `@/generated/prisma/enums`.
- Produces: `gyldigeEndShotKategorier(shotType: ShotType, straffe: boolean): EndShotKategori[]` — brukes av Task 6 (UI) og dokumenterer regelen Task 4 (zod) IKKE håndhever (se assumption i Task 4).

**Regel (fastsatt i denne planen):** PENALTY_1/PENALTY_2 er de eneste gyldige kategoriene når `straffe = true` (unngår at to felt sier motstridende ting om samme slag). DROP-slag og PUTT-slag har ingen gyldige end-shot-kategorier (putt bruker `PuttRegistrering` i stedet).

- [ ] **Step 1: Skriv failende test**

```typescript
// src/lib/runde-logg/end-shot-kategori.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { gyldigeEndShotKategorier } from "@/lib/runde-logg/end-shot-kategori";

describe("gyldigeEndShotKategorier", () => {
  it("tee-slag uten straffe gir tre miss-kategorier", () => {
    assert.deepEqual(gyldigeEndShotKategorier("DRIVE", false), [
      "IN_PLAY",
      "MINOR_MISS",
      "MAJOR_MISS",
    ]);
  });

  it("approach/chip/pitch/bunker/recovery uten straffe gir seks kategorier", () => {
    for (const shotType of ["APPROACH", "CHIP", "PITCH", "BUNKER", "RECOVERY"] as const) {
      assert.deepEqual(gyldigeEndShotKategorier(shotType, false), [
        "GREEN_HIT",
        "LETT",
        "MIDDELS",
        "VANSKELIG",
      ]);
    }
  });

  it("straffe overstyrer til kun de to penalty-kategoriene, uansett slagtype", () => {
    assert.deepEqual(gyldigeEndShotKategorier("DRIVE", true), ["PENALTY_1", "PENALTY_2"]);
    assert.deepEqual(gyldigeEndShotKategorier("APPROACH", true), ["PENALTY_1", "PENALTY_2"]);
  });

  it("PUTT og DROP har ingen gyldige end-shot-kategorier", () => {
    assert.deepEqual(gyldigeEndShotKategorier("PUTT", false), []);
    assert.deepEqual(gyldigeEndShotKategorier("DROP", false), []);
  });
});
```

- [ ] **Step 2: Kjør testen, verifiser at den feiler**

Run: `npx tsx --conditions=react-server --test src/lib/runde-logg/end-shot-kategori.test.ts`
Expected: FAIL — `Cannot find module '@/lib/runde-logg/end-shot-kategori'`

- [ ] **Step 3: Implementer**

```typescript
// src/lib/runde-logg/end-shot-kategori.ts
/**
 * Gyldig delsett av EndShotKategori for et gitt slag — avhenger av
 * slagtype (avledet av utledShotType) og om slaget hadde straffe.
 * Straffe er alltid sannheten om penalty (samme felt som brukes ellers i
 * runde-logg) — når straffe=true begrenses valgene til PENALTY_1/PENALTY_2
 * slik at de to feltene aldri kan motsi hverandre.
 */
import type { EndShotKategori, ShotType } from "@/generated/prisma/enums";

export function gyldigeEndShotKategorier(
  shotType: ShotType,
  straffe: boolean,
): EndShotKategori[] {
  if (shotType === "PUTT" || shotType === "DROP") return [];
  if (straffe) return ["PENALTY_1", "PENALTY_2"];
  if (shotType === "DRIVE") return ["IN_PLAY", "MINOR_MISS", "MAJOR_MISS"];
  return ["GREEN_HIT", "LETT", "MIDDELS", "VANSKELIG"];
}
```

- [ ] **Step 4: Kjør testen, verifiser at den passerer**

Run: `npx tsx --conditions=react-server --test src/lib/runde-logg/end-shot-kategori.test.ts`
Expected: PASS, 4 tester grønne.

- [ ] **Step 5: Commit**

```bash
git add src/lib/runde-logg/end-shot-kategori.ts src/lib/runde-logg/end-shot-kategori.test.ts
git commit -m "feat: gyldigeEndShotKategorier — gyldig delsett per slagtype/straffe

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: `byggShotRader` — id, endShotKategori, PuttDetail-avledning

**Files:**
- Modify: `src/lib/runde-logg/bygg-shot-rader.ts`
- Test: `src/lib/runde-logg/bygg-shot-rader.test.ts` (ny fil — finnes ikke fra før)

**Interfaces:**
- Consumes: `utledShotType` (uendret), `meterTilFot` fra `@/lib/min-golf/format.ts`, `LoggetHull`/`LoggetSlag`/`PuttRegistrering` (Task 2), `node:crypto` `randomUUID`.
- Produces: utvidet `ShotRad` (nå med `id: string`, `endShotKategori: EndShotKategori | null`), `PuttDetailRad`, `byggShotRader(hull: LoggetHull): ShotRad[]`, `splitShotRader(rader: ShotRad[]): { shots: Omit<ShotRad, "puttDetail">[]; putts: PuttDetailRad[] }` — brukes av Task 5.

- [ ] **Step 1: Skriv failende test**

```typescript
// src/lib/runde-logg/bygg-shot-rader.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggShotRader, splitShotRader } from "@/lib/runde-logg/bygg-shot-rader";
import type { LoggetHull } from "@/lib/runde-logg/types";

describe("byggShotRader — endShotKategori og putt", () => {
  it("setter endShotKategori på et approach-slag, ikke på putten som følger", () => {
    const hull: LoggetHull = {
      holeNumber: 1,
      par: 4,
      lengdeMeter: 300,
      slag: [
        {
          resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 150 },
          endShotKategori: "IN_PLAY",
        },
        {
          resultat: { iHull: false, lie: "GREEN", avstandTilHull: 4 },
          endShotKategori: "GREEN_HIT",
        },
        {
          resultat: { iHull: true },
          putt: {
            breakRetning: "VENSTRE_HOYRE",
            slopeAlvorlighet: "MODERAT",
            fartUtfall: "HOLED",
          },
        },
      ],
    };

    const rader = byggShotRader(hull);
    assert.equal(rader.length, 3);
    assert.equal(rader[0].shotType, "DRIVE");
    assert.equal(rader[0].endShotKategori, "IN_PLAY");
    assert.equal(rader[0].puttDetail, null);

    assert.equal(rader[1].shotType, "APPROACH");
    assert.equal(rader[1].endShotKategori, "GREEN_HIT");
    assert.equal(rader[1].puttDetail, null);

    // Putten starter fra GREEN (forrige slags resultat) → shotType PUTT.
    assert.equal(rader[2].shotType, "PUTT");
    assert.equal(rader[2].endShotKategori, null);
    assert.ok(rader[2].puttDetail);
    assert.equal(rader[2].puttDetail?.shotId, rader[2].id);
    // startAvstand for putten er 4 m → fot = round(4 * 3.28084) = 13.
    assert.equal(rader[2].puttDetail?.lengdeFot, 13);
    assert.equal(rader[2].puttDetail?.breakRetning, "VENSTRE_HOYRE");
    assert.equal(rader[2].puttDetail?.linjeMiss, null);
  });

  it("ignorerer endShotKategori satt på et slag som faktisk er en putt", () => {
    const hull: LoggetHull = {
      holeNumber: 2,
      par: 3,
      lengdeMeter: 150,
      slag: [
        { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 6 } },
        {
          resultat: { iHull: true },
          // Feil bruk fra klienten — skal likevel ikke havne som endShotKategori
          // på en PUTT-rad.
          endShotKategori: "IN_PLAY",
        },
      ],
    };
    const rader = byggShotRader(hull);
    assert.equal(rader[1].shotType, "PUTT");
    assert.equal(rader[1].endShotKategori, null);
  });

  it("splitShotRader skiller Shot-felter fra PuttDetail-rader", () => {
    const hull: LoggetHull = {
      holeNumber: 3,
      par: 3,
      lengdeMeter: 140,
      slag: [
        { resultat: { iHull: false, lie: "GREEN", avstandTilHull: 3 } },
        {
          resultat: { iHull: true },
          putt: { breakRetning: "OPPOVER", slopeAlvorlighet: "SVAK", fartUtfall: "HOLED" },
        },
      ],
    };
    const { shots, putts } = splitShotRader(byggShotRader(hull));
    assert.equal(shots.length, 2);
    assert.equal(putts.length, 1);
    assert.equal("puttDetail" in shots[0], false);
    assert.equal(putts[0].shotId, shots[1].id);
  });
});
```

- [ ] **Step 2: Kjør testen, verifiser at den feiler**

Run: `npx tsx --conditions=react-server --test src/lib/runde-logg/bygg-shot-rader.test.ts`
Expected: FAIL — `splitShotRader` finnes ikke, og eksisterende `ShotRad` mangler `id`/`endShotKategori`/`puttDetail`.

- [ ] **Step 3: Implementer**

Erstatt hele innholdet i `src/lib/runde-logg/bygg-shot-rader.ts`:

```typescript
/**
 * Runde-logg — Shot-rad-avledning (DB-representasjon per svingt slag).
 * Posisjonskjedet gir startposisjon per slag: slag N starter der N−1 landet.
 * Delt av lagreLoggetRunde (hel runde) og lagreHullKjede (per hull).
 *
 * `endShotKategori` gjelder kun ikke-putt-slag (se gyldigeEndShotKategorier).
 * `puttDetail` bygges kun for PUTT-slag, med lengdeFot avledet fra
 * startAvstand (putten starter der forrige slag landet — ingen egen
 * lengde-input trengs i UI).
 */

import { randomUUID } from "node:crypto";
import type { LoggetHull, LoggetSlag } from "@/lib/runde-logg/types";
import type {
  EndShotKategori,
  PuttBreakRetning,
  PuttFartUtfall,
  PuttLinjeMiss,
  PuttSlopeAlvorlighet,
  ShotLie,
  ShotType,
  WindDir,
} from "@/generated/prisma/enums";
import { meterTilFot } from "@/lib/min-golf/format.ts";

/** Deterministisk ShotType fra kontekst — dokumentert konvensjon, ikke gjettverk. */
export function utledShotType(
  erForsteSlag: boolean,
  par: number,
  startLie: ShotLie,
  startAvstand: number,
): ShotType {
  if (startLie === "GREEN") return "PUTT";
  if (erForsteSlag && par >= 4) return "DRIVE";
  if (startLie === "TREES") return "RECOVERY";
  if (startLie === "BUNKER" && startAvstand <= 30) return "BUNKER";
  if (startAvstand <= 12) return "CHIP";
  if (startAvstand <= 30) return "PITCH";
  return "APPROACH";
}

export type PuttDetailRad = {
  shotId: string;
  lengdeFot: number;
  breakRetning: PuttBreakRetning;
  slopeAlvorlighet: PuttSlopeAlvorlighet;
  linjeMiss: PuttLinjeMiss | null;
  fartUtfall: PuttFartUtfall;
};

export type ShotRad = {
  id: string;
  holeNumber: number;
  holePar: number;
  shotNumber: number;
  club: string | null;
  lie: ShotLie;
  distanceToPin: number;
  windDir: WindDir | null;
  shotType: ShotType;
  isPenalty: boolean;
  mentalScore: number | null;
  notes: string | null;
  endShotKategori: EndShotKategori | null;
  puttDetail: PuttDetailRad | null;
};

/** Bygger Shot-radene for ett hull (posisjonskjedet gir startposisjon per slag). */
export function byggShotRader(hull: LoggetHull): ShotRad[] {
  let startLie: ShotLie = "TEE";
  let startAvstand = hull.lengdeMeter;

  return hull.slag.map((slag: LoggetSlag, i) => {
    const id = randomUUID();
    const shotType = utledShotType(i === 0, hull.par, startLie, startAvstand);
    const erPutt = shotType === "PUTT";

    const rad: ShotRad = {
      id,
      holeNumber: hull.holeNumber,
      holePar: hull.par,
      shotNumber: i + 1,
      club: slag.kolle ?? null,
      lie: startLie,
      distanceToPin: startAvstand,
      windDir: slag.vind ?? null,
      shotType,
      isPenalty: slag.straffe === true,
      mentalScore: slag.mental ?? null,
      notes: slag.notat ?? null,
      endShotKategori: erPutt ? null : (slag.endShotKategori ?? null),
      puttDetail:
        erPutt && slag.putt
          ? {
              shotId: id,
              lengdeFot: Math.round(meterTilFot(startAvstand)),
              breakRetning: slag.putt.breakRetning,
              slopeAlvorlighet: slag.putt.slopeAlvorlighet,
              linjeMiss: slag.putt.linjeMiss ?? null,
              fartUtfall: slag.putt.fartUtfall,
            }
          : null,
    };
    if (!slag.resultat.iHull) {
      startLie = slag.resultat.lie;
      startAvstand = slag.resultat.avstandTilHull;
    }
    return rad;
  });
}

/** Skiller Shot-kolonner fra PuttDetail-rader for to separate createMany-kall. */
export function splitShotRader(
  rader: ShotRad[],
): { shots: Array<Omit<ShotRad, "puttDetail">>; putts: PuttDetailRad[] } {
  const shots: Array<Omit<ShotRad, "puttDetail">> = [];
  const putts: PuttDetailRad[] = [];
  for (const { puttDetail, ...shot } of rader) {
    shots.push(shot);
    if (puttDetail) putts.push(puttDetail);
  }
  return { shots, putts };
}
```

- [ ] **Step 4: Kjør testen, verifiser at den passerer**

Run: `npx tsx --conditions=react-server --test src/lib/runde-logg/bygg-shot-rader.test.ts`
Expected: PASS, 3 tester grønne.

- [ ] **Step 5: Typecheck hele prosjektet**

Run: `npx tsc --noEmit`
Expected: FAIL forventet her — de to stedene som kaller `byggShotRader(...).map((rad) => ({ ...rad, roundId }))` og sender rett i `tx.shot.createMany` vil nå feile fordi `rad` har et ekstra `puttDetail`-felt som ikke finnes på `Shot`. Dette rettes i Task 5. Noter feilstedene (`(legacy)/mal/runder/logg/actions.ts` og `mal/runder/[id]/actions.ts`) og fortsett til Task 5 — ikke commit denne halvferdige tilstanden.

- [ ] **Step 6: Commit**

```bash
git add src/lib/runde-logg/bygg-shot-rader.ts src/lib/runde-logg/bygg-shot-rader.test.ts
git commit -m "feat: byggShotRader avleder endShotKategori og PuttDetail

Legger til id-generering (randomUUID) slik at Shot- og PuttDetail-rader kan
korreleres over to separate createMany-kall. Kjente typefeil i actions.ts
rettes i neste commit (Task 5).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: Persister PuttDetail — `lagreLoggetRunde` og `lagreHullKjede`

**Files:**
- Modify: `src/app/portal/(legacy)/mal/runder/logg/actions.ts:111-115`
- Modify: `src/app/portal/mal/runder/[id]/actions.ts:483-485`

**Interfaces:**
- Consumes: `splitShotRader` (Task 4).
- Produces: ingen nye eksporter — retter typefeilen fra Task 4 Step 5.

- [ ] **Step 1: Rett `lagreLoggetRunde`**

I `src/app/portal/(legacy)/mal/runder/logg/actions.ts`, legg til import:

```typescript
import { byggShotRader, splitShotRader } from "@/lib/runde-logg/bygg-shot-rader";
```

(erstatter den eksisterende `import { byggShotRader } from "@/lib/runde-logg/bygg-shot-rader";`)

Erstatt (linje 111-115):

```typescript
    await tx.shot.createMany({
      data: runde.hull.flatMap((h) =>
        byggShotRader(h).map((rad) => ({ ...rad, roundId: opprettet.id })),
      ),
    });
```

med:

```typescript
    const alleRader = runde.hull.flatMap((h) => byggShotRader(h));
    const { shots, putts } = splitShotRader(alleRader);
    await tx.shot.createMany({
      data: shots.map((rad) => ({ ...rad, roundId: opprettet.id })),
    });
    if (putts.length > 0) {
      await tx.puttDetail.createMany({ data: putts });
    }
```

- [ ] **Step 2: Rett `lagreHullKjede`**

I `src/app/portal/mal/runder/[id]/actions.ts`, legg til `splitShotRader` i den eksisterende importen:

```typescript
import { byggShotRader, splitShotRader } from "@/lib/runde-logg/bygg-shot-rader";
```

Erstatt (linje 483-485):

```typescript
    await tx.shot.createMany({
      data: byggShotRader(hullMedPar).map((rad) => ({ ...rad, roundId })),
    });
```

med:

```typescript
    const { shots, putts } = splitShotRader(byggShotRader(hullMedPar));
    await tx.shot.createMany({
      data: shots.map((rad) => ({ ...rad, roundId })),
    });
    if (putts.length > 0) {
      await tx.puttDetail.createMany({ data: putts });
    }
```

(`tx.shot.deleteMany({ where: { roundId, holeNumber: data.holeNumber } })` rett over, linje 482, står uendret — `onDelete: Cascade` på `PuttDetail.shot` rydder automatisk gamle putt-detaljer når hullet skrives på nytt.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: ingen feil.

- [ ] **Step 4: Kjør hele testsuiten for runde-logg**

Run: `npx tsx --conditions=react-server --test 'src/lib/runde-logg/*.test.ts'`
Expected: PASS, alle eksisterende + nye tester grønne (ingen regresjon i `pipeline.test.ts`, `granulaer-sg.test.ts` osv. — disse rører ikke de nye feltene, kun `byggShotRader`s signatur er utvidet, ikke brutt).

- [ ] **Step 5: Commit**

```bash
git add "src/app/portal/(legacy)/mal/runder/logg/actions.ts" "src/app/portal/mal/runder/[id]/actions.ts"
git commit -m "feat: persister PuttDetail ved siden av Shot i runde-logg-lagring

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Zod-validering — server (`schema.ts`) og kladd (`draft.ts`)

**Files:**
- Modify: `src/lib/runde-logg/schema.ts`
- Modify: `src/lib/runde-logg/draft.ts`
- Test: `src/lib/runde-logg/schema.test.ts` (ny fil)

**Interfaces:**
- Produces: utvidet `slagSchema` (begge steder) som aksepterer `endShotKategori`/`putt` — konsumeres av `hullSchema` (uendret struktur, brukes av `lagreHullKjede` og `rundeSchema` i `(legacy)/mal/runder/logg/actions.ts`).

**Assumption (skrevet inn i spec):** zod validerer KUN formen på `endShotKategori`/`putt` (gyldige enum-verdier, `linjeMiss` kun når `fartUtfall ≠ HOLED`) — den kryssjekker IKKE `endShotKategori` mot den avledede `shotType` (det krever hull-kontekst schemaet ikke har på slag-nivå). UI (Task 7) viser kun gyldige valg via `gyldigeEndShotKategorier`, så et feilaktig serverside-kall kan i verste fall lagre en kategori som ikke matcher slagtypen — ufarlig metadata, ikke et integritetsbrudd.

- [ ] **Step 1: Skriv failende test**

```typescript
// src/lib/runde-logg/schema.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { slagSchema } from "@/lib/runde-logg/schema";

describe("slagSchema — endShotKategori og putt", () => {
  it("godtar et slag med endShotKategori", () => {
    const parsed = slagSchema.safeParse({
      resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 120 },
      endShotKategori: "GREEN_HIT",
    });
    assert.equal(parsed.success, true);
  });

  it("godtar en holt putt uten linjeMiss", () => {
    const parsed = slagSchema.safeParse({
      resultat: { iHull: true },
      putt: { breakRetning: "OPPOVER", slopeAlvorlighet: "SVAK", fartUtfall: "HOLED" },
    });
    assert.equal(parsed.success, true);
  });

  it("avviser linjeMiss når fartUtfall er HOLED", () => {
    const parsed = slagSchema.safeParse({
      resultat: { iHull: true },
      putt: {
        breakRetning: "OPPOVER",
        slopeAlvorlighet: "SVAK",
        fartUtfall: "HOLED",
        linjeMiss: "VENSTRE",
      },
    });
    assert.equal(parsed.success, false);
  });

  it("avviser ukjent endShotKategori-verdi", () => {
    const parsed = slagSchema.safeParse({
      resultat: { iHull: false, lie: "FAIRWAY", avstandTilHull: 120 },
      endShotKategori: "NOE_ANNET",
    });
    assert.equal(parsed.success, false);
  });
});
```

- [ ] **Step 2: Kjør testen, verifiser at den feiler**

Run: `npx tsx --conditions=react-server --test src/lib/runde-logg/schema.test.ts`
Expected: FAIL — `endShotKategori`/`putt` finnes ikke i schemaet ennå (zod strips ukjente felt stille, så testene for "godtar" kan faktisk passere allerede, men "avviser linjeMiss når HOLED" og "avviser ukjent endShotKategori" skal feile siden feltet ikke valideres i det hele tatt ennå).

- [ ] **Step 3: Implementer i `src/lib/runde-logg/schema.ts`**

Legg til øverst, under `hvileLieSchema`:

```typescript
export const endShotKategoriSchema = z.enum([
  "IN_PLAY",
  "MINOR_MISS",
  "MAJOR_MISS",
  "GREEN_HIT",
  "LETT",
  "MIDDELS",
  "VANSKELIG",
  "PENALTY_1",
  "PENALTY_2",
]);

export const puttSchema = z
  .object({
    breakRetning: z.enum(["VENSTRE_HOYRE", "HOYRE_VENSTRE", "OPPOVER", "NEDOVER"]),
    slopeAlvorlighet: z.enum(["SVAK", "MODERAT", "KRAFTIG"]),
    linjeMiss: z.enum(["VENSTRE", "HOYRE", "PAA_LINJE"]).optional(),
    fartUtfall: z.enum(["HOLED", "FORBI", "KORT", "SONE_FORBI", "SONE_KORT"]),
  })
  .refine((p) => !(p.fartUtfall === "HOLED" && p.linjeMiss), {
    message: "linjeMiss kan ikke settes når putten er holt",
  });
```

Utvid `slagSchema` (legg til de to nye feltene i objektet, før `.refine(...)`):

```typescript
export const slagSchema = z
  .object({
    resultat: resultatSchema,
    kolle: z.string().max(40).optional(),
    vind: z.enum(["STILLE", "MEDVIND", "MOTVIND", "VENSTRE", "HOYRE"]).optional(),
    mental: z.number().int().min(1).max(5).optional(),
    straffe: z.boolean().optional(),
    notat: z.string().max(500).optional(),
    endShotKategori: endShotKategoriSchema.optional(),
    putt: puttSchema.optional(),
  })
  // Straffe på hole-out-slaget ville blitt stille ignorert av hullTilSgShots
  // (som returnerer ved iHull før straffen leses) — avvis eksplisitt.
  .refine((s) => !(s.resultat.iHull && s.straffe), {
    message:
      "Straffe kan ikke settes på slaget som går i hull — før straffen på slaget den skjedde",
  });
```

- [ ] **Step 4: Kjør testen, verifiser at den passerer**

Run: `npx tsx --conditions=react-server --test src/lib/runde-logg/schema.test.ts`
Expected: PASS, 4 tester grønne.

- [ ] **Step 5: Speil samme validering i `src/lib/runde-logg/draft.ts`**

I `draft.ts`, legg til samme to schemas (`endShotKategoriSchema`, `puttSchema` — kopiert, IKKE importert fra `schema.ts`, siden `draft.ts` allerede bevisst dupliserer `hvileLieSchema`/`slagSchema` for å holde kladd-valideringen fri for server-avhengigheter) rett under den eksisterende `hvileLieSchema`:

```typescript
const endShotKategoriSchema = z.enum([
  "IN_PLAY",
  "MINOR_MISS",
  "MAJOR_MISS",
  "GREEN_HIT",
  "LETT",
  "MIDDELS",
  "VANSKELIG",
  "PENALTY_1",
  "PENALTY_2",
]);

const puttSchema = z
  .object({
    breakRetning: z.enum(["VENSTRE_HOYRE", "HOYRE_VENSTRE", "OPPOVER", "NEDOVER"]),
    slopeAlvorlighet: z.enum(["SVAK", "MODERAT", "KRAFTIG"]),
    linjeMiss: z.enum(["VENSTRE", "HOYRE", "PAA_LINJE"]).optional(),
    fartUtfall: z.enum(["HOLED", "FORBI", "KORT", "SONE_FORBI", "SONE_KORT"]),
  })
  .refine((p) => !(p.fartUtfall === "HOLED" && p.linjeMiss), {
    message: "linjeMiss kan ikke settes når putten er holt",
  });
```

Utvid den lokale `slagSchema` i samme fil (legg til før lukkende `});`):

```typescript
const slagSchema = z.object({
  resultat: z.discriminatedUnion("iHull", [
    z.object({ iHull: z.literal(true) }),
    z.object({
      iHull: z.literal(false),
      lie: hvileLieSchema,
      avstandTilHull: z.number().min(0.1).max(700),
    }),
  ]),
  kolle: z.string().max(40).optional(),
  vind: z.enum(["STILLE", "MEDVIND", "MOTVIND", "VENSTRE", "HOYRE"]).optional(),
  mental: z.number().int().min(1).max(5).optional(),
  straffe: z.boolean().optional(),
  notat: z.string().max(500).optional(),
  endShotKategori: endShotKategoriSchema.optional(),
  putt: puttSchema.optional(),
});
```

- [ ] **Step 6: Typecheck og full runde-logg-testsuite**

Run: `npx tsc --noEmit && npx tsx --conditions=react-server --test 'src/lib/runde-logg/*.test.ts'`
Expected: ingen feil, alle tester grønne.

- [ ] **Step 7: Commit**

```bash
git add src/lib/runde-logg/schema.ts src/lib/runde-logg/draft.ts src/lib/runde-logg/schema.test.ts
git commit -m "feat: valider endShotKategori/putt server-side og i kladd-lagringen

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: UI — `slag-resultat-detaljer.tsx` (end-shot-kategori og putt-velger)

**Files:**
- Create: `src/components/portal/runde-logg/slag-resultat-detaljer.tsx`

**Interfaces:**
- Consumes: `gyldigeEndShotKategorier` (Task 3), `PuttRegistrering`/`EndShotKategori`-typer (Task 2), `TL`/`Icon` fra eksisterende `@/lib/v2/train-lock` / `@/components/v2` (samme som `slag-editor.tsx` allerede bruker).
- Produces: `EndShotKategoriVelger` (props: `shotType: ShotType`, `straffe: boolean`, `verdi: EndShotKategori | null`, `onVerdi: (v: EndShotKategori) => void`), `PuttDetaljerVelger` (props: `verdi: PuttRegistrering | null`, `onVerdi: (v: PuttRegistrering) => void`) — begge brukes av Task 8 (`slag-editor.tsx`).

- [ ] **Step 1: Implementer komponentfilen**

```typescript
// src/components/portal/runde-logg/slag-resultat-detaljer.tsx
"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * To små tommel-vennlige velgere for slag-editoren:
 * - EndShotKategoriVelger: resultatkategori for tee/approach/short game-slag
 *   (TrackMan-speilet: 3 kategorier for tee, 4 for approach/short game/recovery,
 *   2 penalty-kategorier når straffe er satt). Skjules for putt/drop.
 * - PuttDetaljerVelger: break/slope/linjeMiss/fartUtfall for putt-slag.
 *   Lengde avledes automatisk av startAvstand i byggShotRader — spørres ikke her.
 */

import { useState } from "react";
import type { EndShotKategori, ShotType } from "@/generated/prisma/enums";
import type { PuttRegistrering } from "@/lib/runde-logg/types";
import { gyldigeEndShotKategorier } from "@/lib/runde-logg/end-shot-kategori";
import { Caps } from "@/components/v2";

const END_SHOT_LABEL: Record<EndShotKategori, string> = {
  IN_PLAY: "I spill",
  MINOR_MISS: "Lite avvik",
  MAJOR_MISS: "Stort avvik",
  GREEN_HIT: "Green truffet",
  LETT: "Lett",
  MIDDELS: "Middels",
  VANSKELIG: "Vanskelig",
  PENALTY_1: "Straffe · hindring",
  PENALTY_2: "Straffe · tapt ball/re-tee",
};

function pill(aktiv: boolean) {
  return {
    appearance: "none" as const,
    cursor: "pointer",
    padding: "9px 12px",
    borderRadius: 12,
    fontFamily: TL.font.sans,
    fontSize: 12.5,
    fontWeight: 600,
    background: aktiv ? TL.dim : "transparent",
    color: aktiv ? TL.text : TL.mute,
    border: `1px solid ${TL.hair}`,
  };
}

export function EndShotKategoriVelger({
  shotType,
  straffe,
  verdi,
  onVerdi,
}: {
  shotType: ShotType;
  straffe: boolean;
  verdi: EndShotKategori | null;
  onVerdi: (v: EndShotKategori) => void;
}) {
  const gyldige = gyldigeEndShotKategorier(shotType, straffe);
  if (gyldige.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Caps>Resultat</Caps>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {gyldige.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onVerdi(k)}
            className="v2-press v2-focus"
            style={pill(verdi === k)}
          >
            {END_SHOT_LABEL[k]}
          </button>
        ))}
      </div>
    </div>
  );
}

const BREAK_LABEL: Record<PuttRegistrering["breakRetning"], string> = {
  VENSTRE_HOYRE: "Venstre → høyre",
  HOYRE_VENSTRE: "Høyre → venstre",
  OPPOVER: "Oppover",
  NEDOVER: "Nedover",
};
const SLOPE_LABEL: Record<PuttRegistrering["slopeAlvorlighet"], string> = {
  SVAK: "Svak",
  MODERAT: "Moderat",
  KRAFTIG: "Kraftig",
};
const LINJE_LABEL: Record<NonNullable<PuttRegistrering["linjeMiss"]>, string> = {
  VENSTRE: "Venstre",
  HOYRE: "Høyre",
  PAA_LINJE: "På linje",
};
const FART_LABEL: Record<PuttRegistrering["fartUtfall"], string> = {
  HOLED: "Holt",
  FORBI: "Forbi",
  KORT: "Kort",
  SONE_FORBI: "Sone · forbi",
  SONE_KORT: "Sone · kort",
};

export function PuttDetaljerVelger({
  verdi,
  onVerdi,
}: {
  verdi: PuttRegistrering | null;
  onVerdi: (v: PuttRegistrering) => void;
}) {
  const [utkast, setUtkast] = useState<Partial<PuttRegistrering>>(verdi ?? {});

  const oppdater = <K extends keyof PuttRegistrering>(felt: K, val: PuttRegistrering[K]) => {
    const neste: Partial<PuttRegistrering> = {
      ...utkast,
      [felt]: val,
      // linjeMiss gir ikke mening når putten er holt.
      ...(felt === "fartUtfall" && val === "HOLED" ? { linjeMiss: undefined } : {}),
    };
    setUtkast(neste);
    if (neste.breakRetning && neste.slopeAlvorlighet && neste.fartUtfall) {
      onVerdi(neste as PuttRegistrering);
    }
  };

  const rad = <T extends string>(
    label: string,
    valg: Array<{ id: T; tekst: string }>,
    aktiv: T | undefined,
    onVelg: (v: T) => void,
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Caps>{label}</Caps>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {valg.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onVelg(v.id)}
            className="v2-press v2-focus"
            style={pill(aktiv === v.id)}
          >
            {v.tekst}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {rad(
        "Break",
        (Object.keys(BREAK_LABEL) as Array<keyof typeof BREAK_LABEL>).map((id) => ({
          id,
          tekst: BREAK_LABEL[id],
        })),
        utkast.breakRetning,
        (v) => oppdater("breakRetning", v),
      )}
      {rad(
        "Slope",
        (Object.keys(SLOPE_LABEL) as Array<keyof typeof SLOPE_LABEL>).map((id) => ({
          id,
          tekst: SLOPE_LABEL[id],
        })),
        utkast.slopeAlvorlighet,
        (v) => oppdater("slopeAlvorlighet", v),
      )}
      {rad(
        "Utfall",
        (Object.keys(FART_LABEL) as Array<keyof typeof FART_LABEL>).map((id) => ({
          id,
          tekst: FART_LABEL[id],
        })),
        utkast.fartUtfall,
        (v) => oppdater("fartUtfall", v),
      )}
      {utkast.fartUtfall && utkast.fartUtfall !== "HOLED" &&
        rad(
          "Linje-miss",
          (Object.keys(LINJE_LABEL) as Array<keyof typeof LINJE_LABEL>).map((id) => ({
            id,
            tekst: LINJE_LABEL[id],
          })),
          utkast.linjeMiss,
          (v) => oppdater("linjeMiss", v),
        )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: ingen feil.

- [ ] **Step 3: Commit**

```bash
git add src/components/portal/runde-logg/slag-resultat-detaljer.tsx
git commit -m "feat: EndShotKategoriVelger og PuttDetaljerVelger

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: Koble inn i `slag-editor.tsx`

**Files:**
- Modify: `src/components/portal/runde-logg/slag-editor.tsx`

**Interfaces:**
- Consumes: `EndShotKategoriVelger`, `PuttDetaljerVelger` (Task 7).
- Produces: ingen nye eksporter — `SlagEditor` sender nå `endShotKategori`/`putt` videre i `onLagre`/`onIHull`-kallene sine (allerede typet via `LoggetSlag`, Task 2).

- [ ] **Step 1: Utvid import og state**

Legg til import øverst i `slag-editor.tsx`:

```typescript
import { EndShotKategoriVelger, PuttDetaljerVelger } from "./slag-resultat-detaljer";
import { utledShotType } from "@/lib/runde-logg/end-shot-kategori";
import type { EndShotKategori } from "@/generated/prisma/enums";
import type { PuttRegistrering } from "@/lib/runde-logg/types";
```

`utledShotType` bor i `bygg-shot-rader.ts`, ikke `end-shot-kategori.ts` (rett import):

```typescript
import { utledShotType } from "@/lib/runde-logg/bygg-shot-rader";
```

Legg til to nye `useState` rett under de eksisterende (etter `const [notat, setNotat] = useState("");`):

```typescript
  const [endShotKategori, setEndShotKategori] = useState<EndShotKategori | null>(null);
  const [putt, setPutt] = useState<PuttRegistrering | null>(null);
```

- [ ] **Step 2: Beregn slagets shotType og bygg `felles()` med de nye feltene**

Rett under den eksisterende `const erPutt = startLie === "GREEN";` (linje 74), legg til:

```typescript
  const shotType = utledShotType(slagNr === 1, par, startLie, startAvstand);
```

Utvid `felles()`-funksjonen (erstatt hele funksjonen):

```typescript
  const felles = (): Pick<
    LoggetSlag,
    "kolle" | "vind" | "notat" | "endShotKategori" | "putt"
  > => ({
    ...(kolle.trim() ? { kolle: kolle.trim() } : {}),
    ...(vind ? { vind } : {}),
    ...(notat.trim() ? { notat: notat.trim() } : {}),
    ...(!erPutt && endShotKategori ? { endShotKategori } : {}),
    ...(erPutt && putt ? { putt } : {}),
  });
```

- [ ] **Step 3: Nullstill de nye feltene i `nullstill()`**

Utvid `nullstill()` (erstatt hele funksjonen):

```typescript
  const nullstill = () => {
    setLie(null);
    setAvstand(null);
    setStraffe(false);
    setKolle("");
    setNotat("");
    setEndShotKategori(null);
    setPutt(null);
  };
```

- [ ] **Step 4: Vis velgeren i markup**

Rett etter blokken som viser `{lie && <AvstandVelger ... />}` (linje 260-262), legg til:

```typescript
        {lie && !erPutt && (
          <EndShotKategoriVelger
            shotType={shotType}
            straffe={straffe}
            verdi={endShotKategori}
            onVerdi={setEndShotKategori}
          />
        )}
```

Rett etter «I HULL»-knappen (etter linje 206, `</button>`) — putt-detaljer vises uansett om spilleren trykker «I hull» eller logger et avstandsresultat, siden begge er gyldige putt-utfall:

```typescript
      {erPutt && (
        <PuttDetaljerVelger verdi={putt} onVerdi={setPutt} />
      )}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: ingen feil.

- [ ] **Step 6: Manuell verifisering i dev**

Run: `npm run dev` (i egen terminal), naviger til `/portal/mal/runder/ny` (eller «Fortsett runde» på en pågående kladd), start en runde, logg et par slag:
- Et tee-slag uten straffe → verifiser at 3 resultat-knapper vises (I spill/Lite avvik/Stort avvik).
- Et approach-slag → verifiser 4 knapper (Green truffet/Lett/Middels/Vanskelig).
- Skru på «Straffe» → verifiser at resultat-knappene bytter til de 2 penalty-alternativene.
- Et putt-slag (lie=Green) → verifiser at Break/Slope/Utfall vises, og at Linje-miss KUN vises når Utfall ≠ Holt.
- Fullfør hullet og sjekk i Prisma Studio (`npx prisma studio`) at `shots.endShotKategori` og `putt_details`-raden faktisk er skrevet med riktig `shotId`.

Expected: alt over stemmer, ingen konsoll-feil.

- [ ] **Step 7: Commit**

```bash
git add src/components/portal/runde-logg/slag-editor.tsx
git commit -m "feat: koble EndShotKategoriVelger/PuttDetaljerVelger inn i SlagEditor

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 9: Full verifisering

**Files:** ingen — kun kjøring.

- [ ] **Step 1: Kjør full kvalitetsgate**

Run: `npm run verify`
Expected: grønt (prisma validate/generate, tsc, lint, test, build).

- [ ] **Step 2: Push og opprett PR**

```bash
git push -u origin claude/stats-sg-categories-02008f-40ldjw
gh pr create --title "Utvidet slagregistrering: end-shot-kategorier og putting-detaljer" --body "$(cat <<'EOF'
## Sammendrag
- Ny `PuttDetail`-tabell (1:1 mot `Shot`) + `Shot.endShotKategori` — additiv DDL, kjørt mot DIRECT_URL.
- Live rundeføringen (`slag-editor.tsx`) fanger nå end-shot-resultatkategori for tee/approach/short game-slag og break/slope/linje/fartutfall for putt-slag.
- Kun datafangst — analyseskjermer (trend/dispersion/proximity) er egen, senere leveranse.

Spec: docs/superpowers/specs/2026-09-16-utvidet-slagregistrering-design.md
Plan: docs/superpowers/plans/2026-09-16-utvidet-slagregistrering.md

## Test plan
- [ ] `npm run verify` grønt
- [ ] Manuell logging av tee/approach/putt-slag i dev, verifisert i Prisma Studio
EOF
)"
```

---

## Self-Review

**Spec-dekning:** Datamodell (Task 1), fangst-UI i eksisterende live-flyt (Task 6-8), «ikke i denne leveransen» respektert (ingen dashboards/dispersion-visning bygget), testing (Task 3/4/6), migreringsvei via gotchas.md-mønster (Task 1). Rekkefølgen i spec (skjema → endShotKategori-steg → PuttDetail-fangst → kladd/autosave → tester) er fulgt, med kladd (Task 6 Step 5) implisitt dekket fordi `draft.ts`s egen zod-kopi oppdateres i samme task som server-schemaet.

**Placeholder-scan:** ingen TBD/TODO — alle steg har fullstendig kode.

**Typekonsistens:** `ShotRad.id`/`endShotKategori`/`puttDetail` (Task 4) matcher feltnavnene `splitShotRader` (Task 4) og de to actions-filene (Task 5) bruker. `PuttRegistrering` (Task 2) matcher feltnavnene `PuttDetaljerVelger` (Task 7) og `byggShotRader`s `puttDetail`-bygging (Task 4) bruker. `gyldigeEndShotKategorier` (Task 3) brukes med samme signatur i `EndShotKategoriVelger` (Task 7).
