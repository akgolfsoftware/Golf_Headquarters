/**
 * PlayerHQ · Meg · Helse og fravær (/portal/meg/helse) — PH-24 i nytt design
 * (docs/design-system/utkast-playerhq/meg.html, skjermen «Helse og fravær»).
 *
 * Uten art. 9-samtykke leses ingen helsetall, og skjermen forklarer hvorfor.
 * Med samtykke: siste 14 dagers HealthEntry, fravær (Leave) siste fire uker og
 * fremover, FYS-score og belastning. Datoer formateres her (Oslo), så klient-
 * komponenten får ferdige tekster. Lagring er uendret (lagreHelseEntry).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harManuellHelseSamtykke } from "@/lib/health/samtykke";
import { prisma } from "@/lib/prisma";
import { hentFysScore } from "@/lib/fys-data";
import { hentBelastning } from "@/lib/health/belastning";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24Helse, type PH24HelseData, type PH24Fravaer } from "@/components/portal/precision/PH24Helse";
import { lagreHelseEntry } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Helse og fravær · PlayerHQ" };

const DAG = 24 * 60 * 60 * 1000;
const KORT = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", timeZone: "Europe/Oslo" });
const FRAVAER_NAVN: Record<string, string> = { SKADE: "Skade", SYKDOM: "Sykdom", REISE: "Reise", JOBB: "Jobb", STUDIER: "Studier", ANNET: "Annet" };

const TOM: PH24HelseData = {
  samtykke: false, dagerBorte: 0, fravaer: [], sistLogget: null, sovnSnitt: null, sovnAntall: 0, siste: null,
  belastningPst: null, fysScore: null, initial: { date: "", restingHr: null, hrv: null, sleepHours: null, weightKg: null, notes: null },
};

export default async function HelsePage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });

  if (!(await harManuellHelseSamtykke(user.id))) {
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
        <PH24Helse data={TOM} lagre={lagreHelseEntry} />
      </PlayerHQSkall>
    );
  }

  const na = new Date();
  const since = new Date(na);
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 13);
  const fireUker = new Date(na.getTime() - 28 * DAG);

  const [entries, leaves, fys, belastning] = await Promise.all([
    prisma.healthEntry.findMany({ where: { userId: user.id, date: { gte: since } }, orderBy: { date: "desc" } }),
    prisma.leave.findMany({
      where: { userId: user.id, OR: [{ endAt: null }, { endAt: { gte: fireUker } }] },
      orderBy: { startAt: "desc" },
      take: 6,
      select: { id: true, reason: true, startAt: true, endAt: true, returnedAt: true, isInjury: true, description: true },
    }),
    hentFysScore(user.id),
    hentBelastning(user.id),
  ]);

  const ukeGrense = new Date(na);
  ukeGrense.setUTCHours(0, 0, 0, 0);
  ukeGrense.setUTCDate(ukeGrense.getUTCDate() - 6);
  const sovnUke = entries.filter((e): e is typeof e & { sleepHours: number } => e.sleepHours !== null && e.date >= ukeGrense);
  const siste = entries[0];

  const dagerBorte = leaves.reduce((sum, l) => {
    const fra = Math.max(l.startAt.getTime(), fireUker.getTime());
    const til = Math.min((l.returnedAt ?? l.endAt ?? na).getTime(), na.getTime());
    return til > fra ? sum + Math.ceil((til - fra) / DAG) : sum;
  }, 0);
  const fravaer: PH24Fravaer[] = leaves.map((l) => {
    const slutt = l.returnedAt ?? l.endAt;
    const status: PH24Fravaer["status"] = l.startAt > na ? "Planlagt" : slutt && slutt < na ? "Over" : "Pågår";
    return {
      id: l.id,
      tittel: l.description?.trim().slice(0, 80) || FRAVAER_NAVN[l.reason] || "Fravær",
      periode: `${FRAVAER_NAVN[l.reason] ?? "Fravær"} · ${KORT.format(l.startAt)}–${slutt ? KORT.format(slutt) : "pågår"}`,
      type: l.isInjury || l.reason === "SKADE" ? "skade" : l.reason === "SYKDOM" ? "sykdom" : "annet",
      status,
    };
  });

  const data: PH24HelseData = {
    samtykke: true,
    dagerBorte: Math.min(28, dagerBorte),
    fravaer,
    sistLogget: siste ? KORT.format(siste.date) : null,
    sovnSnitt: sovnUke.length ? sovnUke.reduce((s, e) => s + e.sleepHours, 0) / sovnUke.length : null,
    sovnAntall: sovnUke.length,
    siste: siste ? { restingHr: siste.restingHr, hrv: siste.hrv } : null,
    belastningPst: belastning.harData && belastning.prosentAvNormalt != null ? Math.round(belastning.prosentAvNormalt) : null,
    fysScore: fys.harTester && fys.score != null ? Math.round(fys.score) : null,
    initial: {
      date: na.toISOString().slice(0, 10),
      restingHr: siste?.restingHr ?? null,
      hrv: siste?.hrv ?? null,
      sleepHours: siste?.sleepHours ?? null,
      weightKg: siste?.weightKg ?? null,
      notes: siste?.notes ?? null,
    },
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH24Helse data={data} lagre={lagreHelseEntry} />
    </PlayerHQSkall>
  );
}
