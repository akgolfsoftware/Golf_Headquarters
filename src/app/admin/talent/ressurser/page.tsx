import { redirect } from "next/navigation";

/** /admin/talent/ressurser → /innsyn/talent/ressurser (MASTERPLAN 15.12). */
export default function AdminTalentRessurserRedirect(): never {
  redirect("/innsyn/talent/ressurser");
}
