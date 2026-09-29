/**
 * Demobrukere og demogrupper for WANG- og Team Norway-trenerflatene
 * (Anders 28.09.2026: «en demobruker til hver av dem»).
 *
 * Lager (bare additive rader, ingen nye tabeller, ingen ekte personer):
 *   - Supabase-auth-bruker med e-posten ferdig bekreftet (ingen e-post sendes):
 *       WANG: demo.sportssjef@wang.no  (Sportssjef = hovedcoach i demogruppen)
 *       TN:   demo.trener@golfforbundet.no (Trener i demogruppen)
 *     Passordene genereres her og skrives som DEMO_WANG_EPOST, DEMO_WANG_PASSORD,
 *     DEMO_TN_EPOST og DEMO_TN_PASSORD bakerst i .env.local (gitignorert).
 *     Skriptet skriver dem aldri ut.
 *   - Egne grupper: `wang-toppidrett-demo` og `team-norway-demo`
 *     (src/lib/domain/grupper.ts). Ikke managedByAkGolf.
 *   - Seks oppdiktede elever/spillere per gruppe, merket «(Demo)» i navnet,
 *     med e-post på @demo.invalid (kan aldri leveres) og authId «demo-…»
 *     (kan aldri logge inn).
 *   - Treningsøkter (WorkbenchSession) fire uker bakover og to uker fremover,
 *     testresultater fra Team Norways scorekort (regnet med appens egen
 *     tnScore), en planlagt testdag, perioder, samlinger og en gruppepost.
 *   - TN-spillerne har delt testresultater og stats med TN-demogruppen
 *     (DelingsSamtykke, append-only).
 *
 * Idempotent: kjøres det igjen, gjenbrukes brukere, grupper og passord, og
 * demoradene (økter, resultater, testdag, perioder, samlinger, poster) for
 * de oppdiktede spillerne erstattes. Ingen ekte spiller, gruppe eller bruker
 * røres. Fjernes med scripts/slett-demo-wang-tn-2026-09-29.ts.
 *
 *   npx tsx scripts/add-demo-wang-tn-2026-09-29.ts
 *
 * Miljø: leser .env.local fra hovedkatalogen (~/Developer/akgolf-hq/.env.local)
 * eller DEMO_ENV_FIL. Trenger DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL og
 * SUPABASE_SERVICE_ROLE_KEY.
 */

import { randomBytes } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

import { PrismaClient } from "../src/generated/prisma/client";
import { TN_CATALOG, type TnProtocol } from "../src/lib/portal-tester/tn-catalog";
import { tnScore, type TnValues } from "../src/lib/portal-tester/tn-scoring";
import { tnDefinitionData, tnDefinitionId } from "../src/lib/portal-tester/tn-integration";
import { SAMTYKKE_TEKST_VERSJON } from "../src/lib/deling/samtykke-regler";
import { DEMO, DEMO_ENV_FIL as ENV_FIL, type Omraade } from "./_demo-wang-tn-2026-09-29";



// ---------- miljø og passord ----------

function lesEnvFil(): Map<string, string> {
  const verdier = new Map<string, string>();
  for (const linje of readFileSync(ENV_FIL, "utf8").split("\n")) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(linje.trim());
    if (m) verdier.set(m[1], m[2].replace(/^["']|["']$/g, ""));
  }
  return verdier;
}

function nyttPassord(): string {
  // 24 tegn tilfeldig + store/små bokstaver og tall, uten skall-spesialtegn.
  return `${randomBytes(18).toString("base64url")}Aa9`;
}

/** Gjenbruker passord fra .env.local, eller lager nytt og skriver det bakerst. Skriver aldri ut verdien. */
function hentEllerLagPassord(omraade: Omraade): string {
  const d = DEMO[omraade];
  const env = lesEnvFil();
  const finnes = env.get(d.envPassord);
  if (finnes) return finnes;
  const passord = nyttPassord();
  const linjer = [`${d.envEpost}=${d.epost}`, `${d.envPassord}=${passord}`].filter((l) => !env.has(l.split("=")[0]));
  appendFileSync(ENV_FIL, `\n# Demobruker ${omraade.toUpperCase()} (scripts/add-demo-wang-tn-2026-09-29.ts)\n${linjer.join("\n")}\n`);
  return passord;
}

// ---------- klienter ----------

function krevEnv(navn: string): string {
  const v = process.env[navn];
  if (!v) throw new Error(`${navn} mangler i ${ENV_FIL}`);
  return v;
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: krevEnv("DATABASE_URL") }) });
const supabase = createClient(krevEnv("NEXT_PUBLIC_SUPABASE_URL"), krevEnv("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function finnAuthBruker(epost: string): Promise<string | null> {
  for (let side = 1; side < 100; side += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page: side, perPage: 1000 });
    if (error) throw new Error(`Kunne ikke liste auth-brukere: ${error.message}`);
    const treff = data.users.find((u) => u.email?.toLowerCase() === epost);
    if (treff) return treff.id;
    if (data.users.length < 1000) return null;
  }
  return null;
}

