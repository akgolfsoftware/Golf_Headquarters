import { redirect } from "next/navigation";

/** /admin/klubb/innstillinger (gammel adresse) → /admin/oppsett?fane=klubb (MASTERPLAN 15.3). */
export default function KlubbInnstillingerRedirect(): never {
  redirect("/admin/oppsett?fane=klubb");
}
