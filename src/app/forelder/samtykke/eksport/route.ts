// GDPR-dataeksport · GET /forelder/samtykke/eksport
// Samler forelderens EKTE data + hvert godkjente barns EKTE data fra Prisma
// og laster det ned som én JSON-fil. Ingen fabrikerte verdier — kun det som
// faktisk finnes i databasen. Registrerer samtidig en EXPORT-rad for sporbarhet.

import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

/** Felter vi tar med for en bruker (forelder eller barn) — kun ekte persondata. */
function brukerProfil(u: {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  hcp: number | null;
  homeClub: string | null;
  school: string | null;
  dateOfBirth: Date | null;
  preferences: unknown;
  createdAt: Date;
}) {
  return {
    id: u.id,
    navn: u.name,
    epost: u.email,
    telefon: u.phone,
    rolle: u.role,
    hcp: u.hcp,
    hjemmeklubb: u.homeClub,
    skole: u.school,
    fodselsdato: u.dateOfBirth?.toISOString() ?? null,
    samtykker: u.preferences ?? null,
    opprettet: u.createdAt.toISOString(),
  };
}

/** Samler ett barns reelle data (alt avledet fra DB). */
async function samleBarnData(childId: string) {
  const [child, bookinger, betalinger, runder, oktLogger, varsler] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: childId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          hcp: true,
          homeClub: true,
          school: true,
          dateOfBirth: true,
          preferences: true,
          createdAt: true,
        },
      }),
      prisma.booking.findMany({
        where: { userId: childId },
        orderBy: { startAt: "desc" },
        include: {
          serviceType: { select: { name: true } },
          location: { select: { name: true } },
        },
      }),
      prisma.payment.findMany({
        where: { userId: childId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.round.findMany({
        where: { userId: childId },
        orderBy: { playedAt: "desc" },
      }),
      prisma.trainingPlanSessionLog.findMany({
        where: { session: { plan: { userId: childId } } },
        orderBy: { startedAt: "desc" },
        include: { session: { select: { title: true } } },
      }),
      prisma.notification.findMany({
        where: { userId: childId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  if (!child) return null;

  return {
    profil: brukerProfil(child),
    bookinger: bookinger.map((b) => ({
      id: b.id,
      start: b.startAt.toISOString(),
      tjeneste: b.serviceType.name,
      sted: b.location.name,
      status: b.status,
    })),
    betalinger: betalinger.map((p) => ({
      id: p.id,
      beskrivelse: p.description ?? p.type,
      belopOre: p.amountOre,
      status: p.status,
      dato: p.createdAt.toISOString(),
    })),
    runder: runder.map((r) => ({
      id: r.id,
      spilt: r.playedAt.toISOString(),
      score: r.score,
      sgTotal: r.sgTotal,
    })),
    treningsokter: oktLogger.map((l) => ({
      id: l.id,
      tittel: l.session.title,
      startet: l.startedAt.toISOString(),
      fullfort: l.completedAt?.toISOString() ?? null,
      vurdering: l.rating,
    })),
    varsler: varsler.map((n) => ({
      id: n.id,
      type: n.type,
      tittel: n.title,
      dato: n.createdAt.toISOString(),
    })),
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "PARENT" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const forelder = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      hcp: true,
      homeClub: true,
      school: true,
      dateOfBirth: true,
      preferences: true,
      createdAt: true,
    },
  });

  const relasjoner = await prisma.parentRelation.findMany({
    where: { parentId: user.id, approved: true },
    orderBy: { createdAt: "asc" },
    select: { childId: true, relationship: true },
  });

  const barn = await Promise.all(
    relasjoner.map(async (r) => ({
      relasjon: r.relationship,
      ...(await samleBarnData(r.childId)),
    })),
  );

  const eksport = {
    eksportert: new Date().toISOString(),
    kilde: "AK Golf HQ — GDPR-dataeksport",
    forelder: forelder ? brukerProfil(forelder) : null,
    barn: barn.filter((b) => b.profil != null),
  };

  // Sporbar kvittering: registrer at eksporten ble hentet ut.
  await prisma.dataExportRequest.create({
    data: { userId: user.id, type: "EXPORT", status: "COMPLETED" },
  });
  await audit({
    actorId: user.id,
    action: "data.export.downloaded",
    target: `User:${user.id}`,
    metadata: { antallBarn: eksport.barn.length },
  });

  const filnavn = `ak-golf-dataeksport-${new Date().toISOString().split("T")[0]}.json`;

  return new NextResponse(JSON.stringify(eksport, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${filnavn}"`,
    },
  });
}
