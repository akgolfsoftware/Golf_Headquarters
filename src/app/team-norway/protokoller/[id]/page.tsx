import { TnTestprotokollerSkjerm } from "@/components/team-norway/skjermer/tn-testprotokoller-skjerm";

/** TN-15 med valgt protokoll. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-15. */
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  return <TnTestprotokollerSkjerm sokeparametre={await searchParams} valgtId={id} />;
}
