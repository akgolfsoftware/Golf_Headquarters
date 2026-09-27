import { TnDokumenterSkjerm } from "@/components/team-norway/skjermer/tn-dokumenter-skjerm";

/** TN-14. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-14. */
export default async function Page({ params, searchParams }: { params: Promise<{ groupId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { groupId } = await params;
  return <TnDokumenterSkjerm groupId={groupId} sokeparametre={await searchParams} />;
}
