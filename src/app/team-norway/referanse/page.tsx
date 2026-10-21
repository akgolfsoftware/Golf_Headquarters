import { TnReferanseWagrSkjerm } from "@/components/team-norway/skjermer/tn-referanse-wagr-skjerm";

/** Referanse › WAGR (beslutninger.md §TEAM NORWAY ER BARE FOR TRENERE, punkt 3). */
export default async function Page({ searchParams }: { searchParams: Promise<{ gruppe?: string }> }) {
  const sp = await searchParams;
  return <TnReferanseWagrSkjerm gruppeId={sp.gruppe} />;
}
