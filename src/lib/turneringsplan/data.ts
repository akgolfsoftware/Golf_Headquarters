/**
 * Turneringsplanleggeren: leser WAGR-katalogen, spillerens nivå og plan, og regner ut
 * sjanser og WAGR-anslag. Kalles bare med en databaseklient som tilgangsporten har gitt
 * (`medSpillerTilgang` eller `medTnSpillerData`), så organisasjonstrenere leser under
 * delingslåsen. Bare WAGR-data; GolfBox-score og DataGolf brukes ikke.
 */
import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { vurderAlder } from "./alder";
import {
  lagForslag, simulerSesong, stadiumFor, vurder,
  type Felt, type Kjonn, type Merke, type PlanTier, type Sesonganslag, type Tellende, type Vurdering, type WagrModell,
} from "./wagr-modell";

type Db = Prisma.TransactionClient;
export const SESONG = 2027;
const SLUTT = `${SESONG}-12-26`;
const REGIONER = new Set(["Europe", "North America"]);
const UTELATTE_TYPER = new Set(["College", "Lag"]);
export const FORSLAG_TYPE = "TOURNAMENT_PLAN_PROPOSAL";

const FeltSchema = z.object({ q: z.array(z.number()), n: z.number(), r: z.number() });
const ModellSchema = z.object({
  sigma: z.number(), form: z.number(),
  pointsCurve: z.object({ plasser: z.array(z.number()), a: z.array(z.number()), b: z.array(z.number()) }),
  powerEdges: z.array(z.number()),
  fieldProfiles: z.record(z.string(), FeltSchema),
  rankingCurves: z.record(z.string(), z.array(z.tuple([z.number(), z.number()]))),
});
const TellendeSchema = z.array(z.tuple([z.number(), z.string(), z.number()]));
export const ForslagSchema = z.object({
  versjon: z.literal(1), kind: z.literal("TOURNAMENT"), organisasjon: z.literal("TEAM_NORWAY"),
  handling: z.enum(["ADD", "REMOVE"]), wagrPlanEventId: z.string().min(1), begrunnelse: z.string().max(1000),
}).strict();
export type TurneringsForslag = z.infer<typeof ForslagSchema>;

export type KatalogRad = {
  id: string; wagrEventId: number; navn: string; d: string; dager: number; sikker: boolean;
  land: string | null; bane: string | null; power: number | null; type: string | null; serie: string | null;
  wagr: string; alder: string | null; aldersvarsel: string | null;
  v: { p1: number; p10: number; ep: number; poeng: number; merke: Merke; anslattFelt: boolean } | null;
};
export type PlanRad = {
  entryId: string; tier: PlanTier; status: string; statusTekst: string;
  /** WAGR-turnering med tall, eller en turnering fra GolfBox-kalenderen uten WAGR-tall. */
  rad: KatalogRad | null; navn: string; d: string | null; tournamentId: string | null;
};
export type ForslagRad = {
  id: string; handling: "ADD" | "REMOVE"; trener: string; opprettet: string; begrunnelse: string; rad: KatalogRad;
};
export type Planvisning = {
  spiller: { id: string; fornavn: string; etternavn: string; rang: number | null; snitt: number | null; runder: number; harNivaa: boolean };
  stadium: { navn: string; mal: Record<Merke, number> } | null;
  katalog: KatalogRad[]; plan: PlanRad[]; forslag: ForslagRad[];
  anslag: Sesonganslag | null; laget: string | null; modellMangler: boolean;
};

const STATUS: Record<string, string> = {
  PLANNED: "På planen", CLAIMED_REGISTERED: "Påmeldt, venter", CONFIRMED: "Påmeldt", COMPLETED: "Gjennomført",
};
const asTier = (v: string | null | undefined): PlanTier => (v === "A" || v === "C" ? v : "B");
const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Nyeste modellkjøring for sesongen. */
async function hentModell(db: Db) {
  const run = await db.wagrModelRun.findFirst({ where: { season: SESONG }, orderBy: [{ builtAt: "desc" }, { createdAt: "desc" }] });
  if (!run) return null;
  const m = ModellSchema.safeParse({
    sigma: run.sigma, form: run.form, pointsCurve: run.pointsCurve, powerEdges: run.powerEdges,
    fieldProfiles: run.fieldProfiles, rankingCurves: run.rankingCurves,
  });
  return m.success ? { id: run.id, builtAt: iso(run.builtAt), modell: m.data as WagrModell } : null;
}

