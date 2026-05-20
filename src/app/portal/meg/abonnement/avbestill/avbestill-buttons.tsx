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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => router.push("/portal/meg/abonnement")}
        autoFocus
        className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-foreground shadow-lg outline-2 outline-offset-2 outline-accent/30 transition-transform hover:-translate-y-px"
      >
        <Heart className="h-3.5 w-3.5" strokeWidth={2} />
        Behold Pro
      </button>
      <button
        type="button"
        onClick={avbestill}
        disabled={pending}
        className="rounded-full border-[1.5px] border-destructive/30 bg-card px-5 py-3 text-sm font-semibold text-destructive transition-colors hover:border-destructive hover:bg-destructive/[0.04] disabled:opacity-50"
      >
        {pending ? "Avbestiller …" : "Ja, avbestill"}
      </button>
    </div>
  );
}
