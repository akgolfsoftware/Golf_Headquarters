import { ArrowLeft, BarChart2 } from "lucide-react";
import Link from "next/link";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { buildYardageRows } from "@/lib/sg-hub/yardage-calc";
import { StockYardageTable } from "@/components/sg-hub/StockYardageTable";

export default async function YardagePage() {
  const user = await requirePortalUser();

  const sessions = await prisma.trackManSession.findMany({
    where: { userId: user.id },
    select: { rawJson: true },
    orderBy: { recordedAt: "desc" },
    take: 30, // siste N=30 økter per spec
  });

  const rows = buildYardageRows(sessions);
  const playerName = user.name ?? user.email ?? "Spiller";

  return (
    <div className="space-y-6">
      <Link
        href="/portal/mal/sg-hub"
        className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        SG Hub
      </Link>

      <header className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-2">
          <BarChart2 className="mt-1 h-5 w-5 text-primary" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Fase 3 · Distance and Strategy
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold leading-tight">
              <em className="font-normal italic text-primary">Stock</em> Yardage
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Auto-generert yardage-kort med carry, 3/4, soft, apex og ±1σ per
              kølle. Bruk slidere for værjustering, eller last ned som PDF.
            </p>
          </div>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Ingen TrackMan-data ennå.{" "}
            <Link
              href="/portal/mal/trackman"
              className="text-primary underline-offset-2 hover:underline"
            >
              Importer din første økt
            </Link>{" "}
            for å generere yardage-kortet.
          </p>
        </div>
      ) : (
        <StockYardageTable rows={rows} playerName={playerName} />
      )}
    </div>
  );
}
