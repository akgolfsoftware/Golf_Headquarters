/**
 * Auth · Logget ut (/auth/logget-ut) — v2-redesign (2026-07-10).
 *
 * Rendrer <LoggetUtV2> (retning C «Presis») som selvstendig sentrert kort på
 * mørk auth-flate, INGEN app-sidebar. Erstatter gamle <LoggetUtSkjerm>
 * (v10-design) — se src/components/portal/v2/LoggetUtV2.tsx.
 *
 * Rent presentasjonelt — ingen Prisma/DB/auth/loader. Komponenten rendres med
 * de ekte lenkene for denne ruten; ingen liksom-data. Gamle
 * src/components/auth/logget-ut.tsx står urørt som fallback.
 */

import type { Metadata } from "next";
import { LoggetUtV2 } from "@/components/portal/v2/LoggetUtV2";

export const metadata: Metadata = {
  title: "Logget ut · AK Golf",
  description: "Du er logget ut av AK Golf. Logg inn igjen når du er klar.",
};

export default function LoggetUtPage() {
  return (
    <LoggetUtV2
      hjemHref="/"
      loggInnHref="/auth/login"
      marketingHref="/"
      feedbackEpost="post@akgolf.no"
    />
  );
}
