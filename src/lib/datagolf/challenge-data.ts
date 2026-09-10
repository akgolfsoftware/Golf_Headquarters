import "server-only";
import { prisma } from "@/lib/prisma";
import { hentStasjonSide } from "./stasjon-data";
import { gyldigStart, lesUtfordring, utfordringInput } from "./challenge";

export async function hentUtfordringer(userId: string) {
  const logs = await prisma.trainingPlanSessionLog.findMany({
    where: { session: { planId: `datagolf-praksis-${userId}`, plan: { userId } } },
    orderBy: { completedAt: "desc" }, take: 20,
    select: { sessionId: true, drillAggregates: true },
  });
  return logs.flatMap(log => {
    const data = lesUtfordring(log.drillAggregates);
    return data ? [{ id: log.sessionId, ...data }] : [];
  });
}

/** Eierskap kommer kun fra innlogget bruker. Én attemptId gir én lagret økt. */
export async function lagreUtfordringForBruker(userId: string, input: unknown) {
  const parsed = utfordringInput.safeParse(input);
  if (!parsed.success) return { ok: false as const, message: "Registrer alle 10 ballene og kontroller avstanden." };
  const v = parsed.data;
  const now = new Date();
  const id = `dg-${userId}-${v.attemptId}`;
  const sammeResultat = (raw: unknown) => {
    const r = lesUtfordring(raw);
    return r && r.tak === v.tak && r.slag === v.slag && r.carry === v.carry && r.lie === v.lie &&
      r.target === v.target && r.inne === v.baller.filter(b => b === "inne").length;
  };
  const konflikt = { ok: false as const, message: "Denne økten er allerede lagret med et annet resultat. Start en ny økt." };
  const existing = await prisma.trainingPlanSession.findFirst({ where: { id, plan: { userId } },
    select: { id: true, log: { select: { drillAggregates: true } } } });
  if (existing) return sammeResultat(existing.log?.drillAggregates) ? { ok: true as const, id: existing.id } : konflikt;
  if (!gyldigStart(v.startedAt, now)) return { ok: false as const, message: "Økten er utløpt. Start en ny økt." };
  const { stasjon, valgtTak } = await hentStasjonSide({ takParam: String(v.tak), slagParam: v.slag,
    carryParam: v.carry === null ? null : String(v.carry), lieParam: v.lie });
  if (!stasjon || valgtTak?.dgPlayerId !== v.tak || stasjon.kilde === "mangler" || stasjon.manglerCarry)
    return { ok: false as const, message: "Referansen mangler for denne utfordringen." };
  if (stasjon.maalVerdi !== v.target)
    return { ok: false as const, message: "Referansen er oppdatert. Last siden på nytt før du starter en ny økt." };
  const startedAt = new Date(v.startedAt);
  const durationSec = Math.round((now.getTime() - startedAt.getTime()) / 1000);
  const resultat = {
    version: 1, tak: v.tak, name: valgtTak.name, slag: v.slag, carry: v.carry, lie: v.lie,
    target: stasjon.maalVerdi, unit: stasjon.maalEnhet, source: stasjon.kilde, sourceText: stasjon.kildeTekst,
    inne: v.baller.filter(b => b === "inne").length, total: 10, completedAt: now.toISOString(),
  };
  const planId = `datagolf-praksis-${userId}`;
  const saved = await prisma.$transaction(async tx => {
    // Egen historikkplan påvirker ikke spillerens aktive treningsplan.
    await tx.trainingPlan.upsert({ where: { id: planId }, update: {}, create: {
      id: planId, userId, name: "DataGolf · prøv selv", startDate: now, isActive: false, status: "ARCHIVED",
    } });
    return tx.trainingPlanSession.upsert({ where: { id }, update: {}, select: { log: { select: { drillAggregates: true } } }, create: {
      id, planId, title: `${stasjon.slag.etikett} · prøv selv`, scheduledAt: startedAt,
      durationMin: Math.ceil(durationSec / 60), pyramidArea: "SLAG", status: "COMPLETED",
      rationale: stasjon.regel, pPosisjoner: [],
      log: { create: { startedAt, completedAt: now, totalReps: 10,
        notes: `${resultat.inne} av 10 innenfor treningsmålet. ${stasjon.kildeTekst}`,
        drillAggregates: [{ drillId: id, repsTotal: 10, elapsedSec: durationSec, datagolf: resultat }],
      } },
    } });
  });
  return sammeResultat(saved.log?.drillAggregates) ? { ok: true as const, id } : konflikt;
}
