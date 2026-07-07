import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GFGK Junior — Treningsplan",
  description:
    "Løpende oversikt over treningstider og sesongperioder for GFGK Junior — Mini, Basis, Utvikling og Elite.",
  robots: { index: false, follow: false },
};

export default function GfgkJuniorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
