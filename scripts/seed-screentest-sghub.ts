/**
 * Én TrackMan-økt med slag per kølle for screentest@akgolf.test, så coachens SG-hub
 * (/portal/mal/sg-hub/coach/[spillerId], per kølle og Equipment Fit) har data å vise.
 *
 * rawJson er CSV-radene som TrackMan-importen lagrer (Club, Shot, Club Speed, Club Path, Face Angle, Face to Path,
 * Smash Factor, Ball Speed, Total, Launch Angle, Spin Rate). Tallene er faste og realistiske for en
 * kategori C-spiller: Driver, 7-jern og PW, 12 slag hver.
 *
 * SCOPE: bare raden med source = SEED_KILDE på testkontoen. Idempotent: sletter raden før den lages på nytt.
 * Kjør: npx tsx scripts/seed-screentest-sghub.ts
 */
import "./_env";

import { prisma } from "@/lib/prisma";

const SEED_KILDE = "seed:designkontroll-sghub";

const KOLLER = [
  { club: "Driver", speed: 104, smash: 1.46, total: 238, launch: 12.4, spin: 2650 },
  { club: "7i", speed: 82, smash: 1.36, total: 148, launch: 17.6, spin: 6900 },
  { club: "PW", speed: 72, smash: 1.22, total: 112, launch: 26.5, spin: 8800 },
];

/** Fast variasjon per slag (ingen tilfeldighet, så bildene blir like hver gang). */
const v = (i: number, k: number) => Math.sin(i * 1.7 + k * 2.3);
const f = (n: number, d: number) => n.toFixed(d);

async function main() {
  const u = await prisma.user.findUnique({ where: { email: "screentest@akgolf.test" }, select: { id: true } });
  if (!u) throw new Error("Fant ikke screentest@akgolf.test");

  const rader = KOLLER.flatMap((k, ki) => Array.from({ length: 12 }, (_, i) => {
    const path = 1.2 + v(i, ki) * 2.4;
    const face = 0.4 + v(i + 3, ki) * 1.8;
    const speed = k.speed + v(i, ki + 5) * 2.5;
    const smash = k.smash + v(i + 7, ki) * 0.03;
    return {
      Club: k.club, Shot: String(i + 1),
      "Club Speed": f(speed, 1), "Club Path": f(path, 1), "Face Angle": f(face, 1), "Face to Path": f(face - path, 1),
      "Smash Factor": f(smash, 2), "Ball Speed": f(speed * smash, 1), Total: f(k.total + v(i + 2, ki) * 8, 0),
      "Launch Angle": f(k.launch + v(i + 4, ki) * 1.2, 1), "Spin Rate": f(k.spin + v(i + 6, ki) * 350, 0),
    };
  }));

  const naa = new Date();
  await prisma.trackManSession.deleteMany({ where: { userId: u.id, source: SEED_KILDE } });
  await prisma.trackManSession.create({
    data: { userId: u.id, source: SEED_KILDE, recordedAt: new Date(naa.getTime() - 3 * 86_400_000), shotCount: rader.length, rawJson: rader },
  });
  console.log(`TrackMan-økt lagt inn: ${rader.length} slag (${KOLLER.map((k) => k.club).join(", ")}).`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
