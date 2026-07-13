/**
 * Seed en innloggbar test-COACH (ADMIN) for AgencyOS skjerm-paritet —
 * MED komplett demo-stall som matcher Claude Design-fasiten.
 *
 * Login: coachtest@akgolf.test / SCREENTEST_PASSWORD i .env.local  (Anders Kristiansen, kanon coach)
 *
 * Seeder (idempotent — kan kjøres flere ganger):
 *  - 38 spillere totalt (8 navngitte kanon-spillere + anonyme @stall.akgolf.test)
 *  - 4 grupper med medlemmer (WANG-gruppen 12, GFGK Elite 18, Junior 8, Mosjonist resten)
 *  - 4 bookinger I DAG (dashboard-timeline) + 12 kommende bookinger
 *  - 4 PENDING SessionRequest (foresporsler-siden)
 *  - 3 PENDING PlanAction (approvals-siden)
 *  - 5 OppgaveCache-rader via demo-NotionConnection (workspace/oppgaver + dashboard)
 *  - 4 DIRECT CoachingSession-tråder (innboks)
 *  - 3 uleste Notification til coachen
 *  - PRO-abonnement på alle stall-spillere (MRR-grunnlag)
 *
 * Rører ALDRI screentest@akgolf.test (PlayerHQ-sporet) eller andre eksisterende
 * brukere. Egne demo-rader gjenkjennes på e-post-mønsteret *@stall.akgolf.test,
 * demo-ServiceType-slugs (demo-stall-*) og demo-Notion-IDer (demo-stall-*).
 *
 * Kjør: npx tsx scripts/seed-screentest-coach.ts
 */

import "./_env";

import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = "coachtest@akgolf.test";
const PASSWORD = process.env.SCREENTEST_PASSWORD ?? "";
if (!PASSWORD) {
  console.error("SCREENTEST_PASSWORD mangler i .env.local");
  process.exit(1);
}
const NAME = "Anders Kristiansen";

const STALL_DOMAIN = "stall.akgolf.test";
const TARGET_PLAYERS = 38;

