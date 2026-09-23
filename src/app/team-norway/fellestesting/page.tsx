import { TnRegistrertSkjerm } from "@/components/team-norway/tn-registrerte-skjermer";

/** TN-03. Fasit: designsystem/team-norway/templates/tn-fellestesting/TnFellestesting.dc.html */
export default async function Page({ searchParams }: { searchParams: Promise<{ dag?: string }> }) {
  const { dag } = await searchParams;
  return <TnRegistrertSkjerm skjerm="fellestesting" dagId={dag} />;
}
