/**
 * Kirurgisk DDL — Pakke 1 (WANG og Team Norway): `fireukerssjekker`,
 * `trener_forslag` og `elev_samtaler`. Delt mellom WANG og Team Norway;
 * kolonnen `flate` ("WANG" | "TEAM_NORWAY") skiller dem.
 *
 * Bare nye tabeller, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Database). Idempotent (CREATE TABLE IF NOT EXISTS).
 * Sjekker først hvilke tabeller som finnes, og rører aldri eksisterende rader.
 * Kolonnenavn matcher Prisma (camelCase).
 *
 *   npx tsx scripts/add-fireukerssjekk-forslag-samtale-2026-09-30.ts
 *   npx tsx scripts/add-fireukerssjekk-forslag-samtale-2026-09-30.ts --demo      (demodata på «(Demo)»-brukerne)
 *   npx tsx scripts/add-fireukerssjekk-forslag-samtale-2026-09-30.ts --rollback  (dropper de tre tabellene)
 *
 * Miljø: DIRECT_URL leses fra .env.local i hovedkatalogen (via demoskriptenes
 * env-oppsett); verdien skrives aldri ut.
 */
import "./_demo-wang-tn-2026-09-29";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const TABELLER = ["fireukerssjekker", "trener_forslag", "elev_samtaler"] as const;

const DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS "fireukerssjekker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flate" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodeStart" TIMESTAMP(3) NOT NULL,
    "periodeSlutt" TIMESTAMP(3) NOT NULL,
    "frist" TIMESTAMP(3) NOT NULL,
    "levertAt" TIMESTAMP(3),
    "prosessmaal" TEXT,
    "utviklingssjekk" JSONB,
    "paaminnelseSendtAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "fireukerssjekker_flate_groupId_frist_idx" ON "fireukerssjekker"("flate", "groupId", "frist")`,
  `CREATE INDEX IF NOT EXISTS "fireukerssjekker_userId_periodeStart_idx" ON "fireukerssjekker"("userId", "periodeStart")`,
  `CREATE TABLE IF NOT EXISTS "trener_forslag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flate" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "trenerId" TEXT NOT NULL,
    "elevId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tekst" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VENTER',
    "svar" TEXT,
    "svartAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "trener_forslag_flate_groupId_status_idx" ON "trener_forslag"("flate", "groupId", "status")`,
  `CREATE INDEX IF NOT EXISTS "trener_forslag_elevId_status_idx" ON "trener_forslag"("elevId", "status")`,
  `CREATE TABLE IF NOT EXISTS "elev_samtaler" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flate" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "elevId" TEXT NOT NULL,
    "trenerId" TEXT NOT NULL,
    "dato" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "avtalt" TEXT NOT NULL,
    "fireukerssjekkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "elev_samtaler_flate_groupId_dato_idx" ON "elev_samtaler"("flate", "groupId", "dato")`,
  `CREATE INDEX IF NOT EXISTS "elev_samtaler_elevId_dato_idx" ON "elev_samtaler"("elevId", "dato")`,
];

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  try {
    if (process.argv.includes("--rollback")) {
      for (const t of TABELLER) await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${t}"`);
      console.log("Tabellene droppet");
      return;
    }

    const fantes = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
      [...TABELLER],
    );
    console.log(`Fantes fra før: ${fantes.map((r) => r.table_name).join(", ") || "ingen"}`);

    for (const sql of DDL) await prisma.$executeRawUnsafe(sql);

    for (const t of TABELLER) {
      const [{ n }] = await prisma.$queryRawUnsafe<{ n: number }[]>(`SELECT count(*)::int AS n FROM "${t}"`);
      console.log(`${t} klar, ${n} rader`);
    }

    if (process.argv.includes("--demo")) await demodata(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

/** Fast-id-rader for «(Demo)»-elevene. Aldri ekte elever. Idempotent (ON CONFLICT DO NOTHING). */
async function demodata(prisma: PrismaClient) {
  const grupper = [
    { flate: "WANG", slug: "wang-toppidrett-demo" },
    { flate: "TEAM_NORWAY", slug: "team-norway-demo" },
  ] as const;
  const dag = 864e5;
  const naa = Date.now();
  for (const g of grupper) {
    const gruppe = await prisma.group.findUnique({ where: { slug: g.slug }, select: { id: true, hovedcoachId: true } });
    if (!gruppe) {
      console.log(`Demogruppe ${g.slug} finnes ikke, hopper over`);
      continue;
    }
    const medlemmer = await prisma.groupMember.findMany({
      where: { groupId: gruppe.id, endedAt: null },
      select: { userId: true, role: true, user: { select: { name: true } } },
    });
    const elever = medlemmer.filter((m) => m.role === "PLAYER" && m.user.name.includes("(Demo)")).slice(0, 3);
    const trener = medlemmer.find((m) => m.role === "COACH")?.userId;
    if (!trener || elever.length < 3) {
      console.log(`Demogruppe ${g.slug} mangler trener eller tre demoelever, hopper over`);
      continue;
    }
    const pre = `demo-p1-${g.flate === "WANG" ? "w" : "t"}`;
    const mal = { niva: g.flate === "WANG" ? "JUNIOR" : "AMATOR", svar: { "1": 3, "2": 4, "3": 2, "4": 3, "5": 4, "6": 3, "7": 2, "8": 3 } };
    const d = (n: number) => new Date(naa + n * dag).toISOString();
    // Elev 1: levert. Elev 2: forfalt, ikke levert. Elev 3: ikke forfalt ennå.
    const sjekker = [
      { id: `${pre}-sjekk-1`, u: elever[0].userId, ps: -28, pe: 0, fr: -1, levert: d(-2), maal: "Rolig tempo i svingen på alle slag på banen." },
      { id: `${pre}-sjekk-2`, u: elever[1].userId, ps: -28, pe: 0, fr: -3, levert: null, maal: null },
      { id: `${pre}-sjekk-3`, u: elever[2].userId, ps: 0, pe: 28, fr: 28, levert: null, maal: null },
    ];
    for (const s of sjekker) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "fireukerssjekker" ("id","flate","groupId","userId","periodeStart","periodeSlutt","frist","levertAt","prosessmaal","utviklingssjekk")
         VALUES ($1,$2,$3,$4,$5::timestamp,$6::timestamp,$7::timestamp,$8::timestamp,$9,$10::jsonb) ON CONFLICT ("id") DO NOTHING`,
        s.id, g.flate, gruppe.id, s.u, d(s.ps), d(s.pe), d(s.fr), s.levert, s.maal, s.levert ? JSON.stringify(mal) : null,
      );
    }
    await prisma.$executeRawUnsafe(
      `INSERT INTO "trener_forslag" ("id","flate","groupId","trenerId","elevId","type","tekst","status") VALUES ($1,$2,$3,$4,$5,'PLAN',$6,'VENTER') ON CONFLICT ("id") DO NOTHING`,
      `${pre}-forslag-1`, g.flate, gruppe.id, trener, elever[0].userId, "Flytt en pressøkt fra torsdag til tirsdag.",
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO "trener_forslag" ("id","flate","groupId","trenerId","elevId","type","tekst","status","svar","svartAt") VALUES ($1,$2,$3,$4,$5,'IUP',$6,'GODTATT',$7,now()) ON CONFLICT ("id") DO NOTHING`,
      `${pre}-forslag-2`, g.flate, gruppe.id, trener, elever[1].userId, "Legg til et prosessmål for putting.", "Greit, tar det med.",
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO "elev_samtaler" ("id","flate","groupId","elevId","trenerId","dato","type","avtalt","fireukerssjekkId") VALUES ($1,$2,$3,$4,$5,$6::timestamp,'FIREUKERSSJEKK',$7,$8) ON CONFLICT ("id") DO NOTHING`,
      `${pre}-samtale-1`, g.flate, gruppe.id, elever[0].userId, trener, d(-1), "Avtalt: prosessmålet følges opp i neste økt.", `${pre}-sjekk-1`,
    );
    console.log(`Demodata lagt inn for ${g.slug}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
