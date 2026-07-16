import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { DrillEditor } from "@/components/portal/drill-editor";

export default async function RedigerOvelsePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const exercise = await prisma.exerciseDefinition.findUnique({
    where: { id },
  });

  if (!exercise) notFound();

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
        eyebrow="PlayerHQ · Rediger øvelse"
        titleLead="Rediger"
        titleItalic={exercise.name}
      />

      <DrillEditor mode="edit" initial={exercise} />
    </div>
  );
}
