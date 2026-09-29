/**
 * AG-10 Teknisk plan (coach) i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-10.jsx). Med ?oppgave=<id|ny> vises
 * oppgaveskjemaet AG-TP-01 (ui_kits/agencyos/screens/AG-TP.jsx).
 *
 * Tilgang som før: COACH/ADMIN, spilleren må være i coachens stall
 * (coachScopedPlayerWhere), og planen må tilhøre spilleren. Fanene fra
 * v2-siden (oversikt, periodisering, drills, hit-rate, effekt) er erstattet av
 * tegningens ene flate; hit-rate står nå som treffprotokoll på hver oppgave.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { hentTekniskPlan } from "@/lib/teknisk-plan/tp-last";
import { TOMT_SKJEMA, oppgaveVisning, planVisning, skjemaFraOppgave } from "@/lib/teknisk-plan/tp-visning";
import { AG10TekniskPlan, type AG10Props } from "@/components/admin/precision/AG10TekniskPlan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Teknisk plan · AgencyOS" };

export default async function SpillerTekniskPlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; planId: string }>;
  searchParams: Promise<{ oppgave?: string }>;
}) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id, planId } = await params;
  const { oppgave } = await searchParams;

  const [spiller, rad] = await Promise.all([
    prisma.user.findFirst({ where: { AND: [coachScopedPlayerWhere(coach), { id }] }, select: { id: true, name: true } }),
    hentTekniskPlan({ id: planId, userId: id }),
  ]);
  if (!spiller || !rad) notFound();

  let skjema: AG10Props["skjema"] = null;
  if (oppgave === "ny") {
    skjema = { skjema: TOMT_SKJEMA, base: null };
  } else if (oppgave) {
    const pos = rad.positions.find((p) => p.tasks.some((t) => t.id === oppgave));
    const t = pos?.tasks.find((x) => x.id === oppgave);
    if (!pos || !t) notFound();
    skjema = { skjema: skjemaFraOppgave(t, pos.pNummer), base: oppgaveVisning(t, pos.pNummer) };
  }

  return (
    <AG10TekniskPlan
      coachNavn={coach.name ?? "Coach"}
      spiller={{ id: spiller.id, navn: spiller.name ?? "Spiller" }}
      plan={planVisning(rad)}
      planAktiv={rad.status === "ACTIVE"}
      skjema={skjema}
    />
  );
}
