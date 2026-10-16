/**
 * AU01Innlogging — innlogging i Precision Athletics.
 * Kilde: ui_kits/konto/screens/AU-01-03.jsx, funksjonen AU01.
 * Magisk lenke, kode, passord og Google er beholdt.
 */
import { LoginView } from "@/components/auth/LoginView";

export const metadata = {
  title: "Logg inn · AK Golf HQ",
  description: "Logg inn med magisk lenke, kode eller passord.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginView />;
}
