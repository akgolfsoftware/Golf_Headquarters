import Link from "next/link";
import { ChevronRight, Dumbbell } from "lucide-react";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { DrillDetail } from "@/components/portal/drill-detail";

export default async function OvelseDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser();
  const { id } = await params;

  const exercise = await prisma.exerciseDefinition.findUnique({
    where: { id },
  });

  if (!exercise) notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/portal/tren/ovelser"
        className="inline-flex min-h-11 items-center gap-1 font-mono text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronRight size={14} strokeWidth={1.5} className="rotate-180" />
        Bibliotek
      </Link>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary font-mono text-primary-foreground ring-4 ring-accent">
          <Dumbbell size={26} strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1 w-full">
          <DrillDetail exercise={exercise} />
        </div>
      </div>
    </div>
  );
}
