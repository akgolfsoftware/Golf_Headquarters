import { redirect } from "next/navigation";

/** /admin/talent/region → /innsyn/talent/region (MASTERPLAN 15.12). */
export default function AdminTalentRegionRedirect(): never {
  redirect("/innsyn/talent/region");
}
