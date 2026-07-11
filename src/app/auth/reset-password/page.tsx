import { ResetPasswordV2 } from "@/components/portal/v2/ResetPasswordV2";

/**
 * /auth/reset-password — v2-redesign (2026-07-10): ResetPasswordV2
 * (retning C «Presis») erstatter den gamle terminal-lys-fasiten. Samme ekte
 * reset-logikk (Supabase auth.updateUser + redirect til /portal) som før, nå
 * portert inn i ResetPasswordV2 selv — se
 * src/components/portal/v2/ResetPasswordV2.tsx. Brukeren lander her etter å ha
 * klikket lenken fra e-posten. Gamle reset-form.tsx står urørt som fallback.
 */
export default function ResetPasswordPage() {
  return <ResetPasswordV2 />;
}
