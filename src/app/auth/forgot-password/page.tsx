import type { Metadata } from "next";
import { AU03Glemt } from "@/components/auth/precision/AU03Passord";

export const metadata: Metadata = { title: "Glemt passord · AK Golf HQ" };

/**
 * /auth/forgot-password — AU-03 i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/konto/screens/AU-01-03.jsx). Samme reset-logikk som før
 * (Supabase resetPasswordForEmail, redirectTo /auth/reset-password).
 */
export default function ForgotPasswordPage() {
  return <AU03Glemt />;
}
