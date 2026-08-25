"use client";

/**
 * Feil-tilstand for Workbench-uka: kort norsk forklaring + «Prøv igjen».
 * Aldri stack trace, aldri engelsk (CLAUDE.md §Feilhåndtering punkt 1).
 */

import { useRouter } from "next/navigation";
import { Knapp } from "@/components/v2/core";
import { Icon } from "@/components/v2/icon";
import { T } from "@/lib/v2/tokens";

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
        border: `1px solid ${T.border}`,
        borderRadius: T.rCard,
        background: T.panel,
      }}
    >
      <Icon name="triangle-alert" size={22} style={{ color: T.down }} />
      <div style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
        Kunne ikke hente uka
      </div>
      <div style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, maxWidth: 380 }}>{melding}</div>
      <Knapp onClick={() => router.refresh()}>Prøv igjen</Knapp>
    </div>
  );
}
