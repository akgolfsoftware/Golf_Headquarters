import Link from "next/link";
import { ArrowLeft, LayoutTemplate } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default async function PlanTemplates() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const templates = await prisma.planTemplate.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <Link
        href="/admin/plans"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Treningsplaner
      </Link>

      <PageHeader
        eyebrow="CoachHQ · Treningsplaner · Maler"
        titleLead="Maler"
        titleItalic="for"
        titleTrail="treningsplaner"
        sub={
          templates.length > 0
            ? `${templates.length} aktive maler — bruk som utgangspunkt for nye spillerplaner.`
            : "Gjenbrukbare strukturer som kan brukes som utgangspunkt for nye planer."
        }
      />

      {templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          titleItalic="Ingen"
          titleTrail="maler ennå"
          sub="Maler opprettes ved å markere en eksisterende plan som mal. Da kan du kopiere strukturen til nye spillere."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <article
              key={t.id}
              className="flex flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary"
            >
              <h3 className="font-display text-base font-semibold text-foreground">
                {t.name}
              </h3>
              {t.description && (
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {t.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Varighet
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                  {t.weeks} uker
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
