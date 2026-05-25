/**
 * /stats/verktoy/tour-ekvivalent
 *
 * Input: score + slope + CR → output: Tour-ekvivalent score.
 */

import "../../stats.css";
import type { Metadata } from "next";
import { TourEkvivalentClient } from "./client";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Tour-ekvivalent kalkulator | AK Golf Stats",
  description: "Hva tilsvarer scoren din på en PGA Tour-bane? WHS-basert utregning med slope og course rating.",
  alternates: { canonical: "https://akgolf.no/stats/verktoy/tour-ekvivalent" },
};

export default function TourEkvivalentPage() {
  return <TourEkvivalentClient />;
}
