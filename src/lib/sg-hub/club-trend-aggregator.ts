// ClubMetricTrend Aggregator — ukentlig cron (mandag 03:00 UTC).
// Aggregerer TrackMan-sessions per (userId, club, weekStart=mandag) og
// upserter inn i ClubMetricTrend.

import { prisma } from "@/lib/prisma";
import { extractClubs, extractShots } from "./extract-shots";

const TWELVE_WEEKS_MS = 12 * 7 * 24 * 60 * 60 * 1000;
const MIN_SHOTS_PER_WEEK = 3;

// Returnerer mandagen (UTC) som starter uken inneholdt i `date`.
function weekStartUtc(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const dow = d.getUTCDay(); // 0 = søndag, 1 = mandag
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance =
    values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function round(v: number, decimals: number): number {
  const mult = Math.pow(10, decimals);
  return Math.round(v * mult) / mult;
}

type Bucket = {
  userId: string;
  club: string;
  weekStart: Date;
  clubPath: number[];
  faceAngle: number[];
  smash: number[];
  total: number[];
  ballSpeed: number[];
};

function bucketKey(userId: string, club: string, weekStart: Date): string {
  return `${userId}::${club}::${weekStart.toISOString()}`;
}

export async function aggregateClubTrendsForUser(userId: string): Promise<{
  userId: string;
  weeksWritten: number;
}> {
  const since = new Date(Date.now() - TWELVE_WEEKS_MS);
  const sessions = await prisma.trackManSession.findMany({
    where: { userId, recordedAt: { gte: since } },
    select: { recordedAt: true, rawJson: true },
  });

  const buckets = new Map<string, Bucket>();

  for (const s of sessions) {
    const week = weekStartUtc(s.recordedAt);
    const clubs = extractClubs(s.rawJson);
    for (const club of clubs) {
      const shots = extractShots(s.rawJson, club);
      if (shots.length === 0) continue;
      const key = bucketKey(userId, club, week);
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = {
          userId,
          club,
          weekStart: week,
          clubPath: [],
          faceAngle: [],
          smash: [],
          total: [],
          ballSpeed: [],
        };
        buckets.set(key, bucket);
      }
      for (const shot of shots) {
        bucket.clubPath.push(shot.clubPath);
        bucket.faceAngle.push(shot.faceAngle);
        if (shot.smashFactor > 0) bucket.smash.push(shot.smashFactor);
        if (shot.totalDistance > 0) bucket.total.push(shot.totalDistance);
        if (shot.ballSpeed > 0) bucket.ballSpeed.push(shot.ballSpeed);
      }
    }
  }

  let weeksWritten = 0;

  for (const bucket of buckets.values()) {
    const shotCount = bucket.clubPath.length;
    if (shotCount < MIN_SHOTS_PER_WEEK) continue;

    await prisma.clubMetricTrend.upsert({
      where: {
        userId_club_weekStart: {
          userId: bucket.userId,
          club: bucket.club,
          weekStart: bucket.weekStart,
        },
      },
      create: {
        userId: bucket.userId,
        club: bucket.club,
        weekStart: bucket.weekStart,
        avgClubPath: round(mean(bucket.clubPath), 3),
        avgFaceAngle: round(mean(bucket.faceAngle), 3),
        avgSmash: round(mean(bucket.smash), 3),
        avgTotal: round(mean(bucket.total), 2),
        sigmaBall: round(stdDev(bucket.ballSpeed), 3),
        shotCount,
      },
      update: {
        avgClubPath: round(mean(bucket.clubPath), 3),
        avgFaceAngle: round(mean(bucket.faceAngle), 3),
        avgSmash: round(mean(bucket.smash), 3),
        avgTotal: round(mean(bucket.total), 2),
        sigmaBall: round(stdDev(bucket.ballSpeed), 3),
        shotCount,
      },
    });

    weeksWritten++;
  }

  return { userId, weeksWritten };
}

export async function runClubTrends(): Promise<{
  processed: number;
  weeksWritten: number;
}> {
  const brukere = await prisma.user.findMany({
    where: { trackManSessions: { some: {} } },
    select: { id: true },
  });

  let weeksWritten = 0;
  for (const { id } of brukere) {
    const res = await aggregateClubTrendsForUser(id);
    weeksWritten += res.weeksWritten;
  }

  return { processed: brukere.length, weeksWritten };
}
