/**
 * FYS-plan — plan-detalj / builder (PlayerHQ).
 *
 * Venstre kolonne: ukentlige rader med okter (UkeRad).
 * Høyre sidebar: plan-sammendrag + quick-actions (FysPlanSidebar).
 * KPI-rad: uker, økter, fullført %, neste økt.
 *
 * Per plan Del 31 (FYS-plan modul, 2026-05-24).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { DetailShell } from "@/components/shared/detail-shell";
import { KPICard } from "@/components/ui/kpi-card";
import {
  UkeRad,
  FysPlanSidebar,
  type UkeRadData,
  type OktKortData,
} from "@/components/fys-plan";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ planId: string }>;
}

export default async function FysPlanDetaljPage({ params }: PageProps) {
  const { planId } = await params;
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const plan = await prisma.fysiskPlan.findFirst({
    where: { id: planId, userId: user.id },
    include: {
      uker: {
        orderBy: { sortOrder: "asc" },
        include: {
          okter: {
            orderBy: { sortOrder: "asc" },
            include: {
              rader: {
                orderBy: { sortOrder: "asc" },
                select: {
                  id: true,
                  loggSett: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!plan) return notFound();

  const uker: UkeRadData[] = plan.uker.map((u) => ({
    id: u.id,
    ukeNr: u.ukeNr,
    label: u.label,
    okter: u.okter.map<OktKortData>((o) => ({
      id: o.id,
      navn: o.navn,
      dag: o.dag,
      estimertMinutter: o.estimertMinutter,
      antallOvelser: o.rader.length,
    })),
  }));

  const ukerCount = plan.uker.length;
  const okterTotalCount = plan.uker.reduce((s, u) => s + u.okter.length, 0);
  const okterFullfortCount = plan.uker.reduce(
    (s, u) =>
      s +
      u.okter.filter((o) =>
        o.rader.length > 0 && o.rader.every((r) => (r.loggSett ?? 0) > 0),
      ).length,
    0,
  );
  const fullfortPct =
    okterTotalCount > 0
      ? Math.round((okterFullfortCount / okterTotalCount) * 100)
      : 0;

  return (
    <DetailShell
      breadcrumb={[
        { label: "Tren", href: "/portal/planlegge" },
        { label: "FYS-plan", href: "/portal/tren/fys-plan" },
        { label: plan.navn },
      ]}
      backHref="/portal/tren/fys-plan"
      title={plan.navn}
      subtitle={plan.notater ?? undefined}
      kpiRow={
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <KPICard eyebrow="Uker" value={ukerCount} />
          <KPICard eyebrow="Økter" value={okterTotalCount} />
          <KPICard eyebrow="Fullført" value={`${fullfortPct}%`} variant="hero" />
          <KPICard
            eyebrow="Status"
            value={
              plan.status === "ACTIVE"
                ? "Aktiv"
                : plan.status === "ARCHIVED"
                ? "Arkivert"
                : "Utkast"
            }
            variant="muted"
          />
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {uker.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
              <p className="font-display text-base text-foreground">
                Ingen uker lagt til enda.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Bruk &laquo;Legg til uke&raquo; i sidebar for å starte planen.
              </p>
            </div>
          ) : (
            uker.map((u, i) => (
              <UkeRad key={u.id} uke={u} defaultOpen={i === 0} />
            ))
          )}
        </div>

        <FysPlanSidebar
          navn={plan.navn}
          status={plan.status}
          startDato={plan.startDato}
          sluttDato={plan.sluttDato}
          ukerCount={ukerCount}
          okterTotalCount={okterTotalCount}
          okterFullfortCount={okterFullfortCount}
        />
      </div>
    </DetailShell>
  );
}
