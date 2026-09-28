import { TnTurneringSkjerm } from "@/components/team-norway/skjermer/tn-turnering-skjerm";

/** TN-07 med valgt turnering. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-07. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TnTurneringSkjerm id={id} />;
}
