/**
 * /admin/godkjenn-portal/koblinger
 * Oversikt over alle design-koblinger med status + foreslått rute.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { CheckCircle2, AlertCircle, XCircle, Circle, Link2 } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

export default async function KoblingerPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "COACH")) {
    redirect("/auth/login");
  }
  const sp = await searchParams;
  const filter = sp.status?.toUpperCase();

  const where = filter && ["UNMAPPED", "MAPPED", "APPROVED", "MISSING", "BROKEN"].includes(filter)
    ? { status: filter as "UNMAPPED" | "MAPPED" | "APPROVED" | "MISSING" | "BROKEN" }
    : {};

  const koblinger = await prisma.designKobling.findMany({
    where,
    orderBy: [{ status: "asc" }, { designFile: "asc" }],
  });

  const total = await prisma.designKobling.count();
  const counts = await prisma.designKobling.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countMap = Object.fromEntries(
    counts.map((c) => [c.status, c._count._all]),
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-8">
        <header className="mb-8 flex items-end justify-between border-b border-border pb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              CoachHQ · Godkjenning
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">
              Design-koblinger
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Mapping mellom design-handover-filer og app-ruter. {total} designs · klikk en rad for å koble knapper og godkjenne.
            </p>
          </div>
          <Link
            href="/admin/godkjenn-portal"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Gammel godkjenningsside
          </Link>
        </header>

        {/* Status-kort */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          <StatCard
            label="Totalt"
            count={total}
            href="/admin/godkjenn-portal/koblinger"
            active={!filter}
          />
          <StatCard
            label="Ikke mappet"
            count={countMap.UNMAPPED ?? 0}
            href="/admin/godkjenn-portal/koblinger?status=unmapped"
            active={filter === "UNMAPPED"}
            tone="warn"
          />
          <StatCard
            label="Mappet"
            count={countMap.MAPPED ?? 0}
            href="/admin/godkjenn-portal/koblinger?status=mapped"
            active={filter === "MAPPED"}
            tone="info"
          />
          <StatCard
            label="Godkjent"
            count={countMap.APPROVED ?? 0}
            href="/admin/godkjenn-portal/koblinger?status=approved"
            active={filter === "APPROVED"}
            tone="ok"
          />
          <StatCard
            label="Mangler / brutt"
            count={(countMap.MISSING ?? 0) + (countMap.BROKEN ?? 0)}
            href="/admin/godkjenn-portal/koblinger?status=missing"
            active={filter === "MISSING"}
            tone="danger"
          />
        </div>

        {/* Tabell */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/40">
              <tr className="text-left font-mono text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Design</th>
                <th className="px-4 py-4">Foreslått rute</th>
                <th className="px-4 py-4 text-right">Knapper</th>
                <th className="px-4 py-4 text-right">Match</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {koblinger.map((k) => (
                <tr key={k.id} className="hover:bg-muted/30">
                  <td className="px-4 py-4">
                    <StatusBadge status={k.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-foreground">
                      {k.designTitle.slice(0, 60)}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {k.designFile}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {k.confirmedRoute ? (
                      <span className="font-mono text-xs text-success">
                        ✓ {k.confirmedRoute}
                      </span>
                    ) : k.suggestedRoute ? (
                      <span className="font-mono text-xs text-muted-foreground">
                        {k.suggestedRoute}
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-destructive">
                        — ingen match —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-sm text-muted-foreground">
                    {k.buttonCount + k.linkCount}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-sm text-muted-foreground">
                    {k.confidence}%
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/godkjenn-portal/koblinger/${k.id}`}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <Link2 className="h-3 w-3" />
                      Åpne
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {koblinger.length === 0 && (
          <div className="mt-8 rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              Ingen design-koblinger for valgt filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  count,
  href,
  active,
  tone = "neutral",
}: {
  label: string;
  count: number;
  href: string;
  active?: boolean;
  tone?: "neutral" | "ok" | "warn" | "info" | "danger";
}) {
  const toneClass = {
    neutral: "text-foreground",
    ok: "text-success",
    warn: "text-warning",
    info: "text-info",
    danger: "text-destructive",
  }[tone];

  return (
    <Link
      href={href}
      className={`block rounded-lg border bg-card p-4 transition-colors ${
        active
          ? "border-foreground"
          : "border-border hover:border-foreground/30"
      }`}
    >
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 font-mono text-3xl font-semibold ${toneClass}`}>
        {count}
      </p>
    </Link>
  );
}

function StatusBadge({
  status,
}: {
  status: "UNMAPPED" | "MAPPED" | "APPROVED" | "MISSING" | "BROKEN";
}) {
  const config = {
    UNMAPPED: { icon: Circle, label: "Ikke mappet", className: "text-muted-foreground" },
    MAPPED: { icon: Link2, label: "Mappet", className: "text-info" },
    APPROVED: { icon: CheckCircle2, label: "Godkjent", className: "text-success" },
    MISSING: { icon: AlertCircle, label: "Mangler", className: "text-warning" },
    BROKEN: { icon: XCircle, label: "Brutt", className: "text-destructive" },
  }[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${config.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
