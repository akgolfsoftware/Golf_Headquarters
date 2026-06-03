/**
 * Auth · BankID (/auth/bankid) — v10-design.
 *
 * Rendrer <BankIdSkjerm> (v10-fasit fra au-bankid) som selvstendig sentrert kort
 * på cream-bakgrunn. Placeholder: BankID-pålogging kommer post-beta.
 *
 * Ren presentasjon — INGEN data-loader finnes eller trengs (statisk skjerm).
 * Komponenten rendres med sine defaults. Auth-layout (auth/layout.tsx) eier
 * rammen; dette er en offentlig auth-skjerm uten egen guard (som søsken-rutene).
 *
 * Byttet fra inline-markup til v10-komponenten BankIdSkjerm (design-godkjent
 * single source). Tekst/lenker er komponentens defaults — ingen liksom-data.
 */

import type { Metadata } from "next";
import { BankIdSkjerm } from "@/components/auth/bankid-skjerm";

export const metadata: Metadata = {
  title: "BankID-pålogging · AK Golf",
  description:
    "BankID-pålogging kommer post-BETA. Bruk e-post/passord eller Google for nå.",
};

export default function BankIDPage() {
  return <BankIdSkjerm />;
}
