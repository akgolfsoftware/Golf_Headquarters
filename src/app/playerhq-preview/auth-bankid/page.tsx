/**
 * Preview-rute (offentlig, ingen auth) for Auth · BankID.
 * Rendrer <BankIdSkjerm> som selvstendig full side — sentrert kort på
 * cream-bakgrunn, INGEN app-sidebar. Matcher v10-fasiten
 * (public/design-handover/_screens/au-bankid.png).
 *
 * INGEN Prisma/DB/auth her — kun presentasjon med hardkodet demo-data.
 */

import type { Metadata } from "next";
import { BankIdSkjerm } from "@/components/auth/bankid-skjerm";

export const metadata: Metadata = {
  title: "BankID-pålogging · AK Golf",
  description:
    "BankID-pålogging kommer post-BETA. Bruk e-post, passord eller Google for nå.",
};

// ── Demo-data — matcher au-bankid.png (placeholder, kommer post-beta) ──
const demoBankId = {
  eyebrow: "BANKID · KOMMER POST-BETA",
  titlePrefix: "Verifiser med ",
  titleEmphasis: "BankID",
  description:
    "BankID-pålogging kommer på plass etter beta-perioden. Bruk e-post, passord eller Google for nå.",
  ctaLabel: "Tilbake til vanlig login →",
  ctaHref: "/auth/login",
} as const;

export default function AuthBankIdPreview() {
  return <BankIdSkjerm {...demoBankId} />;
}
