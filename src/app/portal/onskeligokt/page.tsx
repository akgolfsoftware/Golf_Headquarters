import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { OnskeligOktForm } from "./form";

type Search = { sent?: string };

export default async function OnskeligOktPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser();
  const params = await searchParams;

  const coacher = await prisma.user.findMany({
    where: { role: "COACH" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <Link
        href="/portal"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Hjem
      </Link>

      <PageHeader
        eyebrow="PlayerHQ · Forespørsel"
        titleLead="Be om en"
        titleItalic="ekstra"
        titleTrail="økt"
        sub="Si fra hva du vil jobbe med — coachen din ser forespørselen i CoachHQ og setter opp en tid som passer."
      />

      {params.sent === "1" && (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
          Forespørsel sendt. Du får varsel når coachen har satt opp en tid.
        </div>
      )}

      <OnskeligOktForm coacher={coacher} />
    </div>
  );
}
