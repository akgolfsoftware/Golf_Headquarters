import { redirect } from "next/navigation";

/** /admin/talent/radar → /innsyn/talent/radar (MASTERPLAN 15.12). */
export default function AdminTalentRadarRedirect(): never {
  redirect("/innsyn/talent/radar");
}
