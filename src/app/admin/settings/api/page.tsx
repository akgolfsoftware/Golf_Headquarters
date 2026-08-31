import { redirect } from "next/navigation";

/** /admin/settings/api (gammel adresse) → /admin/oppsett?fane=api (MASTERPLAN 15.3). */
export default function ApiRedirect(): never {
  redirect("/admin/oppsett?fane=api");
}
