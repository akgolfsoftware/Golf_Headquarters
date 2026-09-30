import type { Metadata } from "next";
import { AU03Nytt } from "@/components/auth/precision/AU03Passord";

export const metadata: Metadata = { title: "Sett nytt passord · AK Golf HQ" };

/**
 * /auth/reset-password — AU-03 i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/konto/screens/AU-01-03.jsx). Brukeren lander her fra lenken i e-posten.
 * Samme logikk som før (Supabase updateUser, deretter /portal).
 */
export default function ResetPasswordPage() {
  return <AU03Nytt />;
}
