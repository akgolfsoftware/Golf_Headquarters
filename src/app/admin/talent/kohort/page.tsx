import { redirect } from "next/navigation";

/** /admin/talent/kohort → /innsyn/talent/kohort (MASTERPLAN 15.12). */
export default function AdminTalentKohortRedirect(): never {
  redirect("/innsyn/talent/kohort");
}