/** Oppretter eller oppdaterer auth-brukeren. E-posten er bekreftet, så ingen e-post sendes. */
async function sikreAuthBruker(epost: string, passord: string, navn: string): Promise<string> {
  const meta = { role: "COACH", firstName: navn.split(" ")[0], lastName: navn.split(" ").slice(1).join(" ") };
  const eksisterende = await finnAuthBruker(epost);
  if (eksisterende) {
    const { error } = await supabase.auth.admin.updateUserById(eksisterende, { password: passord, email_confirm: true, user_metadata: meta });
    if (error) throw new Error(`Kunne ikke oppdatere auth-bruker: ${error.message}`);
    return eksisterende;
  }
  const { data, error } = await supabase.auth.admin.createUser({ email: epost, password: passord, email_confirm: true, user_metadata: meta });
  if (error || !data.user) throw new Error(`Kunne ikke opprette auth-bruker: ${error?.message ?? "ukjent feil"}`);
  return data.user.id;
}

// ---------- tid (Oslo) ----------

/** Dagens dato i Oslo som UTC-midnatt (samme regel som uke-helpers: Date.UTC). */
function osloIDag(): Date {
  const deler = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Oslo" })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  return new Date(Date.UTC(Number(deler.year), Number(deler.month) - 1, Number(deler.day)));
}

function plussDager(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 864e5);
}

/** Oslo-lokal klokke på en gitt dag, som UTC-tidspunkt (CEST +02 / CET +01). */
function osloTid(dag: Date, time: number, minutt = 0): Date {
  const utkast = new Date(Date.UTC(dag.getUTCFullYear(), dag.getUTCMonth(), dag.getUTCDate(), time, minutt));
  const osloTime = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "Europe/Oslo" }).format(utkast));
  const forskjell = (osloTime - time + 24) % 24;
  return new Date(utkast.getTime() - forskjell * 36e5);
}

