import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";
import { DrillEditor } from "@/components/portal/drill-editor";

export default async function NyOvelsePage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href="/portal/coach/ovelser"
        className="inline-flex items-center gap-1 font-mono text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronRight size={14} strokeWidth={1.5} className="rotate-180" />
        Bibliotek
      </Link>

      <PageHeader
        eyebrow="CoachHQ · Ny ovelse"
        titleLead="Opprett"
        titleItalic="ovelse"
      />

      <DrillEditor mode="create" />
    </div>
  );
}
