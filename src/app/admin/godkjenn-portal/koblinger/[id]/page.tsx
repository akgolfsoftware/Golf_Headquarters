/**
 * /admin/godkjenn-portal/koblinger/[id]
 * Detalj: design-iframe + app-iframe + knapp-liste.
 */

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { ALL_ROUTES } from "@/lib/all-routes";
import { ChevronLeft } from "lucide-react";
import { KoblingDetailClient } from "./client";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function KoblingDetailPage({ params }: { params: Params }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "COACH")) {
    redirect("/auth/login");
  }
  const { id } = await params;

  const kobling = await prisma.designKobling.findUnique({ where: { id } });
  if (!kobling) notFound();

  const allRoutes = ALL_ROUTES.map((r) => ({
    route: r.route,
    label: r.label,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="sticky top-0 z-10 border-b border-border bg-card px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/godkjenn-portal/koblinger"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Tilbake
            </Link>
            <div className="h-4 w-px bg-border" />
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                {kobling.designFile}
              </p>
              <h1 className="text-sm font-semibold text-foreground">
                {kobling.designTitle.slice(0, 80)}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <KoblingDetailClient
        kobling={{
          id: kobling.id,
          designFile: kobling.designFile,
          designTitle: kobling.designTitle,
          status: kobling.status,
          suggestedRoute: kobling.suggestedRoute,
          confirmedRoute: kobling.confirmedRoute,
          notes: kobling.notes,
          buttonCount: kobling.buttonCount,
          linkCount: kobling.linkCount,
          confidence: kobling.confidence,
          buttons: Array.isArray(kobling.buttons)
            ? (kobling.buttons as Array<{
                text: string;
                href?: string;
                type: "button" | "link";
                targetRoute?: string;
              }>)
            : [],
        }}
        allRoutes={allRoutes}
      />
    </div>
  );
}
