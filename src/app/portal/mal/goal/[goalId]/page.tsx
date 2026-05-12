/**
 * PlayerHQ · Mål-detalj
 *
 * Migrert til produksjonsdesign med PageHeader (italic Instrument Serif),
 * semantiske tokens og 8pt-grid.
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { GoalActions } from "./goal-actions";

const TYPE_LABEL: Record<string, string> = {
  HCP_TARGET: "HCP-mål",
  ROUNDS_PER_MONTH: "Runder per måned",
  SG_AREA: "SG-mål",
  FREE_TEXT: "Mål",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Aktivt",
  ACHIEVED: "Oppnådd",
  ABANDONED: "Forlatt",
};

export default async function GoalDetalj({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const user = await requirePortalUser();
  const { goalId } = await params;

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) notFound();
  if (
    goal.userId !== user.id &&
    user.role !== "ADMIN" &&
    user.role !== "COACH"
  ) {
    notFound();
  }

  // Beregn fremgang for HCP_TARGET
  let fremgang: { current: number; target: number; pct: number } | null = null;
  if (goal.type === "HCP_TARGET" && goal.targetValue != null && user.hcp != null) {
    const diff = user.hcp - goal.targetValue;
    const pct = diff <= 0 ? 100 : Math.max(0, 100 - diff * 5);
    fremgang = { current: user.hcp, target: goal.targetValue, pct };
  }

  const kategori = TYPE_LABEL[goal.type] ?? goal.type;

  return (
    <div className="space-y-8">
      <Link
        href="/portal/mal"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Mål-oversikt
      </Link>

      <PageHeader
        eyebrow={`PlayerHQ · ${kategori}`}
        titleLead="Mål:"
        titleItalic={goal.title}
        sub={
          goal.targetDate
            ? `Frist ${goal.targetDate.toLocaleDateString("nb-NO", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}`
            : undefined
        }
        actions={
          <span
            className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.10em] ${
              goal.status === "ACHIEVED"
                ? "bg-primary/10 text-primary"
                : goal.status === "ABANDONED"
                ? "bg-muted text-muted-foreground"
                : "bg-accent/30 text-accent-foreground"
            }`}
          >
            {STATUS_LABEL[goal.status] ?? goal.status}
          </span>
        }
      />

      {fremgang && (
        <section className="rounded-lg border border-border bg-card p-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Fremgang
          </span>
          <div className="mt-4 flex items-baseline gap-4">
            <span className="font-display text-3xl font-semibold tabular-nums">
              {fremgang.current.toFixed(1).replace(".", ",")}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="font-display text-3xl font-semibold tabular-nums text-primary">
              {fremgang.target.toFixed(1).replace(".", ",")}
            </span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary"
              style={{ width: `${fremgang.pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {Math.round(fremgang.pct)}% mot mål
          </p>
        </section>
      )}

      {goal.status === "ACTIVE" && goal.userId === user.id && (
        <GoalActions goalId={goal.id} />
      )}
    </div>
  );
}
