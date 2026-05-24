// Auth-rute-layout — kun for å sette robots-metadata på alle auth-sider.
// Vi vil ikke at signup/login/onboarding/guardian-consent/samtykke-venter
// skal indekseres av søkemotorer (P15 — datasikkerhets-audit + GDPR).

import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
