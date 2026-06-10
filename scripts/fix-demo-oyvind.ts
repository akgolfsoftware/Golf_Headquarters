/**
 * Reparasjon: koach-demo-data lå på screentest-spilleren (PlayerHQ-sporet) og
 * endret hans godkjente skjermer. Flytter alle seed-koblinger til en DEDIKERT
 * demo-Øyvind (oyvind-rohjan@stall.akgolf.test) og gjenoppretter screentests
 * abonnement til PlayerHQ-seedens verdier. Idempotent.
 */
import "./_env";
import { prisma } from "@/lib/prisma";

const SCREENTEST = "screentest@akgolf.test";
const DEMO_OYVIND = "oyvind-rohjan@stall.akgolf.test";
const COACH = "coachtest@akgolf.test";
const GRUPPER = ["WANG-gruppen", "GFGK Elite", "Junior", "Mosjonist"];

async function main() {
  const spiller = await prisma.user.findUnique({ where: { email: SCREENTEST }, select: { id: true } });
  const coach = await prisma.user.findUnique({ where: { email: COACH }, select: { id: true } });
  if (!spiller || !coach) throw new Error("Fant ikke screentest/coachtest");

  // Demo-Øyvind: navnebror med egen e-post — UTEN auth (kun stall-data).
  const demo = await prisma.user.upsert({
    where: { email: DEMO_OYVIND },
    update: { name: "Øyvind Rohjan", role: "PLAYER", tier: "PRO", hcp: 4.2, homeClub: "Oslo GK" },
    create: { authId: "stall-oyvind-rohjan", email: DEMO_OYVIND, name: "Øyvind Rohjan", role: "PLAYER", tier: "PRO", hcp: 4.2, homeClub: "Oslo GK" },
    select: { id: true },
  });

  // a) Gruppemedlemskap (unik [groupId,userId] → slett + opprett)
  const grupper = await prisma.group.findMany({ where: { name: { in: GRUPPER }, coachId: coach.id }, select: { id: true } });
  const gIds = grupper.map((g) => g.id);
  const medlemskap = await prisma.groupMember.findMany({ where: { userId: spiller.id, groupId: { in: gIds } } });
  for (const m of medlemskap) {
    await prisma.groupMember.delete({ where: { id: m.id } });
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: m.groupId, userId: demo.id } },
      update: {},
      create: { groupId: m.groupId, userId: demo.id },
    });
  }
  console.log(`gruppemedlemskap flyttet: ${medlemskap.length}`);

  // b) Bookinger på demo-stall-tjenester
  const b = await prisma.booking.updateMany({
    where: { userId: spiller.id, serviceType: { id: { startsWith: "demo-stall-" } } },
    data: { userId: demo.id },
  });
  console.log(`bookinger flyttet: ${b.count}`);

  // c) PlanActions fra seed (kalender-agent)
  const pa = await prisma.planAction.updateMany({
    where: { userId: spiller.id, agentName: "kalender-agent" },
    data: { userId: demo.id },
  });
  console.log(`planActions flyttet: ${pa.count}`);

  // d) Innboks-tråder (DIRECT) mot coachtest
  const cs = await prisma.coachingSession.updateMany({
    where: { userId: spiller.id, coachId: coach.id, kind: "DIRECT" },
    data: { userId: demo.id },
  });
  console.log(`innboks-tråder flyttet: ${cs.count}`);

  // e) SessionRequests fra seed på spilleren? (seed brukte Sofie/Karl/Jonas/Tobias — sjekk likevel)
  const sr = await prisma.sessionRequest.updateMany({
    where: { userId: spiller.id, coachId: coach.id, status: "PENDING" },
    data: { userId: demo.id },
  });
  console.log(`sessionRequests flyttet: ${sr.count}`);

  // f) Gjenopprett screentests abonnement til PlayerHQ-seedens verdier
  await prisma.subscription.upsert({
    where: { userId: spiller.id },
    update: { tier: "PRO", status: "ACTIVE", monthlyCredits: 4, creditsRemaining: 3 },
    create: { userId: spiller.id, tier: "PRO", status: "ACTIVE", monthlyCredits: 4, creditsRemaining: 3 },
  });
  // Demo-Øyvind får tilsvarende coach-pakke (Performance Pro = 4 credits)
  await prisma.subscription.upsert({
    where: { userId: demo.id },
    update: { tier: "PRO", status: "ACTIVE", monthlyCredits: 4, creditsRemaining: 4 },
    create: { userId: demo.id, tier: "PRO", status: "ACTIVE", monthlyCredits: 4, creditsRemaining: 4 },
  });
  console.log("abonnement: screentest gjenopprettet · demo-Øyvind satt");
  console.log(`demo-Øyvind id: ${demo.id}`);
}

main().then(() => prisma.$disconnect());
