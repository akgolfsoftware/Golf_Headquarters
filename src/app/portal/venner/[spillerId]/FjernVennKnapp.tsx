"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { fjernVennViaBrukerId } from "@/lib/venner/actions";
import { T } from "@/lib/v2/tokens";
import { Knapp } from "@/components/v2";

export function FjernVennKnapp({ vennUserId }: { vennUserId: string }) {
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const router = useRouter();

  function fjern() {
    setFeil(null);
    startTransition(async () => {
      const res = await fjernVennViaBrukerId(vennUserId);
      if (!res.ok) {
        setFeil("Kunne ikke fjerne venn. Prøv igjen.");
        return;
      }
      router.push("/portal/venner");
      router.refresh();
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <Knapp ghost icon="users" onClick={fjern} disabled={pending}>
        {pending ? "Fjerner…" : "Fjern venn"}
      </Knapp>
      {feil && (
        <span style={{ fontFamily: T.ui, fontSize: 11, color: T.down }}>{feil}</span>
      )}
    </div>
  );
}
