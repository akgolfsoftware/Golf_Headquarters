import { redirect } from "next/navigation";

/**
 * /admin/approvals (gammel adresse) → /admin/godkjenninger.
 * Godkjenninger er kanonisk på norsk adresse.
 */
export default function ApprovalsRedirect(): never {
  redirect("/admin/godkjenninger");
}
