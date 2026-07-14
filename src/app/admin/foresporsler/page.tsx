/**
 * AgencyOS — Forespørsler (`/admin/foresporsler`), v2.
 * Port av `(legacy)/foresporsler/page.tsx` (2026-07-14, AgencyOS Bølge 3.4) —
 * samme `SessionRequest`-datamodell, ny v2-presentasjon i
 * `AdminForesporslerV2`. `(legacy)/foresporsler/actions.ts` bor fortsatt der
 * — delt `markerSomPlanlagt`/`avslaaForespørsel`, uendret.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminForesporslerV2, type AdminForesporselV2Rad } from "@/components/admin/v2/AdminForesporslerV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Forespørsler · AgencyOS (v2)" };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function narTekst(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const dager = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (dager === 0) return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  if (dager === 1) return "i går";
  return `${dager} dg`;
}

export default async function ForespørslerPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const dagStart = new Date();
  dagStart.setHours(0, 0, 0, 0);
  const dagSlutt = new Date(dagStart);
  dagSlutt.setDate(dagSlutt.getDate() + 1);

  const [requests, dagensBookinger] = await Promise.all([
    prisma.sessionRequest.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { user: { select: { id: true, name: true, hcp: true, homeClub: true } } },
    }),
    prisma.booking.findMany({ where: { startAt: { gte: dagStart, lt: dagSlutt }, userId: { not: null } }, select: { userId: true } }),
  ]);
  const harOktIdag = new Set(dagensBookinger.map((b) => b.userId));

  const rader: AdminForesporselV2Rad[] = requests.map((r) => ({
    id: r.id,
    navn: r.user.name,
    initialer: initials(r.user.name),
    harOktIdag: harOktIdag.has(r.user.id),
    narTekst: narTekst(r.createdAt),
    begrunnelse: r.reason || "Ønsker økt — ingen begrunnelse oppgitt.",
    apen: r.status === "PENDING",
  }));

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminForesporslerV2 rader={rader} />
    </V2Shell>
  );
}
