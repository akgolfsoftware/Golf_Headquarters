import { redirect } from "next/navigation";

/**
 * /portal/analyse (gammel adresse) → /portal/analysere.
 * Analysere er kanonisk analyse-flate i PlayerHQ.
 */
export default function AnalyseRedirect(): never {
  redirect("/portal/analysere");
}
