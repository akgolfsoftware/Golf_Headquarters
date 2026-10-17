import { Registrering } from "@/components/auth/precision/KontoSkjermer";

/**
 * /auth/signup — AU-02 Opprett konto i nytt design. Rolle (spiller eller forelder), nivå Gratis eller Full,
 * navn, e-post og passord, eller Google. ?epost= prefiller, ?subscribe= velger Full, ?kilde=talenthq er TalentHQ,
 * ?rolle=forelder kommer fra forelderens godkjenning.
 */
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ epost?: string; subscribe?: string; kilde?: string; rolle?: string; godkjent?: string }>;
}) {
  const { epost, subscribe, kilde, rolle, godkjent } = await searchParams;
  const plan = subscribe && ["pro", "pro_aar"].includes(subscribe) ? subscribe : undefined;
  return (
    <Registrering
      standardEpost={epost}
      subscribe={plan}
      kilde={kilde === "talenthq" ? "talenthq" : undefined}
      startRolle={rolle === "forelder" ? "PARENT" : "PLAYER"}
      forelderGodkjent={godkjent === "1"}
    />
  );
}
