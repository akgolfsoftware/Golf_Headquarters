/**
 * AU03NyttPassord — sett nytt passord i Precision Athletics.
 * Kilde: ui_kits/konto/screens/AU-01-03.jsx, funksjonen AU03.
 * updateUser, minst 8 tegn og likhetssjekk er beholdt.
 */
import { ResetPasswordV2 } from "@/components/portal/v2/ResetPasswordV2";

export default function ResetPasswordPage() {
  return <ResetPasswordV2 />;
}
