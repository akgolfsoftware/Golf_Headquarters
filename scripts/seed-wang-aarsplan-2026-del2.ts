/**
 * Seed del 2: WANG-årsplan 2026/2027 — turneringer + skolerute + kollisjonstiltak.
 *
 * Kilder (hentet 19. juli 2026, aldri fra hukommelse):
 *  - NGF-terminliste via GolfBox ScheduleHandler-API (CustomerId 18 = NGF,
 *    878 = Region Øst) — Srixon Tour, Garmin Norgescup, Olyo Juniortour.
 *  - Srixon Tour 2026-PDF (golfforbundet.no) — kryssjekket mot API.
 *  - Fredrikstad kommunes skolerute 2026-2027 (PDF) — ferier/fridager.
 *    NB: grunnskole-ruta; WANG kan avvike — bekreft mot WANGs egen rute.
 *
 * Gjør også kollisjonstiltak funnet mot skoleruta:
 *  - Skoleslutt er fredag 18.6 (ikke 19.6) → TURN-periodens sluttdato justeres.
 *  - Testkonkurranse 4/4 lå i høstferien (man 28.9) → slås sammen med
 *    8-ball (3/3) onsdag 23.9 som konkurranse-finale.
 *
 * Idempotent. Kjør:  npx tsx scripts/seed-wang-aarsplan-2026-del2.ts
 */
import "./_env";
import { prisma } from "@/lib/prisma";

const GROUP_ID = "cmp28uk1b000l99e5m764g2wx"; // WANG Toppidrett Fredrikstad
const SCHOOL_YEAR = "2026/2027";

function d(s: string): Date {
  return new Date(s);
}

// ---------- Turneringskatalog (offisielle NGF/Region Øst-datoer) ----------
const TURNERINGER: {
  slug: string; name: string; start: string; end?: string; tour: string; location: string; notes?: string;
}[] = [
  { slug: "olyo-onsoy-2026", name: "Olyo Juniortour Onsøy GK (KP3)", start: "2026-08-16", tour: "junior-no", location: "Onsøy GK" },
  { slug: "srixon-tour-7-2026", name: "Srixon Tour #7 (U19) — Nøtterøy GK", start: "2026-08-29", end: "2026-08-30", tour: "junior-no", location: "Nøtterøy GK", notes: "54 hull (36+18). Påmeldingsfrist 17. aug kl. 12:00." },
  { slug: "gnc-6-hauger-2026", name: "Garmin Norgescup #6 — Hauger GK", start: "2026-09-05", end: "2026-09-06", tour: "amateur-no", location: "Hauger GK" },
  { slug: "olyo-mjosen-2026", name: "Olyo Juniortour Mjøsen GK", start: "2026-09-05", tour: "junior-no", location: "Mjøsen GK" },
  { slug: "srixon-tour-8-2026", name: "Srixon Tour #8 — Salten GK", start: "2026-09-12", end: "2026-09-13", tour: "junior-no", location: "Salten GK", notes: "54 hull (36+18). Lang reisevei (fly). Påmeldingsfrist 31. aug kl. 12:00." },
  { slug: "olyo-skjeberg-2026", name: "Olyo Juniortour Skjeberg GK", start: "2026-09-19", tour: "junior-no", location: "Skjeberg GK" },
  { slug: "olyo-gfgk-2026", name: "Olyo Juniortour Gamle Fredrikstad GK", start: "2026-09-20", tour: "junior-no", location: "Gamle Fredrikstad GK", notes: "HJEMMEBANE — hele gruppen bør stille." },
  { slug: "srixon-finale-2026", name: "Srixon Tour Finale — Stavanger GK", start: "2026-09-26", end: "2026-09-28", tour: "junior-no", location: "Stavanger GK", notes: "54 hull (18+18+18). Slutter mandag 28.9 (første høstferiedag). Påmeldingsfrist 14. sep kl. 12:00." },
];

// ---------- Skolerute (Fredrikstad kommune 2026-2027) ----------
const FERIEDAGER: { date: string; title: string; note?: string }[] = [
  ...["2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02"].map((x) => ({ date: x, title: "Høstferie (uke 40)" })),
  ...["2026-12-21", "2026-12-22", "2026-12-23", "2026-12-24", "2026-12-25", "2026-12-28", "2026-12-29", "2026-12-30", "2026-12-31", "2027-01-01"].map((x) => ({ date: x, title: "Juleferie" })),
  ...["2027-02-22", "2027-02-23", "2027-02-24", "2027-02-25", "2027-02-26"].map((x) => ({ date: x, title: "Vinterferie (uke 8)" })),
  ...["2027-03-22", "2027-03-23", "2027-03-24", "2027-03-25", "2027-03-26", "2027-03-29"].map((x) => ({ date: x, title: "Påskeferie" })),
  { date: "2026-11-19", title: "Planleggingsdag (elevfri)" },
  { date: "2027-05-06", title: "Kristi himmelfartsdag" },
  { date: "2027-05-07", title: "Planleggingsdag (elevfri)" },
  { date: "2027-05-17", title: "17. mai — nasjonaldag" },
];

