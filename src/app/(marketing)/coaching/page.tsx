/**
 * Coaching (/coaching) i «AK Golf Precision Athletics». OFFENTLIG: ingen auth-guard.
 */
import type { Metadata } from "next";
import { CoachingPrecision } from "@/components/marketing/ds-sider/CoachingPrecision";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Coaching · AK Golf Academy",
  description:
    "Coaching i Fredrikstad: enkelttimer, Flex Duo, gruppe og de faste pakkene Performance og Performance Pro, med plan og oppfølging i PlayerHQ.",
};

export default function CoachingPage() {
  return <CoachingPrecision />;
}
