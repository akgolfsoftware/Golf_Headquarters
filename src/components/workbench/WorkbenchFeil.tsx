"use client";

/**
 * Feil-tilstand for Workbench-uka: kort norsk forklaring + «Prøv igjen».
 * Aldri stack trace, aldri engelsk (CLAUDE.md §Feilhåndtering punkt 1).
 */

import { useRouter } from "next/navigation";
import { Knapp } from "@/components/v2/core";
import { Icon } from "@/components/v2/icon";
import { TL } from "@/lib/v2/train-lock";

import { UI } from "@/lib/domain/workbench/labels";

export function WorkbenchFeil({ melding }: { melding: string }) {
  const router = useRouter();
  return (
    <div
      role="alert"
      style={{
        display: "grid",
        gap: 12,
        justifyItems: "center",
        textAlign: "center",
        padding: "48px 20px",
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        background: TL.elev,
      }}
    >
      <Icon name="triangle-alert" size={22} style={{ color: TL.danger }} />
      <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
        {UI.weekFetchErrorTitle}
      </div>
      <div style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, maxWidth: 380 }}>{melding}</div>
      <Knapp onClick={() => router.refresh()}>{UI.retry}</Knapp>
    </div>
  );
}
