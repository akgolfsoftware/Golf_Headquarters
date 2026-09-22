"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CTAPill } from "@/components/v2/core";
import { ValideringsChip } from "@/components/v2/struktur";
import { angreKobling } from "./actions";

export function AngreKnapp() {
  const router = useRouter();
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, startTransition] = useTransition();
  return (
    <div>
      <CTAPill
        ghost
        onClick={() =>
          startTransition(async () => {
            const svar = await angreKobling();
            if (!svar.ok) return setFeil(svar.feil);
            router.refresh();
          })
        }
      >
        {venter ? "Fjerner …" : "Fjern koblingen"}
      </CTAPill>
      {feil && <div role="alert" style={{ marginTop: 8 }}><ValideringsChip tone="advarsel" tekst={feil} /></div>}
    </div>
  );
}
