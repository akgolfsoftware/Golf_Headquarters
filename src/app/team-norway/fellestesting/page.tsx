import { TnFellestestingSkjerm } from "@/components/team-norway/skjermer/tn-fellestesting-skjerm";

/** TN-03. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-03. */
export default async function Page({ searchParams }: { searchParams: Promise<{ dag?: string }> }) {
  const { dag } = await searchParams;
  return <TnFellestestingSkjerm dagId={dag} />;
}
