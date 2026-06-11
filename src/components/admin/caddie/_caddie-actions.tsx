"use client";

// ============================================================
// Caddie-interaktivitet (client-leafs for den server-rendrede Caddie).
// Disse rendrer KUN når draft/fleet/audit har data (tom-tilstand skjuler
// dem), så de er lav-prioritet — men de skal ikke være døde.
//
// Ærlig mønster (jf. workbench/_coach-actions): co-agent-logikken er ikke
// koblet på ennå, så vi fabrikkerer ikke «sendt/lagret på server»:
//   • DraftActions   — Godkjenn / Rediger / Avvis → bekreftet-state i modal.
//   • FleetToggle    — av/på med LOKAL state (optimistisk).
//   • AuditOpenButton — «åpne» → modal som ærlig sier full hendelse kobles på.
//
// Token-only farger, lucide-ikoner, norsk bokmål.
// ============================================================

import { useState } from "react";
import { Check, CheckCircle2, ExternalLink, Pencil, X } from "lucide-react";
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
import { cn } from "@/lib/utils";

type DraftModal = "approve" | "edit" | "reject" | null;

// ── SECTION 1 — Utkast-handlinger (Godkjenn / Rediger / Avvis) ──
export function DraftActions() {
  const [modal, setModal] = useState<DraftModal>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setModal("approve")}
        className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold tracking-[-0.005em] text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> Godkjenn og send
      </button>
      <button
        type="button"
        onClick={() => setModal("edit")}
        className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm font-bold tracking-[-0.005em] text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> Rediger først
      </button>
      <button
        type="button"
        onClick={() => setModal("reject")}
        className="flex h-11 items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-card text-sm font-bold tracking-[-0.005em] text-destructive transition-colors hover:bg-destructive/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden /> Avvis
      </button>

      <ConfirmModal
        open={modal === "approve"}
        onClose={() => setModal(null)}
        title="Godkjenn og send"
        body="Godkjenn utkastet og send det til spilleren?"
        confirmLabel="Godkjenn og send"
      />
      <ConfirmModal
        open={modal === "edit"}
        onClose={() => setModal(null)}
        title="Rediger først"
        body="Inline-redigering av utkastet kobles på når co-agent-logikken er live. Du kan markere at det skal redigeres nå."
        confirmLabel="Marker til redigering"
      />
      <ConfirmModal
        open={modal === "reject"}
        onClose={() => setModal(null)}
        title="Avvis utkast"
        body="Avvis utkastet? Avviste utkast brukes som treningsdata for å forbedre agenten."
        confirmLabel="Avvis"
        confirmClassName="bg-destructive text-card hover:bg-destructive/90"
      />
    </>
  );
}

// ── SECTION 2 — Fleet av/på (lokal toggle) ──────────────────────
export function FleetToggle({
  initialOn,
  agentName,
}: {
  initialOn: boolean;
  agentName: string;
}) {
  const [on, setOn] = useState(initialOn);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`${on ? "Skru av" : "Skru på"} ${agentName}`}
      onClick={() => setOn((v) => !v)}
      className={cn(
        "relative inline-block h-5 w-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        on ? "bg-primary" : "bg-input",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full transition-[left]",
          on ? "left-[18px] bg-accent" : "left-0.5 bg-card",
        )}
      />
    </button>
  );
}

// ── SECTION 3 — Audit «åpne» (modal-stub) ───────────────────────
export function AuditOpenButton({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Åpne hendelse: ${label}`}
        className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Hendelse</DialogTitle>
            <DialogDescription>{label}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm leading-relaxed text-foreground">
              Full hendelse (input, output, kildebruk og diff) vises her når
              audit-loggen er koblet på.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Lukk</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Felles bekreft-modal → bekreftet-state (ingen falsk «sendt») ─
function ConfirmModal({
  open,
  onClose,
  title,
  body,
  confirmLabel,
  confirmClassName,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  confirmLabel: string;
  confirmClassName?: string;
}) {
  const [done, setDone] = useState(false);

  function close() {
    setDone(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? undefined : close())}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {done ? (
            <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/50 p-4">
              <span className="mt-0.5 text-[var(--success)]">
                <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              </span>
              <p className="text-sm leading-relaxed text-foreground">
                Registrert. Co-agent-handlingen kobles til når logikken er live.
              </p>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-foreground">{body}</p>
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
              <Button
                variant="primary"
                className={confirmClassName}
                onClick={() => setDone(true)}
              >
                {confirmLabel}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
