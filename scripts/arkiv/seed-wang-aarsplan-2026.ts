/**
 * Seed: WANG Toppidrett Fredrikstad — årsplan 2026/2027 (aug/sep-detaljert).
 *
 * Skriver Anders' godkjente plan (19. juli 2026) inn i gruppens årsplan-lag:
 *   - 9 spillere (User + GroupMember) — fornavn.etternavn@akgolf.no, auth kobles ved invitasjon
 *   - 4 AK-perioder (GroupPeriodBlock) + kalenderfarging (TrainingPeriod, med
 *     kompetansemål-kobling per skill-metodikken)
 *   - Samlinger, testdager, fredagsdeling, testkonkurranse (GroupSchedule)
 *
 * Idempotent: sjekker eksistens før hver insert — trygt å kjøre flere ganger.
 * Kjør:  npx tsx scripts/seed-wang-aarsplan-2026.ts
 */
import "./_env";
import { prisma } from "@/lib/prisma";

const GROUP_ID = "cmp28uk1b000l99e5m764g2wx"; // WANG Toppidrett Fredrikstad

// ---------- Spillere ----------
const SPILLERE: { name: string; klasse: "VG1" | "VG2" | "VG3"; notat?: string }[] = [
  { name: "Fredrik Kjølberg Hovland", klasse: "VG1" },
  { name: "Aksel Lind", klasse: "VG1" },
  { name: "Ludvik Vanberg", klasse: "VG1" },
  { name: "Constanse Hauglid", klasse: "VG2" },
  { name: "Jakob Holm", klasse: "VG2" },
  { name: "Anders Rafshol", klasse: "VG2" },
  { name: "Viktoria Hammer", klasse: "VG3", notat: "Langtidsskadet — eget opplegg, ikke golfspesifikk trening før ca. start desember 2026" },
  { name: "Max Risvåg", klasse: "VG3" },
  { name: "Sondre U. Thøgersen", klasse: "VG3" },
];

function ascii(s: string): string {
  return s.toLowerCase().replaceAll("ø", "o").replaceAll("æ", "ae").replaceAll("å", "a").replaceAll(".", "");
}

function slug(name: string): string {
  return ascii(name).replace(/\s+/g, "-");
}

/** fornavn.etternavn@akgolf.no — første + siste navneledd (Anders' beslutning 19.7). */
function epost(name: string): string {
  const deler = ascii(name).split(/\s+/).filter(Boolean);
  return `${deler[0]}.${deler[deler.length - 1]}@akgolf.no`;
}

// Oslo-veggklokke → Date (skriptet kjøres lokalt i Europe/Oslo, så new Date på
// lokal streng gir riktig instant — samme konvensjon som eksisterende rader).
function d(s: string): Date {
  return new Date(s);
}

