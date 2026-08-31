import { redirect } from "next/navigation";

/**
 * /onboard/coach → /auth/onboarding (MASTERPLAN 15.13, 2026-08-31).
 * Duplikat av /auth/onboarding sin COACH/ADMIN-gren — aldri lenket til fra
 * noe sted i koden. Anders valgte /auth/onboarding som kanonisk.
 */
export default function OnboardCoachRedirect(): never {
  redirect("/auth/onboarding");
}
