import type { ReactNode } from "react";
import { Schibsted_Grotesk } from "next/font/google";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { BindAktivBruker } from "@/components/auth/bind-aktiv-bruker";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  weight: ["400", "500", "600", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export default async function TeamNorwayLayout({ children }: { children: ReactNode }) {
  const bruker = await requirePortalUser({
    allow: ["COACH", "ADMIN", "PLAYER", "PARENT"],
    kreverTilgang: "INGEN",
  });
  return (
    <div className={schibstedGrotesk.variable}>
      <BindAktivBruker userId={bruker.id} />
      {children}
    </div>
  );
}
