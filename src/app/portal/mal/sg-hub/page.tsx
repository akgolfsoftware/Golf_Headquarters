import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  Circle,
  Crosshair,
  Package,
  Zap,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { extractClubs } from "@/lib/sg-hub/extract-shots";

// Kanonisk rekkefølge for køllenumre
const CLUB_ORDER = [
  "Driver", "1W", "3W", "5W", "7W",
  "1i", "2i", "3i", "4i", "5i", "6i", "7i", "8i", "9i",
  "PW", "AW", "GW", "SW", "LW",
  "PT",
];

function sortClubs(clubs: string[]): string[] {
  return [...clubs].sort((a, b) => {
    const ai = CLUB_ORDER.indexOf(a);
    const bi = CLUB_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

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
    description:
      "Auto-generert yardage-kort med carry, 3/4, soft og værjustering.",
    fase: "Fase 3",
  },
  {
    href: "/portal/mal/sg-hub/best-vs-now",
    icon: Crosshair,
    title: "Best vs Today",
    description:
      "Sammenlign dagens økt med din beste økt noensinne — delta per metrikk.",
    fase: "Fase 4",
  },
  {
    href: "/portal/mal/sg-hub/equipment",
    icon: Package,
    title: "Equipment Fit",
    description:
      "Per-kølle helsesjekk — launch, spin og smash mot optimale targets.",
    fase: "Fase 5",
  },
];

export default async function SgHubPage() {
  const user = await requirePortalUser();
  const { sgHubMode } = lesPreferences(user);
  const advanced = sgHubMode === "advanced";

  const sessions = await prisma.trackManSession.findMany({
    where: { userId: user.id },
    select: { rawJson: true },
  });

  const [insightCount] = await Promise.all([
    prisma.sgInsight.count({
      where: { userId: user.id, resolvedAt: null, acknowledgedAt: null },
    }),
  ]);

  // Ekstraher alle unike køllenavn fra alle sessions
  const clubSet = new Set<string>();
  for (const s of sessions) {
    for (const club of extractClubs(s.rawJson)) {
      clubSet.add(club);
    }
  }
  const clubs = sortClubs([...clubSet]);

  return (
    <div className="space-y-8">
      {/* Rask statistikk */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="TrackMan-økter" value={sessions.length} />
        <StatCard label="Aktive innsikter" value={insightCount} />
        <StatCard label="Benchmarks" value="PGA Tour" isText />
      </div>

      {/* Innsikter */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-semibold">Aktive innsikter</h3>
        {insightCount === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ingen aktive innsikter ennå. Insight Engine genererer innsikter
            daglig kl. 04:00 UTC etter at du har nok TrackMan-data.
          </p>
        ) : null}
      </section>

      {/* Per-kølle grid */}
      <section>
        <h3 className="mb-4 font-semibold">Per-kølle analyse</h3>
        {clubs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Ingen TrackMan-data ennå.{" "}
              <Link
                href="/portal/mal/trackman"
                className="text-primary underline-offset-2 hover:underline"
              >
                Importer din første økt
              </Link>{" "}
              for å aktivere per-kølle analyse.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {clubs.map((club) => (
              <Link
                key={club}
                href={`/portal/mal/sg-hub/${encodeURIComponent(club)}`}
                className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-card"
              >
                <Circle className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                <span className="font-mono text-sm font-semibold">{club}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground/40 transition-colors group-hover:text-primary" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Kommende verktøy */}
      <section>
        <h3 className="mb-4 font-semibold">Kommende verktøy</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureStubCard
              key={f.href}
              {...f}
              advanced={advanced}
            />
          ))}
        </div>
      </section>
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
      <p
        className={`mt-2 font-semibold ${isText ? "text-lg" : "text-3xl tabular-nums"}`}
      >
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
      <div className="mb-3 flex items-start justify-between gap-2">
        <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
        <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
          {fase}
        </span>
      </div>
      <h4 className="text-sm font-semibold">{title}</h4>
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