/** Spillerens nivå: koblet via public_players."wagrId". Null når spilleren ikke er koblet. */
async function hentNivaa(db: Db, spillerId: string, runId: string) {
  const u = await db.user.findUnique({ where: { id: spillerId }, select: { name: true, dateOfBirth: true, publicPlayer: { select: { wagrId: true, birthYear: true } } } });
  if (!u) return null;
  const wagrId = Number(u.publicPlayer?.wagrId);
  const s = Number.isInteger(wagrId) && wagrId > 0
    ? await db.wagrPlayerStrength.findUnique({ where: { modelRunId_wagrPlayerId: { modelRunId: runId, wagrPlayerId: wagrId } } })
    : null;
  const tellende = s ? TellendeSchema.safeParse(s.counting) : null;
  return {
    navn: u.name ?? "Spiller", fodselsdato: u.dateOfBirth, fodselsaar: u.publicPlayer?.birthYear ?? null,
    styrke: s && s.theta != null ? {
      wagrId, theta: s.theta, kj: (s.gender === "K" ? "K" : "M") as Kjonn, runder: s.rounds, rang: s.rank, snitt: s.pointsAvg,
      tellende: (tellende?.success ? tellende.data : []) as Tellende[],
    } : null,
  };
}

// Sjanser for hele katalogen tar noen hundre millisekunder; samme kjøring og spiller gir samme tall.
const VURDERINGER = new Map<string, Map<number, Vurdering | null>>();
function vurderinger(runId: string, wagrId: number): Map<number, Vurdering | null> {
  const k = `${runId}:${wagrId}`;
  let v = VURDERINGER.get(k);
  if (!v) {
    if (VURDERINGER.size > 200) VURDERINGER.clear();
    v = new Map();
    VURDERINGER.set(k, v);
  }
  return v;
}

type EventRad = Awaited<ReturnType<typeof hentKatalog>>[number];
async function hentKatalog(db: Db, fra: string) {
  return db.wagrPlanEvent.findMany({
    where: { season: SESONG, startDate: { gte: new Date(`${fra}T00:00:00Z`) } },
    orderBy: { startDate: "asc" },
  });
}
const feltAv = (raw: Prisma.JsonValue | null): Felt | null => { const f = FeltSchema.safeParse(raw); return f.success ? f.data : null; };

