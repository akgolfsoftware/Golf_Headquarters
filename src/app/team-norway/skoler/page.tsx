import { TnSkolerSkjerm } from "@/components/team-norway/skjermer/tn-skoler-skjerm";

export const metadata = {
  title: "Skoleoversikt · Team Norway Golf",
  description: "Skole og trinn for spillerne i landslagsgruppen.",
  robots: { index: false, follow: false },
};

/** TN-17. Fasit: Claude Design «Team Norway App delivery» (bc3e41fc), skjerm TN-17. */
export default function Page() {
  return <TnSkolerSkjerm />;
}
