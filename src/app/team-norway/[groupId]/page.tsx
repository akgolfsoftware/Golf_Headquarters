import { TnGruppeposterSkjerm } from "@/components/team-norway/skjermer/tn-gruppeposter-skjerm";

/** TN-13. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-13. */
export default async function Page({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  return <TnGruppeposterSkjerm groupId={groupId} />;
}
