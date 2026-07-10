/**
 * Marketing Cookies (v2, retning C). Offentlig: ingen auth-guard.
 * Juridisk tekst uendret fra tidligere (mlegacy)/cookies, kun v2-ramme.
 */

import type { Metadata } from "next";
import { MarkedCookiesV2 } from "@/components/marketing/v2/MarkedCookiesV2";

export const metadata: Metadata = {
  title: "Cookies · AK Golf Academy",
  description:
    "Slik bruker AK Golf cookies. Oversikt over kategorier og hvordan du kan styre innstillingene dine.",
};

export default function CookiesPage() {
  return <MarkedCookiesV2 />;
}
