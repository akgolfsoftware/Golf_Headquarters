import type { Metadata } from "next";
import { Montserrat, Quattrocento_Sans } from "next/font/google";

import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { avvisningsmelding, lesAvvisningsgrunn } from "@/lib/auth/domene-sperre";
import { WANG_LOGG_INN, WANG_START } from "@/lib/wang/wang-ruter";
import { WangLogin } from "./wang-login";
import { tryggWangRetursti } from "../_data/wang-retur-sti";

// Innloggingen trenger skript med samme nonce som forespørselens CSP.
// Et forhåndsbygd dokument har ingen forespørsel og kan ikke få denne verdien.
export const dynamic = "force-dynamic";

// Samme skrifter og vekter som trenerflaten ((trener)/layout.tsx).
const montserrat = Montserrat({ variable: "--font-wtr-display", subsets: ["latin"], weight: ["300", "400", "500", "700", "800"], display: "swap" });
const quattrocento = Quattrocento_Sans({ variable: "--font-wtr-body", subsets: ["latin"], weight: ["400", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Logg inn — WANG Golf trenerflate",
  description: "Innlogging for sportssjef og trenere i golfgruppa ved WANG Toppidrett.",
  robots: { index: false, follow: false },
};

/** WANG-24 Logg inn (/team-wang/logg-inn). Står utenfor rutegruppen (trener) og er åpen. */
export default async function WangLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; avvist?: string | string[]; del?: string | string[] }>;
}) {
  const { next, avvist, del } = await searchParams;
  // Domenesperren (src/lib/auth/domene-sperre.ts) sender avviste hit med
  // ?avvist=domene|rolle. Da vises meldingen og en knapp for å logge ut.
  const grunn = lesAvvisningsgrunn(avvist);
  const bruker = grunn ? await getCurrentUserRaw() : null;
  // Uten ?next= går en trener rett til trenerflaten, ikke til fellessiden.
  const retursti = typeof next === "string" && next.length > 0 ? tryggWangRetursti(next) : WANG_START;

  const behold = new URLSearchParams();
  if (typeof next === "string" && next) behold.set("next", next);
  if (grunn) behold.set("avvist", grunn);
  const loginSok = behold.toString();
  const hvemSok = new URLSearchParams(behold);
  hvemSok.set("del", "hvem");

  return (
    <div className={`${montserrat.variable} ${quattrocento.variable}`}>
      <WangLogin
        retursti={retursti}
        avvisning={grunn ? avvisningsmelding("wang", grunn) : null}
        innloggetSom={bruker?.email ?? null}
        del={del === "hvem" ? "hvem" : "login"}
        delHref={{ login: loginSok ? `${WANG_LOGG_INN}?${loginSok}` : WANG_LOGG_INN, hvem: `${WANG_LOGG_INN}?${hvemSok.toString()}` }}
      />
    </div>
  );
}
