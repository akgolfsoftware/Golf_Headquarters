import { TnTurneringerSkjerm } from "@/components/team-norway/skjermer/tn-turneringer-skjerm";

/** TN-07. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-07. */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <TnTurneringerSkjerm sokeparametre={await searchParams} />;
}
