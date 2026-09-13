/**
 * Syntetiske P0-TEST-roller og tre øktmodeller mot isolert HQ-Supabase.
 * Avviser WANG-stack og hostet base. Leser aldri .env.local.
 */
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { osloInstant } from "../src/lib/jarvis/dagen";
import {
  krevHqP0ApiUrl,
  krevHqP0DatabaseUrl,
} from "../src/lib/launch/p0-hq-supabase";

export const SPILLER_EPOST = "p0-spiller@akgolf.test";
export const COACH_EPOST = "p0-coach@akgolf.test";
export const FREMMED_EPOST = "p0-fremmed@akgolf.test";
export const FREMMED_COACH_EPOST = "p0-fremmed-coach@akgolf.test";
export const WB_ID = "p0-wb-okt";
export const V2_ID = "p0-v2-okt";
export const PLAN_ID = "p0-plan-okt";
export const WB_TALL = 5;
export const V2_REPS = 7;
export const V2_TREFF = 3;
export const PLAN_TALL = 4;
const CREDS_FIL = "/tmp/ak-hq-p0-creds.env";
const ONBOARDING = { onboarding: { stepCompleted: 7, isComplete: true } };

function lesStatusfelt(navn: string): string {
  const raw = process.env[navn]?.trim();
  if (!raw) throw new Error(`${navn} mangler i prosessmiljøet`);
  return raw;
}

function osloDatoDeler(naa = new Date()): { y: number; m: number; d: number; iso: string } {
  const iso = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(naa);
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d, iso };
}

async function authJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function finnAuthId(body: Record<string, unknown>, email: string): string | null {
  if (typeof body.id === "string") return body.id;
  const users = Array.isArray(body.users) ? body.users : Array.isArray(body) ? body : [];
  const treff = users.find((u) => {
    if (!u || typeof u !== "object") return false;
    return (u as { email?: string }).email === email;
  }) as { id?: string } | undefined;
  return typeof treff?.id === "string" ? treff.id : null;
}

async function authBruker(
  api: URL,
  serviceRole: string,
  email: string,
  password: string,
): Promise<string> {
  const headers = {
    Authorization: `Bearer ${serviceRole}`,
    apikey: serviceRole,
    "Content-Type": "application/json",
  };
  const created = await fetch(`${api.origin}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  let id = finnAuthId(await authJson(created), email);
  if (!created.ok || !id) {
    const listed = await fetch(`${api.origin}/auth/v1/admin/users?page=1&per_page=200`, { headers });
    if (!listed.ok) throw new Error(`Fant ikke eksisterende auth-bruker for ${email}`);
    id = finnAuthId(await authJson(listed), email);
  }
  if (!id) throw new Error(`Auth-bruker ${email} mangler etter opprettelse`);
  const oppdatert = await fetch(`${api.origin}/auth/v1/admin/users/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ password, email_confirm: true }),
  });
  if (!oppdatert.ok) throw new Error(`Kunne ikke sette passord for ${email}`);
  return id;
}

async function upsertBruker(
  prisma: PrismaClient,
  input: {
    authId: string;
    email: string;
    name: string;
    role: "PLAYER" | "COACH";
    trial: boolean;
  },
) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      authId: input.authId,
      name: input.name,
      role: input.role,
      tier: input.trial ? "PRO" : "GRATIS",
      profilType: "STANDARD",
      trialEndsAt: input.trial ? new Date("2099-01-01T00:00:00Z") : null,
      deletedAt: null,
      preferences: ONBOARDING,
    },
    create: {
      authId: input.authId,
      email: input.email,
      name: input.name,
      role: input.role,
      tier: input.trial ? "PRO" : "GRATIS",
      profilType: "STANDARD",
      trialEndsAt: input.trial ? new Date("2099-01-01T00:00:00Z") : null,
      preferences: ONBOARDING,
    },
  });
}

