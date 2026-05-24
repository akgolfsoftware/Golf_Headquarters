import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { DrillEditor } from "@/components/portal/drill-editor";

export default async function NyOvelsePage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 sm:px-6">
      <Link
        href="/portal/coach/ovelser"
        className="inline-flex min-h-11 items-center gap-1 font-mono text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronRight size={14} strokeWidth={1.5} className="rotate-180" />
        Bibliotek
      </Link>

      <PageHeader
        eyebrow="CoachHQ · Ny øvelse"
        titleLead="Opprett"
        titleItalic="øvelse"
      />

      <DrillEditor mode="create" />
    </div>
  );
}
