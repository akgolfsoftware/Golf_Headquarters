"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Eye, Briefcase } from "lucide-react";

type Props = {
  current: "coach" | "player";
  className?: string;
};

/**
 * Toggle for ADMIN/COACH til å bytte mellom CoachHQ og PlayerHQ-visning.
 * Krever at brukeren er innlogget med rolle ADMIN eller COACH.
 */
export function ViewModeToggle({ current, className = "" }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function bytt() {
    const ny = current === "coach" ? "player" : "coach";
    startTransition(async () => {
      const res = await fetch("/api/view-mode", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: ny }),
      });
      const data = (await res.json().catch(() => ({}))) as { redirect?: string };
      if (data.redirect) router.push(data.redirect);
      else router.refresh();
    });
  }

  const Icon = current === "coach" ? Eye : Briefcase;
  const label =
    current === "coach" ? "Vis som spiller" : "Tilbake til CoachHQ";

  return (
    <button
      type="button"
      onClick={bytt}
      disabled={pending}
      className={`inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50 ${className}`}
      aria-label={label}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
      <span>{pending ? "Bytter …" : label}</span>
    </button>
  );
}
