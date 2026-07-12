/**
 * v2-preview: AgencyOS E-postmaler (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell leverer
 * all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger den ekte /admin/email-templates-flaten: samme Prisma-
 * loader (EmailTemplate, aktive først, deretter navn) og samme slug-prefiks-
 * gruppering. Guard er ADMIN/COACH (server-actions krevCoach tillater begge).
 * Mapper til AdminEmailV2Data (ærlige tomrom, ingen fabrikerte tall).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AdminEmailV2,
  type AdminEmailV2Data,
  type AdminEmailV2Template,
} from "@/components/admin/v2/AdminEmailV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "E-postmaler · AgencyOS (v2)" };

function fmtDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function V2AdminEmailPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const templates = await prisma.emailTemplate.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  const maler: AdminEmailV2Template[] = templates.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    subject: t.subject,
    body: t.body,
    active: t.active,
    gruppe: t.slug.includes("-") ? t.slug.split("-")[0] : "andre",
    sistEndret: fmtDato(t.updatedAt),
    opprettet: fmtDato(t.createdAt),
  }));

  const grupper = Array.from(new Set(maler.map((m) => m.gruppe))).sort();

  const data: AdminEmailV2Data = {
    total: maler.length,
    aktive: maler.filter((m) => m.active).length,
    grupper,
    maler,
  };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/agencyos">Cockpit</TilbakeLenke>
      <AdminEmailV2 data={data} />
    </V2Shell>
  );
}
