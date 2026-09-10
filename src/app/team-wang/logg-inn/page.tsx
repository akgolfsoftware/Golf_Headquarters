import type { Metadata } from "next";

import { WangLogin } from "./wang-login";

// Innloggingen trenger skript med samme nonce som forespørselens CSP.
// Et forhåndsbygd dokument har ingen forespørsel og kan ikke få denne verdien.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Logg inn — WANG Toppidrett Fredrikstad Golf",
  description:
    "Innlogging for elever og foreldre i golfgruppa ved WANG Toppidrett Fredrikstad.",
  robots: { index: false, follow: false },
};

export default function WangLoginPage() {
  return <WangLogin />;
}
