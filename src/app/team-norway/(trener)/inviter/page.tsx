import { permanentRedirect } from "next/navigation";

import { TN_RUTER } from "@/components/team-norway/tn-ruter";

/** Inviter spiller er flyttet inn i TN-19 Tilgang og samtykke (Team Norway App delivery, 28.09). */
export default function Page() {
  permanentRedirect(`${TN_RUTER.tilgang}#inviter`);
}
