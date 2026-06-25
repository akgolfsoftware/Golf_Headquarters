/**
 * Locked-decisions evidence: V2 sync, GroupSchedule, GroupMember notifications.
 * Kjør: npx tsx scripts/workbench-locked-evidence.ts [OUT_LOG]
 */
import "./_env";
import { appendFileSync, writeFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { workbenchRedirectForTrenPath } from "../src/lib/portal/tren-workbench-redirect";

const OUT = process.argv[2] || "/tmp/locked-decisions.log";
const log = (line: string) => {
  const row = `[${new Date().toISOString()}] ${line}`;
  appendFileSync(OUT, row + "\n");
  console.log(row);
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

writeFileSync(OUT, `# Locked decisions evidence\n`);

async function main() {
// 1) Redirect map
const redirects = [
  "/portal/tren/aarsplan",
  "/portal/tren/teknisk-plan",
  "/portal/tren/fys-plan",
  "/portal/tren",
];
for (const p of redirects) {
  const dest = workbenchRedirectForTrenPath(p);
  log(`REDIRECT ${p} → ${dest ?? "null"} ${dest ? "PASS" : "FAIL"}`);
}

// 2) screentest spiller
const player = await prisma.user.findUnique({
  where: { email: "screentest@akgolf.test" },
  select: { id: true, name: true },
});
if (!player) {
  log("FAIL: screentest spiller ikke funnet");
  process.exit(1);
}
log(`PLAYER screentest id=${player.id} name=${player.name}`);

// 3) TrainingSessionV2 linkage
const v2Linked = await prisma.trainingSessionV2.count({
  where: { studentId: player.id, generertFra: "WORKBENCH_PLAN" },
});
log(`V2_LINKED count=${v2Linked} (dual-write spor)`);

const v2Week = await prisma.trainingSessionV2.count({
  where: {
    studentId: player.id,
    startTime: {
      gte: new Date(new Date().setDate(new Date().getDate() - ((new Date().getDay() + 6) % 7))),
    },
  },
});
log(`V2_WEEK count=${v2Week}`);

// 4) GroupSchedule for player groups
const memberships = await prisma.groupMember.findMany({
  where: { userId: player.id },
  include: {
    group: {
      select: {
        name: true,
        coachId: true,
        _count: { select: { schedules: true, members: true } },
      },
    },
  },
});
log(`GROUP_MEMBERSHIPS count=${memberships.length}`);
for (const m of memberships) {
  log(
    `  GROUP ${m.group.name} coachId=${m.group.coachId ?? "—"} schedules=${m.group._count.schedules} members=${m.group._count.members}`,
  );
}

// 5) Plan publish status
const plan = await prisma.trainingPlan.findFirst({
  where: { userId: player.id },
  orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
  select: { id: true, status: true, name: true },
});
log(`PLAN id=${plan?.id ?? "—"} status=${plan?.status ?? "—"} name=${plan?.name ?? "—"}`);

// 6) Coach groups for notification fan-out
const coach = await prisma.user.findUnique({
  where: { email: "coachtest@akgolf.test" },
  select: { id: true },
});
if (coach) {
  const grupper = await prisma.group.findMany({
    where: { coachId: coach.id },
    select: { id: true, name: true },
  });
  const medlemmer = await prisma.groupMember.findMany({
    where: { groupId: { in: grupper.map((g) => g.id) }, role: "PLAYER" },
    distinct: ["userId"],
    select: { userId: true },
  });
  log(`NOTIFY_FANOUT coachGroups=${grupper.length} uniquePlayers=${medlemmer.length} PASS`);
} else {
  log("NOTIFY_FANOUT WARN: coachtest ikke funnet");
}

await prisma.$disconnect();
log("DONE locked-decisions evidence");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});