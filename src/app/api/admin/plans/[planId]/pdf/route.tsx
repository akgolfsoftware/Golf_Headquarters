// GET /api/admin/plans/[planId]/pdf
// Genererer en polert PDF av treningsplanen via @react-pdf/renderer.
// Krever COACH eller ADMIN.

import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlanDocument, type PlanPdfData } from "@/lib/pdf/plan-document";

export const runtime = "nodejs";

function lagFilnavn(spillernavn: string, startDate: Date, endDate: Date | null): string {
  const slug = spillernavn
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const fra = startDate.toISOString().slice(0, 10);
  const til = endDate ? endDate.toISOString().slice(0, 10) : "aapen";
  return `treningsplan-${slug || "spiller"}-${fra}_${til}.pdf`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ planId: string }> },
) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { planId } = await params;

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          hcp: true,
          homeClub: true,
        },
      },
      sessions: {
        select: {
          id: true,
          scheduledAt: true,
          durationMin: true,
          title: true,
          pyramidArea: true,
        },
        orderBy: { scheduledAt: "asc" },
      },
    },
  });

  if (!plan) {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }

  // Coach = brukeren som opprettet planen (createdById). Ikke FK i v1, så
  // vi slår opp manuelt og tillater null-fallback.
  let coach: PlanPdfData["coach"] = null;
  if (plan.createdById) {
    const c = await prisma.user.findUnique({
      where: { id: plan.createdById },
      select: { name: true, email: true },
    });
    if (c) coach = { name: c.name, email: c.email };
  }

  const data: PlanPdfData = {
    planName: plan.name.trim() || "Treningsplan",
    startDate: plan.startDate,
    endDate: plan.endDate,
    player: {
      name: plan.user.name,
      hcp: plan.user.hcp,
      homeClub: plan.user.homeClub,
    },
    coach,
    sessions: plan.sessions,
    generatedAt: new Date(),
  };

  const buffer = await renderToBuffer(<PlanDocument data={data} />);
  const filnavn = lagFilnavn(plan.user.name, plan.startDate, plan.endDate);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filnavn}"`,
      "cache-control": "private, no-store",
    },
  });
}
