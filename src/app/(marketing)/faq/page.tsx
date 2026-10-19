/**
 * Spørsmål og svar (/faq) i «AK Golf Precision Athletics». OFFENTLIG: ingen auth-guard.
 */

import type { Metadata } from "next";
import { FaqPrecision } from "@/components/marketing/ds-sider/FaqPrecision";

export const metadata: Metadata = {
  title: "Ofte stilte spørsmål · AK Golf Academy",
  description:
    "Svar på de vanligste spørsmålene om coaching, booking, betaling og PlayerHQ.",
};

export default function FaqPage() {
  return <FaqPrecision />;
}
