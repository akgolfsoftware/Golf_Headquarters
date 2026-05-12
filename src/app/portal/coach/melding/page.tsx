import Link from "next/link";
import { ArrowUpRight, ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { MeldingForm } from "./form";

export default async function CoachMeldingPage() {
  const user = await requirePortalUser();

  if (user.tier === "GRATIS") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="PlayerHQ · Coach"
          titleLead="Krever"
          titleItalic="Pro"
          sub="Direkte coach-meldinger er en del av Pro-abonnementet."
        />
        <div className="rounded-lg border border-border bg-card p-6">
          <Link
            href="/portal/meg/abonnement"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Oppgrader til Pro
            <ArrowUpRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    );
  }

  const coacher = await prisma.user.findMany({
    where: { role: "COACH" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const hovedcoach = coacher[0];

  return (
    <div className="space-y-8">
      <Link
        href="/portal/coach"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft size={14} strokeWidth={1.5} />
        Tilbake til oversikt
      </Link>

      <PageHeader
        eyebrow="PlayerHQ · Coach"
        titleLead="Ny melding"
        titleItalic={hovedcoach ? `til ${hovedcoach.name.split(" ")[0]}` : "til coach"}
        sub="Coachen får meldingen i CoachHQ og kan svare direkte tilbake."
      />

      <MeldingForm coacher={coacher} />
    </div>
  );
}
