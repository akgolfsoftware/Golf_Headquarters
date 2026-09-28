import { TnUttakSkjerm } from "@/components/team-norway/skjermer/tn-uttak-skjerm";

export const metadata = {
  title: "Uttak og kriterier · Team Norway Golf",
  description: "De tre uttakskriteriene og ranglisten med bruttotall.",
};

/** TN-05. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-05. */
export default function Page() {
  return <TnUttakSkjerm />;
}
