/**
 * AgencyOS — Treningsplaner (/admin/plans).
 *
 * Port av fasit `agencyos-app/screens-ops.jsx` → TrainingPlansScreen (mørkt
 * tema, desktop 1280): PageHead («PLANLEGGE · TRENINGSPLANER» / «{N} planer
 * i drift.» / lead + «Maler» + «Ny plan») og kanban med tre faser
 * Utkast / Aktiv / Fullført. Kort = plan-navn + mono «{spiller} · {meta}».
 *
 * Fasit-beslutning: «Ny plan» peker til WORKBENCH for valgt/første spiller
 * (designet fjerner wizarden) — /admin/plans/new består som rute, men lenkes
 * ikke herfra. Fasitens drag-and-drop mellom faser er ikke portet (statisk
 * server-render); statusflyt skjer i Workbench/plan-detalj.
 *
 * Datakilde: prisma.trainingPlan m/ user, status, økter og uke-spenn.
 * Template-plasseholder-brukerens FYS-malplaner («Template Placeholder»)
 * filtreres bort — de er infrastruktur for plan-maler, ikke stall-planer.
 */

import Link from "next/link";
import { Copy, Plus } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ukenummer } from "@/lib/uke-helpers";
import { AgPage, AgPageHead, agBtnClass } from "@/components/admin/agencyos/ui";

export const dynamic = "force-dynamic";

/** Systembruker som eier FYS-malenes bakende-planer — aldri vis i stallen. */
const TEMPLATE_PLACEHOLDER_USER_ID = "template-placeholder";

const TALLORD = [
  "Null",
  "Én",
  "To",
  "Tre",
  "Fire",
  "Fem",
  "Seks",
  "Sju",
  "Åtte",
  "Ni",
  "Ti",
  "Elleve",
  "Tolv",
];

type Fase = "utkast" | "aktiv" | "fullfort";

type PlanKort = {
  id: string;
  name: string;
  who: string;
  meta: string;
  lime: boolean;
};

function kortDato(d: Date): string {
  return d
    .toLocaleDateString("nb-NO", { day: "numeric", month: "short" })
    .replace(/\.$/, "");
}

