import { SignupV2 } from "@/components/portal/v2/SignupV2";

/**
 * /auth/signup — v2-redesign (2026-07-10): SignupV2 (retning C «Presis»)
 * erstatter den gamle terminal-lys-fasiten. Samme ekte registreringslogikk
 * (Supabase auth.signUp med rolle/pakke/metadata + GDPR-samtykke) som før,
 * nå portert inn i SignupV2 selv — se
 * src/components/portal/v2/SignupV2.tsx. ?epost=… prefiller e-postfeltet
 * (gjeste-bro fra booking), ?subscribe=… videreføres til onboarding/check-email.
 * Gamle signup-form.tsx står urørt som fallback.
 */
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ epost?: string; subscribe?: string }>;
}) {
  const { epost, subscribe } = await searchParams;
  return <SignupV2 defaultEmail={epost} subscribe={subscribe} />;
}
