import type { Metadata } from "next";
import { Montserrat, Quattrocento_Sans } from "next/font/google";

import "@/styles/wang-tokens.css";

// WANG-merkevarens fonter — scoped til fellessiden (/team-wang), lastes ikke
// i resten av appen. Kanon: Claude Design «WANG Toppidrett Fredrikstad Golf v2».
const montserrat = Montserrat({
  variable: "--font-wang-brand",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const quattrocentoSans = Quattrocento_Sans({
  variable: "--font-wang-body",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WANG Toppidrett Fredrikstad — Golf",
  description:
    "Fellesside for elever og foreldre i golfgruppa ved WANG Toppidrett Fredrikstad — sesongplan, kalender, samlinger, skole og foreldreinfo.",
  // Elevrelatert innhold — holdes utenfor søkemotorer inntil Anders sier noe annet.
  robots: { index: false, follow: false },
};

export default function TeamWangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`wang-tp ${montserrat.variable} ${quattrocentoSans.variable} min-h-screen`}
    >
      {children}
    </div>
  );
}
