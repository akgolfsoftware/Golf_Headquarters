/**
 * Demokontoer for WANG og Team Norway (Anders 15.10.2026).
 *
 *   demo@wang.no            Trener i WANG-demogruppa «wang-toppidrett-demo»
 *   demo@golfforbundet.no   Trener i Team Norway-demogruppa «team-norway-demo»
 *
 * Kontoene peker bare på egne demogrupper med fiktive spillere
 * (src/lib/domain/demo-grupper.ts). De meldes aldri inn i de ekte gruppene,
 * så de ser aldri ekte trenere, kalender eller elever.
 *
 * Passordene leses fra miljøet (DEMO_WANG_EMAIL, DEMO_WANG_PASSWORD,
 * DEMO_TN_EMAIL, DEMO_TN_PASSWORD i .env.local, eller de norske navnene
 * DEMO_WANG_EPOST / DEMO_WANG_PASSORD / DEMO_TN_EPOST / DEMO_TN_PASSORD) og
 * skrives aldri ut.
 * Kontoene opprettes med email_confirm: true, så ingen e-post sendes.
 *
 * Bare rader, ingen skjemaendring. Kan kjøres flere ganger uten dubletter.
 * Kjør fra hovedmappa: npx tsx scripts/seed-demo-wang-tn-2026-10-15.ts
 */

import "./_env";

