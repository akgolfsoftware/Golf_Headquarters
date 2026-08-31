import { redirect } from "next/navigation";

/** /admin/talent/discovery → /innsyn/talent/discovery (MASTERPLAN 15.12). */
export default function AdminTalentDiscoveryRedirect(): never {
  redirect("/innsyn/talent/discovery");
}
