import { redirect } from "next/navigation";

/** /admin/talent/wagr-import → /innsyn/talent/wagr-import (MASTERPLAN 15.12). */
export default function AdminTalentWagrImportRedirect(): never {
  redirect("/innsyn/talent/wagr-import");
}
