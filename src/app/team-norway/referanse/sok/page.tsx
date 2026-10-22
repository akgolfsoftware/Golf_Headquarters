import { TnReferanseSokSkjerm } from "@/components/team-norway/skjermer/tn-referanse-flere-skjerm";

/** Referanse › Søk (beslutninger.md §TEAM NORWAY ER BARE FOR TRENERE, punkt 3). */
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const sp = await searchParams;
  return <TnReferanseSokSkjerm q={sp.q} />;
}
