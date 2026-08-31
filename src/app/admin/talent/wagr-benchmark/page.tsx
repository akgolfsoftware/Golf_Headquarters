import { redirect } from "next/navigation";

/** /admin/talent/wagr-benchmark → /innsyn/talent/wagr-benchmark (MASTERPLAN 15.12). */
export default function AdminTalentWagrBenchmarkRedirect(): never {
  redirect("/innsyn/talent/wagr-benchmark");
}
