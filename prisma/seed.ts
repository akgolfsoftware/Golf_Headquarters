/**
 * AK Golf HQ — seed-skript med reelle data.
 *
 * Idempotent: bruker findFirst + create/update på navn/slug for å unngå
 * duplikater. Kan kjøres flere ganger uten side-effekter.
 *
 * Kjør: `npm run db:seed`
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ---------- Locations + Facilities ----------

const LOCATIONS = [
  {
    name: "Gamle Fredrikstad GK",
    address: "Torsnesveien 16, Fredrikstad",
    facilities: [
      "Performance Studio",
      "Driving Range 1. etg",
      "Driving Range 2. etg",
      "Nærspillområde",
      "Puttinggreen",
      "9-hullsbane",
    ],
  },
  {
    name: "Mulligan Indoor Golf",
    address: "Stabburveien 18, 1617 Fredrikstad",
    facilities: ["Sim 1", "Sim 2", "Sim 3", "Sim 4"],
  },
  {
    name: "WANG Toppidrett Fredrikstad",
    address: "Fredrikstad", // TODO: bekreft eksakt adresse
    facilities: ["Idrettshall", "Klasserom"],
  },
] as const;

// ---------- ServiceTypes ----------
// Pris i ØRE (Int). 600 kr = 60000 øre.
// Coach-spesifikk pris: slug-prefiks anders-/markus- per coach.

const SERVICE_TYPES = [
  // --- Anders Kristiansen ---
  {
    slug: "anders-flex-20",
    name: "Flex 20 min — Anders",
    priceOre: 60000,
    durationMin: 20,
    description: "Kort fokus-økt med Anders. Ett tema, raskt inn og ut.",
  },
  {
    slug: "anders-flex-50",
    name: "Flex 50 min — Anders",
    priceOre: 150000,
    durationMin: 50,
    description: "Standard coaching-økt med Anders. Tek, taktikk eller mental.",
  },
  {
    slug: "anders-flex-90",
    name: "Flex 90 min — Anders",
    priceOre: 250000,
    durationMin: 90,
    description: "Utvidet coaching-økt med Anders. Dybde-analyse + praksis.",
  },
  {
    slug: "anders-performance",
    name: "Performance — Anders",
    priceOre: 130000,
    durationMin: 60,
    description:
      "Strukturert performance-økt med Anders. Trackman + analyse + plan.",
  },
  {
    slug: "anders-performance-pro",
    name: "Performance Pro — Anders",
    priceOre: 230000,
    durationMin: 90,
    description:
      "Full performance-økt med Anders. Trackman + video + dispersjon + skriftlig plan.",
  },

  // --- Markus Røinås Pedersen ---
  {
    slug: "markus-flex-20",
    name: "Flex 20 min — Markus",
    priceOre: 30000,
    durationMin: 20,
    description: "Kort fokus-økt med Markus. Ett tema, raskt inn og ut.",
  },
  {
    slug: "markus-performance",
    name: "Performance — Markus",
    priceOre: 70000,
    durationMin: 60,
    description:
      "Strukturert performance-økt med Markus. Trackman + analyse + plan.",
  },
  {
    slug: "markus-performance-pro",
    name: "Performance Pro — Markus",
    priceOre: 130000,
    durationMin: 90,
    description:
      "Full performance-økt med Markus. Trackman + video + dispersjon + skriftlig plan.",
  },

  // --- Gruppe-tjenester (institusjonelle, ikke 1:1) ---
  {
    slug: "gruppe-oekt",
    name: "Gruppe-økt",
    priceOre: 39000,
    durationMin: 60,
    description: "Inntil 6 spillere. Egnet for nivåtilpasset trening.",
  },
  {
    slug: "wang-oekt",
    name: "WANG-økt",
    priceOre: 0,
    durationMin: 90,
    description:
      "Intern økt for WANG Toppidrett-spillere. Tilknyttes Group, ikke booking.",
  },
] as const;

// ---------- EmailTemplates ----------

const EMAIL_TEMPLATES = [
  {
    slug: "velkomst-gratis",
    name: "Velkomst — gratis-bruker",
    subject: "Velkommen til AK Golf, {{name}}!",
    body: `Hei {{name}},

Velkommen til AK Golf! Du har nå tilgang til:

- Loggføring av runder og tester
- Grunnleggende SG-analyse
- Innsyn i pyramide-trening

Vil du booke første økt med en Pro, finner du tilgjengelige tider her:
https://akgolf.no/booking

Spørsmål? Svar bare på denne e-posten.

Hilsen
AK Golf Academy`,
  },
  {
    slug: "velkomst-pro",
    name: "Velkomst — Pro-abonnement",
    subject: "Du er nå AK Golf Pro, {{name}}!",
    body: `Hei {{name}},

Gratulerer — du har låst opp full tilgang.

Som Pro får du:
- Personlig AI-coach (24/7)
- Trackman-historikk og dispersjon-plot
- Live Session med 4-fase tapper
- Ukentlige progresjons-rapporter

Logg inn og start din første Live Session:
https://akgolf.no/portal/tren

Hilsen
Anders & AK Golf-teamet`,
  },
  {
    slug: "oekt-paaminnelse",
    name: "Påminnelse — 24t før økt",
    subject: "Påminnelse: {{serviceTypeName}} i morgen kl {{time}}",
    body: `Hei {{name}},

Du har bestilt **{{serviceTypeName}}** i morgen kl {{time}} på {{location}}.

Husk:
- Møt 10 min før
- Ta med dine egne køller
- Avbestilling før {{cancelDeadline}} gir full refusjon

Vi sees!

AK Golf Academy`,
  },
  {
    slug: "ukentlig-progresjon",
    name: "Ukentlig progresjon — Pro",
    subject: "Din uke i tall, {{name}}",
    body: `Hei {{name}},

Her er din uke:

- Runder: {{roundsCount}}
- SG total snitt: {{sgTotal}}
- Beste område: {{bestArea}}
- Område som trenger fokus: {{focusArea}}

AI-coach anbefaler denne uka:
{{coachRecommendation}}

Se hele rapporten her: https://akgolf.no/portal/mal

Lykke til!
AK Golf`,
  },
  {
    slug: "vinn-tilbake",
    name: "Vinn tilbake — 30 dager inaktiv",
    subject: "Vi savner deg, {{name}}",
    body: `Hei {{name}},

Vi har ikke sett deg på AK Golf på 30 dager.

Husk:
- Du har fortsatt full tilgang til alle dine data
- Pyramide-analysen viser deg eksakt hvor du står
- En Pro-time kan gjenstarte progresjonen

Book en time her: https://akgolf.no/booking

Skal vi ringe deg? Svar bare på denne e-posten.

Hilsen
Anders`,
  },
  {
    slug: "booking-bekreftelse",
    name: "Booking — bekreftelse",
    subject: "Bekreftet: {{serviceTypeName}} {{date}}",
    body: `Hei {{name}},

Vi har mottatt bestillingen din.

**{{serviceTypeName}}**
{{date}} kl {{time}}
{{location}}

Pris: {{priceFormatted}}
Betalt: Stripe (ref {{paymentRef}})

Avbestilling før {{cancelDeadline}} gir full refusjon.

Se kvittering: https://akgolf.no/portal/meg/bookinger/{{bookingId}}

Vi gleder oss!
AK Golf Academy`,
  },
] as const;

// ---------- CourseDefinition ----------

const COURSES = [
  { name: "Gamle Fredrikstad GK", par: 71, rating: 70.2, slope: 128 },
  // 9-hullsbane på GFGK
  { name: "GFGK 9-hullsbane", par: 35, rating: 35.4, slope: 122 },
] as const;

// ---------- Coacher (placeholder authId — settes når bruker logger inn første gang) ----------

const COACHES = [
  {
    authId: "pending-anders-akgolf-no",
    email: "anders@akgolf.no",
    name: "Anders Kristiansen",
    role: "COACH",
    tier: "PRO",
    homeClub: "Gamle Fredrikstad GK",
    ambition: "Head Coach AK Golf Group",
  },
  {
    authId: "pending-markus-akgolf-no",
    email: "markus@akgolf.no",
    name: "Markus Røinås Pedersen",
    role: "COACH",
    tier: "PRO",
    homeClub: "Gamle Fredrikstad GK",
    ambition: "Sportslig leder junior GFGK",
  },
  {
    authId: "pending-leder-gfgkjunior-no",
    email: "leder@gfgkjunior.no",
    name: "Espen Kjølberg",
    role: "ADMIN",
    tier: "PRO",
    homeClub: "Gamle Fredrikstad GK",
    ambition: "Juniorleder GFGK (organisering)",
  },
  {
    authId: "pending-njo-gfgk-no",
    email: "njo@gfgk.no",
    name: "NJO (GFGK)",
    role: "GUEST",
    tier: "PRO",
    homeClub: "Gamle Fredrikstad GK",
    ambition: "Read-only — fasilitet-booking-oversikt GFGK",
  },
] as const;

// ---------- Coach-tilgjengelighet ----------
// weekday: 0=mandag, 1=tirsdag, 2=onsdag, 3=torsdag, 4=fredag, 5=lørdag, 6=søndag

const COACH_AVAILABILITY: ReadonlyArray<{
  coachEmail: string;
  weekday: number;
  startTime: string;
  endTime: string;
  note?: string;
}> = [
  // Anders Kristiansen — personlig coaching utenom WANG-gruppe (M/O/F 08-10)
  // og GFGK Junior Elite (ti/to 16-18 fast booket i gruppe)
  { coachEmail: "anders@akgolf.no", weekday: 0, startTime: "12:00", endTime: "20:00" },
  { coachEmail: "anders@akgolf.no", weekday: 1, startTime: "13:00", endTime: "20:00" },
  { coachEmail: "anders@akgolf.no", weekday: 2, startTime: "12:00", endTime: "20:00" },
  { coachEmail: "anders@akgolf.no", weekday: 3, startTime: "13:00", endTime: "20:00" },
  { coachEmail: "anders@akgolf.no", weekday: 4, startTime: "10:00", endTime: "14:00" },

  // Markus Røinås Pedersen — personlig coaching utenom GFGK Junior-grupper
  // (ti/to 16-20 fast booket i gruppe)
  { coachEmail: "markus@akgolf.no", weekday: 1, startTime: "12:00", endTime: "16:00" },
  { coachEmail: "markus@akgolf.no", weekday: 3, startTime: "12:00", endTime: "16:00" },
];

// ---------- Gruppe-treningstider ----------
// Brukes til å vise faste tider i kalenderen + filtrere ut fra
// coach-tilgjengelighet ved booking.

const GROUP_SCHEDULE: ReadonlyArray<{
  groupName: string;
  weekday: number;
  startTime: string;
  endTime: string;
}> = [
  // WANG Toppidrett — gruppetrening
  { groupName: "WANG Toppidrett Fredrikstad", weekday: 0, startTime: "08:00", endTime: "10:00" }, // Mandag
  { groupName: "WANG Toppidrett Fredrikstad", weekday: 2, startTime: "08:00", endTime: "10:00" }, // Onsdag
  { groupName: "WANG Toppidrett Fredrikstad", weekday: 4, startTime: "08:00", endTime: "10:00" }, // Fredag

  // GFGK Junior — tirsdag og torsdag
  { groupName: "GFGK Junior Elite U19", weekday: 1, startTime: "16:00", endTime: "18:00" },
  { groupName: "GFGK Junior Mini U10", weekday: 1, startTime: "18:00", endTime: "19:00" },
  { groupName: "GFGK Junior Utvikling U15", weekday: 1, startTime: "19:00", endTime: "20:00" },
  { groupName: "GFGK Junior Basis U13", weekday: 1, startTime: "19:00", endTime: "20:00" }, // delt slot

  { groupName: "GFGK Junior Elite U19", weekday: 3, startTime: "16:00", endTime: "18:00" },
  { groupName: "GFGK Junior Mini U10", weekday: 3, startTime: "18:00", endTime: "19:00" },
  { groupName: "GFGK Junior Utvikling U15", weekday: 3, startTime: "19:00", endTime: "20:00" },
  { groupName: "GFGK Junior Basis U13", weekday: 3, startTime: "19:00", endTime: "20:00" }, // delt slot
];

// ---------- Grupper ----------
// Gruppene representerer treningsklassene. Spillere kobles via GroupMember.
// coachId settes etter at COACHES er seedet (Anders/Markus eier gruppene).

const GROUPS = [
  {
    name: "GFGK Junior Mini U10",
    level: "A1",
    coachEmail: "markus@akgolf.no",
  },
  {
    name: "GFGK Junior Basis U13",
    level: "A2",
    coachEmail: "markus@akgolf.no",
  },
  {
    name: "GFGK Junior Utvikling U15",
    level: "A3",
    coachEmail: "markus@akgolf.no",
  },
  {
    name: "GFGK Junior Elite U19",
    level: "A4",
    coachEmail: "anders@akgolf.no",
  },
  {
    name: "WANG Toppidrett Fredrikstad",
    level: "A5",
    coachEmail: "anders@akgolf.no",
  },
] as const;

// ---------- Seed ----------

async function seedLocations() {
  console.log("\n[seed] Locations + Facilities");
  for (const loc of LOCATIONS) {
    const existing = await prisma.location.findFirst({ where: { name: loc.name } });
    const location = existing
      ? await prisma.location.update({
          where: { id: existing.id },
          data: { address: loc.address, active: true },
        })
      : await prisma.location.create({
          data: { name: loc.name, address: loc.address, active: true },
        });
    console.log(`  ${existing ? "·" : "+"} ${location.name}`);

    for (const facilityName of loc.facilities) {
      const facExisting = await prisma.facility.findFirst({
        where: { locationId: location.id, name: facilityName },
      });
      if (facExisting) {
        await prisma.facility.update({
          where: { id: facExisting.id },
          data: { active: true },
        });
        console.log(`    · ${facilityName}`);
      } else {
        await prisma.facility.create({
          data: { locationId: location.id, name: facilityName, capacity: 1 },
        });
        console.log(`    + ${facilityName}`);
      }
    }
  }
}

async function seedServiceTypes() {
  console.log("\n[seed] ServiceTypes");

  // Deaktiver gamle service-types som ikke lenger er i seed-arrayen
  const seedSlugs: string[] = SERVICE_TYPES.map((st) => st.slug);
  const existing = await prisma.serviceType.findMany({
    where: { active: true },
    select: { slug: true },
  });
  const obsolete = existing
    .filter((e) => !seedSlugs.includes(e.slug))
    .map((e) => e.slug);
  if (obsolete.length > 0) {
    await prisma.serviceType.updateMany({
      where: { slug: { in: obsolete } },
      data: { active: false },
    });
    for (const slug of obsolete) console.log(`  − deaktivert ${slug}`);
  }

  for (const st of SERVICE_TYPES) {
    await prisma.serviceType.upsert({
      where: { slug: st.slug },
      update: {
        name: st.name,
        priceOre: st.priceOre,
        durationMin: st.durationMin,
        description: st.description,
        active: true,
      },
      create: {
        slug: st.slug,
        name: st.name,
        priceOre: st.priceOre,
        durationMin: st.durationMin,
        description: st.description,
      },
    });
    console.log(`  · ${st.slug} (${st.priceOre / 100} kr)`);
  }
}

async function seedEmailTemplates() {
  console.log("\n[seed] EmailTemplates");
  for (const tpl of EMAIL_TEMPLATES) {
    await prisma.emailTemplate.upsert({
      where: { slug: tpl.slug },
      update: {
        name: tpl.name,
        subject: tpl.subject,
        body: tpl.body,
        active: true,
      },
      create: {
        slug: tpl.slug,
        name: tpl.name,
        subject: tpl.subject,
        body: tpl.body,
      },
    });
    console.log(`  · ${tpl.slug}`);
  }
}

async function seedCourses() {
  console.log("\n[seed] CourseDefinitions");
  for (const c of COURSES) {
    const existing = await prisma.courseDefinition.findFirst({ where: { name: c.name } });
    if (existing) {
      await prisma.courseDefinition.update({
        where: { id: existing.id },
        data: { par: c.par, rating: c.rating, slope: c.slope },
      });
      console.log(`  · ${c.name}`);
    } else {
      await prisma.courseDefinition.create({
        data: { name: c.name, par: c.par, rating: c.rating, slope: c.slope },
      });
      console.log(`  + ${c.name}`);
    }
  }
}

async function seedCoaches() {
  console.log("\n[seed] Coacher (Users med ADMIN/COACH-rolle)");
  for (const c of COACHES) {
    await prisma.user.upsert({
      where: { email: c.email },
      update: {
        name: c.name,
        role: c.role as "ADMIN" | "COACH" | "PLAYER" | "PARENT",
        tier: c.tier as "GRATIS" | "PRO" | "ELITE",
        homeClub: c.homeClub,
        ambition: c.ambition,
      },
      create: {
        authId: c.authId,
        email: c.email,
        name: c.name,
        role: c.role as "ADMIN" | "COACH" | "PLAYER" | "PARENT",
        tier: c.tier as "GRATIS" | "PRO" | "ELITE",
        homeClub: c.homeClub,
        ambition: c.ambition,
      },
    });
    console.log(`  · ${c.email} (${c.role})`);
  }
}

async function seedCoachAvailability() {
  console.log("\n[seed] CoachAvailability (uke-mal)");

  // Samle alle unike coach-emails i seed-dataen
  const seedCoachEmails = Array.from(
    new Set(COACH_AVAILABILITY.map((a) => a.coachEmail)),
  );

  // Slett ALLE eksisterende availability-records for disse coachene først,
  // bygg på nytt fra COACH_AVAILABILITY. Dette unngår duplikater når
  // start/sluttider endres mellom seed-kjøringer.
  for (const email of seedCoachEmails) {
    const coach = await prisma.user.findUnique({ where: { email } });
    if (!coach) continue;
    const deleted = await prisma.coachAvailability.deleteMany({
      where: { coachId: coach.id },
    });
    if (deleted.count > 0) {
      console.log(`  · Slettet ${deleted.count} gamle records for ${email}`);
    }
  }

  for (const a of COACH_AVAILABILITY) {
    const coach = await prisma.user.findUnique({
      where: { email: a.coachEmail },
    });
    if (!coach) {
      console.warn(`  ! Coach ikke funnet: ${a.coachEmail}`);
      continue;
    }
    await prisma.coachAvailability.create({
      data: {
        coachId: coach.id,
        weekday: a.weekday,
        startTime: a.startTime,
        endTime: a.endTime,
      },
    });
    const dag = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"][a.weekday];
    console.log(`  + ${a.coachEmail} ${dag} ${a.startTime}-${a.endTime}`);
  }
}

async function seedGroups() {
  console.log("\n[seed] Grupper");
  for (const g of GROUPS) {
    const coach = await prisma.user.findUnique({ where: { email: g.coachEmail } });
    if (!coach) {
      console.warn(`  ! Coach ikke funnet: ${g.coachEmail} — hopper over ${g.name}`);
      continue;
    }
    const existing = await prisma.group.findFirst({ where: { name: g.name } });
    if (existing) {
      await prisma.group.update({
        where: { id: existing.id },
        data: { level: g.level, coachId: coach.id },
      });
      console.log(`  · ${g.name} (coach: ${coach.name})`);
    } else {
      await prisma.group.create({
        data: { name: g.name, level: g.level, coachId: coach.id },
      });
      console.log(`  + ${g.name} (coach: ${coach.name})`);
    }
  }
}

async function main() {
  console.log("AK Golf HQ seed");
  console.log("================");

  await seedLocations();
  await seedServiceTypes();
  await seedEmailTemplates();
  await seedCourses();
  await seedCoaches();
  await seedGroups();
  await seedCoachAvailability();

  console.log("\n[seed] Ferdig.");
  console.log("\nMerk: GROUP_SCHEDULE (faste treningstider) er definert i koden");
  console.log("men ikke seeded til DB enda — krever ny GroupSchedule-modell.");
  console.log("Brukes som referanse i kalender-UI-en inntil videre.");
}

main()
  .catch((err) => {
    console.error("[seed] FEIL:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
