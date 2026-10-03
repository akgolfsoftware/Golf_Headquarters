"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserMinus } from "lucide-react";
import { fjernVennViaBrukerId } from "@/lib/venner/actions";
import { Knapp } from "@/components/precision/pa";

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
    <div>
      <Knapp
        type="button"
        variant="ghost"
        icon={UserMinus}
        onClick={fjern}
        loading={pending}
        loadingText="Fjerner…"
        disabled={pending}
      >
        Fjern venn
      </Knapp>
      {feil ? <p role="alert">{feil}</p> : null}
    </div>
  );
}
