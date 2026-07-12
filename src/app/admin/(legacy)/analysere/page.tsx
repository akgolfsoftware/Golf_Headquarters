import { redirect } from "next/navigation";

/**
 * /admin/analysere (hub) → /admin/analyse (B7, 2026-07-12).
 * Lenke-hubben er overflødig etter full seksjonsnav (Innsikt i railen +
 * Mer-menyen dekker alle under-flatene). Compliance-undersiden består.
 */
export default function AnalysereRedirect(): never {
  redirect("/admin/analyse");
}
