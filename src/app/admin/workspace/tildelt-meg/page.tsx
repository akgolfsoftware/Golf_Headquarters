/**
 * AgencyOS — Tildelt meg (`/admin/workspace/tildelt-meg`), v2.
 * Port av `(legacy)/workspace/tildelt-meg/page.tsx` (2026-07-14, AgencyOS
 * Bølge 3.5) — samme aggregering (PlanAction/SessionRequest/TrainingPlan
 * DRAFT/Notion-oppgaver), ny v2-presentasjon i `AdminTildeltMegV2`.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getTasksForUser } from "@/lib/notion/queries";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminTildeltMegV2, type AdminTildeltMegV2Item } from "@/components/admin/v2/AdminTildeltMegV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tildelt meg · AgencyOS (v2)" };

function narTekst(d: Date): string {
  const timer = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60));
  if (timer < 1) return "Nå nettopp";
  if (timer < 24) return `${timer} t gammel`;
  const dager = Math.floor(timer / 24);
  return dager === 1 ? "I går" : `${dager} dg gammel`;
}

export default async function WorkspaceTildeltMegPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [approvals, requests, draftPlans, tasks] = await Promise.all([
    prisma.planAction.findMany({ where: { status: "PENDING" }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 2 }),
    prisma.sessionRequest.findMany({ where: { status: "PENDING" }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 2 }),
    prisma.trainingPlan.findMany({ where: { status: "DRAFT" }, orderBy: { updatedAt: "desc" }, take: 1, select: { id: true, name: true } }),
    getTasksForUser(user.id),
  ]);

  const items: AdminTildeltMegV2Item[] = [
    ...approvals.map((a) => ({ ikon: "check-check", title: `Godkjenn: ${a.user.name.split(" ")[0]}s forslag`, meta: "Forfaller i dag", href: "/admin/godkjenninger" })),
    ...requests.map((r) => ({ ikon: "inbox", title: `Svar: ${r.user.name.split(" ")[0]}s booking-forespørsel`, meta: narTekst(r.createdAt), href: "/admin/foresporsler" })),
    ...draftPlans.map((p) => ({ ikon: "list", title: `Fullfør: ${p.name}`, meta: "Utkast", href: `/admin/plans/${p.id}` })),
    ...tasks.filter((t) => !t.done && t.today).slice(0, 1).map((t) => ({ ikon: "check", title: t.title, meta: t.due, href: "/admin/handlingssenter" })),
  ].slice(0, 7);

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminTildeltMegV2 items={items} />
    </V2Shell>
  );
}
