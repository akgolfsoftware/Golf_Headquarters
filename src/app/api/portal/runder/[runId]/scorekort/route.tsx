// GET /api/portal/runder/[runId]/scorekort — PDF-scorekort for Del runde (pakke 13).
// Bare eieren av runden. Ingen offentlig lenke (vedtak 16.10 §DEL RUNDE FINNES VED LANSERING).
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { hentDelRunde } from "@/lib/portal-analyse/del-runde-data";
import { delFilnavn } from "@/lib/portal-analyse/del-runde";
import { ScorekortDocument } from "@/lib/pdf/scorekort-document";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ runId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
  const { runId } = await params;
  const d = await hentDelRunde(runId, user.id);
  if (!d) return NextResponse.json({ error: "Fant ikke runden" }, { status: 404 });
  const pdf = await renderToBuffer(<ScorekortDocument d={d} spiller={user.name} />);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${delFilnavn(d, "pdf")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
