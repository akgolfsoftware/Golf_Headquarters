import { redirect } from "next/navigation";

/**
 * /admin/finance (gammel adresse) → /admin/agencyos/okonomi.
 * Økonomi-flaten i AgencyOS-nav (AGENCYOS_NAV i v2/shell) er kanonisk.
 */
export default function FinanceRedirect(): never {
  redirect("/admin/agencyos/okonomi");
}
