"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";

export function MarkAllReadButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-md border border-input bg-card min-h-11 px-4 text-sm font-medium text-foreground hover:border-primary hover:text-primary disabled:opacity-50"
    >
      <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
      {pending ? "Markerer …" : "Marker alle lest"}
    </button>
  );
}
