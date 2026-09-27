/**
 * Syntetiske testdag/trenerføring-fixtures mot den NYE, isolerte, tomme
 * teststacken (54521/54522) — egne `tn-fullfor-20260914-*`-brukere, HELT
 * separate fra scripts/tn-demo-lokal-seed.ts (54421/54422, reserve 3011,
 * som IKKE røres av dette skriptet). Rører ikke WANG. Leser aldri .env.local.
 */
import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { skrivPrivatFil } from "./tn-demo-lokal-privatfil.mjs";

const HQ_HOST = "127.0.0.1";
const DB_PORT = "54522";
const API_PORT = "54521";
const APP_DB_NAME = "tn_fullfor_app_20260914";
const PREFIX = "tn-fullfor-20260914";
const COACH_EPOST = `${PREFIX}-sportssjef@akgolf.test`;
const ASSISTENT_EPOST = `${PREFIX}-hjelpetrener@akgolf.test`;
const SPILLER_A_EPOST = `${PREFIX}-spiller-a@akgolf.test`;
const SPILLER_B_EPOST = `${PREFIX}-spiller-b@akgolf.test`;
const UTENFOR_EPOST = `${PREFIX}-utenforstaende@akgolf.test`;
const CREDS_FIL = "/private/tmp/ak-hq-tn-fullfor-20260914/creds.env";
const ONBOARDING = { onboarding: { stepCompleted: 7, isComplete: true } };
const VOKSEN_FODT = new Date("2000-06-15T00:00:00.000Z");

function krevUrl(url: string | undefined, felt: string, port: string): URL {
  if (!url) throw new Error(`${felt} mangler`);
  const target = new URL(url);
  if (target.hostname !== HQ_HOST || target.port !== port) throw new Error(`${felt} må være ${HQ_HOST}:${port}`);
  return target;
}

function krevAppDbUrl(url: string | undefined): URL {
  const target = krevUrl(url, "DATABASE_URL", DB_PORT);
  if (target.pathname.replace(/^\//, "") !== APP_DB_NAME) throw new Error(`DATABASE_URL må peke på databasen "${APP_DB_NAME}" — ingen fallback`);
  return target;
}

async function authJson(res: Response): Promise<Record<string, unknown>> {
  try { return (await res.json()) as Record<string, unknown>; } catch { return {}; }
}
function finnAuthId(body: Record<string, unknown>, email: string): string | null {
  if (typeof body.id === "string") return body.id;
  const users = Array.isArray(body.users) ? body.users : Array.isArray(body) ? body : [];
  const treff = users.find((u) => u && typeof u === "object" && (u as { email?: string }).email === email) as { id?: string } | undefined;
  return typeof treff?.id === "string" ? treff.id : null;
}
async function authBruker(api: URL, serviceRole: string, email: string, password: string): Promise<string> {
  const headers = { Authorization: `Bearer ${serviceRole}`, apikey: serviceRole, "Content-Type": "application/json" };
  const created = await fetch(`${api.origin}/auth/v1/admin/users`, { method: "POST", headers, body: JSON.stringify({ email, password, email_confirm: true }) });
  let id = finnAuthId(await authJson(created), email);
  if (!created.ok || !id) {
    const listed = await fetch(`${api.origin}/auth/v1/admin/users?page=1&per_page=200`, { headers });
    if (!listed.ok) throw new Error(`Fant ikke auth-bruker for ${email}`);
    id = finnAuthId(await authJson(listed), email);
  }
  if (!id) throw new Error(`Auth-bruker ${email} mangler etter opprettelse`);
  const oppdatert = await fetch(`${api.origin}/auth/v1/admin/users/${id}`, { method: "PUT", headers, body: JSON.stringify({ password, email_confirm: true }) });
  if (!oppdatert.ok) throw new Error(`Kunne ikke sette passord for ${email}`);
  return id;
}

async function upsertBruker(prisma: PrismaClient, input: { authId: string; email: string; name: string; role: "PLAYER" | "COACH"; profilType: "STANDARD" | "TALENT" }) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: { authId: input.authId, name: input.name, role: input.role, tier: "GRATIS", profilType: input.profilType, dateOfBirth: input.role === "PLAYER" ? VOKSEN_FODT : null, requiresGuardianConsent: false, deletedAt: null, preferences: ONBOARDING },
    create: { authId: input.authId, email: input.email, name: input.name, role: input.role, tier: "GRATIS", profilType: input.profilType, dateOfBirth: input.role === "PLAYER" ? VOKSEN_FODT : null, requiresGuardianConsent: false, preferences: ONBOARDING },
  });
}

