import "server-only";
import { prisma } from "@/lib/prisma";
import { hentTurneringshistorikk } from "@/lib/portal/turneringshistorikk-data";
import { importerteRundeTall } from "./player-tool";
import { bandFraApproachRad, visningsnavnFraDataGolf } from "./tak";
import {
  egneRundeTall, historiskRundeSchema, proffSchema, lesValg,
  type HistoriskRunde, type Proff,
} from "./player-tool";

export async function hentProffer(): Promise<Proff[]> {
  const raw = await prisma.$queryRaw<unknown[]>`
    select distinct on (s.dg_id) s.dg_id as "dgId", p.name, p.country_iso3 as country,
      s.as_of as "asOf", s.sg_total as total, s.sg_ott as ott, s.sg_app as app,
      s.sg_arg as arg, s.sg_putt as putt, s.driving_dist_y as distance, s.driving_acc_pct as accuracy
    from dashboard.dg_skill_ratings s join dashboard.dg_players p on p.dg_id = s.dg_id
    order by s.dg_id, s.as_of desc, s.id desc
    limit 2000
  `;
  return raw.flatMap(row => {
    const parsed = proffSchema.safeParse(row);
    if (!parsed.success) return [];
    const p = parsed.data;
    return [{ ...p, name: visningsnavnFraDataGolf(p.name), asOf: p.asOf.toISOString() }];
  }).sort((a, b) => (b.total ?? -Infinity) - (a.total ?? -Infinity) || a.name.localeCompare(b.name, "nb"));
}

export async function hentProffRunder(dgId: number, limit: number): Promise<HistoriskRunde[]> {
  if (!Number.isSafeInteger(dgId) || dgId <= 0) return [];
  const antall = Math.max(1, Math.min(50, Math.trunc(limit) || 24));
  const raw = await prisma.$queryRaw<unknown[]>`
    select r.event_id as "eventId", e.name as "eventName", e.start_date as date,
      e.tour_code as tour, r.round_num as round, r.course_id as "courseId",
      r.score, r.to_par as "toPar", r.finish_pos as position, r.made_cut as "madeCut",
      s.sg_total as total, s.sg_ott as ott, s.sg_app as app, s.sg_arg as arg, s.sg_putt as putt,
      s.driving_dist_y as distance, s.driving_acc_pct as accuracy, s.gir_pct as gir,
      r.created_at as "importedAt"
    from dashboard.dg_rounds r join dashboard.dg_events e on e.id = r.event_id
    left join dashboard.dg_round_sg s on s.round_id = r.id
    where r.dg_id = ${dgId} and r.score_type = 'brutto'
    order by e.start_date desc nulls last, e.year desc, e.id desc, r.round_num desc, r.id desc
    limit ${antall}
  `;
  return raw.flatMap(row => {
    const parsed = historiskRundeSchema.safeParse(row);
    if (!parsed.success) return [];
    const r = parsed.data;
    return [{ ...r, date: r.date?.toISOString() ?? null, importedAt: r.importedAt.toISOString() }];
  });
}

export async function hentSpillerverktoy(userId: string, sp: Record<string, string | string[] | undefined>) {
  const valg = lesValg(sp);
  const [profferResult, user, egne, taker, turneringshistorikk] = await Promise.all([
    hentProffer().then(data => ({ data, failed: false })).catch(() => ({ data: [] as Proff[], failed: true })),
    prisma.user.findUnique({ where: { id: userId }, select: { publicPlayer: { select: { dataGolfId: true } } } }),
    prisma.round.findMany({ where: { userId }, orderBy: [{ playedAt: "desc" }, { id: "desc" }], take: valg.runder,
      select: { score: true, playedAt: true, holeScores: { select: { holeNumber: true, par: true, strokes: true, fairway: true, gir: true } } } }),
    prisma.datagolfTak.findMany({ where: { isActive: true }, include: { bands: true }, orderBy: { sortOrder: "asc" } }),
    hentTurneringshistorikk(userId),
  ]);
  // Offentlig tak-pakke er reserve ved utilgjengelig historisk kilde.
  const proffer = profferResult.data.length ? profferResult.data : taker.map(t => ({
    dgId: t.dgPlayerId, name: t.name, country: t.country, asOf: t.asOf.toISOString(),
    total: null, ott: null, app: null, arg: null, putt: null,
    distance: null, accuracy: null,
  }));
  const proff = proffer.find(p => p.dgId === valg.pro) ?? proffer[0] ?? null;
  const mot = proffer.find(p => p.dgId === valg.mot && p.dgId !== proff?.dgId) ?? null;
  const egenDgId = user?.publicPlayer?.dataGolfId ?? null;
  const ids = [...new Set([proff?.dgId, mot?.dgId, egenDgId].filter((id): id is number => id != null))];
  const rundeResultater = await Promise.all(ids.map(async id => {
    try { return { id, data: await hentProffRunder(id, valg.runder), failed: false }; }
    catch { return { id, data: [] as HistoriskRunde[], failed: true }; }
  }));
  const runder = (id: number | null | undefined) => rundeResultater.find(r => r.id === id)?.data ?? [];
  const approach = (id: number | undefined) => {
    const t = taker.find(t => t.dgPlayerId === id);
    return t ? { asOf: t.asOf.toISOString(), bands: t.bands.map(b => ({
      ...b, band: b.band as ReturnType<typeof bandFraApproachRad>[number]["band"],
      lie: b.lie as "fairway" | "rough",
    })) } : null;
  };
  const egneTall = egneRundeTall(egne);
  const importerteTall = importerteRundeTall(turneringshistorikk.aar.flatMap(a => a.turneringer), valg.runder);

  return {
    proffer, proff, mot, valg, egenSkill: proffer.find(p => p.dgId === egenDgId) ?? null,
    proffRunder: runder(proff?.dgId), motRunder: runder(mot?.dgId), egneDgRunder: runder(egenDgId),
    egne: egneTall.count ? egneTall : importerteTall, egneRegistrert: egne.length,
    egneKilde: egneTall.count ? "Egne registrerte runder" : "GolfBox-turneringsrunder",
    approach: approach(proff?.dgId), motApproach: approach(mot?.dgId),
    kildefeil: profferResult.failed || rundeResultater.some(r => r.failed),
    turneringshistorikk,
  };
}
export type SpillerverktoyData = Awaited<ReturnType<typeof hentSpillerverktoy>>;
