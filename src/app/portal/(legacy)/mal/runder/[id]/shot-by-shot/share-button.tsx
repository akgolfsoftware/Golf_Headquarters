"use client";

/**
 * Client-wrapper for "Del runde"-knappen i shot-by-shot-headeren.
 *
 * Holder modal-state og åpner DelRundeModal med utgangspunkt i
 * runde-data hentet på server-siden.
 */
import { useState } from "react";
import { Share2 } from "lucide-react";
import { DelRundeModal } from "@/components/shared/del-runde-modal";

type Props = {
  roundId: string;
  spillerNavn: string;
  hcpLabel: string;
  initialer: string;
  bane: string;
  dato: string;
  score: number;
  vsPar: number;
};

export function ShareRoundButton({
  roundId,
  spillerNavn,
  hcpLabel,
  initialer,
  bane,
  dato,
  score,
  vsPar,
}: Props) {
  const [aapen, setAapen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Del"
        onClick={() => setAapen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-accent text-accent-foreground hover:opacity-90"
      >
        <Share2 size={15} strokeWidth={1.75} />
      </button>

      <DelRundeModal
        open={aapen}
        onClose={() => setAapen(false)}
        roundId={roundId}
        spiller={{ name: spillerNavn, hcpLabel, initialer }}
        runde={{
          bane,
          dato,
          score,
          vsPar,
          sgPills: [
            { label: "PUTT", value: 2.1 },
            { label: "IRON", value: 0.8 },
            { label: "CHIP", value: -0.4 },
            { label: "DRIVE", value: 0.3 },
          ],
        }}
      />
    </>
  );
}
