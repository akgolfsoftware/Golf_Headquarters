/**
 * /admin/spillere/[id]/plan — Plan-indeks (coach-context).
 *
 * Tidligere en død lenke (404): flere flater pekte på /plan uten at en indeks
 * fantes — kun /plan/[planId] (detalj). Denne siden løser opp lenken:
 *
 *   - 0 planer  → ærlig tom-tilstand med «Lag plan»-knapp.
 *   - 1 plan    → redirect rett til detaljen (ingen unødvendig mellomside).
 *   - 2+ planer → liste, hver rad lenker til /plan/[planId].
 *
 * Henter ekte TechnicalPlan-data (samme modell som detalj-ruten).
 */

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, ClipboardList, Plus } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { TechPlanStatus } from "@/generated/prisma/client";
import { AthleticEyebrow, AthleticButton } from "@/components/athletic";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<TechPlanStatus, string> = {
  DRAFT: "Utkast",
  ACTIVE: "Aktiv",
  ARCHIVED: "Arkivert",
};

// ACTIVE øverst, så DRAFT, så ARCHIVED — innen hver gruppe nyeste først.
const STATUS_RANK: Record<TechPlanStatus, number> = {
  ACTIVE: 0,
  DRAFT: 1,
  ARCHIVED: 2,
};

export default async function SpillerPlanIndeksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const [spiller, planer] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true },
    }),
    prisma.technicalPlan.findMany({
      where: { userId: id },
      select: {
        id: true,
        navn: true,
        status: true,
        startDato: true,
        sluttDato: true,
        updatedAt: true,
      },
    }),
  ]);

  if (!spiller) {
    notFound();
  }

  const sortert = [...planer].sort((a, b) => {
    const rank = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (rank !== 0) return rank;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  // Nøyaktig én plan → hopp rett til detaljen.
  if (sortert.length === 1) {
    redirect(`/admin/spillere/${id}/plan/${sortert[0].id}`);
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <header className="-mx-4 -mt-4 border-b border-border bg-gradient-to-b from-[#FBFAF5] to-background px-4 py-8 md:-mx-8 md:-mt-8 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <AthleticEyebrow>Coach · {spiller.name} · Utviklingsplaner</AthleticEyebrow>
            <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Tekniske{" "}
              <em
                className="font-normal not-italic"
                style={{
                  fontFamily: "var(--font-familjen-grotesk), sans-serif",
                  fontStyle: "italic",
                  color: "hsl(var(--primary))",
                }}
              >
                planer
              </em>
            </h1>
            <div className="font-mono mt-2 text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
              <Link href={`/admin/spillere/${id}`} className="hover:text-foreground">
                ← TILBAKE TIL {spiller.name.toUpperCase()}
              </Link>
              {sortert.length > 0 ? ` · ${sortert.length} PLANER` : ""}
            </div>
          </div>
        </div>
      </header>

      {sortert.length === 0 ? (
        // ── Tom-tilstand ──────────────────────────────────────────
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="font-display mt-4 text-lg font-semibold">Ingen utviklingsplaner ennå</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
            {spiller.name} har ingen tekniske planer. Lag en plan i Workbench for å sette mål,
            periodisering og drills.
          </p>
          <div className="mt-5 flex justify-center">
            <Link href={`/admin/spillere/${id}/workbench`}>
              <AthleticButton variant="lime" size="sm">
                <Plus className="h-3.5 w-3.5" /> Lag plan
              </AthleticButton>
            </Link>
          </div>
        </div>
      ) : (
        // ── Plan-liste ────────────────────────────────────────────
        <ul className="space-y-2">
          {sortert.map((plan) => (
            <li key={plan.id}>
              <Link
                href={`/admin/spillere/${id}/plan/${plan.id}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition hover:border-primary/40"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      {STATUS_LABEL[plan.status]}
                    </span>
                  </div>
                  <div className="font-display mt-1.5 truncate text-base font-semibold">
                    {plan.navn}
                  </div>
                  <div className="font-mono mt-1 text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
                    {plan.startDato
                      .toLocaleDateString("nb-NO", { day: "2-digit", month: "short" })
                      .toUpperCase()}
                    {plan.sluttDato
                      ? ` — ${plan.sluttDato
                          .toLocaleDateString("nb-NO", { day: "2-digit", month: "short" })
                          .toUpperCase()}`
                      : ""}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
