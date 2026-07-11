/**
 * Auth · BankID (/auth/bankid) — v2-redesign (2026-07-10).
 *
 * Rendrer <BankIDV2> (retning C «Presis») som selvstendig sentrert kort på
 * mørk auth-flate. Erstatter gamle <BankIdSkjerm> — se
 * src/components/portal/v2/BankIDV2.tsx. Placeholder: BankID-pålogging
 * kommer post-beta, CTA peker tilbake til vanlig login (samme funksjon).
 *
 * Ren presentasjon — INGEN data-loader finnes eller trengs (statisk skjerm).
 * Auth-layout (auth/layout.tsx) eier rammen; dette er en offentlig
 * auth-skjerm uten egen guard (som søsken-rutene). Gamle
 * src/components/auth/bankid-skjerm.tsx står urørt som fallback.
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
