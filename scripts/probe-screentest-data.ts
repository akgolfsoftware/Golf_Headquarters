/**
 * Read-only probe: teller rader per nøkkelmodell for screentest@akgolf.test.
 * Kjør: npx tsx scripts/probe-screentest-data.ts
 */

import "./_env";

import { prisma } from "@/lib/prisma";

const OYVIND_EMAIL = "screentest@akgolf.test";

async function main() {
  const oyvind = await prisma.user.findUnique({ where: { email: OYVIND_EMAIL } });
  if (!oyvind) throw new Error(`Fant ikke ${OYVIND_EMAIL}`);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [
    round,
    holeScore,
    trackManSession,
    trackManShot30d,
    testResult,
    fysiskPlan,
    fysUke,
    fysOkt,
    fysOvelseRad,
    talentTracking,
    technicalPlan,
    technicalPlanPosition,
    positionTask,
    positionTaskTmGoal,
    planSuggestion,
    goal,
    drillChallengeParticipation,
    notification,
    coachingSessionMsgCount,
    bookingUpcoming,
    trainingPlan,
    planSession,
    trainingSessionV2Today,
    brukerSammenligning,
    brukerSgInput,
    innboksEpost,
  ] = await Promise.all([
    prisma.round.count({ where: { userId: oyvind.id } }),
    prisma.holeScore.count({ where: { round: { userId: oyvind.id } } }),
    prisma.trackManSession.count({ where: { userId: oyvind.id } }),
    prisma.trackManShot.count({ where: { session: { userId: oyvind.id }, recordedAt: { gte: thirtyDaysAgo } } }),
    prisma.testResult.count({ where: { userId: oyvind.id } }),
    prisma.fysiskPlan.count({ where: { userId: oyvind.id } }),
    prisma.fysUke.count({ where: { plan: { userId: oyvind.id } } }),
    prisma.fysOkt.count({ where: { uke: { plan: { userId: oyvind.id } } } }),
    prisma.fysOvelseRad.count({ where: { okt: { uke: { plan: { userId: oyvind.id } } } } }),
    prisma.talentTracking.count({ where: { userId: oyvind.id } }),
    prisma.technicalPlan.count({ where: { userId: oyvind.id } }),
    prisma.technicalPlanPosition.count({ where: { plan: { userId: oyvind.id } } }),
    prisma.positionTask.count({ where: { position: { plan: { userId: oyvind.id } } } }),
    prisma.positionTaskTmGoal.count({ where: { task: { position: { plan: { userId: oyvind.id } } } } }),
    prisma.planSuggestion.count({ where: { plan: { userId: oyvind.id } } }),
    prisma.goal.count({ where: { userId: oyvind.id } }),
    prisma.challengeParticipant.count({ where: { userId: oyvind.id } }),
    prisma.notification.count({ where: { userId: oyvind.id } }),
    prisma.coachingSession
      .findMany({ where: { userId: oyvind.id }, select: { messages: true } })
      .then((sessions) => sessions.reduce((sum, s) => sum + (Array.isArray(s.messages) ? s.messages.length : 0), 0)),
    prisma.booking.count({ where: { userId: oyvind.id, startAt: { gte: now } } }),
    prisma.trainingPlan.count({ where: { userId: oyvind.id } }),
    prisma.planSession.count({ where: { userId: oyvind.id } }),
    prisma.trainingSessionV2.count({ where: { studentId: oyvind.id, startTime: { gte: todayStart, lt: todayEnd } } }),
    prisma.brukerSammenligning.count({ where: { userId: oyvind.id } }),
    prisma.brukerSgInput.count({ where: { userId: oyvind.id } }),
    prisma.innboksEpost.count(),
  ]);

  const tellinger: Record<string, number> = {
    Round: round,
    HoleScore: holeScore,
    TrackManSession: trackManSession,
    "TrackManShot (siste 30d)": trackManShot30d,
    TestResult: testResult,
    FysiskPlan: fysiskPlan,
    FysUke: fysUke,
    FysOkt: fysOkt,
    FysOvelseRad: fysOvelseRad,
    TalentTracking: talentTracking,
    TechnicalPlan: technicalPlan,
    TechnicalPlanPosition: technicalPlanPosition,
    PositionTask: positionTask,
    PositionTaskTmGoal: positionTaskTmGoal,
    PlanSuggestion: planSuggestion,
    Goal: goal,
    "DrillChallenge-deltakelse (ChallengeParticipant)": drillChallengeParticipation,
    Notification: notification,
    "CoachingSession-meldinger": coachingSessionMsgCount,
    "Booking (kommende)": bookingUpcoming,
    TrainingPlan: trainingPlan,
    PlanSession: planSession,
    "TrainingSessionV2 (i dag)": trainingSessionV2Today,
    BrukerSammenligning: brukerSammenligning,
    BrukerSgInput: brukerSgInput,
    "InnboksEpost (global)": innboksEpost,
  };

  console.log(`Spiller: ${oyvind.name} (${oyvind.id})\n`);
  const tomme: string[] = [];
  for (const [model, n] of Object.entries(tellinger)) {
    console.log(`${model}: ${n}`);
    if (n === 0) tomme.push(model);
  }

  console.log("\nSTRUCTURED_RESULT_START");
  console.log(JSON.stringify({ tellinger, tomme }));
  console.log("STRUCTURED_RESULT_END");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
