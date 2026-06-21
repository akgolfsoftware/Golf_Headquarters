/**
 * /admin/godkjenn-portal — manuell godkjenning av PlayerHQ-sider mot
 * design-handoff. Liste over alle 142 ruter med status + lenker til
 * live preview og designfil.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, FileImage, Eye } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { PORTAL_ROUTES, CATEGORIES } from "@/lib/portal-routes";
import type { ApprovalStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  PENDING: "Venter",
  APPROVED: "Godkjent",
  MINOR_AVVIK: "Mindre avvik",
  MAJOR_AVVIK: "Stort avvik",
  SKIP: "Hoppes over",
};

const STATUS_CLASS: Record<ApprovalStatus, string> = {
  PENDING: "bg-secondary text-muted-foreground",
  APPROVED: "bg-success/15 text-success",
  MINOR_AVVIK: "bg-warning/15 text-warning",
  MAJOR_AVVIK: "bg-destructive/15 text-destructive",
  SKIP: "bg-muted text-muted-foreground",
};

export default async function GodkjennPortalPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "COACH")) {
    redirect("/auth/login");
  }

  const approvals = await prisma.pageApproval.findMany();
  const approvalMap = new Map(approvals.map((a) => [a.route, a]));

  const counts = {
    total: PORTAL_ROUTES.length,
    approved: approvals.filter((a) => a.status === "APPROVED").length,
    minor: approvals.filter((a) => a.status === "MINOR_AVVIK").length,
    major: approvals.filter((a) => a.status === "MAJOR_AVVIK").length,
    skip: approvals.filter((a) => a.status === "SKIP").length,
    pending:
      PORTAL_ROUTES.length -
      approvals.filter((a) => a.status !== "PENDING").length,
  };
  const designCount = PORTAL_ROUTES.filter((r) => r.designPath).length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:py-8 md:px-6 lg:px-8">
      {/* Header */}
      <header className="space-y-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
          AGENCYOS · KVALITETSSIKRING
        </p>
        <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
          Godkjenn <em className="font-normal italic text-primary">PlayerHQ</em>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Side-ved-side sammenligning av implementerte ruter mot
          design-handoff. {designCount} av {counts.total} sider har en
          designfil.
        </p>
      </header>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Totalt" value={counts.total} />
        <Stat label="Godkjent" value={counts.approved} tone="success" />
        <Stat label="Mindre avvik" value={counts.minor} tone="warning" />
        <Stat label="Stort avvik" value={counts.major} tone="destructive" />
        <Stat label="Hoppet over" value={counts.skip} />
        <Stat label="Ikke vurdert" value={counts.pending} />
      </div>

      {/* Tabeller per kategori */}
      {CATEGORIES.map((category) => {
        const items = PORTAL_ROUTES.filter((r) => r.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category} className="space-y-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {category}
              <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">
                ({items.length})
              </span>
            </h2>
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/40 text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Side</th>
                    <th className="px-4 py-2 font-semibold">Designfil</th>
                    <th className="px-4 py-2 font-semibold">Status</th>
                    <th className="px-4 py-2 font-semibold">Sist vurdert</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const approval = approvalMap.get(item.route);
                    const status = approval?.status ?? "PENDING";
                    const reviewLink = `/admin/godkjenn-portal/review?route=${encodeURIComponent(item.route)}`;
                    return (
                      <tr
                        key={item.route}
                        className="border-b border-border last:border-0 hover:bg-secondary/30"
                      >
                        <td className="px-4 py-4">
                          <div className="font-display font-semibold">
                            {item.label}
                          </div>
                          <div className="font-mono text-[11px] text-muted-foreground">
                            {item.route}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {item.designPath ? (
                            <a
                              href={item.designPath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <FileImage className="h-3 w-3" />
                              {item.designPath.split("/").pop()}
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${STATUS_CLASS[status]}`}
                          >
                            {STATUS_LABEL[status]}
                          </span>
                          {approval?.notes && (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {approval.notes}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {approval?.reviewedAt && (
                            <div className="font-mono text-[11px] text-muted-foreground">
                              {approval.reviewedAt.toLocaleDateString("nb-NO")}
                              {approval.reviewedBy && (
                                <div className="text-[10px]">
                                  av {approval.reviewedBy}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Link
                              href={item.route.replace(/\[[^\]]+\]/g, "demo")}
                              target="_blank"
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:border-primary hover:text-primary"
                              title="Åpne live"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Live
                            </Link>
                            <Link
                              href={reviewLink}
                              className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:opacity-90"
                              title="Side-ved-side"
                            >
                              <Eye className="h-3 w-3" />
                              Vurder
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "warning" | "destructive";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "destructive"
          ? "text-destructive"
          : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`font-mono mt-1 text-2xl font-bold tabular-nums ${toneClass}`}
      >
        {value}
      </p>
    </div>
  );
}
