/** Isolert, syntetisk prøvegrunnlag. Ingen miljøfiler, e-post eller produksjonskall. */
import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type UserRole } from "../src/generated/prisma/client";
import { NAVNGITT_PROFIL_SCOPE, NAVNGITT_PROFIL_TEKST_VERSJON } from "../src/lib/deling/navngitt-regler";
const local = JSON.parse(readFileSync("tmp/upgrade/local/status.json", "utf8")) as Record<string, string>;
const api = new URL(local.API_URL), db = new URL(local.DB_URL);
if (api.origin !== "http://127.0.0.1:55321" || db.hostname !== "127.0.0.1" || db.port !== "55322" || db.pathname !== "/postgres") throw new Error("Bare oppgraderingens isolerte testmiljø tillatt.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: local.DB_URL }) });
const actors: { id: string; email: string; name: string; role: UserRole; dateOfBirth?: Date; junior?: boolean }[] = [
  { id: "upgrade-wang-coach", email: "ak-hq-upgrade-local-20261012@wang.no", name: "Syntetisk WANG-coach", role: "COACH" },
  { id: "upgrade-tn-coach", email: "ak-hq-upgrade-local-20261012@golfforbundet.no", name: "Syntetisk TN-coach", role: "COACH" },
  { id: "upgrade-outside-coach", email: "ak-hq-upgrade-outside-local-20261012@wang.no", name: "Syntetisk utenforstående coach", role: "COACH" },
  { id: "upgrade-wang-player", email: "upgrade-wang-player@akgolf.test", name: "Syntetisk WANG-spiller", role: "PLAYER", dateOfBirth: new Date("2008-01-01") },
  { id: "upgrade-tn-player", email: "upgrade-tn-player@akgolf.test", name: "Syntetisk TN-spiller", role: "PLAYER", dateOfBirth: new Date("2007-01-01") },
  { id: "upgrade-junior", email: "upgrade-junior@akgolf.test", name: "Syntetisk juniorspiller", role: "PLAYER", dateOfBirth: new Date("2012-01-01"), junior: true },
  { id: "upgrade-parent", email: "upgrade-parent@akgolf.test", name: "Syntetisk foresatt", role: "PARENT" },
];
async function main() {
  try {
    const marker = await prisma.$queryRaw<{ marker: string | null }[]>`select obj_description(oid, 'pg_namespace') as marker from pg_namespace where nspname='public'`;
    if (marker[0]?.marker !== "AK_HQ_UPGRADE_LOCAL_SYNTHETIC_20261012") throw new Error("Feil testdatabase.");
    if (await prisma.user.count({ where: { id: { in: actors.map(a => a.id) } } }) || await prisma.group.count({ where: { slug: { in: ["wang-toppidrett", "team-norway"] } } })) throw new Error("Prøvegrunnlaget finnes allerede; ingenting overskrives.");
    const original = await prisma.user.findUnique({ where: { id: "upgrade-coach" }, select: { email: true } });
    if (original?.email !== "upgrade-coach@akgolf.test") throw new Error("Opprinnelig syntetisk konto mangler.");
    const password = randomBytes(24).toString("base64url");
    const users: (typeof actors[number] & { authId: string })[] = [];
    for (const actor of actors) {
      const response = await fetch(`${api.origin}/auth/v1/admin/users`, { method: "POST", headers: {
        Authorization: `Bearer ${local.SERVICE_ROLE_KEY}`, apikey: local.SERVICE_ROLE_KEY, "Content-Type": "application/json",
      }, body: JSON.stringify({ email: actor.email, password, email_confirm: true }) });
      const result = await response.json() as { id?: string };
      if (!response.ok || !result.id) throw new Error("Lokal Auth-konto kunne ikke opprettes.");
      users.push({ ...actor, authId: result.id });
    }
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
    await prisma.$transaction(async tx => {
      for (const { junior, ...user } of users) await tx.user.create({ data: { ...user, tier: "PRO", trialEndsAt: new Date("2099-01-01"),
        requiresGuardianConsent: junior ?? false, guardianConsentGivenAt: junior ? new Date() : null,
        preferences: { onboarding: { stepCompleted: 7, isComplete: true } } } });
      for (const childId of ["upgrade-junior", "upgrade-wang-player"]) await tx.parentRelation.create({ data: { parentId: "upgrade-parent", childId, approved: true } });
      const groups = [
        { id: "upgrade-wang-group", slug: "wang-toppidrett", name: "WANG Toppidrett · syntetisk prøve", coachId: "upgrade-wang-coach", players: ["upgrade-wang-player", "upgrade-junior"] },
        { id: "upgrade-tn-group", slug: "team-norway", name: "Team Norway · syntetisk prøve", coachId: "upgrade-tn-coach", players: ["upgrade-tn-player"] },
      ];
      for (const group of groups) {
        const { players, ...fields } = group;
        await tx.group.create({ data: { ...fields, hovedcoachId: fields.coachId, kind: "kontrakt", managedByAkGolf: true,
          program: fields.slug === "wang-toppidrett" ? "WANG_TOPPIDRETT" : null,
          members: { create: [{ userId: fields.coachId, role: "COACH" }, ...players.map(userId => ({ userId, role: "PLAYER" }))] } } });
        await tx.groupSchedule.create({ data: { id: `${group.id}-schedule`, groupId: group.id, title: "Syntetisk gruppeøkt",
          startAt: new Date(`${today}T08:00:00+02:00`), endAt: new Date(`${today}T10:00:00+02:00`), kind: "SAMLING",
          location: "Syntetisk treningsanlegg", description: "Program: avstandskontroll og oppsummering. Reise: oppmøte ved treningsanlegget. Ansvarlig: syntetisk coach. Oppfølging: individuell vurdering etter økta." } });
        for (const playerId of players) {
          const id = randomUUID(), guardian = playerId === "upgrade-junior", giver = guardian ? "upgrade-parent" : playerId;
          const recipient = users.find(u => u.id === group.coachId)!;
          await tx.trenerDelingsInvitasjon.create({ data: { id, userId: playerId, mottakerGruppeId: group.id,
            mottakerEpost: recipient.email, tokenHash: createHash("sha256").update(randomBytes(32)).digest("hex"),
            tekstVersjon: NAVNGITT_PROFIL_TEKST_VERSJON, gittAvUserId: giver, gittAvRolle: guardian ? "FORESATT" : "SELV",
            expiresAt: new Date(Date.now() + 7 * 86400000), acceptedAt: new Date(), acceptedByUserId: group.coachId } });
          await tx.delingsSamtykke.create({ data: { id, userId: playerId, scope: NAVNGITT_PROFIL_SCOPE,
            mottakerGruppeId: group.id, mottakerUserId: group.coachId, gitt: true, tekstVersjon: NAVNGITT_PROFIL_TEKST_VERSJON,
            gittAvUserId: giver, gittAvRolle: guardian ? "FORESATT" : "SELV" } });
        }
      }
    });
    writeFileSync("tmp/upgrade/local/org-creds.json", JSON.stringify({ users: users.map(({ junior: _junior, ...user }) => user), password }), { mode: 0o600 });
    console.log("Sju nye syntetiske kontoer, to miljøer og avgrenset deling opprettet kun lokalt. Ingen e-post sendt.");
  } finally { await prisma.$disconnect(); }
}
main().catch(() => { console.error("Isolert organisasjonsprøve kunne ikke opprettes. Ingen produksjonskall gjort."); process.exitCode = 1; });