async function main() {
  const db = krevHqP0DatabaseUrl(process.env.P0_HQ_DATABASE_URL);
  const api = krevHqP0ApiUrl(process.env.P0_HQ_API_URL);
  const serviceRole = lesStatusfelt("SERVICE_ROLE_KEY");
  const passord = randomBytes(18).toString("base64url");
  const { y, m, d } = osloDatoDeler();
  const dato = new Date(Date.UTC(y, m - 1, d));
  const v2Start = osloInstant(y, m, d, 10, 0);
  const v2Slutt = osloInstant(y, m, d, 11, 0);
  const planStart = osloInstant(y, m, d, 14, 0);

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: db.toString() }),
  });

  try {
    await prisma.user.findFirst({ select: { id: true } });
  } catch {
    await prisma.$disconnect();
    throw new Error("HQ-skjema mangler public.users. Kjør prisma db push mot 127.0.0.1:54422, ikke WANG eller hostet base.");
  }

  try {
    const [spillerAuth, coachAuth, fremmedAuth, fremmedCoachAuth] = await Promise.all([
      authBruker(api, serviceRole, SPILLER_EPOST, passord),
      authBruker(api, serviceRole, COACH_EPOST, passord),
      authBruker(api, serviceRole, FREMMED_EPOST, passord),
      authBruker(api, serviceRole, FREMMED_COACH_EPOST, passord),
    ]);

    const coach = await upsertBruker(prisma, {
      authId: coachAuth,
      email: COACH_EPOST,
      name: "P0 Testcoach",
      role: "COACH",
      trial: false,
    });
    const spiller = await upsertBruker(prisma, {
      authId: spillerAuth,
      email: SPILLER_EPOST,
      name: "P0 Testspiller",
      role: "PLAYER",
      trial: true,
    });
    const fremmed = await upsertBruker(prisma, {
      authId: fremmedAuth,
      email: FREMMED_EPOST,
      name: "P0 Fremmed",
      role: "PLAYER",
      trial: true,
    });
    await upsertBruker(prisma, {
      authId: fremmedCoachAuth,
      email: FREMMED_COACH_EPOST,
      name: "P0 Fremmed coach",
      role: "COACH",
      trial: false,
    });

    await prisma.playerEnrollment.deleteMany({
      where: { userId: { in: [spiller.id, fremmed.id] } },
    });
    await prisma.playerEnrollment.create({
      data: { userId: spiller.id, coachId: coach.id, program: "AK_ACADEMY" },
    });

    await prisma.sessionBallLog.deleteMany({
      where: { planSessionId: { in: [WB_ID, PLAN_ID] } },
    });
    await prisma.trainingSessionV2.deleteMany({
      where: { OR: [{ id: V2_ID }, { studentId: spiller.id, title: { startsWith: "P0 " } }] },
    });
    await prisma.workbenchSession.deleteMany({
      where: { OR: [{ id: WB_ID }, { playerId: spiller.id, title: { startsWith: "P0 " } }] },
    });
    await prisma.trainingPlanSession.deleteMany({
      where: { OR: [{ id: PLAN_ID }, { title: { startsWith: "P0 " } }] },
    });

    await prisma.workbenchSession.create({
      data: {
        id: WB_ID,
        playerId: spiller.id,
        coachId: coach.id,
        date: dato,
        startMinute: 9 * 60,
        durationMinutes: 50,
        title: "P0 Workbench",
        pyramid: "TEK",
        status: "PUBLISHED",
        blockType: "OEKT",
        origin: "COACH",
        createdBy: coach.id,
        publishedAt: new Date(),
        publishedBy: coach.id,
        location: "Range",
        notes: "Syntetisk Workbench-økt",
        drills: {
          create: [{
            title: "Innspill 50-80 m",
            description: "Syntetisk drill",
            durationMinutes: 50,
            sortOrder: 0,
            akFormel: { pyramid: "TEK", area: "CHIP", label: "TEK · Chip" },
          }],
        },
      },
    });

    await prisma.trainingSessionV2.create({
      data: {
        id: V2_ID,
        title: "P0 V2 Innspill",
        studentId: spiller.id,
        coachId: coach.id,
        startTime: v2Start,
        endTime: v2Slutt,
        miljo: "M1",
        practiceType: "BLOKK",
        status: "PLANNED",
        location: "Range",
        maalsetning: `${V2_REPS} repetisjoner`,
        isCoachCreated: true,
        notes: "Syntetisk V2-økt",
        drills: {
          create: [{
            sortOrder: 0,
            name: "Hoved innspill",
            description: "Syntetisk V2-drill",
            durationMinutes: 50,
            repetitions: V2_REPS,
            pyramide: "TEK",
            repType: "BALLER_SLATT",
            repAntall: V2_REPS,
          }],
        },
      },
    });

    await prisma.trainingPlan.upsert({
      where: { id: "p0-plan" },
      update: { userId: spiller.id, isActive: true, status: "ACTIVE", name: "P0 ukeplan" },
      create: {
        id: "p0-plan",
        userId: spiller.id,
        name: "P0 ukeplan",
        startDate: dato,
        isActive: true,
        status: "ACTIVE",
        createdById: coach.id,
      },
    });
    const ovelse = await prisma.exerciseDefinition.upsert({
      where: { id: "p0-ovelse" },
      update: { name: "P0 chip", pyramidArea: "TEK", durationMin: 40 },
      create: {
        id: "p0-ovelse",
        name: "P0 chip",
        pyramidArea: "TEK",
        durationMin: 40,
        description: "Syntetisk øvelse",
      },
    });
    await prisma.trainingPlanSession.create({
      data: {
        id: PLAN_ID,
        planId: "p0-plan",
        scheduledAt: planStart,
        durationMin: 40,
        title: "P0 Eldre plan",
        pyramidArea: "TEK",
        status: "PLANNED",
        location: "Short game",
        maalsetning: `${PLAN_TALL} slag`,
        rationale: "Syntetisk eldre planøkt",
        drills: {
          create: [{
            exerciseId: ovelse.id,
            repsSets: `${PLAN_TALL} baller`,
            orderIndex: 0,
            pyramidArea: "TEK",
            repType: "BALLER_SLATT",
            repAntall: PLAN_TALL,
          }],
        },
      },
    });

    writeFileSync(
      CREDS_FIL,
      [
        `P0_PLAYER_EMAIL=${SPILLER_EPOST}`,
        `P0_PLAYER_PASSWORD=${passord}`,
        `P0_COACH_EMAIL=${COACH_EPOST}`,
        `P0_COACH_PASSWORD=${passord}`,
        `P0_FOREIGN_EMAIL=${FREMMED_EPOST}`,
        `P0_FOREIGN_PASSWORD=${passord}`,
        `P0_FOREIGN_COACH_EMAIL=${FREMMED_COACH_EPOST}`,
        `P0_FOREIGN_COACH_PASSWORD=${passord}`,
        `P0_WB_ID=${WB_ID}`,
        `P0_V2_ID=${V2_ID}`,
        `P0_PLAN_ID=${PLAN_ID}`,
        `P0_WB_TALL=${WB_TALL}`,
        `P0_V2_REPS=${V2_REPS}`,
        `P0_V2_TREFF=${V2_TREFF}`,
        `P0_PLAN_TALL=${PLAN_TALL}`,
        "",
      ].join("\n"),
      { mode: 0o600 },
    );
    process.stdout.write(`seedet V2 ${V2_ID}, Workbench ${WB_ID} og plan ${PLAN_ID}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
