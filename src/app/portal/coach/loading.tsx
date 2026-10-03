"use client";

/* Innboks (PH-21) viser tegningens laster-tilstand; øvrige coach-ruter beholder v2-skjelettet. */

import { usePathname } from "next/navigation";
import { V2Laster } from "@/components/v2/laster";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21Ramme } from "@/components/portal/precision/PH21Innboks";
import { erInnboksSti } from "@/lib/portal-okt/innboks-sti";

export default function Loading() {
  const pathname = usePathname();
  if (!erInnboksSti(pathname)) return <V2Laster variant="kort" />;
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH21Ramme aktiv="msg" coachNavn={null} tilstand="laster" />
    </PlayerHQSkall>
  );
}