/** Bygger hele visningen for én spiller. `db` må komme fra tilgangsporten. */
export async function byggPlanvisning(db: Db, spillerId: string, idag = new Date()): Promise<Planvisning | null> {
  const modell = await hentModell(db);
  const fra = iso(idag) > `${SESONG}-01-01` ? iso(idag) : `${SESONG}-01-01`;
  const [nivaa, entries, forslagRader] = await Promise.all([
    modell ? hentNivaa(db, spillerId, modell.id) : db.user.findUnique({ where: { id: spillerId }, select: { name: true, dateOfBirth: true } })
      .then((u) => (u ? { navn: u.name ?? "Spiller", fodselsdato: u.dateOfBirth, fodselsaar: null, styrke: null } : null)),
    db.tournamentEntry.findMany({
      where: { userId: spillerId, entryStatus: { in: ["PLANNED", "CLAIMED_REGISTERED", "CONFIRMED"] } },
      select: {
        id: true, planTier: true, entryStatus: true, manualName: true, manualDate: true, wagrPlanEventId: true,
        tournament: { select: { id: true, name: true, startDate: true } }, wagrPlanEvent: true,
      },
    }),
    db.planAction.findMany({
      where: { userId: spillerId, actionType: FORSLAG_TYPE, status: "PENDING" },
      orderBy: { createdAt: "desc" }, take: 40,
      select: { id: true, suggestion: true, createdAt: true, coach: { select: { name: true } } },
    }),
  ]);
  if (!nivaa) return null;
  const [fornavn, ...rest] = nivaa.navn.trim().split(/\s+/);
  const styrke = nivaa.styrke;
  const katalogRader = modell ? await hentKatalog(db, fra) : [];
  const cache = modell && styrke ? vurderinger(modell.id, styrke.wagrId) : null;

  const tilRad = (e: EventRad): KatalogRad => {
    let v: Vurdering | null = null;
    if (modell && styrke && cache) {
      if (!cache.has(e.wagrEventId)) cache.set(e.wagrEventId, vurder(modell.modell, styrke.theta, styrke.kj, { wagrEventId: e.wagrEventId, field: feltAv(e.field), power: e.power }));
      v = cache.get(e.wagrEventId) ?? null;
    }
    const d = iso(e.startDate);
    const alder = vurderAlder(e.ageLimit, d, nivaa);
    return {
      id: e.id, wagrEventId: e.wagrEventId, navn: e.name, d, dager: e.days, sikker: !e.dateEstimated,
      land: e.country, bane: e.course, power: e.power, type: e.eventType, serie: e.series, wagr: e.wagrUrl,
      alder: e.ageLimit, aldersvarsel: alder.status === "sjekk" ? alder.tekst : null, v,
    };
  };
  const passer = (e: EventRad) => {
    if (!REGIONER.has(e.region ?? "") || UTELATTE_TYPER.has(e.eventType ?? "")) return false;
    if (styrke && !e.genders.includes(styrke.kj)) return false;
    return vurderAlder(e.ageLimit, iso(e.startDate), nivaa).status !== "for-gammel";
  };
  const katalog = katalogRader.filter(passer).map(tilRad);
  const iKatalog = new Map(katalog.map((k) => [k.id, k]));

  const plan: PlanRad[] = entries.map((e) => {
    const rad = e.wagrPlanEvent ? (iKatalog.get(e.wagrPlanEvent.id) ?? tilRad(e.wagrPlanEvent)) : null;
    const d = rad?.d ?? (e.tournament ? iso(e.tournament.startDate) : e.manualDate ? iso(e.manualDate) : null);
    return {
      entryId: e.id, tier: asTier(e.planTier), status: e.entryStatus, statusTekst: STATUS[e.entryStatus] ?? e.entryStatus,
      rad, navn: rad?.navn ?? e.tournament?.name ?? e.manualName ?? "Turnering", d, tournamentId: e.tournament?.id ?? null,
    };
  }).filter((p) => !p.d || p.d >= iso(idag)).sort((a, b) => (a.d ?? "9") < (b.d ?? "9") ? -1 : 1);

  const forslag: ForslagRad[] = [];
  for (const f of forslagRader) {
    const p = ForslagSchema.safeParse(f.suggestion);
    if (!p.success) continue;
    const rad = iKatalog.get(p.data.wagrPlanEventId)
      ?? await db.wagrPlanEvent.findUnique({ where: { id: p.data.wagrPlanEventId } }).then((e) => (e ? tilRad(e) : null));
    if (rad) forslag.push({ id: f.id, handling: p.data.handling, trener: f.coach?.name ?? "Trener", opprettet: f.createdAt.toISOString(), begrunnelse: p.data.begrunnelse, rad });
  }

  const wagrPlan = plan.flatMap((p) => (p.rad && p.rad.d.startsWith(String(SESONG)) ? [p.rad] : []));
  const eventer = new Map(katalogRader.map((e) => [e.id, e]));
  for (const e of entries) if (e.wagrPlanEvent) eventer.set(e.wagrPlanEvent.id, e.wagrPlanEvent);
  const anslag = modell && styrke && wagrPlan.length
    ? simulerSesong(modell.modell, { seed: styrke.wagrId, theta: styrke.theta, kj: styrke.kj, tellende: styrke.tellende },
      wagrPlan.map((r) => { const e = eventer.get(r.id)!; return { d: r.d, field: feltAv(e.field), power: e.power }; }), SLUTT)
    : null;
  const stadium = modell && styrke ? stadiumFor(modell.modell, styrke.theta, styrke.kj) : null;

  return {
    spiller: { id: spillerId, fornavn: fornavn ?? "", etternavn: rest.join(" "), rang: styrke?.rang ?? null, snitt: styrke?.snitt ?? null, runder: styrke?.runder ?? 0, harNivaa: Boolean(styrke) },
    stadium: stadium ? { navn: stadium.navn, mal: stadium.mal } : null,
    katalog, plan, forslag, anslag, laget: modell?.builtAt ?? null, modellMangler: !modell,
  };
}

/** Forslag til plan for spilleren: de WAGR-turneringene som ikke alt står i planen. */
export async function forslagTilPlan(db: Db, spillerId: string): Promise<{ id: string; tier: PlanTier }[]> {
  const v = await byggPlanvisning(db, spillerId);
  if (!v || !v.stadium) return [];
  const iPlan = new Set(v.plan.flatMap((p) => (p.rad ? [p.rad.id] : [])));
  const kand = v.katalog.filter((k) => k.v && !iPlan.has(k.id))
    .map((k) => ({ ev: { id: k.id, d: k.d, power: k.power, country: k.land, eventType: k.type }, v: k.v as Vurdering }));
  const opptatt = v.plan.filter((p) => p.rad).length;
  return lagForslag(kand, { id: "", fra: 0, til: 0, ...v.stadium }, Math.max(0, 14 - opptatt)).map((x) => ({ id: x.ev.id, tier: x.tier }));
}

