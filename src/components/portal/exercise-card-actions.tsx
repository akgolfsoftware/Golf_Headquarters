"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { slettOvelse } from "@/app/portal/coach/ovelser/actions";

export function ExerciseCardActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleSlett(ev: React.MouseEvent<HTMLButtonElement>) {
    ev.stopPropagation();
    ev.preventDefault();
    if (!confirm("Er du sikker på at du vil slette denne øvelsen?")) return;
    startTransition(async () => {
      await slettOvelse(id);
    });
  }

  return (
    <div className="flex gap-1">
      <Link
        href={`/portal/coach/ovelser/${id}/rediger`}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
        onClick={(ev) => ev.stopPropagation()}
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
      </Link>
      <button
        type="button"
        disabled={isPending}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
        onClick={handleSlett}
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
