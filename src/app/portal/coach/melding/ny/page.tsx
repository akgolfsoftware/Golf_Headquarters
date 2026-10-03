/** Ny melding skrives nå i Innboks (PH-21) på /portal/coach. Gammel adresse er en videresending. */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function NyMeldingRedirect() {
  await requirePortalUser();
  redirect("/portal/coach");
}