async function main() {
  const db = krevAppDbUrl(process.env.DATABASE_URL);
  const api = krevUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL", API_PORT);
  const serviceRole = process.env.SERVICE_ROLE_KEY;
  if (!serviceRole) throw new Error("SERVICE_ROLE_KEY mangler i prosessmiljøet");
  const passord = randomBytes(18).toString("base64url");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: db.toString() }) });
  try {
    const [coachAuth, assistentAuth, spillerAAuth, spillerBAuth, utenforAuth] = await Promise.all([
      authBruker(api, serviceRole, COACH_EPOST, passord),
      authBruker(api, serviceRole, ASSISTENT_EPOST, passord),
      authBruker(api, serviceRole, SPILLER_A_EPOST, passord),
      authBruker(api, serviceRole, SPILLER_B_EPOST, passord),
      authBruker(api, serviceRole, UTENFOR_EPOST, passord),
    ]);

    const coach = await upsertBruker(prisma, { authId: coachAuth, email: COACH_EPOST, name: "TN Fullfør Sportssjef", role: "COACH", profilType: "STANDARD" });
    const assistent = await upsertBruker(prisma, { authId: assistentAuth, email: ASSISTENT_EPOST, name: "TN Fullfør Hjelpetrener", role: "COACH", profilType: "STANDARD" });
    const spillerA = await upsertBruker(prisma, { authId: spillerAAuth, email: SPILLER_A_EPOST, name: "TN Fullfør Spiller A", role: "PLAYER", profilType: "TALENT" });
    const spillerB = await upsertBruker(prisma, { authId: spillerBAuth, email: SPILLER_B_EPOST, name: "TN Fullfør Spiller B", role: "PLAYER", profilType: "TALENT" });
    await upsertBruker(prisma, { authId: utenforAuth, email: UTENFOR_EPOST, name: "TN Fullfør Utenforstående", role: "PLAYER", profilType: "TALENT" });

    const gruppe = await prisma.group.upsert({
      where: { slug: "team-norway" },
      update: {},
      create: { name: "Team Norway Golf", slug: "team-norway", kind: "ekstern", managedByAkGolf: false },
    });

    await prisma.groupMember.upsert({ where: { groupId_userId: { groupId: gruppe.id, userId: coach.id } }, update: { role: "COACH", endedAt: null }, create: { groupId: gruppe.id, userId: coach.id, role: "COACH" } });
    await prisma.groupMember.upsert({ where: { groupId_userId: { groupId: gruppe.id, userId: assistent.id } }, update: { role: "ASSISTANT", endedAt: null }, create: { groupId: gruppe.id, userId: assistent.id, role: "ASSISTANT" } });
    await prisma.groupMember.upsert({ where: { groupId_userId: { groupId: gruppe.id, userId: spillerA.id } }, update: { role: "PLAYER", endedAt: null }, create: { groupId: gruppe.id, userId: spillerA.id, role: "PLAYER" } });
    await prisma.groupMember.upsert({ where: { groupId_userId: { groupId: gruppe.id, userId: spillerB.id } }, update: { role: "PLAYER", endedAt: null }, create: { groupId: gruppe.id, userId: spillerB.id, role: "PLAYER" } });

    skrivPrivatFil(
      CREDS_FIL,
      [
        `TN_FULLFOR_COACH_EMAIL=${COACH_EPOST}`,
        `TN_FULLFOR_COACH_PASSWORD=${passord}`,
        `TN_FULLFOR_ASSISTENT_EMAIL=${ASSISTENT_EPOST}`,
        `TN_FULLFOR_ASSISTENT_PASSWORD=${passord}`,
        `TN_FULLFOR_SPILLER_A_EMAIL=${SPILLER_A_EPOST}`,
        `TN_FULLFOR_SPILLER_A_PASSWORD=${passord}`,
        `TN_FULLFOR_SPILLER_B_EMAIL=${SPILLER_B_EPOST}`,
        `TN_FULLFOR_SPILLER_B_PASSWORD=${passord}`,
        `TN_FULLFOR_UTENFOR_EMAIL=${UTENFOR_EPOST}`,
        `TN_FULLFOR_UTENFOR_PASSWORD=${passord}`,
        `TN_FULLFOR_SPILLER_A_ID=${spillerA.id}`,
        `TN_FULLFOR_SPILLER_B_ID=${spillerB.id}`,
        "",
      ].join("\n"),
    );
    process.stdout.write(`tn-fullfor seedet: gruppe ${gruppe.id}, coach ${coach.id}, spillere ${spillerA.id}/${spillerB.id}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
