// GET /portal/meg/abonnement/faktura/[id]/pdf
// Genererer en ekte PDF av fakturaen (Payment) via @react-pdf/renderer.
// Eier-sjekk: kun brukerens egne fakturaer (samme scope som skjermen).

import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  FakturaDocument,
  byggFakturaData,
  fakturaFilnavn,
} from "../faktura-document";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requirePortalUser();
  const { id } = await params;

  // Samme eierskaps-scope som page.tsx: kun brukerens egen Payment.
  const payment = await prisma.payment.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      amountOre: true,
      status: true,
      paidAt: true,
      createdAt: true,
      description: true,
      stripeChargeId: true,
      stripeInvoiceId: true,
    },
  });

  if (!payment) {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }

  const data = byggFakturaData(payment, {
    navn: user.name ?? "—",
    epost: user.email ?? null,
  });

  const buffer = await renderToBuffer(<FakturaDocument data={data} />);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${fakturaFilnavn(data.fakturaNr)}"`,
      "cache-control": "private, no-store",
    },
  });
}
