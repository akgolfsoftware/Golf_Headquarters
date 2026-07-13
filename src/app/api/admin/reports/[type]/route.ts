import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function csvEscape(v: string | number | null | undefined): string {
  if (v == null) return "";
  let s = String(v);
  // CSV-injection-vern: fritekst som starter med formel-tegn kan kjøres
  // som formler i Excel/Sheets — prefiks apostrof for å nøytralisere.
  // Gjelder kun strenger; ekte tall (f.eks. negative SG-verdier) er trygge.
  if (typeof v === "string" && /^[=+\-@\t\r]/.test(s)) {
    s = `'${s}`;
  }
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function tilCsv(headers: string[], rader: (string | number | null | undefined)[][]): string {
  const linjer = [headers.join(",")];
  for (const rad of rader) {
    linjer.push(rad.map(csvEscape).join(","));
  }
  return linjer.join("\n");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "COACH" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { type } = await params;
  const filename = type.replace(/\.csv$/, "");

  let csv: string;

  switch (filename) {
    case "spillere": {
      const players = await prisma.user.findMany({
        where: { role: "PLAYER" },
        orderBy: { name: "asc" },
      });
      csv = tilCsv(
        ["id", "navn", "epost", "hcp", "tier", "homeClub", "lastLoginAt"],
        players.map((p) => [
          p.id,
          p.name,
          p.email,
          p.hcp,
          p.tier,
          p.homeClub,
          p.lastLoginAt?.toISOString() ?? "",
        ])
      );
      break;
    }

    case "runder": {
      const nittiDager = new Date();
      nittiDager.setDate(nittiDager.getDate() - 90);
      const runder = await prisma.round.findMany({
        where: { playedAt: { gte: nittiDager } },
        include: {
          user: { select: { name: true } },
          course: { select: { name: true, par: true } },
        },
        orderBy: { playedAt: "desc" },
      });
      csv = tilCsv(
        ["dato", "spiller", "bane", "par", "score", "sgTotal", "sgOtt", "sgApp", "sgArg", "sgPutt"],
        runder.map((r) => [
          r.playedAt.toISOString().split("T")[0],
          r.user.name,
          r.course.name,
          r.course.par,
          r.score,
          r.sgTotal,
          r.sgOtt,
          r.sgApp,
          r.sgArg,
          r.sgPutt,
        ])
      );
      break;
    }

    case "okter": {
      const logger = await prisma.trainingPlanSessionLog.findMany({
        include: {
          session: {
            include: {
              plan: { include: { user: { select: { name: true } } } },
            },
          },
        },
        orderBy: { startedAt: "desc" },
        take: 1000,
      });
      csv = tilCsv(
        ["startet", "fullført", "spiller", "tittel", "csOppnådd", "vurdering", "notes"],
        logger.map((l) => [
          l.startedAt.toISOString(),
          l.completedAt?.toISOString() ?? "",
          l.session.plan.user.name,
          l.session.title,
          l.csAchieved,
          l.rating,
          l.notes,
        ])
      );
      break;
    }

    case "abonnement": {
      const subs = await prisma.subscription.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { updatedAt: "desc" },
      });
      csv = tilCsv(
        ["spiller", "epost", "tier", "status", "currentPeriodEnd", "stripeCustomerId"],
        subs.map((s) => [
          s.user.name,
          s.user.email,
          s.tier,
          s.status,
          s.currentPeriodEnd?.toISOString() ?? "",
          s.stripeCustomerId,
        ])
      );
      break;
    }

    default:
      return NextResponse.json({ error: "unknown-report" }, { status: 404 });
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}
