// PlayerHQ Én turnering — Precision Athletics, pakke 17 (utkast plan-hjelpere.html, 16.10.2026).
/**
 * Fakta fra GolfBox, påmelding (to trykk, spilleransvar), prioritet A/B/C, turneringsrunde og
 * «Ta ut av planen». Fakta-radene bygges bare av ekte felter. Loader og handlinger er uendret.
 * Før 17.10 sendte en regel (tren-workbench-redirect.ts) denne adressen til Workbench.
 */
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getUnreadNotifications } from "@/app/portal/actions";
import { loadTurneringDetalj } from "@/lib/portal-turnering/turnering-detalj-data";
import { meldDegAv } from "@/app/portal/(legacy)/tren/turneringer/actions";
import { startTurneringsrunde } from "./actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHTurnering, type PHTurneringData } from "@/components/portal/precision/PHTurnering";

export const dynamic = "force-dynamic";
export const metadata = { title: "Turnering · PlayerHQ" };

export default async function TurneringDetaljPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) notFound();
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const [data, entryRad, uleste] = await Promise.all([
    loadTurneringDetalj(user.id, id),
    prisma.tournamentEntry.findFirst({ where: { userId: user.id, tournamentId: id }, select: { id: true } }),
    getUnreadNotifications(user.id, 1),
  ]);
  if (!data) notFound();

  const status: NonNullable<PHTurneringData["entry"]>["status"] = !data.entry || !data.entry.state.active
    ? "ANNEN"
    : data.entry.state.tone === "ok" ? "CONFIRMED" : data.entry.state.tone === "warn" ? "CLAIMED" : "PLANNED";

  const fakta: PHTurneringData["fakta"] = [{ k: "Når", v: data.dateLong }];
  if (data.venue) fakta.push({ k: "Bane", v: data.venue });
  if (data.format) fakta.push({ k: "Format", v: data.format });
  if (data.entry?.category) fakta.push({ k: "Klasse", v: data.entry.category });
  if (data.entryClosesLabel) fakta.push({ k: "Påmeldingsfrist", v: data.entryClosesLabel });
  if (data.recommendedLevel) fakta.push({ k: "Nivå", v: data.recommendedLevel });
  if (data.tour) fakta.push({ k: "Tour", v: data.tour });

  const pameldt = status === "CONFIRMED";
  const kanStarteRunde = pameldt && data.erRelevantNa && data.rundeBaneId != null && data.liveRunde == null;
  const startHjelp = data.liveRunde ? null
    : !pameldt ? "Kan startes når du er påmeldt."
    : !data.erRelevantNa ? `Kan startes på turneringsdagen, ${data.dateLong}.`
    : data.rundeBaneId == null ? "Banen mangler. Registrer runden fra hurtigknappen i stedet." : null;

  async function taUt() {
    "use server";
    const me = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
    const entry = await prisma.tournamentEntry.findFirst({ where: { userId: me.id, tournamentId: id }, select: { id: true } });
    if (entry) await meldDegAv(entry.id);
  }
  async function startRunde() {
    "use server";
    await startTurneringsrunde(id);
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PHTurnering
        data={{
          id: data.id, navn: data.name,
          undertittel: ["Turnering", data.entry ? `${data.entry.planTier}-turnering` : null, data.status.label].filter(Boolean).join(" · "),
          fakta, arrangorUrl: data.registrationUrl ?? data.officialUrl,
          entry: data.entry ? { id: entryRad?.id ?? null, status, tier: data.entry.planTier } : null,
          kanStarteRunde, startHjelp,
          runde: data.liveRunde ? { id: data.liveRunde.id, fort: data.liveRunde.fort, score: data.liveRunde.score, hull: data.liveRunde.hullAntall } : null,
          historikk: data.history.map((h) => ({ id: h.id, ar: h.year, plass: h.position, score: h.score })),
        }}
        handlinger={{ taUt, startRunde }}
      />
    </PlayerHQSkall>
  );
}
