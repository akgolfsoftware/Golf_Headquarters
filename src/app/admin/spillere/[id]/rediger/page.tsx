/**
 * AgencyOS — Rediger spiller (`/admin/spillere/[id]/rediger`), v2.
 * Port av `(legacy)/spillere/[id]/rediger/page.tsx` (2026-07-14, AgencyOS
 * Bølge 1.4) — samme datamodell/logikk, ny v2-presentasjon i
 * `AdminSpillerRedigerV2`. `rediger/actions.ts` bor fortsatt under
 * `(legacy)/spillere/[id]/rediger/` — delt server actions (lagreSpiller/
 * slettSpiller), uendret.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminSpillerRedigerV2 } from "@/components/admin/v2/AdminSpillerRedigerV2";

export const dynamic = "force-dynamic";

const NB_DT = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function formatHcpInput(v: number | null | undefined): string {
  if (v == null) return "";
  return v.toString().replace(".", ",");
}

function dateToYmd(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default async function RedigerSpillerPage({ params }: { params: Promise<{ id: string }> }) {
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
      include: { parent: { select: { id: true, name: true, phone: true, email: true } } },
    }),
  ]);

  if (!player || player.role !== "PLAYER") notFound();

  const fornavn = player.name.split(" ")[0] ?? "";
  const etternavn = player.name.split(" ").slice(1).join(" ");

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminSpillerRedigerV2
        id={player.id}
        navn={player.name}
        fornavn={fornavn}
        etternavn={etternavn}
        fodselsdatoYmd={dateToYmd(player.dateOfBirth)}
        telefon={player.phone ?? ""}
        email={player.email}
        hjemmeklubb={player.homeClub ?? ""}
        skole={player.school ?? ""}
        klassetrinn={player.schoolYear ?? ""}
        hcpTekst={formatHcpInput(player.hcp)}
        ambisjon={player.ambition ?? ""}
        historikk={history.map((h) => ({ id: h.id, tidspunkt: NB_DT.format(h.createdAt), action: h.action, aktorNavn: h.actor?.name ?? null }))}
        foresatte={parents.map((p) => ({ id: p.id, navn: p.parent.name, relasjon: p.relationship }))}
      />
    </V2Shell>
  );
}
