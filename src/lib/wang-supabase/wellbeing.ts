import "server-only";

import { z } from "zod";

import { opprettWangServerKlient } from "./server";
import type {
  WangAthleteOverview,
  WangAuthenticatedProfile,
  WangRole,
  WangWellbeingAlert,
} from "./types";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const wellbeingCheckinSchema = z.object({
  student_id: z.uuid(),
  checkin_date: z.string().regex(datePattern),
  sleep_hours: z.coerce.number().min(0).max(24),
});

type WellbeingCheckin = z.infer<typeof wellbeingCheckinSchema>;

interface SleepStreak {
  startsOn: string;
  endsOn: string;
  consecutiveDays: number;
}

function dayNumber(value: string): number {
  if (!datePattern.test(value)) throw new Error("Ugyldig WANG-dato.");
  const [year, month, day] = value.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function shiftDate(value: string, days: number): string {
  const shifted = new Date((dayNumber(value) + days) * 86_400_000);
  return shifted.toISOString().slice(0, 10);
}

function osloDate(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/Oslo",
  }).format(now);
}

export function erWangHelsevarselRolle(
  role: WangRole,
): role is "sports_director" | "coach" {
  return role === "sports_director" || role === "coach";
}

export function finnAktivSovnrekke(
  checkins: Pick<WellbeingCheckin, "checkin_date" | "sleep_hours">[],
  today: string,
): SleepStreak | null {
  const todayNumber = dayNumber(today);
  const checkinsByDate = new Map(
    checkins
      .filter((checkin) => dayNumber(checkin.checkin_date) <= todayNumber)
      .map((checkin) => [checkin.checkin_date, checkin]),
  );
  const sorted = [...checkinsByDate.values()].sort((left, right) =>
    left.checkin_date.localeCompare(right.checkin_date),
  );

  let startsOn = "";
  let endsOn = "";
  let consecutiveDays = 0;
  let previousDay: number | null = null;

  for (const checkin of sorted) {
    const currentDay = dayNumber(checkin.checkin_date);
    const isConsecutive = previousDay !== null && currentDay === previousDay + 1;

    if (checkin.sleep_hours < 6) {
      if (!isConsecutive) {
        startsOn = checkin.checkin_date;
        consecutiveDays = 1;
      } else {
        consecutiveDays += 1;
      }
      endsOn = checkin.checkin_date;
    } else {
      startsOn = "";
      endsOn = "";
      consecutiveDays = 0;
    }

    previousDay = currentDay;
  }

  if (consecutiveDays < 3 || !endsOn) return null;
  const daysSinceLastCheckin = todayNumber - dayNumber(endsOn);
  if (daysSinceLastCheckin < 0 || daysSinceLastCheckin > 1) return null;

  return { startsOn, endsOn, consecutiveDays };
}

export function byggWangHelsevarsler(
  overview: WangAthleteOverview,
  checkins: WellbeingCheckin[],
  today: string,
): WangWellbeingAlert[] {
  const checkinsByStudent = new Map<string, WellbeingCheckin[]>();
  for (const checkin of checkins) {
    const studentCheckins = checkinsByStudent.get(checkin.student_id) ?? [];
    studentCheckins.push(checkin);
    checkinsByStudent.set(checkin.student_id, studentCheckins);
  }

  return overview.sports
    .flatMap((sport) =>
      sport.groups.flatMap((group) =>
        group.athletes.flatMap((athlete) => {
          const streak = finnAktivSovnrekke(
            checkinsByStudent.get(athlete.id) ?? [],
            today,
          );
          if (!streak) return [];

          return [{
            studentId: athlete.id,
            athleteName: athlete.name,
            grade: athlete.grade,
            isDemo: athlete.isDemo,
            groupName: group.name,
            sportName: sport.sportName,
            streakStartsOn: streak.startsOn,
            streakEndsOn: streak.endsOn,
            consecutiveDays: streak.consecutiveDays,
          }];
        }),
      ),
    )
    .sort((left, right) => left.athleteName.localeCompare(right.athleteName, "nb"));
}

export async function hentWangHelsevarsler(
  profile: WangAuthenticatedProfile,
  overview: WangAthleteOverview,
  now = new Date(),
): Promise<WangWellbeingAlert[]> {
  if (!erWangHelsevarselRolle(profile.role)) return [];

  const studentIds = overview.sports.flatMap((sport) =>
    sport.groups.flatMap((group) => group.athletes.map((athlete) => athlete.id)),
  );
  if (studentIds.length === 0) return [];

  const today = osloDate(now);
  const supabase = await opprettWangServerKlient();
  const checkinsResult = await supabase
    .from("wang_wellbeing_checkins")
    .select("student_id, checkin_date, sleep_hours")
    .in("student_id", studentIds)
    .gte("checkin_date", shiftDate(today, -14))
    .lte("checkin_date", today)
    .order("checkin_date");

  if (checkinsResult.error) throw new Error("WANG-helsevarslene kunne ikke hentes.");
  const parsed = z.array(wellbeingCheckinSchema).safeParse(checkinsResult.data ?? []);
  if (!parsed.success) throw new Error("WANG-helsevarslene mottok ugyldige data.");

  return byggWangHelsevarsler(overview, parsed.data, today);
}
