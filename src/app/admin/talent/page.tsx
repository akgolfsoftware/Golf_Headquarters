import { redirect } from "next/navigation";

/**
 * /admin/talent → /innsyn/talent (MASTERPLAN 15.12, 2026-08-31).
 * Talent-flatene var aldri en coach-funksjon — de er organisasjonenes innsyn
 * i spillere. Flyttet ut av AgencyOS, alle gamle adresser er redirects.
 */
export default function AdminTalentRedirect(): never {
  redirect("/innsyn/talent");
}
