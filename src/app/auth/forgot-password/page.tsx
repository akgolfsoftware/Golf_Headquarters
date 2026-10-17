/** AU-03 Glemt passord i nytt design. resetPasswordForEmail med retur til /auth/reset-password. */
import { GlemtPassord } from "@/components/auth/precision/KontoSkjermer";

export default function ForgotPasswordPage() {
  return <GlemtPassord />;
}
