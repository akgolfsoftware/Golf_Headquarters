import { ForgotPasswordV2 } from "@/components/portal/v2/ForgotPasswordV2";

/**
 * /auth/forgot-password — v2-redesign (2026-07-10): ForgotPasswordV2
 * (retning C «Presis») erstatter den gamle terminal-lys-fasiten. Samme ekte
 * reset-logikk (Supabase resetPasswordForEmail + redirectTo /auth/reset-password)
 * som før, nå portert inn i ForgotPasswordV2 selv — se
 * src/components/portal/v2/ForgotPasswordV2.tsx. Gamle forgot-form.tsx står
 * urørt som fallback.
 */
export default function ForgotPasswordPage() {
  return <ForgotPasswordV2 />;
}
