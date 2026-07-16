"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserMinus } from "lucide-react";
import { fjernVennViaBrukerId } from "@/lib/venner/actions";

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
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={fjern}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
      >
        <UserMinus size={16} strokeWidth={1.5} />
        Fjern venn
      </button>
      {feil && <span className="text-xs text-destructive">{feil}</span>}
    </div>
  );
}
