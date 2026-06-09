/**
 * CoachHQ — Ny drill
 * Oppretter en ExerciseDefinition via createDrill-action. Speiler felt-settet
 * fra rediger-skjemaet, men starter blankt.
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { DrillCreateForm } from "./drill-create-form";

export default async function NyDrillPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Link
        href="/admin/drills"
        className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={12} strokeWidth={1.75} />
        Tilbake til biblioteket
      </Link>

      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          CoachHQ · Ny drill
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Ny</em> drill
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Legg til en øvelse i biblioteket. Du kan finjustere alle felt etterpå
          fra drill-detaljen.
        </p>
      </header>

      <DrillCreateForm />
    </div>
  );
}
