import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter (variable). Eneste font i prosjektet — endres aldri.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AK Golf HQ",
  description: "AK Golf Group — booking, coaching og spillerutvikling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-dark-bg text-white">
        {children}
      </body>
    </html>
  );
}
