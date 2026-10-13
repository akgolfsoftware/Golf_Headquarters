import type { ReactNode } from "react";
import { Jost, Lato } from "next/font/google";
const jost = Jost({
  variable: "--font-jost",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

/** Team Norway beholder Jost/Lato også når gruppeverktøy åpnes. */
export function TnBrandFrame({ children }: { children: ReactNode }) {
  return <div data-org="team-norway" className={`pa-root tn-app ${jost.variable} ${lato.variable}`}>{children}</div>;
}
