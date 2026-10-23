import { TnReferansePlanleggerSkjerm } from "@/components/team-norway/skjermer/tn-referanse-planlegger-skjerm";

export const dynamic = "force-dynamic";

/** Referanse › Planlegger for én WAGR-spiller. */
export default async function Page({ params }: { params: Promise<{ wagrPlayerId: string }> }) {
  const { wagrPlayerId } = await params;
  return <TnReferansePlanleggerSkjerm wagrPlayerId={wagrPlayerId} />;
}
