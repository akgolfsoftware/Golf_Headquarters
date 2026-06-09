/**
 * AgencyOS — Drill-redaktør (edit form)
 * Loader drill + alle andre drills (til prerequisites-multiselect).
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { DrillEditForm } from "./drill-edit-form";

export default async function DrillEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const drill = await prisma.exerciseDefinition.findUnique({
    where: { id },
  });
  if (!drill) notFound();

  const andreDrills = await prisma.exerciseDefinition.findMany({
    where: { NOT: { id } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <Link
        href={`/admin/drills/${id}`}
        className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={12} strokeWidth={1.75} />
        Tilbake til drill
      </Link>

      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          AgencyOS · Rediger drill
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Rediger</em>{" "}
          {drill.name}
        </h1>
      </header>

      <DrillEditForm drill={drill} andreDrills={andreDrills} />
    </div>
  );
}
