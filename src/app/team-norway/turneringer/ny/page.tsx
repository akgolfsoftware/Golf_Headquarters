import { redirect } from "next/navigation";

/**
 * Gammel adresse for «Legg inn turnering». Spilleren gjør dette i PlayerHQ (beslutninger.md §TEAM NORWAY ER
 * BARE FOR TRENERE, 21.10: «/team-norway/turneringer/ny sender til /portal/tren/turneringer»).
 */
export default function Page() {
  redirect("/portal/tren/turneringer");
}
