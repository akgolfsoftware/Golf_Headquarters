import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Montserrat, Quattrocento_Sans } from "next/font/google";

import "@/styles/wang-trener-tokens.css";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { WangSkall } from "@/components/wang/trener/wang-skall";

/**
 * WANG-trenerflaten: alle skjermene for Sportssjef og Trener ligger i denne
 * rutegruppen og får skallet herfra. Fellessiden (src/app/team-wang/page.tsx)
 * og innloggingen står utenfor og får aldri skallet.
 *
 * Porten (krevWangTrener) kjøres her OG i hver skjerm, fordi en delt layout
 * ikke kjøres på nytt ved navigering mellom sider.
 *
 * Skrifter: Montserrat (titler, tall, etiketter) og Quattrocento Sans
 * (mengdetekst) med vektene tegningen bruker. Egne variabler, så fellessidens
 * skriftoppsett i ../layout.tsx står urørt.
 */
const montserrat = Montserrat({
  variable: "--font-wtr-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
});

const quattrocento = Quattrocento_Sans({
  variable: "--font-wtr-body",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "WANG Golf — trenerflate",
  description: "Trenerflaten for sportssjef og trenere i golfgruppa ved WANG Toppidrett.",
  robots: { index: false, follow: false },
};

export default async function WangTrenerLayout({ children }: { children: ReactNode }) {
  const { bruker, rolle, erDemo } = await krevWangTrener();
  return (
    <div className={`wang-tr ${montserrat.variable} ${quattrocento.variable}`}>
      <WangSkall rolle={rolle} brukerNavn={bruker.name} sted={erDemo ? "Golf · Demo" : "Golf · Fredrikstad"} erDemo={erDemo}>
        {children}
      </WangSkall>
    </div>
  );
}
