import { TnRanglisteSkjerm } from "@/components/team-norway/skjermer/tn-rangliste-skjerm";

/** TN-16. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-16. */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <TnRanglisteSkjerm sokeparametre={await searchParams} />;
}
