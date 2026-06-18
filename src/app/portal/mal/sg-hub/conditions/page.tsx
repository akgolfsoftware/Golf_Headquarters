import { ArrowLeft } from "lucide-react";
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
    <div className="mx-auto max-w-[760px] space-y-6 px-4 pb-20 sm:px-6 md:pb-0">
      {/* Back link */}
      <Link
        href="/portal/mal/sg-hub"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        SG-hub
      </Link>

      {/* Editorial header */}
      <div className="space-y-1">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Fase 3 · distanse og strategi
        </p>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-foreground">
          Værjustert{" "}
          <em className="italic font-medium" style={{ color: "#005840" }}>
            distanse
          </em>
        </h1>
        <p className="max-w-xl pt-1 text-sm text-muted-foreground">
          Dra slidere for temperatur, vind og høyde og se hvordan stock-distansene
          dine endrer seg. Vind-effekten estimeres fra apex × tid-i-lufta.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
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
