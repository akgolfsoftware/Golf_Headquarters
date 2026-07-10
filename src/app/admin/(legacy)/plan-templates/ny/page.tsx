/**
 * /admin/plan-templates/ny — opprett ny mal fra blank.
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { NewTemplateForm } from "@/components/admin/plan-templates/new-template-form";

export const dynamic = "force-dynamic";

export default async function NyPlanTemplate() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-0">
      <Link
        href="/admin/plan-templates"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        Tilbake til biblioteket
      </Link>
      <PageHeader
        eyebrow="NY MAL"
        titleLead="Opprett"
        titleItalic="mal"
        sub="Fyll inn metadata og opprett. Du kan legge til økter etterpå."
      />
      <NewTemplateForm />
    </div>
  );
}
