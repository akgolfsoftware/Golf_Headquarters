// PH25Oppgrader — Precision Athletics. Videresending til abonnement med låst-flate-varsel.
import { redirect } from "next/navigation";

export default function OppgraderPage() {
  redirect("/portal/meg/abonnement?fra=laast");
}
