import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { type Prisma } from "@/generated/prisma/client";
import { akFasilitetSchema, type AkFasilitet } from "./ak-bankfasilitet";
import { osloAar } from "@/lib/domain/brutto-snitt";
import { akNivaTurneringerSchema, beregnAkSpillerniva, type AkSpillerniva } from "./ak-spillerniva";
import { nivaProfilFunksjon, nivaKoblinger } from "@/lib/profil-kobling/niva-kilde";
import { canonicalJson } from "@/lib/agents/canonical-json";
import { parseSessionBudget } from "@/lib/workbench/perioder";
import type { AkGruppeoppdrag } from "./ak-gruppeoppdrag";
import { hentMedAkProfilBevis, brukMedSammeAkProfilBevis, type AkProfilBevis } from "./ak-profil-mellomlagring";

// A calendar Monday, represented as UTC midnight to match the stored planning
// dates. Never infer it using the machine's local weekday or setHours().
const uke = z.iso.date().refine(value => new Date(`${value}T00:00:00Z`).getUTCDay() === 1);
const id = z.string().min(1).max(200);
const revision = z.string().min(1);
const periode = z.object({ id, revisjon: revision, fase: z.string(), gruppeId: id.nullable(),
  budsjett: z.unknown(), minutter: z.unknown(), letteMinutter: z.unknown() });
const rad = z.object({
  hcp: z.number().nullable(), preferanser: z.unknown(),
  nivaKildeGyldig: z.literal(true), nivaTurneringer: akNivaTurneringerSchema, koblingsVersjoner: z.string().nullable(),
  fasiliteter: z.array(akFasilitetSchema.extend({ id, revisjon: revision })),
  planer: z.array(z.object({ id, revisjon: revision, coachId: id.nullable(), fra: z.string(), til: z.string().nullable() })).max(2),
  sesonger: z.array(z.object({ id, revisjon: revision })).max(2),
  perioder: z.array(periode).max(2),
  sg: z.array(z.object({ id, revisjon: revision, verdi: z.number().nullable(), omrade: z.unknown() })).max(5),
  turnering: z.object({ id, revisjon: revision, katalogRevisjon: revision.nullable(), dato: z.string() }).nullable(),
  fullforte: z.number().int().nonnegative(),
  oktVersjoner: z.string().nullable(), planOktVersjoner: z.string().nullable(),
  manedVersjoner: z.string().nullable(), ukeVersjoner: z.string().nullable(),
});
const preferanser = z.object({ okterPerUke: z.number().int().min(1).max(14).nullable().catch(null),
  dager: z.array(z.number().int().min(1).max(7)).max(7).catch([]) }).catch({ okterPerUke: null, dager: [] });
const sgOmrade = z.enum(["OTT", "APP", "ARG", "PUTT"]);

