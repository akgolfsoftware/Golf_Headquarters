import { TnReferanseSammenlignSkjerm } from "@/components/team-norway/skjermer/tn-referanse-flere-skjerm";

/** Referanse › Sammenlign (beslutninger.md §TEAM NORWAY ER BARE FOR TRENERE, punkt 3). */
export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string | string[] }> }) {
  const sp = await searchParams;
  return <TnReferanseSammenlignSkjerm id={sp.id} />;
}
