import { TnDatagolfSkjerm } from "@/components/team-norway/skjermer/tn-datagolf-skjerm";
import { krevDataGolfBruker } from "@/lib/auth/datagolf-tilgang";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Data Golf · Team Norway Golf",
  description: "Proffenes tall fra Data Golf, bare for trenere.",
};

/** Pakke 9 Data Golf for trener. Bare coach og admin (krevDataGolfBruker). */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await krevDataGolfBruker("/team-norway/datagolf");
  return <TnDatagolfSkjerm sokeparametre={await searchParams} />;
}
