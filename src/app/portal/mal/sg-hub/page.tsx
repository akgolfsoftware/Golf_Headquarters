import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  Circle,
  Crosshair,
  Lightbulb,
  MapPin,
  Package,
  Sparkles,
  Wind,
  Zap,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { extractClubs } from "@/lib/sg-hub/extract-shots";
import type { InsightCategory } from "@/generated/prisma/client";

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

const CATEGORY_LABELS: Record<InsightCategory, string> = {
  DISTANCE_GAPPING: "Distansegap",
  CONSISTENCY_LEAK: "Konsistens",
  TRAINING_GAP: "Treningsgap",
  D_PLANE_DRIFT: "D-Plane drift",
  STRIKE_QUALITY: "Kontaktkvalitet",
  FATIGUE_PATTERN: "Fatigue",
  EQUIPMENT_FIT: "Utstyrstilpasning",
  TEMPO_VARIANCE: "Tempo",
  PROGRESSION_TREND: "Progresjon",
  SAME_DISTANCE_OPPORTUNITY: "Same-distance",
};

type FeatureCard = {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  fase: string;
};

const LIVE_FEATURES: FeatureCard[] = [
  {
    href: "/portal/mal/sg-hub/yardage",
    icon: BarChart2,
    title: "Stock Yardage Chart",
    description:
      "Auto-generert yardage-kort med carry, 3/4, soft og PDF-eksport.",
    fase: "Fase 3",
  },
  {
    href: "/portal/mal/sg-hub/conditions",
    icon: Wind,
    title: "Værjustert distanse",
    description:
      "Slidere for temp, vind og høyde — live-oppdatert per kølle.",
    fase: "Fase 3",
  },
  {
    href: "/portal/mal/sg-hub/strategy",
    icon: MapPin,
    title: "Same-Distance strategi",
    description:
      "Beste kølle for valgt mål-distanse rangert etter expected SG.",
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

  const [insightCount, insights] = await Promise.all([
    prisma.sgInsight.count({
      where: { userId: user.id, resolvedAt: null, acknowledgedAt: null },
    }),
    prisma.sgInsight.findMany({
      where: { userId: user.id, resolvedAt: null, acknowledgedAt: null },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        category: true,
        severity: true,
        title: true,
        body: true,
        createdAt: true,
      },
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
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb
            className="h-4 w-4 text-muted-foreground"
            strokeWidth={1.5}
          />
          <h3 className="font-semibold">Aktive innsikter</h3>
        </div>
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ingen aktive innsikter ennå. Insight Engine genererer innsikter
            daglig kl. 04:00 UTC etter at du har nok TrackMan-data.
          </p>
        ) : (
          <ul className="space-y-3">
            {insights.map((ins) => (
              <li
                key={ins.id}
                className="flex items-start gap-3 rounded-md border border-border bg-background p-4"
              >
                <SeverityIcon severity={ins.severity} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold">{ins.title}</h4>
                    <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                      {CATEGORY_LABELS[ins.category]}
                    </span>
                  </div>
                  {(advanced || ins.severity >= 3) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ins.body}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
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

      {/* Verktøy */}
      <section>
        <h3 className="mb-4 font-semibold">Verktøy</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LIVE_FEATURES.map((f) => (
            <FeatureLiveCard
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

function SeverityIcon({ severity }: { severity: number }) {
  // 1 = positiv (Sparkles), 2-3 = info, 4-5 = advarsel
  if (severity <= 1) {
    return (
      <Sparkles
        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
        strokeWidth={1.5}
      />
    );
  }
  if (severity >= 4) {
    return (
      <AlertTriangle
        className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
        strokeWidth={1.5}
      />
    );
  }
  return (
    <Lightbulb
      className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
      strokeWidth={1.5}
    />
  );
}

function FeatureLiveCard({
  href,
  icon: Icon,
  title,
  description,
  fase,
  advanced,
}: FeatureCard & { advanced: boolean }) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <Icon className="mt-0.5 h-4 w-4 text-primary" />
        <span className="rounded-full bg-accent/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-accent-foreground">
          {fase}
        </span>
      </div>
      <h4 className="text-sm font-semibold">{title}</h4>
      {advanced && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
      <div className="mt-3 flex items-center gap-1 text-xs text-primary">
        <span>Åpne</span>
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        <Zap className="ml-auto h-3 w-3 text-accent" strokeWidth={1.5} />
      </div>
    </Link>
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
