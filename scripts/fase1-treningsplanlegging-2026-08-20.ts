/**
 * Fase 1 — grunnmur for treningsplanlegging. Additiv DDL + backfill.
 *
 * Kilder: docs/plan-treningsplanlegging-til-kode-2026-08-20.md (fase 1),
 * docs/spec-treningsplanlegging-2026-08-19.md, gap-evalueringen §2.
 *
 * Legger inn AK-formel v2 på INNSLAGET (drill/øvelse/test), øktstatus med
 * årsak, gruppestempel, målmatrisen motorikk × belastning, fasilitetenes
 * fysiske mål, treningstid og hovedcoach på gruppen.
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert i
 * dette prosjektet (.claude/rules/gotchas.md §Schema-endringer). Kirurgisk DDL
 * mot DIRECT_URL er den dokumenterte veien.
 *
 * Idempotent. Rører kun de tabellene som listes — ingen eksisterende kolonne
 * endres eller slettes, så v1-feltene (lFase, csNivaa, miljo, prPress, omraade
 * som fri tekst) står urørt som historiske lesefelter.
 *
 *   npx tsx scripts/fase1-treningsplanlegging-2026-08-20.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

/** CREATE TYPE er ikke idempotent i Postgres — pakkes i en DO-blokk. */
async function lagEnum(navn: string, verdier: readonly string[]) {
  const liste = verdier.map((v) => `'${v}'`).join(", ");
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${navn}') THEN
        CREATE TYPE "${navn}" AS ENUM (${liste});
      END IF;
    END
    $$;
  `);
}

async function main() {
  // --- Enums ---------------------------------------------------------------
  // 19 områder — fasiten rettet 20.08 (seks puttebånd, tre FYS-områder).
  await lagEnum("Omraade", [
    "TEE_TOTAL", "INNSPILL_200", "INNSPILL_150", "INNSPILL_100", "INNSPILL_50",
    "CHIP", "PITCH", "LOB", "BUNKER",
    "PUTT_0_3", "PUTT_3_5", "PUTT_5_10", "PUTT_10_25", "PUTT_25_40", "PUTT_40_PLUSS",
    "STYRKE", "KONDISJON", "BEVEGELIGHET", "BANE",
  ]);
  await lagEnum("Motorikk", ["UTEN_BALL", "LAV_HAST", "AUTO"]);
  await lagEnum("Belastning", ["INNENDORS", "TRENINGSOMRAADE", "BANE", "KONKURRANSE"]);
  await lagEnum("Press", ["ALENE", "OBSERVERT", "KONKURRANSE", "TURNERING"]);
  await lagEnum("OmradeDimensjon", [
    "SIKTE", "STARTRETNING", "KURVE", "HOYDE", "TREFFPUNKT", "LENGDEKONTROLL", "SPINN",
    "LANDINGSPUNKT", "UTRULLING", "KOLLEVALG", "BOUNCE_BRUK",
    "SANDINNGANG", "LIE_VARIASJON", "GREENLESING", "BALLSTART",
    "SPILLEFORMAT", "STRATEGIOPPGAVE",
  ]);
  await lagEnum("SandTrinn", ["UTEN_BALL_I_SAND", "MED_BALL"]);
  await lagEnum("InnslagType", ["DRILL", "OVELSE", "TEST", "TEKNISK_OPPGAVE"]);
  await lagEnum("OktAvbruddAarsak", ["SYK", "SKADE", "REISE", "VAER", "ANNET"]);
  await lagEnum("FasilitetType", ["KLUBBANLEGG", "SIMULATOR", "TRENINGSSENTER", "HJEMME"]);

  // --- training_drills_v2: formelen bæres av innslaget ----------------------
  const drillKolonner: [string, string][] = [
    ["innslagType", `"InnslagType" NOT NULL DEFAULT 'DRILL'`],
    ["omraadeKode", `"Omraade"`],
    ["motorikk", `"Motorikk"`],
    ["belastning", `"Belastning"`],
    ["press", `"Press"`],
    ["dimensjon", `"OmradeDimensjon"`],
    ["sandTrinn", `"SandTrinn"`],
    ["erSpontan", `boolean NOT NULL DEFAULT false`],
    ["hoppetOver", `boolean NOT NULL DEFAULT false`],
    ["trackManMaales", `boolean NOT NULL DEFAULT false`],
    ["trackManSessionId", `text`],
    ["trackManShotIds", `text[] NOT NULL DEFAULT ARRAY[]::text[]`],
    ["testDefinitionId", `text`],
    ["pauseSekunder", `integer`],
  ];
  for (const [navn, type] of drillKolonner) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE training_drills_v2 ADD COLUMN IF NOT EXISTS "${navn}" ${type};`,
    );
  }

  // --- training_sessions_v2: avbrudd, gruppestempel, vurdering -------------
  const oktKolonner: [string, string][] = [
    ["avbruddAarsak", `"OktAvbruddAarsak"`],
    ["avbruddNotat", `text`],
    ["sourceGroupSessionId", `text`],
    ["sourceGroupId", `text`],
    ["detachedAt", `timestamp(3)`],
    ["vurderingFokus", `integer`],
    ["vurderingGjennomforing", `integer`],
    ["vurderingMestring", `integer`],
    ["totalPauseSek", `integer`],
  ];
  for (const [navn, type] of oktKolonner) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE training_sessions_v2 ADD COLUMN IF NOT EXISTS "${navn}" ${type};`,
    );
  }

  // --- position_tasks + logg + målmatrisen ---------------------------------
  await prisma.$executeRawUnsafe(
    `ALTER TABLE position_tasks ADD COLUMN IF NOT EXISTS "slagNavn" text;`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE position_tasks ADD COLUMN IF NOT EXISTS "omraadeKode" "Omraade";`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE position_tasks ADD COLUMN IF NOT EXISTS "repsMaalNaaddVarsletAt" timestamp(3);`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE position_task_logs ADD COLUMN IF NOT EXISTS "belastning" "Belastning";`,
  );
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS position_task_maal (
      "id"         text PRIMARY KEY,
      "taskId"     text NOT NULL,
      "motorikk"   "Motorikk" NOT NULL,
      "belastning" "Belastning" NOT NULL,
      "maalReps"   integer NOT NULL DEFAULT 0,
      "gjortReps"  integer NOT NULL DEFAULT 0,
      "createdAt"  timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"  timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "position_task_maal_taskId_fkey"
        FOREIGN KEY ("taskId") REFERENCES position_tasks("id") ON DELETE CASCADE
    );
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "position_task_maal_taskId_motorikk_belastning_key"
       ON position_task_maal ("taskId", "motorikk", "belastning");`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "position_task_maal_taskId_idx" ON position_task_maal ("taskId");`,
  );

  // --- fasiliteter, gruppe, bruker -----------------------------------------
  const fasilitetKolonner: [string, string][] = [
    ["type", `"FasilitetType"`],
    ["rangeLengdeM", `integer`],
    ["maksPuttLengdeM", `double precision`],
    ["radarMerke", `text`],
  ];
  for (const [navn, type] of fasilitetKolonner) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE player_facilities ADD COLUMN IF NOT EXISTS "${navn}" ${type};`,
    );
  }
  await prisma.$executeRawUnsafe(
    `ALTER TABLE groups ADD COLUMN IF NOT EXISTS "hovedcoachId" text;`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE groups ADD COLUMN IF NOT EXISTS "arkivertAt" timestamp(3);`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS "treningTimerPerUke" integer;`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS "treningOkterPerUke" integer;`,
  );

  // --- Backfill fra v1-vokabularet -----------------------------------------
  // Mappingen er godkjent av Anders 20.08: L-fasene 1:1 til motorikk (de tre
  // kroppsdel-fasene er alle uten ball), M0–M5 til belastning, PR1–PR5 til de
  // fire press-nivåene. CS-nivåene har ingen arvtaker og blir stående som
  // historisk lesefelt.
  //
  // Kun rader der v2-feltet fortsatt er tomt røres, så scriptet kan kjøres
  // igjen uten å overskrive noe noen har satt manuelt.
  const motorikk = await prisma.$executeRawUnsafe(`
    UPDATE training_drills_v2 SET "motorikk" =
      CASE "lFase"
        WHEN 'L_KROPP' THEN 'UTEN_BALL'::"Motorikk"
        WHEN 'L_ARM'   THEN 'UTEN_BALL'::"Motorikk"
        WHEN 'L_KOLLE' THEN 'UTEN_BALL'::"Motorikk"
        WHEN 'L_BALL'  THEN 'LAV_HAST'::"Motorikk"
        WHEN 'L_AUTO'  THEN 'AUTO'::"Motorikk"
      END
    WHERE "motorikk" IS NULL AND "lFase" IS NOT NULL;
  `);
  const belastning = await prisma.$executeRawUnsafe(`
    UPDATE training_drills_v2 SET "belastning" =
      CASE "miljo"
        WHEN 'M0' THEN 'INNENDORS'::"Belastning"
        WHEN 'M1' THEN 'INNENDORS'::"Belastning"
        WHEN 'M2' THEN 'TRENINGSOMRAADE'::"Belastning"
        WHEN 'M3' THEN 'TRENINGSOMRAADE'::"Belastning"
        WHEN 'M4' THEN 'BANE'::"Belastning"
        WHEN 'M5' THEN 'KONKURRANSE'::"Belastning"
      END
    WHERE "belastning" IS NULL AND "miljo" IS NOT NULL;
  `);
  const press = await prisma.$executeRawUnsafe(`
    UPDATE training_drills_v2 SET "press" =
      CASE "prPress"
        WHEN 'PR1' THEN 'ALENE'::"Press"
        WHEN 'PR2' THEN 'ALENE'::"Press"
        WHEN 'PR3' THEN 'OBSERVERT'::"Press"
        WHEN 'PR4' THEN 'KONKURRANSE'::"Press"
        WHEN 'PR5' THEN 'TURNERING'::"Press"
      END
    WHERE "press" IS NULL AND "prPress" IS NOT NULL;
  `);
  // Områdene: kun eksakte treff mot fasitens 17 koder. Fri tekst som ikke lar
  // seg plassere blir stående tom — å gjette ville gitt falske kategorier i
  // analysen, og det er nettopp det typingen skal hindre.
  const omraader = await prisma.$executeRawUnsafe(`
    UPDATE training_drills_v2 SET "omraadeKode" = upper(trim("omraade"))::"Omraade"
    WHERE "omraadeKode" IS NULL
      AND upper(trim("omraade")) IN (
        'TEE_TOTAL','INNSPILL_200','INNSPILL_150','INNSPILL_100','INNSPILL_50',
        'CHIP','PITCH','LOB','BUNKER',
        'PUTT_0_3','PUTT_3_5','PUTT_5_10','PUTT_10_25','PUTT_25_40','PUTT_40_PLUSS',
        'STYRKE','KONDISJON','BEVEGELIGHET','BANE'
      );
  `);
  // Relevans-matrisen (Anders 20.08): motorikk gjelder KUN fullsving. Rydder
  // bort verdier backfillen kan ha satt på nærspill, bunker, putt og FYS.
  const vasket = await prisma.$executeRawUnsafe(`
    UPDATE training_drills_v2 SET "motorikk" = NULL
    WHERE "motorikk" IS NOT NULL
      AND "omraadeKode" IS NOT NULL
      AND "omraadeKode" NOT IN (
        'TEE_TOTAL','INNSPILL_200','INNSPILL_150','INNSPILL_100','INNSPILL_50'
      );
  `);

  // FYS skjuler belastning og press i UI, men verdiene lagres som default slik
  // at FYS kan summeres på samme akser som resten (relevans-matrisen v2 §FYS).
  const fysDefault = await prisma.$executeRawUnsafe(`
    UPDATE training_drills_v2
       SET "belastning" = COALESCE("belastning", 'INNENDORS'::"Belastning"),
           "press"      = COALESCE("press", 'ALENE'::"Press")
     WHERE "omraadeKode" IN ('STYRKE','KONDISJON','BEVEGELIGHET');
  `);

  console.log("Backfill:", {
    motorikk, belastning, press, omraader, vasketMotorikk: vasket, fysDefault,
  });

  const kolonner = await prisma.$queryRawUnsafe<{ count: bigint }[]>(`
    SELECT count(*) AS count FROM information_schema.columns
     WHERE (table_name = 'training_drills_v2' AND column_name IN
            ('innslagType','omraadeKode','motorikk','belastning','press',
             'dimensjon','sandTrinn','erSpontan','hoppetOver',
             'trackManMaales','trackManSessionId','trackManShotIds',
             'testDefinitionId','pauseSekunder'))
        OR (table_name = 'training_sessions_v2' AND column_name IN
            ('avbruddAarsak','avbruddNotat','sourceGroupSessionId','sourceGroupId',
             'detachedAt','vurderingFokus','vurderingGjennomforing','vurderingMestring',
             'totalPauseSek'))
        OR (table_name = 'position_tasks' AND column_name IN
            ('slagNavn','omraadeKode','repsMaalNaaddVarsletAt'))
        OR (table_name = 'position_task_logs' AND column_name = 'belastning')
        OR (table_name = 'player_facilities' AND column_name IN
            ('type','rangeLengdeM','maksPuttLengdeM','radarMerke'))
        OR (table_name = 'groups' AND column_name IN ('hovedcoachId','arkivertAt'))
        OR (table_name = 'users' AND column_name IN ('treningTimerPerUke','treningOkterPerUke'));
  `);
  console.log(`Kolonner på plass: ${kolonner[0]?.count} av 32`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
