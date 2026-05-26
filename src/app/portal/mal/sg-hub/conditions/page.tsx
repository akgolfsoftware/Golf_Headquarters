import { ArrowLeft, Wind } from "lucide-react";
import Link from "next/link";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { buildYardageRows } from "@/lib/sg-hub/yardage-calc";
import { ConditionsSlider } from "@/components/sg-hub/ConditionsSlider";

export default async function ConditionsPage() {
  const user = await requirePortalUser();

  const sessions = await prisma.trackManSession.findMany({
    where: { userId: user.id },
    select: { rawJson: true },
    orderBy: { recordedAt: "desc" },
    take: 30,
  });

  const rows = buildYardageRows(sessions);

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
          <Wind className="mt-1 h-5 w-5 text-primary" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Fase 3 · Distance and Strategy
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold leading-tight">
              <em className="font-normal italic text-primary">Værjustert</em>{" "}
              distanse
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Dra slidere for temperatur, vind og høyde og se hvordan stock-distansene
              dine endrer seg. Vind-effekten estimeres fra apex × tid-i-lufta.
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
            for å aktivere værjustert visning.
          </p>
        </div>
      ) : (
        <ConditionsSlider rows={rows} />
      )}
    </div>
  );
}
