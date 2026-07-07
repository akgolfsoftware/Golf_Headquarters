import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WANG Toppidrett Fredrikstad — Treningsplan",
  description:
    "Løpende oversikt over treningstider, sesongperioder og samlinger for WANG Toppidrett Golf Fredrikstad.",
  robots: { index: false, follow: false },
};

export default function TeamWangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
