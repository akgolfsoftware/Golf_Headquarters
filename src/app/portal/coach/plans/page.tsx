import Link from "next/link";
import { ArrowUpRight, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function CoachPlans() {
  const user = await requirePortalUser();

  if (user.tier === "GRATIS") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="PlayerHQ · Coach"
          titleLead="Krever"
          titleItalic="Pro"
          sub="Coach-laget plan er en del av Pro-abonnementet."
        />
      </div>
    );
  }

  const planer = await prisma.trainingPlan.findMany({
    where: {
      userId: user.id,
      createdById: { not: null },
    },
    include: {
      sessions: {
        select: { id: true, status: true },
      },
    },
    orderBy: { startDate: "desc" },
  });

  const aktiv = planer.filter((p) => p.isActive);
  const ferdig = planer.filter((p) => !p.isActive);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Coach · Planer"
        titleLead={aktiv.length === 0 ? "Ingen" : `${aktiv.length} aktiv`}
        titleItalic={aktiv.length === 0 ? "aktiv plan" : aktiv.length === 1 ? "plan" : "planer"}
        sub={
          planer.length === 0
            ? "Når en coach lager en plan til deg, vises den her."
            : `${planer.length} ${planer.length === 1 ? "plan" : "planer"} totalt`
        }
      />

      {planer.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          titleItalic="Ingen planer"
          titleTrail="fra coach"
          sub="Egne ad-hoc-økter ligger på /portal/tren. Når coachen lager en plan til deg, dukker den opp her."
          cta={
            <Link
              href="/portal/tren"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Til mine økter
              <ArrowUpRight size={14} strokeWidth={1.5} />
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {aktiv.length > 0 && (
            <PlanColumn title="Aktiv" tone="primary" description="Følger disse nå">
              {aktiv.map((p) => (
                <PlanCardEl key={p.id} plan={p} />
              ))}
            </PlanColumn>
          )}

          {ferdig.length > 0 && (
            <PlanColumn
              title="Ferdig"
              tone="muted"
              description="Arkiv siste 12 mnd"
            >
              {ferdig.map((p) => (
                <PlanCardEl key={p.id} plan={p} />
              ))}
            </PlanColumn>
          )}
        </div>
      )}
    </div>
  );
}

function PlanColumn({
  title,
  tone,
  description,
  children,
}: {
  title: string;
  tone: "primary" | "muted";
  description: string;
  children: React.ReactNode;
}) {
  const dotCls = tone === "primary" ? "bg-primary" : "bg-muted-foreground/50";
  return (
    <section>
      <header className="mb-4 flex items-center gap-4">
        <span className={`h-2.5 w-2.5 rounded-full ${dotCls}`} />
        <div>
          <h2 className="font-display text-base font-semibold leading-none">
            {title}
          </h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {description}
          </p>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

type Plan = {
  id: string;
  name: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date | null;
  sessions: { id: string; status: string }[];
};

function PlanCardEl({ plan }: { plan: Plan }) {
  const fullført = plan.sessions.filter((s) => s.status === "COMPLETED").length;
  const total = plan.sessions.length;
  const progress = total > 0 ? Math.round((fullført / total) * 100) : 0;

  return (
    <article className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            plan.isActive
              ? "bg-primary/10 text-primary"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {plan.isActive ? "Aktiv" : "Ferdig"}
        </span>
      </div>

      <h3 className="mt-4 font-display text-lg italic font-medium leading-snug text-foreground">
        <Link href={`/portal/coach/plans/${plan.id}`} className="hover:text-primary">
          {plan.name}
        </Link>
      </h3>
      <p className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground">
        {plan.startDate.toLocaleDateString("nb-NO", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
        {plan.endDate &&
          ` – ${plan.endDate.toLocaleDateString("nb-NO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}`}
      </p>

      {plan.isActive && total > 0 ? (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Fremdrift</span>
            <span className="font-mono font-semibold tabular-nums text-foreground">
              {progress} %
            </span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-accent"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-foreground">
          {fullført} / {total} økter fullført
        </p>
      )}

      <footer className="mt-4 flex items-center border-t border-border pt-4">
        <Link
          href={`/portal/coach/plans/${plan.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
        >
          Detaljer
          <ArrowUpRight size={12} strokeWidth={1.5} />
        </Link>
      </footer>
    </article>
  );
}
