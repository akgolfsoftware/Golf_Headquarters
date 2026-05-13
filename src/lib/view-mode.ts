/**
 * "View as"-funksjon for ADMIN/COACH: lar dem inspisere PlayerHQ uten
 * å logge ut og inn som spiller. Lagrer preferansen i en cookie.
 */
import { cookies } from "next/headers";

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
