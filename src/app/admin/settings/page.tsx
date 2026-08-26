/**
 * AgencyOS Oppsett — Train-lock hub (T13, 26.08.2026).
 *
 * Fasit: designsystem/train-lock/AG-18 Oppsett-hub.dc.html + AG-13
 * Oppsett.dc.html. Fem rader — Akademi, Varsler, Tilgang og roller,
 * Klubb og steder, Konto — se AdminOppsettHubTrainLock for full
 * begrunnelse og master–detalj-mønsteret.
 *
 * Erstatter den gamle Paper-fane-siden (?tab=org|team|tilgang, AdminSettingsV2)
 * — gamle lenker med `?tab=` mappes til `?rad=` under. /admin/team
 * redirecter til `?rad=tilgang` (samme datakontrakt som AdminTeamV2, samme
 * Prisma-spørring — designport, ikke funksjonsendring).
 *
 * ADMIN-only (som før — Tilgang og roller viser rolletilgang for hele
 * organisasjonen).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminOppsettHubTrainLock,
  type AdminOppsettHubData,
  type OppsettRadKey,
} from "@/components/admin/v2/oppsett/AdminOppsettHubTrainLock";

export const dynamic = "force-dynamic";

const RAD_KEYS: OppsettRadKey[] = ["akademi", "varsler", "tilgang", "klubb", "konto"];

/** Gamle `?tab=`-verdier (org/team/tilgang) → nye `?rad=`. */
function mapLegacyTab(tab: string | undefined): OppsettRadKey | null {
  if (tab === "org") return "akademi";
  if (tab === "team") return "tilgang";
  if (tab === "tilgang") return "tilgang";
  return null;
}

export default async function V2AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ rad?: string; tab?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN"] });
  const sp = await searchParams;

  if (!sp.rad && sp.tab) {
    const mapped = mapLegacyTab(sp.tab);
    redirect(mapped ? `/admin/settings?rad=${mapped}` : "/admin/settings");
  }

  const rad: OppsettRadKey | null = RAD_KEYS.includes(sp.rad as OppsettRadKey) ? (sp.rad as OppsettRadKey) : null;

  const [locations, settingsRow, team, totalSpillere] = await Promise.all([
    prisma.location.findMany({
      select: { id: true, name: true, active: true, _count: { select: { facilities: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.clubSettings.findFirst({ select: { clubName: true } }),
    prisma.user.findMany({
      where: { role: { in: ["COACH", "ADMIN"] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: { select: { coachedGroups: true, coachAvailability: true } },
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
    prisma.user.count({ where: coachScopedPlayerWhere(user) }),
  ]);

  const totalCount = team.length;
  const adminCount = team.filter((u) => u.role === "ADMIN").length;
  const coachCount = team.filter((u) => u.role === "COACH").length;
  const snittSpillere = totalCount > 0 ? (totalSpillere / totalCount).toFixed(1).replace(".", ",") : "—";

  const data: AdminOppsettHubData = {
    akademi: {
      navn: settingsRow?.clubName?.trim() || "AK Golf Academy",
      hjemmeklubb: locations.find((l) => l.active)?.name ?? null,
      sesong: new Date().getFullYear(),
      ukestart: "Mandag",
    },
    varslerBeskrivelse: "Kø, godkjenning, live",
    tilgang: {
      medlemmer: team.map((u) => ({
        id: u.id,
        navn: u.name ?? "Uten navn",
        epost: u.email,
        rolle: u.role === "ADMIN" ? "ADMIN" : "COACH",
        grupper: u._count.coachedGroups,
        tidsvinduer: u._count.coachAvailability,
      })),
      totalCount,
      adminCount,
      coachCount,
      totalSpillere,
      snittSpillere,
      inviterHref: "/admin/team/inviter",
      tilgangsmatriseHref: "/admin/settings/tilgang",
    },
    klubb: {
      lokasjoner: locations.map((l) => ({ id: l.id, navn: l.name, aktiv: l.active, fasiliteter: l._count.facilities })),
      innstillingerHref: "/admin/klubb/innstillinger",
      fasiliteterHref: "/admin/anlegg",
    },
    konto: {
      navn: user.name ?? "Coach",
      epost: user.email,
      rolleLabel: user.role === "ADMIN" ? "Administrator" : "Coach",
      href: "/admin/profile",
    },
  };

  return (
    <V2Shell bredde="full" aktiv="innstillinger" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminOppsettHubTrainLock data={data} rad={rad} />
    </V2Shell>
  );
}
