import { Redis } from "@upstash/redis";

type UpstashRedisConfig = {
  url: string;
  token: string;
};

type RedisEnvironment = Partial<
  Record<
    | "REDIS_URL"
    | "UPSTASH_REDIS_REST_URL"
    | "UPSTASH_REDIS_REST_TOKEN"
    | "KV_REST_API_URL"
    | "KV_REST_API_TOKEN",
    string
  >
>;

const PLACEHOLDER_PATTERN = /xxxx\.upstash\.io|YOUR_|placeholder/i;

function currentRedisEnvironment(): RedisEnvironment {
  return {
    REDIS_URL: process.env.REDIS_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  };
}

function fromRedisUrl(value: string | undefined): UpstashRedisConfig | null {
  if (!value || PLACEHOLDER_PATTERN.test(value)) return null;

  try {
    const connection = new URL(value);
    if (
      connection.protocol !== "rediss:" ||
      !connection.hostname ||
      !connection.password
    ) {
      return null;
    }

    return {
      url: `https://${connection.hostname}`,
      token: decodeURIComponent(connection.password),
    };
  } catch {
    return null;
  }
}

function fromRestVariables(env: RedisEnvironment): UpstashRedisConfig | null {
  const url = env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN;
  if (!url || !token || PLACEHOLDER_PATTERN.test(url + token)) return null;
  return { url, token };
}

/**
 * Vercel sin nåværende Upstash-integrasjon leverer REDIS_URL. Eldre
 * installasjoner leverer REST-variablene. REDIS_URL prioriteres slik at en
 * ny integrasjon ikke overskygges av utdaterte, brukeropprettede variabler.
 */
export function getUpstashRedisConfig(
  env: RedisEnvironment = currentRedisEnvironment(),
): UpstashRedisConfig | null {
  return fromRedisUrl(env.REDIS_URL) ?? fromRestVariables(env);
}

export function createUpstashRedis(
  env: RedisEnvironment = currentRedisEnvironment(),
): Redis | null {
  const config = getUpstashRedisConfig(env);
  if (!config) return null;

  try {
    return new Redis(config);
  } catch {
    return null;
  }
}
