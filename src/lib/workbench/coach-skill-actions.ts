"use server";

/**
 * Coach-Skill → periode-blokk. Når en coach fullfører Coach-Skill-veiviseren
 * (Workbench, coach-modus) og trykker «Send nå», lagres konfigurasjonen som en
 * `PeriodBlock` i hver mottakers sesongplan (Anders' valg A, 2026-06-22):
 *   - period → LPhase (EVAL har ingen LPhase-verdi → TURNERING + markert i notes)
 *   - timeMin (ukentlig totaltid) → weeklyVolMin/Max (mater Workbench-statusbaren)
 *   - nivå + pyramide-fordeling + anlegg → focus/notes (lesbart)
 *
 * Coachen går alltid gjennom de tre stegene (godkjenning) før dette kalles.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

type LPhase = "GRUNN" | "SPESIAL" | "TURNERING";

// Wizardens period → LPhase. EVAL finnes ikke i LPhase → lagres som TURNERING
// og merkes i notes så intensjonen bevares.
const PERIOD_TO_LPHASE: Record<string, LPhase> = {
  GRUNN: "GRUNN",
  SPESIAL: "SPESIAL",
  TURNERING: "TURNERING",
  EVAL: "TURNERING",
};

const PERIOD_NAVN: Record<string, string> = {
  GRUNN: "Grunntrening",
  SPESIAL: "Spesialisering",
  TURNERING: "Turnering",
  EVAL: "Evaluering",
};

const PYR_REKKE = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

function mandagDenneUken(d: Date): Date {
  const dato = new Date(d);
  const dag = (dato.getDay() + 6) % 7; // 0 = mandag
  dato.setDate(dato.getDate() - dag);
  dato.setHours(0, 0, 0, 0);
  return dato;
}

/** Hent eller opprett sesongplan for året (samme mønster som kalender-perioder). */
async function hentEllerOpprettSeasonPlan(userId: string, dato: Date): Promise<string> {
  const aar = dato.getFullYear();
  const eksisterende = await prisma.seasonPlan.findUnique({
    where: { userId_year: { userId, year: aar } },
    select: { id: true },
  });
  if (eksisterende) return eksisterende.id;
  const ny = await prisma.seasonPlan.create({
    data: {
      userId,
      year: aar,
      name: `Sesong ${aar}`,
      startDate: new Date(aar, 0, 1),
      endDate: new Date(aar, 11, 31),
    },
    select: { id: true },
  });
  return ny.id;
}

export type CoachSkillInput = {
  /** Mottaker-userId-er (sentinel-er som «__current__»/«__group__» er allerede løst opp av klienten). */
  recipientUserIds: string[];
  level: string; // A–K
  period: string; // GRUNN | SPESIAL | TURNERING | EVAL
  perWeek: number;
  timeMin: number; // ukentlig totalvolum (minutter)
  pyrDist: Record<string, number>;
  facilities: string[];
};

export type CoachSkillResultat = { ok: true; count: number } | { ok: false; feil: string };

export async function sendCoachSkillPlan(input: CoachSkillInput): Promise<CoachSkillResultat> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const ids = [...new Set(input.recipientUserIds)].filter(Boolean);
  if (ids.length === 0) return { ok: false, feil: "Ingen gyldige mottakere" };

  // Bekreft at mottakerne finnes (unngå skriving til ikke-eksisterende kontoer).
  const gyldige = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  if (gyldige.length === 0) return { ok: false, feil: "Fant ingen av mottakerne" };

  const lPhase = PERIOD_TO_LPHASE[input.period] ?? "GRUNN";
  const fra = mandagDenneUken(new Date());
  const til = new Date(fra);
  til.setDate(til.getDate() + 28); // 4-ukers blokk

  // Volummål utledet fra coachens satte ukentlige totaltid (±tolerance), ikke fabrikkert.
  const volMax = Math.max(0, Math.round(input.timeMin));
  const volMin = Math.round(volMax * 0.85);

  const pyrTekst = PYR_REKKE.map((k) => `${k} ${input.pyrDist[k] ?? 0}`).join(" · ");
  const focus = `Coach-Skill · nivå ${input.level} · ${PERIOD_NAVN[input.period] ?? input.period}`;
  const notes =
    `Pyramide: ${pyrTekst}. ${input.perWeek} økter/uke.` +
    ` Anlegg: ${input.facilities.length > 0 ? input.facilities.join(", ") : "—"}.` +
    (input.period === "EVAL" ? " (Evalueringsperiode)" : "");

  let count = 0;
  for (const userId of gyldige.map((u) => u.id)) {
    const seasonPlanId = await hentEllerOpprettSeasonPlan(userId, fra);
    await prisma.periodBlock.create({
      data: {
        seasonPlanId,
        lPhase,
        startDate: fra,
        endDate: til,
        focus,
        weeklyVolMin: volMin,
        weeklyVolMax: volMax,
        notes,
      },
    });
    count++;
  }

  revalidatePath("/admin/kalender");
  return { ok: true, count };
}
