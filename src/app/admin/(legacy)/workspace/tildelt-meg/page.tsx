/**
 * AgencyOS — Tildelt meg (MIN UKE · TILDELT MEG). v2-port 16. juli 2026.
 *
 * Aggregerer EKTE ventende handlinger: godkjenninger (PlanAction), forespørsler
 * (SessionRequest), plan-utkast (TrainingPlan DRAFT) og dagens oppgaver (Notion-kilde).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getTasksForUser } from "@/lib/notion/queries";
import { AdminTildeltMegV2, type TildeltMegItem, type AdminTildeltMegV2Data } from "@/components/admin/v2/AdminTildeltMegV2";

export const dynamic = "force-dynamic";

const TALLORD = ["Ingen", "Én", "To", "Tre", "Fire", "Fem", "Seks", "Sju", "Åtte", "Ni", "Ti"];

function nårTekst(d: Date): string {
  const timer = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60));
  if (timer < 1) return "Nå nettopp";
  if (timer < 24) return `${timer} t gammel`;
  const dager = Math.floor(timer / 24);
  return dager === 1 ? "I går" : `${dager} dg gammel`;
}

export default async function WorkspaceTildeltMegPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [approvals, requests, draftPlans, tasks] = await Promise.all([
    prisma.planAction.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 2,
    }),
    prisma.sessionRequest.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 2,
    }),
    prisma.trainingPlan.findMany({
      where: { status: "DRAFT" },
      orderBy: { updatedAt: "desc" },
      take: 1,
      select: { id: true, name: true },
    }),
    getTasksForUser(user.id),
  ]);

  const items: TildeltMegItem[] = [
    ...approvals.map((a) => ({
      icon: "check-check",
      tittel: `Godkjenn: ${a.user.name.split(" ")[0]}s forslag`,
      meta: "Forfaller i dag",
      href: "/admin/godkjenninger",
    })),
    ...requests.map((r) => ({
      icon: "inbox",
      tittel: `Svar: ${r.user.name.split(" ")[0]}s booking-forespørsel`,
      meta: nårTekst(r.createdAt),
      href: "/admin/foresporsler",
    })),
    ...draftPlans.map((p) => ({
      icon: "list",
      tittel: `Fullfør: ${p.name}`,
      meta: "Utkast",
      href: `/admin/plans/${p.id}`,
    })),
    ...tasks
      .filter((t) => !t.done && t.today)
      .slice(0, 1)
      .map((t) => ({
        icon: "check-circle",
        tittel: t.title,
        meta: t.due,
        href: "/admin/handlingssenter",
      })),
  ].slice(0, 7);

  const data: AdminTildeltMegV2Data = {
    items,
    antallOrd: TALLORD[items.length] ?? String(items.length),
  };

  return <AdminTildeltMegV2 data={data} />;
}
