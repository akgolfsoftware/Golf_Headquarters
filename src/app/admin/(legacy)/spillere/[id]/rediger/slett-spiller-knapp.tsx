"use client";

// Slett spiller-knapp + bekreftelses-dialog (client-leaf).
// Soft-delete via server-action slettSpiller — KUN admin. Etter vellykket
// sletting redirectes det til stallen. Følger Dialog-idiomet i caddie/_caddie-actions.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { slettSpiller } from "./actions";

export function SlettSpillerKnapp({
  spillerId,
  spillerNavn,
}: {
  spillerId: string;
  spillerNavn: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function bekreftSlett() {
    setError(null);
    startTransition(async () => {
      const res = await slettSpiller(spillerId);
      if (res.ok) {
        router.push("/admin/spillere");
      } else {
        setError(res.error ?? "Sletting feilet. Prøv igjen.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-transparent px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
      >
        <Trash2 size={14} strokeWidth={1.75} />
        Slett spiller
      </button>

      <Dialog open={open} onOpenChange={(o) => (pending ? undefined : setOpen(o))}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Slett spiller</DialogTitle>
            <DialogDescription>{spillerNavn}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm leading-relaxed text-foreground">
              Spilleren fjernes fra stallen og mister tilgang. Dataene beholdes
              og kan gjenopprettes via support. Vil du fortsette?
            </p>
            {error && (
              <p className="mt-3 text-sm text-destructive">{error}</p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              variant="ghost-light"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Avbryt
            </Button>
            <Button
              variant="primary"
              className="bg-destructive text-card hover:bg-destructive/90"
              onClick={bekreftSlett}
              disabled={pending}
            >
              {pending ? "Sletter…" : "Slett spiller"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
