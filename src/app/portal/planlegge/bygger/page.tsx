/**
 * PlayerHQ Velg treningsplan (PH-12) i nytt design — /portal/planlegge/bygger.
 * Fasit: docs/design-system/utkast-playerhq/ovelser.html, skjerm «velg» (pakke 4, godkjent 14.10.2026).
 * Avvik:
 *   - Avvikene mot utkastet står øverst i PH12VelgPlan.tsx.
 * De fem standardplanene står øverst (vedtak 28.09), anbefalt etter turneringsnivået fra oppstarten.
 * Malene for spillerens kategori (PlanTemplate) ligger under «Flere maler». Ingen AI.
 * Den gamle AI-byggeren (PlanByggerV2 og actionene) ligger urørt i koden.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { anbefalMalCore } from "@/lib/plan-builder";
import { fordelingFraMal, startUker } from "@/lib/plan-builder/velg-plan";
import { STANDARDPLANER, anbefaltStandardplanId } from "@/lib/plan-builder/standardplaner";
import { hentSesongSnittscore, hentSpillerAkKategori } from "@/lib/domain/spiller-kategori";
import { PH12VelgPlan, type VelgPlanMal } from "@/components/portal/precision/PH12VelgPlan";
import { sendPlanTilCoachV2 } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Velg treningsplan · PlayerHQ" };

export default async function PlanByggerPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [wagr, prefs] = await Promise.all([
    prisma.wagrSnapshot.findUnique({ where: { userId: user.id }, select: { ngfCategory: true } }),
    prisma.user.findUnique({ where: { id: user.id }, select: { preferences: true } }),
  ]);
  const [mal, uleste, akKat, snitt] = await Promise.all([
    anbefalMalCore(user, { maltype: "GENERELL" }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    hentSpillerAkKategori(user.id, { wagrNgfCategory: wagr?.ngfCategory ?? null, hcp: user.hcp }),
    hentSesongSnittscore(user.id),
  ]);
  const anbefaltId = anbefaltStandardplanId(lesKonkurranseNivaa(prefs?.preferences));
  const maler: VelgPlanMal[] = STANDARDPLANER.map((p) => ({
    id: p.id,
    navn: p.navn,
    beskrivelse: p.tekst,
    uker: 12,
    okterPerUke: 0,
    fordeling: p.fordeling,
    anbefalt: p.id === anbefaltId,
    timerPerUke: p.timerPerUke,
    bilde: p.bilde,
  }));
  const kategoriMaler: VelgPlanMal[] = [...(mal.anbefalt ? [mal.anbefalt] : []), ...mal.alternativer].slice(0, 5).map((t) => ({
    id: t.templateId,
    navn: t.navn,
    // Malbeskrivelsene er interne notater; kortet viser lengde og økter i stedet.
    beskrivelse: null,
    uker: Math.min(52, Math.max(2, t.varighetUker)),
    okterPerUke: t.ukentligOktAntall,
    fordeling: fordelingFraMal(t.disciplinFordeling),
    anbefalt: false,
  }));

  return (
    <PH12VelgPlan
      maler={maler}
      kategoriMaler={kategoriMaler}
      kategori={akKat ? { navn: `Kategori ${akKat}`, snitt } : null}
      startUker={startUker(new Date())}
      uleste={uleste}
      onSend={sendPlanTilCoachV2}
      workbenchHref="/portal/planlegge/workbench"
    />
  );
}

/** Turneringsnivået fra oppstarten (preferences.onboarding.konkurranseNivaa), eller null. */
function lesKonkurranseNivaa(preferences: unknown): string | null {
  if (!preferences || typeof preferences !== "object") return null;
  const onboarding = (preferences as Record<string, unknown>).onboarding;
  if (!onboarding || typeof onboarding !== "object") return null;
  const v = (onboarding as Record<string, unknown>).konkurranseNivaa;
  return typeof v === "string" && v ? v : null;
}
