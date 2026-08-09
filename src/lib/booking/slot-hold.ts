/**
 * Soft slot-hold during checkout (2–5 min default 3 min).
 *
 * Prevents double-booking races while Stripe Checkout is open:
 * 1. acquireHold before creating PENDING + redirect to Stripe
 * 2. isBlockedByHold / isSlotStillAvailable rejects other users for same slot
 * 3. releaseHold after confirm, cancel, or expiry
 *
 * Storage: Upstash Redis SET NX PX when available, else process-local Map
 * (dev / single instance). Fail-open: if Redis is down, holds are best-effort
 * in-memory — collisjonvern still protects hard races.
 */

import { Redis } from "@upstash/redis";

export const DEFAULT_HOLD_TTL_MS = 3 * 60 * 1000; // 3 min
export const MIN_HOLD_TTL_MS = 2 * 60 * 1000;
export const MAX_HOLD_TTL_MS = 5 * 60 * 1000;

export type SlotHoldKeyParts = {
  serviceTypeId: string;
  coachId: string;
  /** ISO start of slot */
  startIso: string;
};

export type SlotHold = {
  holderId: string;
  expiresAt: number;
  key: string;
};

export function slotHoldKey(parts: SlotHoldKeyParts): string {
  // Normalize to second precision so ms noise doesn't fork keys
  const start = new Date(parts.startIso);
  const iso =
    Number.isNaN(start.getTime())
      ? parts.startIso
      : new Date(Math.floor(start.getTime() / 1000) * 1000).toISOString();
  return `slot-hold:${parts.serviceTypeId}:${parts.coachId}:${iso}`;
}

export function clampHoldTtl(ms: number): number {
  return Math.min(MAX_HOLD_TTL_MS, Math.max(MIN_HOLD_TTL_MS, ms));
}

// ── In-memory store (dev + Redis fallback) ─────────────────────────
const memory = new Map<string, SlotHold>();

function memoryGet(key: string): SlotHold | null {
  const h = memory.get(key);
  if (!h) return null;
  if (h.expiresAt <= Date.now()) {
    memory.delete(key);
    return null;
  }
  return h;
}

function memoryAcquire(
  key: string,
  holderId: string,
  ttlMs: number,
): { ok: true; hold: SlotHold } | { ok: false; hold: SlotHold } {
  const existing = memoryGet(key);
  if (existing && existing.holderId !== holderId) {
    return { ok: false, hold: existing };
  }
  const hold: SlotHold = {
    holderId,
    expiresAt: Date.now() + clampHoldTtl(ttlMs),
    key,
  };
  memory.set(key, hold);
  return { ok: true, hold };
}

function memoryRelease(key: string, holderId: string): boolean {
  const existing = memoryGet(key);
  if (!existing) return true;
  if (existing.holderId !== holderId) return false;
  memory.delete(key);
  return true;
}

// ── Redis (optional) ───────────────────────────────────────────────
let redis: Redis | null = null;
let redisTried = false;

function getRedis(): Redis | null {
  if (redisTried) return redis;
  redisTried = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || /xxxx\.upstash\.io|YOUR_|placeholder/i.test(url + token)) {
    return null;
  }
  try {
    redis = new Redis({ url, token });
  } catch {
    redis = null;
  }
  return redis;
}

/**
 * Acquire exclusive soft hold. Same holder may refresh TTL.
 * Different holder → ok:false with existing hold metadata.
 */
export async function acquireHold(
  parts: SlotHoldKeyParts,
  holderId: string,
  ttlMs: number = DEFAULT_HOLD_TTL_MS,
): Promise<{ ok: true; hold: SlotHold } | { ok: false; hold: SlotHold | null; reason: string }> {
  const key = slotHoldKey(parts);
  const ttl = clampHoldTtl(ttlMs);
  const r = getRedis();

  if (r) {
    try {
      const payload = JSON.stringify({
        holderId,
        expiresAt: Date.now() + ttl,
        key,
      } satisfies SlotHold);
      // SET NX with PX — atomic. If exists, refresh only if same holder.
      const set = await r.set(key, payload, { nx: true, px: ttl });
      if (set === "OK") {
        return {
          ok: true,
          hold: { holderId, expiresAt: Date.now() + ttl, key },
        };
      }
      const raw = await r.get<string>(key);
      if (raw) {
        const existing = typeof raw === "string" ? (JSON.parse(raw) as SlotHold) : (raw as SlotHold);
        if (existing.holderId === holderId) {
          await r.set(key, payload, { px: ttl });
          return {
            ok: true,
            hold: { holderId, expiresAt: Date.now() + ttl, key },
          };
        }
        if (existing.expiresAt > Date.now()) {
          return { ok: false, hold: existing, reason: "held-by-other" };
        }
        // Expired leftover — overwrite
        await r.set(key, payload, { px: ttl });
        return {
          ok: true,
          hold: { holderId, expiresAt: Date.now() + ttl, key },
        };
      }
    } catch {
      // fall through to memory
    }
  }

  const m = memoryAcquire(key, holderId, ttl);
  if (!m.ok) return { ok: false, hold: m.hold, reason: "held-by-other" };
  return m;
}

export async function releaseHold(
  parts: SlotHoldKeyParts,
  holderId: string,
): Promise<boolean> {
  const key = slotHoldKey(parts);
  const r = getRedis();
  if (r) {
    try {
      const raw = await r.get<string>(key);
      if (raw) {
        const existing = typeof raw === "string" ? (JSON.parse(raw) as SlotHold) : (raw as SlotHold);
        if (existing.holderId === holderId) {
          await r.del(key);
          memory.delete(key);
          return true;
        }
        return false;
      }
    } catch {
      // memory
    }
  }
  return memoryRelease(key, holderId);
}

export async function getHold(parts: SlotHoldKeyParts): Promise<SlotHold | null> {
  const key = slotHoldKey(parts);
  const r = getRedis();
  if (r) {
    try {
      const raw = await r.get<string>(key);
      if (raw) {
        const existing = typeof raw === "string" ? (JSON.parse(raw) as SlotHold) : (raw as SlotHold);
        if (existing.expiresAt > Date.now()) return existing;
        await r.del(key);
        return null;
      }
    } catch {
      // memory
    }
  }
  return memoryGet(key);
}

/** True if another holder blocks this slot (not self). */
export async function isBlockedByHold(
  parts: SlotHoldKeyParts,
  selfHolderId?: string | null,
): Promise<boolean> {
  const h = await getHold(parts);
  if (!h) return false;
  if (selfHolderId && h.holderId === selfHolderId) return false;
  return true;
}

/** Test helper — clear in-memory holds. */
export function __resetSlotHoldMemoryForTests(): void {
  memory.clear();
}
