/**
 * Svar på fasilitetsspørsmålene for screentest@akgolf.test, så Meg › Fasiliteter (PH-24) viser dekning av de
 * 19 treningsområdene som i tegningen (docs/design-system/utkast-playerhq/meg.html, «fasiliteter»: 17 av 19,
 * bunker og putter over 40 fot mangler).
 *
 * SCOPE: bare preferences.onboarding.fasilitetOmrader på testkontoen. Resten av preferences beholdes.
 * Idempotent. Kjør: npx tsx scripts/seed-screentest-fasiliteter.ts
 */
import "./_env";

import { prisma } from "@/lib/prisma";
import { OMRADER } from "@/lib/onboarding/oppstart";

async function main() {
  const u = await prisma.user.findUnique({ where: { email: "screentest@akgolf.test" }, select: { id: true, preferences: true } });
  if (!u) throw new Error("Fant ikke screentest@akgolf.test");
  const prefs = u.preferences && typeof u.preferences === "object" ? (u.preferences as Record<string, unknown>) : {};
  const onboarding = prefs.onboarding && typeof prefs.onboarding === "object" ? (prefs.onboarding as Record<string, unknown>) : {};
  const omrader = OMRADER.filter((o) => o !== "Bunker" && o !== "Putting 40+ fot");
  await prisma.user.update({ where: { id: u.id }, data: { preferences: { ...prefs, onboarding: { ...onboarding, fasilitetOmrader: omrader } } } });
  console.log(`Fasilitetsområder satt: ${omrader.length} av ${OMRADER.length}.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
