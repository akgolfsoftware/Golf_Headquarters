// Redirect til /admin/brief — vedtak Anders 13.08.2026 (nattrapport spm. 2):
// morgenbrief-flaten konsolideres inn i daglig brief. Gamle view-filer slettet.
import { redirect } from "next/navigation";

export default function MorgenbriefRedirect() {
  redirect("/admin/brief");
}
