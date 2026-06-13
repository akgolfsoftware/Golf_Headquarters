import { redirect } from "next/navigation";

// Dataeksport bor på /innstillinger/personvern (ekte exportUserData-flyt).
// Denne ruta beholdes som redirect for gamle lenker/bokmerker/⌘K så ingen
// havner på en «kommer snart»-plassholder ved siden av den ekte funksjonen.
export default function EksportRedirect() {
  redirect("/portal/meg/innstillinger/personvern");
}
