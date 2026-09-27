import { TnManedsplanSkjerm } from "@/components/team-norway/skjermer/tn-manedsplan-skjerm";

/** TN-11. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-11. */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <TnManedsplanSkjerm sokeparametre={await searchParams} />;
}
