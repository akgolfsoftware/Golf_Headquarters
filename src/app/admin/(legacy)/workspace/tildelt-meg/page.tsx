/**
 * AgencyOS — Tildelt meg (MIN UKE · TILDELT MEG)
 *
 * Port av fasit `agencyos-app/screens-analyze.jsx` → AssignedScreen (mørkt, desktop).
 * Aggregerer EKTE ventende handlinger: godkjenninger (PlanAction), forespørsler
 * (SessionRequest), plan-utkast (TrainingPlan DRAFT) og dagens oppgaver (Notion-kilde).
 */

import Link from "next/link";
import {
  CheckCheck,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getTasksForUser } from "@/lib/notion/queries";
import { AgPage, AgPageHead } from "@/components/admin/agencyos/ui";

export const dynamic = "force-dynamic";

type AssignedItem = {
  icon: LucideIcon;
  title: string;
  meta: string;
  href: string;
};

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

  const items: AssignedItem[] = [
    ...approvals.map((a) => ({
      icon: CheckCheck,
      title: `Godkjenn: ${a.user.name.split(" ")[0]}s forslag`,
      meta: "Forfaller i dag",
      href: "/admin/godkjenninger",
    })),
    ...requests.map((r) => ({
      icon: Inbox,
      title: `Svar: ${r.user.name.split(" ")[0]}s booking-forespørsel`,
      meta: nårTekst(r.createdAt),
      href: "/admin/foresporsler",
    })),
    ...draftPlans.map((p) => ({
      icon: ClipboardList,
      title: `Fullfør: ${p.name}`,
      meta: "Utkast",
      href: `/admin/plans/${p.id}`,
    })),
    ...tasks
      .filter((t) => !t.done && t.today)
      .slice(0, 1)
      .map((t) => ({
        icon: CheckSquare,
        title: t.title,
        meta: t.due,
        href: "/admin/handlingssenter",
      })),
  ].slice(0, 7);

  const antall = TALLORD[items.length] ?? String(items.length);

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Min uke · Tildelt meg"
        title={`${antall} ting`}
        italic="til deg."
        lead="Alt som venter på en handling fra deg, samlet ett sted."
      />
      <div className="max-w-[760px] rounded-xl border border-border bg-card px-4 py-[2px]">
        {items.length === 0 && (
          <div className="px-1 py-10 text-center text-sm text-muted-foreground">
            Ingenting venter på deg. Godt jobbet.
          </div>
        )}
        {items.map((it, i) => (
          <Link
            key={`${it.href}-${i}`}
            href={it.href}
            className={`flex w-full items-start gap-[14px] px-1 py-[14px] text-left ${
              i ? "border-t border-border" : ""
            }`}
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-start justify-start pt-[2px]">
              <it.icon className="h-[18px] w-[18px] text-foreground" strokeWidth={1.5} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">{it.title}</span>
              <span className="mt-[2px] block font-mono text-[10px] text-muted-foreground">
                {it.meta}
              </span>
            </span>
            <ChevronRight className="h-[18px] w-[18px] self-center text-muted-foreground" strokeWidth={1.5} />
          </Link>
        ))}
      </div>
    </AgPage>
  );
}
