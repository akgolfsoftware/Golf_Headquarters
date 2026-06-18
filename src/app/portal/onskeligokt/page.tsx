/**
 * PlayerHQ · Be om økt
 *
 * Hybrid design (2026-06-17). Header bruker back-button + display h1 + subtitle.
 * Datakilde: User (coacher fra DB).
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
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

  const standardCoach = coacher[0] ?? null;
  const coachName = standardCoach?.name ?? "coachen";

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <div className="mx-auto max-w-[820px] px-4 py-6 sm:px-6 sm:py-8">
        {/* Hybrid header */}
        <div className="mb-8">
          <Link
            href="/portal/gjennomfore"
            className="mb-6 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Tilbake
          </Link>
          <h1 className="font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.015em] text-foreground sm:text-[36px]">
            Be om{" "}
            <em className="font-normal italic text-primary">økt</em>
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            {coachName} svarer innen 24 timer.
          </p>
        </div>

        {params.sent === "1" && (
          <div className="mb-6 rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-foreground">
            Forespørsel sendt. Du får varsel når coachen har satt opp en tid.
          </div>
        )}

        <OnskeligOktForm coacher={coacher} />
      </div>
    </div>
  );
}
