/**
 * Auth · BankID (/auth/bankid) — fersk Claude Design-fasit (juni 2026).
 *
 * Rendrer <BankIdSkjerm> (ph-auth.jsx → ABankID, start-fasen som visuelt
 * skall) som selvstendig sentrert kort på cream-bakgrunn.
 * Placeholder: BankID-pålogging kommer post-beta.
 *
 * Ren presentasjon — INGEN data-loader finnes eller trengs (statisk skjerm).
 * Komponenten rendres med sine defaults. Auth-layout (auth/layout.tsx) eier
 * rammen; dette er en offentlig auth-skjerm uten egen guard (som søsken-rutene).
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
