import type { Metadata } from "next";

import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { avvisningsmelding, lesAvvisningsgrunn } from "@/lib/auth/domene-sperre";
import { WangLogin } from "./wang-login";
import { tryggWangRetursti } from "../_data/wang-retur-sti";

// Innloggingen trenger skript med samme nonce som forespørselens CSP.
// Et forhåndsbygd dokument har ingen forespørsel og kan ikke få denne verdien.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Logg inn — WANG Toppidrett Fredrikstad Golf",
  description:
    "Innlogging for elever og foreldre i golfgruppa ved WANG Toppidrett Fredrikstad.",
  robots: { index: false, follow: false },
};

export default async function WangLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; avvist?: string | string[] }>;
}) {
  const { next, avvist } = await searchParams;
  // Domenesperren (src/lib/auth/domene-sperre.ts) sender avviste hit med
  // ?avvist=domene|rolle. Da vises meldingen og en knapp for å logge ut.
  const grunn = lesAvvisningsgrunn(avvist);
  const bruker = grunn ? await getCurrentUserRaw() : null;
  return (
    <WangLogin
      retursti={tryggWangRetursti(next)}
      avvisning={grunn ? avvisningsmelding("wang", grunn) : null}
      innloggetSom={bruker?.email ?? null}
    />
  );
}
