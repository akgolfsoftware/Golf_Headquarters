"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { revokeApiKey } from "./actions";

export function RevokeButton({ keyId }: { keyId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handle() {
    if (!confirm("Sikker på at du vil revokere denne nøkkelen?")) return;
    startTransition(async () => {
      await revokeApiKey(keyId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      className="rounded-md border border-destructive/30 bg-destructive/5 min-h-11 px-4 text-sm font-medium text-destructive hover:border-destructive/50 disabled:opacity-60"
    >
      {pending ? "…" : "Revoker"}
    </button>
  );
}
