import { redirect } from "next/navigation";

/** /admin/talent/sammenligning → /innsyn/talent/sammenligning (MASTERPLAN 15.12). */
export default function AdminTalentSammenligningRedirect(): never {
  redirect("/innsyn/talent/sammenligning");
}
