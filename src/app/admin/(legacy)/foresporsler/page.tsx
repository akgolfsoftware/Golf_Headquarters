/**
 * AgencyOS — Forespørsler (INNBOKS · FORESPØRSLER). v2-port 16. juli 2026.
 *
 * Datakilde: SessionRequest (booking-ønsker fra spillere via /portal/onskeligokt).
 * Bevisst avvik fra fasit: alle rader er «Booking»-type — meldinger/råd bor i
 * /admin/innboks (egen flate). Godta/Avvis bruker eksisterende server-actions.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminForesporslerV2, type AdminForesporslerV2Data } from "@/components/admin/v2/AdminForesporslerV2";

function nårTekst(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const dager = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (dager === 0)
    return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  if (dager === 1) return "i går";
  return `${dager} dg`;
}

export default async function ForespørslerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const dagStart = new Date();
  dagStart.setHours(0, 0, 0, 0);
  const dagSlutt = new Date(dagStart);
  dagSlutt.setDate(dagSlutt.getDate() + 1);

  const [requests, dagensBookinger] = await Promise.all([
    prisma.sessionRequest.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        user: { select: { id: true, name: true, hcp: true, homeClub: true } },
      },
    }),
    prisma.booking.findMany({
      where: { startAt: { gte: dagStart, lt: dagSlutt }, userId: { not: null } },
      select: { userId: true },
    }),
  ]);
  // Fasit-tonen: spillere med økt i dag får lime-ring på avataren.
  const harØktIdag = new Set(dagensBookinger.map((b) => b.userId));

  const data: AdminForesporslerV2Data = {
    rader: requests.map((r) => ({
      id: r.id,
      navn: r.user.name,
      harOktIdag: harØktIdag.has(r.user.id),
      nårTekst: nårTekst(r.createdAt),
      begrunnelse: r.reason || "Ønsker økt — ingen begrunnelse oppgitt.",
      behandlet: r.status !== "PENDING",
    })),
  };

  return <AdminForesporslerV2 data={data} />;
}
