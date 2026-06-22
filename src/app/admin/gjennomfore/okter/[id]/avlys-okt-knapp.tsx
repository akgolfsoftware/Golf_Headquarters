"use client";

// Avlys-knapp + bekreftelses-dialog (client-leaf) for økt-detalj.
// Kaller server-action kansellerBooking (Booking → CANCELLED, varsler spiller).
// Følger samme Dialog-idiom som spillere/[id]/rediger/slett-spiller-knapp.tsx.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
import { AthleticButton } from "@/components/athletic";
import { kansellerBooking } from "./actions";

export function AvlysOktKnapp({
  bookingId,
  spillerNavn,
  triggerClassName,
  triggerSize = "sm",
  fullWidth = false,
}: {
  bookingId: string;
  spillerNavn: string;
  triggerClassName?: string;
  triggerSize?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function bekreftAvlys() {
    setError(null);
    startTransition(async () => {
      const res = await kansellerBooking(bookingId);
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error ?? "Avlysning feilet. Prøv igjen.");
      }
    });
  }

  return (
    <>
      <AthleticButton
        variant="ghost-light"
        size={triggerSize}
        className={`text-destructive ${fullWidth ? "w-full" : ""} ${triggerClassName ?? ""}`}
        onClick={() => setOpen(true)}
      >
        Avlys
      </AthleticButton>

      <Dialog open={open} onOpenChange={(o) => (pending ? undefined : setOpen(o))}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Avlys økt</DialogTitle>
            <DialogDescription>{spillerNavn}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm leading-relaxed text-foreground">
              Økten avlyses og spilleren får et varsel. Dette kan ikke angres
              herfra — ny økt må bookes på nytt. Vil du fortsette?
            </p>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
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
              onClick={bekreftAvlys}
              disabled={pending}
            >
              {pending ? "Avlyser…" : "Avlys økt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
