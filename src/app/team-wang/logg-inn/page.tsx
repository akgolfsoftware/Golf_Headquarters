import type { Metadata } from "next";

import { WangLogin } from "./wang-login";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Logg inn — WANG Toppidrett Fredrikstad Golf",
  description: "Innlogging for elever og foreldre i golfgruppa ved WANG Toppidrett Fredrikstad.",
  robots: { index: false, follow: false },
};

export default function WangLoginPage() {
  return <WangLogin />;
}
