import { TnSpillerutviklingSkjerm } from "@/components/team-norway/skjermer/tn-spillerutvikling-skjerm";

/** TN-12. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-12. */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <TnSpillerutviklingSkjerm sokeparametre={await searchParams} />;
}