type Tx = Prisma.TransactionClient;
type UkeData = {
  planId: string;
  periodeId: string | null;
  budsjett: ReturnType<typeof parseSessionBudget>;
  harManedsEllerUkevalg: boolean;
  /** Local validation only; never part of the model payload. No names/notes. */
  fasiliteter: AkFasilitet[];
  niva: AkSpillerniva;
  modell: {
    context: { daysUntilTournament: number | null; completedSessions: number; sgWeaknesses: string[] };
    signals: { aktivFase: string | null; okterPerUke: number | null; foretrukneDager: number[] };
    category: AkSpillerniva["kategori"];
    categorySource: AkSpillerniva["kilde"];
  };
};
export const akUkeDatabevisSchema = z.object({ versjon: z.literal(1), uke: uke, planId: id,
  fingeravtrykk: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
export type AkUkegrunnlag = UkeData & { deling: AkProfilBevis; databevis: z.infer<typeof akUkeDatabevisSchema> };

/** Only called after the sharing locks and fresh access check. One SQL statement
 * selects a consistent, minimal snapshot, without names, notes or health fields.
 * Row revisions detect edit-and-restore, not just a different final field value.
 */
async function les(tx: Tx, spillerWhere: Prisma.UserWhereInput, jobb: AkGruppeoppdrag, ukeStart: string) {
  const spiller = await tx.user.findFirst({ where: spillerWhere, select: { id: true } });
  if (!spiller) return null;
  const start = new Date(`${ukeStart}T00:00:00Z`);
  const slutt = new Date(start.getTime() + 7 * 86_400_000);
  const fra = new Date(start.getTime() - 14 * 86_400_000);
  const rader = await tx.$queryRaw<unknown[]>`
    WITH profil AS MATERIALIZED (
      SELECT ${nivaProfilFunksjon}(${spiller.id}::text, false) AS data
    ), planer AS (
      SELECT p.id, p.xmin::text AS revisjon, p."createdById" AS "coachId", p."startDate" AS fra, p."endDate" AS til
      FROM training_plans p WHERE p."userId" = ${spiller.id} AND p."isActive" = true
      ORDER BY p.id LIMIT 2
    ), sesonger AS (
      SELECT s.id, s.xmin::text AS revisjon FROM season_plans s
      WHERE s."userId" = ${spiller.id} AND s."startDate" < ${slutt} AND s."endDate" >= ${start}
      ORDER BY s.id LIMIT 2
    ), perioder AS (
      SELECT p.id, p.xmin::text AS revisjon, p."lPhase"::text AS fase, p."sourceGroupId" AS "gruppeId",
        p."weeklySessionBudget" AS budsjett, p."axisMinutes" AS minutter, p."axisMinutesLight" AS "letteMinutter"
      FROM period_blocks p JOIN sesonger s ON s.id = p."seasonPlanId"
      WHERE p."startDate" < ${slutt} AND p."endDate" >= ${start} ORDER BY p.id LIMIT 2
    ), sg AS (
      SELECT s.id, s.xmin::text AS revisjon, s.value AS verdi, s.payload -> 'area' AS omrade
      FROM signals s WHERE s."userId" = ${spiller.id} AND s.kind = 'SG_AREA'
        AND s."computedAt" < ${slutt} ORDER BY s."computedAt" DESC, s.id DESC LIMIT 5
    ), neste AS (
      SELECT e.id, e.xmin::text AS revisjon,
        CASE WHEN e."tournamentId" IS NOT NULL THEN t.xmin::text
          WHEN e."wagrPlanEventId" IS NOT NULL THEN w.xmin::text END AS "katalogRevisjon",
        CASE WHEN e."tournamentId" IS NOT NULL THEN t."startDate"
          WHEN e."wagrPlanEventId" IS NOT NULL AND w."dateEstimated" = false THEN w."startDate"
          WHEN e."wagrPlanEventId" IS NULL THEN e."manualDate" END AS dato
      FROM tournament_entries e LEFT JOIN tournaments t ON t.id = e."tournamentId"
      LEFT JOIN wagr_plan_events w ON w.id = e."wagrPlanEventId"
      WHERE e."userId" = ${spiller.id} AND e."withdrawnAt" IS NULL
        AND e."entryStatus"::text IN ('PLANNED','CLAIMED_REGISTERED','CONFIRMED')
    )
    SELECT u.hcp, jsonb_build_object('okterPerUke',u.preferences #> '{trening,okterPerUke}',
      'dager',u.preferences #> '{trening,dager}') AS preferanser,
      (SELECT CASE WHEN p.data IS NULL THEN
          (SELECT count(*) = 0 FROM ${nivaKoblinger} l WHERE l.hq_user_id = u.id AND l.status = 'confirmed')
        ELSE (SELECT count(*) = 1 FROM ${nivaKoblinger} l WHERE l.hq_user_id = u.id AND l.status = 'confirmed')
          AND jsonb_typeof(p.data->'turneringer') = 'array'
          AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p.data->'turneringer') t
            WHERE jsonb_typeof(t) <> 'object' OR NOT (t ?& ARRAY['start_date','year','klasse','plassering','total_score','runder'])
              OR EXISTS (SELECT 1 FROM jsonb_array_elements(NULLIF(t->'runder','null'::jsonb)) r
                WHERE jsonb_typeof(r) <> 'object' OR NOT (r ?& ARRAY['runde','score']))) END
        FROM profil p) AS "nivaKildeGyldig",
      (SELECT md5(string_agg(l.id::text || ':' || l.xmin::text, ',' ORDER BY l.id))
        FROM ${nivaKoblinger} l WHERE l.hq_user_id = u.id) AS "koblingsVersjoner",
      (SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'start_date',t->'start_date','year',t->'year','klasse',t->'klasse',
        'plassering',t->'plassering','total_score',t->'total_score',
        'runder',CASE WHEN t->'runder' = 'null'::jsonb THEN NULL ELSE
          (SELECT COALESCE(jsonb_agg(jsonb_build_object('runde',r->'runde','score',r->'score') ORDER BY r->'runde'),'[]')
            FROM jsonb_array_elements(t->'runder') r) END
      ) ORDER BY t::text), '[]') FROM profil p, jsonb_array_elements(p.data->'turneringer') t) AS "nivaTurneringer",
      COALESCE((SELECT jsonb_agg(jsonb_build_object('id',f.id,'revisjon',f.xmin::text,
        'capabilities',f.capabilities,'type',f.type,'isIndoor',f."isIndoor",
        'rangeLengdeM',f."rangeLengdeM",'maksPuttLengdeM',f."maksPuttLengdeM")
        ORDER BY f.id) FROM player_facilities f WHERE f."userId" = u.id), '[]') AS fasiliteter,
      COALESCE((SELECT jsonb_agg(p ORDER BY p.id) FROM planer p), '[]') AS planer,
      COALESCE((SELECT jsonb_agg(s ORDER BY s.id) FROM sesonger s), '[]') AS sesonger,
      COALESCE((SELECT jsonb_agg(p ORDER BY p.id) FROM perioder p), '[]') AS perioder,
      COALESCE((SELECT jsonb_agg(s ORDER BY s.id) FROM sg s), '[]') AS sg,
      (SELECT to_jsonb(n) FROM neste n WHERE n.dato >= ${start} ORDER BY n.dato, n.id LIMIT 1) AS turnering,
      (SELECT count(*)::int FROM training_sessions_v2 v WHERE v."studentId" = u.id
        AND v.status::text = 'COMPLETED' AND v."startTime" >= ${fra} AND v."startTime" < ${start}) AS fullforte,
      (SELECT md5(string_agg(v.id || ':' || v.xmin::text, ',' ORDER BY v.id)) FROM training_sessions_v2 v
        WHERE v."studentId" = u.id AND v."startTime" >= ${fra} AND v."startTime" < ${slutt}) AS "oktVersjoner",
      (SELECT md5(string_agg(s.id || ':' || s.xmin::text, ',' ORDER BY s.id)) FROM training_plan_sessions s
        JOIN planer p ON p.id = s."planId" WHERE s."scheduledAt" >= ${start} AND s."scheduledAt" < ${slutt}) AS "planOktVersjoner",
      (SELECT md5(string_agg(m.id || ':' || m.xmin::text, ',' ORDER BY m.id)) FROM month_plans m
        WHERE m."userId" = u.id AND (m.year,m.month) IN
          ((extract(year from ${start}::timestamp)::int,extract(month from ${start}::timestamp)::int),
           (extract(year from (${slutt}::timestamp - interval '1 day'))::int,extract(month from (${slutt}::timestamp - interval '1 day'))::int))) AS "manedVersjoner",
      (SELECT md5(string_agg(w.id || ':' || w.xmin::text, ',' ORDER BY w.id)) FROM week_plans w
        WHERE w."playerId" = u.id AND w."isoYear" = extract(isoyear from ${start}::timestamp)::int
          AND w."weekNumber" = extract(week from ${start}::timestamp)::int) AS "ukeVersjoner"
    FROM users u WHERE u.id = ${spiller.id}`;
  const parsed = z.array(rad).length(1).safeParse(rader);
  if (!parsed.success) return null;
  const data = parsed.data[0];
  // Never choose an arbitrary active plan/overlapping period or another coach's
  // plan. This is an AK-specific writer basis, not general PlayerHQ access.
  if (data.planer.length !== 1 || data.planer[0].coachId !== jobb.coachId ||
    data.sesonger.length > 1 || data.perioder.length > 1) return null;
  const planFra = new Date(data.planer[0].fra).getTime();
  const planTil = data.planer[0].til ? new Date(data.planer[0].til).getTime() : Infinity;
  if (!Number.isFinite(planFra) || Number.isNaN(planTil) || planFra > start.getTime() || planTil < slutt.getTime() - 1) return null;
  const aktiv = data.perioder[0] ?? null;
  if (aktiv?.gruppeId && aktiv.gruppeId !== jobb.gruppeId) return null;
  const prefs = preferanser.parse(data.preferanser);
  const niva = beregnAkSpillerniva(data.nivaTurneringer, data.hcp, osloAar(new Date()));
  const dato = data.turnering ? new Date(data.turnering.dato) : null;
  if (dato && !Number.isFinite(dato.getTime())) return null;
  const verdi: UkeData = {
    planId: data.planer[0].id, periodeId: aktiv?.id ?? null, budsjett: parseSessionBudget(aktiv?.budsjett),
    harManedsEllerUkevalg: data.manedVersjoner !== null || data.ukeVersjoner !== null,
    fasiliteter: data.fasiliteter.map(f => akFasilitetSchema.parse(f)), niva,
    modell: {
      context: { daysUntilTournament: dato ? Math.ceil((dato.getTime() - start.getTime()) / 86_400_000) : null,
        completedSessions: data.fullforte,
        sgWeaknesses: [...new Set(data.sg.flatMap(s => {
          const omrade = sgOmrade.safeParse(s.omrade);
          return omrade.success && s.verdi !== null && Number.isFinite(s.verdi) && s.verdi < 0 ? [omrade.data] : [];
        }))] },
      signals: { aktivFase: aktiv?.fase ?? null, okterPerUke: prefs.okterPerUke, foretrukneDager: prefs.dager },
      category: niva.kategori, categorySource: niva.kilde,
    },
  };
  return { verdi, databevis: { versjon: 1 as const, uke: ukeStart, planId: verdi.planId,
    fingeravtrykk: createHash('sha256').update(canonicalJson([1, ukeStart, niva.aar, data])).digest('hex') } };
}

/** Server-only capture. No model call, queue record or purpose activation. */
export async function hentAkUkegrunnlag(jobb: AkGruppeoppdrag, spillerId: unknown, ukeStart: unknown): Promise<AkUkegrunnlag | null> {
  const dato = uke.safeParse(ukeStart);
  if (!dato.success) return null;
  const hentet = await hentMedAkProfilBevis(jobb, spillerId, (tx, scope) => les(tx, scope, jobb, dato.data));
  if (!hentet?.verdi) return null;
  return { ...hentet.verdi.verdi, databevis: hentet.verdi.databevis, deling: hentet.bevis };
}

/** Compare trusted server-stored evidence; never replace it with client input.
 * Same sharing AND data state at the comparison statement, then DB-only mutation
 * in the same transaction. Locks the target plan and its weekly sessions before
 * comparison; it does not freeze all training logs or tournament catalogue rows.
 * This covers selected weekly inputs, not drill content or all player data.
 */
export async function brukSammeAkUkegrunnlag<T>(jobb: AkGruppeoppdrag, spillerId: unknown,
  deling: unknown, lagretDatabevis: unknown, bruk: (tx: Tx, data: UkeData) => Promise<T>,
): Promise<{ verdi: T } | null> {
  const forventet = akUkeDatabevisSchema.safeParse(lagretDatabevis);
  if (!forventet.success) return null;
  const resultat = await brukMedSammeAkProfilBevis(jobb, spillerId, deling, async (tx, scope) => {
    const data = await laasOgLesSammeAkUkegrunnlag(tx, scope, jobb, forventet.data);
    return data ? { verdi: await bruk(tx, data) } : null;
  });
  return resultat?.verdi ?? null;
}


/** Internal composition inside an already authorized sharing transaction.
 * Never call without fresh, locked profile access; scope comes from that guard.
 */
export async function laasOgLesSammeAkUkegrunnlag(tx: Tx, scope: Prisma.UserWhereInput,
  jobb: AkGruppeoppdrag, forventet: z.infer<typeof akUkeDatabevisSchema>) {
    const spiller = await tx.user.findFirst({ where: scope, select: { id: true } });
    if (!spiller) return null;
    const laast = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM training_plans WHERE id = ${forventet.planId} AND "userId" = ${spiller.id} FOR UPDATE`;
    if (laast.length !== 1) return null;
    const start = new Date(`${forventet.uke}T00:00:00Z`);
    const slutt = new Date(start.getTime() + 7 * 86_400_000);
    await tx.$queryRaw`SELECT id FROM training_plan_sessions WHERE "planId" = ${forventet.planId}
      AND "scheduledAt" >= ${start} AND "scheduledAt" < ${slutt} ORDER BY id FOR UPDATE`;
    // Protect the concrete facilities against edits/deletion during validation
    // and persistence. An added facility only broadens options; the fresh
    // snapshot below still detects additions committed before that read.
    await tx.$queryRaw`SELECT id FROM player_facilities WHERE "userId" = ${spiller.id} ORDER BY id FOR SHARE`;
    // A revoked/reconfirmed profile link is a new revision, even if the scores
    // are identical. Existing links cannot change while this decision commits.
    await tx.$queryRaw`SELECT id FROM ${nivaKoblinger} WHERE hq_user_id = ${spiller.id} ORDER BY id FOR SHARE`;
    // READ COMMITTED deliberately: changes committed while waiting for a lock
    // must be visible to this new statement, including a just-revoked sharing row.
    const ferskt = await les(tx, scope, jobb, forventet.uke);
    if (!ferskt || canonicalJson(ferskt.databevis) !== canonicalJson(forventet)) return null;
    return ferskt.verdi;
}
