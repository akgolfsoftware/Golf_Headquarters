/**
 * CoachHQ — Rediger spiller.
 *
 * Server-component med klient-form som kaller server action
 * oppdaterSpiller. Ved suksess redirecter til /admin/elever/{id}.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { RedigerSpillerForm } from "./form";

export default async function RedigerSpillerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const player = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      hcp: true,
      homeClub: true,
      ambition: true,
      preferences: true,
    },
  });

  if (!player) notFound();

  const prefs =
    player.preferences &&
    typeof player.preferences === "object" &&
    !Array.isArray(player.preferences)
      ? (player.preferences as Record<string, unknown>)
      : {};
  const alder =
    typeof prefs.alder === "number" ? prefs.alder : null;

  return (
    <div className="flex flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
      <PageHeader
        eyebrow="Spillere · Rediger"
        titleLead="Rediger"
        titleItalic="spilleren"
        titleTrail="."
        sub={`Oppdater informasjon for ${player.name}.`}
      />

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6 md:p-8">
        <RedigerSpillerForm
          userId={player.id}
          initial={{
            navn: player.name,
            epost: player.email,
            phone: player.phone ?? "",
            hcp: player.hcp,
            klubb: player.homeClub ?? "",
            ambition: player.ambition ?? "",
            alder,
          }}
        />
      </div>
    </div>
  );
}
