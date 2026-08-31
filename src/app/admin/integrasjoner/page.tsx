import { redirect } from "next/navigation";

/** /admin/integrasjoner (gammel adresse) → /admin/oppsett?fane=integrasjoner (MASTERPLAN 15.3). */
export default function IntegrasjonerRedirect(): never {
  redirect("/admin/oppsett?fane=integrasjoner");
}
