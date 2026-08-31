import { redirect } from "next/navigation";

/** /admin/settings/periode-navn (gammel adresse) → /admin/oppsett?fane=perioder (MASTERPLAN 15.3). */
export default function PeriodeNavnRedirect(): never {
  redirect("/admin/oppsett?fane=perioder");
}
