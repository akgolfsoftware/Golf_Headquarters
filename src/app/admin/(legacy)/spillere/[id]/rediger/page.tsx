/**
 * AgencyOS — Rediger spiller (`/admin/spillere/[id]/rediger`). v2-port
 * 16. juli 2026.
 *
 * 2-kol form med sticky lagre-bar topp + bunn. Endrings-historikk høyre.
 * Bruker Server Action `lagreSpiller`.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminSpillerRedigerV2, type AdminSpillerRedigerV2Data } from "@/components/admin/v2/AdminSpillerRedigerV2";

function formatHcpInput(v: number | null | undefined): string {
  if (v == null) return "";
  return v.toString().replace(".", ",");
}

function dateToYmd(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

const NB_DT = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function RedigerSpiller({ params }: { params: Promise<{ id: string }> }) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const [player, history, parents] = await Promise.all([
    prisma.user.findUnique({ where: { id } }),
    prisma.auditLog.findMany({
      where: { target: `user:${id}` },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { actor: { select: { name: true } } },
    }),
    prisma.parentRelation.findMany({
      where: { childId: id },
      include: { parent: { select: { id: true, name: true, phone: true, email: true } } },
    }),
  ]);

  if (!player || player.role !== "PLAYER") notFound();

  const fornavn = player.name.split(" ")[0] ?? "";
  const etternavn = player.name.split(" ").slice(1).join(" ");

  const data: AdminSpillerRedigerV2Data = {
    spillerId: player.id,
    spillerNavn: player.name,
    fornavn,
    etternavn,
    fodselsdatoYmd: dateToYmd(player.dateOfBirth),
    telefon: player.phone ?? "",
    epost: player.email,
    hjemmeklubb: player.homeClub ?? "",
    skole: player.school ?? "",
    klassetrinn: player.schoolYear ?? "",
    hcpInput: formatHcpInput(player.hcp),
    ambisjon: player.ambition ?? "",
    foreldre: parents.map((pr) => ({ id: pr.id, navn: pr.parent.name, relasjon: pr.relationship })),
    historikk: history.map((h) => ({
      id: h.id,
      datoLabel: NB_DT.format(h.createdAt),
      handling: h.action,
      aktorNavn: h.actor?.name ?? null,
    })),
  };

  return <AdminSpillerRedigerV2 data={data} />;
}
