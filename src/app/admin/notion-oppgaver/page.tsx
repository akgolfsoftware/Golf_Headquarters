import Link from "next/link";
import { FileText } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";

export default async function NotionOppgaverPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Produktivitet · Notion"
        titleLead="Notion"
        titleItalic="oppgaver"
        sub="Speilet fra Notion-arbeidsområdet ditt."
      />
      <EmptyState
        icon={FileText}
        titleItalic="Venter på Notion-kobling"
        sub="Legg inn Notion API-token i Integrasjoner for å aktivere denne siden."
        cta={
          <Link
            href="/admin/integrasjoner"
            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Gå til Integrasjoner
          </Link>
        }
      />
    </div>
  );
}
