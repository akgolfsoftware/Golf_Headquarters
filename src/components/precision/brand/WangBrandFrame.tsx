import type { ReactNode } from "react";
import { Montserrat, Quattrocento_Sans } from "next/font/google";
import "@/styles/wang-tokens.css";
import "@/styles/wang-app.css";
// WANG-merkevarens fonter — scoped til fellessiden (/team-wang), lastes ikke
// i resten av appen. Kanon: Claude Design «WANG Toppidrett Fredrikstad Golf v2».
const montserrat = Montserrat({
  variable: "--font-wang-brand",
  subsets: ["latin"],
  weight: ["300", "500", "600", "700", "800"],
  display: "swap",
});

const quattrocentoSans = Quattrocento_Sans({
  variable: "--font-wang-body",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

/** Samme WANG-profil på egne ruter og gruppens felles arbeidsverktøy. */
export function WangBrandFrame({ children }: { children: ReactNode }) {
  return <div data-org="wang" className={`pa-root wang-tp wang-app ${montserrat.variable} ${quattrocentoSans.variable} min-h-screen`}>{children}</div>;
}
