/**
 * PlayerHQ Velg treningsplan (PH-12) i nytt design — /portal/planlegge/bygger.
 * Fasit: docs/design-system/utkast-playerhq/ovelser.html, skjerm «velg» (pakke 4, godkjent 14.10.2026).
 * Avvik:
 *   - Avvikene mot utkastet står øverst i PH12VelgPlan.tsx.
 * Malene er standardplanene for spillerens kategori (PlanTemplate), ingen AI.
 * Den gamle AI-byggeren (PlanByggerV2 og actionene) ligger urørt i koden.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { anbefalMalCore } from "@/lib/plan-builder";
import { fordelingFraMal, startUker } from "@/lib/plan-builder/velg-plan";
import { hentSesongSnittscore, hentSpillerAkKategori } from "@/lib/domain/spiller-kategori";
import { PH12VelgPlan, type VelgPlanMal } from "@/components/portal/precision/PH12VelgPlan";
import { sendPlanTilCoachV2 } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Velg treningsplan · PlayerHQ" };

export default async function PlanByggerPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  if (user.role === "GUEST") redirect("/admin/kalender");

  const wagr = await prisma.wagrSnapshot.findUnique({ where: { userId: user.id }, select: { ngfCategory: true } });
  const [mal, uleste, akKat, snitt] = await Promise.all([
    anbefalMalCore(user, { maltype: "GENERELL" }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    hentSpillerAkKategori(user.id, { wagrNgfCategory: wagr?.ngfCategory ?? null, hcp: user.hcp }),
    hentSesongSnittscore(user.id),
  ]);
  const maler: VelgPlanMal[] = [...(mal.anbefalt ? [mal.anbefalt] : []), ...mal.alternativer].slice(0, 5).map((t) => ({
    id: t.templateId,
    navn: t.navn,
    beskrivelse: t.beskrivelse?.trim() || null,
    uker: Math.min(52, Math.max(2, t.varighetUker)),
    okterPerUke: t.ukentligOktAntall,
    fordeling: fordelingFraMal(t.disciplinFordeling),
    anbefalt: t.templateId === mal.anbefalt?.templateId,
  }));

  return (
    <PH12VelgPlan
      maler={maler}
      kategori={akKat ? { navn: `Kategori ${akKat}`, snitt } : null}
      startUker={startUker(new Date())}
      uleste={uleste}
      onSend={sendPlanTilCoachV2}
      workbenchHref="/portal/planlegge/workbench"
    />
  );
}
