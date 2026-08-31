import { redirect } from "next/navigation";

/** /admin/settings/security (gammel adresse) → /admin/oppsett?fane=sikkerhet (MASTERPLAN 15.3). */
export default function SecurityRedirect(): never {
  redirect("/admin/oppsett?fane=sikkerhet");
}
