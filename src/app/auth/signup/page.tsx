import { SignupV2 } from "@/components/portal/v2/SignupV2";

/**
 * /auth/signup — AU02Registrering.
 * Supabase auth.signUp med rolle, pakke og GDPR-samtykke er uendret.
 * ?epost= prefiller, ?subscribe= videreføres, ?kilde=talenthq er TalentHQ.
 * Tegningens firestegs Talent/Full-veiviser er ikke innført.
 */
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ epost?: string; subscribe?: string; kilde?: string }>;
}) {
  const { epost, subscribe, kilde } = await searchParams;
  return (
    <SignupV2
      defaultEmail={epost}
      subscribe={subscribe}
      kilde={kilde === "talenthq" ? "talenthq" : undefined}
    />
  );
}
