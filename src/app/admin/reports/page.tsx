/**
 * Rapporter er flettet inn i økonomiflaten (EC-01 / C10, JA 27.08).
 */

import { redirect } from "next/navigation";

export default function ReportsRedirectPage() {
  redirect("/admin/agencyos/okonomi#rapporter");
}
