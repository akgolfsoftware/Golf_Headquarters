// Redirect til /admin/agencyos — MASTERPLAN 15.10 (31.08.2026): Daglig brief
// er slått sammen inn i Hjem. Se TrainLockCockpit.tsx for hva som ble med.
import { redirect } from "next/navigation";

export default function DagligBriefRedirect() {
  redirect("/admin/agencyos");
}
