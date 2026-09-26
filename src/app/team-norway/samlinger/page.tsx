import { TnSamlingerSkjerm } from "@/components/team-norway/skjermer/tn-samlinger-skjerm";

/** TN-04. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-04. */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <TnSamlingerSkjerm sokeparametre={await searchParams} />;
}
