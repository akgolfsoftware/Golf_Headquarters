"use client";

/* Deles av /portal/coach og undersider. Innboks (PH-21) viser tegningens feil-tilstand;
   øvrige coach-ruter beholder V2Feil. */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { V2Feil } from "@/components/v2/feil-laste";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21Ramme } from "@/components/portal/precision/PH21Innboks";
import { erInnboksSti } from "@/lib/portal-okt/innboks-sti";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  useEffect(() => {
    console.error("[v2/error]", error.digest, error);
  }, [error]);

  if (!erInnboksSti(pathname)) return <V2Feil reset={reset} tilbakeHref="/portal" />;
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH21Ramme aktiv="msg" coachNavn={null} tilstand="feil" />
    </PlayerHQSkall>
  );
}
