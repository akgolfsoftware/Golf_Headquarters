import { redirect } from "next/navigation";

/** /admin/ai (legacy) → AgencyOS cockpit (v2). */
export default function AiRedirect(): never {
  redirect("/admin/agencyos");
}
