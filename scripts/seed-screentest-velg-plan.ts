/**
 * Turneringsnivå for screentest@akgolf.test, så Velg treningsplan (PH-12) anbefaler en standardplan som i
 * tegningen (docs/design-system/utkast-playerhq/ovelser.html, «velg»: Konkurransespilleren).
 *
 * SCOPE: bare preferences.onboarding.konkurranseNivaa på testkontoen. Resten av preferences beholdes.
 * Idempotent. Kjør: npx tsx scripts/seed-screentest-velg-plan.ts
 */
import "./_env";

import { prisma } from "@/lib/prisma";

async function main() {
  const u = await prisma.user.findUnique({ where: { email: "screentest@akgolf.test" }, select: { id: true, preferences: true } });
  if (!u) throw new Error("Fant ikke screentest@akgolf.test");
  const prefs = u.preferences && typeof u.preferences === "object" ? (u.preferences as Record<string, unknown>) : {};
  const onboarding = prefs.onboarding && typeof prefs.onboarding === "object" ? (prefs.onboarding as Record<string, unknown>) : {};
  await prisma.user.update({ where: { id: u.id }, data: { preferences: { ...prefs, onboarding: { ...onboarding, konkurranseNivaa: "REGION" } } } });
  console.log("Turneringsnivå satt til REGION for screentest.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
