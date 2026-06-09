/**
 * AgencyOS · Tester · Foreslåtte tester
 *
 * Viser custom-tester laget av spillere som ønsker coach-godkjenning
 * (visibility: COACH, isCoachApproved: false). Coach kan godkjenne (gjør
 * testen synlig for hele akademi) eller avvise (sletter forslaget).
 */
import Link from "next/link";
import {
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { ForeslattTestKort } from "./test-kort";

export const dynamic = "force-dynamic";

export default async function ForeslatteTesterPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const foreslåtte = await prisma.testDefinition.findMany({
    where: {
      isCustom: true,
      visibility: "COACH",
      isCoachApproved: false,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      pyramidArea: true,
      scoringRule: true,
      protocol: true,
      createdAt: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6 pb-20 md:space-y-8 md:pb-0">
      <div>
        <Link
          href="/admin/tester"
          className="inline-flex h-11 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={12} strokeWidth={1.75} /> Tilbake til stall
        </Link>
      </div>

      <PageHeader
        eyebrow="AgencyOS · /admin/tester/foreslatte"
        titleLead="Foreslåtte"
        titleItalic="tester"
        sub="Spillere har sendt inn egne tester for godkjenning. Godkjente tester blir tilgjengelige for hele akademi."
      />

      {foreslåtte.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <Sparkles
            size={20}
            strokeWidth={1.5}
            className="mx-auto mb-2 text-muted-foreground"
          />
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Ingen forslag i køen
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Når en spiller foreslår en ny test til deg, dukker den opp her.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {foreslåtte.map((t) => (
            <ForeslattTestKort
              key={t.id}
              test={{
                id: t.id,
                name: t.name,
                description: t.description,
                pyramidArea: t.pyramidArea,
                scoringRule: t.scoringRule,
                protocol: t.protocol,
                createdAt: t.createdAt.toISOString(),
                forfatter: t.createdBy?.name ?? t.createdBy?.email ?? "Ukjent",
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
