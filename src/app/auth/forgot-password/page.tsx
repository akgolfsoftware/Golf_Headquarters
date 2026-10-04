/**
 * AU03Glemt — glemt passord i Precision Athletics.
 * Kilde: ui_kits/konto/screens/AU-01-03.jsx, funksjonen AU03.
 * resetPasswordForEmail og redirectTo /auth/reset-password er beholdt.
 */
import { ForgotPasswordV2 } from "@/components/portal/v2/ForgotPasswordV2";

export default function ForgotPasswordPage() {
  return <ForgotPasswordV2 />;
}
