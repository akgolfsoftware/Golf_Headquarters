import { TnSpillerprofilSkjerm } from "@/components/team-norway/skjermer/tn-spillerprofil-skjerm";

/** TN-02. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-02. */
export default async function SpillerOversiktPage({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  return <TnSpillerprofilSkjerm spillerId={spillerId} />;
}
