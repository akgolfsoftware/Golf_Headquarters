// POST /portal/mal/sg-hub/yardage/pdf
// Genererer Stock Yardage Chart som PDF (A4 landskap) for innlogget bruker.

import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { buildYardageRows } from "@/lib/sg-hub/yardage-calc";
import { YardagePdfDocument } from "@/lib/sg-hub/pdf-export";

export const runtime = "nodejs";

const BodySchema = z
  .object({
    tempC: z.number().min(-40).max(60).default(15),
    elevationM: z.number().min(0).max(5000).default(0),
  })
  .default({ tempC: 15, elevationM: 0 });

function lagFilnavn(spillernavn: string): string {
  const slug = spillernavn
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const date = new Date().toISOString().slice(0, 10);
  return `stock-yardage-${slug || "spiller"}-${date}.pdf`;
}

export async function POST(req: Request) {
  const user = await requirePortalUser();

  let parsed: z.infer<typeof BodySchema>;
  try {
    const json = await req.json().catch(() => ({}));
    parsed = BodySchema.parse(json);
  } catch {
    parsed = { tempC: 15, elevationM: 0 };
  }

  const sessions = await prisma.trackManSession.findMany({
    where: { userId: user.id },
    select: { rawJson: true },
    orderBy: { recordedAt: "desc" },
    take: 30,
  });

  const rows = buildYardageRows(sessions);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "no-data", message: "Ingen TrackMan-data å eksportere." },
      { status: 400 },
    );
  }

  // Anvend værjustering på rader før eksport
  const adjustedRows = rows.map((r) => ({
    ...r,
    totalAvg: round1(adjustNum(r.totalAvg, parsed.tempC, parsed.elevationM)),
    carryAvg: round1(adjustNum(r.carryAvg, parsed.tempC, parsed.elevationM)),
    threeQuarter: round1(adjustNum(r.threeQuarter, parsed.tempC, parsed.elevationM)),
    soft: round1(adjustNum(r.soft, parsed.tempC, parsed.elevationM)),
  }));

  const buffer = await renderToBuffer(
    <YardagePdfDocument
      rows={adjustedRows}
      playerName={user.name || user.email || "Spiller"}
      generatedAt={new Date()}
      tempC={parsed.tempC}
      elevationM={parsed.elevationM}
    />,
  );

  const filnavn = lagFilnavn(user.name || "spiller");

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filnavn}"`,
      "cache-control": "private, no-store",
    },
  });
}

function adjustNum(distance: number, tempC: number, elevationM: number): number {
  const tempFactor = 1 + 0.0008 * (tempC - 15);
  return distance * tempFactor + elevationM / 100;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
