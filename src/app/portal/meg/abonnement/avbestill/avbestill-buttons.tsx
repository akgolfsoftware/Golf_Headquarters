"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cancelPro } from "./actions";

export function AvbestillButtons() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function avbestill() {
    if (!confirm("Er du helt sikker på at du vil avbestille Pro?")) return;
    startTransition(async () => {
      await cancelPro();
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
          boxShadow: "0 4px 14px rgba(209,248,67,0.40)",
          outline: "3px solid rgba(209,248,67,0.30)",
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
    </div>
  );
}
