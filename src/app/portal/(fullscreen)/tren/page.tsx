// /portal/tren — historisk URL for den gamle, statiske demo-workbenchen
// ("Øyvind R · uke 21" med oppdiktet uke/mål/streak/coach-chat). Den flaten
// hadde ingen ekte datakobling og er fjernet. All planlegging går nå gjennom
// den delte, data-koblede Workbench-kjernen på /portal/planlegge
// (WorkbenchHybrid med ekte Prisma-data + auth-guards).
//
// Vi beholder ruten byggbar ved å redirecte hit, slik at alle eksisterende
// lenker til /portal/tren lander på den ekte planleggingsflaten i stedet for
// fabrikkerte spillerdata.

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export const metadata = {
  title: "Planlegge",
};

export default async function WorkbenchPage() {
  await requirePortalUser();
  redirect("/portal/planlegge");
}
