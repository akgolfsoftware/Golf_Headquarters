/**
 * Valgt coach — ren beslutningskjerne (plan G2).
 *
 * Fallback-rekkefølgen er KONTRAKTEN for hvem som er spillerens coach:
 *   (1) eksplisitt valgt primærcoach (User.primaryCoachId, verifisert gyldig)
 *   (2) nyeste aktive PlayerEnrollment med coach
 *   (3) coach for aktiv gruppe — AK-administrerte grupper først, deretter
 *       eldste medlemskap
 *   (4) skaperen av aktiv treningsplan (COACH|ADMIN)
 *   (5) ingen (null)
 *
 * ALDRI «første coach alfabetisk» — det gamle mønsteret ga vilkårlige svar og
 * ville sendt varsling (G4) til feil coach.
 *
 * Ren modul (ingen IO) — trygg å importere fra tester og klient. DB-oppslagene
 * bor i ./valgt-coach.ts.
 */

export interface PrimaerKandidat {
  coachId: string;
  /** false når coachen ikke finnes, mangler COACH/ADMIN-rolle eller er myk-slettet. */
  gyldig: boolean;
}

export interface EnrollmentKandidat {
  coachId: string;
  enrolledAt: Date;
}

export interface GruppeKandidat {
  coachId: string;
  managedByAkGolf: boolean;
  joinedAt: Date;
}

/** Nivå 2–4 — det backfill og resolver deler. */
export interface FallbackKandidater {
  enrollments: EnrollmentKandidat[];
  grupper: GruppeKandidat[];
  planCoachId: string | null;
}

export interface ValgtCoachKandidater extends FallbackKandidater {
  primaer: PrimaerKandidat | null;
}

export type ValgtCoachKilde = "PRIMAER" | "ENROLLMENT" | "GRUPPE" | "PLAN";

export type ValgtCoachValg =
  | { coachId: string; kilde: ValgtCoachKilde }
  | { coachId: null; kilde: "INGEN" };

/**
 * Nyeste aktive enrollment vinner. Deterministisk uansett input-rekkefølge:
 * enrolledAt synkende, coachId som stabil tiebreak.
 */
export function velgEnrollmentCoach(enrollments: EnrollmentKandidat[]): string | null {
  const sortert = [...enrollments].sort(
    (a, b) =>
      b.enrolledAt.getTime() - a.enrolledAt.getTime() ||
      a.coachId.localeCompare(b.coachId),
  );
  return sortert[0]?.coachId ?? null;
}

/**
 * AK-administrerte grupper først (managedByAkGolf), deretter eldste medlemskap
 * (joinedAt stigende), coachId som stabil tiebreak. Deterministisk uansett
 * input-rekkefølge — aldri «første treff vinner».
 */
export function velgGruppeCoach(grupper: GruppeKandidat[]): string | null {
  const sortert = [...grupper].sort(
    (a, b) =>
      Number(b.managedByAkGolf) - Number(a.managedByAkGolf) ||
      a.joinedAt.getTime() - b.joinedAt.getTime() ||
      a.coachId.localeCompare(b.coachId),
  );
  return sortert[0]?.coachId ?? null;
}

/** Hele fallback-kjeden (1)–(5). */
export function velgValgtCoach(k: ValgtCoachKandidater): ValgtCoachValg {
  if (k.primaer?.gyldig) return { coachId: k.primaer.coachId, kilde: "PRIMAER" };

  const enrollmentCoach = velgEnrollmentCoach(k.enrollments);
  if (enrollmentCoach) return { coachId: enrollmentCoach, kilde: "ENROLLMENT" };

  const gruppeCoach = velgGruppeCoach(k.grupper);
  if (gruppeCoach) return { coachId: gruppeCoach, kilde: "GRUPPE" };

  if (k.planCoachId) return { coachId: k.planCoachId, kilde: "PLAN" };

  return { coachId: null, kilde: "INGEN" };
}

/**
 * Varianten for kallsteder som KREVER en id (f.eks. TrainingSessionV2.coachId
 * NOT NULL): kjeden over, deretter eldste ADMIN, aller sist `sisteUtvei`
 * (spillerens egen id — bevarer v2-syncs garanti om at det alltid kommer en id).
 */
export function velgValgtCoachEllerFallback(
  k: ValgtCoachKandidater,
  eldsteAdminId: string | null,
  sisteUtvei: string,
): string {
  const valg = velgValgtCoach(k);
  if (valg.coachId) return valg.coachId;
  return eldsteAdminId ?? sisteUtvei;
}

export type BackfillVurdering =
  | { status: "ENTYDIG"; coachId: string; kilde: Exclude<ValgtCoachKilde, "PRIMAER"> }
  | { status: "TVETYDIG"; kilde: Exclude<ValgtCoachKilde, "PRIMAER">; kandidater: string[] }
  | { status: "INGEN" };

/**
 * Backfill-regelen (plan G2 punkt 5): på det FØRSTE nivået med treff må alle
 * kandidater peke på SAMME coach for at feltet skal skrives automatisk. Ulike
 * coacher på samme nivå (f.eks. to aktive enrollments hos hver sin coach) er
 * en manuell avgjørelse — rapporteres, skrives aldri.
 */
export function vurderBackfillKandidat(k: FallbackKandidater): BackfillVurdering {
  if (k.enrollments.length > 0) {
    const unike = [...new Set(k.enrollments.map((e) => e.coachId))].sort();
    const forste = unike[0];
    if (unike.length === 1 && forste) {
      return { status: "ENTYDIG", coachId: forste, kilde: "ENROLLMENT" };
    }
    return { status: "TVETYDIG", kilde: "ENROLLMENT", kandidater: unike };
  }

  if (k.grupper.length > 0) {
    const unike = [...new Set(k.grupper.map((g) => g.coachId))].sort();
    const forste = unike[0];
    if (unike.length === 1 && forste) {
      return { status: "ENTYDIG", coachId: forste, kilde: "GRUPPE" };
    }
    return { status: "TVETYDIG", kilde: "GRUPPE", kandidater: unike };
  }

  if (k.planCoachId) return { status: "ENTYDIG", coachId: k.planCoachId, kilde: "PLAN" };

  return { status: "INGEN" };
}
