/**
 * "View as"-funksjon for ADMIN/COACH: lar dem inspisere PlayerHQ uten
 * å logge ut og inn som spiller. Lagrer preferansen i en cookie.
 */
import { cookies } from "next/headers";
import type { UserRole } from "@/generated/prisma/client";

const COOKIE = "ak_view_as";

export type ViewMode = "coach" | "player";

export async function getViewMode(): Promise<ViewMode> {
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  return value === "player" ? "player" : "coach";
}

export async function setViewMode(mode: ViewMode): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, mode, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dager
  });
}

/**
 * COACH/ADMIN i PlayerHQ skal default være i spiller-modus (egen profil).
 * Kalles fra portal-shell og fullscreen-layouts.
 */
export async function ensurePortalPlayerViewMode(
  role: UserRole,
): Promise<ViewMode> {
  if (role === "COACH" || role === "ADMIN") {
    await setViewMode("player");
    return "player";
  }
  return getViewMode();
}