// Deterministisk «tilfeldighet», så en ny kjøring gir samme tall.
function tall(frø: number): number {
  const x = Math.sin(frø * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// ---------- testresultater ----------

function lagVerdier(p: TnProtocol, frø: number): TnValues {
  const v: TnValues = {};
  p.rows.forEach((rad, i) => {
    const felt: TnValues[string] = {};
    for (const f of rad.fields) {
      if (f.optional) continue;
      const r = tall(frø * 97 + i * 13 + f.key.length);
      if (f.choices) {
        felt[f.key] = f.key === "ok" || f.key === "holed" ? (r < 0.65 ? "Ja" : "Nei") : f.key === "longShort" ? "På mål" : f.choices[0];
        continue;
      }
      let verdi: number;
      switch (f.key) {
        case "hole": verdi = i + 1; break;
        case "target": verdi = Math.round(30 + r * 60); break;
        case "carry": verdi = Math.round(((rad.target ?? 60) + (r - 0.5) * 8) * 10) / 10; break;
        case "side": verdi = Math.round((r - 0.5) * 60) / 10; break;
        case "result": verdi = Math.round((0.2 + r * 3.5) * 10) / 10; break;
        case "feet": verdi = Math.round(r * 40) / 10; break;
        case "strokes": verdi = r < 0.6 ? 1 : 2; break;
        case "points": verdi = Math.round(r * 3); break;
        case "distance": verdi = Math.round(r * 30) / 10; break;
        default: verdi = Math.round((1 + r * 9) * 10) / 10;
      }
      if (f.integer) verdi = Math.max(f.min ?? 0, Math.round(verdi));
      if (f.min !== undefined && verdi < f.min) verdi = f.min > 0 ? f.min : 0;
      felt[f.key] = verdi;
    }
    if (felt.ok === "Nei" && rad.fields.some((f) => f.key === "miss")) felt.miss = "Venstre";
    v[String(i + 1)] = felt;
  });
  return v;
}

/** Protokollene appen kan regne ut med oppdiktede, gyldige forsøk. */
function brukbareProtokoller(): { p: TnProtocol; lag: (frø: number) => { values: TnValues; score: number; details: ReturnType<typeof tnScore> } }[] {
  const ut: { p: TnProtocol; lag: (frø: number) => { values: TnValues; score: number; details: ReturnType<typeof tnScore> } }[] = [];
  for (const p of TN_CATALOG) {
    if (p.blocked || p.variableCount) continue;
    try {
      const prov = tnScore(p, lagVerdier(p, 1));
      if (!Number.isFinite(prov.score)) continue;
      ut.push({
        p,
        lag: (frø) => {
          const values = lagVerdier(p, frø);
          const details = tnScore(p, values);
          return { values, score: details.score, details };
        },
      });
    } catch {
      // Protokollen trenger forsøk generatoren ikke lager gyldig. Hoppes over.
    }
  }
  return ut.slice(0, 4);
}

// ---------- hovedløp per område ----------

const PYRAMIDE = ["TEK", "SLAG", "SPILL", "FYS", "TURN"] as const;
const PERIODER = [
  { name: "Grunnperiode", fra: "2026-08-17", til: "2026-10-18", tone: "primary", note: "Demo · grunnperiode" },
  { name: "Evaluering", fra: "2026-10-19", til: "2026-11-15", tone: "muted", note: "Demo · testuker og utviklingssamtaler" },
  { name: "Spesialperiode", fra: "2026-11-16", til: "2027-03-28", tone: "gold", note: "Demo · spesialperiode" },
  { name: "Turneringsperiode", fra: "2027-03-29", til: "2027-06-20", tone: "accent", note: "Demo · turneringsperiode" },
];

async function seedOmraade(omraade: Omraade) {
  const d = DEMO[omraade];
  const passord = hentEllerLagPassord(omraade);
  const authId = await sikreAuthBruker(d.epost, passord, d.navn);

  const trener = await prisma.user.upsert({
    where: { email: d.epost },
    update: { authId, name: d.navn, role: "COACH", deletedAt: null },
    create: { authId, email: d.epost, name: d.navn, role: "COACH" },
    select: { id: true },
  });

  const gruppe = await prisma.group.upsert({
    where: { slug: d.slug },
    update: { name: d.gruppenavn, hovedcoachId: trener.id, coachId: trener.id, arkivertAt: null },
    create: { slug: d.slug, name: d.gruppenavn, kind: "adhoc", managedByAkGolf: false, hovedcoachId: trener.id, coachId: trener.id },
    select: { id: true },
  });

  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: gruppe.id, userId: trener.id } },
    update: { role: "COACH", endedAt: null },
    create: { groupId: gruppe.id, userId: trener.id, role: "COACH" },
  });

  const idag = osloIDag();
  const spillere: string[] = [];
  for (const [i, navn] of d.elever.entries()) {
    const nr = i + 1;
    const epost = d.elevEpost(nr);
    const fodt = new Date(Date.UTC(2008 + (i % 3), (i * 2) % 12, 5 + i));
    const bruker = await prisma.user.upsert({
      where: { email: epost },
      update: { name: `${navn} (Demo)`, deletedAt: null },
      create: {
        authId: `${d.authPrefiks}${String(nr).padStart(2, "0")}`,
        email: epost,
        name: `${navn} (Demo)`,
        role: "PLAYER",
        dateOfBirth: fodt,
        hcp: Math.round((0.5 + tall(nr + (omraade === "tn" ? 50 : 0)) * 6) * 10) / 10,
        homeClub: "Demo GK",
        school: d.skole,
        schoolYear: ["VG1", "VG2", "VG3"][i % 3],
      },
      select: { id: true },
    });
    spillere.push(bruker.id);
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: gruppe.id, userId: bruker.id } },
      update: { role: "PLAYER", endedAt: null },
      create: { groupId: gruppe.id, userId: bruker.id, role: "PLAYER" },
    });
  }

  // Treningsøkter: fire uker bakover, to uker fremover.
  await prisma.workbenchSession.deleteMany({ where: { playerId: { in: spillere } } });
  const okter = [];
  for (let dag = -28; dag <= 14; dag += 1) {
    const dato = plussDager(idag, dag);
    const ukedag = dato.getUTCDay(); // 0 søndag
    const erOktdag = omraade === "wang" ? [1, 3, 5].includes(ukedag) : [2, 4].includes(ukedag);
    if (!erOktdag) continue;
    for (const [i, spillerId] of spillere.entries()) {
      const pyramide = PYRAMIDE[(dag + 28 + i) % PYRAMIDE.length];
      const passert = dag < 0;
      const gjennomfort = passert && tall(dag * 7 + i) > 0.18;
      okter.push({
        playerId: spillerId,
        coachId: trener.id,
        groupId: gruppe.id,
        date: dato,
        startMinute: omraade === "wang" ? 480 : 960,
        durationMinutes: omraade === "wang" ? 120 : 90,
        title: omraade === "wang" ? `Morgentrening · ${pyramide}` : `Samlingsøkt · ${pyramide}`,
        pyramid: pyramide,
        status: gjennomfort ? "COMPLETED" : "PUBLISHED",
        actualMinutes: gjennomfort ? (omraade === "wang" ? 100 : 75) + Math.round(tall(dag + i * 3) * 20) : null,
        perceivedEffort: gjennomfort ? 4 + Math.round(tall(dag * 3 + i) * 4) : null,
        location: omraade === "wang" ? "Demo GK" : "Demo treningssenter",
        notes: "Demodata (scripts/add-demo-wang-tn-2026-09-29.ts)",
        origin: "COACH",
        publishedAt: plussDager(dato, -7),
        publishedBy: trener.id,
        createdBy: trener.id,
      });
    }
  }
  await prisma.workbenchSession.createMany({ data: okter });

  // Testresultater etter Team Norways scorekort, to runder per spiller.
  await prisma.testDay.deleteMany({ where: { groupId: gruppe.id } });
  await prisma.testResult.deleteMany({ where: { userId: { in: spillere } } });
  const protokoller = brukbareProtokoller();
  for (const { p } of protokoller) {
    await prisma.testDefinition.upsert({ where: { id: tnDefinitionId(p) }, update: {}, create: tnDefinitionData(p) });
  }
  let antallResultater = 0;
  for (const [i, spillerId] of spillere.entries()) {
    for (const [j, { p, lag }] of protokoller.entries()) {
      for (const [k, dagerSiden] of [42, 7].entries()) {
        const r = lag(i * 10 + j * 3 + k + (omraade === "tn" ? 500 : 0));
        // Rå SQL med bare kolonnene som finnes i basen: test_results mangler
        // witnessUserId, witnessStatus og attestationMode (skjemaet er foran
        // basen, målt 29.09.2026), så prisma.testResult.create feiler.
        const takenAt = osloTid(plussDager(idag, -dagerSiden - j), 9);
        await prisma.$executeRaw`
          insert into test_results ("id", "userId", "testId", "takenAt", "score", "notes", "details", "createdAt", "recordedById")
          values (${`demo_${randomBytes(12).toString("hex")}`}, ${spillerId}, ${tnDefinitionId(p)}, ${takenAt}, ${r.score}, ${"Demodata"}, ${JSON.stringify(r.details)}::jsonb, now(), ${trener.id})`;
        antallResultater += 1;
      }
    }
  }

  // Én planlagt testdag om ti dager, alle spillerne står i køen.
  if (protokoller[0]) {
    await prisma.testDay.create({
      data: {
        groupId: gruppe.id,
        coachId: trener.id,
        title: "Høsttest (demo)",
        location: "Demo GK",
        scheduledAt: osloTid(plussDager(idag, 10), 9),
        testDefinitionId: tnDefinitionId(protokoller[0].p),
        participants: { create: spillere.map((playerId, order) => ({ playerId, order })) },
      },
    });
  }

  // Perioder og samlinger.
  await prisma.trainingPeriod.deleteMany({ where: { groupId: gruppe.id } });
  await prisma.trainingPeriod.createMany({
    data: PERIODER.map((p) => ({
      groupId: gruppe.id,
      schoolYear: "2026/2027",
      name: p.name,
      startDate: new Date(`${p.fra}T00:00:00+02:00`),
      endDate: new Date(`${p.til}T23:59:59+02:00`),
      tone: p.tone,
      note: p.note,
    })),
  });
  await prisma.groupSchedule.deleteMany({ where: { groupId: gruppe.id } });
  await prisma.groupSchedule.createMany({
    data: [
      { groupId: gruppe.id, title: "Samling (demo)", location: "Demo GK", startAt: osloTid(plussDager(idag, 17), 9), endAt: osloTid(plussDager(idag, 19), 15), kind: "SAMLING", description: "Demodata" },
      { groupId: gruppe.id, title: "Heldagssamling (demo)", location: "Demo GK", startAt: osloTid(plussDager(idag, -12), 9), endAt: osloTid(plussDager(idag, -12), 16), kind: "HELDAGSSAMLING", description: "Demodata" },
    ],
  });

  // Team Norway: spillerne har delt med demogruppen, og det finnes en gruppepost.
  if (omraade === "tn") {
    for (const spillerId of spillere) {
      for (const scope of ["TEST_RESULTATER", "STATS"] as const) {
        const finnes = await prisma.delingsSamtykke.findFirst({ where: { userId: spillerId, scope, mottakerGruppeId: gruppe.id, gitt: true }, select: { id: true } });
        if (!finnes) {
          await prisma.delingsSamtykke.create({
            data: { userId: spillerId, scope, mottakerGruppeId: gruppe.id, gitt: true, tekstVersjon: SAMTYKKE_TEKST_VERSJON, gittAvUserId: spillerId, gittAvRolle: "SELV" },
          });
        }
      }
    }
  }
  await prisma.tnPost.deleteMany({ where: { groupId: gruppe.id } });
  if (omraade === "tn") {
    await prisma.tnPost.create({
      data: { groupId: gruppe.id, authorUserId: trener.id, kind: "TEKST", tekst: "Velkommen til demogruppen. Alle spillere og tall her er oppdiktet." },
    });
  }

  return { omraade, gruppeId: gruppe.id, spillere: spillere.length, okter: okter.length, resultater: antallResultater, protokoller: protokoller.map((x) => x.p.id) };
}

