import type { Metadata } from "next";
import "./deck.css";

export const metadata: Metadata = {
  title: "GFGK Foreldremøte — Differensiering i elitegruppa",
  description:
    "Hvorfor vi deler elitegruppa i mindre treningsgrupper, og hva det betyr for hver spiller. Med komplett resultatoversikt for sesongen 2025–2026.",
  robots: { index: false, follow: false },
};

export default function TeamGfgkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
