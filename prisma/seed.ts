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
    address: "Bossumveien 6, 1605 Fredrikstad",
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
] as const;

// ---------- ServiceTypes ----------
// Pris i ØRE (Int). 650 kr = 65000 øre.

const SERVICE_TYPES = [
  {
    slug: "pro-time-30-min",
    name: "Pro-time 30 min",
    priceOre: 65000,
    durationMin: 30,
    description: "30 minutter én-til-én med Pro. Fokus på ett tema.",
  },
  {
    slug: "pro-time-60-min",
    name: "Pro-time 60 min",
    priceOre: 119000,
    durationMin: 60,
    description: "Full time én-til-én med Pro. Tek, taktikk eller mental.",
  },
  {
    slug: "trackman-analyse-60-min",
    name: "Trackman-analyse 60 min",
    priceOre: 149000,
    durationMin: 60,
    description:
      "Full analyse på Trackman med dispersjon, klubbdata og 3D-bane-flight.",
  },
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

async function main() {
  console.log("AK Golf HQ seed");
  console.log("================");

  await seedLocations();
  await seedServiceTypes();
  await seedEmailTemplates();
  await seedCourses();

  console.log("\n[seed] Ferdig.");
}

main()
  .catch((err) => {
    console.error("[seed] FEIL:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
