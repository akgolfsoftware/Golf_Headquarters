import type { Metadata } from "next";
import { GavekortTakk } from "@/components/booking/precision/GavekortKjop";

export const metadata: Metadata = {
  title: "Takk · Gavekort",
  robots: { index: false, follow: false },
};

export default function GavekortTakkPage() {
  return <GavekortTakk />;
}
