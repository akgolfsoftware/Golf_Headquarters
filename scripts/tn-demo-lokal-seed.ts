/**
 * Syntetiske Team Norway-demoroller mot isolert HQ-Supabase (samme stack som
 * scripts/p0-test-seed-hq.ts, port 54421/54422). Rører ikke WANG-stacken,
 * leser aldri .env.local, og skriver aldri mot hostet database.
 *
 * Egen, idempotent seed for TN-demoøkten 14.09.2026 — bruker et unikt
 * `tn-demo-20260914-`-prefiks på alle egne rader, og oppretter/gjenbruker
 * KUN den kanoniske "team-norway"-gruppen (én rad, slug er unik). Ingen ny
 * modell, ingen skjemaendring — kun eksisterende Prisma-tabeller.
 *
 * VIKTIG forskjell fra scripts/tn-demo-lokal-standby.mjs: DETTE skriptet
 * ROTERER testpassordet (nytt tilfeldig passord hver kjøring, skrevet til
 * CREDS_FIL) og NULLSTILLER egne fixture-testresultater for putt-1-3m-
 * protokollen (se opprydding under). En ny kjøring av tn-demo-lokal-seed.ts
 * ETTER en bevist demoreise vil derfor ugyldiggjøre de gamle credentials'ene
 * og fjerne det viste resultatet. Standby-skriptet gjør ALDRI dette — det
 * starter kun en Next-instans mot data som allerede finnes.
 */
import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { tnProtocol } from "../src/lib/portal-tester/tn-catalog";
import {
  krevHqP0ApiUrl,
  krevHqP0DatabaseUrl,
} from "../src/lib/launch/p0-hq-supabase";
import { skrivPrivatFil, renFeilmelding } from "./tn-demo-lokal-privatfil.mjs";

const PREFIX = "tn-demo-20260914";
export const COACH_EPOST = `${PREFIX}-sportssjef@akgolf.test`;
export const SPILLER_EPOST = `${PREFIX}-spiller@akgolf.test`;
export const UTENFOR_EPOST = `${PREFIX}-utenforstaende@akgolf.test`;
export const GRUPPE_NAVN = "Team Norway Golf";
export const PROTOKOLL_ID = "putt-1-3m";
const CREDS_FIL = "/tmp/ak-hq-tn-demo-creds.env";
const ONBOARDING = { onboarding: { stepCompleted: 7, isComplete: true } };
// Voksen syntetisk fødselsdato — unngår requiresGuardianConsent-flyten i en
// tidsbegrenset demo (se statusrapporten §Demooppskrift).
const VOKSEN_FODT = new Date("2000-06-15T00:00:00.000Z");

function lesStatusfelt(navn: string): string {
  const raw = process.env[navn]?.trim();
  if (!raw) throw new Error(`${navn} mangler i prosessmiljøet`);
  return raw;
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

async function authBruker(api: URL, serviceRole: string, email: string, password: string): Promise<string> {
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
  input: { authId: string; email: string; name: string; role: "PLAYER" | "COACH"; profilType: "STANDARD" | "TALENT" },
) {
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      authId: input.authId,
      name: input.name,
      role: input.role,
      tier: "GRATIS",
      profilType: input.profilType,
      dateOfBirth: input.role === "PLAYER" ? VOKSEN_FODT : null,
      requiresGuardianConsent: false,
      deletedAt: null,
      preferences: ONBOARDING,
    },
    create: {
      authId: input.authId,
      email: input.email,
      name: input.name,
      role: input.role,
      tier: "GRATIS",
      profilType: input.profilType,
      dateOfBirth: input.role === "PLAYER" ? VOKSEN_FODT : null,
      requiresGuardianConsent: false,
      preferences: ONBOARDING,
    },
  });
}