async function main() {
  const group = await prisma.group.findUnique({ where: { id: GROUP_ID }, select: { id: true, name: true } });
  if (!group) throw new Error("Fant ikke gruppen WANG Toppidrett Fredrikstad");
  console.log(`Gruppe: ${group.name}`);

  // ---------- 1) Spillere + medlemskap ----------
  let nyeSpillere = 0;
  for (const sp of SPILLERE) {
    const s = slug(sp.name);
    const email = epost(sp.name);
    let user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) {
      user = await prisma.user.create({
        data: { authId: `pending-wang-${s}`, email, name: sp.name, role: "PLAYER" },
        select: { id: true },
      });
      nyeSpillere++;
    }
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: GROUP_ID, userId: user.id } },
      update: {},
      create: { groupId: GROUP_ID, userId: user.id, role: "PLAYER" },
    });
  }
  console.log(`Spillere: ${SPILLERE.length} i gruppen (${nyeSpillere} nye opprettet)`);

  // ---------- 2) AK-perioder (GroupPeriodBlock) ----------
  const PERIODER = [
    {
      lPhase: "TURNERING" as const, startDate: d("2026-08-17"), endDate: d("2026-09-30"),
      focus: "TURN-rest: sluttspill av sommersesongen. Vedlikehold spill/scoring mens fysisk baseline etableres (heldagstest 27.8). Fase-fokus: Auto.",
      weeklyVolMin: 360, weeklyVolMax: 540,
    },
    {
      lPhase: "GRUNN" as const, startDate: d("2026-10-01"), endDate: d("2027-03-15"),
      focus: "GRUNN: bygg teknisk og fysisk fundament (FYS 50 % / TEK 35 %). Fase-fokus: Uten ball / Lav hastighet — prioriteres over data og turnering.",
      weeklyVolMin: 420, weeklyVolMax: 600,
    },
    {
      lPhase: "SPESIAL" as const, startDate: d("2027-03-16"), endDate: d("2027-04-30"),
      focus: "SPES: overfør teknikk til slag og scoringsspill (SLAG 35 % / SPILL 25 %). Fase-fokus: Lav hastighet / Auto. Press økes mot Krav og Utfordring.",
      weeklyVolMin: 400, weeklyVolMax: 560,
    },
    {
      lPhase: "TURNERING" as const, startDate: d("2027-05-01"), endDate: d("2027-06-19"),
      focus: "TURN: prestere. Konkurransesimulering, Auto-fase, press mot Konkurranse. Toppe form mot prioriterte turneringer.",
      weeklyVolMin: 360, weeklyVolMax: 540,
    },
  ];
  let nyePerioder = 0;
  for (const p of PERIODER) {
    const finnes = await prisma.groupPeriodBlock.findFirst({
      where: { groupId: GROUP_ID, lPhase: p.lPhase, startDate: p.startDate },
      select: { id: true },
    });
    if (finnes) continue;
    await prisma.groupPeriodBlock.create({ data: { groupId: GROUP_ID, ...p } });
    nyePerioder++;
  }
  console.log(`AK-perioder: ${PERIODER.length} (${nyePerioder} nye)`);

  // ---------- 3) Kalenderfarging + kompetansemål (TrainingPeriod) ----------
  const goals = await prisma.competenceGoal.findMany({
    select: { id: true, classYear: true, goalNumber: true },
  });
  const g = (cy: string, n: number): string[] => {
    const hit = goals.find((x) => x.classYear === cy && x.goalNumber === n);
    return hit ? [hit.id] : [];
  };
  const KALENDER = [
    { name: "TURN-rest", startDate: d("2026-08-17"), endDate: d("2026-09-30"), tone: "gold",
      competenceGoalIds: [...g("VG1", 1), ...g("VG2", 1), ...g("VG3", 1)],
      note: "Sluttspill sommersesong + fysisk baseline. Fase-fokus: Auto." },
    { name: "Testuke", startDate: d("2026-10-19"), endDate: d("2026-10-25"), tone: "muted",
      competenceGoalIds: [...g("VG2", 3)],
      note: "NGF testuke (uke 43). Heldagssamling NGF Oslo torsdag 29.10 (uke 44)." },
    { name: "GRUNN", startDate: d("2026-10-01"), endDate: d("2027-03-15"), tone: "primary",
      competenceGoalIds: [...g("VG1", 4), ...g("VG2", 4), ...g("VG3", 4), ...g("VG1", 5)],
      note: "Fundament: basistrening, skadeforebygging, totalbelastning/restitusjon." },
    { name: "SPES", startDate: d("2027-03-16"), endDate: d("2027-04-30"), tone: "moss",
      competenceGoalIds: [...g("VG2", 3), ...g("VG2", 2), ...g("VG3", 2)],
      note: "Spesialisering: tester og analyse av resultat." },
    { name: "TURN", startDate: d("2027-05-01"), endDate: d("2027-06-19"), tone: "accent",
      competenceGoalIds: [...g("VG2", 1), ...g("VG3", 1), ...g("VG3", 6)],
      note: "Prestere i konkurranse + mental trening." },
  ];
  let nyeKalender = 0;
  for (const k of KALENDER) {
    const finnes = await prisma.trainingPeriod.findFirst({
      where: { groupId: GROUP_ID, schoolYear: "2026/2027", name: k.name, startDate: k.startDate },
      select: { id: true },
    });
    if (finnes) continue;
    await prisma.trainingPeriod.create({
      data: { groupId: GROUP_ID, schoolYear: "2026/2027", ...k },
    });
    nyeKalender++;
  }
  console.log(`Kalenderperioder: ${KALENDER.length} (${nyeKalender} nye)`);

  // ---------- 4) Samlinger, testdager, fredagsdeling (GroupSchedule) ----------
  const MANDAG_DESC =
    "Teknisk sjekk (60 min) hver mandag for spillere som konkurrerte i helgen — etter egen teknisk utviklingsplan: " +
    "Tee total · Innspill 150–200 m · Nærspill · Putting. Unntak: fri ved høy belastning / lite søvn pga. reisevei. " +
    "Mandag etter turnering = alltid FYS for hovedøkta, aldri kølle.";

  const GRUPPE_A = "Gruppe A (banecoaching m/ Anders): Fredrik Kjølberg Hovland, Aksel Lind, Jakob Holm, Sondre U. Thøgersen";
  const GRUPPE_B = "Gruppe B (egentrening etter egen plan): Ludvik Vanberg, Constanse Hauglid, Anders Rafshol, Max Risvåg";
  const VIKTORIA = "Viktoria Hammer: eget opplegg (langtidsskade — ikke golfspesifikk trening før ca. des).";

  const HENDELSER: {
    title: string; startAt: Date; endAt: Date; kind?: string; recurring?: string;
    location?: string; description?: string;
  }[] = [
    // Faste økter (mandag finnes fra før — sjekkes idempotent)
    { title: "WANG Toppidrett Fredrikstad — fast trening (Man)", startAt: d("2026-08-17T08:00:00"), endAt: d("2026-08-17T10:00:00"), recurring: "WEEKLY", location: "GFGK", description: MANDAG_DESC },
    { title: "WANG Toppidrett Fredrikstad — fast trening (Ons)", startAt: d("2026-08-19T08:00:00"), endAt: d("2026-08-19T10:00:00"), recurring: "WEEKLY", location: "GFGK", description: "Første økt 19.8: kun VG2 + VG3 (VG1 på Sauvika)." },
    { title: "WANG Toppidrett Fredrikstad — fast trening (Fre)", startAt: d("2026-08-21T08:00:00"), endAt: d("2026-08-21T10:00:00"), recurring: "WEEKLY", location: "GFGK", description: "Første fellesøkt alle trinn: fredag 21.8. Fra 28.8: fredagsdeling — én gruppe banecoaching m/ Anders, én gruppe egentrening. Rullerer." },
    { title: "WANG Toppidrett Fredrikstad — fysisk trening (Tir)", startAt: d("2026-08-25T08:00:00"), endAt: d("2026-08-25T09:00:00"), recurring: "WEEKLY", description: "1 t fysisk trening (detaljer kommer fra Anders). NB: kroppsøving tirsdag er i skolens regi, ikke toppidrett." },

    // Samlinger / spesialdager
    { title: "VG1 overnattingstur — Sauvika", startAt: d("2026-08-19T08:00:00"), endAt: d("2026-08-20T15:00:00"), kind: "SAMLING", location: "Sauvika", description: "VG1 (Fredrik, Aksel, Ludvik). Kun VG2+VG3 på GFGK-økta onsdag 19.8." },
    { title: "Heldag: Fysiske tester + individuell screening (Teemu Paasanen)", startAt: d("2026-08-27T08:00:00"), endAt: d("2026-08-27T15:00:00"), kind: "HELDAGSSAMLING", description: "Alle 9 elever. Grunnlag for individuelt tilpasset styrkeprogram (vedlikehold + øke styrke). Re-test torsdag 8.10 (6 uker)." },
    { title: "Fysisk re-test (6 uker etter baseline)", startAt: d("2026-10-08T08:00:00"), endAt: d("2026-10-08T12:00:00"), kind: "SAMLING", description: "Re-test av fysisk baseline fra 27.8. Deretter 6–7 ukers intervall." },
    { title: "NGF-testdag: Golfslag Basic, putting, force plate", startAt: d("2026-10-29T08:00:00"), endAt: d("2026-10-29T16:00:00"), kind: "HELDAGSSAMLING", location: "NGF, Maridalsveien 300, Oslo", description: "Heldagssamling uke 44 — oppfølging av NGF testuke (uke 43)." },
    { title: "WANG fellessamling (uke 1) — med WANG Oslo", startAt: d("2027-01-04T08:00:00"), endAt: d("2027-01-10T16:00:00"), kind: "SAMLING", description: "7 dager. Ingen GFGK-økter. Innhold styres av WANG sentralt." },
    { title: "WANG fellessamling (uke 7) — med WANG Oslo", startAt: d("2027-02-15T08:00:00"), endAt: d("2027-02-21T16:00:00"), kind: "SAMLING", description: "7 dager. Ingen GFGK-økter. Innhold styres av WANG sentralt." },

    // Fredagsdeling — 2-ukers test
    { title: "Fredagsdeling (test 1/2): banecoaching + egentrening", startAt: d("2026-08-28T08:00:00"), endAt: d("2026-08-28T10:00:00"), description: `${GRUPPE_A}. ${GRUPPE_B}. ${VIKTORIA} Jevn fordeling, VG1 spres — rullerer neste uke.` },
    { title: "Fredagsdeling (test 2/2): banecoaching + egentrening", startAt: d("2026-09-04T08:00:00"), endAt: d("2026-09-04T10:00:00"), description: `Byttet: Gruppe A (banecoaching m/ Anders): Ludvik Vanberg, Constanse Hauglid, Anders Rafshol, Max Risvåg. Gruppe B (egentrening): Fredrik Kjølberg Hovland, Aksel Lind, Jakob Holm, Sondre U. Thøgersen. ${VIKTORIA} Evaluer delingen etter denne økta.` },

    // Tester aug/sep
    { title: "Test: 8-ball Blocked + Variation (1/3)", startAt: d("2026-08-26T08:00:00"), endAt: d("2026-08-26T10:00:00"), description: "Testbatteri: 8-ball-blocked + 8-ball-variation. Kjøres i den faste onsdagsøkta." },
    { title: "Test: 8-ball Blocked + Variation (2/3)", startAt: d("2026-09-09T08:00:00"), endAt: d("2026-09-09T10:00:00"), description: "Testbatteri: 8-ball-blocked + 8-ball-variation." },
    { title: "Test: 8-ball Blocked + Variation (3/3)", startAt: d("2026-09-23T08:00:00"), endAt: d("2026-09-23T10:00:00"), description: "Testbatteri: 8-ball-blocked + 8-ball-variation." },
    { title: "Test: Golfslag Basic (1/2)", startAt: d("2026-08-31T08:00:00"), endAt: d("2026-08-31T10:00:00"), description: "Golfslag Basic-test i mandagsøkta (teknisk sjekk for helgekonkurrenter går parallelt)." },
    { title: "Test: Golfslag Basic (2/2)", startAt: d("2026-09-21T08:00:00"), endAt: d("2026-09-21T10:00:00"), description: "Golfslag Basic-test i mandagsøkta." },

    // Testkonkurranse — 4 uker, to tabeller
    { title: "Testkonkurranse 1/4: TN Putt Gate", startAt: d("2026-09-02T08:00:00"), endAt: d("2026-09-02T10:00:00"), description: "Konkurranse over 4 uker — én test per uke. To tabeller: Best resultat + Best resultat etter nivå." },
    { title: "Testkonkurranse 2/4: Drive treffsikkerhet", startAt: d("2026-09-07T08:00:00"), endAt: d("2026-09-07T10:00:00"), description: "To tabeller: Best resultat + Best resultat etter nivå." },
    { title: "Testkonkurranse 3/4: Inspill Basis", startAt: d("2026-09-14T08:00:00"), endAt: d("2026-09-14T10:00:00"), description: "To tabeller: Best resultat + Best resultat etter nivå." },
    { title: "Testkonkurranse 4/4: 8-ball Blocked", startAt: d("2026-09-28T08:00:00"), endAt: d("2026-09-28T10:00:00"), description: "Finale. To tabeller: Best resultat + Best resultat etter nivå. Premiering ved felleslunsj-anledning." },

    // Sosialt
    { title: "Felleslunsj etter trening", startAt: d("2026-09-18T10:00:00"), endAt: d("2026-09-18T11:00:00"), description: "Felles lunsj for hele gruppen etter fredagsøkta." },
  ];

  let nyeHendelser = 0;
  for (const h of HENDELSER) {
    const finnes = await prisma.groupSchedule.findFirst({
      where: { groupId: GROUP_ID, title: h.title },
      select: { id: true },
    });
    if (finnes) continue;
    await prisma.groupSchedule.create({
      data: {
        groupId: GROUP_ID,
        title: h.title,
        startAt: h.startAt,
        endAt: h.endAt,
        kind: h.kind ?? null,
        recurring: h.recurring ?? null,
        location: h.location ?? null,
        description: h.description ?? null,
      },
    });
    nyeHendelser++;
  }
  console.log(`Hendelser/samlinger: ${HENDELSER.length} (${nyeHendelser} nye)`);

  console.log("\nFERDIG. Verifiser i AgencyOS: /admin/grupper/" + GROUP_ID + "/workbench");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
