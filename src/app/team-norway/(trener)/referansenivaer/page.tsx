import { TnReferansenivaerSkjerm } from "@/components/team-norway/tn-uttak-plan-gruppe-admin/tn-referansenivaer";

export const metadata = { title: "Referansenivåer · Team Norway Golf" };

/** TN-18. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm «referanse». */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <TnReferansenivaerSkjerm sokeparametre={await searchParams} />;
}