// ---------- Hjelpere ----------

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Lokal dato i dag kl h:m (+ dayOffset dager). */
function at(h: number, m: number, dayOffset = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Neste forekomst av ukedag (JS getDay: søn=0 … lør=6). I dag teller hvis samme dag. */
function nextWeekday(target: number, h = 12): Date {
  const d = new Date();
  const diff = (target - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  d.setHours(h, 0, 0, 0);
  return d;
}

function hoursAgo(n: number): Date {
  return new Date(Date.now() - n * 3_600_000);
}

// ---------- Kanon-data ----------

type NamedPlayer = {
  name: string;
  hcp: number; // golf "+0,4" lagres som -0.4 (samme konvensjon som eksisterende data)
  homeClub: string;
  school?: string;
  ambition: string;
  lastLoginDaysAgo: number;
};

// Øyvind Rohjan håndteres separat (finnes trolig som screentest@akgolf.test — gjenbrukes, røres ikke).
const NAMED_PLAYERS: NamedPlayer[] = [
  { name: "Sofie Kvam", hcp: 2.8, homeClub: "Gamle Fredrikstad GK", ambition: "Konkurranse", lastLoginDaysAgo: 0 },
  { name: "Emilie Borg", hcp: 5.4, homeClub: "Gamle Fredrikstad GK", school: "WANG Toppidrett Fredrikstad", ambition: "Konkurranse", lastLoginDaysAgo: 1 },
  { name: "Karl Ludvig", hcp: -0.4, homeClub: "Gamle Fredrikstad GK", ambition: "Konkurranse", lastLoginDaysAgo: 0 },
  { name: "Jonas Hauge", hcp: 3.1, homeClub: "Gamle Fredrikstad GK", ambition: "Konkurranse", lastLoginDaysAgo: 8 }, // INAKTIV 5+ dager
  { name: "Andrea Lund", hcp: 8.2, homeClub: "Gamle Fredrikstad GK", ambition: "Junior", lastLoginDaysAgo: 1 },
  { name: "Tobias Strand", hcp: 11.0, homeClub: "Gamle Fredrikstad GK", ambition: "Junior", lastLoginDaysAgo: 2 },
  { name: "Mia Nilsen", hcp: 1.9, homeClub: "Gamle Fredrikstad GK", school: "WANG Toppidrett Fredrikstad", ambition: "Konkurranse", lastLoginDaysAgo: 0 },
];

// Anonyme demo-spillere — opprettes bare så mange som trengs for å nå 38 totalt.
const ANON_PLAYERS: Array<{ name: string; hcp: number }> = [
  { name: "Henrik Aas", hcp: 6.3 }, { name: "Martin Solheim", hcp: 12.1 },
  { name: "Ingrid Bakke", hcp: 9.4 }, { name: "Camilla Foss", hcp: 15.2 },
  { name: "Lars Nygård", hcp: 4.7 }, { name: "Petter Holm", hcp: 18.9 },
  { name: "Nora Lien", hcp: 7.8 }, { name: "Sander Vik", hcp: 2.4 },
  { name: "Thea Moen", hcp: 13.6 }, { name: "Oskar Brekke", hcp: 21.3 },
  { name: "Julie Tangen", hcp: 10.5 }, { name: "Magnus Lunde", hcp: 5.9 },
  { name: "Selma Ruud", hcp: 16.8 }, { name: "Adrian Falk", hcp: 8.7 },
  { name: "Ida Sæther", hcp: 14.4 }, { name: "Mikkel Hagen", hcp: 3.8 },
  { name: "Vilde Strøm", hcp: 19.6 }, { name: "Eirik Dahl", hcp: 11.7 },
  { name: "Hedda Wold", hcp: 24.1 }, { name: "Sindre Løken", hcp: 6.6 },
  { name: "Amalie Rød", hcp: 17.3 }, { name: "Kasper Eide", hcp: 9.9 },
  { name: "Tuva Lindgren", hcp: 22.5 }, { name: "Johannes Myhre", hcp: 7.2 },
  { name: "Frida Aamodt", hcp: 12.8 }, { name: "Even Solberg", hcp: 4.1 },
  { name: "Maja Husby", hcp: 20.7 }, { name: "Brage Fjeld", hcp: 15.9 },
  { name: "Live Onsrud", hcp: 25.4 }, { name: "Storm Halvorsen", hcp: 10.2 },
];

// Demo-ServiceTypes for økt-titler i dashboard-timeline (title = serviceType.name).
// active=false så de aldri dukker opp i den offentlige booking-flyten.
const DEMO_SERVICES = [
  { slug: "demo-stall-tek-sekvens", name: "Sekvens P4–P8 · balltreff", durationMin: 60 },
  { slug: "demo-stall-slag-innspill", name: "Innspill 50–80 m · presisjon", durationMin: 60 },
  { slug: "demo-stall-tek-putt", name: "Putt-konsistens 4 m · TEST", durationMin: 45 },
  { slug: "demo-stall-spill-9hull", name: "9-hulls spillsimulering", durationMin: 90 },
  { slug: "demo-stall-coaching-60", name: "Coaching 60 min", durationMin: 60 },
] as const;

const DEMO_AGENTS = ["kalender-agent", "plan-agent", "turnerings-agent"];

// ---------- Auth ----------

async function ensureAuthUser(): Promise<string> {
  const created = await admin.auth.admin.createUser({
    email: EMAIL, password: PASSWORD, email_confirm: true,
    user_metadata: { role: "ADMIN", tier: "PRO", firstName: "Anders", lastName: "Kristiansen" },
  });
  if (created.data.user) { console.log(`Auth-bruker opprettet: ${created.data.user.id}`); return created.data.user.id; }
  const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list.data.users.find((u) => u.email === EMAIL);
  if (!existing) throw new Error(`Kunne ikke opprette/finne auth-bruker: ${created.error?.message}`);
  await admin.auth.admin.updateUserById(existing.id, {
    password: PASSWORD, email_confirm: true,
    user_metadata: { role: "ADMIN", tier: "PRO", firstName: "Anders", lastName: "Kristiansen" },
  });
  console.log(`Auth-bruker fantes — passord resatt: ${existing.id}`);
  return existing.id;
}

// ---------- Main ----------

async function main() {
  console.log("Seeder skjermtest-coach (Anders Kristiansen, ADMIN) + demo-stall...");
  const authId = await ensureAuthUser();
  const coach = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { authId, name: NAME, role: "ADMIN", tier: "PRO", homeClub: "Oslo GK" },
    create: { authId, email: EMAIL, name: NAME, role: "ADMIN", tier: "PRO", homeClub: "Oslo GK" },
  });
  console.log(`Coach-User: ${coach.id}`);

  // ── 1. Spillere ─────────────────────────────────────────────────────────
  // Øyvind Rohjan: ALLTID dedikert demo-bruker — ALDRI screentest-spilleren
  // (screentest tilhører PlayerHQ-sporet; deling av rader lekker inn i deres godkjente skjermer).
  const oyvind = await prisma.user.upsert({
    where: { email: `oyvind-rohjan@${STALL_DOMAIN}` },
    update: { name: "Øyvind Rohjan", role: "PLAYER", tier: "PRO", hcp: 4.2, homeClub: "Oslo GK" },
    create: {
      authId: "stall-oyvind-rohjan", email: `oyvind-rohjan@${STALL_DOMAIN}`,
      name: "Øyvind Rohjan", role: "PLAYER", tier: "PRO", hcp: 4.2, homeClub: "Oslo GK",
    },
  });
  console.log(`Øyvind Rohjan (demo-stall): ${oyvind.id}`);

  const named: Record<string, { id: string; name: string }> = { "Øyvind Rohjan": { id: oyvind.id, name: oyvind.name } };
  for (const p of NAMED_PLAYERS) {
    const slug = slugify(p.name);
    const email = `${slug}@${STALL_DOMAIN}`;
    const lastLoginAt = new Date(Date.now() - p.lastLoginDaysAgo * 86_400_000);
    const u = await prisma.user.upsert({
      where: { email },
      update: { name: p.name, role: "PLAYER", tier: "PRO", hcp: p.hcp, homeClub: p.homeClub, school: p.school ?? null, ambition: p.ambition, lastLoginAt },
      create: { authId: `stall-${slug}`, email, name: p.name, role: "PLAYER", tier: "PRO", hcp: p.hcp, homeClub: p.homeClub, school: p.school ?? null, ambition: p.ambition, lastLoginAt },
      select: { id: true, name: true },
    });
    named[p.name] = u;
  }
  console.log(`Navngitte spillere klare: ${Object.keys(named).length}`);

  // Anonyme spillere — fyll opp til nøyaktig 38 PLAYER totalt.
  let playerCount = await prisma.user.count({ where: { role: "PLAYER" } });
  if (playerCount < TARGET_PLAYERS) {
    let needed = TARGET_PLAYERS - playerCount;
    for (const a of ANON_PLAYERS) {
      if (needed <= 0) break;
      const slug = slugify(a.name);
      const email = `${slug}@${STALL_DOMAIN}`;
      const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (exists) continue;
      await prisma.user.create({
        data: {
          authId: `stall-${slug}`, email, name: a.name, role: "PLAYER", tier: "PRO",
          hcp: a.hcp, homeClub: "Gamle Fredrikstad GK", ambition: "Mosjonist",
          lastLoginAt: new Date(Date.now() - (needed % 4) * 86_400_000),
        },
      });
      needed--;
    }
    playerCount = await prisma.user.count({ where: { role: "PLAYER" } });
  }
  if (playerCount !== TARGET_PLAYERS) {
    console.warn(`ADVARSEL: PLAYER-count er ${playerCount}, ikke ${TARGET_PLAYERS} (sletter aldri eksisterende).`);
  }
  console.log(`Spillere totalt (PLAYER): ${playerCount}`);

  // ── 2. Grupper + medlemmer ──────────────────────────────────────────────
  const groupDefs = [
    { name: "WANG-gruppen", level: "S1" },
    { name: "GFGK Elite", level: "A4" },
    { name: "Junior", level: null },
    { name: "Mosjonist", level: null },
  ];
  const groups: Record<string, string> = {};
  for (const g of groupDefs) {
    const existing = await prisma.group.findFirst({ where: { name: g.name, coachId: coach.id }, select: { id: true } });
    const row = existing ?? (await prisma.group.create({ data: { name: g.name, level: g.level, coachId: coach.id }, select: { id: true } }));
    groups[g.name] = row.id;
  }

  // Deterministisk fordeling: alle PLAYERs minus de navngitte = pool.
  const allPlayers = await prisma.user.findMany({
    where: { role: "PLAYER" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  const namedIds = new Set(Object.values(named).map((n) => n.id));
  const pool = allPlayers.map((p) => p.id).filter((id) => !namedIds.has(id));

  const wangMembers = [named["Øyvind Rohjan"].id, named["Emilie Borg"].id, named["Mia Nilsen"].id, ...pool.slice(0, 9)]; // 12
  const eliteExtra = pool.slice(9, 23); // 14
  const eliteMembers = [named["Sofie Kvam"].id, named["Karl Ludvig"].id, named["Jonas Hauge"].id, named["Tobias Strand"].id, ...eliteExtra]; // 18
  const juniorMembers = [named["Andrea Lund"].id, named["Tobias Strand"].id, ...eliteExtra.slice(0, 6)]; // 8
  const mosjonistMembers = [named["Andrea Lund"].id, ...pool.slice(23)]; // resten (8 ved 38 totalt)

  await prisma.groupMember.deleteMany({ where: { groupId: { in: Object.values(groups) } } });
  const memberRows = [
    ...wangMembers.map((userId) => ({ groupId: groups["WANG-gruppen"], userId })),
    ...eliteMembers.map((userId) => ({ groupId: groups["GFGK Elite"], userId })),
    ...juniorMembers.map((userId) => ({ groupId: groups["Junior"], userId })),
    ...mosjonistMembers.map((userId) => ({ groupId: groups["Mosjonist"], userId })),
  ];
  await prisma.groupMember.createMany({ data: memberRows, skipDuplicates: true });
  console.log(`Grupper: 4 (WANG ${wangMembers.length} · GFGK Elite ${eliteMembers.length} · Junior ${juniorMembers.length} · Mosjonist ${mosjonistMembers.length})`);

  // ── 3. ServiceTypes (demo) ──────────────────────────────────────────────
  const serviceIds: Record<string, string> = {};
  for (const s of DEMO_SERVICES) {
    const row = await prisma.serviceType.upsert({
      where: { slug: s.slug },
      update: { name: s.name, durationMin: s.durationMin, active: false, coachUserId: coach.id, priceOre: 0 },
      create: { slug: s.slug, name: s.name, durationMin: s.durationMin, active: false, coachUserId: coach.id, priceOre: 0, description: "Demo-stall (seed)" },
      select: { id: true },
    });
    serviceIds[s.slug] = row.id;
  }

  // Lokasjoner — gjenbruk eksisterende, fallback til demo-lokasjon.
  const gfgkLoc =
    (await prisma.location.findFirst({ where: { name: { contains: "Fredrikstad GK" } }, select: { id: true } })) ??
    (await prisma.location.findFirst({ select: { id: true } })) ??
    (await prisma.location.create({ data: { name: "Gamle Fredrikstad GK", address: "Fredrikstad" }, select: { id: true } }));
  const wangLoc =
    (await prisma.location.findFirst({ where: { name: { contains: "WANG" } }, select: { id: true } })) ?? gfgkLoc;

  // ── 4. Bookinger: 4 i dag + 12 kommende ─────────────────────────────────
  // Slett kun bookinger på demo-ServiceTypes (våre egne fra tidligere kjøringer).
  await prisma.booking.deleteMany({ where: { serviceTypeId: { in: Object.values(serviceIds) } } });

  const todaysSessions = [
    { st: "demo-stall-tek-sekvens", player: named["Sofie Kvam"].id, start: at(9, 0), end: at(10, 0), loc: gfgkLoc.id, notes: "TEK · sekvens P4–P8, fokus balltreff" },
    { st: "demo-stall-slag-innspill", player: named["Øyvind Rohjan"].id, start: at(11, 0), end: at(12, 0), loc: wangLoc.id, notes: "SLAG · innspill 50–80 m, presisjon" },
    { st: "demo-stall-tek-putt", player: named["Emilie Borg"].id, start: at(14, 30), end: at(15, 15), loc: wangLoc.id, notes: "TEK · putt-konsistens 4 m, test" },
    { st: "demo-stall-spill-9hull", player: named["Karl Ludvig"].id, start: at(17, 0), end: at(18, 30), loc: gfgkLoc.id, notes: "SPILL · 9-hulls spillsimulering" },
  ];
  for (const b of todaysSessions) {
    await prisma.booking.create({
      data: {
        userId: b.player, coachId: coach.id, serviceTypeId: serviceIds[b.st], locationId: b.loc,
        startAt: b.start, endAt: b.end, status: "CONFIRMED", priceOre: 0, notes: b.notes,
      },
    });
  }

  // 12 kommende bookinger (dag +1 … +6, to per dag) — teller i booking.count({startAt: gte now}).
  const upcomingPlayers = [
    named["Sofie Kvam"].id, named["Emilie Borg"].id, named["Karl Ludvig"].id, named["Mia Nilsen"].id,
    named["Andrea Lund"].id, named["Tobias Strand"].id, ...pool.slice(0, 6),
  ];
  for (let i = 0; i < 12; i++) {
    const dayOffset = 1 + Math.floor(i / 2);
    const hour = i % 2 === 0 ? 10 : 14;
    await prisma.booking.create({
      data: {
        userId: upcomingPlayers[i % upcomingPlayers.length], coachId: coach.id,
        serviceTypeId: serviceIds["demo-stall-coaching-60"], locationId: gfgkLoc.id,
        startAt: at(hour, 0, dayOffset), endAt: at(hour + 1, 0, dayOffset),
        status: "CONFIRMED", priceOre: 0, notes: "Coaching-time (demo-stall)",
      },
    });
  }
  console.log("Bookinger: 4 i dag + 12 kommende");

  // ── 5. Økt-forespørsler (4 PENDING) ─────────────────────────────────────
  const requestUserIds = [named["Sofie Kvam"].id, named["Karl Ludvig"].id, named["Jonas Hauge"].id, named["Tobias Strand"].id];
  await prisma.sessionRequest.deleteMany({ where: { userId: { in: requestUserIds } } });
  await prisma.sessionRequest.createMany({
    data: [
      { userId: named["Sofie Kvam"].id, coachId: coach.id, status: "PENDING", preferredArea: "SLAG", preferredDate: nextWeekday(2, 10), preferredTime: "formiddag", durationMin: 60, reason: "Kan jeg få en TrackMan-time på tirsdag? Vil sjekke køllehastighet før turneringen.", createdAt: hoursAgo(2) },
      { userId: named["Karl Ludvig"].id, coachId: coach.id, status: "PENDING", preferredArea: "TEK", durationMin: 30, reason: "Kan du se på video fra runden i helga? Mistet flere drives til høyre.", createdAt: hoursAgo(5) },
      { userId: named["Jonas Hauge"].id, coachId: coach.id, status: "PENDING", preferredArea: "SLAG", durationMin: 45, reason: "Trenger råd om wedge-oppsettet — usikker på gappingen 50–100 m.", createdAt: hoursAgo(26) },
      { userId: named["Tobias Strand"].id, coachId: coach.id, status: "PENDING", preferredArea: "SPILL", preferredDate: nextWeekday(6, 9), preferredTime: "morgen", durationMin: 120, reason: "Kan vi ta en tee-time på lørdag? Vil spille 9 hull med deg før NM-uttak.", createdAt: hoursAgo(8) },
    ],
  });
  console.log("Økt-forespørsler: 4 PENDING");

  // ── 6. Godkjenninger (3 PENDING PlanAction) ─────────────────────────────
  const approvalUserIds = [named["Øyvind Rohjan"].id, named["Sofie Kvam"].id, named["Andrea Lund"].id];
  await prisma.planAction.deleteMany({ where: { userId: { in: approvalUserIds }, agentName: { in: DEMO_AGENTS }, status: "PENDING" } });
  await prisma.planAction.createMany({
    data: [
      // ESCALATION → severity "urgent" i approvals-UI (HASTER)
      { userId: named["Øyvind Rohjan"].id, actionType: "ESCALATION", agentName: "kalender-agent", status: "PENDING", suggestion: { forklaring: "Bytte fre-økt til lørdag — kolliderer med skolecup. Haster.", fra: "fredag 15:00", til: "lørdag 10:00" }, createdAt: hoursAgo(1) },
      // PYRAMID_ADJUST → severity "warning"
      { userId: named["Sofie Kvam"].id, actionType: "PYRAMID_ADJUST", agentName: "plan-agent", status: "PENDING", suggestion: { forklaring: "Plan-endring uke 22 — øke SLAG-andelen før Srixon Tour #2.", uke: 22 }, createdAt: hoursAgo(4) },
      // SESSION_ADD → severity "info"
      { userId: named["Andrea Lund"].id, actionType: "SESSION_ADD", agentName: "turnerings-agent", status: "PENDING", suggestion: { forklaring: "Turneringspåmelding NM Junior — bekreft påmelding innen fredag.", turnering: "NM Junior" }, createdAt: hoursAgo(7) },
    ],
  });
  console.log("Godkjenninger: 3 PENDING (1 urgent · 1 warning · 1 info)");

  // ── 7. Oppgaver (OppgaveCache via demo-NotionConnection) ────────────────
  // Workspace-siden krever NotionConnection eid av ADMIN. syncMode=MANUELL på
  // databaselinken gjør at cron-en (/api/cron/notion-sync) ALDRI prøver å
  // synke dummy-tokenet.
  const connection = await prisma.notionConnection.upsert({
    where: { userId: coach.id },
    update: { workspaceName: "AK Golf Group (demo)" },
    create: { userId: coach.id, accessTokenEnc: "demo-stall-ikke-ekte-token", workspaceId: "demo-stall-workspace", workspaceName: "AK Golf Group (demo)" },
    select: { id: true },
  });
  const dbLink = await prisma.notionDatabaseLink.upsert({
    where: { connectionId_notionDatabaseId: { connectionId: connection.id, notionDatabaseId: "demo-stall-oppgaver" } },
    update: { syncMode: "MANUELL" },
    create: { connectionId: connection.id, notionDatabaseId: "demo-stall-oppgaver", navn: "Oppgaver (demo)", type: "OPPGAVER", syncMode: "MANUELL", pagesCount: 5 },
    select: { id: true },
  });

  const fredag = nextWeekday(5, 12);
  const oppgaver = [
    { pageId: "demo-stall-oppg-1", tittel: "Ring forelder til Karl L. (turneringspåmelding)", status: "Ikke startet", prioritet: "Høy", forfaller: at(16, 0), editedH: 1 },
    { pageId: "demo-stall-oppg-2", tittel: "Klargjør Srixon Tour #2-orientering", status: "Ikke startet", prioritet: "Medium", forfaller: fredag, editedH: 3 },
    { pageId: "demo-stall-oppg-3", tittel: "Send video-feedback til Øyvind", status: "Ferdig", prioritet: "Medium", forfaller: null, editedH: 5 },
    { pageId: "demo-stall-oppg-4", tittel: "Godkjenn Sofies plan-endring", status: "Ferdig", prioritet: "Medium", forfaller: null, editedH: 6 },
    { pageId: "demo-stall-oppg-5", tittel: "Bestille range-baller torsdag", status: "Ferdig", prioritet: "Lav", forfaller: null, editedH: 22 },
  ];
  for (const o of oppgaver) {
    await prisma.oppgaveCache.upsert({
      where: { notionPageId: o.pageId },
      update: { tittel: o.tittel, status: o.status, prioritet: o.prioritet, forfaller: o.forfaller, notionLastEdited: hoursAgo(o.editedH) },
      create: {
        databaseLinkId: dbLink.id, notionPageId: o.pageId, notionUrl: `https://notion.so/${o.pageId}`,
        tittel: o.tittel, status: o.status, prioritet: o.prioritet, selskap: ["AK Golf Academy"],
        forfaller: o.forfaller, tildeltNavn: [NAME], notionLastEdited: hoursAgo(o.editedH),
      },
    });
  }
  console.log("Oppgaver: 5 i OppgaveCache (2 åpne · 3 gjort)");

  // ── 8. Innboks (DIRECT CoachingSession-tråder) ──────────────────────────
  await prisma.coachingSession.deleteMany({ where: { coachId: coach.id, kind: "DIRECT" } });
  const msg = (role: "user" | "coach", content: string, h: number) => ({ role, content, ts: hoursAgo(h).toISOString() });
  const threads = [
    { userId: named["Sofie Kvam"].id, messages: [msg("user", "Hei! Kjente mye bedre kontakt i dag — sekvensen P4–P8 begynner å sitte.", 26), msg("coach", "Supert, Sofie! Hold fokus på tempoet, ikke lengden.", 25), msg("user", "Kan jeg få en TrackMan-time på tirsdag?", 2)] },
    { userId: named["Karl Ludvig"].id, messages: [msg("coach", "Sterk runde i helga — så scorekortet ditt. 9 hull i kveld blir bra.", 20), msg("user", "Takk! Har lastet opp video fra runden, kan du se på driveren?", 5)] },
    { userId: named["Jonas Hauge"].id, messages: [msg("user", "Har vært litt ute av rytmen — trenger råd om wedge-gappingen.", 28), msg("coach", "Vi tar det i neste økt. Book gjerne en time så ser vi på 50–100 m sammen.", 24)] },
    { userId: named["Mia Nilsen"].id, messages: [msg("user", "Putt-testen gikk bra i dag — 8/10 fra 4 meter!", 30), msg("coach", "Sterkt, Mia! Da øker vi presset til PR4 neste gang.", 27)] },
  ];
  for (const t of threads) {
    await prisma.coachingSession.create({ data: { userId: t.userId, coachId: coach.id, kind: "DIRECT", messages: t.messages } });
  }
  console.log("Innboks: 4 DIRECT-tråder (2 med ulest svar fra spiller)");

  // ── 9. Varsler (3 uleste til coachen) ───────────────────────────────────
  await prisma.notification.deleteMany({ where: { userId: coach.id } });
  await prisma.notification.createMany({
    data: [
      { userId: coach.id, type: "melding", title: "Sofie Kvam: ny melding", body: "Kan jeg få en TrackMan-time på tirsdag?", link: "/admin/innboks", readAt: null, createdAt: hoursAgo(2) },
      { userId: coach.id, type: "booking", title: "Booking bekreftet: Karl Ludvig", body: "9-hulls spillsimulering i dag 17:00–18:30.", link: "/admin/bookinger", readAt: null, createdAt: hoursAgo(3) },
      { userId: coach.id, type: "system", title: "3 godkjenninger venter", body: "Øyvind Rohjan haster: bytte fre-økt til lørdag.", link: "/admin/approvals", readAt: null, createdAt: hoursAgo(1) },
    ],
  });
  console.log("Varsler: 3 uleste");

  // ── 10. Abonnement (MRR-grunnlag) ───────────────────────────────────────
  // Økonomisiden regner MRR = antall PRO-abonnement × 300 kr (hardkodet).
  // ~148 000 kr ville krevd ~493 abonnement — umulig med 38 spillere.
  // Vi seeder PRO på alle stall-spillere; avviket dokumenteres i seed-rapporten.
  const stallPlayers = await prisma.user.findMany({ where: { email: { endsWith: `@${STALL_DOMAIN}` } }, select: { id: true, name: true } });
  const proPakker: Record<string, number> = { "Sofie Kvam": 4, "Emilie Borg": 4, "Karl Ludvig": 4, "Jonas Hauge": 2, "Mia Nilsen": 2 };
  for (const p of stallPlayers) {
    const credits = proPakker[p.name] ?? 0;
    await prisma.subscription.upsert({
      where: { userId: p.id },
      update: { tier: "PRO", status: "ACTIVE", monthlyCredits: credits, creditsRemaining: credits },
      create: { userId: p.id, tier: "PRO", status: "ACTIVE", monthlyCredits: credits, creditsRemaining: credits },
    });
  }
  const proCount = await prisma.subscription.count({ where: { tier: "PRO", status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] } } });
  console.log(`Abonnement: ${stallPlayers.length} stall-spillere PRO → totalt ${proCount} aktive PRO (MRR ${proCount * 300} kr)`);

  // ── Verifikasjon ────────────────────────────────────────────────────────
  const now = new Date();
  const dagStart = at(0, 0);
  const dagSlutt = at(0, 0, 1);
  const [players, myGroups, upcoming, pendingReq, todayBookings, pendingActions, cacheCount, unread] = await Promise.all([
    prisma.user.count({ where: { role: "PLAYER" } }),
    prisma.group.count({ where: { coachId: coach.id } }),
    prisma.booking.count({ where: { startAt: { gte: now } } }),
    prisma.sessionRequest.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { startAt: { gte: dagStart, lt: dagSlutt }, status: { in: ["CONFIRMED", "PENDING"] } } }),
    prisma.planAction.count({ where: { status: "PENDING" } }),
    prisma.oppgaveCache.count(),
    prisma.notification.count({ where: { userId: coach.id, readAt: null } }),
  ]);
  console.log("\n── Verifikasjon ──");
  console.log(`Spillere (PLAYER):        ${players}  (mål: 38)`);
  console.log(`Grupper (coachtest):      ${myGroups}  (mål: 4)`);
  console.log(`Bookinger i dag:          ${todayBookings}  (mål: 4)`);
  console.log(`Kommende bookinger:       ${upcoming}  (mål: ≥12)`);
  console.log(`Forespørsler PENDING:     ${pendingReq}  (mål: 4)`);
  console.log(`Godkjenninger PENDING:    ${pendingActions}  (mål: 3)`);
  console.log(`Oppgaver i cache:         ${cacheCount}  (mål: 5)`);
  console.log(`Uleste varsler (coach):   ${unread}  (mål: 3)`);
  console.log(`Øyvind Rohjan user-id:    ${oyvind.id}`);

  console.log(`\n✓ Ferdig. Login: ${EMAIL} (passord = SCREENTEST_PASSWORD i .env.local)`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
