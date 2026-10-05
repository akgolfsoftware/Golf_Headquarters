/**
 * AU01LoggetUt — utlogget flate i Precision Athletics.
 * Kilde: ui_kits/konto/screens/AU-01-03.jsx, utlogget tilstand i AU01.
 * Samme lenker. Hurtigbufferen tømmes som før.
 */

import type { Metadata } from "next";
import { LoggetUtV2 } from "@/components/portal/v2/LoggetUtV2";
import { ClearPwaCaches } from "@/components/auth/clear-pwa-caches";

export const metadata: Metadata = {
  title: "Logget ut · AK Golf",
  description: "Du er logget ut av AK Golf. Logg inn igjen når du er klar.",
};

export default function LoggetUtPage() {
  return (
    <>
      <ClearPwaCaches />
      <LoggetUtV2 hjemHref="/" loggInnHref="/auth/login" marketingHref="/" feedbackEpost="post@akgolf.no" />
    </>
  );
}
