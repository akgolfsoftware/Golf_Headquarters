import { LoginPrecisionView } from "@/components/auth/LoginPrecisionView";

export const metadata = {
  title: "Logg inn · AK Golf HQ",
  description: "Logg inn med magisk lenke, kode eller passord.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginPrecisionView />;
}
