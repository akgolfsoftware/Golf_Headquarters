import { TnFellestestingSkjerm } from "@/components/team-norway/skjermer/tn-fellestesting-skjerm";

export const metadata = {
  title: "Fellestesting · Team Norway Golf",
  description: "Testdager, minstekrav per klasse og føring av resultater.",
};

/** TN-03. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-03. */
export default async function Page({ searchParams }: { searchParams: Promise<{ dag?: string }> }) {
  const { dag } = await searchParams;
  return <TnFellestestingSkjerm dagId={dag} />;
}
