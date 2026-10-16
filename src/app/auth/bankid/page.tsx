/**
 * /auth/bankid finnes ikke lenger: innlogging er bare Google og e-post med passord
 * (beslutning 15.10.2026, §INNLOGGING BARE MED GOOGLE OG PASSORD). Gamle lenker sendes til innloggingen.
 */
import { redirect } from "next/navigation";

export default function BankIDPage() {
  redirect("/auth/login");
}
