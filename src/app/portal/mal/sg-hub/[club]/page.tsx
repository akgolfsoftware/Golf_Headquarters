import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ club: string }>;
}) {
  await requirePortalUser();
  const { club } = await params;
  const decoded = decodeURIComponent(club);

  return (
    <div className="space-y-6">
      <Link
        href="/portal/mal/sg-hub"
        className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        SG Hub
      </Link>

      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Per-kølle · {decoded}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold">
          Kommer i <em className="font-normal text-primary italic">Fase 2</em>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
          D-Plane Scatter, Strike Heatmap og Smash Curve for {decoded} bygges
          i Fase 2.
        </p>
      </div>
    </div>
  );
}
