"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cancelPro } from "./actions";

export function AvbestillButtons() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function avbestill() {
    if (!confirm("Er du helt sikker på at du vil avbestille Pro?")) return;
    setFeil(null);
    startTransition(async () => {
      // Ved suksess redirecter actionen (resultatet blir da undefined);
      // ved feil kommer { ok: false, error } tilbake og vises under knappene.
      const resultat = await cancelPro();
      if (resultat && !resultat.ok) {
        setFeil(resultat.error ?? "Noe gikk galt. Prøv igjen om litt.");
      }
    });
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <button
        type="button"
        onClick={() => router.push("/portal/meg/abonnement")}
        autoFocus
        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[13.5px] font-semibold text-foreground transition-transform hover:-translate-y-px"
        style={{
          borderColor: "var(--accent)",
          boxShadow: "0 4px 14px color-mix(in srgb, var(--v2-lime) 40%, transparent)",
          outline: "3px solid color-mix(in srgb, var(--v2-lime) 30%, transparent)",
          outlineOffset: "2px",
        }}
      >
        <Heart className="h-3.5 w-3.5" strokeWidth={2} />
        Behold Pro
      </button>
      <button
        type="button"
        onClick={avbestill}
        disabled={pending}
        className="rounded-full border-[1.5px] border-destructive/30 bg-card px-4 py-2 text-[13.5px] font-semibold text-destructive transition-colors hover:border-destructive hover:bg-destructive/[0.04] disabled:opacity-50"
      >
        {pending ? "Avbestiller …" : "Ja, avbestill"}
      </button>
      {feil && (
        <p
          role="alert"
          className="col-span-2 text-center text-[12.5px] font-medium leading-[1.45] text-destructive"
        >
          {feil}
        </p>
      )}
    </div>
  );
}
