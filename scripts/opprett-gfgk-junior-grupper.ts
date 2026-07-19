import "./_env";
import { prisma } from "@/lib/prisma";

/**
 * Oppretter de 4 GFGK Junior-gruppene med faste ukentlige økter og
 * sesongperioder, slik at gfgkjunior.no-sidene (/gfgk-junior/*) synkroniserer
 * automatisk fra AgencyOS. Workbench/AgencyOS er master etter opprettelsen —
 * dette scriptet er kun bootstrap og er idempotent (hopper over det som finnes).
 *
 *   npx tsx scripts/opprett-gfgk-junior-grupper.ts
 *
 * Kanonisk ukeplan (design-prosjektets CLAUDE.md, alle grupper ti+to):
 *   U10 17:00–18:00 · U13/U15 16:00–18:00 · U19 16:00–18:30
 * Tidene lagres som Oslo-veggklokke på referansedatoer i utesesongen
 * (hent-data.ts leser ukedag+klokkeslett i Europe/Oslo fra startAt).
 */

// Referanseuke i utesesongen 2026 (CEST): tirsdag 21. april + torsdag 23. april.
const REF = { tirsdag: "2026-04-21", torsdag: "2026-04-23" };

type Okt = {
  dag: keyof typeof REF;
  start: string;
  slutt: string;
  title: string;
  location: string;
};

const GRUPPER: { navn: string; level: string; okter: Okt[] }[] = [
  {
    navn: "GFGK Junior Mini U10",
    level: "A5",
    okter: [
      { dag: "tirsdag", start: "17:00", slutt: "18:00", title: "Lekbasert trening", location: "Treningsområdet" },
      { dag: "torsdag", start: "17:00", slutt: "18:00", title: "Spill og aktiviteter", location: "Korthullsbanen" },
    ],
  },
  {
    navn: "GFGK Junior Basis U13",
    level: "A4",
    okter: [
      { dag: "tirsdag", start: "16:00", slutt: "18:00", title: "Teknikk – fullt sving og nærspill", location: "Driving Range" },
      { dag: "torsdag", start: "16:00", slutt: "18:00", title: "Spill på banen", location: "Golfbanen" },
    ],
  },
  {
    navn: "GFGK Junior Utvikling U15",
    level: "A3",
    okter: [
      { dag: "tirsdag", start: "16:00", slutt: "18:00", title: "Teknikk med video", location: "Driving Range" },
      { dag: "torsdag", start: "16:00", slutt: "18:00", title: "Banespill med scoring", location: "Golfbanen" },
    ],
  },
  {
    navn: "GFGK Junior Elite U19",
    level: "A2",
    okter: [
      { dag: "tirsdag", start: "16:00", slutt: "18:30", title: "Individualisert teknisk trening", location: "Driving Range" },
      { dag: "torsdag", start: "16:00", slutt: "18:30", title: "Banespill og turneringsforberedelse", location: "Golfbanen" },
    ],
  },
];

// Sesongperioder 2026/2027 (periodiseringsmodellen: Evaluering → Grunn → Spes → Turn)
const PERIODER = [
  { name: "TURN", start: "2026-06-22", slutt: "2026-10-18", tone: "accent", note: "Turneringsperiode – TRANSFER/PERFORM" },
  { name: "Testuke", start: "2026-10-19", slutt: "2026-11-15", tone: "muted", note: "Evaluering – testuker og utviklingssamtaler" },
  { name: "GRUNN", start: "2026-11-16", slutt: "2027-03-28", tone: "primary", note: "Grunnperiode – BUILD/STAB innendørs" },
  { name: "SPES", start: "2027-03-29", slutt: "2027-06-27", tone: "gold", note: "Spesialisering – TEST/TRANSFER mot bane" },
];

function osloDato(dato: string, tid: string): Date {
  // Utesesong = CEST (+02:00) for referansedatoene brukt her.
  return new Date(`${dato}T${tid}:00+02:00`);
}

async function main() {
  for (const g of GRUPPER) {
    let gruppe = await prisma.group.findFirst({ where: { name: g.navn } });
    if (!gruppe) {
      gruppe = await prisma.group.create({ data: { name: g.navn, level: g.level } });
      console.log(`Opprettet gruppe: ${g.navn}`);
    } else {
      console.log(`Gruppe finnes: ${g.navn}`);
    }

    const antallFaste = await prisma.groupSchedule.count({
      where: { groupId: gruppe.id, recurring: "WEEKLY" },
    });
    if (antallFaste === 0) {
      for (const okt of g.okter) {
        await prisma.groupSchedule.create({
          data: {
            groupId: gruppe.id,
            title: okt.title,
            startAt: osloDato(REF[okt.dag], okt.start),
            endAt: osloDato(REF[okt.dag], okt.slutt),
            location: okt.location,
            recurring: "WEEKLY",
          },
        });
      }
      console.log(`  + ${g.okter.length} faste økter (ti/to)`);
    } else {
      console.log(`  faste økter finnes (${antallFaste}) – hopper over`);
    }

    const antallPerioder = await prisma.trainingPeriod.count({ where: { groupId: gruppe.id } });
    if (antallPerioder === 0) {
      for (const p of PERIODER) {
        await prisma.trainingPeriod.create({
          data: {
            groupId: gruppe.id,
            schoolYear: "2026/2027",
            name: p.name,
            startDate: new Date(`${p.start}T00:00:00+02:00`),
            endDate: new Date(`${p.slutt}T23:59:59+02:00`),
            tone: p.tone,
            note: p.note,
          },
        });
      }
      console.log(`  + ${PERIODER.length} sesongperioder (2026/2027)`);
    } else {
      console.log(`  perioder finnes (${antallPerioder}) – hopper over`);
    }
  }
  console.log("Ferdig. AgencyOS (/admin/grupper + Workbench) er nå master for planene.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
