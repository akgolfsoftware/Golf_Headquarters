import "server-only";
import { prisma } from "@/lib/prisma";
import { hentDataGolfBruker } from "@/lib/auth/datagolf-tilgang";
import { visningsnavnFraDataGolf } from "./tak";
import { approachRadSchema, sgRundeRadSchema, spillerKortRadSchema, tourDekningRadSchema } from "./komponent-skjema";
import type { ApproachRaa, DgResultat, DgSgRunde, SpillerKortData, TourDekningRad } from "./visning";

/**
 * Datalag for Data Golf-komponentene. Lisensregel: tallene er personlig bakgrunn og vises aldri
 * til andre. Hver funksjon her sjekker derfor tilgangen selv (bare ADMIN, fail-closed)
 * og returnerer «ingen-tilgang» uten å røre databasen. Sider skal i tillegg ha sidevakten
 * `krevDataGolfBruker`; denne sjekken er et siste bolverk, ikke en erstatning.
 */

// Samme regel som player-tool-data: bare manglende tabell/schema betyr «ikke konfigurert».
function manglerDatasett(error: unknown, sett = new Set<object>()): boolean {
  if (!error || typeof error !== "object" || sett.has(error) || sett.size >= 12) return false;
  sett.add(error);
  const e = error as Record<string, unknown>;
  if ([e.code, e.originalCode].some(code => code === "42P01" || code === "3F000")) return true;
  return [e.meta, e.cause, e.driverAdapterError].some(neste => manglerDatasett(neste, sett));
}

async function medTilgang<T>(hent: () => Promise<T | null>): Promise<DgResultat<T>> {
  // Strengere enn Data Golf-porten (COACH + ADMIN): lisensen er personlig, så bare ADMIN.
  const bruker = await hentDataGolfBruker();
  if (bruker?.role !== "ADMIN") return { tilstand: "ingen-tilgang" };
  try {
    const data = await hent();
    const tom = data === null || (Array.isArray(data) && data.length === 0);
    return tom ? { tilstand: "tom" } : { tilstand: "klar", data: data as T };
  } catch (error) {
    return { tilstand: manglerDatasett(error) ? "ikke-konfigurert" : "feil" };
  }
}

const gyldigId = (id: number) => Number.isSafeInteger(id) && id > 0;
const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

/** Siste `antall` bruttorunder med SG, nyeste først i databasen (komponenten sorterer selv). */
export function hentSgRunder(dgId: number, antall = 60): Promise<DgResultat<DgSgRunde[]>> {
  return medTilgang(async () => {
    if (!gyldigId(dgId)) return null;
    const grense = Math.max(1, Math.min(300, Math.trunc(antall) || 60));
    const raw = await prisma.$queryRaw<unknown[]>`
      select r.id, e.start_date as dato, e.tour_code as tour, e.name as arrangement, r.round_num as runde,
        s.sg_total as total, s.sg_ott as ott, s.sg_app as app, s.sg_arg as arg, s.sg_putt as putt
      from dashboard.dg_rounds r
      join dashboard.dg_events e on e.id = r.event_id
      left join dashboard.dg_round_sg s on s.round_id = r.id
      where r.dg_id = ${dgId} and r.score_type = 'brutto'
      order by e.start_date desc nulls last, r.round_num desc, r.id desc
      limit ${grense}
    `;
    return raw.map(row => {
      const r = sgRundeRadSchema.parse(row);
      return { ...r, dato: iso(r.dato) };
    });
  });
}

/** Dekning per tour: antall brutto-runder, hvor mange som har SG total og alle fire kategoriene. */
export function hentTourDekning(): Promise<DgResultat<TourDekningRad[]>> {
  return medTilgang(async () => {
    const raw = await prisma.$queryRaw<unknown[]>`
      select e.tour_code as tour, count(*)::int as "antallRunder",
        count(s.sg_total)::int as "medTotal",
        count(*) filter (where s.sg_ott is not null and s.sg_app is not null
          and s.sg_arg is not null and s.sg_putt is not null)::int as "medKategori",
        min(e.year)::int as "fraAar", max(e.year)::int as "tilAar"
      from dashboard.dg_rounds r
      join dashboard.dg_events e on e.id = r.event_id
      left join dashboard.dg_round_sg s on s.round_id = r.id
      where r.score_type = 'brutto'
      group by e.tour_code
      order by count(*) desc
    `;
    return raw.map(row => tourDekningRadSchema.parse(row));
  });
}

/** Siste approach-skill-rad (kildebøttene som jsonb) for én spiller. */
export function hentApproachRaa(dgId: number): Promise<DgResultat<ApproachRaa>> {
  return medTilgang(async () => {
    if (!gyldigId(dgId)) return null;
    const raw = await prisma.$queryRaw<unknown[]>`
      select as_of as "asOf", period, payload
      from dashboard.dg_approach_skill_raw
      where dg_id = ${dgId}
      order by as_of desc, period
      limit 1
    `;
    if (!raw.length) return null;
    const r = approachRadSchema.parse(raw[0]);
    return { asOf: iso(r.asOf) ?? "", period: r.period, payload: r.payload };
  });
}

export function hentSpillerKort(dgId: number): Promise<DgResultat<SpillerKortData>> {
  return medTilgang(async () => {
    if (!gyldigId(dgId)) return null;
    const raw = await prisma.$queryRaw<unknown[]>`
      select p.dg_id as "dgId", p.name as navn, p.country_iso3 as land, p.birth_year as fodselsaar, p.amateur as amator,
        s.dg_rank as "dgRang", s.owgr_rank as "owgrRang", s.primary_tour as "primaerTour",
        s.sg_total as "sgTotal", s.as_of as kildedato,
        (select count(*)::int from dashboard.dg_rounds r where r.dg_id = p.dg_id and r.score_type = 'brutto') as "antallRunder",
        (select min(e.year)::int from dashboard.dg_rounds r join dashboard.dg_events e on e.id = r.event_id
          where r.dg_id = p.dg_id and r.score_type = 'brutto') as "fraAar",
        (select max(e.year)::int from dashboard.dg_rounds r join dashboard.dg_events e on e.id = r.event_id
          where r.dg_id = p.dg_id and r.score_type = 'brutto') as "tilAar"
      from dashboard.dg_players p
      left join lateral (
        select * from dashboard.dg_skill_ratings x where x.dg_id = p.dg_id order by x.as_of desc, x.id desc limit 1
      ) s on true
      where p.dg_id = ${dgId}
    `;
    if (!raw.length) return null;
    const r = spillerKortRadSchema.parse(raw[0]);
    return {
      ...r,
      navn: visningsnavnFraDataGolf(r.navn),
      amator: r.amator ?? false,
      norsk: r.land === "NOR",
      kildedato: iso(r.kildedato),
    };
  });
}
