import { TnSamlingerSkjerm } from "@/components/team-norway/skjermer/tn-samlinger-skjerm";

/** TN-04 med valgt samling. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-04. */
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ id }, sokeparametre] = await Promise.all([params, searchParams]);
  return <TnSamlingerSkjerm sokeparametre={sokeparametre} valgtId={id} />;
}
