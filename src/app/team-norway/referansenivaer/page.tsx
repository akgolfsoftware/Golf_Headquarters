import { permanentRedirect } from "next/navigation";

/** Gammel adresse for Referansenivåer. Siden er Referanse › Tester (wireframes utkast-tn/trenerflate §3). */
export default function Page() {
  permanentRedirect("/team-norway/referanse/tester");
}