async function main() {
  // ---------- 1) Turneringskatalog ----------
  let nyeTurneringer = 0;
  const idAvSlug: Record<string, string> = {};
  for (const t of TURNERINGER) {
    let row = await prisma.tournament.findUnique({ where: { slug: t.slug }, select: { id: true } });
    if (!row) {
      row = await prisma.tournament.create({
        data: {
          slug: t.slug, name: t.name, startDate: d(t.start), endDate: t.end ? d(t.end) : null,
          sourceOrigin: "NGF", tour: t.tour, country: "NO", location: t.location,
          status: "UPCOMING", notes: t.notes ?? null,
        },
        select: { id: true },
      });
      nyeTurneringer++;
    }
    idAvSlug[t.slug] = row.id;
  }
  console.log(`Turneringer i katalog: ${TURNERINGER.length} (${nyeTurneringer} nye)`);

  // ---------- 2) Påmeldinger: Max (kvalifisert) + Sondre (tentativ) ----------
  const srixonSlugs = ["srixon-tour-7-2026", "srixon-tour-8-2026", "srixon-finale-2026"];
  const max = await prisma.user.findUnique({ where: { email: "max.risvag@akgolf.no" }, select: { id: true } });
  const sondre = await prisma.user.findUnique({ where: { email: "sondre.thogersen@akgolf.no" }, select: { id: true } });
  let nyeEntries = 0;
  for (const [user, notes] of [
    [max, "Kvalifisert til Srixon Tour."],
    [sondre, "Tentativ — Srixon-kvalifisering ikke bekreftet."],
  ] as const) {
    if (!user) continue;
    for (const slug of srixonSlugs) {
      const finnes = await prisma.tournamentEntry.findFirst({
        where: { userId: user.id, tournamentId: idAvSlug[slug] }, select: { id: true },
      });
      if (finnes) continue;
      await prisma.tournamentEntry.create({
        data: { userId: user.id, tournamentId: idAvSlug[slug], priority: "MAJOR", entryStatus: "PLANNED", notes },
      });
      nyeEntries++;
    }
  }
  console.log(`Turneringspåmeldinger: ${nyeEntries} nye (Max + Sondre tentativ)`);

  // ---------- 3) Turneringsmarkeringer i gruppekalenderen ----------
  const MARKERINGER: { title: string; startAt: Date; endAt: Date; description: string }[] = [
    { title: "Klubbmesterskap GFGK (NGF anbefalt helg — bekreft dato med GFGK)", startAt: d("2026-08-22T08:00:00"), endAt: d("2026-08-23T18:00:00"), description: "NGF anbefaler 22.–23.8 for klubbmesterskap. Bekreft eksakt dato med GFGK." },
    { title: "Turnering: Srixon Tour #7 (U19) — Nøtterøy GK", startAt: d("2026-08-29T08:00:00"), endAt: d("2026-08-30T18:00:00"), description: "Max (+ ev. Sondre). Fredag 28.8: innspillsdag — Srixon-spillere borte fra fredagsøkta. Mandag 31.8: 60 min teknisk sjekk." },
    { title: "Turnering: Garmin Norgescup #6 — Hauger GK", startAt: d("2026-09-05T08:00:00"), endAt: d("2026-09-06T18:00:00"), description: "Fredag 4.9: innspillsdag for GNC-spillere. Mandag 7.9: teknisk sjekk." },
    { title: "Turnering: Olyo Juniortour Mjøsen GK", startAt: d("2026-09-05T08:00:00"), endAt: d("2026-09-05T18:00:00"), description: "Samme helg som GNC #6 — fordel spillerne." },
    { title: "Turnering: Srixon Tour #8 — Salten GK", startAt: d("2026-09-12T08:00:00"), endAt: d("2026-09-13T18:00:00"), description: "Lang reisevei (fly). Fredag 11.9: innspill/reise. Mandag 14.9: teknisk sjekk — vurder fri ved lite søvn (reisevei-unntaket)." },
    { title: "Turnering: Olyo Juniortour Skjeberg GK", startAt: d("2026-09-19T08:00:00"), endAt: d("2026-09-19T18:00:00"), description: "Lørdag. Mandag 21.9: teknisk sjekk for de som spilte." },
    { title: "Turnering: Olyo Juniortour Gamle Fredrikstad GK (HJEMMEBANE)", startAt: d("2026-09-20T08:00:00"), endAt: d("2026-09-20T18:00:00"), description: "Hjemmebane — hele gruppen bør stille. Mandag 21.9: teknisk sjekk." },
    { title: "Turnering: Srixon Tour Finale — Stavanger GK", startAt: d("2026-09-26T08:00:00"), endAt: d("2026-09-28T18:00:00"), description: "Lør–man (slutter 28.9, første høstferiedag — ingen skolekonflikt). Fredag 25.9: innspillsdag — finalespillere borte." },
  ];
  let nyeMark = 0;
  for (const m of MARKERINGER) {
    const finnes = await prisma.groupSchedule.findFirst({ where: { groupId: GROUP_ID, title: m.title }, select: { id: true } });
    if (finnes) continue;
    await prisma.groupSchedule.create({ data: { groupId: GROUP_ID, title: m.title, startAt: m.startAt, endAt: m.endAt, description: m.description } });
    nyeMark++;
  }
  console.log(`Turneringsmarkeringer: ${MARKERINGER.length} (${nyeMark} nye)`);

  // ---------- 4) Skolerute ----------
  let nyeSkole = 0;
  for (const f of FERIEDAGER) {
    const finnes = await prisma.schoolScheduleEntry.findFirst({
      where: { schoolYear: SCHOOL_YEAR, date: d(f.date), title: f.title }, select: { id: true },
    });
    if (finnes) continue;
    await prisma.schoolScheduleEntry.create({
      data: { schoolYear: SCHOOL_YEAR, classYear: null, date: d(f.date), category: "FERIE", title: f.title, note: f.note ?? "Kilde: Fredrikstad kommune skolerute 26/27 — bekreft mot WANGs egen rute." },
    });
    nyeSkole++;
  }
  const sisteSkoledag = await prisma.schoolScheduleEntry.findFirst({ where: { schoolYear: SCHOOL_YEAR, title: "Siste skoledag" }, select: { id: true } });
  if (!sisteSkoledag) {
    await prisma.schoolScheduleEntry.create({
      data: { schoolYear: SCHOOL_YEAR, classYear: null, date: d("2027-06-18"), category: "ANNET", title: "Siste skoledag", note: "Fredag 18. juni 2027 (Fredrikstad kommune skolerute)." },
    });
    nyeSkole++;
  }
  console.log(`Skolerute-dager: ${nyeSkole} nye`);

  // ---------- 5) Kollisjonstiltak ----------
  // a) Skoleslutt 18.6 → juster TURN-periodens slutt (kalender + blokk)
  const turKal = await prisma.trainingPeriod.updateMany({
    where: { groupId: GROUP_ID, schoolYear: SCHOOL_YEAR, name: "TURN", endDate: d("2027-06-19") },
    data: { endDate: d("2027-06-18") },
  });
  const turBlokk = await prisma.groupPeriodBlock.updateMany({
    where: { groupId: GROUP_ID, lPhase: "TURNERING", startDate: d("2027-05-01"), endDate: d("2027-06-19") },
    data: { endDate: d("2027-06-18") },
  });
  console.log(`TURN-slutt justert til 18.6: kalender=${turKal.count}, blokk=${turBlokk.count}`);

  // b) Testkonkurranse 4/4 lå i høstferien → slå sammen med 8-ball (3/3) 23.9
  const slettet = await prisma.groupSchedule.deleteMany({
    where: { groupId: GROUP_ID, title: "Testkonkurranse 4/4: 8-ball Blocked" },
  });
  const oppdatert = await prisma.groupSchedule.updateMany({
    where: { groupId: GROUP_ID, title: "Test: 8-ball Blocked + Variation (3/3)" },
    data: { description: "Testbatteri: 8-ball-blocked + 8-ball-variation. OGSÅ Testkonkurranse-FINALE (4/4) — to tabeller: Best resultat + Best resultat etter nivå. Premiering etter høstferien. (Flyttet fra man 28.9 som er første høstferiedag.)" },
  });
  console.log(`Testkonkurranse-finale flyttet: slettet=${slettet.count}, oppdatert 8-ball(3/3)=${oppdatert.count}`);

  // c) Fredagsdeling-notater om turneringsfravær
  await prisma.groupSchedule.updateMany({
    where: { groupId: GROUP_ID, title: "Fredagsdeling (test 1/2): banecoaching + egentrening", description: { not: { contains: "Srixon" } } },
    data: { description: "Gruppe A (banecoaching m/ Anders): Fredrik Kjølberg Hovland, Aksel Lind, Jakob Holm, Sondre U. Thøgersen. Gruppe B (egentrening etter egen plan): Ludvik Vanberg, Constanse Hauglid, Anders Rafshol, Max Risvåg. Viktoria Hammer: eget opplegg (langtidsskade — ikke golfspesifikk trening før ca. des). Jevn fordeling, VG1 spres — rullerer neste uke. NB: Srixon-spillere (Max, ev. Sondre) er borte — innspillsdag Nøtterøy (Srixon #7 lør–søn)." },
  });
  await prisma.groupSchedule.updateMany({
    where: { groupId: GROUP_ID, title: "Fredagsdeling (test 2/2): banecoaching + egentrening", description: { not: { contains: "GNC" } } },
    data: { description: "Byttet: Gruppe A (banecoaching m/ Anders): Ludvik Vanberg, Constanse Hauglid, Anders Rafshol, Max Risvåg. Gruppe B (egentrening): Fredrik Kjølberg Hovland, Aksel Lind, Jakob Holm, Sondre U. Thøgersen. Viktoria Hammer: eget opplegg. Evaluer delingen etter denne økta. NB: GNC #6-/Olyo Mjøsen-spillere kan være borte (innspillsdag)." },
  });
  console.log("Fredagsdeling-notater oppdatert med turneringsfravær");

  console.log("\nFERDIG del 2.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
