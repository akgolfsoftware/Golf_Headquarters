import { SignupPA } from "@/components/portal/precision/SignupPA";

/**
 * /auth/signup — AU-02 Registrer i Precision Athletics (SignupPA). Samme ekte
 * registreringslogikk (Supabase auth.signUp med rolle/pakke/metadata +
 * GDPR-samtykke) som SignupV2 — se src/components/portal/precision/SignupPA.tsx.
 * ?epost=… prefiller e-postfeltet (gjeste-bro fra booking), ?subscribe=… videreføres til onboarding/check-email.
 * ?kilde=talenthq forhåndsvelger TALENT (gratis testprofil) og sender kilde-metadata til Supabase — ensureUser setter da
 * profilType TALENT ved opprettelse (plan T3).
 */
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ epost?: string; subscribe?: string; kilde?: string }>;
}) {
  const { epost, subscribe, kilde } = await searchParams;
  return (
    <SignupPA
      defaultEmail={epost}
      subscribe={subscribe}
      kilde={kilde === "talenthq" ? "talenthq" : undefined}
    />
  );
}
