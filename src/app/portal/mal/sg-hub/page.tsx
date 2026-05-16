import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { lesPreferences } from "@/lib/preferences";
import {
  Activity,
  ArrowRight,
  BarChart2,
  Crosshair,
  Package,
  Zap,
} from "lucide-react";

type FeatureCard = {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  fase: string;
};

const FEATURES: FeatureCard[] = [
  {
    href: "/portal/mal/sg-hub/yardage",
    icon: BarChart2,
    title: "Stock Yardage Chart",
    description: "Auto-generert yardage-kort med carry, 3/4, soft og værjustering.",
    fase: "Fase 3",
  },
  {
    href: "/portal/mal/sg-hub/best-vs-now",
    icon: Crosshair,
    title: "Best vs Today",
    description: "Sammenlign dagens økt med din beste økt noensinne — delta per metrikk.",
    fase: "Fase 4",
  },
  {
    href: "/portal/mal/sg-hub/equipment",
    icon: Package,
    title: "Equipment Fit",
    description: "Per-kølle helsesjekk — launch, spin og smash mot optimale targets.",
    fase: "Fase 5",
  },
];

export default async function SgHubPage() {
  const user = await requirePortalUser();
  const { sgHubMode } = lesPreferences(user);

  const [sessionCount, insightCount] = await Promise.all([
    prisma.trackManSession.count({ where: { userId: user.id } }),
    prisma.sgInsight.count({
      where: { userId: user.id, resolvedAt: null, acknowledgedAt: null },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Rask statistikk */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="TrackMan-økter" value={sessionCount} />
        <StatCard label="Aktive innsikter" value={insightCount} />
        <StatCard label="Benchmarks" value="PGA Tour" isText />
      </div>

      {/* Innsikter — tomt i Phase 1 */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold">Aktive innsikter</h3>
        {insightCount === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ingen aktive innsikter ennå. Insight Engine genererer innsikter daglig
            kl. 04:00 UTC etter at du har nok TrackMan-data.
          </p>
        ) : null}
      </section>

      {/* Per-kølle drill-down — vis kun hvis TrackMan-data finnes */}
      {sessionCount > 0 && (
        <section>
          <h3 className="mb-4 font-semibold">Per-kølle analyse</h3>
          <p className="text-sm text-muted-foreground">
            Kjøre-analyse per kølle kommer i Fase 2.{" "}
            <Link
              href="/portal/mal/trackman"
              className="text-primary underline-offset-2 hover:underline"
            >
              Se TrackMan-data
            </Link>
          </p>
        </section>
      )}

      {/* Feature-kort */}
      <section>
        <h3 className="mb-4 font-semibold">Kommende verktøy</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureStubCard key={f.href} {...f} advanced={sgHubMode === "advanced"} />
          ))}
        </div>
      </section>

      {/* D-Plane + Strike Heatmap — advanced only */}
      {sgHubMode === "advanced" && (
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Avansert analyse (Phase 2)</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            D-Plane Scatter, Strike Heatmap og Smash Curve bygges i Fase 2.
          </p>
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  isText = false,
}: {
  label: string;
  value: number | string;
  isText?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 font-semibold ${isText ? "text-lg" : "text-3xl tabular-nums"}`}>
        {value}
      </p>
    </div>
  );
}

function FeatureStubCard({
  href,
  icon: Icon,
  title,
  description,
  fase,
  advanced,
}: FeatureCard & { advanced: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
        <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
          {fase}
        </span>
      </div>
      <h4 className="font-semibold text-sm">{title}</h4>
      {advanced && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        <Zap className="h-3 w-3" />
        Kommer snart
      </div>
    </div>
  );
}
