// Gameplan (B30, 16. jul 2026) — "Baneguide" er det gamle navnet på funksjonen.
// Ruten lever videre kun som redirect for gamle lenker/bokmerker.
import { redirect } from "next/navigation";

export default function BaneguideRedirect(): never {
  redirect("/portal/gameplan");
}
