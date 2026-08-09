/**
 * Lightweight booking metrics counters (B.4).
 * Best-effort: Upstash Redis INCR when available, else process log.
 * Surfaces for admin can read keys later; never blocks booking.
 */

import { Redis } from "@upstash/redis";

export type BookingMetricEvent =
  | "book_success"
  | "book_slot_miss"
  | "book_credit_fail"
  | "book_hold_blocked"
  | "book_checkout_start";

function dayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10); // UTC date bucket
}

function metricKey(event: BookingMetricEvent, day = dayKey()): string {
  return `booking-metric:${day}:${event}`;
}

let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || /xxxx\.upstash\.io|YOUR_|placeholder/i.test(url + token)) {
    redis = null;
    return null;
  }
  try {
    redis = new Redis({ url, token });
  } catch {
    redis = null;
  }
  return redis;
}

export async function recordBookingMetric(
  event: BookingMetricEvent,
  meta?: Record<string, string | number | boolean | null | undefined>,
): Promise<void> {
  try {
    const r = getRedis();
    if (r) {
      const key = metricKey(event);
      await r.incr(key);
      // 14-day TTL so keys don't grow forever
      await r.expire(key, 14 * 24 * 60 * 60);
    } else if (process.env.NODE_ENV !== "production") {
      console.info("[booking-metric]", event, meta ?? {});
    }
  } catch {
    // never throw into booking path
  }
}

export async function readBookingMetrics(
  day = dayKey(),
): Promise<Partial<Record<BookingMetricEvent, number>>> {
  const events: BookingMetricEvent[] = [
    "book_success",
    "book_slot_miss",
    "book_credit_fail",
    "book_hold_blocked",
    "book_checkout_start",
  ];
  const r = getRedis();
  if (!r) return {};
  const out: Partial<Record<BookingMetricEvent, number>> = {};
  try {
    for (const e of events) {
      const v = await r.get<number>(metricKey(e, day));
      if (v != null) out[e] = Number(v);
    }
  } catch {
    return out;
  }
  return out;
}
