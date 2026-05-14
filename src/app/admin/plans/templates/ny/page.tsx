import Link from "next/link";
import { ArrowLeft, LayoutTemplate } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default async function NyMal() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="space-y-8">
      <Link
        href="/admin/plans/templates"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Maler
      </Link>

      <PageHeader
        eyebrow="CoachHQ · Treningsplaner · Maler"
        titleLead="Ny"
        titleItalic="mal"
        titleTrail="fra bunn"
        sub="Mal-redigering fra bunn av kommer i v2. Inntil videre kan du lagre en eksisterende plan som mal."
      />

      <EmptyState
        icon={LayoutTemplate}
        titleItalic="Mal-redigering"
        titleTrail="kommer i v2"
        sub="Du kan opprette en mal ved å åpne en eksisterende plan og lagre den som mal."
      />

      <div className="flex gap-4">
        <Link
          href="/admin/plans"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Gå til treningsplaner
        </Link>
        <Link
          href="/admin/plans/templates"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Tilbake til maler
        </Link>
      </div>
    </div>
  );
}
