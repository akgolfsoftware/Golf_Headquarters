/**
 * AgencyOS — Rediger spiller v2 (retning C). Rekomponert fra
 * src/app/admin/(legacy)/spillere/[id]/rediger — samme loader (User +
 * AuditLog + ParentRelation), samme server action `lagreSpiller`/`slettSpiller`
 * (uendret i (legacy)/spillere/[id]/rediger/actions.ts).
 *
 * Fikser en gotcha fra legacy-siden i samme slengen: historikk-tidspunkt
 * formateres nå eksplisitt i Europe/Oslo (legacy manglet timeZone —
 * server kjører UTC, se .claude/rules/gotchas.md).
 *
 * Server component.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AdminRedigerSpillerV2,
  type AdminRedigerSpillerData,
} from "@/components/admin/v2/AdminRedigerSpillerV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rediger spiller · AgencyOS" };

const OSLO_HISTORIKK_FMT = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatHcpInput(v: number | null | undefined): string {
  if (v == null) return "";
  return v.toString().replace(".", ",");
}

function dateToYmd(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function AdminRedigerSpillerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
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
      include: { parent: { select: { id: true, name: true } } },
    }),
  ]);

  if (!player || player.role !== "PLAYER") notFound();

  const fornavn = player.name.split(" ")[0] ?? "";
  const etternavn = player.name.split(" ").slice(1).join(" ");
  const klassetrinn = player.schoolYear === "VG1" || player.schoolYear === "VG2" || player.schoolYear === "VG3" ? player.schoolYear : "";

  const data: AdminRedigerSpillerData = {
    id: player.id,
    navn: player.name,
    fornavn,
    etternavn,
    fodselsdatoYmd: dateToYmd(player.dateOfBirth),
    telefon: player.phone ?? "",
    epost: player.email,
    hjemmeklubb: player.homeClub ?? "",
    skole: player.school ?? "",
    klassetrinn,
    hcpTekst: formatHcpInput(player.hcp),
    ambisjon: player.ambition ?? "",
    foreldre: parents.map((pr) => ({ id: pr.parent.id, navn: pr.parent.name, relasjon: pr.relationship })),
    historikk: history.map((h) => ({
      id: h.id,
      tidspunkt: OSLO_HISTORIKK_FMT.format(h.createdAt),
      handling: h.action,
      aktorNavn: h.actor?.name ?? null,
    })),
  };

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href={`/admin/spillere/${id}`}>{player.name}</TilbakeLenke>
      <AdminRedigerSpillerV2 data={data} />
    </V2Shell>
  );
}