import { createHash, randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { TN_DEMO_SLUG, WANG_DEMO_SLUG } from "../src/lib/domain/demo-grupper";
import { NAVNGITT_PROFIL_SCOPE, NAVNGITT_PROFIL_TEKST_VERSJON } from "../src/lib/deling/navngitt-regler";

const NORSKE_NAVN: Record<string, string> = {
  DEMO_WANG_EMAIL: "DEMO_WANG_EPOST",
  DEMO_WANG_PASSWORD: "DEMO_WANG_PASSORD",
  DEMO_TN_EMAIL: "DEMO_TN_EPOST",
  DEMO_TN_PASSWORD: "DEMO_TN_PASSORD",
};

function krev(navn: string): string {
  const verdi = process.env[navn]?.trim() || process.env[NORSKE_NAVN[navn] ?? ""]?.trim();
  if (!verdi) throw new Error(`${navn} mangler i .env.local`);
  return verdi;
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: krev("DATABASE_URL") }) });
const admin = createClient(krev("NEXT_PUBLIC_SUPABASE_URL"), krev("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Spiller = { navn: string; /** Del før @ i e-posten når den ikke skal følge navnet. */ epost?: string; hcp: number; klubb: string; skolear: string; fodt: string };

type Oppsett = {
  epostVar: string;
  passordVar: string;
  forventetEpost: string;
  trenerNavn: string;
  gruppe: { slug: string; navn: string; kind: string };
  spillerDomene: string;
  spillere: Spiller[];
  okter: { tittel: string; kind: string | null; dagerFraNa: number; timer: number; varighetMin: number; sted: string }[];
};

// Fiktive spillere. Alle er over 16 år, så ingen foresatt-flyt trengs.
const OPPSETT: Oppsett[] = [
  {
    epostVar: "DEMO_WANG_EMAIL",
    passordVar: "DEMO_WANG_PASSWORD",
    forventetEpost: "demo@wang.no",
    trenerNavn: "Demotrener WANG",
    gruppe: { slug: WANG_DEMO_SLUG, navn: "WANG Toppidrett (demo)", kind: "kontrakt" },
    spillerDomene: "demo-wang.akgolf.test",
    spillere: [
      { navn: "Ida Demo", hcp: 3.4, klubb: "Demo Golfklubb", skolear: "VG2", fodt: "2008-03-14" },
      { navn: "Jon Demo", hcp: 6.1, klubb: "Demo Golfklubb", skolear: "VG2", fodt: "2008-07-02" },
      { navn: "Sara Demo", hcp: 1.8, klubb: "Øvingsbanen GK", skolear: "VG3", fodt: "2007-11-21" },
      { navn: "Emil Demo", hcp: 9.5, klubb: "Øvingsbanen GK", skolear: "VG1", fodt: "2009-01-09" },
      { navn: "Nora Demo", hcp: 4.7, klubb: "Demo Golfklubb", skolear: "VG3", fodt: "2007-05-30" },
    ],
    okter: [
      { tittel: "Morgentrening nærspill (demo)", kind: null, dagerFraNa: 1, timer: 7, varighetMin: 90, sted: "Demo Golfklubb" },
      { tittel: "Fysisk trening (demo)", kind: null, dagerFraNa: 2, timer: 14, varighetMin: 60, sted: "Demohallen" },
      { tittel: "Teknikk og TrackMan (demo)", kind: null, dagerFraNa: 4, timer: 9, varighetMin: 120, sted: "Demo Golfklubb" },
    ],
  },
  {
    epostVar: "DEMO_TN_EMAIL",
    passordVar: "DEMO_TN_PASSWORD",
    forventetEpost: "demo@golfforbundet.no",
    trenerNavn: "Demotrener Team Norway",
    gruppe: { slug: TN_DEMO_SLUG, navn: "Team Norway Golf (demo)", kind: "ekstern" },
    spillerDomene: "demo-tn.akgolf.test",
    spillere: [
      // Demospilleren i Team Norway heter Jørn Johnsen (beslutning 22.10). Samme e-post som før, så kontoen beholdes og bare får nytt navn.
      { navn: "Jørn Johnsen", epost: "mathias.demo", hcp: -1.2, klubb: "Demo Golfklubb", skolear: "VG3", fodt: "2007-02-11" },
      { navn: "Thea Demo", hcp: 0.6, klubb: "Øvingsbanen GK", skolear: "VG2", fodt: "2008-09-17" },
      { navn: "Henrik Demo", hcp: -0.4, klubb: "Demo Golfklubb", skolear: "Ferdig", fodt: "2005-04-03" },
      { navn: "Maja Demo", hcp: 1.1, klubb: "Øvingsbanen GK", skolear: "VG3", fodt: "2007-12-28" },
    ],
    okter: [
      { tittel: "Samling (demo)", kind: "SAMLING", dagerFraNa: 10, timer: 9, varighetMin: 60 * 8, sted: "Demo Golfklubb" },
      { tittel: "Testdag putting (demo)", kind: null, dagerFraNa: 3, timer: 10, varighetMin: 180, sted: "Øvingsbanen GK" },
    ],
  },
];

async function sikreAuthBruker(epost: string, passord: string, navn: string): Promise<string> {
  const metadata = { role: "COACH", firstName: navn.split(" ")[0], lastName: navn.split(" ").slice(1).join(" ") };
  const opprettet = await admin.auth.admin.createUser({ email: epost, password: passord, email_confirm: true, user_metadata: metadata });
  if (opprettet.data.user) return opprettet.data.user.id;
  for (let side = 1; side <= 50; side++) {
    const liste = await admin.auth.admin.listUsers({ page: side, perPage: 200 });
    if (liste.error) throw new Error("Kunne ikke liste Auth-brukere");
    const funnet = liste.data.users.find((u) => u.email?.toLowerCase() === epost);
    if (funnet) {
      const oppdatert = await admin.auth.admin.updateUserById(funnet.id, { password: passord, email_confirm: true, user_metadata: metadata });
      if (oppdatert.error) throw new Error(`Kunne ikke oppdatere Auth-brukeren ${epost}`);
      return funnet.id;
    }
    if (liste.data.users.length < 200) break;
  }
  throw new Error(`Kunne verken opprette eller finne Auth-brukeren ${epost}`);
}

function datoOmDager(dager: number, time: number): Date {
  const d = new Date();
  d.setUTCHours(time - 2, 0, 0, 0); // Oslo sommertid er UTC+2; bare demotid
  d.setUTCDate(d.getUTCDate() + dager);
  return d;
}

async function seed(o: Oppsett) {
  const epost = krev(o.epostVar).toLowerCase();
  if (epost !== o.forventetEpost) throw new Error(`${o.epostVar} må være ${o.forventetEpost}`);
  const passord = krev(o.passordVar);
  if (passord.length < 12) throw new Error(`${o.passordVar} må ha minst 12 tegn`);

  const authId = await sikreAuthBruker(epost, passord, o.trenerNavn);
  const trener = await prisma.user.upsert({
    where: { email: epost },
    update: { authId, name: o.trenerNavn, role: "COACH" },
    create: { authId, email: epost, name: o.trenerNavn, role: "COACH" },
    select: { id: true, role: true },
  });
  if (trener.role !== "COACH") throw new Error(`${epost} har ikke rollen COACH`);

  // Demogruppa har ikke WANG-program, så den dukker aldri opp i lister over ekte WANG-skoler.
  const gruppe = await prisma.group.upsert({
    where: { slug: o.gruppe.slug },
    update: { name: o.gruppe.navn, kind: o.gruppe.kind, program: null, arkivertAt: null },
    create: { slug: o.gruppe.slug, name: o.gruppe.navn, kind: o.gruppe.kind, program: null, managedByAkGolf: false },
    select: { id: true },
  });

  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: gruppe.id, userId: trener.id } },
    update: { role: "COACH", endedAt: null },
    create: { groupId: gruppe.id, userId: trener.id, role: "COACH" },
  });

  for (const s of o.spillere) {
    const spillerEpost = `${s.epost ?? s.navn.toLowerCase().replace(/\s+/g, ".")}@${o.spillerDomene}`;
    const spiller = await prisma.user.upsert({
      where: { email: spillerEpost },
      update: { name: s.navn, role: "PLAYER", hcp: s.hcp, homeClub: s.klubb, school: o.gruppe.navn, schoolYear: s.skolear, dateOfBirth: new Date(`${s.fodt}T00:00:00.000Z`) },
      create: {
        authId: `demo-${spillerEpost}`, email: spillerEpost, name: s.navn, role: "PLAYER",
        hcp: s.hcp, homeClub: s.klubb, school: o.gruppe.navn, schoolYear: s.skolear, dateOfBirth: new Date(`${s.fodt}T00:00:00.000Z`),
      },
      select: { id: true },
    });
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: gruppe.id, userId: spiller.id } },
      update: { role: "PLAYER", endedAt: null },
      create: { groupId: gruppe.id, userId: spiller.id, role: "PLAYER" },
    });

    // Navngitt deling til demotreneren, som om spilleren selv hadde delt profilen.
    // Samme id på samtykke og invitasjon, slik navngittTrenerHarTilgang krever.
    const delingsId = createHash("sha256").update(`demo-deling:${spiller.id}:${gruppe.id}:${trener.id}`).digest("hex").slice(0, 32);
    const finnes = await prisma.trenerDelingsInvitasjon.findUnique({ where: { id: delingsId }, select: { id: true } });
    if (!finnes) {
      const na = new Date();
      await prisma.$transaction([
        prisma.delingsSamtykke.create({ data: {
          id: delingsId, userId: spiller.id, scope: NAVNGITT_PROFIL_SCOPE, mottakerGruppeId: gruppe.id, mottakerUserId: trener.id,
          gitt: true, tekstVersjon: NAVNGITT_PROFIL_TEKST_VERSJON, gittAvUserId: spiller.id, gittAvRolle: "SELV", createdAt: na,
        } }),
        prisma.trenerDelingsInvitasjon.create({ data: {
          id: delingsId, userId: spiller.id, mottakerGruppeId: gruppe.id, mottakerEpost: epost,
          tokenHash: createHash("sha256").update(randomBytes(32)).digest("hex"), tekstVersjon: NAVNGITT_PROFIL_TEKST_VERSJON,
          gittAvUserId: spiller.id, gittAvRolle: "SELV", createdAt: na, expiresAt: new Date(na.getTime() + 7 * 86_400_000),
          acceptedAt: na, acceptedByUserId: trener.id,
        } }),
      ]);
    }
  }

  for (const okt of o.okter) {
    const finnes = await prisma.groupSchedule.findFirst({ where: { groupId: gruppe.id, title: okt.tittel }, select: { id: true } });
    const startAt = datoOmDager(okt.dagerFraNa, okt.timer);
    const data = { title: okt.tittel, kind: okt.kind, location: okt.sted, startAt, endAt: new Date(startAt.getTime() + okt.varighetMin * 60_000), description: "Demodata" };
    if (finnes) await prisma.groupSchedule.update({ where: { id: finnes.id }, data });
    else await prisma.groupSchedule.create({ data: { ...data, groupId: gruppe.id } });
  }

  console.log(`${epost}: trener i «${o.gruppe.navn}» med ${o.spillere.length} fiktive spillere og ${o.okter.length} økter.`);
}

async function main() {
  for (const o of OPPSETT) await seed(o);
  console.log("Ferdig. Ingen e-post er sendt, og ingen ekte gruppe er endret.");
}

main()
  .catch((feil: unknown) => {
    console.error(feil instanceof Error ? feil.message : "Ukjent feil");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
