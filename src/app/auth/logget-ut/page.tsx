/**
 * Auth · Logget ut (/auth/logget-ut) — v2-redesign (2026-07-10).
 */

import type { Metadata } from "next";
import { LoggetUtV2 } from "@/components/portal/v2/LoggetUtV2";
import { ClearPwaCaches } from "@/components/auth/clear-pwa-caches";
import { UlagretKladdBanner } from "@/components/auth/ulagret-kladd-banner";

export const metadata: Metadata = {
  title: "Logget ut · AK Golf",
  description: "Du er logget ut av AK Golf. Logg inn igjen når du er klar.",
};

export default function LoggetUtPage() {
  return (
    <>
      <ClearPwaCaches />
      <UlagretKladdBanner />
      <LoggetUtV2
        hjemHref="/"
        loggInnHref="/auth/login"
        marketingHref="/"
        feedbackEpost="post@akgolf.no"
      />
    </>
  );
}