async function main() {
  const db = krevHqP0DatabaseUrl(process.env.P0_HQ_DATABASE_URL);
  const api = krevHqP0ApiUrl(process.env.P0_HQ_API_URL);
  const serviceRole = lesStatusfelt("SERVICE_ROLE_KEY");
  const passord = randomBytes(18).toString("base64url");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: db.toString() }) });

  try {
    await prisma.user.findFirst({ select: { id: true } });
  } catch {
    await prisma.$disconnect();
    throw new Error(
      "HQ-skjema mangler public.users i den isolerte databasen. Dette skriptet anbefaler IKKE en automatisk skjemaendring — " +
        "følg prosjektets egne lokale testdatabase-oppskrifter manuelt (docs/utvikling/lokal-testdatabase.md og " +
        ".claude/rules/gotchas.md §Schema-endringer), og kun mot 127.0.0.1:54422 — aldri WANG eller hostet base.",
    );
  }

  try {
    const [coachAuth, spillerAuth, utenforAuth] = await Promise.all([
      authBruker(api, serviceRole, COACH_EPOST, passord),
      authBruker(api, serviceRole, SPILLER_EPOST, passord),
      authBruker(api, serviceRole, UTENFOR_EPOST, passord),
    ]);

    const coach = await upsertBruker(prisma, { authId: coachAuth, email: COACH_EPOST, name: "TN Demo Sportssjef", role: "COACH", profilType: "STANDARD" });
    // profilType "TALENT" er den ekte, gratis-for-alltid tilgangen som
    // `resolveTilgang` (src/lib/feature-flags.ts) gir TALENT-nivå — nødvendig
    // for at requirePortalUser({ kreverTilgang: "TALENT" }) på testføringen
    // skal la spilleren inn, uten å simulere abonnement/kjøp/gruppetilgang.
    const spiller = await upsertBruker(prisma, { authId: spillerAuth, email: SPILLER_EPOST, name: "TN Demo Spiller", role: "PLAYER", profilType: "TALENT" });
    // Utenforstående: myndig spiller uten NOE medlemskap i team-norway-gruppen.
    // Brukes til å bevise at siden avviser uvedkommende, ikke bare til å
    // demonstrere den positive reisen.
    await upsertBruker(prisma, { authId: utenforAuth, email: UTENFOR_EPOST, name: "TN Demo Utenforstående", role: "PLAYER", profilType: "TALENT" });

    // Kanonisk gruppe (slug er unik) — idempotent. `update: {}` er bevisst: en
    // eksisterende team-norway-rad (f.eks. fra en annen lokal testkjøring)
    // skal ALDRI få navn/kind/program overskrevet av denne demoseeden.
    const gruppe = await prisma.group.upsert({
      where: { slug: "team-norway" },
      update: {},
      create: { name: GRUPPE_NAVN, slug: "team-norway", kind: "ekstern", managedByAkGolf: false },
    });

    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: gruppe.id, userId: coach.id } },
      update: { role: "COACH", endedAt: null },
      create: { groupId: gruppe.id, userId: coach.id, role: "COACH" },
    });
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: gruppe.id, userId: spiller.id } },
      update: { role: "PLAYER", endedAt: null },
      create: { groupId: gruppe.id, userId: spiller.id, role: "PLAYER" },
    });

    // Protokollen bekreftes å finnes i katalogen, men tildelingen (TestAssignment)
    // opprettes IKKE her — den skal opprettes av coachen via den eksisterende
    // /admin/tester/tildel/[spillerId]-skjermen i selve prøven. Å seede
    // TestAssignment direkte ville bare vist at spillerføringen virker, ikke
    // at coach-tildelingsreisen faktisk fungerer i ekte kode.
    const protokoll = tnProtocol(PROTOKOLL_ID);
    if (!protokoll) throw new Error(`Protokoll ${PROTOKOLL_ID} finnes ikke i katalogen`);

    // Rydd rester fra en tidligere kjøring av DENNE demoens EGEN syntetiske
    // spiller (aldri andre brukere) — tildeling, øktutkast og testresultat
    // for denne ene protokollen — slik at prøven alltid starter fra "0
    // tester, ingen åpen tildeling" og de eksakte tallpåstandene i spec-en
    // holder ved gjentatt kjøring.
    const definitionId = `tn-v3-${protokoll.id}`;
    await prisma.testAssignment.deleteMany({ where: { playerId: spiller.id, coachId: coach.id, testId: definitionId } });
    await prisma.testSession.deleteMany({ where: { userId: spiller.id, testId: definitionId } });
    await prisma.testResult.deleteMany({ where: { userId: spiller.id, testId: definitionId } });

    skrivPrivatFil(
      CREDS_FIL,
      [
        `TN_DEMO_COACH_EMAIL=${COACH_EPOST}`,
        `TN_DEMO_COACH_PASSWORD=${passord}`,
        `TN_DEMO_PLAYER_EMAIL=${SPILLER_EPOST}`,
        `TN_DEMO_PLAYER_PASSWORD=${passord}`,
        `TN_DEMO_OUTSIDER_EMAIL=${UTENFOR_EPOST}`,
        `TN_DEMO_OUTSIDER_PASSWORD=${passord}`,
        `TN_DEMO_PLAYER_ID=${spiller.id}`,
        `TN_DEMO_PROTOCOL_ID=${protokoll.id}`,
        `TN_DEMO_PROTOCOL_NAME=${protokoll.name}`,
        "",
      ].join("\n"),
    );
    process.stdout.write(`TN-demo seedet: gruppe ${gruppe.id}, coach ${coach.id}, spiller ${spiller.id} (ingen tildeling seedet — opprettes av coach i prøven)\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  process.stderr.write(`${renFeilmelding(error)}\n`);
  process.exit(1);
});
