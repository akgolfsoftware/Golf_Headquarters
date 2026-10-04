/**
 * Auth · BankID (/auth/bankid) — AU01BankId.
 * Ærlig placeholder: BankID finnes ikke ennå. CTA går til /auth/login.
 */

import type { Metadata } from "next";
import { BankIDV2 } from "@/components/portal/v2/BankIDV2";

export const metadata: Metadata = {
  title: "BankID-pålogging · AK Golf",
  description:
    "BankID-pålogging kommer post-BETA. Bruk e-post/passord eller Google for nå.",
};

export default function BankIDPage() {
  return <BankIDV2 />;
}