export default async function TreningsplanerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const now = new Date();
  const dagStart = new Date(now);
  dagStart.setHours(0, 0, 0, 0);
  const dagSlutt = new Date(dagStart);
  dagSlutt.setDate(dagSlutt.getDate() + 1);

  const [plans, dagensOkt] = await Promise.all([
    prisma.trainingPlan.findMany({
      where: { userId: { not: TEMPLATE_PLACEHOLDER_USER_ID } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        user: { select: { id: true, name: true, role: true } },
        sessions: { select: { status: true } },
      },
      take: 100,
    }),
    // «Ny plan» → Workbench for spilleren med dagens økt (fasit-beslutning).
    prisma.trainingPlanSession.findFirst({
      where: {
        scheduledAt: { gte: dagStart, lt: dagSlutt },
        plan: {
          status: "ACTIVE",
          userId: { not: TEMPLATE_PLACEHOLDER_USER_ID },
          user: { role: "PLAYER" },
        },
      },
      orderBy: { scheduledAt: "asc" },
      select: { plan: { select: { userId: true } } },
    }),
  ]);

  // Fase-bucketing: Fullført = arkivert/utløpt · Aktiv = i drift · Utkast = resten.
  const fase = (p: (typeof plans)[number]): Fase => {
    if (p.status === "ARCHIVED" || (p.endDate && p.endDate.getTime() < now.getTime())) {
      return "fullfort";
    }
    if (p.status === "ACTIVE" || p.status === "ACCEPTED") return "aktiv";
    return "utkast";
  };

  const tilKort = (p: (typeof plans)[number]): PlanKort => {
    const total = p.sessions.length;
    const ferdig = p.sessions.filter((s) => s.status === "COMPLETED").length;
    const pct = total > 0 ? Math.round((ferdig / total) * 100) : 0;
    const ukeFra = ukenummer(p.startDate);

    let meta: string;
    switch (fase(p)) {
      case "aktiv":
        meta = p.endDate
          ? `${pct} % · uke ${ukeFra}–${ukenummer(p.endDate)}`
          : `${pct} % · fra uke ${ukeFra}`;
        break;
      case "fullfort":
        meta = p.endDate ? `Avsluttet ${kortDato(p.endDate)}` : "Arkivert";
        break;
      default:
        meta =
          p.status === "PENDING_PLAYER"
            ? "Venter godkjenning"
            : p.status === "REJECTED"
              ? "Spiller ba om endring"
              : p.status === "PAUSED"
                ? "På pause"
                : total > 0
                  ? `${total} økter · fra uke ${ukeFra}`
                  : `Utkast · fra uke ${ukeFra}`;
    }
    return { id: p.id, name: p.name, who: p.user.name, meta, lime: false };
  };

  const kolonner: { lbl: string; dot: string; plans: PlanKort[] }[] = [
    { lbl: "Utkast", dot: "bg-muted-foreground", plans: [] },
    { lbl: "Aktiv", dot: "bg-success", plans: [] },
    { lbl: "Fullført", dot: "bg-muted-foreground", plans: [] },
  ];
  for (const p of plans) {
    const f = fase(p);
    const idx = f === "utkast" ? 0 : f === "aktiv" ? 1 : 2;
    kolonner[idx].plans.push(tilKort(p));
  }
  // Fasit fremhever toppen av Aktiv-kolonnen med lime venstre-kant.
  if (kolonner[1].plans.length > 0) kolonner[1].plans[0].lime = true;

  // Workbench-mål: dagens økt → første aktive spillerplan → første plan.
  const aktivSpillerPlan = plans.find(
    (p) => fase(p) === "aktiv" && p.user.role === "PLAYER",
  );
  const workbenchUserId =
    dagensOkt?.plan.userId ?? aktivSpillerPlan?.user.id ?? plans[0]?.user.id ?? null;
  const nyPlanHref = workbenchUserId
    ? `/admin/spillere/${workbenchUserId}/workbench`
    : "/admin/spillere";

  const antall = plans.length;
  const tittel =
    antall < TALLORD.length ? `${TALLORD[antall]} planer` : `${antall} planer`;

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Planlegge · Treningsplaner"
        title={tittel}
        italic="i drift."
        lead="Dra planer mellom faser. Aktive planer driver spillernes daglige program."
        actions={
          <>
            <Link href="/admin/plan-templates" className={agBtnClass("ghost")}>
              <Copy size={16} strokeWidth={1.5} /> Maler
            </Link>
            <Link href={nyPlanHref} className={agBtnClass("primary")}>
              <Plus size={16} strokeWidth={1.5} /> Ny plan
            </Link>
          </>
        }
      />

      <div className="grid items-start gap-3 lg:grid-cols-3">
        {kolonner.map((col) => (
          <div key={col.lbl} className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-center gap-2 px-1 pb-3 pt-1">
              <span className={`h-2 w-2 rounded-full ${col.dot}`} />
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
                {col.lbl}
              </span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                {col.plans.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {col.plans.length === 0 && (
                <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center font-mono text-[10px] text-muted-foreground">
                  Ingen planer her
                </div>
              )}
              {col.plans.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/plans/${p.id}`}
                  className={`block rounded-xl border border-border bg-card p-[13px] text-left transition-colors hover:border-primary ${
                    p.lime ? "border-l-[3px] border-l-accent" : ""
                  }`}
                >
                  <div className="text-[13.5px] font-semibold leading-[1.25] tracking-[-0.01em] text-foreground">
                    {p.name}
                  </div>
                  <div className="mt-[5px] font-mono text-[10px] leading-none text-muted-foreground">
                    {p.who} · {p.meta}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AgPage>
  );
}
