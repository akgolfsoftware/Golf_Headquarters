import { TnTestprotokollerSkjerm } from "@/components/team-norway/skjermer/tn-testprotokoller-skjerm";

/** TN-15. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-15. */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <TnTestprotokollerSkjerm sokeparametre={await searchParams} />;
}
