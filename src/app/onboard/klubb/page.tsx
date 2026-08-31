import { redirect } from "next/navigation";

/**
 * /onboard/klubb → /auth/onboarding (MASTERPLAN 15.13, 2026-08-31).
 * Duplikat av /auth/onboarding sin COACH/ADMIN-gren — aldri lenket til fra
 * noe sted i koden. Anders valgte /auth/onboarding som kanonisk.
 */
export default function OnboardKlubbRedirect(): never {
  redirect("/auth/onboarding");
}
