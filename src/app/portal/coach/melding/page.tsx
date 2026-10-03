/** Meldinger bor nå i Innboks (PH-21) på /portal/coach. Gammel adresse er en videresending. */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function MeldingerRedirect() {
  await requirePortalUser();
  redirect("/portal/coach");
}
