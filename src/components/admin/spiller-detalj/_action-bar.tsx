"use client";

// ============================================================
// ActionBar — interaktiv Workbench-CTA-bar + ghost-rad på coachens
// spiller-detalj (DetailShell). Erstatter de døde `type="button"`-
// knappene (Notat / Oppgave / Book) fra pixel-porten.
//
//   • Åpne i Workbench / Send melding  → ekte ruter (next/link).
//   • Book                              → /admin/bookinger/ny?spiller=<id>
//                                         (ekte booking-flate).
//   • Notat / Oppgave                   → modal med felt → ærlig
//     bekreftet-state. Ingen ekte coach-notat/oppgave-action finnes
//     ennå, så vi fabrikkerer ikke falsk «lagret på server» — samme
//     mønster som workbench/_coach-actions.tsx.
//
// Knapp-/CTA-utseendet er uendret fra pixel-porten så designet holder.
// Token-only farger, kun lucide-ikoner, norsk bokmål.
// ============================================================

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarPlus,
  CheckCircle2,
  CheckSquare,
  PencilLine,
  Send,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

/** Hvilken modal som er åpen. */
type ModalKind = "note" | "task" | null;

export function ActionBar({ id, playerName }: { id: string; playerName: string }) {
  const [modal, setModal] = useState<ModalKind>(null);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/admin/spillere/${id}/workbench`}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-accent transition-colors hover:bg-[var(--color-brand-primary-hover)]"
        >
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Åpne i Workbench
        </Link>
        <Link
          href={`/admin/innboks?spiller=${id}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-secondary"
        >
          <Send className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Send melding
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => setModal("note")}
          className="inline-flex h-7 items-center gap-1.5 rounded-full px-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <PencilLine className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
          Notat
        </button>
        <button
          type="button"
          onClick={() => setModal("task")}
          className="inline-flex h-7 items-center gap-1.5 rounded-full px-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <CheckSquare className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
          Oppgave
        </button>
        <Link
          href={`/admin/bookinger/ny?spiller=${id}`}
          className="inline-flex h-7 items-center gap-1.5 rounded-full px-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <CalendarPlus className="h-[11px] w-[11px]" strokeWidth={2} aria-hidden />
          Book
        </Link>
        <span className="flex-1" />
        <Link
          href={`/admin/spillere/${id}`}
          className="font-mono text-[10px] font-extrabold uppercase tracking-[0.06em] text-primary underline underline-offset-[3px] hover:no-underline"
        >
          Komplett profil
        </Link>
      </div>

      {/* Felt-modaler: notat / oppgave → ærlig bekreftet-state */}
      <InputActionModal
        open={modal === "note"}
        onClose={() => setModal(null)}
        title="Nytt notat"
        description={playerName}
        fieldLabel="Notat"
        placeholder={`Skriv et kort notat om ${playerName} …`}
        submitLabel="Lagre notat"
      />
      <InputActionModal
        open={modal === "task"}
        onClose={() => setModal(null)}
        title={`Ny oppgave til ${playerName}`}
        description={playerName}
        fieldLabel="Oppgave"
        placeholder={`Hva skal ${playerName} gjøre …`}
        submitLabel="Opprett oppgave"
      />
    </section>
  );
}

// ── Felt-modal: ett tekstfelt + lagre → bekreftet-state ────────
function InputActionModal({
  open,
  onClose,
  title,
  description,
  fieldLabel,
  placeholder,
  submitLabel,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  fieldLabel: string;
  placeholder: string;
  submitLabel: string;
}) {
  const [value, setValue] = useState("");
  const [done, setDone] = useState(false);

  function close() {
    setValue("");
    setDone(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? undefined : close())}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          {done ? (
            <ConfirmedNote />
          ) : (
            <label className="block space-y-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {fieldLabel}
              </span>
              <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                rows={4}
                autoFocus
              />
            </label>
          )}
        </DialogBody>
        <DialogFooter>
          {done ? (
            <Button onClick={close}>Lukk</Button>
          ) : (
            <>
              <Button variant="ghost-light" onClick={close}>
                Avbryt
              </Button>
              <Button onClick={() => setDone(true)} disabled={value.trim().length === 0}>
                {submitLabel}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Ærlig bekreftelse — ingen falsk «lagret på server»-påstand.
function ConfirmedNote() {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/50 p-4">
      <span className="mt-0.5 text-success">
        <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
      </span>
      <p className="text-sm leading-relaxed text-foreground">
        Registrert. Lagring kobles til når notat- og oppgave-dataen er på plass.
      </p>
    </div>
  );
}
