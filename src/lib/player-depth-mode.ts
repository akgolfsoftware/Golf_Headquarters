/**
 * Player depth mode — Simple vs Deep UX (restructure Phase 0/3).
 * Same PRO entitlement; controls progressive disclosure only.
 * Cookie-backed for now (no schema migration). Default: simple.
 */
import { cookies } from "next/headers";

export const PLAYER_DEPTH_COOKIE = "ak_player_depth";
export type PlayerDepthMode = "simple" | "deep";

export async function getPlayerDepthMode(): Promise<PlayerDepthMode> {
  const jar = await cookies();
  const v = jar.get(PLAYER_DEPTH_COOKIE)?.value;
  return v === "deep" ? "deep" : "simple";
}

export async function setPlayerDepthMode(mode: PlayerDepthMode): Promise<void> {
  const jar = await cookies();
  jar.set(PLAYER_DEPTH_COOKIE, mode, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

/** Default depth for new profiles — academy programs may prefer deep later. */
export function defaultDepthForProgram(program: string | null | undefined): PlayerDepthMode {
  if (!program || program === "PLATFORM_ONLY") return "simple";
  // Coach-linked academy programs → deep tools available by default
  return "deep";
}
