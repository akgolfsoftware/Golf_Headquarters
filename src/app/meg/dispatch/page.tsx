// Redirect til /admin/agencyos — vedtak Anders 13.08.2026 (nattrapport spm. 2):
// dispatch-flaten konsolideres inn i daglig brief, som igjen ble Hjem
// (MASTERPLAN 15.10, 31.08.2026). Gamle view-filer slettet.
import { redirect } from "next/navigation";

export default function DispatchRedirect() {
  redirect("/admin/agencyos");
}
