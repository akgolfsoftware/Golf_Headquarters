/**
 * /admin/godkjenn-portal/review?route=... — side-ved-side godkjenning.
 * Venstre iframe: live preview av rute.
 * Høyre iframe: designfil (hvis finnes).
 * Knapper for å markere godkjent / avvik / hoppe over.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { PORTAL_ROUTES } from "@/lib/portal-routes";
import { setApprovalStatus } from "../actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ route?: string }>;
};

export default async function ReviewPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "COACH")) {
    redirect("/auth/login");
  }

  const { route } = await searchParams;
  if (!route) {
    redirect("/admin/godkjenn-portal");
  }

  const idx = PORTAL_ROUTES.findIndex((r) => r.route === route);
  if (idx === -1) {
    redirect("/admin/godkjenn-portal");
  }

  const item = PORTAL_ROUTES[idx];
  const prev = idx > 0 ? PORTAL_ROUTES[idx - 1] : null;
  const next = idx < PORTAL_ROUTES.length - 1 ? PORTAL_ROUTES[idx + 1] : null;

  const approval = await prisma.pageApproval.findUnique({
    where: { route: item.route },
  });

  // Erstatt dynamiske segmenter med 'demo' for preview-iframe
  const previewRoute = item.route.replace(/\[[^\]]+\]/g, "demo");

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Topbar */}
      <header className="border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/godkjenn-portal"
              className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Tilbake
            </Link>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                {item.category} · {idx + 1} av {PORTAL_ROUTES.length}
              </p>
              <h1 className="font-display text-lg font-semibold">{item.label}</h1>
              <p className="font-mono text-[11px] text-muted-foreground">
                {item.route}
              </p>
            </div>
          </div>

          {/* Prev/Next nav */}
          <div className="flex items-center gap-1">
            {prev && (
              <Link
                href={`/admin/godkjenn-portal/review?route=${encodeURIComponent(prev.route)}`}
                className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary"
              >
                <ChevronLeft className="h-3 w-3" />
                Forrige
              </Link>
            )}
            {next && (
              <Link
                href={`/admin/godkjenn-portal/review?route=${encodeURIComponent(next.route)}`}
                className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary"
              >
                Neste
                <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Side-ved-side iframes */}
      <div className="grid flex-1 grid-cols-2 gap-2 overflow-hidden bg-secondary/20 p-2">
        <div className="flex flex-col overflow-hidden rounded-md border border-border bg-card">
          <div className="border-b border-border bg-secondary/40 px-3 py-1.5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              LIVE · {previewRoute}
            </p>
          </div>
          <iframe
            src={previewRoute}
            className="flex-1 bg-background"
            title="Live preview"
          />
        </div>
        <div className="flex flex-col overflow-hidden rounded-md border border-border bg-card">
          <div className="border-b border-border bg-secondary/40 px-3 py-1.5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              DESIGN · {item.designPath?.split("/").pop() ?? "ingen designfil"}
            </p>
          </div>
          {item.designPath ? (
            <iframe
              src={item.designPath}
              className="flex-1 bg-background"
              title="Design handover"
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <p className="font-display text-lg font-semibold">
                  Ingen designfil
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Denne ruten har ikke en eksisterende design-handoff. Vurder
                  basert på Athletic-spec og Dashboard-pattern.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status-knapper + notater */}
      <form
        action={setApprovalStatus}
        className="border-t border-border bg-card px-4 py-3 sm:px-6"
      >
        <input type="hidden" name="route" value={item.route} />
        <input
          type="hidden"
          name="designPath"
          value={item.designPath ?? ""}
        />
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            name="notes"
            defaultValue={approval?.notes ?? ""}
            placeholder="Notater (valgfritt)…"
            className="min-w-[280px] flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <div className="flex items-center gap-1">
            <button
              type="submit"
              name="status"
              value="APPROVED"
              className="inline-flex items-center gap-1 rounded-md bg-success px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              ✓ Godkjent
            </button>
            <button
              type="submit"
              name="status"
              value="MINOR_AVVIK"
              className="inline-flex items-center gap-1 rounded-md bg-warning px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Mindre avvik
            </button>
            <button
              type="submit"
              name="status"
              value="MAJOR_AVVIK"
              className="inline-flex items-center gap-1 rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Stort avvik
            </button>
            <button
              type="submit"
              name="status"
              value="SKIP"
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              Hopp over
            </button>
          </div>
        </div>
        {approval?.status && approval.status !== "PENDING" && (
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            Sist vurdert {approval.reviewedAt?.toLocaleString("nb-NO")}
            {approval.reviewedBy && ` av ${approval.reviewedBy}`}
          </p>
        )}
      </form>
    </div>
  );
}
