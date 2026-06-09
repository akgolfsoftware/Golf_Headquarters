import Link from "next/link";
import { ArrowLeft, LayoutTemplate } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
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
        eyebrow="AgencyOS · Treningsplaner · Maler"
        titleLead="Ny"
        titleItalic="mal"
        titleTrail="fra bunn"
        sub="Wizard for å bygge maler fra bunn av kommer Q3 2026. Inntil videre kan du lagre en eksisterende plan som mal."
      />

      <EmptyState
        icon={LayoutTemplate}
        titleItalic="Mal-wizard"
        titleTrail="kommer Q3 2026"
        sub="I mellomtiden kan du opprette en mal ved å åpne en eksisterende plan og bruke «Lagre som mal»."
        cta={
          <Link
            href="/admin/plans/templates"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Bruk eksisterende mal i stedet
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/plans"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
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
