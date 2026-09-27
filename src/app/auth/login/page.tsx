import { LoginV2 } from "@/components/portal/v2/LoginV2";

/**
 * /auth/login — v2-redesign (2026-07-10): LoginV2 (retning C «Presis»)
 * erstatter den gamle terminal-lys-fasiten. Samme ekte auth-logikk
 * (Supabase e-post/passord + Google OAuth) som før, nå portert inn i
 * LoginV2 selv — se src/components/portal/v2/LoginV2.tsx. Gamle
 * login-form.tsx + terminal-markup står urørt som fallback.
 */
export default function LoginPage() {
  return <LoginV2 />;
}
