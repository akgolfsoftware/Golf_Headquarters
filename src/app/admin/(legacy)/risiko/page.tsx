import { redirect } from "next/navigation";

/** /admin/risiko (legacy) → AgencyOS cockpit (v2). */
export default function RisikoRedirect(): never {
  redirect("/admin/agencyos");
}
