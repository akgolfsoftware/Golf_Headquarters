"use client";

import { useTransition } from "react";

import { toggleAnonymiser } from "./actions";

export function AnonymiserToggle({ initial }: { initial: boolean }) {
  const [pending, start] = useTransition();

  return (
    <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-border bg-card px-4 py-2 text-sm">
      <input
        type="checkbox"
        defaultChecked={initial}
        disabled={pending}
        onChange={(e) => {
          const next = e.currentTarget.checked;
          start(() => {
            void toggleAnonymiser(next);
          });
        }}
        className="h-4 w-4 cursor-pointer accent-primary"
      />
      <span className="font-medium">
        Anonymiser meg{" "}
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          (vis som &quot;Spiller&quot;)
        </span>
      </span>
    </label>
  );
}
