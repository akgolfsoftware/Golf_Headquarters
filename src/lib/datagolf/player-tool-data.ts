import "server-only";
import { prisma } from "@/lib/prisma";
import { hentTurneringshistorikk } from "@/lib/portal/turneringshistorikk-data";
import { importerteRundeTall } from "./player-tool";
import { bandFraApproachRad, visningsnavnFraDataGolf } from "./tak";
import {
  egneRundeTall, historiskRundeSchema, proffSchema, lesValg,
  type HistoriskRunde, type Proff,
} from "./player-tool";

export type DataGolfKildestatus = "tilgjengelig" | "tom" | "ikke-konfigurert" | "feil";
type Kilderesultat<T> = { data: T[]; status: DataGolfKildestatus };

// Prisma kan pakke SQLSTATE i meta.driverAdapterError.cause.
// Bare manglende tabell/schema betyr manglende datasett; ikke rettighets-,
// kolonne- eller nettverksfeil. Feiltekst og databaseadresser sendes aldri til UI.
function manglerDatasett(error: unknown, sett = new Set<object>()): boolean {
  if (!error || typeof error !== "object" || sett.has(error) || sett.size >= 12) return false;
  sett.add(error);
  const e = error as Record<string, unknown>;
  if ([e.code, e.originalCode].some(code => code === "42P01" || code === "3F000")) return true;
  return [e.meta, e.cause, e.driverAdapterError].some(neste => manglerDatasett(neste, sett));
}
async function lesKilde<T>(hent: () => Promise<T[]>): Promise<Kilderesultat<T>> {
  try {
    const data = await hent();
    return { data, status: data.length ? "tilgjengelig" : "tom" };
  } catch (error) {
    return { data: [], status: manglerDatasett(error) ? "ikke-konfigurert" : "feil" };
  }
}

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
    if (!parsed.success) throw new Error("Ugyldige DataGolf-kildedata");
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
    if (!parsed.success) throw new Error("Ugyldige DataGolf-kildedata");
    const r = parsed.data;
    return [{ ...r, date: r.date?.toISOString() ?? null, importedAt: r.importedAt.toISOString() }];
  });
}

export async function hentSpillerverktoy(userId: string, sp: Record<string, string | string[] | undefined>) {
  const valg = lesValg(sp);
  const [profferResult, user, egne, taker, turneringshistorikk] = await Promise.all([
    lesKilde(hentProffer),
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
  const proff = proffer.find(p => p.dgId === valg.pro) ?? proffer.at(0) ?? null;
  const mot = proffer.find(p => p.dgId === valg.mot && p.dgId !== proff?.dgId) ?? null;
  const egenDgId = user?.publicPlayer?.dataGolfId ?? null;
  const ids = [...new Set([proff?.dgId, mot?.dgId, egenDgId].filter((id): id is number => id != null))];
  const rundeResultater = await Promise.all(ids.map(async id => {
    return { id, ...await lesKilde(() => hentProffRunder(id, valg.runder)) };
  }));
  const runder = (id: number | null | undefined) => rundeResultater.find(r => r.id === id)?.data ?? [];
  const rundestatus = (id: number | null | undefined): DataGolfKildestatus | null =>
    rundeResultater.find(r => r.id === id)?.status ?? null;
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
    kildestatus: {
      profiler: profferResult.status,
      proffRunder: rundestatus(proff?.dgId),
      motRunder: rundestatus(mot?.dgId),
      egneDgRunder: rundestatus(egenDgId),
    },
    brukerTakReserve: !profferResult.data.length && taker.length > 0,
    kildefeil: profferResult.status === "feil" || rundeResultater.some(r => r.status === "feil"),
    turneringshistorikk,
  };
}
export type SpillerverktoyData = Awaited<ReturnType<typeof hentSpillerverktoy>>;
