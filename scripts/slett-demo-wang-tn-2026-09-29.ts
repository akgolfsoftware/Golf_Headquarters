/**
 * Fjerner alt scripts/add-demo-wang-tn-2026-09-29.ts la inn — og bare det.
 *
 * Finner demoradene gjennom tre kjennetegn som ekte data aldri har:
 *   - gruppene med slug `wang-toppidrett-demo` og `team-norway-demo`,
 *   - spillere med e-post på @demo.invalid OG authId som starter med
 *     «demo-wang-elev-» / «demo-tn-spiller-»,
 *   - de to demotrenerne (demo.sportssjef@wang.no, demo.trener@golfforbundet.no).
 * Sletter økter, testresultater, testdager, perioder, samlinger, poster,
 * delingssamtykker, medlemskap, gruppene, demospillerne, demotrenerne i
 * databasen og i Supabase-auth, og DEMO_*-linjene bakerst i .env.local.
 *
 * Sletting er permanent. Kjøres bare når Anders ber om det:
 *   npx tsx scripts/slett-demo-wang-tn-2026-09-29.ts --bekreft
 * Uten --bekreft vises bare hva som ville blitt slettet.
 */

import { readFileSync, writeFileSync } from "node:fs";

import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

import { PrismaClient } from "../src/generated/prisma/client";
import { DEMO, DEMO_ENV_FIL } from "./_demo-wang-tn-2026-09-29";

function krevEnv(navn: string): string {
  const v = process.env[navn];
  if (!v) throw new Error(`${navn} mangler i ${DEMO_ENV_FIL}`);
  return v;
}

const bekreft = process.argv.includes("--bekreft");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: krevEnv("DATABASE_URL") }) });
const supabase = createClient(krevEnv("NEXT_PUBLIC_SUPABASE_URL"), krevEnv("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const omraader = [DEMO.wang, DEMO.tn];
  const grupper = await prisma.group.findMany({ where: { slug: { in: omraader.map((d) => d.slug) } }, select: { id: true, slug: true } });
  const gruppeIder = grupper.map((g) => g.id);
  const spillere = await prisma.user.findMany({
    where: {
      email: { endsWith: "@demo.invalid" },
      OR: omraader.map((d) => ({ authId: { startsWith: d.authPrefiks } })),
    },
    select: { id: true },
  });
  const spillerIder = spillere.map((s) => s.id);
  const trenere = await prisma.user.findMany({ where: { email: { in: omraader.map((d) => d.epost) } }, select: { id: true, email: true, authId: true } });
  const trenerIder = trenere.map((t) => t.id);

  console.log(`Fant ${grupper.length} demogrupper, ${spillerIder.length} demospillere, ${trenere.length} demotrenere.`);
  if (!bekreft) {
    console.log("Ingenting slettet. Kjør med --bekreft for å slette.");
    return;
  }

  const steg: Array<[string, () => Promise<{ count: number }>]> = [
    ["økter", () => prisma.workbenchSession.deleteMany({ where: { OR: [{ playerId: { in: spillerIder } }, { groupId: { in: gruppeIder } }] } })],
    ["testdager", () => prisma.testDay.deleteMany({ where: { groupId: { in: gruppeIder } } })],
    ["testresultater", () => prisma.testResult.deleteMany({ where: { userId: { in: spillerIder } } })],
    ["delingssamtykker", () => prisma.delingsSamtykke.deleteMany({ where: { OR: [{ userId: { in: spillerIder } }, { mottakerGruppeId: { in: gruppeIder } }] } })],
    ["gruppeposter", () => prisma.tnPost.deleteMany({ where: { OR: [{ groupId: { in: gruppeIder } }, { authorUserId: { in: trenerIder } }] } })],
    ["perioder", () => prisma.trainingPeriod.deleteMany({ where: { groupId: { in: gruppeIder } } })],
    ["samlinger", () => prisma.groupSchedule.deleteMany({ where: { groupId: { in: gruppeIder } } })],
    ["medlemskap", () => prisma.groupMember.deleteMany({ where: { groupId: { in: gruppeIder } } })],
    ["grupper", () => prisma.group.deleteMany({ where: { id: { in: gruppeIder } } })],
    ["demospillere", () => prisma.user.deleteMany({ where: { id: { in: spillerIder } } })],
    ["demotrenere", () => prisma.user.deleteMany({ where: { id: { in: trenerIder } } })],
  ];
  for (const [navn, kjor] of steg) {
    try {
      const { count } = await kjor();
      console.log(`Slettet ${count} ${navn}.`);
    } catch (e) {
      console.error(`Kunne ikke slette ${navn}: ${e instanceof Error ? e.message : String(e)}`);
      process.exitCode = 1;
    }
  }

  for (const t of trenere) {
    const { error } = await supabase.auth.admin.deleteUser(t.authId);
    console.log(error ? `Auth-bruker ${t.email}: ${error.message}` : `Slettet auth-bruker ${t.email}.`);
  }

  const env = readFileSync(DEMO_ENV_FIL, "utf8");
  const renset = env
    .split("\n")
    .filter((l) => !/^DEMO_(WANG|TN)_(EPOST|PASSORD)=/.test(l) && !l.startsWith("# Demobruker "))
    .join("\n");
  if (renset !== env) {
    writeFileSync(DEMO_ENV_FIL, renset);
    console.log("Fjernet DEMO_*-linjene fra .env.local.");
  }
}

main()
  .catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