async function main() {
  const resultat = [];
  for (const omraade of ["wang", "tn"] as const) {
    resultat.push(await seedOmraade(omraade));
  }
  // Lesespørring: brukere og grupper finnes, med riktig medlemskap.
  for (const omraade of ["wang", "tn"] as const) {
    const d = DEMO[omraade];
    const gruppe = await prisma.group.findUnique({
      where: { slug: d.slug },
      select: { slug: true, hovedcoachId: true, managedByAkGolf: true, _count: { select: { members: true } } },
    });
    const trener = await prisma.user.findUnique({ where: { email: d.epost }, select: { id: true, role: true } });
    const medlem = trener && gruppe ? await prisma.groupMember.findFirst({ where: { userId: trener.id, group: { slug: d.slug }, endedAt: null }, select: { role: true } }) : null;
    console.log(
      `${omraade.toUpperCase()}: bruker ${d.epost} rolle=${trener?.role ?? "MANGLER"} · gruppe ${gruppe?.slug ?? "MANGLER"} medlemmer=${gruppe?._count.members ?? 0} managedByAkGolf=${gruppe?.managedByAkGolf} · trener i gruppen som ${medlem?.role ?? "MANGLER"} · hovedcoach=${gruppe?.hovedcoachId === trener?.id}`,
    );
  }
  for (const r of resultat) {
    console.log(`${r.omraade.toUpperCase()}: ${r.spillere} demospillere, ${r.okter} økter, ${r.resultater} testresultater (${r.protokoller.join(", ")})`);
  }
  console.log(`Passordene står i ${ENV_FIL} (DEMO_WANG_PASSORD, DEMO_TN_PASSORD). De skrives ikke ut her.`);
}

main()
  .catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
