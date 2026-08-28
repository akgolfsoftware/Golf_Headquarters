import { redirect } from "next/navigation";

/** Gammel adresse — TM-01 bor under Analyse. */
export default function TrackManListeRedirect() {
  redirect("/portal/analysere/trackman");
}
