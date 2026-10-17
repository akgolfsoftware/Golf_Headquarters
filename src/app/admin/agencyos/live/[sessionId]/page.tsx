/**
 * AgencyOS · Live-økt (coach). Lys (beslutninger.md §LIVE-ØKTENE ER ALLTID LYSE, 14.10).
 * Flyttet ut av (fullscreen)-gruppa av samme grunn som /admin/agencyos/live
 * — se den fila. Data, auth og server actions
 * (lastLiveOktData, live-okt-actions.ts) er urørt.
 */
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG13LiveOktNy, type LiveTekniskOppgave } from "@/components/admin/precision/AG13LiveOktNy";
import { prisma } from "@/lib/prisma";
import { hentLydSamtykkeStatus } from "@/lib/recording/lyd-samtykke";
import { pNavn } from "@/components/teknisk-plan/constants";
import { kanSeLiveOkt, lastLiveOktData } from "@/lib/agencyos/live-okt-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live-økt · AgencyOS" };

export default async function LiveOktPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { sessionId } = await params;
  if (!(await kanSeLiveOkt(user, sessionId))) notFound();
  const data = await lastLiveOktData(sessionId);
  if (!data) notFound();

  // Opptak krever lydsamtykke; HCP og aktiv oppgave i teknisk plan til spillerkortet.
  const spillerId = data.spillerId ?? null;
  const [sjekk, spiller, plan] = await Promise.all([
    spillerId ? hentLydSamtykkeStatus(spillerId) : Promise.resolve(null),
    spillerId ? prisma.user.findUnique({ where: { id: spillerId }, select: { hcp: true } }) : Promise.resolve(null),
    spillerId
      ? prisma.technicalPlan.findFirst({
          where: { userId: spillerId, status: "ACTIVE" },
          orderBy: { startDato: "desc" },
          select: { id: true, positions: { orderBy: { sortOrder: "asc" }, select: { pNummer: true, tasks: { where: { status: "ACTIVE" }, orderBy: { sortOrder: "asc" }, select: { tittel: true, repsMaalDry: true, repsMaalLav: true, repsMaalFull: true, repsGjortDry: true, repsGjortLav: true, repsGjortFull: true } } } } },
        })
      : Promise.resolve(null),
  ]);
  const pos = plan?.positions.find((p) => p.tasks.length > 0);
  const t = pos?.tasks[0];
  const maal = t ? t.repsMaalDry + t.repsMaalLav + t.repsMaalFull : 0;
  const oppgave: LiveTekniskOppgave | null = plan && pos && t
    ? { planId: plan.id, pNummer: pos.pNummer, posisjon: pNavn(pos.pNummer), tittel: t.tittel, gjort: t.repsGjortDry + t.repsGjortLav + t.repsGjortFull, maal: maal > 0 ? maal : null }
    : null;

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG13LiveOktNy data={data} samtykke={sjekk?.tillatt ? { tillatt: true } : { tillatt: false, status: sjekk && !sjekk.tillatt ? sjekk.status : "MANGLER" }} hcp={spiller?.hcp ?? null} oppgave={oppgave} />
    </AgencyOSSkall>
  );
}
