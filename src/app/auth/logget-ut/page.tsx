/**
 * Auth · Logget ut (/auth/logget-ut) — v10-design.
 *
 * Rendrer <LoggetUtSkjerm> (v10-fasit fra [historisk fasit, fjernet 2026-07-03] _screens/
 * au-loggetut.png) som selvstendig sentrert kort på cream-bakgrunn, INGEN
 * app-sidebar.
 *
 * Rent presentasjonelt — ingen Prisma/DB/auth/loader. Komponenten rendres med
 * de ekte lenkene for denne ruten; ingen liksom-data.
 *
 * Bolk (3. juni): byttet fra hand-bygget duplikat til v10-komponenten
 * <LoggetUtSkjerm> for å eliminere design-drift (knappehøyde, font-størrelse,
 * bakgrunn, footer-divider).
 */

import type { Metadata } from "next";
import { LoggetUtSkjerm } from "@/components/auth/logget-ut";

export const metadata: Metadata = {
  title: "Logget ut · AK Golf",
  description: "Du er logget ut av AK Golf. Logg inn igjen når du er klar.",
};

export default function LoggetUtPage() {
  return (
    <LoggetUtSkjerm
      hjemHref="/"
      loggInnHref="/auth/login"
      marketingHref="/"
      feedbackEpost="post@akgolf.no"
    />
  );
}
